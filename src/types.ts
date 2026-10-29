export interface AcademySettings {
  name: string;
  tagline: string;
  contactPhone: string;
  contactEmail: string;
  phone?: string;
  email?: string;
  address: string;
  logoUrl: string;
  currency: string;
  upiId: string;
  upiPayeeName: string;
  upiQrUrl: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
}

export interface PaymentSettings {
  upiId: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  qrCodeUrl: string;
  instructions: string;
}

export type UserRole = 'admin' | 'teacher' | 'student' | 'guest';

export interface Teacher {
  id: string;
  name: string;
  qualifications: string;
  qualification?: string;
  experienceYears?: number;
  email: string;
  phone: string;
  subjectsExpertise: string[];
  bio: string;
  avatarUrl: string;
  status: 'active' | 'on_leave' | 'inactive';
  totalTeachingHours: number;
  assignedBatches: string[];
  rating?: number;
  role?: string;
}

export interface ChapterItem {
  id: string;
  chapterNumber: number;
  title: string;
  description: string;
  lectures: RecordedVideo[];
  notes: ContentItem[];
  modelPapers: ContentItem[];
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone_whatsapp: string;
  class_target?: string;
  parent_phone?: string;
  role: 'student' | 'teacher' | 'admin';
  subject?: string; // for teachers
  created_at?: string;
}

export interface CertificateSettings {
  id?: string;
  directorName: string;
  directorDesignation: string;
  leadInstructorName: string;
  leadInstructorDesignation: string;
  sealText: string;
  academyName: string;
  updatedAt?: string;
}

export interface BatchPurchaseRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  batchId: string;
  batchName: string;
  subjectId?: string;
  subjectName?: string;
  amount: number;
  paymentMode: 'UPI' | 'NetBanking' | 'Cash' | 'Card';
  transactionRef: string;
  status: 'pending_verification' | 'approved' | 'rejected';
  rejectionReason?: string;
  receiptNumber: string;
  proofUrl?: string;
  createdAt: string;
  verifiedAt?: string;
  whatsappMessageStatus?: 'pending' | 'sent' | 'delivered';
}

export interface BatchSubject {
  id: string;
  name: string;
  price: number;
  duration: string;
  teacherName: string;
  description: string;
  iconName?: string;
  chapters: ChapterItem[];
}

export interface Batch {
  id: string;
  name: string;
  grade: string;
  subject: string;
  studentCount: number;
  lastClassDate: string;
  scheduleTime: string;
  roomCode: string;
  nextTopic: string;
  status: 'active' | 'completed' | 'upcoming';
  teacherId?: string;
  teacherName?: string;
  monthlyFee: number;
  // Extended fields for public catalog & course checkout
  description?: string;
  coverImage?: string;
  thumbnail_url?: string;
  thumbnailUrl?: string;
  duration?: string; // e.g. "1 Year"
  fullBatchPrice?: number;
  subjects?: BatchSubject[];
}

export interface CourseEnrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  batchId: string;
  batchName: string;
  subjectId?: string;
  subjectName?: string;
  pricePaid: number;
  paymentMode: 'UPI' | 'NetBanking' | 'Cash' | 'Card';
  transactionRef: string;
  enrolledAt: string;
  expiresAt: string;
  status: 'active' | 'expired';
}

export interface TeacherPayoutRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  amount: number;
  date: string;
  paymentMode: 'UPI' | 'Bank Transfer' | 'Cheque';
  transactionRef: string;
  notes: string;
  status: 'completed' | 'processing';
}

export interface TeacherContract {
  teacherId: string;
  teacherName: string;
  model: 'revenue_share' | 'fixed_salary' | 'hybrid';
  revenueSharePercent: number; // e.g., 30 for 30%
  fixedMonthlySalary: number;  // e.g., 35000
  assignedSubjects: string[];
  terms: string;
  effectiveDate: string;
  renewalDate: string;
  totalPaid: number;
  pendingDue: number;
  payoutHistory: TeacherPayoutRecord[];
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalTeacherPayouts: number;
  platformOperatingCosts: number;
  netProfit: number;
  profitMargin: number;
  transactions: CourseEnrollment[];
  contracts: TeacherContract[];
}

