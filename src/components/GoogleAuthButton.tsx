import React from 'react';
import { useWolfy } from '../context/WolfyContext';
import { LogOut, CheckCircle2, Calendar, Cloud, RefreshCw } from 'lucide-react';

export const GoogleAuthButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const {
    authUser,
    googleAccessToken,
    loginWithGoogle,
    logoutUser,
    isCloudSyncing,
    lastCloudSync,
    setIsCalendarModalOpen,
  } = useWolfy();

  if (!authUser) {
    return (
      <button
        onClick={loginWithGoogle}
        className="gsi-material-button inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold shadow-md transition-all border border-stone-200 cursor-pointer active:scale-95"
        title="Sign in with Google to enable Google Calendar & Cloud Storage"
      >
        <div className="w-4 h-4 shrink-0">
          <svg viewBox="0 0 48 48" className="w-full h-full block">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
        </div>
        <span>Sign in with Google</span>
      </button>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setIsCalendarModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/60 transition-colors"
          title="Google Calendar & Cloud Sync Connected"
        >
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Calendar Sync</span>
        </button>
        <button
          onClick={logoutUser}
          className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          title="Sign out of Google"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-stone-900 border border-emerald-700/40 text-stone-200">
      <div className="flex items-center gap-3">
        {authUser.photoURL ? (
          <img
            src={authUser.photoURL}
            alt={authUser.displayName || 'Google User'}
            className="w-8 h-8 rounded-full border border-stone-700 object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
            {authUser.displayName?.charAt(0) || 'G'}
          </div>
        )}
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-stone-100">
              {authUser.displayName || authUser.email}
            </span>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-500/40 flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Connected
            </span>
          </div>
          <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
            <Cloud className="w-3 h-3 text-sky-400" />
            <span>Persistent Firestore storage active</span>
            {isCloudSyncing && <RefreshCw className="w-3 h-3 text-amber-400 animate-spin ml-1" />}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          onClick={() => setIsCalendarModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Calendar Actions</span>
        </button>

        <button
          onClick={logoutUser}
          className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 text-xs transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
