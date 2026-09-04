import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Download,
  FileText,
  Sparkles,
  HelpCircle,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export const LessonPlayerView: React.FC = () => {
  const { activeLesson, selectedSubject, setCurrentView, completeLesson, setIsAiTutorOpen } = useApp();
  const [activeTab, setActiveTab] = useState<'notes' | 'examples' | 'quiz'>('notes');

  const lessonTitle = activeLesson?.title || 'Quadratic Formula & Discriminant Analysis';

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('student_dashboard')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#475569] hover:text-[#111111] bg-white border border-[#E5E7EB] px-4 py-2 rounded-full shadow-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Curriculum
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAiTutorOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#2952CC] bg-[#EAF2FF] border border-blue-100 px-4 py-2 rounded-full hover:bg-blue-100 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Ask AI Doubt Solver
          </button>
          <button
            onClick={() => {
              if (activeLesson) completeLesson(activeLesson.id);
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-full transition-all shadow-xs"
          >
            <CheckCircle className="w-4 h-4" /> Mark Complete (+25 Coins)
          </button>
        </div>
      </div>

      {/* Video / Player Area */}
      <div className="bg-black rounded-[24px] overflow-hidden aspect-video relative flex items-center justify-center shadow-xl border border-slate-800">
        <div className="text-center text-white space-y-4 px-4">
          <div className="w-16 h-16 rounded-full bg-[#2952CC] text-white flex items-center justify-center mx-auto shadow-lg hover:scale-110 transition-transform cursor-pointer">
            <Play className="w-7 h-7 fill-white ml-1" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">{lessonTitle}</h2>
            <p className="text-xs text-slate-300 mt-1">
              Subject: {selectedSubject?.title || 'Mathematics'} • Duration: {activeLesson?.duration || '18 mins'}
            </p>
          </div>
        </div>
      </div>

      {/* Lesson Details & Notes */}
      <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex border-b border-slate-100 gap-6 pb-2">
          <button
            onClick={() => setActiveTab('notes')}
            className={`text-sm font-bold pb-2 transition-all ${
              activeTab === 'notes' ? 'text-[#2952CC] border-b-2 border-[#2952CC]' : 'text-[#475569]'
            }`}
          >
            Lesson Summary & Notes
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={`text-sm font-bold pb-2 transition-all ${
              activeTab === 'examples' ? 'text-[#2952CC] border-b-2 border-[#2952CC]' : 'text-[#475569]'
            }`}
          >
            Solved Board Examples
          </button>
        </div>

        {activeTab === 'notes' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#111111] leading-relaxed">
            <h3 className="text-base font-bold text-[#111111]">1. The Standard Quadratic Equation</h3>
            <p className="text-[#475569]">
              Any equation of the form <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#2952CC] font-mono">ax² + bx + c = 0</code>, where a ≠ 0, is defined as a quadratic equation.
            </p>

            <h3 className="text-base font-bold text-[#111111]">2. The Quadratic Formula</h3>
            <p className="text-[#475569]">
              The roots are given by <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#2952CC] font-mono">x = (-b ± √(b² - 4ac)) / (2a)</code>.
            </p>

            <h3 className="text-base font-bold text-[#111111]">3. The Discriminant (Δ)</h3>
            <p className="text-[#475569]">
              The expression <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#2952CC] font-mono">Δ = b² - 4ac</code> determines the nature of the roots:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#475569]">
              <li>If Δ &gt; 0, there are two distinct real roots.</li>
              <li>If Δ = 0, there is one repeated real root.</li>
              <li>If Δ &lt; 0, there are no real roots (complex roots).</li>
            </ul>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-[#2952CC]">Example 1 (Karnataka Board 2024 Question)</span>
              <p className="font-medium text-[#111111]">Find the discriminant of 2x² - 4x + 3 = 0 and hence find the nature of its roots.</p>
              <p className="text-[#475569]"><strong className="text-[#111111]">Solution:</strong> Here a = 2, b = -4, c = 3.<br />Δ = (-4)² - 4(2)(3) = 16 - 24 = -8.<br />Since Δ &lt; 0, the equation has no real roots.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
