import React, { useState, useEffect, useRef } from 'react';
import {
  Student,
  Batch,
  BatchSubject,
  ChapterItem,
  ContentItem,
  ScheduleEvent,
  Announcement,
  AcademySettings,
  RecordedVideo,
  Quiz,
  QuizSubmission,
  DoubtItem,
  StudentReportCard,
  DigitalCertificate,
  NotificationRecord,
  StudentProgress,
  StudentBookmark,
  PaymentReceipt
} from '../types.ts';
import {
  GraduationCap,
  Video,
  FileText,
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  HelpCircle,
  Play,
  Calendar,
  Sparkles,
  BookOpen,
  Film,
  Eye,
  X,
  Award,
  ShieldCheck,
  Bell,
  MessageSquare,
  Lock,
  ChevronRight,
  ArrowLeft,
  ChevronDown,
  Layers,
  Radio,
  Copy,
  Check,
  ExternalLink,
  BookMarked,
  Calculator,
  FlaskConical,
  Globe2,
  Dna,
  Atom,
  Compass,
  FileCheck2,
  Pencil,
  Pin,
  Megaphone,
  AlertTriangle,
  UserCheck,
  Flame,
  Search,
  Bookmark,
  CheckSquare,
  Square,
  TrendingUp,
  BarChart3,
  Image as ImageIcon,
  Camera,
  Trash2
} from 'lucide-react';
import { QuizAssessmentPanel } from './QuizAssessmentPanel.tsx';
import { DoubtForumPanel } from './DoubtForumPanel.tsx';
import { DigitalReceiptModal } from './DigitalReceiptModal.tsx';

