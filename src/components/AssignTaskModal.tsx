import React, { useState } from 'react';
import { useWolfy } from '../context/WolfyContext';
import { DayOfWeek, PartnerId } from '../types';
import { WolfyAvatar } from './WolfyAvatar';
import { UserAvatar } from './UserAvatar';
import {
  X,
  Clock,
  Calendar,
  CheckCircle2,
  Tag,
  Plus,
  ArrowRight,
  PawPrint,
  Utensils,
  BookOpen,
} from 'lucide-react';

const COMMON_TASK_PRESETS = [
  { title: 'Pick up child from school', time: '3:30 PM', category: 'school' },
  { title: 'Get chicken out of freezer', time: '10:00 AM', category: 'groceries' },
  { title: 'Vet appointment for Wolfy', time: '4:00 PM', category: 'wolfy' },
  { title: 'Pick up parcel from post office', time: '1:00 PM', category: 'errand' },
  { title: 'Doctor appointment', time: '9:00 AM', category: 'appointment' },
  { title: 'Pick up groceries / milk', time: '5:30 PM', category: 'errand' },
  { title: 'Give Wolfy flea & tick treatment', time: '7:00 PM', category: 'wolfy' },
];

const TIME_CHIPS = [
  '8:30 AM',
  '9:00 AM',
  '10:00 AM',
  '12:00 PM',
  '2:00 PM',
  '3:30 PM',
  '4:00 PM',
  '5:30 PM',
  '6:00 PM',
  '7:00 PM',
];

export const AssignTaskModal: React.FC = () => {
  const {
    isAssignTaskModalOpen,
    setIsAssignTaskModalOpen,
    assignTaskInitialDay,
    assignTask,
    settings,
    activeUser,
  } = useWolfy();

  const [day, setDay] = useState<DayOfWeek>(assignTaskInitialDay || 'monday');
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<'wolfy' | 'groceries' | 'school' | 'errand' | 'appointment' | 'general'>('general');

  // Sync initial day when modal opens
  React.useEffect(() => {
    if (assignTaskInitialDay) {
      setDay(assignTaskInitialDay);
    }
  }, [assignTaskInitialDay, isAssignTaskModalOpen]);

  if (!isAssignTaskModalOpen) return null;

  const currentPartner = activeUser === 'partner1' ? settings.partner1 : settings.partner2;
  const partnerToAssign: PartnerId = activeUser === 'partner1' ? 'partner2' : 'partner1';
  const assignedPartner = partnerToAssign === 'partner1' ? settings.partner1 : settings.partner2;

  const currentName = currentPartner.name === 'Alex' ? (activeUser === 'partner1' ? 'Antony' : 'Beth') : (currentPartner.name || 'You');
  const assignedName = assignedPartner.name === 'Alex' ? (partnerToAssign === 'partner1' ? 'Antony' : 'Beth') : (assignedPartner.name || 'Partner');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    assignTask({
      day,
      time: time.trim() || undefined,
      title: title.trim(),
      assignedTo: partnerToAssign,
      assignedBy: activeUser,
      category,
      notes: notes.trim() || undefined,
      completed: false,
    });

    setTitle('');
    setTime('');
    setNotes('');
    setIsAssignTaskModalOpen(false);
  };

  const handleApplyPreset = (preset: typeof COMMON_TASK_PRESETS[0]) => {
    setTitle(preset.title);
    setTime(preset.time);
    setCategory(preset.category as any);
  };

  const dayOptions: { id: DayOfWeek; label: string }[] = [
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
    { id: 'sunday', label: 'Sun' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#181514] border-t sm:border border-stone-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-stone-100 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 to-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-amber-100 font-serif">
                Assign Task to {assignedName}
              </h3>
              <p className="text-xs text-stone-400">
                Sync a time-bound errand or responsibility directly to their daily plan
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAssignTaskModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          
          {/* Who is assigning to whom */}
          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserAvatar profile={currentPartner} size="sm" />
              <div className="text-left">
                <span className="text-[10px] text-stone-500 block">From</span>
                <span className="font-semibold text-xs text-stone-200">{currentName}</span>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-amber-400" />

            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-[10px] text-stone-500 block">Assigned to</span>
                <span className="font-semibold text-xs text-amber-300">{assignedName}</span>
              </div>
              <UserAvatar profile={assignedPartner} size="sm" />
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
              Quick Suggestions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TASK_PRESETS.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="text-xs px-2.5 py-1 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors flex items-center gap-1.5"
                >
                  <span>{preset.title}</span>
                  <span className="text-[10px] text-amber-400 font-medium">({preset.time})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Day of Week Selector */}
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1.5">
              Day of the Week
            </label>
            <div className="grid grid-cols-7 gap-1">
              {dayOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDay(opt.id)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    day === opt.id
                      ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-xs'
                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1.5">
              Task or Errand Title <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Thursday 4pm pick up child from school"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-sm text-stone-100 focus:border-amber-500 focus:outline-hidden"
              required
              autoFocus
            />
          </div>

          {/* Specific Timing */}
          <div>
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Specific Time (e.g. 9am, 10am, 4pm)</span>
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 4:00 PM, 9:00 AM, or anytime"
              className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 focus:border-amber-500 focus:outline-hidden"
            />
            {/* Quick Time Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {TIME_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setTime(chip)}
                  className={`text-[11px] px-2 py-0.5 rounded-lg border transition-colors ${
                    time === chip
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips */}
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'school', label: 'School / Kids' },
                { id: 'groceries', label: 'Food & Meals' },
                { id: 'wolfy', label: 'Wolfy Care' },
                { id: 'appointment', label: 'Appointment' },
                { id: 'errand', label: 'Errands' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id as any)}
                  className={`py-1.5 px-2 rounded-xl text-xs border transition-colors text-center truncate ${
                    category === c.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-semibold'
                      : 'bg-stone-900 text-stone-400 border-stone-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1.5">
              Additional Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Remember swimming kit / key is under plant pot"
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-800">
            <button
              type="button"
              onClick={() => setIsAssignTaskModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Assign to {assignedName}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
