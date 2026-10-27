import React, { useState } from 'react';
import { useWolfy } from '../context/WolfyContext';
import { DayOfWeek, CookAssignment, Recipe } from '../types';
import {
  Utensils,
  Plus,
  BookOpen,
  Check,
  ShoppingCart,
  Users,
  Sparkles,
  ChevronDown,
  Clock,
  Flame,
  ChefHat,
} from 'lucide-react';
import { WolfyAvatar } from './WolfyAvatar';

export const DinnerPlanView: React.FC = () => {
  const {
    schedule,
    recipes,
    settings,
    activeUser,
    updateDinnerPlan,
    setSelectedRecipeModal,
    setActiveTab,
  } = useWolfy();

  const [activeFilter, setActiveFilter] = useState<'all' | 'together' | 'separate'>('all');
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [editingDay, setEditingDay] = useState<DayOfWeek | null>(null);

  const p1 = settings.partner1;
  const p2 = settings.partner2;
  const p1Name = p1.name === 'Alex' ? 'Antony' : (p1.name || 'Antony');
  const p2Name = p2.name === 'Alex' ? 'Beth' : (p2.name || 'Beth');

  const filteredSchedule = schedule.filter((d) => {
    if (activeFilter === 'together') return d.dinner.type === 'together';
    if (activeFilter === 'separate') return d.dinner.type === 'separate';
    return true;
  });

  const getCookInfo = (cook: CookAssignment) => {
    switch (cook) {
      case 'partner1':
        return { label: `${p1Name} Cooking`, color: 'bg-amber-600/30 text-amber-300 border-amber-600/50' };
      case 'partner2':
        return { label: `${p2Name} Cooking`, color: 'bg-emerald-600/30 text-emerald-300 border-emerald-600/50' };
      case 'both':
        return { label: 'Both Cooking', color: 'bg-rose-950/50 text-rose-300 border-rose-800/50' };
      case 'takeaway':
        return { label: 'Takeaway', color: 'bg-orange-950/50 text-orange-300 border-orange-800/50' };
      case 'eating_out':
        return { label: 'Eating Out', color: 'bg-purple-950/50 text-purple-300 border-purple-800/50' };
      default:
        return { label: 'Leftovers', color: 'bg-stone-800 text-stone-300 border-stone-700' };
    }
  };

  // Compile weekly grocery list from all recipes planned for the week
  const weeklyIngredients: { item: string; amount: string; days: string[] }[] = [];
  schedule.forEach((d) => {
    if (d.dinner.type === 'together' && d.dinner.recipeId) {
      const rec = recipes.find((r) => r.id === d.dinner.recipeId);
      if (rec) {
        rec.ingredients.forEach((ing) => {
          const existing = weeklyIngredients.find(
            (i) => i.item.toLowerCase() === ing.item.toLowerCase()
          );
          if (existing) {
            existing.days.push(d.shortLabel);
          } else {
            weeklyIngredients.push({ item: ing.item, amount: ing.amount, days: [d.shortLabel] });
          }
        });
      }
    }
  });

  return (
    <div className="space-y-4 pb-28">
      
      {/* Page Title & Controls */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <WolfyAvatar size="md" mood="chef" showBadge badgeText="👨‍🍳" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-amber-100 font-serif">
                Weekly Dinner Meal Plan
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Cook assignments, recipes & own dinner nights
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowGroceryList(!showGroceryList)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              showGroceryList
                ? 'bg-amber-500 text-stone-950 border-amber-400'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Weekly Grocery List ({weeklyIngredients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recipes')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600/30 text-amber-300 border border-amber-500/40 hover:bg-amber-600/40 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Recipe Library</span>
          </button>
        </div>
      </div>

      {/* Grocery List Slide-down drawer */}
      {showGroceryList && (
        <div className="bg-stone-900 border border-amber-800/40 rounded-2xl p-4 sm:p-5 shadow-xl animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div>
              <h3 className="font-bold text-base text-amber-200 flex items-center gap-2 font-serif">
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                Aggregated Weekly Grocery Checklist
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Automatically gathered from recipes scheduled for this week:
              </p>
            </div>
            <button
              onClick={() => setShowGroceryList(false)}
              className="text-xs text-stone-400 hover:text-stone-200"
            >
              Hide
            </button>
          </div>

          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {weeklyIngredients.length > 0 ? (
              weeklyIngredients.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950/70 border border-stone-800/80 text-xs text-stone-200"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="font-medium truncate">{item.item}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-amber-300 font-semibold">{item.amount}</span>
                    <span className="text-[9px] text-stone-500 block">({item.days.join(', ')})</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-400 col-span-3 py-2 italic">
                No recipes linked yet this week. Tap "Attach Recipe" on any day!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeFilter === 'all'
              ? 'bg-amber-500 text-stone-950'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          All Days (7)
        </button>
        <button
          onClick={() => setActiveFilter('together')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeFilter === 'together'
              ? 'bg-amber-500 text-stone-950'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          Eating Together ({schedule.filter((d) => d.dinner.type === 'together').length})
        </button>
        <button
          onClick={() => setActiveFilter('separate')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeFilter === 'separate'
              ? 'bg-amber-500 text-stone-950'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          Own Dinners ({schedule.filter((d) => d.dinner.type === 'separate').length})
        </button>
      </div>

      {/* Dinners List */}
      <div className="space-y-3.5">
        {filteredSchedule.map((dayItem) => {
          const cookDetails = getCookInfo(dayItem.dinner.cook);
          const isEditing = editingDay === dayItem.day;
          const matchedRecipe = recipes.find((r) => r.id === dayItem.dinner.recipeId);

          return (
            <div
              key={dayItem.day}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-md hover:border-stone-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-base text-amber-200 font-serif min-w-[90px]">
                    {dayItem.dayLabel}
                  </span>
                  <span className="text-xs text-stone-400">{dayItem.dateStr}</span>
                  
                  {/* Dinner Type Pill */}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    dayItem.dinner.type === 'together'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                      : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                  }`}>
                    {dayItem.dinner.type === 'together' ? 'Together' : 'Separate Dinners'}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setEditingDay(isEditing ? null : dayItem.day)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
                  >
                    {isEditing ? 'Close Edit' : 'Edit Plan'}
                  </button>
                </div>
              </div>

              {/* Normal display mode */}
              {!isEditing ? (
                <div className="mt-3.5">
                  {dayItem.dinner.type === 'together' ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${cookDetails.color}`}>
                            {cookDetails.label}
                          </span>
                          {dayItem.dinner.tags?.map((tag) => (
                            <span key={tag} className="text-[10px] text-stone-400 bg-stone-950 px-2 py-0.5 rounded-md border border-stone-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-stone-100">
                          {dayItem.dinner.mealName}
                        </h4>
                        {dayItem.dinner.recipeNotes && (
                          <p className="text-xs text-stone-400 mt-1 italic">
                            "{dayItem.dinner.recipeNotes}"
                          </p>
                        )}
                      </div>

                      {matchedRecipe ? (
                        <button
                          onClick={() => setSelectedRecipeModal(matchedRecipe)}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all self-start sm:self-center shrink-0"
                        >
                          <span>{matchedRecipe.imageEmoji || '📖'}</span>
                          <span>View Recipe & Steps</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingDay(dayItem.day)}
                          className="text-xs text-stone-400 hover:text-amber-300 underline self-start sm:self-center"
                        >
                          + Attach recipe card
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Separate Dinners Display */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                      <div className="p-3.5 bg-stone-950/60 rounded-xl border border-stone-800">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1">
                          <span className={`w-3.5 h-3.5 rounded-full ${p1.avatarBg} text-[8px] text-white flex items-center justify-center`}>
                            {p1.shortName.charAt(0)}
                          </span>
                          <span>{p1Name}'s Dinner Plan:</span>
                        </div>
                        <p className="text-xs font-medium text-stone-200">
                          {dayItem.dinner.partner1OwnDinner || 'Solo meal / fend for self'}
                        </p>
                      </div>

                      <div className="p-3.5 bg-stone-950/60 rounded-xl border border-stone-800">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 mb-1">
                          <span className={`w-3.5 h-3.5 rounded-full ${p2.avatarBg} text-[8px] text-white flex items-center justify-center`}>
                            {p2.shortName.charAt(0)}
                          </span>
                          <span>{p2Name}'s Dinner Plan:</span>
                        </div>
                        <p className="text-xs font-medium text-stone-200">
                          {dayItem.dinner.partner2OwnDinner || 'Solo meal / fend for self'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* INLINE EDIT FORM */
                <div className="mt-4 p-4 rounded-xl bg-stone-950/80 border border-amber-600/40 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">
                      Edit Dinner for {dayItem.dayLabel}
                    </span>
                    
                    {/* Toggle Type */}
                    <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
                      <button
                        type="button"
                        onClick={() => updateDinnerPlan(dayItem.day, { type: 'together' })}
                        className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors ${
                          dayItem.dinner.type === 'together'
                            ? 'bg-amber-500 text-stone-950'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        Eating Together
                      </button>
                      <button
                        type="button"
                        onClick={() => updateDinnerPlan(dayItem.day, { type: 'separate' })}
                        className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors ${
                          dayItem.dinner.type === 'separate'
                            ? 'bg-amber-500 text-stone-950'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        Own Dinners
                      </button>
                    </div>
                  </div>

                  {dayItem.dinner.type === 'together' ? (
                    <>
                      {/* Who is cooking buttons */}
                      <div>
                        <label className="text-xs font-semibold text-stone-400 mb-1.5 block">
                          Who will cook?
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
                          {[
                            { id: 'partner1', label: p1Name },
                            { id: 'partner2', label: p2Name },
                            { id: 'both', label: 'Both Together' },
                            { id: 'takeaway', label: 'Takeaway' },
                            { id: 'eating_out', label: 'Eating Out' },
                            { id: 'leftovers', label: 'Leftovers' },
                          ].map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => updateDinnerPlan(dayItem.day, { cook: c.id as CookAssignment })}
                              className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-colors ${
                                dayItem.dinner.cook === c.id
                                  ? 'bg-amber-500 text-stone-950 border-amber-400'
                                  : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
                              }`}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Meal title */}
                      <div>
                        <label className="text-xs font-semibold text-stone-400 mb-1 block">
                          Meal Name / Dish
                        </label>
                        <input
                          type="text"
                          value={dayItem.dinner.mealName}
                          onChange={(e) => updateDinnerPlan(dayItem.day, { mealName: e.target.value })}
                          placeholder="e.g. Lemon Herb Chicken Orzo"
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-stone-100 focus:border-amber-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Attach Recipe from Library */}
                      <div>
                        <label className="text-xs font-semibold text-stone-400 mb-1.5 block">
                          Attach Recipe from Collection:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {recipes.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() =>
                                updateDinnerPlan(dayItem.day, {
                                  mealName: r.name,
                                  recipeId: r.id,
                                  tags: r.tags,
                                })
                              }
                              className={`text-xs px-2.5 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                                dayItem.dinner.recipeId === r.id
                                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                                  : 'bg-stone-900 text-stone-300 border-stone-700 hover:bg-stone-800'
                              }`}
                            >
                              <span>{r.imageEmoji || '🍲'}</span>
                              <span className="truncate max-w-[160px]">{r.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="text-xs font-semibold text-stone-400 mb-1 block">
                          Cook Notes / Timing
                        </label>
                        <input
                          type="text"
                          value={dayItem.dinner.recipeNotes || ''}
                          onChange={(e) => updateDinnerPlan(dayItem.day, { recipeNotes: e.target.value })}
                          placeholder="e.g. Antony cooking at 7:30pm, pick up fresh parsley"
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200"
                        />
                      </div>
                    </>
                  ) : (
                    /* Separate Dinners Inputs */
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-amber-300 block mb-1">
                          {p1Name}'s Meal / Plan:
                        </label>
                        <input
                          type="text"
                          value={dayItem.dinner.partner1OwnDinner || ''}
                          onChange={(e) => updateDinnerPlan(dayItem.day, { partner1OwnDinner: e.target.value })}
                          placeholder="e.g. Pub dinner with workmates"
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-emerald-300 block mb-1">
                          {p2Name}'s Meal / Plan:
                        </label>
                        <input
                          type="text"
                          value={dayItem.dinner.partner2OwnDinner || ''}
                          onChange={(e) => updateDinnerPlan(dayItem.day, { partner2OwnDinner: e.target.value })}
                          placeholder="e.g. Leftover pasta & fresh salad after Pilates"
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setEditingDay(null)}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
                    >
                      Done Editing
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
