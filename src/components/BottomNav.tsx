import React from 'react';
import { useWolfy } from '../context/WolfyContext';
import {
  CalendarDays,
  UtensilsCrossed,
  Sparkles,
  BookOpen,
  Bell,
  Sliders,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, unreadCount, setSelectedDay } = useWolfy();

  const navItems = [
    {
      id: 'routine',
      label: 'Routine',
      icon: <CalendarDays className="w-5 h-5" />,
      badge: 0,
    },
    {
      id: 'dinners',
      label: 'Dinners',
      icon: <UtensilsCrossed className="w-5 h-5" />,
      badge: 0,
    },
    {
      id: 'weekend',
      label: 'Weekend',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      action: () => {
        setSelectedDay('saturday');
        setActiveTab('routine');
      },
      badge: 0,
    },
    {
      id: 'recipes',
      label: 'Recipes',
      icon: <BookOpen className="w-5 h-5" />,
      badge: 0,
    },
    {
      id: 'notifications',
      label: 'Activity',
      icon: <Bell className="w-5 h-5" />,
      badge: unreadCount,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-lg border-t border-stone-800 text-stone-300 pb-safe shadow-2xl">
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  setActiveTab(item.id as typeof activeTab);
                }
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-amber-300 font-bold scale-105'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-stone-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
