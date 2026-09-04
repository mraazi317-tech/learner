import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Subject,
  Lesson,
  MockTest,
  Announcement,
  TestResult,
  StudentAnalytics,
  Flashcard,
  Certificate,
  Doubt,
  Question,
  TeacherExam,
  TeacherQuiz,
  ExamSubmission,
  SubscriptionPlan,
  LiveClass,
  TeacherConnection,
  CertificateType,
} from '../types';
import { db } from '../lib/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  setDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  getDocs,
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

export interface NotificationItem {
  id: string;
  userId?: string;
  recipientRole?: string;
  title: string;
  description?: string;
  message: string;
  timestamp: string;
  time?: string;
  read: boolean;
  type: string;
  linkTab?: string;
  icon?: string;
  data?: any;
}

interface AppContextType {
  currentView: string;
  setCurrentView: (view: string) => void;
  studentTab: string;
  setStudentTab: (tab: string) => void;
  selectedSubject: Subject | null;
  setSelectedSubject: (subject: Subject | null) => void;
  activeLesson: Lesson | null;
  setActiveLesson: (lesson: Lesson | null) => void;
  activeMockTest: MockTest | null;
  setActiveMockTest: (test: MockTest | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  sendNotification: (notif: Partial<NotificationItem>) => Promise<void>;
  isAiTutorOpen: boolean;
  setIsAiTutorOpen: (open: boolean) => void;
  isProModalOpen: boolean;
  setIsProModalOpen: (open: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;

  // Subscription / Pro Permission
  userPlan: SubscriptionPlan;
  setUserPlan: (plan: SubscriptionPlan) => void;
  upgradeSubscription: (plan: SubscriptionPlan) => Promise<void>;
  isPro: boolean;
  pricingPlans: any[];
  updatePricingPlan: (id: string, updates: any) => Promise<void>;

  // Teacher Exams & Quizzes
  teacherExams: TeacherExam[];
  createTeacherExam: (exam: Partial<TeacherExam>) => Promise<void>;
  activeExam: TeacherExam | null;
  setActiveExam: (exam: TeacherExam | null) => void;
  startTeacherExam: (exam: TeacherExam) => void;
  teacherQuizzes: TeacherQuiz[];
  createTeacherQuiz: (quiz: Partial<TeacherQuiz>) => Promise<void>;
  examSubmissions: ExamSubmission[];
  submitExam: (submission: Partial<ExamSubmission>) => Promise<void>;
  publishExamResults: (examId: string) => Promise<void>;

  // Domain state
  subjects: Subject[];
  createSubject: (subject: Partial<Subject>) => void;
  addSubject: (subject: Partial<Subject>) => void;
  lessons: Lesson[];
  createLesson: (lesson: Partial<Lesson>) => void;
  completeLesson: (lessonId: string) => void;
  openLesson: (lessonOrId: Lesson | string, subjectId?: string) => void;
  badges: any[];
  mockTests: MockTest[];
  createMockTest: (test: Partial<MockTest>) => void;
  startMockTest: (testId?: string) => void;
  results: TestResult[];
  addTestResult: (result: TestResult) => void;
  announcements: Announcement[];
  createAnnouncement: (announcement: Partial<Announcement>) => void;
  createQuestion: (question: Partial<Question>) => void;
  analytics: StudentAnalytics;
  flashcards: Flashcard[];
  addFlashcard: (flashcard: Partial<Flashcard>) => void;
  updateFlashcardLevel: (id: string, level: any) => void;
  certificates: Certificate[];
  generateCertificate: (certData: Partial<Certificate>) => Promise<Certificate>;
  myTeachers: any[];
  connectTeacher: (codeOrId: string) => Promise<boolean>;
  doubts: Doubt[];
  askDoubt: (doubt: Partial<Doubt>) => void;
  answerDoubt: (id: string, reply: string) => void;
  easiacoins: number;
  addEasiacoins: (amount: number) => void;
  triggerCelebration: () => void;

  // Live Classes
  liveClasses: LiveClass[];
  createLiveClass: (classData: Partial<LiveClass>) => Promise<{ success: boolean; error?: string; liveClass?: LiveClass }>;
  startLiveClass: (classId: string) => Promise<void>;
  endLiveClass: (classId: string) => Promise<void>;
  activeLiveClass: LiveClass | null;
  setActiveLiveClass: (liveClass: LiveClass | null) => void;
  isLiveClassroomOpen: boolean;
  setIsLiveClassroomOpen: (open: boolean) => void;
  joinLiveClass: (liveClass: LiveClass) => void;
  leaveLiveClass: () => void;

  // Teacher Connections & Students Page
  teacherConnections: TeacherConnection[];
  lookupStudentByEasiaCode: (code: string) => Promise<any | null>;
  sendTeacherConnectionRequest: (studentEasiaCode: string) => Promise<{ success: boolean; error?: string; student?: any }>;
  respondToConnectionRequest: (connectionId: string, action: 'accepted' | 'declined') => Promise<void>;
  removeTeacherConnection: (connectionId: string) => Promise<void>;

  // Certificate Generator (Pro+)
  generateCertificateForStudent: (params: {
    studentName: string;
    studentEasiaCode: string;
    teacherName?: string;
    institution?: string;
    type: CertificateType;
    title: string;
    subject: string;
    marks?: number;
    totalMarks?: number;
  }) => Promise<Certificate | null>;
}

const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub_math',
    title: 'Mathematics (SSLC & 10th)',
    description: 'Quadratic Equations, Trigonometry, Coordinate Geometry & Statistics with solved question papers.',
    color: '#2952CC',
    bgLight: '#EAF2FF',
    class: '10th',
    medium: 'English',
    totalChapters: 15,
    completedChapters: 6,
    difficulty: 'Medium',
    progressPercent: 68,
    progress: 68,
    assignedTeacher: 'Dr. Ramesh Kumar',
  },
  {
    id: 'sub_science',
    title: 'Physics & Chemistry (Science)',
    description: 'Optics, Chemical Reactions, Electricity, Periodic Table with step-by-step practical formulas.',
    color: '#0D9488',
    bgLight: '#F0FDFA',
    class: '10th',
    medium: 'English',
    totalChapters: 16,
    completedChapters: 9,
    difficulty: 'Hard',
    progressPercent: 74,
    progress: 74,
    assignedTeacher: 'Prof. Ananya Sen',
  },
  {
    id: 'sub_kannada',
    title: 'Kannada (ಪ್ರಥಮ ಭಾಷೆ)',
    description: 'ಸಾಹಿತ್ಯ, ವ್ಯಾಕರಣ, ಪ್ರಬಂಧ ಲೇಖನ ಮತ್ತು ಹಿಂದಿನ ವರ್ಷದ ಪ್ರಶ್ನೋತ್ತರಗಳು.',
    color: '#EA580C',
    bgLight: '#FFF7ED',
    class: '10th',
    medium: 'Kannada',
    totalChapters: 12,
    completedChapters: 8,
    difficulty: 'Easy',
    progressPercent: 82,
    progress: 82,
    assignedTeacher: 'Sri Chandrashekar',
  },
  {
    id: 'sub_biology',
    title: 'Biology & Life Processes',
    description: 'Photosynthesis, Heredity, Human Circulatory System, Nervous System and diagrams.',
    color: '#16A34A',
    bgLight: '#F0FDF4',
    class: '10th',
    medium: 'English',
    totalChapters: 14,
    completedChapters: 5,
    difficulty: 'Medium',
    progressPercent: 55,
    progress: 55,
    assignedTeacher: 'Dr. Fatima Noor',
  },
  {
    id: 'sub_social',
    title: 'Social Sciences & History',
    description: 'Indian Constitution, Freedom Movement, Geography, Economic Development.',
    color: '#9333EA',
    bgLight: '#FAF5FF',
    class: '10th',
    medium: 'English',
    totalChapters: 18,
    completedChapters: 11,
    difficulty: 'Easy',
    progressPercent: 70,
    progress: 70,
    assignedTeacher: 'Prof. Arvind Hegde',
  },
  {
    id: 'sub_english',
    title: 'English Grammar & Literature',
    description: 'Prose, Poetry, Reading Comprehension, Formal Letters, Essay Writing.',
    color: '#2563EB',
    bgLight: '#EFF6FF',
    class: '10th',
    medium: 'English',
    totalChapters: 10,
    completedChapters: 7,
    difficulty: 'Medium',
    progressPercent: 80,
    progress: 80,
    assignedTeacher: 'Ms. Sarah Joseph',
  },
];

