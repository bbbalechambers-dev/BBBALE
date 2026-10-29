import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LocalFilePicker } from '../common/LocalFilePicker';
import { Home, Shield, LogOut, CheckCircle2, AlertTriangle, Upload, Wrench, Download, DollarSign } from 'lucide-react';
import { UploadedFileMetadata } from '../../types';

export const TenantPortal: React.FC = () => {
  const { authenticatedTenant, logoutPortal, properties, receipts, agreements, notices, addReceipt, addAlert, branches } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'payment-proof' | 'maintenance' | 'receipts'>('overview');
  const [proofFiles, setProofFiles] = useState<UploadedFileMetadata[]>([]);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [bankRef, setBankRef] = useState<string>('');
  const [proofSubmitted, setProofSubmitted] = useState(false);

  // Maintenance form
  const [ticketIssue, setTicketIssue] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Plumbing & Water');
  const [maintenancePhotos, setMaintenancePhotos] = useState<UploadedFileMetadata[]>([]);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!authenticatedTenant) return null;

  const tenantProperty = properties.find(p => p.id === authenticatedTenant.propertyId);
  const tenantAgreement = agreements.find(a => a.tenantId === authenticatedTenant.id);
  const tenantNotices = notices.filter(n => n.tenantId === authenticatedTenant.id);
  const tenantReceipts = receipts.filter(r => r.payerName.toLowerCase() === authenticatedTenant.fullName.toLowerCase());

  const handleUploadPaymentProof = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    if (!paymentAmount || proofFiles.length === 0) {
      setPaymentError('Please enter amount and upload bank transfer receipt.');
      return;
    }

    addAlert({
      branchId: authenticatedTenant.branchId,
      targetRole: 'Account Officer',
      title: 'Tenant Uploaded Rent Payment Proof',
      message: `Tenant ${authenticatedTenant.fullName} (${authenticatedTenant.code}) uploaded proof of payment for ₦${Number(paymentAmount).toLocaleString()} (Ref: ${bankRef || 'N/A'}).`,
      priority: 'High',
      category: 'Rent'
    });

    setProofSubmitted(true);
    setPaymentAmount('');
    setBankRef('');
    setProofFiles([]);
  };

  const handleSubmitMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketIssue.trim()) return;

    addAlert({
      branchId: authenticatedTenant.branchId,
      targetRole: 'Administrator',
      title: 'New Maintenance Ticket Submitted',
      message: `Tenant ${authenticatedTenant.fullName} (${tenantProperty?.name || 'Unit'}) logged a maintenance issue: "${ticketCategory} - ${ticketIssue.substring(0, 50)}...".`,
      priority: 'Medium',
      category: 'Rent'
    });

    setTicketSubmitted(true);
    setTicketIssue('');
    setMaintenancePhotos([]);
  };

  return (
    <div className="min-w-full bg-[#f8f6f1] min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="bg-white p-6 rounded-xl border border-[#e0ddd5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-code text-[#c9a227] font-bold uppercase">
              <Shield className="w-4 h-4" />
              <span>Verified Tenant Portal · {authenticatedTenant.code}</span>
            </div>
            <h1 className="font-serif font-black text-2xl text-[#1a2a4a] mt-1">
              Welcome, {authenticatedTenant.fullName}
            </h1>
            <p className="text-xs text-[#5a5a5a]">
              Resident of {tenantProperty?.name || 'Chambers Managed Property'}, Unit: {authenticatedTenant.unitAssigned} · Managing Branch: {branches.find(b => b.id === authenticatedTenant.branchId)?.name || 'Headquarters Branch'}
            </p>
          </div>

          <button
            onClick={logoutPortal}
            className="px-3.5 py-1.5 rounded bg-[#1a2a4a] text-white text-xs font-semibold hover:bg-[#111e38] flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-[#c9a227]" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Status Alert Banner */}
        {authenticatedTenant.rentPaymentStatus !== 'Current' && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <div className="font-bold">Rent Status Notification: {authenticatedTenant.rentPaymentStatus}</div>
              <span>Next rent settlement was due on {authenticatedTenant.nextRentDueDate}. Please upload payment proof below or contact Chambers Accounts.</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#e0ddd5]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-bold font-serif-heading border-b-2 cursor-pointer transition-colors ${
              activeTab === 'overview'
                ? 'border-[#c9a227] text-[#1a2a4a]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Tenancy Overview
          </button>
          <button
            onClick={() => setActiveTab('payment-proof')}
            className={`px-4 py-2.5 text-xs font-bold font-serif-heading border-b-2 cursor-pointer transition-colors ${
              activeTab === 'payment-proof'
                ? 'border-[#c9a227] text-[#1a2a4a]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Upload Payment Proof
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-4 py-2.5 text-xs font-bold font-serif-heading border-b-2 cursor-pointer transition-colors ${
              activeTab === 'maintenance'
                ? 'border-[#c9a227] text-[#1a2a4a]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Maintenance Tickets
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-4 py-2.5 text-xs font-bold font-serif-heading border-b-2 cursor-pointer transition-colors ${
              activeTab === 'receipts'
                ? 'border-[#c9a227] text-[#1a2a4a]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Receipts & Notices ({tenantReceipts.length + tenantNotices.length})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg border border-[#e0ddd5] shadow-xs space-y-3 text-xs">
              <h3 className="font-serif font-bold text-sm text-[#1a2a4a] border-b pb-1">Tenancy Schedule</h3>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Property:</span>
                <span className="font-semibold text-gray-800">{tenantProperty?.name || 'Prime Unit'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Unit / Apartment:</span>
                <span className="font-semibold text-gray-800">{authenticatedTenant.unitAssigned}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Tenancy Period:</span>
                <span>{authenticatedTenant.tenancyStartDate} to {authenticatedTenant.tenancyEndDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Next Due Date:</span>
                <span className="font-bold text-[#1a2a4a]">{authenticatedTenant.nextRentDueDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Payment Standing:</span>
                <span className="font-bold text-emerald-700">{authenticatedTenant.rentPaymentStatus}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#e0ddd5] shadow-xs space-y-3 text-xs">
              <h3 className="font-serif font-bold text-sm text-[#1a2a4a] border-b pb-1">Statutory Fees & Rent</h3>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Annual Rent:</span>
                <span className="font-bold text-[#1a2a4a]">₦{authenticatedTenant.annualRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Service Charge:</span>
                <span>₦{authenticatedTenant.serviceCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Caution Deposit:</span>
                <span>₦{authenticatedTenant.cautionDeposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Guarantor on File:</span>
                <span>{authenticatedTenant.guarantorName} ({authenticatedTenant.guarantorPhone})</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Upload Payment Proof (Local File Picker - Section 20) */}
        {activeTab === 'payment-proof' && (
          <div className="bg-white p-6 rounded-lg border border-[#e0ddd5] shadow-xs space-y-5">
            <div>
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Upload Rent Payment Proof</h3>
              <p className="text-xs text-[#5a5a5a] mt-0.5">
                Upload your bank deposit slip, mobile app transfer receipt, or POS slip from your device for Account Officer reconciliation.
              </p>
            </div>

            {proofSubmitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Payment proof uploaded and dispatched to Chambers Accounts for verification!</span>
              </div>
            )}

            <form onSubmit={handleUploadPaymentProof} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Amount Paid (₦) *</label>
                  <input
                    type="number"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="e.g. 1500000"
                    className="w-full text-xs p-2.5 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Bank Transfer Reference / Session ID</label>
                  <input
                    type="text"
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    placeholder="e.g. 0000139281928"
                    className="w-full text-xs p-2.5 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">
                  Select Payment Proof Document from Device *
                </label>
                <LocalFilePicker
                  label="Choose Transfer Receipt (Device Picker)"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  maxSizeMb={20}
                  currentFiles={proofFiles}
                  onUploadComplete={(files) => setProofFiles(files)}
                  onRemoveFile={(id) => setProofFiles(prev => prev.filter(f => f.id !== id))}
                />
              </div>

              {paymentError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                  {paymentError}
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded text-xs font-bold cursor-pointer font-serif-heading"
              >
                Submit Payment for Chambers Clearance
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Maintenance Requests */}
        {activeTab === 'maintenance' && (
          <div className="bg-white p-6 rounded-lg border border-[#e0ddd5] shadow-xs space-y-5">
            <div>
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Submit Maintenance Ticket</h3>
              <p className="text-xs text-[#5a5a5a] mt-0.5">
                Report structural, electrical, or plumbing issues to the Chambers Property Management desk.
              </p>
            </div>

            {ticketSubmitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Maintenance ticket logged. Our estate operations manager will schedule inspection.</span>
              </div>
            )}

            <form onSubmit={handleSubmitMaintenance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                >
                  <option value="Plumbing & Water">Plumbing & Water Supply</option>
                  <option value="Electrical & Power">Electrical & Wiring</option>
                  <option value="Structural & Roofing">Roofing, Leakages & Masonry</option>
                  <option value="Security & Gate Access">Locks, Gates & Security</option>
                  <option value="Other Repairs">Other Facility Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Description of Fault / Damage</label>
                <textarea
                  rows={3}
                  required
                  value={ticketIssue}
                  onChange={(e) => setTicketIssue(e.target.value)}
                  placeholder="Detail the issue, location in apartment, and urgency..."
                  className="w-full text-xs p-2.5 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">
                  Upload Photos of Defect (Local Device Picker)
                </label>
                <LocalFilePicker
                  label="Choose Photos from Device"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp"
                  maxSizeMb={15}
                  currentFiles={maintenancePhotos}
                  onUploadComplete={(files) => setMaintenancePhotos(prev => [...prev, ...files])}
                  onRemoveFile={(id) => setMaintenancePhotos(prev => prev.filter(f => f.id !== id))}
                  compact
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1a2a4a] text-white hover:bg-[#111e38] rounded text-xs font-bold"
              >
                Dispatch Maintenance Ticket
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Receipts & Notices */}
        {activeTab === 'receipts' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg border border-[#e0ddd5] shadow-xs space-y-3">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Official Rent Receipts</h3>
              {tenantReceipts.length > 0 ? (
                tenantReceipts.map(rcp => (
                  <div key={rcp.id} className="p-3 border rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-emerald-800 font-mono">{rcp.code}</div>
                      <div className="text-gray-500">{rcp.paymentDate} · {rcp.paymentMethod}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-emerald-700">₦{rcp.amountPaid.toLocaleString()}</div>
                      <button onClick={() => window.print()} className="text-[11px] text-[#1a2a4a] underline">Print</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-gray-400">No rent receipts found.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
