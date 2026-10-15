import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-[#584B79] text-white px-4 py-2.5 text-xs font-medium shadow-lg border border-white/20 animate-fade-in">
      <WifiOff className="w-4 h-4 text-[#DCD7EC]" />
      <span>Offline Mode — All data is preserved locally.</span>
    </div>
  );
};
