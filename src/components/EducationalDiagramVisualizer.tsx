import React from 'react';
import { Eye, BookOpen, CheckCircle, Compass, Layers, ArrowRight } from 'lucide-react';

interface DiagramProps {
  type: 'OPTICS' | 'PARABOLA' | 'METRICS' | 'GRAMMAR' | 'FLOWCHART' | 'GENERAL';
  title?: string;
  caption?: string;
}

export const EducationalDiagramVisualizer: React.FC<DiagramProps> = ({
  type,
  title,
  caption,
}) => {
  return (
    <div className="my-3 rounded-xl border border-[#CBD5E1] bg-white p-3.5 shadow-xs overflow-hidden">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#2952CC] flex items-center justify-center">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs text-[#1E293B]">
            {title ||
              (type === 'OPTICS'
                ? "Official Board Ray Diagram: Snell's Law & Refraction"
                : type === 'PARABOLA'
                ? 'Board Graph: Nature of Roots & Discriminant (Δ)'
                : type === 'METRICS'
                ? 'ಕನ್ನಡ ವ್ಯಾಕರಣ: ಲಘು-ಗುರು ಪ್ರಸ್ತಾರ ಮತ್ತು ಮಾತ್ರಾ ಗಣ ಕೋಷ್ಟಕ'
                : type === 'GRAMMAR'
                ? 'مخطط الإعراب التوضيحي: حالات الفعل المضارع'
                : 'Official Curriculum Master Roadmap')}
          </span>
        </div>
        <span className="text-[10px] font-semibold text-[#2952CC] bg-[#EFF6FF] px-2 py-0.5 rounded-md border border-[#BFDBFE]">
          High-Yield Diagram
        </span>
      </div>

      {/* SVG Diagram Canvas */}
      <div className="w-full bg-[#F8FAFC] rounded-lg p-2 flex items-center justify-center border border-slate-200/80">
        {type === 'OPTICS' && (
          <svg viewBox="0 0 500 240" className="w-full max-w-md h-auto select-none">
            {/* Upper Medium (Air) */}
            <rect x="0" y="0" width="500" height="120" fill="#F0F7FF" />
            <text x="20" y="30" fill="#1E3A8A" fontSize="12" fontWeight="bold">Medium 1: Rarer (Air, n₁)</text>
            
            {/* Lower Medium (Glass/Water) */}
            <rect x="0" y="120" width="500" height="120" fill="#E0F2FE" />
            <text x="20" y="150" fill="#0369A1" fontSize="12" fontWeight="bold">Medium 2: Denser (Glass/Water, n₂ &gt; n₁)</text>

            {/* Interface Line */}
            <line x1="0" y1="120" x2="500" y2="120" stroke="#2563EB" strokeWidth="2.5" />
            
            {/* Normal Line */}
            <line x1="250" y1="15" x2="250" y2="225" stroke="#64748B" strokeWidth="1.5" strokeDasharray="5,5" />
            <text x="256" y="28" fill="#475569" fontSize="11" fontWeight="bold">Normal (N)</text>

            {/* Incident Ray */}
            <line x1="110" y1="20" x2="250" y2="120" stroke="#DC2626" strokeWidth="2.5" />
            {/* Incident Ray Arrow */}
            <polygon points="175,67 185,63 181,73" fill="#DC2626" />
            <text x="110" y="65" fill="#DC2626" fontSize="11" fontWeight="bold">Incident Ray</text>

            {/* Angle of Incidence Arc */}
            <path d="M 250,75 A 45,45 0 0,0 215,95" fill="none" stroke="#DC2626" strokeWidth="1.5" />
            <text x="222" y="80" fill="#DC2626" fontSize="12" fontWeight="bold">i</text>

            {/* Refracted Ray (Bends toward normal) */}
            <line x1="250" y1="120" x2="330" y2="220" stroke="#16A34A" strokeWidth="2.5" />
            {/* Refracted Ray Arrow */}
            <polygon points="293,174 288,165 299,168" fill="#16A34A" />
            <text x="340" y="200" fill="#16A34A" fontSize="11" fontWeight="bold">Refracted Ray</text>

            {/* Angle of Refraction Arc */}
            <path d="M 250,165 A 45,45 0 0,0 278,154" fill="none" stroke="#16A34A" strokeWidth="1.5" />
            <text x="260" y="160" fill="#16A34A" fontSize="12" fontWeight="bold">r</text>

            {/* Formula Stamp */}
            <rect x="330" y="25" width="150" height="42" rx="6" fill="#FFFFFF" stroke="#CBD5E1" />
            <text x="340" y="44" fill="#0F172A" fontSize="11" fontWeight="bold">Snell's Law Formula:</text>
            <text x="340" y="58" fill="#2563EB" fontSize="11" fontWeight="bold">sin(i) / sin(r) = n₂ / n₁</text>
          </svg>
        )}

        {type === 'PARABOLA' && (
          <svg viewBox="0 0 500 220" className="w-full max-w-md h-auto select-none">
            {/* Axes */}
            <line x1="40" y1="130" x2="470" y2="130" stroke="#475569" strokeWidth="2" />
            <text x="475" y="134" fill="#475569" fontSize="11" fontWeight="bold">X</text>
            <line x1="250" y1="15" x2="250" y2="200" stroke="#475569" strokeWidth="1.5" strokeDasharray="3,3" />

            {/* Curve 1: Delta > 0 (Two points) */}
            <path d="M 60,30 Q 120,180 180,30" fill="none" stroke="#2563EB" strokeWidth="2.5" />
            <circle cx="85" cy="130" r="4" fill="#2563EB" />
            <circle cx="155" cy="130" r="4" fill="#2563EB" />
            <text x="75" y="20" fill="#2563EB" fontSize="11" fontWeight="bold">Δ &gt; 0 (2 Real Roots)</text>

            {/* Curve 2: Delta = 0 (Touches at vertex) */}
            <path d="M 200,40 Q 250,130 300,40" fill="none" stroke="#16A34A" strokeWidth="3" />
            <circle cx="250" cy="130" r="5" fill="#16A34A" />
            <text x="210" y="25" fill="#16A34A" fontSize="11" fontWeight="bold">Δ = 0 (Real &amp; Equal: -b/2a)</text>

            {/* Curve 3: Delta < 0 (No Real Roots) */}
            <path d="M 340,30 Q 400,90 460,30" fill="none" stroke="#DC2626" strokeWidth="2.5" />
            <text x="355" y="20" fill="#DC2626" fontSize="11" fontWeight="bold">Δ &lt; 0 (Imaginary)</text>
          </svg>
        )}

        {type === 'METRICS' && (
          <div className="w-full space-y-2 py-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">U</span>
                  <span>ಲಘು (Laghu) = 1 ಮಾತ್ರೆ</span>
                </div>
                <p className="text-[11px] text-blue-800">
                  ಹ್ರಸ್ವ ಸ್ವರಗಳು (ಅ, ಇ, ಉ) ಮತ್ತು ಹ್ರಸ್ವ ಸ್ವರಗಳಿಂದ ಕೂಡಿದ ವ್ಯಂಜನಗಳು.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">-</span>
                  <span>ಗುರು (Guru) = 2 ಮಾತ್ರೆಗಳು</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  ದೀರ್ಘ ಸ್ವರಗಳು, ಅನುಸ್ವಾರ, ವಿಸರ್ಗ ಮತ್ತು ಸಂಯುಕ್ತಾಕ್ಷರದ ಹಿಂದಿನ ಅಕ್ಷರ.
                </p>
              </div>
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-2 text-center text-xs font-semibold text-slate-700">
              ಭಾಮಿನಿ ಷಟ್ಪದಿ ಸೂತ್ರ: 1, 2, 4, 5 ನೇ ಸಾಲು = 14 ಮಾತ್ರೆಗಳು (3-4-3-4) | 3, 6 ನೇ ಸಾಲು = 23 ಮಾತ್ರೆಗಳು + 1 ಗುರು
            </div>
          </div>
        )}

        {type === 'GRAMMAR' && (
          <div className="w-full grid grid-cols-3 gap-2 py-2 text-xs">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-right">
              <span className="font-bold text-emerald-900 block text-[11px]">1. الرفع (Marfoo)</span>
              <span className="text-emerald-700 text-[10px]">العلامة: الضمة الظاهرة</span>
              <span className="text-slate-600 block text-[10px] mt-1">مثال: يَكْتُبُ الطالبُ</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-right">
              <span className="font-bold text-blue-900 block text-[11px]">2. النصب (Mansoob)</span>
              <span className="text-blue-700 text-[10px]">العلامة: الفتحة (أن، لن، كي)</span>
              <span className="text-slate-600 block text-[10px] mt-1">مثال: لن يُهْمِلَ</span>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-right">
              <span className="font-bold text-purple-900 block text-[11px]">3. الجزم (Majzoom)</span>
              <span className="text-purple-700 text-[10px]">العلامة: السكون / حذف العلة</span>
              <span className="text-slate-600 block text-[10px] mt-1">مثال: لم يَكْتُبْ</span>
            </div>
          </div>
        )}

        {(type === 'FLOWCHART' || type === 'GENERAL') && (
          <div className="w-full flex items-center justify-between gap-2 py-2 px-1 text-xs">
            <div className="flex-1 bg-white border border-blue-300 rounded-lg p-2 text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-blue-600 block">Phase 1</span>
              <span className="font-semibold text-slate-800 text-[11px]">Core Concept &amp; Formula</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex-1 bg-white border border-emerald-300 rounded-lg p-2 text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Phase 2</span>
              <span className="font-semibold text-slate-800 text-[11px]">Derivation &amp; Diagrams</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex-1 bg-white border border-amber-300 rounded-lg p-2 text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-amber-600 block">Phase 3</span>
              <span className="font-semibold text-slate-800 text-[11px]">PYQs &amp; Timed CBT Test</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 text-[11px] text-slate-500 italic flex items-center gap-1.5">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>{caption || 'Verified according to state examination blueprint and step-marking scheme.'}</span>
      </div>
    </div>
  );
};
