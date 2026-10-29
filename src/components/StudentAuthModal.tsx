import React, { useState, useEffect } from 'react';
import { Batch, Student, UserRole } from '../types.ts';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import {
  X,
  GraduationCap,
  Mail,
  Lock,
  Phone,
  User,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  Layers,
  HelpCircle
} from 'lucide-react';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: Batch[];
  onSuccessfulLogin: (userData: any, role: UserRole) => void;
  onStudentRegistered?: (student: Student) => void;
  promptMessage?: string | null;
  initialMode?: 'signin' | 'register';
  onRoleSwitch?: (role: UserRole) => void;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  batches,
  onSuccessfulLogin,
  onStudentRegistered,
  promptMessage = null,
  initialMode = 'signin',
  onRoleSwitch
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Sync mode when initialMode or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [initialMode, isOpen]);

  // Dynamic Academic Targets fetched from admin-managed table/API (Requirement 5)
  const [academicTargets, setAcademicTargets] = useState<string[]>([
    'Class 10 CBSE Board',
    'Class 12 Board Exam',
    'Class 9 Foundation & Olympiad',
    'Class 11 Science (JEE/NEET)',
    'Class 8 Comprehensive'
  ]);

  // Comprehensive Student Registration form
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhoneWhatsapp, setRegPhoneWhatsapp] = useState('+91 ');
  const [regPassword, setRegPassword] = useState('');
  const [regClassTarget, setRegClassTarget] = useState('Class 10 CBSE Board');
  const [regParentPhone, setRegParentPhone] = useState('');
  const [regBatchId, setRegBatchId] = useState(batches[0]?.id || 'b-prarambh');

  // Unified Login form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Status and feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch dynamic academic targets from admin database
  useEffect(() => {
    fetch('/api/academic/options')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.grades && res.data.grades.length > 0) {
          setAcademicTargets(res.data.grades);
          if (!res.data.grades.includes(regClassTarget)) {
            setRegClassTarget(res.data.grades[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  // 1. Comprehensive Student Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regFullName.trim() || !regEmail.trim() || !regPhoneWhatsapp.trim()) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    setIsLoading(true);

    try {
      // If live Supabase is configured, sign up via Supabase Auth
      if (isSupabaseConfigured) {
        try {
          const { data: authData, error: authErr } = await supabase.auth.signUp({
            email: regEmail.trim(),
            password: regPassword || 'Student@123',
            options: {
              data: {
                full_name: regFullName.trim(),
                phone_whatsapp: regPhoneWhatsapp.trim(),
                class_target: regClassTarget,
                parent_phone: regParentPhone.trim(),
                role: 'student'
              }
            }
          });
          if (authErr) console.warn('Supabase auth sign up warning:', authErr.message);
        } catch (sbErr) {
          console.warn('Supabase auth fallback:', sbErr);
        }
      }

      // Backend route registration
      const response = await fetch('/api/auth/register-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regFullName.trim(),
          email: regEmail.trim(),
          phone: regPhoneWhatsapp.trim(),
          password: regPassword || 'student123',
          classTarget: regClassTarget,
          parentPhone: regParentPhone.trim(),
          batchId: regBatchId
        })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to submit registration');
      }

      setSuccessMsg('Account registered successfully! Welcome to Achiever Academy.');
      if (onStudentRegistered) {
        onStudentRegistered(resData.data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong during registration');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Unified Role-Based Login Submit (Email/Password with Supabase profiles lookup)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginIdentifier.trim()) {
      setErrorMsg('Please enter your email or username.');
      return;
    }

    setIsLoading(true);

    try {
      let loggedInUser: any = null;
      let userRole: UserRole | null = null;

      // STEP 1: Query Supabase Auth & profiles table using UID
      if (isSupabaseConfigured) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: loginIdentifier.trim(),
            password: loginPassword || 'Achiever@2026'
          });

          if (!authError && authData?.user) {
            const uid = authData.user.id;
            // Query Supabase profiles table using the user's UID to fetch their correct database role
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', uid)
              .maybeSingle();

            if (profileError) {
              console.warn('Supabase profile fetch error:', profileError.message);
            } else if (profileData) {
              const dbRole = profileData.role;
              if (dbRole && ['admin', 'teacher', 'student'].includes(dbRole)) {
                userRole = dbRole as UserRole;
                loggedInUser = profileData;
              } else {
                setErrorMsg(`User profile found with invalid role (${dbRole || 'missing'}). Please contact administration.`);
                setIsLoading(false);
                return;
              }
            }
          } else if (authError) {
            console.warn('Supabase auth sign-in warning:', authError.message);
          }
        } catch (sbErr) {
          console.warn('Supabase auth query exception:', sbErr);
        }
      }

      // STEP 2: If not authenticated via Supabase, query unified backend API
      if (!userRole) {
        const response = await fetch('/api/auth/unified-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: loginIdentifier.trim(),
            email: loginIdentifier.trim(),
            password: loginPassword
          })
        });

        const resData = await response.json();
        if (response.ok && resData.success && resData.role) {
          userRole = resData.role;
          loggedInUser = resData.data;
        } else {
          if (resData.isPending) {
            setErrorMsg('Your account is currently pending verification by Achiever Academy Administration. You will receive an alert once activated.');
          } else if (resData.isRejected) {
            setErrorMsg(resData.error || 'Your registration was not approved.');
          } else {
            setErrorMsg(resData.error || 'Invalid credentials or user record not found in profiles.');
          }
          setIsLoading(false);
          return;
        }
      }

      // STEP 3: Route strictly based on fetched role (Do NOT default to student)
      if (!userRole || !['admin', 'teacher', 'student'].includes(userRole)) {
        setErrorMsg('User record has no valid role assigned in database. Access denied.');
        setIsLoading(false);
        return;
      }

      if (onRoleSwitch) {
        onRoleSwitch(userRole);
      }
      onSuccessfulLogin(loggedInUser, userRole);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Quick Demo Access Helper: Independent, instantaneous role routing
  const handleQuickDemo = (role: UserRole) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (role === 'admin') {
      const demoAdmin = {
        id: 'admin-1',
        name: 'Dr. S. K. Sharma (Academic Director)',
        email: 'director@achieveracademy.edu',
        role: 'admin'
      };
      if (onRoleSwitch) onRoleSwitch('admin');
      onSuccessfulLogin(demoAdmin, 'admin');
      onClose();
    } else if (role === 'teacher') {
      const demoTeacher = {
        id: 't-1',
        name: 'Prof. Rajesh Kumar Verma',
        qualification: 'M.Sc Physics (IIT Bombay), B.Ed',
        email: 'rajesh.verma@achiever.edu',
        phone: '+91 98111 22334',
        subjectsExpertise: ['Physics', 'Mathematics'],
        experienceYears: 14,
        role: 'teacher'
      };
      if (onRoleSwitch) onRoleSwitch('teacher');
      onSuccessfulLogin(demoTeacher, 'teacher');
      onClose();
    } else if (role === 'student') {
      const demoStudent: Student = {
        id: 's-1',
        batchId: batches[0]?.id || 'b-prarambh',
        batchName: batches[0]?.name || 'Prarambh Batch (Class 10 CBSE)',
        name: 'Rahul Verma',
        rollNumber: '10M-01',
        email: 'rahul.v@achiever.edu',
        phone: '+91 98201 11001',
        attendanceRate: 98,
        performanceScore: 92,
        feeStatus: 'paid',
        feeDueAmount: 0,
        lastFeePaidDate: '05 Oct 2026',
        status: 'enrolled',
        approvalStatus: 'approved',
        registeredAt: '10 Sep 2026',
        isHandRaised: false,
        isMuted: true,
        purchasedBatchIds: [batches[0]?.id || 'b-prarambh']
      };
      if (onRoleSwitch) onRoleSwitch('student');
      onSuccessfulLogin(demoStudent, 'student');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-teal-100 dark:border-slate-800 overflow-hidden relative my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Banner with Universal Close ("X") Button */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors shadow-sm"
            aria-label="Close Authentication Modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-teal-950 flex items-center justify-center font-black text-xl shadow-lg">
              AA
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Achiever Academy</h2>
              <p className="text-xs text-teal-200">National Online Coaching Platform</p>
            </div>
          </div>

          {promptMessage && (
            <div className="mt-4 p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{promptMessage}</span>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="flex bg-teal-950/60 p-1 rounded-2xl border border-teal-700/50 mt-5">
            <button
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-amber-400 text-teal-950 shadow-md'
                  : 'text-teal-200 hover:text-white'
              }`}
            >
              Unified Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-amber-400 text-teal-950 shadow-md'
                  : 'text-teal-200 hover:text-white'
              }`}
            >
              New Student Registration
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-semibold leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-semibold">{successMsg}</div>
            </div>
          )}

          {/* ================= MODE 1: UNIFIED ROLE-BASED LOGIN ================= */}
          {authMode === 'signin' && (
            <div className="space-y-5">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email / Phone / Username *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g., student@achiever.edu, teacher@achiever.edu, admin"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-700 font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter your credentials to be automatically routed to your assigned portal (Student, Teacher, or Admin).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter account password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-700 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white font-extrabold text-xs shadow-md hover:shadow-teal-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <span>Verifying Profile & Role...</span>
                  ) : (
                    <>
                      <span>Sign In & Open Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Access Section (Requirement 2) */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quick Demo Access (1-Click Portals)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Instant presentation switch</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Student Demo Button */}
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('student')}
                    className="p-3 rounded-2xl bg-teal-50 dark:bg-slate-800/80 hover:bg-teal-100 dark:hover:bg-slate-800 border border-teal-200 dark:border-slate-700 text-left transition-all group cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-teal-800 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-extrabold text-teal-950 dark:text-teal-200">Student Demo</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Enrolled batches, live tests & notes
                    </p>
                  </button>

                  {/* Teacher Demo Button */}
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('teacher')}
                    className="p-3 rounded-2xl bg-indigo-50 dark:bg-slate-800/80 hover:bg-indigo-100 dark:hover:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-left transition-all group cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-indigo-700 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-extrabold text-indigo-950 dark:text-indigo-200">Teacher Demo</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Quiz studio, notes upload & roster
                    </p>
                  </button>

                  {/* Admin Demo Button */}
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin')}
                    className="p-3 rounded-2xl bg-amber-50 dark:bg-slate-800/80 hover:bg-amber-100 dark:hover:bg-slate-800 border border-amber-200 dark:border-slate-700 text-left transition-all group cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-teal-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-extrabold text-amber-950 dark:text-amber-200">Admin Demo</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Approvals, fee & targets control
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= MODE 2: STUDENT REGISTRATION ================= */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Ananya Deshmukh"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-700 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="student@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-700 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Phone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={regPhoneWhatsapp}
                      onChange={(e) => setRegPhoneWhatsapp(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-700 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Dynamic Academic Target dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Target / Class *
                  </label>
                  <select
                    value={regClassTarget}
                    onChange={(e) => setRegClassTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  >
                    {academicTargets.map((target, idx) => (
                      <option key={idx} value={target}>
                        {target}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Batch *
                  </label>
                  <select
                    value={regBatchId}
                    onChange={(e) => setRegBatchId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.grade})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Parent Contact Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98111 22233"
                    value={regParentPhone}
                    onChange={(e) => setRegParentPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Create Password
                  </label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {isLoading ? 'Submitting Registration...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
