import {
  AcademySettings, Teacher, Batch, Student, FeeRecord, ContentItem,
  ChatMessage, ScheduleEvent, Announcement, RecordedVideo, StudentRegistrationInput,
  NotificationRecord, Quiz, QuizQuestion, QuizSubmission, StudentReportCard,
  DoubtItem, DoubtReply, TimetableSlot, DigitalCertificate, CourseEnrollment,
  TeacherContract, TeacherPayoutRecord, FinancialMetrics,
  StudentProgress, StudentBookmark, PaymentReceipt,
  CertificateSettings, BatchPurchaseRequest, BatchSubject, ChapterItem
} from '../src/types.ts';
import {
  defaultEnrichedBatches,
  defaultTeacherContracts,
  defaultEnrollments
} from './courseCatalog.ts';

export class AcademyDataStore {
  // Master Academy Settings including UPI Payment Configuration
  academy: AcademySettings = {
    name: 'Achiever Academy',
    tagline: 'Premier National-Level Online Coaching Platform & Academic Excellence',
    contactPhone: '+91 98765 43210',
    contactEmail: 'contact@achieveracademy.edu',
    address: 'Plot 42, Knowledge Park III, Greater Noida, UP, India',
    logoUrl: '',
    currency: '₹',
    upiId: 'achieveracademy@upi',
    upiPayeeName: 'Achiever Academy Educational Trust',
    upiQrUrl: ''
  };

  // Certificate Dynamic Customization Settings
  certificateSettings: CertificateSettings = {
    id: '1',
    academyName: 'Achiever Academy',
    directorName: 'Dr. Vikramaditya Sen',
    directorDesignation: 'Founder & Academic Director',
    leadInstructorName: 'Sarla Sharma',
    leadInstructorDesignation: 'Head of Academics & Senior Faculty',
    sealText: 'OFFICIAL SEAL • ACHIEVER ACADEMY • VERIFIED EXCELLENCE'
  };

  // Batch Purchase Requests (Pending Verification Workflow)
  purchaseRequests: BatchPurchaseRequest[] = [
    {
      id: 'pur-1',
      studentId: 's-2',
      studentName: 'Priya Patel',
      studentEmail: 'priya.p@achiever.edu',
      studentPhone: '+91 98201 11002',
      batchId: 'b-abhyas',
      batchName: 'Abhyas Batch',
      amount: 8499,
      paymentMode: 'UPI',
      transactionRef: 'UPI-UTR-428819022391',
      status: 'pending_verification',
      receiptNumber: 'AA-PAY-782104',
      createdAt: 'Today, 10:15 AM',
      whatsappMessageStatus: 'pending'
    },
    {
      id: 'pur-2',
      studentId: 's-3',
      studentName: 'Aarav Mehta',
      studentEmail: 'aarav.m@achiever.edu',
      studentPhone: '+91 98721 34992',
      batchId: 'b-sankalp',
      batchName: 'Sankalp Batch',
      amount: 6999,
      paymentMode: 'UPI',
      transactionRef: 'UPI-UTR-901248912783',
      status: 'pending_verification',
      receiptNumber: 'AA-PAY-918234',
      createdAt: 'Today, 11:30 AM',
      whatsappMessageStatus: 'pending'
    }
  ];

  // Currently active teacher ID
  activeTeacherId = 't-sarla';

  // Multi-Teacher Faculty
  teachers: Teacher[] = [
    {
      id: 't-sarla',
      name: 'Sarla Sharma',
      qualifications: 'B.Ed, CTET',
      email: 'sarla.sharma@anushree-academy.edu',
      phone: '+91 98765 43210',
      subjectsExpertise: ['Mathematics', 'Science'],
      bio: 'Dedicated senior educator with 12+ years of experience preparing secondary school students for CBSE/ICSE Board Exams and Olympiads.',
      avatarUrl: '/assets/images/image_72318e78.png',
      status: 'active',
      totalTeachingHours: 1420,
      assignedBatches: ['b-prarambh', 'b-10-math', 'b-9-sci'],
      rating: 4.9
    },
    {
      id: 't-rajesh',
      name: 'Rajesh Verma',
      qualifications: 'M.Sc (Physics), B.Ed',
      email: 'rajesh.verma@anushree-academy.edu',
      phone: '+91 98102 33445',
      subjectsExpertise: ['Science', 'Physics', 'Chemistry'],
      bio: 'Expert physics instructor with 8 years of teaching experience focusing on conceptual clarity, experiments, and numerical problem solving.',
      avatarUrl: '',
      status: 'active',
      totalTeachingHours: 920,
      assignedBatches: ['b-abhyas', 'b-9-sci'],
      rating: 4.8
    },
    {
      id: 't-ananya',
      name: 'Ananya Mukherjee',
      qualifications: 'M.A. (English), CTET',
      email: 'ananya.m@anushree-academy.edu',
      phone: '+91 98234 55667',
      subjectsExpertise: ['English', 'Literature', 'Grammar'],
      bio: 'Passionate English language specialist training students in literature analysis, communicative fluency, and high-scoring board writing skills.',
      avatarUrl: '',
      status: 'active',
      totalTeachingHours: 780,
      assignedBatches: ['b-sankalp', 'b-8-eng'],
      rating: 4.9
    },
    {
      id: 't-pradeep',
      name: 'Pradeep Joshi',
      qualifications: 'B.Tech, CTET Qualified',
      email: 'pradeep.joshi@anushree-academy.edu',
      phone: '+91 98711 22334',
      subjectsExpertise: ['Mathematics', 'Mental Ability', 'Social Science'],
      bio: 'Olympiad trainer known for quick Vedic math techniques and comprehensive algebra foundation.',
      avatarUrl: '',
      status: 'active',
      totalTeachingHours: 640,
      assignedBatches: ['b-prarambh'],
      rating: 4.7
    }
  ];

  // Enriched Batches Catalog (Prarambh, Abhyas, Sankalp)
  batches: Batch[] = [...defaultEnrichedBatches];

  // Teacher Contracts & Payouts Tracking
  teacherContracts: TeacherContract[] = [...defaultTeacherContracts];

  // Course Enrollments & Transactions Log
  enrollments: CourseEnrollment[] = [...defaultEnrollments];

  // Live Classroom Chat Moderation: Blocked Students Set
  blockedStudentIds: Set<string> = new Set();

  students: Student[] = [
    {
      id: 's-1',
      batchId: 'b-prarambh',
      batchName: 'Prarambh Batch',
      name: 'Rahul Verma',
      rollNumber: '10M-01',
      email: 'rahul.v@anushree.edu',
      phone: '+91 98201 11001',
      attendanceRate: 98,
      performanceScore: 92,
      feeStatus: 'paid',
      feeDueAmount: 0,
      lastFeePaidDate: '05 Oct 2026',
      status: 'enrolled',
      approvalStatus: 'approved',
      registeredAt: '10 Sep 2026',
      isHandRaised: false,
      isMuted: true,
      purchasedBatchIds: ['b-prarambh'],
      purchasedSubjectIds: ['sub-p-math', 'sub-p-sci'],
      enrollments: [
        {
          id: 'enr-1',
          studentId: 's-1',
          studentName: 'Rahul Verma',
          studentEmail: 'rahul.v@anushree.edu',
          studentPhone: '+91 98201 11001',
          batchId: 'b-prarambh',
          batchName: 'Prarambh Batch',
          subjectId: 'sub-p-math',
          subjectName: 'Mathematics',
          pricePaid: 2800,
          paymentMode: 'UPI',
          transactionRef: 'UPI-UTR-428819011299',
          enrolledAt: '10 Sep 2026',
          expiresAt: '10 Sep 2027',
          status: 'active'
        },
        {
          id: 'enr-2',
          studentId: 's-1',
          studentName: 'Rahul Verma',
          studentEmail: 'rahul.v@anushree.edu',
          studentPhone: '+91 98201 11001',
          batchId: 'b-prarambh',
          batchName: 'Prarambh Batch',
          subjectId: 'sub-p-sci',
          subjectName: 'Science (Physics & Chemistry)',
          pricePaid: 2500,
          paymentMode: 'UPI',
          transactionRef: 'UPI-UTR-428819011300',
          enrolledAt: '12 Sep 2026',
          expiresAt: '12 Sep 2027',
          status: 'active'
        }
      ]
    },
    {
      id: 's-2',
      batchId: 'b-prarambh',
      batchName: 'Prarambh Batch',
      name: 'Priya Patel',
      rollNumber: '10M-02',
      email: 'priya.p@anushree.edu',
      phone: '+91 98201 11002',
      attendanceRate: 96,
      performanceScore: 95,
      feeStatus: 'paid',
      feeDueAmount: 0,
      lastFeePaidDate: '04 Oct 2026',
      status: 'enrolled',
      approvalStatus: 'approved',
      registeredAt: '12 Sep 2026',
      isHandRaised: true,
      isMuted: true,
      purchasedBatchIds: ['b-prarambh'],
      purchasedSubjectIds: ['sub-p-math']
    },
    { id: 's-3', batchId: 'b-10-math', batchName: 'Class 10 Mathematics', name: 'Amit Kumar', rollNumber: '10M-03', email: 'amit.k@anushree.edu', phone: '+91 98201 11003', attendanceRate: 92, performanceScore: 84, feeStatus: 'pending', feeDueAmount: 2800, lastFeePaidDate: '05 Sep 2026', status: 'enrolled', approvalStatus: 'approved', registeredAt: '15 Sep 2026', isHandRaised: false, isMuted: true },
    { id: 's-4', batchId: 'b-10-math', batchName: 'Class 10 Mathematics', name: 'Sneha Roy', rollNumber: '10M-04', email: 'sneha.r@anushree.edu', phone: '+91 98201 11004', attendanceRate: 100, performanceScore: 96, feeStatus: 'paid', feeDueAmount: 0, lastFeePaidDate: '01 Oct 2026', status: 'enrolled', approvalStatus: 'approved', registeredAt: '18 Sep 2026', isHandRaised: false, isMuted: true },
    { id: 's-5', batchId: 'b-10-math', batchName: 'Class 10 Mathematics', name: 'Rohan Gupta', rollNumber: '10M-05', email: 'rohan.g@anushree.edu', phone: '+91 98201 11005', attendanceRate: 88, performanceScore: 80, feeStatus: 'pending', feeDueAmount: 2800, lastFeePaidDate: '02 Sep 2026', status: 'enrolled', approvalStatus: 'approved', registeredAt: '20 Sep 2026', isHandRaised: false, isMuted: true },
    { id: 's-6', batchId: 'b-10-math', batchName: 'Class 10 Mathematics', name: 'Ananya Sharma', rollNumber: '10M-06', email: 'ananya.s@anushree.edu', phone: '+91 98201 11006', attendanceRate: 94, performanceScore: 89, feeStatus: 'paid', feeDueAmount: 0, lastFeePaidDate: '06 Oct 2026', status: 'enrolled', approvalStatus: 'approved', registeredAt: '22 Sep 2026', isHandRaised: false, isMuted: true },
    { id: 's-7', batchId: 'b-10-math', batchName: 'Class 10 Mathematics', name: 'Kabir Mehta', rollNumber: '10M-07', email: 'kabir.m@anushree.edu', phone: '+91 98201 11007', attendanceRate: 90, performanceScore: 82, feeStatus: 'pending', feeDueAmount: 2800, lastFeePaidDate: '08 Sep 2026', status: 'enrolled', approvalStatus: 'approved', registeredAt: '24 Sep 2026', isHandRaised: false, isMuted: true },
    { id: 's-8', batchId: 'b-10-math', batchName: 'Class 10 Mathematics', name: 'Meera Iyer', rollNumber: '10M-08', email: 'meera.i@anushree.edu', phone: '+91 98201 11008', attendanceRate: 97, performanceScore: 94, feeStatus: 'paid', feeDueAmount: 0, lastFeePaidDate: '03 Oct 2026', status: 'enrolled', approvalStatus: 'approved', registeredAt: '25 Sep 2026', isHandRaised: false, isMuted: true },
    { id: 's-9', batchId: 'b-9-sci', batchName: 'Class 9 Science', name: 'Aryan Joshi', rollNumber: '09S-01', email: 'aryan.j@anushree.edu', phone: '+91 98201 22001', attendanceRate: 95, performanceScore: 88, feeStatus: 'paid', feeDueAmount: 0, lastFeePaidDate: '05 Oct 2026', status: 'enrolled', approvalStatus: 'approved', registeredAt: '26 Sep 2026', isHandRaised: false, isMuted: true },
    { id: 's-10', batchId: 'b-9-sci', batchName: 'Class 9 Science', name: 'Dia Sen', rollNumber: '09S-02', email: 'dia.s@anushree.edu', phone: '+91 98201 22002', attendanceRate: 92, performanceScore: 91, feeStatus: 'paid', feeDueAmount: 0, lastFeePaidDate: '07 Oct 2026', status: 'enrolled', approvalStatus: 'approved', registeredAt: '28 Sep 2026', isHandRaised: false, isMuted: true },
    { id: 's-11', batchId: 'b-9-sci', batchName: 'Class 9 Science', name: 'Tanmay Saxena', rollNumber: '09S-03', email: 'tanmay.s@anushree.edu', phone: '+91 98201 22003', attendanceRate: 86, performanceScore: 78, feeStatus: 'pending', feeDueAmount: 2500, lastFeePaidDate: '10 Sep 2026', status: 'enrolled', approvalStatus: 'approved', registeredAt: '29 Sep 2026', isHandRaised: false, isMuted: true },
    { id: 's-12', batchId: 'b-8-eng', batchName: 'Class 8 English', name: 'Ishita Nair', rollNumber: '08E-01', email: 'ishita.n@anushree.edu', phone: '+91 98201 33001', attendanceRate: 99, performanceScore: 95, feeStatus: 'paid', feeDueAmount: 0, lastFeePaidDate: '02 Oct 2026', status: 'enrolled', approvalStatus: 'approved', registeredAt: '01 Oct 2026', isHandRaised: false, isMuted: true },
    { id: 's-13', batchId: 'b-8-eng', batchName: 'Class 8 English', name: 'Karan Malhotra', rollNumber: '08E-02', email: 'karan.m@anushree.edu', phone: '+91 98201 33002', attendanceRate: 91, performanceScore: 85, feeStatus: 'pending', feeDueAmount: 2200, lastFeePaidDate: '12 Sep 2026', status: 'enrolled', approvalStatus: 'approved', registeredAt: '02 Oct 2026', isHandRaised: false, isMuted: true },
    
    // Sample Pending Self-Registered Students (Awaiting Admin / Didi Approval)
    {
      id: 's-pending-1',
      batchId: 'b-10-math',
      batchName: 'Class 10 Mathematics',
      name: 'Kavita Singhania',
      rollNumber: 'PENDING',
      email: 'kavita.singh@gmail.com',
      phone: '+91 98334 11223',
      attendanceRate: 0,
      performanceScore: 0,
      feeStatus: 'pending',
      feeDueAmount: 2800,
      status: 'pending',
      approvalStatus: 'pending',
      registeredAt: 'Today, 09:15 AM',
      isHandRaised: false,
      isMuted: true
    },
    {
      id: 's-pending-2',
      batchId: 'b-9-sci',
      batchName: 'Class 9 Science',
      name: 'Vikramaditya Rao',
      rollNumber: 'PENDING',
      email: 'vikram.rao99@yahoo.com',
      phone: '+91 98199 44556',
      attendanceRate: 0,
      performanceScore: 0,
      feeStatus: 'pending',
      feeDueAmount: 2500,
      status: 'pending',
      approvalStatus: 'pending',
      registeredAt: 'Yesterday, 07:45 PM',
      isHandRaised: false,
      isMuted: true
    }
  ];

