import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import type { TestType, SourceInput, GeneratedSchedule, ReviewConfig } from '../data/sources';
import { DEFAULT_REVIEW } from '../data/sources';
import { generateSchedule, type SchedulerInput } from '../utils/scheduler';

export type Page = 'home' | 'qiyas' | 'tahsili' | 'schedule';

interface SelectedSource { id: string; name: string; testType: TestType; }

export interface ScheduleConfig {
  startDate: string;
  endDate: string;
  offDays: number[];
}

interface AppState {
  page: Page;
  setPage: (p: Page) => void;
  selectedSources: SelectedSource[];
  toggleSource: (id: string, name: string, testType: TestType) => void;
  isSourceSelected: (id: string) => boolean;
  removeSource: (id: string) => void;
  inputs: Record<string, SourceInput>;
  setInput: (id: string, input: Partial<SourceInput>) => void;
  scheduleConfig: ScheduleConfig;
  setScheduleConfig: (cfg: Partial<ScheduleConfig>) => void;
  reviewConfig: ReviewConfig;
  setReviewConfig: (cfg: Partial<ReviewConfig>) => void;
  schedule: GeneratedSchedule | null;
  scheduleConfirmed: boolean;
  generateSchedule: (testType: TestType) => void;
  confirmSchedule: () => void;
  clearSchedule: () => void;
  toggleTaskDone: (dayIndex: number, taskId: string) => void;
  confirmDay: (dayIndex: number) => void;
  progress: number;
  completedDays: number;
  totalTasks: number;
  completedTasks: number;
  streak: number;
  lastCompletionDate: string | null;
  showDeleteWarning: boolean;
  setShowDeleteWarning: (v: boolean) => void;
  navigateToSection: (p: Page) => void;
  showScheduleExists: boolean;
  setShowScheduleExists: (v: boolean) => void;
  pendingPage: Page | null;
}

const DEFAULT_INPUT: SourceInput = { videos: 0, tests: 0 };

