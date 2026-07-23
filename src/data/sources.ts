import { addDaysISO } from '../utils/scheduler';

export type TestType = 'qiyas' | 'tahsili';

export interface Source {
  id: string;
  name: string;
  testType: TestType;
  subject?: string;
  color: string;
}

export interface Task {
  id: string;
  type: 'video' | 'test' | 'review';
  label: string;
  sourceId: string;
  done: boolean;
}

export interface ScheduleDay {
  dayIndex: number;
  date: string;
  dayName: string;
  tasks: Task[];
  done: boolean;
  phase?: string;
  isReviewDay?: boolean;
}

export interface Schedule {
  testType: TestType;
  startDate: string;
  endDate: string;
  days: ScheduleDay[];
  totalVideos: number;
  totalTests: number;
  sources: Source[];
}

export interface ScheduleConfig {
  startDate: string;
  endDate: string;
  dailyHours: number;
  offDays: number[];
}

export type Inputs = Record<string, { videos: number; tests: number }>;

export type Page = 'home' | 'qiyas' | 'tahsili' | 'schedule';

export const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

export const ARABIC_DAYS_SHORT = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export const ARABIC_DAYS_FULL = [
  'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت',
];

export const QIYAS_SOURCES: Source[] = [
  { id: 'q-foundation', name: 'الأساسيات', testType: 'qiyas', color: 'gold' },
  { id: 'q-quant', name: 'تدريب كمي', testType: 'qiyas', color: 'sky' },
  { id: 'q-verbal', name: 'تدريب لفظي', testType: 'qiyas', color: 'sky' },
];

export const TAHSILI_SOURCES: Source[] = [
  { id: 't-math', name: 'رياضيات', testType: 'tahsili', subject: 'رياضيات', color: 'gold' },
  { id: 't-physics', name: 'فيزياء', testType: 'tahsili', subject: 'فيزياء', color: 'sky' },
  { id: 't-chem', name: 'كيمياء', testType: 'tahsili', subject: 'كيمياء', color: 'sky' },
  { id: 't-bio', name: 'أحياء', testType: 'tahsili', subject: 'أحياء', color: 'gold' },
];

export const ALL_SOURCES = [...QIYAS_SOURCES, ...TAHSILI_SOURCES];

export function getSourceById(id: string): Source | undefined {
  return ALL_SOURCES.find((s) => s.id === id);
}

function getDayName(date: string): string {
  const day = new Date(date + 'T00:00:00').getDay();
  return ARABIC_DAYS_FULL[day];
}

export function generateScheduleForSources(
  sources: Source[],
  inputs: Inputs,
  config: ScheduleConfig
): Schedule {
  const days: ScheduleDay[] = [];
  let totalVideos = 0;
  let totalTests = 0;
  let currentDate = config.startDate;
  let dayIndex = 0;

  const isOffDay = (date: string) => {
    const dow = new Date(date + 'T00:00:00').getDay();
    return config.offDays.includes(dow);
  };

  const advanceDate = () => {
    do {
      currentDate = addDaysISO(currentDate, 1);
    } while (isOffDay(currentDate) && currentDate <= config.endDate);
  };

  if (sources[0]?.testType === 'qiyas') {
    const foundation = sources.find((s) => s.id === 'q-foundation');
    const training = sources.filter((s) => s.id !== 'q-foundation');

    if (foundation) {
      const inp = inputs[foundation.id] || { videos: 10, tests: 5 };
      const tasks: Task[] = [];
      for (let i = 0; i < inp.videos; i++) {
        tasks.push({ id: `${foundation.id}-v-${i}`, type: 'video', label: `${foundation.name} - فيديو ${i + 1}`, sourceId: foundation.id, done: false });
        totalVideos++;
      }
      for (let i = 0; i < inp.tests; i++) {
        tasks.push({ id: `${foundation.id}-t-${i}`, type: 'test', label: `${foundation.name} - اختبار ${i + 1}`, sourceId: foundation.id, done: false });
        totalTests++;
      }
      days.push({ dayIndex, date: currentDate, dayName: getDayName(currentDate), tasks, done: false, phase: 'الأساسيات' });
      dayIndex++;
      advanceDate();
    }

    for (const src of training) {
      const inp = inputs[src.id] || { videos: 10, tests: 5 };
      const tasksPerDay = 3;
      const allTasks: Task[] = [];
      for (let i = 0; i < inp.videos; i++) {
        allTasks.push({ id: `${src.id}-v-${i}`, type: 'video', label: `${src.name} - فيديو ${i + 1}`, sourceId: src.id, done: false });
        totalVideos++;
      }
      for (let i = 0; i < inp.tests; i++) {
        allTasks.push({ id: `${src.id}-t-${i}`, type: 'test', label: `${src.name} - اختبار ${i + 1}`, sourceId: src.id, done: false });
        totalTests++;
      }
      for (let i = 0; i < allTasks.length; i += tasksPerDay) {
        const chunk = allTasks.slice(i, i + tasksPerDay);
        if (currentDate > config.endDate) break;
        days.push({ dayIndex, date: currentDate, dayName: getDayName(currentDate), tasks: chunk, done: false, phase: src.name });
        dayIndex++;
        advanceDate();
      }
    }
  } else {
    for (const src of sources) {
      const inp = inputs[src.id] || { videos: 10, tests: 5 };
      const tasksPerDay = 3;
      const allTasks: Task[] = [];
      for (let i = 0; i < inp.videos; i++) {
        allTasks.push({ id: `${src.id}-v-${i}`, type: 'video', label: `${src.subject} - فيديو ${i + 1}`, sourceId: src.id, done: false });
        totalVideos++;
      }
      for (let i = 0; i < inp.tests; i++) {
        allTasks.push({ id: `${src.id}-t-${i}`, type: 'test', label: `${src.subject} - اختبار ${i + 1}`, sourceId: src.id, done: false });
        totalTests++;
      }
      for (let i = 0; i < allTasks.length; i += tasksPerDay) {
        const chunk = allTasks.slice(i, i + tasksPerDay);
        if (currentDate > config.endDate) break;
        days.push({ dayIndex, date: currentDate, dayName: getDayName(currentDate), tasks: chunk, done: false, phase: src.subject });
        dayIndex++;
        advanceDate();
      }
    }
  }

  if (days.length > 0) {
    const reviewDate = days[days.length - 1].date;
    days.push({
      dayIndex,
      date: addDaysISO(reviewDate, 1),
      dayName: getDayName(addDaysISO(reviewDate, 1)),
      tasks: [{ id: 'review-final', type: 'review', label: 'مراجعة شاملة نهائية', sourceId: 'review', done: false }],
      done: false,
      phase: 'المراجعة',
      isReviewDay: true,
    });
  }

  const endDate = days.length > 0 ? days[days.length - 1].date : config.endDate;

  return {
    testType: sources[0].testType,
    startDate: config.startDate,
    endDate,
    days,
    totalVideos,
    totalTests,
    sources,
  };
}