  // Recorded Video Lectures for Students & Batches
  recordedVideos: RecordedVideo[] = [
    {
      id: 'rec-1',
      title: 'Class 10 Maths: Trigonometric Identities & Height Masterclass',
      batchId: 'b-10-math',
      batchName: 'Class 10 Mathematics',
      subject: 'Mathematics',
      chapterName: 'Chapter 8: Introduction to Trigonometry',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Clean player embed link
      videoSource: 'youtube',
      duration: '48 mins',
      recordedDate: '20 Oct 2026',
      teacherName: 'Sarla Sharma',
      description: 'Comprehensive derivation of sin²θ + cos²θ = 1 and practical trigonometric elevation problems with NCERT Exemplar walkthrough.',
      notesAttachmentUrl: '/api/storage/file/c-1',
      viewsCount: 38
    },
    {
      id: 'rec-2',
      title: 'Class 10 Maths: Real Numbers & Euclid Division Lemma Full Lecture',
      batchId: 'b-10-math',
      batchName: 'Class 10 Mathematics',
      subject: 'Mathematics',
      chapterName: 'Chapter 1: Real Numbers',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoSource: 'youtube',
      duration: '52 mins',
      recordedDate: '17 Oct 2026',
      teacherName: 'Sarla Sharma',
      description: 'Proof of irrationality for √2, √3, Fundamental Theorem of Arithmetic and HCF/LCM problem shortcuts.',
      notesAttachmentUrl: '/api/storage/file/c-1',
      viewsCount: 45
    },
    {
      id: 'rec-3',
      title: 'Class 9 Science: Gravitation & Kepler Laws of Planetary Motion',
      batchId: 'b-9-sci',
      batchName: 'Class 9 Science',
      subject: 'Science',
      chapterName: 'Chapter 10: Gravitation',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoSource: 'youtube',
      duration: '42 mins',
      recordedDate: '19 Oct 2026',
      teacherName: 'Rajesh Verma',
      description: 'Universal law of gravitation, value of g calculation, weight vs mass, and acceleration due to gravity on planets.',
      viewsCount: 29
    },
    {
      id: 'rec-4',
      title: 'Class 8 English: Tenses & Active-Passive Voice Transformation Rules',
      batchId: 'b-8-eng',
      batchName: 'Class 8 English',
      subject: 'English',
      chapterName: 'Grammar: Advanced Voice & Tenses',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoSource: 'youtube',
      duration: '35 mins',
      recordedDate: '18 Oct 2026',
      teacherName: 'Ananya Mukherjee',
      description: 'Interactive rules for changing direct objects into subjects and tense continuity in formal essays.',
      viewsCount: 21
    }
  ];

  contentLibrary: ContentItem[] = [
    {
      id: 'c-1',
      folderName: 'Class 10 Maths',
      subfolderName: 'Chapter 1: Real Numbers',
      title: 'Chapter 1 Real Numbers - Detailed Notes & Euclid Lemma',
      fileType: 'pdf',
      fileSize: '3.4 MB',
      uploadedAt: '12 Oct 2026',
      downloads: 41,
      details: 'Includes proof of irrationality, Fundamental Theorem of Arithmetic, and 25 exemplar questions.',
      fileName: 'Class10_Maths_Ch1_Real_Numbers.pdf',
      fileUrl: '/api/storage/file/sample-notes-ch1.pdf'
    },
    {
      id: 'c-2',
      folderName: 'Class 10 Maths',
      subfolderName: 'Chapter 1: Real Numbers',
      title: 'Video Lecture: Euclid Division Algorithm Demystified',
      fileType: 'video',
      fileSize: '142 MB',
      uploadedAt: '13 Oct 2026',
      downloads: 38,
      details: 'Full interactive 45-minute masterclass recording with step-by-step problem breakdown.',
      fileName: 'Euclid_Algorithm_Lecture.mp4',
      fileUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'c-3',
      folderName: 'Class 10 Maths',
      subfolderName: 'Chapter 1: Real Numbers',
      title: 'Real Numbers Diagnostic Quiz (15 MCQs)',
      fileType: 'quiz',
      fileSize: '450 KB',
      uploadedAt: '14 Oct 2026',
      downloads: 43,
      details: 'Self-assessment quiz covering HCF, LCM, and prime factorizations.',
      fileName: 'Real_Numbers_MCQ_Quiz.pdf',
      fileUrl: '/api/storage/file/sample-quiz-ch1.pdf'
    },
    {
      id: 'c-4',
      folderName: 'Class 10 Maths',
      subfolderName: 'Chapter 2: Polynomials',
      title: 'Chapter 2 Polynomials - Complete Formula Sheet & Solved Examples',
      fileType: 'pdf',
      fileSize: '2.8 MB',
      uploadedAt: '16 Oct 2026',
      downloads: 39,
      details: 'Zeroes of quadratic and cubic polynomials, relation between coefficients and roots.',
      fileName: 'Polynomials_Formula_Sheet.pdf',
      fileUrl: '/api/storage/file/sample-polynomials.pdf'
    },
    {
      id: 'c-5',
      folderName: 'Class 10 Maths',
      subfolderName: 'Chapter 2: Polynomials',
      title: 'Video Lecture: Graphical Meaning of Zeroes & Parabolas',
      fileType: 'video',
      fileSize: '118 MB',
      uploadedAt: '17 Oct 2026',
      downloads: 36,
      details: 'Visual explanation of intersection points on the x-axis and parabolic shapes.',
      fileName: 'Parabolas_Zeroes_Visual.mp4',
      fileUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'c-6',
      folderName: 'Class 10 Maths',
      subfolderName: 'Chapter 2: Polynomials',
      title: 'Polynomials Practice Quiz (20 Questions)',
      fileType: 'quiz',
      fileSize: '510 KB',
      uploadedAt: '18 Oct 2026',
      downloads: 40,
      details: 'Timed challenge covering remainder theorem and polynomial factorization.',
      fileName: 'Polynomials_Practice_Set.pdf',
      fileUrl: '/api/storage/file/sample-poly-quiz.pdf'
    },
    {
      id: 'c-7',
      folderName: 'Class 9 Science',
      subfolderName: 'Chapter 1: Matter in Our Surroundings',
      title: 'States of Matter & Latent Heat Comprehensive Notes',
      fileType: 'pdf',
      fileSize: '4.1 MB',
      uploadedAt: '15 Oct 2026',
      downloads: 24,
      details: 'Solid, liquid, gas, plasma, Bose-Einstein condensate, and kinetic theory.',
      fileName: 'Class9_Science_Matter.pdf',
      fileUrl: '/api/storage/file/sample-matter.pdf'
    },
    {
      id: 'c-8',
      folderName: 'Class 9 Science',
      subfolderName: 'Chapter 1: Matter in Our Surroundings',
      title: 'Lab Demo: Sublimation of Ammonium Chloride & Camphor',
      fileType: 'video',
      fileSize: '89 MB',
      uploadedAt: '16 Oct 2026',
      downloads: 22,
      details: 'High-definition experimental demonstration conducted by teacher.',
      fileName: 'Sublimation_Experiment.mp4',
      fileUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'c-9',
      folderName: 'Assignments',
      subfolderName: 'Class 10 Weekly Homework',
      title: 'Weekly Assignment 06 - Trigonometric Identities & Heights',
      fileType: 'pdf',
      fileSize: '1.5 MB',
      uploadedAt: 'Yesterday',
      downloads: 42,
      details: 'Due next Monday. Solve all 10 proofs with step justification.',
      fileName: 'Assignment_06_Trigonometry.pdf',
      fileUrl: '/api/storage/file/sample-assignment6.pdf'
    }
  ];

