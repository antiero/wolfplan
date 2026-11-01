import React, { useState } from 'react';
import { useWolfy } from '../context/WolfyContext';
import { WeekendVibesCard } from './WeekendVibesCard';
import { SundayPromptBanner } from './SundayPromptBanner';
import { EditBlockModal } from './EditBlockModal';
import { WolfyAvatar } from './WolfyAvatar';
import { GoogleAuthButton } from './GoogleAuthButton';
import { UserAvatar } from './UserAvatar';
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
  ChevronLeft,
  Edit2,
  Calendar,
  Layers,
  Cloud,
  Upload,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  CheckSquare,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { detectDayClashes } from '../utils/clashDetector';

export const WeeklyRoutineView: React.FC = () => {
  const {
    schedule,
    selectedDay,
    setSelectedDay,
    weekOffset,
    setWeekOffset,
    currentWeekHeader,
    settings,
    activeUser,
    setActiveTab,
    setSelectedRecipeModal,
    recipes,
    authUser,
    googleAccessToken,
    loginWithGoogle,
    setIsCalendarModalOpen,
    populateFromPreviousWeek,
    startFromScratch,
    hasCompletedFirstWeek,
    openAssignTaskModal,
    toggleTaskCompleted,
    deleteTask,
    setWolfyDutyQuick,
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
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-300 bg-sky-950/40 border border-sky-800/40 px-1.5 py-0.2 rounded-md">
            <Laptop className="w-2.5 h-2.5" /> WFH
          </span>
        );
      case 'office':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 px-1.5 py-0.2 rounded-md">
            <Building className="w-2.5 h-2.5" /> Office
          </span>
        );
      case 'travel':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-300 bg-purple-950/40 border border-purple-800/40 px-1.5 py-0.2 rounded-md">
            <Plane className="w-2.5 h-2.5" /> Travel
          </span>
        );
      default:
        return null;
    }
  };

  const p1Short = p1.shortName === 'Alex' ? 'Ant' : (p1.shortName || 'Ant');
  const p2Short = p2.shortName === 'Alex' ? 'Beth' : (p2.shortName || 'Beth');

  const todayDayName = (['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()] || 'monday') as DayOfWeek;

  const getCookLabel = (cook: string) => {
    if (cook === 'partner1') return `${p1Short} cooking`;
    if (cook === 'partner2') return `${p2Short} cooking`;
    if (cook === 'both') return 'Both cooking';
    if (cook === 'takeaway') return 'Takeaway';
    if (cook === 'eating_out') return 'Eating out';
    return 'Leftovers';
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Calm Google Calendar & Cloud Storage Banner (Visible when not logged in) */}
      {!authUser && (
        <div className="bg-[#181514] border border-stone-800 hover:border-amber-500/40 transition-colors rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-stone-200">
                Google Calendar & Cloud Sync
              </p>
              <p className="text-[11px] sm:text-xs text-stone-400">
                Sign in to sync your routines with Google Calendar and safeguard your weekly plan in Firestore.
              </p>
            </div>
          </div>
          <div className="shrink-0 self-start sm:self-center">
            <GoogleAuthButton />
          </div>
        </div>
      )}

      {/* Calm Sunday Check-in Banner */}
      <SundayPromptBanner />

      {/* Week Day Ribbon & Quick Controls (Phone Optimized) */}
      <div className="bg-[#181514] border border-stone-800/80 rounded-2xl p-2.5 sm:p-3 shadow-sm space-y-2.5">
        
        {/* Dynamic Week Header & Navigation */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-800/60 px-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs sm:text-sm font-bold text-amber-200 font-serif">
              {currentWeekHeader}
            </span>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {weekOffset !== 0 ? (
              <button
                onClick={() => setWeekOffset(0)}
                className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors font-medium"
              >
                Jump to This Week
              </button>
            ) : (
              <span className="text-[10px] text-amber-400/90 font-medium px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Active Week
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Day Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-1">
            {schedule.map((dayItem) => {
              const isSelected = dayItem.day === selectedDay;
              const hasWolfy = dayItem.partner1.am.wolfyDuty || dayItem.partner2.am.wolfyDuty;
              const isToday = weekOffset === 0 && dayItem.day === todayDayName;

              return (
                <button
                  key={dayItem.day}
                  onClick={() => {
                    setSelectedDay(dayItem.day);
                    setViewMode('day');
                  }}
                  className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center min-w-[50px] shrink-0 ${
                    isSelected && viewMode === 'day'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                      : isToday
                      ? 'bg-stone-800/80 text-amber-200 border border-amber-500/30'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  <span className="text-[11px] uppercase tracking-wider">{dayItem.shortLabel}</span>
                  <span className="text-[9px] opacity-75">{dayItem.dateStr.split(' ')[1] || dayItem.dateStr}</span>
                  {isToday && (
                    <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-stone-950' : 'bg-amber-400'}`} />
                  )}
                  {hasWolfy && (
                    <span className="absolute top-0.5 right-1 text-[8px]">🐾</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-0.5 bg-stone-950 p-1 rounded-xl border border-stone-800/80 shrink-0">
            <button
              onClick={() => setViewMode('day')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'day' ? 'bg-stone-800 text-amber-200' : 'text-stone-400'
              }`}
              title="Day View"
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'week' ? 'bg-stone-800 text-amber-200' : 'text-stone-400'
              }`}
              title="Week Grid View"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quiet Zen Agenda Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-stone-800/50 text-[11px] text-stone-400">
          <div className="flex items-center gap-2">
            {hasCompletedFirstWeek && (
              <button
                onClick={populateFromPreviousWeek}
                className="flex items-center gap-1 hover:text-amber-300 transition-colors cursor-pointer"
                title="Copy AM/PM routine blocks from previous week"
              >
                <RefreshCw className="w-3 h-3 text-amber-400" />
                <span>Pre-populate Last Week</span>
              </button>
            )}
            <span className="text-stone-600">•</span>
            <button
              onClick={startFromScratch}
              className="hover:text-stone-300 transition-colors cursor-pointer"
              title="Clear routine to blank template"
            >
              Start from Scratch
            </button>
          </div>

          {/* Google Calendar quick status */}
          <div>
            {authUser ? (
              <button
                onClick={() => setIsCalendarModalOpen(true)}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span>Calendar Sync</span>
              </button>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="flex items-center gap-1 text-stone-400 hover:text-stone-200 transition-colors"
              >
                <span>+ Google Calendar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'day' ? (
        /* ================= SINGLE DAY VIEW ================= */
        <div className="space-y-3.5">
          
          {/* Day Title */}
          <div className="flex items-center justify-between px-1 pt-1">
            <h2 className="text-lg sm:text-xl font-bold text-stone-100 font-serif flex items-center gap-2">
              <span>{currentDayData.dayLabel}</span>
              <span className="text-xs font-sans font-normal text-amber-400">
                {currentDayData.dateStr}
              </span>
            </h2>

            {/* Wolfy Walker indicator */}
            {(currentDayData.partner1.am.wolfyDuty || currentDayData.partner2.am.wolfyDuty) && (
              <span className="text-[11px] text-amber-300/90 flex items-center gap-1 font-medium bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-900/40">
                <PawPrint className="w-3 h-3" />
                <span>Walk: {currentDayData.partner1.am.wolfyDuty ? p1.shortName : p2.shortName}</span>
              </span>
            )}
          </div>

          {/* Weekend Vibes Mode Card (Saturday & Sunday) */}
          {(currentDayData.day === 'saturday' || currentDayData.day === 'sunday') && (
            <WeekendVibesCard day={currentDayData.day} dateStr={currentDayData.dateStr} />
          )}

          {/* Intelligent Clash & Wolfy Care Detector Banner */}
          {(() => {
            const dayClashes = detectDayClashes(currentDayData, settings);
            if (dayClashes.length === 0) return null;
            return (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-stone-900 to-amber-950/30 border border-rose-800/60 shadow-md space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    </div>
                    <span className="text-xs font-bold text-rose-200">
                      Schedule Conflict Alert
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-300/80 font-medium">
                    🐾 Wolfy Duty Reminder
                  </span>
                </div>

                {dayClashes.map((clash) => (
                  <div key={clash.id} className="text-xs text-stone-200 pl-8 space-y-2">
                    <p className="font-semibold text-rose-200 leading-relaxed">
                      {clash.message}
                    </p>
                    {clash.type === 'wolfy_uncovered' && (
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="text-[11px] text-stone-400">1-click assign:</span>
                        <button
                          onClick={() => setWolfyDutyQuick(currentDayData.day, 'partner1', clash.period)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                        >
                          <PawPrint className="w-3.5 h-3.5" />
                          <span>{p1Short} has Wolfy</span>
                        </button>
                        <button
                          onClick={() => setWolfyDutyQuick(currentDayData.day, 'partner2', clash.period)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                        >
                          <PawPrint className="w-3.5 h-3.5" />
                          <span>{p2Short} has Wolfy</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Side-by-side or stacked Partner cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* PARTNER 1 */}
            <div className={`bg-[#181514] border rounded-2xl p-3.5 sm:p-4 transition-all ${
              activeUser === 'partner1' ? 'border-amber-600/40 ring-1 ring-amber-500/10' : 'border-stone-800/80'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-stone-800/60">
                <div className="flex items-center gap-2">
                  <UserAvatar profile={p1} size="sm" />
                  <span className="font-bold text-xs sm:text-sm text-stone-200">
                    {p1.name}
                  </span>
                  {activeUser === 'partner1' && (
                    <span className="text-[9px] bg-amber-500/15 text-amber-300 px-1.5 py-0.2 rounded-full font-medium">
                      You
                    </span>
                  )}
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
                  className="p-1 text-stone-400 hover:text-amber-300"
                  title="Edit schedule"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>

              {/* Daytime Block */}
              <div
                onClick={() =>
                  setEditingBlock({
                    day: currentDayData.day,
                    partnerId: 'partner1',
                    period: 'am',
                    block: currentDayData.partner1.am,
                  })
                }
                className="mt-2.5 p-2.5 rounded-xl bg-stone-950/50 hover:bg-stone-950/80 border border-stone-800/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" /> Daytime
                  </span>
                  <div className="flex items-center gap-1">
                    {getLocationBadge(currentDayData.partner1.am.workLocation)}
                    {currentDayData.partner1.am.wolfyDuty && (
                      <span className="text-[9px] text-amber-300 bg-amber-900/30 px-1 rounded-sm">
                        🐾 Walk
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs font-medium text-stone-200 group-hover:text-amber-100 transition-colors">
                  {currentDayData.partner1.am.activity || '—'}
                </p>

                {/* Timed Activities */}
                {currentDayData.partner1.am.timedActivities && currentDayData.partner1.am.timedActivities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pt-1.5 border-t border-stone-800/60">
                    {currentDayData.partner1.am.timedActivities.map((act) => (
                      <span
                        key={act.id}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-800/40 text-amber-200 font-medium"
                      >
                        <Clock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                        <strong>{act.time}:</strong> {act.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Evening Block */}
              <div
                onClick={() =>
                  setEditingBlock({
                    day: currentDayData.day,
                    partnerId: 'partner1',
                    period: 'pm',
                    block: currentDayData.partner1.pm,
                  })
                }
                className="mt-2 p-2.5 rounded-xl bg-stone-950/50 hover:bg-stone-950/80 border border-stone-800/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-indigo-300 flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" /> Evening
                  </span>
                  {getLocationBadge(currentDayData.partner1.pm.workLocation)}
                </div>

                <p className="text-xs font-medium text-stone-200 group-hover:text-amber-100 transition-colors">
                  {currentDayData.partner1.pm.activity || '—'}
                </p>

                {/* Timed Activities */}
                {currentDayData.partner1.pm.timedActivities && currentDayData.partner1.pm.timedActivities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pt-1.5 border-t border-stone-800/60">
                    {currentDayData.partner1.pm.timedActivities.map((act) => (
                      <span
                        key={act.id}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-800/40 text-indigo-200 font-medium"
                      >
                        <Clock className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                        <strong>{act.time}:</strong> {act.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* PARTNER 2 */}
            <div className={`bg-[#181514] border rounded-2xl p-3.5 sm:p-4 transition-all ${
              activeUser === 'partner2' ? 'border-emerald-600/40 ring-1 ring-emerald-500/10' : 'border-stone-800/80'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-stone-800/60">
                <div className="flex items-center gap-2">
                  <UserAvatar profile={p2} name={p2Short} size="sm" />
                  <span className="font-bold text-xs sm:text-sm text-stone-200">
                    {p2.name === 'Alex' ? 'Beth' : (p2.name || 'Beth')}
                  </span>
                  {activeUser === 'partner2' && (
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.2 rounded-full font-medium">
                      You
                    </span>
                  )}
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
                  className="p-1 text-stone-400 hover:text-emerald-300"
                  title="Edit schedule"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>

              {/* Daytime Block */}
              <div
                onClick={() =>
                  setEditingBlock({
                    day: currentDayData.day,
                    partnerId: 'partner2',
                    period: 'am',
                    block: currentDayData.partner2.am,
                  })
                }
                className="mt-2.5 p-2.5 rounded-xl bg-stone-950/50 hover:bg-stone-950/80 border border-stone-800/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" /> Daytime
                  </span>
                  <div className="flex items-center gap-1">
                    {getLocationBadge(currentDayData.partner2.am.workLocation)}
                    {currentDayData.partner2.am.wolfyDuty && (
                      <span className="text-[9px] text-amber-300 bg-amber-900/30 px-1 rounded-sm">
                        🐾 Walk
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs font-medium text-stone-200 group-hover:text-emerald-100 transition-colors">
                  {currentDayData.partner2.am.activity || '—'}
                </p>

                {/* Timed Activities */}
                {currentDayData.partner2.am.timedActivities && currentDayData.partner2.am.timedActivities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pt-1.5 border-t border-stone-800/60">
                    {currentDayData.partner2.am.timedActivities.map((act) => (
                      <span
                        key={act.id}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-800/40 text-amber-200 font-medium"
                      >
                        <Clock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                        <strong>{act.time}:</strong> {act.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Evening Block */}
              <div
                onClick={() =>
                  setEditingBlock({
                    day: currentDayData.day,
                    partnerId: 'partner2',
                    period: 'pm',
                    block: currentDayData.partner2.pm,
                  })
                }
                className="mt-2 p-2.5 rounded-xl bg-stone-950/50 hover:bg-stone-950/80 border border-stone-800/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-indigo-300 flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" /> Evening
                  </span>
                  {getLocationBadge(currentDayData.partner2.pm.workLocation)}
                </div>

                <p className="text-xs font-medium text-stone-200 group-hover:text-emerald-100 transition-colors">
                  {currentDayData.partner2.pm.activity || '—'}
                </p>

                {/* Timed Activities */}
                {currentDayData.partner2.pm.timedActivities && currentDayData.partner2.pm.timedActivities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pt-1.5 border-t border-stone-800/60">
                    {currentDayData.partner2.pm.timedActivities.map((act) => (
                      <span
                        key={act.id}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-800/40 text-indigo-200 font-medium"
                      >
                        <Clock className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                        <strong>{act.time}:</strong> {act.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Calm Dinner Snapshot */}
          <div className="bg-[#181514] border border-stone-800/80 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-1.5 rounded-lg bg-amber-950/40 text-amber-400 shrink-0">
                <Utensils className="w-3.5 h-3.5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-stone-400 font-medium">Tonight:</span>
                  <span className="text-xs font-semibold text-stone-200 truncate">
                    {currentDayData.dinner.type === 'together'
                      ? currentDayData.dinner.mealName || 'Dinner'
                      : 'Own Dinners'}
                  </span>
                </div>
                {currentDayData.dinner.type === 'together' && (
                  <span className="text-[10px] text-amber-400/90 font-medium">
                    {getCookLabel(currentDayData.dinner.cook)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {currentDayData.dinner.recipeId && (
                <button
                  onClick={() => {
                    const rec = recipes.find((r) => r.id === currentDayData.dinner.recipeId);
                    if (rec) setSelectedRecipeModal(rec);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-[11px] text-amber-300 border border-stone-800 font-medium"
                >
                  Recipe
                </button>
              )}
              <button
                onClick={() => setActiveTab('dinners')}
                className="p-1 text-stone-400 hover:text-stone-200"
                title="View Dinners"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Assigned Tasks & Responsibilities for Today */}
          <div className="bg-[#181514] border border-stone-800/80 rounded-2xl p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-200">
                    Tasks & Errands for {currentDayData.dayLabel}
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    {(currentDayData.assignedTasks || []).filter((t) => !t.completed).length} pending • Assigned couple responsibilities
                  </p>
                </div>
              </div>

              <button
                onClick={() => openAssignTaskModal(currentDayData.day)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign Task</span>
              </button>
            </div>

            {(!currentDayData.assignedTasks || currentDayData.assignedTasks.length === 0) ? (
              <div className="text-center py-4 px-3 rounded-xl bg-stone-950/40 border border-stone-800/40">
                <p className="text-xs text-stone-400">
                  No specific tasks assigned for {currentDayData.dayLabel} yet.
                </p>
                <button
                  onClick={() => openAssignTaskModal(currentDayData.day)}
                  className="mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Assign an errand (e.g. 4pm pick up child from school, defrost chicken)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {currentDayData.assignedTasks.map((task) => {
                  const isAssignedToMe = task.assignedTo === activeUser;
                  const assignee = task.assignedTo === 'partner1' ? p1 : p2;
                  const assigner = task.assignedBy === 'partner1' ? p1 : p2;
                  const assigneeName = assignee.name === 'Alex' ? (task.assignedTo === 'partner1' ? 'Antony' : 'Beth') : assignee.name;
                  const assignerName = assigner.name === 'Alex' ? (task.assignedBy === 'partner1' ? 'Antony' : 'Beth') : assigner.name;

                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        task.completed
                          ? 'bg-stone-950/40 border-stone-800/40 opacity-60'
                          : 'bg-stone-950/80 border-stone-800/80 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleTaskCompleted(currentDayData.day, task.id)}
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                            task.completed
                              ? 'bg-emerald-500 border-emerald-400 text-stone-950'
                              : 'border-stone-600 hover:border-amber-400 bg-stone-900'
                          }`}
                          title={task.completed ? 'Mark as incomplete' : 'Mark as done'}
                        >
                          {task.completed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-xs sm:text-sm font-semibold truncate ${
                              task.completed ? 'line-through text-stone-500' : 'text-stone-100'
                            }`}>
                              {task.title}
                            </p>
                            {task.time && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold shrink-0 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{task.time}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <UserAvatar profile={assignee} size="xs" />
                              <span className="font-medium text-stone-300">
                                {isAssignedToMe ? 'Assigned to you' : `For ${assigneeName}`}
                              </span>
                            </span>
                            <span>•</span>
                            <span>From {assignerName}</span>
                            {task.notes && (
                              <>
                                <span>•</span>
                                <span className="text-stone-400 truncate italic">"{task.notes}"</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTask(currentDayData.day, task.id)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-stone-900 transition-colors shrink-0"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= FULL WEEK MATRIX VIEW ================= */
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2">
            {schedule.map((dayItem) => {
              const isSelected = dayItem.day === selectedDay;
              return (
                <div
                  key={dayItem.day}
                  onClick={() => {
                    setSelectedDay(dayItem.day);
                    setViewMode('day');
                  }}
                  className={`bg-[#181514] border rounded-xl p-2.5 hover:border-amber-500/40 cursor-pointer transition-all ${
                    isSelected ? 'border-amber-500/50' : 'border-stone-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-800/50 text-xs">
                    <span className="font-bold text-amber-200">{dayItem.shortLabel}</span>
                    <span className="text-[10px] text-stone-500">{dayItem.dateStr}</span>
                  </div>

                  <div className="mt-2 space-y-2 text-[10px]">
                    <div>
                      <span className="text-amber-400/90 font-bold block mb-0.5">{p1Short}:</span>
                      <p className="text-stone-300 truncate">☀️ {dayItem.partner1.am.activity || '—'}</p>
                      <p className="text-stone-400 truncate">🌙 {dayItem.partner1.pm.activity || '—'}</p>
                    </div>
                    <div className="pt-1.5 border-t border-stone-800/40">
                      <span className="text-emerald-400/90 font-bold block mb-0.5">{p2Short}:</span>
                      <p className="text-stone-300 truncate">☀️ {dayItem.partner2.am.activity || '—'}</p>
                      <p className="text-stone-400 truncate">🌙 {dayItem.partner2.pm.activity || '—'}</p>
                    </div>
                  </div>

                  <div className="mt-2 pt-1 border-t border-stone-800/40 text-[9px] text-amber-300/80 truncate font-medium">
                    🍽️ {dayItem.dinner.type === 'together' ? dayItem.dinner.mealName || 'Dinner' : 'Own dinners'}
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
