import type {
  SourceInput, GeneratedSchedule, ScheduleDay, GranularTask,
  ReviewConfig, TestType,
} from '../data/sources';

export interface SchedulerInput {
  sourceId: string;
  sourceName: string;
  input: SourceInput;
  category?: string;
  subjectLabel?: string;
}

export interface ScheduleOptions {
  startDate: string;
  endDate: string;
  offDays: number[];
  reviewConfig: ReviewConfig;
  testType: TestType;
}

function parseDate(iso: string): Date { const [y,m,d] = iso.split('-').map(Number); return new Date(y, m-1, d); }
function toISO(d: Date): string { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

let taskCounter = 0;
function nextTaskId(): string { return `g${taskCounter++}`; }

function distributeAcrossDays(total: number, days: number): number[] {
  if (days <= 0 || total <= 0) return [];
  const perDay: number[] = [];
  let remaining = total;
  for (let i = 0; i < days; i++) {
    const left = days - i;
    const count = Math.ceil(remaining / left);
    perDay.push(count);
    remaining -= count;
  }
  return perDay;
}



function generateStudyDates(start: Date, end: Date, offDays: number[]): string[] {
  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    if (!offDays.includes(cursor.getDay())) dates.push(toISO(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

interface SourcePlan {
  source: SchedulerInput;
  totalVideos: number;
  totalTests: number;
  days: number;
  videoPerDay: number[];
  testPerDay: number[];
}

interface PhasePlan {
  label: string;
  sources: SourcePlan[];
  totalDays: number;
  subjectLabel?: string;
}

export function generateSchedule(
  sources: SchedulerInput[],
  options: ScheduleOptions,
): GeneratedSchedule {
  const start = parseDate(options.startDate);
  const end = parseDate(options.endDate);
  const studyDates = generateStudyDates(start, end, options.offDays);
  const { reviewConfig, testType } = options;

  // Build phases
  const phases: { label: string; sources: SchedulerInput[]; subjectLabel?: string }[] = [];

  if (testType === 'qiyas') {
    const foundation = sources.filter((s) => s.category === 'foundation');
    if (foundation.length > 0) phases.push({ label: 'التأسيس', sources: foundation });
    const training = sources.filter((s) => s.category === 'training-quant' || s.category === 'training-verbal');
    if (training.length > 0) phases.push({ label: 'التدريب', sources: training });
  } else {
    const subjectOrder: string[] = [];
    const bySubject: Record<string, SchedulerInput[]> = {};
    for (const s of sources) {
      const lbl = s.subjectLabel || s.sourceName;
      if (!bySubject[lbl]) { bySubject[lbl] = []; subjectOrder.push(lbl); }
      bySubject[lbl].push(s);
    }
    for (const lbl of subjectOrder) {
      phases.push({ label: lbl, sources: bySubject[lbl], subjectLabel: lbl });
    }
  }

  // Calculate review days to reserve
  const numPhases = phases.length;
  let totalReviewDays = 0;
  if (reviewConfig.enabled && reviewConfig.mode === 'phase-end') {
    totalReviewDays = Math.max(0, (numPhases - 1) * Math.max(1, reviewConfig.phaseReviewDays));
  }
  const availableStudyDays = Math.max(1, studyDates.length - totalReviewDays);
  const perPhaseDays = Math.max(1, Math.floor(availableStudyDays / Math.max(1, numPhases)));

  // Build phase plans — distribute tasks across available days
  const phasePlans: PhasePlan[] = phases.map((phase) => {
    const srcPlans: SourcePlan[] = phase.sources.map((s) => {
      const tv = Math.max(0, Math.floor(s.input.videos));
      const tt = Math.max(0, Math.floor(s.input.tests));
      const days = perPhaseDays;
      return {
        source: s, totalVideos: tv, totalTests: tt, days,
        videoPerDay: distributeAcrossDays(tv, days),
        testPerDay: distributeAcrossDays(tt, days),
      };
    });
    const maxDays = Math.max(1, ...srcPlans.map((p) => p.days));
    return { label: phase.label, sources: srcPlans, totalDays: maxDays, subjectLabel: phase.subjectLabel };
  });

  // Compute total study days needed across all phases (+ phase-end review days)
  // Since tasks distribute across available days, the only constraint is having
  // at least 1 study day per phase + review days
  let totalNeededDays = 0;
  for (let pi = 0; pi < phasePlans.length; pi++) {
    if (reviewConfig.enabled && reviewConfig.mode === 'phase-end' && pi > 0) {
      totalNeededDays += Math.max(1, reviewConfig.phaseReviewDays);
    }
    totalNeededDays += 1; // at least 1 study day per phase
  }

  // Check if the date range is sufficient
  if (studyDates.length < totalNeededDays) {
    return {
      startDate: options.startDate,
      endDate: options.endDate,
      days: [],
      totalStudyDays: 0,
      totalVideos: 0,
      totalTests: 0,
      totalGranularTasks: 0,
      error: `الخطة تحتاج ${totalNeededDays} يوم دراسة، لكن النطاق الزمني المحدد يوفر ${studyDates.length} يوم فقط. الرجاء توسيع نطاق التواريخ أو تقليل عدد المهام أو أيام المراجعة.`,
    };
  }

  // Assign tasks to dates, inserting review days
  const days: ScheduleDay[] = [];
  let dateIdx = 0;
  let studyDayCounter = 0;
  let videosCompletedSoFar = 0;

  for (let phaseIdx = 0; phaseIdx < phasePlans.length; phaseIdx++) {
    const phase = phasePlans[phaseIdx];

    // Phase-end review: insert review day before this phase (except first)
    if (reviewConfig.enabled && reviewConfig.mode === 'phase-end' && phaseIdx > 0) {
      const prevPhase = phasePlans[phaseIdx - 1];
      const reviewDays = Math.max(1, reviewConfig.phaseReviewDays);
      for (let r = 0; r < reviewDays && dateIdx < studyDates.length; r++) {
        days.push({
          dayIndex: days.length,
          date: studyDates[dateIdx],
          tasks: [{
            id: nextTaskId(),
            sourceId: 'review',
            sourceName: prevPhase.subjectLabel || prevPhase.label,
            type: 'review',
            label: `مراجعة مرحلية - ${prevPhase.subjectLabel || prevPhase.label} (يوم ${r + 1}/${reviewDays})`,
            done: false,
          }],
          done: false,
          isReviewDay: true,
          phase: 'مراجعة مرحلية',
        });
        dateIdx++;
        studyDayCounter++;
      }
    }

    for (let dayInPhase = 0; dayInPhase < phase.totalDays; dayInPhase++) {
      if (dateIdx >= studyDates.length) break;

      // Check review day (non-phase-end modes)
      let isReview = false;
      if (reviewConfig.enabled && reviewConfig.mode !== 'phase-end') {
        switch (reviewConfig.mode) {
          case 'weekly-days': {
            const dow = parseDate(studyDates[dateIdx]).getDay();
            isReview = reviewConfig.weeklyDays.includes(dow);
            break;
          }
          case 'interval-days': {
            const interval = Math.max(1, reviewConfig.intervalDays);
            isReview = studyDayCounter > 0 && studyDayCounter % interval === 0;
            break;
          }
          case 'interval-tasks': {
            const interval = Math.max(1, reviewConfig.intervalTasks);
            isReview = videosCompletedSoFar > 0 && videosCompletedSoFar % interval === 0;
            break;
          }
        }
      }

      if (isReview) {
        days.push({
          dayIndex: days.length,
          date: studyDates[dateIdx],
          tasks: [{
            id: nextTaskId(),
            sourceId: 'review',
            sourceName: phase.subjectLabel || phase.label,
            type: 'review',
            label: `يوم مراجعة - مراجعة عامة`,
            done: false,
          }],
          done: false,
          isReviewDay: true,
          phase: 'مراجعة',
        });
        dateIdx++;
        studyDayCounter++;
        dayInPhase--;
        continue;
      }

      // Normal study day — build granular tasks
      const dayTasks: GranularTask[] = [];
      for (const sp of phase.sources) {
        if (dayInPhase >= sp.days) continue;
        const vCount = sp.videoPerDay[dayInPhase] || 0;
        const tCount = sp.testPerDay[dayInPhase] || 0;
        if (vCount === 0 && tCount === 0) continue;

        // Compute video numbering: sum of videos in previous days of this source
        let videoStart = 1;
        for (let d = 0; d < dayInPhase; d++) videoStart += sp.videoPerDay[d] || 0;
        let testStart = 1;
        for (let d = 0; d < dayInPhase; d++) testStart += sp.testPerDay[d] || 0;

        for (let v = 0; v < vCount; v++) {
          dayTasks.push({
            id: nextTaskId(),
            sourceId: sp.source.sourceId,
            sourceName: sp.source.sourceName,
            type: 'video',
            label: `مشاهدة الفيديو ${videoStart + v} - ${sp.source.sourceName}`,
            done: false,
          });
          videosCompletedSoFar++;
        }
        for (let t = 0; t < tCount; t++) {
          dayTasks.push({
            id: nextTaskId(),
            sourceId: sp.source.sourceId,
            sourceName: sp.source.sourceName,
            type: 'test',
            label: `حل الاختبار ${testStart + t} - ${sp.source.sourceName}`,
            done: false,
          });
        }
      }

      if (dayTasks.length > 0) {
        days.push({
          dayIndex: days.length,
          date: studyDates[dateIdx],
          tasks: dayTasks,
          done: false,
          isReviewDay: false,
          phase: phase.label,
          subjectLabel: phase.subjectLabel,
        });
      }
      dateIdx++;
      studyDayCounter++;
    }
  }

  const activeDays = days.filter((d) => d.tasks.length > 0);
  const totalVideos = phasePlans.reduce((s, p) => s + p.sources.reduce((ss, sp) => ss + sp.totalVideos, 0), 0);
  const totalTests = phasePlans.reduce((s, p) => s + p.sources.reduce((ss, sp) => ss + sp.totalTests, 0), 0);
  const totalGranularTasks = activeDays.reduce((s, d) => s + d.tasks.length, 0);

  return {
    startDate: options.startDate,
    endDate: options.endDate,
    days: activeDays,
    totalStudyDays: activeDays.length,
    totalVideos,
    totalTests,
    totalGranularTasks,
  };
}

// ── Calendar helpers ──
export const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
export const ARABIC_DAYS_SHORT = ['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
export const ARABIC_DAYS_FULL = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

export function formatArabicDate(iso: string): string { const d = parseDate(iso); return `${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]} ${d.getFullYear()}`; }
export function formatArabicDateShort(iso: string): string { const d = parseDate(iso); return `${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]}`; }
export function getDayOfWeek(iso: string): number { return parseDate(iso).getDay(); }
export function getDayName(iso: string): string { return ARABIC_DAYS_FULL[getDayOfWeek(iso)]; }
export function isToday(iso: string): boolean { return toISO(new Date()) === iso; }
export function isPast(iso: string): boolean { return iso < toISO(new Date()); }

export function hoursUntilTomorrow(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
}
