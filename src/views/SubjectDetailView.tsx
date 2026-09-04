import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  ChevronRight,
  FileText,
  Award,
  Sparkles,
} from 'lucide-react';

export const SubjectDetailView: React.FC = () => {
  const { selectedSubject, setCurrentView, setActiveLesson, startMockTest, setIsAiTutorOpen } = useApp();

  const subject = selectedSubject || {
    id: 'sub_math',
    title: 'Mathematics (SSLC & 10th)',
    description: 'Master quadratic formulas, trigonometry, arithmetic progressions, and coordinate geometry.',
    color: '#2952CC',
    totalChapters: 15,
    completedChapters: 6,
    progressPercent: 68,
  };

  const chapters = [
    { num: 1, title: 'Arithmetic Progressions (ಸಮಾಂತರ ಶ್ರೇಢಿಗಳು)', lessons: 5, time: '1h 45m', completed: true },
    { num: 2, title: 'Triangles & Similarity Theorems (ತ್ರಿಭುಜಗಳು)', lessons: 6, time: '2h 10m', completed: true },
    { num: 3, title: 'Pair of Linear Equations in Two Variables', lessons: 4, time: '1h 30m', completed: true },
    { num: 4, title: 'Quadratic Equations & Discriminant Test', lessons: 5, time: '1h 50m', completed: false },
    { num: 5, title: 'Introduction to Trigonometry (ತ್ರಿಕೋನಮಿತಿ)', lessons: 7, time: '2h 30m', completed: false },
    { num: 6, title: 'Coordinate Geometry & Distance Formula', lessons: 4, time: '1h 20m', completed: false },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('student_dashboard')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#475569] hover:text-[#111111] bg-white border border-[#E5E7EB] px-4 py-2 rounded-full shadow-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Subjects
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAiTutorOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#2952CC] bg-[#EAF2FF] border border-blue-100 px-4 py-2 rounded-full hover:bg-blue-100 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Subject AI Doubts
          </button>
          <button
            onClick={() => startMockTest()}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-[#2952CC] hover:bg-blue-800 px-4 py-2 rounded-full transition-all shadow-xs"
          >
            Take Chapter Test
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#2952CC] to-[#4F7DF3] rounded-[24px] p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 uppercase tracking-wider">
            Curriculum Breakdown
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold">{subject.title}</h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
            {subject.description}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-5 border border-white/20 shrink-0 text-center min-w-[180px]">
          <p className="text-xs text-blue-100 font-semibold">Syllabus Covered</p>
          <p className="text-3xl font-extrabold mt-1">{subject.progressPercent || 68}%</p>
          <p className="text-[11px] text-blue-200 mt-1">{subject.completedChapters || 6} of {subject.totalChapters} Chapters</p>
        </div>
      </div>

      {/* Chapters list */}
      <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-[#111111]">Syllabus Units & Lessons</h2>

        <div className="space-y-3">
          {chapters.map((ch) => (
            <div
              key={ch.num}
              className="p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] hover:border-[#2952CC] transition-all flex items-center justify-between gap-4 group cursor-pointer"
              onClick={() => {
                setActiveLesson({
                  id: `les_${ch.num}`,
                  chapterId: `ch_${ch.num}`,
                  subjectId: subject.id,
                  title: ch.title,
                  order: ch.num,
                  duration: ch.time,
                  videoUrl: '',
                  notesContent: '',
                  examples: [],
                  downloadableFiles: [],
                  practiceQuestionsCount: 5,
                  isCompleted: ch.completed,
                });
                setCurrentView('lesson_player');
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    ch.completed
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-[#EAF2FF] text-[#2952CC]'
                  }`}
                >
                  {ch.completed ? <CheckCircle className="w-5 h-5" /> : ch.num}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#111111] group-hover:text-[#2952CC] transition-colors">
                    {ch.title}
                  </h3>
                  <p className="text-xs text-[#475569] mt-0.5">
                    {ch.lessons} Lessons • {ch.time} • Solved Examples Included
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[#475569]">
                  {ch.completed ? 'Completed' : 'Resume Lesson'}
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#2952CC] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
