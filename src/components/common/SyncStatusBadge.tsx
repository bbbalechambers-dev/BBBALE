import React from 'react';
import { RefreshCw, CheckCircle2, WifiOff, Cloud } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SyncStatusBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { syncStatus, lastSyncedAt, triggerManualSync } = useApp();

  const timeAgo = () => {
    if (!lastSyncedAt) return 'Never';
    const seconds = Math.floor((new Date().getTime() - new Date(lastSyncedAt).getTime()) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  if (compact) {
    return (
      <button
        onClick={triggerManualSync}
        title={`Sync status: ${syncStatus}. Last synced: ${timeAgo()}`}
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono-code bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
      >
        {syncStatus === 'Synced' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
        {syncStatus === 'Syncing' && <RefreshCw className="w-3 h-3 text-amber-300 animate-spin" />}
        {syncStatus === 'Offline' && <WifiOff className="w-3 h-3 text-rose-400" />}
        <span>{syncStatus}</span>
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-[#e0ddd5] shadow-2xs text-xs font-mono-code text-[#1c1c1c]">
      <div className="flex items-center gap-1.5">
        {syncStatus === 'Synced' && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}
        {syncStatus === 'Syncing' && (
          <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
        )}
        {syncStatus === 'Offline' && (
          <span className="h-2 w-2 rounded-full bg-rose-500"></span>
        )}
        <span className="font-semibold text-gray-700">{syncStatus}</span>
      </div>

      <span className="text-gray-400">·</span>

      <span className="text-[11px] text-gray-500">{timeAgo()}</span>

      <button
        type="button"
        onClick={triggerManualSync}
        className="p-1 text-gray-400 hover:text-[#1a2a4a] hover:bg-gray-100 rounded cursor-pointer transition-colors"
        title="Force sync now"
      >
        <RefreshCw className="w-3 h-3" />
      </button>
    </div>
  );
};
