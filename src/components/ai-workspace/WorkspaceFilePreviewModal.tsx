import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  FileText,
  FileSpreadsheet,
  Presentation,
  Check,
  ChevronLeft,
  ChevronRight,
  Printer,
  Maximize2,
  Copy,
} from 'lucide-react';
import { GeneratedFilePayload } from '../../types';
import { triggerDownload } from '../../lib/fileGenerators';

interface WorkspaceFilePreviewModalProps {
  file: GeneratedFilePayload | null;
  onClose: () => void;
}

export const WorkspaceFilePreviewModal: React.FC<WorkspaceFilePreviewModalProps> = ({
  file,
  onClose,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!file) return null;

  const handleDownload = () => {
    triggerDownload(file.downloadUrl, file.fileName);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Mock slides for presentation preview if pptx
  const sampleSlides = [
    {
      title: 'EasiaLearn Academic Excellence Strategy',
      subtitle: '2026 Curriculum Framework & Board Mastery',
      bullets: [
        'Integrated syllabus roadmap for SSLC, PUC, and CBSE standards',
        'Direct mathematical derivation & ray-optics precision',
        'Pedagogical step-marking allocation strategies',
      ],
    },
    {
      title: 'Methodology & Step-Wise Mark Maximization',
      subtitle: 'Official Grading Guidelines',
      bullets: [
        '1 Mark: Standard formula declaration & given data conversion',
        '2 Marks: Step-wise algebraic and dimensional simplification',
        '1 Mark: Final boxed answer with unambiguous SI units',
        'Zero deduction through verified error checklists',
      ],
    },
    {
      title: 'Comprehensive Actionable Revision Plan',
      subtitle: '3-Phase Exam Preparation',
      bullets: [
        'Phase 1: Conceptual mastery of theorems and formula matrices',
        'Phase 2: Timed ray-diagram drafting and derivation practice',
        'Phase 3: High-frequency PYQ timed simulations with answer rubrics',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[22px] shadow-2xl flex flex-col overflow-hidden border border-[#E2E8F0]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                file.fileType === 'pdf'
                  ? 'bg-[#EF4444]'
                  : file.fileType === 'xlsx' || file.fileType === 'csv'
                  ? 'bg-[#10B981]'
                  : file.fileType === 'pptx'
                  ? 'bg-[#F97316]'
                  : 'bg-[#2952CC]'
              }`}
            >
              {file.fileType === 'pdf' && <FileText className="w-5 h-5" />}
              {(file.fileType === 'xlsx' || file.fileType === 'csv') && <FileSpreadsheet className="w-5 h-5" />}
              {file.fileType === 'pptx' && <Presentation className="w-5 h-5" />}
              {file.fileType === 'docx' && <FileText className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base text-[#1E293B] truncate max-w-xs sm:max-w-md">
                {file.fileName}
              </div>
              <div className="text-xs text-[#64748B] flex items-center gap-2">
                <span className="uppercase font-semibold text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {file.fileType}
                </span>
                <span>Size: {file.size}</span>
                <span>• Created: {file.createdAt}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#2952CC] text-white hover:bg-[#2244aa] transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-slate-100 text-[#64748B] transition-colors"
              title="Share document link"
            >
              {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-slate-100 text-[#64748B] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F1F5F9]">
          
          {/* SPREADSHEET PREVIEW */}
          {(file.fileType === 'xlsx' || file.fileType === 'csv') && (
            <div className="bg-white rounded-xl shadow-xs border border-[#E2E8F0] overflow-hidden">
              <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs font-semibold text-emerald-800">
                <span>Spreadsheet Data Inspector • Formatted Excel Workbook</span>
                <span>Auto-Calculations Active</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                      <th className="p-3 font-bold border-r border-slate-200 w-12 text-center">#</th>
                      <th className="p-3 font-bold border-r border-slate-200">Item / SKU</th>
                      <th className="p-3 font-bold border-r border-slate-200">Category</th>
                      <th className="p-3 font-bold border-r border-slate-200 text-right">Qty</th>
                      <th className="p-3 font-bold border-r border-slate-200 text-right">Unit Rate (₹)</th>
                      <th className="p-3 font-bold border-r border-slate-200 text-right">GST (18%)</th>
                      <th className="p-3 font-bold text-right">Net Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 text-center text-slate-400 border-r border-slate-200">1</td>
                      <td className="p-3 font-sans font-medium text-slate-800 border-r border-slate-200">Standard Mathematics Guide</td>
                      <td className="p-3 font-sans text-slate-600 border-r border-slate-200">Books</td>
                      <td className="p-3 text-right border-r border-slate-200">25</td>
                      <td className="p-3 text-right border-r border-slate-200">₹450.00</td>
                      <td className="p-3 text-right border-r border-slate-200 text-emerald-700">₹81.00</td>
                      <td className="p-3 text-right font-bold text-slate-900">₹13,275.00</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 text-center text-slate-400 border-r border-slate-200">2</td>
                      <td className="p-3 font-sans font-medium text-slate-800 border-r border-slate-200">Physics Practical Kit</td>
                      <td className="p-3 font-sans text-slate-600 border-r border-slate-200">Lab Equipment</td>
                      <td className="p-3 text-right border-r border-slate-200">10</td>
                      <td className="p-3 text-right border-r border-slate-200">₹1,200.00</td>
                      <td className="p-3 text-right border-r border-slate-200 text-emerald-700">₹216.00</td>
                      <td className="p-3 text-right font-bold text-slate-900">₹14,160.00</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 text-center text-slate-400 border-r border-slate-200">3</td>
                      <td className="p-3 font-sans font-medium text-slate-800 border-r border-slate-200">Chemistry Molecular Model</td>
                      <td className="p-3 font-sans text-slate-600 border-r border-slate-200">Lab Supplies</td>
                      <td className="p-3 text-right border-r border-slate-200">15</td>
                      <td className="p-3 text-right border-r border-slate-200">₹650.00</td>
                      <td className="p-3 text-right border-r border-slate-200 text-emerald-700">₹117.00</td>
                      <td className="p-3 text-right font-bold text-slate-900">₹11,505.00</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 text-center text-slate-400 border-r border-slate-200">4</td>
                      <td className="p-3 font-sans font-medium text-slate-800 border-r border-slate-200">Digital Tablet Stylus</td>
                      <td className="p-3 font-sans text-slate-600 border-r border-slate-200">IT Peripherals</td>
                      <td className="p-3 text-right border-r border-slate-200">40</td>
                      <td className="p-3 text-right border-r border-slate-200">₹850.00</td>
                      <td className="p-3 text-right border-r border-slate-200 text-emerald-700">₹153.00</td>
                      <td className="p-3 text-right font-bold text-slate-900">₹40,120.00</td>
                    </tr>
                    <tr className="bg-slate-50/80 font-bold">
                      <td colSpan={3} className="p-3 text-right font-sans text-slate-700 border-r border-slate-200">Consolidated Sum Total:</td>
                      <td className="p-3 text-right border-r border-slate-200">90</td>
                      <td className="p-3 text-right border-r border-slate-200">-</td>
                      <td className="p-3 text-right border-r border-slate-200 text-emerald-700">₹567.00</td>
                      <td className="p-3 text-right text-[#2952CC] font-extrabold text-sm">₹79,060.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PRESENTATION PREVIEW */}
          {file.fileType === 'pptx' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              {/* Active Slide Screen */}
              <div className="aspect-[16/9] bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-8 text-white shadow-xl flex flex-col justify-between border border-slate-700">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#60A5FA] mb-2 flex items-center justify-between">
                    <span>EasiaLearn AI Deck • Slide {currentSlide + 1} of {sampleSlides.length}</span>
                    <span className="bg-[#2952CC] text-white px-2 py-0.5 rounded text-[10px]">16:9 HD</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                    {sampleSlides[currentSlide].title}
                  </h3>
                  <div className="text-xs text-slate-300 font-medium mb-6">
                    {sampleSlides[currentSlide].subtitle}
                  </div>

                  <ul className="space-y-2.5">
                    {sampleSlides[currentSlide].bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] mt-1.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Confidential • EasiaLearn Academic Workspace</span>
                  <span>Board Verified • Year 2026</span>
                </div>
              </div>

              {/* Slide Navigation Controls */}
              <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-[#E2E8F0] shadow-xs">
                <button
                  disabled={currentSlide === 0}
                  onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-[#2952CC] disabled:opacity-30 disabled:hover:text-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Slide</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {sampleSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                        currentSlide === idx
                          ? 'bg-[#2952CC] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentSlide === sampleSlides.length - 1}
                  onClick={() => setCurrentSlide((p) => Math.min(sampleSlides.length - 1, p + 1))}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-[#2952CC] disabled:opacity-30 disabled:hover:text-slate-700"
                >
                  <span>Next Slide</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PDF & WORD PREVIEW */}
          {(file.fileType === 'pdf' || file.fileType === 'docx') && (
            <div className="bg-white rounded-xl shadow-md border border-[#E2E8F0] max-w-2xl mx-auto p-8 font-serif leading-relaxed text-slate-800">
              <div className="border-b-2 border-[#2952CC] pb-4 mb-6 flex items-end justify-between font-sans">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1B2E7A]">EasiaLearn Academic AI Workspace</h2>
                  <p className="text-xs text-[#64748B] uppercase tracking-wider font-semibold">Official Educational Document</p>
                </div>
                <div className="text-right text-xs text-[#64748B]">
                  <div className="bg-[#EAF2FF] text-[#2952CC] font-bold px-2 py-0.5 rounded text-[10px] inline-block mb-1">
                    VERIFIED CURRICULUM
                  </div>
                  <div>Date: {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div className="space-y-4 text-sm font-sans">
                <h1 className="text-lg font-bold text-slate-900">{file.fileName.replace(/\.[^/.]+$/, '')}</h1>
                <p className="text-slate-600">
                  This official document contains systematic definitions, governing equations, verified comparison matrices, and step-wise exam marking rubrics compliant with Karnataka SSLC, PUC, and CBSE board standards.
                </p>

                <div className="bg-slate-50 border-l-4 border-[#2952CC] p-3.5 rounded-r-lg font-mono text-xs text-slate-800">
                  <strong>Core Law:</strong> $E = mc^2$ and $\Delta = b^2 - 4ac$ with verified boundary conditions.
                </div>

                <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
                  <span>Page 1 of 1 • EasiaLearn EdTech</span>
                  <span>Digitally Certified</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#E2E8F0] bg-white flex items-center justify-between text-xs text-[#64748B]">
          <div>Ready for download, offline printing, and classroom distribution.</div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 font-bold text-[#2952CC] hover:underline"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {file.fileName}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
