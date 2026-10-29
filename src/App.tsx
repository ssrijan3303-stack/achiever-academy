import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { DashboardPanel } from './components/DashboardPanel.tsx';
import { BatchesPanel } from './components/BatchesPanel.tsx';
import { LiveClassroomPanel } from './components/LiveClassroomPanel.tsx';
import { ContentLibraryPanel } from './components/ContentLibraryPanel.tsx';
import { StudentsPanel } from './components/StudentsPanel.tsx';
import { TeachersPanel } from './components/TeachersPanel.tsx';
import { SettingsPanel } from './components/SettingsPanel.tsx';
import { StudentPortalView } from './components/StudentPortalView.tsx';
import { RecordedVideosPanel } from './components/RecordedVideosPanel.tsx';
import { StudentAuthModal } from './components/StudentAuthModal.tsx';
import { AnnouncementsModal } from './components/AnnouncementsModal.tsx';
import { CalendarModal } from './components/CalendarModal.tsx';
import { QuizAssessmentPanel } from './components/QuizAssessmentPanel.tsx';
import { DoubtForumPanel } from './components/DoubtForumPanel.tsx';
import { SmartTimetablePanel } from './components/SmartTimetablePanel.tsx';
import { ReportCardModal } from './components/ReportCardModal.tsx';
import { CertificateModal } from './components/CertificateModal.tsx';
import { SecurePdfViewerModal } from './components/SecurePdfViewerModal.tsx';
import { NotificationsModal } from './components/NotificationsModal.tsx';
import { FinancialTrackerPanel } from './components/FinancialTrackerPanel.tsx';
import { TeacherDashboardPanel } from './components/TeacherDashboardPanel.tsx';
import { defaultEnrichedBatches } from './courseCatalog.ts';
import { supabase, isSupabaseConfigured } from './lib/supabase.ts';
import {
  AcademySettings,
  Teacher,
  Batch,
  Student,
  ContentItem,
  ChatMessage,
  ScheduleEvent,
  Announcement,
  UserRole,
  LiveSessionState,
  RecordedVideo,
  NotificationRecord,
  Quiz,
  QuizSubmission,
  DoubtItem,
  StudentReportCard,
  DigitalCertificate,
  TimetableSlot
} from './types.ts';

// Initial default state
const defaultAcademy: AcademySettings = {
  name: 'Achiever Academy',
  tagline: 'Premier Online Coaching & Board Exam Preparation',
  contactPhone: '+91 98765 43210',
  contactEmail: 'contact@achiever-academy.edu',
  address: 'Plot 42, Knowledge Park III, Greater Noida, UP, India',
  logoUrl: '',
  currency: '₹',
  upiId: 'achieveracademy@upi',
  upiPayeeName: 'Achiever Academy Coaching Fees',
  upiQrUrl: ''
};

const defaultTeachers: Teacher[] = [
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
    assignedBatches: ['b-10-math', 'b-9-sci'],
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
    assignedBatches: ['b-9-sci'],
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
    assignedBatches: ['b-8-eng'],
    rating: 4.9
  },
  {
    id: 't-pradeep',
    name: 'Pradeep Joshi',
    qualifications: 'B.Tech, CTET Qualified',
    email: 'pradeep.joshi@anushree-academy.edu',
    phone: '+91 98711 22334',
    subjectsExpertise: ['Mathematics', 'Mental Ability'],
    bio: 'Olympiad trainer known for quick Vedic math techniques and comprehensive algebra foundation.',
    avatarUrl: '',
    status: 'active',
    totalTeachingHours: 640,
    assignedBatches: [],
    rating: 4.7
  }
];

const defaultBatches: Batch[] = [...defaultEnrichedBatches];

