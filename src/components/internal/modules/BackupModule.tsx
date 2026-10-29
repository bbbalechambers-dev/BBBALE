import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { PrintHeader } from '../../common/PrintHeader';
import { Archive, Printer, Download, Calendar, CheckSquare, Shield, Clock, FileCheck, Cloud, CloudUpload, CheckCircle2 } from 'lucide-react';
import { BackupRecord } from '../../../types';

export const BackupModule: React.FC = () => {
  const {
    backups,
    generateHardCopyBackup,
    matters,
    clients,
    properties,
    tenants,
    invoices,
    receipts,
    precedents,
    staff,
    activeBranchId,
    getActiveBranch,
    branches,
    canAccessBranchData,
    effectiveBranchId,
    pushAllToCloudflareDatabase
  } = useApp();

  const [dateStart, setDateStart] = useState('2026-01-01');
  const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0]);
  const [isSyncingCloudflare, setIsSyncingCloudflare] = useState(false);
  const [cfSuccessMsg, setCfSuccessMsg] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Litigation Matters',
    'Clients & KYC',
    'Properties & Tenancies',
    'Invoices & Receipts',
    'Court Precedents',
    'Staff & Payroll'
  ]);
  const [activeBackupBundle, setActiveBackupBundle] = useState<BackupRecord | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);

  const activeBranch = getActiveBranch();
  const targetBranchId = effectiveBranchId;
  const branchBackups = backups.filter(b => canAccessBranchData(b.branchId));

  const availableCategories = [
    'Litigation Matters',
    'Clients & KYC',
    'Properties & Tenancies',
    'Invoices & Receipts',
    'Court Precedents',
    'Staff & Payroll',
    'Statutory Notices',
    'Audit Trail & Sensitive Access Logs'
  ];

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(prev => prev.filter(c => c !== cat));
    } else {
      setSelectedCategories(prev => [...prev, cat]);
    }
  };

  const handleGenerateBackup = (e: React.FormEvent) => {
    e.preventDefault();
    setBackupError(null);
    if (selectedCategories.length === 0) {
      setBackupError('Please select at least one record category to generate an archival bundle.');
      return;
    }

    const backup = generateHardCopyBackup(targetBranchId, dateStart, dateEnd, selectedCategories);
    setActiveBackupBundle(backup);
  };

  const handleStoreToCloudflare = async () => {
    setIsSyncingCloudflare(true);
    setCfSuccessMsg(null);
    try {
      const res = await pushAllToCloudflareDatabase();
      if (res.success) {
        setCfSuccessMsg(`Stored ${res.count} records in Cloudflare D1 Database (chambers-d1-db).`);
        setTimeout(() => setCfSuccessMsg(null), 6000);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsSyncingCloudflare(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-black text-xl text-[#1a2a4a]">
            Administrator Hard-Copy Backup & Record Archiver
          </h2>
          <p className="text-xs text-[#5a5a5a]">
            Section 13: Administrator compiles official printable physical backup bundles with Cover Page, TOC, and Reference No [BRANCH]/BKP/[YEAR]/[SEQ].
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStoreToCloudflare}
            disabled={isSyncingCloudflare}
            className="px-3.5 py-2 bg-[#1a2a4a] hover:bg-[#253961] text-[#c9a227] font-bold text-xs rounded-lg flex items-center gap-2 border border-[#c9a227]/40 shadow-xs cursor-pointer disabled:opacity-60"
          >
            <CloudUpload className={`w-4 h-4 ${isSyncingCloudflare ? 'animate-bounce' : ''}`} />
            {isSyncingCloudflare ? 'Storing in D1...' : 'Store Data in Cloudflare Database'}
          </button>
        </div>
      </div>

      {cfSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {cfSuccessMsg}
        </div>
      )}

      {/* Backup Bundle Compilation Form */}
      <div className="bg-white p-6 rounded-xl border border-[#e0ddd5] shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <Archive className="w-5 h-5 text-[#c9a227]" />
          <h3 className="font-serif font-bold text-base text-[#1a2a4a]">
            Compile New Hard-Copy Backup Archive Bundle
          </h3>
        </div>

        <form onSubmit={handleGenerateBackup} className="space-y-4 text-xs">
          {backupError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {backupError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Archive Date Range (From) *</label>
              <input
                type="date"
                required
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Archive Date Range (To) *</label>
              <input
                type="date"
                required
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">Record Categories to Include *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availableCategories.map(cat => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`p-2.5 text-left rounded border text-[11px] font-semibold cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-[#c9a227] bg-[#1a2a4a] text-white'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] font-bold rounded shadow transition-all cursor-pointer font-serif-heading"
            >
              Generate Printable Hard-Copy Bundle
            </button>
          </div>
        </form>
      </div>

      {/* Active Printable Backup Bundle (Section 13.6 Output Format) */}
      {activeBackupBundle && (
        <div className="bg-white p-6 sm:p-10 rounded-xl border-2 border-[#1a2a4a] shadow-2xl space-y-8">
          <div className="flex justify-between items-center no-print border-b pb-3">
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              ✓ Archive Reference Number: {activeBackupBundle.referenceNumber}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-[#1a2a4a] text-white hover:bg-[#111e38] rounded text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-[#c9a227]" />
                <span>Print Physical Hard-Copy Archive</span>
              </button>
              <button
                onClick={() => setActiveBackupBundle(null)}
                className="px-3 py-1.5 border rounded text-xs text-gray-600 hover:bg-gray-100"
              >
                Close Bundle
              </button>
            </div>
          </div>

          {/* Section 13.6 Cover Page */}
          <div className="text-center py-10 space-y-4 border-b-2 border-dashed border-gray-300">
            <PrintHeader
              branch={activeBranch}
              documentTitle="OFFICIAL CHAMBERS HARD-COPY ARCHIVE BUNDLE"
              referenceNumber={activeBackupBundle.referenceNumber}
              date={new Date(activeBackupBundle.generatedAt).toLocaleDateString('en-GB')}
              confidential
            />

            <div className="max-w-md mx-auto bg-[#f8f6f1] p-4 rounded-lg border border-gray-300 text-xs font-mono space-y-1 text-left mt-6">
              <div><strong>BRANCH DIVISION:</strong> {activeBranch?.name || 'Head Office'}</div>
              <div><strong>ARCHIVE PERIOD:</strong> {activeBackupBundle.dateRangeStart} to {activeBackupBundle.dateRangeEnd}</div>
              <div><strong>COMPILING OFFICER:</strong> {activeBackupBundle.generatedBy}</div>
              <div><strong>TOTAL ACTIVE RECORDS:</strong> {activeBackupBundle.totalRecordsCount} Entities</div>
              <div><strong>ESTIMATED BUNDLE SIZE:</strong> {activeBackupBundle.fileSizeEstimate}</div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="space-y-3 text-xs">
            <h3 className="font-serif font-bold text-base text-[#1a2a4a] uppercase tracking-wider border-b pb-1">
              Table of Contents
            </h3>
            <div className="space-y-1.5 text-gray-700">
              <div className="flex justify-between border-b border-dotted pb-1">
                <span>Section I: Active Litigation & Court Matter Records</span>
                <span className="font-mono">{matters.length} Cases</span>
              </div>
              <div className="flex justify-between border-b border-dotted pb-1">
                <span>Section II: Client Intake & Conflict Records</span>
                <span className="font-mono">{clients.length} Clients</span>
              </div>
              <div className="flex justify-between border-b border-dotted pb-1">
                <span>Section III: Properties & Tenant Leases Portfolio</span>
                <span className="font-mono">{properties.length} Properties / {tenants.length} Tenants</span>
              </div>
              <div className="flex justify-between border-b border-dotted pb-1">
                <span>Section IV: Financial Ledger (Invoices & Official Receipts)</span>
                <span className="font-mono">{invoices.length} Bills / {receipts.length} Receipts</span>
              </div>
              <div className="flex justify-between border-b border-dotted pb-1">
                <span>Section V: Court Precedents & Legal Authorities</span>
                <span className="font-mono">{precedents.length} Precedents</span>
              </div>
              <div className="flex justify-between border-b border-dotted pb-1">
                <span>Section VI: Staff & Statutory Payroll Schedules</span>
                <span className="font-mono">{staff.length} Personnel</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t text-center text-[10px] text-gray-400 font-mono">
            STRICTLY CONFIDENTIAL · BRANCH PHYSICAL ARCHIVE RECORDS · B. B. BALE & CO CHAMBERS
          </div>
        </div>
      )}

      {/* Historical Backups Table */}
      <div className="bg-white rounded-lg border border-[#e0ddd5] shadow-xs overflow-x-auto">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-serif font-bold text-sm text-[#1a2a4a]">Hard-Copy Backup History</h3>
          <span className="text-xs text-gray-500 font-mono">{branchBackups.length} Archives Compiled</span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#1a2a4a] text-white border-b border-[#c9a227] text-[11px] font-mono-code">
              <th className="p-3">Reference Number</th>
              <th className="p-3">Compiled Date</th>
              <th className="p-3">Period Covered</th>
              <th className="p-3">Compiled By</th>
              <th className="p-3 text-right">Records Count</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {branchBackups.map(b => (
              <tr key={b.id} className="hover:bg-[#f8f6f1]">
                <td className="p-3 font-mono font-bold text-[#1a2a4a]">{b.referenceNumber}</td>
                <td className="p-3 font-mono text-gray-600">{new Date(b.generatedAt).toLocaleDateString('en-GB')}</td>
                <td className="p-3 font-mono">{b.dateRangeStart} to {b.dateRangeEnd}</td>
                <td className="p-3 font-semibold text-gray-800">{b.generatedBy}</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-800">{b.totalRecordsCount}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setActiveBackupBundle(b)}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-[#1a2a4a] hover:text-[#c9a227] rounded text-[11px] font-semibold"
                  >
                    View / Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {branchBackups.length === 0 && (
          <div className="text-center py-10 text-xs text-gray-400">
            No historical hard-copy backups compiled yet.
          </div>
        )}
      </div>
    </div>
  );
};
