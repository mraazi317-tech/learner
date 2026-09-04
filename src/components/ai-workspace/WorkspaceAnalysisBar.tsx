import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Sparkles,
  HelpCircle,
  BarChart3,
  Calculator,
  Languages,
  BookOpen,
  CheckCircle2,
  X,
} from 'lucide-react';

interface WorkspaceAnalysisBarProps {
  uploadedFile: {
    name: string;
    type: 'pdf' | 'excel' | 'image' | 'word' | 'ppt' | 'csv' | 'other';
    size?: string;
  } | null;
  onSelectAction: (prompt: string) => void;
  onClearFile: () => void;
}

export const WorkspaceAnalysisBar: React.FC<WorkspaceAnalysisBarProps> = ({
  uploadedFile,
  onSelectAction,
  onClearFile,
}) => {
  if (!uploadedFile) return null;

  return (
    <div className="bg-[#F0F5FF] border-b border-[#BFDBFE] px-4 py-2.5 flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-1">
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        
        {/* File Tag */}
        <div className="flex items-center gap-1.5 bg-white border border-[#2952CC]/30 px-3 py-1 rounded-xl text-[#2952CC] font-bold shrink-0 shadow-2xs">
          {uploadedFile.type === 'pdf' && <FileText className="w-3.5 h-3.5 text-red-500" />}
          {(uploadedFile.type === 'excel' || uploadedFile.type === 'csv') && <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
          {uploadedFile.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-blue-500" />}
          {uploadedFile.type === 'word' && <FileText className="w-3.5 h-3.5 text-indigo-500" />}
          <span className="truncate max-w-[150px]">{uploadedFile.name}</span>
          <button
            onClick={onClearFile}
            className="hover:text-red-500 ml-1"
            title="Remove attachment"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        <span className="text-[#64748B] font-semibold text-[11px] uppercase tracking-wider shrink-0">
          Smart Actions:
        </span>

        {/* PDF ACTIONS */}
        {uploadedFile.type === 'pdf' && (
          <>
            <button
              onClick={() => onSelectAction(`Please summarize this PDF (${uploadedFile.name}) into key executive takeaways and core principles.`)}
              className="bg-white hover:bg-[#2952CC] hover:text-white text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shrink-0"
            >
              📑 Summarize PDF
            </button>
            <button
              onClick={() => onSelectAction(`Extract all formulas, theorems, and definitions from this PDF (${uploadedFile.name}).`)}
              className="bg-white hover:bg-[#2952CC] hover:text-white text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shrink-0"
            >
              🔬 Extract Definitions & Formulas
            </button>
            <button
              onClick={() => onSelectAction(`Generate a 10-question multiple-choice quiz based on this document (${uploadedFile.name}) with answers and step explanations.`)}
              className="bg-white hover:bg-[#2952CC] hover:text-white text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shrink-0"
            >
              🎯 Create 10-Question Quiz
            </button>
            <button
              onClick={() => onSelectAction(`Translate the key points of this PDF into Kannada (ಕನ್ನಡ) and Arabic (العربية).`)}
              className="bg-white hover:bg-[#2952CC] hover:text-white text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shrink-0"
            >
              🌐 Translate Document
            </button>
          </>
        )}

        {/* EXCEL ACTIONS */}
        {(uploadedFile.type === 'excel' || uploadedFile.type === 'csv') && (
          <>
            <button
              onClick={() => onSelectAction(`Analyze this spreadsheet (${uploadedFile.name}), explain any calculations and highlight anomalies or totals.`)}
              className="bg-white hover:bg-[#10B981] hover:text-white text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shrink-0"
            >
              📊 Formula & Data Audit
            </button>
            <button
              onClick={() => onSelectAction(`Recommend pivot tables and data visualizations for this dataset (${uploadedFile.name}).`)}
              className="bg-white hover:bg-[#10B981] hover:text-white text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shrink-0"
            >
              📈 Pivot Suggestions
            </button>
            <button
              onClick={() => onSelectAction(`Verify GST calculations (18%) and line item totals for this sheet.`)}
              className="bg-white hover:bg-[#10B981] hover:text-white text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shrink-0"
            >
              💰 GST & Ledger Verification
            </button>
            <button
              onClick={() => onSelectAction(`Generate an attendance and salary distribution breakdown from this sheet.`)}
              className="bg-white hover:bg-[#10B981] hover:text-white text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shrink-0"
            >
              👥 Attendance & Payroll
            </button>
          </>
        )}

        {/* IMAGE ACTIONS */}
        {uploadedFile.type === 'image' && (
          <>
            <button
              onClick={() => onSelectAction(`Please solve the mathematical problem or equation shown in this image step-by-step with clear board exam marking points.`)}
              className="bg-white hover:bg-[#2952CC] hover:text-white text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shrink-0"
            >
              🧮 Solve Equation / Problem
            </button>
            <button
              onClick={() => onSelectAction(`Extract all printed or handwritten text and equations from this image (OCR).`)}
              className="bg-white hover:bg-[#2952CC] hover:text-white text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shrink-0"
            >
              🔍 OCR Text & Equations
            </button>
            <button
              onClick={() => onSelectAction(`Explain the scientific diagram, anatomical structure, or circuit shown in this image.`)}
              className="bg-white hover:bg-[#2952CC] hover:text-white text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shrink-0"
            >
              🧬 Explain Diagram / Circuit
            </button>
            <button
              onClick={() => onSelectAction(`Generate complete revision notes from this image content.`)}
              className="bg-white hover:bg-[#2952CC] hover:text-white text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition-colors shrink-0"
            >
              📝 Create Study Notes
            </button>
          </>
        )}
      </div>

      <button
        onClick={onClearFile}
        className="text-[#64748B] hover:text-slate-900 font-medium shrink-0 text-[11px]"
      >
        Clear
      </button>
    </div>
  );
};
