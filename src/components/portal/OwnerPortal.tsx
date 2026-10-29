import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LocalFilePicker } from '../common/LocalFilePicker';
import { Building2, Shield, LogOut, Download, Plus, Layers, DollarSign, FileText } from 'lucide-react';
import { UploadedFileMetadata } from '../../types';

export const OwnerPortal: React.FC = () => {
  const { authenticatedOwner, logoutPortal, properties, tenants, addProperty, getActiveBranch, branches } = useApp();

  const [activeTab, setActiveTab] = useState<'properties' | 'remittance' | 'add-property'>('properties');

  // Add Property State
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState<'Residential' | 'Commercial' | 'Mixed Use' | 'Land'>('Residential');
  const [newPropCity, setNewPropCity] = useState('');
  const [newPropState, setNewPropState] = useState('Lagos');
  const [newPropUnits, setNewPropUnits] = useState(1);
  const [newPropValuation, setNewPropValuation] = useState('');
  const [newPropTitles, setNewPropTitles] = useState<UploadedFileMetadata[]>([]);
  const [propertyAdded, setPropertyAdded] = useState(false);

  if (!authenticatedOwner) return null;

  const ownerProperties = properties.filter(p => p.ownerId === authenticatedOwner.id);
  const ownerTenants = tenants.filter(t => t.ownerId === authenticatedOwner.id);
  const totalAnnualRent = ownerTenants.reduce((sum, t) => sum + t.annualRent, 0);

  const handleRegisterProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName || !newPropCity) return;

    addProperty({
      branchId: authenticatedOwner.branchId,
      ownerId: authenticatedOwner.id,
      name: newPropName,
      propertyType: newPropType,
      ownershipType: 'Client-Managed',
      state: newPropState,
      lga: 'Ikeja',
      city: newPropCity,
      streetAddress: newPropCity,
      unitsCount: Number(newPropUnits),
      currentValuation: Number(newPropValuation) || 0,
      titleDocuments: newPropTitles,
      photos: [],
      status: 'Active'
    });

    setPropertyAdded(true);
    setNewPropName('');
    setNewPropCity('');
    setNewPropValuation('');
    setNewPropTitles([]);
    setTimeout(() => {
      setPropertyAdded(false);
      setActiveTab('properties');
    }, 1200);
  };

  return (
    <div className="min-w-full bg-[#f8f6f1] min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#e0ddd5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-code text-[#c9a227] font-bold uppercase">
              <Shield className="w-4 h-4" />
              <span>Verified Landlord & Owner Portal · {authenticatedOwner.code}</span>
            </div>
            <h1 className="font-serif font-black text-2xl text-[#1a2a4a] mt-1">
              Welcome, {authenticatedOwner.fullName}
            </h1>
            <p className="text-xs text-[#5a5a5a]">
              Managing Branch: {branches.find(b => b.id === authenticatedOwner.branchId)?.name || 'Headquarters Branch'} · Bank: {authenticatedOwner.bankName} (Acct: {authenticatedOwner.accountNumber}) · Remittance Status: Active
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print Statements</span>
            </button>
            <button
              onClick={logoutPortal}
              className="px-3.5 py-1.5 rounded bg-[#1a2a4a] text-white text-xs font-semibold hover:bg-[#111e38] flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Portfolio Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-[#e0ddd5] shadow-2xs">
            <span className="text-gray-400 text-xs font-medium uppercase">Managed Properties</span>
            <div className="text-2xl font-bold font-serif text-[#1a2a4a] mt-1">
              {ownerProperties.length} Properties
            </div>
            <span className="text-[11px] text-gray-500">Across Nigerian Urban Centers</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#e0ddd5] shadow-2xs">
            <span className="text-gray-400 text-xs font-medium uppercase">Active Tenancies</span>
            <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">
              {ownerTenants.length} Occupied Units
            </div>
            <span className="text-[11px] text-gray-500">Chambers Managed Lease Terms</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#e0ddd5] shadow-2xs">
            <span className="text-gray-400 text-xs font-medium uppercase">Projected Annual Rent Roll</span>
            <div className="text-2xl font-bold font-serif text-[#c9a227] mt-1">
              ₦{totalAnnualRent.toLocaleString()}
            </div>
            <span className="text-[11px] text-gray-500">Gross Receivable under Mandate</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#e0ddd5]">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2.5 text-xs font-bold font-serif-heading border-b-2 cursor-pointer transition-colors ${
              activeTab === 'properties'
                ? 'border-[#c9a227] text-[#1a2a4a]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            My Properties Portfolio ({ownerProperties.length})
          </button>
          <button
            onClick={() => setActiveTab('remittance')}
            className={`px-4 py-2.5 text-xs font-bold font-serif-heading border-b-2 cursor-pointer transition-colors ${
              activeTab === 'remittance'
                ? 'border-[#c9a227] text-[#1a2a4a]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Rent Remittance & Statements
          </button>
          <button
            onClick={() => setActiveTab('add-property')}
            className={`px-4 py-2.5 text-xs font-bold font-serif-heading border-b-2 cursor-pointer transition-colors ${
              activeTab === 'add-property'
                ? 'border-[#c9a227] text-[#1a2a4a]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            + Register Additional Property
          </button>
        </div>

        {/* Tab 1: Properties List */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            {ownerProperties.length > 0 ? (
              ownerProperties.map(prop => {
                const propTenants = tenants.filter(t => t.propertyId === prop.id);
                return (
                  <div key={prop.id} className="bg-white p-5 rounded-lg border border-[#e0ddd5] shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <span className="text-[10px] font-mono-code font-bold bg-[#1a2a4a]/10 text-[#1a2a4a] px-2 py-0.5 rounded mr-2">
                          {prop.code}
                        </span>
                        <span className="font-serif font-bold text-base text-[#1a2a4a]">
                          {prop.name}
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {prop.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Location:</span>
                        <span className="font-medium text-gray-900">{prop.city}, {prop.state} State</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Classification:</span>
                        <span className="font-medium text-gray-900">{prop.propertyType} ({prop.unitsCount} Units)</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Tenants Registered:</span>
                        <span className="font-medium text-gray-900">{propTenants.length} Active Tenants</span>
                      </div>
                    </div>

                    {/* Title Documents */}
                    {prop.titleDocuments && prop.titleDocuments.length > 0 && (
                      <div className="pt-2 border-t text-xs">
                        <span className="font-semibold text-gray-700 block mb-1">Registered Title Deeds:</span>
                        <div className="flex flex-wrap gap-2">
                          {prop.titleDocuments.map(td => (
                            <span key={td.id} className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-[11px] text-gray-700">
                              <FileText className="w-3 h-3 text-[#c9a227]" />
                              <span>{td.originalName}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-[#e0ddd5] space-y-2">
                <Building2 className="w-10 h-10 text-gray-400 mx-auto" />
                <h3 className="font-serif font-bold text-sm text-[#1a2a4a]">No Properties Recorded</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Click the "Register Additional Property" tab above to submit title deeds and mandate B. B. BALE & CO Chambers.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Remittances & Statements */}
        {activeTab === 'remittance' && (
          <div className="bg-white p-5 rounded-lg border border-[#e0ddd5] shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Rent Remittance Statements</h3>
            <p className="text-xs text-gray-500">
              Net rent distributions disbursed to {authenticatedOwner.bankName} (NUBAN: {authenticatedOwner.accountNumber}) minus authorized management and statutory maintenance expenses.
            </p>

            <div className="space-y-3">
              {ownerTenants.map(t => (
                <div key={t.id} className="p-3 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-bold text-[#1a2a4a]">{t.fullName} (Unit {t.unitAssigned})</div>
                    <div className="text-gray-500">Annual Rent: ₦{t.annualRent.toLocaleString()} · Next Settlement: {t.nextRentDueDate}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-700 font-semibold">{t.rentPaymentStatus}</span>
                  </div>
                </div>
              ))}

              {ownerTenants.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-400">
                  No tenancies recorded under this owner account yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Register Additional Property (Section 21.7 Owner Multi-Property Registration) */}
        {activeTab === 'add-property' && (
          <div className="bg-white p-6 rounded-lg border border-[#e0ddd5] shadow-xs space-y-5">
            <div>
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Register Another Property Under Your Portfolio</h3>
              <p className="text-xs text-[#5a5a5a] mt-0.5">
                Multi-property registration: Register unlimited properties under your single Owner ID ({authenticatedOwner.code}).
              </p>
            </div>

            {propertyAdded && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs">
                Property registered successfully and added to Chambers portfolio!
              </div>
            )}

            <form onSubmit={handleRegisterProperty} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Property Name / Estate *</label>
                  <input
                    type="text"
                    required
                    value={newPropName}
                    onChange={(e) => setNewPropName(e.target.value)}
                    placeholder="e.g. Bale Royal Court / Plot 24 Admiralty"
                    className="w-full text-xs p-2.5 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Property Type</label>
                  <select
                    value={newPropType}
                    onChange={(e) => setNewPropType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Mixed Use">Mixed Use</option>
                    <option value="Land">Vacant Land</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">State</label>
                  <select
                    value={newPropState}
                    onChange={(e) => setNewPropState(e.target.value)}
                    className="w-full text-xs p-2.5 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                  >
                    <option value="Lagos">Lagos State</option>
                    <option value="FCT Abuja">FCT Abuja</option>
                    <option value="Rivers">Rivers State</option>
                    <option value="Ogun">Ogun State</option>
                    <option value="Kano">Kano State</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={newPropCity}
                    onChange={(e) => setNewPropCity(e.target.value)}
                    placeholder="e.g. Lekki Phase 1 / Maitama"
                    className="w-full text-xs p-2.5 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Total Units Count</label>
                  <input
                    type="number"
                    min={1}
                    value={newPropUnits}
                    onChange={(e) => setNewPropUnits(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Current Estimated Valuation (₦)</label>
                <input
                  type="number"
                  value={newPropValuation}
                  onChange={(e) => setNewPropValuation(e.target.value)}
                  placeholder="e.g. 250000000"
                  className="w-full text-xs p-2.5 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                />
              </div>

              {/* Title Documents Upload via Device Local File Picker - Section 20 */}
              <div>
                <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">
                  Upload Property Title Documents (C of O, Deed, Survey Plan) *
                </label>
                <LocalFilePicker
                  label="Choose Title Documents from Device"
                  multiple
                  maxSizeMb={50}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  currentFiles={newPropTitles}
                  onUploadComplete={(files) => setNewPropTitles(prev => [...prev, ...files])}
                  onRemoveFile={(id) => setNewPropTitles(prev => prev.filter(f => f.id !== id))}
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded text-xs font-bold cursor-pointer font-serif-heading"
              >
                Register Property with Chambers
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
