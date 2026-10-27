import { DaySchedule, Recipe, AppSettings, NotificationItem } from '../types';
import { getWeekDates } from '../utils/dates';

const initialWeekDates = getWeekDates();
const getDateStrFor = (day: string, fallback: string) =>
  initialWeekDates.find((w) => w.day === day)?.dateStr || fallback;

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'recipe-1',
    name: 'Salmon & Gnocchi',
    prepTime: '10 mins',
    cookTime: '15 mins',
    servings: 2,
    difficulty: 'Easy',
    imageEmoji: '🐟',
    tags: ['Quick', '20 Mins'],
    ingredients: [
      { item: 'Salmon fillets', amount: '2' },
      { item: 'Potato gnocchi', amount: '400g' },
      { item: 'Baby spinach', amount: '100g' },
      { item: 'Sun-dried tomatoes', amount: '50g' },
      { item: 'Cream', amount: '150ml' },
    ],
    instructions: [
      'Pan-sear salmon skin-down for 4 mins, flip for 2 mins, set aside.',
      'Crisp gnocchi in olive oil until golden.',
      'Toss with cream, spinach, and tomatoes.',
      'Top with salmon and serve.',
    ],
    wolfyTip: 'Wolfy gets a little steamed sweet potato.',
  },
  {
    id: 'recipe-2',
    name: 'Thai Coconut Curry',
    prepTime: '10 mins',
    cookTime: '15 mins',
    servings: 2,
    difficulty: 'Easy',
    imageEmoji: '🥥',
    tags: ['Comfort', 'One-Pot'],
    ingredients: [
      { item: 'Tofu or chicken', amount: '300g' },
      { item: 'Red curry paste', amount: '2 tbsp' },
      { item: 'Coconut milk', amount: '400ml' },
      { item: 'Greens & snap peas', amount: '2 cups' },
      { item: 'Jasmine rice', amount: 'for serving' },
    ],
    instructions: [
      'Sear protein lightly.',
      'Simmer curry paste with coconut milk and veggies.',
      'Serve warm over jasmine rice.',
    ],
    wolfyTip: 'Wolfy gets a crunchy carrot stick.',
  },
  {
    id: 'recipe-3',
    name: 'Halloumi & Corn Bowls',
    prepTime: '10 mins',
    cookTime: '10 mins',
    servings: 2,
    difficulty: 'Easy',
    imageEmoji: '🧀',
    tags: ['Fresh', 'Quick'],
    ingredients: [
      { item: 'Halloumi cheese', amount: '225g' },
      { item: 'Black beans', amount: '1 can' },
      { item: 'Sweetcorn', amount: '1 cup' },
      { item: 'Avocado & lime', amount: '1 each' },
    ],
    instructions: [
      'Golden fry halloumi slices.',
      'Warm beans and corn with olive oil and lime.',
      'Assemble bowls with fresh avocado.',
    ],
    wolfyTip: 'Wolfy watches the halloumi fry politely.',
  },
  {
    id: 'recipe-4',
    name: 'Slow Sunday Ragù',
    prepTime: '15 mins',
    cookTime: '90 mins',
    servings: 4,
    difficulty: 'Special',
    imageEmoji: '🍝',
    tags: ['Weekend', 'Slow Cook'],
    ingredients: [
      { item: 'Beef chuck', amount: '500g' },
      { item: 'Mushrooms & aromatics', amount: '2 cups' },
      { item: 'Crushed tomatoes', amount: '400g' },
      { item: 'Pappardelle pasta', amount: '350g' },
      { item: 'Parmesan', amount: 'generous' },
    ],
    instructions: [
      'Brown beef and simmer gently with aromatics and tomatoes for 90 mins.',
      'Toss with al dente pappardelle and fresh parmesan.',
    ],
    wolfyTip: 'Wolfy naps quietly by the warm stove.',
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  partner1: {
    id: 'partner1',
    name: 'Antony',
    shortName: 'Ant',
    avatarBg: 'bg-amber-600',
    accentColor: '#D97706',
    favoriteDinnerEmoji: '🍝',
  },
  partner2: {
    id: 'partner2',
    name: 'Beth',
    shortName: 'Beth',
    avatarBg: 'bg-emerald-600',
    accentColor: '#059669',
    favoriteDinnerEmoji: '🍣',
  },
  sundayReminderEnabled: true,
  sundayReminderDay: 'sunday',
  sundayReminderTime: '21:30',
  realtimeAlerts: true,
  dogWalkingTracker: true,
  activeViewPartner: 'both',
  pairCode: 'WOLFY-JACK-RUSSELL-77',
  hasCompletedFirstWeek: true, // enables 2nd run copy prompt
};

