import React, { useState } from 'react';
import {
  Student,
  Batch,
  ContentItem,
  PaymentSettings,
  ScheduleEvent,
  Announcement,
  FeeRecord
} from '../types.ts';
import {
  BookOpen,
  Calendar,
  Video,
  FileText,
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Bell,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Send,
  AlertCircle
} from 'lucide-react';

interface StudentPortalProps {
  currentStudent: Student;
  enrolledBatches: Batch[];
  content: ContentItem[];
  paymentSettings: PaymentSettings;
  schedule: ScheduleEvent[];
  announcements: Announcement[];
  onJoinLiveClass: (batchId: string) => void;
  onSubmitPayment: (data: {
    studentId: string;
    amount: number;
    paymentMode: 'UPI' | 'NetBanking' | 'Cash' | 'Card';
    transactionRef: string;
  }) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentStudent,
  enrolledBatches,
  content,
  paymentSettings,
  schedule,
  announcements,
  onJoinLiveClass,
  onSubmitPayment
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'fees' | 'materials' | 'notices'>('dashboard');
  
  // Payment submission form state
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'NetBanking' | 'Cash' | 'Card'>('UPI');
  const [utrRef, setUtrRef] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  // Content preview modal
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);

  const primaryBatch = enrolledBatches[0] || {
    id: 'b-10-math',
    name: 'Class 10 Mathematics',
    grade: 'Class 10',
    subject: 'Mathematics',
    monthlyFee: 2800,
    nextTopic: 'Trigonometric Identities & Heights',
    scheduleTime: '10:00 AM - 11:00 AM',
    teacherName: 'Sarla Sharma'
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(paymentSettings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmitFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrRef.trim()) return;

    onSubmitPayment({
      studentId: currentStudent.id,
      amount: primaryBatch.monthlyFee || 2500,
      paymentMode,
      transactionRef: utrRef.trim()
    });

    setPaymentSubmitted(true);
    setUtrRef('');
  };

  const isFeePaid = currentStudent.feeStatus === 'paid' || paymentSubmitted;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* 1. Student Top Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-[#0e484d] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-700/80 text-teal-200 text-xs font-semibold mb-2 border border-teal-500/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Student Learning Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Hello, {currentStudent.name}!
          </h1>
          <p className="text-xs sm:text-sm text-teal-200 mt-1">
            Status: <span className="font-bold text-white">Enrolled & Active</span> • Batch: <span className="font-bold text-white">{currentStudent.batchName}</span>
          </p>
          <p className="text-xs text-teal-100/80 mt-2 max-w-xl">
            Access your live virtual classrooms, interactive whiteboards, chapter notes, and pay tuition fees securely online.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => onJoinLiveClass(primaryBatch.id)}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Video className="w-4 h-4 fill-current" />
            <span>Join Live Class</span>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className={`px-4 py-3 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              isFeePaid
                ? 'bg-emerald-800/80 text-emerald-200 border border-emerald-600'
                : 'bg-white text-teal-900 hover:bg-teal-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{isFeePaid ? 'Fee Paid ✓' : 'Pay Batch Fee'}</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-teal-100 gap-2 bg-white p-2 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-teal-800 text-white shadow-sm'
              : 'text-slate-600 hover:text-teal-900 hover:bg-teal-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Batches & Timetable</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'fees'
              ? 'bg-teal-800 text-white shadow-sm'
              : 'text-slate-600 hover:text-teal-900 hover:bg-teal-50'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Pay Fees & QR Code</span>
          {!isFeePaid && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'materials'
              ? 'bg-teal-800 text-white shadow-sm'
              : 'text-slate-600 hover:text-teal-900 hover:bg-teal-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Study Materials ({content.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'notices'
              ? 'bg-teal-800 text-white shadow-sm'
              : 'text-slate-600 hover:text-teal-900 hover:bg-teal-50'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Announcements ({announcements.length})</span>
        </button>
      </div>

      {/* TAB 1: My Batches & Timetable */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Batch Card */}
            <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-teal-100 shadow-[0_2px_12px_rgba(15,118,110,0.06)] flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                      Enrolled Course
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                      {primaryBatch.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Teacher: <span className="font-bold text-teal-800">{primaryBatch.teacherName || 'Sarla Sharma (B.Ed, CTET)'}</span>
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Active Student
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-teal-50 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Attendance</span>
                    <p className="text-base font-black text-emerald-700 mt-0.5">{currentStudent.attendanceRate}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Score</span>
                    <p className="text-base font-black text-teal-900 mt-0.5">{currentStudent.performanceScore}/100</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Class Time</span>
                    <p className="text-xs font-bold text-slate-800 mt-1">{primaryBatch.scheduleTime}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Monthly Fee</span>
                    <p className="text-xs font-bold text-emerald-700 mt-1">₹{primaryBatch.monthlyFee || 2800}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-xs text-slate-500 font-semibold">Current Topic in Progress:</span>
                  <p className="text-sm font-bold text-teal-900 mt-0.5">
                    {primaryBatch.nextTopic}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-teal-50 flex items-center justify-between">
                <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Teacher room online and ready
                </span>

                <button
                  onClick={() => onJoinLiveClass(primaryBatch.id)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-teal-800 hover:bg-teal-900 text-white shadow-md shadow-teal-900/15 flex items-center gap-2 cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Enter Live Classroom</span>
                </button>
              </div>
            </div>

            {/* Fee Status Card */}
            <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-[0_2px_12px_rgba(15,118,110,0.06)] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pb-3 border-b border-teal-50">
                  <CreditCard className="w-4 h-4 text-teal-700" />
                  <span>Tuition Fee Overview</span>
                </span>

                <div className="mt-5 text-center p-4 bg-teal-50/50 rounded-2xl border border-teal-100">
                  <p className="text-xs text-slate-500 font-semibold">Monthly Tuition Amount</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">
                    ₹{primaryBatch.monthlyFee || 2800}
                  </p>
                  <div className="mt-3">
                    {isFeePaid ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Fee Paid for Current Month
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Pending Fee Due
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-4 leading-relaxed text-center">
                  Pay securely via UPI QR Code and get an instant receipt verified by the academy.
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-teal-50">
                <button
                  onClick={() => setActiveTab('fees')}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#E76F51] hover:bg-[#d65f42] text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{isFeePaid ? 'View Payment Receipt' : 'Scan QR & Pay Fee'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Today's Timetable */}
          <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-[0_2px_12px_rgba(15,118,110,0.06)]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-teal-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-700" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Daily Class Timetable & Schedule
                </h3>
              </div>
              <span className="text-xs font-medium text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                Weekly Routine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {schedule.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-teal-100 bg-teal-50/30 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                      {item.subject}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-2">
                      {item.batchName}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">{item.topic}</p>
                    <p className="text-[11px] text-teal-700 font-semibold mt-1">
                      Faculty: {item.teacherName}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-teal-100/70 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.time}
                    </span>
                    <button
                      onClick={() => onJoinLiveClass(primaryBatch.id)}
                      className="px-2.5 py-1 rounded-lg bg-teal-800 text-white font-bold text-[11px] hover:bg-teal-900"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Pay Fees & QR Code (Full Student View) */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-100 shadow-[0_2px_12px_rgba(15,118,110,0.06)]">
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center pb-6 border-b border-teal-100">
              <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-100">
                Official UPI Gateway
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                Tuition Fee Payment for {currentStudent.batchName}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Scan the official academy QR code with any UPI app to complete your fee payment instantly
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 items-center">
              
              {/* Active Admin Uploaded QR Code */}
              <div className="p-6 bg-gradient-to-b from-teal-50/70 to-white rounded-3xl border-2 border-teal-200/80 flex flex-col items-center text-center shadow-sm">
                <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider mb-3">
                  Official Academy QR Code
                </span>

                <div className="w-56 h-56 bg-white p-3 rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
                  <img
                    src={paymentSettings.qrCodeUrl}
                    alt="Official UPI QR Code"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=upi://pay?pa=${encodeURIComponent(
                        paymentSettings.upiId
                      )}&pn=Anushree%20Academy`;
                    }}
                  />
                </div>

                <div className="mt-4 space-y-1">
                  <p className="text-sm font-black text-slate-900">{paymentSettings.accountHolderName}</p>
                  
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="font-mono text-xs font-bold text-teal-900 bg-teal-100 px-3 py-1 rounded-lg">
                      {paymentSettings.upiId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="p-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold flex items-center gap-1 border border-teal-200 cursor-pointer"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 pt-2">
                    Bank: <span className="font-medium">{paymentSettings.bankName}</span> • A/C: <span className="font-mono">{paymentSettings.accountNumber}</span>
                  </p>
                </div>
              </div>

              {/* Payment Submission Form */}
              <div className="space-y-5">
                <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Total Fee Amount:</span>
                    <span className="text-2xl font-black text-teal-950">
                      ₹{primaryBatch.monthlyFee || 2800}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-teal-100/60">
                    <span className="text-slate-500">Student Account:</span>
                    <span className="font-bold text-slate-800">Verified & Enrolled</span>
                  </div>
                </div>

                {paymentSubmitted ? (
                  <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h3 className="font-extrabold text-emerald-900 text-base">Payment Submitted Successfully!</h3>
                    <p className="text-xs text-emerald-800">
                      Your transaction reference has been verified and recorded. You can continue attending all live sessions and accessing study resources.
                    </p>
                    <div className="pt-2">
                      <span className="text-[11px] font-mono bg-white px-3 py-1 rounded-lg border border-emerald-200 text-slate-700">
                        Receipt: REC-{new Date().getFullYear()}-8842
                      </span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFee} className="space-y-4 text-xs">
                    <p className="text-slate-600 font-medium">
                      After scanning the QR code and paying in your UPI app, enter your 12-digit transaction ID / UTR number below to verify:
                    </p>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Payment Method Used</label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
                      >
                        <option value="UPI">Google Pay / PhonePe / Paytm UPI</option>
                        <option value="NetBanking">Net Banking / IMPS / NEFT</option>
                        <option value="Card">Debit / Credit Card</option>
                        <option value="Cash">Cash Deposit at Center</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        12-Digit UPI Transaction Reference / UTR Number
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 294820194820 or UPI/Ref/..."
                        value={utrRef}
                        onChange={(e) => setUtrRef(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600 focus:outline-none font-mono font-bold"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-800/15 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Payment Proof & Confirm Fee</span>
                    </button>
                  </form>
                )}

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed border border-slate-200/80">
                  <p className="font-semibold text-slate-700 mb-0.5">Payment Instructions:</p>
                  {paymentSettings.instructions}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB 3: Study Materials (Content Library) */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-100 shadow-[0_2px_12px_rgba(15,118,110,0.06)]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-teal-100">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Course Study Materials & Notes
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Download PDF formulas, watch recorded masterclasses, and take revision tests
              </p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              {content.length} Resources Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.map((file) => (
              <div
                key={file.id}
                className="p-4 rounded-2xl border border-teal-100 bg-white hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {file.fileType.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{file.fileSize}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2">
                    {file.title}
                  </h4>
                  <p className="text-[10px] text-teal-700 mt-1 font-medium">
                    {file.folderName} • {file.subfolderName}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-teal-50 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setPreviewItem(file)}
                    className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Notes</span>
                  </button>

                  <button
                    onClick={() => alert(`Downloading "${file.title}"...`)}
                    className="font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Announcements & Notices */}
      {activeTab === 'notices' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-100 shadow-[0_2px_12px_rgba(15,118,110,0.06)]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-teal-100">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Academy Notices & Broadcasts
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official exam alerts, mock test schedules, and holiday announcements
              </p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-5 rounded-2xl border border-teal-100 bg-white shadow-2xs space-y-2 hover:border-teal-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    ann.priority === 'urgent'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-teal-50 text-teal-800 border border-teal-100'
                  }`}>
                    {ann.targetBatch} • {ann.priority.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {ann.createdAt}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  {ann.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-teal-100">
            <div className="flex items-center justify-between pb-3 border-b border-teal-100">
              <h3 className="font-extrabold text-slate-900 text-sm truncate max-w-sm">
                {previewItem.title}
              </h3>
              <button onClick={() => setPreviewItem(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="py-5 space-y-3 text-xs">
              <div className="p-3 bg-teal-50 rounded-xl text-slate-700">
                <p className="font-bold">{previewItem.folderName} / {previewItem.subfolderName}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{previewItem.fileType.toUpperCase()} • {previewItem.fileSize}</p>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {previewItem.details || 'Study document provided for class review and board preparation.'}
              </p>
            </div>

            <div className="pt-3 border-t border-teal-100 flex justify-end gap-2">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
              >
                Close
              </button>
              <button
                onClick={() => alert(`Starting download for ${previewItem.title}`)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-800 text-white"
              >
                Download Document
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
