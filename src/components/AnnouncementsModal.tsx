import React, { useState } from 'react';
import { Announcement } from '../types.ts';
import { Bell, Plus, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AnnouncementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: Announcement[];
  isAdmin?: boolean;
  onAddAnnouncement: (item: { title: string; content: string; targetBatch: string; priority: 'normal' | 'urgent' }) => void;
}

export const AnnouncementsModal: React.FC<AnnouncementsModalProps> = ({
  isOpen,
  onClose,
  announcements,
  isAdmin = false,
  onAddAnnouncement
}) => {
  const [isPosting, setIsPosting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetBatch, setTargetBatch] = useState('All Batches');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onAddAnnouncement({
      title: title.trim(),
      content: content.trim(),
      targetBatch,
      priority
    });
    setTitle('');
    setContent('');
    setIsPosting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-teal-100 dark:border-slate-800 overflow-hidden">
        
        <div className="bg-gradient-to-r from-teal-900 to-teal-800 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-amber-300" />
            <h3 className="font-extrabold text-lg">Class Announcements & Notice Board</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Recent Broadcasts ({announcements.length})
            </span>
            {isAdmin && (
              <button
                onClick={() => setIsPosting(!isPosting)}
                className="text-xs font-bold text-teal-800 dark:text-teal-400 hover:text-teal-950 dark:hover:text-teal-200 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isPosting ? 'View Notices' : '+ Post Notice'}</span>
              </button>
            )}
          </div>

          {isPosting ? (
            <form onSubmit={handleSubmit} className="p-4 bg-teal-50/50 dark:bg-slate-800/60 rounded-2xl border border-teal-100 dark:border-slate-700 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10 Mid-Term Math Mock Exam on Friday"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Message Content</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Instructions for students regarding timing, syllabus, and submissions..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Audience</label>
                  <select
                    value={targetBatch}
                    onChange={(e) => setTargetBatch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="All Batches">All Batches</option>
                    <option value="Class 10 Mathematics">Class 10 Mathematics</option>
                    <option value="Class 9 Science">Class 9 Science</option>
                    <option value="Class 8 English">Class 8 English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="normal">Normal Priority</option>
                    <option value="urgent">Urgent Notice (Flash Alert)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPosting(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white cursor-pointer shadow-xs"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-2xl border border-teal-100 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      ann.priority === 'urgent'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                    }`}>
                      {ann.targetBatch}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {ann.createdAt}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
