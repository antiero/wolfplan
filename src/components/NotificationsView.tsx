import React from 'react';
import { useWolfy } from '../context/WolfyContext';
import { WolfyAvatar } from './WolfyAvatar';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  Utensils,
  PawPrint,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    simulatePartnerUpdate,
    settings,
    activeUser,
    setActiveTab,
    setSelectedDay,
  } = useWolfy();

  const partnerUser = activeUser === 'partner1' ? settings.partner2 : settings.partner1;

  const formatTimestamp = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getNotifIcon = (type: string, authorId: string) => {
    if (authorId === 'wolfy' || type === 'nudge') {
      return <WolfyAvatar size="sm" mood="walkies" />;
    }
    if (type === 'dinner_update') {
      return <Utensils className="w-4 h-4 text-emerald-400" />;
    }
    return <Calendar className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* Header */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-amber-100 font-serif">
              Partner Activity & Real-time Alerts
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Live updates when {partnerUser.name} modifies the schedule or dinner plan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllNotificationsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
              <button
                onClick={clearNotifications}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-rose-400 transition-colors"
                title="Clear activity log"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Real-time Simulator Callout Box */}
      <div className="bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/40 border border-amber-800/40 rounded-2xl p-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Real-time Notification Testing Center
            </h3>
            <p className="text-xs text-stone-300 mt-0.5">
              Test how live push alerts look when {partnerUser.name} makes schedule or dinner changes:
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => simulatePartnerUpdate('tuesday_drinks')}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-amber-600/30 text-amber-200 border border-amber-700/40 text-xs font-semibold transition-colors"
            >
              🍻 Tuesday: Pub Night
            </button>
            <button
              onClick={() => simulatePartnerUpdate('thursday_dinner')}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-700/40 text-xs font-semibold transition-colors"
            >
              👨‍🍳 Thursday: Cooking Dinner
            </button>
            <button
              onClick={() => simulatePartnerUpdate('friday_wfh')}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-sky-600/30 text-sky-200 border border-sky-700/40 text-xs font-semibold transition-colors"
            >
              💻 Friday: WFH & Dog Walk
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationRead(notif.id);
                if (notif.day) {
                  setSelectedDay(notif.day);
                  if (notif.type === 'dinner_update') setActiveTab('dinners');
                  else setActiveTab('routine');
                }
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                notif.read
                  ? 'bg-stone-900/60 border-stone-800/80 hover:bg-stone-900'
                  : 'bg-stone-900 border-amber-600/50 shadow-md ring-1 ring-amber-500/20'
              }`}
            >
              <div className="p-2 rounded-xl bg-stone-950 border border-stone-800 shrink-0 mt-0.5">
                {getNotifIcon(notif.type, notif.authorId)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs sm:text-sm font-bold ${notif.read ? 'text-stone-300' : 'text-amber-200'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-stone-500 shrink-0">
                    {formatTimestamp(notif.timestamp)}
                  </span>
                </div>

                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {notif.day && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-semibold mt-2">
                    <span className="uppercase">{notif.day}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span>View in schedule</span>
                  </div>
                )}
              </div>

              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 self-center" />
              )}
            </div>
          ))
        ) : (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center text-stone-400">
            <WolfyAvatar size="lg" mood="sleepy" className="mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-stone-300">All caught up!</p>
            <p className="text-xs text-stone-500 mt-1">
              Whenever {partnerUser.name} makes changes to the weekly schedule or dinners, you'll see real-time updates here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
