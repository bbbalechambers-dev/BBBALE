import React, { useState } from 'react';
import { X, Building2, User, Home, Shield, CheckCircle2, AlertCircle, ArrowRight, Copy } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NIGERIAN_STATES, getLgasForState } from '../../data/nigeriaGeo';

interface PublicRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPortalAccess?: (type: 'client' | 'owner' | 'tenant') => void;
  defaultTab?: 'client' | 'owner' | 'tenant';
}

export const PublicRegistrationModal: React.FC<PublicRegistrationModalProps> = ({
  isOpen,
  onClose,
  onOpenPortalAccess,
  defaultTab = 'client'
}) => {
  const {
    branches,
    properties,
    registerPublicClient,
    registerPublicOwner,
    registerPublicTenant
  } = useApp();

  const [regType, setRegType] = useState<'client' | 'owner' | 'tenant'>(defaultTab);

  // Common mandatory Branch Selection
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || 'BRN-LAG');

  // Client Registration State
  const [clientFullName, setClientFullName] = useState('');
  const [clientType, setClientType] = useState<'Individual' | 'Corporate'>('Individual');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('+234 ');
  const [clientStreet, setClientStreet] = useState('');
  const [clientState, setClientState] = useState('Lagos');
  const [clientLga, setClientLga] = useState('Ikeja');
  const [clientCity, setClientCity] = useState('');
  const [clientNinOrCac, setClientNinOrCac] = useState('');

  // Owner Registration State
  const [ownerFullName, setOwnerFullName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('+234 ');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [ownerState, setOwnerState] = useState('Lagos');
  const [ownerNinOrCac, setOwnerNinOrCac] = useState('');
  const [ownerBankName, setOwnerBankName] = useState('Zenith Bank');
  const [ownerAccountNumber, setOwnerAccountNumber] = useState('');

  // Tenant Registration State
  const [tenantFullName, setTenantFullName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('+234 ');
  const [tenantPropertyId, setTenantPropertyId] = useState('');
  const [tenantUnit, setTenantUnit] = useState('Suite 1 / Flat 1');
  const [tenantRent, setTenantRent] = useState(1500000);
  const [tenantNin, setTenantNin] = useState('');

  // Result & Error State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    code: string;
    name: string;
    branchName: string;
    branchCode: string;
    type: 'client' | 'owner' | 'tenant';
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const lgas = getLgasForState(regType === 'client' ? clientState : ownerState);
  const branchProperties = properties.filter(p => p.branchId === selectedBranchId);

  const resetForm = () => {
    setErrorMessage(null);
    setSuccessData(null);
    setCopiedCode(false);
  };

  const handleRegisterClient = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedBranchId) {
      setErrorMessage('Please select the Chambers Branch Division you are registering with.');
      return;
    }
    if (!clientFullName.trim() || !clientEmail.trim() || !clientPhone.trim() || !clientNinOrCac.trim()) {
      setErrorMessage('Please complete all required fields (Full Name, Email, Phone, NIN/CAC).');
      return;
    }

    try {
      const newClient = registerPublicClient({
        branchId: selectedBranchId,
        fullName: clientFullName.trim(),
        clientType,
        email: clientEmail.trim().toLowerCase(),
        phone: clientPhone.trim(),
        streetAddress: clientStreet.trim() || 'Central Branch Area',
        city: clientCity.trim() || currentBranch?.city || 'Victoria Island',
        state: clientState,
        lga: clientLga || lgas[0] || 'Ikeja',
        ninOrCac: clientNinOrCac.trim()
      });

      setSuccessData({
        code: newClient.code,
        name: newClient.fullName,
        branchName: currentBranch?.name || 'Headquarters Branch',
        branchCode: currentBranch?.code || 'BBB-LAG',
        type: 'client'
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    }
  };

  const handleRegisterOwner = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedBranchId) {
      setErrorMessage('Please select the Chambers Branch Division managing your property.');
      return;
    }
    if (!ownerFullName.trim() || !ownerEmail.trim() || !ownerPhone.trim() || !ownerNinOrCac.trim()) {
      setErrorMessage('Please complete all required fields (Full Name, Email, Phone, NIN/CAC).');
      return;
    }

    try {
      const newOwner = registerPublicOwner({
        branchId: selectedBranchId,
        fullName: ownerFullName.trim(),
        email: ownerEmail.trim().toLowerCase(),
        phone: ownerPhone.trim(),
        address: ownerAddress.trim() || currentBranch?.address || 'Victoria Island, Lagos',
        state: ownerState,
        ninOrCac: ownerNinOrCac.trim(),
        bankName: ownerBankName,
        accountNumber: ownerAccountNumber.trim() || '0000000000'
      });

      setSuccessData({
        code: newOwner.code,
        name: newOwner.fullName,
        branchName: currentBranch?.name || 'Headquarters Branch',
        branchCode: currentBranch?.code || 'BBB-LAG',
        type: 'owner'
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    }
  };

  const handleRegisterTenant = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedBranchId) {
      setErrorMessage('Please select the Chambers Branch Division managing your premises.');
      return;
    }
    if (!tenantFullName.trim() || !tenantEmail.trim() || !tenantPhone.trim() || !tenantNin.trim()) {
      setErrorMessage('Please complete all required fields (Full Name, Email, Phone, NIN).');
      return;
    }

    const propId = tenantPropertyId || (branchProperties[0]?.id || `PROP-${selectedBranchId}`);

    try {
      const newTenant = registerPublicTenant({
        branchId: selectedBranchId,
        fullName: tenantFullName.trim(),
        email: tenantEmail.trim().toLowerCase(),
        phone: tenantPhone.trim(),
        propertyId: propId,
        unitAssigned: tenantUnit.trim() || 'Flat 1',
        annualRent: Number(tenantRent) || 1200000,
        nin: tenantNin.trim()
      });

      setSuccessData({
        code: newTenant.code,
        name: newTenant.fullName,
        branchName: currentBranch?.name || 'Headquarters Branch',
        branchCode: currentBranch?.code || 'BBB-LAG',
        type: 'tenant'
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#1a2a4a] text-white p-4 flex items-center justify-between border-b-2 border-[#c9a227]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#c9a227] text-[#1a2a4a] flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-black text-base text-white">
                Chambers Public Intake & Registration
              </h2>
              <p className="text-[11px] text-gray-300">
                Official registration for Clients, Property Owners & Tenants under B. B. BALE & CO
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-300 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[85vh] overflow-y-auto space-y-4">
          {successData ? (
            /* Instant Success Screen with Assigned Code */
            <div className="text-center py-6 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wide">
                  Registration Confirmed & Sealed
                </span>
                <h3 className="font-serif font-bold text-2xl text-[#1a2a4a] mt-2">
                  Welcome, {successData.name}
                </h3>
                <p className="text-xs text-gray-600 mt-1 max-w-md mx-auto leading-relaxed">
                  Your record has been officially registered and permanently assigned under the{' '}
                  <strong className="text-[#1a2a4a]">{successData.branchName}</strong> ({successData.branchCode}).
                </p>
              </div>

              {/* Code Box */}
              <div className="bg-[#f8f6f1] p-4 rounded-xl border border-[#c9a227] max-w-md mx-auto space-y-2">
                <div className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                  Your Assigned Chambers Access Code
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono font-black text-xl text-[#1a2a4a] tracking-wider bg-white px-4 py-2 rounded-lg border border-[#e0ddd5] shadow-xs">
                    {successData.code}
                  </span>
                  <button
                    onClick={() => handleCopyCode(successData.code)}
                    className="p-2.5 rounded-lg bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] transition-colors"
                    title="Copy Code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {copiedCode && (
                  <span className="text-[11px] text-emerald-700 font-bold block">Copied to clipboard!</span>
                )}
                <div className="text-[11px] text-gray-500 pt-1">
                  Branch Registered: <strong>{successData.branchName}</strong>
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 max-w-md mx-auto text-left leading-relaxed">
                <strong>Statutory Data Isolation Rule:</strong> Whenever you access your files, billing, or statements on the public website, you must select <strong>{successData.branchName}</strong>. One branch cannot see the work data of another branch.
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                {onOpenPortalAccess && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPortalAccess(successData.type);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded-lg font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer font-serif-heading"
                  >
                    <span>Authenticate in Sensitive Portal Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Done & Return to Website
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <div className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-3 gap-2 bg-[#f8f6f1] p-1.5 rounded-lg border border-[#e0ddd5] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setRegType('client');
                    resetForm();
                  }}
                  className={`py-2 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    regType === 'client' ? 'bg-[#1a2a4a] text-white shadow-xs' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Client (Legal Intake)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegType('owner');
                    resetForm();
                  }}
                  className={`py-2 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    regType === 'owner' ? 'bg-[#1a2a4a] text-white shadow-xs' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Landlord / Owner</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegType('tenant');
                    resetForm();
                  }}
                  className={`py-2 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    regType === 'tenant' ? 'bg-[#1a2a4a] text-white shadow-xs' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Tenant (Premises)</span>
                </button>
              </div>

              {/* MANDATORY BRANCH SELECTION (User Requirement) */}
              <div className="p-3.5 bg-amber-50/70 border border-[#c9a227] rounded-xl space-y-1.5">
                <label className="block text-xs font-bold text-[#1a2a4a] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#c9a227]" />
                  <span>Select Chambers Branch Division * (Statutory Rule)</span>
                </label>
                <select
                  required
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#c9a227] bg-white font-semibold text-[#1a2a4a] focus:outline-none focus:ring-2 focus:ring-[#c9a227]"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code}) — {b.city}, {b.state} State ({b.address})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-600 leading-tight">
                  All work data, litigation files, billing, and portal access will be permanently isolated to the branch division you select here.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* TAB 1: CLIENT REGISTRATION */}
              {regType === 'client' && (
                <form onSubmit={handleRegisterClient} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">Client Category *</label>
                      <select
                        value={clientType}
                        onChange={(e) => setClientType(e.target.value as any)}
                        className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                      >
                        <option value="Individual">Individual Citizen / Expatriate</option>
                        <option value="Corporate">Corporate / Enterprise Entity</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">
                        {clientType === 'Corporate' ? 'Registered Company Name *' : 'Full Name (as on NIN) *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={clientFullName}
                        onChange={(e) => setClientFullName(e.target.value)}
                        placeholder={clientType === 'Corporate' ? 'e.g. Apex Holdings Nig. Ltd' : 'e.g. Chief Adeleke O. Babatunde'}
                        className="w-full p-2.5 rounded border border-[#e0ddd5]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">Official Email *</label>
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="client@domain.ng"
                        className="w-full p-2.5 rounded border border-[#e0ddd5]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">Mobile Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="+234 803 000 0000"
                        className="w-full p-2.5 rounded border border-[#e0ddd5]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">State *</label>
                      <select
                        value={clientState}
                        onChange={(e) => {
                          setClientState(e.target.value);
                          const newLgas = getLgasForState(e.target.value);
                          setClientLga(newLgas[0] || '');
                        }}
                        className="w-full p-2 rounded border border-[#e0ddd5] bg-white"
                      >
                        {NIGERIAN_STATES.map(s => (
                          <option key={s.state} value={s.state}>{s.state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">LGA *</label>
                      <select
                        value={clientLga}
                        onChange={(e) => setClientLga(e.target.value)}
                        className="w-full p-2 rounded border border-[#e0ddd5] bg-white"
                      >
                        {lgas.map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">City / Town *</label>
                      <input
                        type="text"
                        required
                        value={clientCity}
                        onChange={(e) => setClientCity(e.target.value)}
                        placeholder="e.g. Victoria Island"
                        className="w-full p-2 rounded border border-[#e0ddd5]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">Street Address</label>
                      <input
                        type="text"
                        value={clientStreet}
                        onChange={(e) => setClientStreet(e.target.value)}
                        placeholder="Plot 12, Adeola Odeku St"
                        className="w-full p-2.5 rounded border border-[#e0ddd5]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">
                        {clientType === 'Corporate' ? 'CAC Registration Number (RC/BN) *' : 'National Identity Number (NIN) *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={clientNinOrCac}
                        onChange={(e) => setClientNinOrCac(e.target.value)}
                        placeholder={clientType === 'Corporate' ? 'RC-1049281' : '11-digit NIN'}
                        className="w-full p-2.5 rounded border border-[#e0ddd5]"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] font-bold rounded font-serif-heading"
                    >
                      Complete Client Registration
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: OWNER REGISTRATION */}
              {regType === 'owner' && (
                <form onSubmit={handleRegisterOwner} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">Landlord / Owner Full Name *</label>
                      <input
                        type="text"
                        required
                        value={ownerFullName}
                        onChange={(e) => setOwnerFullName(e.target.value)}
                        placeholder="e.g. Alhaji Mustapha Dangote"
                        className="w-full p-2.5 rounded border border-[#e0ddd5]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="owner@domain.ng"
                        className="w-full p-2.5 rounded border border-[#e0ddd5]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        placeholder="+234 803 000 0000"
                        className="w-full p-2.5 rounded border border-[#e0ddd5]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">NIN or CAC Registration *</label>
                      <input
                        type="text"
                        required
                        value={ownerNinOrCac}
                        onChange={(e) => setOwnerNinOrCac(e.target.value)}
                        placeholder="11-digit NIN or RC Number"
                        className="w-full p-2.5 rounded border border-[#e0ddd5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Residential / Corporate Address</label>
                    <input
                      type="text"
                      value={ownerAddress}
                      onChange={(e) => setOwnerAddress(e.target.value)}
                      placeholder="Victoria Island, Lagos"
                      className="w-full p-2.5 rounded border border-[#e0ddd5]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-[#f8f6f1] p-3 rounded-lg border border-[#e0ddd5]">
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">Bank Name (Rent Remittances)</label>
                      <input
                        type="text"
                        value={ownerBankName}
                        onChange={(e) => setOwnerBankName(e.target.value)}
                        placeholder="Zenith Bank"
                        className="w-full p-2 rounded border border-[#e0ddd5] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">NUBAN Account Number</label>
                      <input
                        type="text"
                        value={ownerAccountNumber}
                        onChange={(e) => setOwnerAccountNumber(e.target.value)}
                        placeholder="10-digit NUBAN"
                        className="w-full p-2 rounded border border-[#e0ddd5] bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] font-bold rounded font-serif-heading"
                    >
                      Register Property Owner
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: TENANT REGISTRATION */}
              {regType === 'tenant' && (
                <form onSubmit={handleRegisterTenant} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">Tenant Full Name *</label>
                      <input
                        type="text"
                        required
                        value={tenantFullName}
                        onChange={(e) => setTenantFullName(e.target.value)}
                        placeholder="e.g. Dr. Emeka Chukwu"
                        className="w-full p-2.5 rounded border border-[#e0ddd5]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">Tenant Email *</label>
                      <input
                        type="email"
                        required
                        value={tenantEmail}
                        onChange={(e) => setTenantEmail(e.target.value)}
                        placeholder="tenant@domain.ng"
                        className="w-full p-2.5 rounded border border-[#e0ddd5]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={tenantPhone}
                        onChange={(e) => setTenantPhone(e.target.value)}
                        placeholder="+234 803 000 0000"
                        className="w-full p-2.5 rounded border border-[#e0ddd5]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">NIN Identity Number *</label>
                      <input
                        type="text"
                        required
                        value={tenantNin}
                        onChange={(e) => setTenantNin(e.target.value)}
                        placeholder="11-digit NIN"
                        className="w-full p-2.5 rounded border border-[#e0ddd5]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">Select Premises / Property</label>
                      <select
                        value={tenantPropertyId}
                        onChange={(e) => setTenantPropertyId(e.target.value)}
                        className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                      >
                        {branchProperties.length > 0 ? (
                          branchProperties.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                          ))
                        ) : (
                          <option value={`PROP-${selectedBranchId}`}>
                            Chambers Branch Managed Property ({currentBranch?.name})
                          </option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">Unit / Flat / Office Number</label>
                      <input
                        type="text"
                        value={tenantUnit}
                        onChange={(e) => setTenantUnit(e.target.value)}
                        placeholder="Suite 4B / Flat 2A"
                        className="w-full p-2.5 rounded border border-[#e0ddd5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700">Annual Rent (₦)</label>
                    <input
                      type="number"
                      value={tenantRent}
                      onChange={(e) => setTenantRent(Number(e.target.value))}
                      placeholder="1500000"
                      className="w-full p-2.5 rounded border border-[#e0ddd5]"
                    />
                  </div>

                  <div className="pt-3 border-t flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] font-bold rounded font-serif-heading"
                    >
                      Complete Tenant Intake
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
