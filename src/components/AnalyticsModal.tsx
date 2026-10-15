import React, { useRef } from 'react';
import { X, BarChart3, Flame, Clock, CheckCircle2, Download, Upload, Calendar } from 'lucide-react';
import { SessionHistoryItem, Task } from '../types';
import { computeAnalytics, exportAppData, importAppData } from '../utils/storage';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SessionHistoryItem[];
  tasks: Task[];
  onDataImported: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  history,
  tasks,
  onDataImported,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const stats = computeAnalytics(history, tasks);

  // Compute Task Completion Rate
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Compute 7-day focus minutes breakdown
  const last7Days: { dateStr: string; label: string; minutes: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayLabel = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });

    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const dayMinutes = history
      .filter((h) => h.mode === 'focus' && h.timestamp >= dayStart && h.timestamp < dayEnd)
      .reduce((sum, h) => sum + (h.durationMinutes || 0), 0);

    last7Days.push({ dateStr: dateKey, label: dayLabel, minutes: dayMinutes });
  }

  const maxMinutesInWeek = Math.max(...last7Days.map((d) => d.minutes), 60);

  const formatHoursMins = (totalMinutes: number) => {
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importAppData(content);
        if (result.success) {
          onDataImported();
          alert('Data backup successfully restored!');
        } else {
          alert(`Failed to import data: ${result.error || 'Invalid file format'}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="tactile-card w-full max-w-2xl rounded-2xl p-6 relative border border-white/80 my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#5E6762] hover:text-[#1C221F] rounded-xl hover:bg-black/5"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#E2ECE7] flex items-center justify-center text-[#2D3A34]">
            <BarChart3 className="w-5 h-5 text-[#7C9A8E]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1C221F]">Productivity & Analytics</h3>
            <p className="text-xs text-[#5E6762]">Track your focused hours, streaks, and progress</p>
          </div>
        </div>

        {/* 4 Stat Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="tactile-convex p-3.5 rounded-2xl border border-white/80">
            <div className="flex items-center justify-between mb-1.5 text-[#7C9A8E]">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5E6762]">Today</span>
            </div>
            <div className="text-xl font-bold text-[#1C221F]">{formatHoursMins(stats.todayFocusMinutes)}</div>
            <div className="text-[11px] text-[#5E6762]">Focused time</div>
          </div>

          <div className="tactile-convex p-3.5 rounded-2xl border border-white/80">
            <div className="flex items-center justify-between mb-1.5 text-[#584B79]">
              <Flame className="w-4 h-4 text-[#584B79]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5E6762]">Streak</span>
            </div>
            <div className="text-xl font-bold text-[#1C221F]">{stats.streakDays} Days</div>
            <div className="text-[11px] text-[#5E6762]">Consecutive focus</div>
          </div>

          <div className="tactile-convex p-3.5 rounded-2xl border border-white/80">
            <div className="flex items-center justify-between mb-1.5 text-[#7C9A8E]">
              <Calendar className="w-4 h-4" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5E6762]">This Week</span>
            </div>
            <div className="text-xl font-bold text-[#1C221F]">{formatHoursMins(stats.weekFocusMinutes)}</div>
            <div className="text-[11px] text-[#5E6762]">{stats.totalCompletedSessions} Sessions</div>
          </div>

          <div className="tactile-convex p-3.5 rounded-2xl border border-white/80">
            <div className="flex items-center justify-between mb-1.5 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5E6762]">Tasks Done</span>
            </div>
            <div className="text-xl font-bold text-[#1C221F]">{taskCompletionRate}%</div>
            <div className="text-[11px] text-[#5E6762]">{completedTasks}/{totalTasks} Completed</div>
          </div>
        </div>

        {/* 7-Day Activity Chart */}
        <div className="tactile-concave rounded-2xl p-4 border border-white/60 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#2D3A34] uppercase tracking-wider">
              Last 7 Days Focus Activity
            </span>
            <span className="text-xs font-semibold text-[#5E6762]">
              Total: {formatHoursMins(stats.weekFocusMinutes)}
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 h-36 pt-4 pb-2 px-1">
            {last7Days.map((d, index) => {
              const heightPct = Math.max(8, Math.round((d.minutes / maxMinutesInWeek) * 100));
              const isToday = index === 6;
              return (
                <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-medium text-[#5E6762] opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.minutes}m
                  </span>
                  <div className="w-full max-w-[36px] bg-[#D4D2CA] rounded-xl overflow-hidden flex flex-col justify-end h-24 p-0.5 shadow-inner">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-linear-to-t from-[#6E8E81] to-[#8FAEA2]'
                          : d.minutes > 0
                          ? 'bg-linear-to-t from-[#7C9A8E] to-[#9CB8AC]'
                          : 'bg-transparent'
                      }`}
                    />
                  </div>
                  <span className={`text-[11px] font-semibold ${isToday ? 'text-[#7C9A8E]' : 'text-[#5E6762]'}`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Session History Log */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5E6762] mb-2.5">
            Recent Focus Sessions
          </label>
          <div className="tactile-concave rounded-2xl p-2 max-h-44 overflow-y-auto space-y-1.5 border border-white/60">
            {history.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 border border-black/5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#7C9A8E]" />
                  <span className="font-semibold text-[#1C221F]">
                    {item.taskTitle || 'Open Focus Session'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[#5E6762]">
                  <span>{item.durationMinutes} min</span>
                  <span>{new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="p-4 text-center text-xs text-[#5E6762]">No sessions recorded yet. Start your first focus round!</div>
            )}
          </div>
        </div>

        {/* Data Persistence & JSON Backup (Import / Export) */}
        <div className="pt-4 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left w-full sm:w-auto">
            <span className="text-xs font-bold text-[#2D3A34]">Data Storage & Backup</span>
            <p className="text-[11px] text-[#5E6762]">Saved locally in your browser. Backup anytime as JSON.</p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="tactile-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#2D3A34] border border-white/70"
            >
              <Upload className="w-3.5 h-3.5 text-[#584B79]" /> Import Backup
            </button>
            <button
              type="button"
              onClick={exportAppData}
              className="tactile-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#2D3A34] border border-white/70"
            >
              <Download className="w-3.5 h-3.5 text-[#7C9A8E]" /> Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
