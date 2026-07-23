import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

type Mode = 'focus' | 'break';
const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

export default function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            setRunning(false);
            if (mode === 'focus') setCompleted((c) => c + 1);
            const nextMode = mode === 'focus' ? 'break' : 'focus';
            setMode(nextMode);
            return nextMode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  const toggle = useCallback(() => setRunning((r) => !r), []);
  const reset = useCallback(() => {
    setRunning(false);
    setSecondsLeft(mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS);
  }, [mode]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setRunning(false);
    setSecondsLeft(m === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const total = mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;
  const progress = ((total - secondsLeft) / total) * 100;

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-5 w-5 text-gold-300" />
        <h3 className="font-display text-base font-bold text-white">مؤقت المذاكرة</h3>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => switchMode('focus')}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
            mode === 'focus' ? 'bg-gold-400/15 text-gold-300 border border-gold-400/40' : 'bg-ink-800/40 text-ink-300 border border-ink-600'
          }`}
        >
          تركيز (٢٥ د)
        </button>
        <button
          onClick={() => switchMode('break')}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
            mode === 'break' ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/40' : 'bg-ink-800/40 text-ink-300 border border-ink-600'
          }`}
        >
          راحة (٥ د)
        </button>
      </div>

      <div className="relative mx-auto mb-4 grid h-32 w-32 place-items-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#22222e" strokeWidth="6" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={mode === 'focus' ? '#f5b513' : '#34d399'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 54}
            strokeDashoffset={2 * Math.PI * 54 * (1 - progress / 100)}
            className="transition-all duration-500"
          />
        </svg>
        <div className="text-center">
          <div className="font-display text-3xl font-bold text-white">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <div className="text-[10px] text-ink-300">{mode === 'focus' ? 'تركيز' : 'راحة'}</div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button onClick={toggle} className="btn-gold px-4 py-2">
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? 'إيقاف' : 'بدء'}
        </button>
        <button onClick={reset} className="btn-ghost px-4 py-2">
          <RotateCcw className="h-4 w-4" />
          إعادة
        </button>
      </div>

      {completed > 0 && (
        <div className="mt-3 text-center text-xs text-ink-300">
          جلسات مكتملة: <span className="font-bold text-gold-300">{completed}</span>
        </div>
      )}
    </div>
  );
}
