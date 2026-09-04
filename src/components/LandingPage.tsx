import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Flame,
  BookOpen,
  ArrowRight,
  Bot,
  Camera,
  ClipboardCheck,
  FileText,
  Layers,
  BarChart3,
  Sigma,
  FlaskConical,
  BookA,
  Globe,
  Languages,
  BookOpenText,
  CalendarCheck2,
  Check,
  Sparkles,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  GraduationCap,
  Play,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { setCurrentView, setStudentTab, setSelectedSubject, subjects, startMockTest, setIsAiTutorOpen } = useApp();
  const { openAuthModal } = useAuth();

  // Interactive Mock Test Preview state
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [mockTimerSeconds, setMockTimerSeconds] = useState(2538); // 42m 18s

  useEffect(() => {
    const timer = setInterval(() => {
      setMockTimerSeconds((prev) => (prev > 0 ? prev - 1 : 2538));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSubjectClick = (subjectId: string) => {
    const sub = subjects.find((s) => s.id === subjectId) || subjects[0];
    setSelectedSubject(sub);
    setCurrentView('student_dashboard');
    setStudentTab('subjects');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-12 bg-[radial-gradient(1100px_500px_at_78%_-10%,rgba(79,125,243,0.14),transparent_60%)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Left Text */}
          <div className="space-y-6">
            <span className="inline-block px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-[#2952CC] bg-[#EAF2FF] border border-blue-100">
              🎓 Your Smart Exam Journey Starts Here
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
              Learn Easier.
              <span className="block text-[#2952CC]">Score Higher.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Master SSLC, PUC, and competitive exams with personalized learning, 10-year solved previous papers, real CBT mock tests, and intelligent AI progress diagnostics.
            </p>

            <div className="flex flex-wrap gap-3.5 pt-2">
              <button
                onClick={() => {
                  setCurrentView('student_dashboard');
                  setStudentTab('overview');
                }}
                className="px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold text-white bg-[#2952CC] hover:bg-blue-800 shadow-lg shadow-blue-700/25 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2"
                id="hero-start-learning-btn"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Learning
              </button>
              <a
                href="#subjects-section"
                className="px-6 py-3.5 rounded-full text-sm sm:text-base font-semibold text-[#2952CC] bg-white border border-slate-200 hover:border-[#2952CC] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 shadow-sm"
              >
                Explore Courses
              </a>
            </div>

            {/* Stat Badges */}
            <div className="flex flex-wrap gap-6 pt-4 text-xs sm:text-sm font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎓</span>
                <span>50,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <span>90%+ Success Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📚</span>
                <span>2,000+ Video Lessons</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual with Floating Glass Cards */}
          <div className="relative flex justify-center order-first lg:order-last">
            <div className="relative w-full max-w-[380px] aspect-[4/4.6] rounded-[36px] overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-50 border border-blue-200/60 shadow-2xl shadow-blue-900/10">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&h=800&fit=crop"
                alt="Student studying with EasiaLearn"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Floating Metric 1 */}
            <div className="hidden sm:flex absolute -top-4 -left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-blue-50 animate-float">
              <div className="space-y-0.5">
                <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  Predicted Score
                </div>
                <div className="text-xl font-extrabold text-emerald-600 font-heading">91%</div>
              </div>
            </div>

            {/* Floating Metric 2 */}
            <div className="hidden sm:flex absolute top-1/3 -right-6 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-blue-50 animate-float-delayed">
              <div className="space-y-0.5">
                <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Study Streak
                </div>
                <div className="text-xl font-extrabold text-slate-900 font-heading">18 Days</div>
              </div>
            </div>

            {/* Floating Metric 3 */}
            <div className="hidden sm:flex absolute -bottom-4 -left-2 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-blue-50 animate-float">
              <div className="space-y-0.5">
                <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#2952CC]" />
                  Today's Goal
                </div>
                <div className="text-xs font-bold text-slate-800">Quadratic Lesson Ready</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WAVE BANNER */}
      <div className="relative overflow-hidden">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="w-full h-12 block">
          <path fill="#1B2E7A" d="M0,40 C360,100 1080,-10 1440,50 L1440,90 L0,90 Z"></path>
        </svg>
        <div className="bg-gradient-to-r from-[#1B2E7A] via-[#243D9E] to-[#2952CC] py-16 text-center text-white relative">
          <div className="max-w-3xl mx-auto px-4 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
              Learn smarter with EasiaLearn.
            </h2>
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
              Thousands of structured lessons, CBT mock exams, and daily spaced repetition in one seamless platform.
            </p>
          </div>
        </div>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-10 block">
          <path fill="#F8FAFC" d="M0,20 C400,90 1100,0 1440,40 L1440,0 L0,0 Z"></path>
        </svg>
      </div>

      {/* TRUST LOGOS & STATS */}
      <section className="py-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Trusted by Ambitious SSLC & PUC Institutions
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-6">
              {["St. Mary's High School", 'DPS Group', 'Vidya PU College', 'Sacred Heart PU', 'St. Aloysius Composite'].map(
                (school, i) => (
                  <div
                    key={i}
                    className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 shadow-sm"
                  >
                    {school}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/80 shadow-sm hover:-translate-y-1 transition-transform">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#2952CC] font-heading">50K+</div>
              <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">Active Students</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/80 shadow-sm hover:-translate-y-1 transition-transform">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#2952CC] font-heading">2,000+</div>
              <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">Video Lessons</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/80 shadow-sm hover:-translate-y-1 transition-transform">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#2952CC] font-heading">5,000+</div>
              <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">Practice Questions</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/80 shadow-sm hover:-translate-y-1 transition-transform">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-heading">92%</div>
              <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">Average Improvement</div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-12 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
              Everything You Need to Score Higher
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              A comprehensive toolkit engineered around the state board syllabus and CBT exam patterns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div
              onClick={() => setIsAiTutorOpen(true)}
              className="group cursor-pointer bg-[#F8FAFC] rounded-2xl p-7 border border-slate-200 hover:border-transparent hover:shadow-xl hover:shadow-blue-900/10 hover:-translate-y-1.5 transition-all"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#2952CC] to-[#4F7DF3] text-white flex items-center justify-center mb-5 shadow-md shadow-blue-500/20">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#2952CC] transition-colors">
                AI Tutor with Math & Multilingual Support
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-5">
                Ask any doubt in English, Kannada, or Arabic. Get step-by-step theorem derivations, formulas, and board exam marking rubrics.
              </p>
              <div className="w-9 h-9 rounded-full bg-[#EAF2FF] text-[#2952CC] flex items-center justify-center group-hover:bg-[#2952CC] group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Feature 2 */}
            <div
              onClick={() => setIsAiTutorOpen(true)}
              className="group cursor-pointer bg-[#F8FAFC] rounded-2xl p-7 border border-slate-200 hover:border-transparent hover:shadow-xl hover:shadow-emerald-900/10 hover:-translate-y-1.5 transition-all"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#4ADE80] text-white flex items-center justify-center mb-5 shadow-md shadow-emerald-500/20">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                Photo Doubt Solver
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-5">
                Snap or upload a textbook question photo. Our multimodal model breaks down the diagram and writes out the step-by-step resolution.
              </p>
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Feature 3 */}
            <div
              onClick={() => startMockTest('mock_sslc_math_01')}
              className="group cursor-pointer bg-[#F8FAFC] rounded-2xl p-7 border border-slate-200 hover:border-transparent hover:shadow-xl hover:shadow-amber-900/10 hover:-translate-y-1.5 transition-all"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] text-white flex items-center justify-center mb-5 shadow-md shadow-amber-500/20">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                CBT Mock Exam Simulations
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-5">
                Practice in an authentic Computer Based Test interface with real countdown timers, question palettes, and negative marking analysis.
              </p>
              <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Feature 4 */}
            <div
              onClick={() => {
                setCurrentView('student_dashboard');
                setStudentTab('subjects');
              }}
              className="group cursor-pointer bg-[#F8FAFC] rounded-2xl p-7 border border-slate-200 hover:border-transparent hover:shadow-xl hover:shadow-blue-900/10 hover:-translate-y-1.5 transition-all"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#4F7DF3] to-[#818CF8] text-white flex items-center justify-center mb-5 shadow-md shadow-blue-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                10-Year Solved Board Papers
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-5">
                Organized chapter by chapter with official marking schemes, model answers, and high-frequency repeated questions flagged.
              </p>
              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Feature 5 */}
            <div
              onClick={() => {
                setCurrentView('student_dashboard');
                setStudentTab('flashcards');
              }}
              className="group cursor-pointer bg-[#F8FAFC] rounded-2xl p-7 border border-slate-200 hover:border-transparent hover:shadow-xl hover:shadow-red-900/10 hover:-translate-y-1.5 transition-all"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#EF4444] to-[#F87171] text-white flex items-center justify-center mb-5 shadow-md shadow-red-500/20">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">
                Spaced Repetition Flashcards
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-5">
                Master crucial formulas and scientific definitions. Spaced intervals (New, Learning, Review, Mastered) ensure long-term retention.
              </p>
              <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Feature 6 */}
            <div
              onClick={() => {
                setCurrentView('student_dashboard');
                setStudentTab('analytics');
              }}
              className="group cursor-pointer bg-[#F8FAFC] rounded-2xl p-7 border border-slate-200 hover:border-transparent hover:shadow-xl hover:shadow-sky-900/10 hover:-translate-y-1.5 transition-all"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-[#38BDF8] text-white flex items-center justify-center mb-5 shadow-md shadow-sky-500/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">
                AI Predictive Analytics & Weak Topic Detection
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-5">
                Receive weekly predicted board score gauges and targeted micro-action plans pinpointing exact weak topics for high mark gains.
              </p>
              <div className="w-9 h-9 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORE SUBJECTS SECTION */}
      <section id="subjects-section" className="py-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 font-heading">Explore Subjects</h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Curated chapters, video walkthroughs, and practice question banks for core subjects.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div
                    className="h-28 rounded-xl flex items-center justify-center mb-5 transition-transform hover:scale-102"
                    style={{ backgroundColor: sub.bgLight }}
                  >
                    {sub.id === 'sub_math' && <Sigma className="w-12 h-12" style={{ color: sub.color }} />}
                    {sub.id === 'sub_sci' && <FlaskConical className="w-12 h-12" style={{ color: sub.color }} />}
                    {sub.id === 'sub_eng' && <BookA className="w-12 h-12" style={{ color: sub.color }} />}
                    {sub.id === 'sub_soc' && <Globe className="w-12 h-12" style={{ color: sub.color }} />}
                    {sub.id === 'sub_kan' && <Languages className="w-12 h-12" style={{ color: sub.color }} />}
                    {sub.id === 'sub_ara' && <BookOpenText className="w-12 h-12" style={{ color: sub.color }} />}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{sub.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sub.description}</p>

                  <div className="flex items-center gap-3 my-4">
                    <span className="text-xs font-semibold text-slate-500">{sub.totalChapters} Chapters</span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        sub.difficulty === 'Hard'
                          ? 'bg-red-50 text-red-600'
                          : sub.difficulty === 'Medium'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {sub.difficulty}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleSubjectClick(sub.id)}
                  className="w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-[#EAF2FF] text-[#2952CC] hover:bg-[#2952CC] hover:text-white transition-all shadow-sm"
                >
                  Continue Learning
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DAILY STUDY PLAN COMPONENT */}
      <section className="py-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr]">
          <div className="bg-gradient-to-br from-[#EAF2FF] to-white p-8 sm:p-12 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
            <div className="w-44 h-44 rounded-3xl bg-white shadow-xl shadow-blue-900/10 flex flex-col items-center justify-center text-[#2952CC] p-4 text-center">
              <CalendarCheck2 className="w-16 h-16 text-[#2952CC] mb-2" />
              <span className="text-xs font-bold text-slate-700">Daily Study Tracker</span>
              <span className="text-[11px] text-slate-400">Class 10 Target</span>
            </div>
          </div>

          <div className="p-8 sm:p-10 space-y-5">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">Today's Study Plan</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3.5 py-2.5 border-b border-slate-100">
                <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="text-sm font-semibold text-slate-800">Mathematics — Quadratic Formulations</div>
                <div className="ml-auto text-xs font-medium text-slate-400">25 min</div>
              </div>

              <div className="flex items-center gap-3.5 py-2.5 border-b border-slate-100">
                <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="text-sm font-semibold text-slate-800">Science — Plaster of Paris & Reactions</div>
                <div className="ml-auto text-xs font-medium text-slate-400">20 min</div>
              </div>

              <div className="flex items-center gap-3.5 py-2.5 border-b border-slate-100">
                <div className="w-5 h-5 rounded-md border-2 border-slate-300"></div>
                <div className="text-sm font-semibold text-slate-800">English — Prose Summary Revision</div>
                <div className="ml-auto text-xs font-medium text-slate-400">15 min</div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-500">Plan Progress</span>
                <span className="text-[#2952CC]">60% Completed</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-blue-50 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#2952CC] to-[#4F7DF3] w-[60%]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI ANALYTICS DASHBOARD PREVIEW */}
      <section className="py-16 px-4 sm:px-6 lg:px-12 bg-white border-y border-slate-200/60">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 font-heading">Personal Learning Analytics</h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Calculated automatically from your daily quizzes, study streak, and mock test accuracy.
            </p>
          </div>

          <div className="bg-[#F8FAFC] rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Gauge */}
              <div className="flex flex-col items-center text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Predicted SSLC Score
                </div>
                <div className="relative flex items-center justify-center">
                  <svg width="160" height="160" viewBox="0 0 150 150">
                    <circle cx="75" cy="75" r="62" fill="none" stroke="#EAF2FF" strokeWidth="14" />
                    <circle
                      cx="75"
                      cy="75"
                      r="62"
                      fill="none"
                      stroke="#2952CC"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray="389.5"
                      strokeDashoffset="35"
                      transform="rotate(-90 75 75)"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-[#2952CC] font-heading">91%</span>
                    <span className="text-[10px] font-bold text-emerald-600">Top 1% State</span>
                  </div>
                </div>
                <span className="mt-3 text-xs text-slate-500">Based on 4 full CBT exams</span>
              </div>

              {/* Weekly study chart */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Weekly Study Hours
                </div>
                <div className="flex items-end gap-2.5 h-36 pt-4 px-2">
                  {[
                    { day: 'Mon', h: 60 },
                    { day: 'Tue', h: 95 },
                    { day: 'Wed', h: 70 },
                    { day: 'Thu', h: 120 },
                    { day: 'Fri', h: 85 },
                    { day: 'Sat', h: 135 },
                    { day: 'Sun', h: 50 },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-[#2952CC] to-[#4F7DF3] hover:opacity-80 transition-opacity"
                        style={{ height: `${bar.h}px` }}
                      />
                      <span className="text-[11px] font-medium text-slate-400">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weak Chapters */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  AI Weak Chapters Identified
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="text-xs font-semibold text-slate-800">Quadratic Equations</span>
                    </div>
                    <span className="text-[11px] font-bold text-red-500">-4% risk</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-xs font-semibold text-slate-800">Trigonometry Heights</span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-500">-3% risk</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="text-xs font-semibold text-slate-800">Light Ray Diagrams</span>
                    </div>
                    <span className="text-[11px] font-bold text-blue-500">-2% risk</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendation Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#EAF2FF] to-blue-50 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2952CC]">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  AI Personalized Recommendation
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Focus on Quadratic Equations & Discriminant Evaluation today. Estimated board improvement: +7%.
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentView('student_dashboard');
                  setStudentTab('subjects');
                }}
                className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-[#2952CC] hover:bg-blue-800 transition-colors shadow-sm whitespace-nowrap"
              >
                Start Targeted Revision
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE MOCK TEST PREVIEW (CBT) */}
      <section id="mocktest" className="py-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 font-heading">Real CBT Exam Interface</h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Practice on an authentic Computer-Based Test console matching KSEAB state board and competitive standards.
            </p>
          </div>

          {/* CBT Console Shell */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            {/* Top Bar */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="text-sm sm:text-base font-bold text-slate-800">
                SSLC Mathematics — Mock Test 4 (Interactive Preview)
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4" />
                <span>{formatTimer(mockTimerSeconds)} remaining</span>
              </div>
            </div>

            {/* CBT Body */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_260px]">
              {/* Question area */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Question 12 of 30</span>
                  <p className="text-base sm:text-lg font-semibold text-slate-900 mt-2">
                    If the roots of the equation x² − 7x + k = 0 are equal, what is the value of k?
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {[
                    { letter: 'A', text: '12.25' },
                    { letter: 'B', text: '10' },
                    { letter: 'C', text: '14' },
                    { letter: 'D', text: '7' },
                  ].map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedOption(i)}
                      className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3.5 text-sm font-medium transition-all ${
                        selectedOption === i
                          ? 'border-[#2952CC] bg-[#EAF2FF] text-[#2952CC] font-semibold'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                          selectedOption === i
                            ? 'bg-[#2952CC] text-white border-[#2952CC]'
                            : 'border-slate-300 text-slate-600'
                        }`}
                      >
                        {opt.letter}
                      </div>
                      <span>{opt.text}</span>
                    </button>
                  ))}
                </div>

                {/* Question Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <button className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5" />
                    Mark for Review
                  </button>
                  <button
                    onClick={() => startMockTest('mock_sslc_math_01')}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#2952CC] hover:bg-blue-800 flex items-center gap-1.5 shadow-sm"
                  >
                    Open Full CBT Mode
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Palette Sidebar */}
              <div className="bg-slate-50 p-6 border-t md:border-t-0 md:border-l border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Question Palette
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((q) => {
                      const isAnswered = [1, 2, 4, 6, 8, 10, 11].includes(q);
                      const isReview = [3, 9].includes(q);
                      const isCurrent = q === 12;

                      return (
                        <div
                          key={q}
                          className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-[#2952CC] text-white ring-2 ring-blue-300 ring-offset-1'
                              : isAnswered
                              ? 'bg-emerald-500 text-white'
                              : isReview
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {q}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => startMockTest('mock_sslc_math_01')}
                  className="w-full mt-6 py-2.5 rounded-xl font-bold text-xs bg-[#2952CC] text-white hover:bg-blue-800 shadow-md transition-colors"
                >
                  Start Timed Test
                </button>
              </div>
            </div>

            {/* Bottom stats summary */}
            <div className="bg-white px-6 py-3.5 border-t border-slate-100 flex flex-wrap gap-6 text-xs text-slate-500">
              <div>
                Overall Accuracy: <b className="text-slate-800">88%</b>
              </div>
              <div>
                Time Elapsed: <b className="text-slate-800">42 min</b>
              </div>
              <div>
                Answered: <b className="text-emerald-600">11/15</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 px-4 sm:px-6 lg:px-12 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 font-heading">Students Who Improved</h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Verified board exam results from students preparing with EasiaLearn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#F8FAFC] rounded-2xl p-7 border border-slate-200 hover:-translate-y-1 transition-all">
              <div className="text-amber-400 text-sm mb-3">★★★★★</div>
              <p className="text-sm text-slate-700 leading-relaxed mb-6">
                "The mock tests felt exactly like the real exam. I stopped panicking about time management and started finishing 15 minutes early!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2952CC] to-[#4F7DF3] text-white font-bold flex items-center justify-center text-sm">
                  A
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Amina Sheikh</div>
                  <div className="text-[11px] text-slate-500">Sacred Heart PU College</div>
                </div>
                <div className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#2952CC]">
                  68% → 93%
                </div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl p-7 border border-slate-200 hover:-translate-y-1 transition-all">
              <div className="text-amber-400 text-sm mb-3">★★★★★</div>
              <p className="text-sm text-slate-700 leading-relaxed mb-6">
                "The AI tutor explained trigonometry theorems better than three coaching institutes combined. I finally understood why the formulas work."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-sm">
                  R
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Rahul Shenoy</div>
                  <div className="text-[11px] text-slate-500">St. Aloysius School</div>
                </div>
                <div className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                  72% → 89%
                </div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl p-7 border border-slate-200 hover:-translate-y-1 transition-all">
              <div className="text-amber-400 text-sm mb-3">★★★★★</div>
              <p className="text-sm text-slate-700 leading-relaxed mb-6">
                "Seeing my weak chapters highlighted every week kept me accountable. I stopped guessing what to revise and followed the exact AI study plan."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold flex items-center justify-center text-sm">
                  S
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Sneha Patil</div>
                  <div className="text-[11px] text-slate-500">Vidya Mandir PU College</div>
                </div>
                <div className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700">
                  64% → 90%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-[#2952CC] via-[#3D65E0] to-[#4F7DF3] p-10 sm:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight">
              Ready to Achieve 90%+ in Your Board Exams?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Join thousands of students learning easier and scoring higher. Get instant access to CBT tests, AI doubt resolution, and complete chapter notes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => openAuthModal('register')}
                className="px-8 py-3.5 rounded-full text-sm sm:text-base font-bold bg-white text-[#2952CC] hover:bg-blue-50 shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Start Free Today
              </button>
              <button
                onClick={() => {
                  setCurrentView('student_dashboard');
                  setStudentTab('overview');
                }}
                className="px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold bg-white/15 text-white border border-white/40 hover:bg-white/25 backdrop-blur-md transition-all"
              >
                View Live Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 font-extrabold text-xl text-slate-900">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2952CC] to-[#4F7DF3] flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span>
                Easia<span className="text-[#2952CC]">Learn</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
              Helping SSLC, PUC, and competitive exam students learn easier and score higher through intelligent diagnostics, CBT practice, and adaptive tutoring.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
              <li>
                <button onClick={() => setStudentTab('subjects')} className="hover:text-[#2952CC]">
                  Subjects
                </button>
              </li>
              <li>
                <button onClick={() => setStudentTab('mock_tests')} className="hover:text-[#2952CC]">
                  CBT Mock Tests
                </button>
              </li>
              <li>
                <button onClick={() => setIsAiTutorOpen(true)} className="hover:text-[#2952CC]">
                  AI Doubt Solver
                </button>
              </li>
              <li>
                <button onClick={() => setStudentTab('flashcards')} className="hover:text-[#2952CC]">
                  Spaced Flashcards
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
              <li>
                <a href="#subjects-section" className="hover:text-[#2952CC]">
                  Previous Board Papers
                </a>
              </li>
              <li>
                <a href="#subjects-section" className="hover:text-[#2952CC]">
                  Formula Sheets
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#2952CC]">
                  Question Bank
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#2952CC]">
                  Syllabus Breakdown
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
              <li>
                <span className="hover:text-[#2952CC] cursor-pointer">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-[#2952CC] cursor-pointer">Terms of Service</span>
              </li>
              <li>
                <span className="hover:text-[#2952CC] cursor-pointer">Security & Firestore Rules</span>
              </li>
              <li>
                <span className="hover:text-[#2952CC] cursor-pointer">Support</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>© 2026 EasiaLearn EdTech SaaS. All rights reserved.</span>
          <span>Designed with Premium Light Theme & Tailwind CSS</span>
        </div>
      </footer>
    </div>
  );
};
