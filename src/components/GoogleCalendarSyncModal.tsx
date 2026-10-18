import React, { useState, useEffect } from 'react';
import { useWolfy } from '../context/WolfyContext';
import { WolfyAvatar } from './WolfyAvatar';
import {
  fetchCalendarEvents,
  syncScheduleToGoogleCalendar,
  parseEventsToRoughSchedule,
  CalendarEvent,
} from '../services/googleCalendar';
import {
  X,
  Calendar,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  Clock,
  ShieldCheck,
  Check,
  HelpCircle,
} from 'lucide-react';
import { playChime } from '../utils/sound';

export const GoogleCalendarSyncModal: React.FC = () => {
  const {
    isCalendarModalOpen,
    setIsCalendarModalOpen,
    authUser,
    googleAccessToken,
    loginWithGoogle,
    schedule,
    settings,
    activeUser,
    updateScheduleBlock,
    isCloudSyncing,
    lastCloudSync,
  } = useWolfy();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Sync state
  const [syncingToCalendar, setSyncingToCalendar] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Confirmation state for destructive/mutating Calendar actions (MANDATORY per workspace-integration)
  const [showConfirmExport, setShowConfirmExport] = useState(false);
  const [showConfirmImport, setShowConfirmImport] = useState(false);

  const currentUser = activeUser === 'partner1' ? settings.partner1 : settings.partner2;

  // Load calendar events when modal opens if token is present
  useEffect(() => {
    if (isCalendarModalOpen && googleAccessToken) {
      loadCalendarEvents();
    }
  }, [isCalendarModalOpen, googleAccessToken]);

  const loadCalendarEvents = async () => {
    if (!googleAccessToken) return;
    setLoadingEvents(true);
    setEventsError(null);
    try {
      const items = await fetchCalendarEvents(googleAccessToken);
      setEvents(items);
    } catch (err: unknown) {
      console.error(err);
      setEventsError(err instanceof Error ? err.message : 'Failed to fetch calendar events');
    } finally {
      setLoadingEvents(false);
    }
  };

  // Perform Google Calendar export with explicit user confirmation
  const handleExportToGoogleCalendar = async () => {
    if (!googleAccessToken) return;
    setSyncingToCalendar(true);
    setShowConfirmExport(false);
    setSyncSuccessMsg(null);
    try {
      const count = await syncScheduleToGoogleCalendar(
        googleAccessToken,
        schedule,
        currentUser.name,
        activeUser
      );
      setSyncSuccessMsg(`Successfully synced ${count} Wolfy routine blocks and dinners to your Google Calendar!`);
      playChime('success');
      loadCalendarEvents(); // refresh list
    } catch (err: unknown) {
      setEventsError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncingToCalendar(false);
    }
  };

  // Perform Google Calendar import to rough AM/PM blocks
  const handleImportFromGoogleCalendar = () => {
    setShowConfirmImport(false);
    const parsed = parseEventsToRoughSchedule(events);
    const dayMapRev: Record<string, number> = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 0,
    };

    let importedDays = 0;
    schedule.forEach((dayItem) => {
      const dayNum = dayMapRev[dayItem.day];
      const dayData = parsed[dayNum];
      if (dayData) {
        if (dayData.am.length > 0) {
          updateScheduleBlock(dayItem.day, activeUser, 'am', {
            activity: dayData.am.slice(0, 2).join(' & '),
          });
          importedDays++;
        }
        if (dayData.pm.length > 0) {
          updateScheduleBlock(dayItem.day, activeUser, 'pm', {
            activity: dayData.pm.slice(0, 2).join(' & '),
          });
        }
      }
    });

    setSyncSuccessMsg(`Imported schedule events from your Google Calendar into ${importedDays} days!`);
    playChime('success');
  };

  if (!isCalendarModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-100 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-950 via-stone-900 to-emerald-950/40 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WolfyAvatar size="md" mood="happy" showBadge badgeText="📅" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-emerald-200 font-serif">
                  Google Calendar & Persistent Storage
                </h3>
              </div>
              <p className="text-xs text-stone-400">
                Sync routines with Google Calendar & keep data safely stored in Cloud Firestore
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCalendarModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Firestore Persistent Storage Status Card */}
          <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-sky-200">
                  Google Cloud Firestore Storage Status
                </span>
              </div>
              <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-sky-400" /> Persistent & Encrypted
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Your weekly routine, dinner plans, recipes, and partner sync data are continuously synced to your Google Cloud Firestore database. Plan data is never lost across reloads or device switches.
            </p>
            {lastCloudSync && (
              <p className="text-[11px] text-stone-400">
                Last synced to Cloud: {lastCloudSync.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Google Auth Status Check */}
          {!authUser ? (
            <div className="p-6 rounded-2xl bg-stone-950 border border-stone-800 text-center space-y-3">
              <Calendar className="w-8 h-8 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-stone-200">
                Connect your Google Account
              </h4>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Sign in with Google to allow Wolfy to read your calendar events and add your weekly routines and dinners directly to Google Calendar.
              </p>
              <button
                onClick={loginWithGoogle}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <span>Sign in with Google</span>
              </button>
            </div>
          ) : (
            <>
              {/* Success / Info Message */}
              {syncSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{syncSuccessMsg}</span>
                </div>
              )}

              {/* Error Message */}
              {eventsError && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-700/50 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="flex-1">{eventsError}</span>
                  <button onClick={loadCalendarEvents} className="underline text-xs">
                    Retry
                  </button>
                </div>
              )}

              {/* Action Buttons: Export vs Import */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Export Card */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                      <Upload className="w-4 h-4 text-amber-400" />
                      Sync to Google Calendar
                    </span>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Creates Google Calendar events for {currentUser.name}'s AM, PM, and dinner blocks for the week ahead.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowConfirmExport(true)}
                    disabled={syncingToCalendar}
                    className="mt-3.5 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    {syncingToCalendar ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Syncing to Calendar...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Export Wolfy Week → Calendar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                      <Download className="w-4 h-4 text-emerald-400" />
                      Import from Google Calendar
                    </span>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Reads meetings and appointments from your Google Calendar and suggests rough AM / PM blocks.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowConfirmImport(true)}
                    disabled={events.length === 0}
                    className="mt-3.5 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Auto-Fill from Google Calendar ({events.length} events)</span>
                  </button>
                </div>
              </div>

              {/* EXPLICIT CONFIRMATION DIALOG FOR EXPORT (Mandatory workspace-integration requirement) */}
              {showConfirmExport && (
                <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-600 p-4 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-start gap-2.5">
                    <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-200">
                        Confirm Google Calendar Sync
                      </h4>
                      <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                        Are you sure you want to add this week's AM, PM, and dinner events for <strong>{currentUser.name}</strong> to your primary Google Calendar? New calendar events will be created.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-800/40">
                    <button
                      onClick={() => setShowConfirmExport(false)}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExportToGoogleCalendar}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md"
                    >
                      Yes, Add to Google Calendar
                    </button>
                  </div>
                </div>
              )}

              {/* EXPLICIT CONFIRMATION DIALOG FOR IMPORT */}
              {showConfirmImport && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-600 p-4 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-start gap-2.5">
                    <HelpCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-200">
                        Confirm Calendar Import
                      </h4>
                      <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                        This will populate {currentUser.name}'s AM and PM routine blocks based on {events.length} events found on your Google Calendar for this week. Proceed?
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-800/40">
                    <button
                      onClick={() => setShowConfirmImport(false)}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImportFromGoogleCalendar}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold shadow-md"
                    >
                      Yes, Import Events
                    </button>
                  </div>
                </div>
              )}

              {/* List of current week's events from Google Calendar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Events on Your Primary Google Calendar ({events.length}):
                  </span>
                  <button
                    onClick={loadCalendarEvents}
                    disabled={loadingEvents}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingEvents ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {loadingEvents ? (
                    <div className="py-6 text-center text-xs text-stone-400">
                      Loading your calendar events...
                    </div>
                  ) : events.length > 0 ? (
                    events.map((ev) => {
                      const start = ev.start.dateTime
                        ? new Date(ev.start.dateTime).toLocaleString([], {
                            weekday: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ev.start.date;
                      return (
                        <div
                          key={ev.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-stone-950 border border-stone-800 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-stone-200 font-medium truncate">{ev.summary}</span>
                          </div>
                          <span className="text-[11px] text-stone-400 shrink-0">{start}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-stone-500 py-4 text-center italic">
                      No Google Calendar events found for this week.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            onClick={() => setIsCalendarModalOpen(false)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
