import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Bell, Shield, Lock, AlertTriangle, CheckCircle2, Search, Filter, Clock, Trash2, CheckCheck, Plus, X } from 'lucide-react';
import { AlertNotification, AuditLog, SensitiveAccessAttempt } from '../../../types';

export const AuditAlertsModule: React.FC = () => {
  const {
    alerts,
    markAlertRead,
    dismissAlert,
    markAllAlertsAsRead,
    addAlert,
    auditLogs,
    sensitiveAttempts,
    activeBranchId,
    branches,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'alerts' | 'audit' | 'sensitive'>('alerts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // New alert modal state
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newPriority, setNewPriority] = useState<AlertNotification['priority']>('High');
  const [newCategory, setNewCategory] = useState<AlertNotification['category']>('Court');
  const [newBranchId, setNewBranchId] = useState<string>(activeBranchId === 'ALL' ? (branches[0]?.id || 'BRN-LAG') : activeBranchId);

  const branchAlerts = alerts.filter(a => {
    const branchMatch = activeBranchId === 'ALL' || a.branchId === activeBranchId || a.branchId === 'ALL';
    const priorityMatch = selectedPriority === 'ALL' || a.priority === selectedPriority;
    const catMatch = selectedCategory === 'ALL' || a.category === selectedCategory;
    const searchMatch = !searchTerm ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.message.toLowerCase().includes(searchTerm.toLowerCase());
    return branchMatch && priorityMatch && catMatch && searchMatch;
  });

  const unreadCount = alerts.filter(a => !a.isRead && (activeBranchId === 'ALL' || a.branchId === activeBranchId || a.branchId === 'ALL')).length;
  const branchAudit = auditLogs.filter(l => activeBranchId === 'ALL' || l.branchId === activeBranchId);

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    addAlert({
      branchId: newBranchId,
      title: newTitle.trim(),
      message: newMessage.trim(),
      priority: newPriority,
      category: newCategory
    });

    setNewTitle('');
    setNewMessage('');
    setShowNewAlertModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-black text-xl text-[#1a2a4a]">
            Alert Center, Sensitive Access Logs & Audit Trail
          </h2>
          <p className="text-xs text-[#5a5a5a]">
            Real-time notifications, statutory filing alarms, immutable access records, and full Chambers audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'alerts' && (
            <>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAlertsAsRead}
                  className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark All as Read ({unreadCount})</span>
                </button>
              )}

              <button
                onClick={() => setShowNewAlertModal(true)}
                className="px-3 py-1.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded text-xs font-bold font-serif-heading flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Dispatch Alert</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e0ddd5]">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'alerts' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500'
          }`}
        >
          <span>Dual Alerts Center</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] ${
            unreadCount > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-200 text-gray-700'
          }`}>
            {branchAlerts.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('sensitive')}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer ${
            activeTab === 'sensitive' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500'
          }`}
        >
          Sensitive Access Verification Logs ({sensitiveAttempts.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer ${
            activeTab === 'audit' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500'
          }`}
        >
          Chambers Audit Trail ({branchAudit.length})
        </button>
      </div>

      {/* Tab 1: Alerts Center */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div className="bg-white p-3 rounded-lg border border-[#e0ddd5] shadow-xs flex flex-wrap gap-3 items-center justify-between text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-semibold">Priority:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="p-1.5 rounded border border-gray-300 focus:outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-semibold">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-1.5 rounded border border-gray-300 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Court">Court</option>
                <option value="Rent">Rent</option>
                <option value="Financial">Financial</option>
                <option value="Security">Security</option>
                <option value="HR">HR</option>
                <option value="System">System</option>
              </select>
            </div>
          </div>

          {branchAlerts.length > 0 ? (
            <div className="space-y-2.5">
              {branchAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border shadow-2xs flex items-start justify-between gap-4 text-xs transition-all ${
                    !alert.isRead ? 'border-l-4 border-l-[#c9a227]' : ''
                  } ${
                    alert.priority === 'Critical'
                      ? 'bg-rose-50/70 border-rose-300'
                      : alert.priority === 'High'
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-white border-[#e0ddd5]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 uppercase font-mono ${
                      alert.priority === 'Critical' ? 'bg-red-700 text-white animate-pulse' :
                      alert.priority === 'High' ? 'bg-amber-600 text-white' :
                      alert.priority === 'Medium' ? 'bg-blue-700 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {alert.priority}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-sm text-[#1a2a4a]">{alert.title}</h4>
                        {!alert.isRead && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">
                            Unread
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mt-1 leading-relaxed">{alert.message}</p>
                      <div className="text-[10px] text-gray-400 font-mono mt-1.5 flex items-center gap-3">
                        <span>Category: {alert.category}</span>
                        <span>·</span>
                        <span>Branch: {branches.find(b => b.id === alert.branchId)?.name || alert.branchId}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.timestamp).toLocaleString('en-GB')}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!alert.isRead && (
                      <button
                        onClick={() => markAlertRead(alert.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold border rounded bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 whitespace-nowrap transition-colors"
                        title="Mark as Acknowledged"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100 transition-colors"
                      title="Dismiss Alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-[#e0ddd5] space-y-3">
              <Bell className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Alert Center is Clear</h3>
              <p className="text-xs text-[#5a5a5a] max-w-md mx-auto">
                No active notifications or statutory deadline warnings match the selected filters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Sensitive Access Attempts */}
      {activeTab === 'sensitive' && (
        <div className="bg-white rounded-lg border border-[#e0ddd5] shadow-xs overflow-x-auto">
          <div className="p-3 bg-[#1a2a4a] text-white text-xs font-serif font-bold flex items-center justify-between">
            <span>Portal Access & Identity Verification Events (Code + ID)</span>
            <span className="text-[10px] font-mono text-[#c9a227]">NDPA Compliant</span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-[11px] font-mono-code text-gray-700">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Portal Target</th>
                <th className="p-3">Code Entered</th>
                <th className="p-3">Identifier Verified</th>
                <th className="p-3">Outcome</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sensitiveAttempts.map(att => (
                <tr key={att.id} className="hover:bg-[#f8f6f1]">
                  <td className="p-3 font-mono text-gray-600">
                    {new Date(att.timestamp).toLocaleString('en-GB')}
                  </td>
                  <td className="p-3 font-semibold text-gray-900">{att.portalType} Portal</td>
                  <td className="p-3 font-mono font-bold text-[#1a2a4a]">{att.codeUsed}</td>
                  <td className="p-3 font-mono text-gray-600">{att.identifierUsed}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      att.status === 'Granted' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {att.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-gray-500">{att.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {sensitiveAttempts.length === 0 && (
            <div className="text-center py-12 text-xs text-gray-400">
              No sensitive portal access attempts recorded yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Immutable Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-lg border border-[#e0ddd5] shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1a2a4a] text-white border-b border-[#c9a227] text-[11px] font-mono-code">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor & Role</th>
                <th className="p-3">Action</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branchAudit.map(log => (
                <tr key={log.id} className="hover:bg-[#f8f6f1]">
                  <td className="p-3 font-mono text-gray-600 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-GB')}
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-gray-900">{log.actor}</span>
                    <span className="text-[10px] text-gray-500 block">({log.actorRole})</span>
                  </td>
                  <td className="p-3 font-bold text-[#1a2a4a]">{log.action}</td>
                  <td className="p-3 font-mono text-gray-700">{log.targetEntity}</td>
                  <td className="p-3 text-gray-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {branchAudit.length === 0 && (
            <div className="text-center py-12 text-xs text-gray-400">
              Audit log is clear.
            </div>
          )}
        </div>
      )}

      {/* New Alert Modal */}
      {showNewAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#1a2a4a] text-white flex items-center justify-between border-b-2 border-[#c9a227]">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#c9a227]" />
                <h3 className="font-serif font-bold text-sm sm:text-base">
                  Dispatch Operational Alert
                </h3>
              </div>
              <button
                onClick={() => setShowNewAlertModal(false)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Target Branch
                </label>
                <select
                  value={newBranchId}
                  onChange={(e) => setNewBranchId(e.target.value)}
                  className="w-full p-2 border rounded border-gray-300 focus:outline-none focus:border-[#c9a227]"
                >
                  <option value="ALL">All Chambers Branches (Firm-wide)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2 border rounded border-gray-300 focus:outline-none focus:border-[#c9a227]"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2 border rounded border-gray-300 focus:outline-none focus:border-[#c9a227]"
                  >
                    <option value="Court">Court</option>
                    <option value="Rent">Rent</option>
                    <option value="Financial">Financial</option>
                    <option value="Security">Security</option>
                    <option value="HR">HR</option>
                    <option value="System">System</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Alert Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supreme Court Filing Deadline Notice"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 border rounded border-gray-300 focus:outline-none focus:border-[#c9a227]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Alert Message & Directive *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details of statutory deadlines, required counsel action, or notice status..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full p-2 border rounded border-gray-300 focus:outline-none focus:border-[#c9a227]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewAlertModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded hover:bg-[#111e38]"
                >
                  Dispatch Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
