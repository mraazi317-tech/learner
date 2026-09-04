import React, { useState, useEffect } from 'react';
import { useAuth, GoogleAuthPayload, StudentRegistrationData, TeacherRegistrationData } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  X,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  School,
  Check,
  Copy,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Calendar,
  User,
  Phone,
  BookOpen,
  MapPin,
  Building,
  Award,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authStep,
    setAuthStep,
    signInWithGoogle,
    pendingGoogleUser,
    setPendingGoogleUser,
    createStudentAccount,
    createTeacherAccount,
    checkUsernameAvailable,
    setUserManually,
  } = useAuth();

  const { setCurrentView } = useApp();

  // Internal steps: 1 = Google, 2 = Choose Role, 3 = Complete Profile, 4 = Success Screen
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<UserProfile | null>(null);

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    username: '',
    phone: '',
    whatsapp: '',
    sameAsPhone: true,
    guardianName: '',
    schoolName: '',
    className: 'Class 10 (SSLC)',
    medium: 'English',
    state: 'Karnataka',
  });

  // Teacher Form State
  const [teacherForm, setTeacherForm] = useState({
    fullName: '',
    username: '',
    phone: '',
    whatsapp: '',
    sameAsPhone: true,
    institutionName: '',
    subject: 'Mathematics',
    qualification: 'M.Sc, B.Ed',
    experience: '3–5 Years',
  });

  // Live validation states
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Trigger confetti when success screen opens
  useEffect(() => {
    if (authStep === 4) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2952CC', '#3B82F6', '#10B981', '#F59E0B'],
      });
    }
  }, [authStep]);

  // Pre-fill profile fields whenever Google user is authenticated
  useEffect(() => {
    if (pendingGoogleUser) {
      const suggestedUsername = (pendingGoogleUser.email.split('@')[0] || '')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase();

      setStudentForm((prev) => ({
        ...prev,
        fullName: prev.fullName || pendingGoogleUser.displayName || '',
        username: prev.username || suggestedUsername,
      }));

      setTeacherForm((prev) => ({
        ...prev,
        fullName: prev.fullName || pendingGoogleUser.displayName || '',
        username: prev.username || suggestedUsername,
      }));

      if (suggestedUsername) {
        checkUsernameAvailable(suggestedUsername).then((avail) => {
          setUsernameStatus(avail ? 'available' : 'taken');
        });
      }
    }
  }, [pendingGoogleUser]);

  if (!isAuthModalOpen) return null;

  // Handle Google button click
  const handleContinueWithGoogle = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const res = await signInWithGoogle();
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Google authentication failed. Please try again.');
      return;
    }

    // If existing user with completed role, route directly and close modal
    if (!res.isNewUser && res.user) {
      if (res.user.role === 'teacher') {
        setCurrentView('teacher_portal');
      } else if (res.user.role === 'admin') {
        setCurrentView('admin_panel');
      } else {
        setCurrentView('student_dashboard');
      }
      closeAuthModal();
      return;
    }

    // If new user, advance to Step 2
    if (res.isNewUser && res.googleUser) {
      setAuthStep(2);
    }
  };

  // Live username check with debounce
  const handleUsernameChange = (val: string) => {
    const clean = val.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    if (selectedRole === 'student') {
      setStudentForm((prev) => ({ ...prev, username: clean }));
    } else {
      setTeacherForm((prev) => ({ ...prev, username: clean }));
    }

    if (clean.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      const avail = await checkUsernameAvailable(clean);
      setUsernameStatus(avail ? 'available' : 'taken');
    }, 400);

    return () => clearTimeout(timer);
  };

  // Live phone validation (10 digits)
  const validatePhone = (phoneStr: string): boolean => {
    const cleaned = phoneStr.replace(/\D/g, '');
    if (cleaned.length === 10 || (cleaned.length > 9 && cleaned.length < 14)) {
      setPhoneError(null);
      return true;
    }
    setPhoneError('Please enter a valid 10-digit phone number');
    return false;
  };

  // Step 3 submission: create Student Account
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!studentForm.fullName.trim()) {
      setErrorMsg('Full Name is required');
      return;
    }
    if (!studentForm.username.trim() || studentForm.username.length < 3) {
      setErrorMsg('Valid Username (min 3 characters) is required');
      return;
    }
    if (usernameStatus === 'taken') {
      setErrorMsg('Username is already taken. Please choose another.');
      return;
    }
    if (!validatePhone(studentForm.phone)) {
      return;
    }
    if (!studentForm.guardianName.trim()) {
      setErrorMsg('Guardian Full Name is required');
      return;
    }
    if (!studentForm.schoolName.trim()) {
      setErrorMsg('School Name is required');
      return;
    }

    // Google user must be present
    const gUser: GoogleAuthPayload = pendingGoogleUser || {
      uid: `stu_${Date.now()}`,
      email: `${studentForm.username}@student.easialearn.com`,
      displayName: studentForm.fullName,
    };

    setIsLoading(true);
    const res = await createStudentAccount(gUser, {
      fullName: studentForm.fullName,
      username: studentForm.username,
      phone: studentForm.phone,
      whatsapp: studentForm.sameAsPhone ? studentForm.phone : studentForm.whatsapp,
      guardianName: studentForm.guardianName,
      schoolName: studentForm.schoolName,
      class: studentForm.className,
      medium: studentForm.medium,
      state: studentForm.state,
    });
    setIsLoading(false);

    if (res.success && res.profile) {
      setCreatedProfile(res.profile);
      setAuthStep(4);
    } else {
      setErrorMsg(res.error || 'Failed to create student account');
    }
  };

  // Step 3 submission: create Teacher Account
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!teacherForm.fullName.trim()) {
      setErrorMsg('Full Name is required');
      return;
    }
    if (!teacherForm.username.trim() || teacherForm.username.length < 3) {
      setErrorMsg('Valid Username (min 3 characters) is required');
      return;
    }
    if (usernameStatus === 'taken') {
      setErrorMsg('Username is already taken. Please choose another.');
      return;
    }
    if (!validatePhone(teacherForm.phone)) {
      return;
    }
    if (!teacherForm.institutionName.trim()) {
      setErrorMsg('Institution Name is required');
      return;
    }
    if (!teacherForm.subject.trim()) {
      setErrorMsg('Subject is required');
      return;
    }

    const gUser: GoogleAuthPayload = pendingGoogleUser || {
      uid: `tch_${Date.now()}`,
      email: `${teacherForm.username}@teacher.easialearn.com`,
      displayName: teacherForm.fullName,
    };

    setIsLoading(true);
    const res = await createTeacherAccount(gUser, {
      fullName: teacherForm.fullName,
      username: teacherForm.username,
      phone: teacherForm.phone,
      whatsapp: teacherForm.sameAsPhone ? teacherForm.phone : teacherForm.whatsapp,
      institutionName: teacherForm.institutionName,
      subject: teacherForm.subject,
      qualification: teacherForm.qualification,
      experience: teacherForm.experience,
    });
    setIsLoading(false);

    if (res.success && res.profile) {
      setCreatedProfile(res.profile);
      setAuthStep(4);
    } else {
      setErrorMsg(res.error || 'Failed to create teacher account');
    }
  };

  // Copy EasiaCode
  const handleCopyCode = () => {
    if (!createdProfile?.easiacode) return;
    navigator.clipboard.writeText(createdProfile.easiacode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Final navigation to dashboard
  const handleGoToDashboard = () => {
    if (createdProfile?.role === 'teacher') {
      setCurrentView('teacher_portal');
    } else if (createdProfile?.role === 'admin') {
      setCurrentView('admin_panel');
    } else {
      setCurrentView('student_dashboard');
    }
    closeAuthModal();
  };

  return (
    <div
      id="easialearn-auth-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="easialearn-auth-modal"
        className="relative w-full max-w-[640px] my-6 bg-white rounded-[24px] shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-[#E5E7EB] p-6 sm:p-8 flex flex-col text-[#111111]"
      >
        {/* Top Header: Close Button & Back Button */}
        <div className="flex items-center justify-between mb-4">
          {authStep > 1 && authStep < 4 ? (
            <button
              id="auth-back-btn"
              onClick={() => {
                setErrorMsg(null);
                setAuthStep(authStep - 1);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] hover:text-[#2952CC] transition-colors px-2.5 py-1.5 rounded-xl hover:bg-[#F8FAFC]"
            >
              <ArrowLeft className="w-4 h-4 text-[#111111]" />
              <span>Back</span>
            </button>
          ) : (
            <div className="w-10" />
          )}

          <button
            id="auth-close-btn"
            onClick={closeAuthModal}
            className="w-9 h-9 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center text-[#111111] hover:bg-slate-100 hover:text-[#111111] transition-all"
            title="Close"
          >
            <X className="w-4 h-4 text-[#111111]" />
          </button>
        </div>

        {/* Global Modal Header (shown on steps 1, 2, 3) */}
        {authStep < 4 && (
          <div className="text-center mb-6">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#111111] tracking-tight">
              Welcome to EasiaLearn
            </h2>
            <p className="text-sm font-medium text-[#111111] mt-1.5 max-w-md mx-auto leading-relaxed">
              Create your account to access your personalized learning platform.
            </p>
          </div>
        )}

        {/* Error Notification Banner */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-[#111111]">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="font-semibold text-[#111111]">{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: CONTINUE WITH GOOGLE */}
        {authStep === 1 && (
          <div className="space-y-6 py-2">
            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-5 text-center">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EAF2FF] text-[#2952CC] text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Single Sign-On</span>
              </div>
              <h3 className="font-heading font-bold text-xl text-[#111111]">
                Continue with Google
              </h3>
              <p className="text-sm font-medium text-[#111111] mt-1.5 max-w-sm mx-auto leading-relaxed">
                Use your Google account to securely create your EasiaLearn account.
              </p>
            </div>

            {/* Single Large Google Button */}
            <button
              id="btn-continue-with-google"
              onClick={handleContinueWithGoogle}
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-white border-2 border-[#111111] hover:border-[#2952CC] hover:bg-[#F8FAFC] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3.5 group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm font-bold text-[#111111]">
                  <Loader2 className="w-5 h-5 animate-spin text-[#2952CC]" />
                  <span>Connecting to Google...</span>
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="font-heading font-bold text-base text-[#111111] group-hover:text-[#2952CC] transition-colors">
                    Continue with Google
                  </span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#111111]">
              <ShieldCheck className="w-4 h-4 text-[#2952CC]" />
              <span>One Google account = One EasiaLearn account</span>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE YOUR ROLE */}
        {authStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#111111]">
                Choose your account type
              </h3>
              <p className="text-sm font-medium text-[#111111] mt-1">
                Select how you will be using EasiaLearn.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* STUDENT CARD */}
              <div
                id="role-card-student"
                onClick={() => setSelectedRole('student')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left ${
                  selectedRole === 'student'
                    ? 'border-[#2952CC] bg-[#EAF2FF]/50 shadow-md ring-2 ring-[#2952CC]/20'
                    : 'border-[#E5E7EB] bg-white hover:border-[#111111]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#2952CC] text-white flex items-center justify-center shadow-sm">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    {selectedRole === 'student' && (
                      <div className="w-6 h-6 rounded-full bg-[#2952CC] text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-heading font-extrabold text-lg text-[#111111]">
                    Student
                  </h4>
                  <p className="text-xs font-medium text-[#111111] mt-2 leading-relaxed">
                    Learn with AI Tutor, join quizzes, participate in exams, earn Easiacoins and receive certificates.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    selectedRole === 'student'
                      ? 'bg-[#2952CC] text-white'
                      : 'bg-white border border-[#111111] text-[#111111] hover:bg-[#F8FAFC]'
                  }`}
                >
                  Select Student
                </button>
              </div>

              {/* TEACHER CARD */}
              <div
                id="role-card-teacher"
                onClick={() => setSelectedRole('teacher')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left ${
                  selectedRole === 'teacher'
                    ? 'border-[#2952CC] bg-[#EAF2FF]/50 shadow-md ring-2 ring-[#2952CC]/20'
                    : 'border-[#E5E7EB] bg-white hover:border-[#111111]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#22C55E] text-white flex items-center justify-center shadow-sm">
                      <School className="w-6 h-6 text-white" />
                    </div>
                    {selectedRole === 'teacher' && (
                      <div className="w-6 h-6 rounded-full bg-[#2952CC] text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-heading font-extrabold text-lg text-[#111111]">
                    Teacher
                  </h4>
                  <p className="text-xs font-medium text-[#111111] mt-2 leading-relaxed">
                    Create quizzes, conduct exams, manage students, publish results and generate certificates.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRole('teacher')}
                  className={`mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    selectedRole === 'teacher'
                      ? 'bg-[#2952CC] text-white'
                      : 'bg-white border border-[#111111] text-[#111111] hover:bg-[#F8FAFC]'
                  }`}
                >
                  Select Teacher
                </button>
              </div>
            </div>

            {/* Continue button at bottom */}
            <button
              id="btn-role-continue"
              onClick={() => {
                if (selectedRole) {
                  setAuthStep(3);
                }
              }}
              disabled={!selectedRole}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#2952CC] text-white font-heading font-bold text-sm shadow-md hover:bg-[#2042a8] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* STEP 3: COMPLETE PROFILE */}
        {authStep === 3 && selectedRole === 'student' && (
          <form onSubmit={handleCreateStudent} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Google Identity Imported Header */}
            {pendingGoogleUser && (
              <div className="p-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl flex items-center gap-3">
                {pendingGoogleUser.photoURL ? (
                  <img
                    src={pendingGoogleUser.photoURL}
                    alt={pendingGoogleUser.displayName}
                    className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#2952CC] text-white flex items-center justify-center font-bold">
                    {pendingGoogleUser.displayName[0] || 'U'}
                  </div>
                )}
                <div className="overflow-hidden text-left flex-1">
                  <div className="text-xs font-bold text-[#111111] truncate">
                    {pendingGoogleUser.displayName}
                  </div>
                  <div className="text-[11px] font-semibold text-[#111111] truncate">
                    {pendingGoogleUser.email}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Google Verified
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={studentForm.fullName}
                  onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                  placeholder="e.g. Amina Sheikh"
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-[#111111] bg-white border-2 border-[#111111]/20 focus:border-[#2952CC] rounded-xl outline-hidden"
                />
              </div>

              {/* Username with Live Availability Check */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#111111]">
                    Username *
                  </label>
                  <div className="text-[11px] font-bold">
                    {usernameStatus === 'checking' && (
                      <span className="text-amber-700 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Checking availability...
                      </span>
                    )}
                    {usernameStatus === 'available' && (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Available
                      </span>
                    )}
                    {usernameStatus === 'taken' && (
                      <span className="text-rose-700 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Username taken
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#111111]">@</span>
                  <input
                    type="text"
                    required
                    value={studentForm.username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="amina_sslc"
                    className="w-full pl-8 pr-3.5 py-2.5 text-xs font-medium text-[#111111] bg-white border-2 border-[#111111]/20 focus:border-[#2952CC] rounded-xl outline-hidden"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={studentForm.phone}
                  onChange={(e) => {
                    setStudentForm({ ...studentForm, phone: e.target.value });
                    validatePhone(e.target.value);
                  }}
                  placeholder="9845012345"
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-[#111111] bg-white border-2 border-[#111111]/20 focus:border-[#2952CC] rounded-xl outline-hidden"
                />
                {phoneError && (
                  <p className="text-[10px] font-bold text-red-600 mt-1">{phoneError}</p>
                )}
              </div>

              {/* WhatsApp Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#111111]">WhatsApp Number</label>
                  <label className="flex items-center gap-1 text-[10px] font-bold text-[#111111] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={studentForm.sameAsPhone}
                      onChange={(e) => setStudentForm({ ...studentForm, sameAsPhone: e.target.checked })}
                      className="rounded text-[#2952CC]"
                    />
                    <span>Same as phone</span>
                  </label>
                </div>
                <input
                  type="tel"
                  disabled={studentForm.sameAsPhone}
                  value={studentForm.sameAsPhone ? studentForm.phone : studentForm.whatsapp}
                  onChange={(e) => setStudentForm({ ...studentForm, whatsapp: e.target.value })}
                  placeholder="9845012345"
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-[#111111] bg-white border-2 border-[#111111]/20 focus:border-[#2952CC] rounded-xl outline-hidden disabled:bg-gray-100"
                />
              </div>

              {/* Guardian Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  Guardian Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={studentForm.guardianName}
                  onChange={(e) => setStudentForm({ ...studentForm, guardianName: e.target.value })}
                  placeholder="e.g. Abdul Sheikh"
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-[#111111] bg-white border-2 border-[#111111]/20 focus:border-[#2952CC] rounded-xl outline-hidden"
                />
              </div>

              {/* School Name */}
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  School Name *
                </label>
                <input
                  type="text"
                  required
                  value={studentForm.schoolName}
                  onChange={(e) => setStudentForm({ ...studentForm, schoolName: e.target.value })}
                  placeholder="Sacred Heart PU College"
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-[#111111] bg-white border-2 border-[#111111]/20 focus:border-[#2952CC] rounded-xl outline-hidden"
                />
              </div>

              {/* Class (1–12) */}
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  Class (1–12) *
                </label>
                <select
                  value={studentForm.className}
                  onChange={(e) => setStudentForm({ ...studentForm, className: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-bold text-[#111111] bg-white border-2 border-[#111111]/20 focus:border-[#2952CC] rounded-xl outline-hidden"
                >
                  <option value="Class 10 (SSLC)">Class 10 (SSLC)</option>
                  <option value="PUC I (Class 11)">PUC I (Class 11)</option>
                  <option value="PUC II (Class 12)">PUC II (Class 12)</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 5">Class 5</option>
                  <option value="Class 4">Class 4</option>
                  <option value="Class 3">Class 3</option>
                  <option value="Class 2">Class 2</option>
                  <option value="Class 1">Class 1</option>
                </select>
              </div>

              {/* Medium */}
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  Medium *
                </label>
                <select
                  value={studentForm.medium}
                  onChange={(e) => setStudentForm({ ...studentForm, medium: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-bold text-[#111111] bg-white border-2 border-[#111111]/20 focus:border-[#2952CC] rounded-xl outline-hidden"
                >
                  <option value="English">English</option>
                  <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                  <option value="Urdu">اردو (Urdu)</option>
                  <option value="Arabic">العربية (Arabic)</option>
                </select>
              </div>

              {/* State */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  State *
                </label>
                <select
                  value={studentForm.state}
                  onChange={(e) => setStudentForm({ ...studentForm, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-bold text-[#111111] bg-white border-2 border-[#111111]/20 focus:border-[#2952CC] rounded-xl outline-hidden"
                >
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Goa">Goa</option>
                  <option value="Other">Other State</option>
                </select>
              </div>
            </div>

            <button
              id="btn-create-student-account"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-[#2952CC] text-white font-heading font-bold text-sm shadow-md hover:bg-[#2042a8] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Creating Student Account...</span>
                </>
              ) : (
                <>
                  <span>Create Student Account</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: COMPLETE PROFILE (TEACHER) */}
        {authStep === 3 && selectedRole === 'teacher' && (
          <form onSubmit={handleCreateTeacher} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {pendingGoogleUser && (
              <div className="p-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl flex items-center gap-3">
                {pendingGoogleUser.photoURL ? (
                  <img
                    src={pendingGoogleUser.photoURL}
                    alt={pendingGoogleUser.displayName}
                    className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#22C55E] text-white flex items-center justify-center font-bold">
                    {pendingGoogleUser.displayName[0] || 'T'}
                  </div>
                )}
                <div className="overflow-hidden text-left flex-1">
                  <div className="text-xs font-bold text-[#111111] truncate">
                    {pendingGoogleUser.displayName}
                  </div>
                  <div className="text-[11px] font-semibold text-[#111111] truncate">
                    {pendingGoogleUser.email}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Google Verified
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={teacherForm.fullName}
                  onChange={(e) => setTeacherForm({ ...teacherForm, fullName: e.target.value })}
                  placeholder="e.g. Prof. M. K. Rao"
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-[#111111] bg-white border-2 border-[#111111]/20 focus:border-[#2952CC] rounded-xl outline-hidden"
                />
              </div>

              {/* Username with Live Availability Check */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#111111]">
                    Username *
                  </label>
                  <div className="text-[11px] font-bold">
                    {usernameStatus === 'checking' && (
                      <span className="text-amber-700 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Checking availability...
                      </span>
                    )}
                    {usernameStatus === 'available' && (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Available
                      </span>
                    )}
                    {usernameStatus === 'taken' && (
                      <span className="text-rose-700 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Username taken
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#111111]">@</span>
                  <input
                    type="text"
                    required
                    value={teacherForm.username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="mkrao_physics"
                    className="w-full pl-8 pr-3.5 py-2.5 text-xs font-medium text-[#111111] bg-white border-2 border-[#111111]/20 focus:border-[#2952CC] rounded-xl outline-hidden"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={teacherForm.phone}
                  onChange={(e) => {
                    setTeacherForm({ ...teacherForm, phone: e.target.value });
                    validatePhone(e.target.value);
                  }}
                  placeholder="9448011223"
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-[#111111] bg-white border-2 border-[#111111]/20 focus:border-[#2952CC] rounded-xl outline-hidden"
                />
                {phoneError && (
                  <p className="text-[10px] font-bold text-red-600 mt-1">{phoneError}</p>
                )}
              </div>

              {/* WhatsApp Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#111111]">WhatsApp Number</label>
                  <label className="flex items-center gap-1 text-[10px] font-bold text-[#111111] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={teacherForm.sameAsPhone}
                      onChange={(e) => setTeacherForm({ ...teacherForm, sameAsPhone: e.target.checked })}
                      className="rounded text-[#2952CC]"
                    />
                    <span>Same as phone</span>
                  </label>
                </div>
                <input
                  type="tel"
                  disabled={teacherForm.sameAsPhone}
                  value={teacherForm.sameAsPhone ? teacherForm.phone : teacherForm.whatsapp}
                  onChange={(e) => setTeacherForm({ ...teacherForm, whatsapp: e.target.value })}
                  placeholder="9448011223"
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-[#111111] bg-white border-2 border-[#111111]/20 focus:border-[#2952CC] rounded-xl outline-hidden disabled:bg-gray-100"
                />
              </div>

              {/* Institution Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  Institution Name *
                </label>
                <input
                  type="text"
                  required
                  value={teacherForm.institutionName}
                  onChange={(e) => setTeacherForm({ ...teacherForm, institutionName: e.target.value })}
                  placeholder="Vidya Mandir Composite PU College"
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-[#111111] bg-white border-2 border-[#111111]/20 focus:border-[#2952CC] rounded-xl outline-hidden"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={teacherForm.subject}
                  onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                  placeholder="Physics / Mathematics / Science"
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-[#111111] bg-white border-2 border-[#111111]/20 focus:border-[#2952CC] rounded-xl outline-hidden"
                />
              </div>

              {/* Qualification */}
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  Qualification
                </label>
                <input
                  type="text"
                  value={teacherForm.qualification}
                  onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })}
                  placeholder="M.Sc, B.Ed"
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-[#111111] bg-white border-2 border-[#111111]/20 focus:border-[#2952CC] rounded-xl outline-hidden"
                />
              </div>

              {/* Experience */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  Experience
                </label>
                <select
                  value={teacherForm.experience}
                  onChange={(e) => setTeacherForm({ ...teacherForm, experience: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-bold text-[#111111] bg-white border-2 border-[#111111]/20 focus:border-[#2952CC] rounded-xl outline-hidden"
                >
                  <option value="1–3 Years">1–3 Years</option>
                  <option value="3–5 Years">3–5 Years</option>
                  <option value="5–10 Years">5–10 Years</option>
                  <option value="10+ Years">10+ Years</option>
                  <option value="Fresh Graduate">Fresh Graduate</option>
                </select>
              </div>
            </div>

            <button
              id="btn-create-teacher-account"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-[#2952CC] text-white font-heading font-bold text-sm shadow-md hover:bg-[#2042a8] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Creating Teacher Account...</span>
                </>
              ) : (
                <>
                  <span>Create Teacher Account</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 4: SUCCESS SCREEN */}
        {authStep === 4 && createdProfile && (
          <div className="text-center space-y-6 py-2 animate-in zoom-in-95 duration-300">
            {/* Success Animation Badge */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#111111]">
                Welcome to EasiaLearn
              </h2>
              <p className="text-sm font-medium text-[#111111] mt-1">
                Your account has been created successfully.
              </p>
            </div>

            {/* Display Card with Details */}
            <div className="bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-2xl p-5 text-left space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                    Full Name
                  </div>
                  <div className="font-heading font-bold text-base text-[#111111]">
                    {createdProfile.fullName || createdProfile.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                    Username
                  </div>
                  <div className="text-xs font-extrabold text-[#2952CC]">
                    @{createdProfile.username}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                    Role
                  </div>
                  <div className="text-xs font-bold text-[#111111] capitalize flex items-center gap-1.5 mt-0.5">
                    {createdProfile.role === 'teacher' ? (
                      <School className="w-3.5 h-3.5 text-[#22C55E]" />
                    ) : (
                      <GraduationCap className="w-3.5 h-3.5 text-[#2952CC]" />
                    )}
                    <span>{createdProfile.role}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                    Trial Status
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold mt-0.5">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>10-Day Free Trial Active</span>
                  </span>
                </div>
              </div>

              {/* Permanent EasiaCode Highlight Card */}
              <div className="p-3.5 rounded-xl bg-white border-2 border-[#2952CC] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#111111]">
                    Your Permanent EasiaCode
                  </div>
                  <div className="font-mono font-extrabold text-lg sm:text-xl text-[#2952CC] tracking-wide">
                    {createdProfile.easiacode}
                  </div>
                </div>
                <button
                  id="btn-copy-easiacode"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-[#EAF2FF] border border-[#2952CC]/30 hover:bg-[#2952CC] hover:text-white text-[#2952CC] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                id="btn-go-to-dashboard"
                onClick={handleGoToDashboard}
                className="w-full py-4 px-6 rounded-2xl bg-[#2952CC] text-white font-heading font-bold text-sm shadow-md hover:bg-[#2042a8] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Progress Indicator (Step 1, 2, 3) */}
        {authStep < 4 && (
          <div className="mt-6 pt-5 border-t border-[#E5E7EB] flex flex-col items-center gap-2">
            <div className="flex items-center justify-between w-full max-w-xs text-xs font-bold text-[#111111]">
              <span>Step {authStep} of 3</span>
              <span>{authStep === 1 ? 'Authentication' : authStep === 2 ? 'Account Type' : 'Profile Details'}</span>
            </div>
            {/* Visual Step Indicator Bars */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-xs h-2">
              <div
                className={`rounded-full transition-all duration-300 ${
                  authStep >= 1 ? 'bg-[#2952CC]' : 'bg-[#E5E7EB]'
                }`}
              />
              <div
                className={`rounded-full transition-all duration-300 ${
                  authStep >= 2 ? 'bg-[#2952CC]' : 'bg-[#E5E7EB]'
                }`}
              />
              <div
                className={`rounded-full transition-all duration-300 ${
                  authStep >= 3 ? 'bg-[#2952CC]' : 'bg-[#E5E7EB]'
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
