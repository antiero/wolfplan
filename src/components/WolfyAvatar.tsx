import React from 'react';

interface WolfyAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mood?: 'happy' | 'chef' | 'walkies' | 'sleepy';
  className?: string;
  showBadge?: boolean;
  badgeText?: string;
}

export const WolfyAvatar: React.FC<WolfyAvatarProps> = ({
  size = 'md',
  mood = 'happy',
  className = '',
  showBadge = false,
  badgeText,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={`${sizeMap[size]} filter drop-shadow-sm transition-transform duration-300 hover:scale-105`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="blackCoat" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#2E282A" />
            <stop offset="85%" stopColor="#171415" />
            <stop offset="100%" stopColor="#0B0A0A" />
          </radialGradient>
          <linearGradient id="tanMarking" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E09F5A" />
            <stop offset="100%" stopColor="#C47E38" />
          </linearGradient>
          <linearGradient id="curlyEar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#302A2C" />
            <stop offset="100%" stopColor="#141112" />
          </linearGradient>
          <filter id="poodleFluff" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
        </defs>

        {/* Tail wagging in background if large */}
        {size === 'xl' && (
          <path
            d="M 22 75 C 10 65 14 45 20 50"
            fill="none"
            stroke="#171415"
            strokeWidth="7"
            strokeLinecap="round"
          />
        )}

        {/* Head outline - black coat with poodle waviness */}
        <circle cx="50" cy="50" r="38" fill="url(#blackCoat)" />

        {/* Floppy curly Jack-Russell Poodle ears */}
        {/* Left Ear */}
        <path
          d="M 18 36 C 8 40 8 64 22 66 C 26 66 28 55 24 40 Z"
          fill="url(#curlyEar)"
          stroke="#171415"
          strokeWidth="1.5"
        />
        {/* Right Ear */}
        <path
          d="M 82 36 C 92 40 92 64 78 66 C 74 66 72 55 76 40 Z"
          fill="url(#curlyEar)"
          stroke="#171415"
          strokeWidth="1.5"
        />

        {/* Jack Russell tan markings: over eyes and muzzle */}
        {/* Tan Eyebrow dots */}
        <ellipse cx="37" cy="36" rx="4" ry="2.5" transform="rotate(-10 37 36)" fill="url(#tanMarking)" />
        <ellipse cx="63" cy="36" rx="4" ry="2.5" transform="rotate(10 63 36)" fill="url(#tanMarking)" />

        {/* Tan muzzle & cheeks (classic Black and Tan pattern) */}
        <path
          d="M 33 55 C 33 46 44 44 50 44 C 56 44 67 46 67 55 C 67 66 59 74 50 74 C 41 74 33 66 33 55 Z"
          fill="url(#tanMarking)"
        />

        {/* Tan chest patch visible at base */}
        <path d="M 40 82 C 45 78 55 78 60 82 C 57 88 43 88 40 82 Z" fill="url(#tanMarking)" opacity="0.85" />

        {/* Poodle curly scruff on forehead */}
        <circle cx="50" cy="22" r="7" fill="#2E282A" opacity="0.9" />
        <circle cx="43" cy="24" r="6" fill="#2E282A" opacity="0.9" />
        <circle cx="57" cy="24" r="6" fill="#2E282A" opacity="0.9" />

        {/* Eyes */}
        {mood === 'sleepy' ? (
          <>
            <path d="M 35 44 Q 40 48 45 44" fill="none" stroke="#221C1D" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 55 44 Q 60 48 65 44" fill="none" stroke="#221C1D" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="40" cy="45" r="4.5" fill="#1C1410" />
            <circle cx="60" cy="45" r="4.5" fill="#1C1410" />
            {/* Eye highlights */}
            <circle cx="41.5" cy="43.5" r="1.5" fill="#FFFFFF" />
            <circle cx="61.5" cy="43.5" r="1.5" fill="#FFFFFF" />
            <circle cx="39" cy="46.5" r="0.7" fill="#FFFFFF" opacity="0.7" />
            <circle cx="59" cy="46.5" r="0.7" fill="#FFFFFF" opacity="0.7" />
          </>
        )}

        {/* Shiny Black Nose */}
        <path
          d="M 46 54 C 46 52 54 52 54 54 C 54 58 52 61 50 61 C 48 61 46 58 46 54 Z"
          fill="#1A1819"
        />
        <ellipse cx="48.5" cy="54" rx="1.5" ry="0.8" fill="#5A5255" opacity="0.8" />

        {/* Mouth */}
        <path
          d="M 50 61 L 50 64 M 45 64 Q 50 67 55 64"
          fill="none"
          stroke="#382E2B"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Happy open tongue if happy */}
        {mood === 'happy' && (
          <path
            d="M 47 65 C 47 70 53 70 53 65 Z"
            fill="#FF7E8A"
          />
        )}

        {/* Chef Hat if mood === chef */}
        {mood === 'chef' && (
          <g transform="translate(34, 4) scale(0.65)">
            <path
              d="M 12 28 L 38 28 L 35 22 C 40 18 42 8 32 6 C 28 2 18 2 15 7 C 6 6 8 18 13 22 Z"
              fill="#FFFFFF"
              stroke="#D1D5DB"
              strokeWidth="2"
            />
            <rect x="12" y="26" width="26" height="6" rx="2" fill="#E5E7EB" />
          </g>
        )}

        {/* Red Collar with gold "W" dog tag */}
        <path
          d="M 33 78 C 42 85 58 85 67 78 L 68 82 C 58 89 42 89 32 82 Z"
          fill="#D9383A"
        />
        {/* Collar tag */}
        <circle cx="50" cy="86" r="4.5" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
        <text
          x="50"
          y="88"
          fontSize="5"
          fontWeight="bold"
          textAnchor="middle"
          fill="#78350F"
          fontFamily="sans-serif"
        >
          W
        </text>

        {/* Walkies leash clip if walkies */}
        {mood === 'walkies' && (
          <path
            d="M 50 89 C 48 94 40 96 35 93"
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}
      </svg>

      {showBadge && (
        <span className="absolute -bottom-1 -right-1 bg-amber-500 text-stone-900 text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-xs">
          {badgeText || '🐾'}
        </span>
      )}
    </div>
  );
};
