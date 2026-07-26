import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { NotebookPen, Trash2, Save, Check } from 'lucide-react';

export default function Notes() {
  const { notes, setNotes } = useApp();
  const [draft, setDraft] = useState(notes);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setDraft(notes); }, [notes]);

  const handleSave = () => {
    setNotes(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleClear = () => {
    setDraft('');
    setNotes('');
  };

  const charCount = draft.length;

  return (
    <div className="animate-fade-in px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-gold-300/15 to-gold-500/5 border border-gold-400/30">
            <NotebookPen className="h-8 w-8 text-gold-300" />
          </div>
          <h1 className="section-title text-3xl text-white sm:text-4xl">المذكرة</h1>
          <p className="mt-2 text-sm text-ink-300">اكتب هنا ما تريد تذكرته — ملاحظاتك محفوظة تلقائياً ومتزامنة مع حسابك.</p>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <NotebookPen className="h-5 w-5 text-gold-300" />
              <h2 className="font-display text-lg font-bold text-white">ملاحظاتي</h2>
            </div>
            <span className="text-[11px] text-ink-400">{charCount} حرف</span>
          </div>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="اكتب هنا أي شيء تريد تذكره: أفكار، مهام، تواريخ مهمة، ملخصات دراسية..."
            className="min-h-[420px] w-full resize-y rounded-xl border border-ink-600 bg-ink-850/60 p-4 text-sm leading-relaxed text-ink-100 placeholder:text-ink-500 transition-colors focus:border-gold-400/50 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
            dir="rtl"
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {saved && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 animate-fade-in">
                  <Check className="h-4 w-4" /> تم الحفظ
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={handleClear}
                className="btn-ghost"
                disabled={!draft}
              >
                <Trash2 className="h-4 w-4 text-red-400" /> مسح الكل
              </button>
              <button onClick={handleSave} className="btn-gold" disabled={draft === notes}>
                <Save className="h-5 w-5" /> حفظ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
