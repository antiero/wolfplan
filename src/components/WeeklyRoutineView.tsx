import React, { useState } from 'react';
import { useWolfy } from '../context/WolfyContext';
import { WeekendVibesCard } from './WeekendVibesCard';
import { SundayPromptBanner } from './SundayPromptBanner';
import { EditBlockModal } from './EditBlockModal';
import { WolfyAvatar } from './WolfyAvatar';
import {
  DayOfWeek,
  PartnerId,
  ScheduleBlock,
  WorkLocation,
} from '../types';
import {
  Sun,
  Moon,
  Laptop,
  Building,
  Plane,
  Sparkles,
  PawPrint,
  Utensils,
  ChevronRight,
  Plus,
  Edit2,
  Calendar,
  Layers,
  HeartHandshake,
} from 'lucide-react';

export const WeeklyRoutineView: React.FC = () => {
  const {
    schedule,
    selectedDay,
    setSelectedDay,
    settings,
    activeUser,
    setActiveTab,
    setSelectedRecipeModal,
    recipes,
  } = useWolfy();

  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [editingBlock, setEditingBlock] = useState<{
    day: DayOfWeek;
    partnerId: PartnerId;
    period: 'am' | 'pm';
    block: ScheduleBlock;
  } | null>(null);

  const currentDayData = schedule.find((d) => d.day === selectedDay) || schedule[0];
  const p1 = settings.partner1;
  const p2 = settings.partner2;

  const getLocationBadge = (loc?: WorkLocation) => {
    switch (loc) {
      case 'wfh':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-sky-950/60 text-sky-300 border border-sky-800/60 px-1.5 py-0.5 rounded-md">
            <Laptop className="w-3 h-3" /> WFH
          </span>
        );
      case 'office':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 px-1.5 py-0.5 rounded-md">
            <Building className="w-3 h-3" /> Office
          </span>
        );
      case 'travel':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/60 px-1.5 py-0.5 rounded-md">
            <Plane className="w-3 h-3" /> Travel
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded-md">
            <Sun className="w-3 h-3 text-amber-400" /> Free / Off
          </span>
        );
    }
  };

  const getCookLabel = (cook: string) => {
    if (cook === 'partner1') return `${p1.name} cooking`;
    if (cook === 'partner2') return `${p2.name} cooking`;
    if (cook === 'both') return `Both cooking together 💕`;
    if (cook === 'takeaway') return `Takeaway / Delivery 🥡`;
    if (cook === 'eating_out') return `Eating out 🍷`;
    return `Leftovers 🍲`;
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Sunday Prompt Banner */}
      <SundayPromptBanner />

      {/* Week Day Selector & View Mode Switcher */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-2.5 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Day Pills */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {schedule.map((dayItem) => {
            const isSelected = dayItem.day === selectedDay;
            // Quick status highlights
            const hasWolfy = dayItem.partner1.am.wolfyDuty || dayItem.partner2.am.wolfyDuty;
            return (
              <button
                key={dayItem.day}
                onClick={() => {
                  setSelectedDay(dayItem.day);
                  setViewMode('day');
                }}
                className={`relative px-3 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center min-w-[50px] shrink-0 ${
                  isSelected && viewMode === 'day'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 scale-102'
                    : 'bg-stone-950/50 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <span className="uppercase text-[11px]">{dayItem.shortLabel}</span>
                <span className="text-[10px] font-normal opacity-80">{dayItem.dateStr.split(' ')[1]}</span>
                {hasWolfy && (
                  <span className="absolute -top-1 -right-0.5 text-[9px]">🐾</span>
                )}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 self-end sm:self-auto bg-stone-950 p-1 rounded-xl border border-stone-800 shrink-0">
          <button
            onClick={() => setViewMode('day')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'day'
                ? 'bg-stone-800 text-amber-200 shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Day View</span>
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'week'
                ? 'bg-stone-800 text-amber-200 shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full Week</span>
          </button>
        </div>
      </div>

      {viewMode === 'day' ? (
        /* ================= SINGLE DAY VIEW ================= */
        <div className="space-y-4">
          
          {/* Day Title & Quick Summary Header */}
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-100 font-serif flex items-center gap-2">
                <span>{currentDayData.dayLabel}</span>
                <span className="text-sm font-sans font-medium text-amber-400">
                  {currentDayData.dateStr}
                </span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Rough daily routine & dinner plan
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Wolfy Walker indicator */}
              {(currentDayData.partner1.am.wolfyDuty || currentDayData.partner2.am.wolfyDuty) && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/40 text-[11px] text-amber-300 font-medium">
                  <WolfyAvatar size="sm" mood="walkies" />
                  <span>
                    Wolfy Walk: {currentDayData.partner1.am.wolfyDuty ? p1.name : p2.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Weekend Vibes Mode Banner & Card (For Saturday & Sunday) */}
          {(currentDayData.day === 'saturday' || currentDayData.day === 'sunday') && (
            <WeekendVibesCard day={currentDayData.day} dateStr={currentDayData.dateStr} />
          )}

          {/* Two Partners Grid (Side-by-Side on Tablet/Desktop, Stacked/Swipeable on Mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* PARTNER 1 CARD */}
            <div className={`bg-stone-900 border rounded-2xl p-4 sm:p-5 shadow-lg transition-all ${
              activeUser === 'partner1' ? 'border-amber-600/60 ring-1 ring-amber-500/20' : 'border-stone-800'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2.5">
                  <span className={`w-8 h-8 rounded-full ${p1.avatarBg} text-white font-bold flex items-center justify-center text-xs shadow-xs`}>
                    {p1.shortName.charAt(0)}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-stone-100 flex items-center gap-1.5">
                      <span>{p1.name}</span>
                      {activeUser === 'partner1' && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-500/40 font-medium">
                          You
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-stone-400">Partner 1 Schedule</p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setEditingBlock({
                      day: currentDayData.day,
                      partnerId: 'partner1',
                      period: 'am',
                      block: currentDayData.partner1.am,
                    })
                  }
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-300 text-xs flex items-center gap-1 transition-colors"
                  title="Edit schedule"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium hidden sm:inline">Edit</span>
                </button>
              </div>

              {/* AM Block */}
              <div
                onClick={() =>
                  setEditingBlock({
                    day: currentDayData.day,
                    partnerId: 'partner1',
                    period: 'am',
                    block: currentDayData.partner1.am,
                  })
                }
                className="mt-3.5 p-3.5 rounded-xl bg-stone-950/60 hover:bg-stone-950/90 border border-stone-800/80 hover:border-amber-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-400" /> AM Routine
                  </span>
                  <div className="flex items-center gap-1.5">
                    {getLocationBadge(currentDayData.partner1.am.workLocation)}
                    {currentDayData.partner1.am.wolfyDuty && (
                      <span className="text-[10px] font-semibold bg-amber-900/40 text-amber-300 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <PawPrint className="w-3 h-3" /> Walk Duty
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-stone-200 group-hover:text-amber-100 transition-colors">
                  {currentDayData.partner1.am.activity || 'Flexible / No plan set'}
                </p>

                {currentDayData.partner1.am.notes && (
                  <p className="text-xs text-stone-400 mt-1 italic">
                    "{currentDayData.partner1.am.notes}"
                  </p>
                )}
              </div>

              {/* PM Block */}
              <div
                onClick={() =>
                  setEditingBlock({
                    day: currentDayData.day,
                    partnerId: 'partner1',
                    period: 'pm',
                    block: currentDayData.partner1.pm,
                  })
                }
                className="mt-3 p-3.5 rounded-xl bg-stone-950/60 hover:bg-stone-950/90 border border-stone-800/80 hover:border-amber-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" /> PM Routine
                  </span>
                  <div className="flex items-center gap-1.5">
                    {getLocationBadge(currentDayData.partner1.pm.workLocation)}
                    {currentDayData.partner1.pm.wolfyDuty && (
                      <span className="text-[10px] font-semibold bg-amber-900/40 text-amber-300 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <PawPrint className="w-3 h-3" /> Walk Duty
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-stone-200 group-hover:text-amber-100 transition-colors">
                  {currentDayData.partner1.pm.activity || 'Flexible / No plan set'}
                </p>

                {currentDayData.partner1.pm.notes && (
                  <p className="text-xs text-stone-400 mt-1 italic">
                    "{currentDayData.partner1.pm.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* PARTNER 2 CARD */}
            <div className={`bg-stone-900 border rounded-2xl p-4 sm:p-5 shadow-lg transition-all ${
              activeUser === 'partner2' ? 'border-emerald-600/60 ring-1 ring-emerald-500/20' : 'border-stone-800'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2.5">
                  <span className={`w-8 h-8 rounded-full ${p2.avatarBg} text-white font-bold flex items-center justify-center text-xs shadow-xs`}>
                    {p2.shortName.charAt(0)}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-stone-100 flex items-center gap-1.5">
                      <span>{p2.name}</span>
                      {activeUser === 'partner2' && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-500/40 font-medium">
                          You
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-stone-400">Partner 2 Schedule</p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setEditingBlock({
                      day: currentDayData.day,
                      partnerId: 'partner2',
                      period: 'am',
                      block: currentDayData.partner2.am,
                    })
                  }
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-emerald-300 text-xs flex items-center gap-1 transition-colors"
                  title="Edit schedule"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium hidden sm:inline">Edit</span>
                </button>
              </div>

              {/* AM Block */}
              <div
                onClick={() =>
                  setEditingBlock({
                    day: currentDayData.day,
                    partnerId: 'partner2',
                    period: 'am',
                    block: currentDayData.partner2.am,
                  })
                }
                className="mt-3.5 p-3.5 rounded-xl bg-stone-950/60 hover:bg-stone-950/90 border border-stone-800/80 hover:border-emerald-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-400" /> AM Routine
                  </span>
                  <div className="flex items-center gap-1.5">
                    {getLocationBadge(currentDayData.partner2.am.workLocation)}
                    {currentDayData.partner2.am.wolfyDuty && (
                      <span className="text-[10px] font-semibold bg-amber-900/40 text-amber-300 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <PawPrint className="w-3 h-3" /> Walk Duty
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-stone-200 group-hover:text-emerald-100 transition-colors">
                  {currentDayData.partner2.am.activity || 'Flexible / No plan set'}
                </p>

                {currentDayData.partner2.am.notes && (
                  <p className="text-xs text-stone-400 mt-1 italic">
                    "{currentDayData.partner2.am.notes}"
                  </p>
                )}
              </div>

              {/* PM Block */}
              <div
                onClick={() =>
                  setEditingBlock({
                    day: currentDayData.day,
                    partnerId: 'partner2',
                    period: 'pm',
                    block: currentDayData.partner2.pm,
                  })
                }
                className="mt-3 p-3.5 rounded-xl bg-stone-950/60 hover:bg-stone-950/90 border border-stone-800/80 hover:border-emerald-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" /> PM Routine
                  </span>
                  <div className="flex items-center gap-1.5">
                    {getLocationBadge(currentDayData.partner2.pm.workLocation)}
                    {currentDayData.partner2.pm.wolfyDuty && (
                      <span className="text-[10px] font-semibold bg-amber-900/40 text-amber-300 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <PawPrint className="w-3 h-3" /> Walk Duty
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-stone-200 group-hover:text-emerald-100 transition-colors">
                  {currentDayData.partner2.pm.activity || 'Flexible / No plan set'}
                </p>

                {currentDayData.partner2.pm.notes && (
                  <p className="text-xs text-stone-400 mt-1 italic">
                    "{currentDayData.partner2.pm.notes}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* DAILY DINNER MEAL PLAN SNAPSHOT CARD */}
          <div className="bg-gradient-to-br from-stone-900 via-amber-950/30 to-stone-900 border border-amber-900/40 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-400">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-amber-200 font-serif">
                    Tonight's Dinner Plan
                  </h3>
                  <p className="text-xs text-stone-400">
                    {currentDayData.dinner.type === 'together' ? 'Eating Together' : 'Separate / Own Dinners'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('dinners')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-amber-300 transition-colors"
              >
                <span>Full Dinner Plan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3.5">
              {currentDayData.dinner.type === 'together' ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-950/60 rounded-xl p-3.5 border border-stone-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800/40">
                        {getCookLabel(currentDayData.dinner.cook)}
                      </span>
                      {currentDayData.dinner.tags?.map((t) => (
                        <span key={t} className="text-[10px] text-stone-400 bg-stone-800 px-1.5 py-0.5 rounded-md">
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm sm:text-base font-bold text-stone-100">
                      {currentDayData.dinner.mealName}
                    </p>
                    {currentDayData.dinner.recipeNotes && (
                      <p className="text-xs text-stone-400 mt-1 italic">
                        {currentDayData.dinner.recipeNotes}
                      </p>
                    )}
                  </div>

                  {currentDayData.dinner.recipeId && (
                    <button
                      onClick={() => {
                        const rec = recipes.find((r) => r.id === currentDayData.dinner.recipeId);
                        if (rec) setSelectedRecipeModal(rec);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40 text-xs font-bold transition-colors shrink-0 self-start sm:self-center"
                    >
                      📖 View Recipe & Ingredients
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800">
                    <span className="text-[11px] font-bold text-amber-400 block mb-0.5">
                      {p1.name}'s Dinner:
                    </span>
                    <p className="text-xs font-medium text-stone-200">
                      {currentDayData.dinner.partner1OwnDinner || 'Solo meal / fend for self'}
                    </p>
                  </div>
                  <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800">
                    <span className="text-[11px] font-bold text-emerald-400 block mb-0.5">
                      {p2.name}'s Dinner:
                    </span>
                    <p className="text-xs font-medium text-stone-200">
                      {currentDayData.dinner.partner2OwnDinner || 'Solo meal / fend for self'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================= FULL WEEK MATRIX VIEW ================= */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-lg text-amber-100 font-serif">
              Week Overview: {p1.name} & {p2.name}
            </h3>
            <span className="text-xs text-stone-400">All 7 days at a glance</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {schedule.map((dayItem) => {
              const isSelected = dayItem.day === selectedDay;
              return (
                <div
                  key={dayItem.day}
                  onClick={() => {
                    setSelectedDay(dayItem.day);
                    setViewMode('day');
                  }}
                  className={`bg-stone-900 border rounded-2xl p-3 shadow-md hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected ? 'border-amber-500/60 ring-1 ring-amber-500/20' : 'border-stone-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                      <span className="font-bold text-xs text-amber-200 font-serif">
                        {dayItem.shortLabel}
                      </span>
                      <span className="text-[10px] text-stone-400">{dayItem.dateStr}</span>
                    </div>

                    {/* Partner 1 mini block */}
                    <div className="mt-2 text-[11px] space-y-1">
                      <div className="flex items-center gap-1 font-semibold text-amber-300">
                        <span className={`w-3.5 h-3.5 rounded-full ${p1.avatarBg} text-[8px] text-white flex items-center justify-center font-bold`}>
                          {p1.shortName.charAt(0)}
                        </span>
                        <span>{p1.shortName}</span>
                      </div>
                      <p className="text-stone-300 text-[10px] truncate" title={dayItem.partner1.am.activity}>
                        🌅 {dayItem.partner1.am.activity || 'Flexible'}
                      </p>
                      <p className="text-stone-400 text-[10px] truncate" title={dayItem.partner1.pm.activity}>
                        🌙 {dayItem.partner1.pm.activity || 'Flexible'}
                      </p>
                    </div>

                    {/* Partner 2 mini block */}
                    <div className="mt-2 pt-2 border-t border-stone-800/60 text-[11px] space-y-1">
                      <div className="flex items-center gap-1 font-semibold text-emerald-300">
                        <span className={`w-3.5 h-3.5 rounded-full ${p2.avatarBg} text-[8px] text-white flex items-center justify-center font-bold`}>
                          {p2.shortName.charAt(0)}
                        </span>
                        <span>{p2.shortName}</span>
                      </div>
                      <p className="text-stone-300 text-[10px] truncate" title={dayItem.partner2.am.activity}>
                        🌅 {dayItem.partner2.am.activity || 'Flexible'}
                      </p>
                      <p className="text-stone-400 text-[10px] truncate" title={dayItem.partner2.pm.activity}>
                        🌙 {dayItem.partner2.pm.activity || 'Flexible'}
                      </p>
                    </div>
                  </div>

                  {/* Dinner mini tag */}
                  <div className="mt-2.5 pt-2 border-t border-amber-950/60 text-[10px] text-stone-300">
                    <span className="font-bold text-amber-400 block truncate">
                      🍽️ {dayItem.dinner.type === 'together' ? dayItem.dinner.mealName : 'Separate Dinners'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inline Block Editor Modal */}
      {editingBlock && (
        <EditBlockModal
          day={editingBlock.day}
          partnerId={editingBlock.partnerId}
          period={editingBlock.period}
          initialBlock={editingBlock.block}
          onClose={() => setEditingBlock(null)}
        />
      )}
    </div>
  );
};
