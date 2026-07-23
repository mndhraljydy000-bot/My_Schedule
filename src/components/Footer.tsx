import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-ink-700 bg-ink-950/80 py-6">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-gold-300" />
          <span className="font-display text-sm font-bold text-white">منظومة المذاكرة</span>
        </div>
        <p className="text-xs text-ink-400">نظام تخطيط ذكي للقدرات والتحصيلي — صُمم لطلاب الثانوية في المملكة العربية السعودية</p>
      </div>
    </footer>
  );
}
