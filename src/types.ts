export type UserRole = 'student' | 'teacher' | 'admin' | 'institution';

export interface UserProfile {
  uid: string;
  fullName?: string;
  name: string;
  username: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  easiacode: string;
  status: 'Pending' | 'Verified' | 'Blocked' | 'Pro' | 'Active';
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  guardianName?: string;
  schoolName?: string;
  school?: string;
  class?: string;
  medium?: string;
  state?: string;
  institution?: string;
  subject?: string;
  qualification?: string;
  experience?: string;
  inviteCode?: string;
  institutionName?: string;
  principalName?: string;
  address?: string;
  profileId?: string;
  trialEndsAt?: string;
  createdAt: string;
  lastLogin?: string;
  isVerified?: boolean;
  streakDays?: number;
  plan?: SubscriptionPlan;
  isPro?: boolean;
  easiacoins?: number;
  bio?: string;
}

export interface TeacherConnection {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEasiaCode: string;
  teacherPhoto?: string;
  teacherInstitution?: string;
  teacherSubject?: string;
  studentId: string;
  studentName: string;
  studentUsername: string;
  studentEasiaCode: string;
  studentPhoto?: string;
  studentClass?: string;
  studentSchool?: string;
  status: 'pending' | 'accepted' | 'declined';
  requestedBy: 'teacher' | 'student';
  createdAt: string;
  lastActive?: string;
}

export interface LiveClass {
  id: string; // e.g. "CLS-2026-A91X"
  classId: string;
  title: string;
  subject: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  duration: number; // minutes
  teacherId: string;
  teacherName: string;
  teacherPhoto?: string;
  institution?: string;
  assignedStudentCodes: string[];
  thumbnailUrl?: string;
  status: 'upcoming' | 'live' | 'completed';
  createdAt: string;
  participantsCount?: number;
  activeSession?: {
    isRecording?: boolean;
    whiteboardActive?: boolean;
    screenShareActive?: boolean;
    screenShareUser?: string;
    allMuted?: boolean;
  };
}

export interface ClassParticipant {
  id: string;
  classId: string;
  userId: string;
  userName: string;
  userRole: 'teacher' | 'student';
  photoURL?: string;
  easiacode?: string;
  joinedAt: string;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isHandRaised: boolean;
}

export interface ClassAttendanceRecord {
  id: string;
  classId: string;
  classTitle: string;
  studentId: string;
  studentName: string;
  studentEasiaCode: string;
  date: string;
  durationAttendedMinutes: number;
  status: 'Present' | 'Late' | 'Absent';
  markedAt: string;
}

export type SubscriptionPlan = 'free' | 'pro' | 'ultra' | 'annual';

export interface SubscriptionDetails {
  plan: SubscriptionPlan;
  price: number;
  status: 'active' | 'trial' | 'expired';
  validUntil: string;
  activatedAt: string;
  fileUploadLimit: number;
}

export type MediumType = 'English' | 'Kannada' | 'Urdu' | 'Urdu/Arabic';

export interface Subject {
  id: string;
  title: string;
  description: string;
  color: string;
  bgLight: string;
  icon?: string;
  class: string;
  medium: MediumType;
  totalChapters: number;
  completedChapters?: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  assignedTeacher?: string;
  progressPercent?: number;
  progress?: number;
  bannerImage?: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  chapterNumber: number;
  durationMinutes: number;
  lessonsCount: number;
  isCompleted?: boolean;
  topics: string[];
  order?: number;
  description?: string;
  completedLessonsCount?: number;
  totalLessonsCount?: number;
}

export interface LessonExample {
  title: string;
  question: string;
  solution: string;
  examTip?: string;
}

export interface Lesson {
  id: string;
  chapterId: string;
  subjectId: string;
  title: string;
  order: number;
  duration: string;
  videoUrl: string;
  notesPdfUrl?: string;
  notesContent: string;
  examples: LessonExample[];
  downloadableFiles: { name: string; size: string; type: string }[];
  practiceQuestionsCount: number;
  isCompleted?: boolean;
  completed?: boolean;
}

export type QuestionType = 'mcq' | 'true_false' | 'fill_blank' | 'short_answer';

export interface Question {
  id: string;
  subject?: string;
  chapter?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  type?: QuestionType;
  question: string;
  text?: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  marks: number;
}

export interface MockTest {
  id: string;
  title: string;
  subject: string;
  class: string;
  totalQuestions: number;
  durationMinutes: number;
  totalMarks: number;
  negativeMarking: boolean;
  negativeMarkValue: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: Question[];
  createdAt: string;
}

export interface TestResult {
  id: string;
  userId?: string;
  testId: string;
  testTitle: string;
  subject: string;
  score: number;
  totalMarks: number;
  percentage?: number;
  accuracy: number;
  timeSpentSeconds?: number;
  timeSpentMinutes?: number;
  timeTakenSeconds?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  correctCount?: number;
  wrongAnswers?: number;
  incorrectCount?: number;
  unattempted?: number;
  unattemptedCount?: number;
  percentile?: number;
  stateRank?: number;
  rank?: number;
  breakdown?: any;
  date?: string;
  weakChapters: string[];
  selectedAnswers?: Record<string, any>;
}

export interface StudentAnalytics {
  predictedScore: number;
  predictedBoardScore?: number;
  studyStreak: number;
  studyStreakDays?: number;
  hoursStudied: number;
  totalHoursStudied?: number;
  stateRank: number;
  weeklyProgress: { day: string; hours: number; target: number }[];
  subjectAccuracies: { subject: string; score: number; accuracy: number; totalHours: number }[];
  accuracyBySubject?: Record<string, number>;
  weakChapters: { name: string; subject: string; impact: string }[];
  recentActivities: { id: string; title: string; time: string; score?: string }[];
  aiRecommendation: {
    focusTopic: string;
    estimatedImprovement: string;
    actionLabel: string;
  };
}

