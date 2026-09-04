import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, X, BookOpen, FileQuestion, ClipboardCheck, ArrowRight } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    subjects,
    lessons,
    mockTests,
    setSelectedSubject,
    openLesson,
    startMockTest,
    setCurrentView,
  } = useApp();

  const [query, setQuery] = useState('');

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const matchedSubjects = subjects.filter(
    (s) =>
      s.title.toLowerCase().includes(cleanQuery) ||
      s.description.toLowerCase().includes(cleanQuery) ||
      s.medium.toLowerCase().includes(cleanQuery)
  );

  const matchedLessons = lessons.filter(
    (l) =>
      l.title.toLowerCase().includes(cleanQuery) ||
      l.notesContent.toLowerCase().includes(cleanQuery)
  );

  const matchedTests = mockTests.filter(
    (m) =>
      m.title.toLowerCase().includes(cleanQuery) ||
      m.subject.toLowerCase().includes(cleanQuery)
  );

  const hasResults =
    matchedSubjects.length > 0 || matchedLessons.length > 0 || matchedTests.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 sm:px-6 py-4 border-b border-[#E5E7EB] gap-3">
          <Search className="w-5 h-5 text-[#2952CC] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, video lessons, formulas, mock tests... (e.g. Quadratic, AP, Light)"
            className="w-full text-base sm:text-lg text-[#111827] placeholder:text-[#64748B] focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[#64748B] hover:text-[#111827] px-2 py-1 bg-slate-100 rounded-lg"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748B] hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-6">
          {!query && (
            <div className="text-center py-8">
              <p className="text-sm font-semibold text-[#111827]">Quick Access Suggestions</p>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {['Quadratic Equations', 'Trigonometry Ratios', 'SSLC Mock Test 4', 'Light Refraction', 'Ohm\'s Law'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#EAF2FF] text-[#2952CC] hover:bg-[#2952CC] hover:text-white transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && !hasResults && (
            <div className="text-center py-10">
              <FileQuestion className="w-10 h-10 text-[#64748B] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-[#111827]">No results found for "{query}"</p>
              <p className="text-xs text-[#64748B] mt-1">
                Try searching for standard board chapters like Mathematics, Science, or Mock Tests.
              </p>
            </div>
          )}

          {/* Subjects Matches */}
          {matchedSubjects.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2 px-1">
                Subjects ({matchedSubjects.length})
              </h3>
              <div className="space-y-1.5">
                {matchedSubjects.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubject(sub);
                      setCurrentView('subject_detail');
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#EAF2FF] transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0"
                        style={{ backgroundColor: sub.color }}
                      >
                        {sub.title.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#111827] group-hover:text-[#2952CC] transition-colors">
                          {sub.title}
                        </div>
                        <div className="text-xs text-[#64748B] line-clamp-1">
                          {sub.totalChapters} Chapters • {sub.medium} Medium • {sub.class}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-[#2952CC] group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lessons Matches */}
          {matchedLessons.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2 px-1">
                Video Lessons & Notes ({matchedLessons.length})
              </h3>
              <div className="space-y-1.5">
                {matchedLessons.map((les) => (
                  <button
                    key={les.id}
                    onClick={() => {
                      openLesson(les.id, les.subjectId);
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#EAF2FF] transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] text-[#2952CC] flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#111827] group-hover:text-[#2952CC]">
                          {les.title}
                        </div>
                        <div className="text-xs text-[#64748B]">Duration: {les.duration}</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EAF2FF] text-[#2952CC]">
                      Watch / Read
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mock Tests Matches */}
          {matchedTests.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2 px-1">
                Mock Tests & CBT ({matchedTests.length})
              </h3>
              <div className="space-y-1.5">
                {matchedTests.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      startMockTest(t.id);
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#E7F9EF] transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#E7F9EF] text-[#22C55E] flex items-center justify-center shrink-0">
                        <ClipboardCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#111827] group-hover:text-[#22C55E]">
                          {t.title}
                        </div>
                        <div className="text-xs text-[#64748B]">
                          {t.totalQuestions} Questions • {t.durationMinutes} Minutes • {t.totalMarks} Marks
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#22C55E] text-white">
                      Start CBT
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-6 py-3 bg-[#F8FAFC] border-t border-[#E5E7EB] text-xs text-[#64748B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E7EB] rounded-md font-mono text-[11px]">ESC</kbd> to close</span>
          </div>
          <span>EasiaLearn Realtime Search</span>
        </div>
      </div>
    </div>
  );
};
