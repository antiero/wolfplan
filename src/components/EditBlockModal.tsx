import React, { useState } from 'react';
import { useWolfy } from '../context/WolfyContext';
import { DayOfWeek, PartnerId, ScheduleBlock, WorkLocation } from '../types';
import { COMMON_AM_CHIPS, COMMON_PM_CHIPS } from '../data/initialData';
import { X, PawPrint, Check, Building, Laptop, Plane, Sun } from 'lucide-react';
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

  const partner = partnerId === 'partner1' ? settings.partner1 : settings.partner2;
  const chips = period === 'am' ? COMMON_AM_CHIPS : COMMON_PM_CHIPS;
  const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);

  const handleSave = () => {
    updateScheduleBlock(day, partnerId, period, {
      activity: activity.trim() || 'Free / Flexible',
      workLocation,
      notes: notes.trim(),
      wolfyDuty,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg shadow-2xl p-5 text-stone-100 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <span className={`w-7 h-7 rounded-full ${partner.avatarBg} text-white text-xs font-bold flex items-center justify-center`}>
              {partner.shortName.charAt(0)}
            </span>
            <div>
              <h3 className="font-bold text-base text-amber-200">
                Edit {dayLabel} {period.toUpperCase()}
              </h3>
              <p className="text-xs text-stone-400">
                Update rough schedule for {partner.name}
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
              placeholder={period === 'am' ? 'e.g. Working from Home & Gym' : 'e.g. Out with workmates'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-sm text-stone-100 focus:border-amber-500 focus:outline-hidden"
              autoFocus
            />

            {/* Quick Chips */}
            <div className="mt-2.5">
              <span className="text-[11px] text-stone-400 font-medium block mb-1.5">
                Quick One-Tap Presets:
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
