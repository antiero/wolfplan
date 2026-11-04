export type PartnerId = 'partner1' | 'partner2';

export interface PartnerProfile {
  id: PartnerId;
  name: string;
  shortName: string;
  avatarBg: string; // Tailwind color class or hex
  accentColor: string;
  favoriteDinnerEmoji: string;
  photoUrl?: string; // Optional profile photo URL or base64 data URI
  avatarEmoji?: string; // Optional custom emoji avatar
}

export type WorkLocation = 'wfh' | 'office' | 'travel' | 'off';

export interface TimedActivity {
  id: string;
  time: string; // e.g. "9:00 AM", "10:00 AM", "4:00 PM"
  text: string; // e.g. "Dr appointment", "Get chicken out of freezer"
  completed?: boolean;
}

export interface ScheduleBlock {
  activity: string;
  workLocation?: WorkLocation;
  notes?: string;
  wolfyDuty?: boolean; // Walking or caring for Wolfy
  timedActivities?: TimedActivity[];
}

export type DinnerType = 'together' | 'separate';
export type CookAssignment = 'partner1' | 'partner2' | 'both' | 'takeaway' | 'eating_out' | 'leftovers';

export interface Ingredient {
  item: string;
  amount: string;
  checked?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Special';
  ingredients: Ingredient[];
  instructions: string[];
  wolfyTip?: string;
  imageEmoji?: string;
}

export interface DinnerPlan {
  type: DinnerType;
  cook: CookAssignment;
  mealName: string;
  tags: string[];
  recipeId?: string;
  customRecipe?: Recipe;
  recipeNotes?: string;
  partner1OwnDinner?: string;
  partner2OwnDinner?: string;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type WeekendMood = 'chill_reset' | 'outdoors_dog' | 'social_party' | 'foodie_cozy' | 'spontaneous';

export interface WeekendVibesPlan {
  enabled: boolean;
  mood: WeekendMood;
  morningVibe: string;
  afternoonPlan: string;
  eveningVibe: string;
  wolfyAdventure?: string;
  funTags: string[];
  noAlarm: boolean;
  notes?: string;
}

export interface AssignedTask {
  id: string;
  day: DayOfWeek;
  time?: string; // e.g. "4:00 PM", "9:00 AM"
  title: string; // e.g. "Pick up child from school"
  assignedTo: PartnerId; // e.g. 'partner2' (Beth)
  assignedBy: PartnerId; // e.g. 'partner1' (Antony)
  completed: boolean;
  completedAt?: number;
  category?: 'school' | 'errand' | 'wolfy' | 'groceries' | 'appointment' | 'general';
  notes?: string;
  createdAt: number;
}

export interface DaySchedule {
  day: DayOfWeek;
  dayLabel: string;
  shortLabel: string;
  dateStr: string;
  isToday?: boolean;
  weekendVibes?: WeekendVibesPlan;
  partner1: {
    am: ScheduleBlock;
    pm: ScheduleBlock;
  };
  partner2: {
    am: ScheduleBlock;
    pm: ScheduleBlock;
  };
  dinner: DinnerPlan;
  assignedTasks?: AssignedTask[];
}

export interface NotificationItem {
  id: string;
  timestamp: number;
  authorId: PartnerId | 'wolfy';
  authorName: string;
  title: string;
  message: string;
  type: 'schedule_update' | 'dinner_update' | 'sunday_reminder' | 'nudge' | 'task_assigned' | 'task_completed';
  read: boolean;
  day?: DayOfWeek;
}

export interface AppSettings {
  partner1: PartnerProfile;
  partner2: PartnerProfile;
  sundayReminderEnabled: boolean;
  sundayReminderDay: 'sunday' | 'monday';
  sundayReminderTime: string; // e.g. "21:30"
  realtimeAlerts: boolean;
  dogWalkingTracker: boolean;
  activeViewPartner: PartnerId | 'both';
  pairCode: string;
  googleCalendarConnected?: boolean;
  cloudSyncEnabled?: boolean;
  hasCompletedFirstWeek?: boolean;
  previousWeekSchedule?: DaySchedule[];
  dailyBriefingPopupEnabled?: boolean;
  customDaytimePresets?: string[];
  customEveningPresets?: string[];
  customActivityChipsAM?: string[];
  customActivityChipsPM?: string[];
}
