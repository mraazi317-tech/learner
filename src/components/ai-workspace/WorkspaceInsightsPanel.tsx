import React from 'react';
import {
  Sparkles,
  Layers,
  FileCode,
  Languages,
  Gauge,
  Compass,
  FileText,
  FileSpreadsheet,
  Download,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ChatInsights, GeneratedFilePayload } from '../../types';
import { triggerDownload } from '../../lib/fileGenerators';

interface WorkspaceInsightsPanelProps {
  insights: ChatInsights;
  onSelectAction: (actionText: string) => void;
  onPreviewFile?: (file: GeneratedFilePayload) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const WorkspaceInsightsPanel: React.FC<WorkspaceInsightsPanelProps> = ({
  insights,
  onSelectAction,
  onPreviewFile,
  isOpen,
  onToggle,
}) => {
  if (!isOpen) return null;

  return (
    <aside className="w-80 border-l border-[#E2E8F0] bg-[#F8FAFC] flex flex-col h-full overflow-y-auto p-5 shrink-0 transition-all duration-300">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#2952CC] text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-sm text-[#111827]">Insights & Analysis</span>
        </div>

        <button
          onClick={onToggle}
          className="text-xs text-[#64748B] hover:text-[#111827] px-2 py-1 rounded-md hover:bg-slate-200 transition-colors"
        >
          Hide
        </button>
      </div>

      <div className="space-y-4">
        
        {/* Detected Topic Card */}
        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5 text-[#2952CC]" />
            <span>Detected Topic</span>
          </div>
          <div className="font-bold text-sm text-[#1E293B] leading-snug">
            {insights.detectedTopic || 'General Academic & Productivity'}
          </div>
        </div>

        {/* Document & Language Specs Card */}
        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs space-y-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              <FileCode className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Document Type</span>
            </div>
            <div className="font-semibold text-xs sm:text-sm text-[#111827]">
              {insights.documentType || 'Official Syllabus Reference'}
            </div>
          </div>

          <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <Languages className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Language:</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EAF2FF] text-[#2952CC]">
              {insights.language || 'English'}
            </span>
          </div>

          <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <Gauge className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Complexity:</span>
            </div>
            <span className="text-xs font-bold text-slate-800">
              {insights.complexity || 'Advanced Board Level'}
            </span>
          </div>
        </div>

        {/* Suggested Actions Card */}
        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5 text-[#2952CC]" />
            <span>Suggested Next Actions</span>
          </div>

          <div className="flex flex-col gap-2">
            {(insights.suggestedActions || [
              'Generate Complete PDF Document',
              'Create Multi-Column Excel Sheet',
              'Generate 10 Board Exam MCQs',
              'Summarize Key Equations',
            ]).map((action, i) => (
              <button
                key={i}
                onClick={() => onSelectAction(action)}
                className="group w-full flex items-center justify-between p-2.5 rounded-xl border border-[#E2E8F0] hover:border-[#2952CC] hover:bg-[#EAF2FF]/50 text-left text-xs font-medium text-[#334155] hover:text-[#2952CC] transition-all"
              >
                <span className="truncate">{action}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#2952CC] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>

        {/* Related Files & Syllabus Resources Card */}
        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
            <FileText className="w-3.5 h-3.5 text-[#EF4444]" />
            <span>Related Files & Assets</span>
          </div>

          <div className="space-y-2">
            {(insights.relatedFiles || [
              { name: 'SSLC_Formula_Handbook.pdf', type: 'PDF', size: '1.8 MB' },
              { name: 'Board_Marking_Key_2026.xlsx', type: 'XLSX', size: '640 KB' },
              { name: 'Ray_Optics_Ray_Diagrams.pptx', type: 'PPTX', size: '3.2 MB' },
            ]).map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  {file.type === 'PDF' && <FileText className="w-4 h-4 text-red-500 shrink-0" />}
                  {file.type === 'XLSX' && <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />}
                  {file.type === 'PPTX' && <FileText className="w-4 h-4 text-orange-500 shrink-0" />}
                  <div className="truncate">
                    <div className="font-semibold text-slate-800 truncate">{file.name}</div>
                    <div className="text-[10px] text-slate-500">{file.size}</div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectAction(`Open and summarize ${file.name}`)}
                  className="p-1 text-[#2952CC] hover:bg-[#EAF2FF] rounded transition-colors"
                  title="Explore file"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
};
