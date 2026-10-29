import React, { useState, useRef } from 'react';
import { DoubtItem, DoubtReply, Batch, Student, Teacher } from '../types.ts';
import {
  HelpCircle,
  MessageCircle,
  ThumbsUp,
  CheckCircle2,
  Image as ImageIcon,
  Send,
  Plus,
  Filter,
  Search,
  Check,
  User,
  X,
  Sparkles,
  Paperclip
} from 'lucide-react';

interface DoubtForumPanelProps {
  doubts: DoubtItem[];
  batches: Batch[];
  currentStudent?: Student;
  activeTeacher?: Teacher;
  isAdmin: boolean;
  onAddDoubt: (doubtData: {
    title: string;
    description: string;
    subject: string;
    chapter: string;
    batchId: string;
    batchName: string;
    photoUrl?: string;
  }) => Promise<void>;
  onAddReply: (doubtId: string, content: string, isTeacher: boolean) => Promise<void>;
  onVerifyReply?: (doubtId: string, replyId: string) => Promise<void>;
  onUpvoteDoubt: (doubtId: string) => Promise<void>;
}

export const DoubtForumPanel: React.FC<DoubtForumPanelProps> = ({
  doubts,
  batches,
  currentStudent,
  activeTeacher,
  isAdmin,
  onAddDoubt,
  onAddReply,
  onVerifyReply,
  onUpvoteDoubt
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Ask Doubt Modal State
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [doubtTitle, setDoubtTitle] = useState('');
  const [doubtDesc, setDoubtDesc] = useState('');
  const [doubtSubject, setDoubtSubject] = useState('Mathematics');
  const [doubtChapter, setDoubtChapter] = useState('');
  const [doubtBatchId, setDoubtBatchId] = useState(batches[0]?.id || '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmittingDoubt, setIsSubmittingDoubt] = useState(false);

  // Active reply drafts map: doubtId -> text
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateDoubtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtTitle.trim() || !doubtDesc.trim()) return;

    setIsSubmittingDoubt(true);
    const targetBatch = batches.find((b) => b.id === doubtBatchId) || batches[0];

    await onAddDoubt({
      title: doubtTitle,
      description: doubtDesc,
      subject: doubtSubject,
      chapter: doubtChapter || 'General Concepts',
      batchId: targetBatch.id,
      batchName: targetBatch.name,
      photoUrl: photoPreview || undefined
    });

    setIsSubmittingDoubt(false);
    setIsAskModalOpen(false);
    setDoubtTitle('');
    setDoubtDesc('');
    setDoubtChapter('');
    setPhotoPreview(null);
  };

  const handleSendReply = async (doubtId: string) => {
    const content = replyDrafts[doubtId]?.trim();
    if (!content) return;

    await onAddReply(doubtId, content, isAdmin);
    setReplyDrafts((prev) => ({ ...prev, [doubtId]: '' }));
  };

  const filteredDoubts = doubts.filter((d) => {
    if (selectedBatchId !== 'all' && d.batchId !== selectedBatchId) return false;
    if (selectedStatus === 'resolved' && d.status !== 'resolved') return false;
    if (selectedStatus === 'open' && d.status === 'resolved') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.chapter.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Doubt Counter & Discussion Forum</span>
            <span className="text-xs font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-200">
              Live Q&A
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ask homework problems, upload screenshots of questions, and get verified teacher solutions from Sarla Didi.
          </p>
        </div>

        <button
          onClick={() => setIsAskModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ask a New Doubt</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-teal-100 dark:border-slate-700">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="p-2 rounded-xl border border-teal-200 dark:border-slate-700 bg-teal-50/50 dark:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white"
          >
            <option value="all">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                selectedStatus === 'all'
                  ? 'bg-teal-800 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              All Doubts
            </button>
            <button
              onClick={() => setSelectedStatus('open')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                selectedStatus === 'open'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Open Doubts
            </button>
            <button
              onClick={() => setSelectedStatus('resolved')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                selectedStatus === 'resolved'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Verified Solutions
            </button>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search doubts or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Doubts Feed */}
      <div className="space-y-4">
        {filteredDoubts.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-white dark:bg-slate-800 border border-teal-100 dark:border-slate-700 text-slate-400">
            <HelpCircle className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-sm">No doubts found matching your filters.</p>
          </div>
        ) : (
          filteredDoubts.map((doubt) => (
            <div
              key={doubt.id}
              className="p-5 rounded-3xl border border-teal-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-extrabold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                      {doubt.batchName} • {doubt.subject}
                    </span>
                    <span className="text-xs text-slate-400">
                      Chapter: <strong>{doubt.chapter}</strong> • {doubt.createdAt}
                    </span>
                    {doubt.status === 'resolved' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Teacher Verified Solution
                      </span>
                    ) : doubt.status === 'answered' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        Answered / Solution Ready
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-200">
                        Pending Faculty Review
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white pt-1">
                    {doubt.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {doubt.description}
                  </p>
                </div>

                {/* Upvote Button */}
                <button
                  onClick={() => onUpvoteDoubt(doubt.id)}
                  className="px-3 py-1.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-teal-50/50 dark:bg-slate-700/50 text-teal-900 dark:text-teal-200 font-extrabold text-xs flex items-center gap-1.5 hover:bg-teal-100 cursor-pointer transition-all shrink-0"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{doubt.upvotes}</span>
                </button>
              </div>

              {/* Attached Photo / Screenshot if uploaded */}
              {doubt.photoUrl && (
                <div className="rounded-2xl border border-teal-100 dark:border-slate-700 overflow-hidden max-w-md bg-slate-50 dark:bg-slate-900 p-2">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">
                    Attached Image / Question Screenshot:
                  </span>
                  <img
                    src={doubt.photoUrl}
                    alt="Question Attachment"
                    className="rounded-xl w-full max-h-60 object-contain"
                  />
                </div>
              )}

              {/* Student Metadata - Clean with NO roll numbers */}
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Asked by: <strong className="text-slate-700 dark:text-slate-300">{doubt.studentName}</strong> • {doubt.replies.length} Responses</span>
                {doubt.lectureTitle && (
                  <span className="text-teal-700 dark:text-teal-400 font-bold">
                    From Lecture: {doubt.lectureTitle} {doubt.videoTimestamp ? `(${doubt.videoTimestamp})` : ''}
                  </span>
                )}
              </div>

              {/* Threaded Replies */}
              <div className="pt-3 border-t border-teal-50 dark:border-slate-700/60 space-y-3">
                {doubt.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-3.5 rounded-2xl text-xs space-y-1.5 ${
                      reply.authorRole === 'ai_bot'
                        ? 'bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800'
                        : reply.isTeacherVerified
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {reply.authorRole === 'ai_bot' ? (
                          <span className="w-5 h-5 rounded-full bg-purple-700 text-white font-black text-[10px] flex items-center justify-center">
                            <Sparkles className="w-3 h-3" />
                          </span>
                        ) : reply.authorRole === 'teacher' ? (
                          <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-black text-[10px] flex items-center justify-center">
                            T
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-800 font-bold text-[10px] flex items-center justify-center">
                            S
                          </span>
                        )}
                        <strong className="text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                          {reply.authorName}
                          {reply.authorRole === 'ai_bot' && (
                            <span className="text-[9px] font-black bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 px-1.5 py-0.2 rounded-full">
                              Instant AI Tutor
                            </span>
                          )}
                        </strong>
                        <span className="text-[10px] text-slate-400">{reply.createdAt}</span>
                      </div>

                      {reply.isTeacherVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300">
                          <Check className="w-3 h-3" /> Verified Solution
                        </span>
                      ) : isAdmin && onVerifyReply ? (
                        <button
                          onClick={() => onVerifyReply(doubt.id, reply.id)}
                          className="text-[10px] font-bold text-teal-800 hover:text-emerald-600 cursor-pointer"
                        >
                          Mark as Verified
                        </button>
                      ) : null}
                    </div>

                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium pl-7 whitespace-pre-line">
                      {reply.content}
                    </p>

                    {reply.videoSolutionUrl && (
                      <div className="pl-7 pt-1">
                        <a
                          href={reply.videoSolutionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 hover:underline"
                        >
                          ▶ Watch Video Solution Walkthrough
                        </a>
                      </div>
                    )}
                  </div>
                ))}

                {/* Reply Composer */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder={
                      isAdmin
                        ? 'Write teacher verified answer or guidance...'
                        : 'Help your classmate by writing a response...'
                    }
                    value={replyDrafts[doubt.id] || ''}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({
                        ...prev,
                        [doubt.id]: e.target.value
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendReply(doubt.id);
                      }
                    }}
                    className="flex-1 p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white font-medium"
                  />
                  <button
                    onClick={() => handleSendReply(doubt.id)}
                    className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Ask New Doubt */}
      {isAskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-teal-100 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="bg-teal-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-teal-200" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Ask a Doubt</h3>
                  <p className="text-xs text-teal-200">
                    Post your question with details and optional photo attachment.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAskModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/80 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoubtSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Class / Batch:
                  </label>
                  <select
                    value={doubtBatchId}
                    onChange={(e) => setDoubtBatchId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject / Chapter:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chapter 8: Trigonometry Identity proof"
                    value={doubtChapter}
                    onChange={(e) => setDoubtChapter(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Headline / Title:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., How do we prove that (sec A + tan A)(1 - sin A) = cos A?"
                  value={doubtTitle}
                  onChange={(e) => setDoubtTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Explanation / Where you got stuck:
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain which step confused you or what you tried so far..."
                  value={doubtDesc}
                  onChange={(e) => setDoubtDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium leading-relaxed"
                />
              </div>

              {/* Photo Upload Attachment */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Attach Photo / Question Screenshot (Optional):
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 border-2 border-dashed border-teal-200 dark:border-slate-700 rounded-xl w-full text-center hover:bg-teal-50/50 cursor-pointer flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300"
                >
                  <ImageIcon className="w-4 h-4 text-teal-700" />
                  <span className="font-bold">
                    {photoPreview ? 'Change Selected Image' : 'Click to Upload Textbook Photo / Screenshot'}
                  </span>
                </button>

                {photoPreview && (
                  <div className="relative mt-2 rounded-xl overflow-hidden border border-teal-200 max-h-48 w-48">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-teal-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDoubt}
                  className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingDoubt ? 'Posting...' : 'Post Doubt'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
