import React, { useState } from 'react';
import { X, Sliders, Bell, Play, Check, Sparkles, Volume2 } from 'lucide-react';
import { Settings, ChimeType } from '../types';
import { playChime } from '../utils/audio';
import { requestNotificationPermission, getNotificationPermission } from '../utils/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [form, setForm] = useState<Settings>({ ...settings });
  const [notifState, setNotifState] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermission()
  );

  if (!isOpen) return null;

  const handleApplyPreset = (focus: number, shortBreak: number, longBreak: number, interval: number = 4) => {
    setForm((prev) => ({
      ...prev,
      focusMinutes: focus,
      shortBreakMinutes: shortBreak,
      longBreakMinutes: longBreak,
      longBreakInterval: interval,
    }));
  };

  const handleTestChime = (sound: ChimeType) => {
    playChime(sound, form.alarmVolume);
  };

  const handleRequestNotif = async () => {
    const granted = await requestNotificationPermission();
    setNotifState(granted ? 'granted' : 'denied');
    setForm((prev) => ({ ...prev, notificationEnabled: granted }));
  };

  const handleSave = () => {
    onSaveSettings(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="tactile-card w-full max-w-lg rounded-2xl p-6 relative border border-white/80 my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#5E6762] hover:text-[#1C221F] rounded-xl hover:bg-black/5"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#E2ECE7] flex items-center justify-center text-[#2D3A34]">
            <Sliders className="w-5 h-5 text-[#7C9A8E]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1C221F]">Preferences & Timer</h3>
            <p className="text-xs text-[#5E6762]">Tailor your focus rhythm, intervals, and audio alerts</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5E6762] mb-2.5">
            Quick Presets
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleApplyPreset(25, 5, 15, 4)}
              className="tactile-btn p-2.5 rounded-xl text-left border border-white/70 hover:border-[#7C9A8E]/40"
            >
              <div className="font-bold text-xs text-[#2D3A34]">Standard</div>
              <div className="text-[11px] text-[#5E6762]">25 / 5 / 15m</div>
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(50, 10, 20, 4)}
              className="tactile-btn p-2.5 rounded-xl text-left border border-white/70 hover:border-[#7C9A8E]/40"
            >
              <div className="font-bold text-xs text-[#2D3A34]">Deep Work</div>
              <div className="text-[11px] text-[#5E6762]">50 / 10 / 20m</div>
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(15, 3, 10, 4)}
              className="tactile-btn p-2.5 rounded-xl text-left border border-white/70 hover:border-[#7C9A8E]/40"
            >
              <div className="font-bold text-xs text-[#2D3A34]">Sprint</div>
              <div className="text-[11px] text-[#5E6762]">15 / 3 / 10m</div>
            </button>
          </div>
        </div>

        {/* Durations Configuration */}
        <div className="tactile-concave rounded-2xl p-4 border border-white/60 space-y-4 mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2D3A34]">
            Timer Intervals (Minutes)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-xs font-medium text-[#5E6762] block mb-1">Focus Time</span>
              <input
                type="number"
                min="1"
                max="120"
                value={form.focusMinutes}
                onChange={(e) => setForm({ ...form, focusMinutes: Math.max(1, Number(e.target.value)) })}
                className="w-full px-3 py-2 rounded-xl bg-white text-sm font-semibold text-[#1C221F] border border-black/10 focus:ring-2 focus:ring-[#C2B8D9] outline-none"
              />
            </div>
            <div>
              <span className="text-xs font-medium text-[#5E6762] block mb-1">Short Break</span>
              <input
                type="number"
                min="1"
                max="60"
                value={form.shortBreakMinutes}
                onChange={(e) => setForm({ ...form, shortBreakMinutes: Math.max(1, Number(e.target.value)) })}
                className="w-full px-3 py-2 rounded-xl bg-white text-sm font-semibold text-[#1C221F] border border-black/10 focus:ring-2 focus:ring-[#C2B8D9] outline-none"
              />
            </div>
            <div>
              <span className="text-xs font-medium text-[#5E6762] block mb-1">Long Break</span>
              <input
                type="number"
                min="1"
                max="90"
                value={form.longBreakMinutes}
                onChange={(e) => setForm({ ...form, longBreakMinutes: Math.max(1, Number(e.target.value)) })}
                className="w-full px-3 py-2 rounded-xl bg-white text-sm font-semibold text-[#1C221F] border border-black/10 focus:ring-2 focus:ring-[#C2B8D9] outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-black/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#2D3A34]">Long Break Interval</span>
              <p className="text-[11px] text-[#5E6762]">Sessions before taking a long break</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="12"
                value={form.longBreakInterval}
                onChange={(e) => setForm({ ...form, longBreakInterval: Math.max(1, Number(e.target.value)) })}
                className="w-20 px-3 py-1.5 rounded-xl bg-white text-sm font-semibold text-[#1C221F] text-center border border-black/10 focus:ring-2 focus:ring-[#C2B8D9] outline-none"
              />
              <span className="text-xs text-[#5E6762]">sessions</span>
            </div>
          </div>
        </div>

        {/* Automation Toggles */}
        <div className="space-y-3 mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5E6762]">
            Automation Flows
          </label>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFFFFF]/60 border border-black/5">
            <div>
              <span className="text-sm font-semibold text-[#1C221F]">Auto-start Breaks</span>
              <p className="text-xs text-[#5E6762]">Automatically start break timer when focus completes</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, autoStartBreaks: !form.autoStartBreaks })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                form.autoStartBreaks ? 'bg-[#7C9A8E]' : 'bg-[#E2E1DC]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  form.autoStartBreaks ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFFFFF]/60 border border-black/5">
            <div>
              <span className="text-sm font-semibold text-[#1C221F]">Auto-start Pomodoros</span>
              <p className="text-xs text-[#5E6762]">Automatically start focus timer when break finishes</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, autoStartPomodoros: !form.autoStartPomodoros })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                form.autoStartPomodoros ? 'bg-[#7C9A8E]' : 'bg-[#E2E1DC]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  form.autoStartPomodoros ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Audio Alerts & Notifications */}
        <div className="space-y-3 mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5E6762]">
            Chime & Alerts
          </label>

          {/* Sound selection */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['bell', 'chime', 'gong', 'marimba'] as ChimeType[]).map((snd) => {
              const isSelected = form.alarmSound === snd;
              return (
                <div
                  key={snd}
                  className={`p-2.5 rounded-xl flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'tactile-concave border border-[#7C9A8E]/50'
                      : 'tactile-btn border border-white/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold capitalize text-[#1C221F]">{snd}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#7C9A8E]" />}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, alarmSound: snd })}
                      className="text-[11px] py-1 px-2 rounded-lg bg-black/5 hover:bg-black/10 text-[#2D3A34] flex-1 text-center font-medium"
                    >
                      Select
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTestChime(snd)}
                      className="p-1 rounded-lg bg-black/5 hover:bg-[#7C9A8E] hover:text-white text-[#2D3A34] transition"
                      title="Preview sound"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Volume slider */}
          <div className="tactile-concave p-3 rounded-xl border border-white/60">
            <div className="flex items-center justify-between text-xs mb-2 text-[#2D3A34]">
              <span className="flex items-center gap-1.5 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-[#7C9A8E]" /> Chime Volume
              </span>
              <span className="font-bold">{form.alarmVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={form.alarmVolume}
              onChange={(e) => setForm({ ...form, alarmVolume: Number(e.target.value) })}
              className="w-full accent-[#7C9A8E]"
            />
          </div>

          {/* Web notification status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFFFFF]/60 border border-black/5">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-[#584B79]" />
              <div>
                <span className="text-sm font-semibold text-[#1C221F]">Desktop Notifications</span>
                <p className="text-[11px] text-[#5E6762]">
                  Status:{' '}
                  <span
                    className={`font-semibold ${
                      notifState === 'granted' ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {notifState}
                  </span>
                </p>
              </div>
            </div>
            {notifState !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestNotif}
                className="tactile-btn-lavender px-3 py-1.5 rounded-xl text-xs font-semibold"
              >
                Enable
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
          <button
            type="button"
            onClick={onClose}
            className="tactile-btn px-5 py-2.5 rounded-xl text-sm font-medium text-[#5E6762]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="tactile-btn-sage px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
