import { DayOfWeek, DaySchedule } from '../types';

export const DAY_ORDER: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DAY_LABELS: Record<DayOfWeek, { label: string; short: string }> = {
  monday: { label: 'Monday', short: 'Mon' },
  tuesday: { label: 'Tuesday', short: 'Tue' },
  wednesday: { label: 'Wednesday', short: 'Wed' },
  thursday: { label: 'Thursday', short: 'Thu' },
  friday: { label: 'Friday', short: 'Fri' },
  saturday: { label: 'Saturday', short: 'Sat' },
  sunday: { label: 'Sunday', short: 'Sun' },
};

/**
 * Returns Monday at 00:00:00 for the week containing targetDate, with optional weekOffset.
 */
export function getMondayOfWeek(targetDate: Date = new Date(), weekOffset = 0): Date {
  const d = new Date(targetDate);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  // In a Monday-first week: Sunday (0) is +6 from Monday, Monday (1) is 0 days, etc.
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday + weekOffset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Formats a Date object to e.g. "Oct 27"
 */
export function formatDayMonth(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Returns an array of 7 day items for the week containing targetDate + weekOffset.
 */
export function getWeekDates(targetDate: Date = new Date(), weekOffset = 0) {
  const monday = getMondayOfWeek(targetDate, weekOffset);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return DAY_ORDER.map((dayKey, index) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + index);

    const isToday =
      dayDate.getFullYear() === today.getFullYear() &&
      dayDate.getMonth() === today.getMonth() &&
      dayDate.getDate() === today.getDate();

    return {
      day: dayKey,
      dayLabel: DAY_LABELS[dayKey].label,
      shortLabel: DAY_LABELS[dayKey].short,
      dateStr: formatDayMonth(dayDate),
      dayNumber: dayDate.getDate(),
      fullDate: dayDate,
      isToday,
    };
  });
}

/**
 * Formats a week range header string, e.g. "Oct 26 – Nov 1, 2026"
 */
export function formatWeekHeader(targetDate: Date = new Date(), weekOffset = 0): string {
  const monday = getMondayOfWeek(targetDate, weekOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startMonth = monday.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
  const startDay = monday.getDate();
  const endDay = sunday.getDate();
  const year = sunday.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}

/**
 * Synchronizes a DaySchedule[] so that each day's dateStr matches the week's actual dates.
 */
export function syncScheduleWithCurrentWeek(
  schedule: DaySchedule[],
  targetDate: Date = new Date(),
  weekOffset = 0
): DaySchedule[] {
  const weekDates = getWeekDates(targetDate, weekOffset);
  const dateMap = new Map(weekDates.map((w) => [w.day, w.dateStr]));

  return schedule.map((item) => {
    const newDateStr = dateMap.get(item.day);
    if (newDateStr && item.dateStr !== newDateStr) {
      return {
        ...item,
        dateStr: newDateStr,
      };
    }
    return item;
  });
}
