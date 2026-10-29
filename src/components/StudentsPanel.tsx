import React, { useState, useEffect } from 'react';
import { Batch, Student, BatchPurchaseRequest } from '../types.ts';
import {
  Users,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Mail,
  Phone,
  GraduationCap,
  Download,
  X,
  CreditCard,
  AlertCircle,
  Check,
  Clock,
  UserCheck,
  UserX,
  MessageCircle,
  Sparkles,
  Award,
  FileText,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Receipt
} from 'lucide-react';

interface StudentsPanelProps {
  students: Student[];
  batches: Batch[];
  onAddStudent: (data: { name: string; batchId: string; batchName: string; email: string; phone: string }) => void;
  onPayFee: (studentId: string, amount: number, paymentMode: 'UPI' | 'NetBanking' | 'Cash' | 'Card') => void;
  onApproveStudent?: (studentId: string) => void;
  onRejectStudent?: (studentId: string, reason?: string) => void;
  onViewReportCard?: (student: Student) => void;
  onIssueCertificate?: (student: Student) => void;
  onSendWhatsAppAlert?: (student: Student) => void;
}

export const StudentsPanel: React.FC<StudentsPanelProps> = ({
  students,
  batches,
  onAddStudent,
  onPayFee,
  onApproveStudent,
  onRejectStudent,
  onViewReportCard,
  onIssueCertificate,
  onSendWhatsAppAlert
}) => {
  // Navigation between Enrolled vs Pending Approvals vs Batch Purchases
  const [activeTab, setActiveTab] = useState<'enrolled' | 'pending' | 'purchases'>('enrolled');

  // Purchase Requests State
  const [purchaseRequests, setPurchaseRequests] = useState<BatchPurchaseRequest[]>([]);
  const [isApprovingPurchase, setIsApprovingPurchase] = useState<string | null>(null);
  const [whatsappAlertModalData, setWhatsappAlertModalData] = useState<{
    studentName: string;
    studentPhone: string;
    batchName: string;
    amount: number;
    message: string;
    waLink: string;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
  const [feeStatusFilter, setFeeStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Fee collection modal state
  const [feeStudent, setFeeStudent] = useState<Student | null>(null);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'NetBanking' | 'Cash' | 'Card'>('UPI');
  const [feeAmount, setFeeAmount] = useState<number>(2500);

  // New Student form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [batchId, setBatchId] = useState(batches[0]?.id || '');

  // Rejection modal
  const [rejectingStudent, setRejectingStudent] = useState<Student | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Approval notification toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const pendingStudents = students.filter((s) => s.approvalStatus === 'pending' || s.status === 'pending');
  const enrolledStudents = students.filter((s) => s.approvalStatus !== 'pending' && s.status !== 'pending' && s.status !== 'rejected');

  const filteredEnrolledStudents = enrolledStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch =
      selectedBatchFilter === 'all' || s.batchId === selectedBatchFilter;
    const matchesFee =
      feeStatusFilter === 'all' || s.feeStatus === feeStatusFilter;
    return matchesSearch && matchesBatch && matchesFee;
  });

  const filteredPendingStudents = pendingStudents.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm)
    );
  });

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const batch = batches.find((b) => b.id === batchId) || batches[0];
    onAddStudent({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 98000 00000',
      batchId: batch.id,
      batchName: batch.name
    });
    setName('');
    setEmail('');
    setPhone('');
    setIsAddOpen(false);
  };

  const handleCollectFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeStudent) return;
    onPayFee(feeStudent.id, feeAmount, paymentMode);
    setFeeStudent(null);
  };

  const handleApprove = (student: Student) => {
    if (onApproveStudent) {
      onApproveStudent(student.id);
    }
    setToastMsg(`Approved ${student.name} for ${student.batchName}!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingStudent) return;
    if (onRejectStudent) {
      onRejectStudent(rejectingStudent.id, rejectionReason);
    }
    setToastMsg(`Declined admission for ${rejectingStudent.name}`);
    setTimeout(() => setToastMsg(null), 3000);
    setRejectingStudent(null);
    setRejectionReason('');
  };

  const paidCount = enrolledStudents.filter((s) => s.feeStatus === 'paid').length;
  const pendingCount = enrolledStudents.filter((s) => s.feeStatus !== 'paid').length;

  // Fetch purchase requests
  const loadPurchaseRequests = async () => {
    try {
      const res = await fetch('/api/purchase-requests');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPurchaseRequests(data.data);
      }
    } catch {}
  };

  useEffect(() => {
    loadPurchaseRequests();
  }, []);

  const handleApprovePurchase = async (reqId: string) => {
    setIsApprovingPurchase(reqId);
    try {
      const res = await fetch(`/api/purchase-requests/${reqId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setToastMsg(data.message || 'Batch purchase approved and activated!');
        loadPurchaseRequests();
        const req = purchaseRequests.find((p) => p.id === reqId) || data.data;
        const studentName = req?.studentName || 'Student';
        const batchName = req?.batchName || 'Course Batch';
        const amount = req?.amount || 2500;
        const phone = req?.studentPhone || '+91 98000 00000';
        const msg = `Hello ${studentName}, Welcome to Achiever Academy! 🎉 Your batch ${batchName} has been successfully activated. Payment received: Rs. ${amount}. You can log in to your student dashboard and start your studies. All the best!`;
        const waLink = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
        setWhatsappAlertModalData({
          studentName,
          studentPhone: phone,
          batchName,
          amount,
          message: msg,
          waLink
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsApprovingPurchase(null);
    }
  };

  const handleRejectPurchase = async (reqId: string) => {
    try {
      const res = await fetch(`/api/purchase-requests/${reqId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Payment UTR verification failed' })
      });
      const data = await res.json();
      if (data.success) {
        setToastMsg('Purchase request declined');
        loadPurchaseRequests();
      }
    } catch {}
  };

  const pendingPurchasesCount = purchaseRequests.filter((p) => p.status === 'pending_verification').length;

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-teal-900 text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-in slide-in-from-top">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Student Admissions & Fee Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Anushree Academy Student Management • Verify self-registrations, track fee payments, and monitor attendance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-teal-800 hover:bg-teal-900 text-white shadow-md shadow-teal-900/15 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Direct Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs: Enrolled vs Pending Approvals */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-teal-100 dark:border-slate-800 shadow-2xs w-fit">
        <button
          onClick={() => setActiveTab('enrolled')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'enrolled'
              ? 'bg-teal-800 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-teal-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Enrolled Students</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'enrolled' ? 'bg-teal-900 text-teal-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}>
            {enrolledStudents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-teal-950 shadow-2xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-950/30'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Pending Student Approvals</span>
          {pendingStudents.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white animate-pulse">
              {pendingStudents.length} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('purchases')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'purchases'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
          }`}
        >
          <Receipt className="w-4 h-4 text-emerald-300" />
          <span>Batch Purchases & Payment Approvals</span>
          {pendingPurchasesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 animate-pulse">
              {pendingPurchasesCount} Pending
            </span>
          )}
        </button>
      </div>

      {activeTab === 'pending' ? (
        /* ================= PENDING STUDENT APPROVALS SECTION ================= */
        <div className="space-y-4">
          <div className="bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl p-4 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-sm">Self-Registered Student Verification Queue</p>
              <p className="mt-0.5 text-amber-800 dark:text-amber-300 leading-relaxed">
                Students who sign up via the Anushree Academy registration portal appear here. Verify their contact number and requested class, then click <strong>"Approve & Enroll"</strong> to grant classroom access.
              </p>
            </div>
          </div>

          {filteredPendingStudents.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-teal-100 dark:border-slate-800 shadow-sm space-y-3">
              <UserCheck className="w-12 h-12 text-teal-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Pending Student Approvals</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                All registered students have been verified. When new students submit their details on the registration page, they will show up here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPendingStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-amber-200/80 dark:border-amber-800/80 hover:border-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.08)] transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-black text-sm flex items-center justify-center border border-amber-200 dark:border-amber-800">
                          {student.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{student.name}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                              Awaiting Approval
                            </span>
                          </div>
                          <p className="text-xs text-teal-800 dark:text-teal-400 font-semibold mt-0.5">
                            Target Batch: {student.batchName}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {student.registeredAt || 'Today'}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> Email:
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{student.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{student.phone}</span>
                          <a
                            href={`https://wa.me/${student.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Monthly Tuition Fee:</span>
                        <span className="font-bold text-teal-800 dark:text-teal-300">₹{student.feeDueAmount || 2500}/month</span>
                      </div>
                    </div>
                  </div>

                  {/* Approval Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setRejectingStudent(student)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>

                    <button
                      onClick={() => handleApprove(student)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Enroll</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'purchases' ? (
        /* ================= BATCH PURCHASES & PAYMENT VERIFICATION SECTION ================= */
        <div className="space-y-4">
          <div className="bg-emerald-50/90 dark:bg-emerald-950/40 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-sm">Batch Purchase Requests & Verification Queue</p>
              <p className="mt-0.5 text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Incoming student batch purchase orders with UPI UTR transaction numbers. Click <strong>"Approve"</strong> to activate 1-year course enrollment and automatically trigger an instant official WhatsApp onboarding message to the student's phone.
              </p>
            </div>
          </div>

          {purchaseRequests.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-teal-100 dark:border-slate-800 shadow-sm space-y-3">
              <ShoppingBag className="w-12 h-12 text-teal-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Purchase Requests Yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                When students purchase batches or subjects from the store, their payment verification requests will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchaseRequests.map((req) => (
                <div
                  key={req.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                    req.status === 'pending_verification'
                      ? 'border-amber-300 dark:border-amber-700 hover:border-amber-400'
                      : req.status === 'approved'
                      ? 'border-emerald-200 dark:border-emerald-800'
                      : 'border-slate-200 dark:border-slate-800 opacity-75'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-200 font-black text-sm flex items-center justify-center border border-teal-200 dark:border-teal-800">
                          {req.studentName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{req.studentName}</h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                req.status === 'pending_verification'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                                  : req.status === 'approved'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {req.status === 'pending_verification' ? 'Pending Verification' : req.status}
                            </span>
                          </div>
                          <p className="text-xs text-teal-800 dark:text-teal-400 font-bold mt-0.5">
                            Course: {req.batchName} {req.subjectName ? `• ${req.subjectName}` : ''}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 shrink-0">
                        {req.createdAt || 'Today'}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1.5 font-medium">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Amount Paid:</span>
                        <span className="font-black text-slate-900 dark:text-white text-sm">
                          ₹{req.amount.toLocaleString('en-IN')} ({req.paymentMode})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Transaction UTR:</span>
                        <span className="font-mono font-bold text-teal-800 dark:text-teal-300">{req.transactionRef}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">WhatsApp Mobile:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{req.studentPhone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Receipt Ref:</span>
                        <span className="font-mono text-slate-600 dark:text-slate-400">{req.receiptNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                    {req.status === 'pending_verification' ? (
                      <>
                        <button
                          onClick={() => handleRejectPurchase(req.id)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900 cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleApprovePurchase(req.id)}
                          disabled={isApprovingPurchase === req.id}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{isApprovingPurchase === req.id ? 'Approving...' : 'Approve & Trigger WhatsApp'}</span>
                        </button>
                      </>
                    ) : req.status === 'approved' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Batch Activated & WhatsApp Sent
                        </span>
                        <a
                          href={`https://wa.me/${req.studentPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${req.studentName}, Welcome to Achiever Academy! 🎉 Your batch ${req.batchName} has been successfully activated. Payment received: Rs. ${req.amount}. You can log in to your student dashboard and start your studies. All the best!`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open WhatsApp</span>
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-red-600 font-bold">Declined</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= ENROLLED STUDENTS LIST ================= */
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-teal-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(15,118,110,0.06)] flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name, roll no, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-teal-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50/50 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Batch Filter */}
              <select
                value={selectedBatchFilter}
                onChange={(e) => setSelectedBatchFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="all">All Batches ({batches.length})</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id} className="dark:bg-slate-800 dark:text-white">
                    {b.name}
                  </option>
                ))}
              </select>

              {/* Fee Filter */}
              <select
                value={feeStatusFilter}
                onChange={(e) => setFeeStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl text-xs border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="all">All Fee Status</option>
                <option value="paid">Paid ({paidCount})</option>
                <option value="pending">Due / Pending ({pendingCount})</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-[0_2px_12px_rgba(15,118,110,0.06)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-teal-50/60 dark:bg-slate-800/80 border-b border-teal-100 dark:border-slate-800 text-teal-900 dark:text-teal-300 font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 sm:px-6">Roll & Name</th>
                    <th className="py-3.5 px-4">Class / Batch</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Attendance</th>
                    <th className="py-3.5 px-4">Fee Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-50 dark:divide-slate-800">
                  {filteredEnrolledStudents.map((student) => {
                    const isPaid = student.feeStatus === 'paid';
                    return (
                      <tr key={student.id} className="hover:bg-teal-50/30 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-300 flex items-center justify-center font-extrabold text-[11px] shrink-0">
                              {student.rollNumber}
                            </span>
                            <div>
                              <p className="font-extrabold text-slate-900 dark:text-white">{student.name}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{student.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-teal-800 dark:text-teal-400">
                          {student.batchName}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                          {student.phone}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">{student.attendanceRate}%</span>
                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-teal-600 rounded-full"
                                style={{ width: `${student.attendanceRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Paid</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              <AlertCircle className="w-3 h-3" />
                              <span>Due (₹{student.feeDueAmount})</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {onViewReportCard && (
                              <button
                                onClick={() => onViewReportCard(student)}
                                className="px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-slate-700 text-teal-800 dark:text-teal-300 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-teal-200 dark:border-slate-700"
                                title="View Performance Report Card"
                              >
                                <FileText className="w-3 h-3 text-teal-700 dark:text-teal-400" />
                                <span className="hidden sm:inline">Report</span>
                              </button>
                            )}

                            {onIssueCertificate && (
                              <button
                                onClick={() => onIssueCertificate(student)}
                                className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-amber-300 dark:border-slate-700"
                                title="Issue Digital Certificate"
                              >
                                <Award className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                <span className="hidden sm:inline">Cert</span>
                              </button>
                            )}

                            <a
                              href={`https://wa.me/${student.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(student.name)}!%20Update%20from%20Anushree%20Academy.`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              title="Send WhatsApp Alert"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>

                            {!isPaid && (
                              <button
                                onClick={() => {
                                  setFeeStudent(student);
                                  setFeeAmount(student.feeDueAmount || 2500);
                                }}
                                className="px-3 py-1 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Record Fee</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Record Fee Modal */}
      {feeStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-teal-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-teal-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                Record Fee Payment
              </h3>
              <button onClick={() => setFeeStudent(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectFee} className="space-y-4 mt-4 text-xs">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Student: <strong className="text-slate-800 dark:text-white">{feeStudent.name}</strong> ({feeStudent.batchName})</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Amount Received (₹)</label>
                <input
                  type="number"
                  required
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
                >
                  <option value="UPI" className="dark:bg-slate-800 dark:text-white">UPI (Google Pay, PhonePe, Paytm)</option>
                  <option value="NetBanking" className="dark:bg-slate-800 dark:text-white">Net Banking / NEFT</option>
                  <option value="Cash" className="dark:bg-slate-800 dark:text-white">Cash at Academy Office</option>
                  <option value="Card" className="dark:bg-slate-800 dark:text-white">Debit / Credit Card</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFeeStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark as Paid & Generate Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 dark:border-red-950">
            <div className="flex items-center justify-between pb-3 border-b border-red-100 dark:border-red-950">
              <h3 className="font-extrabold text-red-900 dark:text-red-300 text-base">
                Decline Student Admission
              </h3>
              <button onClick={() => setRejectingStudent(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 mt-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Are you sure you want to decline admission for <strong className="dark:text-white">{rejectingStudent.name}</strong> ({rejectingStudent.batchName})?
              </p>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Rejection (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Batch capacity full or prerequisite verification incomplete."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Add Student Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-teal-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-teal-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                Direct Enroll Student
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnroll} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@anushree.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="+91 98200 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Batch
                </label>
                <select
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id} className="dark:bg-slate-800 dark:text-white">
                      {b.name} ({b.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white shadow-sm cursor-pointer"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Automated WhatsApp Notification Alert Modal */}
      {whatsappAlertModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-emerald-200 dark:border-emerald-900 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Automated WhatsApp Message Sent! 🎉
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dispatched to {whatsappAlertModalData.studentPhone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappAlertModalData(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-xl"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official WhatsApp Chat Bubble Preview */}
            <div className="bg-emerald-50/60 dark:bg-slate-800/80 p-4 rounded-2xl border border-emerald-200/80 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                <span>Official Achiever Academy Notification Engine</span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-emerald-100 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 leading-relaxed font-sans shadow-2xs">
                {whatsappAlertModalData.message}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-400">
                Student account is now 100% active.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setWhatsappAlertModalData(null)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Done
                </button>
                <a
                  href={whatsappAlertModalData.waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open in WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
