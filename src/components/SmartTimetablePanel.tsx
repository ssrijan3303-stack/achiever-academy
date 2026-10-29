import React, { useState } from 'react';
import { TimetableSlot, Batch, Student, Teacher } from '../types.ts';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Trash2,
  Edit2,
  Filter,
  CheckCircle2,
  Sparkles,
  Radio,
  X,
  BookOpen,
  UserCheck,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

interface SmartTimetablePanelProps {
  timetable: TimetableSlot[];
  batches: Batch[];
  currentStudent?: Student;
  currentTeacher?: Teacher;
  isAdmin?: boolean;
  onJoinLiveClass: (batchId: string) => void;
  onAddSlot?: (slot: Omit<TimetableSlot, 'id'>) => void;
  onUpdateSlot?: (id: string, updates: Partial<TimetableSlot>) => void;
  onDeleteSlot?: (id: string) => void;
  onClose?: () => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const SmartTimetablePanel: React.FC<SmartTimetablePanelProps> = ({
  timetable,
  batches,
  currentStudent,
  currentTeacher,
  isAdmin = false,
  onJoinLiveClass,
  onAddSlot,
  onUpdateSlot,
  onDeleteSlot,
  onClose
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('all');
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  // Form state for slot
  const [slotDay, setSlotDay] = useState<string>('Monday');
  const [slotStartTime, setSlotStartTime] = useState('06:00 PM');
  const [slotEndTime, setSlotEndTime] = useState('07:30 PM');
  const [slotSubject, setSlotSubject] = useState('');
  const [slotTopic, setSlotTopic] = useState('');
  const [slotBatchId, setSlotBatchId] = useState(batches[0]?.id || '');
  const [slotTeacherName, setSlotTeacherName] = useState(currentTeacher?.name || batches[0]?.teacherName || 'Faculty');
  const [slotRoom, setSlotRoom] = useState('Live Studio 1');

  // Enrolled Batch Filtering:
  // If currentStudent is logged in, ONLY show slots for their enrolled batch/subject!
  const isStudent = !!currentStudent;
  const canManageSchedule = isAdmin || !!currentTeacher;

  const filteredSlots = timetable.filter((slot) => {
    // 1. Day filter
    const slotDayValue = slot.day || slot.dayOfWeek;
    if (selectedDay !== 'All' && slotDayValue !== selectedDay) {
      return false;
    }

    // 2. Strict Student Enrolled Batch Filtering
    if (isStudent && currentStudent) {
      const studentBatchId = currentStudent.batchId;
      const enrolledBatchIds = currentStudent.purchasedBatchIds || currentStudent.enrolledBatches || [studentBatchId];
      
      const matchesBatchId = slot.batchId && enrolledBatchIds.includes(slot.batchId);
      const matchesBatchName = slot.batchName && currentStudent.batchName && 
        slot.batchName.toLowerCase().trim() === currentStudent.batchName.toLowerCase().trim();
      
      return matchesBatchId || matchesBatchName;
    }

    // 3. Strict Teacher Filtering
    if (currentTeacher && !isAdmin) {
      const matchesTeacherName = slot.teacherName.toLowerCase().includes(currentTeacher.name.toLowerCase());
      const matchesExpertise = currentTeacher.subjectsExpertise.some((sub) =>
        slot.subject.toLowerCase().includes(sub.toLowerCase())
      );
      return matchesTeacherName || matchesExpertise;
    }

    // 4. Admin / Guest manual batch filter
    if (selectedBatchFilter !== 'all') {
      return slot.batchId === selectedBatchFilter;
    }

    return true;
  });

  const openAddModal = () => {
    setSlotDay('Monday');
    setSlotStartTime('06:00 PM');
    setSlotEndTime('07:30 PM');
    setSlotSubject(currentTeacher?.subjectsExpertise[0] || 'Mathematics');
    setSlotTopic('');
    setSlotBatchId(batches[0]?.id || '');
    setSlotTeacherName(currentTeacher?.name || batches[0]?.teacherName || 'Faculty');
    setSlotRoom('Live Studio 1');
    setIsAddSlotOpen(true);
  };

  const openEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setSlotDay(slot.day || (slot.dayOfWeek as string) || 'Monday');
    setSlotStartTime(slot.startTime || '06:00 PM');
    setSlotEndTime(slot.endTime || '07:30 PM');
    setSlotSubject(slot.subject || '');
    setSlotTopic(slot.topic || '');
    setSlotBatchId(slot.batchId || batches[0]?.id || '');
    setSlotTeacherName(slot.teacherName || currentTeacher?.name || 'Faculty');
    setSlotRoom(slot.room || slot.roomCode || 'Live Studio 1');
  };

  const handleAddSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotSubject.trim() || !slotTopic.trim()) return;

