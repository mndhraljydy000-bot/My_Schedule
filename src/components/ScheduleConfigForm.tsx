import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarDays, Clock, Coffee, RefreshCw, Calendar, Layers, Hash, AlertCircle, X, ArrowUp, ArrowDown, ListOrdered } from 'lucide-react';
import { ARABIC_DAYS_SHORT, TAHSILI_SUBJECTS } from '../data/sources';
import type { ReviewMode } from '../data/sources';
import { todayISO } from '../utils/scheduler';

const DAY_INDICES = [0, 1, 2, 3, 4, 5, 6];
const MAX_OFF_DAYS = 1;
const MAX_REVIEW_DAYS = 2;

const REVIEW_MODES: { mode: ReviewMode; label: string; icon: typeof RefreshCw; desc: string }[] = [
  { mode: 'weekly-days', label: 'أيام محددة من الأسبوع', icon: Calendar, desc: 'خصص أياماً معينة للمراجعة (مثلاً: كل خميس وجمعة)' },
  { mode: 'interval-days', label: 'بعد عدد أيام متتالية', icon: Hash, desc: 'يوم مراجعة بعد كل N أيام مذاكرة' },
  { mode: 'phase-end', label: 'مراجعة مرحلية تلقائية', icon: Layers, desc: 'مراجعة تلقائية بعد انتهاء كل مرحلة/مادة' },
];

