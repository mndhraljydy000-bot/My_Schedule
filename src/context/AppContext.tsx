import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type {
  Page, TestType, Source, SourceInput, Schedule, ScheduleDay, ScheduleTask, ReviewMode,
} from '../data/sources';
import { todayISO, addDaysISO, getDayOfWeek, daysBetween } from '../utils/scheduler';

export type { Page };

interface ScheduleConfig {
  startDate: string;
  endDate: string;
  offDays: number[];
}

interface ReviewConfig {
  enabled: boolean;
  mode: ReviewMode;
  weeklyDays: number[];
  intervalDays: number;
  phaseReviewDays: number;
}

interface AppContextValue {
  page: Page;
  setPage: (p: Page) => void;

  selectedSources: Source[];
  toggleSource: (id: string, name: string, testType: TestType, groupId: string) => void;
  removeSource: (id: string) => void;
  isSourceSelected: (id: string) => boolean;

  inputs: Record<string, SourceInput>;
  setInput: (id: string, input: Partial<SourceInput>) => void;

  scheduleConfig: ScheduleConfig;
  setScheduleConfig: (c: Partial<ScheduleConfig>) => void;

  reviewConfig: ReviewConfig;
  setReviewConfig: (r: Partial<ReviewConfig>) => void;

  schedule: Schedule | null;
  generateSchedule: (testType: TestType) => void;
  scheduleConfirmed: boolean;
  confirmSchedule: () => void;
  clearSchedule: () => void;

  toggleTaskDone: (dayIndex: number, taskId: string) => void;
  confirmDay: (dayIndex: number) => void;

  streak: number;
  progress: number;
  completedDays: number;
  totalTasks: number;
  completedTasks: number;

  showDeleteWarning: boolean;
  setShowDeleteWarning: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'study-planner-state-v3';

function loadState(): Partial<AppContextValue> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const saved = useMemo(loadState, []);

  const [page, setPage] = useState<Page>(saved.page ?? 'home');
  const [selectedSources, setSelectedSources] = useState<Source[]>(saved.selectedSources ?? []);
  const [inputs, setInputs] = useState<Record<string, SourceInput>>(saved.inputs ?? {});
  const [schedule, setSchedule] = useState<Schedule | null>(saved.schedule ?? null);
  const [scheduleConfirmed, setScheduleConfirmed] = useState<boolean>(saved.scheduleConfirmed ?? false);
  const [streak, setStreak] = useState<number>(saved.streak ?? 0);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  const [scheduleConfig, setScheduleConfigState] = useState<ScheduleConfig>(saved.scheduleConfig ?? {
    startDate: todayISO(),
    endDate: addDaysISO(todayISO(), 30),
    offDays: [5],
  });

  const [reviewConfig, setReviewConfigState] = useState<ReviewConfig>(saved.reviewConfig ?? {
    enabled: true,
    mode: 'phase-end',
    weeklyDays: [4],
    intervalDays: 6,
    phaseReviewDays: 2,
  });

