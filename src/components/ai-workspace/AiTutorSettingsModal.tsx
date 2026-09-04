import React, { useState, useEffect } from 'react';
import { X, Globe, Type, Volume2, Trash2, AlertTriangle, Check, Shield } from 'lucide-react';
import { localStore } from '../../lib/firebase/config';

export interface AiTutorSettings {
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  voiceURI: string;
}

interface AiTutorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteAllChats: () => void;
  settings: AiTutorSettings;
  onUpdateSettings: (newSettings: AiTutorSettings) => void;
}

export const AiTutorSettingsModal: React.FC<AiTutorSettingsModalProps> = ({
  isOpen,
  onClose,
  onDeleteAllChats,
  settings,
  onUpdateSettings,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-[22px] border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2952CC] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              AI
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#111111]">AI Tutor Settings</h3>
              <p className="text-[11px] text-[#64748B]">Personalize your workspace experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#111111] hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* 1. Language Preference */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-[#111111] mb-2">
              <Globe className="w-4 h-4 text-[#2952CC]" />
              <span>Workspace Language</span>
            </label>
            <p className="text-[11px] text-[#64748B] mb-2.5">
              Select primary language for AI responses & curriculum synthesis.
            </p>
            <select
              value={settings.language}
              onChange={(e) => onUpdateSettings({ ...settings, language: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#111111] focus:border-[#2952CC] focus:bg-white focus:outline-hidden transition-all"
            >
              <option value="English">English (Universal)</option>
              <option value="Kannada">ಕನ್ನಡ (Kannada State Board)</option>
              <option value="Arabic">العربية (Arabic - RTL)</option>
              <option value="Urdu">اردو (Urdu)</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
            </select>
          </div>

          {/* 2. Font Size */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-[#111111] mb-2">
              <Type className="w-4 h-4 text-[#2952CC]" />
              <span>Font Size</span>
            </label>
            <p className="text-[11px] text-[#64748B] mb-2.5">
              Adjust typography scale across message text and code tables.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, fontSize: size })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                    settings.fontSize === size
                      ? 'border-[#2952CC] bg-[#EAF2FF] text-[#2952CC] shadow-2xs'
                      : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#64748B] hover:bg-slate-100'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Read Aloud Voice */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-[#111111] mb-2">
              <Volume2 className="w-4 h-4 text-[#2952CC]" />
              <span>Read Aloud Voice</span>
            </label>
            <p className="text-[11px] text-[#64748B] mb-2.5">
              Synthesized voice used when listening to step-by-step explanations.
            </p>
            <select
              value={settings.voiceURI}
              onChange={(e) => onUpdateSettings({ ...settings, voiceURI: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#111111] focus:border-[#2952CC] focus:bg-white focus:outline-hidden transition-all truncate"
            >
              <option value="">Default System Voice</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Delete All Chats */}
          <div className="pt-4 border-t border-[#F1F5F9]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-[#EF4444] flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete All Conversations</span>
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Permanently wipe all session histories from Firestore and device cache.
                </p>
              </div>
            </div>

            {showConfirmDelete ? (
              <div className="mt-3 p-3.5 rounded-xl bg-[#FDEAEA] border border-[#EF4444]/30 space-y-2.5 animate-in fade-in">
                <div className="flex items-start gap-2 text-xs text-[#B91C1C] font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#EF4444]" />
                  <span>Are you sure? This cannot be undone. All saved discussions, math notes, and document outputs will be removed.</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#64748B] hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteAllChats();
                      setShowConfirmDelete(false);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#EF4444] text-white hover:bg-red-700 transition-colors shadow-2xs"
                  >
                    Yes, Delete Everything
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="mt-2 w-full py-2.5 px-4 rounded-xl border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#FDEAEA] transition-colors text-xs font-bold flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Chat History</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#F1F5F9] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2952CC] text-white text-xs font-bold hover:bg-[#1f40a6] transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
