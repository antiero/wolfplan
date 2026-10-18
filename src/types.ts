export type PartnerId = 'partner1' | 'partner2';

export interface PartnerProfile {
  id: PartnerId;
  name: string;
  shortName: string;
  avatarBg: string; // Tailwind color class or hex
  accentColor: string;
  favoriteDinnerEmoji: string;
}

export type WorkLocation = 'wfh' | 'office' | 'travel' | 'off';

export interface ScheduleBlock {
  activity: string;
  workLocation?: WorkLocation;
  notes?: string;
  wolfyDuty?: boolean; // Walking or caring for Wolfy
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
}

export interface NotificationItem {
  id: string;
  timestamp: number;
  authorId: PartnerId | 'wolfy';
  authorName: string;
  title: string;
  message: string;
  type: 'schedule_update' | 'dinner_update' | 'sunday_reminder' | 'nudge';
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
}
