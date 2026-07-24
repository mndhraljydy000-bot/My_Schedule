import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import Home from './pages/Home';
import QiyasSection from './pages/QiyasSection';
import TahsiliSection from './pages/TahsiliSection';
import MySchedule from './pages/MySchedule';

function AppContent() {
  const { page, showScheduleExists, setShowScheduleExists, pendingPage, clearSchedule, setPage } = useApp();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {page === 'home' && <Home />}
        {page === 'qiyas' && <QiyasSection />}
        {page === 'tahsili' && <TahsiliSection />}
        {page === 'schedule' && <MySchedule />}
      </main>
      <Footer />
      <DeleteConfirmDialog
        open={showScheduleExists}
        onClose={() => setShowScheduleExists(false)}
        onConfirm={() => { setShowScheduleExists(false); clearSchedule(); if (pendingPage) setPage(pendingPage); }}
        title="يوجد جدول حالي"
        message="لديك جدول مذاكرة نشط حالياً. يجب حذفه أولاً قبل إنشاء جدول جديد. هل تريد حذف الجدول الحالي؟"
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
