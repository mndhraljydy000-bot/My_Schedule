import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import type {
  Page, TestType, Source, SourceInput, Schedule, ScheduleDay, ScheduleTask, ReviewMode,
} from '../data/sources';
import { TAHSILI_SUBJECTS } from '../data/sources';
import type { TahsiliSubject } from '../data/sources';
import { todayISO, addDaysISO, getDayOfWeek, daysBetween } from '../utils/scheduler';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

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
  intervalDays: number | null;
  phaseReviewDays: number | null;
}

interface AppContextValue {
  page: Page;
  setPage: (p: Page) => void;

  selectedSources: Source[];
  toggleSource: (id: string, name: string, testType: TestType, groupId: string) => void;
  addSource: (id: string, name: string, testType: TestType, groupId: string) => void;
  removeSource: (id: string) => void;
  isSourceSelected: (id: string) => boolean;

  inputs: Record<string, SourceInput>;
  setInput: (id: string, input: Partial<SourceInput>) => void;

  scheduleConfig: ScheduleConfig;
  setScheduleConfig: (c: Partial<ScheduleConfig>) => void;

  reviewConfig: ReviewConfig;
  setReviewConfig: (r: Partial<ReviewConfig>) => void;

  tahsiliSubjectOrder: string[];
  setTahsiliSubjectOrder: (order: string[]) => void;

  schedule: Schedule | null;
  generateSchedule: (testType: TestType) => { success: boolean; error?: string };
  requestGenerate: (testType: TestType) => void;
  handleTelegramVerified: () => void;
  scheduleConfirmed: boolean;
  confirmSchedule: () => void;
  clearSchedule: () => void;

  toggleTaskDone: (dayIndex: number, taskId: string) => void;
  confirmDay: (dayIndex: number) => void;
  postponeTasks: (days: number) => void;

  streak: number;
  progress: number;
  completedDays: number;
  totalTasks: number;
  completedTasks: number;

  showDeleteWarning: boolean;
  setShowDeleteWarning: (v: boolean) => void;

  cloudSyncing: boolean;

  telegramVerified: boolean;
  telegramGateOpen: boolean;
  telegramGateMode: 'generate' | 'rejoin';
  setTelegramGate: (open: boolean, mode?: 'generate' | 'rejoin') => void;
  setTelegramVerified: (v: boolean) => void;
  pendingGenerate: TestType | null;
  setPendingGenerate: (t: TestType | null) => void;

