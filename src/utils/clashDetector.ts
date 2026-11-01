import { DaySchedule, AppSettings, DayOfWeek, PartnerId } from '../types';

export interface ScheduleClash {
  id: string;
  type: 'wolfy_uncovered' | 'timing_overlap' | 'both_away';
  severity: 'warning' | 'info';
  period?: 'am' | 'pm';
  time?: string;
  title: string;
  message: string;
  canAssignWolfy: boolean;
  suggestedAction?: string;
}

const OUT_KEYWORDS = [
  'out',
  'office',
  'travel',
  'flight',
  'trip',
  'drinks',
  'pub',
  'dinner',
  'party',
  'event',
  'away',
  'meeting',
  'cinema',
  'theatre',
  'theater',
  'social',
  'client',
  'conference',
  'dentist',
  'doctor',
  'appointment',
  'appt',
];

function isLikelyAway(activityStr = '', location = ''): boolean {
  if (location === 'office' || location === 'travel') return true;
  const lower = activityStr.toLowerCase();
  return OUT_KEYWORDS.some((kw) => lower.includes(kw));
}

function normalizeTime(timeStr?: string): string {
  if (!timeStr) return '';
  return timeStr
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/^0+/, '');
}

/**
 * Detects schedule clashes and Wolfy care coverage gaps for a given day.
 */
export function detectDayClashes(daySchedule: DaySchedule, settings: AppSettings): ScheduleClash[] {
  const clashes: ScheduleClash[] = [];
  const p1 = settings.partner1;
  const p2 = settings.partner2;
  const p1Name = p1.name === 'Alex' ? 'Antony' : (p1.name || 'Antony');
  const p2Name = p2.name === 'Alex' ? 'Beth' : (p2.name || 'Beth');

  const p1Am = daySchedule.partner1.am;
  const p1Pm = daySchedule.partner1.pm;
  const p2Am = daySchedule.partner2.am;
  const p2Pm = daySchedule.partner2.pm;

  // 1. Daytime (AM) Wolfy Coverage Check
  const amWolfyCovered = !!p1Am.wolfyDuty || !!p2Am.wolfyDuty;
  const p1AmAway = isLikelyAway(p1Am.activity, p1Am.workLocation);
  const p2AmAway = isLikelyAway(p2Am.activity, p2Am.workLocation);

  if (!amWolfyCovered && p1AmAway && p2AmAway) {
    clashes.push({
      id: `clash-am-wolfy-${daySchedule.day}`,
      type: 'wolfy_uncovered',
      severity: 'warning',
      period: 'am',
      title: '🐾 Wolfy Daytime Coverage Needed',
      message: `It seems you're both away/in office during the Daytime — who is responsible for Wolfy's morning walk & care?`,
      canAssignWolfy: true,
      suggestedAction: 'Assign daytime Wolfy walk to Antony or Beth',
    });
  }

  // 2. Evening (PM) Wolfy Coverage Check
  const pmWolfyCovered = !!p1Pm.wolfyDuty || !!p2Pm.wolfyDuty;
  const p1PmAway = isLikelyAway(p1Pm.activity, p1Pm.workLocation);
  const p2PmAway = isLikelyAway(p2Pm.activity, p2Pm.workLocation);

  if (!pmWolfyCovered && p1PmAway && p2PmAway) {
    clashes.push({
      id: `clash-pm-wolfy-${daySchedule.day}`,
      type: 'wolfy_uncovered',
      severity: 'warning',
      period: 'pm',
      title: '🐾 Wolfy Evening Coverage Check',
      message: `It looks like you are both out or busy in the Evening — who is responsible for Wolfy at that time?`,
      canAssignWolfy: true,
      suggestedAction: 'Assign evening Wolfy walk/dinner to Antony or Beth',
    });
  }

  // 3. Timed Activity Overlaps
  // Gather all timed activities from both partners
  const p1Timed = [
    ...(p1Am.timedActivities || []).map((t) => ({ ...t, period: 'am' as const })),
    ...(p1Pm.timedActivities || []).map((t) => ({ ...t, period: 'pm' as const })),
  ];
  const p2Timed = [
    ...(p2Am.timedActivities || []).map((t) => ({ ...t, period: 'am' as const })),
    ...(p2Pm.timedActivities || []).map((t) => ({ ...t, period: 'pm' as const })),
  ];

  p1Timed.forEach((t1) => {
    const t1Norm = normalizeTime(t1.time);
    p2Timed.forEach((t2) => {
      const t2Norm = normalizeTime(t2.time);
      if (t1Norm && t2Norm && t1Norm === t2Norm) {
        clashes.push({
          id: `clash-time-${daySchedule.day}-${t1.id}-${t2.id}`,
          type: 'timing_overlap',
          severity: 'info',
          time: t1.time,
          title: `⏰ Simultaneous Commitments at ${t1.time}`,
          message: `Both of you have commitments at ${t1.time}: ${p1Name} has "${t1.text}" and ${p2Name} has "${t2.text}". If both of you are out at ${t1.time}, remember to check who has Wolfy duty!`,
          canAssignWolfy: !amWolfyCovered && !pmWolfyCovered,
          suggestedAction: `Check transport and Wolfy care around ${t1.time}`,
        });
      }
    });
  });

  // 4. Assigned Task Overlap with Out Schedule
  (daySchedule.assignedTasks || []).forEach((task) => {
    if (task.time && !task.completed) {
      const taskNorm = normalizeTime(task.time);
      const recipient = task.assignedTo === 'partner1' ? p1Name : p2Name;
      const recipientBlocks = task.assignedTo === 'partner1' ? [p1Am, p1Pm] : [p2Am, p2Pm];

      // Check if recipient has another timed commitment at that exact time
      const recipientTimed = recipientBlocks.flatMap((b) => b.timedActivities || []);
      const overlapping = recipientTimed.find((t) => normalizeTime(t.time) === taskNorm);
      if (overlapping) {
        clashes.push({
          id: `clash-task-${task.id}`,
          type: 'timing_overlap',
          severity: 'warning',
          time: task.time,
          title: `⚠️ Task Time Conflict for ${recipient}`,
          message: `${recipient} has an assigned task "${task.title}" at ${task.time}, but also has "${overlapping.text}" scheduled then.`,
          canAssignWolfy: false,
        });
      }
    }
  });

  return clashes;
}

/**
 * Returns all clashes across the entire week with their day.
 */
export function detectWeekClashes(schedule: DaySchedule[], settings: AppSettings) {
  return schedule
    .map((dayItem) => ({
      day: dayItem.day,
      dayLabel: dayItem.dayLabel,
      dateStr: dayItem.dateStr,
      clashes: detectDayClashes(dayItem, settings),
    }))
    .filter((item) => item.clashes.length > 0);
}
