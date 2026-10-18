import React, { useState } from 'react';
import { useWolfy } from '../context/WolfyContext';
import { Recipe } from '../types';
import {
  Search,
  Plus,
  Clock,
  Flame,
  Utensils,
  BookOpen,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { WolfyAvatar } from './WolfyAvatar';

export const RecipesView: React.FC = () => {
  const { recipes, addRecipe, setSelectedRecipeModal } = useWolfy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New recipe form state
  const [name, setName] = useState('');
  const [prepTime, setPrepTime] = useState('15 mins');
  const [cookTime, setCookTime] = useState('20 mins');
  const [servings, setServings] = useState(2);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Special'>('Easy');
  const [imageEmoji, setImageEmoji] = useState('🍲');
  const [tagInput, setTagInput] = useState('Quick, Couple Favorite');
  const [ingredientsText, setIngredientsText] = useState('2 Chicken breasts\n1 cup Jasmine rice\n1 tbsp Soy sauce');
  const [instructionsText, setInstructionsText] = useState('Sear chicken in hot pan for 5 mins\nCook rice\nServe with soy sauce and lime');
  const [wolfyTip, setWolfyTip] = useState('Wolfy will gladly supervise from under the table!');

  const allTags = Array.from(new Set(recipes.flatMap((r) => r.tags)));

  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = selectedTag === 'all' || r.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleCreateRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedIngredients = ingredientsText
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const parts = line.split('-');
        if (parts.length > 1) {
          return { item: parts[0].trim(), amount: parts[1].trim() };
        }
        return { item: line.trim(), amount: 'as desired' };
      });

    const parsedInstructions = instructionsText
      .split('\n')
      .filter((line) => line.trim());

    const newRecipe: Recipe = {
      id: 'custom-' + Date.now(),
      name: name.trim(),
      prepTime,
      cookTime,
      servings,
      difficulty,
      imageEmoji,
      tags: tagInput.split(',').map((t) => t.trim()).filter(Boolean),
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      wolfyTip: wolfyTip.trim(),
    };

    addRecipe(newRecipe);
    setIsAddModalOpen(false);
    // Reset form
    setName('');
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* Header */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <WolfyAvatar size="md" mood="chef" showBadge badgeText="📖" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-amber-100 font-serif">
              Partner Recipe Collection
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Tried-and-true couple dinners, prep times & shopping checklists
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all self-end sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-stone-950" />
          <span>Add Custom Recipe</span>
        </button>
      </div>

      {/* Search and Tag filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes by name or tag (e.g. Salmon, Vegetarian, Quick)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs sm:text-sm text-stone-100 focus:border-amber-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedTag === 'all'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            All ({recipes.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => setSelectedRecipeModal(recipe)}
            className="bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-2xl p-4 shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-3xl p-2 rounded-xl bg-stone-950 border border-stone-800 group-hover:scale-105 transition-transform">
                  {recipe.imageEmoji || '🍲'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {recipe.difficulty}
                </span>
              </div>

              <h3 className="font-bold text-base text-stone-100 group-hover:text-amber-200 transition-colors font-serif line-clamp-1">
                {recipe.name}
              </h3>

              <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> {recipe.prepTime}
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" /> {recipe.cookTime}
                </span>
                <span className="text-stone-500">• {recipe.ingredients.length} items</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                {recipe.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] text-stone-400 bg-stone-950 px-2 py-0.5 rounded-md border border-stone-800"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
              <span className="text-amber-400 font-semibold group-hover:underline">
                View Full Recipe →
              </span>
              {recipe.wolfyTip && (
                <span className="text-[10px] text-stone-400 flex items-center gap-1">
                  <span>🐾 Wolfy note</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Recipe Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-100">
            <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-amber-200 font-serif flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Add New Recipe to Wolfy
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecipe} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-300 block mb-1">Recipe Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Antony's Famous Truffle Carbonara"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-sm text-stone-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-medium text-stone-400 block mb-1">Prep Time</label>
                  <input
                    type="text"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-100"
                  />
                </div>
                <div>
                  <label className="font-medium text-stone-400 block mb-1">Cook Time</label>
                  <input
                    type="text"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-100"
                  />
                </div>
                <div>
                  <label className="font-medium text-stone-400 block mb-1">Icon Emoji</label>
                  <input
                    type="text"
                    value={imageEmoji}
                    onChange={(e) => setImageEmoji(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-100 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-stone-400 block mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Quick, Date Night, Pasta"
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-100"
                />
              </div>

              <div>
                <label className="font-bold text-stone-300 block mb-1">Ingredients (one per line)</label>
                <textarea
                  rows={4}
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  placeholder="e.g. 200g Spaghetti - 200g&#10;2 Egg yolks&#10;50g Guanciale"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-stone-300 block mb-1">Instructions (one step per line)</label>
                <textarea
                  rows={4}
                  value={instructionsText}
                  onChange={(e) => setInstructionsText(e.target.value)}
                  placeholder="Boil salted water and cook pasta al dente&#10;Crisp guanciale in skillet&#10;Toss with eggs and cheese off the heat"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-stone-400 block mb-1">Wolfy Pup Note 🐾</label>
                <input
                  type="text"
                  value={wolfyTip}
                  onChange={(e) => setWolfyTip(e.target.value)}
                  placeholder="Wolfy note (e.g. no onions for dogs!)"
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
                >
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
