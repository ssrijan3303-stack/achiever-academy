import React, { useState, useEffect } from 'react';
import { Quiz, QuizSubmission, Batch, Student } from '../types.ts';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  Play,
  Plus,
  Send,
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Flag,
  FileCheck,
  Check,
  X,
  Eye,
  Trophy
} from 'lucide-react';

interface QuizAssessmentPanelProps {
  quizzes: Quiz[];
  submissions: QuizSubmission[];
  batches: Batch[];
  currentStudent?: Student;
  isAdmin: boolean;
  isTeacher?: boolean;
  availableSubjects?: string[];
  onAddCustomSubject?: (subject: string) => void;
  onAddQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => Promise<void>;
  onSubmitQuiz: (
    quizId: string,
    answers: Record<string, number>,
    timeTakenSeconds: number
  ) => Promise<QuizSubmission>;
  onToggleQuizLive?: (quizId: string, isLive?: boolean) => Promise<void>;
  onDeleteQuiz?: (quizId: string) => Promise<void>;
  onUpdateQuiz?: (quizId: string, updates: Partial<Quiz>) => Promise<void>;
  onClose?: () => void;
}

export const QuizAssessmentPanel: React.FC<QuizAssessmentPanelProps> = ({
  quizzes,
  submissions,
  batches,
  currentStudent,
  isAdmin,
  isTeacher = false,
  availableSubjects = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Science'],
  onAddCustomSubject,
  onAddQuiz,
  onSubmitQuiz,
  onToggleQuizLive,
  onDeleteQuiz,
  onUpdateQuiz,
  onClose
}) => {
  const [studentQuizTab, setStudentQuizTab] = useState<'live' | 'completed'>('live');
  // Test Taking State
  const [activeQuizForTest, setActiveQuizForTest] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isTestSubmitting, setIsTestSubmitting] = useState<boolean>(false);
  const [latestSubmissionResult, setLatestSubmissionResult] = useState<QuizSubmission | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [selectedQuizForReview, setSelectedQuizForReview] = useState<Quiz | null>(null);

  // Teacher Quiz Creator Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBatchId, setNewBatchId] = useState(batches[0]?.id || '');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [newTimeLimit, setNewTimeLimit] = useState(15);
  const [newTotalMarks, setNewTotalMarks] = useState(20);
  const [newPassMarks, setNewPassMarks] = useState(12);

  // Dynamic Questions State for Creator
  const [createdQuestions, setCreatedQuestions] = useState<
    Array<{
      questionText: string;
      options: [string, string, string, string];
      correctOptionIndex: number;
      explanation: string;
      marks: number;
    }>
  >([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      explanation: '',
      marks: 5
    }
  ]);

  // Submissions Tab for Teacher
  const [viewingSubmissionsForQuiz, setViewingSubmissionsForQuiz] = useState<Quiz | null>(null);

  // Timer countdown hook during active test
  useEffect(() => {
    if (!activeQuizForTest || latestSubmissionResult) return;

    if (timeLeftSeconds <= 0) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuizForTest, timeLeftSeconds, latestSubmissionResult]);

  const startTest = (quiz: Quiz) => {
    setActiveQuizForTest(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setFlaggedQuestions({});
    setTimeLeftSeconds(quiz.timeLimitMinutes * 60);
    setLatestSubmissionResult(null);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const toggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const clearAnswer = (questionId: string) => {
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const handleFinalSubmit = async () => {
    if (!activeQuizForTest || isTestSubmitting) return;
    setIsTestSubmitting(true);

    const timeSpent = activeQuizForTest.timeLimitMinutes * 60 - timeLeftSeconds;
    const result = await onSubmitQuiz(activeQuizForTest.id, selectedAnswers, Math.max(10, timeSpent));

    setLatestSubmissionResult(result);
    setIsTestSubmitting(false);

    if (result.isPassed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddQuestionField = () => {
    setCreatedQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
        marks: 5
      }
    ]);
  };

  const handleCreateQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const batch = batches.find((b) => b.id === newBatchId) || batches[0];
    const finalSubject = isCustomSubject && customSubjectInput.trim() ? customSubjectInput.trim() : (newSubject || batch.subject);

    if (isCustomSubject && customSubjectInput.trim() && onAddCustomSubject) {
      onAddCustomSubject(customSubjectInput.trim());
    }

    const formattedQuestions = createdQuestions.map((q, idx) => ({
      id: `q-${Date.now()}-${idx}`,
      questionText: q.questionText,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation || 'Verified answer by Sarla Sharma',
      marks: q.marks || 5
    }));

    await onAddQuiz({
      title: newTitle,
      batchId: batch.id,
      batchName: batch.name,
      subject: finalSubject,
      chapterName: newChapter || 'Master Chapter',
      timeLimitMinutes: Number(newTimeLimit),
      totalMarks: Number(newTotalMarks),
      passMarks: Number(newPassMarks),
      createdByTeacherName: 'Sarla Sharma',
      isPublished: true,
      questions: formattedQuestions
    });

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewChapter('');
    setIsCustomSubject(false);
    setCustomSubjectInput('');
    setCreatedQuestions([
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
        marks: 5
      }
    ]);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. ACTIVE TEST TAKING VIEW (When student is taking a test) */}
      {activeQuizForTest && !latestSubmissionResult && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-teal-500 shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Header with Title and Live Countdown Timer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-teal-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                Live Online Assessment In Progress
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {activeQuizForTest.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeQuizForTest.batchName} • Total Marks: {activeQuizForTest.totalMarks} • Pass Marks: {activeQuizForTest.passMarks}
              </p>
            </div>

            {/* Timer Badge */}
            <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border font-mono font-extrabold text-sm ${
              timeLeftSeconds < 180
                ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                : 'bg-teal-50 text-teal-900 border-teal-300'
            }`}>
              <Clock className="w-4 h-4" />
              <span>Time Remaining: {formatTime(timeLeftSeconds)}</span>
            </div>
          </div>

          {/* Question Navigation Palette */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-bold">Question Palette:</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Answered
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Flagged
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" /> Not Answered
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeQuizForTest.questions.map((q, idx) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isFlagged = flaggedQuestions[q.id];
                const isCurrent = idx === currentQuestionIndex;

                let btnClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                if (isAnswered) {
                  btnClass = 'bg-emerald-600 text-white border-emerald-600 shadow-xs';
                }
                if (isFlagged) {
                  btnClass = 'bg-amber-500 text-white border-amber-500 shadow-xs';
                }
                if (isCurrent) {
                  btnClass += ' ring-2 ring-teal-500 ring-offset-2';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-9 h-9 rounded-xl font-extrabold text-xs cursor-pointer transition-all border ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question Display */}
          {activeQuizForTest.questions[currentQuestionIndex] && (() => {
            const currentQ = activeQuizForTest.questions[currentQuestionIndex];
            const currentSelectedOption = selectedAnswers[currentQ.id];
            const isFlagged = flaggedQuestions[currentQ.id];

            return (
              <div className="p-6 rounded-2xl bg-teal-50/40 dark:bg-slate-800/50 border border-teal-100 dark:border-slate-700 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-teal-800 text-white font-extrabold text-xs flex items-center justify-center">
                      Q{currentQuestionIndex + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      ({currentQ.marks} Marks)
                    </span>
                  </div>

                  <button
                    onClick={() => toggleFlagQuestion(currentQ.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      isFlagged
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{isFlagged ? 'Flagged for Review' : 'Mark for Review'}</span>
                  </button>
                </div>

                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentQ.questionText}
                </p>

                {/* 4 MCQ Option Choices */}
                <div className="space-y-3">
                  {currentQ.options.map((optText, optIdx) => {
                    const isSelected = currentSelectedOption === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQ.id, optIdx)}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-teal-800 text-white border-teal-800 shadow-md ring-2 ring-teal-500'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-teal-100 dark:border-slate-700 hover:border-teal-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                              isSelected
                                ? 'bg-white text-teal-900'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="text-sm font-semibold">{optText}</span>
                        </div>

                        {isSelected && <Check className="w-5 h-5 text-white" />}
                      </button>
                    );
                  })}
                </div>

                {/* Navigation and Clear Action Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-teal-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 rounded-xl border border-teal-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>
                    <button
                      onClick={() =>
                        setCurrentQuestionIndex((prev) =>
                          Math.min(activeQuizForTest.questions.length - 1, prev + 1)
                        )
                      }
                      disabled={currentQuestionIndex === activeQuizForTest.questions.length - 1}
                      className="px-4 py-2 rounded-xl bg-teal-800 text-white text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentSelectedOption !== undefined && (
                      <button
                        onClick={() => clearAnswer(currentQ.id)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        Clear Choice
                      </button>
                    )}
                    <button
                      onClick={handleFinalSubmit}
                      disabled={isTestSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>{isTestSubmitting ? 'Submitting...' : 'Submit Assessment'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 2. INSTANT SCORE CARD & EVALUATION MODAL / BANNER (After submitting test) */}
      {latestSubmissionResult && (
        <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-700">
                  Instant Test Evaluation Completed
                </span>
                <h2 className="text-2xl font-black mt-1">
                  {latestSubmissionResult.quizTitle}
                </h2>
                <p className="text-xs text-teal-200">
                  Student: <strong>{latestSubmissionResult.studentName}</strong> ({latestSubmissionResult.studentRollNumber}) • Submitted at: {latestSubmissionResult.submittedAt}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedQuizForReview(activeQuizForTest);
                  setIsReviewModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-2xl bg-white text-teal-900 font-extrabold text-xs shadow-md hover:bg-teal-50 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Review Answer Key & Explanations</span>
              </button>
              <button
                onClick={() => {
                  setActiveQuizForTest(null);
                  setLatestSubmissionResult(null);
                }}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Back to Tests
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <span className="text-[11px] font-bold text-teal-200 uppercase tracking-wider block">
                Total Score
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
                {latestSubmissionResult.score} / {latestSubmissionResult.totalMarks}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <span className="text-[11px] font-bold text-teal-200 uppercase tracking-wider block">
                Percentage
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-300 mt-1 block">
                {latestSubmissionResult.percentage}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <span className="text-[11px] font-bold text-teal-200 uppercase tracking-wider block">
                Result Status
              </span>
              <span className={`text-xl sm:text-2xl font-black mt-1 block ${
                latestSubmissionResult.isPassed ? 'text-emerald-300' : 'text-red-300'
              }`}>
                {latestSubmissionResult.isPassed ? 'PASSED (Exemplary)' : 'FAILED'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <span className="text-[11px] font-bold text-teal-200 uppercase tracking-wider block">
                Time Taken
              </span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                {Math.floor(latestSubmissionResult.timeTakenSeconds / 60)}m {latestSubmissionResult.timeTakenSeconds % 60}s
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN QUIZ DASHBOARD (Available Tests & Management) */}
      {!activeQuizForTest && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-800 text-amber-300 flex items-center justify-center font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {isAdmin || isTeacher ? 'Teacher Quiz & Assessment Management' : 'Online Assessments & Live Tests'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isAdmin || isTeacher
                      ? 'Create, schedule, activate live quizzes, and monitor student submission analytics.'
                      : 'Real-time board assessments. Active quizzes appear here with a LIVE tag.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(isAdmin || isTeacher) && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New MCQ Assessment</span>
                </button>
              )}

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 text-slate-500 transition-colors cursor-pointer"
                  title="Close (X)"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Student Tabs: Active Live Assessments vs Completed */}
          {!isAdmin && !isTeacher && currentStudent && (
            <div className="flex items-center gap-2 border-b border-teal-100 dark:border-slate-800 pb-2">
              <button
                onClick={() => setStudentQuizTab('live')}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                  studentQuizTab === 'live'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>Active Live Assessments</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-white/20 font-mono">
                  {quizzes.filter(q => q.isLive && !submissions.some(s => s.quizId === q.id && s.studentId === currentStudent.id)).length}
                </span>
              </button>

              <button
                onClick={() => setStudentQuizTab('completed')}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                  studentQuizTab === 'completed'
                    ? 'bg-teal-800 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Completed Assessments & Past Results</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-teal-900/30 font-mono">
                  {submissions.filter(s => s.studentId === currentStudent.id).length}
                </span>
              </button>
            </div>
          )}

          {/* Quizzes Cards Grid */}
          {(() => {
            // Apply Strict Quiz Visibility Rule:
            // For students in 'live' tab: ONLY show quizzes where isLive is true AND student has NOT yet submitted!
            // Once submitted, it automatically disappears from the active live list.
            let displayedQuizzes = quizzes;
            if (!isAdmin && !isTeacher && currentStudent) {
              if (studentQuizTab === 'live') {
                displayedQuizzes = quizzes.filter((q) => {
                  const hasSubmitted = submissions.some((s) => s.quizId === q.id && s.studentId === currentStudent.id);
                  return q.isLive && !hasSubmitted;
                });
              } else {
                displayedQuizzes = quizzes.filter((q) => {
                  return submissions.some((s) => s.quizId === q.id && s.studentId === currentStudent.id);
                });
              }
            }

            if (displayedQuizzes.length === 0) {
              return (
                <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-slate-800 text-teal-800 dark:text-teal-400 flex items-center justify-center mx-auto">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200">
                    {!isAdmin && !isTeacher && studentQuizTab === 'live'
                      ? 'No Active Live Assessments Right Now'
                      : 'No Assessments Found'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    {!isAdmin && !isTeacher && studentQuizTab === 'live'
                      ? 'Tests will appear here with a LIVE tag the moment your teacher activates them. Once you submit, they automatically move to your Completed Assessments tab.'
                      : 'Completed assessments and verified scorecards will appear here once submitted.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedQuizzes.map((quiz) => {
                  const quizSubs = submissions.filter((s) => s.quizId === quiz.id);
                  const studentSub = currentStudent
                    ? quizSubs.find((s) => s.studentId === currentStudent.id)
                    : null;

                  return (
                    <div
                      key={quiz.id}
                      className={`p-5 rounded-3xl border transition-all space-y-4 flex flex-col justify-between ${
                        quiz.isLive
                          ? 'border-2 border-red-400 dark:border-red-600 bg-white dark:bg-slate-900 shadow-md shadow-red-950/5'
                          : 'border-teal-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            {quiz.isLive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white shadow-xs animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                <span>LIVE</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                Scheduled
                              </span>
                            )}
                            <span className="text-[11px] font-extrabold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                              {quiz.batchName} • {quiz.subject}
                            </span>
                          </div>

                          <span className="text-xs font-bold text-slate-400">
                            {quiz.questions.length} MCQs • {quiz.timeLimitMinutes} Mins
                          </span>
                        </div>

                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {quiz.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Chapter: <strong>{quiz.chapterName}</strong> • Faculty: {quiz.createdByTeacherName}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-teal-50 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div>
                          {studentSub ? (
                            <span className="inline-flex items-center gap-1 font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Scored: {studentSub.score}/{studentSub.totalMarks} ({studentSub.percentage}%)</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400 font-bold">
                              Total Marks: {quiz.totalMarks} (Pass: {quiz.passMarks})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Teacher CRUD Controls */}
                          {(isAdmin || isTeacher) && (
                            <>
                              <button
                                onClick={async () => {
                                  if (onToggleQuizLive) {
                                    await onToggleQuizLive(quiz.id, !quiz.isLive);
                                  } else {
                                    await fetch(`/api/quizzes/${quiz.id}/toggle-live`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ isLive: !quiz.isLive })
                                    });
                                    quiz.isLive = !quiz.isLive;
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                                  quiz.isLive
                                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                                    : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                                }`}
                                title={quiz.isLive ? 'Deactivate LIVE status' : 'Activate and broadcast as LIVE test to students'}
                              >
                                {quiz.isLive ? 'End LIVE' : 'Go LIVE'}
                              </button>

                              <button
                                onClick={() => setViewingSubmissionsForQuiz(quiz)}
                                className="px-3 py-1.5 rounded-xl border border-teal-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-teal-50 dark:hover:bg-slate-700"
                              >
                                Results ({quizSubs.length})
                              </button>

                              <button
                                onClick={async () => {
                                  if (confirm(`Delete quiz "${quiz.title}"?`)) {
                                    if (onDeleteQuiz) {
                                      await onDeleteQuiz(quiz.id);
                                    } else {
                                      await fetch(`/api/quizzes/${quiz.id}`, { method: 'DELETE' });
                                    }
                                  }
                                }}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 cursor-pointer"
                                title="Delete Quiz"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Student Test Action Button */}
                          {!isAdmin && !isTeacher && (
                            studentSub ? (
                              <button
                                onClick={() => {
                                  setSelectedQuizForReview(quiz);
                                  setIsReviewModalOpen(true);
                                }}
                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Review Solution Key</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => startTest(quiz)}
                                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all transform hover:scale-105"
                              >
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>Start Live Test</span>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* 4. MODAL: TEACHER QUIZ CREATOR */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl border border-teal-100 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="bg-teal-800 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-teal-200" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Create New MCQ Online Assessment</h3>
                  <p className="text-xs text-teal-200">
                    Add questions with 4 options, set correct answer key, and trigger WhatsApp notification.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuizSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quiz Title:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 10 Trigonometry Mastery Test"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Class / Batch:
                  </label>
                  <select
                    value={newBatchId}
                    onChange={(e) => setNewBatchId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Subject
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomSubject(!isCustomSubject)}
                      className="text-[10px] text-teal-700 dark:text-teal-400 font-extrabold hover:underline"
                    >
                      {isCustomSubject ? '← List' : '+ Custom'}
                    </button>
                  </div>
                  {isCustomSubject ? (
                    <input
                      type="text"
                      placeholder="e.g. Science"
                      value={customSubjectInput}
                      onChange={(e) => setCustomSubjectInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  ) : (
                    <select
                      value={newSubject}
                      onChange={(e) => {
                        if (e.target.value === '__add_custom__') {
                          setIsCustomSubject(true);
                        } else {
                          setNewSubject(e.target.value);
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      {availableSubjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                      <option value="__add_custom__">+ Add Custom Subject...</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Chapter Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chapter 8: Trigonometry"
                    value={newChapter}
                    onChange={(e) => setNewChapter(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Time Limit (Minutes):
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={newTimeLimit}
                    onChange={(e) => setNewTimeLimit(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Marks / Pass Marks:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newTotalMarks}
                      onChange={(e) => setNewTotalMarks(Number(e.target.value))}
                      className="w-1/2 p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                      title="Total Marks"
                    />
                    <input
                      type="number"
                      value={newPassMarks}
                      onChange={(e) => setNewPassMarks(Number(e.target.value))}
                      className="w-1/2 p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                      title="Pass Marks"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Questions Builder */}
              <div className="space-y-4 pt-3 border-t border-teal-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    Questions List ({createdQuestions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddQuestionField}
                    className="px-3 py-1.5 rounded-xl bg-teal-100 dark:bg-slate-700 text-teal-900 dark:text-teal-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Question</span>
                  </button>
                </div>

                {createdQuestions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 rounded-2xl bg-teal-50/50 dark:bg-slate-800/60 border border-teal-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-teal-900 dark:text-teal-200">
                        Question #{qIdx + 1}
                      </span>
                      <span className="text-[11px] text-slate-400">Radio button selects correct answer</span>
                    </div>

                    <textarea
                      required
                      rows={2}
                      placeholder={`Enter question text for #${qIdx + 1}...`}
                      value={q.questionText}
                      onChange={(e) => {
                        const copy = [...createdQuestions];
                        copy[qIdx].questionText = e.target.value;
                        setCreatedQuestions(copy);
                      }}
                      className="w-full p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                    />

                    {/* 4 Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-teal-100 dark:border-slate-700">
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correctOptionIndex === optIdx}
                            onChange={() => {
                              const copy = [...createdQuestions];
                              copy[qIdx].correctOptionIndex = optIdx;
                              setCreatedQuestions(copy);
                            }}
                            className="cursor-pointer"
                            title="Mark as Correct Option"
                          />
                          <span className="font-bold text-slate-500 w-4">
                            {String.fromCharCode(65 + optIdx)}:
                          </span>
                          <input
                            type="text"
                            required
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            value={opt}
                            onChange={(e) => {
                              const copy = [...createdQuestions];
                              copy[qIdx].options[optIdx] = e.target.value;
                              setCreatedQuestions(copy);
                            }}
                            className="flex-1 text-xs bg-transparent outline-none text-slate-800 dark:text-white font-medium"
                          />
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Teacher explanation note for solution key..."
                      value={q.explanation}
                      onChange={(e) => {
                        const copy = [...createdQuestions];
                        copy[qIdx].explanation = e.target.value;
                        setCreatedQuestions(copy);
                      }}
                      className="w-full p-2 rounded-xl border border-teal-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-teal-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-black shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Assessment & Notify Batch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: DETAILED ANSWER KEY & EXPLANATIONS */}
      {isReviewModalOpen && selectedQuizForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl border border-teal-100 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="bg-teal-900 text-white p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-black text-lg">Solution Key & Teacher Explanations</h3>
                <p className="text-xs text-teal-200">{selectedQuizForReview.title}</p>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/80 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {selectedQuizForReview.questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Q{idx + 1}. {q.questionText}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = oIdx === q.correctOptionIndex;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-950 dark:text-emerald-200 font-extrabold'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                          {isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 text-xs text-teal-950 dark:text-teal-200">
                    <strong>💡 Explanation:</strong> {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: TEACHER VIEW QUIZ SUBMISSIONS / LEADERBOARD */}
      {viewingSubmissionsForQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl border border-teal-100 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="bg-teal-800 text-white p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-black text-lg">Student Submissions & Scoreboard</h3>
                <p className="text-xs text-teal-200">{viewingSubmissionsForQuiz.title}</p>
              </div>
              <button
                onClick={() => setViewingSubmissionsForQuiz(null)}
                className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/80 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {submissions.filter((s) => s.quizId === viewingSubmissionsForQuiz.id).length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p className="font-bold text-sm">No submissions recorded for this assessment yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-teal-100 dark:divide-slate-800">
                  {submissions
                    .filter((s) => s.quizId === viewingSubmissionsForQuiz.id)
                    .map((sub, sIdx) => (
                      <div key={sub.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-extrabold text-xs flex items-center justify-center">
                            #{sIdx + 1}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {sub.studentName}
                            </h4>
                            <span className="text-xs text-slate-500">
                              Roll: {sub.studentRollNumber} • Submitted: {sub.submittedAt}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-600 block">
                            {sub.score} / {sub.totalMarks} ({sub.percentage}%)
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Time: {Math.floor(sub.timeTakenSeconds / 60)}m {sub.timeTakenSeconds % 60}s
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
