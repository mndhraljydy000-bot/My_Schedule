import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import QiyasSection from './pages/QiyasSection';
import TahsiliSection from './pages/TahsiliSection';
import MySchedule from './pages/MySchedule';
import Notes from './pages/Notes';
import AuthPage from './pages/AuthPage';
import TelegramGate from './components/TelegramGate';
import Toast from './components/Toast';
import InstallPrompt from './components/InstallPrompt';
import { Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

function AppContent() {
  const { page, telegramGateOpen, telegramGateMode, setTelegramGate, handleTelegramVerified, generateError, setGenerateError } = useApp();
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {page === 'home' && <Home />}
        {page === 'qiyas' && <QiyasSection />}
        {page === 'tahsili' && <TahsiliSection />}
        {page === 'schedule' && <MySchedule />}
        {page === 'notes' && <Notes />}
      </main>
      <Footer />
      <TelegramGate
        open={telegramGateOpen}
        mode={telegramGateMode}
        onVerified={handleTelegramVerified}
        onClose={() => setTelegramGate(false)}
      />
      <Toast open={!!generateError} onClose={() => setGenerateError(null)} message={generateError ?? ''} />
      <WelcomeToast open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />
      <InstallPrompt />
    </div>
  );
}

function WelcomeToast({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!open) return;
    const t1 = setTimeout(() => setVisible(true), 50);
    const t2 = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className={`fixed inset-x-0 top-20 z-[120] flex justify-center px-4 transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
      <div className="card flex max-w-md items-center gap-3 border-gold-500/40 bg-ink-900/95 p-4 shadow-glow-gold backdrop-blur-xl">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold-500/30 bg-gold-500/10">
          <Sparkles className="h-5 w-5 text-gold-400" />
        </div>
        <p className="flex-1 text-sm font-bold leading-relaxed text-gold-100">أهلاً بك في منظومة المذاكرة — مساعدك الذكي لتنظيم جداول قدرات وتحصيلي.</p>
      </div>
    </div>
  );
}

function AppGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gold-400" />
          <p className="text-sm text-ink-300">جاري التحميل…</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}
