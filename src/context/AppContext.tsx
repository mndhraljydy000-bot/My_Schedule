import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  type Source, type Schedule, type ScheduleDay, type ScheduleConfig,
  type Inputs, type TestType, type Page,
  generateScheduleForSources,
} from '../data/sources';
import { addDaysISO } from '../utils/scheduler';

const STORAGE_KEY = 'thakhasom-mathakra-v1';

interface PersistedState {
  schedule: Schedule | null;
  scheduleConfirmed: boolean;
  selectedSources: Source[];
  inputs: Inputs;
  scheduleConfig: ScheduleConfig;
}

interface AppContextValue extends PersistedState {
  page: Page;
  setPage: (p: Page) => void;
  toggleSource: (s: Source) => void;
  setInputs: (id: string, data: Partial<Inputs[string]>) => void;
  setScheduleConfig: (data: Partial<ScheduleConfig>) => void;
  generateSchedule: (testType: TestType) => void;
  confirmSchedule: () => void;
  clearSchedule: () => void;
  toggleTaskDone: (dayIndex: number, taskId: string) => void;
  confirmDay: (dayIndex: number) => void;
  postponeSchedule: (days: number) => void;
  showDeleteWarning: boolean;
  setShowDeleteWarning: (b: boolean) => void;
  progress: number;
  completedDays: number;
  streak: number;
  totalTasks: number;
  completedTasks: number;
}

const AppContext = createContext<AppContextValue | null>(null);
import { createContext, useContext } from 'react';

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

const defaultConfig: ScheduleConfig = {
  startDate: '',
  endDate: '',
  dailyHours: 4,
  offDays: [],
};

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    schedule: null,
    scheduleConfirmed: false,
    selectedSources: [],
    inputs: {},
    scheduleConfig: defaultConfig,
  };
}

function calculateStreak(days: ScheduleDay[]): number {
  let streak = 0;
  const sorted = [...days].sort((a, b) => b.date.localeCompare(a.date));
  for (const d of sorted) {
    if (d.done) streak++;
    else break;
  }
  return streak;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const persisted = loadState();
  const [page, setPage] = useState<Page>('home');
  const [schedule, setSchedule] = useState<Schedule | null>(persisted.schedule);
  const [scheduleConfirmed, setScheduleConfirmed] = useState(persisted.scheduleConfirmed);
  const [selectedSources, setSelectedSources] = useState<Source[]>(persisted.selectedSources);
  const [inputs, setInputsState] = useState<Inputs>(persisted.inputs);
  const [scheduleConfig, setScheduleConfigState] = useState<ScheduleConfig>(persisted.scheduleConfig);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  useEffect(() => {
    const state: PersistedState = { schedule, scheduleConfirmed, selectedSources, inputs, scheduleConfig };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [schedule, scheduleConfirmed, selectedSources, inputs, scheduleConfig]);

  useEffect(() => {
    if (schedule && scheduleConfirmed) setPage('schedule');
  }, []);

  const toggleSource = useCallback((s: Source) => {
    setSelectedSources((prev) => {
      const exists = prev.find((x) => x.id === s.id);
      if (exists) return prev.filter((x) => x.id !== s.id);
      return [...prev, s];
    });
  }, []);

  const setInputs = useCallback((id: string, data: Partial<Inputs[string]>) => {
    setInputsState((prev) => ({ ...prev, [id]: { ...prev[id], ...data } }));
  }, []);

  const setScheduleConfig = useCallback((data: Partial<ScheduleConfig>) => {
    setScheduleConfigState((prev) => ({ ...prev, ...data }));
  }, []);

  const generateSchedule = useCallback((testType: TestType) => {
    const sources = selectedSources.filter((s) => s.testType === testType);
    if (sources.length === 0) return;
    const sched = generateScheduleForSources(sources, inputs, scheduleConfig);
    setSchedule(sched);
    setScheduleConfirmed(false);
    setPage('schedule');
  }, [selectedSources, inputs, scheduleConfig]);

  const confirmSchedule = useCallback(() => {
    setScheduleConfirmed(true);
  }, []);

  const clearSchedule = useCallback(() => {
    setSchedule(null);
    setScheduleConfirmed(false);
    setSelectedSources([]);
    setInputsState({});
    setScheduleConfigState(defaultConfig);
    setPage('home');
  }, []);

  const toggleTaskDone = useCallback((dayIndex: number, taskId: string) => {
    setSchedule((prev) => {
      if (!prev) return prev;
      const days = prev.days.map((d) => {
        if (d.dayIndex !== dayIndex) return d;
        const tasks = d.tasks.map((t) => t.id === taskId ? { ...t, done: !t.done } : t);
        return { ...d, tasks };
      });
      return { ...prev, days };
    });
  }, []);

  const confirmDay = useCallback((dayIndex: number) => {
    setSchedule((prev) => {
      if (!prev) return prev;
      const days = prev.days.map((d) => {
        if (d.dayIndex !== dayIndex) return d;
        const tasks = d.tasks.map((t) => ({ ...t, done: true }));
        return { ...d, tasks, done: true };
      });
      return { ...prev, days };
    });
  }, []);

  const postponeSchedule = useCallback((days: number) => {
    setSchedule((prev) => {
      if (!prev || prev.days.length === 0) return prev;
      const newStartDate = addDaysISO(prev.startDate, days);
      const newEndDate = addDaysISO(prev.endDate, days);
      const newDays = prev.days.map((d) => ({ ...d, date: addDaysISO(d.date, days) }));
      return { ...prev, startDate: newStartDate, endDate: newEndDate, days: newDays };
    });
    setScheduleConfigState((prev) => ({
      ...prev,
      startDate: addDaysISO(prev.startDate, days),
      endDate: addDaysISO(prev.endDate, days),
    }));
  }, []);

  const totalTasks = schedule?.days.reduce((acc, d) => acc + d.tasks.length, 0) ?? 0;
  const completedTasks = schedule?.days.reduce((acc, d) => acc + d.tasks.filter((t) => t.done).length, 0) ?? 0;
  const completedDays = schedule?.days.filter((d) => d.done).length ?? 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const streak = schedule ? calculateStreak(schedule.days) : 0;

  const value: AppContextValue = {
    page, setPage,
    schedule, scheduleConfirmed,
    selectedSources, inputs, scheduleConfig,
    toggleSource, setInputs, setScheduleConfig,
    generateSchedule, confirmSchedule, clearSchedule,
    toggleTaskDone, confirmDay, postponeSchedule,
    showDeleteWarning, setShowDeleteWarning,
    progress, completedDays, streak, totalTasks, completedTasks,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
