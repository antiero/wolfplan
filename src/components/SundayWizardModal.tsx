import React, { useState } from 'react';
import { useWolfy } from '../context/WolfyContext';
import { WolfyAvatar } from './WolfyAvatar';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Utensils,
  PawPrint,
  Clock,
  Briefcase,
  Home,
  Check,
} from 'lucide-react';
import { DayOfWeek, DaySchedule, ScheduleBlock, DinnerPlan, CookAssignment } from '../types';
import { COMMON_AM_CHIPS, COMMON_PM_CHIPS } from '../data/initialData';
import { playChime } from '../utils/sound';

export const SundayWizardModal: React.FC = () => {
  const {
    schedule,
    recipes,
    settings,
    activeUser,
    isSundayWizardOpen,
    setIsSundayWizardOpen,
    saveFullDayRoutine,
    simulatePartnerUpdate,
  } = useWolfy();

  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [localSchedule, setLocalSchedule] = useState<DaySchedule[]>(() => schedule);

  if (!isSundayWizardOpen) return null;

  const currentDay = localSchedule[currentDayIndex];
  const p1 = settings.partner1;
  const p2 = settings.partner2;

  const updateCurrentDayP1 = (period: 'am' | 'pm', field: keyof ScheduleBlock, val: unknown) => {
    setLocalSchedule((prev) =>
      prev.map((d, idx) => {
        if (idx !== currentDayIndex) return d;
        return {
          ...d,
          partner1: {
            ...d.partner1,
            [period]: {
              ...d.partner1[period],
              [field]: val,
            },
          },
        };
      })
    );
  };

  const updateCurrentDayP2 = (period: 'am' | 'pm', field: keyof ScheduleBlock, val: unknown) => {
    setLocalSchedule((prev) =>
      prev.map((d, idx) => {
        if (idx !== currentDayIndex) return d;
        return {
          ...d,
          partner2: {
            ...d.partner2,
            [period]: {
              ...d.partner2[period],
              [field]: val,
            },
          },
        };
      })
    );
  };

  const updateCurrentDayDinner = (update: Partial<DinnerPlan>) => {
    setLocalSchedule((prev) =>
      prev.map((d, idx) => {
        if (idx !== currentDayIndex) return d;
        return {
          ...d,
          dinner: {
            ...d.dinner,
            ...update,
          },
        };
      })
    );
  };

  const handleQuickFillWeek = () => {
    // Quick autofill template
    setLocalSchedule((prev) =>
      prev.map((d, idx) => {
        if (idx <= 4) {
          // Weekdays Mon-Fri
          return {
            ...d,
            partner1: {
              am: { activity: idx % 2 === 0 ? 'Working from Home' : 'Office', workLocation: idx % 2 === 0 ? 'wfh' : 'office', wolfyDuty: idx % 2 === 0 },
              pm: { activity: idx === 1 ? 'Out with workmates' : 'Chill night in & Dinner', workLocation: idx % 2 === 0 ? 'wfh' : 'office' },
            },
            partner2: {
              am: { activity: idx % 2 === 0 ? 'In the Office' : 'Working from Home', workLocation: idx % 2 === 0 ? 'office' : 'wfh', wolfyDuty: idx % 2 !== 0 },
              pm: { activity: idx === 3 ? 'Gym / Pilates' : 'Relaxing at home', workLocation: idx % 2 === 0 ? 'office' : 'wfh' },
            },
          };
        }
        return d;
      })
    );
    playChime('success');
  };

  const handleFinishWizard = () => {
    // Save all days to context
    localSchedule.forEach((d) => {
      saveFullDayRoutine(d.day, d.partner1.am, d.partner1.pm, d.partner2.am, d.partner2.pm, d.dinner);
    });

    playChime('sunday');
    setIsSundayWizardOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-100 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WolfyAvatar size="md" mood="happy" showBadge badgeText="✨" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-amber-200 font-serif">
                  Sunday Routine Check-in
                </h3>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {settings.sundayReminderTime}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Plan rough AM/PM blocks and dinners for the week ahead
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickFillWeek}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
              title="Autofill standard weekday blocks"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart Autofill</span>
            </button>
            <button
              onClick={() => setIsSundayWizardOpen(false)}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Day Navigation Tabs */}
        <div className="px-5 py-2.5 bg-stone-900 border-b border-stone-800 flex items-center justify-between overflow-x-auto gap-1.5 scrollbar-none">
          {localSchedule.map((d, idx) => {
            const isActive = idx === currentDayIndex;
            return (
              <button
                key={d.day}
                onClick={() => setCurrentDayIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex flex-col items-center ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <span>{d.shortLabel}</span>
                <span className="text-[10px] opacity-80">{d.dateStr}</span>
              </button>
            );
          })}
        </div>

        {/* Wizard Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-amber-100 flex items-center gap-2 font-serif">
              <span>{currentDay.dayLabel}</span>
              <span className="text-xs font-sans text-stone-400">({currentDay.dateStr})</span>
            </h4>
            <span className="text-xs text-stone-400">
              Day {currentDayIndex + 1} of 7
            </span>
          </div>

          {/* Partner 1 Schedule */}
          <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full ${p1.avatarBg} text-white text-xs font-bold flex items-center justify-center`}>
                  {p1.shortName.charAt(0)}
                </span>
                <span className="text-sm font-bold text-stone-200">{p1.name}'s Routine</span>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!currentDay.partner1.am.wolfyDuty}
                  onChange={(e) => updateCurrentDayP1('am', 'wolfyDuty', e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 bg-stone-800 border-stone-700"
                />
                <span className="text-amber-300 flex items-center gap-1">
                  <PawPrint className="w-3.5 h-3.5" /> Wolfy Walk Duty
                </span>
              </label>
            </div>

            {/* AM */}
            <div>
              <label className="text-xs font-semibold text-stone-400 mb-1 flex items-center gap-1">
                <span>AM Routine (Morning / Work)</span>
              </label>
              <input
                type="text"
                value={currentDay.partner1.am.activity}
                onChange={(e) => updateCurrentDayP1('am', 'activity', e.target.value)}
                placeholder="e.g. Working from Home, Gym 7am"
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-stone-100 focus:border-amber-500 focus:outline-hidden"
              />
              {/* Quick AM chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COMMON_AM_CHIPS.slice(0, 5).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => updateCurrentDayP1('am', 'activity', chip)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* PM */}
            <div>
              <label className="text-xs font-semibold text-stone-400 mb-1 flex items-center gap-1">
                <span>PM Routine (Evening / After Work)</span>
              </label>
              <input
                type="text"
                value={currentDay.partner1.pm.activity}
                onChange={(e) => updateCurrentDayP1('pm', 'activity', e.target.value)}
                placeholder="e.g. Out with workmates, Chill night in"
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-stone-100 focus:border-amber-500 focus:outline-hidden"
              />
              {/* Quick PM chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COMMON_PM_CHIPS.slice(0, 5).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => updateCurrentDayP1('pm', 'activity', chip)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Partner 2 Schedule */}
          <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full ${p2.avatarBg} text-white text-xs font-bold flex items-center justify-center`}>
                  {p2.shortName.charAt(0)}
                </span>
                <span className="text-sm font-bold text-stone-200">{p2.name}'s Routine</span>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!currentDay.partner2.am.wolfyDuty}
                  onChange={(e) => updateCurrentDayP2('am', 'wolfyDuty', e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-500 bg-stone-800 border-stone-700"
                />
                <span className="text-emerald-300 flex items-center gap-1">
                  <PawPrint className="w-3.5 h-3.5" /> Wolfy Walk Duty
                </span>
              </label>
            </div>

            {/* AM */}
            <div>
              <label className="text-xs font-semibold text-stone-400 mb-1 flex items-center gap-1">
                <span>AM Routine (Morning / Work)</span>
              </label>
              <input
                type="text"
                value={currentDay.partner2.am.activity}
                onChange={(e) => updateCurrentDayP2('am', 'activity', e.target.value)}
                placeholder="e.g. In the Office, Working from Home"
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-stone-100 focus:border-amber-500 focus:outline-hidden"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COMMON_AM_CHIPS.slice(0, 5).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => updateCurrentDayP2('am', 'activity', chip)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* PM */}
            <div>
              <label className="text-xs font-semibold text-stone-400 mb-1 flex items-center gap-1">
                <span>PM Routine (Evening / After Work)</span>
              </label>
              <input
                type="text"
                value={currentDay.partner2.pm.activity}
                onChange={(e) => updateCurrentDayP2('pm', 'activity', e.target.value)}
                placeholder="e.g. Pilates at 6:30pm, Cooking dinner"
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-stone-100 focus:border-amber-500 focus:outline-hidden"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COMMON_PM_CHIPS.slice(0, 5).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => updateCurrentDayP2('pm', 'activity', chip)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dinner Plan Section */}
          <div className="bg-amber-950/30 border border-amber-900/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-amber-400" /> Dinner Plan
              </span>

              {/* Dinner Type Toggle */}
              <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
                <button
                  type="button"
                  onClick={() => updateCurrentDayDinner({ type: 'together' })}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
                    currentDay.dinner.type === 'together'
                      ? 'bg-amber-500 text-stone-950'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Together
                </button>
                <button
                  type="button"
                  onClick={() => updateCurrentDayDinner({ type: 'separate' })}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
                    currentDay.dinner.type === 'separate'
                      ? 'bg-amber-500 text-stone-950'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Own Dinners
                </button>
              </div>
            </div>

            {currentDay.dinner.type === 'together' ? (
              <div className="space-y-3">
                {/* Who is cooking? */}
                <div>
                  <label className="text-xs font-semibold text-stone-400 mb-1.5 block">
                    Who will cook?
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {[
                      { id: 'partner1', label: p1.name },
                      { id: 'partner2', label: p2.name },
                      { id: 'both', label: 'Both / Team' },
                      { id: 'takeaway', label: 'Takeaway' },
                      { id: 'eating_out', label: 'Eating Out' },
                      { id: 'leftovers', label: 'Leftovers' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => updateCurrentDayDinner({ cook: c.id as CookAssignment })}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-colors ${
                          currentDay.dinner.cook === c.id
                            ? 'bg-amber-600/40 text-amber-200 border-amber-500'
                            : 'bg-stone-900/80 text-stone-400 border-stone-800 hover:bg-stone-800'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meal name & Quick Recipe Picker */}
                <div>
                  <label className="text-xs font-semibold text-stone-400 mb-1 block">
                    Meal Name / Dish
                  </label>
                  <input
                    type="text"
                    value={currentDay.dinner.mealName}
                    onChange={(e) => updateCurrentDayDinner({ mealName: e.target.value })}
                    placeholder="e.g. Creamy Tuscan Salmon & Gnocchi"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-stone-100 focus:border-amber-500 focus:outline-hidden"
                  />
                  {/* Quick select from recipes */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {recipes.slice(0, 4).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => updateCurrentDayDinner({ mealName: r.name, recipeId: r.id })}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-900/50 flex items-center gap-1"
                      >
                        <span>{r.imageEmoji || '🍲'}</span>
                        <span className="truncate max-w-[150px]">{r.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">
                    {p1.name}'s dinner:
                  </label>
                  <input
                    type="text"
                    value={currentDay.dinner.partner1OwnDinner || ''}
                    onChange={(e) => updateCurrentDayDinner({ partner1OwnDinner: e.target.value })}
                    placeholder="e.g. Pub dinner with workmates"
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">
                    {p2.name}'s dinner:
                  </label>
                  <input
                    type="text"
                    value={currentDay.dinner.partner2OwnDinner || ''}
                    onChange={(e) => updateCurrentDayDinner({ partner2OwnDinner: e.target.value })}
                    placeholder="e.g. Leftover pasta + salad after Pilates"
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 bg-stone-950/90 border-t border-stone-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentDayIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentDayIndex === 0}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-800 text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-700"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev Day</span>
          </button>

          {currentDayIndex < localSchedule.length - 1 ? (
            <button
              onClick={() => setCurrentDayIndex((prev) => prev + 1)}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md"
            >
              <span>Next: {localSchedule[currentDayIndex + 1]?.shortLabel}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinishWizard}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete & Sync Week</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
