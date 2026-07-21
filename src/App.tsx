import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import QiyasSection from './pages/QiyasSection';
import TahsiliSection from './pages/TahsiliSection';
import MySchedule from './pages/MySchedule';

function AppContent() {
  const { page } = useApp();
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
