import React from 'react';
import { useWolfy } from '../context/WolfyContext';
import { Recipe, DayOfWeek } from '../types';
import {
  X,
  Clock,
  Flame,
  Users,
  CheckCircle2,
  Circle,
  CalendarPlus,
  PawPrint,
  ChefHat,
} from 'lucide-react';
import { WolfyAvatar } from './WolfyAvatar';

export const RecipeModal: React.FC = () => {
  const {
    selectedRecipeModal,
    setSelectedRecipeModal,
    toggleIngredientChecked,
    schedule,
    updateDinnerPlan,
    activeUser,
  } = useWolfy();

  if (!selectedRecipeModal) return null;

  const recipe = selectedRecipeModal;

  const handleAssignToDay = (day: DayOfWeek) => {
    updateDinnerPlan(day, {
      type: 'together',
      mealName: recipe.name,
      recipeId: recipe.id,
      tags: recipe.tags,
      recipeNotes: `Cooking ${recipe.name}!`,
    });
    setSelectedRecipeModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-100 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40 border-b border-stone-800 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-stone-900 border border-stone-800 shadow-sm shrink-0">
              {recipe.imageEmoji || '🍲'}
            </span>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {recipe.difficulty}
                </span>
                {recipe.tags.map((t) => (
                  <span key={t} className="text-[10px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-amber-100 font-serif">
                {recipe.name}
              </h3>
              
              <div className="flex items-center gap-3 text-xs text-stone-400 mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Prep: {recipe.prepTime}
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> Cook: {recipe.cookTime}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-stone-400" /> {recipe.servings} Servings
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedRecipeModal(null)}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Wolfy Tip */}
          {recipe.wolfyTip && (
            <div className="bg-amber-950/40 border border-amber-800/40 rounded-2xl p-3.5 flex items-start gap-3">
              <WolfyAvatar size="sm" mood="chef" />
              <div>
                <p className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <PawPrint className="w-3.5 h-3.5 text-amber-400" /> Wolfy's Kitchen Note:
                </p>
                <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
                  {recipe.wolfyTip}
                </p>
              </div>
            </div>
          )}

          {/* Ingredients Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-sm font-bold text-amber-200 font-serif flex items-center gap-1.5">
                <span>Ingredients</span>
                <span className="text-xs font-sans text-stone-400">({recipe.ingredients.length})</span>
              </h4>
              <span className="text-[11px] text-stone-400 italic">
                Tap to check off while cooking or shopping
              </span>
            </div>

            <div className="space-y-1.5">
              {recipe.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleIngredientChecked(recipe.id, idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                    ing.checked
                      ? 'bg-stone-950/40 border-stone-800/60 text-stone-500 line-through'
                      : 'bg-stone-950/80 border-stone-800 text-stone-200 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {ing.checked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-stone-500 shrink-0" />
                    )}
                    <span className="text-xs font-medium">{ing.item}</span>
                  </div>
                  <span className="text-xs font-semibold text-amber-400/90 shrink-0 pl-2">
                    {ing.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div>
            <h4 className="text-sm font-bold text-amber-200 font-serif mb-2.5">
              Step-by-Step Method
            </h4>
            <div className="space-y-3">
              {recipe.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-stone-300">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed flex-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Schedule to this Week */}
          <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-4">
            <span className="text-xs font-bold text-stone-300 block mb-2 flex items-center gap-1.5">
              <CalendarPlus className="w-3.5 h-3.5 text-amber-400" />
              Schedule this dinner for this week:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {schedule.map((d) => (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => handleAssignToDay(d.day)}
                  className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-amber-500 hover:text-stone-950 border border-stone-700 text-stone-300 text-xs font-semibold transition-colors"
                >
                  {d.shortLabel}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950/80 border-t border-stone-800 flex justify-end">
          <button
            onClick={() => setSelectedRecipeModal(null)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