  liveSession = {
    id: 'live-curr-01',
    batchId: '',
    batchName: '',
    title: '',
    subject: '',
    topic: '',
    jitsiRoomName: '',
    isActive: false,
    startedAt: null as string | null,
    durationSeconds: 0,
    participantsCount: 0,
    isRecording: false,
    isTeacherMuted: false,
    isTeacherVideoOn: true,
    isScreenSharing: false
  };

  chatMessages: ChatMessage[] = [
    { id: 'm-1', sessionId: 'live-curr-01', senderName: 'Sarla Sharma', senderRole: 'teacher', message: 'Welcome students to Anushree Academy! Please join the class room once the session goes live.', timestamp: '10:00 AM' }
  ];

  schedule: ScheduleEvent[] = [
    { id: 'sch-1', batchName: 'Class 10 Mathematics', subject: 'Mathematics', teacherName: 'Sarla Sharma', time: '10:00 AM - 11:00 AM', topic: 'Trigonometry & Heights', date: 'Today', status: 'upcoming' },
    { id: 'sch-2', batchName: 'Class 9 Science', subject: 'Science', teacherName: 'Rajesh Verma', time: '11:30 AM - 12:30 PM', topic: 'Gravitation & Kepler Laws', date: 'Today', status: 'upcoming' },
    { id: 'sch-3', batchName: 'Class 8 English', subject: 'English', teacherName: 'Ananya Mukherjee', time: '04:00 PM - 05:00 PM', topic: 'Grammar & Essay Writing', date: 'Today', status: 'upcoming' }
  ];

  recentActivities = [
    { id: 'act-1', text: 'New student Kavita Singhania registered for Class 10 Mathematics (Pending Approval)', time: 'Today, 09:15 AM', type: 'student' },
    { id: 'act-2', text: 'Class 10 completed Trigonometry Practice Set 1', time: '10:46 AM - 11:30 AM', type: 'class' },
    { id: 'act-3', text: 'Uploaded Chapter 2 Polynomials Notes & Formula Cheat Sheet', time: 'Yesterday, 04:15 PM', type: 'upload' },
    { id: 'act-4', text: 'Attendance marked for 25 students in Class 9 Science', time: 'Yesterday, 01:00 PM', type: 'attendance' },
    { id: 'act-5', text: 'Rahul Verma completed monthly tuition fee payment (₹2,800)', time: 'Yesterday, 02:40 PM', type: 'fee' }
  ];

  // In-memory file storage repository
  storageFiles: Map<string, { buffer: string; mimeType: string; fileName: string; size: string }> = new Map();

  startLiveClass(batchId: string): typeof this.liveSession {
    const batch = this.batches.find(b => b.id === batchId) || this.batches[0];
    const teacher = this.getActiveTeacher();
    this.liveSession.isActive = true;
    this.liveSession.batchId = batch.id;
    this.liveSession.batchName = batch.name;
    this.liveSession.title = `${batch.name} - ${batch.nextTopic}`;
    this.liveSession.subject = batch.subject;
    this.liveSession.topic = batch.nextTopic;
    this.liveSession.jitsiRoomName = `AnushreeAcademy_${batch.id.replace(/[^a-zA-Z0-9]/g, '_')}_Live`;
    this.liveSession.startedAt = new Date().toISOString();
    this.liveSession.durationSeconds = 0;
    this.liveSession.participantsCount = batch.studentCount || 85;
    this.liveSession.isRecording = true;

    // Update schedule event
    const sch = this.schedule.find(s => s.batchName === batch.name);
    if (sch) sch.status = 'live';

    this.recentActivities.unshift({
      id: `act-${Date.now()}`,
      text: `Live class started for ${batch.name} (${batch.nextTopic}) by ${teacher.name}`,
      time: 'Just now',
      type: 'live'
    });

    return this.liveSession;
  }

  endLiveClass(): typeof this.liveSession {
    const prevBatchName = this.liveSession.batchName || 'Class Session';
    this.liveSession.isActive = false;
    this.liveSession.isRecording = false;

    // Reset schedule event
    this.schedule.forEach(s => {
      if (s.status === 'live') s.status = 'completed';
    });

    this.recentActivities.unshift({
      id: `act-${Date.now()}`,
      text: `Live class concluded for ${prevBatchName}`,
      time: 'Just now',
      type: 'live'
    });

    this.liveSession.batchId = '';
    this.liveSession.batchName = '';
    return this.liveSession;
  }

  announcements: Announcement[] = [
    {
      id: 'ann-1',
      title: 'Class 10 Mid-Term Mathematics Mock Exam on Friday',
      content: 'All students must prepare Chapters 1 through 5. The 80-mark mock exam will be held during regular live classroom hours.',
      targetBatch: 'Class 10 Mathematics',
      priority: 'urgent',
      createdAt: '20 Oct 2026'
    },
    {
      id: 'ann-2',
      title: 'Science Practical Doubt Clearing Session Scheduled',
      content: 'Extra 45-minute lab concept review for Class 9 Science students this Thursday at 4 PM.',
      targetBatch: 'Class 9 Science',
      priority: 'normal',
      createdAt: '19 Oct 2026'
    },
    {
      id: 'ann-3',
      title: 'Diwali Break Schedule Update',
      content: 'Academy holiday schedule and recorded revision capsules will be published in the Content Library by this weekend.',
      targetBatch: 'All Batches',
      priority: 'normal',
      createdAt: '18 Oct 2026'
    }
  ];

  // 1. WhatsApp & SMS Notification Repository
  notifications: NotificationRecord[] = [
    {
      id: 'notif-1',
      recipientName: 'Rahul Verma',
      recipientPhone: '+91 98201 11001',
      recipientRole: 'student',
      channel: 'whatsapp',
      type: 'live_class',
      title: 'Class 10 Math Live Class Starting Now!',
      message: 'Namaste Rahul! Sarla Didi is live now for Class 10 Trigonometry. Click to join digital classroom with whiteboard and doubt chat.',
      status: 'delivered',
      sentAt: 'Today, 09:55 AM',
      batchName: 'Class 10 Mathematics',
      whatsAppDeepLink: 'https://wa.me/919820111001?text=Namaste%20Rahul!%20Class%2010%20Live%20Math%20has%20started%20on%20Anushree%20Academy.'
    },
    {
      id: 'notif-2',
      recipientName: 'Priya Patel',
      recipientPhone: '+91 98201 11002',
      recipientRole: 'student',
      channel: 'whatsapp',
      type: 'new_quiz',
      title: 'New Online Assessment: Trigonometry Master Quiz',
      message: 'New 20-mark MCQ test has been published for Class 10 Math. Instant scoring with solution key available upon submission.',
      status: 'delivered',
      sentAt: 'Yesterday, 04:30 PM',
      batchName: 'Class 10 Mathematics',
      whatsAppDeepLink: 'https://wa.me/919820111002?text=New%20Quiz%20Published%20on%20Anushree%20Academy.'
    },
    {
      id: 'notif-3',
      recipientName: 'Kavita Singhania',
      recipientPhone: '+91 98334 77889',
      recipientRole: 'student',
      channel: 'sms',
      type: 'registration_received',
      title: 'Admission Application Received',
      message: 'Namaste Kavita! Your admission request for Class 10 Mathematics at Anushree Academy is under review by Sarla Sharma. You will receive an approval alert shortly.',
      status: 'delivered',
      sentAt: 'Yesterday, 06:15 PM',
      batchName: 'Class 10 Mathematics'
    }
  ];

  // 2. Online Quizzes & Assessments
  quizzes: Quiz[] = [
    {
      id: 'quiz-1',
      title: 'Class 10: Trigonometry Identities & Heights Mastery Test',
      batchId: 'b-10-math',
      batchName: 'Class 10 Mathematics',
      subject: 'Mathematics',
      chapterName: 'Chapter 8 & 9: Introduction to Trigonometry',
      timeLimitMinutes: 15,
      totalMarks: 20,
      passMarks: 12,
      createdAt: '18 Oct 2026',
      createdByTeacherName: 'Sarla Sharma',
      isPublished: true,
      isLive: true,
      scheduledDate: 'Today',
      scheduledTime: '10:00 AM',
      questions: [
        {
          id: 'q1-1',
          questionText: 'If sin θ + cos θ = √2 cos θ, then what is the value of (cos θ - sin θ)?',
          options: ['√2 sin θ', '2 sin θ', '√2 cos θ', '1/2 sin θ'],
          correctOptionIndex: 0,
          explanation: 'Squaring both sides and using sin²θ + cos²θ = 1 gives (cos θ - sin θ)² = 2 sin²θ, so cos θ - sin θ = √2 sin θ.',
          marks: 5
        },
        {
          id: 'q1-2',
          questionText: 'What is the simplified value of (sec A + tan A)(1 - sin A)?',
          options: ['sec A', 'sin A', 'cosec A', 'cos A'],
          correctOptionIndex: 3,
          explanation: '(1/cos A + sin A/cos A)(1 - sin A) = (1 + sin A)(1 - sin A)/cos A = (1 - sin²A)/cos A = cos²A/cos A = cos A.',
          marks: 5
        },
        {
          id: 'q1-3',
          questionText: 'The angle of elevation of the top of a 30m high tower from a point on the ground is 30°. How far is the point from the foot of the tower?',
          options: ['30 m', '30√3 m', '10√3 m', '60 m'],
          correctOptionIndex: 1,
          explanation: 'tan(30°) = 30 / distance => 1/√3 = 30 / d => d = 30√3 meters.',
          marks: 5
        },
        {
          id: 'q1-4',
          questionText: 'If 4 tan θ = 3, then evaluate (4 sin θ - cos θ) / (4 sin θ + cos θ):',
          options: ['1/2', '1/3', '2/3', '3/4'],
          correctOptionIndex: 0,
          explanation: 'Divide numerator and denominator by cos θ: (4 tan θ - 1) / (4 tan θ + 1) = (3 - 1) / (3 + 1) = 2/4 = 1/2.',
          marks: 5
        }
      ]
    },
    {
      id: 'quiz-2',
      title: 'Class 9: Gravitation & Laws of Motion Assessment',
      batchId: 'b-9-sci',
      batchName: 'Class 9 Science',
      subject: 'Science',
      chapterName: 'Chapter 10: Gravitation',
      timeLimitMinutes: 10,
      totalMarks: 15,
      passMarks: 9,
      createdAt: '19 Oct 2026',
      createdByTeacherName: 'Sarla Sharma',
      isPublished: true,
      questions: [
        {
          id: 'q2-1',
          questionText: 'The value of acceleration due to gravity (g) at the center of the Earth is:',
          options: ['9.8 m/s²', 'Zero', 'Infinite', '4.9 m/s²'],
          correctOptionIndex: 1,
          explanation: 'At the exact center of the Earth, gravitational attraction from all directions cancels out symmetrically, resulting in g = 0.',
          marks: 5
        },
        {
          id: 'q2-2',
          questionText: 'If an object weighs 60 N on Earth, its weight on the Moon would be approximately:',
          options: ['60 N', '360 N', '10 N', '0 N'],
          correctOptionIndex: 2,
          explanation: 'The surface gravity on the Moon is roughly 1/6th of Earth gravity. Weight_Moon = 60 N / 6 = 10 N.',
          marks: 5
        },
        {
          id: 'q2-3',
          questionText: 'The Universal Law of Gravitation was formulated by:',
          options: ['Albert Einstein', 'Galileo Galilei', 'Sir Isaac Newton', 'Johannes Kepler'],
          correctOptionIndex: 2,
          explanation: 'Sir Isaac Newton established that every body in the universe attracts every other body with force proportional to mass product and inversely proportional to distance squared.',
          marks: 5
        }
      ]
    }
  ];

