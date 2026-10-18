import React from 'react';
import { useWolfy } from '../context/WolfyContext';
import { X, Sparkles, Utensils, Calendar, Bell } from 'lucide-react';
import { WolfyAvatar } from './WolfyAvatar';

export const ToastBanner: React.FC = () => {
  const { liveToast, dismissToast, setActiveTab } = useWolfy();

  if (!liveToast) return null;

  const getIcon = () => {
    switch (liveToast.type) {
      case 'dinner_update':
        return <Utensils className="w-4 h-4 text-emerald-400" />;
      case 'schedule_update':
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'nudge':
        return <WolfyAvatar size="sm" mood="walkies" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-300" />;
    }
  };

  return (
    <div className="fixed top-16 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 transition-all animate-in slide-in-from-top-4 duration-300">
      <div className="bg-stone-900/95 border border-amber-600/60 text-stone-100 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-700/40 shrink-0">
          {getIcon()}
        </div>
        <div
          className="flex-1 cursor-pointer"
          onClick={() => {
            if (liveToast.type === 'dinner_update') setActiveTab('dinners');
            else if (liveToast.type === 'schedule_update') setActiveTab('routine');
            else setActiveTab('notifications');
            dismissToast();
          }}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-300">{liveToast.title}</h4>
            <span className="text-[10px] text-stone-400">Just now</span>
          </div>
          <p className="text-xs text-stone-200 mt-0.5 line-clamp-2">{liveToast.message}</p>
          <span className="text-[10px] text-amber-400 font-semibold underline mt-1 inline-block">
            Tap to view in app →
          </span>
        </div>
        <button
          onClick={dismissToast}
          className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
