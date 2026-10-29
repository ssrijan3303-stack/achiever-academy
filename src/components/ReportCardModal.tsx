import React, { useState } from 'react';
import { StudentReportCard } from '../types.ts';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  X,
  FileText,
  Sparkles,
  Save,
  BookOpen,
  User,
  ShieldCheck
} from 'lucide-react';

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportCard: StudentReportCard | null;
  isAdmin: boolean;
  onUpdateRemarks?: (studentId: string, remarks: string) => Promise<void>;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  isOpen,
  onClose,
  reportCard,
  isAdmin,
  onUpdateRemarks
}) => {
  const [remarks, setRemarks] = useState(reportCard?.teacherRemarks || '');
  const [isSavingRemarks, setIsSavingRemarks] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !reportCard) return null;

  const handleSaveRemarks = async () => {
    if (!onUpdateRemarks) return;
    setIsSavingRemarks(true);
    await onUpdateRemarks(reportCard.studentId, remarks);
    setIsSavingRemarks(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl my-6 rounded-3xl shadow-2xl border-2 border-teal-600 dark:border-teal-800 flex flex-col overflow-hidden relative">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Official Academic Performance Report Card
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL REPORT CARD BODY */}
        <div className="p-6 sm:p-10 space-y-6 text-slate-900 dark:text-white bg-white dark:bg-slate-900">
          
          {/* Header Banner */}
          <div className="border-b-2 border-teal-800 pb-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-800 text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-amber-400">
                AA
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-teal-900 dark:text-teal-300 tracking-tight">
                  ANUSHREE ACADEMY
                </h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  Continuous Assessment & Academic Progress Report
                </p>
                <p className="text-[11px] text-slate-400">
                  Affiliated with CBSE Secondary Board Preparation • Greater Noida, NCR
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-[11px] font-bold text-slate-400 block">Academic Session 2026-27</span>
              <span className="text-xs font-bold text-teal-800 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800 inline-block mt-1">
                Issued: {reportCard.generatedDate}
              </span>
            </div>
          </div>

          {/* Student Profile Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-teal-50/60 dark:bg-slate-800/60 border border-teal-100 dark:border-slate-700 text-xs">
            <div>
              <span className="text-slate-400 font-bold block">Student Name</span>
              <strong className="text-sm font-extrabold text-slate-900 dark:text-white">
                {reportCard.studentName}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">Roll Number</span>
              <strong className="text-sm font-mono font-extrabold text-teal-800 dark:text-teal-300">
                {reportCard.rollNumber}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">Enrolled Batch</span>
              <strong className="text-sm font-extrabold text-slate-900 dark:text-white">
                {reportCard.batchName}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">Overall Grade</span>
              <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {reportCard.grade}
              </strong>
            </div>
          </div>

          {/* 4 Performance Progress Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-teal-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
                <span>Attendance</span>
                <span>{reportCard.attendanceRate}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-teal-700 h-full rounded-full"
                  style={{ width: `${reportCard.attendanceRate}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {reportCard.classesAttended} of {reportCard.totalClassesHeld} sessions attended
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-teal-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
                <span>Average Quiz Score</span>
                <span className="text-amber-500">{reportCard.averageQuizScore}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${reportCard.averageQuizScore}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Highest mark: {reportCard.highestQuizScore}%
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-teal-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
                <span>Assignments</span>
                <span>
                  {reportCard.assignmentsCompleted}/{reportCard.totalAssignments}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{
                    width: `${Math.round(
                      (reportCard.assignmentsCompleted / reportCard.totalAssignments) * 100
                    )}%`
                  }}
                />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                92% homework completion rate
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-teal-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
                <span>Fee Clearance</span>
                <span
                  className={
                    reportCard.feeStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                  }
                >
                  {reportCard.feeStatus.toUpperCase()}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full ${
                    reportCard.feeStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: reportCard.feeStatus === 'paid' ? '100%' : '50%' }}
                />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {reportCard.feeStatus === 'paid' ? 'No outstanding dues' : 'Current month due'}
              </span>
            </div>
          </div>

          {/* Test & Assessment History Breakdown Table */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>Chapter-Wise Assessment Record</span>
            </h3>

            <div className="overflow-x-auto border border-teal-100 dark:border-slate-700 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-teal-50 dark:bg-slate-800 text-teal-900 dark:text-teal-200 font-extrabold border-b border-teal-100 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Assessment Title</th>
                    <th className="p-3">Marks Scored</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Percentage</th>
                    <th className="p-3">Evaluation Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-50 dark:divide-slate-800">
                  {reportCard.quizBreakdown.length > 0 ? (
                    reportCard.quizBreakdown.map((q, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          {q.quizTitle}
                        </td>
                        <td className="p-3 font-extrabold text-emerald-600">{q.score}</td>
                        <td className="p-3 text-slate-500">{q.totalMarks}</td>
                        <td className="p-3 font-bold">{q.percentage}%</td>
                        <td className="p-3 text-slate-400">{q.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400">
                        No official assessments submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Teacher's Remarks Section */}
          <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-950 dark:text-amber-200">
                Teacher's Qualitative Remarks & Guidance
              </h4>
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400">
                — {reportCard.teacherName} (Head Educator)
              </span>
            </div>

            {isAdmin ? (
              <div className="space-y-2 no-print">
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {savedSuccess && 'Remarks updated in student profile!'}
                  </span>
                  <button
                    onClick={handleSaveRemarks}
                    disabled={isSavingRemarks}
                    className="px-4 py-1.5 rounded-xl bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingRemarks ? 'Saving...' : 'Save Remarks'}</span>
                  </button>
                </div>
              </div>
            ) : null}

            {/* Print & View rendering for remarks */}
            <p className={`text-xs text-slate-800 dark:text-slate-200 italic leading-relaxed ${isAdmin ? 'hidden print:block' : ''}`}>
              "{reportCard.teacherRemarks}"
            </p>
          </div>

          {/* Signatures & Seal Footer */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-end justify-between">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-teal-800 flex items-center justify-center text-[10px] font-black text-teal-800 uppercase mx-auto rotate-[-12deg]">
                ACADEMY SEAL
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Official Verification Stamp</span>
            </div>

            <div className="text-center">
              <div className="font-serif italic text-lg text-teal-900 dark:text-teal-300 font-bold pb-1">
                Sarla Sharma
              </div>
              <div className="border-t border-slate-400 w-44 pt-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Sarla Sharma (B.Ed, CTET)
                </span>
                <span className="text-[10px] text-slate-400 block">Head of Academics, Anushree Academy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
