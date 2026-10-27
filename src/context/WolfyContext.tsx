import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  DaySchedule,
  Recipe,
  AppSettings,
  NotificationItem,
  DayOfWeek,
  PartnerId,
  ScheduleBlock,
  DinnerPlan,
  WeekendVibesPlan,
} from '../types';
import {
  INITIAL_SCHEDULE,
  INITIAL_RECIPES,
  INITIAL_SETTINGS,
  INITIAL_NOTIFICATIONS,
  BLANK_SCHEDULE_TEMPLATE,
} from '../data/initialData';
import { playChime } from '../utils/sound';
import { User } from 'firebase/auth';
import { syncScheduleWithCurrentWeek, formatWeekHeader } from '../utils/dates';
import {
  initAuth,
  googleSignIn,
  logout,
  saveScheduleDoc,
  fetchScheduleOnce,
  subscribeToWeeklySchedule,
  saveRecipeDoc,
  deleteRecipeDoc,
  subscribeToRecipes,
  savePairingDoc,
  fetchPairingOnce,
  subscribeToPairing,
  testFirestoreConnection,
  setAccessToken,
} from '../services/firebase';

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
  weekOffset: number;
  currentWeekHeader: string;
  liveToast: ToastNotification | null;
  isSundayWizardOpen: boolean;
  isInviteModalOpen: boolean;
  isCalendarModalOpen: boolean;
  isProfileModalOpen: boolean;
  selectedRecipeModal: Recipe | null;
  unreadCount: number;

  // Auth & Cloud Sync
  authUser: User | null;
  googleAccessToken: string | null;
  isCloudSyncing: boolean;
  lastCloudSync: Date | null;

  setWeekOffset: (offset: number) => void;
  setActiveTab: (tab: 'routine' | 'dinners' | 'sunday' | 'recipes' | 'notifications' | 'settings') => void;
  setSelectedDay: (day: DayOfWeek) => void;
  setActiveUser: (user: PartnerId) => void;
  setIsSundayWizardOpen: (open: boolean) => void;
  setIsInviteModalOpen: (open: boolean) => void;
  setIsCalendarModalOpen: (open: boolean) => void;
  setIsProfileModalOpen: (open: boolean) => void;
  setSelectedRecipeModal: (recipe: Recipe | null) => void;

  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;

  updateScheduleBlock: (day: DayOfWeek, partnerId: PartnerId, period: 'am' | 'pm', update: Partial<ScheduleBlock>) => void;
  updateDinnerPlan: (day: DayOfWeek, update: Partial<DinnerPlan>) => void;
  updateWeekendVibes: (day: DayOfWeek, update: Partial<WeekendVibesPlan>) => void;
  saveFullDayRoutine: (day: DayOfWeek, p1Am: ScheduleBlock, p1Pm: ScheduleBlock, p2Am: ScheduleBlock, p2Pm: ScheduleBlock, dinner: DinnerPlan) => void;
  
  hasCompletedFirstWeek: boolean;
  previousWeekSchedule: DaySchedule[] | null;
  populateFromPreviousWeek: () => void;
  startFromScratch: () => void;
  archiveCurrentWeekAsPrevious: () => void;

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
const STORAGE_KEY_PREV_WEEK = 'wolfy_prev_week_v2';
const STORAGE_KEY_HAS_COMPLETED = 'wolfy_has_completed_week_v2';

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

  const [weekOffset, setWeekOffset] = useState<number>(0);

  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCHEDULE);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Automatically sync schedule day dates to current week so dates never freeze on last week
        return syncScheduleWithCurrentWeek(parsed, new Date(), 0);
      }
    } catch {
      // fallback
    }
    return syncScheduleWithCurrentWeek(INITIAL_SCHEDULE, new Date(), 0);
  });

  const [previousWeekSchedule, setPreviousWeekSchedule] = useState<DaySchedule[] | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREV_WEEK);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_SCHEDULE;
  });

  const [hasCompletedFirstWeek, setHasCompletedFirstWeek] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HAS_COMPLETED);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return true; // allows 2nd run copy prompt
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
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const pairParam = params?.get('pair');
    const nameParam = params?.get('name') || params?.get('p2Name');
    const p1NameParam = params?.get('p1Name');
    const userParam = params?.get('user');

    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (pairParam) parsed.pairCode = pairParam;
        
        // Permanently normalize any legacy 'Alex', 'Partner', or empty partner2 names to Beth
        if (
          !parsed.partner2?.name ||
          parsed.partner2.name === 'Partner' ||
          parsed.partner2.name === 'Partner 2' ||
          parsed.partner2.name === 'Alex' ||
          userParam === 'partner2'
        ) {
          const finalP2Name = nameParam || (parsed.partner2?.name === 'Alex' || !parsed.partner2?.name ? 'Beth' : parsed.partner2.name);
          parsed.partner2 = {
            ...parsed.partner2,
            name: finalP2Name,
            shortName: finalP2Name.slice(0, 4),
          };
        }

        // Permanently normalize any legacy 'Alex', 'Partner', or empty partner1 names to Antony
        if (
          !parsed.partner1?.name ||
          parsed.partner1.name === 'Partner' ||
          parsed.partner1.name === 'Partner 1' ||
          parsed.partner1.name === 'Alex'
        ) {
          const finalP1Name = p1NameParam || (parsed.partner1?.name === 'Alex' || !parsed.partner1?.name ? 'Antony' : parsed.partner1.name);
          parsed.partner1 = {
            ...parsed.partner1,
            name: finalP1Name,
            shortName: finalP1Name.slice(0, 4),
          };
        }

        return parsed;
      }
    } catch {
      // fallback
    }
    const initial = { ...INITIAL_SETTINGS };
    if (pairParam) initial.pairCode = pairParam;
    if (nameParam) {
      initial.partner2 = {
        ...initial.partner2,
        name: nameParam,
        shortName: nameParam.slice(0, 4),
      };
    }
    if (p1NameParam) {
      initial.partner1 = {
        ...initial.partner1,
        name: p1NameParam,
        shortName: p1NameParam.slice(0, 4),
      };
    }
    return initial;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (saved) {
        const parsed: NotificationItem[] = JSON.parse(saved);
        return parsed.map((n) =>
          n.authorName === 'Alex' ? { ...n, authorName: 'Beth' } : n
        );
      }
    } catch {
      // fallback
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [activeTab, setActiveTab] = useState<'routine' | 'dinners' | 'sunday' | 'recipes' | 'notifications' | 'settings'>('routine');
  
  const todayDayName = (['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()] || 'monday') as DayOfWeek;
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDayName);

  const [liveToast, setLiveToast] = useState<ToastNotification | null>(null);
  const [isSundayWizardOpen, setIsSundayWizardOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<Recipe | null>(null);

  // Auth & Cloud sync states
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [lastCloudSync, setLastCloudSync] = useState<Date | null>(null);

  const isInitialRemoteLoad = useRef(false);

  // Initialize Firebase Auth listener & Test connection on boot
  useEffect(() => {
    testFirestoreConnection();
    const unsubscribe = initAuth(
      (user, token) => {
        setAuthUser(user);
        if (token) setGoogleAccessToken(token);
      },
      () => {
        setAuthUser(null);
        setGoogleAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Listen to Firestore real-time updates when user is authenticated
  useEffect(() => {
    if (!authUser || !settings.pairCode) return;

    setIsCloudSyncing(true);
    const unsubSchedule = subscribeToWeeklySchedule(
      settings.pairCode,
      (remoteSchedules) => {
        if (remoteSchedules && remoteSchedules.length > 0) {
          // Always keep schedule dates matching the active week so dates never freeze on last week
          const synced = syncScheduleWithCurrentWeek(remoteSchedules, new Date(), weekOffset);
          setSchedule(synced);
          setLastCloudSync(new Date());
          isInitialRemoteLoad.current = true;
        }
        setIsCloudSyncing(false);
      },
      () => {
        setIsCloudSyncing(false);
      }
    );

    const unsubRecipes = subscribeToRecipes(settings.pairCode, (remoteRecipes) => {
      if (remoteRecipes && remoteRecipes.length > 0) {
        setRecipes(remoteRecipes);
      }
    });

    const unsubPairing = subscribeToPairing(settings.pairCode, (remotePairing) => {
      if (remotePairing) {
        let needsSyncBack = false;
        const cleanPairing = { ...remotePairing };

        // Normalize partner2 name if legacy 'Alex' or 'Partner'
        if (cleanPairing.partner2?.name === 'Alex' || cleanPairing.partner2?.name === 'Partner' || cleanPairing.partner2?.name === 'Partner 2') {
          cleanPairing.partner2 = {
            ...cleanPairing.partner2,
            name: 'Beth',
            shortName: 'Beth',
          };
          needsSyncBack = true;
        }

        // Normalize partner1 name if legacy 'Alex' or 'Partner'
        if (cleanPairing.partner1?.name === 'Alex' || cleanPairing.partner1?.name === 'Partner' || cleanPairing.partner1?.name === 'Partner 1') {
          cleanPairing.partner1 = {
            ...cleanPairing.partner1,
            name: 'Antony',
            shortName: 'Ant',
          };
          needsSyncBack = true;
        }

        setSettings((prev) => ({
          ...prev,
          ...cleanPairing,
          partner1: { ...prev.partner1, ...(cleanPairing.partner1 || {}) },
          partner2: { ...prev.partner2, ...(cleanPairing.partner2 || {}) },
        }));

        if (needsSyncBack && authUser) {
          savePairingDoc(settings.pairCode, cleanPairing);
        }
      }
    });

    return () => {
      unsubSchedule();
      unsubRecipes();
      unsubPairing();
    };
  }, [authUser, settings.pairCode, weekOffset]);

  // Keep schedule dates updated if weekOffset changes
  useEffect(() => {
    setSchedule((prev) => syncScheduleWithCurrentWeek(prev, new Date(), weekOffset));
  }, [weekOffset]);

  const currentWeekHeader = formatWeekHeader(new Date(), weekOffset);

  // Google Login flow
  const loginWithGoogle = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setAuthUser(result.user);
        setGoogleAccessToken(result.accessToken);
        setAccessToken(result.accessToken);
        showToast({
          id: String(Date.now()),
          title: 'Google Connected 📅',
          message: `Signed in as ${result.user.displayName || result.user.email}. Persistent cloud storage & Google Calendar active!`,
          authorName: 'Google',
          type: 'google_connected',
        });
        playChime('success');

        // Sync shared couple schedule from Firestore
        const existingRemoteSchedule = await fetchScheduleOnce(settings.pairCode);
        if (existingRemoteSchedule && existingRemoteSchedule.length > 0) {
          const synced = syncScheduleWithCurrentWeek(existingRemoteSchedule, new Date(), weekOffset);
          setSchedule(synced);
        } else {
          schedule.forEach((d) => saveScheduleDoc(settings.pairCode, d));
          recipes.forEach((r) => saveRecipeDoc(settings.pairCode, r));
        }

        // Sync pairing settings & partner names from Firestore
        const remotePairing = await fetchPairingOnce(settings.pairCode);
        if (remotePairing) {
          let needsSyncBack = false;
          const cleanPairing = { ...remotePairing };

          if (cleanPairing.partner2?.name === 'Alex' || cleanPairing.partner2?.name === 'Partner' || cleanPairing.partner2?.name === 'Partner 2') {
            cleanPairing.partner2 = {
              ...cleanPairing.partner2,
              name: 'Beth',
              shortName: 'Beth',
            };
            needsSyncBack = true;
          }

          if (cleanPairing.partner1?.name === 'Alex' || cleanPairing.partner1?.name === 'Partner' || cleanPairing.partner1?.name === 'Partner 1') {
            cleanPairing.partner1 = {
              ...cleanPairing.partner1,
              name: 'Antony',
              shortName: 'Ant',
            };
            needsSyncBack = true;
          }

          setSettings((prev) => {
            const next = {
              ...prev,
              ...cleanPairing,
              partner1: { ...prev.partner1, ...(cleanPairing.partner1 || {}) },
              partner2: { ...prev.partner2, ...(cleanPairing.partner2 || {}) },
            };
            const activeProfile = next[activeUser];
            // Auto-populate Google profile photo if not yet set
            if (!activeProfile.photoUrl && result.user.photoURL) {
              activeProfile.photoUrl = result.user.photoURL;
            }
            return next;
          });

          if (needsSyncBack) {
            savePairingDoc(settings.pairCode, cleanPairing);
          }
        } else {
          // If first user, persist initial pairing doc with partner names
          savePairingDoc(settings.pairCode, settings);
        }

        setLastCloudSync(new Date());
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
      setAuthUser(null);
      setGoogleAccessToken(null);
      setAccessToken(null);
      showToast({
        id: String(Date.now()),
        title: 'Signed Out',
        message: 'Signed out of Google account. Local data remains saved.',
        authorName: 'Wolfy',
        type: 'logout',
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Local storage persistence
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
    setTimeout(() => {
      setLiveToast((current) => (current?.id === toast.id ? null : current));
    }, 5500);
  }, [settings.realtimeAlerts]);

  const dismissToast = () => setLiveToast(null);

  // Cross-tab broadcast synchronization
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
      // BroadcastChannel fallback
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
    setNotifications((prev) => [newItem, ...prev.slice(0, 49)]);
    return newItem;
  }, []);

  const updateScheduleBlock = useCallback((
    day: DayOfWeek,
    targetPartner: PartnerId,
    period: 'am' | 'pm',
    update: Partial<ScheduleBlock>
  ) => {
    setSchedule((prev) => {
      let updatedDayDoc: DaySchedule | null = null;
      const next = prev.map((d) => {
        if (d.day !== day) return d;
        const currentPartnerData = d[targetPartner];
        const updatedPeriod = { ...currentPartnerData[period], ...update };
        const updatedDoc = {
          ...d,
          [targetPartner]: {
            ...currentPartnerData,
            [period]: updatedPeriod,
          },
        };
        updatedDayDoc = updatedDoc;
        return updatedDoc;
      });

      const authorName = activeUser === 'partner1' ? settings.partner1.name : settings.partner2.name;
      const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
      const activitySummary = update.activity ? ` (${update.activity})` : '';

      addNotification({
        authorId: activeUser,
        authorName,
        title: `${authorName} updated ${dayLabel} ${period.toUpperCase()}`,
        message: `${authorName} modified their ${period.toUpperCase()} plan${activitySummary}.`,
        type: 'schedule_update',
        day,
      });

      broadcastChange('SCHEDULE_UPDATE', next, `${authorName} updated ${dayLabel} ${period.toUpperCase()}`);

      // Sync to Firestore if authenticated
      if (updatedDayDoc) {
        saveScheduleDoc(settings.pairCode, updatedDayDoc);
        setLastCloudSync(new Date());
      }

      return next;
    });
  }, [activeUser, settings, addNotification]);

  const updateDinnerPlan = useCallback((day: DayOfWeek, update: Partial<DinnerPlan>) => {
    setSchedule((prev) => {
      let updatedDayDoc: DaySchedule | null = null;
      const next = prev.map((d) => {
        if (d.day !== day) return d;
        const updatedDoc = {
          ...d,
          dinner: {
            ...d.dinner,
            ...update,
          },
        };
        updatedDayDoc = updatedDoc;
        return updatedDoc;
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

      if (updatedDayDoc) {
        saveScheduleDoc(settings.pairCode, updatedDayDoc);
        setLastCloudSync(new Date());
      }

      return next;
    });
  }, [activeUser, settings, addNotification]);

  const updateWeekendVibes = useCallback((day: DayOfWeek, update: Partial<WeekendVibesPlan>) => {
    setSchedule((prev) => {
      let updatedDayDoc: DaySchedule | null = null;
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
        const updatedDoc = {
          ...d,
          weekendVibes: {
            ...currentVibes,
            ...update,
          },
        };
        updatedDayDoc = updatedDoc;
        return updatedDoc;
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

      if (updatedDayDoc) {
        saveScheduleDoc(settings.pairCode, updatedDayDoc);
        setLastCloudSync(new Date());
      }

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
      let updatedDayDoc: DaySchedule | null = null;
      const next = prev.map((d) => {
        if (d.day !== day) return d;
        const updatedDoc = {
          ...d,
          partner1: { am: p1Am, pm: p1Pm },
          partner2: { am: p2Am, pm: p2Pm },
          dinner,
        };
        updatedDayDoc = updatedDoc;
        return updatedDoc;
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

      if (updatedDayDoc) {
        saveScheduleDoc(settings.pairCode, updatedDayDoc);
        setLastCloudSync(new Date());
      }

      return next;
    });
  }, [activeUser, settings, addNotification]);

  const populateFromPreviousWeek = useCallback(() => {
    const sourceSchedule = (previousWeekSchedule && previousWeekSchedule.length > 0)
      ? previousWeekSchedule
      : INITIAL_SCHEDULE;

    setSchedule((current) => {
      const next = current.map((dayItem, idx) => {
        const prevDay = sourceSchedule[idx] || sourceSchedule.find((p) => p.day === dayItem.day);
        if (!prevDay) return dayItem;
        const updated = {
          ...dayItem,
          partner1: {
            am: { ...prevDay.partner1.am },
            pm: { ...prevDay.partner1.pm },
          },
          partner2: {
            am: { ...prevDay.partner2.am },
            pm: { ...prevDay.partner2.pm },
          },
          weekendVibes: prevDay.weekendVibes ? { ...prevDay.weekendVibes } : dayItem.weekendVibes,
        };
        saveScheduleDoc(settings.pairCode, updated);
        return updated;
      });
      return next;
    });
    playChime('success');
  }, [previousWeekSchedule, settings.pairCode]);

  const startFromScratch = useCallback(() => {
    setSchedule((current) => {
      const next = current.map((dayItem) => {
        const blank = {
          ...dayItem,
          partner1: {
            am: { activity: '', workLocation: 'wfh' as const, wolfyDuty: false },
            pm: { activity: '', workLocation: 'wfh' as const, wolfyDuty: false },
          },
          partner2: {
            am: { activity: '', workLocation: 'office' as const, wolfyDuty: false },
            pm: { activity: '', workLocation: 'wfh' as const, wolfyDuty: false },
          },
          dinner: {
            type: 'together' as const,
            cook: 'partner1' as const,
            mealName: '',
            tags: [],
          },
        };
        saveScheduleDoc(settings.pairCode, blank);
        return blank;
      });
      return next;
    });
    playChime('success');
  }, [settings.pairCode]);

  const archiveCurrentWeekAsPrevious = useCallback(() => {
    setPreviousWeekSchedule(schedule);
    setHasCompletedFirstWeek(true);
    try {
      localStorage.setItem(STORAGE_KEY_PREV_WEEK, JSON.stringify(schedule));
      localStorage.setItem(STORAGE_KEY_HAS_COMPLETED, JSON.stringify(true));
    } catch {
      // fallback
    }
  }, [schedule]);

  const addRecipe = useCallback((recipe: Recipe) => {
    setRecipes((prev) => [recipe, ...prev]);
    saveRecipeDoc(settings.pairCode, recipe);
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
    setRecipes((prev) => {
      const next = prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...update };
        saveRecipeDoc(settings.pairCode, updated);
        return updated;
      });
      return next;
    });
  }, [settings.pairCode]);

  const deleteRecipe = useCallback((id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    deleteRecipeDoc(settings.pairCode, id);
  }, [settings.pairCode]);

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
    setSettings((prev) => {
      const next = { ...prev, ...update };
      savePairingDoc(next.pairCode, next);
      return next;
    });
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
        title: `${otherPartner.name} updated Friday Daytime!`,
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
    return now.getDay() === 0;
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
        weekOffset,
        currentWeekHeader,
        liveToast,
        isSundayWizardOpen,
        isInviteModalOpen,
        isCalendarModalOpen,
        isProfileModalOpen,
        selectedRecipeModal,
        unreadCount,

        authUser,
        googleAccessToken,
        isCloudSyncing,
        lastCloudSync,

        setWeekOffset,
        setActiveTab,
        setSelectedDay,
        setActiveUser,
        setIsSundayWizardOpen,
        setIsInviteModalOpen,
        setIsCalendarModalOpen,
        setIsProfileModalOpen,
        setSelectedRecipeModal,

        loginWithGoogle,
        logoutUser,

        updateScheduleBlock,
        updateDinnerPlan,
        updateWeekendVibes,
        saveFullDayRoutine,
        hasCompletedFirstWeek,
        previousWeekSchedule,
        populateFromPreviousWeek,
        startFromScratch,
        archiveCurrentWeekAsPrevious,
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
