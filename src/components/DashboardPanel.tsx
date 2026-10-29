import React from 'react';
import { TeacherAvatar } from './TeacherAvatar.tsx';
import { Batch, ScheduleEvent, Teacher, Student } from '../types.ts';
import {
  BookOpen,
  Users,
  Clock,
  Play,
  ArrowRight,
  Sparkles,
  CalendarDays,
  CheckCircle2,
  TrendingUp,
  FileCheck,
  CreditCard,
  AlertCircle
} from 'lucide-react';

interface DashboardPanelProps {
  teacher: Teacher;
  batches: Batch[];
  students: Student[];
  schedule: ScheduleEvent[];
  activities: Array<{ id: string; text: string; time: string; type: string }>;
  isLiveActive: boolean;
  liveSession?: {
    batchId: string;
    batchName: string;
    title: string;
    subject: string;
    topic: string;
  } | null;
  onStartLiveClass: (batchId: string) => void;
  onEndLiveClass?: () => void;
  onViewAllClasses: () => void;
  onViewBatches: () => void;
  onViewStudents: () => void;
}

export const DashboardPanel: React.FC<DashboardPanelProps> = ({
  teacher,
  batches,
  students,
  schedule,
  activities,
  isLiveActive,
  liveSession,
  onStartLiveClass,
  onEndLiveClass,
  onViewAllClasses,
  onViewBatches,
  onViewStudents
}) => {
  const activeBatchesCount = batches.length;
  const totalStudents = students.length;
  const pendingApprovalsCount = students.filter((s) => s.approvalStatus === 'pending' || s.status === 'pending').length;
  const paidCount = students.filter((s) => s.feeStatus === 'paid').length;
  const pendingCount = students.filter((s) => s.feeStatus !== 'paid').length;
  const totalFeesPending = students.reduce((sum, s) => sum + (s.feeDueAmount || 0), 0);

  return (
    <div className="space-y-6">

      {/* Pending Student Approvals Alert Banner */}
      {pendingApprovalsCount > 0 && (
        <div
          onClick={onViewStudents}
          className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md cursor-pointer hover:bg-amber-100/80 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center font-black shrink-0">
              {pendingApprovalsCount}
            </div>
            <div>
              <h4 className="font-extrabold text-sm">
                {pendingApprovalsCount} Student Admission Application{pendingApprovalsCount > 1 ? 's' : ''} Awaiting Verification
              </h4>
              <p className="text-xs text-amber-800">
                Self-registered students are waiting for approval from Sarla Sharma before they can access live streams and notes.
              </p>
            </div>
          </div>

          <button
            onClick={onViewStudents}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-teal-950 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
          >
            <span>Review & Approve Applicants</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      
      {/* 1. Large Dynamic Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-[#0e484d] text-white p-6 sm:p-8 shadow-xl shadow-teal-950/10 border border-teal-700/50">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-1 rounded-full bg-white/20 backdrop-blur-md border-2 border-teal-300/80 shadow-lg shrink-0">
              <TeacherAvatar size="xl" showBadge={false} />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-700/80 text-teal-200 text-xs font-semibold mb-2 border border-teal-500/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{teacher.qualifications || 'Qualified Educator'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Welcome back,
              </h1>
              <h2 className="text-xl sm:text-2xl font-bold text-teal-200 mt-0.5">
                {teacher.name} ({teacher.qualifications})!
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/90 mt-2 max-w-xl leading-relaxed">
                {teacher.bio || 'Empowering students across Class 10, Class 9 & Class 8 with interactive live coaching, conceptual mastery, and rigorous board preparation.'}
              </p>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end text-right bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15">
            <span className="text-xs uppercase tracking-wider text-teal-200 font-bold">
              Active Educator
            </span>
            <span className="text-sm font-semibold text-white mt-0.5">
              {teacher.name}
            </span>
            <span className="text-xs text-amber-300 font-medium mt-0.5">
              ({teacher.qualifications})
            </span>
            <span className="text-[11px] text-teal-100/80 mt-1">
              Active Session Room • Online
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Live Class in Progress Alert (Only visible when active) */}
      {isLiveActive && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-5 shadow-lg shadow-red-900/20 border border-red-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white text-red-700 uppercase tracking-wider">
                  Live Stream In Progress
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white mt-1">
                {liveSession?.title || 'Class 10 Mathematics - Trigonometry'}
              </h3>
              <p className="text-xs text-red-100 mt-0.5">
                Instructor: {teacher.name} • Whiteboard & Live Chat Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => onStartLiveClass(liveSession?.batchId || 'b-10-math')}
              className="flex-1 md:flex-none py-2.5 px-5 rounded-xl bg-white hover:bg-red-50 text-red-700 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current text-red-600" />
              <span>Enter Live Stream</span>
            </button>
            {onEndLiveClass && (
              <button
                onClick={onEndLiveClass}
                className="py-2.5 px-4 rounded-xl bg-red-900/60 hover:bg-red-950 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
              >
                End Class
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Stat Cards Row with Fee Payment Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Batches */}
        <div 
          onClick={onViewBatches}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-teal-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(15,118,110,0.06)] hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Batches
            </p>
            <h3 className="text-3xl font-black text-teal-900 dark:text-teal-200 mt-1.5 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
              {activeBatchesCount}
            </h3>
            <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium mt-1">
              {batches.map(b => b.grade).slice(0, 3).join(', ')}
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-teal-50 dark:bg-slate-800 border border-teal-200/70 dark:border-slate-700 flex items-center justify-center text-teal-700 dark:text-teal-400 group-hover:scale-105 transition-transform">
            <BookOpen className="w-7 h-7" />
          </div>
        </div>

        {/* Total Students */}
        <div 
          onClick={onViewStudents}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-teal-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(15,118,110,0.06)] hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Students
            </p>
            <h3 className="text-3xl font-black text-teal-900 dark:text-teal-200 mt-1.5">
              {totalStudents}
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              100% Enrolled Roster
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-teal-50 dark:bg-slate-800 border border-teal-200/70 dark:border-slate-700 flex items-center justify-center text-teal-700 dark:text-teal-400 group-hover:scale-105 transition-transform">
            <Users className="w-7 h-7" />
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-teal-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(15,118,110,0.06)] flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg. Attendance
            </p>
            <h3 className="text-3xl font-black text-teal-900 dark:text-teal-200 mt-1.5">
              95.4%
            </h3>
            <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium mt-1">
              High participation
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200/70 dark:border-slate-700 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        </div>

        {/* Fee Payment Status Card */}
        <div 
          onClick={onViewStudents}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-teal-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(15,118,110,0.06)] hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Fee Status
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {paidCount} Paid
              </span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                {pendingCount} Pending
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
              Pending: ₹{totalFeesPending.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-200/70 dark:border-slate-700 flex items-center justify-center text-amber-700 dark:text-amber-400 group-hover:scale-105 transition-transform">
            <CreditCard className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Today's Schedule & Upcoming Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Schedule */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-teal-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(15,118,110,0.06)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-teal-50 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-teal-700 dark:text-teal-400" />
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                Today's Schedule
              </h3>
            </div>
            <span className="text-xs font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-teal-100 dark:border-slate-700">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="space-y-3.5">
            {schedule.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-teal-100/80 dark:border-slate-800 bg-teal-50/40 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors flex items-start justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {item.subject.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                      {item.batchName}
                    </h4>
                    <p className="text-xs text-teal-700 dark:text-teal-300 font-medium mt-0.5">
                      {item.topic}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.time}
                      </span>
                      <span>•</span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{item.teacherName}</span>
                    </div>
                  </div>
                </div>

                {isLiveActive && (item.status === 'live' || item.batchName === liveSession?.batchName) ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 border border-red-300 dark:border-red-800 animate-pulse flex items-center gap-1.5 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                    LIVE NOW
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.status === 'completed' ? 'Concluded' : 'Upcoming'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Classes with "Start Class" buttons */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-teal-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(15,118,110,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-teal-50 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <h3 className="font-bold text-slate-800 dark:text-white text-base">
                  Upcoming Classes
                </h3>
              </div>
              <button
                onClick={onViewAllClasses}
                className="text-xs font-semibold text-teal-700 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View All Batches</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {batches.slice(0, 2).map((b) => {
                const isThisBatchLive = isLiveActive && (b.id === liveSession?.batchId || b.name === liveSession?.batchName);
                return (
                  <div
                    key={b.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 shadow-sm transition-all ${
                      isThisBatchLive
                        ? 'border-red-400 bg-gradient-to-br from-red-50/40 via-white to-red-50/20 dark:from-red-950/40 dark:via-slate-850 dark:to-red-950/20 ring-2 ring-red-400/30'
                        : 'border-teal-200/80 dark:border-slate-800 bg-gradient-to-br from-white to-teal-50/30 dark:from-slate-850 dark:to-slate-800 hover:border-teal-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isThisBatchLive ? 'text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-950' : 'text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-950'
                        }`}>
                          {b.grade}
                        </span>

                        {isThisBatchLive ? (
                          <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                            LIVE NOW
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            {b.scheduleTime.split('-')[0].trim()}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">
                        {b.name}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {b.nextTopic}
                      </p>
                      <p className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold mt-1">
                        {b.studentCount} Students • Teacher: {b.teacherName || teacher.name}
                      </p>
                    </div>

                    <button
                      onClick={() => onStartLiveClass(b.id)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                        isThisBatchLive
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20'
                          : 'bg-teal-800 hover:bg-teal-900 text-white shadow-teal-900/15'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isThisBatchLive ? 'Join Ongoing Live Stream' : 'Start Live Class'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-teal-50 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Teacher audio/video check: All inputs configured</span>
            <span className="text-teal-700 dark:text-teal-300 font-semibold">Ready for broadcast</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Recent Activity Log */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-teal-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(15,118,110,0.06)]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-teal-50 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-teal-700 dark:text-teal-400" />
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              Recent Activity & Audit Log
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Live operational events</span>
        </div>

        <div className="divide-y divide-teal-50 dark:divide-slate-800">
          {activities.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                  {act.text}
                </span>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono shrink-0">
                {act.time}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
