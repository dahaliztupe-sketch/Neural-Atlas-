import React from 'react';
import { Theme } from '../../types';
import { RouteName } from '../../router/router';

interface StaticAtmosphericBackdropProps {
  theme: Theme;
  routeName?: RouteName;
}

export const StaticAtmosphericBackdrop: React.FC<StaticAtmosphericBackdropProps> = ({
  theme,
  routeName = 'home',
}) => {
  const isDark = theme === 'dark';
  const baseCanvas = isDark ? '#050811' : '#f4f6fb';

  // Admin stays strictly clean and distraction-free for content forms
  if (routeName === 'admin') {
    return (
      <div
        className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0" style={{ background: baseCanvas }} />
      </div>
    );
  }

  const radialWash = isDark
    ? 'radial-gradient(ellipse 80% 55% at 68% 18%, rgba(139, 92, 246, 0.14) 0%, rgba(34, 211, 238, 0.06) 44%, #050811 100%)'
    : 'radial-gradient(ellipse 80% 55% at 68% 18%, rgba(109, 40, 217, 0.08) 0%, rgba(8, 145, 178, 0.04) 44%, #f4f6fb 100%)';

  const strokeViolet = isDark ? '#8b5cf6' : '#6d28d9';
  const strokeCyan = isDark ? '#22d3ee' : '#0891b2';
  const strokeSlate = isDark ? '#94a3b8' : '#64748b';

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ background: radialWash }}
      />

      {routeName === 'home' && (
        <svg
          className={`absolute inset-0 w-full h-full ${isDark ? 'opacity-28' : 'opacity-20'}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="atlas-home-dots" width="44" height="44" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.85" fill={strokeSlate} fillOpacity="0.28" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#atlas-home-dots)" />
          {/* Precision Astrolabe Arc Lines (Graceful Backdrop Under WebGL or Fallback on Mobile) */}
          <g className="md:opacity-45">
            <circle
              cx="74%"
              cy="32%"
              r="210"
              fill="none"
              stroke={strokeCyan}
              strokeWidth="0.7"
              strokeOpacity="0.24"
              strokeDasharray="3 7"
            />
            <circle
              cx="74%"
              cy="32%"
              r="320"
              fill="none"
              stroke={strokeViolet}
              strokeWidth="0.7"
              strokeOpacity="0.18"
            />
            <line
              x1="74%"
              y1="8%"
              x2="74%"
              y2="56%"
              stroke={strokeSlate}
              strokeWidth="0.5"
              strokeOpacity="0.14"
            />
          </g>
        </svg>
      )}

      {routeName === 'academic' && (
        <svg
          className={`absolute inset-0 w-full h-full ${isDark ? 'opacity-16' : 'opacity-12'}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="atlas-academic-grid" width="64" height="64" patternUnits="userSpaceOnUse">
              <path
                d="M 64 0 L 0 0 0 64"
                fill="none"
                stroke={strokeCyan}
                strokeWidth="0.55"
                strokeOpacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#atlas-academic-grid)" />
        </svg>
      )}

      {(routeName === 'projects' || routeName === 'project-detail') && (
        <svg
          className={`absolute inset-0 w-full h-full ${isDark ? 'opacity-16' : 'opacity-12'}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="atlas-projects-drafting" width="72" height="72" patternUnits="userSpaceOnUse">
              <path
                d="M 72 0 L 0 0 0 72"
                fill="none"
                stroke={strokeViolet}
                strokeWidth="0.5"
                strokeOpacity="0.28"
              />
              <path
                d="M 0 72 L 72 0"
                fill="none"
                stroke={strokeCyan}
                strokeWidth="0.4"
                strokeOpacity="0.16"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#atlas-projects-drafting)" />
        </svg>
      )}

      {(routeName === 'notes' || routeName === 'note-detail') && (
        <svg
          className={`absolute inset-0 w-full h-full ${isDark ? 'opacity-16' : 'opacity-12'}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="atlas-notes-lines" width="64" height="44" patternUnits="userSpaceOnUse">
              <line
                x1="0"
                y1="44"
                x2="64"
                y2="44"
                stroke={strokeViolet}
                strokeWidth="0.5"
                strokeOpacity="0.22"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#atlas-notes-lines)" />
        </svg>
      )}

      {routeName === 'milestones' && (
        <svg
          className={`absolute inset-0 w-full h-full ${isDark ? 'opacity-16' : 'opacity-12'}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="atlas-milestones-axis" width="80" height="80" patternUnits="userSpaceOnUse">
              <line
                x1="40"
                y1="0"
                x2="40"
                y2="80"
                stroke={strokeCyan}
                strokeWidth="0.5"
                strokeOpacity="0.25"
                strokeDasharray="2 6"
              />
              <circle cx="40" cy="40" r="1.4" fill={strokeViolet} fillOpacity="0.32" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#atlas-milestones-axis)" />
        </svg>
      )}

      {(routeName === 'about' || routeName === 'connect' || routeName === 'not-found') && (
        <svg
          className={`absolute inset-0 w-full h-full ${isDark ? 'opacity-16' : 'opacity-12'}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="50%"
            cy="22%"
            r="260"
            fill="none"
            stroke={strokeViolet}
            strokeWidth="0.5"
            strokeOpacity="0.2"
          />
          <circle
            cx="50%"
            cy="22%"
            r="420"
            fill="none"
            stroke={strokeCyan}
            strokeWidth="0.5"
            strokeOpacity="0.15"
          />
        </svg>
      )}
    </div>
  );
};
