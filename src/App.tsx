import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { SearchModal } from './components/SearchModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AiTutorDrawer } from './components/AiTutorDrawer';

// Views
import { LandingView } from './views/LandingView';
import { StudentDashboard } from './views/StudentDashboard';
import { TeacherPortal } from './views/TeacherPortal';
import { AdminPanel } from './views/AdminPanel';
import { InstitutionPortal } from './views/InstitutionPortal';
import { CbtMockTestView } from './views/CbtMockTestView';
import { LessonPlayerView } from './views/LessonPlayerView';
import { SubjectDetailView } from './views/SubjectDetailView';
import { Sparkles } from 'lucide-react';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { PublicProfileView } from './views/PublicProfileView';
import { LiveClassroomModal } from './components/classroom/LiveClassroomModal';

const MainContent: React.FC = () => {
  const {
    currentView,
    setIsAiTutorOpen,
    isProModalOpen,
    setIsProModalOpen,
    isLiveClassroomOpen,
    activeLiveClass,
    leaveLiveClass,
  } = useApp();

  const path = window.location.pathname;
  const isProfileRoute = path.length > 1 && !path.startsWith('/api') && !path.startsWith('/admin');

  if (isProfileRoute) {
    return <PublicProfileView username={path.substring(1)} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col relative text-[#111827]">
      {/* Universal Navbar (Hidden during fullscreen CBT exam for test security) */}
      {currentView !== 'cbt_test' && <Navbar />}

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && <LandingView />}
        {currentView === 'student_dashboard' && <StudentDashboard />}
        {currentView === 'teacher_portal' && <TeacherPortal />}
        {currentView === 'admin_panel' && <AdminPanel />}
        {currentView === 'institution_portal' && <InstitutionPortal />}
        {currentView === 'cbt_test' && <CbtMockTestView />}
        {currentView === 'lesson_player' && <LessonPlayerView />}
        {currentView === 'subject_detail' && <SubjectDetailView />}
      </main>

      {/* Floating Global AI Tutor Quick Launcher (available across any screen) */}
      {currentView !== 'cbt_test' && (
        <button
          id="global-floating-ai-btn"
          onClick={() => setIsAiTutorOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-full bg-gradient-to-r from-[#2952CC] to-[#4F7DF3] text-white font-semibold text-xs sm:text-sm shadow-xl shadow-[#2952CC]/35 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all group"
          title="Ask AI Doubt Solver"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#FBBF24] group-hover:rotate-12 transition-transform" />
          </div>
          <span>Ask AI Tutor</span>
        </button>
      )}

      {/* Modals and Drawers */}
      <AuthModal />
      <SearchModal />
      <NotificationDrawer />
      <AiTutorDrawer />
      <ProUpgradeModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
}
