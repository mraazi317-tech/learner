import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export const CbtMockTestView: React.FC = () => {
  const { activeMockTest, setCurrentView, addTestResult, setStudentTab } = useApp();
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState((activeMockTest?.durationMinutes || 60) * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(0);

  const questions = activeMockTest?.questions || [
    {
      id: 'd1',
      question: 'In a right-angled triangle, if sin θ = 3/5, what is the value of cos θ?',
      options: ['4/5', '5/4', '3/4', '1/2'],
      correctAnswer: 0,
      marks: 2,
    },
    {
      id: 'd2',
      question: 'Which lens is used to correct Hypermetropia (farsightedness)?',
      options: ['Concave Lens', 'Convex Lens', 'Bifocal Lens', 'Cylindrical Lens'],
      correctAnswer: 1,
      marks: 2,
    },
    {
      id: 'd3',
      question: 'What is the SI unit of electric potential difference?',
      options: ['Ampere', 'Volt', 'Ohm', 'Joule'],
      correctAnswer: 1,
      marks: 2,
    },
  ];

  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectOption = (optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIdx]: optIdx }));
  };

  const handleSubmitTest = () => {
    let score = 0;
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        score += q.marks || 2;
        correct += 1;
      }
    });

    const totalPossibleMarks = questions.reduce((acc, q) => acc + (q.marks || 2), 0);
    const accuracy = Math.round((correct / questions.length) * 100);

    setTestScore(score);
    setIsSubmitted(true);

    addTestResult({
      id: `res_${Date.now()}`,
      testId: activeMockTest?.id || 'mock_test',
      testTitle: activeMockTest?.title || 'CBT Mock Examination',
      subject: activeMockTest?.subject || 'Mathematics',
      score,
      totalMarks: totalPossibleMarks,
      accuracy,
      correctCount: correct,
      incorrectCount: questions.length - correct,
      weakChapters: ['Quadratic Formula', 'Optics'],
      date: new Date().toLocaleDateString(),
    });
  };

  const currentQ = questions[currentQuestionIdx] || questions[0];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-xl p-8 max-w-lg w-full text-center space-y-6 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#111111]">Exam Completed!</h2>
            <p className="text-sm text-[#475569] mt-1">Your responses have been evaluated and recorded.</p>
          </div>

          <div className="bg-[#F8FAFC] rounded-2xl p-4 flex justify-around text-center">
            <div>
              <p className="text-xs text-[#475569]">Your Score</p>
              <p className="text-2xl font-bold text-[#2952CC] mt-1">{testScore}</p>
            </div>
            <div>
              <p className="text-xs text-[#475569]">Accuracy</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {Math.round((Object.keys(selectedAnswers).length ? (testScore / (questions.length * 2)) * 100 : 0))}%
              </p>
            </div>
            <div>
              <p className="text-xs text-[#475569]">Earned Coins</p>
              <p className="text-2xl font-bold text-amber-500 mt-1">+50</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentView('student_dashboard');
                setStudentTab('analytics');
              }}
              className="flex-1 py-3 rounded-xl bg-[#2952CC] text-white font-semibold text-sm hover:bg-blue-800 transition-all shadow-md shadow-blue-600/20"
            >
              View Analytics
            </button>
            <button
              onClick={() => setCurrentView('landing')}
              className="px-5 py-3 rounded-xl border border-slate-200 text-[#475569] hover:text-[#111111] font-semibold text-sm hover:bg-slate-50 transition-all"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Test Security Header */}
      <header className="bg-white border-b border-[#E5E7EB] px-6 py-3 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('landing')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            title="Exit Exam"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-sm sm:text-base text-[#111111] truncate max-w-md">
              {activeMockTest?.title || 'State Preparatory CBT Mock Test'}
            </h1>
            <p className="text-[11px] text-[#475569]">Live Examination Simulation • Full Proctoring Mode</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-1.5 rounded-full font-mono font-bold text-xs sm:text-sm">
            <Clock className="w-4 h-4 text-rose-600" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          <button
            onClick={handleSubmitTest}
            className="px-4 py-1.5 rounded-full bg-[#2952CC] text-white font-semibold text-xs sm:text-sm hover:bg-blue-800 transition-all shadow-xs"
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* Main Question Area */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Left: Question Box */}
        <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2952CC]">
                Question {currentQuestionIdx + 1} of {questions.length}
              </span>
              <span className="text-xs font-semibold text-[#475569]">Marks: +2.0, -0.0</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#111111] leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Options */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options?.map((opt, oIdx) => {
                const isSelected = selectedAnswers[currentQuestionIdx] === oIdx;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 text-xs sm:text-sm ${
                      isSelected
                        ? 'border-[#2952CC] bg-[#EAF2FF] text-[#111111] font-semibold'
                        : 'border-[#E5E7EB] hover:border-slate-300 text-[#475569]'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? 'bg-[#2952CC] text-white'
                          : 'border border-slate-300 text-slate-500'
                      }`}
                    >
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-[#E5E7EB] text-[#475569] hover:text-[#111111] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <button
              onClick={() => {
                if (currentQuestionIdx < questions.length - 1) {
                  setCurrentQuestionIdx((p) => p + 1);
                } else {
                  handleSubmitTest();
                }
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#2952CC] text-white hover:bg-blue-800 transition-all shadow-xs"
            >
              {currentQuestionIdx === questions.length - 1 ? 'Finish' : 'Save & Next'}{' '}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Question Palette */}
        <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-6 shadow-sm space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#475569]">Question Palette</h4>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, idx) => {
              const answered = selectedAnswers[idx] !== undefined;
              const isCurrent = currentQuestionIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={`h-9 rounded-lg font-bold text-xs transition-all ${
                    isCurrent
                      ? 'ring-2 ring-[#2952CC] border-transparent'
                      : ''
                  } ${
                    answered
                      ? 'bg-[#2952CC] text-white'
                      : 'bg-slate-100 text-[#475569] hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-[#475569] space-y-1.5 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#2952CC] inline-block" />
              <span>Answered ({Object.keys(selectedAnswers).length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 inline-block" />
              <span>Unattempted ({questions.length - Object.keys(selectedAnswers).length})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
