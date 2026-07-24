import { Brain, GraduationCap, X } from 'lucide-react';

export default function SectionPicker({
  open, onClose, onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (section: 'qiyas' | 'tahsili') => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="card mx-4 max-w-md animate-pop p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute left-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-ink-300 transition-colors hover:bg-ink-800 hover:text-white">
          <X className="h-4 w-4" />
        </button>
        <h3 className="mb-2 font-display text-xl font-bold text-white">اختر القسم</h3>
        <p className="mb-6 text-sm text-ink-300">حدد نوع الاختبار الذي تريد تنظيم جدولك له</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={() => onPick('qiyas')} className="group flex flex-col items-center gap-3 rounded-2xl border border-gold-500/30 bg-gold-500/5 p-6 transition-all hover:-translate-y-1 hover:border-gold-400/60 hover:bg-gold-500/10">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-gold-300 to-gold-600 shadow-glow-gold">
              <Brain className="h-7 w-7 text-ink-950" strokeWidth={2.5} />
            </div>
            <div className="font-display text-base font-bold text-white">القدرات</div>
          </button>
          <button onClick={() => onPick('tahsili')} className="group flex flex-col items-center gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-6 transition-all hover:-translate-y-1 hover:border-sky-400/60 hover:bg-sky-500/10">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-300 to-sky-600 shadow-glow-sky">
              <GraduationCap className="h-7 w-7 text-ink-950" strokeWidth={2.5} />
            </div>
            <div className="font-display text-base font-bold text-white">التحصيلي</div>
          </button>
        </div>
      </div>
    </div>
  );
}