// Calm, uncluttered initial schedule
export const INITIAL_SCHEDULE: DaySchedule[] = [
  {
    day: 'monday',
    dayLabel: 'Monday',
    shortLabel: 'Mon',
    dateStr: getDateStrFor('monday', 'Oct 26'),
    partner1: {
      am: { activity: 'Gym & WFH', workLocation: 'wfh', wolfyDuty: true },
      pm: { activity: 'WFH', workLocation: 'wfh', wolfyDuty: false },
    },
    partner2: {
      am: { activity: 'Office', workLocation: 'office', wolfyDuty: false },
      pm: { activity: 'Home at 6', workLocation: 'office', wolfyDuty: true },
    },
    dinner: {
      type: 'together',
      cook: 'partner1',
      mealName: 'Salmon & Gnocchi',
      tags: ['Quick'],
      recipeId: 'recipe-1',
    },
  },
  {
    day: 'tuesday',
    dayLabel: 'Tuesday',
    shortLabel: 'Tue',
    dateStr: getDateStrFor('tuesday', 'Oct 27'),
    partner1: {
      am: { activity: 'Office', workLocation: 'office', wolfyDuty: false },
      pm: { activity: 'Out with workmates', workLocation: 'office', wolfyDuty: false },
    },
    partner2: {
      am: { activity: 'WFH', workLocation: 'wfh', wolfyDuty: true },
      pm: { activity: 'Pilates', workLocation: 'wfh', wolfyDuty: true },
    },
    dinner: {
      type: 'separate',
      cook: 'takeaway',
      mealName: 'Own Dinners',
      tags: ['Own Dinners'],
      partner1OwnDinner: 'Out with workmates',
      partner2OwnDinner: 'Pasta at home',
    },
  },
  {
    day: 'wednesday',
    dayLabel: 'Wednesday',
    shortLabel: 'Wed',
    dateStr: getDateStrFor('wednesday', 'Oct 28'),
    partner1: {
      am: { activity: 'WFH', workLocation: 'wfh', wolfyDuty: true },
      pm: { activity: 'Home & Wolfy walk', workLocation: 'wfh', wolfyDuty: true },
    },
    partner2: {
      am: { activity: 'Office', workLocation: 'office', wolfyDuty: false },
      pm: { activity: 'Home', workLocation: 'office', wolfyDuty: false },
    },
    dinner: {
      type: 'together',
      cook: 'partner2',
      mealName: 'Thai Coconut Curry',
      tags: ['Comfort'],
      recipeId: 'recipe-2',
    },
  },
  {
    day: 'thursday',
    dayLabel: 'Thursday',
    shortLabel: 'Thu',
    dateStr: getDateStrFor('thursday', 'Oct 29'),
    partner1: {
      am: { activity: 'Office', workLocation: 'office', wolfyDuty: false },
      pm: { activity: 'Home', workLocation: 'office', wolfyDuty: true },
    },
    partner2: {
      am: { activity: 'WFH', workLocation: 'wfh', wolfyDuty: true },
      pm: { activity: 'Dinner with friend', workLocation: 'office', wolfyDuty: false },
    },
    dinner: {
      type: 'separate',
      cook: 'eating_out',
      mealName: 'Own Dinners',
      tags: ['Own Dinners'],
      partner1OwnDinner: 'Toasted sourdough & soup',
      partner2OwnDinner: 'Dinner with friend',
    },
  },
  {
    day: 'friday',
    dayLabel: 'Friday',
    shortLabel: 'Fri',
    dateStr: getDateStrFor('friday', 'Oct 30'),
    partner1: {
      am: { activity: 'WFH', workLocation: 'wfh', wolfyDuty: true },
      pm: { activity: 'Relax & wine', workLocation: 'wfh', wolfyDuty: true },
    },
    partner2: {
      am: { activity: 'WFH', workLocation: 'wfh', wolfyDuty: false },
      pm: { activity: 'Movie night', workLocation: 'wfh', wolfyDuty: true },
    },
    dinner: {
      type: 'together',
      cook: 'both',
      mealName: 'Halloumi & Corn Bowls',
      tags: ['Together'],
      recipeId: 'recipe-3',
    },
  },
  {
    day: 'saturday',
    dayLabel: 'Saturday',
    shortLabel: 'Sat',
    dateStr: getDateStrFor('saturday', 'Oct 31'),
    weekendVibes: {
      enabled: true,
      mood: 'chill_reset',
      morningVibe: 'Sleep in & coffee',
      afternoonPlan: 'Farmers market & walk',
      eveningVibe: 'Dinner with friends',
      wolfyAdventure: 'Pup-cup at the cafe',
      funTags: ['No Alarm', 'Market'],
      noAlarm: true,
    },
    partner1: {
      am: { activity: 'Parkrun & coffee', workLocation: 'off', wolfyDuty: true },
      pm: { activity: 'Dinner party', workLocation: 'off', wolfyDuty: false },
    },
    partner2: {
      am: { activity: 'Farmers Market', workLocation: 'off', wolfyDuty: true },
      pm: { activity: 'Dinner party', workLocation: 'off', wolfyDuty: false },
    },
    dinner: {
      type: 'together',
      cook: 'eating_out',
      mealName: 'Dinner with friends',
      tags: ['Social'],
    },
  },
  {
    day: 'sunday',
    dayLabel: 'Sunday',
    shortLabel: 'Sun',
    dateStr: getDateStrFor('sunday', 'Nov 1'),
    weekendVibes: {
      enabled: true,
      mood: 'outdoors_dog',
      morningVibe: 'Trail walk with Wolfy',
      afternoonPlan: 'Country pub lunch',
      eveningVibe: 'Sunday check-in & relax',
      wolfyAdventure: 'Forest trail run',
      funTags: ['Trail Walk', 'Pub'],
      noAlarm: true,
    },
    partner1: {
      am: { activity: 'Trail walk with Wolfy', workLocation: 'off', wolfyDuty: true },
      pm: { activity: 'Slow cooking & check-in', workLocation: 'off', wolfyDuty: true },
    },
    partner2: {
      am: { activity: 'Walk in woods', workLocation: 'off', wolfyDuty: true },
      pm: { activity: 'Sunday check-in', workLocation: 'off', wolfyDuty: true },
    },
    dinner: {
      type: 'together',
      cook: 'partner1',
      mealName: 'Slow Sunday Ragù',
      tags: ['Comfort'],
      recipeId: 'recipe-4',
    },
  },
];

