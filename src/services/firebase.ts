import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { DaySchedule, Recipe, AppSettings } from '../types';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with the provisioned firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Google Auth Provider with Calendar scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar');
provider.addScope('https://www.googleapis.com/auth/calendar.events');

// In-memory token cache (NEVER stored in localStorage per workspace-integration security mandate)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Test connection on boot per Firebase guidelines
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline / check configuration.');
    }
  }
}

// Error Handling Infrastructure per firebase-integration-rpc
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      providerInfo: auth.currentUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Auth Lifecycle
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string | null } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// ---------------- FIRESTORE PERSISTENT STORAGE ----------------

// Save whole week or single day schedule to Firestore
export async function saveScheduleDoc(pairCode: string, daySchedule: DaySchedule) {
  if (!auth.currentUser) return;
  const docId = `${pairCode}_${daySchedule.day}`;
  const path = `schedules/${docId}`;
  try {
    await setDoc(doc(db, 'schedules', docId), {
      ...daySchedule,
      pairCode,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser.uid,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Real-time listener for weekly schedule
export function subscribeToWeeklySchedule(
  pairCode: string,
  onUpdate: (schedules: DaySchedule[]) => void,
  onError?: (error: Error) => void
) {
  if (!auth.currentUser) return () => {};
  const q = query(collection(db, 'schedules'), where('pairCode', '==', pairCode));
  
  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map((doc) => doc.data() as DaySchedule);
        // Sort in order Monday to Sunday
        const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        docs.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
        onUpdate(docs);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'schedules');
      if (onError) onError(error);
    }
  );
}

// Fetch schedule one-time to safely seed without overwriting existing couple data
export async function fetchScheduleOnce(pairCode: string): Promise<DaySchedule[] | null> {
  if (!auth.currentUser) return null;
  const q = query(collection(db, 'schedules'), where('pairCode', '==', pairCode));
  try {
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docs = snapshot.docs.map((d) => d.data() as DaySchedule);
      const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      docs.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
      return docs;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'schedules');
    return null;
  }
}

// Save Recipe to Firestore
export async function saveRecipeDoc(pairCode: string, recipe: Recipe) {
  if (!auth.currentUser) return;
  const docId = `${pairCode}_${recipe.id}`;
  const path = `recipes/${docId}`;
  try {
    await setDoc(doc(db, 'recipes', docId), {
      ...recipe,
      pairCode,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete Recipe from Firestore
export async function deleteRecipeDoc(pairCode: string, recipeId: string) {
  if (!auth.currentUser) return;
  const docId = `${pairCode}_${recipeId}`;
  const path = `recipes/${docId}`;
  try {
    await deleteDoc(doc(db, 'recipes', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Real-time listener for shared recipes
export function subscribeToRecipes(
  pairCode: string,
  onUpdate: (recipes: Recipe[]) => void
) {
  if (!auth.currentUser) return () => {};
  const q = query(collection(db, 'recipes'), where('pairCode', '==', pairCode));

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((doc) => doc.data() as Recipe);
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'recipes');
    }
  );
}

// Save Pairing Settings
export async function savePairingDoc(pairCode: string, settings: Partial<AppSettings>) {
  if (!auth.currentUser) return;
  const path = `pairings/${pairCode}`;
  try {
    await setDoc(
      doc(db, 'pairings', pairCode),
      {
        pairCode,
        partner1: settings.partner1,
        partner2: settings.partner2,
        sundayReminderDay: settings.sundayReminderDay,
        sundayReminderTime: settings.sundayReminderTime,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Fetch Pairing Settings Once from Firestore
export async function fetchPairingOnce(pairCode: string): Promise<Partial<AppSettings> | null> {
  if (!auth.currentUser) return null;
  const path = `pairings/${pairCode}`;
  try {
    const snap = await getDoc(doc(db, 'pairings', pairCode));
    if (snap.exists()) {
      return snap.data() as Partial<AppSettings>;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// Real-time listener for pairing settings & partner profiles
export function subscribeToPairing(
  pairCode: string,
  onUpdate: (pairingData: Partial<AppSettings>) => void,
  onError?: (error: Error) => void
) {
  if (!auth.currentUser) return () => {};
  const docRef = doc(db, 'pairings', pairCode);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as Partial<AppSettings>);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `pairings/${pairCode}`);
    }
  );
}

