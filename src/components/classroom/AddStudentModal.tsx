import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { X, Search, UserPlus, Check, AlertCircle, Sparkles, School, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddStudentModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { lookupStudentByEasiaCode, sendTeacherConnectionRequest, triggerCelebration } = useApp();

  const [inputCode, setInputCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [previewStudent, setPreviewStudent] = useState<any | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    if (!clean) {
      setSearchError('Please enter a valid Student EasiaCode (e.g. EA-STU-8K29Q)');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setPreviewStudent(null);
    setRequestSent(false);

    try {
      const student = await lookupStudentByEasiaCode(clean);
      if (student) {
        setPreviewStudent(student);
      } else {
        setSearchError(`No student registered with EasiaCode "${clean}". Please verify the code.`);
      }
    } catch (err: any) {
      setSearchError(err.message || 'Lookup failed. Please check network.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!previewStudent) return;
    setIsSending(true);
    setSearchError(null);

    try {
      const res = await sendTeacherConnectionRequest(previewStudent.easiacode || previewStudent.id);
      if (res.success) {
        setRequestSent(true);
        triggerCelebration();
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2200);
      } else {
        setSearchError(res.error || 'Failed to send connection request.');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error sending request.');
    } finally {
      setIsSending(false);
    }
  };

  // Quick suggestions helper
  const handleQuickCode = (code: string) => {
    setInputCode(code);
    setIsSearching(true);
    setSearchError(null);
    lookupStudentByEasiaCode(code).then((stu) => {
      setIsSearching(false);
      setPreviewStudent(stu);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white rounded-[24px] shadow-2xl border border-[#E5E7EB] p-6 sm:p-8 flex flex-col text-[#111111] relative overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF2FF] text-[#2952CC] flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#111111]">
                Connect New Student
              </h3>
              <p className="text-xs text-gray-500">
                Enroll students to assign live classes, quizzes, and exams.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="mt-5 space-y-3">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Student EasiaCode
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  setSearchError(null);
                }}
                placeholder="e.g. EA-STU-8K29Q"
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-300 focus:border-[#2952CC] focus:ring-2 focus:ring-[#2952CC]/20 text-sm font-mono uppercase font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-sans"
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 animate-spin text-[#2952CC] absolute right-3.5 top-3.5" />
              )}
            </div>

            <button
              type="submit"
              disabled={isSearching || !inputCode.trim()}
              className="px-5 py-3 rounded-xl bg-[#2952CC] hover:bg-[#1e3ea3] text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Verify</span>
            </button>
          </div>

          {/* Quick Demo Student shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-gray-400 font-medium">Quick demo codes:</span>
            {[
              { code: 'EA-STU-8K29Q', name: 'Amina' },
              { code: 'EA-STU-4M77P', name: 'Rohan' },
              { code: 'EA-STU-9W33B', name: 'Priya' },
            ].map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() => handleQuickCode(s.code)}
                className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-[#EAF2FF] hover:text-[#2952CC] text-[11px] font-mono text-gray-600 transition"
              >
                {s.name} ({s.code})
              </button>
            ))}
          </div>
        </form>

        {/* Error message */}
        {searchError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Student Preview Card */}
        <AnimatePresence>
          {previewStudent && !requestSent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-5 rounded-2xl bg-[#F8FAFC] border-2 border-[#2952CC]/30 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
                <span className="text-xs font-bold text-[#2952CC] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Verified Student Profile
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  Active Learner
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden shrink-0 flex items-center justify-center text-xl font-extrabold text-[#2952CC]">
                  {previewStudent.photoURL ? (
                    <img
                      src={previewStudent.photoURL}
                      alt={previewStudent.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    previewStudent.name?.charAt(0) || 'S'
                  )}
                </div>

                <div className="flex-1 space-y-1 overflow-hidden">
                  <h4 className="font-heading font-extrabold text-base text-gray-900 truncate">
                    {previewStudent.name}
                  </h4>
                  <p className="text-xs text-gray-500 font-mono">
                    @{previewStudent.username || 'student'} • {previewStudent.easiacode}
                  </p>

                  <div className="pt-1.5 flex flex-wrap gap-2 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-gray-200">
                      <GraduationCap className="w-3.5 h-3.5 text-[#2952CC]" />
                      {previewStudent.class || 'Class 10 (SSLC)'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-gray-200 truncate max-w-[200px]">
                      <School className="w-3.5 h-3.5 text-gray-500" />
                      {previewStudent.school || 'Secondary PU College'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSendRequest}
                  disabled={isSending}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#2952CC] hover:bg-[#1f40a6] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Connection Invitation...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Connection Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Success Confirmation State */}
          {requestSent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="font-heading font-extrabold text-base text-emerald-950">
                Connection Request Dispatched!
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
                Realtime notification sent to <strong>{previewStudent?.name}</strong>. Once accepted, messaging and live classes unlock automatically!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
