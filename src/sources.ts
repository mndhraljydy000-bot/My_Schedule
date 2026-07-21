export type TestType = 'qiyas' | 'tahsili';
export type SourceCategory = 'foundation' | 'training-quant' | 'training-verbal';

export interface Source {
  id: string; name: string; category: SourceCategory; testType: TestType; description: string;
}

export type TahsiliSubject = 'math' | 'physics' | 'chemistry' | 'biology';
export interface TahsiliSource { id: string; name: string; description: string; subjects: TahsiliSubject[]; }

export const TAHSILI_SUBJECTS: Record<TahsiliSubject, string> = {
  math: 'الرياضيات', physics: 'الفيزياء', chemistry: 'الكيمياء', biology: 'الأحياء',
};

export const TAHSILI_SOURCES: TahsiliSource[] = [
  { id: 't-nasser', name: 'ناصر عبدالكريم', description: 'شرح منهجي شامل لمواد التحصيلي', subjects: ['math','physics','chemistry','biology'] },
  { id: 't-yellow', name: 'منصة يلو', description: 'منصة تعليمية متكاملة للتحصيلي', subjects: ['math','physics','chemistry','biology'] },
  { id: 't-ghasham', name: 'غشام', description: 'دروس ومراجعات مكثفة', subjects: ['math','physics','chemistry','biology'] },
  { id: 't-einstein', name: 'إينشتاين', description: 'شرح علمي مبسّط بأسلوب مبتكر', subjects: ['math','physics','chemistry','biology'] },
];

export interface SourceInput { videos: number; tests: number; }

// ── Review options ──
export type ReviewMode = 'none' | 'weekly-days' | 'interval-days' | 'interval-tasks' | 'phase-end';

export interface ReviewConfig {
  enabled: boolean;
  mode: ReviewMode;
  weeklyDays: number[];
  intervalDays: number;
  intervalTasks: number;
  phaseReviewDays: number;
}

export const DEFAULT_REVIEW: ReviewConfig = {
  enabled: false, mode: 'none', weeklyDays: [], intervalDays: 10, intervalTasks: 10, phaseReviewDays: 3,
};

// ── Granular task types ──
export type GranularTaskType = 'video' | 'test' | 'review';

export interface GranularTask {
  id: string;
  sourceId: string;
  sourceName: string;
  type: GranularTaskType;
  label: string;
  done: boolean;
}

export interface ScheduleDay {
  dayIndex: number;
  date: string;
  tasks: GranularTask[];
  done: boolean;
  isReviewDay: boolean;
  phase?: string;
  subjectLabel?: string;
}

export interface GeneratedSchedule {
  startDate: string;
  endDate: string;
  days: ScheduleDay[];
  totalStudyDays: number;
  totalVideos: number;
  totalTests: number;
  totalGranularTasks: number;
  error?: string;
}

export const SOURCES: Source[] = [
  { id: 'qiyas-f-muaser10', name: 'كتاب المعاصر 10', category: 'foundation', testType: 'qiyas', description: 'تأسيس شامل لجميع أقسام القدرات' },
  { id: 'qiyas-f-einstein', name: 'إينشتاين', category: 'foundation', testType: 'qiyas', description: 'تأسيس علمي مبسّط بأسلوب مبتكر' },
  { id: 'qiyas-f-murshid', name: 'محمد المرشد', category: 'foundation', testType: 'qiyas', description: 'تأسيس تدريبي مع شرح منهجي' },
  { id: 'qiyas-tq-munsif', name: 'المنصف', category: 'training-quant', testType: 'qiyas', description: 'تدريب كمي مكثف على الأنماط' },
  { id: 'qiyas-tq-mufakir', name: 'المفكر', category: 'training-quant', testType: 'qiyas', description: 'تدريب كمي بمستويات متدرجة' },
  { id: 'qiyas-tv-ihab', name: 'دورة إيهاب عبد العظيم', category: 'training-verbal', testType: 'qiyas', description: 'تدريب لفظي شامل ومنهجي' },
];

export function getSourcesByCategory(testType: TestType, category: SourceCategory): Source[] {
  return SOURCES.filter((s) => s.testType === testType && s.category === category);
}
