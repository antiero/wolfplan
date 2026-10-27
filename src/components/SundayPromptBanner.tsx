import React, { useState } from 'react';
import { useWolfy } from '../context/WolfyContext';
import { WolfyAvatar } from './WolfyAvatar';
import { ArrowRight, Clock, X } from 'lucide-react';

export const SundayPromptBanner: React.FC = () => {
  const { settings, setIsSundayWizardOpen, hasCompletedFirstWeek } = useWolfy();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!settings.sundayReminderEnabled || isDismissed) return null;

  const p1Name = settings.partner1.name === 'Alex' ? 'Antony' : (settings.partner1.name || 'Antony');
  const p2Name = settings.partner2.name === 'Alex' ? 'Beth' : (settings.partner2.name || 'Beth');

  return (
    <div className="bg-stone-900/70 border border-stone-800/80 rounded-2xl p-3 sm:p-3.5 shadow-xs flex items-center justify-between gap-3 transition-all">
      <div className="flex items-center gap-2.5 min-w-0">
        <WolfyAvatar size="sm" mood="happy" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-200 truncate">
            <span className="text-amber-300 font-bold">Sunday Check-in</span>
            <span className="text-stone-500">•</span>
            <span className="text-stone-400 text-[11px] truncate">{settings.sundayReminderTime}</span>
          </div>
          <p className="text-[11px] text-stone-400 truncate">
            {hasCompletedFirstWeek
              ? 'Week agenda: pre-populate from last week or start fresh'
              : `Map out Daytime & Evening blocks for ${p1Name} & ${p2Name}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => setIsSundayWizardOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
        >
          <span>Plan Week</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-stone-500 hover:text-stone-300"
          title="Dismiss for now"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
