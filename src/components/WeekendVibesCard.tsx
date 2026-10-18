import React, { useState } from 'react';
import { useWolfy } from '../context/WolfyContext';
import { DayOfWeek, WeekendMood, WeekendVibesPlan } from '../types';
import { WEEKEND_VIBE_PRESETS } from '../data/initialData';
import { WolfyAvatar } from './WolfyAvatar';
import {
  Sparkles,
  Sun,
  Compass,
  PartyPopper,
  Wine,
  Coffee,
  PawPrint,
  Clock,
  AlarmClockOff,
  Edit3,
  Check,
  Plus,
  Smile,
} from 'lucide-react';

interface WeekendVibesCardProps {
  day: DayOfWeek;
  dateStr: string;
}

export const WeekendVibesCard: React.FC<WeekendVibesCardProps> = ({ day, dateStr }) => {
  const { schedule, updateWeekendVibes, settings, activeUser } = useWolfy();
  const dayData = schedule.find((d) => d.day === day);
  const vibes = dayData?.weekendVibes;

  const [isEditing, setIsEditing] = useState(false);
  const [mood, setMood] = useState<WeekendMood>(vibes?.mood || 'chill_reset');
  const [morningVibe, setMorningVibe] = useState(vibes?.morningVibe || '');
  const [afternoonPlan, setAfternoonPlan] = useState(vibes?.afternoonPlan || '');
  const [eveningVibe, setEveningVibe] = useState(vibes?.eveningVibe || '');
  const [wolfyAdventure, setWolfyAdventure] = useState(vibes?.wolfyAdventure || '');
  const [noAlarm, setNoAlarm] = useState(vibes ? vibes.noAlarm : true);
  const [funTags, setFunTags] = useState<string[]>(vibes?.funTags || []);
  const [customTag, setCustomTag] = useState('');

  const p1 = settings.partner1;
  const p2 = settings.partner2;

  const moodMeta: Record<WeekendMood, { label: string; icon: string; bg: string; border: string; desc: string }> = {
    chill_reset: {
      label: 'Chill & Reset',
      icon: '🛋️',
      bg: 'from-amber-950/60 to-stone-900',
      border: 'border-amber-700/50',
      desc: 'Sleep in, lazy coffee, sofa cuddles with Wolfy & slow pace',
    },
    outdoors_dog: {
      label: 'Outdoors & Wolfy Hike',
      icon: '🌲',
      bg: 'from-emerald-950/60 to-stone-900',
      border: 'border-emerald-700/50',
      desc: 'Long woodland trails, dog park romp, muddy paws & country air',
    },
    social_party: {
      label: 'Social & Party Vibe',
      icon: '🎉',
      bg: 'from-purple-950/60 to-stone-900',
      border: 'border-purple-700/50',
      desc: 'Housewarmings, rooftop drinks, dinner with friends & celebrations',
    },
    foodie_cozy: {
      label: 'Foodie & Baking',
      icon: '🍷',
      bg: 'from-rose-950/60 to-stone-900',
      border: 'border-rose-700/50',
      desc: 'Sunday roast, homemade sourdough pizza, farmer market produce',
    },
    spontaneous: {
      label: 'Pure Spontaneity',
      icon: '✨',
      bg: 'from-amber-900/60 to-stone-900',
      border: 'border-amber-600/50',
      desc: 'No rigid plans—wake up and decide what feels good in the moment',
    },
  };

  const currentMood = moodMeta[vibes?.mood || 'chill_reset'];

  const handleSave = () => {
    updateWeekendVibes(day, {
      enabled: true,
      mood,
      morningVibe: morningVibe.trim(),
      afternoonPlan: afternoonPlan.trim(),
      eveningVibe: eveningVibe.trim(),
      wolfyAdventure: wolfyAdventure.trim(),
      noAlarm,
      funTags,
    });
    setIsEditing(false);
  };

  const addTag = (tag: string) => {
    if (!funTags.includes(tag)) {
      setFunTags([...funTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFunTags(funTags.filter((t) => t !== tagToRemove));
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault();
      addTag(customTag.trim());
      setCustomTag('');
    }
  };

  if (!vibes || !vibes.enabled) {
    return (
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 text-center">
        <WolfyAvatar size="md" mood="happy" className="mx-auto mb-2" />
        <h4 className="text-sm font-bold text-amber-200">Weekend Vibes Mode is Off</h4>
        <p className="text-xs text-stone-400 mt-0.5">
          Enable Weekend Vibes for relaxed, casual social & adventure plans!
        </p>
        <button
          onClick={() => {
            updateWeekendVibes(day, {
              enabled: true,
              mood: 'chill_reset',
              morningVibe: 'Sleep in & coffee',
              afternoonPlan: 'Stroll & dog park',
              eveningVibe: 'Relaxing dinner',
              noAlarm: true,
              funTags: ['No Alarm', 'Coffee', 'Wolfy'],
            });
          }}
          className="mt-3 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
        >
          ✨ Activate Weekend Vibes Mode
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${currentMood.bg} border ${currentMood.border} rounded-2xl p-4 sm:p-5 shadow-xl transition-all relative overflow-hidden`}>
      
      {/* Ambient golden weekend flare */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-stone-800/80">
        <div className="flex items-center gap-3">
          <WolfyAvatar size="md" mood="happy" showBadge badgeText="🥂" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Weekend Vibes Mode Active
              </span>
              {vibes.noAlarm && (
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlarmClockOff className="w-3 h-3" /> No Alarms
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-amber-100 font-serif mt-1 flex items-center gap-2">
              <span>{currentMood.icon} {currentMood.label}</span>
            </h3>
            <p className="text-xs text-stone-300 mt-0.5">{currentMood.desc}</p>
          </div>
        </div>

        <button
          onClick={() => {
            if (!isEditing) {
              setMood(vibes.mood);
              setMorningVibe(vibes.morningVibe);
              setAfternoonPlan(vibes.afternoonPlan);
              setEveningVibe(vibes.eveningVibe);
              setWolfyAdventure(vibes.wolfyAdventure || '');
              setNoAlarm(vibes.noAlarm);
              setFunTags(vibes.funTags || []);
            }
            setIsEditing(!isEditing);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-xs font-semibold text-stone-200 transition-colors self-end sm:self-auto"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
          <span>{isEditing ? 'Close' : 'Customize Weekend Plans'}</span>
        </button>
      </div>

      {!isEditing ? (
        /* NORMAL DISPLAY MODE */
        <div className="mt-4 space-y-3.5">
          {/* 3 Casual Weekend Plan Columns / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Morning Vibe */}
            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-1">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5 text-amber-400" /> Morning Vibe
              </span>
              <p className="text-sm font-semibold text-stone-100">
                {vibes.morningVibe || 'Lazy morning, sleep in & fresh coffee'}
              </p>
            </div>

            {/* Afternoon Adventure */}
            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Afternoon Adventure
              </span>
              <p className="text-sm font-semibold text-stone-100">
                {vibes.afternoonPlan || 'Spontaneous exploration & chill'}
              </p>
            </div>

            {/* Evening Fun */}
            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-1">
              <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                <Wine className="w-3.5 h-3.5 text-purple-400" /> Evening Fun
              </span>
              <p className="text-sm font-semibold text-stone-100">
                {vibes.eveningVibe || 'Drinks, date night or relaxed dinner'}
              </p>
            </div>
          </div>

          {/* Wolfy Weekend Highlight */}
          {vibes.wolfyAdventure && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-center gap-3">
              <WolfyAvatar size="sm" mood="walkies" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <PawPrint className="w-3 h-3" /> Wolfy's Weekend Highlight
                </span>
                <p className="text-xs text-stone-200 mt-0.5 truncate">
                  {vibes.wolfyAdventure}
                </p>
              </div>
            </div>
          )}

          {/* Fun weekend tags */}
          {vibes.funTags && vibes.funTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {vibes.funTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-lg bg-stone-950/80 text-amber-200 border border-amber-800/40 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* INLINE EDIT FORM FOR WEEKEND VIBES */
        <div className="mt-4 p-4 rounded-xl bg-stone-950/90 border border-amber-500/40 space-y-4 animate-in fade-in duration-150">
          
          {/* Pick Weekend Mood */}
          <div>
            <label className="text-xs font-bold text-amber-300 block mb-2">
              Select Weekend Vibe / Mood
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(Object.keys(moodMeta) as WeekendMood[]).map((key) => {
                const item = moodMeta[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMood(key)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      mood === key
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md'
                        : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
                    }`}
                  >
                    <span className="text-xl mb-1">{item.icon}</span>
                    <span className="text-xs leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alarm-Free Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800">
            <div className="flex items-center gap-2">
              <AlarmClockOff className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-stone-200 block">No Alarms Weekend</span>
                <span className="text-[11px] text-stone-400">Sleep until natural wake-up</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNoAlarm(!noAlarm)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                noAlarm
                  ? 'bg-emerald-500 text-stone-950'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              {noAlarm ? 'Active (No Alarms!)' : 'Alarm Set'}
            </button>
          </div>

          {/* Casual blocks inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                🌅 Morning Vibe
              </label>
              <input
                type="text"
                value={morningVibe}
                onChange={(e) => setMorningVibe(e.target.value)}
                placeholder="e.g. Sourdough & coffee in bed"
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                ☀️ Afternoon Adventure
              </label>
              <input
                type="text"
                value={afternoonPlan}
                onChange={(e) => setAfternoonPlan(e.target.value)}
                placeholder="e.g. Woodland hike with Wolfy"
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                🌙 Evening Fun
              </label>
              <input
                type="text"
                value={eveningVibe}
                onChange={(e) => setEveningVibe(e.target.value)}
                placeholder="e.g. Friends housewarming party"
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Wolfy Weekend Highlight */}
          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-1 flex items-center gap-1.5">
              <PawPrint className="w-3.5 h-3.5 text-amber-400" />
              Wolfy Adventure or Treat (Jack Russell Poodle Special)
            </label>
            <input
              type="text"
              value={wolfyAdventure}
              onChange={(e) => setWolfyAdventure(e.target.value)}
              placeholder="e.g. Bakery pup-cup, trail romp, muddy puddle splash"
              className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100"
            />
          </div>

          {/* One-Tap Weekend Activity Presets */}
          <div>
            <span className="text-xs font-semibold text-stone-400 block mb-2">
              One-Tap Fun Activity Ideas:
            </span>
            <div className="space-y-2">
              {WEEKEND_VIBE_PRESETS.map((preset) => (
                <div key={preset.category} className="space-y-1">
                  <span className="text-[11px] text-amber-300 font-semibold">{preset.category}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {preset.items.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          if (!funTags.includes(item)) addTag(item);
                        }}
                        className="text-[11px] px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors"
                      >
                        + {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Tags */}
          <div>
            <label className="text-xs font-semibold text-stone-400 block mb-1">
              Active Weekend Tags:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {funTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-amber-100 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={handleAddCustomTag}
              placeholder="Type custom tag & press Enter (e.g. Farmers Market, BBQ)..."
              className="w-full px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-800 text-stone-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Save Weekend Vibes</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
