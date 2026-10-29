import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Landmark, DollarSign, Plus, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { BankAccount, FeeItem } from '../../../types';

export const BankAccountsFeesModule: React.FC = () => {
  const {
    bankAccounts,
    fees,
    addBankAccount,
    updateBankAccount,
    addFee,
    updateFee,
    currentUser,
    activeBranchId,
    branches,
    canAccessBranchData,
    effectiveBranchId
  } = useApp();

  const [activeTab, setActiveTab] = useState<'bank-accounts' | 'fees'>('bank-accounts');
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showAddFeeModal, setShowAddFeeModal] = useState(false);

  // Bank form
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('First Bank of Nigeria');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<'Trust Account' | 'Operating Account' | 'Property Account' | 'FX Domiciliary'>('Trust Account');
  const [currency, setCurrency] = useState<'NGN' | 'USD' | 'GBP' | 'EUR'>('NGN');

  // Fee form
  const [feeTitle, setFeeTitle] = useState('');
  const [feeCategory, setFeeCategory] = useState<'Consultation' | 'Litigation' | 'Property Management' | 'Drafting & Conveyance' | 'Retainer'>('Consultation');
  const [minFee, setMinFee] = useState(30000);
  const [maxFee, setMaxFee] = useState(150000);
  const [branchFee, setBranchFee] = useState(50000);

  const targetBranchId = effectiveBranchId;
  const isPrincipalPartner = currentUser?.role === 'Principal Partner';
  const isHeadOfChamber = currentUser?.role === 'Head of Chamber' || isPrincipalPartner;

  const branchBankAccounts = bankAccounts.filter(b => canAccessBranchData(b.branchId));
  const branchFees = fees.filter(f => canAccessBranchData(f.branchId));

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName || !accountNumber) return;

    addBankAccount({
      branchId: targetBranchId,
      accountName: accountName.trim(),
      bankName,
      accountNumber: accountNumber.trim(),
      accountType,
      currency,
      isDefault: bankAccounts.length === 0,
      balance: 0,
      status: 'Active'
    });

    setShowAddBankModal(false);
    setAccountName('');
    setAccountNumber('');
  };

  const handleAddFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeTitle) return;

    addFee({
      branchId: targetBranchId,
      title: feeTitle.trim(),
      category: feeCategory,
      minFee: Number(minFee),
      maxFee: Number(maxFee),
      branchFee: Number(branchFee),
      unit: 'Fixed'
    });

    setShowAddFeeModal(false);
    setFeeTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-black text-xl text-[#1a2a4a]">
            Bank Accounts & Fee Schedules
          </h2>
          <p className="text-xs text-[#5a5a5a]">
            Section 34 & 35: Head of Chamber manages dedicated branch trust/operating accounts; Principal Partner sets statutory min/max bounds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'bank-accounts' && isHeadOfChamber && (
            <button
              onClick={() => setShowAddBankModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded-md font-bold text-xs shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bank Account</span>
            </button>
          )}
          {activeTab === 'fees' && isHeadOfChamber && (
            <button
              onClick={() => setShowAddFeeModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded-md font-bold text-xs shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Set Fee Schedule</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e0ddd5]">
        <button
          onClick={() => setActiveTab('bank-accounts')}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer ${
            activeTab === 'bank-accounts' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500'
          }`}
        >
          Branch Bank Accounts ({branchBankAccounts.length})
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer ${
            activeTab === 'fees' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500'
          }`}
        >
          Fee Schedules & Caps ({branchFees.length})
        </button>
      </div>

      {/* Tab 1: Bank Accounts */}
      {activeTab === 'bank-accounts' && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#1a2a4a] flex-shrink-0" />
            <span>
              <strong>NBA Trust Account Rule:</strong> Client funds, retainers, and rent collections must be isolated in dedicated Trust Accounts separate from Chambers Operating Accounts.
            </span>
          </div>

          {branchBankAccounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branchBankAccounts.map(b => (
                <div key={b.id} className="bg-white p-5 rounded-lg border border-[#e0ddd5] shadow-xs space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-sm text-[#1a2a4a]">{b.bankName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.accountType === 'Trust Account' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {b.accountType}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-gray-500">Account Name:</div>
                    <div className="font-semibold text-gray-900">{b.accountName}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-gray-500">NUBAN Account Number:</div>
                    <div className="font-mono font-bold text-base text-[#1a2a4a] tracking-wider">{b.accountNumber}</div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t text-[11px] text-gray-500 font-mono">
                    <span>Currency: {b.currency}</span>
                    <span className="text-emerald-700 font-semibold">{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-[#e0ddd5] space-y-3">
              <Landmark className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">No Bank Accounts Configured</h3>
              <p className="text-xs text-[#5a5a5a] max-w-md mx-auto">
                Head of Chamber can add authorized Trust and Operating bank accounts for this branch.
              </p>
              {isHeadOfChamber && (
                <button
                  onClick={() => setShowAddBankModal(true)}
                  className="px-5 py-2 bg-[#1a2a4a] text-[#c9a227] rounded text-xs font-bold font-serif-heading"
                >
                  Configure First Bank Account
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Fees Management (Section 35) */}
      {activeTab === 'fees' && (
        <div className="space-y-4">
          {branchFees.length > 0 ? (
            <div className="bg-white rounded-lg border border-[#e0ddd5] shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1a2a4a] text-white border-b border-[#c9a227] text-[11px] font-mono-code">
                    <th className="p-3">Fee Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">PP Minimum Bound</th>
                    <th className="p-3">PP Maximum Bound</th>
                    <th className="p-3">Active Branch Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {branchFees.map(f => (
                    <tr key={f.id} className="hover:bg-[#f8f6f1]">
                      <td className="p-3 font-bold text-[#1a2a4a]">{f.title}</td>
                      <td className="p-3">{f.category}</td>
                      <td className="p-3 font-mono">₦{f.minFee.toLocaleString()}</td>
                      <td className="p-3 font-mono">₦{f.maxFee.toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-[#c9a227]">₦{f.branchFee.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-[#e0ddd5] space-y-3">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">No Fee Schedules Defined</h3>
              <p className="text-xs text-[#5a5a5a] max-w-md mx-auto">
                Configure consultation, litigation retainer, or conveyancing fee schedules compliant with LPRO 2023.
              </p>
              {isHeadOfChamber && (
                <button
                  onClick={() => setShowAddFeeModal(true)}
                  className="px-5 py-2 bg-[#1a2a4a] text-[#c9a227] rounded text-xs font-bold font-serif-heading"
                >
                  Set Initial Fee Schedule
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Bank Account Modal */}
      {showAddBankModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Add Branch Bank Account</h3>
              <button onClick={() => setShowAddBankModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddBank} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Account Name *</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. B. B. BALE & CO (Trust Account)"
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">NUBAN Number *</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="10 digits"
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Account Type</label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  >
                    <option value="Trust Account">Trust Account</option>
                    <option value="Operating Account">Operating Account</option>
                    <option value="Property Account">Property Account</option>
                    <option value="FX Domiciliary">FX Domiciliary</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  >
                    <option value="NGN">NGN (Nigerian Naira)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="GBP">GBP (British Pound)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowAddBankModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded">Save Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Fee Modal */}
      {showAddFeeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Define Fee Schedule</h3>
              <button onClick={() => setShowAddFeeModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddFee} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Fee Description *</label>
                <input
                  type="text"
                  required
                  value={feeTitle}
                  onChange={(e) => setFeeTitle(e.target.value)}
                  placeholder="e.g. Senior Counsel Consultation (45 Mins)"
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={feeCategory}
                  onChange={(e) => setFeeCategory(e.target.value as any)}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Litigation">Litigation Retainer</option>
                  <option value="Property Management">Property Management Agency</option>
                  <option value="Drafting & Conveyance">Drafting & Conveyance</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Min (₦)</label>
                  <input
                    type="number"
                    value={minFee}
                    onChange={(e) => setMinFee(Number(e.target.value))}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Max (₦)</label>
                  <input
                    type="number"
                    value={maxFee}
                    onChange={(e) => setMaxFee(Number(e.target.value))}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Branch (₦)</label>
                  <input
                    type="number"
                    value={branchFee}
                    onChange={(e) => setBranchFee(Number(e.target.value))}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowAddFeeModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded">Set Fee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
