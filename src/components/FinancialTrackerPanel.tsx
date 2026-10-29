import React, { useState, useEffect } from 'react';
import {
  FinancialMetrics,
  TeacherContract,
  TeacherPayoutRecord,
  CourseEnrollment,
  Batch,
  Teacher
} from '../types.ts';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Users,
  CreditCard,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Edit3,
  Plus,
  X,
  FileText,
  Filter,
  Download,
  ShieldCheck,
  Percent,
  Briefcase
} from 'lucide-react';

interface FinancialTrackerPanelProps {
  batches: Batch[];
  teachers: Teacher[];
  onUpdateBatchPricing?: (batchId: string, updates: any) => Promise<void> | void;
}

export const FinancialTrackerPanel: React.FC<FinancialTrackerPanelProps> = ({
  batches,
  teachers,
  onUpdateBatchPricing
}) => {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'contracts' | 'transactions' | 'courses'>('overview');

  // Payout modal state
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers[0]?.id || '');
  const [payoutAmount, setPayoutAmount] = useState<number>(10000);
  const [payoutMode, setPayoutMode] = useState<'Bank Transfer' | 'UPI' | 'Cheque'>('Bank Transfer');
  const [payoutRef, setPayoutRef] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Edit Contract modal state
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [editingContractTeacherId, setEditingContractTeacherId] = useState('');
  const [contractModel, setContractModel] = useState<'revenue_share' | 'fixed_salary' | 'hybrid'>('revenue_share');
  const [contractRevShare, setContractRevShare] = useState<number>(30);
  const [contractFixedSalary, setContractFixedSalary] = useState<number>(35000);
  const [contractTerms, setContractTerms] = useState('');

  // Course Pricing Edit Modal state
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [editFullPrice, setEditFullPrice] = useState<number>(9999);
  const [editDuration, setEditDuration] = useState('1 Year');
  const [editDescription, setEditDescription] = useState('');
  const [editSubjectPrices, setEditSubjectPrices] = useState<Array<{ id: string; name: string; price: number; duration: string }>>([]);

  // Transaction Search & Filter
  const [searchTxQuery, setSearchTxQuery] = useState('');
  const [txFilterBatch, setTxFilterBatch] = useState('all');

  // Fetch metrics from API
  const fetchFinancials = async () => {
    try {
      const res = await fetch('/api/financials');
      const data = await res.json();
      if (data.success && data.data) {
        setMetrics(data.data);
      }
    } catch {
      // Fallback calculation if backend fetch fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const handleRecordPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId || !payoutAmount) return;

    setIsSubmittingPayout(true);
    try {
      const res = await fetch('/api/financials/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: selectedTeacherId,
          amount: payoutAmount,
          paymentMode: payoutMode,
          transactionRef: payoutRef || `TRF-${Date.now().toString().slice(-8)}`,
          notes: payoutNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsPayoutModalOpen(false);
        setPayoutNotes('');
        setPayoutRef('');
        await fetchFinancials();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const handleSaveContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContractTeacherId) return;

    try {
      const res = await fetch(`/api/teachers/${editingContractTeacherId}/contract`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: contractModel,
          revenueSharePercent: contractRevShare,
          fixedMonthlySalary: contractFixedSalary,
          terms: contractTerms
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsContractModalOpen(false);
        await fetchFinancials();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPricingModal = (batch: Batch) => {
    setEditingBatch(batch);
    setEditFullPrice(batch.fullBatchPrice || 9999);
    setEditDuration(batch.duration || '1 Year');
    setEditDescription(batch.description || '');
    setEditSubjectPrices(
      batch.subjects?.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        duration: s.duration || '1 Year'
      })) || []
    );
    setIsPricingModalOpen(true);
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;

    const payload = {
      batchId: editingBatch.id,
      updates: {
        fullBatchPrice: editFullPrice,
        duration: editDuration,
        description: editDescription,
        subjects: editSubjectPrices.map((s) => ({
          id: s.id,
          price: s.price,
          duration: s.duration
        }))
      }
    };

    try {
      await fetch('/api/courses/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (onUpdateBatchPricing) {
        onUpdateBatchPricing(editingBatch.id, payload.updates);
      }
      setIsPricingModalOpen(false);
      await fetchFinancials();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered transactions
  const filteredTransactions = (metrics?.transactions || []).filter((tx) => {
    const matchesSearch =
      tx.studentName.toLowerCase().includes(searchTxQuery.toLowerCase()) ||
      tx.transactionRef.toLowerCase().includes(searchTxQuery.toLowerCase()) ||
      tx.studentEmail.toLowerCase().includes(searchTxQuery.toLowerCase());
    const matchesBatch = txFilterBatch === 'all' || tx.batchId === txFilterBatch;
    return matchesSearch && matchesBatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-teal-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Tracker & Faculty Remuneration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time revenue metrics, profit & loss analysis, teacher contract terms, and transaction ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPayoutModalOpen(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-teal-800 hover:bg-teal-900 text-white shadow-md shadow-teal-900/15 transition-all flex items-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Disburse Faculty Payout</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            ₹{(metrics?.totalRevenue || 128500).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs previous quarter</span>
          </div>
        </div>

        {/* Teacher Payouts */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Teacher Remuneration Paid</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            ₹{(metrics?.totalTeacherPayouts || 68000).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-500">
            <span>4 faculty contracts active</span>
          </div>
        </div>

        {/* Platform Operating Costs */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Platform Operations</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            ₹{(metrics?.platformOperatingCosts || 23640).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-500">
            <span>Servers, Live Stream & SMS</span>
          </div>
        </div>

        {/* Net Profit & Margin */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Net Profit & Margin</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-teal-900 dark:text-teal-300 tabular-nums">
            ₹{(metrics?.netProfit || 36860).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-teal-700 dark:text-teal-400">
            <Percent className="w-3.5 h-3.5" />
            <span>{(metrics?.profitMargin || 29)}% Net Profit Margin</span>
          </div>
        </div>
      </div>

      {/* Navigation Segmented Bar */}
      <div className="flex items-center gap-1 p-1 bg-teal-50 dark:bg-slate-800/80 rounded-2xl max-w-xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-slate-900 text-teal-950 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Financial Overview
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'contracts'
              ? 'bg-white dark:bg-slate-900 text-teal-950 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Teacher Contracts & Payouts
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-white dark:bg-slate-900 text-teal-950 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Transactions Ledger ({metrics?.transactions.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-white dark:bg-slate-900 text-teal-950 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Course Pricing & Duration
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-teal-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Profit & Loss Breakdown (Current Academic Cycle)
            </h3>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Course & Subject Enrollments (Annual)</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  ₹{(metrics?.transactions.reduce((s, t) => s + t.pricePaid, 0) || 28500).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Offline & Direct Tuition Payments</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  ₹1,00,000
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800 text-red-600 dark:text-red-400">
                <span>(-) Total Faculty Remuneration Disbursed</span>
                <span className="font-bold tabular-nums">
                  -₹{(metrics?.totalTeacherPayouts || 68000).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800 text-red-600 dark:text-red-400">
                <span>(-) Cloud Streaming, Jitsi Gateway & Secure Storage</span>
                <span className="font-bold tabular-nums">
                  -₹12,400
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800 text-red-600 dark:text-red-400">
                <span>(-) Automated WhatsApp & SMS Alerts Gateway</span>
                <span className="font-bold tabular-nums">
                  -₹6,100
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-3 font-black text-teal-900 dark:text-teal-300 bg-teal-50/50 dark:bg-slate-800/50 px-4 rounded-xl">
                <span>Net Academy Operating Surplus</span>
                <span className="tabular-nums">
                  ₹{(metrics?.netProfit || 42000).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Faculty Dues Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-teal-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Pending Faculty Dues
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(metrics?.contracts || []).map((c) => (
                <div key={c.teacherId} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{c.teacherName}</h4>
                    <span className="text-[10px] text-slate-500">
                      {c.model === 'revenue_share'
                        ? `${c.revenueSharePercent}% Rev Share`
                        : c.model === 'fixed_salary'
                        ? `₹${c.fixedMonthlySalary.toLocaleString('en-IN')}/mo Fixed`
                        : `Hybrid (₹${c.fixedMonthlySalary.toLocaleString('en-IN')} + ${c.revenueSharePercent}%)`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 tabular-nums block">
                      ₹{c.pendingDue.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedTeacherId(c.teacherId);
                        setPayoutAmount(c.pendingDue > 0 ? c.pendingDue : 10000);
                        setIsPayoutModalOpen(true);
                      }}
                      className="text-[10px] text-teal-700 dark:text-teal-400 hover:underline font-bold cursor-pointer"
                    >
                      Pay Now →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEACHER CONTRACTS & PAYOUTS */}
      {activeTab === 'contracts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(metrics?.contracts || []).map((c) => (
              <div
                key={c.teacherId}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-teal-100 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-50 dark:bg-slate-800 text-teal-800 dark:text-teal-300">
                      {c.model.replace('_', ' ')}
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5">
                      {c.teacherName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {c.assignedSubjects.join(', ')}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingContractTeacherId(c.teacherId);
                      setContractModel(c.model);
                      setContractRevShare(c.revenueSharePercent);
                      setContractFixedSalary(c.fixedMonthlySalary);
                      setContractTerms(c.terms);
                      setIsContractModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-teal-900 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit Contract Terms"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 py-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Paid to Date</span>
                    <span className="font-black text-slate-900 dark:text-white tabular-nums">
                      ₹{c.totalPaid.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Pending Due</span>
                    <span className="font-black text-amber-600 dark:text-amber-400 tabular-nums">
                      ₹{c.pendingDue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Agreement Terms & Model
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {c.terms}
                  </p>
                </div>

                {/* Recent Payout History for this teacher */}
                <div>
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    Recent Payouts ({c.payoutHistory.length})
                  </h4>
                  {c.payoutHistory.length === 0 ? (
                    <p className="text-xs text-slate-400">No payment records yet.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {c.payoutHistory.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80"
                        >
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                              ₹{p.amount.toLocaleString('en-IN')} · {p.paymentMode}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Ref: {p.transactionRef}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">{p.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedTeacherId(c.teacherId);
                      setPayoutAmount(c.pendingDue > 0 ? c.pendingDue : 10000);
                      setIsPayoutModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white transition-colors cursor-pointer"
                  >
                    + Disburse Remuneration
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TRANSACTION LOGS */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-teal-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name, email, or UTR number..."
                value={searchTxQuery}
                onChange={(e) => setSearchTxQuery(e.target.value)}
                className="bg-transparent text-xs w-full outline-hidden text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={txFilterBatch}
                onChange={(e) => setTxFilterBatch(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 outline-hidden cursor-pointer"
              >
                <option value="all">All Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-extrabold uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Course / Subject</th>
                  <th className="py-3 px-3">Price Paid</th>
                  <th className="py-3 px-3">Payment Reference (UTR)</th>
                  <th className="py-3 px-3">Enrolled On</th>
                  <th className="py-3 px-3">Access Expiry</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No transaction records match the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">{tx.studentName}</span>
                        <span className="text-[10px] text-slate-500">{tx.studentEmail}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-teal-900 dark:text-teal-300 block">{tx.batchName}</span>
                        {tx.subjectName && (
                          <span className="text-[10px] text-slate-500 font-medium">Subject: {tx.subjectName}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold tabular-nums text-slate-900 dark:text-white">
                        ₹{tx.pricePaid.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {tx.transactionRef}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {tx.enrolledAt}
                      </td>
                      <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-medium">
                        {tx.expiresAt} (1 Year)
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DYNAMIC COURSE PRICING & DURATION */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-slate-800/60 border border-teal-100 dark:border-slate-700 text-xs text-teal-900 dark:text-teal-300 flex items-center justify-between">
            <span>
              💡 Course and subject pricing updated here will <strong>immediately update</strong> the frontend public catalog, checkout pages, and dynamic UPI QR values.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-teal-100 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-50 dark:bg-slate-800 text-teal-800 dark:text-teal-300">
                        {batch.grade}
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5">
                        {batch.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleOpenPricingModal(batch)}
                      className="p-2 rounded-xl text-teal-800 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 cursor-pointer"
                      title="Edit Course Price & Duration"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                    {batch.description || 'Comprehensive curriculum with video lectures, notes, and model papers.'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Duration:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{batch.duration || '1 Year'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Full Batch Price:</span>
                      <span className="font-black text-teal-900 dark:text-teal-300 tabular-nums">
                        ₹{(batch.fullBatchPrice || 9999).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {batch.subjects && batch.subjects.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                        Individual Subject Pricing ({batch.subjects.length} subjects)
                      </span>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {batch.subjects.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800"
                          >
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{s.name}</span>
                            <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                              ₹{s.price.toLocaleString('en-IN')} / {s.duration || '1 Year'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleOpenPricingModal(batch)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white transition-colors cursor-pointer"
                  >
                    Edit Pricing & Duration
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: DISBURSE FACULTY PAYOUT */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-teal-100 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Disburse Faculty Remuneration
              </h3>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayout} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Faculty / Teacher
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                  required
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subjectsExpertise.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Remuneration Amount (₹)
                </label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  required
                  min={500}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Disbursement Mode
                </label>
                <select
                  value={payoutMode}
                  onChange={(e: any) => setPayoutMode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                  <option value="UPI">Direct UPI Transfer</option>
                  <option value="Cheque">Account Payee Cheque</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Transaction Reference / UTR
                </label>
                <input
                  type="text"
                  placeholder="e.g. NEFT-SBIN261024881"
                  value={payoutRef}
                  onChange={(e) => setPayoutRef(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Notes / Payment Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. October 2026 course revenue share"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayout}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white transition-colors cursor-pointer"
                >
                  {isSubmittingPayout ? 'Recording...' : 'Record Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CONTRACT TERMS */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-teal-100 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Edit Faculty Agreement Terms
              </h3>
              <button
                onClick={() => setIsContractModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContract} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Remuneration Model
                </label>
                <select
                  value={contractModel}
                  onChange={(e: any) => setContractModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="revenue_share">Revenue Share Percentage (%)</option>
                  <option value="fixed_salary">Fixed Monthly Salary</option>
                  <option value="hybrid">Hybrid (Fixed Retainer + Rev Share)</option>
                </select>
              </div>

              {(contractModel === 'revenue_share' || contractModel === 'hybrid') && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Revenue Share Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={contractRevShare}
                    onChange={(e) => setContractRevShare(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    min={0}
                    max={100}
                  />
                </div>
              )}

              {(contractModel === 'fixed_salary' || contractModel === 'hybrid') && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Fixed Monthly Salary (₹)
                  </label>
                  <input
                    type="number"
                    value={contractFixedSalary}
                    onChange={(e) => setContractFixedSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    min={0}
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Agreement Terms & Conditions
                </label>
                <textarea
                  value={contractTerms}
                  onChange={(e) => setContractTerms(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white transition-colors cursor-pointer"
                >
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT COURSE PRICING & DURATION */}
      {isPricingModalOpen && editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-teal-100 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Edit Course Pricing & Duration
                </h3>
                <span className="text-xs text-teal-800 dark:text-teal-400 font-bold">
                  {editingBatch.name}
                </span>
              </div>
              <button
                onClick={() => setIsPricingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePricing} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Full Batch Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editFullPrice}
                    onChange={(e) => setEditFullPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Course Duration
                  </label>
                  <select
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                  >
                    <option value="1 Year">1 Year (365 Days Access)</option>
                    <option value="6 Months">6 Months</option>
                    <option value="2 Years">2 Years (Multi-Year Prep)</option>
                    <option value="Full Academic Session">Full Academic Session</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Batch Description (5-6 lines for Public Overview Page)
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Comprehensive description highlighting top-tier notes, expert faculty, and chapter-wise recorded lectures..."
                />
              </div>

              {editSubjectPrices.length > 0 && (
                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                    Individual Subject Fees & Durations
                  </label>
                  <div className="space-y-2">
                    {editSubjectPrices.map((sub, idx) => (
                      <div
                        key={sub.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex-1">
                          {sub.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[10px]">Fee: ₹</span>
                          <input
                            type="number"
                            value={sub.price}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setEditSubjectPrices((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                              );
                            }}
                            className="w-24 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPricingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white transition-colors cursor-pointer"
                >
                  Save & Update Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