// Clean blank template for 'Start from Scratch'
export const BLANK_SCHEDULE_TEMPLATE: DaySchedule[] = INITIAL_SCHEDULE.map((day) => ({
  ...day,
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
  weekendVibes: day.weekendVibes
    ? {
        ...day.weekendVibes,
        morningVibe: '',
        afternoonPlan: '',
        eveningVibe: '',
        wolfyAdventure: '',
        funTags: ['No Alarm'],
      }
    : undefined,
}));

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    timestamp: Date.now() - 1000 * 60 * 15,
    authorId: 'partner2',
    authorName: 'Beth',
    title: 'Tuesday Update',
    message: 'Added Pilates in the evening.',
    type: 'schedule_update',
    read: false,
    day: 'tuesday',
  },
];

export const COMMON_AM_CHIPS = [
  '💻 WFH',
  '🏢 Office',
  '🏋️ Gym',
  '🐾 Walk Wolfy',
  '🏃 Run',
  '☕ Coffee',
];

export const COMMON_PM_CHIPS = [
  '🍻 Out with workmates',
  '✨ Date night',
  '🛋️ Chill in',
  '🧘 Pilates / Gym',
  '🍕 Takeaway',
  '🐾 Wolfy walk',
];

export const WEEKEND_VIBE_PRESETS = [
  {
    category: 'Chill 🛋️',
    items: ['Sleep in & coffee', 'Wolfy cuddles', 'Movie night'],
  },
  {
    category: 'Outdoors 🐾',
    items: ['Trail walk', 'Pub walk', 'Dog park'],
  },
  {
    category: 'Social 🎉',
    items: ['Dinner party', 'Drinks with friends', 'Brunch'],
  },
];
