import React, { useState } from 'react';
import { WolfyProvider, useWolfy } from './context/WolfyContext';
import { Header } from './components/Header';
import { ToastBanner } from './components/ToastBanner';
import { WeeklyRoutineView } from './components/WeeklyRoutineView';
import { DinnerPlanView } from './components/DinnerPlanView';
import { RecipesView } from './components/RecipesView';
import { NotificationsView } from './components/NotificationsView';
import { SundayWizardModal } from './components/SundayWizardModal';
import { RecipeModal } from './components/RecipeModal';
import { InvitePartnerModal } from './components/InvitePartnerModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { GoogleCalendarSyncModal } from './components/GoogleCalendarSyncModal';
import { BottomNav } from './components/BottomNav';
import { WolfyAvatar } from './components/WolfyAvatar';
import { Sliders, CalendarCheck, Utensils, Heart } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, setIsSundayWizardOpen, settings } = useWolfy();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#141110] text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <Header />

      {/* Real-time Notification Banner */}
      <ToastBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-5 py-4 sm:py-6">
        {activeTab === 'routine' && <WeeklyRoutineView />}
        {activeTab === 'dinners' && <DinnerPlanView />}
        {activeTab === 'recipes' && <RecipesView />}
        {activeTab === 'notifications' && <NotificationsView />}
        {activeTab === 'settings' && (
          <div className="py-6 text-center">
            {/* Quick trigger for settings modal */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 text-stone-950 font-bold text-sm shadow-md"
            >
              Open Settings
            </button>
          </div>
        )}
      </main>

      {/* Desktop Quick Footer / Info Bar */}
      <footer className="hidden sm:block border-t border-stone-800/80 bg-stone-950/70 text-stone-400 py-4 px-6 text-xs text-center mt-auto">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WolfyAvatar size="sm" mood="happy" />
            <span>
              <strong>Wolfy</strong> — Dedicated to our favorite Black & Tan Jack Russell Poodle 🐾
            </span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <button
              onClick={() => setIsSundayWizardOpen(true)}
              className="hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Sunday Check-in ({settings.sundayReminderTime})</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Floating Bottom Navigation */}
      <BottomNav />

      {/* All Shared Modals */}
      <SundayWizardModal />
      <RecipeModal />
      <InvitePartnerModal />
      <UserProfileModal />
      <GoogleCalendarSyncModal />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <WolfyProvider>
      <MainAppContent />
    </WolfyProvider>
  );
}
