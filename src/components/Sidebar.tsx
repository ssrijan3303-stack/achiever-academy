import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  FolderClosed,
  Users,
  UserCheck,
  Settings,
  Radio,
  GraduationCap,
  CreditCard,
  Lock,
  Shield,
  Film,
  UserPlus,
  HelpCircle,
  MessageSquare,
  Calendar,
  Award,
  Bell,
  DollarSign,
  Sparkles,
  Compass,
  LogOut,
  Bookmark
} from 'lucide-react';
import { Teacher, Student, UserRole } from '../types.ts';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isLiveActive: boolean;
  activeTeacher: Teacher;
  activeStudent: Student;
  currentRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  pendingApprovalsCount?: number;
  onOpenStudentAuth?: () => void;
  onRequireAuth?: (message?: string) => void;
  onSignOut?: () => void;
}

interface SidebarMenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  locked?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  isLiveActive,
  activeTeacher,
  activeStudent,
  currentRole,
  onSwitchRole,
  pendingApprovalsCount = 0,
  onOpenStudentAuth,
  onRequireAuth,
  onSignOut
}) => {
  const isAdmin = currentRole === 'admin';
  const isTeacher = currentRole === 'teacher';
  const isGuest = currentRole === 'guest';

  const adminMenuItems: SidebarMenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'batches', label: 'Course Batches', icon: BookOpen },
    {
      id: 'financials',
      label: 'Financials & Payouts',
      icon: DollarSign,
      badge: 'BILLING'
    },
    {
      id: 'live',
      label: 'Live Classes',
      icon: Video,
      badge: isLiveActive ? 'LIVE' : undefined
    },
    { id: 'recorded', label: 'Recorded Lectures Archive', icon: Film },
    { id: 'content', label: 'Content Library & Notes Upload', icon: FolderClosed },
    { id: 'quizzes', label: 'Quiz & Test Creator', icon: HelpCircle },
    {
      id: 'students',
      label: 'Students & Approvals',
      icon: Users,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} New` : undefined
    },
    { id: 'timetable', label: 'Smart Timetable & Calendar', icon: Calendar },
    { id: 'doubts', label: 'Doubt Counter & Q&A', icon: MessageSquare },
    { id: 'settings', label: 'Settings & Certificate', icon: Settings },
  ];

  // Autonomous Teacher Menu: Academic scope strictly enforced (Financials & Admin controls hidden)
  const teacherMenuItems: SidebarMenuItem[] = [
    { id: 'dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
    {
      id: 'live',
      label: 'Live Classroom Studio',
      icon: Video,
      badge: isLiveActive ? 'LIVE' : undefined
    },
    { id: 'quizzes', label: 'Quiz & Test Studio', icon: HelpCircle },
    { id: 'recorded', label: 'Recorded Lectures', icon: Film },
    { id: 'content', label: 'Subject Study Notes', icon: FolderClosed },
    { id: 'timetable', label: 'My Teaching Schedule', icon: Calendar },
    { id: 'doubts', label: 'Doubt Clearing Hub', icon: MessageSquare },
  ];

  // Authenticated Student Menu
  const studentMenuItems: SidebarMenuItem[] = [
    { id: 'student-portal', label: 'Student Dashboard', icon: GraduationCap },
    {
      id: 'live',
      label: 'Join Live Class',
      icon: Video,
      badge: isLiveActive ? 'LIVE' : undefined
    },
    {
      id: 'quizzes',
      label: 'Online Assessments & Tests',
      icon: HelpCircle,
      badge: 'LIVE'
    },
    { id: 'timetable', label: 'Smart Timetable & Countdown', icon: Calendar },
    { id: 'doubts', label: 'Doubt Counter & Q&A', icon: MessageSquare },
    { id: 'bookmarks', label: 'Revision Bookmarks', icon: Bookmark },
  ];

  // Unauthenticated Guest Menu (Public Store)
  const guestMenuItems: SidebarMenuItem[] = [
    { id: 'all-batches', label: 'All Batches (Public Store)', icon: Sparkles },
    { id: 'my-batches-locked', label: 'My Batches', icon: BookOpen, locked: true },
    { id: 'live-locked', label: 'Live Classroom', icon: Video, locked: true },
    { id: 'recorded-locked', label: 'Recorded Lectures', icon: Film, locked: true },
    { id: 'timetable', label: 'Timetable & Schedule', icon: Calendar },
  ];

  const currentMenuItems = isAdmin
    ? adminMenuItems
    : isTeacher
    ? teacherMenuItems
    : isGuest
    ? guestMenuItems
    : studentMenuItems;

  const handleItemClick = (item: any) => {
    if (item.locked || isGuest && (item.id === 'my-batches-locked' || item.id === 'live-locked' || item.id === 'recorded-locked')) {
      if (onRequireAuth) {
        onRequireAuth('Please Login or Register to Access Enrolled Courses');
      } else if (onOpenStudentAuth) {
        onOpenStudentAuth();
      }
      return;
    }
    onViewChange(item.id);
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-teal-100 dark:border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-68px)] p-4 select-none transition-colors">
      
      {/* Strict Authenticated Portal Scope Header */}
      <div className="mb-4 pb-3 border-b border-teal-50 dark:border-slate-800">
        <div className="flex items-center gap-2 px-1 py-1">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                <Shield className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-black tracking-wide uppercase text-slate-900 dark:text-white block">
                  Admin Master Control
                </span>
                <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold block">
                  Full Platform Management
                </span>
              </div>
            </div>
          ) : isTeacher ? (
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                <UserCheck className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-black tracking-wide uppercase text-slate-900 dark:text-white block">
                  Faculty Dashboard
                </span>
                <span className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold block">
                  Academic Teaching Portal
                </span>
              </div>
            </div>
          ) : isGuest ? (
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                <Compass className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-black tracking-wide uppercase text-slate-900 dark:text-white block">
                  Course Catalog
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
                  Public Store & Explorer
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                <GraduationCap className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-black tracking-wide uppercase text-slate-900 dark:text-white block">
                  Student Portal
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                  Enrolled Courses & Classes
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="space-y-1.5 overflow-y-auto pr-1">
        {currentMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeView === item.id ||
            (isGuest && activeView === 'all-batches' && item.id === 'all-batches');

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
                isActive
                  ? isAdmin
                    ? 'bg-gradient-to-r from-teal-800 to-teal-900 text-white font-semibold shadow-md shadow-teal-900/15'
                    : isGuest
                    ? 'bg-gradient-to-r from-amber-500 to-teal-800 text-white font-semibold shadow-md'
                    : 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white font-semibold shadow-md shadow-teal-900/15'
                  : 'text-slate-600 dark:text-slate-300 hover:text-teal-900 dark:hover:text-white hover:bg-teal-50/70 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-teal-700 dark:text-teal-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.locked && (
                <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Lock className="w-2.5 h-2.5" />
                  <span>LOGIN</span>
                </span>
              )}

              {item.badge && (
                <span
                  className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                    item.badge.includes('LIVE')
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-amber-500 text-teal-950 font-black'
                  }`}
                >
                  {item.badge.includes('LIVE') && <Radio className="w-2.5 h-2.5" />}
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Guest Action: Sign Up / Login */}
        {isGuest && (
          <div className="pt-3">
            <button
              onClick={() => {
                if (onRequireAuth) {
                  onRequireAuth('Please Login or Register to Access Enrolled Courses');
                } else if (onOpenStudentAuth) {
                  onOpenStudentAuth();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-slate-800 hover:bg-teal-100/60 dark:hover:bg-slate-700 text-teal-900 dark:text-teal-200 text-xs font-bold transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>Student Sign Up / Login</span>
            </button>
          </div>
        )}
      </nav>

      {/* Profile Card Footer with Isolated Sign Out */}
      <div className="mt-auto pt-4 border-t border-teal-100 dark:border-slate-800 space-y-2">
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50/50 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl p-3 border border-teal-200/60 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2 h-2 rounded-full ${
                isAdmin ? 'bg-teal-600' : isTeacher ? 'bg-blue-600' : isGuest ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
            ></span>
            <span className="text-[11px] font-bold text-teal-950 dark:text-teal-200">
              {isAdmin ? 'Master Administrator' : isTeacher ? 'Faculty Member' : isGuest ? 'Guest Explorer' : 'Enrolled Student'}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
            {isAdmin ? activeTeacher.name : isTeacher ? activeTeacher.name : isGuest ? 'Explore Store' : activeStudent.name}
          </p>
          <p className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold truncate">
            {isAdmin
              ? activeTeacher.qualifications
              : isTeacher
              ? `${activeTeacher.subjectsExpertise.join(', ')} Specialist`
              : isGuest
              ? 'Browsing All Batches'
              : activeStudent.batchName}
          </p>
        </div>

        {/* Dedicated Sign Out Button for Authenticated Users */}
        {!isGuest && (
          <button
            onClick={() => {
              if (onSignOut) {
                onSignOut();
              } else {
                onSwitchRole('guest');
                onViewChange('all-batches');
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
};
