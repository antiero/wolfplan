import React from 'react';
import { useWolfy } from '../context/WolfyContext';
import { WolfyAvatar } from './WolfyAvatar';
import { Sparkles, ArrowRight, Clock } from 'lucide-react';

export const SundayPromptBanner: React.FC = () => {
  const { settings, setIsSundayWizardOpen } = useWolfy();

  if (!settings.sundayReminderEnabled) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/70 border border-amber-600/40 rounded-2xl p-4 sm:p-5 shadow-lg mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="shrink-0 pt-0.5">
            <WolfyAvatar size="lg" mood="happy" showBadge badgeText="⏰" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                <Clock className="w-3 h-3" />
                Sunday Routine Check-in ({settings.sundayReminderTime})
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-amber-100 mt-1 font-serif">
              Ready for the week ahead?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl leading-relaxed">
              Drop in rough AM / PM blocks and dinners for {settings.partner1.name} & {settings.partner2.name}. No fussy calendar invites—just who's home, who's out, and who's cooking!
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setIsSundayWizardOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-stone-950" />
            <span>Start Sunday Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
