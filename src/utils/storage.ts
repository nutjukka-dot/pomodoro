import { Task, Settings, SessionHistoryItem, AnalyticsStats } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'tactile_pomo_settings_v1',
  TASKS: 'tactile_pomo_tasks_v1',
  HISTORY: 'tactile_pomo_history_v1',
  ACTIVE_TASK_ID: 'tactile_pomo_active_task_v1',
  STREAK_INFO: 'tactile_pomo_streak_v1',
};

export const DEFAULT_SETTINGS: Settings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundAlerts: true,
  alarmSound: 'bell',
  alarmVolume: 80,
  notificationEnabled: false,
};

export const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-sample-1',
    title: 'Focus on high-impact project goals',
    notes: 'Draft the core proposal and break it down into milestones.',
    category: 'work',
    estPomodoros: 4,
    actPomodoros: 1,
    completed: false,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'task-sample-2',
    title: 'Review weekly reading & research notes',
    notes: 'Summarize key takeaways for the team.',
    category: 'study',
    estPomodoros: 2,
    actPomodoros: 2,
    completed: true,
    createdAt: Date.now() - 7200000,
    completedAt: Date.now() - 3600000,
  },
  {
    id: 'task-sample-3',
    title: 'Mindful inbox clean-up & planning',
    notes: 'Respond to urgent queries and organize tomorrow’s plan.',
    category: 'personal',
    estPomodoros: 2,
    actPomodoros: 0,
    completed: false,
    createdAt: Date.now() - 1800000,
  },
];

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Failed to load settings from storage:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return DEFAULT_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_TASKS;
  } catch (err) {
    console.warn('Failed to load tasks from storage:', err);
    return DEFAULT_TASKS;
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks:', err);
  }
}

export function loadHistory(): SessionHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) {
      // Seed initial sample history for rich immediate analytics
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      return [
        { id: 'h-1', timestamp: now - oneDay * 3, durationMinutes: 25, mode: 'focus', taskTitle: 'Product architecture overview' },
        { id: 'h-2', timestamp: now - oneDay * 2, durationMinutes: 25, mode: 'focus', taskTitle: 'Deep focus coding sprint' },
        { id: 'h-3', timestamp: now - oneDay * 1, durationMinutes: 25, mode: 'focus', taskTitle: 'Weekly research review' },
        { id: 'h-4', timestamp: now - 3600000 * 2, durationMinutes: 25, mode: 'focus', taskTitle: 'High-impact project goals' },
      ];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load history:', err);
    return [];
  }
}

export function saveHistory(history: SessionHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to save history:', err);
  }
}

export function loadActiveTaskId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TASK_ID);
  } catch {
    return null;
  }
}

export function saveActiveTaskId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TASK_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TASK_ID);
    }
  } catch {}
}

export function computeStreak(history: SessionHistoryItem[]): { streak: number; lastDate: string } {
  const focusItems = history.filter((h) => h.mode === 'focus');
  if (focusItems.length === 0) return { streak: 0, lastDate: '' };

  const datesSet = new Set<string>();
  focusItems.forEach((item) => {
    const d = new Date(item.timestamp);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    datesSet.add(dateKey);
  });

  const sortedDates = Array.from(datesSet).sort().reverse();
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let streak = 0;
  let checkDate = new Date(today);

  // If today has activity, start check from today; if not but yesterday did, start from yesterday
  if (datesSet.has(todayKey)) {
    streak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else if (datesSet.has(yesterdayKey)) {
    streak = 1;
    checkDate = new Date(yesterday);
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    return { streak: 0, lastDate: sortedDates[0] || '' };
  }

  while (true) {
    const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (datesSet.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { streak, lastDate: sortedDates[0] || '' };
}

export function computeAnalytics(history: SessionHistoryItem[], tasks: Task[]): AnalyticsStats {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  let todayFocusMinutes = 0;
  let weekFocusMinutes = 0;
  let monthFocusMinutes = 0;
  let allTimeFocusMinutes = 0;
  let totalCompletedSessions = 0;

  history.forEach((item) => {
    if (item.mode === 'focus') {
      const dur = item.durationMinutes || 0;
      allTimeFocusMinutes += dur;
      totalCompletedSessions += 1;

      if (item.timestamp >= todayStart) {
        todayFocusMinutes += dur;
      }
      if (item.timestamp >= weekStart) {
        weekFocusMinutes += dur;
      }
      if (item.timestamp >= monthStart) {
        monthFocusMinutes += dur;
      }
    }
  });

  const { streak, lastDate } = computeStreak(history);

  return {
    todayFocusMinutes,
    weekFocusMinutes,
    monthFocusMinutes,
    allTimeFocusMinutes,
    totalCompletedSessions,
    streakDays: streak,
    lastActiveDate: lastDate,
  };
}

/**
 * Export all data to JSON
 */
export function exportAppData(): void {
  const data = {
    app: 'Tactile Pomodoro',
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    settings: loadSettings(),
    tasks: loadTasks(),
    history: loadHistory(),
    activeTaskId: loadActiveTaskId(),
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `tactile-pomodoro-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Import and validate JSON backup data
 */
export function importAppData(jsonString: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Invalid backup format' };
    }

    if (data.settings && typeof data.settings === 'object') {
      saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    }
    if (Array.isArray(data.tasks)) {
      saveTasks(data.tasks);
    }
    if (Array.isArray(data.history)) {
      saveHistory(data.history);
    }
    if (typeof data.activeTaskId === 'string' || data.activeTaskId === null) {
      saveActiveTaskId(data.activeTaskId);
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown parsing error';
    return { success: false, error: errorMsg };
  }
}
