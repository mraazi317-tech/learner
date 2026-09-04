import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Bell,
  CheckCheck,
  Clock,
  Award,
  BookOpen,
  AlertCircle,
  Trash2,
  Users,
  FileCheck,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    setCurrentView,
    setStudentTab,
  } = useApp();

  if (!isNotificationDrawerOpen) return null;

  const handleNotificationClick = (notif: any) => {
    markNotificationAsRead(notif.id);
    setCurrentView('student_dashboard');
    if (notif.linkTab) {
      setStudentTab(notif.linkTab);
    } else if (notif.type === 'exam_available' || notif.type === 'quiz_available') {
      setStudentTab('mock_tests');
    } else if (notif.type === 'teacher_added') {
      setStudentTab('my_teachers');
    } else if (notif.type === 'badge_earned') {
      setStudentTab('badges');
    } else if (notif.title?.toLowerCase().includes('certificate')) {
      setStudentTab('certificates');
    }
    setIsNotificationDrawerOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'badge_earned':
        return <Award className="w-5 h-5 text-[#F59E0B]" />;
      case 'exam_reminder':
      case 'exam_available':
        return <FileCheck className="w-5 h-5 text-[#2952CC]" />;
      case 'quiz_available':
        return <HelpCircle className="w-5 h-5 text-[#8B5CF6]" />;
      case 'teacher_added':
        return <Users className="w-5 h-5 text-[#22C55E]" />;
      case 'lesson_uploaded':
        return <BookOpen className="w-5 h-5 text-[#2952CC]" />;
      default:
        return <Bell className="w-5 h-5 text-[#22C55E]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-[#E5E7EB] animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] text-[#2952CC] flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-[#111827]">Notifications</h2>
              <p className="text-xs text-[#64748B]">Real-time board exam updates & teacher alerts</p>
            </div>
          </div>
          <button
            onClick={() => setIsNotificationDrawerOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748B] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-2.5 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between text-xs">
          <span className="text-[#64748B]">
            {notifications.filter((n) => !n.read).length} unread alerts
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllNotificationsAsRead}
              className="flex items-center gap-1 text-[#2952CC] font-semibold hover:underline"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
            <button
              onClick={clearAllNotifications}
              className="flex items-center gap-1 text-[#EF4444] font-semibold hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-[#64748B]">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No new notifications</p>
              <p className="text-xs">You're all caught up with your studies!</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  n.read
                    ? 'bg-white border-[#E5E7EB] opacity-75 hover:opacity-100'
                    : 'bg-[#F4F7FF] border-[#2952CC]/25 shadow-xs'
                }`}
              >
                {!n.read && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#2952CC]" />
                )}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 pr-4">
                    <div className="text-xs font-semibold text-[#111827]">{n.title}</div>
                    <div className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{n.message}</div>
                    <div className="text-[10px] text-[#64748B]/70 font-medium mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {n.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] text-center text-xs text-[#64748B]">
          Connected to EasiaLearn Firebase Realtime Updates
        </div>
      </div>
    </div>
  );
};
