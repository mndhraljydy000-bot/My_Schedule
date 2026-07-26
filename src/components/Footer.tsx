import { Brain, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-ink-700/60 bg-ink-950/90">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <div className="flex items-center gap-2.5"><div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-600"><Brain className="h-4 w-4 text-ink-950" strokeWidth={2.5} /></div><span className="font-display text-base font-extrabold text-white">منظومة المذاكرة</span></div>
            <p className="max-w-xs text-center text-xs text-ink-300 md:text-right">مساعدك الذكي لتنظيم جداول مذاكرة القدرات والتحصيلي بأسلوب احترافي ومتوازن.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="https://t.me/MothakraSupport_bot" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-2xl border border-ink-700 bg-ink-850/80 px-5 py-3.5 transition-all hover:border-gold-400/50 hover:bg-ink-800/80"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 text-white transition-colors group-hover:text-ink-950"><Send className="h-5 w-5" /></span><span className="text-right"><span className="block text-sm font-bold text-white">الدعم الفني</span><span className="block text-xs text-ink-300">للتواصل والاستفسارات والاقتراحات</span></span></a>
            <a href="https://t.me/gadrat_990" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-2xl border border-ink-700 bg-ink-850/80 px-5 py-3.5 transition-all hover:border-sky-400/50 hover:bg-ink-800/80"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white"><Send className="h-5 w-5" /></span><span className="text-right"><span className="block text-sm font-bold text-white">انضم لقناة النقاش</span><span className="block text-xs text-ink-300">وقروب المذاكرة الجماعية</span></span></a>
          </div>
        </div>
        <div className="mt-8 border-t border-ink-800/80 pt-5 text-center"><p className="text-xs text-ink-400">© {new Date().getFullYear()} منظومة المذاكرة — صُمم خصيصاً لطلاب الثانوي في المملكة العربية السعودية.</p></div>
      </div>
    </footer>
  );
}
