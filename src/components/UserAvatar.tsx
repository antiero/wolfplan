import React, { useState } from 'react';
import { PartnerProfile } from '../types';

interface UserAvatarProps {
  profile?: Partial<PartnerProfile> | null;
  name?: string;
  photoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBadge?: boolean;
  badgeText?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  profile,
  name,
  photoUrl,
  size = 'md',
  className = '',
  showBadge = false,
  badgeText,
}) => {
  const [imageError, setImageError] = useState(false);

  let displayName = profile?.name || name || 'User';
  let displayShort = profile?.shortName || displayName.slice(0, 4) || 'U';
  if (displayName === 'Alex' || displayShort === 'Alex') {
    displayName = profile?.id === 'partner1' ? 'Antony' : 'Beth';
    displayShort = profile?.id === 'partner1' ? 'Ant' : 'Beth';
  }
  const initial = displayShort.charAt(0).toUpperCase();
  const avatarBg = profile?.avatarBg || 'bg-amber-600';
  const effectivePhoto = !imageError ? (photoUrl || profile?.photoUrl) : undefined;
  const emoji = profile?.avatarEmoji;

  const sizeClasses = {
    xs: 'w-4 h-4 text-[9px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-14 h-14 text-lg',
    '2xl': 'w-20 h-20 text-2xl',
  }[size];

  const badgeSizeClasses = {
    xs: 'w-2 h-2 text-[6px]',
    sm: 'w-2.5 h-2.5 text-[7px]',
    md: 'w-3 h-3 text-[8px]',
    lg: 'w-4 h-4 text-[9px]',
    xl: 'w-5 h-5 text-[10px]',
    '2xl': 'w-6 h-6 text-xs',
  }[size];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}>
      {effectivePhoto ? (
        <img
          src={effectivePhoto}
          alt={displayName}
          onError={() => setImageError(true)}
          className={`${sizeClasses} rounded-full object-cover border border-stone-700/60 shadow-xs`}
        />
      ) : emoji ? (
        <div
          className={`${sizeClasses} ${avatarBg} text-white font-bold rounded-full flex items-center justify-center shadow-xs border border-white/10`}
          title={displayName}
        >
          <span>{emoji}</span>
        </div>
      ) : (
        <div
          className={`${sizeClasses} ${avatarBg} text-white font-bold rounded-full flex items-center justify-center shadow-xs border border-white/10`}
          title={displayName}
        >
          <span>{initial}</span>
        </div>
      )}

      {showBadge && badgeText && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${badgeSizeClasses} bg-amber-500 text-stone-950 font-black rounded-full flex items-center justify-center shadow-xs border border-stone-900`}
        >
          {badgeText}
        </span>
      )}
    </div>
  );
};
