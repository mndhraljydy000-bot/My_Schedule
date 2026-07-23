import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { ScheduleDay } from '../data/sources';
import { ARABIC_MONTHS, ARABIC_DAYS_SHORT } from '../data/sources';
import {
  formatArabicDate, formatArabicDateShort, getDayOfWeek, getDayName,
  isToday, isPast, isFuture, hoursUntilTomorrow, getCountdownTo, type Countdown,
} from '../utils/scheduler';
import PomodoroTimer from '../components/PomodoroTimer';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import PostponeModal from '../components/PostponeModal';
import {
  CalendarDays, CheckCircle2, Circle, PlayCircle, FileText,
  Sparkles, Trash2, Layers, TrendingUp, ChevronRight, ChevronLeft,
  Coffee, Lock, AlertCircle, Flame, CheckCheck, Clock, Check, RefreshCw,
  CalendarClock,
} from 'lucide-react';

const TASK_ICONS = { video: PlayCircle, test: FileText, review: RefreshCw } as const;
const TASK_COLORS = { video: 'text-sky-400', test: 'text-gold-300', review: 'text-emerald-400' } as const;

function useLiveCountdown(iso: string | null): Countdown {
  const [countdown, setCountdown] = useState<Countdown>(() => iso ? getCountdownTo(iso) : { days: 0, hours: 0 });
  useEffect(() => {
    if (!iso) { setCountdown({ days: 0, hours: 0 }); return; }
    setCountdown(getCountdownTo(iso));
    const timer = setInterval(() => setCountdown(getCountdownTo(iso)), 1000);
    return () => clearInterval(timer);
  }, [iso]);
  return countdown;
}