  useEffect(() => {
    const data = { page, selectedSources, inputs, schedule, scheduleConfirmed, streak, scheduleConfig, reviewConfig };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* noop */ }
  }, [page, selectedSources, inputs, schedule, scheduleConfirmed, streak, scheduleConfig, reviewConfig]);

  useEffect(() => {
    if (!scheduleConfirmed || !schedule) return;
    const today = todayISO();
    const allDoneToday = schedule.days.find((d) => d.date === today)?.done;
    if (allDoneToday) {
      const lastSeen = localStorage.getItem('study-planner-last-streak-day');
      if (lastSeen !== today) {
        setStreak((s) => s + 1);
        localStorage.setItem('study-planner-last-streak-day', today);
      }
    }
  }, [scheduleConfirmed, schedule]);

  const toggleSource = (id: string, name: string, testType: TestType, groupId: string) => {
    setSelectedSources((prev) => {
      const existing = prev.find((s) => s.id === id);
      if (existing) {
        const filtered = prev.filter((s) => s.id !== id);
        setInputs((inp) => { const n = { ...inp }; delete n[id]; return n; });
        return filtered;
      }
      const withoutGroup = prev.filter((s) => s.groupId !== groupId || s.testType !== testType);
      const removedIds = prev.filter((s) => s.groupId === groupId && s.testType === testType).map((s) => s.id);
      if (removedIds.length > 0) {
        setInputs((inp) => {
          const n = { ...inp };
          for (const rid of removedIds) delete n[rid];
          return n;
        });
      }
      return [...withoutGroup, { id, name, testType, description: '', groupId }];
    });
  };

  const removeSource = (id: string) => {
    setSelectedSources((prev) => prev.filter((s) => s.id !== id));
    setInputs((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  const isSourceSelected = (id: string) => selectedSources.some((s) => s.id === id);

  const setInput = (id: string, input: Partial<SourceInput>) => {
    setInputs((prev) => ({ ...prev, [id]: { ...(prev[id] ?? { videos: 0, tests: 0 }), ...input } }));
  };

  const setScheduleConfig = (c: Partial<ScheduleConfig>) => setScheduleConfigState((p) => ({ ...p, ...c }));
  const setReviewConfig = (r: Partial<ReviewConfig>) => setReviewConfigState((p) => ({ ...p, ...r }));

  const generateSchedule = (testType: TestType) => {
    const tSources = selectedSources.filter((s) => s.testType === testType);
    if (tSources.length === 0) {
      setSchedule({ testType, startDate: scheduleConfig.startDate, endDate: scheduleConfig.endDate, days: [], totalVideos: 0, totalTests: 0, error: 'لم تختر أي مصادر بعد' });
      return;
    }

    for (const s of tSources) {
      const inp = inputs[s.id];
      if (!inp || (inp.videos <= 0 && inp.tests <= 0)) {
        setSchedule({ testType, startDate: scheduleConfig.startDate, endDate: scheduleConfig.endDate, days: [], totalVideos: 0, totalTests: 0, error: `أدخل عدداً للفيديوهات أو الاختبارات لـ "${s.name}"` });
        return;
      }
    }

    const { startDate, endDate, offDays } = scheduleConfig;
    if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
      setSchedule({ testType, startDate, endDate, days: [], totalVideos: 0, totalTests: 0, error: 'تحقق من تواريخ البداية والنهاية' });
      return;
    }

    const taskPools: { sourceId: string; sourceName: string; tasks: { type: 'video' | 'test'; label: string }[] }[] = [];
    let totalVideos = 0;
    let totalTests = 0;
    for (const s of tSources) {
      const inp = inputs[s.id];
      const tasks: { type: 'video' | 'test'; label: string }[] = [];
      for (let i = 1; i <= inp.videos; i++) { tasks.push({ type: 'video', label: `${s.name} - فيديو ${i}` }); totalVideos++; }
      for (let i = 1; i <= inp.tests; i++) { tasks.push({ type: 'test', label: `${s.name} - اختبار ${i}` }); totalTests++; }
      taskPools.push({ sourceId: s.id, sourceName: s.name, tasks });
    }

    const maxDays = Math.max(1, daysBetween(startDate, endDate) + 1);
    const isOffDay = (iso: string) => offDays.includes(getDayOfWeek(iso));

    const studyDates: string[] = [];
    for (let i = 0; i < maxDays; i++) {
      const iso = addDaysISO(startDate, i);
      if (!isOffDay(iso)) studyDates.push(iso);
    }

    if (studyDates.length === 0) {
      setSchedule({ testType, startDate, endDate, days: [], totalVideos, totalTests, error: 'لا توجد أيام دراسة متاحة (كلها إجازة؟)' });
      return;
    }

    const flatTasks: { sourceId: string; type: 'video' | 'test'; label: string }[] = [];
    for (const pool of taskPools) for (const t of pool.tasks) flatTasks.push({ sourceId: pool.sourceId, type: t.type, label: t.label });

    const tasksPerDay = Math.max(1, Math.ceil(flatTasks.length / studyDates.length));

    const days: ScheduleDay[] = [];
    let taskIdx = 0;
    let studyDaysSinceReview = 0;
    let currentSourceId = flatTasks[0]?.sourceId;
    let phase = tSources[0]?.name;

    for (let d = 0; d < studyDates.length; d++) {
      const date = studyDates[d];

      let isReview = false;
      if (reviewConfig.enabled) {
        if (reviewConfig.mode === 'weekly-days' && reviewConfig.weeklyDays.includes(getDayOfWeek(date))) isReview = true;
        else if (reviewConfig.mode === 'interval-days' && studyDaysSinceReview >= reviewConfig.intervalDays) isReview = true;
        else if (reviewConfig.mode === 'phase-end' && flatTasks[taskIdx]?.sourceId !== currentSourceId && currentSourceId) {
          for (let r = 0; r < reviewConfig.phaseReviewDays && d < studyDates.length; r++) {
            days.push({ dayIndex: days.length, date: studyDates[d], tasks: [{ id: `rev-${days.length}`, type: 'review', label: `مراجعة مرحلية - ${currentSourceId}`, sourceId: currentSourceId, done: false }], phase: 'مراجعة', isReviewDay: true, done: false });
            d++;
          }
          if (d < studyDates.length) currentSourceId = flatTasks[taskIdx]?.sourceId;
          studyDaysSinceReview = 0;
        }
      }

      const dayTasks: ScheduleTask[] = [];
      if (!isReview) {
        for (let t = 0; t < tasksPerDay && taskIdx < flatTasks.length; t++) {
          const ft = flatTasks[taskIdx];
          if (ft.sourceId !== currentSourceId) {
            currentSourceId = ft.sourceId;
            phase = tSources.find((s) => s.id === ft.sourceId)?.name ?? phase;
          }
          dayTasks.push({ id: `${d}-${t}`, type: ft.type, label: ft.label, sourceId: ft.sourceId, done: false });
          taskIdx++;
        }
        studyDaysSinceReview++;
      } else {
        dayTasks.push({ id: `rev-${d}`, type: 'review', label: 'يوم مراجعة - راجع ما سبق', sourceId: currentSourceId || '', done: false });
        studyDaysSinceReview = 0;
      }

      days.push({ dayIndex: days.length, date, tasks: dayTasks, phase, isReviewDay: isReview, done: false });

      if (taskIdx >= flatTasks.length && !reviewConfig.enabled) break;
    }

    const endDateActual = days.length > 0 ? days[days.length - 1].date : endDate;
    setSchedule({ testType, startDate, endDate: endDateActual, days, totalVideos, totalTests });
    setScheduleConfirmed(false);
  };

  const confirmSchedule = () => setScheduleConfirmed(true);

  const clearSchedule = () => {
    setSchedule(null);
    setScheduleConfirmed(false);
    setStreak(0);
    setInputs({});
    setSelectedSources([]);
    try { localStorage.removeItem('study-planner-last-streak-day'); } catch { /* noop */ }
  };

  const toggleTaskDone = (dayIndex: number, taskId: string) => {
    setSchedule((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((d) => d.dayIndex === dayIndex
          ? { ...d, tasks: d.tasks.map((t) => t.id === taskId ? { ...t, done: !t.done } : t) }
          : d),
      };
    });
  };

  const confirmDay = (dayIndex: number) => {
    setSchedule((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((d) => d.dayIndex === dayIndex ? { ...d, done: true } : d),
      };
    });
    const today = todayISO();
    const lastSeen = localStorage.getItem('study-planner-last-streak-day');
    if (lastSeen !== today) {
      setStreak((s) => s + 1);
      localStorage.setItem('study-planner-last-streak-day', today);
    }
  };

  const totalTasks = useMemo(() => schedule?.days.reduce((a, d) => a + d.tasks.length, 0) ?? 0, [schedule]);
  const completedTasks = useMemo(() => schedule?.days.reduce((a, d) => a + d.tasks.filter((t) => t.done).length, 0) ?? 0, [schedule]);
  const completedDays = useMemo(() => schedule?.days.filter((d) => d.done).length ?? 0, [schedule]);
  const progress = useMemo(() => {
    if (!schedule || schedule.days.length === 0) return 0;
    return Math.round((completedDays / schedule.days.length) * 100);
  }, [schedule, completedDays]);

  const value: AppContextValue = {
    page, setPage,
    selectedSources, toggleSource, removeSource, isSourceSelected,
    inputs, setInput,
    scheduleConfig, setScheduleConfig,
    reviewConfig, setReviewConfig,
    schedule, generateSchedule, scheduleConfirmed, confirmSchedule, clearSchedule,
    toggleTaskDone, confirmDay,
    streak, progress, completedDays, totalTasks, completedTasks,
    showDeleteWarning, setShowDeleteWarning,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
