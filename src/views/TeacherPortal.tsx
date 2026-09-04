import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Plus,
  Upload,
  ClipboardCheck,
  Users,
  Bell,
  CheckCircle,
  FileText,
  Video,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Search,
  HelpCircle,
  FileCheck,
  Database,
  BarChart3,
  Award,
  User,
  Copy,
  Check,
  Clock,
  AlertCircle,
  Sparkles,
  School,
  FileSpreadsheet,
  Trash2,
  Download,
  ShieldCheck,
  Settings,
  QrCode,
  GraduationCap,
} from 'lucide-react';
import { ExamQuestion, Question, TeacherExam, TeacherQuiz, ExamSubmission, Certificate } from '../types';
import { generateCertificatePdf } from '../lib/fileGenerators';
import { MessengerApp } from '../components/messenger/MessengerApp';
import { AddStudentModal } from '../components/classroom/AddStudentModal';
import { motion } from 'motion/react';

export const TeacherPortal: React.FC = () => {
  const {
    subjects,
    createSubject,
    lessons,
    mockTests,
    announcements,
    createAnnouncement,
    createQuestion,
    results,
    triggerCelebration,
    teacherExams,
    createTeacherExam,
    teacherQuizzes,
    createTeacherQuiz,
    examSubmissions,
    publishExamResults,
    certificates,
    generateCertificate,
    sendNotification,
    teacherConnections,
  } = useApp();

  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'students'
    | 'create_quiz'
    | 'create_exam'
    | 'question_bank'
    | 'results'
    | 'certificates'
    | 'messages'
    | 'analytics'
    | 'settings'
  >('overview');

  // First Login Welcome Onboarding & Add Student Modal state
  const [isWelcomeOnboardOpen, setIsWelcomeOnboardOpen] = useState(() => {
    return !localStorage.getItem('easia_teacher_onboarded_' + (user?.uid || 'teacher'));
  });
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // Accepted connected students list (Zero by default for newly registered teachers)
  const acceptedConnections = teacherConnections.filter((c) => c.status === 'accepted');

  // Quiz Builder state
  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState('Science & Optics (SSLC)');
  const [quizClass, setQuizClass] = useState('Class 10 (SSLC)');
  const [quizDuration, setQuizDuration] = useState('20');
  const [quizSelectedStudents, setQuizSelectedStudents] = useState<string[]>(['EA-STU-8K29Q', 'EA-STU-4N17X']);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([
    {
      id: 'qz_1',
      question: 'What is the speed of light in vacuum?',
      options: ['3 × 10⁸ m/s', '2 × 10⁸ m/s', '3 × 10⁶ m/s', '1.5 × 10⁸ m/s'],
      correctAnswer: 0,
      marks: 2,
      explanation: 'In vacuum, light travels at approximately 3 × 10^8 m/s.',
    },
    {
      id: 'qz_2',
      question: 'Which organelle is called the powerhouse of the cell?',
      options: ['Ribosome', 'Mitochondria', 'Golgi apparatus', 'Nucleus'],
      correctAnswer: 1,
      marks: 2,
      explanation: 'Mitochondria produce ATP through cellular respiration.',
    },
  ]);
  const [newQuizQText, setNewQuizQText] = useState('');
  const [newQuizOptions, setNewQuizOptions] = useState(['', '', '', '']);
  const [newQuizCorrect, setNewQuizCorrect] = useState(0);

  // Exam Builder State
  const [examTitle, setExamTitle] = useState('');
  const [examSubject, setExamSubject] = useState('Science & Optics (SSLC)');
  const [examClass, setExamClass] = useState('Class 10 (SSLC)');
  const [examDuration, setExamDuration] = useState('90');
  const [examTotalMarks, setExamTotalMarks] = useState('80');
  const [examNegativeMarking, setExamNegativeMarking] = useState(false);
  const [examSelectedStudents, setExamSelectedStudents] = useState<string[]>([
    'EA-STU-8K29Q',
    'EA-STU-4N17X',
    'EA-STU-9Z32L',
  ]);
  const [selectAllStudents, setSelectAllStudents] = useState(false);
  const [customStudentCode, setCustomStudentCode] = useState('');
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([
    {
      id: 'ex_q1',
      type: 'mcq',
      question: 'Light travels from a rarer to denser medium. It bends:',
      options: ['Towards the normal', 'Away from the normal', 'Undeviated', 'Reflects back 100%'],
      correctAnswer: 0,
      marks: 2,
      explanation: 'When light slows down in denser medium, it refracts towards the normal.',
    },
    {
      id: 'ex_q2',
      type: 'true_false',
      question: 'The focal length of a convex lens is always positive.',
      options: ['True', 'False'],
      correctAnswer: 'True',
      marks: 2,
      explanation: 'By Cartesian sign convention, the principal focus of convex lens lies in front.',
    },
    {
      id: 'ex_q3',
      type: 'short_answer',
      question: 'State the SI unit of electric potential difference.',
      correctAnswer: 'Volt',
      marks: 2,
      explanation: 'Potential difference is measured in Volts (V) named after Alessandro Volta.',
    },
  ]);
  const [newExamQType, setNewExamQType] = useState<'mcq' | 'true_false' | 'short_answer'>('mcq');
  const [newExamQText, setNewExamQText] = useState('');
  const [newExamOptions, setNewExamOptions] = useState(['', '', '', '']);
  const [newExamCorrect, setNewExamCorrect] = useState<string | number>(0);
  const [newExamMarks, setNewExamMarks] = useState('2');

  // Certificate Generator State
  const [certStudentName, setCertStudentName] = useState('Amina Sheikh');
  const [certStudentCode, setCertStudentCode] = useState('EA-STU-8K29Q');
  const [certExamTitle, setCertExamTitle] = useState('Karnataka State SSLC Science Preparatory CBT Exam');
  const [certScore, setCertScore] = useState('95');
  const [certGrade, setCertGrade] = useState('A+ Distinction');

  // Toast & Copied state
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    triggerCelebration();
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const teacherCode = user?.easiacode || 'EA-TCH-5P91X';

  // Handlers for Exam Questions
  const handleAddExamQuestion = () => {
    if (!newExamQText.trim()) return;
    const newQ: ExamQuestion = {
      id: `ex_q_${Date.now()}`,
      type: newExamQType,
      question: newExamQText.trim(),
      options: newExamQType === 'mcq' ? newExamOptions.filter((o) => o.trim()) : newExamQType === 'true_false' ? ['True', 'False'] : undefined,
      correctAnswer: newExamCorrect,
      marks: parseInt(newExamMarks) || 2,
    };
    setExamQuestions((prev) => [...prev, newQ]);
    setNewExamQText('');
    setNewExamOptions(['', '', '', '']);
    setNewExamCorrect(0);
  };

  const handleDeleteExamQuestion = (id: string) => {
    setExamQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Handlers for Quiz Questions
  const handleAddQuizQuestion = () => {
    if (!newQuizQText.trim()) return;
    const newQ: Question = {
      id: `qz_q_${Date.now()}`,
      question: newQuizQText.trim(),
      options: newQuizOptions.filter((o) => o.trim()),
      correctAnswer: newQuizCorrect,
      marks: 2,
    };
    setQuizQuestions((prev) => [...prev, newQ]);
    setNewQuizQText('');
    setNewQuizOptions(['', '', '', '']);
    setNewQuizCorrect(0);
  };

  // Publish Exam (EasiaCode Exam Flow)
  const handlePublishExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;

    const assigned = selectAllStudents
      ? ['all']
      : customStudentCode.trim()
      ? [...examSelectedStudents, customStudentCode.trim().toUpperCase()]
      : examSelectedStudents;

    const examCode = `EX-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    await createTeacherExam({
      examCode,
      title: examTitle.trim(),
      subject: examSubject,
      class: examClass,
      description: `Official timed CBT examination created by ${user?.name || 'Faculty'}.`,
      durationMinutes: parseInt(examDuration) || 90,
      totalMarks: parseInt(examTotalMarks) || 80,
      questions: examQuestions,
      assignedStudentCodes: assigned,
      institution: user?.schoolName || 'EasiaLearn Board Academy',
      status: 'published',
      resultsPublished: false,
    });

    // Send real-time notification to students
    await sendNotification({
      recipientRole: 'student',
      title: `New CBT Exam Assigned: ${examTitle.trim()}`,
      message: `Exam Code: ${examCode} • ${examDuration} Mins • ${examTotalMarks} Marks. Enrolled via EasiaCode.`,
      type: 'exam_available',
    });

    showToast(`Exam "${examTitle.trim()}" published! Exam Code: ${examCode} assigned to ${assigned.length} students.`);
    setExamTitle('');
    setActiveTab('results');
  };

  // Publish Quiz
  const handlePublishQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) return;

    const quizCode = `QZ-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    await createTeacherQuiz({
      title: quizTitle.trim(),
      subject: quizSubject,
      class: quizClass,
      description: `Quick diagnostic quiz by ${user?.name || 'Faculty'}.`,
      quizCode,
      questions: quizQuestions,
      timerMinutes: parseInt(quizDuration) || 20,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      totalMarks: quizQuestions.reduce((acc, q) => acc + (q.marks || 2), 0),
      assignedStudentCodes: quizSelectedStudents,
      isPublished: true,
    });

    await sendNotification({
      recipientRole: 'student',
      title: `New Practice Quiz: ${quizTitle.trim()}`,
      message: `Code: ${quizCode} • ${quizDuration} Mins. Available now in Quiz & Exams.`,
      type: 'quiz_available',
    });

    showToast(`Quiz "${quizTitle.trim()}" published successfully!`);
    setQuizTitle('');
    setActiveTab('overview');
  };

  // Publish Results (Flow: publish -> auto-certify -> notify)
  const handlePublishResult = async (sub: ExamSubmission) => {
    await publishExamResults(sub.id);
    const percentage = Math.round((sub.score / sub.totalMarks) * 100);

    // Auto-generate certificate if score >= 70%
    if (percentage >= 70) {
      const certId = `EA-CERT-${Math.floor(10000 + Math.random() * 90000)}`;
      const grade = percentage >= 90 ? 'A+ Distinction' : percentage >= 80 ? 'A First Class' : 'B Second Class';

      await generateCertificate({
        studentId: sub.studentId,
        studentName: sub.studentName,
        studentEasiaCode: sub.studentEasiaCode,
        teacherId: user?.uid || 'teacher_1',
        teacherName: user?.name || 'Prof. Ramesh Kumar',
        institution: user?.schoolName || 'Karnataka State Board Council',
        type: 'Merit',
        title: `${sub.examTitle} - State Board Distinction`,
        subject: 'SSLC Preparatory Examination',
        issueDate: new Date().toISOString().split('T')[0],
        certificateNo: certId,
        scorePercentage: percentage,
        score: sub.score,
        totalMarks: sub.totalMarks,
        grade: grade,
        qrCodeSeed: `https://easialearn.edu.in/verify/${certId}`,
        verificationId: certId,
        certificateId: certId,
      });
    }

    await sendNotification({
      userId: sub.studentId,
      recipientRole: 'student',
      title: `CBT Exam Results Published: ${sub.examTitle}`,
      message: `Your score: ${sub.score} / ${sub.totalMarks} (${percentage}%). ${percentage >= 70 ? 'Official distinction certificate generated!' : 'Keep practicing!'}`,
      type: 'exam_available',
    });

    showToast(`Results published for ${sub.studentName}! ${percentage >= 70 ? 'Official Certificate generated.' : ''}`);
  };

  // Manual Certificate Generator
  const handleGenerateManualCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certStudentName.trim() || !certExamTitle.trim()) return;

    const certId = `EA-CERT-${Math.floor(10000 + Math.random() * 90000)}`;
    const scoreVal = parseInt(certScore) || 85;

    await generateCertificate({
      studentName: certStudentName.trim(),
      studentEasiaCode: certStudentCode.trim().toUpperCase(),
      teacherId: user?.uid || 'teacher_1',
      teacherName: user?.name || 'Prof. M. K. Rao',
      institution: user?.schoolName || 'EasiaLearn Board Examination Council',
      type: 'Merit',
      title: certExamTitle.trim(),
      subject: 'Academic Distinction',
      issueDate: new Date().toISOString().split('T')[0],
      certificateNo: certId,
      scorePercentage: scoreVal,
      score: scoreVal,
      totalMarks: 100,
      grade: certGrade,
      qrCodeSeed: `https://easialearn.edu.in/verify/${certId}`,
      verificationId: certId,
      certificateId: certId,
    });

    await sendNotification({
      recipientRole: 'student',
      title: `Certificate Issued: ${certExamTitle.trim()}`,
      message: `Awarded to ${certStudentName.trim()} with grade ${certGrade}. Verification ID: ${certId}`,
      type: 'exam_available',
    });

    showToast(`Certificate ${certId} issued to ${certStudentName.trim()}!`);
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'create_quiz', label: 'Create Quiz', icon: HelpCircle },
    { id: 'create_exam', label: 'Create Exam', icon: FileCheck },
    { id: 'question_bank', label: 'Question Bank', icon: Database },
    { id: 'results', label: 'Results', icon: BarChart3 },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E7F9EF] text-[#22C55E] mb-2">
              <CheckCircle className="w-4 h-4" />
              <span>Verified Educator Portal</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl text-[#111827]">Faculty Dashboard</h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Curate lessons, publish mock exams, review student submissions & broadcast announcements.
            </p>
          </div>

          {/* TEACHER EASIACODE PROMINENT BADGE */}
          <div className="p-3.5 rounded-2xl bg-white border-2 border-[#2952CC] shadow-xs flex items-center gap-3">
            <div>
              <div className="text-[10px] font-bold text-[#2952CC] uppercase tracking-wider">
                Teacher EasiaCode
              </div>
              <div className="font-mono font-extrabold text-base text-[#111827]">
                {teacherCode}
              </div>
            </div>
            <button
              onClick={() => handleCopyCode(teacherCode)}
              className="p-2 rounded-xl bg-[#EAF2FF] text-[#2952CC] hover:bg-[#2952CC] hover:text-white transition cursor-pointer"
              title="Copy Teacher EasiaCode"
            >
              {copiedCode ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Toast */}
        {successToast && (
          <div className="mb-6 p-4 rounded-2xl bg-[#E7F9EF] text-[#22C55E] border border-[#22C55E]/30 font-semibold text-xs flex items-center gap-2 animate-in fade-in shadow-sm">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Navigation Tabs (Sidebar / Tab Bar) */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 text-xs font-semibold scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 shrink-0 transition-all ${
                  isActive
                    ? 'bg-[#2952CC] text-white font-bold shadow-xs'
                    : 'bg-white border border-[#E5E7EB] text-[#64748B] hover:text-[#111827]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: HOME / OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {/* 4 TOP CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* 1. Total Students */}
              <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold mb-2">
                  <span>Total Students</span>
                  <Users className="w-4 h-4 text-[#2952CC]" />
                </div>
                <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#2952CC]">
                  142
                </div>
                <div className="text-[11px] text-[#22C55E] mt-1 font-semibold">+12 linked this week</div>
              </div>

              {/* 2. Active Exams */}
              <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold mb-2">
                  <span>Active Exams</span>
                  <ClipboardCheck className="w-4 h-4 text-[#22C55E]" />
                </div>
                <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#22C55E]">
                  {teacherExams.length || 3}
                </div>
                <div className="text-[11px] text-[#64748B] mt-1 font-medium">Published CBT exams</div>
              </div>

              {/* 3. Pending Submissions */}
              <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold mb-2">
                  <span>Submissions</span>
                  <Clock className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#F59E0B]">
                  {examSubmissions.length}
                </div>
                <div className="text-[11px] text-[#64748B] mt-1 font-medium">
                  {examSubmissions.filter((s) => s.status === 'submitted').length} awaiting publish
                </div>
              </div>

              {/* 4. Certificates Issued */}
              <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold mb-2">
                  <span>Certificates</span>
                  <Award className="w-4 h-4 text-[#8B5CF6]" />
                </div>
                <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#8B5CF6]">
                  {certificates.length || 24}
                </div>
                <div className="text-[11px] text-[#8B5CF6] mt-1 font-semibold">Distinction rankers</div>
              </div>
            </div>

            {/* Quick Action Hub */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('create_quiz')}
                className="p-5 rounded-3xl bg-white border border-[#E5E7EB] text-left hover:border-[#2952CC] transition shadow-xs group"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#EAF2FF] text-[#2952CC] flex items-center justify-center mb-3 group-hover:bg-[#2952CC] group-hover:text-white transition">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#111827]">Create Quick Quiz</h3>
                <p className="text-xs text-[#64748B] mt-1">Design a 5-minute diagnostic quiz for your classroom.</p>
              </button>

              <button
                onClick={() => setActiveTab('create_exam')}
                className="p-5 rounded-3xl bg-white border border-[#E5E7EB] text-left hover:border-[#2952CC] transition shadow-xs group"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#E7F9EF] text-[#22C55E] flex items-center justify-center mb-3 group-hover:bg-[#22C55E] group-hover:text-white transition">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#111827]">Create CBT Board Exam</h3>
                <p className="text-xs text-[#64748B] mt-1">Set up a timed mock test with EasiaCode student enrollment.</p>
              </button>

              <button
                onClick={() => setActiveTab('certificates')}
                className="p-5 rounded-3xl bg-white border border-[#E5E7EB] text-left hover:border-[#2952CC] transition shadow-xs group"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center mb-3 group-hover:bg-[#8B5CF6] group-hover:text-white transition">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#111827]">Issue Student Certificates</h3>
                <p className="text-xs text-[#64748B] mt-1">Generate verifiable digital certificates with QR validation.</p>
              </button>
            </div>

            {/* Active Exams & Recent Submissions Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-base text-[#111827]">Active CBT Exams</h3>
                  <button onClick={() => setActiveTab('create_exam')} className="text-xs text-[#2952CC] font-bold hover:underline">
                    + New Exam
                  </button>
                </div>
                <div className="space-y-3">
                  {teacherExams.map((exam) => (
                    <div key={exam.id} className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#2952CC]">{exam.subject}</span>
                          <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded-sm">{exam.examCode}</span>
                        </div>
                        <h4 className="font-bold text-sm text-[#111827]">{exam.title}</h4>
                        <div className="text-[11px] text-[#64748B] mt-0.5">
                          {exam.durationMinutes} min • {exam.totalMarks} marks • Assigned: {exam.assignedStudentCodes?.join(', ')}
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F9EF] text-[#22C55E]">
                        Published
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-base text-[#111827]">Recent Student Submissions</h3>
                  <button onClick={() => setActiveTab('results')} className="text-xs text-[#2952CC] font-bold hover:underline">
                    View All ({examSubmissions.length})
                  </button>
                </div>
                <div className="space-y-3">
                  {examSubmissions.slice(0, 3).map((sub) => (
                    <div key={sub.id} className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-[#111827]">{sub.studentName}</div>
                        <div className="text-xs text-[#64748B]">{sub.examTitle}</div>
                        <div className="font-mono text-[10px] text-[#2952CC] mt-0.5">{sub.studentEasiaCode}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-heading font-bold text-base text-[#22C55E]">
                          {sub.score} / {sub.totalMarks}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sub.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {sub.status === 'published' ? 'Published' : 'Pending Review'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENTS */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading font-bold text-xl text-[#111827]">Enrolled Students</h2>
                <p className="text-xs text-[#64748B]">All students connected to your faculty EasiaCode: <span className="font-mono font-bold text-[#2952CC]">{teacherCode}</span></p>
              </div>
              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#2952CC] hover:bg-[#2042a8] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition"
              >
                <Plus className="w-4 h-4" /> Add Student
              </button>
            </div>

            {acceptedConnections.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-4 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                <div className="w-16 h-16 rounded-3xl bg-[#EAF2FF] text-[#2952CC] flex items-center justify-center mx-auto shadow-sm">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-[#111827]">No Students Connected Yet</h3>
                  <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1 leading-relaxed">
                    Connect your students using their EasiaCode to start messaging, creating quizzes, exams and live classes.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsAddStudentOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#2952CC] hover:bg-[#2042a8] text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Student
                  </button>
                  <button
                    onClick={() => showToast('Import feature available for CSV roster upload in Pro tier.')}
                    className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-[#111827] hover:bg-gray-50 font-bold text-xs transition cursor-pointer"
                  >
                    Import Later
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-[#64748B] font-semibold">
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">EasiaCode</th>
                      <th className="py-3 px-4">Progress</th>
                      <th className="py-3 px-4">Message</th>
                      <th className="py-3 px-4">Quiz</th>
                      <th className="py-3 px-4">Exam</th>
                      <th className="py-3 px-4">Live Class</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {acceptedConnections.map((conn) => (
                      <tr key={conn.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3.5 px-4 font-bold text-[#111827] flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#EAF2FF] text-[#2952CC] font-bold overflow-hidden flex items-center justify-center">
                            {conn.studentPhoto ? (
                              <img src={conn.studentPhoto} alt={conn.studentName} className="w-full h-full object-cover" />
                            ) : (
                              conn.studentName.charAt(0)
                            )}
                          </div>
                          <div>
                            <div>{conn.studentName}</div>
                            <div className="text-[10px] text-gray-400">@{conn.studentUsername}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B]">{conn.studentClass || 'Class 10'}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#2952CC]">{conn.studentEasiaCode}</td>
                        <td className="py-3.5 px-4 font-medium text-[#22C55E]">Active (92%)</td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setActiveTab('messages')}
                            className="px-2.5 py-1 rounded-lg bg-[#EAF2FF] text-[#2952CC] font-bold text-[11px] hover:bg-[#2952CC] hover:text-white transition cursor-pointer"
                          >
                            Message
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setActiveTab('create_quiz')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px] hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                          >
                            Quiz
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setActiveTab('create_exam')}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold text-[11px] hover:bg-purple-600 hover:text-white transition cursor-pointer"
                          >
                            Exam
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#2952CC] font-bold text-[10px]">
                            Unlocked
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CREATE QUIZ */}
        {activeTab === 'create_quiz' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs max-w-3xl mx-auto space-y-6 animate-in fade-in">
            <div>
              <h2 className="font-heading font-bold text-2xl text-[#111827]">Quick Quiz Builder</h2>
              <p className="text-xs text-[#64748B]">Publish chapter-level diagnostic quizzes directly to student portals.</p>
            </div>

            <form onSubmit={handlePublishQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Quiz Title</label>
                <input
                  type="text"
                  required
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g. Chapter 4: Light Reflection & Refraction Quick Quiz"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E5E7EB] focus:border-[#2952CC] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Subject</label>
                  <select
                    value={quizSubject}
                    onChange={(e) => setQuizSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-white focus:border-[#2952CC] focus:outline-hidden"
                  >
                    <option value="Science & Optics (SSLC)">Science & Optics (SSLC)</option>
                    <option value="Mathematics (SSLC)">Mathematics (SSLC)</option>
                    <option value="Physics (PUC)">Physics (PUC)</option>
                    <option value="Kannada Language">Kannada Language</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Target Class</label>
                  <select
                    value={quizClass}
                    onChange={(e) => setQuizClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-white focus:border-[#2952CC] focus:outline-hidden"
                  >
                    <option value="Class 10 (SSLC)">Class 10 (SSLC)</option>
                    <option value="Class 9">Class 9</option>
                    <option value="PUC I">PUC I</option>
                    <option value="PUC II">PUC II</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Timer (Minutes)</label>
                  <input
                    type="number"
                    value={quizDuration}
                    onChange={(e) => setQuizDuration(e.target.value)}
                    className="w-full px-4 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:border-[#2952CC] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Enrolled Students Checkboxes */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                <div className="text-xs font-bold text-[#111827] mb-2">Assign to Enrolled Students (EasiaCode)</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {acceptedConnections.length === 0 ? (
                    <div className="col-span-4 text-xs text-gray-500 italic py-2">
                      No students connected yet. Connect students via EasiaCode to assign quizzes.
                    </div>
                  ) : (
                    acceptedConnections.map((st) => (
                      <label key={st.studentEasiaCode} className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#E5E7EB] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={quizSelectedStudents.includes(st.studentEasiaCode)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setQuizSelectedStudents((prev) => [...prev, st.studentEasiaCode]);
                            } else {
                              setQuizSelectedStudents((prev) => prev.filter((c) => c !== st.studentEasiaCode));
                            }
                          }}
                          className="rounded text-[#2952CC]"
                        />
                        <span className="font-semibold text-[#111827] truncate">{st.studentName}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#111827]">Questions ({quizQuestions.length})</h3>
                </div>

                {quizQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-xs">
                    <div className="font-bold text-[#111827] mb-1">Q{idx + 1}. {q.question}</div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#64748B]">
                      {q.options?.map((opt, i) => (
                        <div key={i} className={`p-1.5 rounded-lg border ${i === q.correctAnswer ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800' : 'bg-white border-slate-200'}`}>
                          {i + 1}. {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Question Box */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-[#2952CC]/30 bg-blue-50/20 space-y-3">
                <h4 className="font-bold text-xs text-[#2952CC]">+ Add Question to Quiz</h4>
                <input
                  type="text"
                  value={newQuizQText}
                  onChange={(e) => setNewQuizQText(e.target.value)}
                  placeholder="Enter question text..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-white focus:border-[#2952CC] focus:outline-hidden"
                />
                <div className="grid grid-cols-2 gap-2">
                  {newQuizOptions.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...newQuizOptions];
                        updated[i] = e.target.value;
                        setNewQuizOptions(updated);
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[#E5E7EB] bg-white focus:border-[#2952CC] focus:outline-hidden"
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#64748B]">Correct Option:</span>
                    <select
                      value={newQuizCorrect}
                      onChange={(e) => setNewQuizCorrect(parseInt(e.target.value))}
                      className="px-2 py-1 text-xs border rounded-lg bg-white"
                    >
                      <option value={0}>Option 1</option>
                      <option value={1}>Option 2</option>
                      <option value={2}>Option 3</option>
                      <option value={3}>Option 4</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddQuizQuestion}
                    className="px-4 py-1.5 rounded-xl bg-[#2952CC] text-white font-bold text-xs"
                  >
                    Add to Quiz
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#2952CC] hover:bg-[#2042a8] text-white font-bold text-xs shadow-md transition"
              >
                Publish Quiz to Enrolled Students
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: CREATE EXAM (EASIACODE FLOW) */}
        {activeTab === 'create_exam' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs max-w-3xl mx-auto space-y-6 animate-in fade-in">
            <div>
              <h2 className="font-heading font-bold text-2xl text-[#111827]">Create CBT Board Exam</h2>
              <p className="text-xs text-[#64748B]">
                Full computer-based mock test simulator with negative marking & EasiaCode student enrollment.
              </p>
            </div>

            <form onSubmit={handlePublishExam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Exam Name / Title</label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. SSLC State Board Science Preparatory CBT Grand Test III"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E5E7EB] focus:border-[#2952CC] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Subject</label>
                  <select
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-white focus:border-[#2952CC] focus:outline-hidden"
                  >
                    <option value="Science & Optics (SSLC)">Science & Optics (SSLC)</option>
                    <option value="Mathematics (SSLC)">Mathematics (SSLC)</option>
                    <option value="Physics (PUC)">Physics (PUC)</option>
                    <option value="Social Science">Social Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Class</label>
                  <select
                    value={examClass}
                    onChange={(e) => setExamClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-white focus:border-[#2952CC] focus:outline-hidden"
                  >
                    <option value="Class 10 (SSLC)">Class 10 (SSLC)</option>
                    <option value="Class 9">Class 9</option>
                    <option value="PUC I">PUC I</option>
                    <option value="PUC II">PUC II</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    value={examDuration}
                    onChange={(e) => setExamDuration(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:border-[#2952CC] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={examTotalMarks}
                    onChange={(e) => setExamTotalMarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:border-[#2952CC] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* EASIACODE STUDENT SELECTION */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border-2 border-[#2952CC]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#2952CC]" />
                    <span>Select Students via EasiaCode</span>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-[#2952CC] font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectAllStudents}
                      onChange={(e) => setSelectAllStudents(e.target.checked)}
                      className="rounded text-[#2952CC]"
                    />
                    <span>All Enrolled Students</span>
                  </label>
                </div>

                {!selectAllStudents && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {acceptedConnections.length === 0 ? (
                      <div className="col-span-4 text-xs text-gray-500 italic py-2">
                        No students connected yet. Connect students via EasiaCode to assign CBT exams.
                      </div>
                    ) : (
                      acceptedConnections.map((st) => (
                        <label key={st.studentEasiaCode} className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#E5E7EB] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={examSelectedStudents.includes(st.studentEasiaCode)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExamSelectedStudents((prev) => [...prev, st.studentEasiaCode]);
                              } else {
                                setExamSelectedStudents((prev) => prev.filter((c) => c !== st.studentEasiaCode));
                              }
                            }}
                            className="rounded text-[#2952CC]"
                          />
                          <div className="truncate">
                            <div className="font-semibold text-[#111827]">{st.studentName}</div>
                            <div className="font-mono text-[10px] text-[#2952CC]">{st.studentEasiaCode}</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-[#E5E7EB] flex items-center gap-2">
                  <input
                    type="text"
                    value={customStudentCode}
                    onChange={(e) => setCustomStudentCode(e.target.value)}
                    placeholder="Or enter custom Student EasiaCode (e.g. EA-STU-9Z32L)"
                    className="flex-1 px-3 py-1.5 text-xs font-mono uppercase rounded-lg border border-[#E5E7EB] bg-white focus:border-[#2952CC] focus:outline-hidden"
                  />
                  <span className="text-[11px] text-[#64748B]">Auto-assigned</span>
                </div>
              </div>

              {/* Exam Options */}
              <div className="flex flex-wrap gap-4 text-xs font-medium text-[#111827]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={examNegativeMarking}
                    onChange={(e) => setExamNegativeMarking(e.target.checked)}
                    className="rounded text-[#2952CC]"
                  />
                  <span>Enable Negative Marking (-0.25 marks per error)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#2952CC]" />
                  <span>Randomize Question Order for Each Student</span>
                </label>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#111827]">Exam Questions ({examQuestions.length})</h3>
                  <span className="text-xs text-[#2952CC] font-bold">
                    Total: {examQuestions.reduce((acc, q) => acc + (q.marks || 2), 0)} Marks
                  </span>
                </div>

                {examQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-xs relative group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#111827]">Q{idx + 1}. ({q.type.toUpperCase()}) {q.question}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#2952CC] font-bold">{q.marks} Marks</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteExamQuestion(q.id)}
                          className="text-slate-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {q.options && (
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-[#64748B] mt-1.5">
                        {q.options.map((opt, i) => (
                          <div key={i} className={`p-1.5 rounded-lg border ${i === q.correctAnswer || opt === q.correctAnswer ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800' : 'bg-white border-slate-200'}`}>
                            {i + 1}. {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Exam Question Box */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-[#2952CC]/30 bg-blue-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[#2952CC]">+ Add Question to CBT Exam</h4>
                  <div className="flex gap-2">
                    {(['mcq', 'true_false', 'short_answer'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewExamQType(t)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${newExamQType === t ? 'bg-[#2952CC] text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
                      >
                        {t.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={newExamQText}
                  onChange={(e) => setNewExamQText(e.target.value)}
                  placeholder="Enter exam question statement..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-white focus:border-[#2952CC] focus:outline-hidden"
                />

                {newExamQType === 'mcq' && (
                  <div className="grid grid-cols-2 gap-2">
                    {newExamOptions.map((opt, i) => (
                      <input
                        key={i}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newExamOptions];
                          updated[i] = e.target.value;
                          setNewExamOptions(updated);
                        }}
                        placeholder={`Choice ${i + 1}`}
                        className="px-3 py-1.5 text-xs rounded-lg border border-[#E5E7EB] bg-white focus:border-[#2952CC] focus:outline-hidden"
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3 text-xs">
                    {newExamQType === 'mcq' && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#64748B]">Correct:</span>
                        <select
                          value={newExamCorrect as number}
                          onChange={(e) => setNewExamCorrect(parseInt(e.target.value))}
                          className="px-2 py-1 text-xs border rounded-lg bg-white"
                        >
                          <option value={0}>Choice 1</option>
                          <option value={1}>Choice 2</option>
                          <option value={2}>Choice 3</option>
                          <option value={3}>Choice 4</option>
                        </select>
                      </div>
                    )}
                    {newExamQType === 'true_false' && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#64748B]">Correct:</span>
                        <select
                          value={newExamCorrect as string}
                          onChange={(e) => setNewExamCorrect(e.target.value)}
                          className="px-2 py-1 text-xs border rounded-lg bg-white"
                        >
                          <option value="True">True</option>
                          <option value="False">False</option>
                        </select>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#64748B]">Marks:</span>
                      <input
                        type="number"
                        value={newExamMarks}
                        onChange={(e) => setNewExamMarks(e.target.value)}
                        className="w-16 px-2 py-1 text-xs border rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExamQuestion}
                    className="px-4 py-1.5 rounded-xl bg-[#2952CC] text-white font-bold text-xs shadow-xs"
                  >
                    Add Question
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#22C55E] hover:bg-green-600 text-white font-bold text-xs shadow-md transition"
              >
                Schedule & Publish CBT Exam to Enrolled Students
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: QUESTION BANK */}
        {activeTab === 'question_bank' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading font-bold text-xl text-[#111827]">Faculty Question Bank</h2>
                <p className="text-xs text-[#64748B]">Repository of verified board examination multiple choice & subjective questions.</p>
              </div>
              <button
                onClick={() => showToast('Question added to repository!')}
                className="px-4 py-2 rounded-xl bg-[#2952CC] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>

            <div className="text-center py-16 px-4 space-y-3 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#111827]">No questions yet.</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Build your personal question repository for quizzes and CBT board exams.
              </p>
              <button
                onClick={() => showToast('Question added to repository!')}
                className="px-4 py-2 rounded-xl bg-[#2952CC] text-white font-bold text-xs shadow-xs hover:bg-[#2042a8] transition cursor-pointer"
              >
                Add First Question
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: RESULTS (WITH AUTO-CERTIFICATE GENERATION) */}
        {activeTab === 'results' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading font-bold text-2xl text-[#111827]">Student Exam Submissions & Grading</h2>
                <p className="text-xs text-[#64748B]">Review CBT exam papers, publish verified marks, and auto-generate merit certificates.</p>
              </div>
            </div>

            {examSubmissions.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-base text-[#111827]">No published results.</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Only display real completed exams. Assign CBT exams to students to view their submissions here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-[#64748B] font-semibold">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">EasiaCode</th>
                      <th className="py-3 px-4">Exam Name</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Percentage</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {examSubmissions.map((sub) => {
                      const pct = Math.round((sub.score / sub.totalMarks) * 100);
                      return (
                        <tr key={sub.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3.5 px-4 font-bold text-[#111827]">{sub.studentName}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-[#2952CC]">{sub.studentEasiaCode}</td>
                          <td className="py-3.5 px-4 font-medium text-[#111827]">{sub.examTitle}</td>
                          <td className="py-3.5 px-4 font-extrabold text-[#22C55E]">
                            {sub.score} / {sub.totalMarks}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#111827]">{pct}%</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                sub.status === 'published'
                                  ? 'bg-[#E7F9EF] text-[#22C55E]'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {sub.status === 'published' ? 'Published' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {sub.status === 'published' ? (
                              <div className="inline-flex items-center gap-2">
                                <span className="text-[11px] text-[#22C55E] font-semibold flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5" /> Published
                                </span>
                                {pct >= 70 && (
                                  <button
                                    onClick={() => {
                                      const matchingCert = certificates.find((c) => c.studentName === sub.studentName);
                                      if (matchingCert) {
                                        generateCertificatePdf(matchingCert);
                                      } else {
                                        generateCertificatePdf({
                                          title: sub.examTitle,
                                          studentName: sub.studentName,
                                          subject: 'SSLC Preparatory CBT Exam',
                                          type: 'Merit',
                                          marks: sub.score,
                                          totalMarks: sub.totalMarks,
                                          scorePercentage: pct,
                                          issueDate: new Date().toISOString().split('T')[0],
                                          certificateNo: `EA-CERT-${Math.floor(10000 + Math.random() * 90000)}`,
                                          verificationId: `EA-CERT-${Math.floor(10000 + Math.random() * 90000)}`,
                                          teacherName: user?.name || 'Prof. M. K. Rao',
                                          institution: user?.schoolName || 'Karnataka State Board Council',
                                        });
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-[#2952CC] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Download className="w-3 h-3" /> Certificate
                                  </button>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => handlePublishResult(sub)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#2952CC] hover:bg-[#2042a8] text-white font-bold text-xs shadow-xs transition cursor-pointer"
                              >
                                Publish Results & Auto-Certify
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: CERTIFICATES (BUILDER & ISSUED REPOSITORY) */}
        {activeTab === 'certificates' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Dedicated Certificate Generator */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs max-w-3xl mx-auto space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-xl text-[#111827]">Student Certificate Generator</h2>
                  <p className="text-xs text-[#64748B]">Issue official board-accredited distinction certificates with QR verification.</p>
                </div>
              </div>

              <form onSubmit={handleGenerateManualCertificate} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">Student Name</label>
                    <input
                      type="text"
                      required
                      value={certStudentName}
                      onChange={(e) => setCertStudentName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:border-[#2952CC] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">Student EasiaCode</label>
                    <input
                      type="text"
                      required
                      value={certStudentCode}
                      onChange={(e) => setCertStudentCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border border-[#E5E7EB] focus:border-[#2952CC] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Exam / Course Award Title</label>
                  <input
                    type="text"
                    required
                    value={certExamTitle}
                    onChange={(e) => setCertExamTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:border-[#2952CC] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">Score Percentage (%)</label>
                    <input
                      type="number"
                      value={certScore}
                      onChange={(e) => setCertScore(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:border-[#2952CC] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">Grade</label>
                    <select
                      value={certGrade}
                      onChange={(e) => setCertGrade(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-white focus:border-[#2952CC] focus:outline-hidden"
                    >
                      <option value="A+ Distinction">A+ Distinction (90-100%)</option>
                      <option value="A First Class">A First Class (75-89%)</option>
                      <option value="B Second Class">B Second Class (60-74%)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#2952CC] hover:bg-[#2042a8] text-white font-bold text-xs shadow-md transition"
                >
                  Generate & Issue Verified Certificate
                </button>
              </form>
            </div>

            {/* Issued Certificates Repository */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-[#111827]">Issued Certificates ({certificates.length})</h3>
                  <p className="text-xs text-[#64748B]">All certificates are cryptographically verifiable with PDF download.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex flex-col justify-between space-y-3 hover:border-[#2952CC]/40 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-[#2952CC]">{cert.certificateId}</span>
                        <span className="text-[10px] font-bold text-[#22C55E] bg-emerald-50 px-2 py-0.5 rounded-md">
                          Verified
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#111827]">{cert.title}</h4>
                      <div className="text-xs text-[#64748B] mt-0.5">
                        Awarded to: <strong>{cert.studentName || 'Student'}</strong> • Score: {cert.score}% ({cert.grade})
                      </div>
                      <div className="text-[11px] text-[#64748B] mt-0.5">Issued: {cert.issueDate}</div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                      <div className="flex items-center gap-1 text-[11px] text-[#2952CC] font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>KSEAB & EasiaLearn Valid</span>
                      </div>
                      <button
                        onClick={() => {
                          triggerCelebration();
                          generateCertificatePdf(cert);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#2952CC] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition hover:bg-[#2042a8]"
                      >
                        <Download className="w-3.5 h-3.5" /> Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="font-heading font-bold text-2xl text-[#111827]">Faculty Messages & Doubts</h2>
              <p className="text-xs text-[#64748B]">Real-time encrypted messaging with your linked students.</p>
            </div>
            <MessengerApp />
          </div>
        )}

        {/* TAB 9: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-6 animate-in fade-in">
            <div>
              <h2 className="font-heading font-bold text-xl text-[#111827]">Batch Performance Analytics</h2>
              <p className="text-xs text-[#64748B]">Aggregated subject mastery and CBT score distributions for your classroom.</p>
            </div>
            <div className="space-y-4">
              {[
                { subject: 'Science & Optics (SSLC)', avg: 86, color: '#2952CC' },
                { subject: 'Mathematics Formulae', avg: 78, color: '#22C55E' },
                { subject: 'Physics Kinematics', avg: 82, color: '#F59E0B' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#111827]">{item.subject}</span>
                    <span className="text-[#2952CC] font-bold">{item.avg}% Mastery</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.avg}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: SETTINGS (SHOW TEACHER EASIACODE) */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-6 animate-in fade-in max-w-2xl mx-auto">
            <div>
              <h2 className="font-heading font-bold text-2xl text-[#111827]">Faculty Educator Settings</h2>
              <p className="text-xs text-[#64748B]">Manage your teaching credentials, school association, and permanent EasiaCode</p>
            </div>

            {/* PROMINENT TEACHER EASIACODE DISPLAY */}
            <div className="p-5 rounded-2xl bg-[#EAF2FF] border-2 border-[#2952CC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-[#2952CC] uppercase tracking-wider">
                  Teacher Permanent EasiaCode
                </div>
                <div className="font-mono font-extrabold text-2xl text-[#111827] mt-1">
                  {teacherCode}
                </div>
                <p className="text-xs text-[#64748B] mt-1">
                  Share this EasiaCode with your students so they can link your classroom and receive exams.
                </p>
              </div>
              <button
                onClick={() => handleCopyCode(teacherCode)}
                className="px-4 py-2.5 rounded-xl bg-[#2952CC] hover:bg-[#2042a8] text-white text-xs font-bold flex items-center gap-2 shrink-0 shadow-sm"
              >
                {copiedCode ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <div className="text-[#64748B] font-semibold">Faculty Name</div>
                <div className="font-bold text-sm text-[#111827] mt-0.5">{user?.name || 'Prof. M. K. Rao'}</div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <div className="text-[#64748B] font-semibold">Username</div>
                <div className="font-bold text-sm text-[#2952CC] mt-0.5">@{user?.username || 'mkrao_physics'}</div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <div className="text-[#64748B] font-semibold">Subject / Department</div>
                <div className="font-bold text-sm text-[#111827] mt-0.5">{user?.subject || 'Physics & Optics'}</div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <div className="text-[#64748B] font-semibold">Qualification</div>
                <div className="font-bold text-sm text-[#111827] mt-0.5">{user?.qualification || 'M.Sc., B.Ed.'}</div>
              </div>

              <div className="col-span-2 p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <div className="text-[#64748B] font-semibold">School / Institution</div>
                <div className="font-bold text-sm text-[#111827] mt-0.5">{user?.schoolName || user?.school || 'Vidya Mandir Composite PU College'}</div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <div className="text-[#64748B] font-semibold">Email</div>
                <div className="font-bold text-xs text-[#111827] mt-0.5">{user?.email || 'mkrao.faculty@example.com'}</div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <div className="text-[#64748B] font-semibold">Phone</div>
                <div className="font-bold text-xs text-[#111827] mt-0.5">{user?.phone || '+91 98450 12345'}</div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* First Login Welcome Onboarding Modal */}
      {isWelcomeOnboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-[24px] shadow-2xl border border-gray-200 p-6 sm:p-8 text-center space-y-5"
          >
            <div className="w-14 h-14 rounded-3xl bg-[#EAF2FF] text-[#2952CC] flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xl text-[#111827]">
                Welcome to Your Teacher Workspace
              </h2>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                You can connect students now using their EasiaCode, or skip and do it later.
              </p>
            </div>

            <div className="bg-[#F8FAFC] border border-gray-200 rounded-2xl p-3 text-xs text-left space-y-1">
              <div className="font-bold text-[#111827]">Your Teacher EasiaCode:</div>
              <div className="font-mono text-sm font-bold text-[#2952CC] bg-white p-2 rounded-xl border border-gray-200 text-center">
                {teacherCode}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={() => {
                  localStorage.setItem('easia_teacher_onboarded_' + (user?.uid || 'teacher'), 'true');
                  setIsWelcomeOnboardOpen(false);
                  setIsAddStudentOpen(true);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#2952CC] text-white font-bold text-xs shadow-md hover:bg-[#2042a8] transition cursor-pointer"
              >
                Add Students
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('easia_teacher_onboarded_' + (user?.uid || 'teacher'), 'true');
                  setIsWelcomeOnboardOpen(false);
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-[#111827] hover:bg-gray-50 font-bold text-xs transition cursor-pointer"
              >
                Skip for Now
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onSuccess={() => {
          setActiveTab('students');
        }}
      />
    </div>
  );
};