interface StudentPortalViewProps {
  student: Student;
  batch?: Batch;
  allBatches?: Batch[];
  academy: AcademySettings;
  schedule: ScheduleEvent[];
  content: ContentItem[];
  announcements: Announcement[];
  videos?: RecordedVideo[];
  quizzes?: Quiz[];
  submissions?: QuizSubmission[];
  doubts?: DoubtItem[];
  reportCard?: StudentReportCard | null;
  certificates?: DigitalCertificate[];
  notifications?: NotificationRecord[];
  isLiveActive?: boolean;
  liveSession?: {
    batchId: string;
    batchName: string;
    title: string;
    subject: string;
    topic: string;
  } | null;
  isGuest?: boolean;
  onRequireAuth?: (message?: string) => void;
  onJoinLiveClass: (batchId: string) => void;
  onPayFee?: (
    studentId: string,
    amount: number,
    paymentMode: 'UPI' | 'NetBanking' | 'Cash' | 'Card',
    transactionRef?: string
  ) => void;
  onCourseCheckout?: (checkoutData: {
    studentId?: string;
    studentName: string;
    studentEmail: string;
    studentPhone: string;
    password?: string;
    batchId: string;
    subjectId?: string;
    pricePaid: number;
    paymentMode?: 'UPI' | 'NetBanking' | 'Cash' | 'Card';
    transactionRef?: string;
  }) => Promise<{ success: boolean; data?: any }>;
  onOpenSecurePdf?: (item: ContentItem) => void;
  onOpenReportCard?: () => void;
  onOpenCertificate?: (cert: DigitalCertificate) => void;
  onSubmitQuiz?: (
    quizId: string,
    answers: Record<string, number>,
    timeTakenSeconds: number
  ) => Promise<QuizSubmission>;
  onAddDoubt?: (doubtData: any) => Promise<void>;
  onAddReply?: (doubtId: string, content: string, isTeacher: boolean) => Promise<void>;
  onUpvoteDoubt?: (doubtId: string) => Promise<void>;
  onOpenStudentAuth?: () => void;
  onUpdateBatch?: (batchId: string, updates: Partial<Batch>) => void;
  initialView?: 'dashboard' | 'my-batches' | 'all-batches' | 'batch-overview' | 'checkout' | 'quizzes' | 'doubts' | 'certificates' | 'bookmarks';
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  student,
  batch,
  allBatches = [],
  academy,
  schedule,
  content,
  announcements = [],
  videos = [],
  quizzes = [],
  submissions = [],
  doubts = [],
  reportCard,
  certificates = [],
  notifications = [],
  isLiveActive = false,
  liveSession,
  isGuest = false,
  onRequireAuth,
  onJoinLiveClass,
  onCourseCheckout,
  onOpenSecurePdf,
  onOpenReportCard,
  onOpenCertificate,
  onSubmitQuiz,
  onAddDoubt,
  onAddReply,
  onUpvoteDoubt,
  onOpenStudentAuth,
  onUpdateBatch,
  initialView
}) => {
  // Navigation State inside Student Portal:
  // 'dashboard' | 'my-batches' | 'all-batches' | 'batch-overview' | 'checkout' | 'quizzes' | 'doubts' | 'certificates' | 'bookmarks'
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'my-batches' | 'all-batches' | 'batch-overview' | 'checkout' | 'quizzes' | 'doubts' | 'certificates' | 'bookmarks'
  >(() => initialView || (isGuest ? 'all-batches' : 'dashboard'));

  // Sync if isGuest or initialView changes
  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView);
    } else if (isGuest && currentView === 'dashboard') {
      setCurrentView('all-batches');
    }
  }, [initialView, isGuest]);

  // Hierarchical Learning Flow State inside "My Batches"
  // Step 1: select batch -> Step 2: select subject -> Step 3: select chapter -> Step 4: chapter materials [Lectures | Notes | Model Paper]
  const [selectedMyBatch, setSelectedMyBatch] = useState<Batch | null>(null);
  const [selectedMySubject, setSelectedMySubject] = useState<BatchSubject | null>(null);
  const [selectedMyChapter, setSelectedMyChapter] = useState<ChapterItem | null>(null);
  const [chapterActiveTab, setChapterActiveTab] = useState<'lectures' | 'notes' | 'modelPapers'>('lectures');

  // Video Player state inside Chapter detail
  const [activePlayerVideo, setActivePlayerVideo] = useState<RecordedVideo | null>(null);
  const [videoQuality, setVideoQuality] = useState<'360p' | '480p' | '720p' | '1080p'>('720p');
  const [isLowDataMode, setIsLowDataMode] = useState<boolean>(false);

  // 1. Smart Progress Tracker State & Analytics
  const [studentProgress, setStudentProgress] = useState<StudentProgress>({
    studentId: student.id,
    completedLectureIds: ['rec-1', 'rec-2'],
    completedNoteIds: ['note-m1', 'note-m8'],
    completedChapterIds: ['ch-m-1'],
    overallPercentage: 42,
    totalHoursLogged: 48,
    lastUpdated: 'Today',
    subjectBreakdown: { 'Mathematics': 65, 'Science': 50, 'English': 35 }
  });

  // Fetch student progress from backend on mount
  useEffect(() => {
    if (!isGuest && student.id) {
      fetch(`/api/students/${student.id}/progress`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setStudentProgress(data.data);
          }
        })
        .catch(() => {});
    }
  }, [student.id, isGuest]);

  const handleToggleProgressItem = async (itemId: string, itemType: 'lecture' | 'note' | 'chapter') => {
    // Optimistic local update
    setStudentProgress((prev) => {
      let newLectureIds = [...prev.completedLectureIds];
      let newNoteIds = [...prev.completedNoteIds];
      let newChapterIds = [...prev.completedChapterIds];
      let hours = prev.totalHoursLogged;

      if (itemType === 'lecture') {
        if (newLectureIds.includes(itemId)) {
          newLectureIds = newLectureIds.filter((id) => id !== itemId);
        } else {
          newLectureIds.push(itemId);
          hours += 1;
        }
      } else if (itemType === 'note') {
        if (newNoteIds.includes(itemId)) {
          newNoteIds = newNoteIds.filter((id) => id !== itemId);
        } else {
          newNoteIds.push(itemId);
        }
      } else if (itemType === 'chapter') {
        if (newChapterIds.includes(itemId)) {
          newChapterIds = newChapterIds.filter((id) => id !== itemId);
        } else {
          newChapterIds.push(itemId);
        }
      }

      const totalItems = newLectureIds.length + newNoteIds.length + (newChapterIds.length * 2);
      const overallPercentage = Math.min(100, Math.round((totalItems / 16) * 100));

      return {
        ...prev,
        completedLectureIds: newLectureIds,
        completedNoteIds: newNoteIds,
        completedChapterIds: newChapterIds,
        overallPercentage,
        totalHoursLogged: hours,
        lastUpdated: 'Just now'
      };
    });

    try {
      await fetch(`/api/students/${student.id}/progress/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, itemType })
      });
    } catch (e) {
      console.error('Progress sync error', e);
    }
  };

  // 2. Smart Bookmarking & Quick Revision State
  const [bookmarks, setBookmarks] = useState<StudentBookmark[]>([
    {
      id: 'bmk-1',
      studentId: student.id,
      type: 'video_timestamp',
      title: 'sin²θ + cos²θ = 1 Identity Geometric & Algebraic Proof',
      batchName: 'Prarambh Batch',
      subjectName: 'Mathematics',
      chapterTitle: 'Chapter 8: Introduction to Trigonometry',
      targetId: 'rec-1',
      timestamp: '14:20',
      noteText: 'Frequent 5-mark board question step. Remember Pythagorean substitution.',
      createdAt: '22 Oct 2026'
    },
    {
      id: 'bmk-2',
      studentId: student.id,
      type: 'note_page',
      title: 'Euclid Division Algorithm & Fundamental Theorem Formula Cheat Sheet',
      batchName: 'Prarambh Batch',
      subjectName: 'Mathematics',
      chapterTitle: 'Chapter 1: Real Numbers',
      targetId: 'note-m1',
      pageNumber: 3,
      noteText: 'Key formula: HCF(a,b) × LCM(a,b) = a × b.',
      createdAt: '23 Oct 2026'
    },
    {
      id: 'bmk-3',
      studentId: student.id,
      type: 'chapter_topic',
      title: 'Double Circulation & Heart Chambers Schematic Diagram',
      batchName: 'Prarambh Batch',
      subjectName: 'Science',
      chapterTitle: 'Chapter 6: Life Processes',
      targetId: 'note-s6',
      noteText: 'High probability 4-mark diagram question for Board examination.',
      createdAt: '24 Oct 2026'
    }
  ]);
  const [selectedBookmarkFilter, setSelectedBookmarkFilter] = useState<string>('all');
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [bookmarkModalData, setBookmarkModalData] = useState<{
    type: 'video_timestamp' | 'note_page' | 'chapter_topic';
    title: string;
    targetId: string;
    timestamp?: string;
    pageNumber?: number;
    batchName?: string;
    subjectName?: string;
    chapterTitle?: string;
  } | null>(null);
  const [bookmarkCustomNote, setBookmarkCustomNote] = useState('');

  // Fetch bookmarks from backend on mount
  useEffect(() => {
    if (!isGuest && student.id) {
      fetch(`/api/students/${student.id}/bookmarks`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setBookmarks(data.data);
          }
        })
        .catch(() => {});
    }
  }, [student.id, isGuest]);

  const handleSaveBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookmarkModalData) return;

    const newBmk: StudentBookmark = {
      id: `bmk-${Date.now()}`,
      studentId: student.id,
      type: bookmarkModalData.type,
      title: bookmarkModalData.title,
      batchName: bookmarkModalData.batchName || selectedMyBatch?.name || 'Class 10',
      subjectName: bookmarkModalData.subjectName || selectedMySubject?.name || 'General',
      chapterTitle: bookmarkModalData.chapterTitle || selectedMyChapter?.title || 'General',
      targetId: bookmarkModalData.targetId,
      timestamp: bookmarkModalData.timestamp,
      pageNumber: bookmarkModalData.pageNumber,
      noteText: bookmarkCustomNote,
      createdAt: 'Today'
    };

    setBookmarks((prev) => [newBmk, ...prev]);
    setIsBookmarkModalOpen(false);
    setBookmarkCustomNote('');
    setBookmarkModalData(null);

    try {
      await fetch(`/api/students/${student.id}/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBmk)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBookmark = async (bmkId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== bmkId));
    try {
      await fetch(`/api/students/${student.id}/bookmarks/${bmkId}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Inline Doubt Engine State for Chapter & Lecture
  const [inlineDoubtTitle, setInlineDoubtTitle] = useState('');
  const [inlineDoubtDesc, setInlineDoubtDesc] = useState('');
  const [inlineDoubtPhoto, setInlineDoubtPhoto] = useState<string | null>(null);
  const [inlineDoubtAiEnabled, setInlineDoubtAiEnabled] = useState(true);
  const [isSubmittingInlineDoubt, setIsSubmittingInlineDoubt] = useState(false);
  const [inlineDoubtSuccess, setInlineDoubtSuccess] = useState(false);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);

  const handleInlinePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInlineDoubtPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitInlineDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineDoubtTitle.trim() || !inlineDoubtDesc.trim()) return;

    setIsSubmittingInlineDoubt(true);
    const doubtPayload = {
      title: inlineDoubtTitle,
      description: inlineDoubtDesc,
      subject: selectedMySubject?.name || 'Mathematics',
      chapter: selectedMyChapter?.title || 'General Concepts',
      batchId: selectedMyBatch?.id || student.batchId || 'b-10-math',
      batchName: selectedMyBatch?.name || student.batchName || 'Class 10 Mathematics',
      photoUrl: inlineDoubtPhoto || undefined,
      lectureTitle: activePlayerVideo?.title || selectedMyChapter?.title,
      videoTimestamp: activePlayerVideo ? '12:30' : undefined,
      requestAiSolution: inlineDoubtAiEnabled
    };

    if (onAddDoubt) {
      await onAddDoubt(doubtPayload);
    } else {
      await fetch('/api/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...doubtPayload,
          studentId: student.id,
          studentName: student.name,
          studentRollNumber: student.rollNumber
        })
      });
    }

    setIsSubmittingInlineDoubt(false);
    setInlineDoubtSuccess(true);
    setInlineDoubtTitle('');
    setInlineDoubtDesc('');
    setInlineDoubtPhoto(null);
    setTimeout(() => setInlineDoubtSuccess(false), 4000);
  };

  // 4. Digital Payment Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt | null>(null);

  // Public / Explore flow state
  const [exploreBatch, setExploreBatch] = useState<Batch | null>(null);
  const [checkoutTarget, setCheckoutTarget] = useState<{
    batch: Batch;
    subject?: BatchSubject;
    price: number;
    duration: string;
  } | null>(null);

  // Editable Price Modal State
  const [priceEditingBatch, setPriceEditingBatch] = useState<{
    id: string;
    name: string;
    monthlyFee: number;
    fullBatchPrice: number;
    duration: string;
  } | null>(null);
  const [tempMonthlyFee, setTempMonthlyFee] = useState<number>(2500);
  const [tempFullPrice, setTempFullPrice] = useState<number>(9999);

  // Checkout form fields
  const [checkoutName, setCheckoutName] = useState(student.name || '');
  const [checkoutEmail, setCheckoutEmail] = useState(student.email || '');
  const [checkoutPhone, setCheckoutPhone] = useState(student.phone || '');
  const [checkoutPassword, setCheckoutPassword] = useState('student123');
  const [checkoutUtr, setCheckoutUtr] = useState('');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutSuccessMessage, setCheckoutSuccessMessage] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  // Completion Tracking & Simulation State for Digital Certificates
  const [isSimulatedComplete, setIsSimulatedComplete] = useState(false);
  const [sampleCertModalOpen, setSampleCertModalOpen] = useState(false);

  // Live Test Popup alert state
  const [isLiveTestAlertDismissed, setIsLiveTestAlertDismissed] = useState(false);

  // Notice board tab filter
  const [noticeFilter, setNoticeFilter] = useState<'all' | 'urgent' | 'exams'>('all');

  // Countdown timer for next live class
  const [countdownString, setCountdownString] = useState('00h 42m 15s');

  useEffect(() => {
    let secs = 2535;
    const interval = setInterval(() => {
      secs = Math.max(0, secs - 1);
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      setCountdownString(
        `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s
          .toString()
          .padStart(2, '0')}s`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute student purchased batches
  const purchasedBatchIds = student.purchasedBatchIds || (student.batchId ? [student.batchId] : []);
  const purchasedBatches = allBatches.filter((b) =>
    purchasedBatchIds.includes(b.id) ||
    (student.batchId && (b.id === student.batchId || b.name.toLowerCase().includes('class 10')))
  );

  // Strictly live quizzes that have NOT been submitted yet by this student
  // Strict Quiz Visibility Rule: Only appear with 'LIVE' tag when explicitly scheduled & activated by teacher.
  // Once submitted by the student, automatically disappear from their active live assessment list.
  const studentSubmittedQuizIds = new Set(submissions.filter((s) => s.studentId === student.id).map((s) => s.quizId));
  const liveUnsubmittedQuizzes = !isGuest ? quizzes.filter((q) => q.isLive && !studentSubmittedQuizIds.has(q.id)) : [];
  const hasActiveQuiz = liveUnsubmittedQuizzes.length > 0;
  const activeQuiz = liveUnsubmittedQuizzes[0] || null;

  // Notice filtering
  const filteredAnnouncements = announcements.filter((a) => {
    if (noticeFilter === 'urgent') return a.priority === 'urgent';
    if (noticeFilter === 'exams')
      return (
        a.title.toLowerCase().includes('exam') ||
        a.title.toLowerCase().includes('test') ||
        a.content.toLowerCase().includes('exam')
      );
    return true;
  });

  // Guard for protected sections
  const handleProtectedAccess = (viewTarget: 'my-batches' | 'dashboard' | 'quizzes' | 'doubts' | 'bookmarks') => {
    if (isGuest) {
      if (onRequireAuth) {
        onRequireAuth('Please Login or Register to Access Enrolled Courses');
      } else if (onOpenStudentAuth) {
        onOpenStudentAuth();
      }
      return;
    }
    setCurrentView(viewTarget);
  };

  // Helper: Open Checkout for batch or subject
  const handleOpenCheckout = (targetBatch: Batch, targetSubject?: BatchSubject) => {
    const price = targetSubject
      ? targetSubject.price
      : targetBatch.fullBatchPrice || targetBatch.monthlyFee || 2500;
    const duration = targetSubject?.duration || targetBatch.duration || '1 Year';
    setCheckoutTarget({
      batch: targetBatch,
      subject: targetSubject,
      price,
      duration
    });
    setCheckoutSuccessMessage(null);
    setCheckoutUtr('');
    setCurrentView('checkout');
  };

  // Helper: Process Course Checkout & 1-Year Access
  const handleConfirmCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutTarget) return;

    setIsProcessingCheckout(true);
    try {
      const txRef = checkoutUtr || `UPI-UTR-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      const payload = {
        studentId: student.id,
        studentName: checkoutName || student.name,
        studentEmail: checkoutEmail || student.email,
        studentPhone: checkoutPhone || student.phone,
        password: checkoutPassword,
        batchId: checkoutTarget.batch.id,
        subjectId: checkoutTarget.subject?.id,
        pricePaid: checkoutTarget.price,
        paymentMode: 'UPI' as const,
        transactionRef: txRef
      };

      let resData: any = null;
      if (onCourseCheckout) {
        const res = await onCourseCheckout(payload);
        resData = res?.data;
      } else {
        const res = await fetch('/api/courses/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        resData = json?.data;
      }

      // Generate or retrieve digital receipt
      const expiryDate = getOneYearExpiryString();
      const generatedReceipt: PaymentReceipt = resData?.receipt || {
        id: `rcpt-${Date.now()}`,
        receiptNumber: `AA-REC-${Math.floor(100000 + Math.random() * 900000)}`,
        enrollmentId: `enr-${Date.now()}`,
        studentId: student.id,
        studentName: payload.studentName,
        studentEmail: payload.studentEmail,
        studentPhone: payload.studentPhone,
        batchId: payload.batchId,
        batchName: checkoutTarget.batch.name,
        subjectId: payload.subjectId,
        subjectName: checkoutTarget.subject?.name,
        amount: payload.pricePaid,
        paymentMode: 'UPI',
        transactionRef: txRef,
        paymentDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        accessValidUntil: expiryDate,
        status: 'success',
        generatedCredentials: {
          email: payload.studentEmail,
          password: payload.password
        },
        directAccessUrl: `https://anushree-academy.edu/portal?batch=${payload.batchId}&student=${student.id}`
      };

      // Auto-update student locally
      if (!student.purchasedBatchIds) student.purchasedBatchIds = [];
      if (!student.purchasedBatchIds.includes(checkoutTarget.batch.id)) {
        student.purchasedBatchIds.push(checkoutTarget.batch.id);
      }
      if (checkoutTarget.subject) {
        if (!student.purchasedSubjectIds) student.purchasedSubjectIds = [];
        if (!student.purchasedSubjectIds.includes(checkoutTarget.subject.id)) {
          student.purchasedSubjectIds.push(checkoutTarget.subject.id);
        }
      }

      // Also submit purchase request to /api/purchase-requests for Admin verification & WhatsApp dispatch
      try {
        await fetch('/api/purchase-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: student.id,
            studentName: payload.studentName,
            studentEmail: payload.studentEmail,
            studentPhone: payload.studentPhone,
            batchId: payload.batchId,
            subjectId: payload.subjectId,
            amount: payload.pricePaid,
            paymentMode: 'UPI',
            transactionRef: txRef
          })
        });
      } catch {}

      // Show Instant Official Payment Receipt Modal
      setActiveReceipt(generatedReceipt);
      setCheckoutSuccessMessage(
        `Payment UTR submitted! Your enrollment request for ${
          checkoutTarget.subject ? checkoutTarget.subject.name : checkoutTarget.batch.name
        } is verified and pending activation. You will receive an official welcome confirmation on WhatsApp (+91).`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Price Editing Handler
  const handleOpenPriceEditor = (b: Batch, e: React.MouseEvent) => {
    e.stopPropagation();
    setPriceEditingBatch({
      id: b.id,
      name: b.name,
      monthlyFee: b.monthlyFee || 2500,
      fullBatchPrice: b.fullBatchPrice || 9999,
      duration: b.duration || '1 Year'
    });
    setTempMonthlyFee(b.monthlyFee || 2500);
    setTempFullPrice(b.fullBatchPrice || 9999);
  };

  const handleSavePriceEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceEditingBatch) return;

    if (onUpdateBatch) {
      onUpdateBatch(priceEditingBatch.id, {
        monthlyFee: Number(tempMonthlyFee),
        fullBatchPrice: Number(tempFullPrice)
      });
    }

    // Also update batch object directly in memory
    const target = allBatches.find((b) => b.id === priceEditingBatch.id);
    if (target) {
      target.monthlyFee = Number(tempMonthlyFee);
      target.fullBatchPrice = Number(tempFullPrice);
    }

    setPriceEditingBatch(null);
  };

  // Copy UPI ID helper
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(academy.upiId || 'anushreeacademy@upi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Automated 1-Year Expiration Date calculation string
  const getOneYearExpiryString = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP BANNER: GUEST BANNER vs AUTHENTICATED STUDENT WELCOME BANNER
         ========================================================================= */}
      {isGuest ? (
        /* GUEST / UNREGISTERED VISITOR HERO BANNER */
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-teal-700/50">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/50 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  Public Course Store • Guest Mode
                </span>
                <span className="text-[11px] font-bold text-teal-200 bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-700">
                  Academic Year 2026-27
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome to {academy.name} Course Catalog
              </h1>
              <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-medium">
                Shape your future with top educators, live interactive classes, and complete board exam preparation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => {
                  if (onRequireAuth) {
                    onRequireAuth('Please Login or Register to Access Enrolled Courses');
                  } else if (onOpenStudentAuth) {
                    onOpenStudentAuth();
                  }
                }}
                className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-teal-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-teal-950" />
                <span>Student Login / Register</span>
              </button>

              <button
                onClick={() => {
                  if (onRequireAuth) {
                    onRequireAuth('Please Login or Register to Access Enrolled Courses');
                  } else if (onOpenStudentAuth) {
                    onOpenStudentAuth();
                  }
                }}
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 border border-white/20 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>My Batches (Enrolled)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* LOGGED-IN STUDENT PERSONALIZED WELCOME BANNER (NO ROLL NUMBER!) */
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-teal-700/50">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md text-amber-300 font-serif font-black text-2xl flex items-center justify-center border-2 border-white/20 shadow-md">
                {student.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-200 bg-teal-950/70 px-2.5 py-0.5 rounded-full border border-teal-700">
                    {student.batchName}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-300 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Validated Student Account
                  </span>
                  {reportCard && (
                    <span className="text-xs font-black text-amber-300 bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-700">
                      Grade: {reportCard.grade}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
                  Welcome back, {student.name}!
                </h1>
                <p className="text-xs text-teal-200 mt-0.5">
                  {academy.name} Portal • Academic Year 2026-27 • 1-Year Comprehensive Access Active
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setCurrentView('bookmarks')}
                className={`px-4 py-2 rounded-2xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentView === 'bookmarks'
                    ? 'bg-amber-400 text-teal-950 font-black shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <Bookmark className="w-4 h-4 text-amber-300" />
                <span>Revision Bookmarks</span>
                <span className="text-[10px] font-black bg-amber-400 text-teal-950 px-1.5 py-0.2 rounded-full">
                  {bookmarks.length}
                </span>
              </button>

              <button
                onClick={() => setCurrentView('doubts')}
                className={`px-4 py-2 rounded-2xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentView === 'doubts'
                    ? 'bg-amber-400 text-teal-950 font-black shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-teal-300" />
                <span>Doubt Counter</span>
              </button>

              <button
                onClick={() => setCurrentView('certificates')}
                className={`px-4 py-2 rounded-2xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentView === 'certificates'
                    ? 'bg-amber-400 text-teal-950 font-black shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>My Certificates</span>
              </button>

              {reportCard && onOpenReportCard && (
                <button
                  onClick={onOpenReportCard}
                  className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>My Report Card</span>
                </button>
              )}

              <button
                onClick={() => onJoinLiveClass(student.batchId)}
                className="px-5 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-teal-950 font-black text-xs shadow-md flex items-center gap-2 transition-all transform hover:scale-105 cursor-pointer"
              >
                <Video className="w-4 h-4 text-teal-950" />
                <span>{isLiveActive ? 'Join Ongoing Class' : 'Live Classroom'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PROMINENT ACTIVE TEST & QUIZ ALERT (BLINKING) ================= */}
      {!isGuest && hasActiveQuiz && !isLiveTestAlertDismissed && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-4 sm:p-5 shadow-xl shadow-red-900/20 border-2 border-red-400 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Blinking Live Indicator */}
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-2xl bg-red-400 opacity-60 animate-ping"></span>
                <HelpCircle className="w-6 h-6 text-white" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-white text-red-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                    <span>LIVE TEST ACTIVE</span>
                  </span>
                  <span className="text-xs font-extrabold text-red-100">
                    {activeQuiz.subject} • {activeQuiz.chapterName}
                  </span>
                </div>
                <h3 className="text-base font-black mt-0.5 text-white">
                  {activeQuiz.title} ({activeQuiz.totalMarks} Marks • {activeQuiz.timeLimitMinutes} Mins)
                </h3>
                <p className="text-xs text-red-100/90">
                  Real-time board assessment. Attempt now to receive instant automated evaluation and report card remarks.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
              <button
                onClick={() => setCurrentView('quizzes')}
                className="px-5 py-2.5 rounded-2xl bg-white text-red-700 hover:bg-red-50 font-black text-xs shadow-md transition-all transform hover:scale-105 cursor-pointer flex items-center gap-1.5"
              >
                <span>Take Live Test Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsLiveTestAlertDismissed(true)}
                className="p-2 rounded-2xl text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-NAVIGATION BREADCRUMB BAR ================= */}
      {currentView !== 'dashboard' && currentView !== 'all-batches' && (
        <div className="flex items-center justify-between pb-2 border-b border-teal-100 dark:border-slate-800">
          <button
            onClick={() => {
              if (selectedMyChapter) {
                setSelectedMyChapter(null);
              } else if (selectedMySubject) {
                setSelectedMySubject(null);
              } else if (selectedMyBatch) {
                setSelectedMyBatch(null);
              } else {
                setCurrentView(isGuest ? 'all-batches' : 'dashboard');
              }
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-teal-800 dark:text-teal-300 hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {selectedMyChapter
                ? `Back to ${selectedMySubject?.name || 'Chapters'}`
                : selectedMySubject
                ? `Back to ${selectedMyBatch?.name || 'Subjects'}`
                : selectedMyBatch
                ? 'Back to My Batches'
                : isGuest
                ? 'Back to All Batches'
                : 'Back to Dashboard'}
            </span>
          </button>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span
              onClick={() => {
                setSelectedMyBatch(null);
                setSelectedMySubject(null);
                setSelectedMyChapter(null);
                setCurrentView(isGuest ? 'all-batches' : 'dashboard');
              }}
              className="cursor-pointer hover:text-teal-900"
            >
              {isGuest ? 'All Batches' : 'Dashboard'}
            </span>
            <span>/</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {currentView === 'my-batches'
                ? selectedMyChapter
                  ? selectedMyChapter.title
                  : selectedMySubject
                  ? selectedMySubject.name
                  : selectedMyBatch
                  ? selectedMyBatch.name
                  : 'My Batches'
                : currentView === 'batch-overview'
                ? exploreBatch?.name || 'Batch Details'
                : currentView === 'checkout'
                ? 'Course Checkout'
                : currentView === 'quizzes'
                ? 'Online Assessments'
                : 'Student Hub'}
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 1: AUTHENTICATED STUDENT DASHBOARD
          FEATURES ONLY TWO PRIMARY CARDS: "MY BATCHES" AND "ALL BATCHES"
          PLUS PROMINENT "ACADEMY NOTICE BOARD" DIRECTLY ON DASHBOARD
         ========================================================================= */}
      {!isGuest && currentView === 'dashboard' && (
        <div className="space-y-6">
          
          {/* THE TWO PRIMARY CARDS AS EXPLICITLY REQUIRED */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* PRIMARY CARD 1: "MY BATCHES" */}
            <div
              onClick={() => {
                setSelectedMyBatch(null);
                setSelectedMySubject(null);
                setSelectedMyChapter(null);
                setCurrentView('my-batches');
              }}
              className="group relative overflow-hidden rounded-3xl p-7 bg-white dark:bg-slate-900 border-2 border-teal-200/80 dark:border-teal-800/60 shadow-lg hover:shadow-2xl hover:border-teal-600 transition-all cursor-pointer flex flex-col justify-between min-h-[220px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-teal-800 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <BookOpen className="w-7 h-7 text-amber-300" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                    {purchasedBatches.length} Enrolled
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-teal-800 dark:group-hover:text-teal-300 transition-colors">
                    My Batches
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Access your enrolled courses, subjects, chapter video archives, high-yield PDF notes, and model question papers with step-by-step solutions.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-teal-800 dark:text-teal-400 group-hover:underline">
                  Open Learning Portal →
                </span>
                <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-teal-800 group-hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* PRIMARY CARD 2: "ALL BATCHES" */}
            <div
              onClick={() => {
                setExploreBatch(null);
                setCurrentView('all-batches');
              }}
              className="group relative overflow-hidden rounded-3xl p-7 bg-white dark:bg-slate-900 border-2 border-indigo-200/80 dark:border-indigo-800/60 shadow-lg hover:shadow-2xl hover:border-indigo-600 transition-all cursor-pointer flex flex-col justify-between min-h-[220px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Sparkles className="w-7 h-7 text-amber-300" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                    Explore Store
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                    All Batches
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Explore all available foundation and board preparation batches (Prarambh, Abhyas, Sankalp) with detailed subject syllabus, durations, and dynamic UPI QR checkout.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 group-hover:underline">
                  Browse All Courses ({allBatches.length}) →
                </span>
                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-700 group-hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

          </div>

          {/* ================= SMART PROGRESS TRACKER & STUDY ANALYTICS CARD ================= */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-teal-100 dark:border-slate-800 shadow-lg space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-200 dark:border-teal-800">
                  <TrendingUp className="w-6 h-6 text-teal-800 dark:text-teal-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Smart Study Progress & Analytics
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Live Dynamic Tracking
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time syllabus completion updated instantly as you finish recorded lectures and chapter notes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto bg-teal-50 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-teal-100 dark:border-slate-700">
                <div className="text-right">
                  <span className="text-2xl font-black text-teal-900 dark:text-teal-200">
                    {studentProgress.overallPercentage}%
                  </span>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                    Syllabus Completed
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Syllabus Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-slate-700 dark:text-slate-300">
                  Overall Academic Progress
                </span>
                <span className="font-mono font-bold text-teal-800 dark:text-teal-300">
                  {studentProgress.overallPercentage}% Finished
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-600 via-emerald-500 to-amber-500 transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.max(8, studentProgress.overallPercentage)}%` }}
                />
              </div>
              <div className="flex flex-wrap justify-between items-center text-[11px] text-slate-500 gap-2 pt-1 font-medium">
                <span className="flex items-center gap-1">
                  <Film className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                  <strong>{studentProgress.completedLectureIds.length}</strong> Lectures Finished
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                  <strong>{studentProgress.completedNoteIds.length}</strong> Notes Read
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <strong>{studentProgress.totalHoursLogged} Hours</strong> Logged
                </span>
                <span className="text-[10px] text-slate-400">
                  Last updated: {studentProgress.lastUpdated}
                </span>
              </div>
            </div>

            {/* Subject Breakdown Progress Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-teal-50/50 dark:bg-slate-800/60 border border-teal-100 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">Mathematics</span>
                  <span className="font-mono font-bold text-teal-800 dark:text-teal-300">
                    {studentProgress.subjectBreakdown?.Mathematics || 65}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-teal-200/50 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-700"
                    style={{ width: `${studentProgress.subjectBreakdown?.Mathematics || 65}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1.5">Trigonometry & Real Numbers active</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">Science</span>
                  <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                    {studentProgress.subjectBreakdown?.Science || 50}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-indigo-200/50 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600"
                    style={{ width: `${studentProgress.subjectBreakdown?.Science || 50}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1.5">Gravitation & Life Processes</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-slate-800/60 border border-purple-100 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">English Grammar</span>
                  <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                    {studentProgress.subjectBreakdown?.English || 35}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-purple-200/50 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-600"
                    style={{ width: `${studentProgress.subjectBreakdown?.English || 35}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1.5">Tenses & Active-Passive Voice</span>
              </div>
            </div>
          </div>

          {/* ================= PROMINENT ACADEMY NOTICE BOARD ================= */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-teal-100 dark:border-slate-800 shadow-lg space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-300/40">
                  <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Academy Notice Board
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse">
                      Urgent Alerts Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Official announcements, board mock exam notifications, and faculty bulletins.
                  </p>
                </div>
              </div>

              {/* Notice Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold self-start sm:self-auto">
                <button
                  onClick={() => setNoticeFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    noticeFilter === 'all'
                      ? 'bg-white dark:bg-slate-900 text-teal-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({announcements.length})
                </button>
                <button
                  onClick={() => setNoticeFilter('urgent')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                    noticeFilter === 'urgent'
                      ? 'bg-red-500 text-white shadow-xs'
                      : 'text-red-600 hover:text-red-700'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Urgent</span>
                </button>
                <button
                  onClick={() => setNoticeFilter('exams')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    noticeFilter === 'exams'
                      ? 'bg-white dark:bg-slate-900 text-teal-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Exam Schedules
                </button>
              </div>
            </div>

            {/* Notice Cards Feed */}
            <div className="space-y-3.5">
              {filteredAnnouncements.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  No notices found in this category.
                </div>
              ) : (
                filteredAnnouncements.map((ann) => {
                  const isUrgent = ann.priority === 'urgent';
                  return (
                    <div
                      key={ann.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                        isUrgent
                          ? 'bg-gradient-to-r from-red-50 to-amber-50/50 dark:from-red-950/30 dark:to-slate-900 border-red-200 dark:border-red-900 shadow-xs'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {isUrgent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-xs animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              URGENT NOTICE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300">
                              <Pin className="w-3 h-3" />
                              ANNOUNCEMENT
                            </span>
                          )}

                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            Target: {ann.targetBatch}
                          </span>

                          <span className="text-[11px] text-slate-400 font-mono">
                            {ann.createdAt}
                          </span>
                        </div>

                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white pt-0.5">
                          {ann.title}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {ann.content}
                        </p>
                      </div>

                      {ann.targetBatch.toLowerCase().includes('class 10') && (
                        <button
                          onClick={() => {
                            setSelectedMyBatch(null);
                            setSelectedMySubject(null);
                            setSelectedMyChapter(null);
                            setCurrentView('my-batches');
                          }}
                          className="shrink-0 px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1 cursor-pointer self-start"
                        >
                          <span>Open Batch</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-2">
              <Megaphone className="w-3.5 h-3.5 text-teal-700" />
              <span>Broadcasts verified by Teacher Sarla Sharma & Administration</span>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 2: SECURE "MY BATCHES" HIERARCHICAL LEARNING FLOW
          Step 1: Batch List -> Step 2: Subject List -> Step 3: Chapter List -> Step 4: [Lectures | Notes | Model Paper]
         ========================================================================= */}
      {currentView === 'my-batches' && (
        <div className="space-y-6">
          
          {/* Breadcrumb Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {selectedMyChapter
                  ? `${selectedMyChapter.title}`
                  : selectedMySubject
                  ? `${selectedMySubject.name} Chapters`
                  : selectedMyBatch
                  ? `${selectedMyBatch.name} Subjects`
                  : 'My Enrolled Batches'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedMyChapter
                  ? 'Access recorded lectures, revision notes, and model papers for this chapter.'
                  : selectedMySubject
                  ? 'Select any chapter below to explore complete learning materials.'
                  : selectedMyBatch
                  ? 'Select a subject to begin studying.'
                  : 'Courses you have successfully purchased with 1-Year access.'}
              </p>
            </div>

            {selectedMyBatch && !selectedMySubject && (
              <button
                onClick={() => setSelectedMyBatch(null)}
                className="text-xs font-bold text-teal-800 dark:text-teal-300 hover:underline cursor-pointer"
              >
                ← Switch Batch
              </button>
            )}
          </div>

          {/* STEP 1: LIST MY PURCHASED BATCHES */}
          {!selectedMyBatch && (
            <div className="space-y-4">
              {purchasedBatches.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-teal-100 dark:border-slate-800 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-slate-800 text-teal-800 dark:text-teal-300 flex items-center justify-center mx-auto">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      No Active Batch Purchases Found
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      You haven't enrolled in any batch yet. Explore our comprehensive board prep batches in the catalog and unlock courses with instant UPI payment.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentView('all-batches')}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-teal-800 text-white hover:bg-teal-900 cursor-pointer shadow-md"
                  >
                    Explore All Batches
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {purchasedBatches.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => {
                        setSelectedMyBatch(b);
                        setSelectedMySubject(null);
                        setSelectedMyChapter(null);
                      }}
                      className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-teal-100 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-teal-600 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        {b.coverImage && (
                          <div className="relative h-44 overflow-hidden bg-slate-900">
                            <img
                              src={b.coverImage}
                              alt={b.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                            <span className="absolute top-3 left-3 bg-teal-800 text-white font-extrabold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm">
                              Enrolled (1 Year Access)
                            </span>
                          </div>
                        )}

                        <div className="p-5 space-y-2">
                          <span className="text-[10px] font-black uppercase text-teal-800 dark:text-teal-300">
                            {b.grade}
                          </span>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-teal-800 transition-colors">
                            {b.name}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                            {b.description || 'Comprehensive curriculum with video lectures, notes, and model papers.'}
                          </p>
                        </div>
                      </div>

                      <div className="p-5 pt-0">
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            {b.subjects?.length || 4} Subjects Available
                          </span>
                          <span className="font-bold text-teal-800 dark:text-teal-300 group-hover:underline">
                            Enter Course →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SELECT ENROLLED SUBJECT (Inside Selected Batch) */}
          {selectedMyBatch && !selectedMySubject && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(selectedMyBatch.subjects || []).map((sub) => {
                  const isPurchased =
                    (student.purchasedSubjectIds && student.purchasedSubjectIds.includes(sub.id)) ||
                    (student.purchasedBatchIds && student.purchasedBatchIds.includes(selectedMyBatch.id));

                  return (
                    <div
                      key={sub.id}
                      onClick={() => {
                        if (isPurchased) {
                          setSelectedMySubject(sub);
                          setSelectedMyChapter(null);
                        } else {
                          handleOpenCheckout(selectedMyBatch, sub);
                        }
                      }}
                      className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between ${
                        isPurchased
                          ? 'bg-white dark:bg-slate-900 border-teal-100 dark:border-slate-800 shadow-md hover:border-teal-600 hover:shadow-xl'
                          : 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-90'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-slate-800 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold">
                            <BookMarked className="w-6 h-6" />
                          </div>
                          {isPurchased ? (
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Unlocked ✓
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Locked
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-lg font-black text-slate-900 dark:text-white">
                            {sub.name}
                          </h4>
                          <span className="text-[11px] text-teal-800 dark:text-teal-400 font-bold block mt-0.5">
                            Teacher: {sub.teacherName}
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                            {sub.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          {sub.chapters?.length || 4} Chapters
                        </span>
                        {isPurchased ? (
                          <span className="font-bold text-teal-800 dark:text-teal-300 hover:underline">
                            View Chapters →
                          </span>
                        ) : (
                          <span className="font-bold text-amber-700 dark:text-amber-400">
                            Unlock for ₹{sub.price} →
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: SELECT CHAPTER (Inside Selected Subject) */}
          {selectedMyBatch && selectedMySubject && !selectedMyChapter && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  {selectedMySubject.chapters?.length || 0} Chapters in {selectedMySubject.name}
                </span>
                <span className="text-xs text-teal-800 dark:text-teal-300 font-bold">
                  {selectedMyBatch.name}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(selectedMySubject.chapters || []).map((ch, idx) => (
                  <div
                    key={ch.id}
                    onClick={() => {
                      setSelectedMyChapter(ch);
                      setChapterActiveTab('lectures');
                    }}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-slate-800 shadow-sm hover:border-teal-600 hover:shadow-lg transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center font-black text-sm shrink-0">
                        {ch.chapterNumber || idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {ch.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {ch.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-medium">
                          <span>{ch.lectures?.length || 2} Lectures</span>
                          <span>•</span>
                          <span>{ch.notes?.length || 2} Notes</span>
                          <span>•</span>
                          <span>{ch.modelPapers?.length || 2} Model Papers</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-teal-800 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: CHAPTER DETAIL PAGE WITH THE 3 DISTINCT TABS
              [Recorded Lectures | Notes | Model Paper] */}
          {selectedMyBatch && selectedMySubject && selectedMyChapter && (
            <div className="space-y-6">
              
              {/* TOP HERO NAVIGATION BAR WITH 3 DISTINCT TABS */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-teal-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChapterActiveTab('lectures')}
                    className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      chapterActiveTab === 'lectures'
                        ? 'bg-teal-800 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Film className="w-4 h-4" />
                    <span>Recorded Lectures ({selectedMyChapter.lectures?.length || 2})</span>
                  </button>

                  <button
                    onClick={() => setChapterActiveTab('notes')}
                    className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      chapterActiveTab === 'notes'
                        ? 'bg-teal-800 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Notes ({selectedMyChapter.notes?.length || 2})</span>
                  </button>

                  <button
                    onClick={() => setChapterActiveTab('modelPapers')}
                    className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      chapterActiveTab === 'modelPapers'
                        ? 'bg-teal-800 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Model Paper ({selectedMyChapter.modelPapers?.length || 2})</span>
                  </button>
                </div>
              </div>

              {/* TAB CONTENT: 1. RECORDED LECTURES */}
              {chapterActiveTab === 'lectures' && (
                <div className="space-y-6">
                  {/* Embedded Player if active */}
                  {activePlayerVideo && (
                    <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-amber-300">
                            Now Playing • {activePlayerVideo.chapterName}
                          </span>
                          <h3 className="text-base font-bold text-white mt-0.5">
                            {activePlayerVideo.title}
                          </h3>
                        </div>
                        <button
                          onClick={() => setActivePlayerVideo(null)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
                        <iframe
                          src={activePlayerVideo.videoUrl}
                          title={activePlayerVideo.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>

                      {/* Video Controls: Quality Selector, Low-Data Saver, and Smart Bookmark */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-800">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-slate-400">Resolution:</span>
                          {(['360p', '480p', '720p', '1080p'] as const).map((q) => (
                            <button
                              key={q}
                              onClick={() => setVideoQuality(q)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer ${
                                videoQuality === q ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {q}
                            </button>
                          ))}

                          <button
                            onClick={() => setIsLowDataMode(!isLowDataMode)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isLowDataMode ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            Data Saver: {isLowDataMode ? 'ON (60% Saved)' : 'OFF'}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setBookmarkModalData({
                                type: 'video_timestamp',
                                title: activePlayerVideo.title,
                                targetId: activePlayerVideo.id,
                                timestamp: '14:20',
                                batchName: selectedMyBatch?.name,
                                subjectName: selectedMySubject?.name,
                                chapterTitle: selectedMyChapter?.title
                              });
                              setIsBookmarkModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-teal-950 font-black text-xs flex items-center gap-1.5 hover:bg-amber-300 transition-all cursor-pointer shadow-xs"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Bookmark Timestamp</span>
                          </button>

                          <button
                            onClick={() => handleToggleProgressItem(activePlayerVideo.id, 'lecture')}
                            className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              studentProgress.completedLectureIds.includes(activePlayerVideo.id)
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>
                              {studentProgress.completedLectureIds.includes(activePlayerVideo.id)
                                ? 'Watched ✓'
                                : 'Mark as Watched'}
                            </span>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {activePlayerVideo.description}
                      </p>
                    </div>
                  )}

                  {/* Lectures List with Completion Checkmarks & Bookmarks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedMyChapter.lectures || []).map((lec) => {
                      const isWatched = studentProgress.completedLectureIds.includes(lec.id);
                      return (
                        <div
                          key={lec.id}
                          className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                            isWatched
                              ? 'bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-teal-100 dark:border-slate-800 shadow-sm hover:border-teal-500'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold uppercase text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                                Lecture • {lec.duration}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {isWatched && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                                    <Check className="w-3 h-3" /> Completed
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400">{lec.viewsCount} views</span>
                              </div>
                            </div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {lec.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {lec.description}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setActivePlayerVideo(lec)}
                                className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>Play Recording</span>
                              </button>

                              <button
                                onClick={() => handleToggleProgressItem(lec.id, 'lecture')}
                                title="Toggle completion checkmark"
                                className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                                  isWatched
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                <CheckSquare className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setBookmarkModalData({
                                    type: 'video_timestamp',
                                    title: lec.title,
                                    targetId: lec.id,
                                    timestamp: '10:00',
                                    batchName: selectedMyBatch?.name,
                                    subjectName: selectedMySubject?.name,
                                    chapterTitle: selectedMyChapter?.title
                                  });
                                  setIsBookmarkModalOpen(true);
                                }}
                                title="Save to Revision Bookmarks"
                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-amber-600 hover:bg-amber-50 cursor-pointer"
                              >
                                <Bookmark className="w-4 h-4" />
                              </button>
                            </div>

                            {lec.notesAttachmentUrl && (
                              <button
                                onClick={() => {
                                  const matchedNote = selectedMyChapter?.notes?.[0];
                                  if (matchedNote && onOpenSecurePdf) onOpenSecurePdf(matchedNote);
                                }}
                                className="text-xs font-bold text-teal-800 dark:text-teal-300 hover:underline flex items-center gap-1"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Lecture Notes</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: 2. HIGH-YIELD NOTES */}
              {chapterActiveTab === 'notes' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedMyChapter.notes || []).map((note) => {
                      const isRead = studentProgress.completedNoteIds.includes(note.id);
                      return (
                        <div
                          key={note.id}
                          className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                            isRead
                              ? 'bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-teal-100 dark:border-slate-800 shadow-sm hover:border-teal-500'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-teal-800 dark:text-teal-300">
                                Revision Note • {note.fileSize}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {isRead && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                                    <Check className="w-3 h-3" /> Read
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400">{note.uploadedAt}</span>
                              </div>
                            </div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {note.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {note.details}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onOpenSecurePdf && onOpenSecurePdf(note)}
                                className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview Note</span>
                              </button>

                              <button
                                onClick={() => handleToggleProgressItem(note.id, 'note')}
                                title="Mark note as completed / read"
                                className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                                  isRead
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                <CheckSquare className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setBookmarkModalData({
                                    type: 'note_page',
                                    title: note.title,
                                    targetId: note.id,
                                    pageNumber: 1,
                                    batchName: selectedMyBatch?.name,
                                    subjectName: selectedMySubject?.name,
                                    chapterTitle: selectedMyChapter?.title
                                  });
                                  setIsBookmarkModalOpen(true);
                                }}
                                title="Bookmark this note for revision"
                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-amber-600 hover:bg-amber-50 cursor-pointer"
                              >
                                <Bookmark className="w-4 h-4" />
                              </button>
                            </div>

                            <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md font-bold">
                              Watermarked
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: 3. MODEL QUESTION PAPERS */}
              {chapterActiveTab === 'modelPapers' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedMyChapter.modelPapers || []).map((paper) => {
                      const isAttempted = studentProgress.completedNoteIds.includes(paper.id);
                      return (
                        <div
                          key={paper.id}
                          className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                            isAttempted
                              ? 'bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-teal-100 dark:border-slate-800 shadow-sm hover:border-teal-500'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                                Model Paper • {paper.fileSize}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {isAttempted && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                                    <Check className="w-3 h-3" /> Solved
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400">{paper.uploadedAt}</span>
                              </div>
                            </div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {paper.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {paper.details}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onOpenSecurePdf && onOpenSecurePdf(paper)}
                                className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Model Paper & Solutions</span>
                              </button>

                              <button
                                onClick={() => handleToggleProgressItem(paper.id, 'note')}
                                title="Mark model paper as solved"
                                className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                                  isAttempted
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                <CheckSquare className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ================= ADVANCED DOUBT ENGINE (PHOTO & TEXT UPLOAD) UNDER CHAPTER ================= */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-teal-100 dark:border-slate-800 shadow-md space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold">
                      <HelpCircle className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="font-black text-base text-slate-900 dark:text-white">
                        Ask a Doubt on {selectedMyChapter.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Type questions or upload textbook photo for instant AI guidance & faculty verification.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentView('doubts')}
                    className="text-xs font-bold text-teal-800 dark:text-teal-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Academy Doubts ({doubts.length}) →</span>
                  </button>
                </div>

                {inlineDoubtSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Doubt submitted successfully! Instant AI Tutor solution has been generated below.</span>
                  </div>
                )}

                <form onSubmit={handleSubmitInlineDoubt} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Question / Concept Headline:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., How do we prove identity sin²θ + cos²θ = 1 algebraically?"
                      value={inlineDoubtTitle}
                      onChange={(e) => setInlineDoubtTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Detailed Problem / Where you are stuck:
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Describe what part of this chapter or lecture was confusing..."
                      value={inlineDoubtDesc}
                      onChange={(e) => setInlineDoubtDesc(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-teal-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white leading-relaxed"
                    />
                  </div>

                  {/* Photo / Screenshot Upload */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Attach Photo / Question Screenshot (Optional):
                    </label>
                    <input
                      type="file"
                      ref={inlineFileInputRef}
                      accept="image/*"
                      onChange={handleInlinePhotoChange}
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => inlineFileInputRef.current?.click()}
                        className="px-4 py-2 border border-dashed border-teal-300 dark:border-slate-700 rounded-xl hover:bg-teal-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold text-xs"
                      >
                        <Camera className="w-4 h-4 text-teal-800 dark:text-teal-400" />
                        <span>{inlineDoubtPhoto ? 'Change Selected Photo' : 'Upload Question Photo / Screenshot'}</span>
                      </button>

                      {inlineDoubtPhoto && (
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-teal-200">
                          <img src={inlineDoubtPhoto} alt="Upload Preview" className="w-10 h-10 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => setInlineDoubtPhoto(null)}
                            className="p-1 text-red-600 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Instant Bot Solution Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="aiSolutionCheck"
                      checked={inlineDoubtAiEnabled}
                      onChange={(e) => setInlineDoubtAiEnabled(e.target.checked)}
                      className="w-4 h-4 text-teal-800 rounded-md cursor-pointer accent-teal-800"
                    />
                    <label htmlFor="aiSolutionCheck" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Request instant AI automated solution breakdown & video solution link</span>
                    </label>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingInlineDoubt}
                      className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-2 transition-all transform hover:scale-105"
                    >
                      <HelpCircle className="w-4 h-4 text-amber-300" />
                      <span>{isSubmittingInlineDoubt ? 'Submitting Doubt...' : 'Post Doubt & Get Solution'}</span>
                    </button>
                  </div>
                </form>

                {/* List of doubts in this chapter */}
                {doubts.filter(d => d.chapter?.toLowerCase().includes(selectedMyChapter.title.toLowerCase()) || d.subject?.toLowerCase() === selectedMySubject.name.toLowerCase()).length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <h5 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider">
                      Recent Questions in {selectedMyChapter.title} ({doubts.filter(d => d.chapter?.toLowerCase().includes(selectedMyChapter.title.toLowerCase()) || d.subject?.toLowerCase() === selectedMySubject.name.toLowerCase()).length})
                    </h5>

                    <div className="space-y-3">
                      {doubts
                        .filter(d => d.chapter?.toLowerCase().includes(selectedMyChapter.title.toLowerCase()) || d.subject?.toLowerCase() === selectedMySubject.name.toLowerCase())
                        .slice(0, 3)
                        .map(d => (
                          <div key={d.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white">{d.title}</span>
                              {d.status === 'resolved' ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  Verified Solution ✓
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                                  AI Tutor Answered
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300">{d.description}</p>
                            {d.replies && d.replies.length > 0 && (
                              <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 text-slate-700 dark:text-slate-200 text-[11px] whitespace-pre-line">
                                <span className="font-bold text-purple-900 dark:text-purple-300 block mb-1">
                                  {d.replies[0].authorName}:
                                </span>
                                {d.replies[0].content}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          VIEW 3: PUBLIC / EXPLORE FLOW ("ALL BATCHES" STORE VIEW)
          Visitors can freely browse active courses (e.g. "Prarambh Batch"),
          view 5-6 line professional description, available subjects, 1-Year duration,
          and editable prices (e.g. ₹2500)
         ========================================================================= */}
      {currentView === 'all-batches' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  All Batches & Active Courses
                </h2>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-slate-700">
                  {allBatches.length} Courses
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comprehensive coaching programs led by expert CTET/B.Ed educators. Review complete syllabus, durations, and enroll with instant UPI checkout.
              </p>
            </div>

            {isGuest && (
              <button
                onClick={() => {
                  if (onRequireAuth) {
                    onRequireAuth('Please Login or Register to Access Enrolled Courses');
                  } else if (onOpenStudentAuth) {
                    onOpenStudentAuth();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 transition-colors shadow-sm self-start cursor-pointer"
              >
                Access My Enrolled Batches →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allBatches.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-teal-100 dark:border-slate-800 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {b.coverImage && (
                    <div className="relative h-48 overflow-hidden bg-slate-900">
                      <img
                        src={b.coverImage}
                        alt={b.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                      <span className="absolute top-3 left-3 bg-teal-800 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm">
                        Duration: {b.duration || '1 Year'}
                      </span>
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-teal-800 dark:text-teal-300">
                        {b.grade}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Active Batch
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      {b.name}
                    </h3>

                    {/* 5-6 LINE PROFESSIONAL DESCRIPTION HIGHLIGHTING TOP-TIER NOTES & EXPERT TEACHERS */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed min-h-[72px]">
                      {b.description ||
                        "Anushree Academy's premier foundation batch for board aspirants. Guided by experienced educators with deep expertise in conceptual sciences and competitive mathematics. Provides top-tier structured revision notes, formula cheat sheets, illustrative diagrams, and daily practice problem sets. Features full chapter-wise recorded lectures with low-data streaming, interactive doubt-clearing sessions, and authentic model test papers."}
                    </p>

                    {/* AVAILABLE SUBJECTS WITH BADGES */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Available Subjects ({b.subjects?.length || 4}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {b.subjects?.map((s) => (
                          <span
                            key={s.id}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-slate-800 text-teal-900 dark:text-teal-300 border border-teal-100 dark:border-slate-700"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-3">
                  {/* EDITABLE PRICES SECTION */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Course Fee
                          </span>
                          <button
                            onClick={(e) => handleOpenPriceEditor(b, e)}
                            className="p-1 rounded-md text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 cursor-pointer"
                            title="Edit Batch Price"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-xl font-black text-teal-900 dark:text-teal-300 tabular-nums">
                            ₹{(b.monthlyFee || 2500).toLocaleString('en-IN')}
                            <span className="text-xs font-semibold text-slate-400">/mo</span>
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            (Full: ₹{(b.fullBatchPrice || 9999).toLocaleString('en-IN')})
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-extrabold text-teal-900 dark:text-teal-200 bg-teal-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-teal-100 dark:border-slate-700">
                        1 Year Duration
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setExploreBatch(b);
                        setCurrentView('batch-overview');
                      }}
                      className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer text-center"
                    >
                      View Syllabus & Faculty
                    </button>
                    <button
                      onClick={() => handleOpenCheckout(b)}
                      className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-teal-800 hover:bg-teal-900 text-white transition-colors cursor-pointer text-center"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: PROFESSIONAL BATCH OVERVIEW PAGE (5-6 line description & All Subjects breakdown)
         ========================================================================= */}
      {currentView === 'batch-overview' && exploreBatch && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-teal-100 dark:border-slate-800 shadow-md space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <span className="text-xs font-black uppercase text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                  {exploreBatch.grade} • Duration: {exploreBatch.duration || '1 Year'}
                </span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {exploreBatch.name}
                </h2>
                
                {/* 5-6 Line Professional Description */}
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                  {exploreBatch.description ||
                    `Anushree Academy's premier foundation and examination preparation program designed for secondary school aspirants. Led by CTET & B.Ed qualified educators with over 12 years of experience, this course delivers comprehensive syllabus mastery through interactive live lectures, high-yield structured revision notes, and dedicated doubt solving. Students gain full 1-year access to high-definition recorded archives equipped with data-saver streaming, daily practice problem worksheets, and full-length model question papers formulated strictly in accordance with current examination guidelines.`}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                  <span>Faculty Lead: {exploreBatch.teacherName}</span>
                  <span>•</span>
                  <span>1-Year Complete Access (Auto-Expiry)</span>
                  <span>•</span>
                  <span>Digital Certificate on Completion</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-teal-50 dark:bg-slate-800 border border-teal-100 dark:border-slate-700 text-center shrink-0 min-w-[220px]">
                <span className="text-xs font-bold text-slate-500 block">Complete Batch Access</span>
                <div className="text-3xl font-black text-teal-900 dark:text-teal-300 tabular-nums my-1">
                  ₹{(exploreBatch.fullBatchPrice || 9999).toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-slate-500 block mb-4">
                  Monthly: ₹{(exploreBatch.monthlyFee || 2500).toLocaleString('en-IN')}/mo • 1 Year
                </span>
                <button
                  onClick={() => handleOpenCheckout(exploreBatch)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white transition-colors cursor-pointer shadow-md"
                >
                  Buy Complete Batch
                </button>
              </div>
            </div>

            {/* "All Subjects" Breakdown */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  All Subjects Breakdown & Individual Checkout
                </h3>
                <span className="text-xs text-slate-400">
                  Select a specific subject to purchase individually or buy the full batch.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(exploreBatch.subjects || []).map((sub) => (
                  <div
                    key={sub.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-teal-800 dark:text-teal-300">
                          {sub.chapters?.length || 4} Chapters
                        </span>
                        <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">
                          ₹{sub.price.toLocaleString('en-IN')} / {sub.duration || '1 Year'}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {sub.name}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                        {sub.description}
                      </p>
                      <span className="text-[11px] text-slate-400 block">
                        Educator: {sub.teacherName}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenCheckout(exploreBatch, sub)}
                      className="w-full py-2 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white transition-colors cursor-pointer"
                    >
                      Enroll in {sub.name} (₹{sub.price}) →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: CHECKOUT & PAYMENT INTEGRATION (DYNAMIC UPI QR SCANNER)
         ========================================================================= */}
      {currentView === 'checkout' && checkoutTarget && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-teal-100 dark:border-slate-800 shadow-xl space-y-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-extrabold uppercase text-teal-800 dark:text-teal-300">
              Course Checkout & Instant Enrollment
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {checkoutTarget.subject
                ? `${checkoutTarget.batch.name} • ${checkoutTarget.subject.name}`
                : checkoutTarget.batch.name}
            </h2>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-1">
              <span>Duration: <strong>{checkoutTarget.duration}</strong></span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                Auto-Expires on: {getOneYearExpiryString()}
              </span>
            </div>
          </div>

          {checkoutSuccessMessage ? (
            <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl border border-emerald-300 dark:border-emerald-800 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-200">
                Course Successfully Unlocked!
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                {checkoutSuccessMessage}
              </p>
              <span className="text-xs font-bold text-slate-400 block">Redirecting to your chapter materials...</span>
            </div>
          ) : (
            <form onSubmit={handleConfirmCheckout} className="space-y-5">
              {/* Pricing Summary Box */}
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-slate-800/80 border border-teal-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Payable Amount</span>
                  <span className="text-2xl font-black text-teal-900 dark:text-teal-300 tabular-nums">
                    ₹{checkoutTarget.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">1 Year Validity</span>
                  <span className="text-[11px] text-slate-500">Includes Notes, Videos & Model Papers</span>
                </div>
              </div>

              {/* Dynamic UPI QR Code Scanner Integration */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-4">
                <div className="text-center">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Scan with any UPI App to Pay
                  </h4>
                  <p className="text-xs text-slate-500">
                    Google Pay • PhonePe • Paytm • BHIM • Amazon Pay
                  </p>
                </div>

                {/* Real-time Dynamic QR code */}
                <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-slate-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      `upi://pay?pa=${academy.upiId || 'anushreeacademy@upi'}&pn=${encodeURIComponent(
                        academy.upiPayeeName || academy.name
                      )}&am=${checkoutTarget.price}&cu=INR`
                    )}`}
                    alt="UPI Payment QR Code"
                    className="w-48 h-48 rounded-xl object-contain"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs font-mono bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-300">UPI ID: {academy.upiId || 'anushreeacademy@upi'}</span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="text-teal-800 dark:text-teal-400 font-bold hover:underline ml-1 cursor-pointer"
                  >
                    {copiedUpi ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Student Details (Ensures visitors can auto-register/unlock) */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  Student Verification Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Student Full Name
                    </label>
                    <input
                      type="text"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Email Address (Login ID)
                    </label>
                    <input
                      type="email"
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      WhatsApp Mobile Number
                    </label>
                    <input
                      type="text"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      UPI Reference / UTR Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 428819011299 (12-digit UTR)"
                      value={checkoutUtr}
                      onChange={(e) => setCheckoutUtr(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentView('all-batches')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingCheckout}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-teal-800 hover:bg-teal-900 text-white transition-all transform hover:scale-105 cursor-pointer shadow-md"
                >
                  {isProcessingCheckout ? 'Verifying & Unlocking...' : `Confirm Payment & Unlock for 1 Year (₹${checkoutTarget.price})`}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 6: ONLINE ASSESSMENTS & TESTS PANEL
         ========================================================================= */}
      {currentView === 'quizzes' && (
        <QuizAssessmentPanel
          quizzes={quizzes}
          submissions={submissions}
          batches={allBatches}
          currentStudent={student}
          isAdmin={false}
          onAddQuiz={async () => {}}
          onSubmitQuiz={onSubmitQuiz || (async () => ({} as QuizSubmission))}
        />
      )}

      {/* =========================================================================
          VIEW 8: CENTRALIZED BOOKMARKS & QUICK REVISION NOTES (Physics Wallah / Unacademy style)
         ========================================================================= */}
      {currentView === 'bookmarks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-teal-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-teal-950 flex items-center justify-center font-bold">
                  <Bookmark className="w-5 h-5 fill-teal-950" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Saved Bookmarks & Quick Revision
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your tagged video timestamps, formulas, and high-yield PDF pages for pre-exam revision.
                  </p>
                </div>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
              {(['all', 'Mathematics', 'Science', 'video_timestamp', 'note_page'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setSelectedBookmarkFilter(filterKey)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedBookmarkFilter === filterKey
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  {filterKey === 'all'
                    ? `All (${bookmarks.length})`
                    : filterKey === 'video_timestamp'
                    ? 'Video Timestamps'
                    : filterKey === 'note_page'
                    ? 'Note Pages'
                    : filterKey}
                </button>
              ))}
            </div>
          </div>

          {/* Bookmarks Grid */}
          {bookmarks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-teal-100 dark:border-slate-800 space-y-3">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-extrabold text-base text-slate-700 dark:text-slate-200">
                No Bookmarks Saved Yet
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                During your study sessions, click "Bookmark Timestamp" in video lectures or "Bookmark Note" in PDF readers to quickly save key topics here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarks
                .filter((b) => {
                  if (selectedBookmarkFilter === 'all') return true;
                  if (selectedBookmarkFilter === 'video_timestamp') return b.type === 'video_timestamp';
                  if (selectedBookmarkFilter === 'note_page') return b.type === 'note_page';
                  return b.subjectName?.toLowerCase() === selectedBookmarkFilter.toLowerCase();
                })
                .map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-slate-800 shadow-sm hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                          {b.subjectName} • {b.type === 'video_timestamp' ? `Video @ ${b.timestamp}` : b.type === 'note_page' ? `Note (Page ${b.pageNumber || 1})` : 'Topic'}
                        </span>
                        <button
                          onClick={() => handleDeleteBookmark(b.id)}
                          className="text-slate-400 hover:text-red-600 cursor-pointer p-1"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="font-black text-sm text-slate-900 dark:text-white">
                        {b.title}
                      </h4>

                      <p className="text-[11px] text-teal-800 dark:text-teal-400 font-bold">
                        {b.chapterTitle}
                      </p>

                      {b.noteText && (
                        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 italic font-medium">
                          "{b.noteText}"
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400">{b.createdAt}</span>

                      {b.type === 'video_timestamp' ? (
                        <button
                          onClick={() => {
                            // Find matching video or default
                            const matched = videos.find((v) => v.id === b.targetId) || videos[0];
                            setActivePlayerVideo(matched);
                            setCurrentView('my-batches');
                            if (purchasedBatches[0]) {
                              setSelectedMyBatch(purchasedBatches[0]);
                              if (purchasedBatches[0].subjects?.[0]) {
                                setSelectedMySubject(purchasedBatches[0].subjects[0]);
                                if (purchasedBatches[0].subjects[0].chapters?.[0]) {
                                  setSelectedMyChapter(purchasedBatches[0].subjects[0].chapters[0]);
                                }
                              }
                            }
                            setChapterActiveTab('lectures');
                          }}
                          className="font-bold text-teal-800 dark:text-teal-300 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-teal-800" />
                          <span>Jump to Timestamp ({b.timestamp})</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const matchedNote = content.find((c) => c.id === b.targetId) || content[0];
                            if (onOpenSecurePdf && matchedNote) {
                              onOpenSecurePdf(matchedNote);
                            }
                          }}
                          className="font-bold text-teal-800 dark:text-teal-300 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Open Revision Note</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 7: MY CERTIFICATES & AUTOMATED COMPLETION TRACKING
         ========================================================================= */}
      {currentView === 'certificates' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-teal-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-teal-950 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5 fill-teal-950" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    My Certificates & Honors
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Official verifiable credentials awarded by Achiever Academy upon 100% syllabus completion.
                  </p>
                </div>
              </div>
            </div>

            {/* Test Simulation Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSimulatedComplete(!isSimulatedComplete)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSimulatedComplete
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSimulatedComplete ? 'Simulation: 100% Completed ✓' : '🧪 Simulate 100% Completion (Test Mode)'}</span>
              </button>
            </div>
          </div>

          {/* Certificate Cards per enrolled batch */}
          {purchasedBatches.map((b) => {
            const currentPercentage = isSimulatedComplete ? 100 : studentProgress.overallPercentage;
            const isCompleted = currentPercentage >= 100;
            const existingCert = certificates.find((c) => c.batchId === b.id || c.studentId === student.id);
            const verificationCode = existingCert?.verificationCode || `AA-FSDB-RK${Math.floor(1000 + Math.random() * 9000)}`;

            return (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 dark:border-slate-800 shadow-xl space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                      Batch Credential
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      {b.name} ({b.grade})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Includes all chapters, live interactive sessions, tests & assignments.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Completion</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                        {currentPercentage}%
                      </span>
                    </div>
                    <div className="w-32 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${currentPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Status Indicator & Preview / Download Buttons */}
                {!isCompleted ? (
                  /* ================= STATE 1: < 100% (SAMPLE PREVIEW WITH REQUIRED NOTE) ================= */
                  <div className="space-y-6">
                    {/* Required Prompt Note */}
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-3">
                      <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                          Certificate Locked ({currentPercentage}% Complete)
                        </h4>
                        <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold mt-0.5">
                          Complete your batch/course to unlock your personalized certificate with your name.
                        </p>
                      </div>
                    </div>

                    {/* SAMPLE PREVIEW CARD */}
                    <div className="relative rounded-3xl p-6 sm:p-8 bg-[#fffdf7] border-4 border-amber-300/80 shadow-md text-slate-900 overflow-hidden">
                      {/* Diagonal "SAMPLE PREVIEW" Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-10">
                        <span className="text-6xl sm:text-8xl font-black tracking-widest text-amber-900 transform -rotate-12 uppercase">
                          SAMPLE PREVIEW
                        </span>
                      </div>

                      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <div className="flex items-center gap-2">
                          <Award className="w-7 h-7 text-amber-600" />
                          <span className="text-xs font-black uppercase tracking-widest text-amber-800">
                            ACHIEVER ACADEMY • OFFICIAL CREDENTIAL
                          </span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-wider text-slate-900">
                          CERTIFICATE OF ACHIEVEMENT
                        </h3>

                        <p className="text-xs text-slate-500 italic">
                          This is a verified sample preview of the credential awarded upon course completion.
                        </p>

                        <div className="py-2 border-b-2 border-amber-400 w-full max-w-md">
                          <span className="text-xs text-slate-400 uppercase tracking-widest block font-bold">
                            Awarded to
                          </span>
                          <span className="text-xl sm:text-2xl font-serif font-bold text-amber-900">
                            [Your Full Name Upon Completion]
                          </span>
                        </div>

                        <p className="text-xs max-w-lg text-slate-600 leading-relaxed">
                          For demonstrating outstanding academic dedication and successfully mastering the complete syllabus of{' '}
                          <strong>{b.name}</strong>.
                        </p>

                        <div className="pt-4 flex flex-wrap items-center justify-between w-full max-w-lg border-t border-amber-200 text-xs">
                          <div className="text-left">
                            <span className="text-[10px] text-slate-400 font-bold block">VERIFICATION CODE</span>
                            <span className="font-mono font-bold text-amber-800">{verificationCode}</span>
                          </div>
                          <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-500 bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-[10px]">
                            SEAL
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-bold block">QR CODE</span>
                            <span className="font-bold text-slate-600">Scan to Verify</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <span className="text-xs text-slate-500">
                        Finish your remaining lectures and chapter tests to achieve 100% and generate your official certificate.
                      </span>

                      <button
                        onClick={() => {
                          const sampleCert: DigitalCertificate = {
                            id: `sample-${b.id}`,
                            certificateNumber: verificationCode,
                            verificationCode: verificationCode,
                            studentId: student.id,
                            studentName: '[Sample Student Name]',
                            studentRollNumber: 'SAMPLE-101',
                            batchId: b.id,
                            batchName: b.name,
                            courseTitle: `${b.name} Curriculum`,
                            issueDate: 'Pending Completion',
                            grade: 'A+',
                            overallScore: 95,
                            issuerName: 'Sarla Sharma',
                            issuerTitle: 'Director of Academics',
                            leadInstructorName: b.teacherName || 'Rajesh Verma',
                            leadInstructorDesignation: 'Lead Academic Instructor',
                            sealText: 'OFFICIAL SEAL • ACHIEVER ACADEMY',
                            verificationUrl: `https://achiever-academy.edu/verify/${verificationCode}`,
                            isUnlocked: false
                          };
                          if (onOpenCertificate) onOpenCertificate(sampleCert);
                        }}
                        className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye className="w-4 h-4 text-amber-500" />
                        <span>Preview Full Certificate Template</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ================= STATE 2: 100% COMPLETE (ACTIVE DOWNLOAD CERTIFICATE BUTTON) ================= */
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-bounce" />
                      <div>
                        <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                          Course 100% Completed! 🎉
                        </h4>
                        <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold mt-0.5">
                          Congratulations {student.name}! Your official personalized certificate with unique verification code is generated.
                        </p>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-[#fffdf7] border-2 border-amber-400 text-slate-900 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-amber-700">
                          <Award className="w-5 h-5" />
                          <span className="text-xs font-black tracking-widest uppercase">
                            ACHIEVER ACADEMY VERIFIED
                          </span>
                        </div>
                        <h4 className="text-xl font-serif font-black text-slate-900">
                          Certificate of Achievement • {student.name}
                        </h4>
                        <p className="text-xs text-slate-600">
                          Course: <strong>{b.name}</strong> • Verification Code:{' '}
                          <span className="font-mono font-bold text-amber-900">{verificationCode}</span>
                        </p>
                      </div>

                      {/* ACTIVE "DOWNLOAD CERTIFICATE" BUTTON */}
                      <button
                        onClick={() => {
                          const officialCert: DigitalCertificate = {
                            id: `cert-${b.id}-${student.id}`,
                            certificateNumber: verificationCode,
                            verificationCode: verificationCode,
                            studentId: student.id,
                            studentName: student.name,
                            studentRollNumber: student.rollNumber || 'AA-101',
                            batchId: b.id,
                            batchName: b.name,
                            courseTitle: `${b.name} Curriculum`,
                            issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                            grade: 'A+',
                            overallScore: 96,
                            issuerName: 'Sarla Sharma',
                            issuerTitle: 'Director of Academics',
                            leadInstructorName: b.teacherName || 'Rajesh Verma',
                            leadInstructorDesignation: 'Lead Academic Instructor',
                            sealText: 'OFFICIAL SEAL • ACHIEVER ACADEMY',
                            verificationUrl: `https://achiever-academy.edu/verify/${verificationCode}`,
                            isUnlocked: true
                          };
                          if (onOpenCertificate) {
                            onOpenCertificate(officialCert);
                          }
                        }}
                        className="px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-teal-950 font-black text-xs shadow-xl flex items-center gap-2.5 transition-all transform hover:scale-105 cursor-pointer shrink-0"
                      >
                        <Download className="w-4 h-4 text-teal-950" />
                        <span>Download Certificate</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: ADD CUSTOM BOOKMARK NOTE ================= */}
      {isBookmarkModalOpen && bookmarkModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 border border-teal-100 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Add to Revision Bookmarks
                </h3>
              </div>
              <button
                onClick={() => setIsBookmarkModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
              <span className="font-extrabold text-slate-900 dark:text-white block">
                {bookmarkModalData.title}
              </span>
              <span className="text-slate-500">
                {bookmarkModalData.chapterTitle} • {bookmarkModalData.type === 'video_timestamp' ? `Timestamp: ${bookmarkModalData.timestamp || '14:20'}` : 'Note Document'}
              </span>
            </div>

            <form onSubmit={handleSaveBookmark} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Personal Study Note / Exam Tip:
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Remember to quote NCERT Theorem 1.3 on step 3. High yield 5-mark question."
                  value={bookmarkCustomNote}
                  onChange={(e) => setBookmarkCustomNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-teal-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookmarkModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold shadow-md flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save Bookmark</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DIGITAL PAYMENT RECEIPT ================= */}
      {activeReceipt && (
        <DigitalReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
          onProceedToBatches={() => {
            setActiveReceipt(null);
            setCurrentView('my-batches');
          }}
        />
      )}

      {/* =========================================================================
          EDITABLE PRICE MODAL
         ========================================================================= */}
      {priceEditingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 border border-teal-100 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-teal-800 dark:text-teal-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Edit Course Pricing
                </h3>
              </div>
              <button
                onClick={() => setPriceEditingBatch(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Update pricing for <strong>{priceEditingBatch.name}</strong>. Prices are automatically reflected in the store and checkout.
            </p>

            <form onSubmit={handleSavePriceEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Fee (₹)
                </label>
                <input
                  type="number"
                  min="500"
                  max="50000"
                  step="50"
                  value={tempMonthlyFee}
                  onChange={(e) => setTempMonthlyFee(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full 1-Year Course Price (₹)
                </label>
                <input
                  type="number"
                  min="1000"
                  max="100000"
                  step="100"
                  value={tempFullPrice}
                  onChange={(e) => setTempFullPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPriceEditingBatch(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold shadow-md"
                >
                  Save New Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
