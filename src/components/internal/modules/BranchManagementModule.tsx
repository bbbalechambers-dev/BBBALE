import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { LocalFilePicker } from '../../common/LocalFilePicker';
import { NIGERIAN_STATES, getLgasForState } from '../../../data/nigeriaGeo';
import {
  Building2,
  Plus,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Trash2,
  Edit3,
  PauseCircle,
  PlayCircle,
  Users,
  UserPlus,
  UserCheck,
  Key,
  X,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Branch, User, Role, UploadedFileMetadata } from '../../../types';

export const BranchManagementModule: React.FC = () => {
  const {
    branches,
    users,
    addBranch,
    updateBranch,
    suspendBranch,
    reactivateBranch,
    deleteBranch,
    addUser,
    updateUser,
    deleteUser,
    checkBranchRoleQuota,
    currentUser
  } = useApp();

  const isPrincipalPartner = currentUser?.role === 'Principal Partner';

  // Branch Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModalBranch, setEditModalBranch] = useState<Branch | null>(null);
  const [deleteModalBranch, setDeleteModalBranch] = useState<Branch | null>(null);
  const [suspendModalBranch, setSuspendModalBranch] = useState<Branch | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  // User Modals within Branch
  const [addUserBranchId, setAddUserBranchId] = useState<string | null>(null);
  const [addUserRolePreset, setAddUserRolePreset] = useState<Role>('Counsel');
  const [editModalUser, setEditModalUser] = useState<User | null>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null);

  // Branch Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('Lagos');
  const [lga, setLga] = useState('Ikeja');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('+234 803 000 0000');
  const [email, setEmail] = useState('lagos@bbbaleandco.ng');
  const [whatsapp, setWhatsapp] = useState('+234 803 000 0000');
  const [officeHours, setOfficeHours] = useState('8:00 AM – 6:00 PM (Mon – Fri)');
  const [rcNumber, setRcNumber] = useState('RC-1092837');
  const [vatNumber, setVatNumber] = useState('VAT-LAG-001');
  const [annualBudget, setAnnualBudget] = useState(50000000);
  const [pettyCashLimit, setPettyCashLimit] = useState(250000);
  const [logoFile, setLogoFile] = useState<UploadedFileMetadata | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // User Form State
  const [userFullName, setUserFullName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState<Role>('Counsel');
  const [userPassword, setUserPassword] = useState('Admin@2026');
  const [userNin, setUserNin] = useState('');
  const [userStatus, setUserStatus] = useState<'Active' | 'Suspended'>('Active');
  const [userError, setUserError] = useState<string | null>(null);

  const lgas = getLgasForState(state);

  // Open Edit Branch Modal
  const openEditBranch = (branch: Branch) => {
    setEditModalBranch(branch);
    setName(branch.name);
    setCode(branch.code);
    setAddress(branch.address);
    setState(branch.state);
    setLga(branch.lga);
    setCity(branch.city);
    setPhone(branch.phone);
    setEmail(branch.email);
    setWhatsapp(branch.whatsapp);
    setOfficeHours(branch.officeHours);
    setRcNumber(branch.rcNumber);
    setVatNumber(branch.vatNumber);
    setAnnualBudget(branch.annualBudget);
    setPettyCashLimit(branch.pettyCashLimit);
    setLogoFile(branch.logoUrl ? { dataUrl: branch.logoUrl } as any : null);
    setFormError(null);
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim() || !code.trim()) {
      setFormError('Branch name and prefix code are required.');
      return;
    }

    try {
      addBranch({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        address: address.trim(),
        state,
        lga: lga || lgas[0] || 'Ikeja',
        city: city.trim() || 'Central',
        phone: phone.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        officeHours,
        rcNumber,
        vatNumber,
        annualBudget: Number(annualBudget),
        pettyCashLimit: Number(pettyCashLimit),
        logoUrl: logoFile?.dataUrl,
        status: 'Active'
      });

      setShowAddModal(false);
      resetBranchForm();
    } catch (err: any) {
      setFormError(err.message || 'Failed to inaugurate branch.');
    }
  };

  const handleUpdateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalBranch) return;
    setFormError(null);

    updateBranch(editModalBranch.id, {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      address: address.trim(),
      state,
      lga: lga || lgas[0] || 'Ikeja',
      city: city.trim() || 'Central',
      phone: phone.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      officeHours,
      rcNumber,
      vatNumber,
      annualBudget: Number(annualBudget),
      pettyCashLimit: Number(pettyCashLimit),
      ...(logoFile?.dataUrl ? { logoUrl: logoFile.dataUrl } : {})
    });

    setEditModalBranch(null);
    resetBranchForm();
  };

  const handleConfirmPermanentDeleteBranch = () => {
    if (!deleteModalBranch) return;
    deleteBranch(deleteModalBranch.id);
    setDeleteModalBranch(null);
  };

  const handleConfirmSuspend = () => {
    if (!suspendModalBranch || !suspendReason.trim()) return;
    suspendBranch(suspendModalBranch.id, suspendReason.trim());
    setSuspendModalBranch(null);
    setSuspendReason('');
  };

  const resetBranchForm = () => {
    setName('');
    setCode('');
    setAddress('');
    setCity('');
    setLogoFile(null);
    setFormError(null);
  };

  // User Management Handlers
  const openAddUser = (branchId: string, rolePreset: Role = 'Counsel') => {
    setAddUserBranchId(branchId);
    setAddUserRolePreset(rolePreset);
    setUserRole(rolePreset);
    setUserFullName('');
    setUserUsername('');
    setUserEmail('');
    setUserPhone('+234 803 000 0000');
    setUserPassword('Admin@2026');
    setUserNin('');
    setUserStatus('Active');
    setUserError(null);
  };

  const openEditUser = (u: User) => {
    setEditModalUser(u);
    setUserFullName(u.fullName);
    setUserUsername(u.username);
    setUserEmail(u.email);
    setUserPhone(u.phone);
    setUserRole(u.role);
    setUserNin(u.nin || '');
    setUserStatus((u.status === 'Suspended' ? 'Suspended' : 'Active') as any);
    setUserPassword('');
    setUserError(null);
  };

  const handleSaveNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUserBranchId) return;
    setUserError(null);

    const quota = checkBranchRoleQuota(addUserBranchId, userRole);
    if (!quota.allowed) {
      setUserError(quota.reason || 'Quota exceeded for this role.');
      return;
    }

    try {
      addUser({
        fullName: userFullName.trim(),
        username: userUsername.trim().toLowerCase(),
        email: userEmail.trim().toLowerCase(),
        phone: userPhone.trim(),
        role: userRole,
        branchId: addUserBranchId,
        status: userStatus,
        isDefaultPassword: true,
        password: userPassword || 'Admin@2026',
        nin: userNin.trim() || undefined
      });

      setAddUserBranchId(null);
    } catch (err: any) {
      setUserError(err.message || 'Failed to create branch user.');
    }
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser) return;
    setUserError(null);

    const updates: Partial<User> = {
      fullName: userFullName.trim(),
      username: userUsername.trim().toLowerCase(),
      email: userEmail.trim().toLowerCase(),
      phone: userPhone.trim(),
      role: userRole,
      status: userStatus,
      nin: userNin.trim() || undefined
    };

    if (userPassword && userPassword.trim()) {
      updates.password = userPassword.trim();
      updates.isDefaultPassword = false;
    }

    // Role quota validation if role changed
    if (userRole !== editModalUser.role) {
      const quota = checkBranchRoleQuota(editModalUser.branchId, userRole, editModalUser.id);
      if (!quota.allowed) {
        setUserError(quota.reason || 'Quota exceeded for this role.');
        return;
      }
    }

    updateUser(editModalUser.id, updates);
    setEditModalUser(null);
  };

  const handleConfirmDeleteUser = () => {
    if (!deleteModalUser) return;
    deleteUser(deleteModalUser.id);
    setDeleteModalUser(null);
  };

  if (!isPrincipalPartner) {
    return (
      <div className="p-8 bg-white rounded-xl border border-red-200 text-center space-y-3 max-w-xl mx-auto my-12">
        <Lock className="w-12 h-12 text-red-600 mx-auto" />
        <h3 className="font-serif font-bold text-lg text-red-900">Restricted Principal Partner Authority</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          Statutory Rule: Only the <strong>Principal Partner</strong> possesses statutory authority to create, edit, suspend, reactivate, or permanently delete firm branches and reallocate chamber divisions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#e0ddd5] shadow-xs">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#c9a227] font-bold font-mono uppercase">
            <Shield className="w-4 h-4" />
            <span>High Authority Exclusive Module · Principal Partner Only</span>
          </div>
          <h2 className="font-serif font-black text-2xl text-[#1a2a4a] mt-0.5">
            Branch Network & Division Management
          </h2>
          <p className="text-xs text-[#5a5a5a] max-w-2xl">
            Autonomous Chambers branch divisions, operational budget ceilings, permanent branch controls, and strict branch staff quota enforcement (1 Head of Chamber, 1 Administrator/Secretary, 1 Account Officer, Unlimited Counsel).
          </p>
        </div>

        <button
          onClick={() => {
            resetBranchForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded-md font-bold text-xs shadow-sm font-serif-heading cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Inaugurate New Branch</span>
        </button>
      </div>

      {/* Statutory Role Quota Summary Notice */}
      <div className="bg-[#1a2a4a]/5 border border-[#c9a227]/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1a2a4a] text-[#c9a227] flex items-center justify-center font-bold flex-shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#1a2a4a] block">Statutory Branch User Quota Rules:</span>
            <span className="text-gray-600">
              Each branch allows <strong>1 Head of Chamber</strong>, <strong>1 Administrator/Secretary</strong>, <strong>1 Account Officer</strong>. <strong>Counsel & Staff</strong> are unlimited. All users can be edited or deleted.
            </span>
          </div>
        </div>
        <div className="font-mono text-[11px] bg-white px-3 py-1.5 rounded border border-[#e0ddd5] text-gray-700 font-bold whitespace-nowrap">
          Total Branches: {branches.length}
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {branches.map(branch => {
          const branchUsers = users.filter(u => u.branchId === branch.id);
          const headUser = branchUsers.find(u => u.role === 'Head of Chamber');
          const adminUser = branchUsers.find(u => u.role === 'Administrator');
          const accountUser = branchUsers.find(u => u.role === 'Account Officer');
          const counselUsers = branchUsers.filter(u => u.role === 'Counsel' || u.role === 'Public Visitor');

          return (
            <div
              key={branch.id}
              className={`bg-white rounded-xl border shadow-xs p-5 space-y-4 flex flex-col justify-between transition-all ${
                branch.status === 'Suspended' ? 'border-red-300 bg-red-50/20' : 'border-[#e0ddd5]'
              }`}
            >
              {/* Branch Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-[#1a2a4a] text-[#c9a227] px-2.5 py-0.5 rounded">
                      {branch.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        branch.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {branch.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">
                    ID: {branch.id}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1a2a4a]">{branch.name}</h3>
                  <p className="text-xs text-gray-600 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#c9a227] flex-shrink-0 mt-0.5" />
                    <span>{branch.address}, {branch.city}, {branch.state} State ({branch.lga} LGA)</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 font-mono bg-[#f8f6f1] p-3 rounded-lg border border-[#e0ddd5]">
                  <div>Tel: <span className="font-semibold text-gray-800">{branch.phone}</span></div>
                  <div>WhatsApp: <span className="font-semibold text-gray-800">{branch.whatsapp}</span></div>
                  <div>Budget: <span className="font-semibold text-gray-800">₦{branch.annualBudget.toLocaleString()}</span></div>
                  <div>Petty Cash: <span className="font-semibold text-gray-800">₦{branch.pettyCashLimit.toLocaleString()}</span></div>
                </div>

                {branch.status === 'Suspended' && branch.suspensionReason && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded text-[11px] text-red-800">
                    <strong>Suspension Reason:</strong> {branch.suspensionReason}
                  </div>
                )}

                {/* Statutory Branch Staff Quotas Section */}
                <div className="pt-2 border-t border-gray-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-xs text-[#1a2a4a] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#c9a227]" />
                      <span>Branch Staff & Role Quotas</span>
                    </span>
                    <button
                      onClick={() => openAddUser(branch.id, 'Counsel')}
                      className="text-[11px] text-[#1a2a4a] hover:text-[#c9a227] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add User</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {/* Head of Chamber (Max 1) */}
                    <div className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1a2a4a]">Head of Chamber</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                            headUser ? 'bg-amber-100 text-amber-900' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {headUser ? '1/1 (Full)' : '0/1 (Vacant)'}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-600 mt-0.5">
                          {headUser ? (
                            <span>{headUser.fullName} (@{headUser.username})</span>
                          ) : (
                            <span className="italic text-gray-400">No Head assigned yet</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {headUser ? (
                          <>
                            <button
                              onClick={() => openEditUser(headUser)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                              title="Edit Head of Chamber"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteModalUser(headUser)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              title="Delete Head of Chamber"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => openAddUser(branch.id, 'Head of Chamber')}
                            className="px-2 py-0.5 bg-[#1a2a4a] text-white rounded text-[10px] font-bold hover:bg-[#111e38] cursor-pointer"
                          >
                            + Assign
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Administrator / Secretary (Max 1) */}
                    <div className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1a2a4a]">Administrator / Secretary</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                            adminUser ? 'bg-amber-100 text-amber-900' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {adminUser ? '1/1 (Full)' : '0/1 (Vacant)'}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-600 mt-0.5">
                          {adminUser ? (
                            <span>{adminUser.fullName} (@{adminUser.username})</span>
                          ) : (
                            <span className="italic text-gray-400">No Administrator assigned yet</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {adminUser ? (
                          <>
                            <button
                              onClick={() => openEditUser(adminUser)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                              title="Edit Administrator"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteModalUser(adminUser)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              title="Delete Administrator"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => openAddUser(branch.id, 'Administrator')}
                            className="px-2 py-0.5 bg-[#1a2a4a] text-white rounded text-[10px] font-bold hover:bg-[#111e38] cursor-pointer"
                          >
                            + Assign
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Account Officer (Max 1) */}
                    <div className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1a2a4a]">Account Officer</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                            accountUser ? 'bg-amber-100 text-amber-900' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {accountUser ? '1/1 (Full)' : '0/1 (Vacant)'}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-600 mt-0.5">
                          {accountUser ? (
                            <span>{accountUser.fullName} (@{accountUser.username})</span>
                          ) : (
                            <span className="italic text-gray-400">No Account Officer assigned yet</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {accountUser ? (
                          <>
                            <button
                              onClick={() => openEditUser(accountUser)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                              title="Edit Account Officer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteModalUser(accountUser)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              title="Delete Account Officer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => openAddUser(branch.id, 'Account Officer')}
                            className="px-2 py-0.5 bg-[#1a2a4a] text-white rounded text-[10px] font-bold hover:bg-[#111e38] cursor-pointer"
                          >
                            + Assign
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Counsel / Legal Staff (Unlimited) */}
                    <div className="p-2 rounded bg-gray-50 border border-gray-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1a2a4a]">Counsel & Legal Staff</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono">
                            {counselUsers.length} (Unlimited)
                          </span>
                        </div>
                        <button
                          onClick={() => openAddUser(branch.id, 'Counsel')}
                          className="px-2 py-0.5 bg-[#1a2a4a] text-white rounded text-[10px] font-bold hover:bg-[#111e38] cursor-pointer"
                        >
                          + Add Counsel
                        </button>
                      </div>

                      {counselUsers.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {counselUsers.map(c => (
                            <div key={c.id} className="flex items-center justify-between py-1 text-[11px]">
                              <span className="text-gray-700">{c.fullName} (@{c.username})</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEditUser(c)}
                                  className="p-0.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                  title="Edit Counsel"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setDeleteModalUser(c)}
                                  className="p-0.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                  title="Delete Counsel"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-400 italic">No counsel accounts created yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Principal Partner Action Buttons */}
              <div className="pt-3 border-t flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditBranch(branch)}
                    className="px-2.5 py-1 text-[#1a2a4a] hover:bg-[#1a2a4a]/10 border border-[#1a2a4a]/30 rounded font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#c9a227]" />
                    <span>Edit Branch</span>
                  </button>

                  {branch.status === 'Active' ? (
                    <button
                      onClick={() => setSuspendModalBranch(branch)}
                      className="px-2.5 py-1 text-red-700 hover:bg-red-50 border border-red-200 rounded font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>Suspend</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => reactivateBranch(branch.id)}
                      className="px-2.5 py-1 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Reactivate</span>
                    </button>
                  )}
                </div>

                {/* Permanent Deletion Button - Principal Partner Only */}
                <button
                  onClick={() => setDeleteModalBranch(branch)}
                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Permanent Deletion"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#c9a227]" />
                <h3 className="font-serif font-bold text-lg text-[#1a2a4a]">Inaugurate New Chambers Branch Division</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBranch} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Branch Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Benin City Branch (Energy & Maritime Practice)"
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Branch Prefix Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. BBB-BEN"
                    className="w-full p-2.5 rounded border border-[#e0ddd5] font-mono focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700">Street Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Plot 18, Airport Road, GRA"
                  className="w-full p-2.5 rounded border border-[#e0ddd5]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">State *</label>
                  <select
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      const stateLgas = getLgasForState(e.target.value);
                      setLga(stateLgas[0] || '');
                    }}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                  >
                    {NIGERIAN_STATES.map(s => (
                      <option key={s.state} value={s.state}>{s.state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">LGA *</label>
                  <select
                    value={lga}
                    onChange={(e) => setLga(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                  >
                    {lgas.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">City / District *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Benin City"
                    className="w-full p-2.5 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Office Telephone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">WhatsApp Helpline</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Branch Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Annual Operational Budget (₦)</label>
                  <input
                    type="number"
                    value={annualBudget}
                    onChange={(e) => setAnnualBudget(Number(e.target.value))}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Petty Cash Ceiling (₦)</label>
                  <input
                    type="number"
                    value={pettyCashLimit}
                    onChange={(e) => setPettyCashLimit(Number(e.target.value))}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700">Branch Emblem / Seal (Local File Upload)</label>
                <LocalFilePicker
                  label="Choose Branch Logo from Device"
                  maxSizeMb={5}
                  accept=".jpg,.jpeg,.png,.webp"
                  compact
                  onUploadComplete={(files) => {
                    if (files.length > 0) setLogoFile(files[0]);
                  }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded font-serif-heading hover:bg-[#111e38] cursor-pointer"
                >
                  Inaugurate Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Branch Modal (Principal Partner Only) */}
      {editModalBranch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#c9a227]" />
                <h3 className="font-serif font-bold text-lg text-[#1a2a4a]">
                  Edit Branch Division: {editModalBranch.name}
                </h3>
              </div>
              <button onClick={() => setEditModalBranch(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateBranch} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Branch Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Branch Prefix Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] font-mono focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700">Street Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">State *</label>
                  <select
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      const stateLgas = getLgasForState(e.target.value);
                      setLga(stateLgas[0] || '');
                    }}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                  >
                    {NIGERIAN_STATES.map(s => (
                      <option key={s.state} value={s.state}>{s.state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">LGA *</label>
                  <select
                    value={lga}
                    onChange={(e) => setLga(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                  >
                    {lgas.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">City / District *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Office Telephone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">WhatsApp Helpline</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Branch Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Annual Operational Budget (₦)</label>
                  <input
                    type="number"
                    value={annualBudget}
                    onChange={(e) => setAnnualBudget(Number(e.target.value))}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Petty Cash Ceiling (₦)</label>
                  <input
                    type="number"
                    value={pettyCashLimit}
                    onChange={(e) => setPettyCashLimit(Number(e.target.value))}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditModalBranch(null)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded font-serif-heading hover:bg-[#111e38] cursor-pointer"
                >
                  Save Branch Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permanent Branch Deletion Confirmation Modal */}
      {deleteModalBranch && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-red-400 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-serif font-black text-lg">Permanent Branch Deletion</h3>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-900 leading-relaxed space-y-2">
              <p>
                <strong>CRITICAL NOTICE:</strong> You are about to permanently delete branch division:
              </p>
              <div className="font-bold text-sm bg-white p-2 rounded border border-red-200 font-mono">
                {deleteModalBranch.name} ({deleteModalBranch.code})
              </div>
              <p>
                Under Section 11 of Chambers regulations, only the <strong>Principal Partner</strong> can execute permanent branch deletions. This action will purge this branch division registry permanently across all connected devices and central cloud backups.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setDeleteModalBranch(null)}
                className="px-4 py-2 border rounded text-xs text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPermanentDeleteBranch}
                className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded text-xs shadow cursor-pointer font-serif-heading"
              >
                Yes, Delete Branch Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Branch Modal */}
      {suspendModalBranch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-red-300 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-serif font-bold text-base">Suspend Branch Division</h3>
            </div>
            <p className="text-xs text-gray-600">
              Suspending <strong>{suspendModalBranch.name}</strong> will freeze staff logins and consultation bookings for this location.
            </p>
            <div>
              <label className="block text-xs font-semibold mb-1">Mandatory Suspension Justification *</label>
              <textarea
                rows={3}
                required
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="State administrative or compliance reason..."
                className="w-full text-xs p-2 rounded border border-gray-300"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setSuspendModalBranch(null)} className="px-3 py-1.5 border rounded text-xs cursor-pointer">
                Cancel
              </button>
              <button onClick={handleConfirmSuspend} className="px-5 py-1.5 bg-red-700 text-white rounded text-xs font-bold cursor-pointer">
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User to Branch Modal (with Quota Enforcement) */}
      {addUserBranchId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#c9a227]" />
                <h3 className="font-serif font-bold text-base text-[#1a2a4a]">
                  Create Chambers User Account ({branches.find(b => b.id === addUserBranchId)?.code})
                </h3>
              </div>
              <button onClick={() => setAddUserBranchId(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {userError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{userError}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-gray-700">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={userFullName}
                  onChange={(e) => setUserFullName(e.target.value)}
                  placeholder="e.g. Barr. Emeka Okafor, LL.M"
                  className="w-full p-2.5 rounded border border-[#e0ddd5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Username *</label>
                  <input
                    type="text"
                    required
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                    placeholder="e.g. emeka.counsel"
                    className="w-full p-2.5 rounded border border-[#e0ddd5] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Assigned Role *</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as Role)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white font-semibold"
                  >
                    <option value="Head of Chamber">Head of Chamber (Max 1 per branch)</option>
                    <option value="Administrator">Administrator / Secretary (Max 1 per branch)</option>
                    <option value="Account Officer">Account Officer (Max 1 per branch)</option>
                    <option value="Counsel">Counsel & Staff (Unlimited)</option>
                  </select>
                </div>
              </div>

              {/* Quota Status Indicator */}
              <div className="p-2.5 rounded bg-gray-50 border text-[11px] leading-tight">
                {(() => {
                  const quota = checkBranchRoleQuota(addUserBranchId, userRole);
                  if (!quota.allowed) {
                    return (
                      <span className="text-red-700 font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{quota.reason}</span>
                      </span>
                    );
                  }
                  return (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Role slot available for this branch ({userRole === 'Counsel' ? 'Unlimited' : 'Max 1'}).</span>
                    </span>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="user@bbbaleandco.ng"
                    className="w-full p-2.5 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Initial Password *</label>
                  <input
                    type="text"
                    required
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] font-mono"
                  />
                  <span className="text-[10px] text-gray-400">User will be prompted to change upon first login.</span>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">NIN / Supreme Court Enrolment No.</label>
                  <input
                    type="text"
                    value={userNin}
                    onChange={(e) => setUserNin(e.target.value)}
                    placeholder="SCN-109281"
                    className="w-full p-2.5 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setAddUserBranchId(null)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded font-serif-heading hover:bg-[#111e38] cursor-pointer"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal (All roles can be edited) */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#c9a227]" />
                <h3 className="font-serif font-bold text-base text-[#1a2a4a]">
                  Edit User Account: {editModalUser.fullName}
                </h3>
              </div>
              <button onClick={() => setEditModalUser(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {userError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{userError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-gray-700">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={userFullName}
                  onChange={(e) => setUserFullName(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Username *</label>
                  <input
                    type="text"
                    required
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Role *</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as Role)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white font-semibold"
                  >
                    <option value="Head of Chamber">Head of Chamber (Max 1 per branch)</option>
                    <option value="Administrator">Administrator / Secretary (Max 1 per branch)</option>
                    <option value="Account Officer">Account Officer (Max 1 per branch)</option>
                    <option value="Counsel">Counsel & Staff (Unlimited)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Reset Password (Leave blank to keep)</label>
                  <input
                    type="text"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="New password..."
                    className="w-full p-2.5 rounded border border-[#e0ddd5] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Account Status</label>
                  <select
                    value={userStatus}
                    onChange={(e) => setUserStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded font-serif-heading hover:bg-[#111e38] cursor-pointer"
                >
                  Save User Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-red-400 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-serif font-black text-lg">Permanently Delete User</h3>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-900 leading-relaxed space-y-2">
              <p>
                Are you sure you want to permanently delete this user account?
              </p>
              <div className="font-bold text-sm bg-white p-2 rounded border border-red-200 font-mono">
                {deleteModalUser.fullName} ({deleteModalUser.role}) · @{deleteModalUser.username}
              </div>
              <p>
                This account will be permanently purged from Chambers credentials and synchronized across all devices.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setDeleteModalUser(null)}
                className="px-4 py-2 border rounded text-xs text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded text-xs shadow cursor-pointer font-serif-heading"
              >
                Yes, Delete User Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
