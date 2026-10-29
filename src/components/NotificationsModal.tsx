import React, { useState } from 'react';
import { NotificationRecord, Batch, Student } from '../types.ts';
import {
  Bell,
  MessageSquare,
  Send,
  Phone,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
  Users,
  Filter,
  X,
  AlertCircle
} from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationRecord[];
  batches: Batch[];
  students: Student[];
  onSendNotification: (notifData: {
    recipientName: string;
    recipientPhone: string;
    recipientRole: 'student' | 'teacher' | 'admin';
    channel: 'whatsapp' | 'sms' | 'both';
    type: 'registration_received' | 'student_approved' | 'new_quiz' | 'new_assignment' | 'announcement' | 'fee_reminder' | 'live_class';
    title: string;
    message: string;
    batchName?: string;
  }) => Promise<void>;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  batches,
  students,
  onSendNotification
}) => {
  const [activeTab, setActiveTab] = useState<'log' | 'send'>('log');
  const [filterChannel, setFilterChannel] = useState<'all' | 'whatsapp' | 'sms'>('all');

  // Form State
  const [targetType, setTargetType] = useState<'batch' | 'student'>('batch');
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'both'>('whatsapp');
  const [notifType, setNotifType] = useState<NotificationRecord['type']>('live_class');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filterChannel === 'all') return true;
    if (filterChannel === 'whatsapp') return n.channel === 'whatsapp' || n.channel === 'both';
    if (filterChannel === 'sms') return n.channel === 'sms' || n.channel === 'both';
    return true;
  });

  const applyTemplate = (templateType: 'live_class' | 'new_quiz' | 'fee_reminder' | 'announcement') => {
    setNotifType(templateType);
    if (templateType === 'live_class') {
      setTitle('Class 10 Math Live Class Starting in 10 Minutes');
      setMessage(
        'Hello Student! Your live class for Trigonometry on Anushree Academy begins at 10:00 AM. Please join the digital whiteboard classroom with your notebook.'
      );
    } else if (templateType === 'new_quiz') {
      setTitle('New Online Assessment Published: Chapter 8 Test');
      setMessage(
        'A new 20-mark online MCQ test has been scheduled for Class 10 Math. Instant score evaluation and answer explanations available on completion.'
      );
    } else if (templateType === 'fee_reminder') {
      setTitle('Tuition Fee Reminder for Current Month');
      setMessage(
        'Hello! This is a gentle reminder regarding tuition fee clearance for Anushree Academy. You can pay securely via UPI QR in your Student Portal.'
      );
    } else if (templateType === 'announcement') {
      setTitle('Important Schedule Update - Extra Class on Saturday');
      setMessage(
        'Please note that a special doubt clearing session will take place this Saturday from 10:00 AM to 11:30 AM. Attendance is highly recommended.'
      );
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setIsSending(true);
    let recipientName = 'All Batch Students';
    let recipientPhone = '+91 98765 43210';
    let batchName = 'Class 10 Mathematics';

    if (targetType === 'student') {
      const student = students.find((s) => s.id === selectedStudentId);
      if (student) {
        recipientName = student.name;
        recipientPhone = student.phone;
        batchName = student.batchName;
      }
    } else {
      const batch = batches.find((b) => b.id === selectedBatchId);
      if (batch) {
        batchName = batch.name;
        recipientName = `${batch.name} Students`;
        recipientPhone = '+91 98201 11000';
      }
    }

    await onSendNotification({
      recipientName,
      recipientPhone,
      recipientRole: 'student',
      channel,
      type: notifType,
      title,
      message,
      batchName
    });

    setIsSending(false);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setActiveTab('log');
      setTitle('');
      setMessage('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-teal-100 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-200 border border-white/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-teal-200 bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-700">
                  Notification Engine
                </span>
                <span className="text-xs text-teal-200">• Automated WhatsApp & SMS Hub</span>
              </div>
              <h2 className="text-xl font-black mt-0.5">Anushree Academy Broadcast Alerts</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-2 border-b border-teal-100 dark:border-slate-800 flex items-center justify-between bg-teal-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('log')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'log'
                  ? 'bg-teal-800 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-teal-100 dark:hover:bg-slate-700'
              }`}
            >
              Broadcast Logs ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('send')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'send'
                  ? 'bg-teal-800 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-teal-100 dark:hover:bg-slate-700'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send New Alert / Trigger</span>
            </button>
          </div>

          {activeTab === 'log' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold hidden sm:inline">Filter:</span>
              <button
                onClick={() => setFilterChannel('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                  filterChannel === 'all'
                    ? 'bg-teal-700 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-teal-100 dark:border-slate-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterChannel('whatsapp')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                  filterChannel === 'whatsapp'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-teal-100 dark:border-slate-700'
                }`}
              >
                WhatsApp
              </button>
              <button
                onClick={() => setFilterChannel('sms')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                  filterChannel === 'sms'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-teal-100 dark:border-slate-700'
                }`}
              >
                SMS
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'log' ? (
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Bell className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-sm">No notifications logged yet.</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 rounded-2xl border border-teal-100 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-xs hover:border-teal-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {notif.channel === 'whatsapp' || notif.channel === 'both' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            WhatsApp Alert
                          </span>
                        ) : null}
                        {notif.channel === 'sms' || notif.channel === 'both' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                            SMS Gateway
                          </span>
                        ) : null}
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {notif.sentAt}
                        </span>
                        {notif.batchName && (
                          <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                            {notif.batchName}
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {notif.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-2 pt-0.5">
                        <span>Recipient: <strong className="text-slate-700 dark:text-slate-300">{notif.recipientName}</strong> ({notif.recipientPhone})</span>
                        <span>• Status: <strong className="text-emerald-600">{notif.status.toUpperCase()}</strong></span>
                      </div>
                    </div>

                    {/* Quick WhatsApp Link Action Button */}
                    {notif.whatsAppDeepLink && (
                      <a
                        href={notif.whatsAppDeepLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Open WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Send Alert Form */
            <form onSubmit={handleSend} className="space-y-5 max-w-2xl mx-auto">
              {sentSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Alert dispatched successfully via WhatsApp & SMS! Logged in audit history.</span>
                </div>
              )}

              {/* Template Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Quick Broadcast Templates:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => applyTemplate('live_class')}
                    className="p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-teal-50/60 dark:bg-slate-800 text-left hover:border-teal-500 transition-all cursor-pointer text-xs"
                  >
                    <span className="font-extrabold text-teal-900 dark:text-teal-200 block">Class Live</span>
                    <span className="text-[10px] text-slate-500 block">Starting in 10 mins</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('new_quiz')}
                    className="p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-teal-50/60 dark:bg-slate-800 text-left hover:border-teal-500 transition-all cursor-pointer text-xs"
                  >
                    <span className="font-extrabold text-teal-900 dark:text-teal-200 block">New Test</span>
                    <span className="text-[10px] text-slate-500 block">MCQ assessment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('fee_reminder')}
                    className="p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-teal-50/60 dark:bg-slate-800 text-left hover:border-teal-500 transition-all cursor-pointer text-xs"
                  >
                    <span className="font-extrabold text-teal-900 dark:text-teal-200 block">Fee Reminder</span>
                    <span className="text-[10px] text-slate-500 block">UPI QR payment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('announcement')}
                    className="p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-teal-50/60 dark:bg-slate-800 text-left hover:border-teal-500 transition-all cursor-pointer text-xs"
                  >
                    <span className="font-extrabold text-teal-900 dark:text-teal-200 block">Notice Board</span>
                    <span className="text-[10px] text-slate-500 block">Schedule change</span>
                  </button>
                </div>
              </div>

              {/* Target Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Audience:
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetType('batch')}
                      className={`flex-1 py-2 text-xs font-extrabold rounded-xl border cursor-pointer ${
                        targetType === 'batch'
                          ? 'bg-teal-800 text-white border-teal-800'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-teal-200 dark:border-slate-700'
                      }`}
                    >
                      Entire Batch
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetType('student')}
                      className={`flex-1 py-2 text-xs font-extrabold rounded-xl border cursor-pointer ${
                        targetType === 'student'
                          ? 'bg-teal-800 text-white border-teal-800'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-teal-200 dark:border-slate-700'
                      }`}
                    >
                      Specific Student
                    </button>
                  </div>
                </div>

                {targetType === 'batch' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Select Class / Batch:
                    </label>
                    <select
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white"
                    >
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.studentCount} students)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Select Student:
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.rollNumber} • {s.batchName})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Delivery Channel */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Delivery Channel:
                </label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer flex-1">
                    <input
                      type="radio"
                      name="channel"
                      value="whatsapp"
                      checked={channel === 'whatsapp'}
                      onChange={() => setChannel('whatsapp')}
                    />
                    <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                      WhatsApp Only
                    </span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer flex-1">
                    <input
                      type="radio"
                      name="channel"
                      value="sms"
                      checked={channel === 'sms'}
                      onChange={() => setChannel('sms')}
                    />
                    <span className="text-xs font-extrabold text-blue-700 dark:text-blue-400">
                      SMS Only
                    </span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer flex-1">
                    <input
                      type="radio"
                      name="channel"
                      value="both"
                      checked={channel === 'both'}
                      onChange={() => setChannel('both')}
                    />
                    <span className="text-xs font-extrabold text-teal-800 dark:text-teal-300">
                      Both (WhatsApp + SMS)
                    </span>
                  </label>
                </div>
              </div>

              {/* Alert Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Message Title / Subject:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Live Class Starting in 10 Minutes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Message Content:
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type message text..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Dispatching Alert...' : 'Dispatch Broadcast Now'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
