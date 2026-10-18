import React, { useState } from 'react';
import { useWolfy } from '../context/WolfyContext';
import { WolfyAvatar } from './WolfyAvatar';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  FileEdit,
  Sparkles,
  Utensils,
  PawPrint,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react';
import { DayOfWeek, DaySchedule, ScheduleBlock, DinnerPlan, CookAssignment } from '../types';
import { COMMON_AM_CHIPS, COMMON_PM_CHIPS } from '../data/initialData';
import { playChime } from '../utils/sound';

export const SundayWizardModal: React.FC = () => {
  const {
    schedule,
    recipes,
    settings,
    isSundayWizardOpen,
    setIsSundayWizardOpen,
    saveFullDayRoutine,
    hasCompletedFirstWeek,
    previousWeekSchedule,
    archiveCurrentWeekAsPrevious,
  } = useWolfy();

  // Wizard state: 'choose_mode' (on 2nd run) or 'plan_days'
  const [wizardStep, setWizardStep] = useState<'choose_mode' | 'plan_days'>(() =>
    hasCompletedFirstWeek ? 'choose_mode' : 'plan_days'
  );

  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [localSchedule, setLocalSchedule] = useState<DaySchedule[]>(() => schedule);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isSundayWizardOpen) {
      setWizardStep(hasCompletedFirstWeek ? 'choose_mode' : 'plan_days');
      setCurrentDayIndex(0);
      setLocalSchedule(schedule);
    }
  }, [isSundayWizardOpen, hasCompletedFirstWeek]);

  if (!isSundayWizardOpen) return null;

  const currentDay = localSchedule[currentDayIndex];
  const p1 = settings.partner1;
  const p2 = settings.partner2;

  // Choice 1: Pre-populate from previous week
  const handlePrePopulateFromLastWeek = () => {
    const source = (previousWeekSchedule && previousWeekSchedule.length > 0)
      ? previousWeekSchedule
      : schedule;

    setLocalSchedule((current) =>
      current.map((dayItem, idx) => {
        const prev = source[idx] || source.find((p) => p.day === dayItem.day);
        if (!prev) return dayItem;
        return {
          ...dayItem,
          partner1: {
            am: { ...prev.partner1.am },
            pm: { ...prev.partner1.pm },
          },
          partner2: {
            am: { ...prev.partner2.am },
            pm: { ...prev.partner2.pm },
          },
          weekendVibes: prev.weekendVibes ? { ...prev.weekendVibes } : dayItem.weekendVibes,
        };
      })
    );
    setWizardStep('plan_days');
    playChime('success');
  };

  // Choice 2: Start from scratch (blank slate)
  const handleStartFromScratch = () => {
    setLocalSchedule((current) =>
      current.map((dayItem) => ({
        ...dayItem,
        partner1: {
          am: { activity: '', workLocation: 'wfh', wolfyDuty: false },
          pm: { activity: '', workLocation: 'wfh', wolfyDuty: false },
        },
        partner2: {
          am: { activity: '', workLocation: 'office', wolfyDuty: false },
          pm: { activity: '', workLocation: 'wfh', wolfyDuty: false },
        },
        dinner: {
          type: 'together',
          cook: 'partner1',
          mealName: '',
          tags: [],
        },
      }))
    );
    setWizardStep('plan_days');
    playChime('success');
  };

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

  const handleFinishWizard = () => {
    localSchedule.forEach((d) => {
      saveFullDayRoutine(d.day, d.partner1.am, d.partner1.pm, d.partner2.am, d.partner2.pm, d.dinner);
    });
    archiveCurrentWeekAsPrevious();
    playChime('sunday');
    setIsSundayWizardOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#171413] border-t sm:border border-stone-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-stone-100">
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-stone-950/80 border-b border-stone-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <WolfyAvatar size="sm" mood="happy" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-stone-100 font-serif">
                  Sunday Check-in
                </h3>
                {hasCompletedFirstWeek && (
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                    2nd Run
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400">
                {settings.sundayReminderTime} • Rough weekly agenda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {wizardStep === 'plan_days' && hasCompletedFirstWeek && (
              <button
                onClick={() => setWizardStep('choose_mode')}
                className="text-[11px] text-stone-400 hover:text-amber-300 px-2 py-1 rounded-lg bg-stone-900 border border-stone-800"
                title="Change pre-populate mode"
              >
                Change Mode
              </button>
            )}
            <button
              onClick={() => setIsSundayWizardOpen(false)}
              className="p-1 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= STEP 1: CHOOSE PRE-POPULATE VS SCRATCH (2nd run) ================= */}
        {wizardStep === 'choose_mode' ? (
          <div className="p-5 sm:p-6 space-y-5 text-center flex-1 overflow-y-auto">
            <div className="pt-2">
              <h4 className="text-lg sm:text-xl font-serif font-bold text-amber-100">
                Plan the Week Ahead
              </h4>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Choose how to set up {p1.name} & {p2.name}'s weekly agenda:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 max-w-md mx-auto pt-1">
              {/* Option 1: Pre-populate from Previous Week */}
              <button
                onClick={handlePrePopulateFromLastWeek}
                className="p-4 rounded-2xl bg-stone-900/80 hover:bg-stone-850 border border-amber-600/40 text-left transition-all group shadow-sm hover:border-amber-500 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-stone-100 group-hover:text-amber-200 transition-colors flex items-center justify-between">
                      <span>Pre-populate from Last Week</span>
                      <ArrowRight className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h5>
                    <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                      Copies your previous AM/PM work locations & activity routine so you only adjust what's different.
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 2: Start from Scratch */}
              <button
                onClick={handleStartFromScratch}
                className="p-4 rounded-2xl bg-stone-900/40 hover:bg-stone-900/80 border border-stone-800 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-stone-800 text-stone-400 border border-stone-700/60 group-hover:scale-105 transition-transform shrink-0">
                    <FileEdit className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-stone-200 group-hover:text-stone-100 transition-colors flex items-center justify-between">
                      <span>Start from Scratch</span>
                      <ArrowRight className="w-4 h-4 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h5>
                    <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                      Start with a clean blank canvas for both partners this week.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* ================= STEP 2: DAY-BY-DAY ZEN PLANNER ================= */
          <>
            {/* Day Ribbons */}
            <div className="px-4 py-2 bg-stone-950/60 border-b border-stone-800/80 flex items-center justify-between overflow-x-auto gap-1 scrollbar-none">
              {localSchedule.map((d, idx) => {
                const isActive = idx === currentDayIndex;
                return (
                  <button
                    key={d.day}
                    onClick={() => setCurrentDayIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                    }`}
                  >
                    {d.shortLabel}
                  </button>
                );
              })}
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-stone-100 font-serif">
                  {currentDay.dayLabel}
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartFromScratch}
                    className="text-[11px] text-stone-500 hover:text-stone-300"
                    title="Clear today's blocks"
                  >
                    Clear
                  </button>
                  <span className="text-xs text-stone-500">
                    {currentDayIndex + 1} of 7
                  </span>
                </div>
              </div>

              {/* Partner 1 AM/PM */}
              <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${p1.avatarBg}`} />
                    {p1.name}
                  </span>
                  <label className="flex items-center gap-1 text-[11px] text-stone-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!currentDay.partner1.am.wolfyDuty}
                      onChange={(e) => updateCurrentDayP1('am', 'wolfyDuty', e.target.checked)}
                      className="rounded text-amber-500 bg-stone-800 border-stone-700"
                    />
                    <PawPrint className="w-3 h-3 text-amber-400" />
                    <span>Wolfy walk</span>
                  </label>
                </div>

                {/* AM */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] text-stone-400">
                    <Sun className="w-3 h-3 text-amber-400" />
                    <span>AM</span>
                  </div>
                  <input
                    type="text"
                    value={currentDay.partner1.am.activity}
                    onChange={(e) => updateCurrentDayP1('am', 'activity', e.target.value)}
                    placeholder="e.g. Gym & WFH"
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 focus:border-amber-500 focus:outline-hidden"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {COMMON_AM_CHIPS.slice(0, 4).map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => updateCurrentDayP1('am', 'activity', chip)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800/80 text-stone-400 hover:text-stone-200"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PM */}
                <div className="pt-1">
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] text-stone-400">
                    <Moon className="w-3 h-3 text-indigo-400" />
                    <span>PM</span>
                  </div>
                  <input
                    type="text"
                    value={currentDay.partner1.pm.activity}
                    onChange={(e) => updateCurrentDayP1('pm', 'activity', e.target.value)}
                    placeholder="e.g. Out with workmates"
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 focus:border-amber-500 focus:outline-hidden"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {COMMON_PM_CHIPS.slice(0, 4).map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => updateCurrentDayP1('pm', 'activity', chip)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800/80 text-stone-400 hover:text-stone-200"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Partner 2 AM/PM */}
              <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${p2.avatarBg}`} />
                    {p2.name}
                  </span>
                  <label className="flex items-center gap-1 text-[11px] text-stone-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!currentDay.partner2.am.wolfyDuty}
                      onChange={(e) => updateCurrentDayP2('am', 'wolfyDuty', e.target.checked)}
                      className="rounded text-emerald-500 bg-stone-800 border-stone-700"
                    />
                    <PawPrint className="w-3 h-3 text-emerald-400" />
                    <span>Wolfy walk</span>
                  </label>
                </div>

                {/* AM */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] text-stone-400">
                    <Sun className="w-3 h-3 text-amber-400" />
                    <span>AM</span>
                  </div>
                  <input
                    type="text"
                    value={currentDay.partner2.am.activity}
                    onChange={(e) => updateCurrentDayP2('am', 'activity', e.target.value)}
                    placeholder="e.g. Office"
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 focus:border-amber-500 focus:outline-hidden"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {COMMON_AM_CHIPS.slice(0, 4).map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => updateCurrentDayP2('am', 'activity', chip)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800/80 text-stone-400 hover:text-stone-200"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PM */}
                <div className="pt-1">
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] text-stone-400">
                    <Moon className="w-3 h-3 text-indigo-400" />
                    <span>PM</span>
                  </div>
                  <input
                    type="text"
                    value={currentDay.partner2.pm.activity}
                    onChange={(e) => updateCurrentDayP2('pm', 'activity', e.target.value)}
                    placeholder="e.g. Home / Pilates"
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 focus:border-amber-500 focus:outline-hidden"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {COMMON_PM_CHIPS.slice(0, 4).map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => updateCurrentDayP2('pm', 'activity', chip)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800/80 text-stone-400 hover:text-stone-200"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dinner Section */}
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-900/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-amber-400" /> Dinner
                  </span>

                  <div className="flex items-center gap-1 bg-stone-950 p-0.5 rounded-lg border border-stone-800">
                    <button
                      type="button"
                      onClick={() => updateCurrentDayDinner({ type: 'together' })}
                      className={`px-2 py-0.5 text-[11px] rounded-md font-medium transition-colors ${
                        currentDay.dinner.type === 'together'
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'text-stone-400'
                      }`}
                    >
                      Together
                    </button>
                    <button
                      type="button"
                      onClick={() => updateCurrentDayDinner({ type: 'separate' })}
                      className={`px-2 py-0.5 text-[11px] rounded-md font-medium transition-colors ${
                        currentDay.dinner.type === 'separate'
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'text-stone-400'
                      }`}
                    >
                      Own Dinners
                    </button>
                  </div>
                </div>

                {currentDay.dinner.type === 'together' ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {[
                        { id: 'partner1', label: p1.shortName },
                        { id: 'partner2', label: p2.shortName },
                        { id: 'both', label: 'Both' },
                        { id: 'takeaway', label: 'Takeaway' },
                        { id: 'eating_out', label: 'Out' },
                      ].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => updateCurrentDayDinner({ cook: c.id as CookAssignment })}
                          className={`py-1 px-2.5 rounded-lg text-xs border transition-colors ${
                            currentDay.dinner.cook === c.id
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                              : 'bg-stone-900 text-stone-400 border-stone-800'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={currentDay.dinner.mealName}
                      onChange={(e) => updateCurrentDayDinner({ mealName: e.target.value })}
                      placeholder="Dish name (e.g. Salmon, Curry, Pasta)"
                      className="w-full px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    <input
                      type="text"
                      value={currentDay.dinner.partner1OwnDinner || ''}
                      onChange={(e) => updateCurrentDayDinner({ partner1OwnDinner: e.target.value })}
                      placeholder={`${p1.name}'s dinner`}
                      className="w-full px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200"
                    />
                    <input
                      type="text"
                      value={currentDay.dinner.partner2OwnDinner || ''}
                      onChange={(e) => updateCurrentDayDinner({ partner2OwnDinner: e.target.value })}
                      placeholder={`${p2.name}'s dinner`}
                      className="w-full px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-stone-950/90 border-t border-stone-800/80 flex items-center justify-between">
              <button
                onClick={() => setCurrentDayIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentDayIndex === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs text-stone-400 disabled:opacity-30 hover:bg-stone-800"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              {currentDayIndex < localSchedule.length - 1 ? (
                <button
                  onClick={() => setCurrentDayIndex((prev) => prev + 1)}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs"
                >
                  <span>Next: {localSchedule[currentDayIndex + 1]?.shortLabel}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinishWizard}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Week</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
