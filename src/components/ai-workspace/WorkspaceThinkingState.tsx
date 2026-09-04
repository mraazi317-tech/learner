import React, { useEffect, useState } from 'react';
import { Sparkles, Brain, Cpu, FileSearch, CheckCircle2 } from 'lucide-react';

interface WorkspaceThinkingStateProps {
  taskType?: 'general' | 'document' | 'excel' | 'pdf' | 'image' | 'ppt';
}

const THINKING_STAGES = [
  { text: 'Understanding request & syllabus parameters', icon: Brain },
  { text: 'Reading document & extracting entities', icon: FileSearch },
  { text: 'Analyzing data & pedagogical frameworks', icon: Cpu },
  { text: 'Planning response architecture & tables', icon: Sparkles },
  { text: 'Generating file & verifying accuracy', icon: CheckCircle2 },
];

export const WorkspaceThinkingState: React.FC<WorkspaceThinkingStateProps> = () => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => (prev < THINKING_STAGES.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  const stage = THINKING_STAGES[currentStageIdx];
  const Icon = stage.icon;

  return (
    <div className="bg-gradient-to-r from-[#F0F5FF] to-[#F8FAFC] border border-[#BFDBFE]/60 rounded-[22px] p-5 shadow-sm my-4 transition-all animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#2952CC] text-white flex items-center justify-center shadow-xs">
            <Icon className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#2952CC] flex items-center gap-1.5">
              <span>AI Workspace Thinking</span>
              <span className="w-2 h-2 rounded-full bg-[#2952CC] animate-ping" />
            </div>
            <div className="text-sm font-semibold text-[#1E293B]">
              {stage.text}
            </div>
          </div>
        </div>

        <div className="text-xs font-mono font-medium text-[#64748B] bg-white px-2.5 py-1 rounded-full border border-[#E2E8F0]">
          {elapsedSeconds}s elapsed
        </div>
      </div>

      {/* Animated Stages Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#2952CC] to-[#4F7DF3] h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${((currentStageIdx + 1) / THINKING_STAGES.length) * 100}%` }}
          />
        </div>

        {/* Stage step indicators */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {THINKING_STAGES.map((s, idx) => {
            const isPassed = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            return (
              <div key={s.text} className="flex flex-col items-center">
                <div
                  className={`w-2 h-2 rounded-full mb-1 transition-colors ${
                    isPassed
                      ? 'bg-[#22C55E]'
                      : isCurrent
                      ? 'bg-[#2952CC] ring-2 ring-[#2952CC]/30'
                      : 'bg-[#CBD5E1]'
                  }`}
                />
                <span
                  className={`text-[9.5px] text-center leading-tight truncate w-full ${
                    isCurrent
                      ? 'text-[#2952CC] font-bold'
                      : isPassed
                      ? 'text-[#64748B]'
                      : 'text-[#94A3B8]'
                  }`}
                >
                  {s.text.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
