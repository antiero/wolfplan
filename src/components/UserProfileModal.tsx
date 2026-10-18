import React, { useState, useRef, useEffect } from 'react';
import { useWolfy } from '../context/WolfyContext';
import { UserAvatar } from './UserAvatar';
import { PartnerId, PartnerProfile } from '../types';
import {
  X,
  Camera,
  Upload,
  Check,
  Sparkles,
  Trash2,
  Save,
  User,
  Users,
  Smile,
  Palette,
  Cloud,
} from 'lucide-react';
import { playChime } from '../utils/sound';

const AVATAR_COLORS = [
  { id: 'bg-emerald-600', label: 'Emerald', hex: '#059669' },
  { id: 'bg-amber-600', label: 'Amber', hex: '#D97706' },
  { id: 'bg-rose-600', label: 'Rose', hex: '#E11D48' },
  { id: 'bg-indigo-600', label: 'Indigo', hex: '#4F46E5' },
  { id: 'bg-violet-600', label: 'Violet', hex: '#7C3AED' },
  { id: 'bg-teal-600', label: 'Teal', hex: '#0D9488' },
  { id: 'bg-sky-600', label: 'Sky', hex: '#0284C7' },
  { id: 'bg-orange-600', label: 'Orange', hex: '#EA580C' },
];

const EMOJI_OPTIONS = ['🐺', '🐕', '☕', '🍷', '🧘‍♀️', '🏃‍♂️', '👩‍💻', '👨‍🍳', '🍕', '🍣', '🥑', '🌸', '🌿', '✨'];
const DINNER_EMOJIS = ['🍣', '🍝', '🌮', '🥗', '🍕', '🍜', '🥘', '🥩', '🍲', '🍛'];

