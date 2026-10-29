import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RefreshCw,
  Database,
  Cloud,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Zap,
  ArrowRight,
  Sliders,
  FileText,
  Users,
  Building,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const DualDatabaseSyncCard: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const {
    dualSyncTelemetry,
    triggerDualDatabaseSync,
    setDualSyncAutoInterval,
    toggleDualSyncAuto
  } = useApp();

  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    setSuccessFeedback(null);
    try {
      const res = await triggerDualDatabaseSync();
      if (res.success) {
        setSuccessFeedback(`Pushed ${res.count} high-priority Firestore legal records to Cloudflare D1 'CHAMBERS_DB'.`);
        setTimeout(() => setSuccessFeedback(null), 5000);
      }
    } finally {
      setIsManualSyncing(false);
    }
  };

  const formatTimeAgo = (isoString: string | null) => {
    if (!isoString) return 'Never';
    const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (compact) {
    return (
      <div className="bg-[#10172a] text-white p-3 rounded-lg border border-[#c9a227]/40 shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded border border-amber-400/30">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold flex items-center gap-1.5 text-white">
              Dual Sync: Firestore ⟷ D1 'CHAMBERS_DB'
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="text-[11px] text-gray-400 font-mono">
              Last synced: {formatTimeAgo(dualSyncTelemetry.lastSyncTime)} • Consistency {dualSyncTelemetry.consistencyScorePct}%
            </div>
          </div>
        </div>

        <button
          onClick={handleManualSync}
          disabled={isManualSyncing || dualSyncTelemetry.syncStatus === 'SYNCING'}
          className="px-2.5 py-1.5 bg-[#c9a227] hover:bg-[#d8b030] text-[#1a2a4a] font-bold rounded text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isManualSyncing ? 'animate-spin' : ''}`} />
          Sync
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white rounded-xl border-2 border-[#c9a227]/60 shadow-xl p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-700/80 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-400/40 shrink-0">
            <Zap className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif font-black text-lg text-white">
                Dual-Database Periodic Synchronization Service
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE PERIODIC SYNC
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
              Periodically pushes high-priority Firestore legal documents to Cloudflare D1 distributed SQLite tables (<strong>CHAMBERS_DB</strong>) ensuring continuous dual-database redundancy and edge availability.
            </p>
          </div>
        </div>

        {/* Sync Action & Consistency Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleManualSync}
            disabled={isManualSyncing || dualSyncTelemetry.syncStatus === 'SYNCING'}
            className="px-4 py-2 bg-[#c9a227] hover:bg-[#d8b030] text-[#1a2a4a] font-black text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60 active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing || dualSyncTelemetry.syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
            {isManualSyncing || dualSyncTelemetry.syncStatus === 'SYNCING' ? 'Syncing...' : 'Sync High-Priority Now'}
          </button>
        </div>
      </div>

      {successFeedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {successFeedback}
        </div>
      )}

      {/* Database Route Topology */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center bg-[#131d33] p-4 rounded-xl border border-gray-700">
        {/* Source: Firestore */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase text-gray-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Source Document Store
          </div>
          <div className="font-bold text-sm text-white flex items-center gap-1.5">
            <Database className="w-4 h-4 text-[#c9a227]" />
            Google Cloud Firestore
          </div>
          <div className="text-[11px] text-gray-300 font-mono">
            DB: ai-studio-remixremixbbbale...
          </div>
        </div>

        {/* Sync Pipe Indicator */}
        <div className="flex flex-col items-center justify-center py-2 px-3 bg-[#0a0f1d] rounded-lg border border-gray-800 text-center space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#c9a227]">
            <span>Firestore</span>
            <ArrowRight className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>CHAMBERS_DB</span>
          </div>
          <div className="text-[10px] text-gray-400">
            Interval: <strong>{dualSyncTelemetry.intervalSeconds}s</strong> • Auto: <strong>{dualSyncTelemetry.autoSyncEnabled ? 'Enabled' : 'Paused'}</strong>
          </div>
        </div>

        {/* Target: Cloudflare D1 */}
        <div className="space-y-1 md:text-right">
          <div className="text-[10px] font-mono uppercase text-gray-400 flex items-center md:justify-end gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            Target Relational Engine
          </div>
          <div className="font-bold text-sm text-white flex items-center md:justify-end gap-1.5">
            Cloudflare D1 (CHAMBERS_DB)
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-[11px] text-gray-300 font-mono">
            Binding: <strong>env.CHAMBERS_DB</strong>
          </div>
        </div>
      </div>

      {/* Metrics & High Priority Records Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#131d33] p-3.5 rounded-lg border border-gray-700/80 space-y-1">
          <div className="text-[11px] font-mono uppercase text-gray-400 flex items-center justify-between">
            <span>Litigation Cases</span>
            <FileText className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-black text-white">
            {dualSyncTelemetry.highPriorityCounts.matters} Active Cases
          </div>
          <div className="text-[10px] text-gray-400 font-mono">table: case_files</div>
        </div>

        <div className="bg-[#131d33] p-3.5 rounded-lg border border-gray-700/80 space-y-1">
          <div className="text-[11px] font-mono uppercase text-gray-400 flex items-center justify-between">
            <span>Clients & KYC</span>
            <Users className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-lg font-black text-white">
            {dualSyncTelemetry.highPriorityCounts.clients} Retainers
          </div>
          <div className="text-[10px] text-gray-400 font-mono">table: clients</div>
        </div>

        <div className="bg-[#131d33] p-3.5 rounded-lg border border-gray-700/80 space-y-1">
          <div className="text-[11px] font-mono uppercase text-gray-400 flex items-center justify-between">
            <span>Property Records</span>
            <Building className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-white">
            {dualSyncTelemetry.highPriorityCounts.properties} Assets
          </div>
          <div className="text-[10px] text-gray-400 font-mono">table: property_records</div>
        </div>

        <div className="bg-[#131d33] p-3.5 rounded-lg border border-gray-700/80 space-y-1">
          <div className="text-[11px] font-mono uppercase text-gray-400 flex items-center justify-between">
            <span>Consistency Score</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-emerald-400">
            {dualSyncTelemetry.consistencyScorePct}% Matched
          </div>
          <div className="text-[10px] text-gray-400 font-mono">100% Dual Parity</div>
        </div>
      </div>

      {/* Controls & Configuration Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-gray-800">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-gray-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Last Sync: <strong className="text-white font-mono">{formatTimeAgo(dualSyncTelemetry.lastSyncTime)}</strong>
          </span>

          <span className="text-gray-400">•</span>

          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-400">Interval:</span>
            <select
              value={dualSyncTelemetry.intervalSeconds}
              onChange={(e) => setDualSyncAutoInterval(Number(e.target.value))}
              className="bg-[#0f172a] text-white border border-gray-600 rounded px-2 py-0.5 text-xs font-mono cursor-pointer"
            >
              <option value={30}>Every 30s</option>
              <option value={60}>Every 60s (Default)</option>
              <option value={120}>Every 2 mins</option>
              <option value={300}>Every 5 mins</option>
            </select>
          </div>

          <button
            onClick={() => toggleDualSyncAuto(!dualSyncTelemetry.autoSyncEnabled)}
            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer border ${
              dualSyncTelemetry.autoSyncEnabled
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600 hover:bg-emerald-900'
                : 'bg-gray-800 text-gray-400 border-gray-600 hover:bg-gray-700'
            }`}
          >
            {dualSyncTelemetry.autoSyncEnabled ? 'Auto-Sync: ON' : 'Auto-Sync: PAUSED'}
          </button>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-xs cursor-pointer font-medium"
        >
          {showHistory ? 'Hide Sync History' : 'View Sync Audit Log'}
          {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Collapsible Sync History */}
      {showHistory && (
        <div className="mt-3 bg-[#0a0f1d] p-3 rounded-lg border border-gray-800 space-y-2 text-xs">
          <div className="font-bold text-gray-300 text-[11px] uppercase tracking-wider font-mono">
            Recent Dual-Sync Executions
          </div>
          {dualSyncTelemetry.history.length === 0 ? (
            <div className="text-gray-500 italic py-2">No sync events recorded yet. Periodic timer is running.</div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {dualSyncTelemetry.history.map((h, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] border-b border-gray-800/80 pb-1">
                  <div className="flex items-center gap-2">
                    {h.status === 'SUCCESS' ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                    )}
                    <span className="text-gray-300">{h.details}</span>
                  </div>
                  <div className="text-gray-500 font-mono text-[10px] shrink-0">
                    {new Date(h.timestamp).toLocaleTimeString()} ({h.durationMs}ms)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
