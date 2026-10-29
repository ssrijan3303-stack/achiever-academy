import React from 'react';
import { ScheduleEvent } from '../types.ts';
import { Calendar as CalendarIcon, Clock, X, CheckCircle2 } from 'lucide-react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleEvent[];
  onStartClass: (batchId: string) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onStartClass
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-teal-100 overflow-hidden">
        
        <div className="bg-gradient-to-r from-teal-900 to-teal-800 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-5 h-5 text-teal-300" />
            <h3 className="font-extrabold text-lg">Academic Schedule & Timetable</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Weekly Lecture Timetable</span>
            <span className="text-[11px] text-teal-800 font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
              Mon - Sat Coaching Sessions
            </span>
          </div>

          <div className="space-y-3">
            {schedule.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-teal-100 bg-white shadow-xs flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      {item.subject}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {item.batchName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    {item.topic}
                  </p>
                  <p className="text-[11px] text-teal-700 mt-1 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {item.time} ({item.date})
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => {
                      onClose();
                      onStartClass('b-10-math');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-800 text-white hover:bg-teal-900 shadow-xs"
                  >
                    Open Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-teal-800 text-white text-xs font-bold rounded-xl"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
