import React, { useState } from 'react';
import { DigitalCertificate } from '../types.ts';
import confetti from 'canvas-confetti';
import {
  Award,
  Download,
  X,
  Sparkles,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  QrCode
} from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: DigitalCertificate | null;
  isSamplePreview?: boolean;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificate,
  isSamplePreview = false
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !certificate) return null;

  const handleDownload = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
    window.print();
  };

  const verificationCode = certificate.verificationCode || certificate.certificateNumber || 'AA-FSDB-RK4579';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
    certificate.verificationUrl || `https://achieveracademy.edu/verify/${verificationCode}`
  )}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(verificationCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border-2 border-amber-400 dark:border-amber-600 flex flex-col overflow-hidden relative my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-5 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                {isSamplePreview ? 'Certificate Live Sample Preview' : 'Official Verified Certificate of Achievement'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Verification Code: <strong className="text-amber-200">{verificationCode}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-slate-700"
              title="Copy Verification Code"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy Code'}</span>
            </button>

            {!isSamplePreview && (
              <button
                onClick={handleDownload}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Download / Print</span>
              </button>
            )}

            {/* Prominent Cross Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-red-900/60 hover:text-red-200 flex items-center justify-center text-slate-400 cursor-pointer transition-colors border border-slate-700/80"
              aria-label="Close Certificate Modal"
              title="Close Preview (X)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sample Preview Disclaimer Banner */}
        {isSamplePreview && (
          <div className="no-print bg-amber-500/15 border-b border-amber-500/30 px-6 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Sample Preview:</strong> Complete your batch/course to unlock your personalized certificate with your name and official verification code.
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30 shrink-0">
              Preview Mode
            </span>
          </div>
        )}

        {/* PRINTABLE HIGH-RESOLUTION LIGHT-CREAM & GOLD CERTIFICATE */}
        <div className="p-4 sm:p-10 bg-[#fffdf7] text-slate-900 flex justify-center items-center overflow-y-auto max-h-[calc(85vh-80px)]">
          <div className="w-full border-8 border-double border-amber-600/90 rounded-3xl p-6 sm:p-10 relative bg-[#fffefa] shadow-xl overflow-hidden text-center space-y-6">
            
            {/* Corner Decorative Filigrees */}
            <div className="absolute top-2.5 left-2.5 w-10 h-10 border-t-4 border-l-4 border-amber-600 rounded-tl-xl pointer-events-none" />
            <div className="absolute top-2.5 right-2.5 w-10 h-10 border-t-4 border-r-4 border-amber-600 rounded-tr-xl pointer-events-none" />
            <div className="absolute bottom-2.5 left-2.5 w-10 h-10 border-b-4 border-l-4 border-amber-600 rounded-bl-xl pointer-events-none" />
            <div className="absolute bottom-2.5 right-2.5 w-10 h-10 border-b-4 border-r-4 border-amber-600 rounded-br-xl pointer-events-none" />

            {/* Watermark Crest */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <Award className="w-96 h-96 text-amber-900" />
            </div>

            {/* Academy Emblem Header */}
            <div className="mx-auto flex flex-col items-center relative z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-teal-900 to-teal-950 text-amber-300 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg border-2 border-amber-400 mb-2.5">
                AA
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-wider text-teal-950 uppercase">
                Achiever Academy
              </h1>
              <p className="text-[11px] sm:text-xs font-sans font-bold text-amber-800 tracking-widest uppercase mt-0.5">
                National Online Coaching Platform • Premier Academic Excellence
              </p>
            </div>

            {/* Ribbon Badge Title */}
            <div className="py-1 relative z-10">
              <span className="inline-block bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-widest px-6 py-1.5 rounded-full shadow-sm border border-amber-400/50">
                CERTIFICATE OF ACHIEVEMENT
              </span>
            </div>

            {/* Recipient Details */}
            <div className="space-y-1.5 relative z-10">
              <p className="text-xs sm:text-sm text-slate-600 font-serif italic">
                This prestigious academic credential is proudly conferred upon
              </p>
              <h2 className="text-3xl sm:text-5xl font-serif font-black text-teal-950 tracking-tight underline decoration-amber-400 decoration-2 underline-offset-8">
                {certificate.studentName}
              </h2>
              <p className="text-xs font-mono font-bold text-slate-500 pt-2">
                Roll Number: <strong className="text-slate-800">{certificate.studentRollNumber}</strong>
              </p>
            </div>

            {/* Achievement Paragraph */}
            <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed font-sans relative z-10">
              for exemplary dedication and successfully completing the rigorous curriculum of{' '}
              <strong className="text-teal-950 font-bold">{certificate.courseTitle}</strong>{' '}
              ({certificate.batchName}), having demonstrated exceptional conceptual mastery with{' '}
              <strong className="text-amber-800 font-black">{certificate.grade}</strong> (Aggregate Score: {certificate.overallScore}%).
            </p>

            {/* Footer with Seal, QR Code, and Signatures */}
            <div className="pt-6 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-6 px-2 sm:px-6 relative z-10">
              
              {/* Left Signature: Director */}
              <div className="text-center order-2 sm:order-1">
                <div className="font-serif italic text-lg sm:text-xl font-bold text-teal-950 pb-1">
                  {certificate.issuerName || 'Dr. Vikramaditya Sen'}
                </div>
                <div className="border-t border-slate-400 w-44 pt-1">
                  <span className="text-xs font-bold text-slate-800 block">
                    {certificate.issuerName || 'Dr. Vikramaditya Sen'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {certificate.issuerTitle || 'Founder & Academic Director'}
                  </span>
                </div>
              </div>

              {/* Center Golden Seal */}
              <div className="text-center order-1 sm:order-2 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 border-4 border-amber-600 flex flex-col items-center justify-center text-slate-900 shadow-md rotate-[-6deg]">
                  <Award className="w-6 h-6 text-amber-950" />
                  <span className="text-[7.5px] font-black uppercase tracking-tighter text-amber-950 text-center px-1 leading-tight">
                    {certificate.sealText || 'OFFICIAL SEAL • ACHIEVER ACADEMY'}
                  </span>
                  <span className="text-[7px] font-bold text-amber-900 mt-0.5">VERIFIED</span>
                </div>
              </div>

              {/* Right Signature: Lead Instructor */}
              <div className="text-center order-3">
                <div className="font-serif italic text-lg sm:text-xl font-bold text-teal-950 pb-1">
                  {certificate.leadInstructorName || 'Sarla Sharma'}
                </div>
                <div className="border-t border-slate-400 w-44 pt-1">
                  <span className="text-xs font-bold text-slate-800 block">
                    {certificate.leadInstructorName || 'Sarla Sharma'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {certificate.leadInstructorDesignation || 'Head of Academics & Senior Faculty'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Verification Section & QR Code */}
            <div className="pt-4 border-t border-amber-100 flex flex-col sm:flex-row items-center justify-between text-left text-xs gap-3 px-2 sm:px-6 relative z-10">
              <div className="flex items-center gap-3">
                <img
                  src={qrCodeUrl}
                  alt="QR Verification"
                  className="w-14 h-14 rounded-lg border border-amber-300 bg-white p-1 shadow-xs"
                />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Official Credential ID
                  </div>
                  <div className="font-mono text-xs font-black text-teal-950 tracking-wider">
                    {verificationCode}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Issued: {certificate.issueDate}
                  </div>
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-500 font-mono">
                <span className="block text-slate-400">Official Verification URL</span>
                <span className="text-teal-900 font-bold">{certificate.verificationUrl || `https://achieveracademy.edu/verify/${verificationCode}`}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
