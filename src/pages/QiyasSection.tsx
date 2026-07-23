import { useApp } from '../context/AppContext';
import { QIYAS_SOURCES, type Source } from '../data/sources';
import { Sparkles, PlayCircle, FileText, Check, Lock } from 'lucide-react';
import ScheduleConfigForm from '../components/ScheduleConfigForm';

export default function QiyasSection() {
  const {
    selectedSources, toggleSource, inputs, setInputs,
    scheduleConfig, setScheduleConfig, generateSchedule,
    schedule, scheduleConfirmed,
  } = useApp();

  const isBlocked = schedule && scheduleConfirmed;

  if (isBlocked) {
    return <BlockMessage />;
  }

  const qiyasSelected = selectedSources.filter((s) => s.testType === 'qiyas');

  return (
    <div className="animate-fade-in px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/5 px-4 py-1.5 text-xs font-bold text-gold-300">
            <Sparkles className="h-4 w-4" />
            اختبار القدرات
          </div>
          <h1 className="section-title text-3xl text-white sm:text-4xl">إنشاء جدول القدرات</h1>
          <p className="mt-2 text-sm text-ink-300">اختر مصادرك، أدخل الكميات والتواريخ، ثم ولّد جدولك الذكي</p>
        </div>

        <div className="mb-6">
          <h2 className="mb-3 font-display text-lg font-bold text-white">١. اختر المصادر</h2>
          <div className="space-y-3">
            {QIYAS_SOURCES.map((src) => {
              const isSelected = qiyasSelected.some((s) => s.id === src.id);
              return (
                <button
                  key={src.id}
                  onClick={() => toggleSource(src)}
                  className={`card flex w-full items-center justify-between p-4 text-right transition-all ${
                    isSelected ? 'border-gold-400/50 bg-gold-400/5' : 'hover:border-ink-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`grid h-10 w-10 place-items-center rounded-xl border ${
                      isSelected ? 'bg-gold-400/15 border-gold-400/40' : 'bg-ink-800/50 border-ink-600'
                    }`}>
                      {isSelected ? <Check className="h-5 w-5 text-gold-300" /> : <Sparkles className="h-5 w-5 text-ink-400" />}
                    </div>
                    <div>
                      <div className="font-display text-base font-bold text-white">{src.name}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {qiyasSelected.length > 0 && (
          <div className="mb-6 animate-fade-in">
            <h2 className="mb-3 font-display text-lg font-bold text-white">٢. أدخل الكميات</h2>
            <div className="space-y-3">
              {qiyasSelected.map((src) => (
                <SourceInput
                  key={src.id}
                  source={src}
                  videos={inputs[src.id]?.videos ?? 0}
                  tests={inputs[src.id]?.tests ?? 0}
                  onChange={(data) => setInputs(src.id, data)}
                />
              ))}
            </div>
          </div>
        )}

        <ScheduleConfigForm
          config={scheduleConfig}
          onChange={setScheduleConfig}
        />

        {qiyasSelected.length > 0 && scheduleConfig.startDate && scheduleConfig.endDate && (
          <div className="mt-6 flex justify-center animate-fade-in">
            <button
              onClick={() => generateSchedule('qiyas')}
              className="btn-gold"
            >
              <Sparkles className="h-5 w-5" />
              توليد الخطة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SourceInput({ source, videos, tests, onChange }: {
  source: Source;
  videos: number;
  tests: number;
  onChange: (data: { videos?: number; tests?: number }) => void;
}) {
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-gold-300" />
        <span className="font-display text-sm font-bold text-white">{source.name}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-200">
            <PlayCircle className="h-4 w-4 text-sky-400" />
            عدد الفيديوهات
          </label>
          <input
            type="number"
            min={0}
            value={videos || ''}
            onChange={(e) => onChange({ videos: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-full rounded-lg border border-ink-600 bg-ink-800/50 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-gold-400/50"
            placeholder="0"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-200">
            <FileText className="h-4 w-4 text-gold-300" />
            عدد الاختبارات
          </label>
          <input
            type="number"
            min={0}
            value={tests || ''}
            onChange={(e) => onChange({ tests: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-full rounded-lg border border-ink-600 bg-ink-800/50 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-gold-400/50"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}

function BlockMessage() {
  const { setPage, clearSchedule } = useApp();
  return (
    <div className="animate-fade-in px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-gold-400/10 border border-gold-400/30">
          <Lock className="h-9 w-9 text-gold-300" />
        </div>
        <h1 className="section-title text-2xl text-white">لديك جدول ساري</h1>
        <p className="mt-3 text-sm text-ink-300">
          لا يمكنك إنشاء جدول جديد بينما لديك جدول مؤكد ساري. احذف الجدول الحالي أولاً لإنشاء جدول جديد.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button onClick={() => setPage('schedule')} className="btn-gold">
            <Check className="h-5 w-5" />
            عرض الجدول الحالي
          </button>
          <button onClick={() => { clearSchedule(); }} className="btn-ghost">
            حذف الجدول الحالي
          </button>
        </div>
      </div>
    </div>
  );
}
