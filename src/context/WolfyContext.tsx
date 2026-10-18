import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  DaySchedule,
  Recipe,
  AppSettings,
  NotificationItem,
  DayOfWeek,
  PartnerId,
  ScheduleBlock,
  DinnerPlan,
} from '../types';
import {
  INITIAL_SCHEDULE,
  INITIAL_RECIPES,
  INITIAL_SETTINGS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';
import { playChime } from '../utils/sound';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  authorName: string;
  type: string;
}

interface WolfyContextType {
  schedule: DaySchedule[];
  recipes: Recipe[];
  settings: AppSettings;
  notifications: NotificationItem[];
  activeUser: PartnerId;
  activeTab: 'routine' | 'dinners' | 'sunday' | 'recipes' | 'notifications' | 'settings';
  selectedDay: DayOfWeek;
  liveToast: ToastNotification | null;
  isSundayWizardOpen: boolean;
  isInviteModalOpen: boolean;
  selectedRecipeModal: Recipe | null;
  unreadCount: number;

  setActiveTab: (tab: 'routine' | 'dinners' | 'sunday' | 'recipes' | 'notifications' | 'settings') => void;
  setSelectedDay: (day: DayOfWeek) => void;
  setActiveUser: (user: PartnerId) => void;
  setIsSundayWizardOpen: (open: boolean) => void;
  setIsInviteModalOpen: (open: boolean) => void;
  setSelectedRecipeModal: (recipe: Recipe | null) => void;

  updateScheduleBlock: (day: DayOfWeek, partnerId: PartnerId, period: 'am' | 'pm', update: Partial<ScheduleBlock>) => void;
  updateDinnerPlan: (day: DayOfWeek, update: Partial<DinnerPlan>) => void;
  updateWeekendVibes: (day: DayOfWeek, update: Partial<import('../types').WeekendVibesPlan>) => void;
  saveFullDayRoutine: (day: DayOfWeek, p1Am: ScheduleBlock, p1Pm: ScheduleBlock, p2Am: ScheduleBlock, p2Pm: ScheduleBlock, dinner: DinnerPlan) => void;
  
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, update: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  toggleIngredientChecked: (recipeId: string, ingredientIdx: number) => void;

