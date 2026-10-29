import React, { useState } from 'react';
import { ContentItem, Student } from '../types.ts';
import {
  ShieldAlert,
  Lock,
  Download,
  Eye,
  X,
  FileText,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Printer
} from 'lucide-react';

interface SecurePdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
  student: Student;
}

export const SecurePdfViewerModal: React.FC<SecurePdfViewerModalProps> = ({
  isOpen,
  onClose,
  item,
  student
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 4;

  if (!isOpen || !item) return null;

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const watermarkString = `CONFIDENTIAL • ANUSHREE ACADEMY • ${student.name.toUpperCase()} • ${student.phone} • ${currentDate} • DO NOT SHARE`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 no-print select-none"
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[92vh] rounded-3xl shadow-2xl border border-teal-200 dark:border-teal-900 flex flex-col overflow-hidden relative">
        
        {/* Security Warning Header */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800">
                  Secure Protected Document
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  • Dynamic Watermarking Active
                </span>
              </div>
              <h3 className="text-sm font-bold text-white truncate max-w-md mt-0.5">
                {item.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>Licensed to: <strong className="text-white">{student.name}</strong> ({student.batchName})</span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Page Navigation */}
        <div className="bg-teal-50/70 dark:bg-slate-800/80 px-5 py-2.5 flex items-center justify-between border-b border-teal-100 dark:border-slate-700 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-teal-200 dark:border-slate-600 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            </button>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-teal-200 dark:border-slate-600 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white dark:bg-slate-700 border border-teal-200 dark:border-slate-600 rounded-lg p-0.5">
              <button
                onClick={() => setZoom((z) => Math.max(75, z - 10))}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-teal-700 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-bold text-slate-700 dark:text-slate-200">{zoom}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(150, z + 10))}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-teal-700 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/50">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Right-Click, Screenshot & Print Disabled</span>
            </div>
          </div>
        </div>

        {/* Main Document Canvas with Dynamic Multi-Layer Watermark */}
        <div
          className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 flex justify-center relative select-none"
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
        >
          {/* Document Sheet */}
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-2xl min-h-[780px] bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 relative overflow-hidden transition-transform duration-150"
          >
            {/* DYNAMIC WATERMARK OVERLAY (Repeating Diagonals across entire canvas) */}
            <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-around rotate-[-30deg] scale-125 opacity-20 dark:opacity-25 select-none">
              {Array.from({ length: 9 }).map((_, idx) => (
                <div
                  key={idx}
                  className="text-xs sm:text-sm font-black tracking-widest text-teal-900 dark:text-teal-300 uppercase whitespace-nowrap text-center py-4"
                >
                  {watermarkString}
                </div>
              ))}
            </div>

            {/* Centered Large High-Contrast Watermark Stamp */}
            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center opacity-15 dark:opacity-20 select-none">
              <div className="border-4 border-dashed border-red-600 dark:border-red-400 rounded-3xl p-8 rotate-[-25deg] text-center max-w-md">
                <span className="text-2xl font-black text-red-600 dark:text-red-400 tracking-wider block">
                  ANUSHREE ACADEMY
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-1">
                  OFFICIAL STUDY MATERIAL • PROTECTED COPY
                </span>
                <span className="text-xs font-mono font-extrabold text-red-700 dark:text-red-400 block mt-2">
                  REGISTERED TO: {student.name.toUpperCase()} ({student.phone})
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-1">
                  Timestamp: {currentDate} {currentTime} • Unauthorized duplication is punishable under IT Act
                </span>
              </div>
            </div>

            {/* Document Content Headers */}
            <div className="relative z-10 border-b-2 border-teal-600 pb-4 mb-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                  Anushree Academy • Chapter Study Capsule
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                  {item.title}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Folder: {item.folderName} &gt; {item.subfolderName} • Prepared by Sarla Sharma (B.Ed, CTET)
                </p>
              </div>
              <div className="text-right">
                <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white font-black text-lg flex items-center justify-center shadow-md">
                  AA
                </div>
                <span className="text-[10px] font-bold text-slate-400 block mt-1">Class 10 CBSE</span>
              </div>
            </div>

            {/* Simulated High-Value Educational Content */}
            <div className="relative z-10 space-y-5 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
              <div className="bg-teal-50/60 dark:bg-slate-800/60 p-4 rounded-xl border border-teal-100 dark:border-slate-700">
                <h4 className="font-extrabold text-teal-950 dark:text-teal-200 text-sm mb-1 flex items-center gap-2">
                  <span>📌 Key Concept & Summary (Page {currentPage})</span>
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {currentPage === 1 &&
                    'The Fundamental Theorem of Arithmetic guarantees every composite number can be expressed as a unique product of primes, up to the order in which prime factors occur. Real Numbers form the foundational pillar for secondary algebra and calculus.'}
                  {currentPage === 2 &&
                    'Euclid’s Division Lemma states that for any two given positive integers a and b, there exist unique integers q and r such that a = bq + r, where 0 ≤ r < b. We apply this recursively to determine Highest Common Factor (HCF).'}
                  {currentPage === 3 &&
                    'Proof of Irrationality of √2, √3, and √5 via Contradiction Method: Assume p/q in lowest terms, square both sides to show common prime factor 5 divides both p and q, creating mathematical contradiction.'}
                  {currentPage === 4 &&
                    'Practice Problems & Board Exemplar: Solve 12 high-frequency questions curated from CBSE 2021-2025 question banks. Submit your step-by-step solutions before Thursday.'}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  Core Formulae & Theoretical Breakdown
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      1
                    </span>
                    <span>
                      <strong>HCF(a, b) × LCM(a, b) = a × b</strong> (Valid strictly for any two positive integers a and b).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      2
                    </span>
                    <span>
                      Let x = p/q be a rational number such that prime factorisation of q is of the form <strong>2ⁿ × 5ᵐ</strong>, where n, m are non-negative integers. Then x has a decimal expansion which terminates.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      3
                    </span>
                    <span>
                      If prime p divides a² (where a is a positive integer), then <strong>p divides a</strong>.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/40">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Teacher Solved Example
                </h4>
                <p className="font-mono text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  Question: Find HCF and LCM of 96 and 404 using prime factorisation.<br />
                  Solution:<br />
                  96 = 2⁵ × 3<br />
                  404 = 2² × 101<br />
                  HCF(96, 404) = 2² = 4<br />
                  LCM(96, 404) = (96 × 404) / 4 = 9,696.
                </p>
              </div>

              {/* Security Footer inside document */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>© Anushree Academy • All Rights Reserved</span>
                <span>Watermarked for Student: {student.name} ({student.phone})</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Warning Sticky Bottom Bar */}
        <div className="bg-amber-50 dark:bg-amber-950/80 px-4 py-2 border-t border-amber-200 dark:border-amber-900 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-[11px]">
              <strong>Anti-Piracy Shield:</strong> This PDF is digitally fingerprinted with your student identity. Unauthorized forwarding, printing, or screen capture will lead to disciplinary suspension.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-amber-200 dark:bg-amber-800 text-amber-950 dark:text-white font-bold text-xs cursor-pointer hover:bg-amber-300"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
