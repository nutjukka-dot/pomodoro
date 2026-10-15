/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { TimerMode, Task, Settings, SessionHistoryItem } from './types';
import {
  loadSettings,
  saveSettings,
  loadTasks,
  saveTasks,
  loadHistory,
  saveHistory,
  loadActiveTaskId,
  saveActiveTaskId,
  computeStreak,
} from './utils/storage';
import { playChime } from './utils/audio';
import { sendNotification } from './utils/notifications';
import { Navbar } from './components/Navbar';
import { Timer } from './components/Timer';
import { Tasks } from './components/Tasks';
import { SettingsModal } from './components/SettingsModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Settings & state
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [history, setHistory] = useState<SessionHistoryItem[]>(loadHistory);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(loadActiveTaskId);

  // Timer state
  const [mode, setMode] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0); // 0 to longBreakInterval - 1
  const [quickAddTrigger, setQuickAddTrigger] = useState(0);

  // Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Calculate duration in seconds for current mode
  const getDurationForMode = useCallback(
    (m: TimerMode): number => {
      switch (m) {
        case 'focus':
          return settings.focusMinutes * 60;
        case 'shortBreak':
          return settings.shortBreakMinutes * 60;
        case 'longBreak':
          return settings.longBreakMinutes * 60;
      }
    },
    [settings]
  );

  const [timeLeft, setTimeLeft] = useState(() => getDurationForMode('focus'));
  const [totalTime, setTotalTime] = useState(() => getDurationForMode('focus'));

  const timerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Save settings when updated
  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    saveSettings(newSettings);

    // If timer is not running, adjust current duration immediately
    if (!isRunning) {
      let newSec = newSettings.focusMinutes * 60;
      if (mode === 'shortBreak') newSec = newSettings.shortBreakMinutes * 60;
      if (mode === 'longBreak') newSec = newSettings.longBreakMinutes * 60;
      setTimeLeft(newSec);
      setTotalTime(newSec);
    }
  };

  // Sync tasks to storage
  const handleTasksChange = (newTasks: Task[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  // Sync history to storage
  const handleHistoryChange = (newHistory: SessionHistoryItem[]) => {
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  // Active task selection
  const handleSelectActiveTask = (id: string | null) => {
    setActiveTaskId(id);
    saveActiveTaskId(id);
  };

  // Task CRUD operations
  const handleAddTask = (newTask: Omit<Task, 'id' | 'actPomodoros' | 'completed' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      actPomodoros: 0,
      completed: false,
      createdAt: Date.now(),
    };
    const updated = [task, ...tasks];
    handleTasksChange(updated);
    if (!activeTaskId) {
      handleSelectActiveTask(task.id);
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    handleTasksChange(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    handleTasksChange(updated);
    if (activeTaskId === id) {
      handleSelectActiveTask(null);
    }
  };

  const handleToggleTaskComplete = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? Date.now() : undefined,
        };
      }
      return t;
    });
    handleTasksChange(updated);
  };

  // Active task object
  const activeTask = tasks.find((t) => t.id === activeTaskId) || null;

  // Real-time Document Title update
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const modeLabel = mode === 'focus' ? 'Focus' : mode === 'shortBreak' ? 'Short Break' : 'Long Break';
    document.title = `${timeStr} - ${modeLabel} | Tactile Pomodoro`;
  }, [timeLeft, mode]);

  // Mode selection
  const handleSelectMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    const dur = getDurationForMode(newMode);
    setTimeLeft(dur);
    setTotalTime(dur);
  };

  // Reset Timer
  const handleResetTimer = () => {
    setIsRunning(false);
    const dur = getDurationForMode(mode);
    setTimeLeft(dur);
    setTotalTime(dur);
  };

  // Toggle Timer (Start / Pause)
  const handleToggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      lastTickRef.current = Date.now();
      setIsRunning(true);
    }
  };

  // Complete current timer phase
  const handlePhaseComplete = useCallback(() => {
    setIsRunning(false);

    // Play Chime sound
    if (settings.soundAlerts) {
      playChime(settings.alarmSound, settings.alarmVolume);
    }

    if (mode === 'focus') {
      // Trigger completion confetti
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#7C9A8E', '#584B79', '#DCD7EC', '#F5F4F0'],
        });
      } catch {}

      // Increment active task actual pomodoro count
      if (activeTaskId) {
        const updated = tasks.map((t) => {
          if (t.id === activeTaskId) {
            return { ...t, actPomodoros: t.actPomodoros + 1 };
          }
          return t;
        });
        handleTasksChange(updated);
      }

      // Record to Session History
      const historyItem: SessionHistoryItem = {
        id: `session-${Date.now()}`,
        timestamp: Date.now(),
        durationMinutes: settings.focusMinutes,
        mode: 'focus',
        taskId: activeTaskId || undefined,
        taskTitle: activeTask?.title || undefined,
      };
      handleHistoryChange([historyItem, ...history]);

      // Web Notification
      sendNotification(
        "Focus session completed! ☕",
        `Great job! Time for a well-deserved ${
          (currentCycle + 1) % settings.longBreakInterval === 0 ? 'Long Break' : 'Short Break'
        }.`
      );

      // Determine next phase (Short vs Long Break)
      const nextCycle = (currentCycle + 1) % settings.longBreakInterval;
      setCurrentCycle(nextCycle);

      const nextMode: TimerMode = nextCycle === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      const nextDur = getDurationForMode(nextMode);
      setTimeLeft(nextDur);
      setTotalTime(nextDur);

      // Auto-start breaks
      if (settings.autoStartBreaks) {
        lastTickRef.current = Date.now();
        setIsRunning(true);
      }
    } else {
      // Break completed -> Return to Focus
      sendNotification("Break is finished! 🎯", "Ready to focus on your next task?");

      setMode('focus');
      const focusDur = getDurationForMode('focus');
      setTimeLeft(focusDur);
      setTotalTime(focusDur);

      // Auto-start pomodoro
      if (settings.autoStartPomodoros) {
        lastTickRef.current = Date.now();
        setIsRunning(true);
      }
    }
  }, [
    mode,
    settings,
    activeTaskId,
    activeTask,
    tasks,
    history,
    currentCycle,
    getDurationForMode,
  ]);

  // Skip Timer to next phase
  const handleSkipTimer = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      const nextCycle = (currentCycle + 1) % settings.longBreakInterval;
      setCurrentCycle(nextCycle);
      const nextMode: TimerMode = nextCycle === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      const nextDur = getDurationForMode(nextMode);
      setTimeLeft(nextDur);
      setTotalTime(nextDur);
    } else {
      setMode('focus');
      const focusDur = getDurationForMode('focus');
      setTimeLeft(focusDur);
      setTotalTime(focusDur);
    }
  };

  // High precision timer interval ticker
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    lastTickRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsed = Math.round((now - lastTickRef.current) / 1000);

      if (elapsed >= 1) {
        lastTickRef.current = now;
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return prev - elapsed;
        });
      }
    }, 250);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, handlePhaseComplete]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      // Spacebar: Start / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleTimer();
      }

      // Esc: Reset
      if (e.code === 'Escape') {
        e.preventDefault();
        handleResetTimer();
      }

      // Alt + S: Skip
      if (e.altKey && e.code === 'KeyS') {
        e.preventDefault();
        handleSkipTimer();
      }

      // Cmd / Ctrl + K: Quick Add Task
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuickAddTrigger(Date.now());
      }

      // ?: Shortcuts
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Calculate current streak
  const { streak } = computeStreak(history);

  // Data reload callback after import
  const handleDataImported = () => {
    setSettings(loadSettings());
    setTasks(loadTasks());
    setHistory(loadHistory());
    setActiveTaskId(loadActiveTaskId());
  };

  return (
    <div className="min-h-screen bg-[#E8E7E3] text-[#1C221F] flex flex-col justify-between selection:bg-[#DCD7EC] selection:text-[#584B79]">
      {/* Top Navigation */}
      <Navbar
        streakDays={streak}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="w-full max-w-4xl mx-auto px-4 py-4 flex-1 flex flex-col items-center">
        {/* Timer Dial & Controls */}
        <Timer
          mode={mode}
          timeLeft={timeLeft}
          totalTime={totalTime}
          isRunning={isRunning}
          currentCycle={currentCycle}
          longBreakInterval={settings.longBreakInterval}
          activeTask={activeTask}
          onSelectMode={handleSelectMode}
          onToggleTimer={handleToggleTimer}
          onResetTimer={handleResetTimer}
          onSkipTimer={handleSkipTimer}
          onCompleteActiveTask={() => activeTaskId && handleToggleTaskComplete(activeTaskId)}
        />

        {/* Task Management Section */}
        <Tasks
          tasks={tasks}
          activeTaskId={activeTaskId}
          onSelectActiveTask={handleSelectActiveTask}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onToggleComplete={handleToggleTaskComplete}
          quickAddTrigger={quickAddTrigger}
        />
      </main>

      {/* Tactile Footer */}
      <footer className="w-full py-6 text-center text-xs text-[#5E6762] border-t border-black/5">
        <div className="max-w-xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Tactile Pomodoro • Soft-UI Focus Space</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="hover:text-[#1C221F] underline underline-offset-2"
            >
              Shortcuts (Space, Esc, ⌘K)
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAnalyticsOpen(true)}
              className="hover:text-[#1C221F] underline underline-offset-2"
            >
              Analytics
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        history={history}
        tasks={tasks}
        onDataImported={handleDataImported}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <OfflineIndicator />
    </div>
  );
}
