import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Users,
  DollarSign,
  Calendar,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  FileText,
  Shield,
  Edit3,
  Trash2,
  UserPlus,
  Key,
  X,
  Lock,
  UserCheck
} from 'lucide-react';
import { StaffRecord, PayrollRun, BranchExpense, InternalRequest, User, Role } from '../../../types';

export const StaffPayrollExpensesModule: React.FC = () => {
  const {
    staff,
    payrolls,
    expenses,
    requests,
    users,
    addStaff,
    addPayroll,
    updatePayroll,
    addExpense,
    updateExpense,
    deleteExpense,
    addRequest,
    updateRequest,
    addUser,
    updateUser,
    deleteUser,
    checkBranchRoleQuota,
    canAccessBranchData,
    effectiveBranchId,
    currentUser,
    activeBranchId,
    branches
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'staff' | 'payroll' | 'expenses' | 'requests'>('users');

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editModalUser, setEditModalUser] = useState<User | null>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null);

  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddRequestModal, setShowAddRequestModal] = useState(false);
  const [showRunPayrollModal, setShowRunPayrollModal] = useState(false);
  const [payrollError, setPayrollError] = useState<string | null>(null);

  // User Form State
  const [userFullName, setUserFullName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('+234 803 000 0000');
  const [userRole, setUserRole] = useState<Role>('Counsel');
  const [userBranchId, setUserBranchId] = useState<string>(effectiveBranchId);
  const [userPassword, setUserPassword] = useState('Admin@2026');
  const [userNin, setUserNin] = useState('');
  const [userStatus, setUserStatus] = useState<'Active' | 'Suspended'>('Active');
  const [userError, setUserError] = useState<string | null>(null);

  // Staff Form
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('Senior Associate Counsel');
  const [staffDept, setStaffDept] = useState<'Legal' | 'Administration' | 'Finance' | 'Real Estate'>('Legal');
  const [basicSalary, setBasicSalary] = useState(450000);
  const [staffTin, setStaffTin] = useState('');
  const [staffPensionPin, setStaffPensionPin] = useState('');
  const [staffBank, setStaffBank] = useState('Zenith Bank');
  const [staffAccount, setStaffAccount] = useState('');

  // Expense Form
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<'Office Supplies' | 'Court Filing Fees' | 'Logistics & Fuel' | 'Utilities' | 'Repairs & Maintenance' | 'Professional Dues'>('Court Filing Fees');
  const [expAmount, setExpAmount] = useState(75000);

  // Request Form
  const [reqType, setReqType] = useState<'Leave' | 'Expense Reimbursement' | 'Salary Advance' | 'Office Resource' | 'Training & MCPD'>('Leave');
  const [reqDesc, setReqDesc] = useState('');
  const [reqAmount, setReqAmount] = useState(0);

  const isPrincipalPartner = currentUser?.role === 'Principal Partner';
  const isHead = currentUser?.role === 'Head of Chamber' || isPrincipalPartner;
  const isHeadOrAdmin = isHead || currentUser?.role === 'Administrator';

  const [editingExpense, setEditingExpense] = useState<BranchExpense | null>(null);
  const [editExpTitle, setEditExpTitle] = useState('');
  const [editExpCategory, setEditExpCategory] = useState<BranchExpense['category']>('Court Filing Fees');
  const [editExpAmount, setEditExpAmount] = useState(0);
  const [editExpDate, setEditExpDate] = useState('');
  const [editExpStatus, setEditExpStatus] = useState<BranchExpense['status']>('Approved by Head');

  const handleOpenEditExpense = (e: BranchExpense) => {
    setEditingExpense(e);
    setEditExpTitle(e.title);
    setEditExpCategory(e.category);
    setEditExpAmount(e.amount);
    setEditExpDate(e.date);
    setEditExpStatus(e.status);
  };

  const handleSaveEditExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    updateExpense(editingExpense.id, {
      title: editExpTitle.trim(),
      category: editExpCategory,
      amount: Number(editExpAmount),
      date: editExpDate,
      status: editExpStatus
    });
    setEditingExpense(null);
  };

  // Strict Branch Data Isolation
  const branchUsers = users.filter(u => canAccessBranchData(u.branchId));
  const branchStaff = staff.filter(s => canAccessBranchData(s.branchId));
  const branchExpenses = expenses.filter(e => canAccessBranchData(e.branchId));
  const branchRequests = requests.filter(r => canAccessBranchData(r.branchId));
  const branchPayrolls = payrolls.filter(p => canAccessBranchData(p.branchId));

  const targetBranchId = effectiveBranchId;
  const targetBranch = branches.find(b => b.id === targetBranchId) || branches[0];

  // Head of Chamber, Admin, Account Officer for the target branch
  const activeBranchUsers = users.filter(u => u.branchId === targetBranchId);
  const headUser = activeBranchUsers.find(u => u.role === 'Head of Chamber');
  const adminUser = activeBranchUsers.find(u => u.role === 'Administrator');
  const accountUser = activeBranchUsers.find(u => u.role === 'Account Officer');
  const counselUsers = activeBranchUsers.filter(u => u.role === 'Counsel' || u.role === 'Public Visitor');

  const handleOpenAddUser = (presetRole: Role = 'Counsel') => {
    setUserBranchId(targetBranchId);
    setUserRole(presetRole);
    setUserFullName('');
    setUserUsername('');
    setUserEmail('');
    setUserPhone('+234 803 000 0000');
    setUserPassword('Admin@2026');
    setUserNin('');
    setUserStatus('Active');
    setUserError(null);
    setShowAddUserModal(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);

    const quota = checkBranchRoleQuota(userBranchId, userRole);
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
        branchId: userBranchId,
        status: userStatus,
        isDefaultPassword: true,
        password: userPassword || 'Admin@2026',
        nin: userNin.trim() || undefined
      });

      setShowAddUserModal(false);
    } catch (err: any) {
      setUserError(err.message || 'Failed to create user account.');
    }
  };

  const handleOpenEditUser = (u: User) => {
    setEditModalUser(u);
    setUserFullName(u.fullName);
    setUserUsername(u.username);
    setUserEmail(u.email);
    setUserPhone(u.phone);
    setUserRole(u.role);
    setUserBranchId(u.branchId);
    setUserNin(u.nin || '');
    setUserStatus((u.status === 'Suspended' ? 'Suspended' : 'Active') as any);
    setUserPassword('');
    setUserError(null);
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
      branchId: userBranchId,
      status: userStatus,
      nin: userNin.trim() || undefined
    };

    if (userPassword && userPassword.trim()) {
      updates.password = userPassword.trim();
      updates.isDefaultPassword = false;
    }

    if (userRole !== editModalUser.role || userBranchId !== editModalUser.branchId) {
      const quota = checkBranchRoleQuota(userBranchId, userRole, editModalUser.id);
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

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName) return;

    addStaff({
      branchId: targetBranchId,
      userId: `USR-${Date.now()}`,
      fullName: staffName.trim(),
      jobTitle: staffRole,
      department: staffDept,
      employmentType: 'Full-time',
      dateJoined: new Date().toISOString().split('T')[0],
      basicSalary: Number(basicSalary),
      housingAllowance: Number(basicSalary) * 0.3,
      transportAllowance: Number(basicSalary) * 0.15,
      utilityAllowance: 25000,
      tinNumber: staffTin.trim() || 'TIN-10029381',
      pensionPin: staffPensionPin.trim() || 'PEN-10029381',
      pensionFundAdmin: 'Stanbic IBTC Pension',
      bankName: staffBank,
      accountNumber: staffAccount.trim(),
      leaveBalanceDays: 21
    });

    setShowAddStaffModal(false);
    setStaffName('');
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle) return;

    const amount = Number(expAmount);
    const status = amount <= 200000 ? 'Approved by Head' : 'Escalated to Principal Partner';

    addExpense({
      branchId: targetBranchId,
      title: expTitle.trim(),
      category: expCategory,
      amount,
      date: new Date().toISOString().split('T')[0],
      recordedBy: currentUser?.fullName || 'Staff',
      status,
      notes: amount > 200000 ? 'Auto-escalated to Principal Partner (Exceeds ₦200,000 threshold)' : 'Approved under Head of Chamber threshold'
    });

    setShowAddExpenseModal(false);
    setExpTitle('');
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqDesc) return;

    addRequest({
      branchId: targetBranchId,
      staffId: currentUser?.id || 'STF-DEMO',
      staffName: currentUser?.fullName || 'Staff Member',
      requestType: reqType,
      amount: reqAmount ? Number(reqAmount) : undefined,
      description: reqDesc.trim(),
      status: 'Submitted'
    });

    setShowAddRequestModal(false);
    setReqDesc('');
    setReqAmount(0);
  };

  const handleRunMonthlyPayroll = () => {
    setPayrollError(null);
    if (branchStaff.length === 0) {
      setPayrollError('Please add staff records under this branch division before running payroll.');
      return;
    }

    let grossTotal = 0;
    let payeTotal = 0;
    let pensionTotal = 0;
    let nhfTotal = 0;
    let netTotal = 0;

    const lineItems = branchStaff.map(s => {
      const gross = s.basicSalary + s.housingAllowance + s.transportAllowance + s.utilityAllowance;
      const pensionEmp = gross * 0.08;
      const nhf = gross * 0.025;
      const paye = gross * 0.12;
      const net = gross - pensionEmp - nhf - paye;

      grossTotal += gross;
      payeTotal += paye;
      pensionTotal += pensionEmp;
      nhfTotal += nhf;
      netTotal += net;

      return {
        staffId: s.id,
        staffName: s.fullName,
        grossSalary: gross,
        payeTax: paye,
        pensionEmployee: pensionEmp,
        nhfDeduction: nhf,
        loansDeduction: 0,
        netPay: net
      };
    });

    addPayroll({
      branchId: targetBranchId,
      month: 'October 2026',
      status: isPrincipalPartner ? 'Approved (Principal Partner)' : 'Under Review (Head)',
      preparedBy: currentUser?.fullName || 'Account Officer',
      totalGross: grossTotal,
      totalPaye: payeTotal,
      totalPensionEmployee: pensionTotal,
      totalPensionEmployer: grossTotal * 0.10,
      totalNhf: nhfTotal,
      totalNet: netTotal,
      lineItems
    });

    setShowRunPayrollModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#e0ddd5] shadow-xs">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#c9a227] font-bold font-mono uppercase">
            <Shield className="w-4 h-4" />
            <span>Strict Branch Isolation Enforced · {targetBranch?.name}</span>
          </div>
          <h2 className="font-serif font-black text-2xl text-[#1a2a4a] mt-0.5">
            Staff, User Accounts & Branch Operations
          </h2>
          <p className="text-xs text-[#5a5a5a] max-w-2xl">
            Branch quota governance (1 Head of Chamber, 1 Administrator/Secretary, 1 Account Officer, Unlimited Counsel). All users can be edited or deleted. Work data is strictly isolated to this branch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'users' && (
            <button
              onClick={() => handleOpenAddUser('Counsel')}
              className="px-3.5 py-1.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded text-xs font-bold font-serif-heading flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add User Account</span>
            </button>
          )}
          {activeTab === 'staff' && (
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="px-3.5 py-1.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded text-xs font-bold font-serif-heading cursor-pointer"
            >
              + Add Staff
            </button>
          )}
          {activeTab === 'expenses' && (
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="px-3.5 py-1.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded text-xs font-bold font-serif-heading cursor-pointer"
            >
              + Record Expense
            </button>
          )}
          {activeTab === 'requests' && (
            <button
              onClick={() => setShowAddRequestModal(true)}
              className="px-3.5 py-1.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded text-xs font-bold font-serif-heading cursor-pointer"
            >
              + Submit Request
            </button>
          )}
          {activeTab === 'payroll' && (
            <button
              onClick={handleRunMonthlyPayroll}
              className="px-4 py-1.5 bg-[#c9a227] text-[#1a2a4a] hover:bg-[#dfba43] rounded text-xs font-bold font-serif-heading cursor-pointer"
            >
              Run Monthly Payroll Schedule
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e0ddd5] overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'users' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Accounts & Quotas ({branchUsers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'staff' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Staff Directory ({branchStaff.length})
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'payroll' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Payroll Runs ({branchPayrolls.length})
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'expenses' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Branch Expenses ({branchExpenses.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'requests' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Internal Requests ({branchRequests.length})
        </button>
      </div>

      {/* Tab 0: User Accounts & Branch Role Quotas */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Branch Role Quota Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Head of Chamber */}
            <div className="bg-white p-4 rounded-xl border border-[#e0ddd5] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-[#1a2a4a]">Head of Chamber</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  headUser ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-700'
                }`}>
                  {headUser ? '1/1 (Full)' : '0/1 (Vacant)'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Statutory quota: Exactly 1 per branch division.
              </p>
              <div className="pt-2 border-t text-xs font-semibold">
                {headUser ? (
                  <div className="flex items-center justify-between">
                    <span className="text-[#1a2a4a] truncate">{headUser.fullName}</span>
                    <button
                      onClick={() => handleOpenEditUser(headUser)}
                      className="text-blue-600 hover:underline text-[11px] cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenAddUser('Head of Chamber')}
                    className="text-xs text-[#1a2a4a] hover:text-[#c9a227] font-bold cursor-pointer"
                  >
                    + Assign Head
                  </button>
                )}
              </div>
            </div>

            {/* Administrator / Secretary */}
            <div className="bg-white p-4 rounded-xl border border-[#e0ddd5] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-[#1a2a4a]">Administrator / Secretary</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  adminUser ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-700'
                }`}>
                  {adminUser ? '1/1 (Full)' : '0/1 (Vacant)'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Statutory quota: Exactly 1 per branch division.
              </p>
              <div className="pt-2 border-t text-xs font-semibold">
                {adminUser ? (
                  <div className="flex items-center justify-between">
                    <span className="text-[#1a2a4a] truncate">{adminUser.fullName}</span>
                    <button
                      onClick={() => handleOpenEditUser(adminUser)}
                      className="text-blue-600 hover:underline text-[11px] cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenAddUser('Administrator')}
                    className="text-xs text-[#1a2a4a] hover:text-[#c9a227] font-bold cursor-pointer"
                  >
                    + Assign Admin
                  </button>
                )}
              </div>
            </div>

            {/* Account Officer */}
            <div className="bg-white p-4 rounded-xl border border-[#e0ddd5] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-[#1a2a4a]">Account Officer</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  accountUser ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-700'
                }`}>
                  {accountUser ? '1/1 (Full)' : '0/1 (Vacant)'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Statutory quota: Exactly 1 per branch division.
              </p>
              <div className="pt-2 border-t text-xs font-semibold">
                {accountUser ? (
                  <div className="flex items-center justify-between">
                    <span className="text-[#1a2a4a] truncate">{accountUser.fullName}</span>
                    <button
                      onClick={() => handleOpenEditUser(accountUser)}
                      className="text-blue-600 hover:underline text-[11px] cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenAddUser('Account Officer')}
                    className="text-xs text-[#1a2a4a] hover:text-[#c9a227] font-bold cursor-pointer"
                  >
                    + Assign Officer
                  </button>
                )}
              </div>
            </div>

            {/* Counsel & Legal Staff */}
            <div className="bg-white p-4 rounded-xl border border-[#e0ddd5] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-[#1a2a4a]">Counsel & Legal Staff</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                  {counselUsers.length} (Unlimited)
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Unlimited intake: Senior, Associate & Pupil Counsel.
              </p>
              <div className="pt-2 border-t text-xs font-semibold">
                <button
                  onClick={() => handleOpenAddUser('Counsel')}
                  className="text-xs text-[#1a2a4a] hover:text-[#c9a227] font-bold cursor-pointer"
                >
                  + Add Counsel
                </button>
              </div>
            </div>
          </div>

          {/* User Accounts Table */}
          <div className="bg-white rounded-xl border border-[#e0ddd5] shadow-xs overflow-hidden">
            <div className="p-4 bg-[#f8f6f1] border-b border-[#e0ddd5] flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#1a2a4a]">
                  Chambers User Credential Directory ({branchUsers.length})
                </h3>
                <p className="text-[11px] text-gray-500">
                  All accounts can be edited or deleted. Credentials are synchronized in real-time across devices.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1a2a4a] text-white border-b border-[#c9a227] text-[11px] font-mono">
                    <th className="p-3">User</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Role & Quota</th>
                    <th className="p-3">Assigned Branch</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {branchUsers.map(u => {
                    const uBranch = branches.find(b => b.id === u.branchId);
                    return (
                      <tr key={u.id} className="hover:bg-[#f8f6f1]">
                        <td className="p-3">
                          <div className="font-bold text-gray-900">{u.fullName}</div>
                          {u.nin && <div className="text-[10px] text-gray-500 font-mono">NIN/CAC: {u.nin}</div>}
                        </td>
                        <td className="p-3 font-mono text-[#1a2a4a] font-semibold">@{u.username}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'Principal Partner'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : u.role === 'Head of Chamber'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : u.role === 'Administrator'
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : u.role === 'Account Officer'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono">
                          {u.branchId === 'ALL' ? (
                            <span className="font-bold text-purple-800">All Chambers Divisions</span>
                          ) : (
                            <span>{uBranch?.name || u.branchId}</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div>{u.email}</div>
                          <div className="text-gray-500 font-mono text-[10px]">{u.phone}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 text-blue-700 hover:bg-blue-50 rounded cursor-pointer"
                              title="Edit User"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteModalUser(u)}
                              className="p-1.5 text-red-700 hover:bg-red-50 rounded cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Staff Directory */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          {branchStaff.length > 0 ? (
            <div className="bg-white rounded-lg border border-[#e0ddd5] shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1a2a4a] text-white border-b border-[#c9a227] text-[11px] font-mono">
                    <th className="p-3">Staff Code</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Job Title & Dept</th>
                    <th className="p-3">Gross Salary</th>
                    <th className="p-3">TIN & Pension</th>
                    <th className="p-3">Bank Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {branchStaff.map(s => {
                    const gross = s.basicSalary + s.housingAllowance + s.transportAllowance + s.utilityAllowance;
                    return (
                      <tr key={s.id} className="hover:bg-[#f8f6f1]">
                        <td className="p-3 font-mono font-bold text-[#1a2a4a]">{s.code}</td>
                        <td className="p-3 font-bold text-gray-900">{s.fullName}</td>
                        <td className="p-3">{s.jobTitle} ({s.department})</td>
                        <td className="p-3 font-mono font-bold text-emerald-800">₦{gross.toLocaleString()}</td>
                        <td className="p-3 font-mono text-gray-600">{s.tinNumber}</td>
                        <td className="p-3">{s.bankName} ({s.accountNumber})</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 bg-white rounded-xl border border-dashed border-[#e0ddd5] text-center text-xs text-gray-500">
              No staff records registered for this branch yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Payroll Schedule */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          {branchPayrolls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branchPayrolls.map(p => (
                <div key={p.id} className="bg-white p-5 rounded-xl border border-[#e0ddd5] shadow-xs space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-mono font-bold text-xs text-[#1a2a4a]">{p.code}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#1a2a4a]">{p.month} Payroll Schedule</h3>
                    <p className="text-xs text-gray-500">Prepared by: {p.preparedBy}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#f8f6f1] p-3 rounded">
                    <div>Gross: ₦{p.totalGross.toLocaleString()}</div>
                    <div>PAYE Tax: ₦{p.totalPaye.toLocaleString()}</div>
                    <div>Employee Pension (8%): ₦{p.totalPensionEmployee.toLocaleString()}</div>
                    <div>Employer Pension (10%): ₦{p.totalPensionEmployer.toLocaleString()}</div>
                    <div>NHF (2.5%): ₦{p.totalNhf.toLocaleString()}</div>
                    <div className="font-bold text-emerald-800">Net Disbursement: ₦{p.totalNet.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white rounded-xl border border-dashed border-[#e0ddd5] text-center text-xs text-gray-500">
              No payroll runs recorded for this branch yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Branch Expenses */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {branchExpenses.length > 0 ? (
            <div className="bg-white rounded-lg border border-[#e0ddd5] shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1a2a4a] text-white border-b border-[#c9a227] text-[11px] font-mono">
                    <th className="p-3">Expense Code</th>
                    <th className="p-3">Title & Category</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Recorded By</th>
                    <th className="p-3">Approval Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {branchExpenses.map(e => (
                    <tr key={e.id} className="hover:bg-[#f8f6f1]">
                      <td className="p-3 font-mono font-bold text-[#1a2a4a]">{e.code}</td>
                      <td className="p-3">
                        <div className="font-semibold text-gray-900">{e.title}</div>
                        <div className="text-[10px] text-gray-500">{e.category}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-800">₦{e.amount.toLocaleString()}</td>
                      <td className="p-3 text-gray-600">{e.date}</td>
                      <td className="p-3">{e.recordedBy}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          e.status.includes('Approved') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        {isHeadOrAdmin && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditExpense(e)}
                              className="px-2 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Permanently delete branch expense "${e.title}" (₦${e.amount.toLocaleString()})?`)) {
                                  deleteExpense(e.id);
                                }
                              }}
                              className="px-2 py-1 bg-red-50 text-red-800 hover:bg-red-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
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
            </div>
          ) : (
            <div className="p-8 bg-white rounded-xl border border-dashed border-[#e0ddd5] text-center text-xs text-gray-500">
              No branch expenses recorded yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Internal Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {branchRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branchRequests.map(r => (
                <div key={r.id} className="bg-white p-5 rounded-xl border border-[#e0ddd5] shadow-xs space-y-2">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-mono font-bold text-xs text-[#1a2a4a]">{r.code}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {r.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#1a2a4a]">{r.requestType}</h4>
                    <p className="text-xs text-gray-600 mt-1">{r.description}</p>
                  </div>
                  {r.amount && (
                    <div className="text-xs font-mono font-bold text-emerald-800">
                      Amount Requested: ₦{r.amount.toLocaleString()}
                    </div>
                  )}
                  <div className="text-[10px] text-gray-400 font-mono pt-1">
                    Requested by {r.staffName} on {r.createdAt.split('T')[0]}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white rounded-xl border border-dashed border-[#e0ddd5] text-center text-xs text-gray-500">
              No staff requests submitted for this branch yet.
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#c9a227]" />
                <h3 className="font-serif font-bold text-base text-[#1a2a4a]">
                  Create Chambers User Account
                </h3>
              </div>
              <button onClick={() => setShowAddUserModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {userError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{userError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
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
                  <label className="block font-semibold mb-1 text-gray-700">Assigned Branch *</label>
                  <select
                    value={userBranchId}
                    onChange={(e) => setUserBranchId(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white font-semibold"
                    disabled={!isPrincipalPartner}
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>
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

              {/* Live Quota Feedback */}
              <div className="p-2.5 rounded bg-gray-50 border text-[11px] leading-tight">
                {(() => {
                  const quota = checkBranchRoleQuota(userBranchId, userRole);
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
                      <span>Role slot available for {branches.find(b => b.id === userBranchId)?.name || userBranchId}.</span>
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
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">NIN / Supreme Court No.</label>
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
                  onClick={() => setShowAddUserModal(false)}
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

      {/* Edit User Modal */}
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
                  <label className="block font-semibold mb-1 text-gray-700">Status</label>
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

      {/* Delete User Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-red-400 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-serif font-black text-lg">Permanently Delete User</h3>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-900 leading-relaxed space-y-2">
              <p>Are you sure you want to permanently delete this user account?</p>
              <div className="font-bold text-sm bg-white p-2 rounded border border-red-200 font-mono">
                {deleteModalUser.fullName} ({deleteModalUser.role}) · @{deleteModalUser.username}
              </div>
              <p>This user will be permanently purged from Chambers credentials across all connected devices.</p>
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

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Register Staff Profile</h3>
              <button onClick={() => setShowAddStaffModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Barr. Maryam Suleiman"
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Job Designation</label>
                  <input
                    type="text"
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Department</label>
                  <select
                    value={staffDept}
                    onChange={(e) => setStaffDept(e.target.value as any)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  >
                    <option value="Legal">Legal Practice</option>
                    <option value="Administration">Administration & Secretariat</option>
                    <option value="Finance">Finance & Accounts</option>
                    <option value="Real Estate">Property & Conveyancing</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Monthly Basic Salary (₦)</label>
                <input
                  type="number"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(Number(e.target.value))}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Salary Bank</label>
                  <input
                    type="text"
                    value={staffBank}
                    onChange={(e) => setStaffBank(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">NUBAN Account</label>
                  <input
                    type="text"
                    value={staffAccount}
                    onChange={(e) => setStaffAccount(e.target.value)}
                    placeholder="0123456789"
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowAddStaffModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded">Enroll Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Record Operational Expense</h3>
              <button onClick={() => setShowAddExpenseModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. Federal High Court cause list filing fees"
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Expense Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  >
                    <option value="Court Filing Fees">Court Filing Fees</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Logistics & Fuel">Logistics & Fuel</option>
                    <option value="Utilities">Utilities & Power</option>
                    <option value="Repairs & Maintenance">Repairs & Maintenance</option>
                    <option value="Professional Dues">NBA Bar Practicing Dues</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Amount (₦) *</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>
              <div className="p-2 bg-gray-50 rounded text-[11px] text-gray-600">
                Expenditures ≤ ₦200,000 are approved by Head of Chamber. Amounts &gt; ₦200,000 auto-escalate to Principal Partner.
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowAddExpenseModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded">Record Voucher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Request Modal */}
      {showAddRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Submit Internal Staff Request</h3>
              <button onClick={() => setShowAddRequestModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Request Type</label>
                <select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value as any)}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                >
                  <option value="Leave">Annual / Casual Leave</option>
                  <option value="Salary Advance">Salary Advance</option>
                  <option value="Expense Reimbursement">Out-of-Pocket Expense Reimbursement</option>
                  <option value="Office Resource">Office Equipment / Resource</option>
                  <option value="Training & MCPD">NBA Mandatory Continuing Legal Education (MCPD)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Amount (if financial)</label>
                <input
                  type="number"
                  value={reqAmount}
                  onChange={(e) => setReqAmount(Number(e.target.value))}
                  placeholder="₦0"
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Justification / Details *</label>
                <textarea
                  rows={3}
                  required
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowAddRequestModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Expense */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between border-b pb-2">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Edit Branch Expense</h3>
                <span className="text-[10px] font-mono text-[#c9a227] font-semibold">{editingExpense.code}</span>
              </div>
              <button onClick={() => setEditingExpense(null)} className="text-gray-500 hover:text-black">✕</button>
            </div>
            <form onSubmit={handleSaveEditExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  value={editExpTitle}
                  onChange={(e) => setEditExpTitle(e.target.value)}
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category *</label>
                  <select
                    value={editExpCategory}
                    onChange={(e) => setEditExpCategory(e.target.value as BranchExpense['category'])}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  >
                    <option value="Court Filing Fees">Court Filing Fees</option>
                    <option value="Logistics & Fuel">Logistics & Fuel</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Professional Dues">Professional Dues</option>
                    <option value="Repairs & Maintenance">Repairs & Maintenance</option>
                    <option value="Utilities">Utilities</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Amount (₦) *</label>
                  <input
                    type="number"
                    required
                    value={editExpAmount}
                    onChange={(e) => setEditExpAmount(Number(e.target.value))}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={editExpDate}
                    onChange={(e) => setEditExpDate(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Approval Status</label>
                  <select
                    value={editExpStatus}
                    onChange={(e) => setEditExpStatus(e.target.value as BranchExpense['status'])}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved by Head">Approved by Head</option>
                    <option value="Escalated to Principal Partner">Escalated to Principal Partner</option>
                    <option value="Approved by PP">Approved by PP</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setEditingExpense(null)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