  quizSubmissions: QuizSubmission[] = [
    {
      id: 'sub-1',
      quizId: 'quiz-1',
      quizTitle: 'Class 10: Trigonometry Identities & Heights Mastery Test',
      studentId: 's-1',
      studentName: 'Rahul Verma',
      studentRollNumber: '10M-01',
      batchId: 'b-10-math',
      selectedAnswers: { 'q1-1': 0, 'q1-2': 3, 'q1-3': 1, 'q1-4': 0 },
      score: 20,
      totalMarks: 20,
      percentage: 100,
      isPassed: true,
      submittedAt: '19 Oct 2026, 05:20 PM',
      timeTakenSeconds: 540
    },
    {
      id: 'sub-2',
      quizId: 'quiz-1',
      quizTitle: 'Class 10: Trigonometry Identities & Heights Mastery Test',
      studentId: 's-2',
      studentName: 'Priya Patel',
      studentRollNumber: '10M-02',
      batchId: 'b-10-math',
      selectedAnswers: { 'q1-1': 0, 'q1-2': 3, 'q1-3': 1, 'q1-4': 0 },
      score: 20,
      totalMarks: 20,
      percentage: 100,
      isPassed: true,
      submittedAt: '19 Oct 2026, 06:10 PM',
      timeTakenSeconds: 610
    }
  ];

  // Custom teacher remarks for Report Cards
  teacherRemarksMap: Record<string, string> = {
    's-1': 'Exceptional problem solving in Trigonometry and Real Numbers. Highly active in doubt discussions. Ready for 95%+ in Board exams!',
    's-2': 'Outstanding consistency and perfect quiz scores. Excellent whiteboard participation during live sessions.',
    's-4': '100% attendance maintained. Strong conceptual grasp; keep practicing time management for lengthier proofs.'
  };

  // 4. Doubt Counter / Discussion Forum
  doubts: DoubtItem[] = [
    {
      id: 'dbt-1',
      studentId: 's-1',
      studentName: 'Rahul Verma',
      studentRollNumber: '10M-01',
      batchId: 'b-10-math',
      batchName: 'Class 10 Mathematics',
      subject: 'Mathematics',
      chapter: 'Chapter 1: Real Numbers',
      title: 'How do we prove that √5 is irrational using the method of contradiction?',
      description: 'I got confused in the step where we assume √5 = a/b where a and b are co-prime integers. When we square 5b² = a², how does that imply 5 divides a?',
      status: 'resolved',
      upvotes: 8,
      createdAt: '19 Oct 2026',
      replies: [
        {
          id: 'rep-1',
          authorName: 'Sarla Sharma',
          authorRole: 'teacher',
          authorAvatar: '/assets/images/image_72318e78.png',
          content: 'Great question Rahul! By Fundamental Theorem of Arithmetic (NCERT Theorem 1.3), if a prime p divides a², then p also divides a. Here since 5 divides a² and 5 is prime, 5 must divide a. Hence a = 5k. Substituting this gives 5b² = 25k² => b² = 5k², which means 5 also divides b. This contradicts that a and b are co-prime!',
          createdAt: '19 Oct 2026, 07:15 PM',
          isTeacherVerified: true
        },
        {
          id: 'rep-2',
          authorName: 'Sneha Roy',
          authorRole: 'student',
          content: 'Thank you Didi! The step substituting a = 5k made it crystal clear for my revision too.',
          createdAt: '19 Oct 2026, 07:45 PM',
          isTeacherVerified: false
        }
      ]
    },
    {
      id: 'dbt-2',
      studentId: 's-9',
      studentName: 'Aryan Joshi',
      studentRollNumber: '09S-01',
      batchId: 'b-9-sci',
      batchName: 'Class 9 Science',
      subject: 'Science',
      chapter: 'Chapter 10: Gravitation',
      title: 'Why does weight change from Earth to Moon while Mass remains identical everywhere?',
      description: 'Can someone explain the conceptual difference between inertial mass and gravitational weight with real numbers?',
      status: 'answered',
      upvotes: 5,
      createdAt: '20 Oct 2026',
      replies: [
        {
          id: 'rep-3',
          authorName: 'Sarla Sharma',
          authorRole: 'teacher',
          authorAvatar: '/assets/images/image_72318e78.png',
          content: 'Mass is the measure of the actual quantity of matter in an object (measured in kg), which never changes anywhere in the universe. Weight is the gravitational pull (W = m × g in Newtons). Because the Moon has less mass, its surface gravity is 1.63 m/s² (1/6th of Earth 9.8 m/s²), making your weight 6 times lighter!',
          createdAt: '20 Oct 2026, 11:30 AM',
          isTeacherVerified: true
        }
      ]
    }
  ];

  // 7. Smart Timetable & Calendar
  timetable: TimetableSlot[] = [
    { id: 'tt-1', dayOfWeek: 'Monday', batchId: 'b-10-math', batchName: 'Class 10 Mathematics', subject: 'Mathematics', startTime: '10:00 AM', endTime: '11:00 AM', roomCode: 'MTH-10-TRIG', topic: 'Trigonometric Identities & Formulas', teacherName: 'Sarla Sharma', color: 'teal' },
    { id: 'tt-2', dayOfWeek: 'Monday', batchId: 'b-9-sci', batchName: 'Class 9 Science', subject: 'Science', startTime: '11:30 AM', endTime: '12:30 PM', roomCode: 'SCI-09-PHYS', topic: 'Universal Law of Gravitation & Numericals', teacherName: 'Sarla Sharma', color: 'indigo' },
    { id: 'tt-3', dayOfWeek: 'Tuesday', batchId: 'b-10-math', batchName: 'Class 10 Mathematics', subject: 'Mathematics', startTime: '10:00 AM', endTime: '11:00 AM', roomCode: 'MTH-10-TRIG', topic: 'Heights and Distances & Board Questions', teacherName: 'Sarla Sharma', color: 'teal' },
    { id: 'tt-4', dayOfWeek: 'Wednesday', batchId: 'b-8-eng', batchName: 'Class 8 English', subject: 'English', startTime: '11:00 AM', endTime: '12:00 PM', roomCode: 'ENG-08-GRAM', topic: 'Active & Passive Voice Transformation', teacherName: 'Ananya Mukherjee', color: 'purple' },
    { id: 'tt-5', dayOfWeek: 'Thursday', batchId: 'b-10-math', batchName: 'Class 10 Mathematics', subject: 'Mathematics', startTime: '10:00 AM', endTime: '11:00 AM', roomCode: 'MTH-10-TRIG', topic: 'Quadratic Equations & Roots Analysis', teacherName: 'Sarla Sharma', color: 'teal' },
    { id: 'tt-6', dayOfWeek: 'Friday', batchId: 'b-9-sci', batchName: 'Class 9 Science', subject: 'Science', startTime: '11:30 AM', endTime: '12:30 PM', roomCode: 'SCI-09-PHYS', topic: 'Mass, Weight & Free Fall Experiments', teacherName: 'Rajesh Verma', color: 'indigo' },
    { id: 'tt-7', dayOfWeek: 'Saturday', batchId: 'b-10-math', batchName: 'Class 10 Mathematics', subject: 'Mathematics', startTime: '10:00 AM', endTime: '11:30 AM', roomCode: 'MTH-10-TRIG', topic: 'Weekly Doubt Clearing & Online MCQ Assessment', teacherName: 'Sarla Sharma', color: 'emerald' }
  ];

  // 8. Digital Certificates (Unique Verification Codes e.g. AA-FSDB-RK4579)
  certificates: DigitalCertificate[] = [
    {
      id: 'cert-1',
      certificateNumber: 'AA-FSDB-RK4579',
      verificationCode: 'AA-FSDB-RK4579',
      studentId: 's-1',
      studentName: 'Rahul Verma',
      studentRollNumber: '10M-01',
      batchId: 'b-prarambh',
      batchName: 'Prarambh Batch (Class 10 CBSE)',
      courseTitle: 'Secondary Comprehensive Foundation & Board Exam Preparation',
      issueDate: '15 Oct 2026',
      grade: 'A+ (Exemplary)',
      overallScore: 96,
      issuerName: 'Dr. Vikramaditya Sen',
      issuerTitle: 'Founder & Academic Director, Achiever Academy',
      leadInstructorName: 'Sarla Sharma',
      leadInstructorDesignation: 'Head of Academics & Senior Faculty',
      sealText: 'OFFICIAL SEAL • ACHIEVER ACADEMY • VERIFIED EXCELLENCE',
      verificationUrl: 'https://achieveracademy.edu/verify/AA-FSDB-RK4579',
      isUnlocked: true
    },
    {
      id: 'cert-2',
      certificateNumber: 'AA-FSDB-PP8820',
      verificationCode: 'AA-FSDB-PP8820',
      studentId: 's-2',
      studentName: 'Priya Patel',
      studentRollNumber: '10M-02',
      batchId: 'b-prarambh',
      batchName: 'Prarambh Batch (Class 10 CBSE)',
      courseTitle: 'Secondary Comprehensive Foundation & Board Exam Preparation',
      issueDate: '18 Oct 2026',
      grade: 'A+ (Exemplary)',
      overallScore: 98,
      issuerName: 'Dr. Vikramaditya Sen',
      issuerTitle: 'Founder & Academic Director, Achiever Academy',
      leadInstructorName: 'Sarla Sharma',
      leadInstructorDesignation: 'Head of Academics & Senior Faculty',
      sealText: 'OFFICIAL SEAL • ACHIEVER ACADEMY • VERIFIED EXCELLENCE',
      verificationUrl: 'https://achieveracademy.edu/verify/AA-FSDB-PP8820',
      isUnlocked: true
    }
  ];

  // 9. Smart Bookmarking & Quick Revision Notes
  bookmarks: StudentBookmark[] = [
    {
      id: 'bmk-1',
      studentId: 's-1',
      type: 'video_timestamp',
      title: 'sin²θ + cos²θ = 1 Identity Algebraic & Geometric Proof',
      batchName: 'Prarambh Batch',
      subjectName: 'Mathematics',
      chapterTitle: 'Chapter 8: Introduction to Trigonometry',
      targetId: 'rec-1',
      timestamp: '14:20',
      noteText: 'Important 5-mark board question proof. Remember pythagorean hypotenuse step.',
      createdAt: '22 Oct 2026'
    },
    {
      id: 'bmk-2',
      studentId: 's-1',
      type: 'note_page',
      title: 'Euclid Division Algorithm & Fundamental Theorem Formula Sheet',
      batchName: 'Prarambh Batch',
      subjectName: 'Mathematics',
      chapterTitle: 'Chapter 1: Real Numbers',
      targetId: 'note-m1',
      pageNumber: 3,
      noteText: 'Quick recap for HCF × LCM = a × b relation and irrationality theorems.',
      createdAt: '23 Oct 2026'
    },
    {
      id: 'bmk-3',
      studentId: 's-1',
      type: 'chapter_topic',
      title: 'Human Heart 4 Chambers & Double Circulation Flowchart',
      batchName: 'Prarambh Batch',
      subjectName: 'Science',
      chapterTitle: 'Chapter 6: Life Processes',
      targetId: 'note-s6',
      noteText: 'High probability diagram question for board exam.',
      createdAt: '24 Oct 2026'
    }
  ];

