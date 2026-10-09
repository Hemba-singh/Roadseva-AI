import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!isOnline) {
    return (
      <aside aria-label="Offline Mode" className="fixed top-2.5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-[#1C1C1E]/90 text-white px-4 py-1.5 text-xs font-medium shadow-lg backdrop-blur-md border border-white/10 animate-in fade-in duration-200">
        <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Offline Mode — Reports will queue locally for auto-sync.</span>
      </aside>
    );
  }

  if (showReconnected) {
    return (
      <aside aria-label="Online Status" className="fixed top-2.5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-[#34C759] text-white px-4 py-1.5 text-xs font-medium shadow-lg backdrop-blur-md animate-in fade-in duration-200">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>Connection Restored — Synced with RoadSeva</span>
      </aside>
    );
  }

  return null;
};
