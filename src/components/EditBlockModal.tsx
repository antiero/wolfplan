import React, { useState } from 'react';
import { useWolfy } from '../context/WolfyContext';
import { DayOfWeek, PartnerId, ScheduleBlock, WorkLocation, TimedActivity } from '../types';
import {
  DEFAULT_DAYTIME_PRESETS,
  DEFAULT_EVENING_PRESETS,
  COMMON_AM_CHIPS,
  COMMON_PM_CHIPS,
} from '../data/initialData';
import {
  X,
  PawPrint,
  Check,
  Building,
  Laptop,
  Plane,
  Sun,
  Moon,
  Clock,
  Plus,
  Trash2,
  Settings as SettingsIcon,
  RotateCcw,
} from 'lucide-react';
import { playChime } from '../utils/sound';

interface EditBlockModalProps {
  day: DayOfWeek;
  partnerId: PartnerId;
  period?: 'am' | 'pm';
  initialBlock?: ScheduleBlock;
  onClose: () => void;
}

export const EditBlockModal: React.FC<EditBlockModalProps> = ({
  day,
  partnerId,
  period = 'am',
  initialBlock,
  onClose,
}) => {
  const { schedule, settings, updateScheduleBlock, updateSettings } = useWolfy();

  const currentDaySchedule = schedule.find((d) => d.day === day);
  const currentPartnerData = currentDaySchedule?.[partnerId];

  // Active period tab: 'am' = Daytime (Morning & Afternoon), 'pm' = Evening (6pm onwards)
  const [activePeriod, setActivePeriod] = useState<'am' | 'pm'>(period);

  // AM state (Daytime: morning & afternoon up to 6pm)
  const [amActivity, setAmActivity] = useState(
    initialBlock && period === 'am' ? initialBlock.activity : currentPartnerData?.am.activity || ''
  );
  const [amWorkLocation, setAmWorkLocation] = useState<WorkLocation>(
    initialBlock && period === 'am' ? initialBlock.workLocation || 'wfh' : currentPartnerData?.am.workLocation || 'wfh'
  );
  const [amWolfyDuty, setAmWolfyDuty] = useState(
    initialBlock && period === 'am' ? !!initialBlock.wolfyDuty : !!currentPartnerData?.am.wolfyDuty
  );
  const [amTimedActivities, setAmTimedActivities] = useState<TimedActivity[]>(
    initialBlock && period === 'am'
      ? initialBlock.timedActivities || []
      : currentPartnerData?.am.timedActivities || []
  );
  const [amNotes, setAmNotes] = useState(
    initialBlock && period === 'am' ? initialBlock.notes || '' : currentPartnerData?.am.notes || ''
  );

  // PM state (Evening: 6pm onwards)
  const [pmActivity, setPmActivity] = useState(
    initialBlock && period === 'pm' ? initialBlock.activity : currentPartnerData?.pm.activity || ''
  );
  const [pmWorkLocation, setPmWorkLocation] = useState<WorkLocation>(
    initialBlock && period === 'pm' ? initialBlock.workLocation || 'wfh' : currentPartnerData?.pm.workLocation || 'wfh'
  );
  const [pmWolfyDuty, setPmWolfyDuty] = useState(
    initialBlock && period === 'pm' ? !!initialBlock.wolfyDuty : !!currentPartnerData?.pm.wolfyDuty
  );
  const [pmTimedActivities, setPmTimedActivities] = useState<TimedActivity[]>(
    initialBlock && period === 'pm'
      ? initialBlock.timedActivities || []
      : currentPartnerData?.pm.timedActivities || []
  );
  const [pmNotes, setPmNotes] = useState(
    initialBlock && period === 'pm' ? initialBlock.notes || '' : currentPartnerData?.pm.notes || ''
  );

  // Timed activity input states
  const [newTime, setNewTime] = useState(period === 'am' ? '9:00 AM' : '6:00 PM');
  const [newTimedText, setNewTimedText] = useState('');

  // Preset customization drawer state
  const [isEditingPresets, setIsEditingPresets] = useState(false);
  const [newCustomPresetText, setNewCustomPresetText] = useState('');

  const partner = partnerId === 'partner1' ? settings.partner1 : settings.partner2;
  const partnerName = partner.name === 'Alex' ? (partnerId === 'partner1' ? 'Antony' : 'Beth') : (partner.name || (partnerId === 'partner1' ? 'Antony' : 'Beth'));
  const partnerShortName = partner.shortName === 'Alex' ? (partnerId === 'partner1' ? 'Ant' : 'Beth') : (partner.shortName || (partnerId === 'partner1' ? 'Ant' : 'Beth'));

  const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);

  // Presets from settings or clean defaults (NO school presets)
  const daytimePresets = settings.customDaytimePresets && settings.customDaytimePresets.length > 0
    ? settings.customDaytimePresets
    : DEFAULT_DAYTIME_PRESETS;

  const eveningPresets = settings.customEveningPresets && settings.customEveningPresets.length > 0
    ? settings.customEveningPresets
    : DEFAULT_EVENING_PRESETS;

  const currentPresets = activePeriod === 'am' ? daytimePresets : eveningPresets;

  // Time pill buttons
  // Daytime includes morning AND afternoon times (up to 5pm)
  const daytimeTimePills = [
    '8:00 AM',
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
  ];

  // Evening is defined as 6pm onwards
  const eveningTimePills = [
    '6:00 PM',
    '6:30 PM',
    '7:00 PM',
    '7:30 PM',
    '8:00 PM',
    '8:30 PM',
    '9:00 PM',
    '10:00 PM',
  ];

  const activeTimePills = activePeriod === 'am' ? daytimeTimePills : eveningTimePills;

  // Activity chips
  const amChips = settings.customActivityChipsAM || COMMON_AM_CHIPS;
  const pmChips = settings.customActivityChipsPM || COMMON_PM_CHIPS;
  const activeChips = activePeriod === 'am' ? amChips : pmChips;

  const handlePeriodTabChange = (target: 'am' | 'pm') => {
    setActivePeriod(target);
    setNewTime(target === 'am' ? '9:00 AM' : '6:00 PM');
    setNewTimedText('');
  };

  const handleAddTimed = () => {
    if (!newTimedText.trim()) return;
    const item: TimedActivity = {
      id: 'timed-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      time: newTime,
      text: newTimedText.trim(),
    };

    if (activePeriod === 'am') {
      setAmTimedActivities([...amTimedActivities, item]);
    } else {
      setPmTimedActivities([...pmTimedActivities, item]);
    }
    setNewTimedText('');
  };

  const handleApplyPreset = (presetText: string) => {
    const parts = presetText.split(' ');
    const t = parts[0];
    const rest = parts.slice(1).join(' ');
    const item: TimedActivity = {
      id: 'timed-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      time: t.toUpperCase(),
      text: rest || presetText,
    };

    if (activePeriod === 'am') {
      setAmTimedActivities([...amTimedActivities, item]);
    } else {
      setPmTimedActivities([...pmTimedActivities, item]);
    }
  };

  const handleRemoveTimed = (id: string) => {
    if (activePeriod === 'am') {
      setAmTimedActivities(amTimedActivities.filter((t) => t.id !== id));
    } else {
      setPmTimedActivities(pmTimedActivities.filter((t) => t.id !== id));
    }
  };

  // Preset management: Add custom preset
  const handleAddCustomPreset = () => {
    if (!newCustomPresetText.trim()) return;
    const val = newCustomPresetText.trim();
    if (activePeriod === 'am') {
      const updated = [...daytimePresets, val];
      updateSettings({ customDaytimePresets: updated });
    } else {
      const updated = [...eveningPresets, val];
      updateSettings({ customEveningPresets: updated });
    }
    setNewCustomPresetText('');
    playChime('notification');
  };

  // Preset management: Remove custom preset
  const handleRemoveCustomPreset = (presetToRemove: string) => {
    if (activePeriod === 'am') {
      const updated = daytimePresets.filter((p) => p !== presetToRemove);
      updateSettings({ customDaytimePresets: updated });
    } else {
      const updated = eveningPresets.filter((p) => p !== presetToRemove);
      updateSettings({ customEveningPresets: updated });
    }
  };

  // Reset presets to clean defaults
  const handleResetPresets = () => {
    if (activePeriod === 'am') {
      updateSettings({ customDaytimePresets: DEFAULT_DAYTIME_PRESETS });
    } else {
      updateSettings({ customEveningPresets: DEFAULT_EVENING_PRESETS });
    }
  };

  const handleSave = () => {
    // Save both Daytime and Evening routines in one seamless transaction
    updateScheduleBlock(day, partnerId, 'am', {
      activity: amActivity.trim() || 'Daytime flexible',
      workLocation: amWorkLocation,
      notes: amNotes.trim(),
      wolfyDuty: amWolfyDuty,
      timedActivities: amTimedActivities,
    });

    updateScheduleBlock(day, partnerId, 'pm', {
      activity: pmActivity.trim() || 'Evening flexible',
      workLocation: pmWorkLocation,
      notes: pmNotes.trim(),
      wolfyDuty: pmWolfyDuty,
      timedActivities: pmTimedActivities,
    });

    playChime('success');
    onClose();
  };

  // Current active values based on tab
  const currentActivity = activePeriod === 'am' ? amActivity : pmActivity;
  const setCurrentActivity = activePeriod === 'am' ? setAmActivity : setPmActivity;
  const currentWorkLocation = activePeriod === 'am' ? amWorkLocation : pmWorkLocation;
  const setCurrentWorkLocation = activePeriod === 'am' ? setAmWorkLocation : setPmWorkLocation;
  const currentWolfyDuty = activePeriod === 'am' ? amWolfyDuty : pmWolfyDuty;
  const setCurrentWolfyDuty = activePeriod === 'am' ? setAmWolfyDuty : setPmWolfyDuty;
  const currentTimedList = activePeriod === 'am' ? amTimedActivities : pmTimedActivities;
  const currentNotes = activePeriod === 'am' ? amNotes : pmNotes;
  const setCurrentNotes = activePeriod === 'am' ? setAmNotes : setPmNotes;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#181514] border-t sm:border border-stone-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden text-stone-100 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-150">
        
        {/* Sticky Header */}
        <div className="p-4 bg-stone-950 border-b border-stone-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`w-8 h-8 rounded-full ${partner.avatarBg} text-white text-xs font-bold flex items-center justify-center shadow-xs`}>
              {partnerShortName.charAt(0)}
            </span>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-amber-200 font-serif">
                Edit {dayLabel} Routine • {partnerName}
              </h3>
              <p className="text-[11px] text-stone-400">
                Update rough daytime and evening plans with specific timings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Period Tab Switcher (Daytime vs Evening 6pm onwards) */}
        <div className="px-4 py-2 bg-stone-900 border-b border-stone-800 shrink-0 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handlePeriodTabChange('am')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activePeriod === 'am'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'bg-stone-950/60 text-stone-400 hover:text-stone-200 hover:bg-stone-950'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>☀️ Daytime (Morning & Afternoon)</span>
          </button>

          <button
            type="button"
            onClick={() => handlePeriodTabChange('pm')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activePeriod === 'pm'
                ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                : 'bg-stone-950/60 text-stone-400 hover:text-stone-200 hover:bg-stone-950'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>🌙 Evening (6pm onwards)</span>
          </button>
        </div>

        {/* Scrollable Form Body with smooth iOS overscroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">
          
          {/* Main Activity Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-200">
                {activePeriod === 'am' ? '☀️ Daytime Activity / Rough Plan' : '🌙 Evening Activity / Plan (6pm onwards)'}
              </label>
              <span className="text-[10px] text-stone-500">
                {activePeriod === 'am' ? 'Morning through 5pm' : '6pm into night'}
              </span>
            </div>

            <input
              type="text"
              value={currentActivity}
              onChange={(e) => setCurrentActivity(e.target.value)}
              placeholder={activePeriod === 'am' ? 'e.g. WFH & gym, Afternoon coffee' : 'e.g. Dinner together, Out with friends, Relax'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-sm text-stone-100 focus:border-amber-500 focus:outline-hidden"
              autoFocus
            />

            {/* Quick Chips */}
            <div className="mt-2">
              <span className="text-[11px] text-stone-400 font-medium block mb-1">
                Quick Activity Chips:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setCurrentActivity(chip)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700/80 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location Status */}
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1.5">
              Location Status ({activePeriod === 'am' ? 'Daytime' : 'Evening'})
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
                  onClick={() => setCurrentWorkLocation(loc.id as WorkLocation)}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    currentWorkLocation === loc.id
                      ? activePeriod === 'am'
                        ? 'bg-amber-600/30 text-amber-200 border-amber-500 font-bold'
                        : 'bg-indigo-600/30 text-indigo-200 border-indigo-500 font-bold'
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
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300">
                <PawPrint className="w-4 h-4 text-amber-400" />
              </span>
              <div>
                <p className="text-xs font-bold text-amber-200">
                  Wolfy Dog Walk Duty ({activePeriod === 'am' ? 'Daytime' : 'Evening'})
                </p>
                <p className="text-[11px] text-stone-400">
                  {partnerName} takes Wolfy for a walk
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentWolfyDuty(!currentWolfyDuty)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                currentWolfyDuty
                  ? 'bg-amber-500 text-stone-950 border-amber-400'
                  : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'
              }`}
            >
              {currentWolfyDuty ? 'Assigned 🐾' : 'Not Assigned'}
            </button>
          </div>

          {/* Specific Timings & Time-Bound Activities Section */}
          <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Specific Timings & Appointments ({activePeriod === 'am' ? 'Morning & Afternoon' : '6pm onwards'})
                  </span>
                </label>
                <p className="text-[11px] text-stone-400">
                  {activePeriod === 'am'
                    ? 'e.g. 9am Dr appt, 10am get chicken out of freezer, 2pm Vet'
                    : 'e.g. 6:30pm Gym, 8pm Dinner booking, 9pm Movie'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingPresets(!isEditingPresets)}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-900 border border-stone-700"
                title="Customize quick presets (remove school buttons, add your own)"
              >
                <SettingsIcon className="w-3 h-3" />
                <span>{isEditingPresets ? 'Done' : 'Customise'}</span>
              </button>
            </div>

            {/* Custom Presets Manager Drawer */}
            {isEditingPresets ? (
              <div className="p-3 rounded-xl bg-stone-900 border border-amber-500/30 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">
                    Customise {activePeriod === 'am' ? 'Daytime' : 'Evening'} Presets:
                  </span>
                  <button
                    type="button"
                    onClick={handleResetPresets}
                    className="text-[10px] text-stone-400 hover:text-stone-200 flex items-center gap-1"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset Defaults</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {currentPresets.map((preset) => (
                    <span
                      key={preset}
                      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg bg-stone-950 border border-stone-700 text-stone-200"
                    >
                      <span>{preset}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomPreset(preset)}
                        className="text-stone-400 hover:text-rose-400 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 pt-1 border-t border-stone-800">
                  <input
                    type="text"
                    value={newCustomPresetText}
                    onChange={(e) => setNewCustomPresetText(e.target.value)}
                    placeholder="e.g. 10am Tattoo, 4pm Vet, 7pm Guitar"
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-100 focus:border-amber-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomPreset}
                    disabled={!newCustomPresetText.trim()}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold disabled:opacity-50"
                  >
                    + Add Preset
                  </button>
                </div>
              </div>
            ) : (
              /* Quick Presets Pills */
              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 font-medium">Quick One-Tap Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-750 transition-colors cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Timing Input & Time Pills */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="Time"
                  className="w-24 px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 focus:border-amber-500 focus:outline-hidden font-medium text-center"
                />

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
                  placeholder="Activity / Event (e.g. Tattoo, Vet, Defrost food)"
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

              {/* Quick Time Pills */}
              <div className="flex flex-wrap gap-1 pt-1">
                {activeTimePills.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => setNewTime(pill)}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                      newTime === pill
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                        : 'bg-stone-900/60 text-stone-400 border-stone-800 hover:text-stone-200'
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* List of currently added timed activities */}
            {currentTimedList.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-stone-800">
                <span className="text-[10px] text-stone-400 font-semibold block">
                  Scheduled Timings ({currentTimedList.length}):
                </span>
                {currentTimedList.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-stone-900 border border-stone-800 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-bold text-[10px] shrink-0">
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

          {/* Notes for partner */}
          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-1">
              Notes for {partnerId === 'partner1' ? settings.partner2.name : settings.partner1.name} (optional)
            </label>
            <input
              type="text"
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              placeholder="e.g. Free after 4pm, can grab fresh sourdough"
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-200 focus:border-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Sticky Fixed Footer */}
        <div className="p-3.5 bg-stone-950 border-t border-stone-800 shrink-0 flex items-center justify-between gap-2">
          <div className="text-[11px] text-stone-400 truncate hidden xs:block">
            Editing {dayLabel} for {partnerName}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-colors"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save {dayLabel} Routine</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
