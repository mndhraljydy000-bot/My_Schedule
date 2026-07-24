import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, AlertCircle, Users, ExternalLink, Send, RefreshCw, CheckCircle2, HelpCircle } from 'lucide-react';

interface TelegramGateProps {
  open: boolean;
  mode: 'generate' | 'rejoin';
  onVerified: () => void;
  onClose?: () => void;
}

const GROUP_LINK = 'https://t.me/gadrat_990';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export default function TelegramGate({ open, mode, onVerified, onClose }: TelegramGateProps) {
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [status, setStatus] = useState<'init' | 'waiting' | 'verified' | 'not_member'>('init');
  const [error, setError] = useState<string | null>(null);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [showTimeoutHint, setShowTimeoutHint] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const pollStatus = useCallback(async (code: string) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/telegram-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'poll', code }),
      });
      const data = await res.json();
      if (!data.ok) return;
      if (data.status === 'verified') {
        stopPolling();
        setStatus('verified');
        try { localStorage.setItem('tg_user_id', String(data.telegramUserId)); } catch { /* noop */ }
        setTimeout(() => onVerified(), 600);
      } else if (data.status === 'not_member') {
        stopPolling();
        setStatus('not_member');
      }
    } catch { /* network error - keep polling */ }
  }, [onVerified, stopPolling]);

  // Start session when gate opens
  useEffect(() => {
    if (!open) {
      stopPolling();
      setSessionCode(null);
      setDeepLink(null);
      setStatus('init');
      setError(null);
      setWaitSeconds(0);
      setShowTimeoutHint(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/telegram-verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create' }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!data.ok) { setError('فشل إنشاء جلسة التحقق'); return; }
        setSessionCode(data.code);
        setDeepLink(data.deepLink);
        setStatus('waiting');
      } catch {
        if (!cancelled) setError('فشل الاتصال بالخادم');
      }
    })();

    return () => { cancelled = true; stopPolling(); };
  }, [open, stopPolling]);

  // Start polling once we have a session code
  useEffect(() => {
    if (sessionCode && status === 'waiting') {
      pollStatus(sessionCode);
      pollRef.current = setInterval(() => pollStatus(sessionCode), 1500);
      timerRef.current = setInterval(() => setWaitSeconds(s => s + 1), 1000);
    }
    return () => stopPolling();
  }, [sessionCode, status, pollStatus, stopPolling]);

  // Show timeout hint after 15 seconds
  useEffect(() => {
    if (waitSeconds >= 15 && status === 'waiting') setShowTimeoutHint(true);
  }, [waitSeconds, status]);

  if (!open) return null;

  const isRejoin = mode === 'rejoin';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink-950/90 backdrop-blur-md animate-fade-in p-4 overflow-y-auto">
      <div className="card mx-auto max-w-md w-full animate-pop p-6 text-center my-auto">
        {/* Icon */}
        <div className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border ${isRejoin ? 'border-red-500/30 bg-red-500/10' : 'border-sky-400/30 bg-sky-400/10'}`}>
          {isRejoin ? <AlertCircle className="h-7 w-7 text-red-400" /> : <Users className="h-7 w-7 text-sky-400" />}
        </div>

        <h3 className="mb-2 font-display text-lg font-bold text-white">
          {isRejoin ? 'عذراً، لقد غادرت المجموعة' : 'خطوة أخيرة لإنشاء جدولك!'}
        </h3>
        <p className="mb-5 text-sm leading-relaxed text-ink-300">
          {isRejoin
            ? 'يرجى إعادة الانضمام لمجموعة المناقشة في التليجرام لفتح جدولك مجدداً.'
            : 'يجب الانضمام لقروب المناقشة في التليجرام الخاص بنا لاستلام الجدول.'}
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-right">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400 mt-0.5" />
            <p className="text-xs leading-relaxed text-red-300">{error}</p>
          </div>
        )}

        {/* Step 1: Join group */}
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2 text-right">
            <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-sky-500 text-xs font-bold text-white">1</span>
            <span className="text-sm font-bold text-ink-200">انضم للمجموعة</span>
          </div>
          <a
            href={GROUP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-sky-500 to-sky-600 py-3 text-sm font-bold text-white shadow-glow-sky transition-all hover:brightness-110"
          >
            <ExternalLink className="h-4 w-4" />
            الانضمام للمجموعة
          </a>
        </div>

        {/* Step 2: Open bot and press start */}
        {status === 'waiting' && deepLink && (
          <div className="space-y-3">
            <div className="mb-2 flex items-center gap-2 text-right">
              <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-sky-500 text-xs font-bold text-white">2</span>
              <span className="text-sm font-bold text-ink-200">افتح البوت واضغط Start</span>
            </div>
            <a
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-sky-400/50 bg-sky-400/10 py-3.5 text-sm font-bold text-sky-300 transition-all hover:border-sky-400 hover:bg-sky-400/20"
            >
              <Send className="h-4 w-4" />
              افتح البوت واضغط Start
            </a>

            <div className="flex items-center justify-center gap-2 text-xs text-ink-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              في انتظار تأكيد العضوية…
            </div>

            {/* Clear instructions */}
            <div className="rounded-xl border border-ink-700/50 bg-ink-900/50 p-3 text-right">
              <p className="text-[11px] leading-relaxed text-ink-400">
                <strong className="text-sky-300">طريقة التحقق:</strong><br />
                ١. اضغط الزر أعلاه لفتح محادثة البوت<br />
                ٢. اضغط زر <span className="text-sky-300 font-bold">"Start"</span> في أسفل المحادثة<br />
                ٣. ستصلك رسالة تأكيد من البوت<br />
                ٤. ارجع هنا — سيتم التحقق تلقائياً
              </p>
            </div>

            {/* Timeout hint */}
            {showTimeoutHint && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-right">
                <p className="text-[11px] leading-relaxed text-amber-300">
                  <strong>لم يصلنا تأكيد بعد.</strong> تأكد أنك ضغطت <span className="font-bold">"Start"</span> في محادثة البوت، وليس فقط فتحت الرابط.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading state */}
        {status === 'init' && (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-ink-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري التحضير…
          </div>
        )}

        {/* Not a member */}
        {status === 'not_member' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-right">
              <p className="text-sm leading-relaxed text-red-300">
                لم نجد عضويتك في المجموعة. تأكد من الانضمام للمجموعة أولاً، ثم أعد المحاولة.
              </p>
            </div>
            <button
              onClick={() => { setStatus('init'); setSessionCode(null); setDeepLink(null); setWaitSeconds(0); setShowTimeoutHint(false); }}
              className="btn-gold w-full"
            >
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Verified (brief flash) */}
        {status === 'verified' && (
          <div className="flex flex-col items-center gap-2 py-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 animate-pop" />
            <p className="text-sm font-bold text-emerald-300">تم التحقق! جاري إنشاء جدولك…</p>
          </div>
        )}

        {/* Close (only for rejoin mode) */}
        {isRejoin && onClose && (
          <button onClick={onClose} className="mt-4 text-xs text-ink-400 transition-colors hover:text-ink-200">
            إغلاق
          </button>
        )}
      </div>
    </div>
  );
}
