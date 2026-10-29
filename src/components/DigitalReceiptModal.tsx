import React from 'react';
import { PaymentReceipt } from '../types.ts';
import { CheckCircle2, Download, ExternalLink, Printer, ShieldCheck, X, MessageSquare, ArrowRight } from 'lucide-react';

interface DigitalReceiptModalProps {
  receipt: PaymentReceipt;
  onClose: () => void;
  onProceedToBatches: () => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  receipt,
  onClose,
  onProceedToBatches
}) => {
  const whatsAppShareText = encodeURIComponent(
    `*Anushree Academy - Official Payment Receipt*\n\n` +
    `Receipt No: ${receipt.receiptNumber}\n` +
    `Student: ${receipt.studentName}\n` +
    `Course: ${receipt.subjectName ? `${receipt.batchName} (${receipt.subjectName})` : receipt.batchName}\n` +
    `Amount Paid: ₹${receipt.amount} (100% Online UPI Verified)\n` +
    `Transaction UTR: ${receipt.transactionRef}\n` +
    `Valid Until: ${receipt.accessValidUntil}\n\n` +
    `*Login Credentials:*\n` +
    `Login ID: ${receipt.studentEmail}\n` +
    `Password: ${receipt.generatedCredentials.password}\n\n` +
    `*Direct Batch Access Link:*\n${receipt.directAccessUrl}\n\n` +
    `_Thank you for choosing Anushree Academy!_`
  );

  const cleanPhone = receipt.studentPhone.replace(/[^0-9]/g, '');
  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${whatsAppShareText}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl border border-teal-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-teal-800 text-white p-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <ShieldCheck className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-teal-100">
                100% Online UPI Verified
              </span>
              <h2 className="text-xl font-black text-white">
                Official Digital Payment Receipt
              </h2>
              <p className="text-xs text-teal-200">
                Anushree Academy • Instant 1-Year Course Access Unlocked
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Success Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                Payment Received & Enrollment Activated
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Digital copy dispatched to WhatsApp: <strong>{receipt.studentPhone}</strong>
              </p>
            </div>
          </div>

          {/* Key Details Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-850">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Receipt Number:</span>
              <span className="font-mono font-black text-slate-900 dark:text-white">{receipt.receiptNumber}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Student Name:</span>
              <span className="font-bold text-slate-900 dark:text-white">{receipt.studentName}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Course / Program:</span>
              <span className="font-bold text-teal-800 dark:text-teal-300">
                {receipt.subjectName ? `${receipt.batchName} (${receipt.subjectName})` : receipt.batchName}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Amount Paid:</span>
              <span className="font-black text-slate-900 dark:text-white text-sm">₹{receipt.amount}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Transaction UTR / Ref:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{receipt.transactionRef}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Payment Date:</span>
              <span className="text-slate-700 dark:text-slate-300">{receipt.paymentDate}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Course Validity Expiry:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {receipt.accessValidUntil} (1 Year)
              </span>
            </div>
          </div>

          {/* Auto-Generated Login Credentials */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <h4 className="text-xs font-black text-amber-900 dark:text-amber-200">
                Your Secure Login Credentials & Direct Access
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900">
                <span className="text-slate-400 block text-[10px]">Registered Email:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{receipt.studentEmail}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900">
                <span className="text-slate-400 block text-[10px]">Password:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {receipt.generatedCredentials.password}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send Receipt on WhatsApp</span>
            </a>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>

          <button
            onClick={onProceedToBatches}
            className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all transform hover:scale-105"
          >
            <span>Access Enrolled Batches</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