  notes: string;
  setNotes: (n: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'study-planner-state-v3';

export const MAX_PER_SOURCE = 150;

type PersistedState = {
  page?: Page;
  selectedSources?: Source[];
  inputs?: Record<string, SourceInput>;
  schedule?: Schedule | null;
  scheduleConfirmed?: boolean;
  streak?: number;
  scheduleConfig?: ScheduleConfig;
  reviewConfig?: ReviewConfig;
  tahsiliSubjectOrder?: string[];
  notes?: string;
};

function loadLocalState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
  startDate: todayISO(),
  endDate: addDaysISO(todayISO(), 30),
  offDays: [5],
};

const DEFAULT_REVIEW_CONFIG: ReviewConfig = {
  enabled: false,
  mode: 'phase-end',
  weeklyDays: [],
  intervalDays: null,
  phaseReviewDays: null,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const saved = useMemo(loadLocalState, []);

  const [page, setPage] = useState<Page>(saved.page ?? 'home');
  const [selectedSources, setSelectedSources] = useState<Source[]>(saved.selectedSources ?? []);
  const [inputs, setInputs] = useState<Record<string, SourceInput>>(saved.inputs ?? {});
  const [schedule, setSchedule] = useState<Schedule | null>(saved.schedule ?? null);
  const [scheduleConfirmed, setScheduleConfirmed] = useState<boolean>(saved.scheduleConfirmed ?? false);
  const [streak, setStreak] = useState<number>(saved.streak ?? 0);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [telegramVerified, setTelegramVerified] = useState<boolean>(() => localStorage.getItem('tg_verified') === 'true');
  const [telegramGateOpen, setTelegramGateOpen] = useState(false);
  const [telegramGateMode, setTelegramGateMode] = useState<'generate' | 'rejoin'>('generate');
  const [pendingGenerate, setPendingGenerate] = useState<TestType | null>(null);
  const [notes, setNotes] = useState<string>(saved.notes ?? '');

  const setTelegramGate = (open: boolean, mode: 'generate' | 'rejoin' = 'generate') => {
    setTelegramGateOpen(open);
    setTelegramGateMode(mode);
  };

  const [scheduleConfig, setScheduleConfigState] = useState<ScheduleConfig>(
    saved.scheduleConfig ?? DEFAULT_SCHEDULE_CONFIG
  );

  const [reviewConfig, setReviewConfigState] = useState<ReviewConfig>(
    saved.reviewConfig ?? DEFAULT_REVIEW_CONFIG
  );
  const [tahsiliSubjectOrder, setTahsiliSubjectOrderState] = useState<string[]>(
    saved.tahsiliSubjectOrder ?? []
  );

  // On login: load cloud state and replace local
  useEffect(() => {
    if (!user) return;
    (async () => {
      setCloudSyncing(true);
      const { data, error } = await supabase
        .from('user_schedules')
        .select('schedule_data')
        .maybeSingle();
      setCloudSyncing(false);
      if (error || !data) return;
      const s = data.schedule_data as PersistedState;
      if (s.selectedSources !== undefined) setSelectedSources(s.selectedSources);
      if (s.inputs !== undefined) setInputs(s.inputs);
      if (s.schedule !== undefined) setSchedule(s.schedule);
      if (s.scheduleConfirmed !== undefined) setScheduleConfirmed(s.scheduleConfirmed);
      if (s.streak !== undefined) setStreak(s.streak);
      if (s.scheduleConfig !== undefined) setScheduleConfigState(s.scheduleConfig);
      if (s.reviewConfig !== undefined) setReviewConfigState(s.reviewConfig);
      if (s.tahsiliSubjectOrder !== undefined) setTahsiliSubjectOrderState(s.tahsiliSubjectOrder);
      if (s.notes !== undefined) setNotes(s.notes);
    })();
  }, [user]);

  const getStateSnapshot = useCallback((): PersistedState => ({
    page, selectedSources, inputs, schedule, scheduleConfirmed, streak,
    scheduleConfig, reviewConfig, tahsiliSubjectOrder, notes,
  }), [page, selectedSources, inputs, schedule, scheduleConfirmed, streak, scheduleConfig, reviewConfig, tahsiliSubjectOrder, notes]);

  // Sync to localStorage always
  useEffect(() => {
    const data = getStateSnapshot();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* noop */ }
  }, [getStateSnapshot]);

  // Sync to Supabase when user is signed in (debounced)
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(async () => {
      const data = getStateSnapshot();
      await supabase.from('user_schedules').upsert(
        { user_id: user.id, schedule_data: data, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    }, 1500);
    return () => clearTimeout(timer);
  }, [user, getStateSnapshot]);

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

  const addSource = (id: string, name: string, testType: TestType, groupId: string) => {
    setSelectedSources((prev) => {
      if (prev.find((s) => s.id === id)) return prev;
      return [...prev, { id, name, testType, description: '', groupId }];
    });
  };