export interface Student {
  id: string;
  batchId: string;
  batchName: string;
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  attendanceRate: number;
  attendancePercentage?: number;
  performanceScore: number;
  averageScore?: number;
  feeStatus: 'paid' | 'pending' | 'overdue';
  feeDueAmount: number;
  lastFeePaidDate?: string;
  status: 'enrolled' | 'inactive' | 'pending' | 'rejected';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  registeredAt?: string;
  password?: string;
  rejectionReason?: string;
  isHandRaised?: boolean;
  isMuted?: boolean;
  // Access control & moderation
  purchasedBatchIds?: string[];
  purchasedSubjectIds?: string[];
  enrolledBatches?: string[];
  targetExam?: string;
  enrollments?: CourseEnrollment[];
  isChatBlocked?: boolean;
}

export interface StudentRegistrationInput {
  name: string;
  email: string;
  phone: string;
  password?: string;
  batchId: string;
  batchName?: string;
  subjectId?: string;
  subjectName?: string;
}

export interface RecordedVideo {
  id: string;
  title: string;
  batchId: string;
  batchName: string;
  subject: string;
  chapterName?: string;
  videoUrl: string;
  videoSource?: 'youtube' | 'drive' | 'file';
  duration: string;
  recordedDate: string;
  teacherName: string;
  teacherId?: string;
  thumbnailUrl?: string;
  description?: string;
  notesAttachmentUrl?: string;
  viewsCount: number;
  isQualityAdaptive?: boolean;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  batchName: string;
  amount: number;
  paymentMode: 'UPI' | 'NetBanking' | 'Cash' | 'Card';
  transactionRef: string;
  status: 'completed' | 'pending';
  receiptNumber: string;
  date: string;
}

export interface ContentItem {
  id: string;
  folderName: string;
  subfolderName: string;
  title: string;
  fileType: 'pdf' | 'video' | 'quiz' | 'doc';
  fileSize: string;
  uploadedAt: string;
  uploadDate?: string;
  downloads: number;
  details?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderName: string;
  senderRole: 'teacher' | 'student' | 'system';
  message: string;
  timestamp: string;
  isDoubt?: boolean;
  studentId?: string;
  isBlocked?: boolean;
}

export interface ScheduleEvent {
  id: string;
  batchName: string;
  subject: string;
  teacherName: string;
  time: string;
  topic: string;
  date: string;
  status: 'live' | 'upcoming' | 'completed';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetBatch: string;
  priority: 'normal' | 'urgent';
  createdAt: string;
}

export interface LiveSessionState {
  id: string;
  batchId: string;
  batchName: string;
  title: string;
  subject: string;
  topic: string;
  jitsiRoomName: string;
  isActive: boolean;
  startedAt: string | null;
  durationSeconds: number;
  participantsCount: number;
  isRecording: boolean;
  isTeacherMuted: boolean;
  isTeacherVideoOn: boolean;
  isScreenSharing: boolean;
}

// 1. WhatsApp & SMS Notifications
export interface NotificationRecord {
  id: string;
  recipientName: string;
  recipientPhone: string;
  recipientRole: 'student' | 'teacher' | 'admin';
  channel: 'whatsapp' | 'sms' | 'both';
  type: 'registration_received' | 'student_approved' | 'new_quiz' | 'new_assignment' | 'announcement' | 'fee_reminder' | 'live_class';
  title: string;
  message: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: string;
  batchName?: string;
  whatsAppDeepLink?: string;
}

export interface AcademicTarget {
  id: string;
  name: string;
  category?: string;
  grade?: string;
  description?: string;
  createdAt?: string;
}

// 2. Online Quiz & Assessment Module
export interface QuizQuestion {
  id: string;
  questionText: string;
  options: [string, string, string, string];
  correctOptionIndex: number; // 0, 1, 2, 3
  explanation: string;
  marks: number;
}

export interface Quiz {
  id: string;
  title: string;
  batchId: string;
  batchName: string;
  subject: string;
  chapterName: string;
  timeLimitMinutes: number;
  totalMarks: number;
  passMarks: number;
  createdAt: string;
  createdByTeacherName: string;
  questions: QuizQuestion[];
  isPublished: boolean;
  isLive?: boolean; // When true, displays with 'LIVE' tag on student portal
  scheduledDate?: string;
  scheduledTime?: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  batchId: string;
  selectedAnswers: Record<string, number>; // questionId -> optionIndex
  score: number;
  totalMarks: number;
  percentage: number;
  isPassed: boolean;
  submittedAt: string;
  timeTakenSeconds: number;
}

