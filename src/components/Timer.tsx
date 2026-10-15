import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2, Target } from 'lucide-react';
import { TimerMode, Task } from '../types';

interface TimerProps {
  mode: TimerMode;
  timeLeft: number;
  totalTime: number;
  isRunning: boolean;
  currentCycle: number;
  longBreakInterval: number;
  activeTask?: Task | null;
  onSelectMode: (mode: TimerMode) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSkipTimer: () => void;
  onCompleteActiveTask?: () => void;
}

export const Timer: React.FC<TimerProps> = ({
  mode,
  timeLeft,
  totalTime,
  isRunning,
  currentCycle,
  longBreakInterval,
  activeTask,
  onSelectMode,
  onToggleTimer,
  onResetTimer,
  onSkipTimer,
  onCompleteActiveTask,
}) => {
  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress percentage (1 to 0 or 0 to 1)
  const progressRatio = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const modeTitle = {
    focus: 'Focus Session',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
  }[mode];

  const modeSubtitle = {
    focus: 'Deep uninterrupted concentration',
    shortBreak: 'Rest your eyes & stretch a little',
    longBreak: 'Recharge with a walk or hydration',
  }[mode];

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Mode Switcher Tabs */}
      <div className="tactile-concave p-1.5 rounded-2xl flex items-center gap-1.5 border border-white/60 mb-6 sm:mb-8">
        <button
          onClick={() => onSelectMode('focus')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
            mode === 'focus'
              ? 'tactile-btn-pressed bg-[#E8E7E3] text-[#2D3A34] shadow-inner'
              : 'text-[#5E6762] hover:text-[#1C221F]'
          }`}
        >
          Focus
        </button>
        <button
          onClick={() => onSelectMode('shortBreak')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
            mode === 'shortBreak'
              ? 'tactile-btn-pressed bg-[#E8E7E3] text-[#2D3A34] shadow-inner'
              : 'text-[#5E6762] hover:text-[#1C221F]'
          }`}
        >
          Short Break
        </button>
        <button
          onClick={() => onSelectMode('longBreak')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
            mode === 'longBreak'
              ? 'tactile-btn-pressed bg-[#E8E7E3] text-[#2D3A34] shadow-inner'
              : 'text-[#5E6762] hover:text-[#1C221F]'
          }`}
        >
          Long Break
        </button>
      </div>

      {/* Main Tactile Dial Container */}
      <div className="relative w-72 h-72 sm:w-84 sm:h-84 rounded-full tactile-card flex items-center justify-center p-4 border border-white/80 shadow-2xl mb-6 sm:mb-8">
        {/* Inner Sunken Dial */}
        <div className="relative w-full h-full rounded-full tactile-concave flex flex-col items-center justify-center border border-white/50 p-6">
          {/* Circular SVG Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-3" viewBox="0 0 280 280">
            {/* Background track */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="transparent"
              stroke="#D4D2CA"
              strokeWidth="10"
              strokeDasharray="4 6"
              className="opacity-40"
            />
            {/* Active progress stroke */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="transparent"
              stroke={mode === 'focus' ? '#7C9A8E' : '#584B79'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300"
            />
          </svg>

          {/* Time Display */}
          <div className="relative z-10 flex flex-col items-center justify-center select-none text-center">
            {/* Mode Tag */}
            <span
              className={`text-xs font-bold tracking-widest uppercase mb-1 ${
                mode === 'focus' ? 'text-[#7C9A8E]' : 'text-[#584B79]'
              }`}
            >
              {modeTitle}
            </span>

            {/* Countdown digits */}
            <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-[#1C221F] font-mono my-1">
              {timeString}
            </h2>

            {/* Session interval dots */}
            <div className="flex items-center gap-1.5 mt-2">
              {Array.from({ length: longBreakInterval }).map((_, idx) => {
                const isCompleted = idx < currentCycle;
                const isCurrent = idx === currentCycle && isRunning;
                return (
                  <div
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      isCompleted
                        ? 'bg-[#7C9A8E] scale-110 shadow-xs'
                        : isCurrent
                        ? 'bg-[#7C9A8E] animate-ping'
                        : 'bg-[#C2C0B8]'
                    }`}
                    title={`Session ${idx + 1} of ${longBreakInterval}`}
                  />
                );
              })}
            </div>

            <span className="text-[11px] font-medium text-[#5E6762] mt-1.5">
              Round {Math.min(currentCycle + 1, longBreakInterval)} of {longBreakInterval}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex items-center gap-4 sm:gap-5 mb-6">
        {/* Reset button */}
        <button
          onClick={onResetTimer}
          className="tactile-btn w-12 h-12 rounded-2xl flex items-center justify-center text-[#5E6762] hover:text-[#1C221F] border border-white/70 min-h-[44px]"
          title="Reset timer (Esc)"
          aria-label="Reset Timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Start / Pause Main Button */}
        <button
          onClick={onToggleTimer}
          className={`tactile-btn-sage px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center gap-3 min-h-[48px] shadow-lg ${
            isRunning ? 'bg-linear-to-br from-[#729084] to-[#5C786D]' : ''
          }`}
          title="Start / Pause (Spacebar)"
          aria-label={isRunning ? 'Pause Timer' : 'Start Timer'}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Start</span>
            </>
          )}
        </button>

        {/* Skip button */}
        <button
          onClick={onSkipTimer}
          className="tactile-btn w-12 h-12 rounded-2xl flex items-center justify-center text-[#5E6762] hover:text-[#1C221F] border border-white/70 min-h-[44px]"
          title="Skip to next session (Alt + S)"
          aria-label="Skip Session"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Active Task Banner */}
      {activeTask ? (
        <div className="w-full tactile-convex rounded-2xl p-4 flex items-center justify-between gap-3 border border-white/80 animate-fade-in shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#E2ECE7] flex items-center justify-center shrink-0 text-[#2D3A34]">
              <Target className="w-4 h-4 text-[#7C9A8E]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C9A8E]">Focusing On</span>
              <h4 className="text-sm font-bold text-[#1C221F] truncate">{activeTask.title}</h4>
              <div className="text-[11px] text-[#5E6762]">
                Pomodoros: {activeTask.actPomodoros} of {activeTask.estPomodoros} est.
              </div>
            </div>
          </div>

          {onCompleteActiveTask && (
            <button
              onClick={onCompleteActiveTask}
              className="tactile-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 hover:text-emerald-900 border border-emerald-600/20 shrink-0"
              title="Mark active task as completed"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Done</span>
            </button>
          )}
        </div>
      ) : (
        <div className="text-center text-xs text-[#5E6762] py-2">
          Tip: Pick or add a task below to link your focus session!
        </div>
      )}
    </div>
  );
};
