import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { PrintHeader } from '../../common/PrintHeader';
import { LocalFilePicker } from '../../common/LocalFilePicker';
import { TENANCY_NOTICE_TEMPLATES } from '../../../data/legalHierarchy';
import { FileText, Printer, Download, CheckCircle2, AlertTriangle, Scale, Shield, Plus, Home } from 'lucide-react';
import { TenancyAgreement, QuitNotice } from '../../../types';

export const TenancyQuitModule: React.FC = () => {
  const {
    agreements,
    notices,
    tenants,
    properties,
    owners,
    addAgreement,
    addNotice,
    activeBranchId,
    getActiveBranch,
    branches,
    canAccessBranchData,
    effectiveBranchId
  } = useApp();

  const [activeTab, setActiveTab] = useState<'agreements' | 'notices' | 'generate-notice' | 'generate-agreement'>('agreements');
  const [printableNotice, setPrintableNotice] = useState<QuitNotice | null>(null);
  const [printableAgreement, setPrintableAgreement] = useState<TenancyAgreement | null>(null);

  // Form State: Notice Generation (Section 24)
  const [noticeTenantId, setNoticeTenantId] = useState('');
  const [noticeType, setNoticeType] = useState<any>('Notice to Quit (6 Months)');
  const [serviceMethod, setServiceMethod] = useState<'Personal Service' | 'Substituted Service (Posted on Premises)' | 'Registered Courier'>('Personal Service');
  const [servedBy, setServedBy] = useState('Chambers Bailiff & Counsel');
  const [expiryDate, setExpiryDate] = useState('');
  const [outstandingArrears, setOutstandingArrears] = useState(0);

  // Form State: Tenancy Agreement (Section 25)
  const [agrTenantId, setAgrTenantId] = useState('');
  const [agreementType, setAgreementType] = useState<'Residential' | 'Commercial' | 'Short-Let' | 'Furnished Unit'>('Residential');
  const [termYears, setTermYears] = useState(1);
  const [rentAmount, setRentAmount] = useState(2000000);
  const [serviceCharge, setServiceCharge] = useState(250000);
  const [cautionFee, setCautionFee] = useState(200000);
  const [legalFee, setLegalFee] = useState(200000); // 10% LPRO
  const [agencyFee, setAgencyFee] = useState(200000); // 10%
  const [governingState, setGoverningState] = useState('Lagos');
  const [witnessName, setWitnessName] = useState('B. B. Bale & Co Legal Counsel');
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const [agrError, setAgrError] = useState<string | null>(null);

  const activeBranch = getActiveBranch();
  const targetBranchId = effectiveBranchId;

  // Strict Branch Data Isolation
  const branchAgreements = agreements.filter(a => canAccessBranchData(a.branchId));
  const branchNotices = notices.filter(n => canAccessBranchData(n.branchId));
  const branchTenants = tenants.filter(t => canAccessBranchData(t.branchId));
  const branchProperties = properties.filter(p => canAccessBranchData(p.branchId));

  const handleGenerateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    setNoticeError(null);
    const tenant = branchTenants.find(t => t.id === noticeTenantId);
    if (!tenant) {
      setNoticeError('Please select a tenant record in the premises.');
      return;
    }

    const newNotice = addNotice({
      branchId: targetBranchId,
      tenantId: tenant.id,
      propertyId: tenant.propertyId,
      noticeType,
      dateServed: new Date().toISOString().split('T')[0],
      expiryDate: expiryDate || '2027-04-30',
      outstandingRent: Number(outstandingArrears) || 0,
      serviceMethod,
      servedBy,
      headApproval: true,
      status: 'Approved'
    });

    setPrintableNotice(newNotice);
    setActiveTab('notices');
  };

  const handleGenerateAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    setAgrError(null);
    const tenant = branchTenants.find(t => t.id === agrTenantId);
    if (!tenant) {
      setAgrError('Please select a tenant record to draft agreement.');
      return;
    }

    const newAgr = addAgreement({
      branchId: targetBranchId,
      tenantId: tenant.id,
      propertyId: tenant.propertyId,
      ownerId: tenant.ownerId,
      agreementType,
      termYears: Number(termYears),
      commencementDate: new Date().toISOString().split('T')[0],
      rentAmount: Number(rentAmount),
      serviceCharge: Number(serviceCharge),
      cautionFee: Number(cautionFee),
      legalFee: Number(legalFee),
      agencyFee: Number(agencyFee),
      governingState,
      customClauses: [
        'Payment of rent annually in advance without deductions.',
        'Prohibition of subletting, assignment, or parting with possession without prior written consent.',
        'Use of premises strictly for approved private/commercial purposes.',
        'Tenant responsible for internal repairs, utility bills, and service charges.'
      ],
      witnessName,
      status: 'Executed'
    });

    setPrintableAgreement(newAgr);
    setActiveTab('agreements');
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-black text-xl text-[#1a2a4a]">
            Statutory Notices & Tenancy Agreement Drafter
          </h2>
          <p className="text-xs text-[#5a5a5a]">
            Nigerian Law-Compliant Drafter: Lagos State Tenancy Law 2011, Recovery of Premises Act & Legal Practitioners' Remuneration Order (LPRO) 2023.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('generate-agreement')}
            className="px-3 py-1.5 border border-[#1a2a4a] text-[#1a2a4a] hover:bg-gray-100 rounded text-xs font-semibold"
          >
            + Draft Agreement
          </button>
          <button
            onClick={() => setActiveTab('generate-notice')}
            className="px-4 py-1.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded text-xs font-bold font-serif-heading"
          >
            + Generate Notice / Tribunal Process
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e0ddd5]">
        <button
          onClick={() => { setActiveTab('agreements'); setPrintableNotice(null); setPrintableAgreement(null); }}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer ${
            activeTab === 'agreements' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500'
          }`}
        >
          Tenancy Agreements ({branchAgreements.length})
        </button>
        <button
          onClick={() => { setActiveTab('notices'); setPrintableNotice(null); setPrintableAgreement(null); }}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer ${
            activeTab === 'notices' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500'
          }`}
        >
          Quit Notices & Tribunal Processes ({branchNotices.length})
        </button>
      </div>

      {/* Printable Notice View (Section 24 / Universal Clean Print) */}
      {printableNotice && (
        <div className="bg-white p-6 sm:p-10 rounded-xl border-2 border-[#1a2a4a] shadow-xl space-y-6">
          <div className="flex justify-between items-center no-print">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              ✓ Process Ready for Printing & Service
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-[#1a2a4a] text-white hover:bg-[#111e38] rounded text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-[#c9a227]" />
                <span>Print Statutory Notice</span>
              </button>
              <button
                onClick={() => setPrintableNotice(null)}
                className="px-3 py-1.5 border rounded text-xs text-gray-600 hover:bg-gray-100"
              >
                Close Preview
              </button>
            </div>
          </div>

          {/* Official Letterhead */}
          <PrintHeader
            branch={activeBranch}
            documentTitle={printableNotice.noticeType}
            referenceNumber={printableNotice.code}
            date={printableNotice.dateServed}
          />

          {/* Notice Legal Body */}
          <div className="space-y-4 text-xs text-gray-900 leading-relaxed font-serif">
            <div>
              <strong>TO: </strong>
              <span className="font-sans font-bold">
                {tenants.find(t => t.id === printableNotice.tenantId)?.fullName || 'The Tenant in Possession'}
              </span>
            </div>
            <div>
              <strong>PREMISES: </strong>
              <span className="font-sans">
                {properties.find(p => p.id === printableNotice.propertyId)?.name || 'Prime Unit'}, {properties.find(p => p.id === printableNotice.propertyId)?.city}
              </span>
            </div>

            <div className="pt-2 text-justify space-y-3">
              <p>
                <strong>TAKE NOTICE</strong> that you are hereby required to quit and deliver up possession of the premises with the appurtenances situated at the address stated above, which you hold of the Landlord as tenant thereof, on or before the <strong>{printableNotice.expiryDate}</strong>.
              </p>

              {printableNotice.outstandingRent > 0 && (
                <p>
                  <strong>FURTHER TAKE NOTICE</strong> that the total accumulated arrears of rent and mesne profits amounting to the sum of <strong>₦{printableNotice.outstandingRent.toLocaleString()}</strong> remains outstanding and must be liquidated immediately into the designated Chambers client account.
                </p>
              )}

              <p>
                AND FURTHER TAKE NOTICE that if you refuse or neglect to deliver up possession of the said premises on or before the date specified above, application will be made to the Court / Rent Tribunal having jurisdiction in the District for possession and judgment for arrears of rent and mesne profits.
              </p>
            </div>

            <div className="pt-8 flex justify-between items-end border-t border-gray-200 mt-6 font-sans">
              <div>
                <div className="text-[11px] text-gray-500">Service Method:</div>
                <div className="font-bold text-gray-800">{printableNotice.serviceMethod}</div>
                <div className="text-[10px] text-gray-500">Served by: {printableNotice.servedBy}</div>
              </div>
              <div className="text-right">
                <div className="w-44 border-b border-gray-800 mb-1"></div>
                <div className="font-bold text-[#1a2a4a]">B. B. BALE & CO CHAMBERS</div>
                <div className="text-[10px] text-[#c9a227] font-semibold">Solicitors to the Landlord</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Agreements List */}
      {activeTab === 'agreements' && !printableAgreement && (
        <div className="space-y-4">
          {branchAgreements.length > 0 ? (
            branchAgreements.map(agr => {
              const tenant = tenants.find(t => t.id === agr.tenantId);
              const prop = properties.find(p => p.id === agr.propertyId);
              return (
                <div key={agr.id} className="bg-white p-5 rounded-lg border border-[#e0ddd5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1a2a4a] bg-gray-100 px-2 py-0.5 rounded">{agr.code}</span>
                      <span className="font-serif font-bold text-sm text-[#1a2a4a]">{agr.agreementType} Tenancy Agreement</span>
                    </div>
                    <div className="text-gray-600 mt-1">
                      Tenant: <strong>{tenant?.fullName}</strong> · Property: {prop?.name} ({agr.governingState} Law)
                    </div>
                    <div className="text-gray-500 mt-0.5 font-mono">
                      Annual Rent: ₦{agr.rentAmount.toLocaleString()} · Legal Fee: ₦{agr.legalFee.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPrintableAgreement(agr)}
                      className="px-3 py-1.5 bg-[#1a2a4a] text-white hover:bg-[#111e38] rounded font-semibold text-xs flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#c9a227]" />
                      <span>Print Document</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-[#e0ddd5] space-y-3">
              <FileText className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">No Tenancy Agreements Drafted</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Generate Nigerian law-compliant residential or commercial tenancy contracts with statutory witness covenants.
              </p>
              <button
                onClick={() => setActiveTab('generate-agreement')}
                className="px-5 py-2 bg-[#1a2a4a] text-[#c9a227] rounded text-xs font-bold font-serif-heading"
              >
                Draft First Agreement
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Notices List */}
      {activeTab === 'notices' && !printableNotice && (
        <div className="space-y-4">
          {notices.length > 0 ? (
            notices.map(not => {
              const tenant = tenants.find(t => t.id === not.tenantId);
              return (
                <div key={not.id} className="bg-white p-5 rounded-lg border border-[#e0ddd5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1a2a4a] bg-gray-100 px-2 py-0.5 rounded">{not.code}</span>
                      <span className="font-serif font-bold text-sm text-[#1a2a4a]">{not.noticeType}</span>
                    </div>
                    <div className="text-gray-600 mt-1">
                      Tenant: <strong>{tenant?.fullName}</strong> · Service Method: {not.serviceMethod}
                    </div>
                    <div className="text-gray-500 mt-0.5 font-mono">
                      Expiry Date: {not.expiryDate} · Arrears: ₦{not.outstandingRent.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPrintableNotice(not)}
                      className="px-3 py-1.5 bg-[#1a2a4a] text-white hover:bg-[#111e38] rounded font-semibold text-xs flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#c9a227]" />
                      <span>Print Notice</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-[#e0ddd5] space-y-3">
              <Scale className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">No Quit Notices Issued</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Generate statutory Notice to Quit (6-Month, 3-Month, 1-Month) or 7-Day Notice of Owner’s Intention Form TL5.
              </p>
              <button
                onClick={() => setActiveTab('generate-notice')}
                className="px-5 py-2 bg-[#1a2a4a] text-[#c9a227] rounded text-xs font-bold font-serif-heading"
              >
                Generate Statutory Notice
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Generate Notice Form (Section 24) */}
      {activeTab === 'generate-notice' && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#e0ddd5] shadow-xs space-y-5">
          <div>
            <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Generate Quit Notice / Rent Tribunal Process</h3>
            <p className="text-xs text-gray-500">
              Statutory notice templates compliant with the Lagos State Tenancy Law 2011 and Recovery of Premises Act.
            </p>
          </div>

          <form onSubmit={handleGenerateNotice} className="space-y-4 text-xs">
            {noticeError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded font-medium">
                {noticeError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Target Tenant *</label>
                <select
                  required
                  value={noticeTenantId}
                  onChange={(e) => setNoticeTenantId(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                >
                  <option value="">-- Select Tenant in Premises --</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName} ({t.unitAssigned})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Statutory Notice Category *</label>
                <select
                  value={noticeType}
                  onChange={(e) => setNoticeType(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                >
                  <option value="Notice to Quit (6 Months)">Notice to Quit (6 Months - Yearly Tenancy)</option>
                  <option value="Notice to Quit (3 Months)">Notice to Quit (3 Months - Half-Yearly Tenancy)</option>
                  <option value="Notice to Quit (1 Month)">Notice to Quit (1 Month - Monthly Tenancy)</option>
                  <option value="7-Day Notice of Owner’s Intention to Apply to Court for Possession">7-Day Notice of Owner’s Intention (Form TL5)</option>
                  <option value="Demand Letter for Outstanding Rent & Arrears">Demand Letter for Outstanding Arrears</option>
                  <option value="Rent Tribunal Claim Form & Statement of Claim">Rent Tribunal Plaint & Statement of Claim</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1">Service Method</label>
                <select
                  value={serviceMethod}
                  onChange={(e) => setServiceMethod(e.target.value as any)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                >
                  <option value="Personal Service">Personal Service on Tenant</option>
                  <option value="Substituted Service (Posted on Premises)">Substituted Service (Posted on Door)</option>
                  <option value="Registered Courier">Registered Courier Dispatch</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Date Expiry / Required Possession Date *</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Outstanding Arrears (₦)</label>
                <input
                  type="number"
                  value={outstandingArrears}
                  onChange={(e) => setOutstandingArrears(Number(e.target.value))}
                  className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setActiveTab('notices')} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" className="px-6 py-2.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] font-bold rounded font-serif-heading">
                Compile Statutory Notice
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Generate Agreement Form (Section 25) */}
      {activeTab === 'generate-agreement' && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#e0ddd5] shadow-xs space-y-5">
          <div>
            <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Draft Tenancy Agreement</h3>
            <p className="text-xs text-gray-500">
              Standard covenants, service charge schedules, and legal fees structured under LPRO 2023.
            </p>
          </div>

          <form onSubmit={handleGenerateAgreement} className="space-y-4 text-xs">
            {agrError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded font-medium">
                {agrError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Tenant *</label>
                <select
                  required
                  value={agrTenantId}
                  onChange={(e) => setAgrTenantId(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                >
                  <option value="">-- Select Registered Tenant --</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName} ({t.unitAssigned})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Agreement Type</label>
                <select
                  value={agreementType}
                  onChange={(e) => setAgreementType(e.target.value as any)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                >
                  <option value="Residential">Residential Tenancy Agreement</option>
                  <option value="Commercial">Commercial Lease Agreement</option>
                  <option value="Short-Let">Short-Let Serviced Unit Agreement</option>
                  <option value="Furnished Unit">Furnished Apartment Tenancy</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold mb-1">Term (Years)</label>
                <input
                  type="number"
                  min={1}
                  value={termYears}
                  onChange={(e) => setTermYears(Number(e.target.value))}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Annual Rent (₦) *</label>
                <input
                  type="number"
                  required
                  value={rentAmount}
                  onChange={(e) => setRentAmount(Number(e.target.value))}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Legal Fee (10% LPRO)</label>
                <input
                  type="number"
                  value={legalFee}
                  onChange={(e) => setLegalFee(Number(e.target.value))}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Caution Fee (₦)</label>
                <input
                  type="number"
                  value={cautionFee}
                  onChange={(e) => setCautionFee(Number(e.target.value))}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setActiveTab('agreements')} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" className="px-6 py-2.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] font-bold rounded font-serif-heading">
                Execute Tenancy Agreement
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
