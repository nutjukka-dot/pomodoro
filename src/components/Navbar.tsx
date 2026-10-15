import React from 'react';
import { BarChart3, Settings as SettingsIcon, Keyboard, Flame } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  streakDays: number;
  onOpenAnalytics: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  streakDays,
  onOpenAnalytics,
  onOpenSettings,
  onOpenShortcuts,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between gap-3">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl tactile-btn flex items-center justify-center p-1.5 border border-white/70">
          <img src="/icon.svg" alt="Tactile Pomodoro" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#1C221F] tracking-tight flex items-center gap-1.5">
            Tactile Pomodoro
            <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#DCD7EC] text-[#584B79]">
              Soft-UI
            </span>
          </h1>
          <p className="hidden sm:block text-xs text-[#5E6762]">Tactile rhythm for calm work</p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak Pill */}
        {streakDays > 0 && (
          <div
            className="tactile-convex flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/80 cursor-pointer"
            onClick={onOpenAnalytics}
            title={`${streakDays} consecutive day streak! Click to view stats.`}
          >
            <Flame className="w-4 h-4 text-[#584B79] fill-[#DCD7EC]" />
            <span className="text-xs font-bold text-[#2D3A34]">{streakDays}d Streak</span>
          </div>
        )}

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Analytics Button */}
        <button
          onClick={onOpenAnalytics}
          className="tactile-btn w-10 h-10 rounded-xl flex items-center justify-center text-[#2D3A34] border border-white/60"
          title="Productivity & Analytics"
          aria-label="View Analytics"
        >
          <BarChart3 className="w-4 h-4 text-[#7C9A8E]" />
        </button>

        {/* Keyboard Shortcuts */}
        <button
          onClick={onOpenShortcuts}
          className="tactile-btn w-10 h-10 rounded-xl flex items-center justify-center text-[#2D3A34] border border-white/60 hidden sm:flex"
          title="Keyboard Shortcuts (?)"
          aria-label="Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4 text-[#5E6762]" />
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="tactile-btn w-10 h-10 rounded-xl flex items-center justify-center text-[#2D3A34] border border-white/60"
          title="Timer & App Settings"
          aria-label="Settings"
        >
          <SettingsIcon className="w-4 h-4 text-[#2D3A34]" />
        </button>
      </div>
    </header>
  );
};
