import { useApp } from '../context/AppContext';
import { CalendarDays, Sparkles, Trash2, Home as HomeIcon } from 'lucide-react';
import type { Page } from '../data/sources';

export default function Navbar() {
  const { page, setPage, schedule, scheduleConfirmed } = useApp();

  const handleNav = (target: Page) => {
    if (schedule && scheduleConfirmed && target !== 'schedule' && target !== 'home') {
      setPage('home');
      return;
    }
    setPage(target);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-ink-700 bg-ink-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <button onClick={() => setPage('home')} className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 shadow-glow-gold">
            <Sparkles className="h-5 w-5 text-ink-950" />
          </div>
          <span className="font-display text-lg font-bold text-white">منظومة المذاكرة</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => handleNav('home')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
              page === 'home' ? 'bg-ink-800 text-gold-300' : 'text-ink-200 hover:bg-ink-800/50 hover:text-white'
            }`}
          >
            <HomeIcon className="h-4 w-4" />
            <span className="hidden sm:inline">الرئيسية</span>
          </button>
          <button
            onClick={() => handleNav('qiyas')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
              page === 'qiyas' ? 'bg-ink-800 text-gold-300' : 'text-ink-200 hover:bg-ink-800/50 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">القدرات</span>
          </button>
          <button
            onClick={() => handleNav('tahsili')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
              page === 'tahsili' ? 'bg-ink-800 text-gold-300' : 'text-ink-200 hover:bg-ink-800/50 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">التحصيلي</span>
          </button>
          <button
            onClick={() => setPage('schedule')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
              page === 'schedule' ? 'bg-ink-800 text-gold-300' : 'text-ink-200 hover:bg-ink-800/50 hover:text-white'
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">جدولي</span>
          </button>
          {schedule && scheduleConfirmed && (
            <button
              onClick={() => {
                if (confirm('هل تريد حذف الجدول الحالي؟')) {
                  setPage('home');
                }
              }}
              className="grid h-9 w-9 place-items-center rounded-lg text-red-400 transition-colors hover:bg-red-400/10"
              title="حذف الجدول"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