  updateSettings: (update: Partial<AppSettings>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  dismissToast: () => void;

  simulatePartnerUpdate: (scenario?: string) => void;
  checkSundayPromptDue: () => boolean;
  resetToDefaults: () => void;
}

const WolfyContext = createContext<WolfyContextType | undefined>(undefined);

const STORAGE_KEY_SCHEDULE = 'wolfy_schedule_v2';
const STORAGE_KEY_RECIPES = 'wolfy_recipes_v2';
const STORAGE_KEY_SETTINGS = 'wolfy_settings_v2';
const STORAGE_KEY_NOTIFS = 'wolfy_notifications_v2';
const STORAGE_KEY_ACTIVE_USER = 'wolfy_active_user_v2';

export const WolfyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check URL query parameters for pair code or active user
  const [activeUser, setActiveUserState] = useState<PartnerId>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get('user');
      if (userParam === 'partner2' || userParam === 'partner1') {
        return userParam;
      }
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
      return (saved as PartnerId) || 'partner1';
    } catch {
      return 'partner1';
    }
  });

  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCHEDULE);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_SCHEDULE;
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECIPES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_RECIPES;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure pair code in query params preserves if given
        const params = new URLSearchParams(window.location.search);
        const pair = params.get('pair');
        if (pair) parsed.pairCode = pair;
        return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_SETTINGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [activeTab, setActiveTab] = useState<'routine' | 'dinners' | 'sunday' | 'recipes' | 'notifications' | 'settings'>('routine');
  
  // Current day of week detection
  const todayDayName = (['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()] || 'monday') as DayOfWeek;
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDayName);

  const [liveToast, setLiveToast] = useState<ToastNotification | null>(null);
  const [isSundayWizardOpen, setIsSundayWizardOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<Recipe | null>(null);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(schedule));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [schedule]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(recipes));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [recipes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_USER, activeUser);
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [activeUser]);

  const setActiveUser = (user: PartnerId) => {
    setActiveUserState(user);
  };

  const showToast = useCallback((toast: ToastNotification) => {
    setLiveToast(toast);
    if (settings.realtimeAlerts) {
      playChime('notification');
    }
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setLiveToast((current) => (current?.id === toast.id ? null : current));
    }, 5500);
  }, [settings.realtimeAlerts]);

  const dismissToast = () => setLiveToast(null);

  // Cross-tab synchronization via BroadcastChannel
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('wolfy_couple_sync_v1');
      channel.onmessage = (event) => {
        const { type, payload, senderId, senderName, notifText } = event.data || {};
        if (senderId && senderId !== activeUser) {
          if (type === 'SCHEDULE_UPDATE') {
            setSchedule(payload);
            showToast({
              id: String(Date.now()),
              title: `${senderName} updated the schedule!`,
              message: notifText || 'Changes made to weekly routine.',
              authorName: senderName,
              type: 'schedule_update',
            });
          } else if (type === 'DINNER_UPDATE') {
            setSchedule(payload);
            showToast({
              id: String(Date.now()),
              title: `${senderName} updated dinner plans 🍽️`,
              message: notifText || 'Dinner schedule has been updated.',
              authorName: senderName,
              type: 'dinner_update',
            });
          } else if (type === 'NEW_NOTIFICATION') {
            setNotifications((prev) => [payload, ...prev]);
          }
        }
      };
    } catch {
      // BroadcastChannel not available
    }

    return () => {
      if (channel) channel.close();
    };
  }, [activeUser, showToast]);

  const broadcastChange = (type: string, payload: unknown, notifText: string) => {
    try {
      const channel = new BroadcastChannel('wolfy_couple_sync_v1');
      const senderName = activeUser === 'partner1' ? settings.partner1.name : settings.partner2.name;
      channel.postMessage({
        type,
        payload,
        senderId: activeUser,
        senderName,
        notifText,
      });
      channel.close();
    } catch {
      // fallback
    }
  };

  const addNotification = useCallback((item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newItem: NotificationItem = {
      ...item,
      id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [newItem, ...prev.slice(0, 49)]); // keep latest 50
    return newItem;
  }, []);

  const updateScheduleBlock = useCallback((
    day: DayOfWeek,
    targetPartner: PartnerId,
    period: 'am' | 'pm',
    update: Partial<ScheduleBlock>
  ) => {
    setSchedule((prev) => {
      const next = prev.map((d) => {
        if (d.day !== day) return d;
        const currentPartnerData = d[targetPartner];
        const updatedPeriod = { ...currentPartnerData[period], ...update };
        return {
          ...d,
          [targetPartner]: {
            ...currentPartnerData,
            [period]: updatedPeriod,
          },
        };
      });

      const authorName = activeUser === 'partner1' ? settings.partner1.name : settings.partner2.name;
      const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
      const activitySummary = update.activity ? ` (${update.activity})` : '';

      const notif = addNotification({
        authorId: activeUser,
        authorName,
        title: `${authorName} updated ${dayLabel} ${period.toUpperCase()}`,
        message: `${authorName} modified their ${period.toUpperCase()} plan${activitySummary}.`,
        type: 'schedule_update',
        day,
      });

      broadcastChange('SCHEDULE_UPDATE', next, `${authorName} updated ${dayLabel} ${period.toUpperCase()}`);
      return next;
    });
  }, [activeUser, settings, addNotification]);

  const updateDinnerPlan = useCallback((day: DayOfWeek, update: Partial<DinnerPlan>) => {
    setSchedule((prev) => {
      const next = prev.map((d) => {
        if (d.day !== day) return d;
        return {
          ...d,
          dinner: {
            ...d.dinner,
            ...update,
          },
        };
      });

      const authorName = activeUser === 'partner1' ? settings.partner1.name : settings.partner2.name;
      const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
      const mealName = update.mealName ? ` to "${update.mealName}"` : '';

      addNotification({
        authorId: activeUser,
        authorName,
        title: `${authorName} updated ${dayLabel} Dinner 🍳`,
        message: update.type === 'separate'
          ? `${authorName} set ${dayLabel} to separate / own dinners.`
          : `${authorName} updated ${dayLabel} dinner${mealName}.`,
        type: 'dinner_update',
        day,
      });

      broadcastChange('DINNER_UPDATE', next, `${authorName} updated ${dayLabel} dinner`);
      return next;
    });
  }, [activeUser, settings, addNotification]);

  const updateWeekendVibes = useCallback((day: DayOfWeek, update: Partial<import('../types').WeekendVibesPlan>) => {
    setSchedule((prev) => {
      const next = prev.map((d) => {
        if (d.day !== day) return d;
        const currentVibes = d.weekendVibes || {
          enabled: true,
          mood: 'chill_reset',
          morningVibe: '',
          afternoonPlan: '',
          eveningVibe: '',
          funTags: [],
          noAlarm: true,
        };
        return {
          ...d,
          weekendVibes: {
            ...currentVibes,
            ...update,
          },
        };
      });

      const authorName = activeUser === 'partner1' ? settings.partner1.name : settings.partner2.name;
      const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);

      addNotification({
        authorId: activeUser,
        authorName,
        title: `${authorName} updated ${dayLabel} Weekend Vibes 🥂`,
        message: `New casual weekend plans & fun activities added!`,
        type: 'schedule_update',
        day,
      });

      broadcastChange('SCHEDULE_UPDATE', next, `${authorName} updated ${dayLabel} Weekend Vibes`);
      return next;
    });
  }, [activeUser, settings, addNotification]);

  const saveFullDayRoutine = useCallback((
    day: DayOfWeek,
    p1Am: ScheduleBlock,
    p1Pm: ScheduleBlock,
    p2Am: ScheduleBlock,
    p2Pm: ScheduleBlock,
    dinner: DinnerPlan
  ) => {
    setSchedule((prev) => {
      const next = prev.map((d) => {
        if (d.day !== day) return d;
        return {
          ...d,
          partner1: { am: p1Am, pm: p1Pm },
          partner2: { am: p2Am, pm: p2Pm },
          dinner,
        };
      });

      const authorName = activeUser === 'partner1' ? settings.partner1.name : settings.partner2.name;
      const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);

      addNotification({
        authorId: activeUser,
        authorName,
        title: `${authorName} saved ${dayLabel} schedule`,
        message: `Both AM/PM and dinner plans synchronized for ${dayLabel}.`,
        type: 'schedule_update',
        day,
      });

      broadcastChange('SCHEDULE_UPDATE', next, `${authorName} synced ${dayLabel}`);
      return next;
    });
  }, [activeUser, settings, addNotification]);

  const addRecipe = useCallback((recipe: Recipe) => {
    setRecipes((prev) => [recipe, ...prev]);
    const authorName = activeUser === 'partner1' ? settings.partner1.name : settings.partner2.name;
    addNotification({
      authorId: activeUser,
      authorName,
      title: 'New Recipe Added 📖',
      message: `${authorName} added "${recipe.name}" to the recipe collection!`,
      type: 'dinner_update',
    });
  }, [activeUser, settings, addNotification]);

  const updateRecipe = useCallback((id: string, update: Partial<Recipe>) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...update } : r))
    );
  }, []);

  const deleteRecipe = useCallback((id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleIngredientChecked = useCallback((recipeId: string, ingredientIdx: number) => {
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id !== recipeId) return r;
        const newIngredients = [...r.ingredients];
        if (newIngredients[ingredientIdx]) {
          newIngredients[ingredientIdx] = {
            ...newIngredients[ingredientIdx],
            checked: !newIngredients[ingredientIdx].checked,
          };
        }
        return { ...r, ingredients: newIngredients };
      })
    );
  }, []);

  const updateSettings = useCallback((update: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...update }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Demo tool: simulate an update incoming from the other partner
  const simulatePartnerUpdate = useCallback((scenario?: string) => {
    const otherPartnerId: PartnerId = activeUser === 'partner1' ? 'partner2' : 'partner1';
    const otherPartner = otherPartnerId === 'partner1' ? settings.partner1 : settings.partner2;

    if (scenario === 'tuesday_drinks') {
      updateScheduleBlock('tuesday', otherPartnerId, 'pm', {
        activity: 'Drinks with coworkers & Team Trivia 🍺',
        notes: 'Heading to the Crown & Anchor until 9pm!',
        workLocation: 'office',
      });
      updateDinnerPlan('tuesday', {
        type: 'separate',
        cook: 'eating_out',
        partner1OwnDinner: 'Quick dinner at home with Wolfy',
        partner2OwnDinner: 'Pub burger with the team',
      });
    } else if (scenario === 'friday_wfh') {
      updateScheduleBlock('friday', otherPartnerId, 'am', {
        activity: 'Working from Home & Wolfy morning walk 🐾',
        workLocation: 'wfh',
        wolfyDuty: true,
        notes: 'Coffee made for both of us by 8am!',
      });
      showToast({
        id: String(Date.now()),
        title: `${otherPartner.name} updated Friday AM!`,
        message: 'Swapped to WFH & taking Wolfy on morning walk!',
        authorName: otherPartner.name,
        type: 'schedule_update',
      });
    } else if (scenario === 'thursday_dinner') {
      updateDinnerPlan('thursday', {
        type: 'together',
        cook: otherPartnerId,
        mealName: '15-Minute Lemon Herb Chicken Cutlets with Orzo',
        recipeId: 'recipe-5',
        tags: ['Quick', 'Fresh', 'High Protein'],
        recipeNotes: `${otherPartner.name} is cooking! Ingredients ready.`,
      });
      showToast({
        id: String(Date.now()),
        title: `${otherPartner.name} claimed Thursday dinner! 👨‍🍳`,
        message: 'Cooking 15-Minute Lemon Herb Chicken for both of us!',
        authorName: otherPartner.name,
        type: 'dinner_update',
      });
    } else {
      // Default Wolfy walk nudge
      addNotification({
        authorId: otherPartnerId,
        authorName: otherPartner.name,
        title: `${otherPartner.name} nudged you 🐾`,
        message: 'Wolfy is waiting patiently by his leash for the afternoon walk!',
        type: 'nudge',
      });
      showToast({
        id: String(Date.now()),
        title: `${otherPartner.name} sent a Wolfy Nudge 🐾`,
        message: 'Can you take Wolfy on the afternoon stroll?',
        authorName: otherPartner.name,
        type: 'nudge',
      });
    }
  }, [activeUser, settings, updateScheduleBlock, updateDinnerPlan, showToast, addNotification]);

  const checkSundayPromptDue = useCallback(() => {
    if (!settings.sundayReminderEnabled) return false;
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday
    // For demonstration, if today is Sunday, or if user triggers it
    return day === 0;
  }, [settings.sundayReminderEnabled]);

  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEY_SCHEDULE);
    localStorage.removeItem(STORAGE_KEY_RECIPES);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
    setSchedule(INITIAL_SCHEDULE);
    setRecipes(INITIAL_RECIPES);
    setSettings(INITIAL_SETTINGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveUserState('partner1');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <WolfyContext.Provider
      value={{
        schedule,
        recipes,
        settings,
        notifications,
        activeUser,
        activeTab,
        selectedDay,
        liveToast,
        isSundayWizardOpen,
        isInviteModalOpen,
        selectedRecipeModal,
        unreadCount,

        setActiveTab,
        setSelectedDay,
        setActiveUser,
        setIsSundayWizardOpen,
        setIsInviteModalOpen,
        setSelectedRecipeModal,

        updateScheduleBlock,
        updateDinnerPlan,
        updateWeekendVibes,
        saveFullDayRoutine,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        toggleIngredientChecked,

        updateSettings,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        dismissToast,

        simulatePartnerUpdate,
        checkSundayPromptDue,
        resetToDefaults,
      }}
    >
      {children}
    </WolfyContext.Provider>
  );
};

export const useWolfy = () => {
  const context = useContext(WolfyContext);
  if (!context) {
    throw new Error('useWolfy must be used within a WolfyProvider');
  }
  return context;
};