const INITIAL_ANALYTICS: StudentAnalytics = {
  predictedScore: 0,
  predictedBoardScore: 0,
  studyStreak: 0,
  studyStreakDays: 0,
  hoursStudied: 0,
  totalHoursStudied: 0,
  stateRank: 0,
  weeklyProgress: [],
  subjectAccuracies: [],
  weakChapters: [],
  recentActivities: [],
  aiRecommendation: {
    focusTopic: 'Connect with a teacher or start practicing',
    estimatedImprovement: 'Complete quizzes to see AI recommendations',
    actionLabel: 'Explore Subjects',
  },
};

const INITIAL_MOCK_TESTS: MockTest[] = [];

const INITIAL_FLASHCARDS: Flashcard[] = [];

const DEMO_STUDENTS: any[] = [];

const INITIAL_LIVE_CLASSES: LiveClass[] = [];

const INITIAL_CONNECTIONS: TeacherConnection[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [studentTab, setStudentTab] = useState<string>('overview');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(INITIAL_SUBJECTS[0]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeMockTest, setActiveMockTest] = useState<MockTest | null>(INITIAL_MOCK_TESTS[0]);
  const [activeExam, setActiveExam] = useState<TeacherExam | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isAiTutorOpen, setIsAiTutorOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [language, setLanguage] = useState('English');
  const [easiacoins, setEasiacoins] = useState(0);

  // Live Classes State
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>(INITIAL_LIVE_CLASSES);
  const [activeLiveClass, setActiveLiveClass] = useState<LiveClass | null>(null);
  const [isLiveClassroomOpen, setIsLiveClassroomOpen] = useState(false);

  // Teacher Connections State
  const [teacherConnections, setTeacherConnections] = useState<TeacherConnection[]>(INITIAL_CONNECTIONS);

  // Subscription Plan state (Free, Pro, Ultra, Annual)
  const [userPlan, setUserPlan] = useState<SubscriptionPlan>(
    (user?.plan as SubscriptionPlan) || (user?.isPro ? 'pro' : 'free')
  );
  const isPro = userPlan !== 'free' || Boolean(user?.isPro);

  const [pricingPlans, setPricingPlans] = useState<any[]>([
    {
      id: 'plan_free',
      name: 'Free',
      price: 0,
      duration: 'Lifetime',
      badge: 'Starter',
      buttonText: 'Current Plan',
      features: [
        'AI Tutor & Daily Practice',
        'Direct Messaging with Connected Teachers',
        'Join Teacher Classrooms',
        'Participate in Assigned Quizzes',
        'Practice Results & Analysis',
        'No Live Class Creation (View only)',
      ],
    },
    {
      id: 'plan_pro',
      name: 'Pro',
      price: 999,
      duration: 'Month',
      popular: true,
      badge: '🔥 Teacher Pro',
      buttonText: 'Upgrade to Pro (₹999)',
      features: [
        '2 Live Classes / Day',
        'Up to 100 Students per class',
        'Screen Sharing & Whiteboard',
        'Live In-Class Chat & Attendance Log',
        'Certificate Generator (Live Class / Quiz / Exam)',
        'Teacher Exams & CBT Simulation Builder',
        'Unlimited AI Documents & PDF Exports',
      ],
    },
    {
      id: 'plan_ultra',
      name: 'Ultra',
      price: 3999,
      duration: 'Month',
      dark: true,
      badge: '⭐ Best for Institutions',
      buttonText: 'Upgrade to Ultra (₹3999)',
      features: [
        '10 Live Classes / Day',
        'Up to 500 Students per class',
        'Cloud Session Recording',
        'HD 1080p Video & Screen Share',
        'Breakout Rooms & Premium Whiteboard',
        'Advanced Analytics & Exportable Reports',
        'Unlimited Document Uploads & Workspaces',
      ],
    },
    {
      id: 'plan_annual',
      name: 'Annual',
      price: 9999,
      duration: 'Year',
      gold: true,
      badge: '🏆 All Access (Save 40%)',
      buttonText: 'Get Annual (₹9999)',
      features: [
        'Unlimited Live Classes',
        'All Ultra Features Included',
        'Unlimited Students & Participants',
        'Unlimited Cloud Recording Storage',
        'Unlimited Verified PDF Certificates',
        'Institution Collaboration Suite',
        'Dedicated 24/7 Priority Support',
      ],
    },
  ]);

  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Teacher Exams
  const [teacherExams, setTeacherExams] = useState<TeacherExam[]>([]);

  // Teacher Quizzes
  const [teacherQuizzes, setTeacherQuizzes] = useState<TeacherQuiz[]>([]);

  // Exam Submissions
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>([]);

  // Connected Teachers
  const [myTeachers, setMyTeachers] = useState<any[]>([]);

  const [badges] = useState<any[]>([
    {
      id: 'badge_1',
      title: '18-Day Streak Champion',
      description: 'Maintained 18 consecutive days of active study',
      icon: 'Flame',
      category: 'streak',
      unlocked: true,
      currentProgress: 18,
      targetProgress: 18,
    },
    {
      id: 'badge_2',
      title: 'Quadratic Master',
      description: 'Scored 90%+ in Mathematics Quadratic Mock Test',
      icon: 'Award',
      category: 'quiz',
      unlocked: true,
      currentProgress: 1,
      targetProgress: 1,
    },
  ]);
  const [analytics] = useState<StudentAnalytics>(INITIAL_ANALYTICS);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // Certificates list
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Sync user plan on user load
  useEffect(() => {
    if (user?.plan) {
      setUserPlan(user.plan as SubscriptionPlan);
    } else if (user?.isPro) {
      setUserPlan('pro');
    }
  }, [user?.plan, user?.isPro]);

  // Realtime Firestore Notifications Listener
  useEffect(() => {
    if (!user?.uid) return;

    try {
      const q = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: NotificationItem[] = snapshot.docs
              .map((d) => {
                const data = d.data();
                return {
                  id: d.id,
                  userId: data.userId,
                  recipientRole: data.recipientRole,
                  title: data.title || 'Notification',
                  description: data.description || data.body || '',
                  message: data.message || data.body || '',
                  timestamp: data.time || 'Just now',
                  time: data.time || 'Just now',
                  read: Boolean(data.read),
                  type: data.type || 'system',
                  linkTab: data.linkTab,
                };
              })
              .filter(
                (item) =>
                  !item.userId ||
                  item.userId === user.uid ||
                  item.userId === user.easiacode ||
                  item.recipientRole === user.role ||
                  item.recipientRole === 'all'
              );

            if (fetched.length > 0) {
              setNotifications((prev) => {
                // Merge without duplicates
                const map = new Map<string, NotificationItem>();
                fetched.forEach((n) => map.set(n.id, n));
                prev.forEach((n) => {
                  if (!map.has(n.id)) map.set(n.id, n);
                });
                return Array.from(map.values());
              });
            }
          }
        },
        (error) => {
          // Gracefully fallback to local notifications on permission/offline
          console.warn('Firestore notifications subscription info:', error.message);
        }
      );

      return () => unsubscribe();
    } catch {
      // Offline fallback
    }
  }, [user?.uid, user?.easiacode, user?.role]);

  // Realtime Firestore Certificates Listener
  useEffect(() => {
    if (!user?.uid) return;
    try {
      const q = collection(db, 'certificates');
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: Certificate[] = snapshot.docs
              .map((d) => ({ id: d.id, ...(d.data() as any) }))
              .filter(
                (c) =>
                  !c.studentId ||
                  c.studentId === user.uid ||
                  c.userId === user.uid ||
                  c.studentEasiaCode === user.easiacode
              );
            if (fetched.length > 0) {
              setCertificates((prev) => {
                const map = new Map<string, Certificate>();
                fetched.forEach((c) => map.set(c.id, c));
                prev.forEach((c) => {
                  if (!map.has(c.id)) map.set(c.id, c);
                });
                return Array.from(map.values());
              });
            }
          }
        },
        () => {}
      );
      return () => unsubscribe();
    } catch {}
  }, [user?.uid, user?.easiacode]);

  // Realtime Firestore Teacher Exams Listener
  useEffect(() => {
    try {
      const q = collection(db, 'teacher_exams');
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: TeacherExam[] = snapshot.docs.map(
              (d) => ({ id: d.id, ...(d.data() as any) })
            );
            if (fetched.length > 0) {
              setTeacherExams((prev) => {
                const map = new Map<string, TeacherExam>();
                fetched.forEach((e) => map.set(e.id, e));
                prev.forEach((e) => {
                  if (!map.has(e.id)) map.set(e.id, e);
                });
                return Array.from(map.values());
              });
            }
          }
        },
        () => {}
      );
      return () => unsubscribe();
    } catch {}
  }, []);

  const sendNotification = async (notif: Partial<NotificationItem>) => {
    const newNotif: NotificationItem = {
      id: notif.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: notif.userId,
      recipientRole: notif.recipientRole,
      title: notif.title || 'Notification',
      description: notif.description || notif.message || '',
      message: notif.message || notif.title || '',
      timestamp: 'Just now',
      time: 'Just now',
      read: false,
      type: notif.type || 'system',
      linkTab: notif.linkTab,
      data: notif.data,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    try {
      await addDoc(collection(db, 'notifications'), {
        ...newNotif,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Notification stored in local state:', e);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      updateDoc(doc(db, 'notifications', id), { read: true });
    } catch {}
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Subscription upgrade
  const upgradeSubscription = async (plan: SubscriptionPlan) => {
    setUserPlan(plan);
    triggerCelebration();

    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          plan,
          isPro: plan !== 'free',
        });
        await addDoc(collection(db, 'subscriptions'), {
          userId: user.uid,
          plan,
          status: 'active',
          activatedAt: new Date().toISOString(),
          validUntil: plan === 'annual' ? '2027-03-01' : '2026-04-01',
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Subscription saved locally:', err);
      }
    }

    sendNotification({
      userId: user?.uid,
      type: 'pro_activated',
      title: 'Pro Membership Activated',
      description: `Welcome to EasiaLearn ${plan.toUpperCase()}! Full feature access enabled.`,
      message: `Your ${plan.toUpperCase()} subscription is now active with unlimited AI and exams!`,
      linkTab: 'profile',
    });
  };

  // Teacher Create Quiz
  const createTeacherQuiz = async (quiz: Partial<TeacherQuiz>) => {
    const quizCode = quiz.quizCode || `QZ-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newQuiz: TeacherQuiz = {
      id: quiz.id || `quiz_${Date.now()}`,
      title: quiz.title || 'New Classroom Quiz',
      subject: quiz.subject || 'General Science',
      class: quiz.class || 'Class 10 (SSLC)',
      description: quiz.description || '',
      quizCode,
      questions: quiz.questions || [],
      timerMinutes: quiz.timerMinutes || 30,
      startDate: quiz.startDate || new Date().toISOString().split('T')[0],
      endDate: quiz.endDate || '',
      totalMarks: quiz.totalMarks || 20,
      assignedStudentCodes: quiz.assignedStudentCodes || [],
      teacherId: user?.uid || 'teacher_1',
      teacherName: user?.name || 'Faculty Member',
      createdAt: new Date().toISOString().split('T')[0],
      isPublished: true,
    };

    setTeacherQuizzes((prev) => [newQuiz, ...prev]);

    try {
      await addDoc(collection(db, 'quizzes'), {
        ...newQuiz,
        createdAt: serverTimestamp(),
      });
    } catch {}

    // Notify assigned students
    (newQuiz.assignedStudentCodes || []).forEach((code) => {
      sendNotification({
        userId: code,
        type: 'quiz_available',
        title: 'New Quiz Available',
        description: `Teacher ${newQuiz.teacherName} assigned Quiz "${newQuiz.title}" (${quizCode})`,
        message: `Take Quiz "${newQuiz.title}" before ${newQuiz.endDate || 'due date'}.`,
        linkTab: 'mock_tests',
      });
    });

    triggerCelebration();
  };

  // Teacher Create Exam
  const createTeacherExam = async (exam: Partial<TeacherExam>) => {
    const examCode = exam.examCode || `EX-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newExam: TeacherExam = {
      id: exam.id || `exam_${Date.now()}`,
      examCode,
      title: exam.title || 'Computer-Based Exam (CBT)',
      subject: exam.subject || 'Science & Mathematics',
      class: exam.class || 'Class 10 (SSLC)',
      description: exam.description || '',
      durationMinutes: exam.durationMinutes || 90,
      totalMarks: exam.totalMarks || 80,
      questions: exam.questions || [],
      assignedStudentCodes: exam.assignedStudentCodes || [],
      teacherId: user?.uid || 'teacher_1',
      teacherName: user?.name || 'Faculty Member',
      institution: user?.institution || 'EasiaLearn Board Council',
      createdAt: new Date().toISOString().split('T')[0],
      status: exam.status || 'published',
      resultsPublished: false,
    };

    setTeacherExams((prev) => [newExam, ...prev]);

    try {
      await addDoc(collection(db, 'teacher_exams'), {
        ...newExam,
        createdAt: serverTimestamp(),
      });
    } catch {}

    // Notify assigned students
    (newExam.assignedStudentCodes || []).forEach((code) => {
      sendNotification({
        userId: code,
        type: 'exam_available',
        title: 'New Exam Available',
        description: `CBT Exam "${newExam.title}" (${examCode}) is scheduled by ${newExam.teacherName}`,
        message: `You are enrolled in exam ${examCode}. Timer: ${newExam.durationMinutes} mins.`,
        linkTab: 'mock_tests',
        data: { examId: newExam.id, examCode },
      });
    });

    triggerCelebration();
  };

  const startTeacherExam = (exam: TeacherExam) => {
    setActiveExam(exam);
    // Bridge to MockTest structure so CbtMockTestView can run it
    const convertedMock: MockTest = {
      id: exam.id,
      title: exam.title,
      subject: exam.subject,
      class: exam.class,
      totalQuestions: exam.questions.length,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      negativeMarking: false,
      negativeMarkValue: 0,
      difficulty: 'Hard',
      questions: exam.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options || ['True', 'False'],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        marks: q.marks,
        subject: exam.subject,
        chapter: 'State Preparatory Assessment',
        difficulty: 'Hard',
        type: (q.type as any) || 'mcq',
        explanation: q.explanation || '',
      })),
      createdAt: exam.createdAt,
    };
    setActiveMockTest(convertedMock);
    setCurrentView('cbt_test');
  };

  // Submit Exam
  const submitExam = async (submission: Partial<ExamSubmission>) => {
    const newSub: ExamSubmission = {
      id: submission.id || `sub_${Date.now()}`,
      examId: submission.examId || '',
      examCode: submission.examCode || 'EX-2026',
      examTitle: submission.examTitle || 'CBT Exam',
      studentId: user?.uid || 'student_1',
      studentName: user?.name || 'Amina Sheikh',
      studentEasiaCode: user?.easiacode || 'EA-STU-8K29Q',
      submittedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: submission.score || 0,
      totalMarks: submission.totalMarks || 100,
      answers: submission.answers || {},
      status: 'submitted',
    };

    setExamSubmissions((prev) => [newSub, ...prev]);

    try {
      await addDoc(collection(db, 'exam_submissions'), {
        ...newSub,
        createdAt: serverTimestamp(),
      });
    } catch {}

    // Notify Teacher
    sendNotification({
      recipientRole: 'teacher',
      type: 'exam_completed',
      title: 'Exam Completed',
      description: `${newSub.studentName} (${newSub.studentEasiaCode}) completed ${newSub.examTitle}`,
      message: `${newSub.studentName} submitted ${newSub.examCode}. Score: ${newSub.score}/${newSub.totalMarks}.`,
      linkTab: 'results',
    });

    addEasiacoins(50);
    triggerCelebration();
  };

  // Publish Results & Auto-Generate Certificates
  const publishExamResults = async (examId: string) => {
    setTeacherExams((prev) =>
      prev.map((e) => (e.id === examId ? { ...e, resultsPublished: true, status: 'published' } : e))
    );

    const relatedExam = teacherExams.find((e) => e.id === examId);
    const relatedSubs = examSubmissions.filter((s) => s.examId === examId);

    // Update submissions to published
    setExamSubmissions((prev) =>
      prev.map((s) => (s.examId === examId ? { ...s, status: 'published' } : s))
    );

    // Auto-generate certificate for each participant
    const targetCodes = relatedExam?.assignedStudentCodes || ['EA-STU-8K29Q'];
    for (const code of targetCodes) {
      const sub = relatedSubs.find((s) => s.studentEasiaCode === code);
      const score = sub?.score || 76;
      const total = sub?.totalMarks || 80;
      const pct = Math.round((score / total) * 100);
      const grade = pct >= 90 ? 'A+ (Distinction)' : pct >= 75 ? 'A (First Class)' : 'Pass';

      const certId = `EA-CERT-${Math.floor(10000 + Math.random() * 90000)}`;
      const newCert: Certificate = {
        id: `cert_${Date.now()}_${code}`,
        certificateId: certId,
        userId: sub?.studentId || user?.uid || 'user_1',
        studentId: sub?.studentId || user?.uid || 'user_1',
        userName: sub?.studentName || 'Amina Sheikh',
        studentName: sub?.studentName || 'Amina Sheikh',
        studentEasiaCode: code,
        teacherId: user?.uid || 'teacher_1',
        teacherName: user?.name || 'Dr. Ramesh Kumar',
        institution: user?.institution || 'Karnataka Secondary Board Council',
        type: pct >= 90 ? 'Merit' : 'Completion',
        title: relatedExam?.title || 'State Preparatory CBT Examination',
        subject: relatedExam?.subject || 'Science & Optics (SSLC)',
        issueDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        certificateNo: certId,
        scorePercentage: pct,
        score,
        marks: score,
        totalMarks: total,
        grade,
        qrCodeSeed: `https://easialearn.edu.in/verify/${certId}`,
        verificationId: certId,
      };

      setCertificates((prev) => [newCert, ...prev]);

      try {
        await addDoc(collection(db, 'certificates'), {
          ...newCert,
          createdAt: serverTimestamp(),
        });
      } catch {}

      // Notify Student
      sendNotification({
        userId: code,
        type: 'result_published',
        title: 'Result Published',
        description: `Your exam results and Verified Certificate (${certId}) are ready!`,
        message: `Results published for ${relatedExam?.title || 'Exam'}. Score: ${score}/${total} (${grade}).`,
        linkTab: 'certificates',
        data: { certificateId: certId },
      });
    }

    triggerCelebration();
  };

  // Generate Certificate manually
  const generateCertificate = async (certData: Partial<Certificate>): Promise<Certificate> => {
    const certId = certData.verificationId || certData.certificateNo || `EA-CERT-${Math.floor(10000 + Math.random() * 90000)}`;
    const score = certData.marks ?? certData.score ?? 90;
    const total = certData.totalMarks ?? 100;
    const pct = certData.scorePercentage ?? Math.round((score / total) * 100);

    const newCert: Certificate = {
      id: certData.id || `cert_${Date.now()}`,
      certificateId: certId,
      userId: certData.userId || user?.uid || 'user_1',
      studentId: certData.studentId || certData.userId || user?.uid,
      userName: certData.studentName || certData.userName || 'Amina Sheikh',
      studentName: certData.studentName || certData.userName || 'Amina Sheikh',
      studentEasiaCode: certData.studentEasiaCode || user?.easiacode || 'EA-STU-8K29Q',
      teacherId: certData.teacherId || user?.uid || 'teacher_1',
      teacherName: certData.teacherName || user?.name || 'Dr. Ramesh Kumar',
      institution: certData.institution || user?.institution || 'EasiaLearn Board Council',
      type: certData.type || 'Completion',
      title: certData.title || 'Academic Achievement Award',
      subject: certData.subject || 'General Curriculum',
      issueDate: certData.issueDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      certificateNo: certId,
      scorePercentage: pct,
      score,
      marks: score,
      totalMarks: total,
      grade: pct >= 90 ? 'A+ Distinction' : 'A First Class',
      qrCodeSeed: `https://easialearn.edu.in/verify/${certId}`,
      verificationId: certId,
    };

    setCertificates((prev) => [newCert, ...prev]);

    try {
      await addDoc(collection(db, 'certificates'), {
        ...newCert,
        createdAt: serverTimestamp(),
      });
    } catch {}

    sendNotification({
      userId: newCert.studentEasiaCode,
      type: 'certificate_ready',
      title: 'Certificate Ready',
      description: `New Verified Certificate (${certId}) awarded for "${newCert.title}"`,
      message: `Your certificate for ${newCert.title} is now ready for instant download!`,
      linkTab: 'certificates',
    });

    triggerCelebration();
    return newCert;
  };

  // Connect Teacher via Invite Code
  const connectTeacher = async (codeOrId: string): Promise<boolean> => {
    const cleanCode = codeOrId.trim().toUpperCase();
    if (!cleanCode) return false;

    const newTeacher = {
      id: `tch_${Date.now()}`,
      name: cleanCode.includes('TCH') ? 'Faculty Educator' : 'Specialist Teacher',
      subject: 'SSLC Board Subject',
      institution: 'Verified Partner Institution',
      easiacode: cleanCode,
      status: 'Connected',
      avatarColor: '#2952CC',
      activeExamsCount: 1,
    };

    setMyTeachers((prev) => [newTeacher, ...prev]);

    sendNotification({
      userId: user?.uid,
      type: 'teacher_added',
      title: 'Teacher Connected',
      description: `Successfully linked with ${cleanCode}`,
      message: `You are now enrolled in teacher class ${cleanCode}. Quizzes and exams will appear in your portal.`,
      linkTab: 'my_teachers',
    });

    triggerCelebration();
    return true;
  };

  // Create Live Class with Pro / Tier limit checks
  const createLiveClass = async (classData: Partial<LiveClass>): Promise<{ success: boolean; error?: string; liveClass?: LiveClass }> => {
    const plan = userPlan || (user?.plan as SubscriptionPlan) || 'free';
    if (plan === 'free') {
      setIsProModalOpen(true);
      return {
        success: false,
        error: 'Free plan does not support live classes. Please upgrade to Pro (₹999/mo) or above.',
      };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayClassesCount = liveClasses.filter(
      (c) => c.teacherId === (user?.uid || 'teacher_1') && c.date === todayStr
    ).length;

    if (plan === 'pro' && todayClassesCount >= 2) {
      setIsProModalOpen(true);
      return {
        success: false,
        error: 'Pro plan daily limit reached (maximum 2 live classes per day). Upgrade to Ultra for 10 classes/day or Annual for unlimited.',
      };
    }

    if (plan === 'ultra' && todayClassesCount >= 10) {
      setIsProModalOpen(true);
      return {
        success: false,
        error: 'Ultra plan daily limit reached (maximum 10 live classes per day). Upgrade to Annual for unlimited classes.',
      };
    }

    const studentCount = classData.assignedStudentCodes?.length || 0;
    if (plan === 'pro' && studentCount > 100) {
      return {
        success: false,
        error: 'Pro plan allows up to 100 students per live class. Upgrade to Ultra for up to 500 students.',
      };
    }

    if (plan === 'ultra' && studentCount > 500) {
      return {
        success: false,
        error: 'Ultra plan allows up to 500 students per live class. Upgrade to Annual for unlimited students.',
      };
    }

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const classId = classData.classId || `CLS-2026-${randomSuffix}`;

    const newClass: LiveClass = {
      id: classId,
      classId: classId,
      title: classData.title || 'Live Classroom Session',
      subject: classData.subject || 'Mathematics',
      description: classData.description || '',
      date: classData.date || todayStr,
      startTime: classData.startTime || '10:00',
      endTime: classData.endTime || '11:00',
      duration: classData.duration || 60,
      teacherId: user?.uid || 'teacher_1',
      teacherName: user?.name || 'Dr. Ramesh Kumar',
      teacherPhoto: user?.photoURL,
      institution: user?.institution || 'EasiaLearn Board Council',
      assignedStudentCodes: classData.assignedStudentCodes || ['EA-STU-8K29Q'],
      thumbnailUrl: classData.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      status: classData.status || 'upcoming',
      createdAt: new Date().toISOString(),
      participantsCount: 0,
      activeSession: {
        isRecording: false,
        whiteboardActive: false,
        screenShareActive: false,
        allMuted: false,
      },
    };

    setLiveClasses((prev) => [newClass, ...prev]);

    try {
      await addDoc(collection(db, 'live_classes'), {
        ...newClass,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Live class saved locally:', e);
    }

    // Realtime notification to all assigned students
    for (const code of newClass.assignedStudentCodes) {
      sendNotification({
        userId: code,
        recipientRole: 'student',
        type: 'live_class_scheduled',
        title: 'Live Class Scheduled',
        description: `${newClass.title} by ${newClass.teacherName}`,
        message: `Class starts on ${newClass.date} at ${newClass.startTime}. Class ID: ${newClass.classId}`,
        linkTab: 'my_classes',
        data: { classId: newClass.classId },
      });
    }

    triggerCelebration();
    return { success: true, liveClass: newClass };
  };

  const startLiveClass = async (classId: string) => {
    setLiveClasses((prev) =>
      prev.map((c) => (c.classId === classId || c.id === classId ? { ...c, status: 'live' } : c))
    );

    const target = liveClasses.find((c) => c.classId === classId || c.id === classId);
    if (target) {
      target.status = 'live';
      for (const code of target.assignedStudentCodes) {
        sendNotification({
          userId: code,
          recipientRole: 'student',
          type: 'class_starting_soon',
          title: 'Class is Live Now!',
          description: `${target.title} has started! Click to join.`,
          message: `${target.teacherName} started the live class. Join immediately.`,
          linkTab: 'my_classes',
          data: { classId: target.classId },
        });
      }
      joinLiveClass(target);
    }
  };

  const endLiveClass = async (classId: string) => {
    setLiveClasses((prev) =>
      prev.map((c) => (c.classId === classId || c.id === classId ? { ...c, status: 'completed' } : c))
    );
    if (activeLiveClass?.classId === classId || activeLiveClass?.id === classId) {
      setIsLiveClassroomOpen(false);
      setActiveLiveClass(null);
    }
  };

  const joinLiveClass = (liveClass: LiveClass) => {
    setActiveLiveClass(liveClass);
    setIsLiveClassroomOpen(true);
    if (user?.role === 'student') {
      sendNotification({
        userId: liveClass.teacherId,
        recipientRole: 'teacher',
        type: 'student_joined_class',
        title: 'Student Joined Class',
        description: `${user.name} (${user.easiacode || 'Student'}) joined ${liveClass.title}`,
        message: `${user.name} entered live classroom session.`,
        linkTab: 'live_classes',
      });
    }
  };

  const leaveLiveClass = () => {
    setIsLiveClassroomOpen(false);
    setActiveLiveClass(null);
  };

  // Lookup student by EasiaCode
  const lookupStudentByEasiaCode = async (code: string): Promise<any | null> => {
    const clean = code.trim().toUpperCase();
    if (!clean) return null;

    // Check demo students first
    const demo = DEMO_STUDENTS.find((s) => s.easiacode === clean || s.easiacode.endsWith(clean));
    if (demo) return demo;

    // Check existing connections
    const existing = teacherConnections.find((c) => c.studentEasiaCode === clean);
    if (existing) {
      return {
        id: existing.studentId,
        uid: existing.studentId,
        name: existing.studentName,
        username: existing.studentUsername,
        easiacode: existing.studentEasiaCode,
        class: existing.studentClass,
        school: existing.studentSchool,
        photoURL: existing.studentPhoto,
      };
    }

    // Try Firestore lookup
    try {
      const q = query(collection(db, 'users'), where('easiacode', '==', clean));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docData = snap.docs[0].data();
        return { id: snap.docs[0].id, ...docData };
      }
    } catch (e) {
      console.warn('Firestore student lookup error:', e);
    }

    return null;
  };

  // Send Teacher Connection Request
  const sendTeacherConnectionRequest = async (
    studentEasiaCode: string
  ): Promise<{ success: boolean; error?: string; student?: any }> => {
    const student = await lookupStudentByEasiaCode(studentEasiaCode);
    if (!student) {
      return { success: false, error: 'Student with this EasiaCode not found.' };
    }

    const connId = `conn_${Date.now()}`;
    const newConn: TeacherConnection = {
      id: connId,
      teacherId: user?.uid || 'teacher_1',
      teacherName: user?.name || 'Dr. Ramesh Kumar',
      teacherEasiaCode: user?.easiacode || 'EA-TCH-9941',
      teacherPhoto: user?.photoURL,
      teacherInstitution: user?.institution || 'Karnataka Secondary Board Council',
      teacherSubject: user?.subject || 'Mathematics & Science',
      studentId: student.id || student.uid || `stu_${Date.now()}`,
      studentName: student.name,
      studentUsername: student.username || student.name.toLowerCase().replace(/\s+/g, ''),
      studentEasiaCode: student.easiacode,
      studentPhoto: student.photoURL,
      studentClass: student.class || 'Class 10 (SSLC)',
      studentSchool: student.school || 'Secondary School',
      status: 'pending',
      requestedBy: 'teacher',
      createdAt: new Date().toISOString(),
      lastActive: 'Just now',
    };

    setTeacherConnections((prev) => [newConn, ...prev]);

    try {
      await addDoc(collection(db, 'teacher_connections'), {
        ...newConn,
        createdAt: serverTimestamp(),
      });
    } catch {}

    // Send realtime notification to student with Accept / Decline action
    sendNotification({
      userId: student.easiacode,
      recipientRole: 'student',
      type: 'teacher_added',
      title: 'Teacher Connection Request',
      description: `${newConn.teacherName} from ${newConn.teacherInstitution} wants to connect with you.`,
      message: `${newConn.teacherName} (${newConn.teacherEasiaCode}) sent you a classroom connection request.`,
      linkTab: 'my_teachers',
      data: {
        connectionId: connId,
        teacherId: newConn.teacherId,
        teacherName: newConn.teacherName,
        teacherEasiaCode: newConn.teacherEasiaCode,
        teacherInstitution: newConn.teacherInstitution,
        teacherSubject: newConn.teacherSubject,
      },
    });

    return { success: true, student };
  };

  // Respond to Connection Request (Student: Accept / Decline)
  const respondToConnectionRequest = async (
    connectionId: string,
    action: 'accepted' | 'declined'
  ): Promise<void> => {
    setTeacherConnections((prev) =>
      prev.map((c) => (c.id === connectionId ? { ...c, status: action } : c))
    );

    const conn = teacherConnections.find((c) => c.id === connectionId);
    if (!conn) return;

    if (action === 'accepted') {
      sendNotification({
        userId: conn.teacherId,
        recipientRole: 'teacher',
        type: 'student_accepted',
        title: 'Student Accepted Request',
        description: `${conn.studentName} (${conn.studentEasiaCode}) accepted your connection request!`,
        message: `You are now connected with ${conn.studentName}. Messaging and Live Class access unlocked.`,
        linkTab: 'students',
        data: { studentId: conn.studentId, studentEasiaCode: conn.studentEasiaCode },
      });

      // Auto unlock private chat
      try {
        const q = query(
          collection(db, 'private_chats'),
          where('participants', 'array-contains', conn.teacherId)
        );
        const snap = await getDocs(q);
        const existing = snap.docs.find((d) => (d.data().participants as string[]).includes(conn.studentId));
        if (!existing) {
          await addDoc(collection(db, 'private_chats'), {
            participants: [conn.teacherId, conn.studentId],
            lastMessage: `Connected on EasiaLearn! You can now message and share study materials.`,
            lastMessageTime: serverTimestamp(),
            unreadCounts: { [conn.teacherId]: 0, [conn.studentId]: 0 },
            createdAt: serverTimestamp(),
          });
        }
      } catch {}

      triggerCelebration();
    }
  };

  // Remove teacher connection
  const removeTeacherConnection = async (connectionId: string): Promise<void> => {
    setTeacherConnections((prev) => prev.filter((c) => c.id !== connectionId));
    try {
      await updateDoc(doc(db, 'teacher_connections', connectionId), { status: 'declined' });
    } catch {}
  };

  // Generate certificate for student (Pro+)
  const generateCertificateForStudent = async (params: {
    studentName: string;
    studentEasiaCode: string;
    teacherName?: string;
    institution?: string;
    type: CertificateType;
    title: string;
    subject: string;
    marks?: number;
    totalMarks?: number;
  }): Promise<Certificate | null> => {
    if (!isPro) {
      setIsProModalOpen(true);
      return null;
    }

    const certNo = `EA-CERT-${Math.floor(10000 + Math.random() * 90000)}`;
    const marks = params.marks || 92;
    const total = params.totalMarks || 100;
    const pct = Math.round((marks / total) * 100);

    const newCert: Certificate = {
      id: `cert_${Date.now()}`,
      certificateId: certNo,
      userId: user?.uid || 'user_1',
      userName: params.studentName,
      studentName: params.studentName,
      studentEasiaCode: params.studentEasiaCode,
      teacherId: user?.uid || 'teacher_1',
      teacherName: params.teacherName || user?.name || 'Dr. Ramesh Kumar',
      institution: params.institution || user?.institution || 'EasiaLearn Board Council',
      type: params.type,
      title: params.title,
      subject: params.subject,
      issueDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      certificateNo: certNo,
      scorePercentage: pct,
      score: marks,
      marks: marks,
      totalMarks: total,
      grade: pct >= 90 ? 'A+ Distinction' : 'A First Class',
      qrCodeSeed: `https://easialearn.edu.in/verify/${certNo}`,
      verificationId: certNo,
      pdfGenerated: true,
    };

    setCertificates((prev) => [newCert, ...prev]);

    try {
      await addDoc(collection(db, 'certificates'), {
        ...newCert,
        createdAt: serverTimestamp(),
      });
    } catch {}

    sendNotification({
      userId: params.studentEasiaCode,
      recipientRole: 'student',
      type: 'certificate_ready',
      title: 'Certificate Ready',
      description: `New Verified Certificate (${certNo}) awarded for "${newCert.title}"`,
      message: `Your certificate for ${newCert.title} is now ready for instant download!`,
      linkTab: 'certificates',
    });

    triggerCelebration();
    return newCert;
  };

  const updatePricingPlan = async (id: string, updates: any) => {
    setPricingPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    try {
      await setDoc(doc(db, 'pricing_plans', id), updates, { merge: true });
    } catch {}
  };

  const createSubject = (subject: Partial<Subject>) => {
    const newSub: Subject = {
      id: `sub_${Date.now()}`,
      title: subject.title || 'New Subject',
      description: subject.description || '',
      color: subject.color || '#2952CC',
      bgLight: subject.bgLight || '#EAF2FF',
      class: subject.class || '10th',
      medium: subject.medium || 'English',
      totalChapters: subject.totalChapters || 10,
      completedChapters: 0,
      difficulty: subject.difficulty || 'Medium',
      progressPercent: 0,
    };
    setSubjects((prev) => [newSub, ...prev]);
  };

  const addSubject = createSubject;

  const createLesson = (lesson: Partial<Lesson>) => {
    const newLesson: Lesson = {
      id: `les_${Date.now()}`,
      chapterId: lesson.chapterId || 'ch_1',
      subjectId: lesson.subjectId || subjects[0]?.id || 'sub_math',
      title: lesson.title || 'New Lesson',
      order: (lessons.length || 0) + 1,
      duration: lesson.duration || '15 mins',
      videoUrl: lesson.videoUrl || '',
      notesContent: lesson.notesContent || '',
      examples: lesson.examples || [],
      downloadableFiles: lesson.downloadableFiles || [],
      practiceQuestionsCount: lesson.practiceQuestionsCount || 5,
      isCompleted: false,
    };
    setLessons((prev) => [...prev, newLesson]);
  };

  const completeLesson = (lessonId: string) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, isCompleted: true, completed: true } : l))
    );
    addEasiacoins(25);
    triggerCelebration();
  };

  const createMockTest = (test: Partial<MockTest>) => {
    const newTest: MockTest = {
      id: `test_${Date.now()}`,
      title: test.title || 'New Mock Test',
      subject: test.subject || 'General',
      class: test.class || '10th',
      totalQuestions: test.totalQuestions || 20,
      durationMinutes: test.durationMinutes || 60,
      totalMarks: test.totalMarks || 50,
      negativeMarking: test.negativeMarking || false,
      negativeMarkValue: test.negativeMarkValue || 0,
      difficulty: test.difficulty || 'Medium',
      questions: test.questions || [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMockTests((prev) => [newTest, ...prev]);
  };

  const startMockTest = (testId?: string) => {
    const target = mockTests.find((t) => t.id === testId) || mockTests[0];
    setActiveMockTest(target);
    setCurrentView('cbt_test');
  };

  const addTestResult = (res: TestResult) => {
    setResults((prev) => [res, ...prev]);
    addEasiacoins(50);
    triggerCelebration();
  };

  const markAllNotificationsAsRead = () => {
    clearAllNotifications();
  };

  const openLesson = (lessonOrId: Lesson | string, subjectId?: string) => {
    if (typeof lessonOrId === 'string') {
      const found = lessons.find((l) => l.id === lessonOrId);
      if (found) {
        setActiveLesson(found);
      } else {
        setActiveLesson({
          id: lessonOrId,
          chapterId: 'ch_1',
          subjectId: subjectId || subjects[0]?.id || 'sub_math',
          title: 'Quadratic Equations & Problem Solving',
          order: 1,
          duration: '18 mins',
          videoUrl: '',
          notesContent: '',
          examples: [],
          downloadableFiles: [],
          practiceQuestionsCount: 5,
        });
      }
    } else {
      setActiveLesson(lessonOrId);
    }
    if (subjectId) {
      const sub = subjects.find((s) => s.id === subjectId);
      if (sub) setSelectedSubject(sub);
    }
    setCurrentView('lesson_player');
  };

  const createAnnouncement = (ann: Partial<Announcement>) => {
    const newAnn: Announcement = {
      id: `ann_${Date.now()}`,
      title: ann.title || 'Announcement',
      content: ann.content || '',
      date: 'Just now',
      authorName: ann.authorName || 'Teacher',
      targetClass: ann.targetClass || 'All Classes',
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const createQuestion = (q: Partial<Question>) => {
    console.log('Created question:', q);
  };

  const addFlashcard = (card: Partial<Flashcard>) => {
    const newCard: Flashcard = {
      id: `fc_${Date.now()}`,
      subject: card.subject || 'Mathematics',
      chapter: card.chapter || 'Important Concepts',
      front: card.front || '',
      back: card.back || '',
      level: 'New',
    };
    setFlashcards((prev) => [...prev, newCard]);
  };

  const updateFlashcardLevel = (id: string, level: any) => {
    setFlashcards((prev) => prev.map((f) => (f.id === id ? { ...f, level } : f)));
  };

  const askDoubt = (d: Partial<Doubt>) => {
    const newDoubt: Doubt = {
      id: `d_${Date.now()}`,
      studentId: 'user_1',
      studentName: 'Student',
      subject: d.subject || 'General',
      chapter: d.chapter || 'Chapter',
      question: d.question || '',
      status: 'Pending',
      createdAt: 'Just now',
    };
    setDoubts((prev) => [newDoubt, ...prev]);
  };

  const answerDoubt = (id: string, reply: string) => {
    setDoubts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'Answered', reply, response: reply } : d))
    );
  };

  const addEasiacoins = (amount: number) => {
    setEasiacoins((prev) => prev + amount);
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2952CC', '#4F7DF3', '#10B981', '#F59E0B'],
      });
    } catch {
      // Confetti fallback
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        studentTab,
        setStudentTab,
        selectedSubject,
        setSelectedSubject,
        activeLesson,
        setActiveLesson,
        activeMockTest,
        setActiveMockTest,
        isSearchOpen,
        setIsSearchOpen,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        sendNotification,
        isAiTutorOpen,
        setIsAiTutorOpen,
        isProModalOpen,
        setIsProModalOpen,
        language,
        setLanguage,
        userPlan,
        setUserPlan,
        upgradeSubscription,
        isPro,
        pricingPlans,
        updatePricingPlan,
        teacherExams,
        createTeacherExam,
        activeExam,
        setActiveExam,
        startTeacherExam,
        teacherQuizzes,
        createTeacherQuiz,
        examSubmissions,
        submitExam,
        publishExamResults,
        subjects,
        createSubject,
        addSubject,
        lessons,
        createLesson,
        completeLesson,
        openLesson,
        badges,
        mockTests,
        createMockTest,
        startMockTest,
        results,
        addTestResult,
        announcements,
        createAnnouncement,
        createQuestion,
        analytics,
        flashcards,
        addFlashcard,
        updateFlashcardLevel,
        certificates,
        generateCertificate,
        myTeachers,
        connectTeacher,
        doubts,
        askDoubt,
        answerDoubt,
        easiacoins,
        addEasiacoins,
        triggerCelebration,
        liveClasses,
        createLiveClass,
        startLiveClass,
        endLiveClass,
        activeLiveClass,
        setActiveLiveClass,
        isLiveClassroomOpen,
        setIsLiveClassroomOpen,
        joinLiveClass,
        leaveLiveClass,
        teacherConnections,
        lookupStudentByEasiaCode,
        sendTeacherConnectionRequest,
        respondToConnectionRequest,
        removeTeacherConnection,
        generateCertificateForStudent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
