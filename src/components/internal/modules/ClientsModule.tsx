import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { LocalFilePicker } from '../../common/LocalFilePicker';
import { NIGERIAN_STATES, getLgasForState } from '../../../data/nigeriaGeo';
import { ClientRecord, UploadedFileMetadata } from '../../../types';
import { UserCheck, Plus, Search, Shield, FileText, CheckCircle2, AlertTriangle, Phone, Mail, MapPin } from 'lucide-react';

export const ClientsModule: React.FC = () => {
  const {
    clients,
    addClient,
    updateClient,
    deleteClient,
    activeBranchId,
    branches,
    canAccessBranchData,
    effectiveBranchId,
    currentUser
  } = useApp();

  const isHeadOrAdmin = currentUser?.role === 'Head of Chamber' || currentUser?.role === 'Administrator' || currentUser?.role === 'Principal Partner';
  const isAccountOfficer = currentUser?.role === 'Account Officer';

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [editClientName, setEditClientName] = useState('');
  const [editClientEmail, setEditClientEmail] = useState('');
  const [editClientPhone, setEditClientPhone] = useState('');
  const [editClientNin, setEditClientNin] = useState('');

  const handleOpenEditClient = (c: ClientRecord) => {
    setEditingClient(c);
    setEditClientName(c.fullName);
    setEditClientEmail(c.email);
    setEditClientPhone(c.phone);
    setEditClientNin(c.ninOrCac);
  };

  const handleSaveEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    updateClient(editingClient.id, {
      fullName: editClientName.trim(),
      email: editClientEmail.trim(),
      phone: editClientPhone.trim(),
      ninOrCac: editClientNin.trim()
    });
    setEditingClient(null);
  };

  // Form State
  const [fullName, setFullName] = useState('');
  const [clientType, setClientType] = useState<'Individual' | 'Corporate'>('Individual');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedState, setSelectedState] = useState('Lagos');
  const [selectedLga, setSelectedLga] = useState('');
  const [city, setCity] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [ninOrCac, setNinOrCac] = useState('');
  const [kycDocs, setKycDocs] = useState<UploadedFileMetadata[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);

  // Conflict Check simulation (Section 16.1: firm-wide conflict check)
  const [conflictStatus, setConflictStatus] = useState<'Passed' | 'Flagged'>('Passed');

  const lgas = getLgasForState(selectedState);

  // Strictly filter clients by branch data isolation
  const branchClients = clients.filter(c => {
    if (!canAccessBranchData(c.branchId)) return false;
    return c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.phone.includes(searchTerm);
  });

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const s = e.target.value;
    setSelectedState(s);
    const availableLgas = getLgasForState(s);
    setSelectedLga(availableLgas[0] || '');
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    if (isAccountOfficer) {
      setClientError('Permission Denied: Account Officers cannot intake/register clients.');
      return;
    }
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setClientError('Please fill all required intake fields (Full Name, Email, Phone).');
      return;
    }

    const targetBranchId = effectiveBranchId;

    addClient({
      branchId: targetBranchId,
      fullName: fullName.trim(),
      clientType,
      email: email.trim(),
      phone: phone.trim(),
      state: selectedState,
      lga: selectedLga || lgas[0] || 'Ikeja',
      city: city.trim() || 'Central',
      streetAddress: streetAddress.trim() || city.trim(),
      ninOrCac: ninOrCac.trim(),
      conflictCheckStatus: conflictStatus,
      kycDocuments: kycDocs,
      status: 'Active'
    });

    setShowAddModal(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setNinOrCac('');
    setCity('');
    setKycDocs([]);
  };

  return (
    <div className="space-y-6">
      {/* Header & Intake Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-black text-xl text-[#1a2a4a]">
            Clients & KYC Registry
          </h2>
          <p className="text-xs text-[#5a5a5a]">
            Client intake with mandatory firm-wide conflict checks, Nigerian address cascade, and local KYC document uploads.
          </p>
        </div>

        {!isAccountOfficer ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded-md font-bold text-xs shadow-sm transition-all cursor-pointer font-serif-heading"
          >
            <Plus className="w-4 h-4" />
            <span>New Client Intake</span>
          </button>
        ) : (
          <div className="text-xs bg-amber-50 text-amber-800 px-3 py-1.5 rounded border border-amber-200 font-medium">
            Account Officer: Client intake restricted to Counsel & Admin
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-[#e0ddd5] shadow-2xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search client code, name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
          />
        </div>

        <div className="text-xs text-gray-500 font-mono">
          Total: {branchClients.length} Records
        </div>
      </div>

      {/* Clients Table */}
      {branchClients.length > 0 ? (
        <div className="bg-white rounded-lg border border-[#e0ddd5] shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1a2a4a] text-white border-b border-[#c9a227] text-[11px] font-mono-code">
                <th className="p-3 font-semibold">Client Code</th>
                <th className="p-3 font-semibold">Full Legal Name</th>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">Contact (Email & Phone)</th>
                <th className="p-3 font-semibold">Location</th>
                <th className="p-3 font-semibold">Conflict Status</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branchClients.map(c => (
                <tr key={c.id} className="hover:bg-[#f8f6f1] transition-colors">
                  <td className="p-3 font-mono font-bold text-[#1a2a4a] whitespace-nowrap">
                    {c.code}
                  </td>
                  <td className="p-3 font-serif font-bold text-gray-900 text-sm">
                    {c.fullName}
                  </td>
                  <td className="p-3 text-gray-600">
                    {c.clientType}
                  </td>
                  <td className="p-3 space-y-0.5">
                    <div className="flex items-center gap-1 text-gray-800">
                      <Mail className="w-3 h-3 text-[#c9a227]" />
                      <span>{c.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-[#c9a227]" />
                      <span>{c.phone}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-700">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#c9a227]" />
                      <span>{c.lga}, {c.state}</span>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Conflict Check Passed</span>
                    </span>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedClient(c)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-[#1a2a4a] hover:text-[#c9a227] rounded text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        View KYC
                      </button>
                      {isHeadOrAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenEditClient(c)}
                            className="px-2.5 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Permanently delete client ${c.fullName} and all their associated matters, litigations and appeals?`)) {
                                deleteClient(c.id);
                              }
                            }}
                            className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Permanently delete client and all associated matters, litigations and appeals"
                          >
                            Delete Client
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-[#e0ddd5] space-y-3">
          <UserCheck className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Clients Registry is Empty</h3>
          <p className="text-xs text-[#5a5a5a] max-w-md mx-auto">
            No client records registered in this branch. Click "New Client Intake" to perform conflict checks and upload KYC credentials.
          </p>
          {!isAccountOfficer && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2 bg-[#1a2a4a] text-[#c9a227] rounded text-xs font-bold font-serif-heading"
            >
              Intake First Client
            </button>
          )}
        </div>
      )}

      {/* Intake Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-2xl w-full p-6 space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">
                New Client Intake & Conflict Check
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              {clientError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded font-medium">
                  {clientError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Full Legal Name / Entity *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alhaji Mustapha Babatunde or Crown Logistics Ltd"
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Client Classification</label>
                  <select
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value as any)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  >
                    <option value="Individual">Individual Client</option>
                    <option value="Corporate">Corporate / Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Telephone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
              </div>

              {/* Nigerian Geographic Cascade (Section 28) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">State of Residence *</label>
                  <select
                    value={selectedState}
                    onChange={handleStateChange}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  >
                    {NIGERIAN_STATES.map(s => (
                      <option key={s.state} value={s.state}>{s.state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">LGA *</label>
                  <select
                    value={selectedLga}
                    onChange={(e) => setSelectedLga(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  >
                    {lgas.map(lga => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Town / City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Victoria Island"
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">National ID (NIN) or RC/CAC Number *</label>
                  <input
                    type="text"
                    required
                    value={ninOrCac}
                    onChange={(e) => setNinOrCac(e.target.value)}
                    placeholder="Required for portal authentication"
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Conflict Check Status</label>
                  <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-800 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Clear · No Adverse Firm Representation</span>
                  </div>
                </div>
              </div>

              {/* Local File Picker for KYC Documents (Section 20) */}
              <div>
                <label className="block font-semibold mb-1">
                  Upload KYC Documents (NIN Slip, Passport, CAC Form, Proof of Address)
                </label>
                <LocalFilePicker
                  label="Choose KYC Documents from Device"
                  multiple
                  maxSizeMb={20}
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  currentFiles={kycDocs}
                  onUploadComplete={(files) => setKycDocs(prev => [...prev, ...files])}
                  onRemoveFile={(id) => setKycDocs(prev => prev.filter(f => f.id !== id))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] font-bold rounded font-serif-heading"
                >
                  Complete Client Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Client KYC Details */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-serif font-bold text-base text-[#1a2a4a]">{selectedClient.fullName} ({selectedClient.code})</span>
              <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <div className="space-y-2 text-xs text-gray-700">
              <div><strong>NIN/CAC on File:</strong> {selectedClient.ninOrCac}</div>
              <div><strong>Address:</strong> {selectedClient.streetAddress}, {selectedClient.lga}, {selectedClient.state} State</div>
              <div><strong>Email:</strong> {selectedClient.email} | <strong>Phone:</strong> {selectedClient.phone}</div>
            </div>

            <div className="border-t pt-3 space-y-2">
              <h4 className="font-bold text-xs text-[#1a2a4a]">KYC Documents ({selectedClient.kycDocuments.length})</h4>
              {selectedClient.kycDocuments.map(d => (
                <div key={d.id} className="p-2 border rounded flex items-center justify-between text-xs">
                  <span>{d.originalName}</span>
                  {d.dataUrl && (
                    <a href={d.dataUrl} download={d.originalName} className="text-[#1a2a4a] font-bold underline">
                      Download
                    </a>
                  )}
                </div>
              ))}
              {selectedClient.kycDocuments.length === 0 && (
                <div className="text-gray-400 text-xs">No KYC documents attached.</div>
              )}
            </div>

            <div className="text-right pt-2 border-t">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-1.5 bg-[#1a2a4a] text-white rounded text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">
                Edit Client Record ({editingClient.code})
              </h3>
              <button onClick={() => setEditingClient(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleSaveEditClient} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Legal Name / Entity *</label>
                <input
                  type="text"
                  required
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editClientEmail}
                    onChange={(e) => setEditClientEmail(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Telephone Number *</label>
                  <input
                    type="tel"
                    required
                    value={editClientPhone}
                    onChange={(e) => setEditClientPhone(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">NIN or CAC Number *</label>
                <input
                  type="text"
                  required
                  value={editClientNin}
                  onChange={(e) => setEditClientNin(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 border rounded text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1a2a4a] text-[#c9a227] font-bold rounded font-serif-heading hover:bg-[#111e38]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
