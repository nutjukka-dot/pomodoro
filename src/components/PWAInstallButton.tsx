import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="tactile-btn flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2D3A34] border border-white/60 min-h-[44px]"
        title="Install as Progressive Web App"
      >
        <Download className="w-4 h-4 text-[#7C9A8E]" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="tactile-btn flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2D3A34] border border-white/60 min-h-[44px]"
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-4 h-4 text-[#584B79]" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="tactile-card w-full max-w-sm rounded-2xl p-6 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-2 text-[#5E6762] hover:text-[#1C221F] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#E2ECE7] flex items-center justify-center text-[#2D3A34]">
                  <Smartphone className="w-5 h-5 text-[#7C9A8E]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1C221F]">Install on iOS</h3>
              </div>
              <p className="text-sm text-[#5E6762] leading-relaxed mb-4">
                To install Tactile Pomodoro on your iPhone or iPad:
              </p>
              <ol className="text-xs text-[#2D3A34] space-y-2.5 mb-5 bg-[#E8E7E3]/60 p-3.5 rounded-xl border border-white/50">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#7C9A8E]">1.</span>
                  <span>Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#7C9A8E]">2.</span>
                  <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#7C9A8E]">3.</span>
                  <span>Tap <strong>Add</strong> in the top right corner.</span>
                </li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="tactile-btn-sage w-full py-2.5 rounded-xl font-medium text-sm min-h-[44px]"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
