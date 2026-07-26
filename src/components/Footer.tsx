import { Brain, Send, Share2, X, Link2, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://mothakra.app';
  const shareText = 'منظومة المذاكرة - أفضل موقع لتنظيم جداول قدرات وتحصيلي. جرّبه الآن!';
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = [
    { name: 'واتساب', icon: 'whatsapp', color: 'from-green-500 to-green-600', href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { name: 'تيليجرام', icon: 'telegram', color: 'from-sky-500 to-sky-600', href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
    { name: 'تويتر / X', icon: 'twitter', color: 'from-slate-700 to-slate-900', href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
    { name: 'سناب شات', icon: 'snapchat', color: 'from-yellow-400 to-yellow-500', href: `https://www.snapchat.com/scan?attachmentUrl=${encodedUrl}` },
    { name: 'فيسبوك', icon: 'facebook', color: 'from-blue-600 to-blue-700', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}` },
    { name: 'ماسنجر', icon: 'messenger', color: 'from-blue-500 to-violet-500', href: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}` },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'منظومة المذاكرة', text: shareText, url: shareUrl });
      } catch {
        // user cancelled
      }
    } else {
      setShareOpen(true);
    }
  };

  useEffect(() => {
    if (!shareOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShareOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shareOpen]);

  const Icon = ({ name }: { name: string }) => {
    const props = { className: 'h-5 w-5', fill: 'currentColor', viewBox: '0 0 24 24' };
    switch (name) {
      case 'whatsapp':
        return (<svg {...props}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.89-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>);
      case 'telegram':
        return (<svg {...props}><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.02.295-.046.434.06.14.108.13.32.12.45-.01.13-.86 5.85-1.86 12.5-.13.86-.5 1.02-.94.64-.31-.26-1.7-1.13-2.94-2.1-.62-.49-1.16-.91-1.16-.91s-2.13 2.2-2.79 2.84c-.36.35-.66.32-.66-.32v-2.5s4.93-4.48 5.49-4.99c.4-.37.16-.5-.16-.32-.5.3-5.7 3.43-5.7 3.43s-1.1-.36-2.13-.74c-1.04-.37-1.05-.86.16-1.3 0 0 8.5-3.5 10.5-4.3.5-.2 1.5-.3 1.5-.3z"/></svg>);
      case 'twitter':
        return (<svg {...props}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>);
      case 'snapchat':
        return (<svg {...props}><path d="M12.206.793c.99 0 4.347.276 5.93 3.21 1.7 3.148 1.366 5.74 1.366 5.74s.276 1.766 1.244 2.298c.967.532 2.354.276 2.354 1.382 0 .829-1.382 1.244-2.354 1.244-.829 0-1.244-.276-1.244-.276s.276 1.799-1.382 3.457c-1.658 1.658-3.456 1.799-3.456 1.799s.276.553.276 1.106c0 .829-1.106 1.382-2.213 1.382-1.106 0-1.658-.553-1.658-.553s-.552.553-1.658.553c-1.107 0-2.213-.553-2.213-1.382 0-.553.276-1.106.276-1.106s-1.799-.141-3.457-1.799C1.244 14.116 1.52 12.317 1.52 12.317s-.415.276-1.244.276c-.972 0-2.354-.415-2.354-1.244 0-1.106 1.387-.85 2.354-1.382.968-.532 1.244-2.298 1.244-2.298s-.334-2.592 1.366-5.74c1.583-2.934 4.94-3.21 5.93-3.21z"/></svg>);
      case 'facebook':
        return (<svg {...props}><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a5.6 5.6 0 0 0-.903-.103c-1.33 0-1.848.795-1.848 2.235v1.808h3.665l-.103 1.766-3.562.523v7.98h3.665l-.103 1.766-3.562.523v7.98c4.4-.5 8.5-3.9 8.5-9.5 0-5.5-4-9.5-9.5-9.5s-9.5 4-9.5 9.5c0 5.6 4.1 9 8.5 9.5z"/></svg>);
      case 'messenger':
        return (<svg {...props}><path d="M12 0C5.373 0 0 4.974 0 11.5c0 3.67 1.674 6.85 4.4 8.6V24l4.02-2.2c1.18.32 2.42.5 3.58.5 6.627 0 12-4.974 12-11.5S18.627 0 12 0zm1.2 14.4l-3-3.2-5.8 3.2 6.4-6.8 3.2 3.2 5.8-3.2-6.6 6.8z"/></svg>);
      default:
        return null;
    }
  };

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

        <div className="mt-8 flex flex-col items-center gap-4 border-t border-ink-800/80 pt-6">
          <button onClick={handleNativeShare} className="group inline-flex items-center gap-2.5 rounded-2xl border border-gold-400/30 bg-gradient-to-l from-gold-500/10 to-transparent px-5 py-3 text-sm font-bold text-gold-200 transition-all hover:border-gold-400/60 hover:from-gold-500/20">
            <Share2 className="h-4 w-4 transition-transform group-hover:scale-110" />
            شارك الموقع مع أصدقائك
          </button>

          {shareOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" onClick={() => setShareOpen(false)}>
              <div className="animate-fade-up rounded-t-3xl border border-ink-700 bg-ink-850 p-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-white">مشاركة الموقع</h3>
                  <button onClick={() => setShareOpen(false)} className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-700 hover:text-white"><X className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {shareLinks.map((s) => (
                    <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
                      <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg transition-transform hover:scale-110 active:scale-95`}>
                        <Icon name={s.icon} />
                      </span>
                      <span className="text-[11px] font-medium text-ink-300">{s.name}</span>
                    </a>
                  ))}
                </div>
                <button onClick={handleCopy} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-ink-700 bg-ink-800 px-4 py-2.5 text-sm font-medium text-ink-200 transition-colors hover:bg-ink-700">
                  {copied ? <><Check className="h-4 w-4 text-green-400" /> تم نسخ الرابط</> : <><Link2 className="h-4 w-4" /> نسخ الرابط</>}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-ink-800/80 pt-5 text-center"><p className="text-xs text-ink-400">© {new Date().getFullYear()} منظومة المذاكرة — صُمم خصيصاً لطلاب الثانوي في المملكة العربية السعودية.</p></div>
      </div>
    </footer>
  );
}
