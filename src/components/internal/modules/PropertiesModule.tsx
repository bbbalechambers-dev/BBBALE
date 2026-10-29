import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { LocalFilePicker } from '../../common/LocalFilePicker';
import { Building2, UserPlus, Home, Plus, Search, Layers, DollarSign, FileText, CheckCircle2 } from 'lucide-react';
import { Property, PropertyOwner, Tenant, UploadedFileMetadata } from '../../../types';

export const PropertiesModule: React.FC = () => {
  const {
    properties,
    owners,
    tenants,
    addProperty,
    updateProperty,
    deleteProperty,
    addOwner,
    updateOwner,
    deleteOwner,
    addTenant,
    updateTenant,
    deleteTenant,
    activeBranchId,
    branches,
    canAccessBranchData,
    effectiveBranchId,
    currentUser
  } = useApp();

  const isPrincipalPartner = currentUser?.role === 'Principal Partner';
  const isHeadOrAdmin = currentUser?.role === 'Head of Chamber' || currentUser?.role === 'Administrator' || isPrincipalPartner;
  const isAccountOfficer = currentUser?.role === 'Account Officer';

  const [activeTab, setActiveTab] = useState<'hierarchy' | 'properties' | 'owners' | 'tenants'>('hierarchy');
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyError, setPropertyError] = useState<string | null>(null);

  // Intake Modals
  const [showAddPropModal, setShowAddPropModal] = useState(false);
  const [showAddOwnerModal, setShowAddOwnerModal] = useState(false);
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);

  // Edit Modals
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editPropName, setEditPropName] = useState('');
  const [editPropType, setEditPropType] = useState<Property['propertyType']>('Residential');
  const [editPropCity, setEditPropCity] = useState('');
  const [editPropState, setEditPropState] = useState('Lagos');
  const [editPropUnits, setEditPropUnits] = useState(1);
  const [editPropValuation, setEditPropValuation] = useState(0);

  const [editingOwner, setEditingOwner] = useState<PropertyOwner | null>(null);
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editOwnerPhone, setEditOwnerPhone] = useState('');
  const [editOwnerNin, setEditOwnerNin] = useState('');
  const [editOwnerBank, setEditOwnerBank] = useState('');
  const [editOwnerAccount, setEditOwnerAccount] = useState('');

  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editTenantName, setEditTenantName] = useState('');
  const [editTenantEmail, setEditTenantEmail] = useState('');
  const [editTenantPhone, setEditTenantPhone] = useState('');
  const [editTenantUnit, setEditTenantUnit] = useState('');
  const [editTenantRent, setEditTenantRent] = useState(0);
  const [editTenantNextDue, setEditTenantNextDue] = useState('');
  const [editTenantRentStatus, setEditTenantRentStatus] = useState<Tenant['rentPaymentStatus']>('Current');
  const [editTenantStatus, setEditTenantStatus] = useState<Tenant['status']>('Active');

  // Property Form
  const [propName, setPropName] = useState('');
  const [propOwnerId, setPropOwnerId] = useState('');
  const [propType, setPropType] = useState<'Residential' | 'Commercial' | 'Mixed Use' | 'Land'>('Residential');
  const [propCity, setPropCity] = useState('');
  const [propState, setPropState] = useState('Lagos');
  const [propUnits, setPropUnits] = useState(1);
  const [propValuation, setPropValuation] = useState('');
  const [propTitles, setPropTitles] = useState<UploadedFileMetadata[]>([]);

  // Owner Form
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerNin, setOwnerNin] = useState('');
  const [ownerBank, setOwnerBank] = useState('Access Bank');
  const [ownerAccount, setOwnerAccount] = useState('');

  // Tenant Form
  const [tenantName, setTenantName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantPropId, setTenantPropId] = useState('');
  const [tenantUnit, setTenantUnit] = useState('Flat 1A');
  const [tenantRent, setTenantRent] = useState(1500000);
  const [tenantStartDate, setTenantStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [tenantEndDate, setTenantEndDate] = useState('');
  const [tenantNextDue, setTenantNextDue] = useState('');
  const [tenantNin, setTenantNin] = useState('');

  const targetBranchId = effectiveBranchId;

  // Strictly filter lists by branch data isolation
  const branchProperties = properties.filter(p => canAccessBranchData(p.branchId));
  const branchOwners = owners.filter(o => canAccessBranchData(o.branchId));
  const branchTenants = tenants.filter(t => canAccessBranchData(t.branchId));

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    setPropertyError(null);
    if (isAccountOfficer) {
      setPropertyError('Permission Denied: Account Officers cannot intake/register properties. Account officers only manage branch financial activities.');
      return;
    }
    if (!propName || !propOwnerId) return;

    addProperty({
      branchId: targetBranchId,
      ownerId: propOwnerId,
      name: propName.trim(),
      propertyType: propType,
      ownershipType: 'Client-Managed',
      state: propState,
      lga: 'Ikeja',
      city: propCity.trim(),
      streetAddress: propCity.trim(),
      unitsCount: Number(propUnits) || 1,
      currentValuation: Number(propValuation) || 0,
      titleDocuments: propTitles,
      photos: [],
      status: 'Active'
    });

    setShowAddPropModal(false);
    setPropName('');
    setPropCity('');
    setPropTitles([]);
  };

  const handleCreateOwner = (e: React.FormEvent) => {
    e.preventDefault();
    setPropertyError(null);
    if (isAccountOfficer) {
      setPropertyError('Permission Denied: Account Officers cannot intake/register landlords/owners. Account officers only manage branch financial activities.');
      return;
    }
    if (!ownerName || !ownerEmail) return;

    addOwner({
      branchId: targetBranchId,
      fullName: ownerName.trim(),
      type: 'Individual',
      email: ownerEmail.trim(),
      phone: ownerPhone.trim(),
      state: 'Lagos',
      lga: 'Ikeja',
      city: 'Victoria Island',
      streetAddress: 'Plot 10',
      ninOrCac: ownerNin.trim(),
      bankName: ownerBank,
      accountNumber: ownerAccount.trim(),
      accountName: ownerName.trim(),
      kycDocuments: [],
      status: 'Active'
    });

    setShowAddOwnerModal(false);
    setOwnerName('');
    setOwnerEmail('');
    setOwnerPhone('');
    setOwnerAccount('');
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    setPropertyError(null);
    if (isAccountOfficer) {
      setPropertyError('Permission Denied: Account Officers cannot intake/register tenants. Account officers only manage branch financial activities.');
      return;
    }
    if (!tenantName || !tenantPropId) return;

    const prop = properties.find(p => p.id === tenantPropId);
    if (!prop) return;

    addTenant({
      branchId: targetBranchId,
      propertyId: tenantPropId,
      ownerId: prop.ownerId,
      fullName: tenantName.trim(),
      email: tenantEmail.trim(),
      phone: tenantPhone.trim(),
      unitAssigned: tenantUnit.trim(),
      annualRent: Number(tenantRent),
      serviceCharge: 150000,
      cautionDeposit: 100000,
      tenancyStartDate: tenantStartDate,
      tenancyEndDate: tenantEndDate || '2027-10-31',
      nextRentDueDate: tenantNextDue || '2027-10-31',
      rentPaymentStatus: 'Current',
      nin: tenantNin.trim(),
      guarantorName: 'Guarantor on File',
      guarantorPhone: '+234 800 000 0000',
      guarantorAddress: 'Lagos, Nigeria',
      kycDocuments: [],
      status: 'Active'
    });

    setShowAddTenantModal(false);
    setTenantName('');
    setTenantEmail('');
    setTenantPhone('');
  };

  // Open & Save Edit Property Handlers
  const handleOpenEditProperty = (p: Property) => {
    setEditingProperty(p);
    setEditPropName(p.name);
    setEditPropType(p.propertyType);
    setEditPropCity(p.city);
    setEditPropState(p.state);
    setEditPropUnits(p.unitsCount);
    setEditPropValuation(p.currentValuation || 0);
  };

  const handleSaveEditProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    updateProperty(editingProperty.id, {
      name: editPropName.trim(),
      propertyType: editPropType,
      city: editPropCity.trim(),
      state: editPropState,
      unitsCount: Number(editPropUnits),
      currentValuation: Number(editPropValuation)
    });
    setEditingProperty(null);
  };

  // Open & Save Edit Landlord Handlers
  const handleOpenEditOwner = (o: PropertyOwner) => {
    setEditingOwner(o);
    setEditOwnerName(o.fullName);
    setEditOwnerEmail(o.email);
    setEditOwnerPhone(o.phone);
    setEditOwnerNin(o.ninOrCac);
    setEditOwnerBank(o.bankName);
    setEditOwnerAccount(o.accountNumber);
  };

  const handleSaveEditOwner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOwner) return;
    updateOwner(editingOwner.id, {
      fullName: editOwnerName.trim(),
      email: editOwnerEmail.trim(),
      phone: editOwnerPhone.trim(),
      ninOrCac: editOwnerNin.trim(),
      bankName: editOwnerBank.trim(),
      accountNumber: editOwnerAccount.trim()
    });
    setEditingOwner(null);
  };

  // Open & Save Edit Tenant Handlers
  const handleOpenEditTenant = (t: Tenant) => {
    setEditingTenant(t);
    setEditTenantName(t.fullName);
    setEditTenantEmail(t.email);
    setEditTenantPhone(t.phone);
    setEditTenantUnit(t.unitAssigned);
    setEditTenantRent(t.annualRent);
    setEditTenantNextDue(t.nextRentDueDate);
    setEditTenantRentStatus(t.rentPaymentStatus);
    setEditTenantStatus(t.status);
  };

  const handleSaveEditTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    updateTenant(editingTenant.id, {
      fullName: editTenantName.trim(),
      email: editTenantEmail.trim(),
      phone: editTenantPhone.trim(),
      unitAssigned: editTenantUnit.trim(),
      annualRent: Number(editTenantRent),
      nextRentDueDate: editTenantNextDue,
      rentPaymentStatus: editTenantRentStatus,
      status: editTenantStatus
    });
    setEditingTenant(null);
  };

  const handleEjectTenant = (t: Tenant) => {
    if (window.confirm(`Are you sure you want to officially eject tenant "${t.fullName}" from unit ${t.unitAssigned}? This will mark their status as Evicted.`)) {
      updateTenant(t.id, {
        rentPaymentStatus: 'Arrears (90+ days)',
        status: 'Evicted'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-black text-xl text-[#1a2a4a]">
            Property & Tenancy Portfolio
          </h2>
          <p className="text-xs text-[#5a5a5a]">
            Hierarchical Management: Landlord/Owner → Property Asset → Tenant Unit with rent schedules & arrears tracking.
          </p>
        </div>

        {!isAccountOfficer ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddOwnerModal(true)}
              className="px-3 py-1.5 border border-[#1a2a4a] text-[#1a2a4a] hover:bg-gray-100 rounded text-xs font-semibold cursor-pointer"
            >
              + Landlord
            </button>
            <button
              onClick={() => setShowAddPropModal(true)}
              className="px-3 py-1.5 border border-[#1a2a4a] text-[#1a2a4a] hover:bg-gray-100 rounded text-xs font-semibold cursor-pointer"
            >
              + Property
            </button>
            <button
              onClick={() => setShowAddTenantModal(true)}
              className="px-4 py-1.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded text-xs font-bold font-serif-heading cursor-pointer"
            >
              + Tenant
            </button>
          </div>
        ) : (
          <div className="text-xs bg-amber-50 text-amber-800 px-3 py-1.5 rounded border border-amber-200 font-medium">
            Account Officer: Landlord, Property & Tenant intake restricted to Counsel & Leadership
          </div>
        )}
      </div>

      {propertyError && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200 flex items-center justify-between">
          <span>{propertyError}</span>
          <button onClick={() => setPropertyError(null)} className="text-red-900 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Tab Selectors */}
      <div className="flex items-center gap-2 border-b border-[#e0ddd5]">
        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer ${
            activeTab === 'hierarchy' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500'
          }`}
        >
          Hierarchical Tree View (Owner → Property → Tenant)
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer ${
            activeTab === 'properties' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500'
          }`}
        >
          Properties ({branchProperties.length})
        </button>
        <button
          onClick={() => setActiveTab('owners')}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer ${
            activeTab === 'owners' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500'
          }`}
        >
          Landlords / Owners ({branchOwners.length})
        </button>
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer ${
            activeTab === 'tenants' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500'
          }`}
        >
          Tenants & Rent Rolls ({branchTenants.length})
        </button>
      </div>

      {/* Tab 1: Hierarchy Tree View (Section 21.1) */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-4">
          {branchOwners.length > 0 ? (
            branchOwners.map(owner => {
              const ownedProps = branchProperties.filter(p => p.ownerId === owner.id);
              return (
                <div key={owner.id} className="bg-white rounded-lg border border-[#e0ddd5] p-5 shadow-xs space-y-4">
                  {/* Level 1: Owner */}
                  <div className="flex items-center justify-between border-b pb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-[#1a2a4a] text-[#c9a227] px-2 py-0.5 rounded">
                        {owner.code}
                      </span>
                      <span className="font-serif font-bold text-base text-[#1a2a4a]">
                        Landlord: {owner.fullName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 font-mono hidden sm:inline">
                        Remittance Bank: {owner.bankName} ({owner.accountNumber})
                      </span>
                      {isHeadOrAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditOwner(owner)}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Permanently delete Landlord "${owner.fullName}" and all their properties/tenants?`)) {
                                deleteOwner(owner.id);
                              }
                            }}
                            className="px-2 py-0.5 bg-red-50 text-red-700 hover:bg-red-100 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Level 2: Properties under Owner */}
                  <div className="pl-4 sm:pl-6 space-y-4 border-l-2 border-[#c9a227]/40 ml-2">
                    {ownedProps.length > 0 ? (
                      ownedProps.map(prop => {
                        const propTenants = branchTenants.filter(t => t.propertyId === prop.id);
                        return (
                          <div key={prop.id} className="bg-[#f8f6f1] p-4 rounded-lg border border-gray-200 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#c9a227]" />
                                <span className="font-bold text-sm text-[#1a2a4a]">{prop.name}</span>
                                <span className="text-[11px] text-gray-500">({prop.code})</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-gray-600 hidden sm:inline">
                                  {prop.propertyType} · {prop.city}, {prop.state}
                                </span>
                                {isHeadOrAdmin && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleOpenEditProperty(prop)}
                                      className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Permanently delete Property "${prop.name}"?`)) {
                                          deleteProperty(prop.id);
                                        }
                                      }}
                                      className="px-2 py-0.5 bg-red-50 text-red-700 hover:bg-red-100 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Level 3: Tenants in Property */}
                            <div className="pl-4 border-l-2 border-gray-300 ml-2 space-y-2">
                              {propTenants.length > 0 ? (
                                propTenants.map(tenant => (
                                  <div key={tenant.id} className="p-2.5 bg-white rounded border border-gray-200 flex items-center justify-between text-xs flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                      <Home className="w-3.5 h-3.5 text-[#1a2a4a]" />
                                      <span className="font-semibold text-gray-900">{tenant.fullName}</span>
                                      <span className="text-gray-500">({tenant.unitAssigned})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-bold text-[#1a2a4a]">
                                        ₦{tenant.annualRent.toLocaleString()}/yr
                                      </span>
                                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                        tenant.status === 'Evicted'
                                          ? 'bg-red-100 text-red-800'
                                          : tenant.rentPaymentStatus !== 'Current'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-emerald-100 text-emerald-800'
                                      }`}>
                                        {tenant.status === 'Evicted' ? 'Ejected / Evicted' : tenant.rentPaymentStatus}
                                      </span>
                                      {isHeadOrAdmin && (
                                        <div className="flex items-center gap-1 ml-2">
                                          <button
                                            onClick={() => handleOpenEditTenant(tenant)}
                                            className="px-1.5 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                                            title="Edit Tenant"
                                          >
                                            Edit
                                          </button>
                                          {tenant.status !== 'Evicted' && (
                                            <button
                                              onClick={() => handleEjectTenant(tenant)}
                                              className="px-1.5 py-0.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                                              title="Eject Tenant"
                                            >
                                              Eject
                                            </button>
                                          )}
                                          <button
                                            onClick={() => {
                                              if (window.confirm(`Permanently delete Tenant "${tenant.fullName}"?`)) {
                                                deleteTenant(tenant.id);
                                              }
                                            }}
                                            className="px-1.5 py-0.5 bg-red-50 text-red-700 hover:bg-red-100 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                                            title="Delete Tenant"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-gray-400 italic">No tenants currently assigned to this property.</div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-gray-400 italic">No properties registered under this landlord.</div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-[#e0ddd5] space-y-3">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Property Hierarchy Tree is Empty</h3>
              <p className="text-xs text-[#5a5a5a] max-w-md mx-auto">
                Begin by creating a Property Landlord/Owner, then assign properties and tenant leases.
              </p>
              {!isAccountOfficer && (
                <button
                  onClick={() => setShowAddOwnerModal(true)}
                  className="px-5 py-2 bg-[#1a2a4a] text-[#c9a227] rounded text-xs font-bold font-serif-heading cursor-pointer"
                >
                  Register First Landlord
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Properties Table */}
      {activeTab === 'properties' && (
        <div className="bg-white rounded-lg border border-[#e0ddd5] shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1a2a4a] text-white border-b border-[#c9a227] text-[11px] font-mono-code">
                <th className="p-3">Property Code</th>
                <th className="p-3">Property Name</th>
                <th className="p-3">Type & Units</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
                <th className="p-3">Title Deeds</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branchProperties.map(p => (
                <tr key={p.id} className="hover:bg-[#f8f6f1]">
                  <td className="p-3 font-mono font-bold text-[#1a2a4a]">{p.code}</td>
                  <td className="p-3 font-bold text-gray-900">{p.name}</td>
                  <td className="p-3">{p.propertyType} ({p.unitsCount} Units)</td>
                  <td className="p-3">{p.city}, {p.state}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">{p.status}</span></td>
                  <td className="p-3 text-[11px] text-gray-500">{p.titleDocuments.length} Deeds attached</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {isHeadOrAdmin && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditProperty(p)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Permanently delete Property "${p.name}"?`)) {
                              deleteProperty(p.id);
                            }
                          }}
                          className="px-2.5 py-1 bg-red-50 text-red-800 hover:bg-red-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {branchProperties.length === 0 && (
            <div className="text-center py-10 text-xs text-gray-400">No properties recorded.</div>
          )}
        </div>
      )}

      {/* Tab 3: Owners Table */}
      {activeTab === 'owners' && (
        <div className="bg-white rounded-lg border border-[#e0ddd5] shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1a2a4a] text-white border-b border-[#c9a227] text-[11px] font-mono-code">
                <th className="p-3">Owner Code</th>
                <th className="p-3">Name</th>
                <th className="p-3">Contact</th>
                <th className="p-3">NIN/CAC</th>
                <th className="p-3">Settlement Bank</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branchOwners.map(o => (
                <tr key={o.id} className="hover:bg-[#f8f6f1]">
                  <td className="p-3 font-mono font-bold text-[#1a2a4a]">{o.code}</td>
                  <td className="p-3 font-bold text-gray-900">{o.fullName}</td>
                  <td className="p-3">{o.email} · {o.phone}</td>
                  <td className="p-3 font-mono">{o.ninOrCac}</td>
                  <td className="p-3">{o.bankName} ({o.accountNumber})</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {isHeadOrAdmin && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditOwner(o)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Permanently delete Landlord "${o.fullName}" and all their properties/tenants?`)) {
                              deleteOwner(o.id);
                            }
                          }}
                          className="px-2.5 py-1 bg-red-50 text-red-800 hover:bg-red-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {branchOwners.length === 0 && (
            <div className="text-center py-10 text-xs text-gray-400">No landlords registered.</div>
          )}
        </div>
      )}

      {/* Tab 4: Tenants & Rent Roll Table */}
      {activeTab === 'tenants' && (
        <div className="bg-white rounded-lg border border-[#e0ddd5] shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1a2a4a] text-white border-b border-[#c9a227] text-[11px] font-mono-code">
                <th className="p-3">Tenant Code</th>
                <th className="p-3">Tenant Name</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Annual Rent</th>
                <th className="p-3">Next Due Date</th>
                <th className="p-3">Standing</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branchTenants.map(t => (
                <tr key={t.id} className="hover:bg-[#f8f6f1]">
                  <td className="p-3 font-mono font-bold text-[#1a2a4a]">{t.code}</td>
                  <td className="p-3 font-bold text-gray-900">{t.fullName}</td>
                  <td className="p-3">{t.unitAssigned}</td>
                  <td className="p-3 font-mono font-bold text-[#1a2a4a]">₦{t.annualRent.toLocaleString()}</td>
                  <td className="p-3 font-mono">{t.nextRentDueDate}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'Evicted'
                        ? 'bg-red-100 text-red-800'
                        : t.rentPaymentStatus !== 'Current'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {t.status === 'Evicted' ? 'Ejected / Evicted' : t.rentPaymentStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {isHeadOrAdmin && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditTenant(t)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        {t.status !== 'Evicted' && (
                          <button
                            onClick={() => handleEjectTenant(t)}
                            className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Eject
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(`Permanently delete Tenant "${t.fullName}"?`)) {
                              deleteTenant(t.id);
                            }
                          }}
                          className="px-2.5 py-1 bg-red-50 text-red-800 hover:bg-red-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {branchTenants.length === 0 && (
            <div className="text-center py-10 text-xs text-gray-400">No tenants registered.</div>
          )}
        </div>
      )}

      {/* Modal: Add Property */}
      {showAddPropModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Register Property</h3>
              <button onClick={() => setShowAddPropModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateProperty} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Landlord / Owner *</label>
                <select
                  required
                  value={propOwnerId}
                  onChange={(e) => setPropOwnerId(e.target.value)}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                >
                  <option value="">-- Select Landlord --</option>
                  {branchOwners.map(o => (
                    <option key={o.id} value={o.id}>{o.fullName} ({o.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Property Name / Estate *</label>
                <input
                  type="text"
                  required
                  value={propName}
                  onChange={(e) => setPropName(e.target.value)}
                  placeholder="e.g. Admiralty Crown Court"
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={propCity}
                    onChange={(e) => setPropCity(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Units Count</label>
                  <input
                    type="number"
                    min={1}
                    value={propUnits}
                    onChange={(e) => setPropUnits(Number(e.target.value))}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              {/* Local File Picker for Property Title Deeds (Section 20) */}
              <div>
                <label className="block font-semibold mb-1">Upload Title Deeds (Deed, C of O) from Device</label>
                <LocalFilePicker
                  label="Choose Title Deeds (Device Picker)"
                  multiple
                  maxSizeMb={30}
                  currentFiles={propTitles}
                  onUploadComplete={(files) => setPropTitles(prev => [...prev, ...files])}
                  onRemoveFile={(id) => setPropTitles(prev => prev.filter(f => f.id !== id))}
                  compact
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowAddPropModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded">Save Property</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Owner */}
      {showAddOwnerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Register Landlord / Owner</h3>
              <button onClick={() => setShowAddOwnerModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateOwner} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={ownerBank}
                    onChange={(e) => setOwnerBank(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Account Number (NUBAN)</label>
                  <input
                    type="text"
                    value={ownerAccount}
                    onChange={(e) => setOwnerAccount(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowAddOwnerModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded">Save Landlord</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Tenant */}
      {showAddTenantModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Register Tenant Lease</h3>
              <button onClick={() => setShowAddTenantModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateTenant} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Property *</label>
                <select
                  required
                  value={tenantPropId}
                  onChange={(e) => setTenantPropId(e.target.value)}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                >
                  <option value="">-- Select Property --</option>
                  {branchProperties.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tenant Full Name *</label>
                  <input
                    type="text"
                    required
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Unit Assigned *</label>
                  <input
                    type="text"
                    required
                    value={tenantUnit}
                    onChange={(e) => setTenantUnit(e.target.value)}
                    placeholder="e.g. Suite 4 / Flat 2"
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Annual Rent (₦) *</label>
                  <input
                    type="number"
                    required
                    value={tenantRent}
                    onChange={(e) => setTenantRent(Number(e.target.value))}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowAddTenantModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded">Save Tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Property */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between border-b pb-2">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Edit Property Details</h3>
                <span className="text-[10px] font-mono text-[#c9a227] font-semibold">{editingProperty.code}</span>
              </div>
              <button onClick={() => setEditingProperty(null)} className="text-gray-500 hover:text-black">✕</button>
            </div>
            <form onSubmit={handleSaveEditProperty} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Property Name / Estate *</label>
                <input
                  type="text"
                  required
                  value={editPropName}
                  onChange={(e) => setEditPropName(e.target.value)}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Property Type</label>
                  <select
                    value={editPropType}
                    onChange={(e) => setEditPropType(e.target.value as any)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Mixed Use">Mixed Use</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Land">Land</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Units Count</label>
                  <input
                    type="number"
                    min={1}
                    value={editPropUnits}
                    onChange={(e) => setEditPropUnits(Number(e.target.value))}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">City / Town</label>
                  <input
                    type="text"
                    required
                    value={editPropCity}
                    onChange={(e) => setEditPropCity(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={editPropState}
                    onChange={(e) => setEditPropState(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Estimated Asset Valuation (₦)</label>
                <input
                  type="number"
                  value={editPropValuation}
                  onChange={(e) => setEditPropValuation(Number(e.target.value))}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setEditingProperty(null)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Landlord / Owner */}
      {editingOwner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between border-b pb-2">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Edit Landlord Information</h3>
                <span className="text-[10px] font-mono text-[#c9a227] font-semibold">{editingOwner.code}</span>
              </div>
              <button onClick={() => setEditingOwner(null)} className="text-gray-500 hover:text-black">✕</button>
            </div>
            <form onSubmit={handleSaveEditOwner} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={editOwnerName}
                  onChange={(e) => setEditOwnerName(e.target.value)}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={editOwnerEmail}
                    onChange={(e) => setEditOwnerEmail(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={editOwnerPhone}
                    onChange={(e) => setEditOwnerPhone(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">NIN or CAC Registration</label>
                <input
                  type="text"
                  value={editOwnerNin}
                  onChange={(e) => setEditOwnerNin(e.target.value)}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Remittance Bank</label>
                  <input
                    type="text"
                    value={editOwnerBank}
                    onChange={(e) => setEditOwnerBank(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Account Number (NUBAN)</label>
                  <input
                    type="text"
                    value={editOwnerAccount}
                    onChange={(e) => setEditOwnerAccount(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setEditingOwner(null)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Tenant */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between border-b pb-2">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Edit Tenant Lease</h3>
                <span className="text-[10px] font-mono text-[#c9a227] font-semibold">{editingTenant.code}</span>
              </div>
              <button onClick={() => setEditingTenant(null)} className="text-gray-500 hover:text-black">✕</button>
            </div>
            <form onSubmit={handleSaveEditTenant} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Tenant Full Name *</label>
                <input
                  type="text"
                  required
                  value={editTenantName}
                  onChange={(e) => setEditTenantName(e.target.value)}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Unit Assigned *</label>
                  <input
                    type="text"
                    required
                    value={editTenantUnit}
                    onChange={(e) => setEditTenantUnit(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Annual Rent (₦) *</label>
                  <input
                    type="number"
                    required
                    value={editTenantRent}
                    onChange={(e) => setEditTenantRent(Number(e.target.value))}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={editTenantEmail}
                    onChange={(e) => setEditTenantEmail(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editTenantPhone}
                    onChange={(e) => setEditTenantPhone(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Next Rent Due Date</label>
                  <input
                    type="date"
                    value={editTenantNextDue}
                    onChange={(e) => setEditTenantNextDue(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Rent Payment Standing</label>
                  <select
                    value={editTenantRentStatus}
                    onChange={(e) => setEditTenantRentStatus(e.target.value as Tenant['rentPaymentStatus'])}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  >
                    <option value="Current">Current</option>
                    <option value="Arrears (1-30 days)">Arrears (1-30 days)</option>
                    <option value="Arrears (31-60 days)">Arrears (31-60 days)</option>
                    <option value="Arrears (61-90 days)">Arrears (61-90 days)</option>
                    <option value="Arrears (90+ days)">Arrears (90+ days)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Lease Status</label>
                <select
                  value={editTenantStatus}
                  onChange={(e) => setEditTenantStatus(e.target.value as Tenant['status'])}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                >
                  <option value="Active">Active</option>
                  <option value="Vacated">Vacated</option>
                  <option value="Evicted">Evicted / Ejected</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setEditingTenant(null)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
