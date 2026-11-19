import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: 24,
  md: 28,
  lg: 36,
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showWordmark = true,
  className = '',
}) => {
  const px = SIZE_MAP[size];

  return (
    <span className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="naMarkBg" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0e1629" />
            <stop offset="100%" stopColor="#050811" />
          </linearGradient>
          <linearGradient id="naMarkPrism" x1="16" y1="14" x2="48" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="52%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="naMarkFacet" x1="32" y1="14" x2="48" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Precision Obsidian Rounded Frame */}
        <rect x="3" y="3" width="58" height="58" rx="15" fill="url(#naMarkBg)" stroke="#94a3b8" strokeOpacity="0.24" strokeWidth="1.4" />

        {/* Calibrated Outer Astrolabe Ring & Cardinal Ticks */}
        <circle cx="32" cy="32" r="21.5" stroke="#94a3b8" strokeOpacity="0.28" strokeWidth="1.1" />
        <path
          d="M32 7.5V11M32 53V56.5M7.5 32H11M53 32H56.5"
          stroke="#22d3ee"
          strokeOpacity="0.65"
          strokeWidth="1.35"
          strokeLinecap="round"
        />

        {/* Inclined Elliptical Gimbal Arc */}
        <ellipse
          cx="32"
          cy="32"
          rx="18.5"
          ry="8.5"
          transform="rotate(-28 32 32)"
          stroke="url(#naMarkPrism)"
          strokeOpacity="0.55"
          strokeWidth="1.25"
        />

        {/* Central Octahedral Crystal Facets */}
        <polygon points="32,14 46,32 32,32" fill="url(#naMarkFacet)" />
        <polygon
          points="32,14 46,32 32,50 18,32"
          stroke="url(#naMarkPrism)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M32 14V50M18 32H46"
          stroke="url(#naMarkPrism)"
          strokeOpacity="0.65"
          strokeWidth="1.25"
          strokeLinecap="round"
        />

        {/* Core Focal Node & Learning Anchor Vertices */}
        <circle cx="32" cy="32" r="3.6" fill="#050811" stroke="#f8fafc" strokeWidth="1.8" />
        <circle cx="32" cy="14" r="2.2" fill="#22d3ee" />
        <circle cx="46" cy="32" r="2.2" fill="#8b5cf6" />
        <circle cx="18" cy="32" r="2.2" fill="#38bdf8" />
      </svg>

      {showWordmark && (
        <span className="font-sans font-bold tracking-tight whitespace-nowrap text-[var(--color-text)]">
          Neural Atlas
        </span>
      )}
    </span>
  );
};
