import React from 'react';
import { X, Command, CornerDownLeft } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Start or Pause current timer session' },
    { key: 'Esc', desc: 'Reset current timer to starting duration' },
    { key: 'Alt + S', desc: 'Skip current phase to next session or break' },
    { key: 'Ctrl/Cmd + K', desc: 'Quick add a new task' },
    { key: '?', desc: 'Toggle keyboard shortcuts cheatsheet' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="tactile-card w-full max-w-md rounded-2xl p-6 relative border border-white/80 animate-fade-in shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#5E6762] hover:text-[#1C221F] rounded-xl hover:bg-black/5"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#DCD7EC] flex items-center justify-center text-[#584B79]">
            <Command className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1C221F]">Keyboard Shortcuts</h3>
            <p className="text-xs text-[#5E6762]">Navigate effortlessly without touching the mouse</p>
          </div>
        </div>

        <div className="space-y-2.5 mb-6">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="tactile-concave flex items-center justify-between p-3 rounded-xl border border-white/60"
            >
              <span className="text-sm font-medium text-[#2D3A34]">{sc.desc}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-bold text-[#1C221F] bg-[#FFFFFF] rounded-lg shadow-xs border border-black/10">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="tactile-btn-sage w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
        >
          <CornerDownLeft className="w-4 h-4" /> Got it, let's focus
        </button>
      </div>
    </div>
  );
};
