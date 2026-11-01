import React from 'react';
import { useWolfy } from '../context/WolfyContext';
import { WolfyAvatar } from './WolfyAvatar';
import { UserAvatar } from './UserAvatar';
import { detectDayClashes } from '../utils/clashDetector';
import {
  X,
  Calendar,
  Sparkles,
  PawPrint,
  Utensils,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sun,
  Moon,
  CheckSquare,
  Plus,
} from 'lucide-react';
import { DayOfWeek } from '../types';

export const DailyBriefingModal: React.FC = () => {
  const {
    isBriefingModalOpen,
    setIsBriefingModalOpen,
    setIsSundayWizardOpen,
    openAssignTaskModal,
    toggleTaskCompleted,
    schedule,
    settings,
    activeUser,
    updateSettings,
    setWolfyDutyQuick,
  } = useWolfy();

  if (!isBriefingModalOpen) return null;

  const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const dayNames: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[todayIndex];
  const isSunday = todayIndex === 0;

  const todaySchedule = schedule.find((d) => d.day === todayName) || schedule[0];
  const p1 = settings.partner1;
  const p2 = settings.partner2;
  const p1Name = p1.name === 'Alex' ? 'Antony' : (p1.name || 'Antony');
  const p2Name = p2.name === 'Alex' ? 'Beth' : (p2.name || 'Beth');
  const p1Short = p1.shortName === 'Alex' ? 'Ant' : (p1.shortName || 'Ant');
  const p2Short = p2.shortName === 'Alex' ? 'Beth' : (p2.shortName || 'Beth');

  const todayClashes = detectDayClashes(todaySchedule, settings);
  const assignedTasks = todaySchedule.assignedTasks || [];
  const pendingTasks = assignedTasks.filter((t) => !t.completed);

  const handleClose = () => {
    setIsBriefingModalOpen(false);
  };

  const handleToggleStartupPopup = (checked: boolean) => {
    updateSettings({ dailyBriefingPopupEnabled: checked });
  };

  const handleLaunchSundayWizard = () => {
    setIsBriefingModalOpen(false);
    setIsSundayWizardOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#181514] border-t sm:border border-amber-900/40 rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-stone-100 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* Header with Warm Aesthetic */}
        <div className="relative p-5 bg-gradient-to-br from-amber-950/80 via-stone-900 to-stone-950 border-b border-stone-800">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <WolfyAvatar size="md" mood={isSunday ? 'happy' : 'walkies'} showBadge badgeText={isSunday ? '✨' : '☀️'} />
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                  {isSunday ? 'Sunday Weekly Planning Ritual' : "Today's Couple Briefing"}
                </span>
                <h3 className="text-xl font-bold text-amber-100 font-serif mt-1">
                  {isSunday ? 'Time to Plan the Week Ahead!' : `${todaySchedule.dayLabel}, ${todaySchedule.dateStr}`}
                </h3>
                <p className="text-xs text-stone-300">
                  {isSunday
                    ? `Align schedules, dinner, and Wolfy care with ${p1Name} & ${p2Name}`
                    : `Quick daily check-in for ${p1Name} & ${p2Name}`}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-700/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* Sunday-specific High Priority Banner */}
          {isSunday && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-900/40 via-amber-950/50 to-stone-900 border border-amber-700/50 shadow-md">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-200 text-sm">
                    Sunday 9:30 PM Planning Ritual
                  </h4>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    Set up your rough Daytime & Evening blocks, dinner plan, and weekend vibes in 60 seconds so there are no surprises this week.
                  </p>
                  <button
                    onClick={handleLaunchSundayWizard}
                    className="mt-3 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span>🚀 Open Sunday Week Wizard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Clash / Conflict Warning Alert (if any) */}
          {todayClashes.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Attention: Potential Schedule Conflict</span>
              </div>
              {todayClashes.map((c) => (
                <div key={c.id} className="text-xs text-stone-200 pl-6 space-y-1.5">
                  <p className="font-medium text-rose-200">{c.message}</p>
                  {c.type === 'wolfy_uncovered' && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => setWolfyDutyQuick(todayName, 'partner1', c.period)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] font-bold"
                      >
                        🐾 {p1Short} has Wolfy
                      </button>
                      <button
                        onClick={() => setWolfyDutyQuick(todayName, 'partner2', c.period)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] font-bold"
                      >
                        🐾 {p2Short} has Wolfy
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Today's Daytime & Evening Overview for Both Partners */}
          <div className="space-y-2">
            <h5 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              {todaySchedule.dayLabel} Routine
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Partner 1 card */}
              <div className="p-3 rounded-xl bg-stone-900/70 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <UserAvatar profile={p1} size="xs" />
                    <span className="font-bold text-xs text-stone-200">{p1Name}</span>
                  </div>
                  {todaySchedule.partner1.am.wolfyDuty && (
                    <span className="text-[10px] text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-900/40">
                      🐾 Wolfy Duty
                    </span>
                  )}
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex items-start gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-stone-400 block">Daytime</span>
                      <p className="font-medium text-stone-200 truncate">{todaySchedule.partner1.am.activity || 'Flexible'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 pt-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-stone-400 block">Evening</span>
                      <p className="font-medium text-stone-200 truncate">{todaySchedule.partner1.pm.activity || 'Flexible'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Partner 2 card */}
              <div className="p-3 rounded-xl bg-stone-900/70 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <UserAvatar profile={p2} size="xs" />
                    <span className="font-bold text-xs text-stone-200">{p2Name}</span>
                  </div>
                  {todaySchedule.partner2.am.wolfyDuty && (
                    <span className="text-[10px] text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-900/40">
                      🐾 Wolfy Duty
                    </span>
                  )}
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex items-start gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-stone-400 block">Daytime</span>
                      <p className="font-medium text-stone-200 truncate">{todaySchedule.partner2.am.activity || 'Flexible'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 pt-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-stone-400 block">Evening</span>
                      <p className="font-medium text-stone-200 truncate">{todaySchedule.partner2.pm.activity || 'Flexible'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dinner Plan Snapshot */}
          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-300 block uppercase">Tonight's Dinner</span>
                <p className="text-xs font-semibold text-stone-100">
                  {todaySchedule.dinner.type === 'together'
                    ? (todaySchedule.dinner.mealName || 'Dinner together')
                    : 'Separate / individual meals'}
                </p>
                <p className="text-[11px] text-stone-400">
                  {todaySchedule.dinner.type === 'together'
                    ? `Cook: ${todaySchedule.dinner.cook === 'partner1' ? p1Name : todaySchedule.dinner.cook === 'partner2' ? p2Name : todaySchedule.dinner.cook}`
                    : 'Each partner sorts own food'}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Tasks / Errands for Today */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Today's Assigned Tasks ({pendingTasks.length} pending)</span>
              </h5>
              <button
                onClick={() => {
                  handleClose();
                  openAssignTaskModal(todayName);
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Assign task
              </button>
            </div>

            {assignedTasks.length === 0 ? (
              <p className="text-xs text-stone-500 italic p-3 rounded-xl bg-stone-900/40 border border-stone-800/60 text-center">
                No tasks assigned for today yet.
              </p>
            ) : (
              <div className="space-y-1.5">
                {assignedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-colors ${
                      task.completed
                        ? 'bg-stone-900/40 border-stone-800/40 opacity-60'
                        : 'bg-stone-900 border-stone-700/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => toggleTaskCompleted(todayName, task.id)}
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          task.completed
                            ? 'bg-amber-500 border-amber-400 text-stone-950'
                            : 'border-stone-600 hover:border-amber-400'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <div className="min-w-0">
                        <p className={`text-xs font-medium text-stone-200 truncate ${task.completed ? 'line-through text-stone-500' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                          {task.time && (
                            <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" /> {task.time}
                            </span>
                          )}
                          <span>•</span>
                          <span>For {task.assignedTo === 'partner1' ? p1Short : p2Short}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer self-start sm:self-auto">
            <input
              type="checkbox"
              checked={settings.dailyBriefingPopupEnabled !== false}
              onChange={(e) => handleToggleStartupPopup(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 bg-stone-800 border-stone-700 w-3.5 h-3.5"
            />
            <span>Show this briefing on app open</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isSunday && (
              <button
                onClick={handleLaunchSundayWizard}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs transition-colors"
              >
                Plan Week Ahead
              </button>
            )}
            <button
              onClick={handleClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition-colors"
            >
              Looks Good!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
