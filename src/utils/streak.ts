export interface StreakTier {
  text: string;
  border: string;
  bg: string;
  glow: string;
  label: string;
}

export function getStreakTier(streak: number): StreakTier {
  if (streak >= 100)
    return { text: 'text-gold-300', border: 'border-gold-400/40', bg: 'bg-gold-400/10', glow: 'shadow-glow-gold', label: 'أسطورة' };
  if (streak >= 50)
    return { text: 'text-rose-400', border: 'border-rose-400/30', bg: 'bg-rose-400/10', glow: 'shadow-[0_0_24px_-4px_rgba(251,113,133,0.45)]', label: 'نار' };
  if (streak >= 20)
    return { text: 'text-sky-400', border: 'border-sky-400/30', bg: 'bg-sky-400/10', glow: 'shadow-glow-sky', label: 'قوي' };
  if (streak >= 10)
    return { text: 'text-emerald-400', border: 'border-emerald-400/30', bg: 'bg-emerald-400/10', glow: 'shadow-glow-emerald', label: 'مثابر' };
  if (streak >= 3)
    return { text: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10', glow: 'shadow-[0_0_24px_-4px_rgba(251,191,36,0.45)]', label: 'منطلق' };
  return { text: 'text-flame-400', border: 'border-flame-500/30', bg: 'bg-flame-500/10', glow: 'shadow-glow-flame', label: 'بداية' };
}
