import { AlertTriangle, X, Trash2 } from 'lucide-react';

export default function DeleteConfirmDialog({
  open, onClose, onConfirm, title, message,
}: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="card mx-4 max-w-sm animate-pop p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-red-500/10 border border-red-500/30"><AlertTriangle className="h-7 w-7 text-red-400" /></div>
        <h3 className="mb-2 font-display text-lg font-bold text-white">{title}</h3>
        <p className="mb-5 text-sm text-ink-300">{message}</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1"><X className="h-4 w-4" />إلغاء</button>
          <button onClick={onConfirm} className="btn-danger flex-1"><Trash2 className="h-4 w-4" />نعم، احذف</button>
        </div>
      </div>
    </div>
  );
}
