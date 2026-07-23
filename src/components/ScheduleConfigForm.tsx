import { todayISO } from '../utils/scheduler';
import { CalendarDays, Clock, Coffee } from 'lucide-react';
import type { ScheduleConfig } from '../data/sources';
import { ARABIC_DAYS_SHORT } from '../data/sources';

interface Props {
  config: ScheduleConfig;
  onChange: (data: Partial<ScheduleConfig>) => void;
}

export default function ScheduleConfigForm({ config, onChange }: Props) {
  const today = todayISO();
  const minEnd = config.startDate || today;

  const toggleOffDay = (day: number) => {
    const offDays = config.offDays.includes(day)
      ? config.offDays.filter((d) => d !== day)
      : [...config.offDays, day];
    onChange({ offDays });
  };

  return (
    <div className="mb-6">
      <h2 className="mb-3 font-display text-lg font-bold text-white">٣. التواريخ والإعدادات</h2>
      <div className="card p-5">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-200">
              <CalendarDays className="h-4 w-4 text-gold-300" />
              تاريخ البداية
            </label>
            <input
              type="date"
              value={config.startDate}
              min={today}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="w-full rounded-lg border border-ink-600 bg-ink-800/50 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-gold-400/50"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-200">
              <CalendarDays className="h-4 w-4 text-gold-300" />
              تاريخ النهاية
            </label>
            <input
              type="date"
              value={config.endDate}
              min={minEnd}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className="w-full rounded-lg border border-ink-600 bg-ink-800/50 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-gold-400/50"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-200">
            <Clock className="h-4 w-4 text-gold-300" />
            ساعات المذاكرة اليومية
          </label>
          <input
            type="number"
            min={1}
            max={12}
            value={config.dailyHours || ''}
            onChange={(e) => onChange({ dailyHours: Math.min(12, Math.max(1, parseInt(e.target.value) || 1)) })}
            className="w-full rounded-lg border border-ink-600 bg-ink-800/50 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-gold-400/50"
            placeholder="4"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-ink-200">
            <Coffee className="h-4 w-4 text-gold-300" />
            أيام الإجازة (اختياري)
          </label>
          <div className="grid grid-cols-7 gap-1.5">
            {ARABIC_DAYS_SHORT.map((dayName, idx) => {
              const isOff = config.offDays.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => toggleOffDay(idx)}
                  className={`rounded-lg border py-2 text-xs font-bold transition-all ${
                    isOff
                      ? 'border-gold-400/50 bg-gold-400/10 text-gold-300'
                      : 'border-ink-600 bg-ink-800/40 text-ink-300 hover:border-ink-500'
                  }`}
                >
                  {dayName}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
