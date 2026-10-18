import { DaySchedule, PartnerId, WorkLocation } from '../types';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

// Fetch calendar events for the upcoming week
export async function fetchCalendarEvents(accessToken: string): Promise<CalendarEvent[]> {
  const now = new Date();
  // Start from beginning of current week (Monday)
  const dayOfWeek = now.getDay();
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);
  sunday.setHours(23, 59, 59, 999);

  const params = new URLSearchParams({
    timeMin: monday.toISOString(),
    timeMax: sunday.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '100',
  });

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Calendar API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.items || [];
}

// Create single calendar event
export async function createCalendarEvent(
  accessToken: string,
  event: {
    summary: string;
    description?: string;
    location?: string;
    start: { dateTime: string };
    end: { dateTime: string };
  }
) {
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create Google Calendar event: ${err}`);
  }

  return await res.json();
}

// Export week routine blocks to Google Calendar
export async function syncScheduleToGoogleCalendar(
  accessToken: string,
  schedule: DaySchedule[],
  partnerName: string,
  partnerId: PartnerId
): Promise<number> {
  let createdCount = 0;
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);

  const dayMap: Record<string, number> = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
  };

  for (const dayItem of schedule) {
    const dayOffset = dayMap[dayItem.day];
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + dayOffset);
    const datePrefix = targetDate.toISOString().split('T')[0];

    const partnerData = dayItem[partnerId];

    // AM Block Event
    if (partnerData.am.activity && partnerData.am.activity !== 'Free / Flexible') {
      const amStart = `${datePrefix}T09:00:00Z`;
      const amEnd = `${datePrefix}T12:30:00Z`;
      const walkNote = partnerData.am.wolfyDuty ? '🐾 Wolfy Walk Duty Assigned' : '';
      await createCalendarEvent(accessToken, {
        summary: `🐾 Wolfy: ${partnerData.am.activity}`,
        description: `Routine block for ${partnerName}.\nLocation: ${partnerData.am.workLocation || 'WFH'}\n${walkNote}\n${partnerData.am.notes || ''}`,
        location: partnerData.am.workLocation === 'office' ? 'Office' : 'Home',
        start: { dateTime: amStart },
        end: { dateTime: amEnd },
      });
      createdCount++;
    }

    // PM Block Event
    if (partnerData.pm.activity && partnerData.pm.activity !== 'Free / Flexible') {
      const pmStart = `${datePrefix}T18:00:00Z`;
      const pmEnd = `${datePrefix}T21:00:00Z`;
      await createCalendarEvent(accessToken, {
        summary: `🐾 Wolfy: ${partnerData.pm.activity}`,
        description: `Evening block for ${partnerName}.\n${partnerData.pm.notes || ''}`,
        start: { dateTime: pmStart },
        end: { dateTime: pmEnd },
      });
      createdCount++;
    }

    // Dinner event if cooking or eating together
    if (dayItem.dinner.mealName && dayItem.dinner.type === 'together') {
      const dinnerStart = `${datePrefix}T19:30:00Z`;
      const dinnerEnd = `${datePrefix}T20:30:00Z`;
      await createCalendarEvent(accessToken, {
        summary: `🍽️ Dinner: ${dayItem.dinner.mealName}`,
        description: `Dinner with partner.\nCook: ${dayItem.dinner.cook}\nNotes: ${dayItem.dinner.recipeNotes || ''}`,
        start: { dateTime: dinnerStart },
        end: { dateTime: dinnerEnd },
      });
      createdCount++;
    }
  }

  return createdCount;
}

// Convert Google Calendar events into rough AM / PM blocks
export function parseEventsToRoughSchedule(events: CalendarEvent[]) {
  const dayMap: Record<number, { am: string[]; pm: string[] }> = {
    1: { am: [], pm: [] }, // Mon
    2: { am: [], pm: [] }, // Tue
    3: { am: [], pm: [] }, // Wed
    4: { am: [], pm: [] }, // Thu
    5: { am: [], pm: [] }, // Fri
    6: { am: [], pm: [] }, // Sat
    0: { am: [], pm: [] }, // Sun
  };

  events.forEach((event) => {
    const startStr = event.start.dateTime || event.start.date;
    if (!startStr) return;
    const start = new Date(startStr);
    const day = start.getDay();
    const hour = start.getHours();

    if (dayMap[day]) {
      if (hour < 13) {
        dayMap[day].am.push(event.summary);
      } else {
        dayMap[day].pm.push(event.summary);
      }
    }
  });

  return dayMap;
}
