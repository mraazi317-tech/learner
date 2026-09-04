import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { LiveClass } from '../../types';
import {
  X,
  Calendar,
  Clock,
  Video,
  Sparkles,
  BookOpen,
  Users,
  AlertCircle,
  Play,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
  defaultStudentCode?: string;
}

export const ScheduleClassModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultSubject,
  defaultStudentCode,
}) => {
  const { user } = useAuth();
  const {
    userPlan,
    teacherConnections,
    createLiveClass,
    startLiveClass,
    setIsProModalOpen,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(defaultSubject || 'Mathematics');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [duration, setDuration] = useState(60);
  const [selectedStudentCodes, setSelectedStudentCodes] = useState<string[]>(
    defaultStudentCode ? [defaultStudentCode] : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Connected students list
  const activeConnections = teacherConnections.filter((c) => c.status === 'accepted');

  const toggleStudent = (code: string) => {
    setSelectedStudentCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const selectAllStudents = () => {
    if (selectedStudentCodes.length === activeConnections.length) {
      setSelectedStudentCodes([]);
    } else {
      setSelectedStudentCodes(activeConnections.map((c) => c.studentEasiaCode));
    }
  };

  const handleSubmit = async (startImmediately = false) => {
    if (!title.trim()) {
      setErrorMsg('Please enter a class title.');
      return;
    }

    if (selectedStudentCodes.length === 0 && activeConnections.length > 0) {
      // Default to all connected students if none explicitly toggled
      selectedStudentCodes.push(...activeConnections.map((c) => c.studentEasiaCode));
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const classId = `CLS-2026-${randomSuffix}`;

    const newClassData: Partial<LiveClass> = {
      classId,
      title: title.trim(),
      subject,
      description: description.trim(),
      date,
      startTime,
      endTime,
      duration: Number(duration) || 60,
      assignedStudentCodes: selectedStudentCodes.length > 0 ? selectedStudentCodes : ['EA-STU-8K29Q'],
      status: startImmediately ? 'live' : 'upcoming',
      thumbnailUrl:
        subject.toLowerCase().includes('math')
          ? 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80'
          : subject.toLowerCase().includes('phys') || subject.toLowerCase().includes('sci')
          ? 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    };

    const res = await createLiveClass(newClassData);
    setIsSubmitting(false);

    if (res.success && res.liveClass) {
      if (startImmediately) {
        startLiveClass(res.liveClass.classId);
      }
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to create live class.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white rounded-[24px] shadow-2xl border border-gray-200 p-6 sm:p-8 flex flex-col text-[#111111] relative my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF2FF] text-[#2952CC] flex items-center justify-center font-bold">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#111111]">
                Schedule Live Class
              </h3>
              <p className="text-xs text-gray-500">
                HD Video, interactive whiteboard, screenshare & auto-attendance.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subscription Limits Notice */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2952CC]" />
            <span className="text-gray-700">
              Current Plan: <strong className="uppercase text-[#2952CC]">{userPlan}</strong>
              {userPlan === 'pro' && ' (2 classes/day • 100 students)'}
              {userPlan === 'ultra' && ' (10 classes/day • 500 students • Recording)'}
              {userPlan === 'annual' && ' (Unlimited classes • All features)'}
              {userPlan === 'free' && ' (Free plan: Upgrade required to host)'}
            </span>
          </div>

          {userPlan === 'free' && (
            <button
              onClick={() => setIsProModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-[#2952CC] text-white font-bold text-[11px] hover:bg-[#1f40a6] transition"
            >
              Upgrade
            </button>
          )}
        </div>

        {/* Form Fields */}
        <div className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Class Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. SSLC Board Quadratic Formula & Graph Analysis"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#2952CC] focus:ring-2 focus:ring-[#2952CC]/20 text-sm font-medium text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Subject & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#2952CC] focus:ring-2 focus:ring-[#2952CC]/20 text-sm font-medium text-gray-900 bg-white"
              >
                <option value="Mathematics">Mathematics (SSLC / 10th)</option>
                <option value="Physics & Science">Physics & Science</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Social Science">Social Science</option>
                <option value="English Grammar">English Grammar</option>
                <option value="Kannada Language">Kannada Language</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Duration (Minutes)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#2952CC] focus:ring-2 focus:ring-[#2952CC]/20 text-sm font-medium text-gray-900 bg-white"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (Standard)</option>
                <option value={90}>90 Minutes (Deep Dive)</option>
                <option value={120}>120 Minutes (Workshop)</option>
              </select>
            </div>
          </div>

          {/* Date, Start Time, End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#2952CC] text-xs font-medium text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#2952CC] text-xs font-medium text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#2952CC] text-xs font-medium text-gray-900"
              />
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Class Notes & Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Bring formula notebook and solved question papers from chapter 4."
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-[#2952CC] focus:ring-2 focus:ring-[#2952CC]/20 text-xs font-medium text-gray-900 placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Assign Students */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Enroll Connected Students ({selectedStudentCodes.length}/{activeConnections.length || 4})
              </label>
              <button
                type="button"
                onClick={selectAllStudents}
                className="text-xs text-[#2952CC] font-bold hover:underline cursor-pointer"
              >
                {selectedStudentCodes.length === activeConnections.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-gray-50 border border-gray-200 rounded-xl">
              {activeConnections.length > 0 ? (
                activeConnections.map((conn) => {
                  const isChecked = selectedStudentCodes.includes(conn.studentEasiaCode);
                  return (
                    <div
                      key={conn.id}
                      onClick={() => toggleStudent(conn.studentEasiaCode)}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition ${
                        isChecked
                          ? 'bg-[#EAF2FF] border border-[#2952CC]/40 text-[#2952CC]'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isChecked
                              ? 'bg-[#2952CC] border-[#2952CC] text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-bold">{conn.studentName}</span>
                        <span className="font-mono text-[10px] text-gray-400">
                          ({conn.studentEasiaCode})
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-gray-500">
                        {conn.studentClass}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-center text-xs text-gray-500">
                  All demo students will automatically be enrolled in this live classroom.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error notice */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl border border-[#2952CC] text-[#2952CC] hover:bg-[#EAF2FF] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule for Later</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl bg-[#2952CC] hover:bg-[#1f40a6] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Class Now</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