export const UserProfileModal: React.FC = () => {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    settings,
    updateSettings,
    activeUser,
    setActiveUser,
    authUser,
  } = useWolfy();

  // Selected profile to edit: defaults to the active device user (e.g. partner2 for Beth)
  const [selectedPartnerId, setSelectedPartnerId] = useState<PartnerId>(activeUser);
  const currentProfile = selectedPartnerId === 'partner1' ? settings.partner1 : settings.partner2;

  const [name, setName] = useState(currentProfile.name);
  const [shortName, setShortName] = useState(currentProfile.shortName);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(currentProfile.photoUrl);
  const [avatarEmoji, setAvatarEmoji] = useState<string | undefined>(currentProfile.avatarEmoji);
  const [avatarBg, setAvatarBg] = useState(currentProfile.avatarBg || 'bg-emerald-600');
  const [favoriteDinnerEmoji, setFavoriteDinnerEmoji] = useState(currentProfile.favoriteDinnerEmoji || '🍣');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when selectedPartnerId or settings change
  useEffect(() => {
    const prof = selectedPartnerId === 'partner1' ? settings.partner1 : settings.partner2;
    setName(prof.name);
    setShortName(prof.shortName);
    setPhotoUrl(prof.photoUrl);
    setAvatarEmoji(prof.avatarEmoji);
    setAvatarBg(prof.avatarBg || (selectedPartnerId === 'partner1' ? 'bg-amber-600' : 'bg-emerald-600'));
    setFavoriteDinnerEmoji(prof.favoriteDinnerEmoji || '🍣');
  }, [selectedPartnerId, settings.partner1, settings.partner2]);

  // When modal opens, sync to activeUser
  useEffect(() => {
    if (isProfileModalOpen) {
      setSelectedPartnerId(activeUser);
    }
  }, [isProfileModalOpen, activeUser]);

  if (!isProfileModalOpen) return null;

  // Handle image upload from device: resize to max 256x256 compressed data URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPhotoUrl(compressedDataUrl);
          setAvatarEmoji(undefined);
          playChime('success');
        }
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUseGooglePhoto = () => {
    if (authUser?.photoURL) {
      setPhotoUrl(authUser.photoURL);
      setAvatarEmoji(undefined);
      playChime('success');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(undefined);
    setAvatarEmoji(undefined);
  };

  const handleSave = () => {
    const trimmedName = name.trim() || (selectedPartnerId === 'partner1' ? 'Partner 1' : 'Partner 2');
    const trimmedShort = shortName.trim() || trimmedName.slice(0, 4);

    const updatedProfile: PartnerProfile = {
      id: selectedPartnerId,
      name: trimmedName,
      shortName: trimmedShort,
      avatarBg,
      accentColor: AVATAR_COLORS.find((c) => c.id === avatarBg)?.hex || '#059669',
      favoriteDinnerEmoji,
      photoUrl: photoUrl || undefined,
      avatarEmoji: avatarEmoji || undefined,
    };

    updateSettings({
      [selectedPartnerId]: updatedProfile,
    });

    setSaveSuccess(true);
    playChime('success');
    setTimeout(() => {
      setSaveSuccess(false);
      setIsProfileModalOpen(false);
    }, 700);
  };

  const isEditingCurrentActiveDevice = selectedPartnerId === activeUser;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#181514] border-t sm:border border-stone-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-stone-100 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/30 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-amber-100 font-serif">
                User Profile & Photo
              </h3>
              <p className="text-xs text-stone-400">
                Personalize your name & avatar for shared routine sync
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Switcher Tabs: Partner 1 vs Partner 2 */}
        <div className="px-5 pt-4 pb-2 bg-stone-950/40 border-b border-stone-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              Couple Profiles
            </span>
            <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium">
              Active on this device: {activeUser === 'partner1' ? settings.partner1.name : settings.partner2.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedPartnerId('partner1')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                selectedPartnerId === 'partner1'
                  ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 shadow-xs'
                  : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <UserAvatar profile={settings.partner1} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate">{settings.partner1.name}</p>
                <p className="text-[10px] opacity-75">Partner 1</p>
              </div>
              {activeUser === 'partner1' && (
                <span className="text-[9px] bg-amber-500 text-stone-950 font-bold px-1.5 py-0.2 rounded-full">
                  You
                </span>
              )}
            </button>

            <button
              onClick={() => setSelectedPartnerId('partner2')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                selectedPartnerId === 'partner2'
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 shadow-xs'
                  : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <UserAvatar profile={settings.partner2} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate">{settings.partner2.name}</p>
                <p className="text-[10px] opacity-75">Partner 2</p>
              </div>
              {activeUser === 'partner2' && (
                <span className="text-[9px] bg-emerald-500 text-stone-950 font-bold px-1.5 py-0.2 rounded-full">
                  You
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          
          {/* Avatar Preview & Photo Controls */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800/80 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group">
              <UserAvatar
                profile={{
                  name,
                  shortName,
                  photoUrl,
                  avatarEmoji,
                  avatarBg,
                }}
                size="2xl"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-bold">Change</span>
              </button>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div>
                <p className="text-xs font-bold text-stone-200">Profile Photo</p>
                <p className="text-[11px] text-stone-400">
                  Upload a photo, use your Google image, or pick a custom avatar.
                </p>
              </div>

              {/* Photo Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                {/* Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload Photo</span>
                </button>

                {/* Google Account Photo (if logged in) */}
                {authUser?.photoURL && (
                  <button
                    onClick={handleUseGooglePhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors shadow-xs"
                    title="Use your Google profile picture"
                  >
                    <img
                      src={authUser.photoURL}
                      alt="Google avatar"
                      className="w-3.5 h-3.5 rounded-full object-cover"
                    />
                    <span>Use Google Photo</span>
                  </button>
                )}

                {/* Pick Emoji */}
                <button
                  onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors shadow-xs"
                >
                  <Smile className="w-3.5 h-3.5 text-amber-400" />
                  <span>{avatarEmoji || 'Emoji'}</span>
                </button>

                {/* Remove Photo */}
                {(photoUrl || avatarEmoji) && (
                  <button
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-rose-950/60 text-stone-400 hover:text-rose-300 text-xs font-semibold border border-stone-700 transition-colors"
                    title="Remove photo and use initials"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Emoji Picker Strip */}
              {isEmojiPickerOpen && (
                <div className="p-2 bg-stone-900 rounded-xl border border-stone-700 mt-2 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setAvatarEmoji(emoji);
                        setPhotoUrl(undefined);
                        setIsEmojiPickerOpen(false);
                      }}
                      className="w-7 h-7 text-base rounded-lg hover:bg-stone-800 transition-all active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Name & Nickname inputs */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-stone-300 block mb-1">
                  Full Display Name:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!shortName || shortName === name.slice(0, 4)) {
                      setShortName(e.target.value.slice(0, 4));
                    }
                  }}
                  placeholder="e.g. Beth"
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-300 block mb-1">
                  Badge Nickname:
                </label>
                <input
                  type="text"
                  value={shortName}
                  maxLength={6}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="e.g. Beth"
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
            <p className="text-[11px] text-stone-400">
              This name will appear on schedule blocks, dinner cook assignments, and instant partner alerts.
            </p>
          </div>

          {/* Avatar Color Picker */}
          <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
            <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              Avatar Background Tone:
            </span>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {AVATAR_COLORS.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setAvatarBg(col.id)}
                  className={`w-7 h-7 rounded-full ${col.id} transition-all flex items-center justify-center ${
                    avatarBg === col.id ? 'ring-2 ring-white ring-offset-2 ring-offset-stone-950 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={col.label}
                >
                  {avatarBg === col.id && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Dinner Emoji */}
          <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
            <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <span>🍽️</span>
              Favorite Meal Emoji (Dinner Duty Badge):
            </span>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {DINNER_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setFavoriteDinnerEmoji(emoji)}
                  className={`w-8 h-8 rounded-xl text-base transition-all flex items-center justify-center ${
                    favoriteDinnerEmoji === emoji
                      ? 'bg-amber-500/20 border border-amber-500/60 scale-105'
                      : 'bg-stone-900/60 hover:bg-stone-800 border border-stone-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Device Role Toggle (if partner is editing the other profile or wants to switch active device) */}
          {!isEditingCurrentActiveDevice && (
            <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-900/30 flex items-center justify-between text-xs">
              <div className="text-stone-300">
                <p className="font-semibold text-amber-200">Switch this device to {name}?</p>
                <p className="text-[11px] text-stone-400">Sets this phone/computer to edit as {name}</p>
              </div>
              <button
                onClick={() => {
                  setActiveUser(selectedPartnerId);
                  playChime('success');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
              >
                Set as Active
              </button>
            </div>
          )}

          {/* Cloud Sync Status Note */}
          <div className="flex items-center gap-2 text-[11px] text-stone-400 px-1">
            <Cloud className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Updates sync automatically to your partner's device via Firestore.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saveSuccess}
            className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                <span>Saved & Synced!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
