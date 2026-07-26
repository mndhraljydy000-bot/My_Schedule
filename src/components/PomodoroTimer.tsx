import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings, X, Check, Flame } from 'lucide-react';

type Phase = 'idle' | 'study' | 'break';

const TOTAL_KEY = 'total_study_seconds';

function loadTotal(): number {
  try { const v = localStorage.getItem(TOTAL_KEY); return v ? Number(v) || 0 : 0; } catch { return 0; }
}

function fmtDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} ساعة`);
  if (m > 0) parts.push(`${m} دقيقة`);
  if (s > 0 || parts.length === 0) parts.push(`${s} ثانية`);
  return parts.join(' و');
}

export default function PomodoroTimer() {
  const [studyMinutes, setStudyMinutes] = useState(55);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(55 * 60);
  const [showSettings, setShowSettings] = useState(false);
  const [tempStudy, setTempStudy] = useState(55);
  const [tempBreak, setTempBreak] = useState(5);
  const [totalStudy, setTotalStudy] = useState<number>(loadTotal);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } }, []);

  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880; osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } catch { /* noop */ }
  }, []);

  const handlePhaseEnd = useCallback(() => {
    playBeep();
    if (phase === 'study') { setPhase('break'); setSecondsLeft(breakMinutes * 60); }
    else if (phase === 'break') { setPhase('study'); setSecondsLeft(studyMinutes * 60); }
  }, [phase, studyMinutes, breakMinutes, playBeep]);

  useEffect(() => {
    if (phase === 'idle') { clearTimer(); return; }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => { if (s <= 1) { handlePhaseEnd(); return 0; } return s - 1; });
      if (phase === 'study') {
        setTotalStudy((prev) => {
          const next = prev + 1;
          try { localStorage.setItem(TOTAL_KEY, String(next)); } catch { /* noop */ }
          return next;
        });
      }
    }, 1000);
    return clearTimer;
  }, [phase, handlePhaseEnd, clearTimer]);

  const start = () => { if (phase === 'idle') { setPhase('study'); setSecondsLeft(studyMinutes * 60); } };
  const pause = () => { clearTimer(); setPhase('idle'); };
  const reset = () => { clearTimer(); setPhase('idle'); setSecondsLeft(studyMinutes * 60); };

  const saveSettings = () => {
    setStudyMinutes(Math.max(1, tempStudy)); setBreakMinutes(Math.max(1, tempBreak));
    if (phase === 'idle') setSecondsLeft(Math.max(1, tempStudy) * 60);
    setShowSettings(false);
  };

  const mm = Math.floor(secondsLeft / 60); const ss = secondsLeft % 60;
  const totalSeconds = phase === 'break' ? breakMinutes * 60 : studyMinutes * 60;
  const pct = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;
  const isStudy = phase === 'study'; const isBreak = phase === 'break'; const isIdle = phase === 'idle';

  return (
    <div className="card overflow-hidden p-0">
      <div className={`flex items-center justify-between border-b px-5 py-4 transition-colors ${isStudy ? 'border-gold-400/30 bg-gold-400/5' : isBreak ? 'border-sky-400/30 bg-sky-400/5' : 'border-ink-700 bg-ink-850/80'}`}>
        <div className="flex items-center gap-2">
          <div className={`grid h-9 w-9 place-items-center rounded-lg ${isStudy ? 'bg-gold-400/15' : isBreak ? 'bg-sky-400/15' : 'bg-ink-800'}`}>
            {isBreak ? <Coffee className="h-5 w-5 text-sky-400" /> : <Brain className={`h-5 w-5 ${isStudy ? 'text-gold-300' : 'text-ink-300'}`} />}
          </div>
          <div><div className="font-display text-base font-bold text-white">{isIdle ? 'مؤقت المذاكرة' : isStudy ? 'وقت المذاكرة' : 'وقت الراحة'}</div><div className="text-[11px] text-ink-300">{isIdle ? `${studyMinutes} دقيقة + ${breakMinutes} راحة` : isStudy ? 'ركز في مذاكرتك' : 'خذ استراحة قصيرة'}</div></div>
        </div>
        <button onClick={() => { setTempStudy(studyMinutes); setTempBreak(breakMinutes); setShowSettings(true); }} className="grid h-9 w-9 place-items-center rounded-lg border border-ink-600 bg-ink-800/50 text-ink-200 transition-all hover:border-gold-400/40 hover:text-gold-300"><Settings className="h-4 w-4" /></button>
      </div>
      <div className="flex flex-col items-center gap-4 p-6">
        <div className="relative h-40 w-40">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" strokeWidth="8" className="stroke-ink-800" />
            <circle cx="60" cy="60" r="52" fill="none" strokeWidth="8" strokeLinecap="round" className={isBreak ? 'stroke-sky-400' : 'stroke-gold-400'} strokeDasharray={2 * Math.PI * 52} strokeDashoffset={2 * Math.PI * 52 * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-display text-4xl font-black text-white tabular-nums">{String(mm).padStart(2,'0')}:{String(ss).padStart(2,'0')}</div>
            <div className="mt-1 text-xs font-bold text-ink-300">{isIdle ? 'جاهز للبدء' : isStudy ? 'مذاكرة' : 'راحة'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isIdle ? <button onClick={start} className="btn-gold"><Play className="h-5 w-5" />بدء المذاكرة</button>
          : (<><button onClick={pause} className="btn-ghost"><Pause className="h-4 w-4" />إيقاف مؤقت</button><button onClick={reset} className="btn-ghost"><RotateCcw className="h-4 w-4" />إعادة</button></>)}
        </div>
        <div className="mt-2 w-full rounded-xl border border-gold-400/20 bg-gold-400/5 px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <Flame className={`h-4 w-4 ${isStudy ? 'text-gold-300 animate-pulse' : 'text-gold-400/70'}`} />
            <span className="text-xs font-bold text-ink-200">إجمالي وقت المذاكرة</span>
          </div>
          <div className="mt-1 text-center font-display text-lg font-bold text-gold-300 tabular-nums">{fmtDuration(totalStudy)}</div>
        </div>
      </div>
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowSettings(false)}>
          <div className="card mx-4 max-w-sm animate-pop p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-lg font-bold text-white">تعديل وقت المؤقت</h3><button onClick={() => setShowSettings(false)} className="grid h-8 w-8 place-items-center rounded-lg border border-ink-600 bg-ink-800/50 text-ink-200"><X className="h-4 w-4" /></button></div>
            <div className="space-y-4">
              <div><label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-200"><Brain className="h-3.5 w-3.5 text-gold-300" />مدة المذاكرة (بالدقائق)</label><input type="number" min={1} max={180} value={tempStudy} onChange={(e) => setTempStudy(Math.max(1, Number(e.target.value)))} className="input-field" /></div>
              <div><label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-200"><Coffee className="h-3.5 w-3.5 text-sky-400" />مدة الراحة (بالدقائق)</label><input type="number" min={1} max={60} value={tempBreak} onChange={(e) => setTempBreak(Math.max(1, Number(e.target.value)))} className="input-field" /></div>
            </div>
            <button onClick={saveSettings} className="btn-gold mt-5 w-full"><Check className="h-5 w-5" />حفظ الإعدادات</button>
          </div>
        </div>
      )}
    </div>
  );
}