export default function MySchedule() {
  const {
    schedule, scheduleConfirmed, confirmSchedule, selectedSources,
    toggleTaskDone, confirmDay, clearSchedule, setPage, generateSchedule,
    inputs, scheduleConfig, progress, completedDays, streak,
    totalTasks, completedTasks, showDeleteWarning, setShowDeleteWarning,
  } = useApp();

  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (schedule) { const [y, m] = schedule.startDate.split('-').map(Number); return { year: y, month: m - 1 }; }
    const now = new Date(); return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [showBlockMsg, setShowBlockMsg] = useState(false);
  const [showPostpone, setShowPostpone] = useState(false);

  useEffect(() => {
    if (schedule) { const [y, m] = schedule.startDate.split('-').map(Number); setCalendarMonth({ year: y, month: m - 1 }); }
  }, [schedule?.startDate]);

  useEffect(() => {
    if (selectedSources.length > 0 && !schedule) {
      const hasValidInput = selectedSources.some((s) => { const inp = inputs[s.id]; return inp && (inp.videos > 0 || inp.tests > 0); });
      if (hasValidInput) generateSchedule(selectedSources[0].testType);
    }
  }, []);

  const dayByDate = useMemo(() => {
    if (!schedule) return {} as Record<string, ScheduleDay>;
    const m: Record<string, ScheduleDay> = {};
    for (const d of schedule.days) m[d.date] = d;
    return m;
  }, [schedule]);

  const totalDays = schedule?.days.length ?? 0;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (!schedule || schedule.days.length === 0) {
    return (
      <div className="animate-fade-in px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-ink-850 border border-ink-700"><CalendarDays className="h-9 w-9 text-ink-400" /></div>
          <h1 className="section-title text-2xl text-white">لا يوجد جدول بعد</h1>
          <p className="mt-3 text-sm text-ink-300">اختر مصادرك من قسم القدرات أو التحصيلي، أدخل بياناتك والتواريخ، ثم ولّد جدولك الذكي.</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button onClick={() => setPage('qiyas')} className="btn-gold"><Sparkles className="h-4 w-4" />ابدأ بالقدرات</button>
            <button onClick={() => setPage('tahsili')} className="btn-sky"><Sparkles className="h-4 w-4" />ابدأ بالتحصيلي</button>
          </div>
        </div>
      </div>
    );
  }

  if (!scheduleConfirmed) {
    return (
      <div className="animate-fade-in px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 text-center"><h1 className="section-title text-3xl text-white sm:text-4xl">تأكيد الجدول</h1><p className="mt-2 text-sm text-ink-300">راجع جدولك ثم اضغط "تأكيد" لبدء المتابعة</p></div>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={Layers} label="المصادر" value={selectedSources.length} color="gold" />
            <StatCard icon={PlayCircle} label="فيديوهات" value={schedule.totalVideos} color="sky" />
            <StatCard icon={FileText} label="اختبارات" value={schedule.totalTests} color="gold" />
            <StatCard icon={CalendarDays} label="أيام دراسة" value={totalDays} color="sky" />
          </div>
          <div className="mb-6 card p-5">
            <div className="mb-3 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-gold-300" /><h2 className="font-display text-lg font-bold text-white">تفاصيل الجدول</h2></div>
            <p className="mb-4 text-sm text-ink-300">من {formatArabicDate(schedule.startDate)} إلى {formatArabicDate(schedule.endDate)}</p>
            <div className="space-y-2">
              {schedule.days.slice(0, 7).map((day) => (
                <div key={day.dayIndex} className={`flex items-center gap-3 rounded-xl border p-3 ${day.isReviewDay ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-ink-700 bg-ink-800/40'}`}>
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink-800 font-display text-xs font-bold text-gold-300">{day.dayIndex + 1}</span>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-ink-200">{formatArabicDateShort(day.date)} - {getDayName(day.date)}</div>
                    <div className="flex items-center gap-2">
                      {day.phase && <span className={`chip ${day.isReviewDay ? 'border-emerald-400/30 text-emerald-400' : 'border-gold-400/30 text-gold-300'}`}>{day.phase}</span>}
                      <span className="text-[11px] text-ink-300">{day.tasks.length} مهمة</span>
                    </div>
                  </div>
                  {day.isReviewDay && <RefreshCw className="h-4 w-4 text-emerald-400" />}
                </div>
              ))}
              {schedule.days.length > 7 && <p className="text-center text-xs text-ink-400">... و {schedule.days.length - 7} أيام أخرى</p>}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={confirmSchedule} className="btn-gold"><CheckCheck className="h-5 w-5" />تأكيد الجدول وبدء المتابعة</button>
            <button onClick={() => { clearSchedule(); setPage('qiyas'); }} className="btn-ghost"><Trash2 className="h-4 w-4 text-red-400" />تعديل المصادر</button>
          </div>
        </div>
      </div>
    );
  }

  const firstDay = new Date(calendarMonth.year, calendarMonth.month, 1);
  const lastDay = new Date(calendarMonth.year, calendarMonth.month + 1, 0);
  const startPad = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const cells: (number | null)[] = [...Array(startPad).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthName = ARABIC_MONTHS[calendarMonth.month];
  const prevMonth = () => setCalendarMonth((p) => { const m = p.month - 1; return m < 0 ? { year: p.year - 1, month: 11 } : { year: p.year, month: m }; });
  const nextMonth = () => setCalendarMonth((p) => { const m = p.month + 1; return m > 11 ? { year: p.year + 1, month: 0 } : { year: p.year, month: m }; });
  const toISO = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const selectedDay = schedule.days[selectedDayIdx];
  const allTasksDone = selectedDay?.tasks.every((t) => t.done) ?? false;
  const isDayFuture = selectedDay ? isFuture(selectedDay.date) : false;
  const isDayToday = selectedDay ? isToday(selectedDay.date) : false;
  const isDayPast = selectedDay ? isPast(selectedDay.date) : false;

  return (
    <div className="animate-fade-in px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 text-center">
          <div className="mb-2 flex items-center justify-center gap-3">
            <h1 className="section-title text-3xl text-white sm:text-4xl">جدول المذاكرة الذكي</h1>
            {streak > 0 && (<div className="flex items-center gap-1.5 rounded-full border border-flame-500/30 bg-flame-500/10 px-3 py-1.5 text-sm font-bold text-flame-400 shadow-glow-flame"><Flame className="h-5 w-5 animate-flame-flicker" />{streak}</div>)}
          </div>
          <p className="text-sm text-ink-300">من {formatArabicDate(schedule.startDate)} إلى {formatArabicDate(schedule.endDate)}</p>
        </div>

        <div className="mb-6 card p-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-gold-300" /><span className="font-display text-base font-bold text-white">شريط التقدم</span></div>
            <div className="flex items-center gap-2 text-sm"><span className="font-bold text-gold-300">{taskProgress}%</span><span className="text-ink-400">({completedTasks}/{totalTasks} مهمة)</span></div>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-ink-800"><div className="h-full rounded-full bg-gradient-to-l from-gold-300 via-gold-400 to-gold-500 transition-all duration-500" style={{ width: `${taskProgress}%` }} /></div>
          <div className="mt-2 flex items-center justify-between text-xs text-ink-300"><span>{completedDays} / {totalDays} يوم مكتمل</span><span>{progress}% إنجاز كلي</span></div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Layers} label="المصادر" value={selectedSources.length} color="gold" />
          <StatCard icon={PlayCircle} label="فيديوهات" value={schedule.totalVideos} color="sky" />
          <StatCard icon={FileText} label="اختبارات" value={schedule.totalTests} color="gold" />
          <StatCard icon={TrendingUp} label="نسبة الإنجاز" value={`${progress}%`} color="sky" />
        </div>

        {scheduleConfig.offDays.length > 0 && (<div className="mb-4 flex items-center gap-2 text-xs text-ink-300"><Coffee className="h-4 w-4 text-gold-300" /><span>أيام الإجازة: {scheduleConfig.offDays.map((d) => ARABIC_DAYS_SHORT[d]).join('، ')}</span></div>)}

        <div className="mb-4 flex justify-end">
          <button onClick={() => setShowPostpone(true)} className="btn-ghost">
            <CalendarClock className="h-4 w-4 text-gold-300" />
            تأجيل المهام
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="card overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-ink-700 bg-ink-850/80 px-5 py-4">
                <button onClick={prevMonth} className="grid h-9 w-9 place-items-center rounded-lg border border-ink-600 bg-ink-800/50 text-ink-200 transition-all hover:border-gold-400/40 hover:text-gold-300"><ChevronRight className="h-5 w-5" /></button>
                <h2 className="font-display text-lg font-bold text-white">{monthName} {calendarMonth.year}</h2>
                <button onClick={nextMonth} className="grid h-9 w-9 place-items-center rounded-lg border border-ink-600 bg-ink-800/50 text-ink-200 transition-all hover:border-gold-400/40 hover:text-gold-300"><ChevronLeft className="h-5 w-5" /></button>
              </div>
              <div className="grid grid-cols-7 border-b border-ink-700 bg-ink-800/30">{ARABIC_DAYS_SHORT.map((d) => (<div key={d} className="py-2.5 text-center text-[11px] font-bold text-ink-300">{d}</div>))}</div>
              <div className="grid grid-cols-7">
                {cells.map((dayNum, i) => {
                  if (dayNum === null) return <div key={i} className="min-h-[64px] border-b border-l border-ink-800/40" />;
                  const iso = toISO(calendarMonth.year, calendarMonth.month, dayNum);
                  const schedDay = dayByDate[iso];
                  const dow = getDayOfWeek(iso);
                  const isOff = scheduleConfig.offDays.includes(dow);
                  const today = isToday(iso);
                  const past = isPast(iso);
                  const hasTasks = schedDay && schedDay.tasks.length > 0;
                  const allDone = schedDay?.done;
                  const isReview = schedDay?.isReviewDay;
                  return (
                    <button key={i} onClick={() => { if (schedDay) { const idx = schedule.days.findIndex((d) => d.date === iso); if (idx >= 0) setSelectedDayIdx(idx); } }}
                      className={`relative min-h-[64px] border-b border-l border-ink-800/40 p-1.5 text-right transition-colors ${schedDay ? 'cursor-pointer hover:bg-ink-800/40' : 'cursor-default'} ${today ? 'ring-2 ring-gold-400/50 ring-inset' : ''} ${isReview ? 'bg-emerald-400/5' : ''}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${today ? 'text-gold-300' : isOff ? 'text-ink-400' : 'text-ink-200'}`}>{dayNum}</span>
                        {allDone && <CheckCircle2 className="h-3.5 w-3.5 text-gold-400" />}
                        {isReview && !allDone && <RefreshCw className="h-3 w-3 text-emerald-400" />}
                      </div>
                      {hasTasks && (<div className="mt-1 flex flex-wrap gap-0.5">{schedDay.tasks.slice(0, 4).map((t) => (<span key={t.id} className={`h-1.5 w-1.5 rounded-full ${t.done ? 'bg-gold-400' : t.type === 'review' ? 'bg-emerald-400/60' : 'bg-sky-400/60'}`} />))}</div>)}
                      {isOff && !hasTasks && (<div className="mt-0.5 text-[9px] text-ink-400">إجازة</div>)}
                      {past && !isOff && !hasTasks && !schedDay && (<div className="mt-0.5 text-[9px] text-ink-500/50">—</div>)}
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-ink-700 bg-ink-850/80 px-5 py-3 text-center"><p className="text-[11px] text-ink-400">منظومة المذاكرة — جدولك الذكي للقدرات والتحصيلي</p></div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-gold-300" /><div><div className="font-display text-base font-bold text-white">{selectedDay ? formatArabicDateShort(selectedDay.date) : '—'}</div><div className="text-[11px] text-ink-300">{selectedDay ? getDayName(selectedDay.date) : ''}</div></div></div>
                <div className="flex items-center gap-2">
                  {selectedDay?.phase && <span className={`chip ${selectedDay.isReviewDay ? 'border-emerald-400/30 text-emerald-400' : 'border-gold-400/30 text-gold-300'}`}>{selectedDay.phase}</span>}
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-800 font-display text-sm font-bold text-gold-300">{selectedDay ? selectedDay.dayIndex + 1 : '—'}</span>
                </div>
              </div>

              {selectedDay && selectedDay.tasks.length > 0 ? (
                <>
                  <div className="space-y-1.5">
                    {selectedDay.tasks.map((task) => {
                      const Icon = TASK_ICONS[task.type];
                      const color = TASK_COLORS[task.type];
                      const isDayLocked = selectedDay.done;
                      const isTaskLocked = isDayLocked || isDayFuture;
                      return (
                        <div key={task.id} className={`flex items-center gap-2.5 rounded-lg border p-2.5 transition-all ${task.done ? 'border-gold-400/30 bg-gold-400/5' : task.type === 'review' ? 'border-emerald-400/20 bg-emerald-400/5' : 'border-ink-700 bg-ink-800/30'}`}>
                          {isTaskLocked ? (
                            <div className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-md border border-ink-600 bg-ink-800/50">
                              {task.done ? <CheckCircle2 className="h-5 w-5 text-gold-400" /> : <Lock className="h-3.5 w-3.5 text-ink-500" />}
                            </div>
                          ) : (
                            <button onClick={() => toggleTaskDone(selectedDay.dayIndex, task.id)} className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-md border transition-all">
                              {task.done ? <CheckCircle2 className="h-6 w-6 text-gold-400" /> : <Circle className="h-6 w-6 text-ink-500 hover:text-ink-300" />}
                            </button>
                          )}
                          <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />
                          <span className={`flex-1 text-xs ${task.done ? 'text-ink-300 line-through' : 'text-ink-100'}`}>{task.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {(() => { const dt = selectedDay.tasks.length; const dd = selectedDay.tasks.filter((t) => t.done).length; const dp = dt > 0 ? (dd / dt) * 100 : 0; return (
                    <div className="mt-3"><div className="mb-1 flex items-center justify-between text-[11px] text-ink-300"><span>إنجاز اليوم</span><span>{dd}/{dt}</span></div><div className="h-2 overflow-hidden rounded-full bg-ink-800"><div className="h-full rounded-full bg-gradient-to-l from-gold-300 to-gold-500 transition-all duration-300" style={{ width: `${dp}%` }} /></div></div>
                  );})()}

                  {selectedDay.done ? (
                    <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-gold-400/40 bg-gold-400/10 py-3 text-sm font-bold text-gold-300"><CheckCircle2 className="h-5 w-5" />تم إنجاز هذا اليوم</div>
                  ) : isDayFuture ? (
                    <FutureDayCountdown iso={selectedDay.date} />
                  ) : isDayToday && allTasksDone ? (
                    <button onClick={() => confirmDay(selectedDay.dayIndex)} className="mt-3 w-full rounded-xl bg-gradient-to-b from-gold-300 to-gold-500 py-3 text-sm font-bold text-ink-950 shadow-glow-gold transition-all hover:from-gold-200 hover:to-gold-400 hover:-translate-y-0.5"><CheckCheck className="ml-1 inline h-5 w-5" />تأكيد إنجاز اليوم</button>
                  ) : isDayToday && !allTasksDone ? (
                    <div className="mt-3 rounded-xl border border-ink-600 bg-ink-800/40 py-2.5 text-center text-xs text-ink-300">أكد إنجاز جميع المهام لتأكيد اليوم</div>
                  ) : isDayPast && !selectedDay.done ? (
                    <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-gold-400/30 bg-gold-400/5 py-2.5 text-xs font-bold text-gold-300"><Clock className="h-4 w-4" />يوم سابق — يمكنك تأكيده الآن</div>
                  ) : null}

                  <div className="mt-4 flex items-center justify-between border-t border-ink-700/50 pt-3">
                    <button onClick={() => setSelectedDayIdx((i) => Math.max(0, i - 1))} disabled={selectedDayIdx === 0} className="flex items-center gap-1 text-xs font-bold text-ink-300 transition-colors hover:text-gold-300 disabled:opacity-30"><ChevronRight className="h-4 w-4" />السابق</button>
                    <span className="text-[11px] text-ink-400">{selectedDayIdx + 1} / {totalDays}</span>
                    <button onClick={() => { if (selectedDay && !selectedDay.done) setShowBlockMsg(true); else setSelectedDayIdx((i) => Math.min(totalDays - 1, i + 1)); }} disabled={selectedDayIdx >= totalDays - 1} className="flex items-center gap-1 text-xs font-bold text-gold-300 transition-colors hover:text-gold-200 disabled:opacity-30">التالي<ChevronLeft className="h-4 w-4" /></button>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center"><Coffee className="mx-auto mb-2 h-8 w-8 text-ink-500" /><p className="text-sm text-ink-300">لا توجد مهام في هذا اليوم</p></div>
              )}
            </div>

            <PomodoroTimer />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <button onClick={() => setShowDeleteWarning(true)} className="btn-ghost w-full sm:w-auto"><Trash2 className="h-4 w-4 text-red-400" />حذف الجدول</button>
        </div>

        {progress === 100 && (<div className="mt-6 animate-pop"><div className="card flex items-center justify-center gap-3 border-gold-400/40 bg-gold-400/5 p-5 text-center"><CheckCircle2 className="h-7 w-7 text-gold-400" /><p className="font-display text-lg font-bold text-white">أحسنت! أكملت جميع أيام الجدول</p></div></div>)}

        {showBlockMsg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowBlockMsg(false)}>
            <div className="card mx-4 max-w-sm animate-pop p-6 text-center" onClick={(e) => e.stopPropagation()}>
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-gold-400/10 border border-gold-400/30"><AlertCircle className="h-7 w-7 text-gold-300" /></div>
              <h3 className="mb-2 font-display text-lg font-bold text-white">لم تؤكد إنجاز هذا اليوم</h3>
              <p className="mb-4 text-sm text-ink-300">لا يمكن الانتقال لليوم التالي حتى تؤكد إنجاز مهام اليوم الحالي.</p>
              <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 py-2.5 text-xs text-sky-300"><Clock className="h-4 w-4" /><span>باقي حوالي {hoursUntilTomorrow()} ساعة على اليوم التالي</span></div>
              <button onClick={() => setShowBlockMsg(false)} className="btn-gold w-full"><Check className="h-5 w-5" />حسناً</button>
            </div>
          </div>
        )}

        <DeleteConfirmDialog
          open={showDeleteWarning}
          onClose={() => setShowDeleteWarning(false)}
          onConfirm={() => { clearSchedule(); setShowDeleteWarning(false); setPage('home'); }}
          title="حذف الجدول"
          message="هل أنت متأكد من حذف الجدول؟ سيتم حذف جميع المهام والتقدم والشعلة. لا يمكن التراجع عن هذا الإجراء."
        />

        <PostponeModal open={showPostpone} onClose={() => setShowPostpone(false)} />
      </div>
    </div>
  );
}

function FutureDayCountdown({ iso }: { iso: string }) {
  const countdown = useLiveCountdown(iso);
  const parts: string[] = [];
  if (countdown.days > 0) parts.push(`${countdown.days} ${countdown.days === 1 ? 'يوم' : 'يوم'}`);
  if (countdown.hours > 0) parts.push(`${countdown.hours} ${countdown.hours === 1 ? 'ساعة' : 'ساعة'}`);
  const display = parts.length > 0 ? parts.join(' و') : 'أقل من ساعة';

  return (
    <div className="mt-3 rounded-xl border border-sky-400/30 bg-sky-400/10 py-3 text-center">
      <div className="flex items-center justify-center gap-2 text-sm font-bold text-sky-300"><Clock className="h-5 w-5" />هذا اليوم لم يحن بعد</div>
      <p className="mt-1 text-xs text-sky-200/80">يفتح خلال {display}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Layers; label: string; value: string | number; color: 'gold' | 'sky' }) {
  const colorClass = color === 'gold' ? 'text-gold-300' : 'text-sky-400';
  const bgClass = color === 'gold' ? 'from-gold-300/10 to-gold-500/5' : 'from-sky-400/10 to-sky-600/5';
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${bgClass} border border-ink-600/50`}><Icon className={`h-5 w-5 ${colorClass}`} /></div>
      <div><div className="text-xs text-ink-300">{label}</div><div className="font-display text-xl font-bold text-white">{value}</div></div>
    </div>
  );
}
