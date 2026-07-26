import { useEffect, useState } from 'react';
import { Download, X, GraduationCap, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed-at';
const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24; // 1 day

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    const withinCooldown = Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShowFallback(false);
      if (!withinCooldown) setVisible(true);
    };

    const onInstalled = () => {
      setInstalled(true);
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    // Show on every refresh unless within dismissal cooldown
    if (!withinCooldown) {
      const t = setTimeout(() => {
        setVisible(true);
        // If no beforeinstallprompt event fired within 2s, show fallback instructions
        setTimeout(() => {
          setDeferred((d) => {
            if (!d) setShowFallback(true);
            return d;
          });
        }, 2000);
      }, 600);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) {
      setShowFallback(true);
      return;
    }
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'accepted') {
      setVisible(false);
      setInstalled(true);
    } else {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
      setVisible(false);
    }
    setDeferred(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  if (installed || !visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-fade-up px-4 pb-4 sm:pb-6">
      <div className="mx-auto max-w-md rounded-2xl border border-gold-400/30 bg-ink-800/95 p-4 shadow-soft backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950 shadow-glow-gold">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-sm font-bold text-white">ثبّت التطبيق على جهازك</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-300">أضف منظومة المذاكرة إلى شاشتك الرئيسية للوصول السريع والعمل دون اتصال.</p>

            {showFallback ? (
              <div className="mt-3 space-y-2">
                <p className="flex items-center gap-1.5 rounded-lg bg-ink-700/60 px-3 py-2 text-[11px] leading-relaxed text-ink-200">
                  <Share className="h-3.5 w-3.5 shrink-0 text-gold-400" />
                  افتح قائمة المتصفح (⋮ أو زر المشاركة) ثم اختر «إضافة إلى الشاشة الرئيسية».
                </p>
                <button onClick={handleDismiss} className="inline-flex items-center gap-1 rounded-lg border border-ink-600 px-3 py-2 text-xs font-medium text-ink-300 transition-all hover:bg-ink-700">
                  لاحقاً
                </button>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2">
                <button onClick={handleInstall} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-l from-gold-300 to-gold-500 px-3.5 py-2 text-xs font-bold text-ink-950 transition-all hover:brightness-110 active:scale-95">
                  <Download className="h-4 w-4" />تثبيت
                </button>
                <button onClick={handleDismiss} className="inline-flex items-center gap-1 rounded-lg border border-ink-600 px-3 py-2 text-xs font-medium text-ink-300 transition-all hover:bg-ink-700">
                  لاحقاً
                </button>
              </div>
            )}
          </div>
          <button onClick={handleDismiss} className="shrink-0 rounded-lg p-1 text-ink-400 transition-colors hover:bg-ink-700 hover:text-white" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