// 3. Student Progress & Report Card
export interface StudentReportCard {
  studentId: string;
  studentName: string;
  rollNumber: string;
  batchName: string;
  grade: string; // e.g. "A+", "A", "B+"
  attendanceRate: number; // e.g. 96%
  totalClassesHeld: number;
  classesAttended: number;
  quizzesTaken: number;
  averageQuizScore: number;
  highestQuizScore: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  feeStatus: 'paid' | 'pending';
  teacherRemarks: string;
  teacherName: string;
  generatedDate: string;
  quizBreakdown: {
    quizTitle: string;
    score: number;
    totalMarks: number;
    percentage: number;
    date: string;
  }[];
}

// 4. Advanced Doubt Engine & Discussion Forum
export interface DoubtReply {
  id: string;
  authorName: string;
  authorRole: 'teacher' | 'student' | 'ai_bot';
  authorAvatar?: string;
  content: string;
  createdAt: string;
  isTeacher?: boolean;
  isTeacherVerified?: boolean;
  isVerified?: boolean;
  videoSolutionUrl?: string;
}

export interface DoubtItem {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNumber?: string;
  batchId: string;
  batchName: string;
  subject: string;
  chapter: string;
  lectureId?: string;
  lectureTitle?: string;
  videoTimestamp?: string;
  title: string;
  description: string;
  photoUrl?: string;
  status: 'open' | 'answered' | 'resolved' | 'pending';
  upvotes: number;
  createdAt: string;
  aiSolution?: string;
  replies: DoubtReply[];
}

// 5. Smart Progress Tracking & Analytics
export interface StudentProgress {
  studentId: string;
  completedLectureIds: string[];
  completedNoteIds: string[];
  completedChapterIds: string[];
  overallPercentage: number;
  totalHoursLogged: number;
  lastUpdated: string;
  subjectBreakdown?: Record<string, number>;
}

// 6. Smart Bookmarks & Quick Revision
export interface StudentBookmark {
  id: string;
  studentId: string;
  type: 'video_timestamp' | 'note_page' | 'chapter_topic';
  title: string;
  batchName: string;
  subjectName: string;
  chapterTitle: string;
  targetId: string; // videoId or noteId or chapterId
  timestamp?: string; // e.g. "12:45"
  pageNumber?: number;
  noteText?: string;
  createdAt: string;
}

// 6b. Digital Payment Receipt & Automated Dispatch
export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  enrollmentId?: string;
  studentId?: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  batchId: string;
  batchName: string;
  subjectId?: string;
  subjectName?: string;
  amount: number;
  amountPaid?: number;
  paymentMode: string;
  transactionRef: string;
  paymentDate: string;
  paidAt?: string;
  accessValidUntil: string;
  expiresAt?: string;
  status?: 'success' | 'pending';
  generatedCredentials: {
    email: string;
    password?: string;
  };
  credentials?: {
    loginEmail: string;
    defaultPassword?: string;
  };
  directAccessUrl: string;
  accessLink?: string;
  whatsappDispatchStatus?: 'delivered' | 'sent';
  emailDispatchStatus?: 'delivered' | 'sent';
}

// 7. Smart Timetable & Calendar
export interface TimetableSlot {
  id: string;
  dayOfWeek?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' | string;
  day?: string;
  batchId: string;
  batchName: string;
  subject: string;
  startTime: string; // e.g. "10:00 AM"
  endTime: string;   // e.g. "11:00 AM"
  roomCode?: string;
  room?: string;
  topic: string;
  teacherName: string;
  color?: string;
}

// 8. Digital Certificate
export interface DigitalCertificate {
  id: string;
  certificateNumber: string; // e.g. "AA-FSDB-RK4579"
  verificationCode?: string; // unique code e.g. "AA-FSDB-RK4579"
  studentId: string;
  studentName: string;
  studentRollNumber?: string;
  batchId: string;
  batchName: string;
  courseTitle: string;
  issueDate?: string;
  completionDate?: string;
  grade: string;
  overallScore?: number;
  issuerName?: string;
  issuerTitle?: string;
  leadInstructorName?: string;
  leadInstructorDesignation?: string;
  sealText?: string;
  verificationUrl: string;
  isUnlocked?: boolean;
  status?: string;
  issuedBy?: string;
}
