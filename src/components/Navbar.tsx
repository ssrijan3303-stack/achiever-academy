import React, { useState, useRef, useEffect } from 'react';
import { TeacherAvatar } from './TeacherAvatar.tsx';
import {
  Bell,
  Calendar,
  ChevronDown,
  CheckCircle2,
  UserCheck,
  Settings,
  LogOut,
  Check,
  GraduationCap,
  Shield,
  Sun,
  Moon,
  MessageSquare,
  Sparkles,
  Compass,
  Lock,
  Video
} from 'lucide-react';
import { Teacher, AcademySettings, Student, UserRole } from '../types.ts';

interface NavbarProps {
  academy: AcademySettings;
  activeTeacher: Teacher;
  allTeachers: Teacher[];
  activeStudent: Student;
  currentRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  onSwitchTeacher: (teacherId: string) => void;
  onNavigate: (view: string) => void;
  onOpenAnnouncements: () => void;
  onOpenCalendar: () => void;
  unreadAnnouncementsCount: number;
  onOpenStudentAuth?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenNotificationsHub?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  academy,
  activeTeacher,
  allTeachers,
  activeStudent,
  currentRole,
  onSwitchRole,
  onSwitchTeacher,
  onNavigate,
  onOpenAnnouncements,
  onOpenCalendar,
  unreadAnnouncementsCount,
  onOpenStudentAuth,
  isDarkMode = false,
  onToggleDarkMode,
  onOpenNotificationsHub,
  onSignOut
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = currentRole === 'admin';
  const isTeacher = currentRole === 'teacher';
  const isGuest = currentRole === 'guest';

