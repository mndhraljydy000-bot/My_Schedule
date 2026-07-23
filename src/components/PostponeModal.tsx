import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarClock, AlertTriangle, X, Check } from 'lucide-react';
import { addDaysISO, formatArabicDate } from '../utils/scheduler';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PostponeModal({ open, onClose }: Props) {
  const { schedule, postponeSchedule } = useApp();
  const [days, setDays] = useState(1);

  if (!open || !schedule) return null;

  const newStart = addDaysISO(schedule.startDate, days);
  const newEnd = addDaysISO(schedule.endDate, days);

  const handleConfirm = () => {
    postponeSchedule(days);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="card mx-4 w-full max-w-md animate-pop p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold-400/10 border border-gold-400/30">
              <CalendarClock className="h-5 w-5 text-gold-300" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">تأجيل المهام</h3>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-300 transition-colors hover:bg-ink-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-xl border border-gold-400/30 bg-gold-400/5 p-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-300" />
          <p className="text-xs leading-relaxed text-ink-200">
            سيتم تأجيل جميع مهام الجدول بالكامل للأيام المحددة. سيتغير تاريخ البداية والنهاية لجميع الأيام.
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold text-ink-100">عدد أيام التأجيل</label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-xl border py-3 text-sm font-bold transition-all ${
                  days === d
                    ? 'border-gold-400 bg-gold-400/15 text-gold-300'
                    : 'border-ink-600 bg-ink-800/40 text-ink-200 hover:border-gold-400/30'
                }`}
              >
                {d} {d === 1 ? 'يوم' : 'أيام'}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-ink-600 bg-ink-800/40 p-4">
          <div className="mb-2 text-xs font-bold text-ink-300">معاينة التواريخ الجديدة</div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-300">من</span>
              <span className="font-bold text-white">{formatArabicDate(newStart)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-300">إلى</span>
              <span className="font-bold text-white">{formatArabicDate(newEnd)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            className="btn-gold flex-1"
          >
            <Check className="h-5 w-5" />
            تأكيد التأجيل
          </button>
          <button
            onClick={onClose}
            className="btn-ghost flex-1"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