    const assignedBatch = batches.find((b) => b.id === slotBatchId) || batches[0];

    if (onAddSlot) {
      onAddSlot({
        day: slotDay,
        startTime: slotStartTime,
        endTime: slotEndTime,
        subject: slotSubject.trim(),
        topic: slotTopic.trim(),
        batchId: assignedBatch?.id || 'all',
        batchName: assignedBatch?.name || 'All Batches',
        teacherName: slotTeacherName.trim(),
        room: slotRoom.trim()
      });
    }

    setSlotSubject('');
    setSlotTopic('');
    setIsAddSlotOpen(false);
  };

  const handleEditSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot || !slotTopic.trim()) return;

    const assignedBatch = batches.find((b) => b.id === slotBatchId) || batches[0];

    if (onUpdateSlot) {
      onUpdateSlot(editingSlot.id, {
        day: slotDay,
        dayOfWeek: slotDay,
        startTime: slotStartTime,
        endTime: slotEndTime,
        subject: slotSubject.trim(),
        topic: slotTopic.trim(),
        batchId: assignedBatch?.id || editingSlot.batchId,
        batchName: assignedBatch?.name || editingSlot.batchName,
        teacherName: slotTeacherName.trim(),
        room: slotRoom.trim(),
        roomCode: slotRoom.trim()
      });
    }

    setEditingSlot(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header with Universal Close Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-teal-100 dark:border-slate-800 shadow-sm relative">
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close Smart Timetable"
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                Smart Timetable & Weekly Schedule
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isStudent
                  ? `Filtered exclusively for your enrolled batch (${currentStudent?.batchName || 'Active Batch'})`
                  : 'Real-time schedule of live interactive lectures across all academic streams'}
              </p>
            </div>
          </div>
        </div>

        {/* Admin / Teacher Add Schedule Slot Button */}
        {(isAdmin || currentTeacher) && onAddSlot && (
          <button
            onClick={() => setIsAddSlotOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class Schedule Slot</span>
          </button>
        )}
      </div>

      {/* Student Enrolled Batch Banner */}
      {isStudent && currentStudent && (
        <div className="bg-teal-50/80 dark:bg-slate-800/60 rounded-2xl p-4 border border-teal-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-teal-900 dark:text-teal-200">
                Active Enrolled Batch Filter: {currentStudent.batchName} ({currentStudent.targetExam || 'Curriculum'})
              </span>
              <p className="text-[11px] text-teal-800/80 dark:text-slate-400 mt-0.5">
                Only live classes scheduled by your assigned faculty for this batch appear here.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 px-3 py-1 rounded-full border border-teal-200 dark:border-slate-700 self-start sm:self-auto">
            Roll: {currentStudent.rollNumber}
          </span>
        </div>
      )}

      {/* Day Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedDay('All')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedDay === 'All'
              ? 'bg-teal-800 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-teal-100 dark:border-slate-800 hover:bg-teal-50'
          }`}
        >
          All Days
        </button>
        {DAYS_OF_WEEK.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedDay === day
                ? 'bg-teal-800 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-teal-100 dark:border-slate-800 hover:bg-teal-50'
            }`}
          >
            {day}
          </button>
        ))}

        {/* Batch filter if Admin */}
        {isAdmin && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Filter Batch:</span>
            <select
              value={selectedBatchFilter}
              onChange={(e) => setSelectedBatchFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-teal-100 dark:border-slate-800 text-slate-800 dark:text-white font-medium"
            >
              <option value="all">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.grade})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Timetable Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSlots.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-teal-100 dark:border-slate-800">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              No Classes Scheduled {selectedDay !== 'All' ? `for ${selectedDay}` : ''}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {isStudent
                ? 'No upcoming classes found for your enrolled batch on this day. Your teachers will update the schedule shortly.'
                : 'No timetable slots exist for the current filter. Add a new slot using the button above.'}
            </p>
          </div>
        ) : (
          filteredSlots.map((slot) => (
            <div
              key={slot.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-teal-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                    {slot.day || slot.dayOfWeek || 'Scheduled'}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                    {slot.subject}
                  </h3>
                  <p className="text-xs font-bold text-teal-800 dark:text-teal-300">
                    {slot.batchName}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <strong className="text-slate-700 dark:text-slate-200">Topic:</strong> {slot.topic}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-teal-50 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    {slot.teacherName}
                  </span>
                  <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {slot.room || 'Live Studio'}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-teal-50 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => onJoinLiveClass(slot.batchId || batches[0]?.id || '')}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span>{isStudent ? 'Join Live Class' : 'Enter Studio'}</span>
                </button>

                {canManageSchedule && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(slot)}
                      className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      title="Edit Slot"
                      aria-label="Edit Scheduled Slot"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {onDeleteSlot && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete scheduled class "${slot.subject} - ${slot.topic}"?`)) {
                            onDeleteSlot(slot.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        title="Delete Slot"
                        aria-label="Delete Scheduled Slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Slot Modal with Prominent "X" Button */}
      {isAddSlotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-teal-100 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setIsAddSlotOpen(false)}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Schedule New Class Slot
                </h3>
                <p className="text-xs text-slate-500">
                  Assign timing, subject topic, faculty, and room code
                </p>
              </div>
            </div>

            <form onSubmit={handleAddSlotSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Day of Week *
                  </label>
                  <select
                    value={slotDay}
                    onChange={(e) => setSlotDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Batch *
                  </label>
                  <select
                    value={slotBatchId}
                    onChange={(e) => setSlotBatchId(e.target.value)}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 05:00 PM"
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 06:30 PM"
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Physics, Chemistry, Biology"
                    value={slotSubject}
                    onChange={(e) => setSlotSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty In-Charge *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Faculty Name"
                    value={slotTeacherName}
                    onChange={(e) => setSlotTeacherName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Topic / Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Rotational Mechanics - Conservation of Angular Momentum"
                  value={slotTopic}
                  onChange={(e) => setSlotTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Studio / Virtual Room
                </label>
                <input
                  type="text"
                  placeholder="Live Studio 1"
                  value={slotRoom}
                  onChange={(e) => setSlotRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSlotOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Slot Modal with Prominent "X" Button */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-teal-100 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setEditingSlot(null)}
              aria-label="Close edit slot modal"
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Edit Scheduled Class Slot
                </h3>
                <p className="text-xs text-slate-500">
                  Update timings, topic details, batch allocation, or studio room
                </p>
              </div>
            </div>

            <form onSubmit={handleEditSlotSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Day of Week *
                  </label>
                  <select
                    value={slotDay}
                    onChange={(e) => setSlotDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Batch *
                  </label>
                  <select
                    value={slotBatchId}
                    onChange={(e) => setSlotBatchId(e.target.value)}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 05:00 PM"
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 06:30 PM"
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Physics, Chemistry, Biology"
                    value={slotSubject}
                    onChange={(e) => setSlotSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty In-Charge *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Faculty Name"
                    value={slotTeacherName}
                    onChange={(e) => setSlotTeacherName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Topic / Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Rotational Mechanics - Conservation of Angular Momentum"
                  value={slotTopic}
                  onChange={(e) => setSlotTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Studio / Virtual Room
                </label>
                <input
                  type="text"
                  placeholder="Live Studio 1"
                  value={slotRoom}
                  onChange={(e) => setSlotRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Update Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
