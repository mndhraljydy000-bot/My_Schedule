import { useApp, type Page } from '../context/AppContext';
import { Home, Brain, GraduationCap, CalendarDays, Menu, X, Flame } from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS: { id: Page; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'الرئيسية', icon: Home },
  { id: 'qiyas', label: 'القدرات', icon: Brain },
  { id: 'tahsili', label: 'التحصيلي', icon: GraduationCap },
  { id: 'schedule', label: 'جدولي', icon: CalendarDays },
];

export default function Navbar() {
  const { page, setPage, schedule, scheduleConfirmed, streak } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleNav = (p: Page) => { setPage(p); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <header className="sticky top-0 z-50 border-b border-ink-700/60 bg-ink-950/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <button onClick={() => handleNav('home')} className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-600 shadow-glow-gold"><Brain className="h-5 w-5 text-ink-950" strokeWidth={2.5} /></div>
          <div className="text-right leading-tight"><div className="font-display text-lg font-extrabold text-white">منظومة المذاكرة</div><div className="text-[10px] font-medium text-gold-300/80">جدول ذكي للقدرات والتحصيلي</div></div>
        </button>
        <div className="hidden items-center gap-1.5 md:flex">
          {NAV_ITEMS.map((item) => { const Icon = item.icon; const active = page === item.id; return (
            <button key={item.id} onClick={() => handleNav(item.id)} className={`group relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${active ? 'bg-ink-700/70 text-gold-300 shadow-soft' : 'text-ink-200 hover:bg-ink-800/60 hover:text-white'}`}>
              <Icon className={`h-4 w-4 ${active ? 'text-gold-300' : 'text-ink-300 group-hover:text-gold-300'}`} /><span>{item.label}</span>
              {item.id === 'schedule' && schedule && scheduleConfirmed && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-sky-500 px-1 text-[10px] font-bold text-white">{schedule.days.length}</span>}
              {active && <span className="absolute -bottom-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gold-400" />}
            </button>);})}
          {streak > 0 && (<div className="mr-1 flex items-center gap-1 rounded-full border border-flame-500/30 bg-flame-500/10 px-3 py-1.5 text-xs font-bold text-flame-400"><Flame className="h-4 w-4 animate-flame-flicker" /><span>{streak}</span></div>)}
        </div>
        <button onClick={() => setMobileOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-xl border border-ink-600 bg-ink-800/60 text-ink-100 md:hidden" aria-label="القائمة">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </nav>
      {mobileOpen && (
        <div className="border-t border-ink-700/60 bg-ink-900/95 px-4 py-3 md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {NAV_ITEMS.map((item) => { const Icon = item.icon; const active = page === item.id; return (
              <button key={item.id} onClick={() => handleNav(item.id)} className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${active ? 'bg-ink-700/70 text-gold-300' : 'bg-ink-800/50 text-ink-200'}`}>
                <Icon className="h-4 w-4" /><span>{item.label}</span>
                {item.id === 'schedule' && schedule && scheduleConfirmed && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-sky-500 px-1 text-[10px] font-bold text-white">{schedule.days.length}</span>}
              </button>);})}
          </div>
          {streak > 0 && (<div className="mt-2 flex items-center justify-center gap-1.5 rounded-full border border-flame-500/30 bg-flame-500/10 px-3 py-1.5 text-xs font-bold text-flame-400"><Flame className="h-4 w-4 animate-flame-flicker" /><span>شعلة الاستمرارية: {streak} أيام</span></div>)}
        </div>
      )}
    </header>
  );
}
