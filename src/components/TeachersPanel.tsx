import React, { useState, useRef } from 'react';
import { Teacher, Batch } from '../types.ts';
import { TeacherAvatar } from './TeacherAvatar.tsx';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  BookOpen,
  CheckCircle2,
  X,
  Sparkles,
  Camera,
  Upload,
  Image,
  RefreshCw
} from 'lucide-react';

interface TeachersPanelProps {
  teachers: Teacher[];
  batches: Batch[];
  activeTeacherId: string;
  onSetActiveTeacher: (teacherId: string) => void;
  onAddTeacher: (teacherData: Omit<Teacher, 'id' | 'totalTeachingHours' | 'assignedBatches'>) => void;
  onUpdateTeacher: (id: string, updates: Partial<Teacher>) => void;
  onDeleteTeacher: (id: string) => void;
}

// Curated high-resolution educator avatar presets for quick selection
const AVATAR_PRESETS = [
  { label: 'Sarla Sharma (Default)', url: '/assets/images/image_72318e78.png' },
  { label: 'Male Senior Faculty', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
  { label: 'Science Educator', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
  { label: 'Mathematics Mentor', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' },
  { label: 'Academic Counselor', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80' }
];

export const TeachersPanel: React.FC<TeachersPanelProps> = ({
  teachers,
  batches,
  activeTeacherId,
  onSetActiveTeacher,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [qualifications, setQualifications] = useState('B.Ed, CTET');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subjectsStr, setSubjectsStr] = useState('Mathematics, Science');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setName('');
    setQualifications('B.Ed, CTET');
    setEmail('');
    setPhone('');
    setSubjectsStr('Mathematics, Science');
    setBio('');
    setAvatarUrl('');
    setEditingTeacher(null);
    setIsAddOpen(true);
  };

  const openEditModal = (t: Teacher) => {
    setEditingTeacher(t);
    setName(t.name);
    setQualifications(t.qualifications);
    setEmail(t.email);
    setPhone(t.phone);
    setSubjectsStr(t.subjectsExpertise.join(', '));
    setBio(t.bio);
    setAvatarUrl(t.avatarUrl || '');
    setIsAddOpen(true);
  };

  // Dedicated file upload handler using FileReader to create Data URL
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
      setIsUploadingPhoto(false);
    };
    reader.onerror = () => {
      alert('Failed to read image file.');
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) return;

    const subjectsArray = subjectsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingTeacher) {
      onUpdateTeacher(editingTeacher.id, {
        name: name.trim(),
        qualifications: qualifications.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subjectsExpertise: subjectsArray,
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim()
      });
    } else {
      onAddTeacher({
        name: name.trim(),
        qualifications: qualifications.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subjectsExpertise: subjectsArray,
        bio: bio.trim() || 'Qualified faculty instructor at Achiever Academy.',
        avatarUrl: avatarUrl.trim() || '/assets/images/image_72318e78.png',
        status: 'active'
      });
    }

    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Teachers Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage faculty records, custom profile photos, qualifications, and batch allocations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-teal-800 hover:bg-teal-900 text-white shadow-md shadow-teal-900/15 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Teacher</span>
          </button>
        </div>
      </div>

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {teachers.map((t) => {
          const isActive = t.id === activeTeacherId;
          const assignedBatchList = batches.filter(
            (b) => b.teacherId === t.id || t.assignedBatches?.includes(b.id)
          );

          return (
            <div
              key={t.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all shadow-[0_2px_12px_rgba(15,118,110,0.06)] flex flex-col justify-between ${
                isActive
                  ? 'border-2 border-teal-600 ring-2 ring-teal-500/10 dark:border-teal-500'
                  : 'border-teal-100 dark:border-slate-800 hover:border-teal-200 dark:hover:border-slate-700'
              }`}
            >
              <div>
                {/* Top card row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <TeacherAvatar
                      size="lg"
                      showBadge={true}
                      avatarUrl={t.avatarUrl}
                      name={t.name}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {t.name}
                        </h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                            Active Controlling Faculty
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mt-0.5">
                        {t.qualifications}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {t.totalTeachingHours}+ Teaching Hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-2 rounded-xl text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Teacher Record & Photo"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {teachers.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove ${t.name}?`)) {
                            onDeleteTeacher(t.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Delete Teacher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Contact & Subjects */}
                <div className="mt-4 pt-4 border-t border-teal-50 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 dark:text-slate-400 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      Email:
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">{t.email}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 dark:text-slate-400 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      Mobile:
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">{t.phone}</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                      Subject Expertise
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {t.subjectsExpertise.map((sub) => (
                        <span
                          key={sub}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                      Assigned Batches
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {assignedBatchList.length > 0 ? (
                        assignedBatchList.map((b) => (
                          <span
                            key={b.id}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                          >
                            {b.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                          No batches assigned yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button Row */}
              <div className="mt-6 pt-3 border-t border-teal-50 dark:border-slate-800 flex items-center justify-between">
                {!isActive ? (
                  <button
                    onClick={() => onSetActiveTeacher(t.id)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-teal-50 dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-slate-700 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Set as Active Logged-In Teacher</span>
                  </button>
                ) : (
                  <div className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-teal-800 text-white text-center flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Currently Controlling Workspace</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Teacher Modal with Dedicated Photo Upload Controls and Prominent Close "X" Button */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-teal-100 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
            {/* Prominent Close "X" Button */}
            <button
              onClick={() => setIsAddOpen(false)}
              aria-label="Close modal"
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-teal-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                  {editingTeacher ? `Edit Faculty Record: ${editingTeacher.name}` : 'Add New Faculty Member'}
                </h3>
                <p className="text-xs text-slate-500">
                  Update faculty credentials, custom profile picture, and subject specialization
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              
              {/* Photo Upload & Preview Section */}
              <div className="bg-teal-50/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-teal-100 dark:border-slate-700">
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                    <span>Faculty Profile Picture</span>
                  </span>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-[11px] text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                    >
                      Clear Photo
                    </button>
                  )}
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Circular Live Preview */}
                  <div className="relative group shrink-0">
                    <TeacherAvatar
                      size="xl"
                      showBadge={true}
                      avatarUrl={avatarUrl}
                      name={name || 'Teacher Preview'}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                      title="Upload New Photo"
                    >
                      <Camera className="w-5 h-5" />
                      <span className="text-[10px] font-bold mt-0.5">Change</span>
                    </button>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2.5 w-full">
                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileUpload}
                      className="hidden"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Image File'}</span>
                      </button>

                      <span className="text-[11px] text-slate-400">or enter image URL below</span>
                    </div>

                    {/* Direct Image URL input */}
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="Paste image URL (e.g. https://... or leave blank for default)"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>

                    {/* Quick Avatar Presets */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Or select quick preset:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {AVATAR_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setAvatarUrl(preset.url)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                              avatarUrl === preset.url
                                ? 'bg-teal-800 text-white border-teal-800'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-500'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Details */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teacher Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Qualifications (e.g. B.Ed, CTET, M.Sc) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M.Sc (Physics), B.Ed, CTET"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="teacher@achieveracademy.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98111 22334"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Expertise (comma-separated) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Science, Physics"
                  value={subjectsStr}
                  onChange={(e) => setSubjectsStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bio / Educator Profile
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief educator profile, years of experience, achievements..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-teal-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white shadow-md cursor-pointer"
                >
                  {editingTeacher ? 'Update Teacher Record' : 'Save Faculty Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
