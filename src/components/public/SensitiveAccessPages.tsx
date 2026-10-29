import React, { useState } from 'react';
import {
  Shield,
  Lock,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Building2,
  Home,
  CheckCircle2,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Key,
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NIGERIAN_STATES, getLgasForState } from '../../data/nigeriaGeo';
import { ClientRecord, PropertyOwner, Tenant } from '../../types';

interface SensitiveAccessProps {
  portalType: 'client' | 'owner' | 'tenant' | 'register';
  onSuccess: () => void;
  onSwitchPortal: (type: 'client' | 'owner' | 'tenant' | 'register') => void;
  onOpenRegistration?: () => void;
}

export const SensitiveAccessPage: React.FC<SensitiveAccessProps> = ({
  portalType,
  onSuccess,
  onSwitchPortal,
  onOpenRegistration
}) => {
  const {
    loginClientPortal,
    loginOwnerPortal,
    loginTenantPortal,
    branches,
    registerPublicClient,
    registerPublicOwner,
    registerPublicTenant,
    properties,
    addMatter
  } = useApp();

  // Login Verification State
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || 'BRN-LAG');
  const [code, setCode] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Registration Form State
  const [regType, setRegType] = useState<'client' | 'owner' | 'tenant'>('client');
  const [regBranchId, setRegBranchId] = useState<string>(branches[0]?.id || 'BRN-LAG');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+234 ');
  const [regNinOrCac, setRegNinOrCac] = useState('');
  const [regState, setRegState] = useState('Lagos');
  const [regLga, setRegLga] = useState('Ikeja');
  const [regCity, setRegCity] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regClientType, setRegClientType] = useState<'Individual' | 'Corporate'>('Individual');
  const [regLegalSubject, setRegLegalSubject] = useState('');
  // Owner specific
  const [regBankName, setRegBankName] = useState('Zenith Bank');
  const [regAccountNumber, setRegAccountNumber] = useState('');
  // Tenant specific
  const [regPropertyId, setRegPropertyId] = useState('');
  const [regUnit, setRegUnit] = useState('Flat 2A');
  const [regAnnualRent, setRegAnnualRent] = useState(2500000);

  const [regError, setRegError] = useState<string | null>(null);
  const [registeredResult, setRegisteredResult] = useState<{
    code: string;
    fullName: string;
    branchName: string;
    branchCode: string;
    type: 'client' | 'owner' | 'tenant';
    entity: any;
  } | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);

  const lgas = getLgasForState(regState);
  const selectedBranch = branches.find(b => b.id === (portalType === 'register' ? regBranchId : selectedBranchId)) || branches[0];

  const branchProperties = properties.filter(p => p.branchId === regBranchId);

  const title = {
    client: 'Client Matter & Billing Access',
    owner: 'Property Owner & Rent Remittance Access',
    tenant: 'Tenant Rent & Premises Portal',
    register: 'Official Chambers Public Registration Desk'
  }[portalType];

  const placeholderCode = {
    client: 'e.g. BBB-LAG/CLI/2026/1042',
    owner: 'e.g. BBB-LAG/OWN/2026/2051',
    tenant: 'e.g. BBB-LAG/TEN/2026/3091',
    register: ''
  }[portalType];

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (failedAttempts >= 5) {
      setErrorMessage('Account temporarily locked due to repeated failed attempts. Try again in 30 minutes.');
      return;
    }

    if (!selectedBranchId) {
      setErrorMessage('Please select the Chambers Branch Division you registered with.');
      return;
    }

    if (!code.trim() || !identifier.trim()) {
      setErrorMessage('Please enter both your assigned code and identity verification credential.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      let res: { success: boolean; error?: string } = { success: false };

      if (portalType === 'client') {
        res = loginClientPortal(code, identifier, selectedBranchId);
      } else if (portalType === 'owner') {
        res = loginOwnerPortal(code, identifier, selectedBranchId);
      } else if (portalType === 'tenant') {
        res = loginTenantPortal(code, identifier, selectedBranchId);
      }

      setIsVerifying(false);

      if (res.success) {
        onSuccess();
      } else {
        setFailedAttempts(prev => prev + 1);
        setErrorMessage(res.error || 'Invalid credentials or branch mismatch. Access is strictly isolated to the branch selected during registration.');
      }
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regFullName.trim() || !regEmail.trim() || !regPhone.trim() || !regNinOrCac.trim()) {
      setRegError('Please fill all required verification fields (Full Name, Email, Phone, NIN/CAC).');
      return;
    }

    const branch = branches.find(b => b.id === regBranchId) || branches[0];
    const branchName = branch ? branch.name : regBranchId;
    const branchCode = branch ? branch.code : 'BBB-LAG';

    try {
      if (regType === 'client') {
        const client = registerPublicClient({
          branchId: regBranchId,
          fullName: regFullName.trim(),
          clientType: regClientType,
          email: regEmail.trim(),
          phone: regPhone.trim(),
          streetAddress: regAddress.trim() || regCity.trim() || 'Central',
          city: regCity.trim() || 'Central',
          state: regState,
          lga: regLga || lgas[0] || 'Ikeja',
          ninOrCac: regNinOrCac.trim()
        });

        // Also inaugurate initial active matter for client
        addMatter({
          branchId: regBranchId,
          clientId: client.id,
          title: regLegalSubject.trim() || 'Initial Retainer Brief & Litigation Consultation',
          courtCategory: 'State High Court',
          caseType: 'Civil',
          subCategory: 'General Litigation',
          suitNumber: 'PENDING-FILING',
          presidingJudge: 'Hon. Justice (Chambers Assigned)',
          courtDivision: `${branch.city} Division`,
          assignedCounselId: 'UNASSIGNED',
          status: 'Active',
          filingDate: new Date().toISOString().split('T')[0],
          description: regLegalSubject.trim() || 'Intake matter registered via Public Onboarding Desk.',
          estimatedFee: 500000,
          paidFee: 0,
          isLegalHold: false,
          documents: [],
          notes: [
            {
              id: `NOT-${Date.now()}`,
              author: 'Registrar',
              date: new Date().toISOString().split('T')[0],
              content: `Self-registered under ${branchName} division.`
            }
          ]
        });

        setRegisteredResult({
          code: client.code,
          fullName: client.fullName,
          branchName,
          branchCode,
          type: 'client',
          entity: client
        });
      } else if (regType === 'owner') {
        const owner = registerPublicOwner({
          branchId: regBranchId,
          fullName: regFullName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          address: regAddress.trim() || `${regCity}, ${regState}`,
          state: regState,
          ninOrCac: regNinOrCac.trim(),
          bankName: regBankName,
          accountNumber: regAccountNumber.trim() || '0000000000'
        });

        setRegisteredResult({
          code: owner.code,
          fullName: owner.fullName,
          branchName,
          branchCode,
          type: 'owner',
          entity: owner
        });
      } else if (regType === 'tenant') {
        const propId = regPropertyId || branchProperties[0]?.id || 'PROP-DEMO';
        const tenant = registerPublicTenant({
          branchId: regBranchId,
          fullName: regFullName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          propertyId: propId,
          unitAssigned: regUnit.trim() || 'Unit 1',
          annualRent: Number(regAnnualRent) || 2000000,
          nin: regNinOrCac.trim()
        });

        setRegisteredResult({
          code: tenant.code,
          fullName: tenant.fullName,
          branchName,
          branchCode,
          type: 'tenant',
          entity: tenant
        });
      }
    } catch (err: any) {
      setRegError(err.message || 'Failed to complete public branch registration.');
    }
  };

  const handleCopyCode = () => {
    if (!registeredResult) return;
    navigator.clipboard?.writeText(registeredResult.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleEnterRegisteredPortal = () => {
    if (!registeredResult) return;
    if (registeredResult.type === 'client') {
      loginClientPortal(registeredResult.entity.code, registeredResult.entity.email, registeredResult.entity.branchId);
    } else if (registeredResult.type === 'owner') {
      loginOwnerPortal(registeredResult.entity.code, registeredResult.entity.email, registeredResult.entity.branchId);
    } else if (registeredResult.type === 'tenant') {
      loginTenantPortal(registeredResult.entity.code, registeredResult.entity.email, registeredResult.entity.branchId);
    }
    onSuccess();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-lg border border-[#e0ddd5] p-6 sm:p-8 space-y-6">
        {/* Shield Icon & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#1a2a4a] text-[#c9a227] flex items-center justify-center mx-auto shadow-sm">
            {portalType === 'register' ? <UserPlus className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h1 className="font-serif font-black text-2xl text-[#1a2a4a]">
            {title}
          </h1>
          <p className="text-xs text-[#5a5a5a] max-w-md mx-auto leading-relaxed">
            In accordance with the Nigeria Data Protection Act (NDPA) and Section 11 Chambers Statutory Governance, access and registrations are strictly branch-bound.
          </p>
        </div>

        {/* 4-Way Tab Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#f8f6f1] p-1.5 rounded-lg border border-[#e0ddd5] text-xs font-serif-heading font-bold">
          <button
            type="button"
            onClick={() => onSwitchPortal('client')}
            className={`py-2 px-2 rounded transition-colors text-center cursor-pointer ${
              portalType === 'client'
                ? 'bg-[#1a2a4a] text-[#c9a227] shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Client Portal
          </button>
          <button
            type="button"
            onClick={() => onSwitchPortal('owner')}
            className={`py-2 px-2 rounded transition-colors text-center cursor-pointer ${
              portalType === 'owner'
                ? 'bg-[#1a2a4a] text-[#c9a227] shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Landlord / Owner
          </button>
          <button
            type="button"
            onClick={() => onSwitchPortal('tenant')}
            className={`py-2 px-2 rounded transition-colors text-center cursor-pointer ${
              portalType === 'tenant'
                ? 'bg-[#1a2a4a] text-[#c9a227] shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Tenant Portal
          </button>
          <button
            type="button"
            onClick={() => onSwitchPortal('register')}
            className={`py-2 px-2 rounded transition-colors text-center cursor-pointer flex items-center justify-center gap-1 ${
              portalType === 'register'
                ? 'bg-[#c9a227] text-[#1a2a4a] shadow-xs'
                : 'text-[#1a2a4a] hover:text-[#c9a227]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Account</span>
          </button>
        </div>

        {/* VIEW 1: REGISTRATION COMPLETED CONFIRMATION */}
        {portalType === 'register' && registeredResult && (
          <div className="bg-[#f8f6f1] border-2 border-[#c9a227] rounded-xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#c9a227] block font-mono">
                Official Registration Confirmed
              </span>
              <h3 className="font-serif font-black text-xl text-[#1a2a4a]">
                Welcome, {registeredResult.fullName}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Your file has been inaugurated and strictly quarantined under the{' '}
                <strong>{registeredResult.branchName} Division</strong> ({registeredResult.branchCode}).
              </p>
            </div>

            {/* Generated Code Badge */}
            <div className="p-4 bg-white rounded-lg border border-[#e0ddd5] shadow-xs max-w-md mx-auto space-y-2">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Assigned Official Chambers Code
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono font-bold text-lg text-[#1a2a4a] bg-amber-50 px-3 py-1 rounded border border-[#c9a227]/60">
                  {registeredResult.code}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-600 cursor-pointer"
                  title="Copy Code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-[10px] text-gray-500 leading-tight">
                Keep this code secure. You will use this code along with your registered phone or email to access your files under this branch.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleEnterRegisteredPortal}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded font-bold text-xs shadow flex items-center justify-center gap-2 cursor-pointer font-serif-heading"
              >
                <Shield className="w-4 h-4" />
                <span>Open Verified {registeredResult.type.toUpperCase()} Portal Now</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegisteredResult(null);
                  onSwitchPortal('client');
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded font-semibold text-xs cursor-pointer"
              >
                Return to Login Desk
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: REGISTRATION FORM */}
        {portalType === 'register' && !registeredResult && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            {regError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            {/* Step A: Mandatory Chambers Branch Selection */}
            <div className="p-3.5 bg-amber-50/70 border-2 border-[#c9a227] rounded-xl space-y-2">
              <label className="block text-xs font-bold text-[#1a2a4a] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#c9a227]" />
                <span>Step 1: Select Chambers Branch Division *</span>
              </label>
              <select
                required
                value={regBranchId}
                onChange={(e) => setRegBranchId(e.target.value)}
                className="w-full p-2.5 rounded border border-[#c9a227] bg-white font-bold text-[#1a2a4a] focus:outline-none focus:ring-1 focus:ring-[#c9a227]"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code}) — {b.city}, {b.state} State
                  </option>
                ))}
              </select>
              <div className="text-[11px] text-gray-700 leading-relaxed">
                <strong>Statutory Data Isolation Mandate:</strong> Your legal matters, KYC documents, billing, and consultations will be strictly quarantined under this selected branch. You will only be able to authenticate and view records under this branch division.
              </div>
            </div>

            {/* Step B: Select Registration Role */}
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Step 2: Registration Category *</label>
              <div className="grid grid-cols-3 gap-2">
                {(['client', 'owner', 'tenant'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setRegType(t)}
                    className={`py-2 px-2 rounded border text-xs font-bold transition-all cursor-pointer ${
                      regType === t
                        ? 'bg-[#1a2a4a] text-white border-[#1a2a4a]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#1a2a4a]'
                    }`}
                  >
                    {t === 'client' ? 'Client / Litigant' : t === 'owner' ? 'Property Owner' : 'Tenant'}
                  </button>
                ))}
              </div>
            </div>

            {/* Step C: Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">
                  {regType === 'owner' ? 'Landlord / Entity Full Name *' : 'Full Legal Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Chief Babatunde Adeleke"
                  className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227] bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@domain.ng"
                  className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Contact Telephone (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+234 803 000 0000"
                  className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227] bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">National ID (NIN) or CAC Registration Number *</label>
                <input
                  type="text"
                  required
                  value={regNinOrCac}
                  onChange={(e) => setRegNinOrCac(e.target.value)}
                  placeholder="NIN (11 Digits) or RC-123456"
                  className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227] bg-white font-mono"
                />
              </div>
            </div>

            {/* Step D: Nigerian Geographic Cascade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">State of Residence *</label>
                <select
                  value={regState}
                  onChange={(e) => {
                    const st = e.target.value;
                    setRegState(st);
                    const l = getLgasForState(st);
                    setRegLga(l[0] || '');
                  }}
                  className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227] bg-white"
                >
                  {NIGERIAN_STATES.map(s => (
                    <option key={s.state} value={s.state}>{s.state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Local Government (LGA) *</label>
                <select
                  value={regLga}
                  onChange={(e) => setRegLga(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227] bg-white"
                >
                  {lgas.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">City / Town</label>
                <input
                  type="text"
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  placeholder="e.g. Ikeja Central"
                  className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227] bg-white"
                />
              </div>
            </div>

            {/* Category-Specific Fields */}
            {regType === 'client' && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block font-semibold mb-1">Client Classification</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={regClientType === 'Individual'}
                        onChange={() => setRegClientType('Individual')}
                      />
                      <span>Individual Litigant / Private Citizen</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={regClientType === 'Corporate'}
                        onChange={() => setRegClientType('Corporate')}
                      />
                      <span>Corporate / Commercial Entity</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Matter / Legal Subject Overview</label>
                  <textarea
                    rows={2}
                    value={regLegalSubject}
                    onChange={(e) => setRegLegalSubject(e.target.value)}
                    placeholder="Brief description of the legal matter, dispute, or conveyance needed..."
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227] bg-white"
                  />
                </div>
              </div>
            )}

            {regType === 'owner' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold mb-1">Remittance Settlement Bank</label>
                  <input
                    type="text"
                    value={regBankName}
                    onChange={(e) => setRegBankName(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">NUBAN Account Number</label>
                  <input
                    type="text"
                    value={regAccountNumber}
                    onChange={(e) => setRegAccountNumber(e.target.value)}
                    placeholder="10 Digits"
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227] bg-white font-mono"
                  />
                </div>
              </div>
            )}

            {regType === 'tenant' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold mb-1">Leased Premises Unit</label>
                  <input
                    type="text"
                    value={regUnit}
                    onChange={(e) => setRegUnit(e.target.value)}
                    placeholder="e.g. 3-Bedroom Apartment Unit 4"
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Annual Rent Ceiling (₦)</label>
                  <input
                    type="number"
                    value={regAnnualRent}
                    onChange={(e) => setRegAnnualRent(Number(e.target.value))}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227] bg-white font-mono"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded-md font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-serif-heading"
            >
              <UserPlus className="w-4 h-4" />
              <span>Submit Registration & Bind to {selectedBranch.name}</span>
            </button>
          </form>
        )}

        {/* VIEW 3: LOGIN / VERIFICATION FORM (CLIENT, OWNER, TENANT) */}
        {portalType !== 'register' && (
          <form onSubmit={handleVerify} className="space-y-4">
            {errorMessage && (
              <div className="flex items-start gap-2 p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-md">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Mandatory Branch Division Selector */}
            <div className="p-3 bg-amber-50/70 border-2 border-[#c9a227] rounded-lg space-y-1">
              <label className="block text-xs font-bold text-[#1a2a4a] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>Select Your Registered Chambers Branch Division *</span>
              </label>
              <select
                required
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full text-xs p-2 rounded border border-[#c9a227] bg-white font-bold text-[#1a2a4a] focus:outline-none focus:ring-1 focus:ring-[#c9a227]"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code}) — {b.city}, {b.state} State
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-gray-600 block leading-tight font-medium">
                Branch Quarantining Policy: You can only authenticate and view records under the specific branch division selected during registration.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">
                Assigned {portalType === 'client' ? 'Client' : portalType === 'owner' ? 'Owner' : 'Tenant'} Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={placeholderCode}
                className="w-full text-xs font-mono-code p-2.5 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">
                Identity Verification Identifier *
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email on file, phone number, or last 4 digits of NIN/CAC"
                className="w-full text-xs p-2.5 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Must match the contact email, telephone, or national identity registered with this branch.
              </span>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-2.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded font-bold text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer font-serif-heading"
            >
              <Shield className="w-4 h-4" />
              <span>{isVerifying ? 'Verifying Branch & Credentials...' : 'Authenticate & Open Portal'}</span>
            </button>
          </form>
        )}

        {/* Bottom Help & Registration Link */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          {portalType !== 'register' ? (
            <button
              type="button"
              onClick={() => onSwitchPortal('register')}
              className="text-[#1a2a4a] font-bold hover:text-[#c9a227] underline flex items-center gap-1 cursor-pointer"
            >
              <span>Not registered yet? Register with a Chambers Branch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSwitchPortal('client')}
              className="text-[#1a2a4a] font-bold hover:text-[#c9a227] underline flex items-center gap-1 cursor-pointer"
            >
              <span>Already registered? Access your portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="text-[11px] text-gray-400 font-mono">
            Pan-African Chambers Division Governance
          </div>
        </div>
      </div>
    </div>
  );
};