export default function ScheduleConfigForm({ showSubjectOrder = false }: { showSubjectOrder?: boolean }) {
  const { scheduleConfig, setScheduleConfig, reviewConfig, setReviewConfig, selectedSources, tahsiliSubjectOrder, setTahsiliSubjectOrder } = useApp();
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const alertTimer = useRef<number | undefined>(undefined);

  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    if (alertTimer.current) window.clearTimeout(alertTimer.current);
    alertTimer.current = window.setTimeout(() => setAlertMsg(null), 4000);
  };

  const toggleOffDay = (dow: number) => {
    if (scheduleConfig.offDays.includes(dow)) {
      setScheduleConfig({ offDays: scheduleConfig.offDays.filter((d) => d !== dow) });
    } else {
      if (scheduleConfig.offDays.length >= MAX_OFF_DAYS) {
        showAlert('لا يمكن اختيار أكثر من يوم إجازة واحد في الأسبوع');
        return;
      }
      if (reviewConfig.enabled && reviewConfig.mode === 'weekly-days' && reviewConfig.weeklyDays.includes(dow)) {
        showAlert(`لا يمكن اختيار "${ARABIC_DAYS_SHORT[dow]}" كيوم إجازة لأنه مُحدد كيوم مراجعة. احذفه من أيام المراجعة أولاً.`);
        return;
      }
      setScheduleConfig({ offDays: [...scheduleConfig.offDays, dow].sort() });
    }
  };

  const tahsiliSubjects = selectedSources.filter((s) => s.testType === 'tahsili');
  const orderedSubjects = tahsiliSubjectOrder.length > 0
    ? tahsiliSubjectOrder.map(id => tahsiliSubjects.find(s => s.id === id)).filter(Boolean)
    : tahsiliSubjects;
  const moveSubject = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= orderedSubjects.length) return;
    const ids = orderedSubjects.map(s => s.id);
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    setTahsiliSubjectOrder(ids);
  };

  const toggleWeeklyReviewDay = (dow: number) => {
    if (reviewConfig.weeklyDays.includes(dow)) {
      setReviewConfig({ weeklyDays: reviewConfig.weeklyDays.filter((d) => d !== dow) });
    } else {
      if (reviewConfig.weeklyDays.length >= MAX_REVIEW_DAYS) {
        showAlert('لا يمكن اختيار أكثر من يومين للمراجعة في الأسبوع');
        return;
      }
      if (scheduleConfig.offDays.includes(dow)) {
        showAlert(`لا يمكن اختيار "${ARABIC_DAYS_SHORT[dow]}" كيوم مراجعة لأنه مُحدد كيوم إجازة. احذفه من أيام الإجازة أولاً.`);
        return;
      }
      setReviewConfig({ weeklyDays: [...reviewConfig.weeklyDays, dow].sort() });
    }
  };

  return (
    <div className="space-y-4">
      {alertMsg && (
        <div className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 animate-fade-up">
          <div className="flex items-center gap-2.5 rounded-xl border border-gold-400/40 bg-ink-850 px-5 py-3.5 shadow-glow-gold">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-gold-300" />
            <p className="text-sm font-bold text-gold-100">{alertMsg}</p>
            <button onClick={() => setAlertMsg(null)} className="grid h-6 w-6 place-items-center rounded-md text-ink-300 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      <div className="card animate-fade-up p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-gold-300/10 to-gold-500/5 border border-gold-400/30"><CalendarDays className="h-5 w-5 text-gold-300" /></div>
          <h3 className="font-display text-lg font-bold text-white">إعدادات الجدول الزمني</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-200"><Clock className="h-3.5 w-3.5 text-sky-400" />تاريخ البداية</label><input type="date" min={todayISO()} value={scheduleConfig.startDate} onChange={(e) => setScheduleConfig({ startDate: e.target.value })} className="input-field" /></div>
          <div><label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-200"><Clock className="h-3.5 w-3.5 text-gold-300" />تاريخ النهاية</label><input type="date" min={scheduleConfig.startDate} value={scheduleConfig.endDate} onChange={(e) => setScheduleConfig({ endDate: e.target.value })} className="input-field" /></div>
        </div>
        <div className="mt-4">
          <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-ink-200"><Coffee className="h-3.5 w-3.5 text-gold-300" />أيام الإجازة الأسبوعية (اضغط للاختيار — يوم واحد كحد أقصى)</label>
          <div className="flex flex-wrap gap-2">
            {DAY_INDICES.map((dow) => { const isOff = scheduleConfig.offDays.includes(dow); return (
              <button key={dow} onClick={() => toggleOffDay(dow)} className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${isOff ? 'border-gold-400/50 bg-gold-400/10 text-gold-300' : 'border-ink-600 bg-ink-800/50 text-ink-200 hover:border-ink-500'}`}>{ARABIC_DAYS_SHORT[dow]}</button>
            );})}
          </div>
          <p className="mt-2 text-[11px] text-ink-400">{scheduleConfig.offDays.length > 0 ? `الأيام المختارة كإجازة: ${scheduleConfig.offDays.map((d) => ARABIC_DAYS_SHORT[d]).join('، ')}` : 'لا توجد أيام إجازة — ستذاكر كل أيام الأسبوع'}</p>
        </div>
      </div>

      {showSubjectOrder && orderedSubjects.length > 0 && (
        <div className="card animate-fade-up p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-sky-400/10 to-sky-600/5 border border-sky-400/30"><ListOrdered className="h-5 w-5 text-sky-400" /></div>
            <h3 className="font-display text-lg font-bold text-white">ترتيب المواد</h3>
          </div>
          <p className="mb-3 text-xs text-ink-300">رتب المواد حسب تفضيلك — الجدول سيبدأ بالمادة الأولى</p>
          <div className="space-y-2">
            {orderedSubjects.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-ink-700 bg-ink-800/40 p-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-sky-400/15 font-display text-sm font-bold text-sky-300">{i + 1}</span>
                  <span className="text-sm font-bold text-white">{s.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveSubject(i, -1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded-lg border border-ink-600 bg-ink-800/50 text-ink-200 transition-all hover:border-sky-400/40 hover:text-sky-300 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                  <button onClick={() => moveSubject(i, 1)} disabled={i === orderedSubjects.length - 1} className="grid h-8 w-8 place-items-center rounded-lg border border-ink-600 bg-ink-800/50 text-ink-200 transition-all hover:border-sky-400/40 hover:text-sky-300 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card animate-fade-up p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-400/10 to-emerald-500/5 border border-emerald-400/30"><RefreshCw className="h-5 w-5 text-emerald-400" /></div>
          <h3 className="font-display text-lg font-bold text-white">أيام المراجعة</h3>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => setReviewConfig({ enabled: !reviewConfig.enabled, mode: !reviewConfig.enabled ? 'weekly-days' : 'none' })}
            className={`relative h-7 w-12 rounded-full transition-colors ${reviewConfig.enabled ? 'bg-emerald-500' : 'bg-ink-600'}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${reviewConfig.enabled ? 'right-1' : 'right-6'}`} />
          </button>
          <span className="text-sm font-bold text-ink-200">{reviewConfig.enabled ? 'المراجعة مفعّلة' : 'هل تريد أيام مراجعة؟'}</span>
        </div>

        {reviewConfig.enabled && (
          <div className="animate-fade-in space-y-3">
            <p className="text-xs text-ink-300">كيف تفضل جدولة أيام المراجعة؟</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {REVIEW_MODES.map((m) => { const Icon = m.icon; const selected = reviewConfig.mode === m.mode; return (
                <button key={m.mode} onClick={() => setReviewConfig({ mode: m.mode })}
                  className={`rounded-xl border p-4 text-right transition-all ${selected ? 'border-emerald-400/50 bg-emerald-400/10 shadow-glow-emerald' : 'border-ink-700 bg-ink-800/40 hover:border-ink-500'}`}>
                  <div className="mb-1.5 flex items-center gap-2"><Icon className={`h-4 w-4 ${selected ? 'text-emerald-400' : 'text-ink-300'}`} /><span className={`text-sm font-bold ${selected ? 'text-emerald-400' : 'text-ink-200'}`}>{m.label}</span></div>
                  <p className="text-[11px] leading-relaxed text-ink-300">{m.desc}</p>
                </button>
              );})}
            </div>

            {reviewConfig.mode === 'weekly-days' && (
              <div className="animate-fade-in rounded-xl border border-ink-700 bg-ink-800/40 p-4">
                <label className="mb-2 block text-xs font-bold text-ink-200">اختر أيام المراجعة الأسبوعية (يومين كحد أقصى):</label>
                <div className="flex flex-wrap gap-2">
                  {DAY_INDICES.map((dow) => { const isReview = reviewConfig.weeklyDays.includes(dow); return (
                    <button key={dow} onClick={() => toggleWeeklyReviewDay(dow)} className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${isReview ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-400' : 'border-ink-600 bg-ink-800/50 text-ink-200 hover:border-ink-500'}`}>{ARABIC_DAYS_SHORT[dow]}</button>
                  );})}
                </div>
                <p className="mt-2 text-[11px] text-ink-400">{reviewConfig.weeklyDays.length > 0 ? `الأيام المختارة للمراجعة: ${reviewConfig.weeklyDays.map((d) => ARABIC_DAYS_SHORT[d]).join('، ')}` : 'لم تختر أيام مراجعة بعد'}</p>
              </div>
            )}

            {reviewConfig.mode === 'interval-days' && (
              <div className="animate-fade-in rounded-xl border border-ink-700 bg-ink-800/40 p-4">
                <label className="mb-1.5 block text-xs font-bold text-ink-200">يوم مراجعة واحد بعد كل:</label>
                <div className="flex items-center gap-2"><input type="number" min={1} max={30} value={reviewConfig.intervalDays} onChange={(e) => setReviewConfig({ intervalDays: Math.max(1, Number(e.target.value)) })} className="input-field w-24" /><span className="text-sm text-ink-200">أيام مذاكرة متتالية</span></div>
                <p className="mt-2 text-[11px] text-ink-400">مثلاً: 10 يعني يوم مراجعة بعد كل 10 أيام مذاكرة</p>
              </div>
            )}

            {reviewConfig.mode === 'phase-end' && (
              <div className="animate-fade-in space-y-3">
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4">
                  <p className="text-xs text-emerald-400">سيقوم النظام تلقائياً بوضع أيام مراجعة:<br />• للقدرات: بعد انتهاء مرحلة "التأسيس" بالكامل وقبل بدء "التدريب"<br />• للتحصيلي: بعد الانتهاء من كل مادة بالكامل وقبل الانتقال للتالية</p>
                </div>
                <div className="rounded-xl border border-ink-700 bg-ink-800/40 p-4">
                  <label className="mb-1.5 block text-xs font-bold text-ink-200">عدد أيام المراجعة بعد كل مرحلة/مادة:</label>
                  <div className="flex items-center gap-2"><input type="number" min={1} max={30} value={reviewConfig.phaseReviewDays} onChange={(e) => setReviewConfig({ phaseReviewDays: Math.max(1, Number(e.target.value)) })} className="input-field w-24" /><span className="text-sm text-ink-200">أيام مراجعة</span></div>
                  <p className="mt-2 text-[11px] text-ink-400">مثلاً: 5 يعني 5 أيام مراجعة بعد إنهاء الرياضيات قبل بدء الفيزياء، أو بعد التأسيس قبل التدريب</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
