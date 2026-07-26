export type TestType = 'qiyas' | 'tahsili';
export type SourceCategory = 'foundation' | 'training-quant' | 'training-verbal';
export type TahsiliSubject = 'math' | 'physics' | 'chemistry' | 'biology';
export type ReviewMode = 'none' | 'weekly-days' | 'interval-days' | 'phase-end';
export type Page = 'home' | 'qiyas' | 'tahsili' | 'schedule' | 'notes';

export interface Source {
  id: string;
  name: string;
  description: string;
  testType: TestType;
  category?: SourceCategory;
  subject?: TahsiliSubject;
  groupId?: string;
}

export interface SourceInput {
  videos: number;
  tests: number;
}

export interface ScheduleTask {
  id: string;
  type: 'video' | 'test' | 'review';
  label: string;
  sourceId: string;
  done: boolean;
}

export interface ScheduleDay {
  dayIndex: number;
  date: string;
  tasks: ScheduleTask[];
  phase?: string;
  isReviewDay?: boolean;
  isRestDay?: boolean;
  done: boolean;
}

export interface Schedule {
  testType: TestType;
  startDate: string;
  endDate: string;
  days: ScheduleDay[];
  totalVideos: number;
  totalTests: number;
  error?: string;
  warning?: { suggestedEndDate: string; neededDays: number; availableDays: number };
}

export const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

export const ARABIC_DAYS = [
  'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت',
];

export const ARABIC_DAYS_SHORT = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const QIYAS_SOURCES: Source[] = [
  { id: 'q-f1', name: 'المعاصر', description: '', testType: 'qiyas', category: 'foundation' },
  { id: 'q-f2', name: 'إينشتاين', description: '', testType: 'qiyas', category: 'foundation' },
  { id: 'q-f3', name: 'المنصف', description: '', testType: 'qiyas', category: 'foundation' },
  { id: 'q-f4', name: 'محمد المرشد', description: '', testType: 'qiyas', category: 'foundation' },
  { id: 'q-t1', name: 'المنصف', description: '', testType: 'qiyas', category: 'training-quant' },
  { id: 'q-t2', name: 'المفكر', description: '', testType: 'qiyas', category: 'training-quant' },
  { id: 'q-t3', name: 'دورة إيهاب عبد العظيم', description: '', testType: 'qiyas', category: 'training-verbal' },
];

export const TAHSILI_SUBJECTS: Record<TahsiliSubject, string> = {
  math: 'الرياضيات',
  physics: 'الفيزياء',
  chemistry: 'الكيمياء',
  biology: 'الأحياء',
};

export const TAHSILI_SOURCES: (Source & { subjects: TahsiliSubject[] })[] = [
  { id: 't-1', name: 'ناصر عبدالكريم', description: 'شرح شامل لمواد التحصيلي', testType: 'tahsili', subjects: ['math', 'physics', 'chemistry', 'biology'] },
  { id: 't-2', name: 'يلو', description: 'دروس مرئية لجميع المواد', testType: 'tahsili', subjects: ['math', 'physics', 'chemistry', 'biology'] },
  { id: 't-3', name: 'غشام', description: 'مراجعات وتدريبات', testType: 'tahsili', subjects: ['math', 'physics', 'chemistry', 'biology'] },
  { id: 't-4', name: 'إينشتاين', description: 'تأسيس وتدريب متقدم', testType: 'tahsili', subjects: ['math', 'physics', 'chemistry', 'biology'] },
];

export function getSourcesByCategory(testType: TestType, category: SourceCategory): Source[] {
  return QIYAS_SOURCES.filter((s) => s.testType === testType && s.category === category);
}
