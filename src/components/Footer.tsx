import { Brain, Send } from 'lucide-react';

function TikTokIcon({ className }: { className?: string }) {
  return (<svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.2v12.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.3 0 .59.04.86.13V8.4a6.07 6.07 0 0 0-.86-.06A6.08 6.08 0 0 0 3.66 14.4a6.08 6.08 0 0 0 6.08 6.08 6.08 6.08 0 0 0 6.08-6.08V8.16a8 8 0 0 0 4.68 1.49V6.45a4.85 4.85 0 0 1-.83.24Z" /></svg>);
}

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
            <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-2xl border border-ink-700 bg-ink-850/80 px-5 py-3.5 transition-all hover:border-gold-400/50 hover:bg-ink-800/80"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-ink-700 to-ink-800 text-white transition-colors group-hover:text-gold-300"><TikTokIcon className="h-5 w-5" /></span><span className="text-right"><span className="block text-sm font-bold text-white">تابعني على تيك توك</span><span className="block text-xs text-ink-300">لنصائح وتكنيكات الحل السريع</span></span></a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-2xl border border-ink-700 bg-ink-850/80 px-5 py-3.5 transition-all hover:border-sky-400/50 hover:bg-ink-800/80"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white"><Send className="h-5 w-5" /></span><span className="text-right"><span className="block text-sm font-bold text-white">انضم لقناة النقاش</span><span className="block text-xs text-ink-300">وقروب المذاكرة الجماعية</span></span></a>
          </div>
        </div>
        <div className="mt-8 border-t border-ink-800/80 pt-5 text-center"><p className="text-xs text-ink-400">© {new Date().getFullYear()} منظومة المذاكرة — صُمم خصيصاً لطلاب الثانوي في المملكة العربية السعودية.</p></div>
      </div>
    </footer>
  );
}