  // 10. Smart Progress Tracking & Analytics State
  studentProgressMap: Map<string, StudentProgress> = new Map([
    [
      's-1',
      {
        studentId: 's-1',
        completedLectureIds: ['rec-1', 'rec-2', 'rec-s1-1'],
        completedNoteIds: ['note-m1', 'note-m8', 'c-1'],
        completedChapterIds: ['ch-m-1'],
        overallPercentage: 42,
        totalHoursLogged: 48,
        lastUpdated: 'Today',
        subjectBreakdown: { 'Mathematics': 65, 'Science': 50, 'English': 35 }
      }
    ]
  ]);

  // 11. Digital Payment Receipts Archive
  receipts: PaymentReceipt[] = [];

  getActiveTeacher(): Teacher {
    return this.teachers.find(t => t.id === this.activeTeacherId) || this.teachers[0];
  }

  updateAcademy(settings: Partial<AcademySettings>): AcademySettings {
    this.academy = { ...this.academy, ...settings };
    return this.academy;
  }

  addTeacher(t: Omit<Teacher, 'id' | 'totalTeachingHours' | 'assignedBatches'>): Teacher {
    const newTeacher: Teacher = {
      ...t,
      id: `t-${Date.now()}`,
      totalTeachingHours: 0,
      assignedBatches: []
    };
    this.teachers.push(newTeacher);
    return newTeacher;
  }

  updateTeacher(id: string, updates: Partial<Teacher>): Teacher | null {
    const teacher = this.teachers.find(t => t.id === id);
    if (!teacher) return null;
    Object.assign(teacher, updates);
    return teacher;
  }

  deleteTeacher(id: string): boolean {
    const index = this.teachers.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.teachers.splice(index, 1);
    if (this.activeTeacherId === id) {
      this.activeTeacherId = this.teachers[0]?.id || '';
    }
    return true;
  }

  addBatch(batch: Omit<Batch, 'id' | 'studentCount' | 'lastClassDate' | 'status'>): Batch {
    const newBatch: Batch = {
      ...batch,
      id: `b-${Date.now()}`,
      studentCount: 0,
      lastClassDate: 'Not started yet',
      status: 'active'
    };
    this.batches.push(newBatch);
    if (batch.teacherId) {
      const teacher = this.teachers.find(t => t.id === batch.teacherId);
      if (teacher && !teacher.assignedBatches.includes(newBatch.id)) {
        teacher.assignedBatches.push(newBatch.id);
      }
    }
    return newBatch;
  }

  updateBatch(id: string, updates: Partial<Batch>): Batch | null {
    const batch = this.batches.find(b => b.id === id);
    if (!batch) return null;
    Object.assign(batch, updates);
    return batch;
  }

  addStudent(student: Omit<Student, 'id' | 'attendanceRate' | 'performanceScore' | 'status' | 'feeStatus' | 'feeDueAmount'>): Student {
    const targetBatch = this.batches.find(b => b.id === student.batchId);
    const newStudent: Student = {
      ...student,
      id: `s-${Date.now()}`,
      attendanceRate: 100,
      performanceScore: 85,
      feeStatus: 'paid',
      feeDueAmount: 0,
      lastFeePaidDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'enrolled',
      approvalStatus: 'approved',
      registeredAt: 'Today',
      isHandRaised: false,
      isMuted: true
    };
    this.students.push(newStudent);
    if (targetBatch) {
      targetBatch.studentCount += 1;
    }
    return newStudent;
  }

  /**
   * Student Self-Registration: Creates student with 'pending' status.
   */
  registerStudent(input: StudentRegistrationInput): Student {
    const targetBatch = this.batches.find(b => b.id === input.batchId) || this.batches[0];
    const newStudent: Student = {
      id: `s-reg-${Date.now()}`,
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: input.password || 'password123',
      batchId: targetBatch.id,
      batchName: targetBatch.name,
      rollNumber: `P-${Math.floor(100 + Math.random() * 900)}`,
      attendanceRate: 0,
      performanceScore: 0,
      feeStatus: 'pending',
      feeDueAmount: targetBatch.monthlyFee || 2500,
      status: 'pending',
      approvalStatus: 'pending',
      registeredAt: 'Just now',
      isHandRaised: false,
      isMuted: true
    };
    this.students.unshift(newStudent);

    // Auto-dispatch WhatsApp & SMS notification to student
    this.sendNotification({
      recipientName: newStudent.name,
      recipientPhone: newStudent.phone,
      recipientRole: 'student',
      channel: 'both',
      type: 'registration_received',
      title: 'Registration Received - Under Verification',
      message: `Namaste ${newStudent.name}! Your admission application for ${targetBatch.name} at Anushree Academy has been received. Sarla Sharma Didi is reviewing your application. You will receive an approval alert shortly.`,
      status: 'delivered',
      batchName: targetBatch.name
    });

    this.recentActivities.unshift({
      id: `act-${Date.now()}`,
      text: `New student registration: ${newStudent.name} (${targetBatch.name}) awaiting approval`,
      time: 'Just now',
      type: 'student'
    });

    return newStudent;
  }

  /**
   * Admin / Didi Approval: Sets student status to 'enrolled' and 'approved'
   */
  approveStudent(studentId: string): Student | null {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return null;
    student.status = 'enrolled';
    student.approvalStatus = 'approved';
    student.rollNumber = `${student.batchName.startsWith('Class 10') ? '10M' : student.batchName.startsWith('Class 9') ? '09S' : '08E'}-${Math.floor(20 + Math.random() * 80)}`;

    const targetBatch = this.batches.find(b => b.id === student.batchId);
    if (targetBatch) {
      targetBatch.studentCount += 1;
    }

    // Auto-dispatch WhatsApp & SMS notification confirming approval
    this.sendNotification({
      recipientName: student.name,
      recipientPhone: student.phone,
      recipientRole: 'student',
      channel: 'both',
      type: 'student_approved',
      title: 'Congratulations! Admission Approved',
      message: `Badhai ho ${student.name}! Your admission to Anushree Academy for ${student.batchName} is APPROVED! Roll Number: ${student.rollNumber}. You can now join live classes, access recorded lectures, quizzes and study notes.`,
      status: 'delivered',
      batchName: student.batchName
    });

    this.recentActivities.unshift({
      id: `act-${Date.now()}`,
      text: `Admin approved ${student.name}'s admission to ${student.batchName} (Roll: ${student.rollNumber})`,
      time: 'Just now',
      type: 'student'
    });

    return student;
  }

  /**
   * Admin / Didi Rejection
   */
  rejectStudent(studentId: string, reason?: string): Student | null {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return null;
    student.status = 'rejected';
    student.approvalStatus = 'rejected';
    student.rejectionReason = reason || 'Incomplete details or batch capacity full';

    this.recentActivities.unshift({
      id: `act-${Date.now()}`,
      text: `Registration for ${student.name} was declined (${student.rejectionReason})`,
      time: 'Just now',
      type: 'student'
    });

    return student;
  }

  payStudentFee(studentId: string, amount: number, paymentMode: 'UPI' | 'NetBanking' | 'Cash' | 'Card', transactionRef?: string): boolean {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return false;
    student.feeStatus = 'paid';
    student.feeDueAmount = 0;
    student.lastFeePaidDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    this.recentActivities.unshift({
      id: `act-${Date.now()}`,
      text: `${student.name} completed fee payment of ₹${amount} via ${paymentMode}${transactionRef ? ` (Ref: ${transactionRef})` : ''}`,
      time: 'Just now',
      type: 'fee'
    });
    return true;
  }

  addContent(item: Omit<ContentItem, 'id' | 'uploadedAt' | 'downloads'>): ContentItem {
    const newItem: ContentItem = {
      ...item,
      id: `c-${Date.now()}`,
      uploadedAt: 'Just now',
      downloads: 0
    };
    this.contentLibrary.unshift(newItem);
    return newItem;
  }

  deleteContent(id: string): boolean {
    const index = this.contentLibrary.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.contentLibrary.splice(index, 1);
    return true;
  }

  // Recorded Video Management
  addRecordedVideo(video: Omit<RecordedVideo, 'id' | 'recordedDate' | 'viewsCount'>): RecordedVideo {
    const newVideo: RecordedVideo = {
      ...video,
      id: `rec-${Date.now()}`,
      recordedDate: 'Today',
      viewsCount: 0
    };
    this.recordedVideos.unshift(newVideo);

    this.recentActivities.unshift({
      id: `act-${Date.now()}`,
      text: `Uploaded recorded lecture: ${video.title} for ${video.batchName}`,
      time: 'Just now',
      type: 'upload'
    });

    return newVideo;
  }

  deleteRecordedVideo(id: string): boolean {
    const index = this.recordedVideos.findIndex(v => v.id === id);
    if (index === -1) return false;
    this.recordedVideos.splice(index, 1);
    return true;
  }

  incrementVideoViews(id: string): number {
    const video = this.recordedVideos.find(v => v.id === id);
    if (video) {
      video.viewsCount += 1;
      return video.viewsCount;
    }
    return 0;
  }

  addChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const newMsg: ChatMessage = {
      ...msg,
      id: `m-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.chatMessages.push(newMsg);
    return newMsg;
  }

  toggleStudentHand(studentId: string): boolean {
    const student = this.students.find(s => s.id === studentId);
    if (student) {
      student.isHandRaised = !student.isHandRaised;
      return student.isHandRaised;
    }
    return false;
  }

  toggleStudentMute(studentId: string): boolean {
    const student = this.students.find(s => s.id === studentId);
    if (student) {
      student.isMuted = !student.isMuted;
      return student.isMuted;
    }
    return true;
  }

  muteAllStudents(): void {
    this.students.forEach(s => s.isMuted = true);
  }

  // 1. Notification Helper Methods
  sendNotification(notif: Omit<NotificationRecord, 'id' | 'sentAt' | 'whatsAppDeepLink'>): NotificationRecord {
    const cleanPhone = notif.recipientPhone.replace(/[^0-9]/g, '');
    const encodedMsg = encodeURIComponent(`${notif.title}\n\n${notif.message}\n\n- Anushree Academy`);
    const newNotif: NotificationRecord = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      whatsAppDeepLink: `https://wa.me/${cleanPhone}?text=${encodedMsg}`
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  getNotifications(filter?: { phone?: string; role?: string }): NotificationRecord[] {
    let list = this.notifications;
    if (filter?.phone) {
      const cleanTarget = filter.phone.replace(/[^0-9]/g, '');
      list = list.filter(n => n.recipientPhone.replace(/[^0-9]/g, '').includes(cleanTarget));
    }
    if (filter?.role) {
      list = list.filter(n => n.recipientRole === filter.role);
    }
    return list;
  }

  // 2. Online Quiz & Assessment Methods
  addQuiz(quiz: Omit<Quiz, 'id' | 'createdAt'>): Quiz {
    const newQuiz: Quiz = {
      ...quiz,
      id: `quiz-${Date.now()}`,
      isPublished: quiz.isPublished !== undefined ? quiz.isPublished : true,
      isLive: quiz.isLive !== undefined ? quiz.isLive : false,
      scheduledDate: quiz.scheduledDate || 'Today',
      scheduledTime: quiz.scheduledTime || '10:00 AM',
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    this.quizzes.unshift(newQuiz);

    // Auto-dispatch WhatsApp notification to batch students
    const targetStudents = this.students.filter(s => s.batchId === quiz.batchId && s.status === 'enrolled');
    targetStudents.forEach(st => {
      this.sendNotification({
        recipientName: st.name,
        recipientPhone: st.phone,
        recipientRole: 'student',
        channel: 'whatsapp',
        type: 'new_quiz',
        title: `New Online Assessment: ${quiz.title}`,
        message: `Namaste ${st.name}! A new online MCQ test has been published for ${quiz.subject} (${quiz.chapterName}). Time limit: ${quiz.timeLimitMinutes} mins, Total Marks: ${quiz.totalMarks}. Please attempt it on Achiever Academy portal.`,
        status: 'delivered',
        batchName: quiz.batchName
      });
    });

    this.recentActivities.unshift({
      id: `act-${Date.now()}`,
      text: `Published new test: "${quiz.title}" for ${quiz.batchName}`,
      time: 'Just now',
      type: 'quiz'
    });

    return newQuiz;
  }

  updateQuiz(id: string, updates: Partial<Quiz>): Quiz | null {
    const quiz = this.quizzes.find(q => q.id === id);
    if (!quiz) return null;
    Object.assign(quiz, updates);
    return quiz;
  }

  deleteQuiz(id: string): boolean {
    const index = this.quizzes.findIndex(q => q.id === id);
    if (index === -1) return false;
    this.quizzes.splice(index, 1);
    this.quizSubmissions = this.quizSubmissions.filter(s => s.quizId !== id);
    return true;
  }

  toggleQuizLive(id: string, isLive?: boolean): Quiz | null {
    const quiz = this.quizzes.find(q => q.id === id);
    if (!quiz) return null;
    quiz.isLive = isLive !== undefined ? isLive : !quiz.isLive;
    return quiz;
  }

  submitQuiz(submission: Omit<QuizSubmission, 'id' | 'submittedAt' | 'score' | 'percentage' | 'isPassed' | 'totalMarks'>): QuizSubmission {
    const quiz = this.quizzes.find(q => q.id === submission.quizId);
    let calculatedScore = 0;
    const totalMarks = quiz?.totalMarks || 20;

    if (quiz) {
      quiz.questions.forEach(q => {
        if (submission.selectedAnswers[q.id] === q.correctOptionIndex) {
          calculatedScore += q.marks;
        }
      });
    }

    const percentage = Math.round((calculatedScore / totalMarks) * 100);
    const passMarks = quiz?.passMarks || Math.round(totalMarks * 0.4);
    const isPassed = calculatedScore >= passMarks;

    const newSubmission: QuizSubmission = {
      ...submission,
      id: `sub-${Date.now()}`,
      score: calculatedScore,
      totalMarks,
      percentage,
      isPassed,
      submittedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.quizSubmissions.unshift(newSubmission);

    // Update student performance score
    const student = this.students.find(s => s.id === submission.studentId);
    if (student) {
      const studentSubs = this.quizSubmissions.filter(s => s.studentId === student.id);
      const avgPercentage = Math.round(studentSubs.reduce((acc, curr) => acc + curr.percentage, 0) / studentSubs.length);
      student.performanceScore = avgPercentage;
    }

    return newSubmission;
  }

  // 3. Student Performance & Report Cards
  getStudentReportCard(studentId: string): StudentReportCard | null {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return null;

    const studentSubs = this.quizSubmissions.filter(s => s.studentId === studentId);
    const avgScore = studentSubs.length > 0
      ? Math.round(studentSubs.reduce((acc, curr) => acc + curr.percentage, 0) / studentSubs.length)
      : student.performanceScore || 88;
    const highestScore = studentSubs.length > 0
      ? Math.max(...studentSubs.map(s => s.percentage))
      : student.performanceScore || 90;

    // Determine letter grade
    let grade = 'B';
    if (avgScore >= 95) grade = 'A+ (Exemplary)';
    else if (avgScore >= 85) grade = 'A (Distinction)';
    else if (avgScore >= 75) grade = 'B+ (Commendable)';
    else if (avgScore >= 60) grade = 'B (Good)';
    else grade = 'C (Needs Improvement)';

    const remarks = this.teacherRemarksMap[studentId] || `Demonstrates consistent interest and sincere effort in ${student.batchName}. Regular attendance and active participation in live classes.`;

    return {
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      batchName: student.batchName,
      grade,
      attendanceRate: student.attendanceRate || 95,
      totalClassesHeld: 24,
      classesAttended: Math.round(24 * ((student.attendanceRate || 95) / 100)),
      quizzesTaken: studentSubs.length || 2,
      averageQuizScore: avgScore,
      highestQuizScore: highestScore,
      assignmentsCompleted: 11,
      totalAssignments: 12,
      feeStatus: student.feeStatus === 'paid' ? 'paid' : 'pending',
      teacherRemarks: remarks,
      teacherName: 'Sarla Sharma',
      generatedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      quizBreakdown: studentSubs.map(s => ({
        quizTitle: s.quizTitle,
        score: s.score,
        totalMarks: s.totalMarks,
        percentage: s.percentage,
        date: s.submittedAt
      }))
    };
  }

  updateReportCardRemarks(studentId: string, remarks: string): boolean {
    this.teacherRemarksMap[studentId] = remarks;
    return true;
  }

  // 4. Doubt Counter / Forum Methods (Photo & Text Upload + AI Automated Solutions)
  addDoubt(doubt: Omit<DoubtItem, 'id' | 'createdAt' | 'replies' | 'upvotes' | 'status'> & { requestAiSolution?: boolean }): DoubtItem {
    const newDoubt: DoubtItem = {
      ...doubt,
      id: `dbt-${Date.now()}`,
      status: doubt.requestAiSolution !== false ? 'answered' : 'pending',
      upvotes: 0,
      createdAt: 'Just now',
      replies: []
    };

    // If student requested instant AI solution (default true)
    if (doubt.requestAiSolution !== false) {
      const aiContent = `⚡ Instant AI Tutor Solution:\n\n1. Concept Identified: ${doubt.subject} • ${doubt.chapter}\n2. Step-by-Step Breakdown: For "${doubt.title}", start by stating known board theorems. Verify unit consistency and solve systematically.\n3. Detailed Answer: ${doubt.description.length > 50 ? doubt.description.substring(0, 80) + '...' : doubt.description}\n\nOur faculty (Sarla Sharma) will review and verify this step-by-step resolution shortly!`;
      newDoubt.aiSolution = aiContent;
      newDoubt.replies.push({
        id: `rep-ai-${Date.now()}`,
        authorName: 'Anushree AI Doubt Bot',
        authorRole: 'ai_bot',
        content: aiContent,
        createdAt: 'Just now',
        isTeacherVerified: false,
        videoSolutionUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      });
    }

    this.doubts.unshift(newDoubt);
    return newDoubt;
  }

  updateDoubtStatus(doubtId: string, status: 'open' | 'answered' | 'resolved' | 'pending'): boolean {
    const doubt = this.doubts.find(d => d.id === doubtId);
    if (!doubt) return false;
    doubt.status = status;
    return true;
  }

  addDoubtReply(doubtId: string, reply: Omit<DoubtReply, 'id' | 'createdAt'>): DoubtReply | null {
    const doubt = this.doubts.find(d => d.id === doubtId);
    if (!doubt) return null;
    const newReply: DoubtReply = {
      ...reply,
      id: `rep-${Date.now()}`,
      createdAt: 'Just now'
    };
    doubt.replies.push(newReply);
    if (reply.authorRole === 'teacher' || reply.isTeacherVerified) {
      doubt.status = 'resolved';
    } else {
      doubt.status = 'answered';
    }
    return newReply;
  }

  verifyDoubtReply(doubtId: string, replyId: string): boolean {
    const doubt = this.doubts.find(d => d.id === doubtId);
    if (!doubt) return false;
    const reply = doubt.replies.find(r => r.id === replyId);
    if (!reply) return false;
    reply.isTeacherVerified = true;
    doubt.status = 'resolved';
    return true;
  }

  upvoteDoubt(doubtId: string): number {
    const doubt = this.doubts.find(d => d.id === doubtId);
    if (!doubt) return 0;
    doubt.upvotes += 1;
    return doubt.upvotes;
  }

  // 5. Smart Study Progress & Analytics Methods
  getStudentProgress(studentId: string): StudentProgress {
    let p = this.studentProgressMap.get(studentId);
    if (!p) {
      p = {
        studentId,
        completedLectureIds: ['rec-1', 'rec-2'],
        completedNoteIds: ['note-m1', 'note-m8'],
        completedChapterIds: ['ch-m-1'],
        overallPercentage: 38,
        totalHoursLogged: 36,
        lastUpdated: 'Today',
        subjectBreakdown: { 'Mathematics': 60, 'Science': 40, 'English': 25 }
      };
      this.studentProgressMap.set(studentId, p);
    }
    return p;
  }

  toggleProgressItem(studentId: string, itemId: string, itemType: 'lecture' | 'note' | 'chapter'): StudentProgress {
    const p = this.getStudentProgress(studentId);
    if (itemType === 'lecture') {
      if (p.completedLectureIds.includes(itemId)) {
        p.completedLectureIds = p.completedLectureIds.filter(id => id !== itemId);
      } else {
        p.completedLectureIds.push(itemId);
        p.totalHoursLogged += 1;
      }
    } else if (itemType === 'note') {
      if (p.completedNoteIds.includes(itemId)) {
        p.completedNoteIds = p.completedNoteIds.filter(id => id !== itemId);
      } else {
        p.completedNoteIds.push(itemId);
      }
    } else if (itemType === 'chapter') {
      if (p.completedChapterIds.includes(itemId)) {
        p.completedChapterIds = p.completedChapterIds.filter(id => id !== itemId);
      } else {
        p.completedChapterIds.push(itemId);
      }
    }

    // Dynamic progress percentage recalculation
    const totalDone = p.completedLectureIds.length + p.completedNoteIds.length + (p.completedChapterIds.length * 2);
    p.overallPercentage = Math.min(100, Math.round((totalDone / 16) * 100));
    p.lastUpdated = 'Just now';
    this.studentProgressMap.set(studentId, p);
    return p;
  }

  // 6. Smart Bookmarking & Quick Revision Methods
  getBookmarks(studentId: string): StudentBookmark[] {
    return this.bookmarks.filter(b => b.studentId === studentId);
  }

  addBookmark(data: Omit<StudentBookmark, 'id' | 'createdAt'>): StudentBookmark {
    const newBmk: StudentBookmark = {
      ...data,
      id: `bmk-${Date.now()}`,
      createdAt: 'Today'
    };
    this.bookmarks.unshift(newBmk);
    return newBmk;
  }

  deleteBookmark(id: string): boolean {
    const idx = this.bookmarks.findIndex(b => b.id === id);
    if (idx === -1) return false;
    this.bookmarks.splice(idx, 1);
    return true;
  }

  // 7. Smart Timetable Methods
  getTimetable(batchId?: string): TimetableSlot[] {
    if (batchId) {
      return this.timetable.filter(t => t.batchId === batchId);
    }
    return this.timetable;
  }

  addTimetableSlot(slot: Omit<TimetableSlot, 'id'>): TimetableSlot {
    const newSlot: TimetableSlot = {
      ...slot,
      id: `tt-${Date.now()}`
    };
    this.timetable.push(newSlot);
    return newSlot;
  }

  deleteTimetableSlot(id: string): boolean {
    const idx = this.timetable.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.timetable.splice(idx, 1);
    return true;
  }

  updateTimetableSlot(id: string, updates: Partial<TimetableSlot>): TimetableSlot | null {
    const slot = this.timetable.find(t => t.id === id);
    if (!slot) return null;
    Object.assign(slot, updates);
    return slot;
  }

  // 8. Digital Certificate Methods (Unique Verification Code AA-FSDB-RK4579)
  issueCertificate(data: { studentId: string; batchId: string; courseTitle?: string }): DigitalCertificate {
    const student = this.students.find(s => s.id === data.studentId);
    const batch = this.batches.find(b => b.id === data.batchId);

    // Generate unique code in format AA-FSDB-RK4579
    const initials = student ? student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AA';
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const verificationCode = `AA-FSDB-${initials}${randDigits}`;

    const newCert: DigitalCertificate = {
      id: `cert-${Date.now()}`,
      certificateNumber: verificationCode,
      verificationCode: verificationCode,
      studentId: data.studentId,
      studentName: student?.name || 'Student Achiever',
      studentRollNumber: student?.rollNumber || `10M-${Math.floor(10 + Math.random() * 90)}`,
      batchId: data.batchId,
      batchName: batch?.name || 'Academic Batch',
      courseTitle: data.courseTitle || `${batch?.name || 'Class 10 CBSE'} Comprehensive Program`,
      issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      grade: 'A+ (Exemplary)',
      overallScore: student?.performanceScore || 96,
      issuerName: this.certificateSettings.directorName,
      issuerTitle: `${this.certificateSettings.directorDesignation}, ${this.certificateSettings.academyName}`,
      leadInstructorName: this.certificateSettings.leadInstructorName,
      leadInstructorDesignation: this.certificateSettings.leadInstructorDesignation,
      sealText: this.certificateSettings.sealText,
      verificationUrl: `https://achieveracademy.edu/verify/${verificationCode}`,
      isUnlocked: true
    };

    this.certificates.unshift(newCert);

    // Auto-dispatch WhatsApp certificate announcement
    if (student) {
      this.sendNotification({
        recipientName: student.name,
        recipientPhone: student.phone,
        recipientRole: 'student',
        channel: 'whatsapp',
        type: 'announcement',
        title: 'Official Digital Certificate of Achievement Issued!',
        message: `Heartiest congratulations ${student.name}! Your official completion certificate for ${batch?.name} has been verified and issued (Code: ${verificationCode}). You can now preview and download your high-resolution copy from your student dashboard.`,
        status: 'delivered',
        batchName: batch?.name
      });
    }

    return newCert;
  }

  getStudentCertificates(studentId: string): DigitalCertificate[] {
    return this.certificates.filter(c => c.studentId === studentId);
  }

  getAllCertificates(): DigitalCertificate[] {
    return this.certificates;
  }

  verifyCertificate(code: string): DigitalCertificate | null {
    if (!code) return null;
    const clean = code.trim().toUpperCase();
    return this.certificates.find(c =>
      c.certificateNumber.toUpperCase() === clean ||
      (c.verificationCode && c.verificationCode.toUpperCase() === clean)
    ) || null;
  }

  getCertificateSettings(): CertificateSettings {
    return this.certificateSettings;
  }

  updateCertificateSettings(settings: Partial<CertificateSettings>): CertificateSettings {
    this.certificateSettings = { ...this.certificateSettings, ...settings, updatedAt: new Date().toISOString() };
    return this.certificateSettings;
  }

  // Dynamic Custom Classes, Subjects, and Folders (No Hardcoding)
  customGrades: string[] = ['Class 10', 'Class 9', 'Class 8', 'Class 7', 'Class 11 Science', 'Class 12 Board', 'Olympiad Foundation'];
  customSubjects: string[] = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Science', 'Computer Science'];
  customFolders: string[] = ['Class 10 Maths', 'Class 9 Science', 'Class 8 English', 'Assignments', 'Sample Papers', 'Board Revision'];

  addCustomGrade(grade: string): string[] {
    const trimmed = grade.trim();
    if (trimmed && !this.customGrades.includes(trimmed)) {
      this.customGrades.push(trimmed);
    }
    return this.customGrades;
  }

  addCustomSubject(subject: string): string[] {
    const trimmed = subject.trim();
    if (trimmed && !this.customSubjects.includes(trimmed)) {
      this.customSubjects.push(trimmed);
    }
    return this.customSubjects;
  }

  addCustomFolder(folder: string): string[] {
    const trimmed = folder.trim();
    if (trimmed && !this.customFolders.includes(trimmed)) {
      this.customFolders.push(trimmed);
    }
    return this.customFolders;
  }

  // ================= 9. COURSE CHECKOUT & 1-YEAR EXPIRATION LOGIC =================
  checkoutCourse(input: {
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
  }): { student: Student; enrollment: CourseEnrollment; receipt: PaymentReceipt } {
    const batch = this.batches.find((b) => b.id === input.batchId);
    const subject = batch?.subjects?.find((s) => s.id === input.subjectId);
    const batchName = batch ? batch.name : 'Enrolled Course';
    const subjectName = subject ? subject.name : (input.subjectId ? 'Selected Subject' : undefined);

    let student = this.students.find(
      (s) => (input.studentId && s.id === input.studentId) || s.email.toLowerCase() === input.studentEmail.toLowerCase()
    );

    // If new visitor, auto-create student account with instant active access
    if (!student) {
      const studentId = `s-${Date.now()}`;
      student = {
        id: studentId,
        batchId: input.batchId,
        batchName,
        name: input.studentName,
        rollNumber: `AA-${Math.floor(100 + Math.random() * 900)}`,
        email: input.studentEmail,
        phone: input.studentPhone,
        attendanceRate: 100,
        performanceScore: 90,
        feeStatus: 'paid',
        feeDueAmount: 0,
        lastFeePaidDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'enrolled',
        approvalStatus: 'approved',
        registeredAt: 'Just now',
        password: input.password || 'student123',
        purchasedBatchIds: [input.batchId],
        purchasedSubjectIds: input.subjectId ? [input.subjectId] : [],
        enrollments: []
      };
      this.students.unshift(student);
    } else {
      // Existing student: unlock batch & subject
      if (!student.purchasedBatchIds) student.purchasedBatchIds = [];
      if (!student.purchasedBatchIds.includes(input.batchId)) {
        student.purchasedBatchIds.push(input.batchId);
      }
      if (input.subjectId) {
        if (!student.purchasedSubjectIds) student.purchasedSubjectIds = [];
        if (!student.purchasedSubjectIds.includes(input.subjectId)) {
          student.purchasedSubjectIds.push(input.subjectId);
        }
      }
      student.feeStatus = 'paid';
      student.feeDueAmount = 0;
      student.status = 'enrolled';
      student.approvalStatus = 'approved';
    }

    // 1-Year automated validity expiration date
    const now = new Date();
    const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const enrolledAtStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const expiresAtStr = expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const txRef = input.transactionRef || `UPI-UTR-${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const enrollment: CourseEnrollment = {
      id: `enr-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentPhone: student.phone,
      batchId: input.batchId,
      batchName,
      subjectId: input.subjectId,
      subjectName,
      pricePaid: Number(input.pricePaid),
      paymentMode: input.paymentMode || 'UPI',
      transactionRef: txRef,
      enrolledAt: enrolledAtStr,
      expiresAt: expiresAtStr,
      status: 'active'
    };

    this.enrollments.unshift(enrollment);
    if (!student.enrollments) student.enrollments = [];
    student.enrollments.unshift(enrollment);

    // Generate Official Digital Payment Receipt
    const receiptNumber = `AA-REC-${Math.floor(100000 + Math.random() * 900000)}`;
    const studentPassword = input.password || student.password || 'student123';
    const directAccessUrl = `https://anushree-academy.edu/portal?batch=${input.batchId}&student=${student.id}`;

    const receipt: PaymentReceipt = {
      id: `rcpt-${Date.now()}`,
      receiptNumber,
      enrollmentId: enrollment.id,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentPhone: student.phone,
      batchId: input.batchId,
      batchName,
      subjectId: input.subjectId,
      subjectName,
      amount: Number(input.pricePaid),
      paymentMode: input.paymentMode || 'UPI',
      transactionRef: txRef,
      paymentDate: enrolledAtStr,
      accessValidUntil: expiresAtStr,
      status: 'success',
      generatedCredentials: {
        email: student.email,
        password: studentPassword
      },
      directAccessUrl
    };
    this.receipts.unshift(receipt);

    // Initialize or update student progress record
    this.getStudentProgress(student.id);

    // Reconcile Teacher Due according to their contract terms
    if (batch?.teacherId) {
      const contract = this.teacherContracts.find((c) => c.teacherId === batch.teacherId);
      if (contract && contract.revenueSharePercent > 0) {
        const teacherShare = (Number(input.pricePaid) * contract.revenueSharePercent) / 100;
        contract.pendingDue += Math.round(teacherShare);
      }
    }

    // Log Activity
    this.recentActivities.unshift({
      id: `act-${Date.now()}`,
      text: `${student.name} enrolled in ${subjectName ? `${batchName} - ${subjectName}` : batchName} for ₹${input.pricePaid} (Valid for 1 Year)`,
      time: 'Just now',
      type: 'fee'
    });

    // Auto-dispatch receipt SMS / WhatsApp with login credentials & direct access link
    this.sendNotification({
      recipientName: student.name,
      recipientPhone: student.phone,
      recipientRole: 'student',
      channel: 'both',
      type: 'fee_reminder',
      title: 'Digital Payment Receipt & Course Access - Anushree Academy',
      message: `Namaste ${student.name}!\n\nYour enrollment for ${subjectName ? `${batchName} (${subjectName})` : batchName} is SUCCESSFUL.\n\nReceipt No: ${receiptNumber}\nAmount Paid: ₹${input.pricePaid} (100% Online UPI Verified)\nUTR: ${txRef}\nValid Till: ${expiresAtStr}\n\nLogin Email: ${student.email}\nPassword: ${studentPassword}\nDirect Batch Access Link: ${directAccessUrl}\n\nWelcome to Anushree Academy family!`,
      status: 'delivered',
      batchName
    });

    return { student, enrollment, receipt };
  }

  getReceipts(studentId?: string): PaymentReceipt[] {
    if (studentId) {
      return this.receipts.filter(r => r.studentId === studentId);
    }
    return this.receipts;
  }

  getReceiptById(receiptId: string): PaymentReceipt | undefined {
    return this.receipts.find(r => r.id === receiptId || r.receiptNumber === receiptId);
  }

  // ================= 10. FINANCIAL TRACKER & BILLING METRICS =================
  getFinancialMetrics(): FinancialMetrics {
    const courseRevenue = this.enrollments.reduce((sum, e) => sum + Number(e.pricePaid || 0), 0);
    const legacyPaidCount = this.students.filter((s) => s.feeStatus === 'paid').length;
    // Add baseline past batch fees
    const totalRevenue = courseRevenue + (legacyPaidCount * 2500);

    const totalTeacherPayouts = this.teacherContracts.reduce((sum, c) => {
      const contractPayouts = c.payoutHistory.reduce((pSum, p) => pSum + Number(p.amount || 0), 0);
      return sum + contractPayouts;
    }, 0);

    // Fixed platform operations: cloud hosting, video streaming, SMS gateway
    const platformOperatingCosts = 18500 + Math.round(totalRevenue * 0.04);
    const netProfit = totalRevenue - totalTeacherPayouts - platformOperatingCosts;
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    return {
      totalRevenue,
      totalTeacherPayouts,
      platformOperatingCosts,
      netProfit,
      profitMargin,
      transactions: this.enrollments,
      contracts: this.teacherContracts
    };
  }

  // ================= 11. TEACHER PAYOUT & CONTRACT MANAGEMENT =================
  recordTeacherPayout(data: {
    teacherId: string;
    amount: number;
    paymentMode?: 'UPI' | 'Bank Transfer' | 'Cheque';
    transactionRef?: string;
    notes?: string;
  }): TeacherPayoutRecord | null {
    const contract = this.teacherContracts.find((c) => c.teacherId === data.teacherId);
    if (!contract) return null;

    const teacher = this.teachers.find((t) => t.id === data.teacherId);
    const teacherName = teacher ? teacher.name : contract.teacherName;

    const newPayout: TeacherPayoutRecord = {
      id: `pay-${Date.now()}`,
      teacherId: data.teacherId,
      teacherName,
      amount: Number(data.amount),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      paymentMode: data.paymentMode || 'Bank Transfer',
      transactionRef: data.transactionRef || `TRF-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      notes: data.notes || 'Faculty remuneration compensation',
      status: 'completed'
    };

    contract.payoutHistory.unshift(newPayout);
    contract.totalPaid += Number(data.amount);
    contract.pendingDue = Math.max(0, contract.pendingDue - Number(data.amount));

    this.recentActivities.unshift({
      id: `act-${Date.now()}`,
      text: `Remuneration of ₹${data.amount} disbursed to ${teacherName} (${newPayout.paymentMode})`,
      time: 'Just now',
      type: 'fee'
    });

    return newPayout;
  }

  updateTeacherContract(teacherId: string, updates: Partial<TeacherContract>): TeacherContract | null {
    const contract = this.teacherContracts.find((c) => c.teacherId === teacherId);
    if (!contract) return null;

    if (updates.model) contract.model = updates.model;
    if (updates.revenueSharePercent !== undefined) contract.revenueSharePercent = Number(updates.revenueSharePercent);
    if (updates.fixedMonthlySalary !== undefined) contract.fixedMonthlySalary = Number(updates.fixedMonthlySalary);
    if (updates.terms) contract.terms = updates.terms;
    if (updates.assignedSubjects) contract.assignedSubjects = updates.assignedSubjects;
    if (updates.renewalDate) contract.renewalDate = updates.renewalDate;

    return contract;
  }

  // ================= 12. DYNAMIC COURSE PRICING & DURATION MANAGEMENT =================
  updateCoursePricing(
    batchId: string,
    updates: {
      fullBatchPrice?: number;
      duration?: string;
      description?: string;
      monthlyFee?: number;
      subjects?: Array<{ id: string; price: number; duration: string; description?: string }>;
    }
  ): Batch | null {
    const batch = this.batches.find((b) => b.id === batchId);
    if (!batch) return null;

    if (updates.fullBatchPrice !== undefined) batch.fullBatchPrice = Number(updates.fullBatchPrice);
    if (updates.duration) batch.duration = updates.duration;
    if (updates.description) batch.description = updates.description;
    if (updates.monthlyFee !== undefined) batch.monthlyFee = Number(updates.monthlyFee);

    if (updates.subjects && batch.subjects) {
      updates.subjects.forEach((subjUpdate) => {
        const s = batch.subjects?.find((item) => item.id === subjUpdate.id);
        if (s) {
          if (subjUpdate.price !== undefined) s.price = Number(subjUpdate.price);
          if (subjUpdate.duration) s.duration = subjUpdate.duration;
          if (subjUpdate.description) s.description = subjUpdate.description;
        }
      });
    }

    return batch;
  }

  // ================= 13. LIVE CLASS CHAT MODERATION & USER BLOCKING =================
  blockStudentChat(studentId: string): boolean {
    this.blockedStudentIds.add(studentId);
    const student = this.students.find((s) => s.id === studentId);
    if (student) {
      student.isChatBlocked = true;
    }
    return true;
  }

  unblockStudentChat(studentId: string): boolean {
    this.blockedStudentIds.delete(studentId);
    const student = this.students.find((s) => s.id === studentId);
    if (student) {
      student.isChatBlocked = false;
    }
    return true;
  }

  isStudentChatBlocked(studentId: string): boolean {
    return this.blockedStudentIds.has(studentId);
  }

  // ================= 14. BATCH, SUBJECT & CHAPTER FULL CRUD =================
  deleteBatch(id: string): boolean {
    const idx = this.batches.findIndex(b => b.id === id);
    if (idx === -1) return false;
    this.batches.splice(idx, 1);
    return true;
  }

  addSubject(batchId: string, subjectData: Omit<BatchSubject, 'id'>): BatchSubject | null {
    const batch = this.batches.find(b => b.id === batchId);
    if (!batch) return null;
    if (!batch.subjects) batch.subjects = [];
    const newSubject: BatchSubject = {
      ...subjectData,
      id: `sub-${Date.now()}`,
      chapters: subjectData.chapters || []
    };
    batch.subjects.push(newSubject);
    return newSubject;
  }

  updateSubject(batchId: string, subjectId: string, updates: Partial<BatchSubject>): BatchSubject | null {
    const batch = this.batches.find(b => b.id === batchId);
    if (!batch || !batch.subjects) return null;
    const subject = batch.subjects.find(s => s.id === subjectId);
    if (!subject) return null;
    Object.assign(subject, updates);
    return subject;
  }

  deleteSubject(batchId: string, subjectId: string): boolean {
    const batch = this.batches.find(b => b.id === batchId);
    if (!batch || !batch.subjects) return false;
    const idx = batch.subjects.findIndex(s => s.id === subjectId);
    if (idx === -1) return false;
    batch.subjects.splice(idx, 1);
    return true;
  }

  addChapter(batchId: string, subjectId: string, chapterData: Omit<ChapterItem, 'id'>): ChapterItem | null {
    const batch = this.batches.find(b => b.id === batchId);
    if (!batch || !batch.subjects) return null;
    const subject = batch.subjects.find(s => s.id === subjectId);
    if (!subject) return null;
    if (!subject.chapters) subject.chapters = [];
    const newChapter: ChapterItem = {
      ...chapterData,
      id: `ch-${Date.now()}`,
      chapterNumber: chapterData.chapterNumber || (subject.chapters.length + 1),
      lectures: chapterData.lectures || [],
      notes: chapterData.notes || [],
      modelPapers: chapterData.modelPapers || []
    };
    subject.chapters.push(newChapter);
    return newChapter;
  }

  updateChapter(batchId: string, subjectId: string, chapterId: string, updates: Partial<ChapterItem>): ChapterItem | null {
    const batch = this.batches.find(b => b.id === batchId);
    if (!batch || !batch.subjects) return null;
    const subject = batch.subjects.find(s => s.id === subjectId);
    if (!subject || !subject.chapters) return null;
    const chapter = subject.chapters.find(c => c.id === chapterId);
    if (!chapter) return null;
    Object.assign(chapter, updates);
    return chapter;
  }

  deleteChapter(batchId: string, subjectId: string, chapterId: string): boolean {
    const batch = this.batches.find(b => b.id === batchId);
    if (!batch || !batch.subjects) return false;
    const subject = batch.subjects.find(s => s.id === subjectId);
    if (!subject || !subject.chapters) return false;
    const idx = subject.chapters.findIndex(c => c.id === chapterId);
    if (idx === -1) return false;
    subject.chapters.splice(idx, 1);
    return true;
  }

  // ================= 15. BATCH PURCHASE REQUESTS & AUTOMATED WHATSAPP DISPATCH =================
  getPurchaseRequests(): BatchPurchaseRequest[] {
    return this.purchaseRequests;
  }

  createPurchaseRequest(data: {
    studentId?: string;
    studentName: string;
    studentEmail: string;
    studentPhone: string;
    batchId: string;
    subjectId?: string;
    amount: number;
    paymentMode?: 'UPI' | 'NetBanking' | 'Cash' | 'Card';
    transactionRef: string;
    proofUrl?: string;
  }): BatchPurchaseRequest {
    const batch = this.batches.find(b => b.id === data.batchId);
    const subject = batch?.subjects?.find(s => s.id === data.subjectId);
    const receiptNum = `AA-PAY-${Math.floor(100000 + Math.random() * 900000)}`;

    const newReq: BatchPurchaseRequest = {
      id: `pur-${Date.now()}`,
      studentId: data.studentId || `s-${Date.now()}`,
      studentName: data.studentName,
      studentEmail: data.studentEmail,
      studentPhone: data.studentPhone,
      batchId: data.batchId,
      batchName: batch ? batch.name : 'Enrolled Batch',
      subjectId: data.subjectId,
      subjectName: subject ? subject.name : undefined,
      amount: Number(data.amount),
      paymentMode: data.paymentMode || 'UPI',
      transactionRef: data.transactionRef,
      status: 'pending_verification',
      receiptNumber: receiptNum,
      proofUrl: data.proofUrl,
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      whatsappMessageStatus: 'pending'
    };

    this.purchaseRequests.unshift(newReq);
    return newReq;
  }

  approvePurchaseRequest(id: string): { request: BatchPurchaseRequest; student: Student; notification: NotificationRecord } | null {
    const req = this.purchaseRequests.find(p => p.id === id);
    if (!req) return null;

    req.status = 'approved';
    req.verifiedAt = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Find or create student
    let student = this.students.find(s => s.id === req.studentId || s.email.toLowerCase() === req.studentEmail.toLowerCase());
    if (student) {
      if (!student.purchasedBatchIds) student.purchasedBatchIds = [];
      if (!student.purchasedBatchIds.includes(req.batchId)) {
        student.purchasedBatchIds.push(req.batchId);
      }
      student.status = 'enrolled';
      student.approvalStatus = 'approved';
      student.feeStatus = 'paid';
    } else {
      student = {
        id: req.studentId,
        batchId: req.batchId,
        batchName: req.batchName,
        name: req.studentName,
        rollNumber: `AA-${Math.floor(100 + Math.random() * 900)}`,
        email: req.studentEmail,
        phone: req.studentPhone,
        attendanceRate: 100,
        performanceScore: 90,
        feeStatus: 'paid',
        feeDueAmount: 0,
        status: 'enrolled',
        approvalStatus: 'approved',
        purchasedBatchIds: [req.batchId],
        enrollments: []
      };
      this.students.unshift(student);
    }

    // Add course enrollment
    const enrollment: CourseEnrollment = {
      id: `enr-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentPhone: student.phone,
      batchId: req.batchId,
      batchName: req.batchName,
      subjectId: req.subjectId,
      subjectName: req.subjectName,
      pricePaid: req.amount,
      paymentMode: req.paymentMode,
      transactionRef: req.transactionRef,
      enrolledAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'active'
    };
    this.enrollments.unshift(enrollment);
    if (!student.enrollments) student.enrollments = [];
    student.enrollments.unshift(enrollment);

    // AUTOMATED WHATSAPP NOTIFICATION
    // "Hello [Student Name], Welcome to Achiever Academy! 🎉 Your batch [Batch Name] has been successfully activated. Payment received: Rs. [Amount]. You can log in to your student dashboard and start your studies. All the best!"
    const whatsappMsg = `Hello ${student.name}, Welcome to Achiever Academy! 🎉 Your batch ${req.batchName} has been successfully activated. Payment received: Rs. ${req.amount}. You can log in to your student dashboard and start your studies. All the best!`;
    const cleanPhone = student.phone.replace(/[^0-9]/g, '');
    const deepLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

    const notif: NotificationRecord = {
      id: `notif-${Date.now()}`,
      recipientName: student.name,
      recipientPhone: student.phone,
      recipientRole: 'student',
      channel: 'whatsapp',
      type: 'student_approved',
      title: 'Batch Activation & Payment Approved',
      message: whatsappMsg,
      status: 'delivered',
      sentAt: 'Just now',
      batchName: req.batchName,
      whatsAppDeepLink: deepLink
    };
    this.notifications.unshift(notif);
    req.whatsappMessageStatus = 'delivered';

    return { request: req, student, notification: notif };
  }

  rejectPurchaseRequest(id: string, reason?: string): BatchPurchaseRequest | null {
    const req = this.purchaseRequests.find(p => p.id === id);
    if (!req) return null;
    req.status = 'rejected';
    req.rejectionReason = reason || 'Payment transaction verification failed';
    req.verifiedAt = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return req;
  }
}

export const dataStore = new AcademyDataStore();

