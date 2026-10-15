export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export type ChimeType = 'bell' | 'chime' | 'gong' | 'marimba';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  category: 'work' | 'study' | 'personal' | 'project' | 'other';
  estPomodoros: number;
  actPomodoros: number;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface SessionHistoryItem {
  id: string;
  timestamp: number;
  durationMinutes: number;
  mode: TimerMode;
  taskId?: string;
  taskTitle?: string;
}

export interface Settings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundAlerts: boolean;
  alarmSound: ChimeType;
  alarmVolume: number; // 0 to 100
  notificationEnabled: boolean;
}

export interface AnalyticsStats {
  todayFocusMinutes: number;
  weekFocusMinutes: number;
  monthFocusMinutes: number;
  allTimeFocusMinutes: number;
  totalCompletedSessions: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
}
