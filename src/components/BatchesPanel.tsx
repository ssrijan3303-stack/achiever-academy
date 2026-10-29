import React, { useState, useRef } from 'react';
import { Batch, Student, Teacher, BatchSubject, ChapterItem } from '../types.ts';
import { uploadAcademyFile } from '../lib/supabase.ts';
import {
  Users,
  Clock,
  Plus,
  BarChart3,
  Calendar,
  MoreVertical,
  BookOpen,
  GraduationCap,
  X,
  CheckCircle2,
  Search,
  UserCheck,
  Pencil,
  Check,
  Trash2,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronDown,
  FileText,
  Video,
  AlertCircle
} from 'lucide-react';

interface BatchesPanelProps {
  batches: Batch[];
  students: Student[];
  teachers: Teacher[];
  isLiveActive?: boolean;
  liveBatchId?: string | null;
  availableGrades?: string[];
  availableSubjects?: string[];
  onAddCustomGrade?: (grade: string) => void;
  onAddCustomSubject?: (subject: string) => void;
  onAddStudent: (studentData: { name: string; batchId: string; batchName: string; email: string; phone: string }) => void;
  onCreateBatch: (batchData: any) => void;
  onUpdateBatch?: (batchId: string, updates: Partial<Batch>) => void;
  onDeleteBatch?: (batchId: string) => void;
  onStartLiveClass: (batchId: string) => void;
}

