import { useState } from 'react';
import { Brain, Eye, EyeOff, Loader2, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const ARABIC_ERRORS: Record<string, string> = {
    'Invalid login credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'User already registered': 'هذا البريد الإلكتروني مسجل مسبقاً، حاول تسجيل الدخول',
    'Password should be at least 6 characters': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    'Unable to validate email address: invalid format': 'صيغة البريد الإلكتروني غير صحيحة',
  };

  const toArabic = (msg: string) => {
    for (const [k, v] of Object.entries(ARABIC_ERRORS)) {
      if (msg.includes(k)) return v;
    }
    return 'حدث خطأ، حاول مجدداً';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email || !password) { setError('أدخل البريد الإلكتروني وكلمة المرور'); return; }
    setLoading(true);
    const err = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password);
    setLoading(false);
    if (err) { setError(toArabic(err)); return; }
    if (mode === 'signup') setSuccess('تم إنشاء الحساب بنجاح! يمكنك الآن استخدام التطبيق.');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold-400/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-sky-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-gold-300 to-gold-600 shadow-glow-gold">
            <Brain className="h-8 w-8 text-ink-950" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-extrabold text-white">منظومة المذاكرة</h1>
            <p className="mt-1 text-sm text-ink-300">جدول ذكي للقدرات والتحصيلي</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-ink-700/60 bg-ink-900/80 p-8 shadow-soft backdrop-blur-xl">
          {/* Tabs */}
          <div className="mb-7 flex rounded-xl border border-ink-700/50 bg-ink-800/50 p-1">
            <button
              onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${mode === 'login' ? 'bg-ink-700 text-gold-300 shadow-soft' : 'text-ink-300 hover:text-white'}`}
            >
              <LogIn className="h-4 w-4" /> تسجيل الدخول
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${mode === 'signup' ? 'bg-ink-700 text-gold-300 shadow-soft' : 'text-ink-300 hover:text-white'}`}
            >
              <UserPlus className="h-4 w-4" /> إنشاء حساب
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-200">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                dir="ltr"
                className="w-full rounded-xl border border-ink-600 bg-ink-800/60 px-4 py-3 text-left text-sm text-white placeholder-ink-400 outline-none transition-all focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/20"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-200">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full rounded-xl border border-ink-600 bg-ink-800/60 px-4 py-3 pr-11 text-left text-sm text-white placeholder-ink-400 outline-none transition-all focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-200"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="mt-1.5 text-[11px] text-ink-400">6 أحرف على الأقل</p>
              )}
            </div>

            {/* Error / Success */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-gold-400 to-gold-500 py-3 text-sm font-bold text-ink-950 shadow-glow-gold transition-all hover:brightness-110 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === 'login' ? (
                <><LogIn className="h-4 w-4" /> دخول</>
              ) : (
                <><UserPlus className="h-4 w-4" /> إنشاء الحساب</>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">
          جدولك يُحفظ تلقائياً في السحابة ويمكنك الوصول إليه من أي جهاز
        </p>
      </div>
    </div>
  );
}
