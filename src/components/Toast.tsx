import { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function Toast({
  open, onClose, message, duration = 4000,
}: {
  open: boolean; onClose: () => void; message: string; duration?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, onClose, duration]);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 top-20 z-[120] flex justify-center px-4 animate-fade-in">
      <div className="card flex max-w-md items-center gap-3 border-gold-500/40 bg-ink-900/95 p-4 shadow-glow-gold backdrop-blur-xl">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold-500/30 bg-gold-500/10">
          <AlertCircle className="h-5 w-5 text-gold-400" />
        </div>
        <p className="flex-1 text-sm font-bold leading-relaxed text-gold-100">{message}</p>
        <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-300 transition-colors hover:bg-ink-800 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