export type FlashcardLevel = 'New' | 'Learning' | 'Review' | 'Mastered' | 'new' | 'learning' | 'review' | 'mastered';

export interface Doubt {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  chapter: string;
  question: string;
  questionText?: string;
  imageUrl?: string;
  status: 'Pending' | 'Answered' | 'Resolved';
  createdAt: string;
  reply?: string;
  response?: string;
  answeredBy?: string;
}

export interface Flashcard {
  id: string;
  subjectId?: string;
  subject?: string;
  subjectName?: string;
  chapter: string;
  front: string;
  back: string;
  level: FlashcardLevel;
  lastReviewed?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export type CertificateType =
  | 'Live Class Completion'
  | 'Quiz'
  | 'Exam'
  | 'Workshop'
  | 'Participation'
  | 'Completion'
  | 'Merit'
  | 'Rank'
  | 'Course Completion'
  | 'Top Performer'
  | 'Rank Holder'
  | 'Quiz Completion'
  | 'Exam Completion'
  | 'Official Competition';

export interface Certificate {
  id: string;
  certificateId?: string;
  userId: string;
  studentId?: string;
  userName: string;
  studentName?: string;
  studentEasiaCode?: string;
  teacherId?: string;
  teacherName?: string;
  institution?: string;
  type: CertificateType;
  title: string;
  subject: string;
  issueDate: string;
  certificateNo: string;
  scorePercentage: number;
  score?: number;
  totalMarks?: number;
  marks?: number;
  grade?: string;
  qrCodeSeed: string;
  verificationId?: string;
  pdfGenerated?: boolean;
}

export interface ExamQuestion {
  id: string;
  type: 'mcq' | 'true_false' | 'short_answer' | 'image';
  question: string;
  imageUrl?: string;
  options?: string[];
  correctAnswer: string | number;
  marks: number;
  explanation?: string;
}

export interface TeacherQuiz {
  id: string;
  title: string;
  subject: string;
  class: string;
  description: string;
  quizCode: string;
  questions: Question[];
  timerMinutes: number;
  startDate: string;
  endDate: string;
  totalMarks: number;
  assignedStudentCodes: string[];
  teacherId: string;
  teacherName: string;
  createdAt: string;
  isPublished: boolean;
}

export interface TeacherExam {
  id: string;
  examCode: string; // e.g. EX-2026-9X21Q
  title: string;
  subject: string;
  class: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  questions: ExamQuestion[];
  assignedStudentCodes: string[];
  teacherId: string;
  teacherName: string;
  institution?: string;
  createdAt: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduledDate?: string;
  resultsPublished?: boolean;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  examCode: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentEasiaCode: string;
  submittedAt: string;
  score: number;
  totalMarks: number;
  answers: Record<string, any>;
  status: 'submitted' | 'reviewed' | 'published';
  certificateId?: string;
}

export interface Badge {
  id: string;
  name?: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'lesson' | 'quiz' | 'mastery';
  unlocked: boolean;
  unlockedAt?: string;
  currentProgress: number;
  progress?: number;
  targetProgress: number;
  maxProgress?: number;
}

export interface Announcement {
  id: string;
  title: string;
  message?: string;
  content?: string;
  priority?: 'Urgent' | 'High' | 'Normal';
  targetClass?: string;
  targetRole?: string;
  authorName?: string;
  author?: string;
  authorRole?: string;
  category?: string;
  date?: string;
  repliesCount?: number;
}

export type NotificationType =
  | 'teacher_added'
  | 'student_accepted'
  | 'live_class_scheduled'
  | 'class_starting_soon'
  | 'student_joined_class'
  | 'class_attendance'
  | 'quiz_available'
  | 'exam_available'
  | 'result_published'
  | 'certificate_ready'
  | 'pro_activated'
  | 'student_joined'
  | 'quiz_submitted'
  | 'exam_completed'
  | 'message_received'
  | 'exam_reminder'
  | 'lesson_uploaded'
  | 'badge_earned'
  | 'mock_result'
  | 'announcement'
  | 'system';

export interface AppNotification {
  id: string;
  userId?: string;
  recipientRole?: 'student' | 'teacher' | 'all';
  type: NotificationType;
  title: string;
  description?: string;
  message: string;
  read: boolean;
  timestamp: string;
  time?: string;
  linkTab?: string;
  icon?: string;
  data?: any;
}

export interface ChatInsights {
  detectedTopic: string;
  documentType: string;
  language: string;
  complexity: string;
  suggestedActions: string[];
  relatedFiles: { name: string; type: string; size?: string }[];
}

export interface GeneratedFilePayload {
  fileName: string;
  fileType: 'pdf' | 'xlsx' | 'docx' | 'pptx' | 'csv';
  size: string;
  downloadUrl: string;
  previewType: 'pdf' | 'excel' | 'word' | 'ppt' | 'table';
  previewData?: any;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language?: 'English' | 'Kannada' | 'Arabic' | 'Urdu' | 'Hindi' | string;
  imageUrl?: string;
  fileName?: string;
  fileType?: 'pdf' | 'excel' | 'word' | 'ppt' | 'csv' | 'image' | 'docx' | 'xlsx' | 'pptx' | 'other' | string;
  fileSize?: string;
  generatedFile?: GeneratedFilePayload;
  bookmarked?: boolean;
  insights?: ChatInsights;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt?: number;
  updatedAt: number;
  pinned?: boolean;
  favorite?: boolean;
  archived?: boolean;
  messages: ChatMessage[];
  insights?: ChatInsights;
}


