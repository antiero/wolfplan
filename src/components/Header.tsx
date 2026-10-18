import React, { useState } from 'react';
import { useWolfy } from '../context/WolfyContext';
import { WolfyAvatar } from './WolfyAvatar';
import { GoogleAuthButton } from './GoogleAuthButton';
import {
  Bell,
  UserPlus,
  CalendarCheck,
  Sparkles,
  Users,
  Check,
  ChevronDown,
  Volume2,
  Calendar,
} from 'lucide-react';
import { PartnerId } from '../types';

export const Header: React.FC = () => {
  const {
    settings,
    activeUser,
    setActiveUser,
    unreadCount,
    setActiveTab,
    activeTab,
    setIsSundayWizardOpen,
    setIsInviteModalOpen,
    setIsCalendarModalOpen,
    simulatePartnerUpdate,
    authUser,
  } = useWolfy();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);

  const currentUser = activeUser === 'partner1' ? settings.partner1 : settings.partner2;
  const partnerUser = activeUser === 'partner1' ? settings.partner2 : settings.partner1;

  const handleSwitchUser = (newId: PartnerId) => {
    setActiveUser(newId);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1F1B19]/95 backdrop-blur-md border-b border-stone-800 text-stone-100 shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between">
        
        {/* Brand & Wolfy Logo */}
        <div className="flex items-center gap-2.5">
          <div
            onClick={() => setActiveTab('routine')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <WolfyAvatar size="sm" mood="happy" />
            <span className="font-extrabold text-lg tracking-tight text-amber-100 font-serif group-hover:text-amber-400 transition-colors">
              Wolfy
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Google Sign in & Calendar Sync */}
          <GoogleAuthButton compact />

          {/* Sunday Check-in Button */}
          <button
            onClick={() => setIsSundayWizardOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all shadow-xs"
            title="Start Sunday 9:30 PM Routine Check-in"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Sunday Check-in</span>
          </button>

          {/* Simulate Partner Live Demo Menu */}
          <div className="relative">
            <button
              onClick={() => setIsSimulateOpen(!isSimulateOpen)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
              title="Test real-time partner notification update"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Test Sync</span>
            </button>

            {isSimulateOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-stone-800">
                  <p className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Real-time Sync Simulator
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Trigger an instant live update from {partnerUser.name}:
                  </p>
                </div>
                <div className="py-1 space-y-1">
                  <button
                    onClick={() => {
                      simulatePartnerUpdate('tuesday_drinks');
                      setIsSimulateOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-stone-800 text-stone-200 transition-colors flex flex-col"
                  >
                    <span className="font-semibold text-amber-200">🍻 Tuesday: Out with workmates</span>
                    <span className="text-[10px] text-stone-400">Sets Tuesday PM out & separate dinner</span>
                  </button>
                  <button
                    onClick={() => {
                      simulatePartnerUpdate('thursday_dinner');
                      setIsSimulateOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-stone-800 text-stone-200 transition-colors flex flex-col"
                  >
                    <span className="font-semibold text-emerald-300">👨‍🍳 Thursday: Cooking Lemon Chicken</span>
                    <span className="text-[10px] text-stone-400">Claims cooking duty with recipe</span>
                  </button>
                  <button
                    onClick={() => {
                      simulatePartnerUpdate('friday_wfh');
                      setIsSimulateOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-stone-800 text-stone-200 transition-colors flex flex-col"
                  >
                    <span className="font-semibold text-sky-300">💻 Friday: Swapped to WFH</span>
                    <span className="text-[10px] text-stone-400">Working home & taking Wolfy walk</span>
                  </button>
                  <button
                    onClick={() => {
                      simulatePartnerUpdate('wolfy_walk');
                      setIsSimulateOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-stone-800 text-stone-200 transition-colors flex flex-col"
                  >
                    <span className="font-semibold text-amber-300">🐾 Wolfy Dog Walk Nudge</span>
                    <span className="text-[10px] text-stone-400">Nudge partner for dog walkies</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active User Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-stone-800/90 hover:bg-stone-700/90 border border-stone-700 text-xs font-semibold text-stone-200 transition-colors"
            >
              <span className={`w-5 h-5 rounded-full ${currentUser.avatarBg} text-white flex items-center justify-center text-[10px] font-bold shadow-xs`}>
                {currentUser.shortName.charAt(0)}
              </span>
              <span className="max-w-[70px] sm:max-w-[100px] truncate">{currentUser.name}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-stone-800 text-left">
                  <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">Active Device Profile</p>
                  <p className="text-xs text-stone-300">Switch who is editing this schedule:</p>
                </div>
                <div className="py-1 space-y-1">
                  <button
                    onClick={() => handleSwitchUser('partner1')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-colors ${
                      activeUser === 'partner1' ? 'bg-amber-600/30 text-amber-200 border border-amber-600/50' : 'hover:bg-stone-800 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full ${settings.partner1.avatarBg} text-white flex items-center justify-center text-[10px]`}>
                        {settings.partner1.shortName.charAt(0)}
                      </span>
                      <span>{settings.partner1.name} (Partner 1)</span>
                    </div>
                    {activeUser === 'partner1' && <Check className="w-4 h-4 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => handleSwitchUser('partner2')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-colors ${
                      activeUser === 'partner2' ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-600/50' : 'hover:bg-stone-800 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full ${settings.partner2.avatarBg} text-white flex items-center justify-center text-[10px]`}>
                        {settings.partner2.shortName.charAt(0)}
                      </span>
                      <span>{settings.partner2.name} (Partner 2)</span>
                    </div>
                    {activeUser === 'partner2' && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                </div>
                <div className="pt-1.5 border-t border-stone-800">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsInviteModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 rounded-xl transition-colors font-medium"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invite / Pair Device</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`relative p-2 rounded-full border transition-colors ${
              activeTab === 'notifications'
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-stone-800/80 hover:bg-stone-700 border-stone-700 text-stone-300'
            }`}
            title="Notifications & Activity Log"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Invite Partner Button */}
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="hidden sm:flex p-2 rounded-full bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-amber-300 transition-colors"
            title="Invite Partner"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
