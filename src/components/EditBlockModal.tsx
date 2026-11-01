import React, { useState } from 'react';
import { useWolfy } from '../context/WolfyContext';
import { DayOfWeek, PartnerId, ScheduleBlock, WorkLocation, TimedActivity } from '../types';
import { COMMON_AM_CHIPS, COMMON_PM_CHIPS } from '../data/initialData';
import { X, PawPrint, Check, Building, Laptop, Plane, Sun, Clock, Plus, Trash2 } from 'lucide-react';
import { WolfyAvatar } from './WolfyAvatar';

interface EditBlockModalProps {
  day: DayOfWeek;
  partnerId: PartnerId;
  period: 'am' | 'pm';
  initialBlock: ScheduleBlock;
  onClose: () => void;
}

export const EditBlockModal: React.FC<EditBlockModalProps> = ({
  day,
  partnerId,
  period,
  initialBlock,
  onClose,
}) => {
  const { settings, updateScheduleBlock } = useWolfy();
  const [activity, setActivity] = useState(initialBlock.activity || '');
  const [workLocation, setWorkLocation] = useState<WorkLocation>(initialBlock.workLocation || 'wfh');
  const [notes, setNotes] = useState(initialBlock.notes || '');
  const [wolfyDuty, setWolfyDuty] = useState(!!initialBlock.wolfyDuty);
  const [timedActivities, setTimedActivities] = useState<TimedActivity[]>(initialBlock.timedActivities || []);
  const [newTime, setNewTime] = useState(period === 'am' ? '9:00 AM' : '6:00 PM');
  const [newTimedText, setNewTimedText] = useState('');

  const partner = partnerId === 'partner1' ? settings.partner1 : settings.partner2;
  const partnerName = partner.name === 'Alex' ? (partnerId === 'partner1' ? 'Antony' : 'Beth') : (partner.name || (partnerId === 'partner1' ? 'Antony' : 'Beth'));
  const partnerShortName = partner.shortName === 'Alex' ? (partnerId === 'partner1' ? 'Ant' : 'Beth') : (partner.shortName || (partnerId === 'partner1' ? 'Ant' : 'Beth'));

  const chips = period === 'am' ? COMMON_AM_CHIPS : COMMON_PM_CHIPS;
  const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
  const periodLabel = period === 'am' ? 'Daytime' : 'Evening';

  const timePills = period === 'am'
    ? ['8:30 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM']
    : ['1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM', '6:30 PM', '8:00 PM'];

  const timedPresets = period === 'am'
    ? ['9am Dr appt', '10am Get chicken out of freezer', '11am Team standup', '8:30am School drop-off']
    : ['4pm Pick up child from school', '5:30pm Vet appointment', '6:30pm Pilates / Gym', '8pm Dinner booking'];

  const handleAddTimed = () => {
    if (!newTimedText.trim()) return;
    const item: TimedActivity = {
      id: 'timed-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      time: newTime,
      text: newTimedText.trim(),
    };
    setTimedActivities([...timedActivities, item]);
    setNewTimedText('');
  };

  const handleRemoveTimed = (id: string) => {
    setTimedActivities(timedActivities.filter((t) => t.id !== id));
  };

  const handleSave = () => {
    updateScheduleBlock(day, partnerId, period, {
      activity: activity.trim() || 'Free / Flexible',
      workLocation,
      notes: notes.trim(),
      wolfyDuty,
      timedActivities,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#181514] border-t sm:border border-stone-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl p-5 text-stone-100 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <span className={`w-7 h-7 rounded-full ${partner.avatarBg} text-white text-xs font-bold flex items-center justify-center`}>
              {partnerShortName.charAt(0)}
            </span>
            <div>
              <h3 className="font-bold text-base text-amber-200">
                Edit {dayLabel} {periodLabel}
              </h3>
              <p className="text-xs text-stone-400">
                Update rough {periodLabel.toLowerCase()} routine for {partnerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          {/* Main Activity */}
          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-1.5">
              Rough Activity / Plan
            </label>
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder={period === 'am' ? 'e.g. Working from Home & Gym' : 'e.g. Out with workmates, Pilates or dinner'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-sm text-stone-100 focus:border-amber-500 focus:outline-hidden"
              autoFocus
            />

            {/* Quick Chips */}
            <div className="mt-2.5">
              <span className="text-[11px] text-stone-400 font-medium block mb-1.5">
                Quick {periodLabel} Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setActivity(chip)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location / Work status */}
          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-1.5">
              Location Status
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'wfh', label: 'WFH', icon: <Laptop className="w-3.5 h-3.5" /> },
                { id: 'office', label: 'Office', icon: <Building className="w-3.5 h-3.5" /> },
                { id: 'travel', label: 'Travel', icon: <Plane className="w-3.5 h-3.5" /> },
                { id: 'off', label: 'Off / Free', icon: <Sun className="w-3.5 h-3.5" /> },
              ].map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setWorkLocation(loc.id as WorkLocation)}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    workLocation === loc.id
                      ? 'bg-amber-600/30 text-amber-200 border-amber-500 font-bold'
                      : 'bg-stone-950/70 text-stone-400 border-stone-800 hover:bg-stone-800'
                  }`}
                >
                  {loc.icon}
                  <span>{loc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Wolfy dog walking duty */}
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <WolfyAvatar size="sm" mood="walkies" />
              <div>
                <p className="text-xs font-bold text-amber-200 flex items-center gap-1">
                  <PawPrint className="w-3.5 h-3.5 text-amber-400" /> Wolfy Dog Walk Duty
                </p>
                <p className="text-[11px] text-stone-400">
                  {partner.name} handles Wolfy during this block
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setWolfyDuty(!wolfyDuty)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                wolfyDuty
                  ? 'bg-amber-500 text-stone-950 border-amber-400'
                  : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'
              }`}
            >
              {wolfyDuty ? 'Assigned 🐾' : 'Not Assigned'}
            </button>
          </div>

          {/* Time-Bound Activities (Specific Timings) */}
          <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Specific Timings & Appointments</span>
                </label>
                <p className="text-[11px] text-stone-400">
                  e.g. 9am dr appt, 10am get chicken out of the freezer
                </p>
              </div>
              <span className="text-[10px] text-stone-500 font-mono">
                {timedActivities.length} set
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              {timedPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    const parts = preset.split(' ');
                    const t = parts[0];
                    const rest = parts.slice(1).join(' ');
                    setTimedActivities([
                      ...timedActivities,
                      {
                        id: 'timed-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                        time: t.toUpperCase(),
                        text: rest,
                      },
                    ]);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>

            {/* Input Row */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="Time"
                  className="w-24 px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 focus:border-amber-500 focus:outline-hidden font-medium"
                />
              </div>

              <div className="flex-1 flex items-center gap-1.5">
                <input
                  type="text"
                  value={newTimedText}
                  onChange={(e) => setNewTimedText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTimed();
                    }
                  }}
                  placeholder="Event / Reminder (e.g. Dr appt, Defrost food)"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 focus:border-amber-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddTimed}
                  disabled={!newTimedText.trim()}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold disabled:opacity-50 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Quick Time Pills */}
            <div className="flex flex-wrap gap-1">
              {timePills.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setNewTime(pill)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                    newTime === pill
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-stone-900/60 text-stone-400 border-stone-800'
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Current Timed Activities List */}
            {timedActivities.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {timedActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-stone-900 border border-stone-800 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-semibold text-[10px] shrink-0">
                        {act.time}
                      </span>
                      <span className="font-medium text-stone-200 truncate">{act.text}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTimed(act.id)}
                      className="p-1 text-stone-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-1">
              Notes for {partnerId === 'partner1' ? settings.partner2.name : settings.partner1.name} (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Free after 6pm, can pick up fresh bread"
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-200 focus:border-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Save & Notify Partner</span>
          </button>
        </div>
      </div>
    </div>
  );
};
