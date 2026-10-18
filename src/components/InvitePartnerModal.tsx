import React, { useState } from 'react';
import { useWolfy } from '../context/WolfyContext';
import { WolfyAvatar } from './WolfyAvatar';
import {
  X,
  Copy,
  Check,
  Share2,
  Users,
  Smartphone,
  Sparkles,
  Edit2,
  Save,
} from 'lucide-react';
import { playChime } from '../utils/sound';

export const InvitePartnerModal: React.FC = () => {
  const {
    isInviteModalOpen,
    setIsInviteModalOpen,
    settings,
    updateSettings,
    activeUser,
  } = useWolfy();

  const [copied, setCopied] = useState(false);
  const [partner1Name, setPartner1Name] = useState(settings.partner1.name);
  const [partner2Name, setPartner2Name] = useState(settings.partner2.name);
  const [isEditingNames, setIsEditingNames] = useState(false);

  if (!isInviteModalOpen) return null;

  const inviteUrl = `${window.location.origin}${window.location.pathname}?pair=${settings.pairCode}&user=partner2`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: "Wolfy - Couple's Routine Planner",
          text: `Join our weekly routine, dinner & dog walk planner on Wolfy!`,
          url: inviteUrl,
        });
        return;
      } catch {
        // user dismissed or share failed, fallback to copy
      }
    }
    handleCopyLink();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      playChime('success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleSaveNames = () => {
    updateSettings({
      partner1: { ...settings.partner1, name: partner1Name.trim() || 'Partner 1' },
      partner2: { ...settings.partner2, name: partner2Name.trim() || 'Partner 2' },
    });
    setIsEditingNames(false);
    playChime('success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5">
      <div className="bg-[#181514] border-t sm:border border-stone-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-stone-100 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-950 to-amber-950/40 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WolfyAvatar size="md" mood="happy" showBadge badgeText="💌" />
            <div>
              <h3 className="font-bold text-base sm:text-lg text-amber-200 font-serif">
                Invite Your Partner to Wolfy
              </h3>
              <p className="text-xs text-stone-400">
                Share your weekly routine, dog walks & dinner plans
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsInviteModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          
          {/* Pair Code & Share Link Box */}
          <div className="bg-stone-950 border border-amber-600/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Partner Pair Link
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono">
                Code: {settings.pairCode}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-300 font-mono focus:outline-hidden select-all"
              />
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shrink-0 shadow-md transition-colors"
                title="Share or copy invite link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Share / Copy'}</span>
              </button>
            </div>

            <p className="text-[11px] text-stone-400 leading-relaxed">
              Send this link to your partner (via WhatsApp, iMessage, SMS or email). Opening it pairs her phone directly to your shared Wolfy plan.
            </p>
          </div>

          {/* Quick Steps on Google Auth for Couples */}
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-3.5 space-y-2 text-xs">
            <p className="font-bold text-amber-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              How Couple Sync & Google Auth Works:
            </p>
            <ol className="space-y-1.5 text-stone-300 text-[11px] list-decimal list-inside leading-relaxed">
              <li>
                <strong className="text-stone-100">You sign in:</strong> Tap <em>Sign in with Google</em> on your device to connect your Google account and activate cloud storage.
              </li>
              <li>
                <strong className="text-stone-100">She opens the link:</strong> On her phone, she taps your invite link. Her device automatically loads as Partner 2.
              </li>
              <li>
                <strong className="text-stone-100">She signs in:</strong> She taps <em>Sign in with Google</em> with her own Google account. Her device will sync with yours in real time!
              </li>
            </ol>
          </div>

          {/* Partner Names Editor */}
          <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                Couple Profiles
              </span>
              {!isEditingNames ? (
                <button
                  onClick={() => setIsEditingNames(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Names</span>
                </button>
              ) : (
                <button
                  onClick={handleSaveNames}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                >
                  <Save className="w-3 h-3" />
                  <span>Save Names</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-[10px] text-stone-400 font-medium block mb-1">
                  Partner 1:
                </span>
                {isEditingNames ? (
                  <input
                    type="text"
                    value={partner1Name}
                    onChange={(e) => setPartner1Name(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-100"
                  />
                ) : (
                  <p className="text-sm font-bold text-amber-200">{settings.partner1.name}</p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-[10px] text-stone-400 font-medium block mb-1">
                  Partner 2:
                </span>
                {isEditingNames ? (
                  <input
                    type="text"
                    value={partner2Name}
                    onChange={(e) => setPartner2Name(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-100"
                  />
                ) : (
                  <p className="text-sm font-bold text-emerald-200">{settings.partner2.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Tip on Testing on Same Device */}
          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-900/30 text-xs text-stone-300 flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-amber-200">Testing on one machine?</strong> Open this page in a second browser window or tab. Changes made in one window will instantly trigger real-time notification banners and sound alerts in the other!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            onClick={() => setIsInviteModalOpen(false)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