const defaultStudents: Student[] = [
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
    purchasedSubjectIds: ['sub-p-math', 'sub-p-sci']
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
  
  // Sample Pending Self-Registered Students
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

const defaultRecordedVideos: RecordedVideo[] = [
  {
    id: 'rec-1',
    title: 'Class 10 Maths: Trigonometric Identities & Height Masterclass',
    batchId: 'b-10-math',
    batchName: 'Class 10 Mathematics',
    subject: 'Mathematics',
    chapterName: 'Chapter 8: Introduction to Trigonometry',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
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

const defaultContent: ContentItem[] = [
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

const defaultChatMessages: ChatMessage[] = [
  { id: 'm-1', sessionId: 'live-curr-01', senderName: 'Sarla Sharma', senderRole: 'teacher', message: 'Welcome students to Anushree Academy! Please join the class room once the session goes live.', timestamp: '10:00 AM' }
];

const defaultSchedule: ScheduleEvent[] = [
  { id: 'sch-1', batchName: 'Class 10 Mathematics', subject: 'Mathematics', teacherName: 'Sarla Sharma', time: '10:00 AM - 11:00 AM', topic: 'Trigonometry & Heights', date: 'Today', status: 'upcoming' },
  { id: 'sch-2', batchName: 'Class 9 Science', subject: 'Science', teacherName: 'Rajesh Verma', time: '11:30 AM - 12:30 PM', topic: 'Gravitation & Kepler Laws', date: 'Today', status: 'upcoming' },
  { id: 'sch-3', batchName: 'Class 8 English', subject: 'English', teacherName: 'Ananya Mukherjee', time: '04:00 PM - 05:00 PM', topic: 'Grammar & Essay Writing', date: 'Today', status: 'upcoming' }
];

const defaultActivities = [
  { id: 'act-1', text: 'New student Kavita Singhania registered for Class 10 Mathematics (Pending Approval)', time: 'Today, 09:15 AM', type: 'student' },
  { id: 'act-2', text: 'Class 10 completed Trigonometry Practice Set 1', time: '10:46 AM - 11:30 AM', type: 'class' },
  { id: 'act-3', text: 'Uploaded Chapter 2 Polynomials Notes & Formula Cheat Sheet', time: 'Yesterday, 04:15 PM', type: 'upload' },
  { id: 'act-4', text: 'Attendance marked for 25 students in Class 9 Science', time: 'Yesterday, 01:00 PM', type: 'attendance' },
  { id: 'act-5', text: 'Rahul Verma completed monthly tuition fee payment (₹2,800)', time: 'Yesterday, 02:40 PM', type: 'fee' }
];

const defaultAnnouncements: Announcement[] = [
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

const defaultTimetableSlots: TimetableSlot[] = [
  { id: 'tt-1', dayOfWeek: 'Monday', day: 'Monday', batchId: 'b-prarambh', batchName: 'Prarambh Batch (Class 10 CBSE)', subject: 'Mathematics', startTime: '10:00 AM', endTime: '11:00 AM', roomCode: 'MTH-10-TRIG', topic: 'Trigonometric Identities & Formulas', teacherName: 'Sarla Sharma', color: 'teal' },
  { id: 'tt-2', dayOfWeek: 'Monday', day: 'Monday', batchId: 'b-abhyas', batchName: 'Abhyas Batch (Class 9 Foundation)', subject: 'Science', startTime: '11:30 AM', endTime: '12:30 PM', roomCode: 'SCI-09-PHYS', topic: 'Universal Law of Gravitation & Numericals', teacherName: 'Sarla Sharma', color: 'indigo' },
  { id: 'tt-3', dayOfWeek: 'Tuesday', day: 'Tuesday', batchId: 'b-prarambh', batchName: 'Prarambh Batch (Class 10 CBSE)', subject: 'Mathematics', startTime: '10:00 AM', endTime: '11:00 AM', roomCode: 'MTH-10-TRIG', topic: 'Heights and Distances & Board Questions', teacherName: 'Sarla Sharma', color: 'teal' },
  { id: 'tt-4', dayOfWeek: 'Wednesday', day: 'Wednesday', batchId: 'b-sankalp', batchName: 'Sankalp Batch (Class 10 Crash Course)', subject: 'Mathematics', startTime: '04:00 PM', endTime: '05:30 PM', roomCode: 'SNK-10-BOARD', topic: 'Board Exam Rapid Revision: Arithmetic Progression', teacherName: 'Sarla Sharma', color: 'purple' },
  { id: 'tt-5', dayOfWeek: 'Thursday', day: 'Thursday', batchId: 'b-prarambh', batchName: 'Prarambh Batch (Class 10 CBSE)', subject: 'Mathematics', startTime: '10:00 AM', endTime: '11:00 AM', roomCode: 'MTH-10-TRIG', topic: 'Quadratic Equations & Roots Analysis', teacherName: 'Sarla Sharma', color: 'teal' },
  { id: 'tt-6', dayOfWeek: 'Friday', day: 'Friday', batchId: 'b-abhyas', batchName: 'Abhyas Batch (Class 9 Foundation)', subject: 'Science', startTime: '11:30 AM', endTime: '12:30 PM', roomCode: 'SCI-09-PHYS', topic: 'Mass, Weight & Free Fall Experiments', teacherName: 'Rajesh Verma', color: 'indigo' },
  { id: 'tt-7', dayOfWeek: 'Saturday', day: 'Saturday', batchId: 'b-prarambh', batchName: 'Prarambh Batch (Class 10 CBSE)', subject: 'Mathematics', startTime: '10:00 AM', endTime: '11:30 AM', roomCode: 'MTH-10-TRIG', topic: 'Weekly Doubt Clearing & Online MCQ Assessment', teacherName: 'Sarla Sharma', color: 'emerald' }
];

export default function App() {
  // Role & Navigation - Defaults to Unauthenticated Guest on public store
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('anushree_role');
    return (saved as UserRole) || 'guest';
  });
  const [activeView, setActiveView] = useState<string>(() => {
    const savedRole = localStorage.getItem('anushree_role');
    if (savedRole === 'student') return 'student-portal';
    if (savedRole === 'admin' || savedRole === 'teacher') return 'dashboard';
    return 'all-batches';
  });
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);

  // Master State
  const [academy, setAcademy] = useState<AcademySettings>(defaultAcademy);
  const [teachers, setTeachers] = useState<Teacher[]>(defaultTeachers);
  const [activeTeacherId, setActiveTeacherId] = useState<string>('t-sarla');
  const [batches, setBatches] = useState<Batch[]>(defaultBatches);
  const [students, setStudents] = useState<Student[]>(defaultStudents);
  const [activeStudentId, setActiveStudentId] = useState<string>('s-1');
  const [content, setContent] = useState<ContentItem[]>(defaultContent);
  const [recordedVideos, setRecordedVideos] = useState<RecordedVideo[]>(defaultRecordedVideos);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(defaultChatMessages);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>(defaultSchedule);
  const [activities, setActivities] = useState(defaultActivities);
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements);

  // Dynamic Live Classroom State
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [liveBatchId, setLiveBatchId] = useState<string | null>(null);
  const [liveSession, setLiveSession] = useState<LiveSessionState | null>(null);

  // Modals
  const [isStudentAuthOpen, setIsStudentAuthOpen] = useState(false);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Dynamic Academic Selectors (Grades, Subjects, Folders - No Hardcoding)
  const [customGrades, setCustomGrades] = useState<string[]>([
    'Class 10',
    'Class 9',
    'Class 8',
    'Class 11 Science',
    'Class 12 Science'
  ]);
  const [customSubjects, setCustomSubjects] = useState<string[]>([
    'Mathematics',
    'Science',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Social Science'
  ]);
  const [customFolders, setCustomFolders] = useState<string[]>([
    'Class 10 Maths',
    'Class 9 Science',
    'Class 8 English',
    'Assignments',
    'Sample Papers'
  ]);

  // Online Quizzes & Submissions
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmission[]>([]);

  // Doubt Counter & Discussion Forum
  const [doubts, setDoubts] = useState<DoubtItem[]>([]);

  // Smart Timetable & Calendar
  const [timetable, setTimetable] = useState<TimetableSlot[]>(defaultTimetableSlots);

  // Automated WhatsApp & SMS Notifications
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Digital Certificates
  const [certificates, setCertificates] = useState<DigitalCertificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<DigitalCertificate | null>(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  // Student Report Card Modal
  const [selectedReportCard, setSelectedReportCard] = useState<StudentReportCard | null>(null);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);

  // Secure Anti-Leak Watermarked PDF Viewer Modal
  const [securePdfItem, setSecurePdfItem] = useState<ContentItem | null>(null);
  const [isSecurePdfOpen, setIsSecurePdfOpen] = useState(false);

  // Dark Mode Toggle
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('anushree_dark_mode') === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('anushree_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Active person resolution
  const activeTeacher = teachers.find((t) => t.id === activeTeacherId) || teachers[0];
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];
  const activeBatch = batches.find((b) => b.id === activeStudent.batchId);

  const pendingApprovalsCount = students.filter(
    (s) => s.approvalStatus === 'pending' || s.status === 'pending'
  ).length;

  // Sync document title with academy name
  useEffect(() => {
    document.title = `${academy.name} - Online Teaching & Coaching Platform`;
  }, [academy.name]);

  // Initial load from backend API
  useEffect(() => {
    async function loadData() {
      try {
        const [
          academyRes,
          teachersRes,
          batchesRes,
          studentsRes,
          contentRes,
          chatRes,
          scheduleRes,
          annRes,
          liveRes,
          videoRes,
          quizzesRes,
          doubtsRes,
          timetableRes,
          certsRes,
          notifsRes,
          optionsRes
        ] = await Promise.allSettled([
          fetch('/api/academy').then((r) => r.json()),
          fetch('/api/teachers').then((r) => r.json()),
          fetch('/api/batches').then((r) => r.json()),
          fetch('/api/students').then((r) => r.json()),
          fetch('/api/content').then((r) => r.json()),
          fetch('/api/live-session/messages').then((r) => r.json()),
          fetch('/api/schedule').then((r) => r.json()),
          fetch('/api/announcements').then((r) => r.json()),
          fetch('/api/live-session/active').then((r) => r.json()),
          fetch('/api/recorded-videos').then((r) => r.json()),
          fetch('/api/quizzes').then((r) => r.json()),
          fetch('/api/doubts').then((r) => r.json()),
          fetch('/api/timetable').then((r) => r.json()),
          fetch('/api/certificates').then((r) => r.json()),
          fetch('/api/notifications').then((r) => r.json()),
          fetch('/api/academic/options').then((r) => r.json()),
        ]);

        if (academyRes.status === 'fulfilled' && academyRes.value.success) setAcademy(academyRes.value.data);
        if (teachersRes.status === 'fulfilled' && teachersRes.value.success) {
          setTeachers(teachersRes.value.data);
          if (teachersRes.value.activeTeacherId) setActiveTeacherId(teachersRes.value.activeTeacherId);
        }
        if (batchesRes.status === 'fulfilled' && batchesRes.value.success) setBatches(batchesRes.value.data);
        if (studentsRes.status === 'fulfilled' && studentsRes.value.success) setStudents(studentsRes.value.data);
        if (contentRes.status === 'fulfilled' && contentRes.value.success) setContent(contentRes.value.data);
        if (videoRes.status === 'fulfilled' && videoRes.value.success) setRecordedVideos(videoRes.value.data);
        if (chatRes.status === 'fulfilled' && chatRes.value.success) setChatMessages(chatRes.value.data);
        if (scheduleRes.status === 'fulfilled' && scheduleRes.value.success) setSchedule(scheduleRes.value.data);
        if (annRes.status === 'fulfilled' && annRes.value.success) setAnnouncements(annRes.value.data);
        if (quizzesRes.status === 'fulfilled' && quizzesRes.value.success) setQuizzes(quizzesRes.value.data);
        if (doubtsRes.status === 'fulfilled' && doubtsRes.value.success) setDoubts(doubtsRes.value.data);
        if (timetableRes.status === 'fulfilled' && timetableRes.value.success && timetableRes.value.data && timetableRes.value.data.length > 0) {
          const normalized = timetableRes.value.data.map((slot: any) => ({
            ...slot,
            day: slot.day || slot.dayOfWeek || 'Monday',
            dayOfWeek: slot.dayOfWeek || slot.day || 'Monday'
          }));
          setTimetable(normalized);
        }
        if (certsRes.status === 'fulfilled' && certsRes.value.success) setCertificates(certsRes.value.data);
        if (notifsRes.status === 'fulfilled' && notifsRes.value.success) setNotifications(notifsRes.value.data);
        if (optionsRes.status === 'fulfilled' && optionsRes.value.success && optionsRes.value.data) {
          if (optionsRes.value.data.grades) setCustomGrades(optionsRes.value.data.grades);
          if (optionsRes.value.data.subjects) setCustomSubjects(optionsRes.value.data.subjects);
          if (optionsRes.value.data.folders) setCustomFolders(optionsRes.value.data.folders);
        }
        if (liveRes.status === 'fulfilled' && liveRes.value.success && liveRes.value.data) {
          if (liveRes.value.data.isActive) {
            setIsLiveActive(true);
            setLiveBatchId(liveRes.value.data.batchId);
            setLiveSession(liveRes.value.data);
          } else {
            setIsLiveActive(false);
            setLiveBatchId(null);
            setLiveSession(null);
          }
        }
      } catch (err) {
        console.warn('Backend API connection running with local fallback:', err);
      }
    }
    loadData();
  }, []);

  // Handlers
  const handleSwitchRole = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('anushree_role', role);
    if (role === 'guest') {
      setActiveView('all-batches');
    } else if (role === 'student') {
      setActiveView('student-portal');
    } else {
      setActiveView('dashboard');
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem('anushree_role');
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out Supabase:', err);
      }
    }
    setCurrentRole('guest');
    setActiveView('all-batches');
  };

  // Strict Router Guard: Enforces portal isolation based on authenticated role
  const handleNavigate = (view: string) => {
    // 1. Guest View Interception
    if (currentRole === 'guest') {
      if (view === 'all-batches' || view === 'store') {
        setActiveView('all-batches');
        return;
      }
      if (view === 'timetable') {
        setActiveView('timetable');
        return;
      }
      // Protected views (student-portal, dashboard, live, recorded, content, quizzes, doubts, etc.)
      setAuthPromptMessage('Please Login or Register to Access Enrolled Courses');
      setIsStudentAuthOpen(true);
      return;
    }

    // 2. Strict Student Isolation Guard (Never allow access to faculty or admin control panels)
    if (currentRole === 'student') {
      const forbiddenForStudent = ['dashboard', 'teacher-dashboard', 'batches', 'financials', 'students', 'teachers', 'settings'];
      if (forbiddenForStudent.includes(view)) {
        setActiveView('student-portal');
        return;
      }
    }

    // 3. Strict Teacher / Faculty Isolation Guard (Never drop into student portal, guest store, or admin finance/settings)
    if (currentRole === 'teacher') {
      const forbiddenForTeacher = ['student-portal', 'all-batches', 'student-fees', 'bookmarks', 'financials', 'teachers', 'settings'];
      if (forbiddenForTeacher.includes(view)) {
        setActiveView('dashboard');
        return;
      }
    }

    setActiveView(view);
  };

  const handleSwitchTeacher = async (teacherId: string) => {
    setActiveTeacherId(teacherId);
    try {
      await fetch('/api/teachers/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId })
      });
    } catch {
      // Local state preserved
    }
  };

  // Dynamic Academic Options Handlers (No Hardcoding)
  const handleAddCustomGrade = async (grade: string) => {
    if (!grade || customGrades.includes(grade)) return;
    setCustomGrades((prev) => [...prev, grade]);
    try {
      await fetch('/api/academic/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'grade', value: grade })
      });
    } catch {
      // Local state preserved
    }
  };

  const handleAddCustomSubject = async (subject: string) => {
    if (!subject || customSubjects.includes(subject)) return;
    setCustomSubjects((prev) => [...prev, subject]);
    try {
      await fetch('/api/academic/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'subject', value: subject })
      });
    } catch {
      // Local state preserved
    }
  };

  const handleAddCustomFolder = async (folder: string) => {
    if (!folder || customFolders.includes(folder)) return;
    setCustomFolders((prev) => [...prev, folder]);
    try {
      await fetch('/api/academic/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'folder', value: folder })
      });
    } catch {
      // Local state preserved
    }
  };

  // Online Quiz & Assessment Handlers
  const handleAddQuiz = async (quizData: Omit<Quiz, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setQuizzes((prev) => [data.data, ...prev]);
        // Trigger automated alert for all students
        await handleSendNotification({
          recipientName: `${quizData.batchName} Students`,
          recipientPhone: '+91 98765 00000',
          recipientRole: 'student',
          channel: 'both',
          type: 'new_quiz',
          title: `New Online Assessment: ${quizData.title}`,
          message: `Dear Student, a new test "${quizData.title}" (${quizData.totalMarks} Marks, ${quizData.timeLimitMinutes} Mins) has been published for ${quizData.batchName}. Attempt now!`,
          batchName: quizData.batchName
        });
      }
    } catch (err) {
      console.error('Failed to create quiz:', err);
    }
  };

  const handleSubmitQuiz = async (
    quizId: string,
    answers: Record<string, number>,
    timeTakenSeconds: number
  ): Promise<QuizSubmission> => {
    const res = await fetch(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        studentRollNumber: activeStudent.rollNumber,
        batchId: activeStudent.batchId,
        selectedAnswers: answers,
        timeTakenSeconds
      })
    });
    const result = await res.json();
    if (result.success && result.data) {
      setQuizSubmissions((prev) => [result.data, ...prev]);
      return result.data;
    }
    throw new Error('Failed to submit quiz');
  };

  // Doubt Counter & Discussion Forum Handlers
  const handleAddDoubt = async (doubtData: {
    title: string;
    description: string;
    subject: string;
    chapter: string;
    batchId: string;
    batchName: string;
    photoUrl?: string;
  }) => {
    const student = currentRole === 'student' ? activeStudent : students[0];
    const payload = {
      ...doubtData,
      studentId: student.id,
      studentName: student.name,
      studentRollNumber: student.rollNumber
    };
    try {
      const res = await fetch('/api/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDoubts((prev) => [data.data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add doubt:', err);
    }
  };

  const handleAddDoubtReply = async (doubtId: string, content: string, isTeacher: boolean) => {
    const authorName = isTeacher ? activeTeacher.name : activeStudent.name;
    const authorRole = isTeacher ? 'teacher' : 'student';
    try {
      const res = await fetch(`/api/doubts/${doubtId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName,
          authorRole,
          content,
          isTeacherVerified: isTeacher
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDoubts((prev) =>
          prev.map((d) => (d.id === doubtId ? { ...d, replies: [...d.replies, data.data] } : d))
        );
      }
    } catch (err) {
      console.error('Failed to reply doubt:', err);
    }
  };

  const handleVerifyDoubtReply = async (doubtId: string, replyId: string) => {
    try {
      await fetch(`/api/doubts/${doubtId}/replies/${replyId}/verify`, { method: 'PUT' });
      setDoubts((prev) =>
        prev.map((d) =>
          d.id === doubtId
            ? {
                ...d,
                replies: d.replies.map((r) =>
                  r.id === replyId ? { ...r, isTeacherVerified: true } : r
                )
              }
            : d
        )
      );
    } catch (err) {
      console.error('Failed to verify reply:', err);
    }
  };

  const handleUpvoteDoubt = async (doubtId: string) => {
    try {
      const res = await fetch(`/api/doubts/${doubtId}/upvote`, { method: 'POST' });
      const data = await res.json();
      if (data.success && typeof data.upvotes === 'number') {
        setDoubts((prev) =>
          prev.map((d) => (d.id === doubtId ? { ...d, upvotes: data.upvotes } : d))
        );
      }
    } catch {
      setDoubts((prev) =>
        prev.map((d) => (d.id === doubtId ? { ...d, upvotes: d.upvotes + 1 } : d))
      );
    }
  };

  // Smart Timetable Handlers
  const handleAddTimetableSlot = async (slot: Omit<TimetableSlot, 'id'>) => {
    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slot)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTimetable((prev) => [...prev, data.data]);
      }
    } catch (err) {
      console.error('Failed to add timetable slot:', err);
    }
  };

  const handleUpdateTimetableSlot = async (id: string, updates: Partial<TimetableSlot>) => {
    try {
      setTimetable((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
      await fetch(`/api/timetable/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error('Failed to update timetable slot:', err);
    }
  };

  const handleDeleteTimetableSlot = async (id: string) => {
    try {
      await fetch(`/api/timetable/${id}`, { method: 'DELETE' });
      setTimetable((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete slot:', err);
    }
  };

  // Automated WhatsApp & SMS Notifications
  const handleSendNotification = async (notifData: {
    recipientName: string;
    recipientPhone: string;
    recipientRole: 'student' | 'teacher' | 'admin';
    channel: 'whatsapp' | 'sms' | 'both';
    type: 'registration_received' | 'student_approved' | 'new_quiz' | 'new_assignment' | 'announcement' | 'fee_reminder' | 'live_class';
    title: string;
    message: string;
    batchName?: string;
  }) => {
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifData)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setNotifications((prev) => [data.data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  };

  // Student Performance Report Card
  const handleViewReportCard = async (student: Student) => {
    try {
      const res = await fetch(`/api/students/${student.id}/report-card`);
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedReportCard(data.data);
      } else {
        setSelectedReportCard({
          studentId: student.id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          batchName: student.batchName,
          grade: student.performanceScore >= 90 ? 'A+' : student.performanceScore >= 80 ? 'A' : 'B+',
          attendanceRate: student.attendanceRate,
          totalClassesHeld: 48,
          classesAttended: Math.round((48 * student.attendanceRate) / 100),
          quizzesTaken: 4,
          averageQuizScore: student.performanceScore,
          highestQuizScore: 98,
          assignmentsCompleted: 6,
          totalAssignments: 6,
          feeStatus: student.feeStatus === 'paid' ? 'paid' : 'pending',
          teacherRemarks: `${student.name} demonstrates excellent conceptual clarity and consistent attendance at Anushree Academy.`,
          teacherName: activeTeacher.name,
          generatedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          quizBreakdown: [
            { quizTitle: 'Chapter 1 Real Numbers MCQ Assessment', score: 18, totalMarks: 20, percentage: 90, date: '14 Oct 2026' },
            { quizTitle: 'Chapter 2 Polynomials Diagnostic Test', score: 19, totalMarks: 20, percentage: 95, date: '18 Oct 2026' }
          ]
        });
      }
      setIsReportCardOpen(true);
    } catch {
      setIsReportCardOpen(true);
    }
  };

  const handleUpdateReportCardRemarks = async (studentId: string, remarks: string) => {
    try {
      const res = await fetch(`/api/students/${studentId}/report-card-remarks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedReportCard(data.data);
      }
    } catch (err) {
      console.error('Failed to update report card remarks:', err);
    }
  };

  // Digital Certificates
  const handleIssueCertificate = async (student: Student) => {
    try {
      const res = await fetch('/api/certificates/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          batchId: student.batchId,
          courseTitle: `${student.batchName} Mastery Program`
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCertificates((prev) => [data.data, ...prev]);
        setSelectedCertificate(data.data);
        setIsCertificateOpen(true);
      }
    } catch (err) {
      console.error('Failed to issue certificate:', err);
    }
  };

  // Secure Watermarked PDF Viewer
  const handleOpenSecurePdf = (item: ContentItem) => {
    setSecurePdfItem(item);
    setIsSecurePdfOpen(true);
  };

  const handleUpdateAcademy = async (updated: Partial<AcademySettings>) => {
    setAcademy((prev) => ({ ...prev, ...updated }));
    try {
      await fetch('/api/academy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch {
      // Local state preserved
    }
  };

  const handleAddTeacher = async (teacherData: Omit<Teacher, 'id' | 'totalTeachingHours' | 'assignedBatches'>) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `t-${Date.now()}`,
      totalTeachingHours: 0,
      assignedBatches: []
    };
    setTeachers((prev) => [...prev, newTeacher]);
    try {
      await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData)
      });
    } catch {
      // Local state preserved
    }
  };

  const handleUpdateTeacher = async (id: string, updates: Partial<Teacher>) => {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    try {
      await fetch(`/api/teachers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch {
      // Local state preserved
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    if (activeTeacherId === id) {
      setActiveTeacherId(teachers[0]?.id || '');
    }
    try {
      await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
    } catch {
      // Local state preserved
    }
  };

  const handleSendMessage = async (msgData: { message: string; isDoubt?: boolean }) => {
    const senderName = currentRole === 'student' ? activeStudent.name : activeTeacher.name;
    const senderRole = currentRole === 'student' ? 'student' : 'teacher';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sessionId: liveSession?.id || 'live-curr-01',
      senderName,
      senderRole,
      message: msgData.message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDoubt: Boolean(msgData.isDoubt)
    };

    setChatMessages((prev) => [...prev, newMsg]);

    try {
      await fetch('/api/live-session/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName,
          senderRole,
          message: msgData.message,
          isDoubt: msgData.isDoubt
        })
      });
    } catch {
      // Local state preserved
    }
  };

  const handleAddStudent = async (studentData: {
    name: string;
    batchId: string;
    batchName: string;
    email: string;
    phone: string;
  }) => {
    const newStudent: Student = {
      id: `s-${Date.now()}`,
      name: studentData.name,
      batchId: studentData.batchId,
      batchName: studentData.batchName,
      rollNumber: `R-${Math.floor(100 + Math.random() * 900)}`,
      email: studentData.email,
      phone: studentData.phone,
      attendanceRate: 100,
      performanceScore: 85,
      feeStatus: 'paid',
      feeDueAmount: 0,
      lastFeePaidDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'enrolled',
      approvalStatus: 'approved',
      isHandRaised: false,
      isMuted: true
    };

    setStudents((prev) => [newStudent, ...prev]);

    setBatches((prev) =>
      prev.map((b) => (b.id === studentData.batchId ? { ...b, studentCount: b.studentCount + 1 } : b))
    );

    try {
      await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
    } catch {
      // Local state preserved
    }
  };

  // Student Self-Registration Handler
  const handleStudentRegistered = (student: Student) => {
    setStudents((prev) => [student, ...prev]);
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        text: `New student registration: ${student.name} (${student.batchName}) awaiting admin verification`,
        time: 'Just now',
        type: 'student'
      },
      ...prev
    ]);
  };

  // Unified Role-Based Login Handler (Admin, Teacher, Student)
  const handleUnifiedLogin = (userRecord: any, role: UserRole = 'student') => {
    if (!role || !['admin', 'teacher', 'student'].includes(role)) {
      console.error('Invalid user role encountered on login:', role);
      return;
    }

    setCurrentRole(role);
    localStorage.setItem('anushree_role', role);
    setAuthPromptMessage(null);
    setIsStudentAuthOpen(false);

    if (role === 'admin') {
      setActiveView('dashboard');
    } else if (role === 'teacher') {
      if (userRecord?.id) {
        const matched = teachers.find(
          (t) => t.id === userRecord.id || (userRecord.email && t.email.toLowerCase() === userRecord.email.toLowerCase())
        );
        if (matched) {
          setActiveTeacherId(matched.id);
        } else if (teachers[0]) {
          setActiveTeacherId(teachers[0].id);
        }
      }
      setActiveView('dashboard'); // When isTeacher, renders TeacherDashboardPanel
    } else if (role === 'student') {
      if (userRecord && userRecord.name) {
        setStudents((prev) => {
          const exists = prev.some((s) => s.id === userRecord.id);
          return exists ? prev.map((s) => (s.id === userRecord.id ? userRecord : s)) : [userRecord, ...prev];
        });
        if (userRecord.id) {
          setActiveStudentId(userRecord.id);
        }
      }
      setActiveView('student-portal');
    }
  };

  const handleStudentLogin = (studentData: any, role?: UserRole) => {
    handleUnifiedLogin(studentData, role || 'student');
  };

  // Admin Approve Student Admission
  const handleApproveStudent = async (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const assignedRoll = `${student.batchName.startsWith('Class 10') ? '10M' : student.batchName.startsWith('Class 9') ? '09S' : '08E'}-${Math.floor(20 + Math.random() * 80)}`;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              status: 'enrolled',
              approvalStatus: 'approved',
              rollNumber: assignedRoll
            }
          : s
      )
    );

    setBatches((prev) =>
      prev.map((b) => (b.id === student.batchId ? { ...b, studentCount: b.studentCount + 1 } : b))
    );

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        text: `Admin approved admission for ${student.name} (${student.batchName})`,
        time: 'Just now',
        type: 'student'
      },
      ...prev
    ]);

    try {
      await fetch(`/api/students/${studentId}/approve`, { method: 'POST' });
      await handleSendNotification({
        recipientName: student.name,
        recipientPhone: student.phone,
        recipientRole: 'student',
        channel: 'both',
        type: 'student_approved',
        title: 'Admission Approved - Welcome to Anushree Academy!',
        message: `Dear ${student.name}, congratulations! Your admission for ${student.batchName} has been approved. Your Roll No is ${assignedRoll}. Please log in to join live classes & access study materials.`,
        batchName: student.batchName
      });
    } catch {
      // Local state preserved
    }
  };

  // Admin Reject Student Admission
  const handleRejectStudent = async (studentId: string, reason?: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              status: 'rejected',
              approvalStatus: 'rejected',
              rejectionReason: reason || 'Application declined by admin'
            }
          : s
      )
    );

    try {
      await fetch(`/api/students/${studentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
    } catch {
      // Local state preserved
    }
  };

  const handlePayFee = async (
    studentId: string,
    amount: number,
    paymentMode: 'UPI' | 'NetBanking' | 'Cash' | 'Card',
    transactionRef?: string
  ) => {
    const student = students.find((s) => s.id === studentId);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              feeStatus: 'paid',
              feeDueAmount: 0,
              lastFeePaidDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            }
          : s
      )
    );

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        text: `Fee payment of ₹${amount} recorded for student via ${paymentMode}${transactionRef ? ` (UTR: ${transactionRef})` : ''}`,
        time: 'Just now',
        type: 'fee'
      },
      ...prev
    ]);

    try {
      await fetch(`/api/students/${studentId}/pay-fee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, paymentMode, transactionRef })
      });

      if (student) {
        await handleSendNotification({
          recipientName: student.name,
          recipientPhone: student.phone,
          recipientRole: 'student',
          channel: 'both',
          type: 'fee_reminder',
          title: 'Fee Payment Receipt - Anushree Academy',
          message: `Dear ${student.name}, tuition fee of ₹${amount} has been received successfully via ${paymentMode}${transactionRef ? ` (Ref: ${transactionRef})` : ''}. Thank you!`,
          batchName: student.batchName
        });
      }
    } catch {
      // Local state preserved
    }
  };

  const handleCourseCheckout = async (checkoutData: {
    studentId?: string;
    studentName: string;
    studentEmail: string;
    studentPhone: string;
    password?: string;
    batchId: string;
    subjectId?: string;
    pricePaid: number;
    paymentMode?: 'UPI' | 'Card' | 'NetBanking' | 'Cash';
    transactionRef?: string;
  }) => {
    const targetStudentId = checkoutData.studentId || activeStudent.id;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === targetStudentId) {
          const currentBatchIds = s.purchasedBatchIds || [];
          const currentSubIds = s.purchasedSubjectIds || [];
          const updatedBatches = currentBatchIds.includes(checkoutData.batchId)
            ? currentBatchIds
            : [...currentBatchIds, checkoutData.batchId];
          const updatedSubs = checkoutData.subjectId && !currentSubIds.includes(checkoutData.subjectId)
            ? [...currentSubIds, checkoutData.subjectId]
            : currentSubIds;
          return {
            ...s,
            purchasedBatchIds: updatedBatches,
            purchasedSubjectIds: updatedSubs
          };
        }
        return s;
      })
    );

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        text: `Course unlocked: ${checkoutData.studentName} enrolled in ${checkoutData.subjectId || checkoutData.batchId} with 1-Year validity (₹${checkoutData.pricePaid})`,
        time: 'Just now',
        type: 'fee'
      },
      ...prev
    ]);

    try {
      const res = await fetch('/api/courses/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: targetStudentId,
          studentName: checkoutData.studentName,
          studentEmail: checkoutData.studentEmail,
          studentPhone: checkoutData.studentPhone,
          password: checkoutData.password,
          batchId: checkoutData.batchId,
          subjectId: checkoutData.subjectId,
          pricePaid: checkoutData.pricePaid,
          paymentMode: checkoutData.paymentMode || 'UPI',
          transactionRef: checkoutData.transactionRef || `UPI-UTR-${Math.floor(100000000000 + Math.random() * 900000000000)}`
        })
      });
      const data = await res.json();
      return { success: true, data: data.data };
    } catch {
      return { success: true };
    }
  };

  const handleUpdateBatchPricing = async (
    batchId: string,
    pricing: {
      fullBatchPrice?: number;
      duration?: string;
      subjects?: { id: string; price: number; duration: string }[];
    }
  ) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === batchId) {
          const updatedSubjects = b.subjects
            ? b.subjects.map((sub) => {
                const match = pricing.subjects?.find((s) => s.id === sub.id);
                if (match) {
                  return { ...sub, price: match.price, duration: match.duration };
                }
                return sub;
              })
            : b.subjects;
          return {
            ...b,
            fullBatchPrice: pricing.fullBatchPrice ?? b.fullBatchPrice,
            duration: pricing.duration ?? b.duration,
            subjects: updatedSubjects
          };
        }
        return b;
      })
    );

    try {
      await fetch('/api/courses/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId, ...pricing })
      });
    } catch {
      // Local state preserved
    }
  };

  const handleBlockStudent = async (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, isChatBlocked: true } : s))
    );
    try {
      await fetch('/api/live/chat-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
    } catch {
      // Local state preserved
    }
  };

  const handleUnblockStudent = async (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, isChatBlocked: false } : s))
    );
    try {
      await fetch('/api/live/chat-unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
    } catch {
      // Local state preserved
    }
  };


  const handleCreateBatch = async (batchData: {
    name: string;
    grade: string;
    subject: string;
    scheduleTime: string;
    nextTopic: string;
    teacherId?: string;
    monthlyFee?: number;
  }) => {
    const assignedTeacher = teachers.find((t) => t.id === batchData.teacherId) || activeTeacher;
    const newBatch: Batch = {
      id: `b-${Date.now()}`,
      name: batchData.name,
      grade: batchData.grade,
      subject: batchData.subject,
      studentCount: 0,
      lastClassDate: 'Not started yet',
      scheduleTime: batchData.scheduleTime,
      roomCode: `ROOM-${Math.floor(1000 + Math.random() * 9000)}`,
      nextTopic: batchData.nextTopic,
      status: 'active',
      teacherId: assignedTeacher.id,
      teacherName: assignedTeacher.name,
      monthlyFee: batchData.monthlyFee || 2500
    };

    setBatches((prev) => [...prev, newBatch]);

    try {
      await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchData)
      });
    } catch {
      // Local state preserved
    }
  };

  const handleUpdateBatch = async (batchId: string, updates: Partial<Batch>) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, ...updates } : b))
    );

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        text: `Batch settings updated for ${updates.name || 'Batch'} (Tuition Fee: ₹${updates.monthlyFee || 2500}/mo)`,
        time: 'Just now',
        type: 'batch'
      },
      ...prev
    ]);

    try {
      // 1. Persist to Express backend
      await fetch(`/api/batches/${batchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      // 2. Persist to Supabase database
      if (isSupabaseConfigured) {
        await supabase
          .from('batches')
          .update({
            name: updates.name,
            monthly_fee: updates.monthlyFee,
            schedule_time: updates.scheduleTime,
            next_topic: updates.nextTopic,
            teacher_id: updates.teacherId
          })
          .eq('id', batchId);
      }
    } catch (err) {
      console.error('Failed to update batch:', err);
    }
  };

  const handleUploadContent = async (item: {
    title: string;
    folderName: string;
    subfolderName: string;
    fileType: 'pdf' | 'video' | 'quiz' | 'doc';
    fileSize: string;
    details?: string;
    fileUrl?: string;
    fileName?: string;
  }) => {
    const newItem: ContentItem = {
      id: `c-${Date.now()}`,
      title: item.title,
      folderName: item.folderName,
      subfolderName: item.subfolderName,
      fileType: item.fileType,
      fileSize: item.fileSize,
      uploadedAt: 'Just now',
      downloads: 0,
      details: item.details,
      fileUrl: item.fileUrl,
      fileName: item.fileName
    };

    setContent((prev) => [newItem, ...prev]);

    try {
      await fetch('/api/content/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    } catch {
      // Local state preserved
    }
  };

  const handleDeleteContent = async (id: string) => {
    setContent((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/content/${id}`, { method: 'DELETE' });
    } catch {
      // Local state preserved
    }
  };

  // Recorded Video Handlers
  const handleAddRecordedVideo = async (videoData: Omit<RecordedVideo, 'id' | 'recordedDate' | 'viewsCount'>) => {
    const newVideo: RecordedVideo = {
      ...videoData,
      id: `rec-${Date.now()}`,
      recordedDate: 'Today',
      viewsCount: 0
    };

    setRecordedVideos((prev) => [newVideo, ...prev]);

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        text: `Uploaded recorded lecture: ${videoData.title} (${videoData.batchName})`,
        time: 'Just now',
        type: 'upload'
      },
      ...prev
    ]);

    try {
      await fetch('/api/recorded-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData)
      });
    } catch {
      // Local state preserved
    }
  };

  const handleDeleteRecordedVideo = async (id: string) => {
    setRecordedVideos((prev) => prev.filter((v) => v.id !== id));
    try {
      await fetch(`/api/recorded-videos/${id}`, { method: 'DELETE' });
    } catch {
      // Local state preserved
    }
  };

  const handleVideoWatched = async (id: string) => {
    setRecordedVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, viewsCount: v.viewsCount + 1 } : v))
    );
    try {
      await fetch(`/api/recorded-videos/${id}/view`, { method: 'POST' });
    } catch {
      // Local state preserved
    }
  };

  const handleAddAnnouncement = async (item: { title: string; content: string; targetBatch: string; priority: 'normal' | 'urgent' }) => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: item.title,
      content: item.content,
      targetBatch: item.targetBatch,
      priority: item.priority,
      createdAt: 'Just now'
    };

    setAnnouncements((prev) => [newAnn, ...prev]);

    try {
      await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    } catch {
      // Local state preserved
    }
  };

  const handleStartLiveClass = async (batchId: string) => {
    const batch = batches.find((b) => b.id === batchId) || batches[0];
    const newSession: LiveSessionState = {
      id: `live-${Date.now()}`,
      batchId: batch.id,
      batchName: batch.name,
      title: `${batch.name} - ${batch.nextTopic}`,
      subject: batch.subject,
      topic: batch.nextTopic,
      jitsiRoomName: `AnushreeAcademy_${batch.id.replace(/[^a-zA-Z0-9]/g, '_')}_Live`,
      isActive: true,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      participantsCount: batch.studentCount || 85,
      isRecording: true,
      isTeacherMuted: false,
      isTeacherVideoOn: true,
      isScreenSharing: false
    };

    setIsLiveActive(true);
    setLiveBatchId(batch.id);
    setLiveSession(newSession);

    // Dynamically mark schedule event as live
    setSchedule((prev) =>
      prev.map((s) => (s.batchName === batch.name ? { ...s, status: 'live' } : s))
    );

    // Add activity log
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        text: `Live class started for ${batch.name} (${batch.nextTopic}) by ${activeTeacher.name}`,
        time: 'Just now',
        type: 'live'
      },
      ...prev
    ]);

    setActiveView('live');

    try {
      await fetch('/api/live-session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: batch.id })
      });
    } catch {
      // Local state preserved
    }
  };

  const handleEndClass = async () => {
    const currentBatchName = liveSession?.batchName || batches.find((b) => b.id === liveBatchId)?.name || 'Class Session';
    
    // Immediately set live session to inactive and reset live state
    setIsLiveActive(false);
    setLiveBatchId(null);
    setLiveSession(null);

    // Revert schedule status from live to completed
    setSchedule((prev) =>
      prev.map((s) => (s.status === 'live' ? { ...s, status: 'completed' } : s))
    );

    // Add conclusion activity
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        text: `Live class concluded for ${currentBatchName}. Student attendance saved.`,
        time: 'Just now',
        type: 'live'
      },
      ...prev
    ]);

    // Safely exit live stream view and redirect to dashboard or student portal
    setActiveView((prev) => (prev === 'live' ? (currentRole === 'student' ? 'student-portal' : 'dashboard') : prev));

    try {
      await fetch('/api/live-session/end', { method: 'POST' });
    } catch {
      // Local state preserved
    }
  };

  const handleToggleQuizLive = async (quizId: string) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, isLive: !q.isLive } : q))
    );
    try {
      await fetch(`/api/quizzes/${quizId}/toggle-live`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to toggle quiz live status:', err);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    try {
      await fetch(`/api/quizzes/${quizId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete quiz:', err);
    }
  };

  const isAdmin = currentRole === 'admin';
  const isTeacher = currentRole === 'teacher';

  return (
    <div className="min-h-screen bg-[#F0F6F6] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-teal-700 selection:text-white transition-colors">
      
      {/* Clean Commercial Header with Anushree Academy Branding & Dark Mode */}
      <Navbar
        academy={academy}
        activeTeacher={activeTeacher}
        allTeachers={teachers}
        activeStudent={activeStudent}
        currentRole={currentRole}
        onSwitchRole={handleSwitchRole}
        onSwitchTeacher={handleSwitchTeacher}
        onNavigate={handleNavigate}
        onOpenAnnouncements={() => setIsAnnouncementsOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        unreadAnnouncementsCount={announcements.length}
        onOpenStudentAuth={() => {
          setAuthPromptMessage(null);
          setIsStudentAuthOpen(true);
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenNotificationsHub={() => setIsNotificationsOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          onViewChange={handleNavigate}
          isLiveActive={isLiveActive}
          activeTeacher={activeTeacher}
          activeStudent={activeStudent}
          currentRole={currentRole}
          onSwitchRole={handleSwitchRole}
          pendingApprovalsCount={pendingApprovalsCount}
          onOpenStudentAuth={() => {
            setAuthPromptMessage(null);
            setIsStudentAuthOpen(true);
          }}
          onRequireAuth={(msg) => {
            setAuthPromptMessage(msg || 'Please Login or Register to Access Enrolled Courses');
            setIsStudentAuthOpen(true);
          }}
          onSignOut={handleSignOut}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Guest / Visitor Mode (Public Store) OR Authenticated Student Portal */}
            {(currentRole === 'guest' || currentRole === 'student') &&
              (activeView === 'student-portal' || activeView === 'all-batches' || activeView === 'student-fees' || activeView === 'bookmarks') && (
              <StudentPortalView
                isGuest={currentRole === 'guest'}
                initialView={activeView === 'bookmarks' ? 'bookmarks' : undefined}
                onRequireAuth={(msg) => {
                  setAuthPromptMessage(msg || 'Please Login or Register to Access Enrolled Courses');
                  setIsStudentAuthOpen(true);
                }}
                student={activeStudent}
                batch={activeBatch}
                allBatches={batches}
                academy={academy}
                schedule={schedule}
                content={content}
                videos={recordedVideos}
                announcements={announcements}
                quizzes={quizzes}
                submissions={quizSubmissions}
                doubts={doubts}
                reportCard={selectedReportCard}
                certificates={certificates.filter((c) => c.studentId === activeStudent.id)}
                notifications={notifications}
                isLiveActive={isLiveActive}
                liveSession={liveSession}
                onJoinLiveClass={handleStartLiveClass}
                onPayFee={handlePayFee}
                onCourseCheckout={handleCourseCheckout}
                onOpenSecurePdf={handleOpenSecurePdf}
                onOpenReportCard={() => handleViewReportCard(activeStudent)}
                onOpenCertificate={(cert) => {
                  setSelectedCertificate(cert);
                  setIsCertificateOpen(true);
                }}
                onSubmitQuiz={handleSubmitQuiz}
                onAddDoubt={handleAddDoubt}
                onAddReply={handleAddDoubtReply}
                onUpvoteDoubt={handleUpvoteDoubt}
                onOpenStudentAuth={() => {
                  setAuthPromptMessage(null);
                  setIsStudentAuthOpen(true);
                }}
                onUpdateBatch={handleUpdateBatch}
              />
            )}

            {/* Quiz & Assessment Panel (Accessible to both Teacher & Student) */}
            {activeView === 'quizzes' && (
              <QuizAssessmentPanel
                quizzes={quizzes}
                submissions={quizSubmissions}
                batches={batches}
                currentStudent={currentRole === 'student' ? activeStudent : undefined}
                isAdmin={isAdmin || isTeacher}
                availableSubjects={customSubjects}
                onAddCustomSubject={handleAddCustomSubject}
                onAddQuiz={handleAddQuiz}
                onToggleQuizLive={handleToggleQuizLive}
                onDeleteQuiz={handleDeleteQuiz}
                onSubmitQuiz={handleSubmitQuiz}
                onClose={() => setActiveView(isTeacher ? 'dashboard' : 'student-portal')}
              />
            )}

            {/* Smart Timetable & Calendar Panel (Accessible to both Teacher & Student) */}
            {activeView === 'timetable' && (
              <SmartTimetablePanel
                timetable={timetable}
                batches={batches}
                currentStudent={currentRole === 'student' ? activeStudent : undefined}
                currentTeacher={isTeacher ? activeTeacher : undefined}
                isAdmin={isAdmin}
                onJoinLiveClass={handleStartLiveClass}
                onAddSlot={handleAddTimetableSlot}
                onUpdateSlot={handleUpdateTimetableSlot}
                onDeleteSlot={handleDeleteTimetableSlot}
                onClose={() => setActiveView(isTeacher ? 'dashboard' : isAdmin ? 'dashboard' : 'student-portal')}
              />
            )}

            {/* Doubt Forum & Discussion Panel (Accessible to both Teacher & Student) */}
            {activeView === 'doubts' && (
              <DoubtForumPanel
                doubts={doubts}
                batches={batches}
                currentStudent={currentRole === 'student' ? activeStudent : undefined}
                activeTeacher={activeTeacher}
                isAdmin={isAdmin}
                onAddDoubt={handleAddDoubt}
                onAddReply={handleAddDoubtReply}
                onVerifyReply={handleVerifyDoubtReply}
                onUpvoteDoubt={handleUpvoteDoubt}
              />
            )}

            {/* Recorded Video Lectures Panel (Accessible to both Teacher & Student with Quality Selector) */}
            {activeView === 'recorded' && (
              <RecordedVideosPanel
                videos={recordedVideos}
                batches={batches}
                currentRole={currentRole}
                availableSubjects={customSubjects}
                onAddCustomSubject={handleAddCustomSubject}
                onAddVideo={handleAddRecordedVideo}
                onDeleteVideo={handleDeleteRecordedVideo}
                onVideoWatched={handleVideoWatched}
              />
            )}

            {/* Content Library & Assignments (With Real File Picker, Dynamic Custom Folders & Anti-Leak Watermark) */}
            {activeView === 'content' && (
              <ContentLibraryPanel
                content={content}
                isAdmin={isAdmin}
                customFolders={customFolders}
                onAddCustomFolder={handleAddCustomFolder}
                onOpenSecurePdf={handleOpenSecurePdf}
                onUploadContent={handleUploadContent}
                onDeleteContent={isAdmin ? handleDeleteContent : () => alert('Student accounts cannot delete resources.')}
              />
            )}

            {/* WhatsApp & SMS Alerts Hub View */}
            {activeView === 'notifications' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      Automated WhatsApp & SMS Notifications Hub
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Send real-time alerts, review dispatch logs, and launch WhatsApp direct links.
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setIsNotificationsOpen(true)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white shadow-sm flex items-center gap-1.5 cursor-pointer self-start"
                    >
                      <span>+ Compose Broadcast</span>
                    </button>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-teal-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-teal-50 dark:border-slate-800">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Recent Automated Dispatches ({notifications.length} alerts)
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full font-bold">
                      Gateway Status: ACTIVE 🟢
                    </span>
                  </div>

                  <div className="divide-y divide-teal-50 dark:divide-slate-800 mt-2">
                    {notifications.length === 0 ? (
                      <p className="py-8 text-center text-xs text-slate-400 font-medium">No notifications sent yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                n.channel === 'whatsapp'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : n.channel === 'sms'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              }`}>
                                {n.channel}
                              </span>
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {n.recipientName} ({n.recipientPhone})
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {n.sentAt}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-teal-900 dark:text-teal-300">
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                          {n.whatsAppDeepLink && (
                            <a
                              href={n.whatsAppDeepLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs self-start"
                            >
                              <span>Open in WhatsApp</span>
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Autonomous Dedicated Teacher Dashboard (Academic scope strictly enforced, financial controls hidden) */}
            {isTeacher && (activeView === 'dashboard' || activeView === 'teacher-dashboard') && (
              <TeacherDashboardPanel
                teacher={activeTeacher}
                batches={batches}
                students={students}
                doubts={doubts}
                timetable={timetable}
                quizzes={quizzes}
                quizSubmissions={quizSubmissions}
                content={content}
                recordedVideos={recordedVideos}
                onStartLiveClass={handleStartLiveClass}
                onAddDoubtReply={async (doubtId, reply) => {
                  await handleAddDoubtReply(doubtId, reply, true);
                }}
                onAddQuiz={handleAddQuiz}
                onToggleQuizLive={handleToggleQuizLive}
                onDeleteQuiz={handleDeleteQuiz}
                onUploadContent={handleUploadContent}
                onDeleteContent={handleDeleteContent}
                onAddVideo={handleAddRecordedVideo}
                onDeleteVideo={handleDeleteRecordedVideo}
                onAddTimetableSlot={handleAddTimetableSlot}
                onUpdateTimetableSlot={handleUpdateTimetableSlot}
                onDeleteTimetableSlot={handleDeleteTimetableSlot}
                onClose={() => setActiveView('dashboard')}
              />
            )}

            {/* Admin Master Dashboard View */}
            {isAdmin && activeView === 'dashboard' && (
              <DashboardPanel
                teacher={activeTeacher}
                batches={batches}
                students={students}
                schedule={schedule}
                activities={activities}
                isLiveActive={isLiveActive}
                liveSession={liveSession}
                onStartLiveClass={handleStartLiveClass}
                onEndLiveClass={handleEndClass}
                onViewAllClasses={() => setActiveView('batches')}
                onViewBatches={() => setActiveView('batches')}
                onViewStudents={() => setActiveView('students')}
              />
            )}

            {isAdmin && activeView === 'batches' && (
              <BatchesPanel
                batches={batches}
                students={students}
                teachers={teachers}
                isLiveActive={isLiveActive}
                liveBatchId={liveBatchId}
                onAddStudent={handleAddStudent}
                onCreateBatch={handleCreateBatch}
                onUpdateBatch={handleUpdateBatch}
                onStartLiveClass={handleStartLiveClass}
                availableGrades={customGrades}
                availableSubjects={customSubjects}
                onAddCustomGrade={handleAddCustomGrade}
                onAddCustomSubject={handleAddCustomSubject}
              />
            )}

            {/* Live Classroom Screen (Accessible to both Teacher & Student) */}
            {activeView === 'live' && (
              <LiveClassroomPanel
                students={students}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                onEndClass={handleEndClass}
                isLiveActive={isLiveActive}
                onStartClass={handleStartLiveClass}
                batches={batches}
                currentRole={currentRole}
                currentStudent={currentRole === 'student' ? activeStudent : undefined}
                onBlockStudent={handleBlockStudent}
                onUnblockStudent={handleUnblockStudent}
                batchTitle={
                  liveSession?.title ||
                  (batches.find((b) => b.id === liveBatchId)
                    ? `${batches.find((b) => b.id === liveBatchId)!.name} - ${batches.find((b) => b.id === liveBatchId)!.nextTopic}`
                    : 'Class 10 Mathematics - Trigonometry')
                }
                teacherName={activeTeacher.name}
                academyName={academy.name}
              />
            )}

            {/* Admin Only: Financials & Teacher Payout Tracker */}
            {isAdmin && activeView === 'financials' && (
              <FinancialTrackerPanel
                batches={batches}
                teachers={teachers}
                onUpdateBatchPricing={handleUpdateBatchPricing}
              />
            )}

            {/* Admin Only: Students & Fee Management with Pending Approvals Queue, Report Cards & Certificates */}
            {isAdmin && activeView === 'students' && (
              <StudentsPanel
                students={students}
                batches={batches}
                onAddStudent={handleAddStudent}
                onPayFee={handlePayFee}
                onApproveStudent={handleApproveStudent}
                onRejectStudent={handleRejectStudent}
                onViewReportCard={handleViewReportCard}
                onIssueCertificate={handleIssueCertificate}
                onSendWhatsAppAlert={(s) => {
                  handleSendNotification({
                    recipientName: s.name,
                    recipientPhone: s.phone,
                    recipientRole: 'student',
                    channel: 'whatsapp',
                    type: 'announcement',
                    title: 'Academic Notice - Anushree Academy',
                    message: `Dear ${s.name}, please check your Anushree Academy dashboard for your latest progress report card and test schedules.`,
                    batchName: s.batchName
                  });
                  setIsNotificationsOpen(true);
                }}
              />
            )}

            {/* Admin Only: Teachers Management */}
            {isAdmin && activeView === 'teachers' && (
              <TeachersPanel
                teachers={teachers}
                batches={batches}
                activeTeacherId={activeTeacherId}
                onSetActiveTeacher={handleSwitchTeacher}
                onAddTeacher={handleAddTeacher}
                onUpdateTeacher={handleUpdateTeacher}
                onDeleteTeacher={handleDeleteTeacher}
              />
            )}

            {/* Admin Only: Academy, Targets & UPI QR Settings */}
            {isAdmin && activeView === 'settings' && (
              <SettingsPanel
                academy={academy}
                certificates={certificates}
                onUpdateAcademy={handleUpdateAcademy}
                onClose={() => setActiveView('dashboard')}
              />
            )}

          </div>
        </main>
      </div>

      {/* Student Self-Registration & Sign-In Modal */}
      <StudentAuthModal
        isOpen={isStudentAuthOpen}
        onClose={() => {
          setIsStudentAuthOpen(false);
          setAuthPromptMessage(null);
        }}
        batches={batches}
        onSuccessfulLogin={handleUnifiedLogin}
        onStudentRegistered={handleStudentRegistered}
        onRoleSwitch={handleSwitchRole}
        promptMessage={authPromptMessage}
      />

      {/* Announcements Modal */}
      <AnnouncementsModal
        isOpen={isAnnouncementsOpen}
        onClose={() => setIsAnnouncementsOpen(false)}
        announcements={announcements}
        isAdmin={isAdmin}
        onAddAnnouncement={handleAddAnnouncement}
      />

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        schedule={schedule}
        onStartClass={handleStartLiveClass}
      />

      {/* Automated WhatsApp & SMS Hub Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        batches={batches}
        students={students}
        onSendNotification={handleSendNotification}
      />

      {/* Student Performance Progress Report Card Modal */}
      <ReportCardModal
        isOpen={isReportCardOpen}
        onClose={() => setIsReportCardOpen(false)}
        reportCard={selectedReportCard}
        isAdmin={isAdmin}
        onUpdateRemarks={handleUpdateReportCardRemarks}
      />

      {/* Digital Course Completion Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        certificate={selectedCertificate}
      />

      {/* Anti-Leak Watermarked Secure PDF Viewer Modal */}
      <SecurePdfViewerModal
        isOpen={isSecurePdfOpen}
        onClose={() => setIsSecurePdfOpen(false)}
        item={securePdfItem}
        student={activeStudent}
      />

    </div>
  );
}
