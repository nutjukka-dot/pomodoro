import React, { useState, useEffect, useRef } from 'react';
import {
  Check,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  Tag,
  Search,
  Filter,
  CheckCircle,
  Circle,
  MoreVertical,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task } from '../types';

interface TasksProps {
  tasks: Task[];
  activeTaskId: string | null;
  onSelectActiveTask: (taskId: string | null) => void;
  onAddTask: (task: Omit<Task, 'id' | 'actPomodoros' | 'completed' | 'createdAt'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  quickAddTrigger?: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  work: { bg: '#E2ECE7', text: '#2D3A34', border: '#7C9A8E' },
  study: { bg: '#DCD7EC', text: '#584B79', border: '#C2B8D9' },
  personal: { bg: '#F2E8DC', text: '#8C5D3B', border: '#D9C5B2' },
  project: { bg: '#DDE9F2', text: '#2A526E', border: '#A6C5DB' },
  other: { bg: '#EAE8E2', text: '#5E6762', border: '#C8C5BD' },
};

export const Tasks: React.FC<TasksProps> = ({
  tasks,
  activeTaskId,
  onSelectActiveTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  quickAddTrigger,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<Task['category']>('work');
  const [estPomodoros, setEstPomodoros] = useState(2);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Listen to quickAddTrigger (e.g. from Cmd+K)
  useEffect(() => {
    if (quickAddTrigger && quickAddTrigger > 0) {
      setIsAdding(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [quickAddTrigger]);

  const handleStartAdd = () => {
    setIsAdding(true);
    setTitle('');
    setNotes('');
    setCategory('work');
    setEstPomodoros(2);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      notes: notes.trim() || undefined,
      category,
      estPomodoros: Math.max(1, estPomodoros),
    });

    setTitle('');
    setNotes('');
    setIsAdding(false);
  };

  const handleStartEdit = (t: Task) => {
    setEditingTask(t);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;
    onUpdateTask(editingTask);
    setEditingTask(null);
  };

  const handleToggle = (t: Task) => {
    if (!t.completed) {
      // Trigger joyful confetti!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#7C9A8E', '#DCD7EC', '#584B79', '#F5F4F0'],
        });
      } catch {}
    }
    onToggleComplete(t.id);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q);
      return matchTitle || matchNotes;
    }
    return true;
  });

  return (
    <section className="w-full max-w-xl mx-auto mt-4 mb-16">
      {/* Tasks Header & Controls */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#1C221F]">Tasks</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E2ECE7] text-[#2D3A34]">
              {tasks.filter((t) => !t.completed).length} open
            </span>
          </div>

          <button
            onClick={handleStartAdd}
            className="tactile-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#2D3A34] border border-white/70 min-h-[44px]"
            title="Add new task (Ctrl+K)"
          >
            <Plus className="w-4 h-4 text-[#7C9A8E]" />
            <span>Add Task</span>
            <kbd className="hidden sm:inline-block text-[10px] bg-black/5 px-1.5 py-0.5 rounded-md font-mono text-[#5E6762]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="tactile-concave p-1 rounded-xl flex items-center gap-1 border border-white/50 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filter === 'all' ? 'bg-white shadow-xs text-[#2D3A34]' : 'text-[#5E6762] hover:text-[#1C221F]'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filter === 'active' ? 'bg-white shadow-xs text-[#2D3A34]' : 'text-[#5E6762] hover:text-[#1C221F]'
              }`}
            >
              Active ({tasks.filter((t) => !t.completed).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filter === 'completed' ? 'bg-white shadow-xs text-[#2D3A34]' : 'text-[#5E6762] hover:text-[#1C221F]'
              }`}
            >
              Done ({tasks.filter((t) => t.completed).length})
            </button>
          </div>

          {/* Category Filter Pill */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="tactile-concave px-3 py-2 rounded-xl text-xs font-semibold text-[#2D3A34] outline-none border border-white/50"
          >
            <option value="all">All Tags</option>
            <option value="work">Work</option>
            <option value="study">Study</option>
            <option value="personal">Personal</option>
            <option value="project">Project</option>
          </select>
        </div>
      </div>

      {/* Add Task Form (Inline Drawer) */}
      {isAdding && (
        <form
          onSubmit={handleSubmitNew}
          className="tactile-card rounded-2xl p-5 mb-5 border border-white/90 shadow-md animate-fade-in"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C9A8E]">Create New Task</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1 rounded-lg text-[#5E6762] hover:text-[#1C221F]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder="What would you like to accomplish?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl tactile-concave text-sm font-semibold text-[#1C221F] outline-none border border-black/5 focus:ring-2 focus:ring-[#C2B8D9] mb-3"
            required
          />

          <textarea
            placeholder="Optional notes, checklist, or links..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2 rounded-xl tactile-concave text-xs text-[#2D3A34] outline-none border border-black/5 focus:ring-2 focus:ring-[#C2B8D9] mb-3 resize-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-black/5">
            {/* Category tag */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#5E6762] font-medium">Tag:</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Task['category'])}
                className="px-2.5 py-1.5 rounded-xl bg-white text-xs font-semibold text-[#2D3A34] border border-black/10 outline-none"
              >
                <option value="work">Work</option>
                <option value="study">Study</option>
                <option value="personal">Personal</option>
                <option value="project">Project</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Pomodoro Est */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5E6762] font-medium">Est. Pomodoros:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEstPomodoros(Math.max(1, estPomodoros - 1))}
                  className="w-7 h-7 rounded-lg bg-black/5 flex items-center justify-center font-bold text-sm text-[#2D3A34] hover:bg-black/10"
                >
                  -
                </button>
                <span className="w-6 text-center font-bold text-xs text-[#1C221F]">{estPomodoros}</span>
                <button
                  type="button"
                  onClick={() => setEstPomodoros(estPomodoros + 1)}
                  className="w-7 h-7 rounded-lg bg-black/5 flex items-center justify-center font-bold text-sm text-[#2D3A34] hover:bg-black/10"
                >
                  +
                </button>
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="tactile-btn px-4 py-2 rounded-xl text-xs font-semibold text-[#5E6762]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="tactile-btn-sage px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
              >
                Save Task
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveEdit}
            className="tactile-card w-full max-w-md rounded-2xl p-6 border border-white/80 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="absolute top-4 right-4 p-2 text-[#5E6762] hover:text-[#1C221F]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#1C221F] mb-4">Edit Task</h3>

            <input
              type="text"
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl tactile-concave text-sm font-semibold text-[#1C221F] outline-none border border-black/5 focus:ring-2 focus:ring-[#C2B8D9] mb-3"
              required
            />

            <textarea
              placeholder="Notes..."
              value={editingTask.notes || ''}
              onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl tactile-concave text-xs text-[#2D3A34] outline-none border border-black/5 focus:ring-2 focus:ring-[#C2B8D9] mb-3 resize-none"
            />

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="text-xs text-[#5E6762] block mb-1">Category Tag</label>
                <select
                  value={editingTask.category}
                  onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value as Task['category'] })}
                  className="w-full px-3 py-2 rounded-xl bg-white text-xs font-semibold text-[#2D3A34] border border-black/10 outline-none"
                >
                  <option value="work">Work</option>
                  <option value="study">Study</option>
                  <option value="personal">Personal</option>
                  <option value="project">Project</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#5E6762] block mb-1">Est. Pomodoros</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={editingTask.estPomodoros}
                  onChange={(e) => setEditingTask({ ...editingTask, estPomodoros: Math.max(1, Number(e.target.value)) })}
                  className="w-full px-3 py-2 rounded-xl bg-white text-xs font-semibold text-[#2D3A34] border border-black/10 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="tactile-btn px-4 py-2 rounded-xl text-xs font-semibold text-[#5E6762]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="tactile-btn-sage px-5 py-2 rounded-xl text-xs font-bold"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.map((t) => {
          const isActive = t.id === activeTaskId;
          const catStyle = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.other;

          return (
            <div
              key={t.id}
              onClick={() => onSelectActiveTask(isActive ? null : t.id)}
              className={`rounded-2xl p-4 transition-all cursor-pointer relative border ${
                isActive
                  ? 'tactile-card border-2 border-[#7C9A8E] shadow-md ring-2 ring-[#7C9A8E]/20'
                  : t.completed
                  ? 'bg-[#E8E7E3]/60 border-black/5 opacity-70'
                  : 'tactile-convex border-white/80 hover:border-[#7C9A8E]/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Checkbox button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(t);
                  }}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    t.completed
                      ? 'bg-[#7C9A8E] text-white shadow-xs'
                      : 'tactile-concave text-transparent hover:text-black/30'
                  }`}
                  title={t.completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  <Check className="w-4 h-4" />
                </button>

                {/* Task Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4
                      className={`text-sm font-bold truncate ${
                        t.completed ? 'line-through text-[#5E6762]' : 'text-[#1C221F]'
                      }`}
                    >
                      {t.title}
                    </h4>

                    {/* Tag badge */}
                    <span
                      style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                    >
                      {t.category}
                    </span>

                    {isActive && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#7C9A8E] text-white animate-pulse">
                        Active Focus
                      </span>
                    )}
                  </div>

                  {t.notes && (
                    <p className="text-xs text-[#5E6762] line-clamp-2 mb-2">{t.notes}</p>
                  )}

                  {/* Pomodoro count progress indicators */}
                  <div className="flex items-center gap-3 text-xs text-[#5E6762]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#2D3A34]">
                        {t.actPomodoros} / {t.estPomodoros}
                      </span>
                      <span>pomodoros</span>
                    </div>

                    {/* Visual tomato dots */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.max(t.estPomodoros, t.actPomodoros) }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < t.actPomodoros
                              ? 'bg-[#7C9A8E]'
                              : i < t.estPomodoros
                              ? 'bg-[#D4D2CA] border border-black/10'
                              : 'bg-amber-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleStartEdit(t)}
                    className="p-2 rounded-xl text-[#5E6762] hover:text-[#1C221F] hover:bg-black/5"
                    title="Edit task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteTask(t.id)}
                    className="p-2 rounded-xl text-[#5E6762] hover:text-red-600 hover:bg-black/5"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="tactile-concave rounded-2xl p-8 text-center border border-white/50">
            <p className="text-sm font-semibold text-[#2D3A34] mb-1">No tasks in this list</p>
            <p className="text-xs text-[#5E6762] mb-4">Add a new task to organize your next focus session</p>
            <button
              onClick={handleStartAdd}
              className="tactile-btn-sage px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add First Task
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