const PRESET_BANNERS = [
  { label: 'Class 10 CBSE Board', url: '/assets/images/prarambh_batch_cover_1792850863933.jpg' },
  { label: 'Class 9 Foundation', url: '/assets/images/abhyas_batch_cover_1792850865258.jpg' },
  { label: 'Class 8 Mastery', url: '/assets/images/sankalp_batch_cover_1792850865329.jpg' },
  { label: 'Mathematics Masterclass', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=80' },
  { label: 'Physics & Science Lab', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&q=80' },
  { label: 'Biology & Life Sciences', url: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=1200&q=80' },
  { label: 'Olympiad & Digital Classroom', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80' }
];

export const BatchesPanel: React.FC<BatchesPanelProps> = ({
  batches,
  students,
  teachers,
  isLiveActive = false,
  liveBatchId = null,
  availableGrades = ['Class 10', 'Class 9', 'Class 8', 'Class 7', 'Class 11 Science', 'Class 12 Board'],
  availableSubjects = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Science'],
  onAddCustomGrade,
  onAddCustomSubject,
  onAddStudent,
  onCreateBatch,
  onUpdateBatch,
  onDeleteBatch,
  onStartLiveClass
}) => {
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [openMenuBatchId, setOpenMenuBatchId] = useState<string | null>(null);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [targetBatchId, setTargetBatchId] = useState<string>('');

  // Syllabus & Chapter Management Drawer/Modal
  const [syllabusBatch, setSyllabusBatch] = useState<Batch | null>(null);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<BatchSubject | null>(null);
  const [editingChapter, setEditingChapter] = useState<{ subjectId: string; chapter: ChapterItem } | null>(null);

  // Subject Form State
  const [newSubName, setNewSubName] = useState('');
  const [newSubPrice, setNewSubPrice] = useState(2500);
  const [newSubDuration, setNewSubDuration] = useState('1 Year');
  const [newSubTeacher, setNewSubTeacher] = useState(teachers[0]?.name || 'Sarla Sharma');
  const [newSubDesc, setNewSubDesc] = useState('');

  // Chapter Form State
  const [newChapNumber, setNewChapNumber] = useState(1);
  const [newChapTitle, setNewChapTitle] = useState('');
  const [newChapDesc, setNewChapDesc] = useState('');

  // Delete Batch Confirmation
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null);

  // Edit Batch Form States (With Dedicated Thumbnail / Banner & Manual Text Inputs)
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editMonthlyFee, setEditMonthlyFee] = useState<number>(2500);
  const [editFullBatchPrice, setEditFullBatchPrice] = useState<number>(9999);
  const [editTeacherId, setEditTeacherId] = useState('');
  const [editScheduleTime, setEditScheduleTime] = useState('');
  const [editNextTopic, setEditNextTopic] = useState('');
  const [editThumbnailUrl, setEditThumbnailUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSavingBatch, setIsSavingBatch] = useState(false);
  const [saveBatchSuccess, setSaveBatchSuccess] = useState(false);
  const [isUploadingEditBanner, setIsUploadingEditBanner] = useState(false);

  // New Batch Form States (With Dedicated Thumbnail / Banner & Manual Text Inputs)
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');

  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchGrade, setNewBatchGrade] = useState('Class 10 CBSE Board');
  const [newBatchSubject, setNewBatchSubject] = useState('Mathematics & Science');
  const [newBatchSchedule, setNewBatchSchedule] = useState('10:00 AM - 11:30 AM');
  const [newBatchTopic, setNewBatchTopic] = useState('');
  const [newBatchTeacherId, setNewBatchTeacherId] = useState(teachers[0]?.id || '');
  const [newBatchFee, setNewBatchFee] = useState(2500);
  const [newBatchFullPrice, setNewBatchFullPrice] = useState(9999);
  const [newBatchThumbnailUrl, setNewBatchThumbnailUrl] = useState(PRESET_BANNERS[0].url);
  const [newBatchDescription, setNewBatchDescription] = useState('');
  const [isUploadingNewBanner, setIsUploadingNewBanner] = useState(false);

  // Schedule modal form state
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Open Edit Batch Modal
  const handleOpenEditBatch = (batch: Batch) => {
    setEditingBatch(batch);
    setEditName(batch.name);
    setEditGrade(batch.grade || 'Class 10 CBSE Board');
    setEditSubject(batch.subject || 'Mathematics & Science');
    setEditMonthlyFee(batch.monthlyFee || 2500);
    setEditFullBatchPrice(batch.fullBatchPrice || 9999);
    setEditTeacherId(batch.teacherId || teachers[0]?.id || '');
    setEditScheduleTime(batch.scheduleTime || '10:00 AM - 11:30 AM');
    setEditNextTopic(batch.nextTopic || 'Course Overview');
    setEditThumbnailUrl(batch.thumbnail_url || batch.coverImage || PRESET_BANNERS[0].url);
    setEditDescription(batch.description || '');
    setSaveBatchSuccess(false);
    setOpenMenuBatchId(null);
  };

  // Upload handler for Edit modal
  const handleEditBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingEditBanner(true);
    try {
      const result = await uploadAcademyFile(file, 'batch-thumbnails');
      if (result.success && result.fileUrl) {
        setEditThumbnailUrl(result.fileUrl);
      }
    } catch (err) {
      console.warn('Banner upload failed:', err);
    } finally {
      setIsUploadingEditBanner(false);
    }
  };

  // Upload handler for Create modal
  const handleNewBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingNewBanner(true);
    try {
      const result = await uploadAcademyFile(file, 'batch-thumbnails');
      if (result.success && result.fileUrl) {
        setNewBatchThumbnailUrl(result.fileUrl);
      }
    } catch (err) {
      console.warn('Banner upload failed:', err);
    } finally {
      setIsUploadingNewBanner(false);
    }
  };

  // Save Batch Edit
  const handleSaveBatchEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch || !editName.trim()) return;

    setIsSavingBatch(true);
    const assignedTeacher = teachers.find((t) => t.id === editTeacherId);

    const bannerImage = editThumbnailUrl.trim() || editingBatch.thumbnail_url || editingBatch.coverImage || PRESET_BANNERS[0].url;

    const updates: Partial<Batch> = {
      name: editName.trim(),
      grade: editGrade.trim() || 'Class 10 CBSE Board',
      subject: editSubject.trim() || 'Mathematics & Science',
      monthlyFee: Number(editMonthlyFee) || 2500,
      fullBatchPrice: Number(editFullBatchPrice) || 9999,
      teacherId: editTeacherId,
      teacherName: assignedTeacher ? assignedTeacher.name : editingBatch.teacherName,
      scheduleTime: editScheduleTime.trim(),
      nextTopic: editNextTopic.trim(),
      thumbnail_url: bannerImage,
      coverImage: bannerImage,
      description: editDescription.trim()
    };

    if (onUpdateBatch) {
      await onUpdateBatch(editingBatch.id, updates);
    }

    try {
      await fetch(`/api/batches/${editingBatch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch {}

    setSaveBatchSuccess(true);
    setIsSavingBatch(false);
    setTimeout(() => {
      setEditingBatch(null);
      setSaveBatchSuccess(false);
    }, 800);
  };

  // Create Batch Submit (Using Manual Text Inputs for Grade & Subject - No Restricted Dropdowns)
  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) return;

    const finalGrade = newBatchGrade.trim() || 'Class 10 CBSE Board';
    const finalSubject = newBatchSubject.trim() || 'Mathematics & Science';
    const bannerImage = newBatchThumbnailUrl.trim() || PRESET_BANNERS[0].url;

    if (onAddCustomGrade) {
      onAddCustomGrade(finalGrade);
    }
    if (onAddCustomSubject) {
      onAddCustomSubject(finalSubject);
    }

    const assignedTeacher = teachers.find(t => t.id === newBatchTeacherId);

    onCreateBatch({
      name: newBatchName.trim(),
      grade: finalGrade,
      subject: finalSubject,
      scheduleTime: newBatchSchedule,
      nextTopic: newBatchTopic || 'Foundation & Curriculum Kickoff',
      teacherId: newBatchTeacherId,
      teacherName: assignedTeacher ? assignedTeacher.name : teachers[0]?.name,
      monthlyFee: Number(newBatchFee),
      fullBatchPrice: Number(newBatchFullPrice),
      thumbnail_url: bannerImage,
      coverImage: bannerImage,
      description: newBatchDescription || 'Comprehensive academic mastery batch at Achiever Academy.'
    });

    setNewBatchName('');
    setNewBatchGrade('Class 10 CBSE Board');
    setNewBatchSubject('Mathematics & Science');
    setIsCreateBatchOpen(false);
  };

  // Delete Batch
  const handleConfirmDeleteBatch = async () => {
    if (!batchToDelete) return;
    if (onDeleteBatch) {
      onDeleteBatch(batchToDelete.id);
    }
    try {
      await fetch(`/api/batches/${batchToDelete.id}`, { method: 'DELETE' });
    } catch {}
    setBatchToDelete(null);
  };

  // Open Syllabus Manager
  const handleOpenSyllabus = (batch: Batch) => {
    setSyllabusBatch(batch);
    if (batch.subjects && batch.subjects.length > 0) {
      setActiveSubjectId(batch.subjects[0].id);
    } else {
      setActiveSubjectId(null);
    }
    setOpenMenuBatchId(null);
  };

  // Add Subject to Batch
  const handleAddSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusBatch || !newSubName.trim()) return;

    try {
      const response = await fetch(`/api/batches/${syllabusBatch.id}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSubName.trim(),
          price: Number(newSubPrice),
          duration: newSubDuration,
          teacherName: newSubTeacher,
          description: newSubDesc
        })
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        if (!syllabusBatch.subjects) syllabusBatch.subjects = [];
        syllabusBatch.subjects.push(resData.data);
        setActiveSubjectId(resData.data.id);
      }
    } catch (err) {
      console.warn('Subject add error:', err);
    }

    setNewSubName('');
    setIsAddSubjectOpen(false);
  };

  // Delete Subject from Batch
  const handleDeleteSubject = async (subId: string) => {
    if (!syllabusBatch) return;
    try {
      await fetch(`/api/batches/${syllabusBatch.id}/subjects/${subId}`, { method: 'DELETE' });
      if (syllabusBatch.subjects) {
        syllabusBatch.subjects = syllabusBatch.subjects.filter(s => s.id !== subId);
        if (activeSubjectId === subId) {
          setActiveSubjectId(syllabusBatch.subjects[0]?.id || null);
        }
      }
    } catch (err) {
      console.warn('Delete subject err:', err);
    }
  };

  // Add Chapter to Subject
  const handleAddChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusBatch || !activeSubjectId || !newChapTitle.trim()) return;

    try {
      const response = await fetch(`/api/batches/${syllabusBatch.id}/subjects/${activeSubjectId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterNumber: Number(newChapNumber),
          title: newChapTitle.trim(),
          description: newChapDesc.trim()
        })
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        const sub = syllabusBatch.subjects?.find(s => s.id === activeSubjectId);
        if (sub) {
          if (!sub.chapters) sub.chapters = [];
          sub.chapters.push(resData.data);
        }
      }
    } catch (err) {
      console.warn('Chapter add error:', err);
    }

    setNewChapTitle('');
    setNewChapDesc('');
    setIsAddChapterOpen(false);
  };

  // Delete Chapter
  const handleDeleteChapter = async (chapId: string) => {
    if (!syllabusBatch || !activeSubjectId) return;
    try {
      await fetch(`/api/batches/${syllabusBatch.id}/subjects/${activeSubjectId}/chapters/${chapId}`, { method: 'DELETE' });
      const sub = syllabusBatch.subjects?.find(s => s.id === activeSubjectId);
      if (sub && sub.chapters) {
        sub.chapters = sub.chapters.filter(c => c.id !== chapId);
      }
    } catch (err) {
      console.warn('Delete chapter err:', err);
    }
  };

  const handleOpenAddStudent = (batchId: string) => {
    setTargetBatchId(batchId);
    setIsAddStudentOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const batch = batches.find((b) => b.id === targetBatchId) || batches[0];
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;

    onAddStudent({
      name: newStudentName,
      batchId: batch.id,
      batchName: batch.name,
      email: newStudentEmail,
      phone: newStudentPhone || '+91 98111 22233'
    });

    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentPhone('');
    setIsAddStudentOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Academic Batches & Syllabus Feed
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage batches, custom banner thumbnails, faculty allocation, syllabus hierarchies, and schedules
          </p>
        </div>

        <button
          onClick={() => setIsCreateBatchOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Create New Batch</span>
        </button>
      </div>

      {/* Batches Grid with High-Fidelity Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch) => {
          const isThisBatchLive = isLiveActive && liveBatchId === batch.id;
          const bannerUrl = batch.thumbnail_url || batch.coverImage || PRESET_BANNERS[0].url;

          return (
            <div
              key={batch.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-teal-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Batch Banner Image with Status & Quick Actions */}
              <div className="h-44 relative overflow-hidden bg-slate-900">
                <img
                  src={bannerUrl}
                  alt={batch.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                
                {/* Live or Status Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {isThisBatchLive ? (
                    <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      LIVE CLASS
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider">
                      {batch.grade}
                    </span>
                  )}
                </div>

                {/* Dropdown Menu */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => setOpenMenuBatchId(openMenuBatchId === batch.id ? null : batch.id)}
                    className="p-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white hover:bg-slate-800 cursor-pointer transition-colors border border-white/10"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openMenuBatchId === batch.id && (
                    <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-teal-100 dark:border-slate-700 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                      <button
                        onClick={() => handleOpenEditBatch(batch)}
                        className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5 text-teal-600" />
                        <span>Edit Batch & Banner</span>
                      </button>

                      <button
                        onClick={() => handleOpenSyllabus(batch)}
                        className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Manage Syllabus & Chapters</span>
                      </button>

                      <button
                        onClick={() => {
                          handleOpenAddStudent(batch.id);
                          setOpenMenuBatchId(null);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Add Student</span>
                      </button>

                      <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>

                      <button
                        onClick={() => {
                          setBatchToDelete(batch);
                          setOpenMenuBatchId(null);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>Delete Batch</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Title & Subject Overlay */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-black text-base leading-tight drop-shadow-md">
                    {batch.name}
                  </h3>
                  <p className="text-[11px] text-teal-200 font-medium truncate mt-0.5">
                    {batch.subject}
                  </p>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Lead Instructor:</span>
                    <span className="font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                      {batch.teacherName || 'Faculty Assigned'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Enrolled Students:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {batch.studentCount} Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Schedule Slot:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {batch.scheduleTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Course Fee:</span>
                    <span className="font-black text-emerald-700 dark:text-emerald-400">
                      ₹{batch.fullBatchPrice || batch.monthlyFee * 4} Full / ₹{batch.monthlyFee} mo
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Syllabus Modules:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {batch.subjects ? `${batch.subjects.length} Subjects` : 'Modular Curriculum'}
                    </span>
                  </div>
                </div>

                {/* Primary Card Actions */}
                <div className="pt-2 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleOpenSyllabus(batch)}
                    className="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-teal-50 dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-slate-700 text-teal-900 dark:text-teal-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                    <span>Syllabus ({batch.subjects?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditBatch(batch)}
                    className="py-2 px-3 rounded-xl font-bold text-xs bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Change Banner & Fee"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>Banner</span>
                  </button>

                  <button
                    onClick={() => onStartLiveClass(batch.id)}
                    className={`py-2 px-3 rounded-xl font-black text-xs text-white shadow-xs cursor-pointer transition-all ${
                      isThisBatchLive ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-800 hover:bg-teal-900'
                    }`}
                  >
                    {isThisBatchLive ? 'Join Stream' : 'Live Class'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MODAL 1: CREATE NEW BATCH (WITH THUMBNAIL/BANNER) ================= */}
      {isCreateBatchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-teal-100 dark:border-slate-800 my-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Top Bar with Prominent Cross Close Button */}
            <div className="flex items-center justify-between pb-4 border-b border-teal-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center font-black">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg">
                    Create New Academic Batch
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Attach banner thumbnail, assign instructor, and set curriculum details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateBatchOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 text-slate-400 flex items-center justify-center cursor-pointer transition-colors"
                title="Close (X)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="space-y-4 pt-4 text-xs max-h-[calc(85vh-120px)] overflow-y-auto pr-1">
              
              {/* Batch Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Batch Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vijeta Batch (Class 10 CBSE 2026-27)"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              {/* DEDICATED BATCH THUMBNAIL / BANNER IMAGE FIELD */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-teal-600" />
                    <span>Batch Thumbnail / Banner Image <span className="text-red-500">*</span></span>
                  </label>
                  <span className="text-[10px] text-slate-400">Recommended: 16:9 ratio</span>
                </div>

                {/* Live Banner Preview Box */}
                {newBatchThumbnailUrl && (
                  <div className="h-32 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-700 bg-slate-900">
                    <img
                      src={newBatchThumbnailUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-[10px] text-amber-300 font-bold">
                      Banner Preview
                    </div>
                  </div>
                )}

                {/* URL Input & File Upload */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste banner image URL (e.g. https://...)"
                    value={newBatchThumbnailUrl}
                    onChange={(e) => setNewBatchThumbnailUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  <label className="px-3 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingNewBanner ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewBannerFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Pre-Curated Banner Presets */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">
                    Or select pre-curated high-resolution banner:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_BANNERS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewBatchThumbnailUrl(preset.url)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                          newBatchThumbnailUrl === preset.url
                            ? 'bg-amber-400 text-teal-950 border-amber-500 font-bold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Manual Text Inputs for Grade / Target Exam & Subject (Requirement 5: No restricted dropdowns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Grade / Target Exam (Manual Text Input) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 10 CBSE Board, JEE/NEET, Class 12..."
                    value={newBatchGrade}
                    onChange={(e) => setNewBatchGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Custom manual text entry</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subjects Included (Manual Text Input) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics, Science & English..."
                    value={newBatchSubject}
                    onChange={(e) => setNewBatchSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Custom manual text entry</span>
                </div>
              </div>

              {/* Teacher & Schedule Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assign Faculty / Teacher
                  </label>
                  <select
                    value={newBatchTeacherId}
                    onChange={(e) => setNewBatchTeacherId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.qualifications})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Schedule Timing
                  </label>
                  <input
                    type="text"
                    placeholder="10:00 AM - 11:30 AM"
                    value={newBatchSchedule}
                    onChange={(e) => setNewBatchSchedule(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={newBatchFee}
                    onChange={(e) => setNewBatchFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Course Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newBatchFullPrice}
                    onChange={(e) => setNewBatchFullPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Batch Description / Highlights
                </label>
                <textarea
                  rows={2}
                  value={newBatchDescription}
                  onChange={(e) => setNewBatchDescription(e.target.value)}
                  placeholder="Curriculum overview, study materials included, live doubts support..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateBatchOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-teal-800 hover:bg-teal-900 text-white shadow-md cursor-pointer"
                >
                  Save & Launch Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: EDIT BATCH & THUMBNAIL BANNER (CRUCIAL REQUIREMENT) ================= */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-teal-100 dark:border-slate-800 my-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Top Bar with Prominent Cross Close Button */}
            <div className="flex items-center justify-between pb-4 border-b border-teal-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg">
                    Edit Batch & Banner Image
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Easily update thumbnail banner, pricing, instructor, and syllabus metadata
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingBatch(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 text-slate-400 flex items-center justify-center cursor-pointer transition-colors"
                title="Close (X)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveBatchSuccess && (
              <div className="my-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Batch and banner thumbnail updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveBatchEdit} className="space-y-4 pt-4 text-xs max-h-[calc(85vh-120px)] overflow-y-auto pr-1">
              
              {/* Batch Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Batch Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              {/* Manual Text Inputs for Grade / Target Exam & Subject (Requirement 5) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Grade / Target Exam (Manual Text Input) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 10 CBSE Board, JEE/NEET..."
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Custom manual text entry</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subjects Included (Manual Text Input) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics, Science & English..."
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Custom manual text entry</span>
                </div>
              </div>

              {/* CRUCIAL REQUIREMENT: DEDICATED THUMBNAIL / BANNER IMAGE FIELD & UPLOAD */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>Batch Thumbnail / Banner Image (Update / Replace)</span>
                  </label>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Live sync on save</span>
                </div>

                {/* Current / New Banner Image Preview */}
                {editThumbnailUrl && (
                  <div className="h-36 rounded-xl overflow-hidden relative border border-amber-200 dark:border-amber-800 bg-slate-900 shadow-inner">
                    <img
                      src={editThumbnailUrl}
                      alt="Current Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-[10px] text-amber-300 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Active Banner Preview</span>
                    </div>
                  </div>
                )}

                {/* Input & Upload Controls */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Enter or paste image URL to update thumbnail..."
                    value={editThumbnailUrl}
                    onChange={(e) => setEditThumbnailUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                  <label className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isUploadingEditBanner ? 'Uploading...' : 'Replace File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditBannerFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Fast Banner Presets Selector */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    Quick replace with official presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_BANNERS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditThumbnailUrl(preset.url)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                          editThumbnailUrl === preset.url
                            ? 'bg-amber-400 text-teal-950 border-amber-500 font-bold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing & Faculty Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Tuition Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={editMonthlyFee}
                    onChange={(e) => setEditMonthlyFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Batch Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editFullBatchPrice}
                    onChange={(e) => setEditFullBatchPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Instructor & Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty Assigned
                  </label>
                  <select
                    value={editTeacherId}
                    onChange={(e) => setEditTeacherId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.qualifications})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Schedule Slot
                  </label>
                  <input
                    type="text"
                    value={editScheduleTime}
                    onChange={(e) => setEditScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Next Topic */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Active / Next Lecture Topic
                </label>
                <input
                  type="text"
                  value={editNextTopic}
                  onChange={(e) => setEditNextTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              {/* Save & Cancel */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBatch}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-teal-800 hover:bg-teal-900 text-white shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSavingBatch ? 'Saving Updates...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: SYLLABUS & CHAPTER CRUD MANAGEMENT ================= */}
      {syllabusBatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-teal-100 dark:border-slate-800 my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Top Bar with Prominent Cross Close Button */}
            <div className="flex items-center justify-between pb-4 border-b border-teal-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-900 text-amber-300 flex items-center justify-center font-black">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg">
                    Syllabus & Curriculum Manager: {syllabusBatch.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Configure subjects, chapter outlines, and lecture topics
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSyllabusBatch(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 text-slate-400 flex items-center justify-center cursor-pointer transition-colors"
                title="Close Syllabus (X)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Split View: Subjects Sidebar & Chapters Area */}
            <div className="flex-1 flex flex-col md:flex-row gap-6 pt-4 overflow-hidden">
              
              {/* Left Column: Subjects List */}
              <div className="w-full md:w-64 flex flex-col border-r border-slate-100 dark:border-slate-800 pr-0 md:pr-4 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    Subjects ({syllabusBatch.subjects?.length || 0})
                  </span>
                  <button
                    onClick={() => setIsAddSubjectOpen(true)}
                    className="p-1.5 rounded-lg bg-teal-50 dark:bg-slate-800 hover:bg-teal-100 text-teal-800 dark:text-teal-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Add Subject"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[350px]">
                  {syllabusBatch.subjects && syllabusBatch.subjects.length > 0 ? (
                    syllabusBatch.subjects.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => setActiveSubjectId(sub.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          activeSubjectId === sub.id
                            ? 'bg-teal-800 text-white border-teal-800 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <h4 className="font-bold text-xs">{sub.name}</h4>
                          <span className={`text-[10px] block ${activeSubjectId === sub.id ? 'text-teal-200' : 'text-slate-400'}`}>
                            {sub.chapters?.length || 0} Chapters • ₹{sub.price}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete subject "${sub.name}"?`)) {
                              handleDeleteSubject(sub.id);
                            }
                          }}
                          className={`p-1 rounded-md hover:bg-red-500 hover:text-white transition-colors ${
                            activeSubjectId === sub.id ? 'text-teal-300' : 'text-slate-400'
                          }`}
                          title="Delete Subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No subjects configured. Click "+ Add" to create.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Chapters for Active Subject */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {activeSubjectId ? (
                  (() => {
                    const activeSub = syllabusBatch.subjects?.find(s => s.id === activeSubjectId);
                    return (
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                          <div>
                            <h4 className="font-black text-sm text-slate-900 dark:text-white">
                              {activeSub?.name} Chapters
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              Instructor: {activeSub?.teacherName}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setNewChapNumber((activeSub?.chapters?.length || 0) + 1);
                              setIsAddChapterOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5 text-amber-300" />
                            <span>Add Chapter</span>
                          </button>
                        </div>

                        {/* Chapters Feed */}
                        <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
                          {activeSub?.chapters && activeSub.chapters.length > 0 ? (
                            activeSub.chapters.map((chap) => (
                              <div
                                key={chap.id}
                                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 group hover:border-teal-500 transition-colors"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-mono font-bold">
                                      CH {chap.chapterNumber}
                                    </span>
                                    <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">
                                      {chap.title}
                                    </h5>
                                  </div>
                                  {chap.description && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 pl-1">
                                      {chap.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 pl-1">
                                    <span className="flex items-center gap-1">
                                      <Video className="w-3 h-3 text-teal-600" />
                                      {chap.lectures?.length || 0} Lectures
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-3 h-3 text-indigo-500" />
                                      {chap.notes?.length || 0} Notes
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => {
                                    if (confirm(`Delete chapter "${chap.title}"?`)) {
                                      handleDeleteChapter(chap.id);
                                    }
                                  }}
                                  className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                                  title="Delete Chapter"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-12 text-slate-400 text-xs">
                              No chapters created yet for this subject. Click "Add Chapter" above.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    Select or add a subject on the left to configure chapters.
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL 4: ADD SUBJECT FORM ================= */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-teal-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Add New Subject</h4>
              <button onClick={() => setIsAddSubjectOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubjectSubmit} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Individual Price (₹)</label>
                  <input
                    type="number"
                    value={newSubPrice}
                    onChange={(e) => setNewSubPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                  <input
                    type="text"
                    value={newSubDuration}
                    onChange={(e) => setNewSubDuration(e.target.value)}
                    placeholder="1 Year"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Teacher / Instructor</label>
                <select
                  value={newSubTeacher}
                  onChange={(e) => setNewSubTeacher(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newSubDesc}
                  onChange={(e) => setNewSubDesc(e.target.value)}
                  placeholder="Brief overview of curriculum..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: ADD CHAPTER FORM ================= */}
      {isAddChapterOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-teal-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Add Chapter to Subject</h4>
              <button onClick={() => setIsAddChapterOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddChapterSubmit} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Chapter Number</label>
                <input
                  type="number"
                  required
                  value={newChapNumber}
                  onChange={(e) => setNewChapNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Chapter Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 1: Real Numbers"
                  value={newChapTitle}
                  onChange={(e) => setNewChapTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Chapter Description / Topics</label>
                <textarea
                  rows={2}
                  value={newChapDesc}
                  onChange={(e) => setNewChapDesc(e.target.value)}
                  placeholder="Core concepts covered, key formulas, proofs..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddChapterOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs"
                >
                  Add Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: DELETE BATCH CONFIRMATION ================= */}
      {batchToDelete && (
        <div className="fixed inset-0 z-60 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-200 dark:border-red-900 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white text-base">
                Delete Batch?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to remove <strong>{batchToDelete.name}</strong>? This action will archive all associated batch records.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setBatchToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteBatch}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 7: ADD STUDENT MODAL ================= */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-teal-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">Enroll Student into Batch</h4>
              <button onClick={() => setIsAddStudentOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Student Email *</label>
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Number *</label>
                <input
                  type="tel"
                  placeholder="+91 98000 00000"
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-xs"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
