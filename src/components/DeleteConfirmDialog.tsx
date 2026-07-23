import { AlertTriangle, Trash2, X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function DeleteConfirmDialog({ open, onClose, onConfirm, title, message }: Props) {
  if (!open) return null;

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
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-400/10 border border-red-400/30">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-300 transition-colors hover:bg-ink-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-5 text-sm leading-relaxed text-ink-200">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/90 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-red-500 hover:-translate-y-0.5"
          >
            <Trash2 className="h-5 w-5" />
            حذف
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
