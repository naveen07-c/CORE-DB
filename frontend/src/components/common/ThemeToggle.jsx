import React, { useEffect } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, initTheme } = useThemeStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      className={`relative inline-flex items-center h-9 w-16 px-1 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-inner ${
        isDark
          ? 'bg-slate-800 border border-slate-700'
          : 'bg-slate-100 border border-slate-200 hover:bg-slate-200/80'
      } ${className}`}
    >
      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] pointer-events-none select-none">
        {/* Sun on left */}
        <Sun className={`w-3.5 h-3.5 text-amber-500 transition-opacity duration-200 ${isDark ? 'opacity-30' : 'opacity-80'}`} />
        {/* Moon on right */}
        <Moon className={`w-3.5 h-3.5 text-indigo-300 transition-opacity duration-200 ${isDark ? 'opacity-90' : 'opacity-30'}`} />
      </div>

      {/* Sliding Animated Disc */}
      <span
        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full shadow-md transform transition-all duration-300 ease-out ${
          isDark
            ? 'translate-x-7 bg-slate-950 text-indigo-300 border border-slate-700 shadow-indigo-950/50'
            : 'translate-x-0 bg-white text-amber-500 border border-slate-100 shadow-slate-300/50'
        }`}
      >
        {isDark ? (
          <Moon className="w-4 h-4 transform rotate-0 transition-transform duration-300 ease-in-out text-indigo-300" />
        ) : (
          <Sun className="w-4 h-4 transform rotate-0 transition-transform duration-300 ease-in-out text-amber-500" />
        )}
      </span>
    </button>
  );
};
