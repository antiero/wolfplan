import React, { useState } from 'react';
import { useWolfy } from '../context/WolfyContext';
import { WolfyAvatar } from './WolfyAvatar';
import {
  X,
  Clock,
  Volume2,
  Bell,
  PawPrint,
  Heart,
  Save,
  RotateCcw,
  Sparkles,
  Trash2,
  Plus,
  Sun,
  Moon,
  Sliders,
} from 'lucide-react';
import { playChime } from '../utils/sound';
import { GoogleAuthButton } from './GoogleAuthButton';
import { UserAvatar } from './UserAvatar';
import {
  DEFAULT_DAYTIME_PRESETS,
  DEFAULT_EVENING_PRESETS,
} from '../data/initialData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetToDefaults, setIsProfileModalOpen } = useWolfy();

  const [reminderTime, setReminderTime] = useState(settings.sundayReminderTime || '21:30');
  const [reminderDay, setReminderDay] = useState(settings.sundayReminderDay || 'sunday');
  const [reminderEnabled, setReminderEnabled] = useState(settings.sundayReminderEnabled);
  const [realtimeAlerts, setRealtimeAlerts] = useState(settings.realtimeAlerts);
  const [dailyBriefingPopupEnabled, setDailyBriefingPopupEnabled] = useState(settings.dailyBriefingPopupEnabled !== false);
  const [p1Name, setP1Name] = useState(settings.partner1.name);
  const [p2Name, setP2Name] = useState(settings.partner2.name);

  // Preset customization state
  const [daytimePresets, setDaytimePresets] = useState<string[]>(
    settings.customDaytimePresets || DEFAULT_DAYTIME_PRESETS
  );
  const [eveningPresets, setEveningPresets] = useState<string[]>(
    settings.customEveningPresets || DEFAULT_EVENING_PRESETS
  );
  const [newDaytimeInput, setNewDaytimeInput] = useState('');
  const [newEveningInput, setNewEveningInput] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed1 = p1Name.trim() || 'Partner 1';
    const trimmed2 = p2Name.trim() || 'Partner 2';
    updateSettings({
      sundayReminderTime: reminderTime,
      sundayReminderDay: reminderDay,
      sundayReminderEnabled: reminderEnabled,
      realtimeAlerts,
      dailyBriefingPopupEnabled,
      partner1: { ...settings.partner1, name: trimmed1, shortName: trimmed1.slice(0, 4) },
      partner2: { ...settings.partner2, name: trimmed2, shortName: trimmed2.slice(0, 4) },
      customDaytimePresets: daytimePresets,
      customEveningPresets: eveningPresets,
    });
    playChime('success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5">
      <div className="bg-[#181514] border-t sm:border border-stone-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-stone-100 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WolfyAvatar size="md" mood="happy" showBadge badgeText="⚙️" />
            <div>
              <h3 className="font-bold text-base sm:text-lg text-amber-200 font-serif">
                Wolfy App Settings
              </h3>
              <p className="text-xs text-stone-400">
                Weekly check-in reminder & partner preferences
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

        {/* Form Body */}
        <div className="p-5 space-y-5 text-xs sm:text-sm">
          
          {/* Google Account & Cloud Persistence */}
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-2">
              Google Account & Cloud Storage
            </label>
            <GoogleAuthButton />
          </div>

          {/* Sunday Check-in Preference (Requirement: "Every Sunday night, at 9.30pm (or at a time of preference)") */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Sunday Night Routine Prompt
              </span>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500 bg-stone-800 border-stone-700 w-4 h-4"
              />
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Every Sunday night, Wolfy prompts both partners to drop in rough Daytime & Evening blocks and dinner plans for the week ahead.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-stone-400 block mb-1">
                  Reminder Day:
                </label>
                <select
                  value={reminderDay}
                  onChange={(e) => setReminderDay(e.target.value as 'sunday' | 'monday')}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200 focus:border-amber-500 focus:outline-hidden"
                >
                  <option value="sunday">Sunday Evening</option>
                  <option value="monday">Monday Morning</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-400 block mb-1">
                  Preferred Time (default 9:30 PM):
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Daily Briefing Popup on Open */}
          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Startup Briefing & Sunday Ritual Popup
              </span>
              <input
                type="checkbox"
                checked={dailyBriefingPopupEnabled}
                onChange={(e) => setDailyBriefingPopupEnabled(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500 bg-stone-800 border-stone-700 w-4 h-4"
              />
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Show an opening pop-up to remind you to plan your week (on Sundays) or check today's couple schedule, dinner, and errands (on weekdays).
            </p>
          </div>

          {/* Real-time Alerts */}
          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-200 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-400" />
                Real-time Push & Sound Alerts
              </span>
              <input
                type="checkbox"
                checked={realtimeAlerts}
                onChange={(e) => setRealtimeAlerts(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500 bg-stone-800 border-stone-700 w-4 h-4"
              />
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Get an instant notification banner and soft chime whenever your partner updates their schedule, claims cooking duty, or marks dinner plans.
            </p>
          </div>

          {/* Partner Names & Profiles */}
          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-200 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400" />
                Couple Profiles
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setIsProfileModalOpen(true);
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Photos & Avatars</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <UserAvatar profile={settings.partner1} size="xs" />
                  <label className="text-[11px] text-stone-300 font-medium">Partner 1</label>
                </div>
                <input
                  type="text"
                  value={p1Name}
                  onChange={(e) => setP1Name(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-100"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <UserAvatar profile={settings.partner2} size="xs" />
                  <label className="text-[11px] text-stone-300 font-medium">Partner 2</label>
                </div>
                <input
                  type="text"
                  value={p2Name}
                  onChange={(e) => setP2Name(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-100"
                />
              </div>
            </div>
          </div>

          {/* Customizable Presets (Daytime & Evening) */}
          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-200 flex items-center gap-1.5 text-xs">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Quick Timing & Activity Presets
              </span>
              <button
                type="button"
                onClick={() => {
                  setDaytimePresets(DEFAULT_DAYTIME_PRESETS);
                  setEveningPresets(DEFAULT_EVENING_PRESETS);
                }}
                className="text-[10px] text-stone-400 hover:text-amber-300 transition-colors"
                title="Reset to Wolfy defaults"
              >
                Reset to defaults
              </button>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Customise the quick 1-tap buttons shown when planning Daytime and Evening routines. Remove presets you don't use or add your own (e.g. gym, appointments, errands).
            </p>

            {/* Daytime Presets */}
            <div className="space-y-2 pt-1 border-t border-stone-800/60">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" />
                Daytime Presets (Morning & Afternoon)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {daytimePresets.map((preset) => (
                  <span
                    key={preset}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-200"
                  >
                    <span>{preset}</span>
                    <button
                      type="button"
                      onClick={() => setDaytimePresets(daytimePresets.filter((p) => p !== preset))}
                      className="text-stone-500 hover:text-rose-400 transition-colors p-0.5"
                      title="Remove preset"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  value={newDaytimeInput}
                  onChange={(e) => setNewDaytimeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newDaytimeInput.trim()) {
                      e.preventDefault();
                      setDaytimePresets([...daytimePresets, newDaytimeInput.trim()]);
                      setNewDaytimeInput('');
                    }
                  }}
                  placeholder="e.g. 9am Dr appt, 10am Chicken out"
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-100"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newDaytimeInput.trim()) {
                      setDaytimePresets([...daytimePresets, newDaytimeInput.trim()]);
                      setNewDaytimeInput('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            </div>

            {/* Evening Presets */}
            <div className="space-y-2 pt-2 border-t border-stone-800/60">
              <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                <Moon className="w-3 h-3 text-indigo-400" />
                Evening Presets (6pm onwards)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {eveningPresets.map((preset) => (
                  <span
                    key={preset}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-200"
                  >
                    <span>{preset}</span>
                    <button
                      type="button"
                      onClick={() => setEveningPresets(eveningPresets.filter((p) => p !== preset))}
                      className="text-stone-500 hover:text-rose-400 transition-colors p-0.5"
                      title="Remove preset"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  value={newEveningInput}
                  onChange={(e) => setNewEveningInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newEveningInput.trim()) {
                      e.preventDefault();
                      setEveningPresets([...eveningPresets, newEveningInput.trim()]);
                      setNewEveningInput('');
                    }
                  }}
                  placeholder="e.g. 6:30pm Gym, 7pm Walk Wolfy"
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-100"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newEveningInput.trim()) {
                      setEveningPresets([...eveningPresets, newEveningInput.trim()]);
                      setNewEveningInput('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* About Wolfy */}
          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-900/30 flex items-center gap-3">
            <WolfyAvatar size="sm" mood="happy" />
            <div className="text-xs text-stone-300">
              <p className="font-bold text-amber-200">About Wolfy</p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Named after our favourite Black and Tan Jack Russell Poodle! Keep an eye out for his dog walk duties throughout your week.
              </p>
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-1 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                if (window.confirm('Reset schedule and recipes to original defaults?')) {
                  resetToDefaults();
                  onClose();
                }
              }}
              className="text-stone-500 hover:text-stone-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to defaults</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-800 text-stone-300 hover:bg-stone-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