  const removeSource = (id: string) => {
    setSelectedSources((prev) => prev.filter((s) => s.id !== id));
    setInputs((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  const isSourceSelected = (id: string) => selectedSources.some((s) => s.id === id);

  const setInput = (id: string, input: Partial<SourceInput>) => {
    setInputs((prev) => {
      const base = prev[id] ?? { videos: 0, tests: 0 };
      const merged = { ...base, ...input };
      if (merged.videos > MAX_PER_SOURCE) merged.videos = MAX_PER_SOURCE;
      if (merged.tests > MAX_PER_SOURCE) merged.tests = MAX_PER_SOURCE;
      return { ...prev, [id]: merged };
    });
  };

  const setScheduleConfig = (c: Partial<ScheduleConfig>) => setScheduleConfigState((p) => ({ ...p, ...c }));
  const setReviewConfig = (r: Partial<ReviewConfig>) => setReviewConfigState((p) => {
    const merged = { ...p, ...r };
    if (merged.phaseReviewDays !== null && merged.phaseReviewDays > 10) merged.phaseReviewDays = 10;
    if (merged.intervalDays !== null && merged.intervalDays > 15) merged.intervalDays = 15;
    return merged;
  });
  const setTahsiliSubjectOrder = (order: string[]) => setTahsiliSubjectOrderState(order);

  const handleTelegramVerified = () => {
    setTelegramVerified(true);
    setTelegramGateOpen(false);
    try { localStorage.setItem('tg_verified', 'true'); } catch { /* noop */ }
    if (pendingGenerate) {
      const result = generateSchedule(pendingGenerate);
      setPendingGenerate(null);
      if (result.success) {
        setPage('schedule');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (result.error) {
        setGenerateError(result.error);
      }
    }
  };

  const requestGenerate = (testType: TestType) => {
    if (telegramVerified) {
      const result = generateSchedule(testType);
      if (result.success) {
        setPage('schedule');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (result.error) {
        setGenerateError(result.error);
      }
      return;
    }
    setPendingGenerate(testType);
    setTelegramGate(true, 'generate');
  };

  const generateSchedule = (testType: TestType): { success: boolean; error?: string } => {
    const tSources = selectedSources.filter((s) => s.testType === testType);
    if (tSources.length === 0) {
      return { success: false, error: 'لم تختر أي مصادر بعد' };
    }

    for (const s of tSources) {
      const inp = inputs[s.id];
      if (!inp || (inp.videos <= 0 && inp.tests <= 0)) {
        return { success: false, error: `أدخل عدداً للفيديوهات أو الاختبارات لـ "${s.name}"` };
      }
    }

    let { startDate, endDate, offDays } = scheduleConfig;
    if (reviewConfig.enabled) {
      if (reviewConfig.mode === 'interval-days' && (reviewConfig.intervalDays === null || reviewConfig.intervalDays <= 0)) {
        return { success: false, error: 'اخترت المراجعة لكن لم تحدد عدد الأيام المتتالية' };
      }
      if (reviewConfig.mode === 'phase-end' && (reviewConfig.phaseReviewDays === null || reviewConfig.phaseReviewDays <= 0)) {
        return { success: false, error: 'اخترت المراجعة لكن لم تحدد عدد أيام مراجعة المرحلة' };
      }
      if (reviewConfig.mode === 'weekly-days' && reviewConfig.weeklyDays.length === 0) {
        return { success: false, error: 'اخترت المراجعة لكن لم تحدد أيام المراجعة الأسبوعية' };
      }
    }
    const phaseReviewDays = reviewConfig.phaseReviewDays !== null ? Math.min(10, Math.max(1, reviewConfig.phaseReviewDays)) : 0;
    const intervalDays = reviewConfig.intervalDays !== null ? Math.min(15, Math.max(1, reviewConfig.intervalDays)) : 0;
    if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
      return { success: false, error: 'تحقق من تواريخ البداية والنهاية' };
    }
    // Auto-correct stale start date to today
    if (startDate < todayISO()) {
      startDate = todayISO();
      setScheduleConfig((prev) => ({ ...prev, startDate }));
      if (endDate < startDate) {
        return { success: false, error: 'تاريخ النهاية أصبح سابقاً لتاريخ اليوم. اختر تاريخ نهاية مستقبلي.' };
      }
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
      return { success: false, error: 'لا توجد أيام دراسة متاحة (كلها إجازة؟)' };
    }

    type FlatTask = { sourceId: string; type: 'video' | 'test'; label: string; phase: string };
    const flatTasks: FlatTask[] = [];

    if (testType === 'qiyas') {
      const foundationSources = tSources.filter(s => s.groupId === 'foundation');
      const trainingSources = tSources.filter(s => s.groupId === 'training-quant' || s.groupId === 'training-verbal');

      const interleaveSource = (s: typeof tSources[0], phaseLabel: string): FlatTask[] => {
        const inp = inputs[s.id];
        const prefix = phaseLabel.replace(/^ال/, '');
        const result: FlatTask[] = [];
        const max = Math.max(inp.videos, inp.tests);
        let vIdx = 1, tIdx = 1;
        for (let i = 0; i < max; i++) {
          if (vIdx <= inp.videos) {
            result.push({ sourceId: s.id, type: 'video', label: `فيديو ${prefix} ${s.name} ${vIdx}`, phase: phaseLabel });
            vIdx++;
          }
          if (tIdx <= inp.tests) {
            result.push({ sourceId: s.id, type: 'test', label: `اختبار ${prefix} ${s.name} ${tIdx}`, phase: phaseLabel });
            tIdx++;
          }
        }
        return result;
      };

      const roundRobin = (sourceTaskLists: FlatTask[][]): FlatTask[] => {
        const result: FlatTask[] = [];
        let added = true;
        while (added) {
          added = false;
          for (const list of sourceTaskLists) {
            if (list.length > 0) { result.push(list.shift()!); added = true; }
          }
        }
        return result;
      };

      const foundationTasks = roundRobin(foundationSources.map(s => interleaveSource(s, 'التأسيس')));
      const trainingTasks = roundRobin(trainingSources.map(s => interleaveSource(s, 'التدريب')));
      flatTasks.push(...foundationTasks, ...trainingTasks);
    } else {
      const orderedSources = [...tSources].sort((a, b) => {
        const aIdx = tahsiliSubjectOrder.indexOf(a.id);
        const bIdx = tahsiliSubjectOrder.indexOf(b.id);
        if (aIdx === -1 && bIdx === -1) return 0;
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      });
      const orderedPools = orderedSources.map(s => taskPools.find(p => p.sourceId === s.id)!).filter(Boolean);
      for (const pool of orderedPools) {
        const s = orderedSources.find(src => src.id === pool.sourceId)!;
        const inp = inputs[s.id];
        const max = Math.max(inp.videos, inp.tests);
        let vIdx = 1, tIdx = 1;
        for (let i = 0; i < max; i++) {
          if (vIdx <= inp.videos) {
            flatTasks.push({ sourceId: s.id, type: 'video', label: `${s.name} - فيديو ${vIdx}`, phase: pool.sourceName });
            vIdx++;
          }
          if (tIdx <= inp.tests) {
            flatTasks.push({ sourceId: s.id, type: 'test', label: `${s.name} - اختبار ${tIdx}`, phase: pool.sourceName });
            tIdx++;
          }
        }
      }
    }

    const buildDays = (dates: string[], tpd: number): { days: ScheduleDay[]; taskIdx: number } => {
      const out: ScheduleDay[] = [];
      let ti = 0;
      let sinceReview = 0;
      let curPhase = flatTasks[0]?.phase ?? '';
      for (let d = 0; d < dates.length; d++) {
        const date = dates[d];
        let isReview = false;
        if (reviewConfig.enabled) {
          if (reviewConfig.mode === 'weekly-days' && reviewConfig.weeklyDays.includes(getDayOfWeek(date))) isReview = true;
          else if (reviewConfig.mode === 'interval-days' && sinceReview >= intervalDays) isReview = true;
          else if (reviewConfig.mode === 'phase-end' && flatTasks[ti] && flatTasks[ti].phase !== curPhase && curPhase) {
            const prevPhase = curPhase;
            for (let r = 0; r < phaseReviewDays && d < dates.length; r++) {
              out.push({ dayIndex: out.length, date: dates[d], tasks: [{ id: `rev-${out.length}`, type: 'review', label: `مراجعة مرحلية - ${prevPhase}`, sourceId: 'review', done: false }], phase: 'مراجعة', isReviewDay: true, done: false });
              d++;
            }
            if (d < dates.length) curPhase = flatTasks[ti]?.phase ?? curPhase;
            sinceReview = 0;
          }
        }
        if (d >= dates.length) break;
        const dayTasks: ScheduleTask[] = [];
        if (!isReview) {
          const phase = flatTasks[ti]?.phase ?? curPhase;
          for (let t = 0; t < tpd && ti < flatTasks.length; t++) {
            const ft = flatTasks[ti];
            dayTasks.push({ id: `${d}-${t}`, type: ft.type, label: ft.label, sourceId: ft.sourceId, done: false });
            ti++;
          }
          sinceReview++;
          out.push({ dayIndex: out.length, date, tasks: dayTasks, phase, isReviewDay: false, done: false });
        } else {
          dayTasks.push({ id: `rev-${d}`, type: 'review', label: 'يوم مراجعة - راجع ما سبق', sourceId: 'review', done: false });
          sinceReview = 0;
          out.push({ dayIndex: out.length, date, tasks: dayTasks, phase: 'مراجعة', isReviewDay: true, done: false });
        }
        if (ti >= flatTasks.length && !reviewConfig.enabled) break;
      }
      return { days: out, taskIdx: ti };
    };

    const tasksPerDay = Math.max(1, Math.ceil(flatTasks.length / studyDates.length));
    const { days, taskIdx } = buildDays(studyDates, tasksPerDay);

    // Insert rest days for off days that fall between scheduled days
    const fullDays: ScheduleDay[] = [];
    for (let i = 0; i < days.length; i++) {
      fullDays.push(days[i]);
      if (i < days.length - 1) {
        let checkDate = addDaysISO(days[i].date, 1);
        while (checkDate < days[i + 1].date) {
          if (isOffDay(checkDate)) {
            fullDays.push({ dayIndex: 0, date: checkDate, tasks: [], phase: 'إجازة', isReviewDay: false, isRestDay: true, done: false });
          }
          checkDate = addDaysISO(checkDate, 1);
        }
      }
    }
    const reindexed = fullDays.map((d, i) => ({ ...d, dayIndex: i }));

    const endDateActual = reindexed.length > 0 ? reindexed[reindexed.length - 1].date : endDate;

    let warning: Schedule['warning'] | undefined;
    if (taskIdx < flatTasks.length) {
      let probe = addDaysISO(endDate, 1);
      let extended = [...studyDates];
      while (taskIdx < flatTasks.length && probe) {
        if (!isOffDay(probe)) extended.push(probe);
        probe = addDaysISO(probe, 1);
        if (extended.length > 10000) break;
      }
      const { taskIdx: fitIdx } = buildDays(extended, tasksPerDay);
      if (fitIdx >= flatTasks.length) {
        warning = {
          suggestedEndDate: extended[extended.length - 1],
          neededDays: extended.length,
          availableDays: studyDates.length,
        };
      }
    }

    setSchedule({ testType, startDate, endDate: endDateActual, days: reindexed, totalVideos, totalTests, warning });
    setScheduleConfirmed(false);
    return { success: true };
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

  const postponeTasks = (numDays: number) => {
    setSchedule((prev) => {
      if (!prev) return prev;
      const today = todayISO();
      const todayIdx = prev.days.findIndex((d) => d.date >= today && !d.done);
      if (todayIdx === -1) return prev;
      const currentDate = prev.days[todayIdx].date;
      const beforeToday = prev.days.slice(0, todayIdx);
      const afterToday = prev.days.slice(todayIdx);
      const shiftedDays = afterToday.map((d) => ({ ...d, date: addDaysISO(d.date, numDays) }));
      const postponedDays: ScheduleDay[] = [];
      for (let i = 0; i < numDays; i++) {
        postponedDays.push({ dayIndex: 0, date: addDaysISO(currentDate, i), tasks: [], phase: 'إجازة', isReviewDay: false, isRestDay: true, done: false });
      }
      const allDays = [...beforeToday, ...postponedDays, ...shiftedDays];
      const reindexed = allDays.map((d, i) => ({ ...d, dayIndex: i }));
      const newEndDate = reindexed.length > 0 ? reindexed[reindexed.length - 1].date : prev.endDate;
      const newStartDate = beforeToday.length === 0 ? addDaysISO(currentDate, numDays) : prev.startDate;
      return { ...prev, days: reindexed, startDate: newStartDate, endDate: newEndDate };
    });
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
    selectedSources, toggleSource, addSource, removeSource, isSourceSelected,
    inputs, setInput,
    scheduleConfig, setScheduleConfig,
    reviewConfig, setReviewConfig,
    tahsiliSubjectOrder, setTahsiliSubjectOrder,
    schedule, generateSchedule, scheduleConfirmed, confirmSchedule, clearSchedule,
    toggleTaskDone, confirmDay, postponeTasks,
    streak, progress, completedDays, totalTasks, completedTasks,
    showDeleteWarning, setShowDeleteWarning,
    cloudSyncing,
    telegramVerified, telegramGateOpen, telegramGateMode, setTelegramGate,
    setTelegramVerified, pendingGenerate, setPendingGenerate,
    requestGenerate, handleTelegramVerified,
    notes, setNotes,
    generateError, setGenerateError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
