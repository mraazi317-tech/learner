import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Sparkles,
  Layers,
  BarChart3,
  Award,
  ShieldCheck,
  Settings,
  Flame,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle,
  PlayCircle,
  AlertTriangle,
  RotateCw,
  Plus,
  Download,
  Calendar,
  ChevronRight,
  ExternalLink,
  Search,
  Languages,
  MessageCircle,
  User,
  Copy,
  Check,
  CheckCircle2,
  Target,
  Coins,
  Users,
  QrCode,
  FileCheck,
} from 'lucide-react';
import { FlashcardLevel } from '../types';
import { generateCertificatePdf } from '../lib/fileGenerators';

import { MessengerApp } from '../components/messenger/MessengerApp';

export const StudentDashboard: React.FC = () => {
  const {
    studentTab,
    setStudentTab,
    subjects,
    lessons,
    mockTests,
    results,
    analytics,
    flashcards,
    certificates,
    badges,
    startMockTest,
    openLesson,
    setSelectedSubject,
    setCurrentView,
    updateFlashcardLevel,
    addFlashcard,
    triggerCelebration,
    setIsAiTutorOpen,
    setIsProModalOpen,
    language,
    setLanguage,
    myTeachers,
    connectTeacher,
    teacherExams,
    teacherQuizzes,
    startTeacherExam,
    easiacoins,
    addEasiacoins,
  } = useApp();

  const { user } = useAuth();

  // Flashcards state
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [newCardSubject, setNewCardSubject] = useState('Mathematics');
  const [isAddingCard, setIsAddingCard] = useState(false);

  // Settings State
  const [nameInput, setNameInput] = useState(user?.name || 'Amina Sheikh');
  const [schoolInput, setSchoolInput] = useState(user?.school || 'Sacred Heart PU College');
  const [savedSettingsMsg, setSavedSettingsMsg] = useState(false);

  // My Teachers State
  const [teacherCodeInput, setTeacherCodeInput] = useState('');
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);
  const [copiedStudentCode, setCopiedStudentCode] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedStudentCode(true);
    setTimeout(() => setCopiedStudentCode(false), 2000);
  };

  const handleConnectTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherCodeInput.trim()) return;
    connectTeacher(teacherCodeInput.trim());
    setConnectSuccess(`Successfully linked teacher with EasiaCode ${teacherCodeInput.trim().toUpperCase()}!`);
    setTeacherCodeInput('');
    triggerCelebration();
    setTimeout(() => setConnectSuccess(null), 4000);
  };

  // Interactive daily tasks
  const [dailyTasks, setDailyTasks] = useState([
    { id: 1, title: 'Quadratic Equations Practice Set', done: true, time: '20 min' },
    { id: 2, title: 'Refraction and Snell\'s Law Quiz', done: true, time: '15 min' },
    { id: 3, title: 'Flashcards: 10 Formulas Review', done: false, time: '10 min' },
  ]);

  const toggleTask = (id: number) => {
    setDailyTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const navItems = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'ai_tutor', label: 'AI Tutor', icon: Sparkles },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'my_teachers', label: 'My Teachers', icon: Users },
    { id: 'mock_tests', label: 'Quiz & Exams', icon: ClipboardCheck },
    { id: 'results', label: 'Results', icon: BarChart3 },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'easiacoins', label: 'Easiacoins', icon: Coins },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sidebar Nav */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-xs sticky top-24">
              
              {/* Student Profile Quick View */}
              <div className="flex items-center gap-3 pb-5 mb-5 border-b border-[#E5E7EB]">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2952CC] to-[#4F7DF3] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {user?.name ? user.name[0] : 'A'}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-heading font-bold text-sm text-[#111827] truncate">
                    {user?.name || 'Amina Sheikh'}
                  </h3>
                  <p className="text-[11px] text-[#64748B] truncate">{user?.school || 'Class 10 SSLC'}</p>
                </div>
              </div>

              {/* Navigation links */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = studentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setStudentTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-semibold text-xs transition-all text-left ${
                        isActive
                          ? 'bg-[#EAF2FF] text-[#2952CC] font-bold shadow-2xs'
                          : 'text-[#64748B] hover:text-[#111827] hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#2952CC]' : 'text-[#64748B]'}`} />
                      <span>{item.label}</span>
                      {item.id === 'ai_tutor' && (
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#2952CC] text-white">
                          AI
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Study Streak Widget */}
              <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3E2] text-[#F59E0B] text-xs font-bold mb-2">
                  <Flame className="w-4 h-4" />
                  <span>18-Day Streak</span>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Study 15 mins today to maintain your streak record!
                </p>
              </div>

              {/* Link Your Teacher Widget */}
              <div className="mt-6 pt-5 border-t border-[#E5E7EB]">
                <h4 className="text-xs font-bold text-gray-900 mb-2">Link Your Teacher</h4>
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="Teacher's EasiaCode" className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-blue-600 focus:outline-hidden" />
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition">Link</button>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Connect for live tests & doubts</p>
              </div>

              {/* Share Public Profile Widget */}
              {user?.username && (
                <div className="mt-6 p-4 rounded-xl border border-blue-100 bg-blue-50 text-center">
                  <h4 className="text-sm font-bold text-blue-900 mb-1">Your Public Profile</h4>
                  <p className="text-[10px] text-blue-700 mb-3 break-all">easialearn.com/{user.username}</p>
                  <button 
                    onClick={() => {
                       navigator.clipboard.writeText(`${window.location.origin}/${user.username}`);
                       alert('Profile link copied to clipboard!');
                    }}
                    className="w-full py-2 bg-white border border-blue-200 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-lg shadow-sm transition"
                  >
                    Copy Link
                  </button>
                </div>
              )}

              {/* Pro Upgrade Widget */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-amber-100 to-orange-50 border border-amber-200 text-center">
                <h4 className="text-sm font-bold text-amber-800 mb-1">EasiaLearn Pro</h4>
                <p className="text-[10px] text-amber-700 mb-3">Unlock AI Tutor & unlimited Mock Tests</p>
                <button 
                  onClick={() => setIsProModalOpen(true)}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Upgrade Now
                </button>
              </div>

            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* TAB 1: OVERVIEW */}
            {studentTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in">
                
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* 1. Study Streak */}
                  <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-xs">
                    <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold mb-2">
                      <span>Study Streak</span>
                      <Flame className="w-4 h-4 text-[#F59E0B]" />
                    </div>
                    <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#111827]">
                      {analytics.studyStreakDays} Days
                    </div>
                    <div className="text-[11px] text-[#F59E0B] font-medium">🔥 Active Today</div>
                  </div>

                  {/* 2. Today's Progress */}
                  <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-xs">
                    <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold mb-2">
                      <span>Today's Progress</span>
                      <Target className="w-4 h-4 text-[#22C55E]" />
                    </div>
                    <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#22C55E]">
                      78%
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-1 font-medium">3 of 4 Goals Complete</div>
                  </div>

                  {/* 3. Easiacoins */}
                  <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-xs">
                    <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold mb-2">
                      <span>Easiacoins</span>
                      <Coins className="w-4 h-4 text-[#2952CC]" />
                    </div>
                    <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#2952CC]">
                      1,450
                    </div>
                    <div className="text-[11px] text-[#22C55E] mt-1 font-semibold">+50 coins earned today</div>
                  </div>

                  {/* 4. Upcoming Quiz */}
                  <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-xs">
                    <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold mb-2">
                      <span>Upcoming Quiz</span>
                      <Calendar className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                    <div className="font-heading font-extrabold text-lg sm:text-xl text-[#111827] truncate">
                      Science CBT II
                    </div>
                    <div className="text-[11px] text-[#8B5CF6] font-medium">Tomorrow at 4:00 PM</div>
                  </div>
                </div>

                {/* AI Recommendation Banner */}
                <div className="bg-gradient-to-r from-[#1B2E7A] to-[#2952CC] rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6 text-[#FBBF24] animate-pulse" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[#FBBF24]">
                        Personalized AI Recommendation
                      </div>
                      <h4 className="font-heading font-bold text-base mt-0.5">
                        Focus on Quadratic Equations (Nature of Roots)
                      </h4>
                      <p className="text-xs text-white/80 mt-1 max-w-lg">
                        Based on your last mock test error pattern, revising this chapter can yield an estimated <strong>+7%</strong> score boost in your upcoming preparatory exam.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const quadLesson = lessons.find((l) => l.title.includes('Quadratic'));
                      if (quadLesson) openLesson(quadLesson.id, quadLesson.subjectId);
                    }}
                    className="px-6 py-2.5 rounded-full bg-white text-[#2952CC] hover:bg-slate-50 font-bold text-xs shrink-0 shadow-md"
                  >
                    Start Revision
                  </button>
                </div>

                {/* Grid: Daily Plan & Weekly Chart */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Daily Plan Checklist */}
                  <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading font-bold text-base text-[#111827]">Today's Study Plan</h3>
                      <span className="text-xs text-[#2952CC] font-bold bg-[#EAF2FF] px-2.5 py-0.5 rounded-full">
                        {dailyTasks.filter((t) => t.done).length} / {dailyTasks.length} Done
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {dailyTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                            task.done
                              ? 'bg-[#E7F9EF]/50 border-[#22C55E]/30 text-[#64748B]'
                              : 'bg-white border-[#E5E7EB] hover:border-[#2952CC]/40 text-[#111827]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                task.done
                                  ? 'bg-[#22C55E] border-[#22C55E] text-white'
                                  : 'border-[#CBD5E1]'
                              }`}
                            >
                              {task.done && <CheckCircle className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-xs font-semibold ${task.done ? 'line-through' : ''}`}>
                              {task.title}
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-[#64748B]">{task.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Study Hours */}
                  <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading font-bold text-base text-[#111827]">Weekly Study Hours</h3>
                      <span className="text-xs text-[#64748B]">Target: 14h / week</span>
                    </div>

                    <div className="flex items-end justify-between h-36 pt-4 gap-2">
                      {[
                        { day: 'Mon', h: 1.8 },
                        { day: 'Tue', h: 2.5 },
                        { day: 'Wed', h: 1.5 },
                        { day: 'Thu', h: 3.2 },
                        { day: 'Fri', h: 2.1 },
                        { day: 'Sat', h: 3.8 },
                        { day: 'Sun', h: 1.2 },
                      ].map((item) => (
                        <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-[#2952CC] to-[#4F7DF3]"
                            style={{ height: `${(item.h / 4) * 100}%` }}
                          />
                          <span className="text-[10px] font-semibold text-[#64748B]">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Enrolled Subjects Quick Strip */}
                <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-bold text-base text-[#111827]">My Learning Subjects</h3>
                    <button
                      onClick={() => setStudentTab('subjects')}
                      className="text-xs font-bold text-[#2952CC] hover:underline flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {subjects.slice(0, 3).map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => {
                          setSelectedSubject(sub);
                          setCurrentView('subject_detail');
                        }}
                        className="p-4 rounded-2xl border border-[#E5E7EB] hover:border-[#2952CC]/40 hover:shadow-md transition-all cursor-pointer bg-[#F8FAFC]"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs"
                            style={{ backgroundColor: sub.color }}
                          >
                            {sub.title.slice(0, 2)}
                          </div>
                          <div>
                            <h4 className="font-heading font-bold text-xs text-[#111827]">{sub.title}</h4>
                            <span className="text-[10px] text-[#64748B]">{sub.totalChapters} Chapters</span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-3">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${sub.progress}%`, backgroundColor: sub.color }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-[#64748B] mt-1 font-medium">
                          <span>Progress</span>
                          <span>{sub.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: SUBJECTS */}
            {studentTab === 'subjects' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-[#111827]">Syllabus Subjects</h2>
                    <p className="text-xs text-[#64748B]">Karnataka State Board (KSEAB) SSLC & PUC Curriculum</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjects.map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div
                          className="h-28 rounded-2xl flex items-center justify-center mb-5"
                          style={{ backgroundColor: sub.bgLight }}
                        >
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-sm"
                            style={{ backgroundColor: sub.color }}
                          >
                            {sub.title.slice(0, 2)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-heading font-bold text-base text-[#111827]">{sub.title}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sub.difficulty === 'Hard'
                                ? 'bg-[#FDEAEA] text-[#EF4444]'
                                : sub.difficulty === 'Medium'
                                ? 'bg-[#FEF3E2] text-[#F59E0B]'
                                : 'bg-[#E7F9EF] text-[#22C55E]'
                            }`}
                          >
                            {sub.difficulty}
                          </span>
                        </div>

                        <p className="text-xs text-[#64748B] line-clamp-2 mb-4 leading-relaxed">
                          {sub.description}
                        </p>
                      </div>

                      <div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-[#EAF2FF] rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${sub.progress}%`, backgroundColor: sub.color }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-[#64748B] mb-4">
                          <span>{sub.totalChapters} Chapters</span>
                          <span>{sub.progress}% Completed</span>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedSubject(sub);
                            setCurrentView('subject_detail');
                          }}
                          className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-xs transition-opacity hover:opacity-90"
                          style={{ backgroundColor: sub.color }}
                        >
                          Open Chapters & Lessons
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: MY TEACHERS */}
            {studentTab === 'my_teachers' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-[#111827]">My Teachers & Mentors</h2>
                    <p className="text-xs text-[#64748B]">Connect with certified state board teachers, take assigned CBT exams & receive feedback</p>
                  </div>
                </div>

                {/* Student's Permanent EasiaCode Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-[#1B2E7A] to-[#2952CC] text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FBBF24]">Your Student EasiaCode</span>
                    <div className="font-mono font-extrabold text-2xl tracking-wider mt-0.5">
                      {user?.easiacode || 'EA-STU-8K29Q'}
                    </div>
                    <p className="text-xs text-white/80 mt-1 max-w-lg">
                      Share this unique code with your school teachers and coaching mentors so they can enroll you in private exams, quizzes, and track your progress.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyCode(user?.easiacode || 'EA-STU-8K29Q')}
                    className="px-5 py-2.5 rounded-2xl bg-white text-[#2952CC] font-bold text-xs flex items-center gap-2 hover:bg-slate-50 shrink-0 shadow-md transition"
                  >
                    {copiedStudentCode ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedStudentCode ? 'Copied!' : 'Copy Student Code'}</span>
                  </button>
                </div>

                {/* Connect Teacher Form */}
                <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs">
                  <h3 className="font-heading font-bold text-base text-[#111827] mb-2">Connect New Teacher</h3>
                  <p className="text-xs text-[#64748B] mb-4">
                    Enter the 10-character Teacher EasiaCode (e.g., <span className="font-mono font-semibold text-[#2952CC]">EA-TCH-5P91X</span>) provided by your teacher.
                  </p>
                  <form onSubmit={handleConnectTeacher} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={teacherCodeInput}
                      onChange={(e) => setTeacherCodeInput(e.target.value)}
                      placeholder="Enter Teacher EasiaCode (e.g. EA-TCH-5P91X)"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-mono uppercase focus:border-[#2952CC] focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#2952CC] hover:bg-[#2042a8] text-white font-bold text-xs shadow-xs transition"
                    >
                      Connect Teacher
                    </button>
                  </form>
                  {connectSuccess && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{connectSuccess}</span>
                    </div>
                  )}
                </div>

                {/* Linked Teachers List */}
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-base text-[#111827]">Connected Faculty ({myTeachers.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myTeachers.map((teacher: any) => (
                      <div
                        key={teacher.id}
                        className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-sm"
                                style={{ backgroundColor: teacher.avatarColor || '#2952CC' }}
                              >
                                {teacher.name[0]}
                              </div>
                              <div>
                                <h4 className="font-heading font-bold text-base text-[#111827]">{teacher.name}</h4>
                                <div className="text-xs font-medium text-[#2952CC]">{teacher.subject}</div>
                                <div className="text-[11px] text-[#64748B] mt-0.5">{teacher.institution}</div>
                              </div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F9EF] text-[#22C55E]">
                              Connected
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-xs mb-4">
                            <span className="text-[#64748B]">Teacher Code:</span>
                            <span className="font-mono font-bold text-[#2952CC]">{teacher.easiacode}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E7EB]">
                          <button
                            onClick={() => setStudentTab('messages')}
                            className="py-2 rounded-xl bg-[#EAF2FF] text-[#2952CC] hover:bg-blue-100 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> Message
                          </button>
                          <button
                            onClick={() => setStudentTab('mock_tests')}
                            className="py-2 rounded-xl bg-[#2952CC] text-white hover:bg-[#2042a8] font-bold text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" /> View Exams
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assigned Teacher Quizzes & Exams */}
                <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-base text-[#111827]">Active Exams Assigned by Teachers</h3>
                    <span className="text-xs text-[#2952CC] font-bold bg-[#EAF2FF] px-2.5 py-0.5 rounded-full">
                      {teacherExams.length} Available
                    </span>
                  </div>

                  {teacherExams.length === 0 ? (
                    <p className="text-xs text-[#64748B] py-4 text-center">No pending exams from your teachers right now.</p>
                  ) : (
                    <div className="space-y-3">
                      {teacherExams.map((exam: any) => (
                        <div
                          key={exam.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] gap-3 hover:border-[#2952CC]/40 transition"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-[#2952CC]">{exam.subject}</span>
                              <span className="text-[11px] text-[#64748B]">• By {exam.teacherName}</span>
                              <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded-sm text-slate-700">
                                {exam.examCode}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-[#111827]">{exam.title}</h4>
                            <div className="text-[11px] text-[#64748B] mt-1">
                              {exam.totalMarks} Marks • {exam.durationMinutes} Minutes • Questions: {exam.questions?.length || 0}
                            </div>
                          </div>

                          <button
                            onClick={() => startTeacherExam(exam)}
                            className="px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-green-600 text-white font-bold text-xs shadow-xs shrink-0 transition"
                          >
                            Enter CBT Exam
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: MOCK TESTS (CBT) */}
            {studentTab === 'mock_tests' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-[#111827]">Computer-Based Mock Tests (CBT)</h2>
                    <p className="text-xs text-[#64748B]">Official board examination simulated tests with timer & negative marking</p>
                  </div>
                </div>

                {/* Teacher-Assigned CBT Section */}
                {teacherExams.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-bold text-base text-[#2952CC] flex items-center gap-2">
                        <Users className="w-4 h-4" /> Teacher-Assigned Private CBT Exams
                      </h3>
                      <span className="text-xs font-bold text-[#2952CC] bg-[#EAF2FF] px-2.5 py-0.5 rounded-full">
                        Enrolled via EasiaCode
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teacherExams.map((t: any) => (
                        <div
                          key={t.id}
                          className="bg-gradient-to-br from-blue-50/70 to-white rounded-3xl p-6 border-2 border-[#2952CC]/30 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#2952CC] text-white">
                                {t.subject}
                              </span>
                              <span className="text-xs font-semibold text-[#64748B]">{t.durationMinutes} Mins</span>
                            </div>
                            <h4 className="font-heading font-bold text-base text-[#111827] mb-1">{t.title}</h4>
                            <div className="text-xs text-[#64748B] mb-3">Assigned by: <strong>{t.teacherName}</strong> ({t.examCode})</div>
                            <div className="flex items-center gap-3 text-xs text-[#64748B] mb-4">
                              <span>{t.questions?.length || 0} Questions</span>
                              <span>•</span>
                              <span>{t.totalMarks} Total Marks</span>
                              {t.negativeMarking && (
                                <>
                                  <span>•</span>
                                  <span className="text-[#EF4444] font-medium">Negative Marking</span>
                                </>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => startTeacherExam(t)}
                            className="w-full py-2.5 rounded-xl bg-[#2952CC] hover:bg-[#2042a8] text-white font-bold text-xs shadow-xs transition"
                          >
                            Launch Teacher Exam Now
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Tests Grid */}
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-base text-[#111827]">Upcoming & Live Preparatory Tests</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockTests.map((t) => (
                      <div
                        key={t.id}
                        className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs flex flex-col justify-between hover:shadow-lg transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#2952CC]">
                              {t.subject}
                            </span>
                            <span className="text-xs font-semibold text-[#64748B]">{t.durationMinutes} Mins</span>
                          </div>
                          <h4 className="font-heading font-bold text-base text-[#111827] mb-2">{t.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-[#64748B] mb-4">
                            <span>{t.totalQuestions} Questions</span>
                            <span>•</span>
                            <span>{t.totalMarks} Total Marks</span>
                            {t.negativeMarking && (
                              <>
                                <span>•</span>
                                <span className="text-[#EF4444] font-medium">Negative Marking</span>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => startMockTest(t.id)}
                          className="w-full py-2.5 rounded-xl bg-[#22C55E] hover:bg-green-600 text-white font-bold text-xs shadow-xs"
                        >
                          Launch CBT Exam Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Past Results History */}
                <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs">
                  <h3 className="font-heading font-bold text-base text-[#111827] mb-4">Past Test History & Diagnostic Reports</h3>
                  {results.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#64748B]">
                      You haven't completed any tests yet. Click "Launch CBT Exam Now" above to begin!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {results.map((res) => (
                        <div
                          key={res.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] gap-3"
                        >
                          <div>
                            <div className="text-xs font-semibold text-[#2952CC]">{res.subject}</div>
                            <h4 className="font-bold text-sm text-[#111827]">{res.testTitle}</h4>
                            <div className="text-[11px] text-[#64748B] mt-0.5">
                              Completed: {res.date} • Accuracy: {res.accuracy}% • Time: {res.timeSpentMinutes}m
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-heading font-extrabold text-lg text-[#22C55E]">
                                {res.score} / {res.totalMarks}
                              </div>
                              <div className="text-[10px] text-[#8B5CF6] font-bold">Rank #{res.rank}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: AI TUTOR (FULL SCREEN EMBED) */}
            {studentTab === 'ai_tutor' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs animate-in fade-in space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-[#E5E7EB]">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF2FF] text-[#2952CC] mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#2952CC]" />
                      <span>Gemini 3.8 Flash Multimodal Tutor</span>
                    </div>
                    <h2 className="font-heading font-bold text-2xl text-[#111827]">EasiaLearn AI Tutor</h2>
                    <p className="text-xs text-[#64748B] mt-1">
                      Solve complex math formulas, physics derivations, chemistry balancing & Kannada grammar.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAiTutorOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-[#2952CC] text-white font-bold text-xs shadow-md shadow-[#2952CC]/25"
                  >
                    Open Dedicated Modal Window
                  </button>
                </div>

                {/* Prompt features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                    <div className="font-bold text-xs text-[#111827] mb-1">📸 Photo Solver</div>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Upload photos of textbook exercises and diagrams for step-by-step solutions.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                    <div className="font-bold text-xs text-[#111827] mb-1">🎙️ Voice Doubt Asking</div>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Speak your question naturally in Kannada, Arabic, or English.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                    <div className="font-bold text-xs text-[#111827] mb-1">📐 Math Formula Proofs</div>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      State board step-by-step marking rubric aligned derivations.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-[#F0F6FF] rounded-2xl border border-[#2952CC]/20 text-center">
                  <h4 className="font-heading font-bold text-base text-[#2952CC] mb-2">Ready to ask a question?</h4>
                  <p className="text-xs text-[#64748B] max-w-md mx-auto mb-4">
                    Our AI Tutor is initialized with the complete Karnataka SSLC & PUC syllabi.
                  </p>
                  <button
                    onClick={() => setIsAiTutorOpen(true)}
                    className="px-6 py-3 rounded-full bg-[#2952CC] text-white font-bold text-xs shadow-md shadow-[#2952CC]/30 hover:scale-105 transition-transform"
                  >
                    Launch AI Tutor Workspace
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: FLASHCARDS (SPACED REPETITION) */}
            {studentTab === 'flashcards' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-[#111827]">Spaced Repetition Flashcards</h2>
                    <p className="text-xs text-[#64748B]">Leitner Method: Retain formulas and laws permanently for exam day</p>
                  </div>
                  <button
                    onClick={() => setIsAddingCard(!isAddingCard)}
                    className="px-4 py-2 rounded-xl bg-[#2952CC] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" /> Add Flashcard
                  </button>
                </div>

                {/* Add Card Form Modal / Expandable */}
                {isAddingCard && (
                  <div className="bg-white rounded-3xl p-6 border border-[#2952CC]/30 shadow-md space-y-3">
                    <h3 className="font-heading font-bold text-sm text-[#111827]">Create New Study Flashcard</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#111827] mb-1">Front (Question / Formula Prompt)</label>
                        <input
                          type="text"
                          value={newCardFront}
                          onChange={(e) => setNewCardFront(e.target.value)}
                          placeholder="e.g. State Snell's Law"
                          className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:border-[#2952CC] focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#111827] mb-1">Subject</label>
                        <select
                          value={newCardSubject}
                          onChange={(e) => setNewCardSubject(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl bg-white focus:border-[#2952CC] focus:outline-hidden"
                        >
                          <option value="Mathematics">Mathematics</option>
                          <option value="Science">Science</option>
                          <option value="English">English</option>
                          <option value="Kannada">Kannada</option>
                          <option value="Arabic">Arabic</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">Back (Explanation / Formula)</label>
                      <textarea
                        value={newCardBack}
                        onChange={(e) => setNewCardBack(e.target.value)}
                        placeholder="e.g. sin(i) / sin(r) = constant (n2 / n1)"
                        rows={2}
                        className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:border-[#2952CC] focus:outline-hidden"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setIsAddingCard(false)}
                        className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#64748B]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (newCardFront && newCardBack) {
                            addFlashcard({
                              front: newCardFront,
                              back: newCardBack,
                              subject: newCardSubject,
                              chapter: 'Custom Revision',
                              level: 'learning',
                            });
                            setNewCardFront('');
                            setNewCardBack('');
                            setIsAddingCard(false);
                            triggerCelebration();
                          }
                        }}
                        className="px-5 py-2 rounded-xl bg-[#2952CC] text-white text-xs font-bold"
                      >
                        Save Card
                      </button>
                    </div>
                  </div>
                )}

                {/* 3D Flip Card Container */}
                {flashcards.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="w-full max-w-xl aspect-16/9 bg-white rounded-3xl border-2 border-[#2952CC]/20 shadow-xl p-8 flex flex-col justify-between cursor-pointer select-none transition-transform duration-300 hover:scale-[1.01] relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between text-xs text-[#64748B]">
                        <span className="font-semibold text-[#2952CC] uppercase tracking-wider">
                          {flashcards[activeFlashcardIndex].subject}
                        </span>
                        <span>Click anywhere to flip</span>
                      </div>

                      <div className="text-center my-auto">
                        <div className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">
                          {isFlipped ? 'Answer & Explanation' : 'Prompt / Concept'}
                        </div>
                        <div className="font-heading font-bold text-lg sm:text-2xl text-[#111827] leading-relaxed">
                          {isFlipped
                            ? flashcards[activeFlashcardIndex].back
                            : flashcards[activeFlashcardIndex].front}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#64748B] pt-4 border-t border-[#E5E7EB]">
                        <span>
                          Card {activeFlashcardIndex + 1} of {flashcards.length}
                        </span>
                        <span className="capitalize font-semibold text-[#2952CC]">
                          Bucket: {flashcards[activeFlashcardIndex].level}
                        </span>
                      </div>
                    </div>

                    {/* Leitner rating buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                      {(['learning', 'review', 'mastered'] as FlashcardLevel[]).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => {
                            updateFlashcardLevel(flashcards[activeFlashcardIndex].id, lvl);
                            setIsFlipped(false);
                            if (activeFlashcardIndex < flashcards.length - 1) {
                              setActiveFlashcardIndex((prev) => prev + 1);
                            } else {
                              setActiveFlashcardIndex(0);
                              triggerCelebration();
                            }
                          }}
                          className={`px-5 py-2.5 rounded-xl font-bold text-xs capitalize shadow-xs transition-all ${
                            lvl === 'mastered'
                              ? 'bg-[#22C55E] text-white hover:bg-green-600'
                              : lvl === 'review'
                              ? 'bg-[#F59E0B] text-white hover:bg-amber-600'
                              : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                          }`}
                        >
                          Mark as {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#64748B]">No flashcards available</div>
                )}
              </div>
            )}

            {/* TAB: MESSAGES */}
            {studentTab === 'messages' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-[#111827]">Messages</h2>
                  <p className="text-xs text-[#64748B]">Real-time chat with your linked teachers and mentors</p>
                </div>
                {/* For demonstration we hardcode a recipient. In a real app we would let them select from linked teachers. */}
                <MessengerApp />
              </div>
            )}

            {/* TAB 6: ANALYTICS */}
            {studentTab === 'analytics' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-[#111827]">Diagnostic Performance Analytics</h2>
                  <p className="text-xs text-[#64748B]">Detailed metrics, board score forecast, and targeted recovery areas</p>
                </div>

                {/* Score gauge & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs flex flex-col items-center text-center justify-center">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">
                      Predicted SSLC Board Exam Score
                    </div>
                    <div className="relative w-44 h-44 flex items-center justify-center my-2">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="65" fill="none" stroke="#EAF2FF" strokeWidth="14" />
                        <circle
                          cx="80"
                          cy="80"
                          r="65"
                          fill="none"
                          stroke="#2952CC"
                          strokeWidth="14"
                          strokeLinecap="round"
                          strokeDasharray="408.4"
                          strokeDashoffset="36.7" // 91%
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="font-heading font-extrabold text-4xl text-[#2952CC]">91%</span>
                        <span className="text-xs font-bold text-[#22C55E]">Distinction</span>
                      </div>
                    </div>
                    <div className="text-xs text-[#64748B]">
                      Projected Total: <strong>568 / 625</strong> marks
                    </div>
                  </div>

                  <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs space-y-4">
                    <h3 className="font-heading font-bold text-base text-[#111827]">Subject Accuracy Breakdown</h3>
                    {(analytics.subjectAccuracies || []).map((item) => (
                      <div key={item.subject} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-[#111827]">{item.subject}</span>
                          <span className="text-[#2952CC]">{item.accuracy}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#EAF2FF] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2952CC] rounded-full"
                            style={{ width: `${item.accuracy}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weak Chapters Warning */}
                <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                    <h3 className="font-heading font-bold text-base text-[#111827]">
                      Priority Weak Chapters Warning
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(analytics.weakChapters || []).map((ch: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-2xl bg-[#FDEAEA] border border-[#EF4444]/20">
                        <div className="text-xs font-bold text-[#EF4444]">High Priority</div>
                        <h4 className="font-bold text-sm text-[#111827] mt-1">{typeof ch === 'string' ? ch : ch.name}</h4>
                        <p className="text-[11px] text-[#64748B] mt-1">{typeof ch === 'object' && ch.impact ? ch.impact : 'Accuracy below 70% in recent tests.'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: CERTIFICATES */}
            {studentTab === 'certificates' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-[#111827]">Verified Course Certificates</h2>
                  <p className="text-xs text-[#64748B]">Download official distinction & completion certificates</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#2952CC]/20 shadow-xl relative overflow-hidden flex flex-col justify-between"
                    >
                      {/* Certificate Seal Badge */}
                      <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                        <div className="text-xs font-bold uppercase tracking-widest text-[#2952CC]">
                          EasiaLearn EdTech Institute
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-[#EAF2FF] text-[#2952CC] px-2 py-0.5 rounded-md">
                          {cert.certificateId}
                        </span>
                      </div>

                      <div className="my-6 text-center">
                        <div className="text-xs text-[#64748B] uppercase tracking-wider">This is to certify that</div>
                        <div className="font-heading font-extrabold text-2xl text-[#111827] my-1">
                          {cert.studentName || user?.name || 'Amina Sheikh'}
                        </div>
                        <div className="text-xs text-[#64748B]">has successfully achieved</div>
                        <div className="font-heading font-bold text-lg text-[#2952CC] mt-2">
                          {cert.title}
                        </div>
                        <div className="text-xs text-[#22C55E] font-bold mt-1">
                          Score: {cert.score}% • Grade: {cert.grade}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-[#E5E7EB] gap-3">
                        <div className="text-[11px] text-[#64748B]">
                          <div>Issued Date: {cert.issueDate}</div>
                          <div className="text-[10px] text-[#22C55E] font-semibold mt-0.5 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-[#22C55E]" />
                            <span>Tamper-proof QR Verified</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            triggerCelebration();
                            generateCertificatePdf(cert);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#2952CC] hover:bg-[#2042a8] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Verified PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 8: BADGES */}
            {studentTab === 'badges' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-[#111827]">Achievement Badges</h2>
                  <p className="text-xs text-[#64748B]">Unlock medals as you complete lessons, maintain streaks & master quizzes</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {badges.map((b) => (
                    <div
                      key={b.id}
                      className={`p-5 rounded-3xl border text-center transition-all ${
                        b.unlocked
                          ? 'bg-white border-[#E5E7EB] shadow-xs'
                          : 'bg-slate-50 border-dashed border-[#CBD5E1] opacity-60'
                      }`}
                    >
                      <div className="text-4xl mb-3">{b.icon}</div>
                      <h4 className="font-heading font-bold text-sm text-[#111827] mb-1">{b.name}</h4>
                      <p className="text-[11px] text-[#64748B] mb-3 leading-relaxed">{b.description}</p>
                      
                      {/* Progress */}
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full bg-[#22C55E] rounded-full"
                          style={{ width: `${(b.progress / b.maxProgress) * 100}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-[#64748B] font-semibold">
                        {b.progress} / {b.maxProgress}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: RESULTS */}
            {studentTab === 'results' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs animate-in fade-in space-y-6">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-[#111827]">Exam & Quiz Results</h2>
                  <p className="text-xs text-[#64748B]">Review your past mock tests, accuracy analytics, and rankings</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                    <div className="text-xs text-[#64748B] font-semibold">Tests Completed</div>
                    <div className="font-heading font-extrabold text-2xl text-[#2952CC] mt-1">{results.length || 3}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                    <div className="text-xs text-[#64748B] font-semibold">Average Accuracy</div>
                    <div className="font-heading font-extrabold text-2xl text-[#22C55E] mt-1">84.5%</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                    <div className="text-xs text-[#64748B] font-semibold">Current State Rank</div>
                    <div className="font-heading font-extrabold text-2xl text-[#8B5CF6] mt-1">#{analytics.stateRank}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#111827]">Scorecards</h3>
                  {results.map((res) => (
                    <div
                      key={res.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] gap-3 hover:border-[#2952CC]/40 transition"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#2952CC]">{res.subject}</div>
                        <h4 className="font-bold text-sm text-[#111827]">{res.testTitle}</h4>
                        <div className="text-[11px] text-[#64748B] mt-0.5">
                          Date: {res.date} • Accuracy: {res.accuracy}% • Time: {res.timeSpentMinutes} min
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-heading font-extrabold text-xl text-[#22C55E]">
                          {res.score} / {res.totalMarks}
                        </div>
                        <div className="text-[10px] text-[#8B5CF6] font-bold">Rank #{res.rank}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: EASIACOINS */}
            {studentTab === 'easiacoins' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs animate-in fade-in space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-[#111827]">Easiacoins Rewards</h2>
                    <p className="text-xs text-[#64748B]">Earn Easiacoins by maintaining study streaks and scoring high on quizzes</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200">
                    <Coins className="w-5 h-5 text-amber-600" />
                    <span className="font-heading font-extrabold text-xl text-amber-700">1,450 Coins</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60">
                    <div className="text-xs font-bold text-amber-800">Streak Bonus</div>
                    <div className="text-sm font-semibold text-[#111827] mt-1">+10 coins every day</div>
                    <div className="text-[11px] text-[#64748B] mt-1">Current streak: 18 days</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/60">
                    <div className="text-xs font-bold text-blue-800">CBT Top Performer</div>
                    <div className="text-sm font-semibold text-[#111827] mt-1">+50 coins per test</div>
                    <div className="text-[11px] text-[#64748B] mt-1">Scores above 85%</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60">
                    <div className="text-xs font-bold text-emerald-800">Flashcard Mastery</div>
                    <div className="text-sm font-semibold text-[#111827] mt-1">+5 coins per deck</div>
                    <div className="text-[11px] text-[#64748B] mt-1">10 formulas mastered</div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                  <h3 className="font-bold text-sm text-[#111827] mb-2">Redeem Easiacoins</h3>
                  <p className="text-xs text-[#64748B] mb-4">
                    Use your Easiacoins to redeem official verified mock test series, special AI Tutor tokens, or platform merchandise!
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-[#111827]">SSLC Board Booster Mock Pack</div>
                        <div className="text-[10px] text-[#64748B]">3 Full CBT simulated exams</div>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg bg-[#2952CC] text-white font-bold text-xs hover:bg-[#2042a8]">
                        500 Coins
                      </button>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-[#111827]">AI Deep Reasoning Token Pack</div>
                        <div className="text-[10px] text-[#64748B]">100 multimodal queries</div>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg bg-[#2952CC] text-white font-bold text-xs hover:bg-[#2042a8]">
                        300 Coins
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PROFILE (SHOW EASIACODE INSIDE PROFILE) */}
            {(studentTab === 'profile' || studentTab === 'settings') && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs animate-in fade-in space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-[#111827]">Student Profile</h2>
                    <p className="text-xs text-[#64748B]">Manage your academic credentials, school registration, and EasiaCode</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      10-Day Free Trial Active
                    </span>
                  </div>
                </div>

                {/* PROMINENT EASIACODE DISPLAY */}
                <div className="p-5 rounded-2xl bg-[#EAF2FF] border-2 border-[#2952CC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-[#2952CC] uppercase tracking-wider">
                      Your Permanent Student EasiaCode
                    </div>
                    <div className="font-mono font-extrabold text-2xl text-[#111827] mt-1">
                      {user?.easiacode || 'EA-STU-8K29Q'}
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      Share this code with your teacher to get enrolled into faculty classrooms and assignments.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user?.easiacode || 'EA-STU-8K29Q');
                      alert('EasiaCode copied to clipboard!');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#2952CC] hover:bg-[#2042a8] text-white text-xs font-bold flex items-center gap-2 shrink-0 shadow-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy EasiaCode</span>
                  </button>
                </div>

                {savedSettingsMsg && (
                  <div className="p-3 bg-[#E7F9EF] text-[#22C55E] rounded-2xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Profile settings successfully saved!</span>
                  </div>
                )}

                {/* Profile Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:border-[#2952CC] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">Username</label>
                    <input
                      type="text"
                      disabled
                      value={user?.username ? `@${user.username}` : '@amina_sslc'}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E5E7EB] bg-slate-50 text-[#64748B] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">Email Address</label>
                    <input
                      type="text"
                      disabled
                      value={user?.email || 'student@easialearn.com'}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E5E7EB] bg-slate-50 text-[#64748B] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">Phone / WhatsApp</label>
                    <input
                      type="text"
                      disabled
                      value={user?.phone || '+91 98765 43210'}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E5E7EB] bg-slate-50 text-[#64748B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">School / College Name</label>
                    <input
                      type="text"
                      value={schoolInput}
                      onChange={(e) => setSchoolInput(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:border-[#2952CC] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">Guardian Name</label>
                    <input
                      type="text"
                      disabled
                      value={user?.guardianName || 'M. Sheikh'}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E5E7EB] bg-slate-50 text-[#64748B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">Class / Grade</label>
                    <input
                      type="text"
                      disabled
                      value={user?.class || 'Class 10 (SSLC)'}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E5E7EB] bg-slate-50 text-[#64748B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">Preferred AI Tutor Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E5E7EB] bg-white focus:border-[#2952CC] focus:outline-hidden"
                    >
                      <option value="English">English (EN)</option>
                      <option value="Kannada">ಕನ್ನಡ (KN) - Karnataka State Board</option>
                      <option value="Arabic">العربية (AR) - Islamic Studies & Arabic Medium</option>
                    </select>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setSavedSettingsMsg(true);
                      setTimeout(() => setSavedSettingsMsg(false), 2000);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#2952CC] hover:bg-[#2244aa] text-white font-bold text-xs shadow-md shadow-[#2952CC]/25"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
};
