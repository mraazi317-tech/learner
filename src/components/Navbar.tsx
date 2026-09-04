import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Search,
  Bell,
  User,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Shield,
  BookOpen,
  ChevronDown,
  Menu,
  X,
  Languages,
  Check,
  Building
} from 'lucide-react';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const { user, role, logout, openAuthModal, isAuthenticated } = useAuth();
  const {
    currentView,
    setCurrentView,
    setIsSearchOpen,
    setIsNotificationDrawerOpen,
    notifications,
    setIsAiTutorOpen,
    language,
    setLanguage,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const navigateToDashboard = () => {
    if (role === 'admin') setCurrentView('admin_panel');
    else if (role === 'teacher') setCurrentView('teacher_portal');
    else if (role === 'institution') setCurrentView('institution_portal');
    else setCurrentView('student_dashboard');
  };

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3 pb-2 transition-all">
      <div className="max-w-7xl mx-auto bg-white/85 backdrop-blur-md border border-[#E5E7EB]/80 rounded-full px-4 sm:px-6 py-2.5 shadow-[0_8px_30px_rgba(20,40,120,0.06)] flex items-center justify-between">
        
        {/* Brand Logo */}
        <button
          id="nav-brand-logo"
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2.5 text-left focus:outline-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2952CC] to-[#4F7DF3] flex items-center justify-center text-white shadow-sm shadow-[#2952CC]/30 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-lg sm:text-xl text-[#111827] tracking-tight flex items-center gap-1.5">
              EasiaLearn
              <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#2952CC] border border-[#2952CC]/20 hidden sm:inline-block">
                EdTech
              </span>
            </div>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#111827]">
          <button
            id="nav-link-home"
            onClick={() => setCurrentView('landing')}
            className={`transition-colors hover:text-[#2952CC] ${
              currentView === 'landing' ? 'text-[#2952CC] font-semibold' : 'text-[#64748B]'
            }`}
          >
            Home
          </button>
          
          {isAuthenticated && (
            <button
              id="nav-link-dashboard"
              onClick={navigateToDashboard}
              className={`transition-colors hover:text-[#2952CC] flex items-center gap-1 text-[#2952CC] font-semibold`}
            >
              {role === 'student' && <><BookOpen className="w-4 h-4" /> Student App</>}
              {role === 'teacher' && <><LayoutDashboard className="w-4 h-4" /> Teacher Portal</>}
              {role === 'admin' && <><Shield className="w-4 h-4" /> Admin Panel</>}
              {role === 'institution' && <><Building className="w-4 h-4" /> Institution Portal</>}
            </button>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick AI Tutor trigger */}
          <button
            id="nav-ai-tutor-btn"
            onClick={() => setIsAiTutorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#2952CC]/10 to-[#8B5CF6]/10 text-[#2952CC] border border-[#2952CC]/25 hover:from-[#2952CC]/20 hover:to-[#8B5CF6]/20 transition-all shadow-xs"
            title="Ask AI Tutor"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2952CC] animate-pulse" />
            <span className="hidden sm:inline">AI Tutor</span>
          </button>

          {/* Search Button */}
          <button
            id="nav-search-btn"
            onClick={() => setIsSearchOpen(true)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#2952CC] hover:bg-[#EAF2FF] transition-colors border border-transparent hover:border-[#2952CC]/20"
            title="Search subjects, questions & mock tests (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              id="nav-language-btn"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#2952CC] hover:bg-[#EAF2FF] transition-colors border border-transparent hover:border-[#2952CC]/20"
              title="Change Language"
            >
              <Languages className="w-4 h-4" />
            </button>
            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-1.5 z-50 animate-in fade-in zoom-in-95">
                {(['English', 'Kannada', 'Arabic'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors ${
                      language === lang ? 'bg-[#EAF2FF] text-[#2952CC] font-bold' : 'text-[#111827] hover:bg-slate-50'
                    }`}
                  >
                    <span>{lang === 'Kannada' ? 'ಕನ್ನಡ (KN)' : lang === 'Arabic' ? 'العربية (AR)' : 'English (EN)'}</span>
                    {language === lang && <Check className="w-3.5 h-3.5 text-[#2952CC]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <button
            id="nav-notifications-btn"
            onClick={() => setIsNotificationDrawerOpen(true)}
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#2952CC] hover:bg-[#EAF2FF] transition-colors border border-transparent hover:border-[#2952CC]/20"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Role Switcher Pill & Profile */}
          <div className="relative">
            <button
              id="nav-role-switcher"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] hover:border-[#2952CC]/40 transition-colors text-xs font-semibold"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${
                  role === 'admin'
                    ? 'bg-[#8B5CF6]'
                    : role === 'teacher'
                    ? 'bg-[#22C55E]'
                    : role === 'institution'
                    ? 'bg-[#F59E0B]'
                    : 'bg-[#2952CC]'
                }`}
              >
                {user?.name ? user.name[0] : 'U'}
              </div>
              <span className="capitalize text-[#111827] hidden sm:inline">{user?.name ? user.name.split(' ')[0] : 'Guest'}</span>
              <ChevronDown className="w-3 h-3 text-[#64748B]" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-2 z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-[#E5E7EB] mb-1">
                  <div className="text-xs text-[#64748B]">Signed in as</div>
                  <div className="text-sm font-bold text-[#111827] truncate">{user?.name || 'Guest User'}</div>
                  <div className="text-[11px] text-[#2952CC] font-medium truncate">{user?.email}</div>
                  {user?.status === 'Pro' && (
                    <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">PRO PLAN</span>
                  )}
                </div>

                <div className="border-t border-[#E5E7EB] mt-1 pt-1">
                  {isAuthenticated ? (
                    <button
                      onClick={() => {
                        logout();
                        setCurrentView('landing');
                        setIsRoleDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#EF4444] hover:bg-[#FDEAEA] rounded-xl text-left transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        openAuthModal('login');
                        setIsRoleDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#2952CC] hover:bg-[#EAF2FF] rounded-xl text-left transition-colors font-medium"
                    >
                      <User className="w-4 h-4" />
                      Sign In / Register
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Login/Register button if not authenticated */}
          {!isAuthenticated ? (
            <button
              id="nav-login-btn"
              onClick={() => openAuthModal('login')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#2952CC] text-white hover:bg-[#2244aa] shadow-sm shadow-[#2952CC]/30 transition-all hover:scale-[1.02]"
            >
              Sign In
            </button>
          ) : (
            <button
              id="nav-dashboard-shortcut"
              onClick={navigateToDashboard}
              className="hidden sm:inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#2952CC] text-white hover:bg-[#2244aa] shadow-sm shadow-[#2952CC]/30 transition-all hover:scale-[1.02]"
            >
              Go to App
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            id="nav-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#111827]"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-7xl mx-auto bg-white rounded-3xl p-4 shadow-2xl border border-[#E5E7EB] flex flex-col gap-2 z-50 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => {
              setCurrentView('landing');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-left hover:bg-[#F8FAFC]"
          >
            Home Landing
          </button>
          {isAuthenticated && (
            <button
              onClick={() => {
                navigateToDashboard();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-left hover:bg-[#EAF2FF] text-[#2952CC]"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
          )}
          <button
            onClick={() => {
              setIsAiTutorOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-[#EAF2FF] text-[#2952CC]"
          >
            <Sparkles className="w-4 h-4" />
            Open AI Tutor
          </button>
        </div>
      )}
    </header>
  );
};