  const handleBrandClick = () => {
    if (isAdmin || isTeacher) {
      onNavigate('dashboard');
    } else if (isGuest) {
      onNavigate('all-batches');
    } else {
      onNavigate('student-portal');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-teal-100 dark:border-slate-800 shadow-[0_1px_4px_rgba(0,0,0,0.03)] px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={handleBrandClick}
        >
          {academy.logoUrl ? (
            <img
              src={academy.logoUrl}
              alt={academy.name}
              className="w-10 h-10 rounded-xl object-contain border border-teal-100 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-800 via-teal-700 to-amber-500 flex items-center justify-center shadow-md shadow-teal-800/15 text-white font-black text-xl shrink-0">
              <div className="relative flex items-center justify-center">
                <span className="tracking-tighter font-serif text-lg">
                  {academy.name ? academy.name.charAt(0) : 'A'}
                </span>
                <span className="absolute -top-1 -right-2 text-[10px] text-amber-300 font-bold">✦</span>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-teal-950 dark:text-white font-sans uppercase">
                {academy.name || 'ACHIEVER ACADEMY'}
              </span>
            </div>
            <p className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold tracking-wider uppercase">
              {academy.tagline || 'National Online Coaching Platform'}
            </p>
          </div>
        </div>

        {/* Right Navigation & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Guest / Student Login Action */}
          {isGuest && (
            <button
              onClick={() => onOpenStudentAuth && onOpenStudentAuth()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-teal-950 text-xs font-black transition-all cursor-pointer shadow-sm transform hover:scale-105"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-950" />
              <span>Student Login / Register</span>
            </button>
          )}
          
          {/* Role Status Badge (Strict Authenticated View) */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
              isAdmin
                ? 'bg-teal-50 dark:bg-slate-800 text-teal-900 dark:text-teal-200 border-teal-200 dark:border-slate-700'
                : isTeacher
                ? 'bg-blue-50 dark:bg-slate-800 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-slate-700'
                : isGuest
                ? 'bg-amber-50 dark:bg-slate-800 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                : 'bg-emerald-50 dark:bg-slate-800 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-slate-700'
            }`}
          >
            {isAdmin ? (
              <>
                <Shield className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                <span>Admin Portal</span>
              </>
            ) : isTeacher ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                <span>Faculty Portal</span>
              </>
            ) : isGuest ? (
              <>
                <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Guest / Store Mode</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Student Portal</span>
              </>
            )}
          </div>

          {/* Announcements */}
          <button
            onClick={onOpenAnnouncements}
            className="relative flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-800 dark:hover:text-white transition-colors py-2 px-3 rounded-xl hover:bg-teal-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span className="hidden sm:inline">Notices</span>
            {unreadAnnouncementsCount > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {unreadAnnouncementsCount}
              </span>
            )}
          </button>

          {/* Calendar */}
          <button
            onClick={onOpenCalendar}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-800 transition-colors py-2 px-3 rounded-xl hover:bg-teal-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span className="hidden sm:inline">Timetable</span>
          </button>

          {/* Automated WhatsApp & Alerts Hub (Admin Only) */}
          {isAdmin && onOpenNotificationsHub && (
            <button
              onClick={onOpenNotificationsHub}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 transition-colors py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
              title="Automated WhatsApp & SMS Notifications Hub (Admin Only)"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Alerts Hub</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-amber-400 hover:bg-teal-50 dark:hover:bg-slate-800 border border-teal-100 dark:border-slate-700 transition-all cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* Dynamic User Profile Dropdown */}
          <div className="relative pl-2 border-l border-teal-100 dark:border-slate-800" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
            >
              {isAdmin ? (
                <TeacherAvatar size="sm" showBadge={true} />
              ) : isGuest ? (
                <div className="w-8 h-8 rounded-full bg-amber-400 text-teal-950 font-black flex items-center justify-center text-xs">
                  <Compass className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-extrabold flex items-center justify-center text-xs">
                  {activeStudent.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              
              <div className="hidden md:block text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-900 dark:group-hover:text-teal-300 leading-none">
                    {isAdmin ? activeTeacher.name : isGuest ? 'Guest Visitor' : activeStudent.name}
                  </span>
                  {!isGuest && (
                    <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400 inline" />
                  )}
                </div>
                {/* NO ROLL NUMBER! */}
                <span className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold leading-tight block mt-0.5">
                  {isAdmin
                    ? activeTeacher.qualifications
                    : isGuest
                    ? 'Explore Store'
                    : `${activeStudent.batchName} • Student`}
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-300 group-hover:text-teal-700 dark:group-hover:text-white transition-transform ${
                  isProfileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-teal-100 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Active User Card */}
                <div className="px-4 pb-3 border-b border-teal-50 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    {isAdmin ? (
                      <TeacherAvatar size="md" showBadge={true} />
                    ) : isGuest ? (
                      <div className="w-10 h-10 rounded-full bg-amber-400 text-teal-950 font-black flex items-center justify-center text-sm shadow-md">
                        <Compass className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-extrabold flex items-center justify-center text-sm">
                        {activeStudent.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {isAdmin ? activeTeacher.name : isGuest ? 'Guest Explorer' : activeStudent.name}
                      </p>
                      {/* NO ROLL NUMBER! */}
                      <p className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold truncate">
                        {isAdmin
                          ? activeTeacher.qualifications
                          : isGuest
                          ? 'Browsing All Batches'
                          : activeStudent.batchName}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {isAdmin
                          ? activeTeacher.email
                          : isGuest
                          ? 'Unauthenticated visitor'
                          : activeStudent.email}
                      </p>
                    </div>
                  </div>
                  
                  {/* Authenticated Role Portal Status Badge */}
                  <div className="mt-3 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider">Access Scope</span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                      isAdmin
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                        : isTeacher
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : isGuest
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {isAdmin ? 'Master Administrator' : isTeacher ? 'Faculty Instructor' : isGuest ? 'Guest Visitor' : 'Enrolled Student'}
                    </span>
                  </div>
                </div>

                {/* Switch Active Teacher List (ONLY in Admin mode) */}
                {isAdmin && (
                  <div className="px-4 py-2.5 border-b border-teal-50 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Switch Faculty Account
                    </span>
                    <div className="space-y-1">
                      {allTeachers.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            onSwitchTeacher(t.id);
                            setIsProfileOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            t.id === activeTeacher.id
                              ? 'bg-teal-50 dark:bg-slate-800 text-teal-900 dark:text-teal-200 font-bold'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="truncate">
                            <p className="truncate text-slate-800 dark:text-white">{t.name}</p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-400">{t.qualifications}</span>
                          </div>
                          {t.id === activeTeacher.id && (
                            <Check className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation links & Logout strictly isolated per role */}
                <div className="pt-1.5 px-2 space-y-1">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => {
                          onNavigate('teachers');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-900 dark:hover:text-white hover:bg-teal-50/70 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                        <span>Manage Faculty</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('settings');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-900 dark:hover:text-white hover:bg-teal-50/70 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                        <span>Academy & UPI Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          if (onSignOut) {
                            onSignOut();
                          } else {
                            onSwitchRole('guest');
                            onNavigate('all-batches');
                          }
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Sign Out (Admin)</span>
                      </button>
                    </>
                  ) : isTeacher ? (
                    <>
                      <button
                        onClick={() => {
                          onNavigate('dashboard');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-900 dark:hover:text-white hover:bg-teal-50/70 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                        <span>Faculty Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('timetable');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-900 dark:hover:text-white hover:bg-teal-50/70 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                        <span>My Teaching Schedule</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('live');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-900 dark:hover:text-white hover:bg-teal-50/70 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Video className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                        <span>Live Classroom Studio</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          if (onSignOut) {
                            onSignOut();
                          } else {
                            onSwitchRole('guest');
                            onNavigate('all-batches');
                          }
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Sign Out (Faculty)</span>
                      </button>
                    </>
                  ) : isGuest ? (
                    <>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          if (onOpenStudentAuth) onOpenStudentAuth();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-teal-800 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4 text-teal-700" />
                        <span>Login to Enrolled Courses</span>
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('all-batches');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-900 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Browse All Batches Store</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          onNavigate('student-portal');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-900 dark:hover:text-white hover:bg-teal-50/70 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <GraduationCap className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        <span>My Student Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('quizzes');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-900 dark:hover:text-white hover:bg-teal-50/70 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        <span>Online Tests & Assessments</span>
                      </button>

                      {/* Log Out Option for Authenticated Student */}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          if (onSignOut) {
                            onSignOut();
                          } else {
                            onSwitchRole('guest');
                            onNavigate('all-batches');
                          }
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Sign Out (Student)</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