function todayISO(): string { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function addDaysISO(iso: string, n: number): string { const [y,m,d] = iso.split('-').map(Number); const dt = new Date(y,m-1,d); dt.setDate(dt.getDate()+n); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; }

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>('home');
  const [selectedSources, setSelectedSources] = useState<SelectedSource[]>([]);
  const [inputs, setInputs] = useState<Record<string, SourceInput>>({});
  const [scheduleConfig, setScheduleConfigState] = useState<ScheduleConfig>({ startDate: todayISO(), endDate: addDaysISO(todayISO(), 30), offDays: [5, 6] });
  const [reviewConfig, setReviewConfigState] = useState<ReviewConfig>(DEFAULT_REVIEW);
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  const [scheduleConfirmed, setScheduleConfirmed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastCompletionDate, setLastCompletionDate] = useState<string | null>(null);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showScheduleExists, setShowScheduleExists] = useState(false);
  const [pendingPage, setPendingPage] = useState<Page | null>(null);

  const toggleSource = useCallback((id: string, name: string, testType: TestType) => {
    setSelectedSources((prev) => prev.find((s) => s.id === id) ? prev.filter((s) => s.id !== id) : [...prev, { id, name, testType }]);
    setInputs((prev) => prev[id] ? prev : { ...prev, [id]: { ...DEFAULT_INPUT } });
  }, []);

  const isSourceSelected = useCallback((id: string) => selectedSources.some((s) => s.id === id), [selectedSources]);
  const removeSource = useCallback((id: string) => setSelectedSources((prev) => prev.filter((s) => s.id !== id)), []);
  const setInput = useCallback((id: string, input: Partial<SourceInput>) => { setInputs((prev) => ({ ...prev, [id]: { ...(prev[id] || DEFAULT_INPUT), ...input } })); }, []);
  const setScheduleConfig = useCallback((cfg: Partial<ScheduleConfig>) => setScheduleConfigState((prev) => ({ ...prev, ...cfg })), []);
  const setReviewConfig = useCallback((cfg: Partial<ReviewConfig>) => setReviewConfigState((prev) => ({ ...prev, ...cfg })), []);

  const generateScheduleFn = useCallback((testType: TestType) => {
    const srcs: SchedulerInput[] = selectedSources
      .map((s): SchedulerInput | null => {
        const input = inputs[s.id] || DEFAULT_INPUT;
        if (input.videos <= 0 && input.tests <= 0) return null;
        let category: string | undefined;
        let subjectLabel: string | undefined;
        if (testType === 'qiyas') {
          if (s.id.startsWith('qiyas-f-')) category = 'foundation';
          else if (s.id.startsWith('qiyas-tq-')) category = 'training-quant';
          else if (s.id.startsWith('qiyas-tv-')) category = 'training-verbal';
        } else {
          const parts = s.id.split(':');
          if (parts.length === 2) {
            const subjMap: Record<string, string> = { math: 'الرياضيات', physics: 'الفيزياء', chemistry: 'الكيمياء', biology: 'الأحياء' };
            subjectLabel = subjMap[parts[1]] || parts[1];
          }
        }
        return { sourceId: s.id, sourceName: s.name, input, category, subjectLabel };
      })
      .filter((s): s is SchedulerInput => s !== null);

    if (srcs.length === 0) { setSchedule(null); return; }
    setSchedule(generateSchedule(srcs, { ...scheduleConfig, reviewConfig, testType }));
    setScheduleConfirmed(false);
  }, [selectedSources, inputs, scheduleConfig, reviewConfig]);

  const navigateToSection = useCallback((p: Page) => {
    if (schedule) { setPendingPage(p); setShowScheduleExists(true); return; }
    setPage(p);
  }, [schedule]);

  const confirmSchedule = useCallback(() => setScheduleConfirmed(true), []);

  const clearSchedule = useCallback(() => {
    setSchedule(null); setScheduleConfirmed(false); setStreak(0); setLastCompletionDate(null); setShowDeleteWarning(false);
    setSelectedSources([]); setInputs({});
  }, []);

  const toggleTaskDone = useCallback((dayIndex: number, taskId: string) => {
    setSchedule((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((d) =>
          d.dayIndex === dayIndex && !d.done
            ? { ...d, tasks: d.tasks.map((t) => t.id === taskId ? { ...t, done: !t.done } : t) }
            : d
        ),
      };
    });
  }, []);

  const confirmDay = useCallback((dayIndex: number) => {
    setSchedule((prev) => {
      if (!prev) return prev;
      const day = prev.days.find((d) => d.dayIndex === dayIndex);
      if (!day || day.done) return prev;
      if (!day.tasks.every((t) => t.done)) return prev;

      const today = todayISO();
      const yesterday = addDaysISO(today, -1);
      setStreak((s) => {
        if (lastCompletionDate === today) return s;
        if (lastCompletionDate === yesterday) return s + 1;
        return 1;
      });
      setLastCompletionDate(today);

      return {
        ...prev,
        days: prev.days.map((d) =>
          d.dayIndex === dayIndex
            ? { ...d, done: true, tasks: d.tasks.map((t) => ({ ...t, done: true })) }
            : d
        ),
      };
    });
  }, [lastCompletionDate]);

  useMemo(() => {
    if (!lastCompletionDate) return;
    const today = todayISO();
    const yesterday = addDaysISO(today, -1);
    if (lastCompletionDate !== today && lastCompletionDate !== yesterday) {
      setStreak(0); setLastCompletionDate(null);
    }
  }, [lastCompletionDate]);

  const completedDays = schedule?.days.filter((d) => d.done).length ?? 0;
  const totalDays = schedule?.days.length ?? 0;
  const progress = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  const totalTasks = schedule?.totalGranularTasks ?? 0;
  const completedTasks = schedule?.days.reduce((s, d) => s + d.tasks.filter((t) => t.done).length, 0) ?? 0;

  const value = useMemo<AppState>(() => ({
    page, setPage, selectedSources, toggleSource, isSourceSelected, removeSource,
    inputs, setInput, scheduleConfig, setScheduleConfig, reviewConfig, setReviewConfig,
    schedule, scheduleConfirmed, generateSchedule: generateScheduleFn, confirmSchedule, clearSchedule,
    toggleTaskDone, confirmDay, progress, completedDays, totalTasks, completedTasks,
    streak, lastCompletionDate, showDeleteWarning, setShowDeleteWarning,
    navigateToSection, showScheduleExists, setShowScheduleExists, pendingPage,
  }), [page, selectedSources, toggleSource, isSourceSelected, removeSource, inputs, setInput,
    scheduleConfig, setScheduleConfig, reviewConfig, setReviewConfig,
    schedule, scheduleConfirmed, generateScheduleFn, confirmSchedule, clearSchedule,
    toggleTaskDone, confirmDay, progress, completedDays, totalTasks, completedTasks, streak,
    lastCompletionDate, showDeleteWarning, navigateToSection]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
