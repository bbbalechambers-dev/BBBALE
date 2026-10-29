import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { LocalFilePicker } from '../../common/LocalFilePicker';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  CheckCircle2,
  Building2,
  Landmark,
  Shield,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react';
import { BranchExpense, UploadedFileMetadata } from '../../../types';

type StatementPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export const BranchFinancialStatementsModule: React.FC = () => {
  const {
    invoices,
    receipts,
    expenses,
    bookings,
    bankAccounts,
    addExpense,
    updateExpense,
    deleteExpense,
    branches,
    getActiveBranch,
    canAccessBranchData,
    effectiveBranchId,
    currentUser
  } = useApp();

  const [period, setPeriod] = useState<StatementPeriod>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState<number>(Math.floor(new Date().getMonth() / 3) + 1); // 1-4
  const [customStartDate, setCustomStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Modal: Record Branch Expense
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<string>('Court Filing Fees');
  const [customCategory, setCustomCategory] = useState('');
  const [expAmount, setExpAmount] = useState<number>(50000);
  const [expDate, setExpDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expNotes, setExpNotes] = useState('');
  const [expReceiptDocs, setExpReceiptDocs] = useState<UploadedFileMetadata[]>([]);
  const [expenseFormError, setExpenseFormError] = useState<string | null>(null);

  const activeBranch = getActiveBranch() || branches[0];
  const targetBranchId = effectiveBranchId;
  const isAccountOfficer = currentUser?.role === 'Account Officer';
  const isPrincipalPartner = currentUser?.role === 'Principal Partner';
  const isHeadOrAdmin = currentUser?.role === 'Head of Chamber' || currentUser?.role === 'Administrator' || isPrincipalPartner;

  // Edit Expense states & handlers
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

  // Compute date range based on selected period
  const { startDateStr, endDateStr, periodLabel } = useMemo(() => {
    const now = new Date();
    const year = selectedYear;

    if (period === 'weekly') {
      // Current Week (last 7 days from today, or standard week Mon-Sun)
      const end = new Date(now);
      const start = new Date(now);
      start.setDate(end.getDate() - 6);
      const sStr = start.toISOString().split('T')[0];
      const eStr = end.toISOString().split('T')[0];
      return {
        startDateStr: sStr,
        endDateStr: eStr,
        periodLabel: `Weekly Statement (${sStr} to ${eStr})`
      };
    }

    if (period === 'monthly') {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const start = new Date(year, selectedMonth, 1);
      const end = new Date(year, selectedMonth + 1, 0);
      const sStr = start.toISOString().split('T')[0];
      const eStr = end.toISOString().split('T')[0];
      return {
        startDateStr: sStr,
        endDateStr: eStr,
        periodLabel: `Monthly Statement - ${monthNames[selectedMonth]} ${year}`
      };
    }

    if (period === 'quarterly') {
      const qStartMonth = (selectedQuarter - 1) * 3;
      const start = new Date(year, qStartMonth, 1);
      const end = new Date(year, qStartMonth + 3, 0);
      const sStr = start.toISOString().split('T')[0];
      const eStr = end.toISOString().split('T')[0];
      return {
        startDateStr: sStr,
        endDateStr: eStr,
        periodLabel: `Quarterly Statement - Q${selectedQuarter} ${year} (${sStr} to ${eStr})`
      };
    }

    if (period === 'yearly') {
      const sStr = `${year}-01-01`;
      const eStr = `${year}-12-31`;
      return {
        startDateStr: sStr,
        endDateStr: eStr,
        periodLabel: `Annual Financial Statement - FY ${year}`
      };
    }

    // Custom
    return {
      startDateStr: customStartDate,
      endDateStr: customEndDate,
      periodLabel: `Custom Period Statement (${customStartDate} to ${customEndDate})`
    };
  }, [period, selectedMonth, selectedYear, selectedQuarter, customStartDate, customEndDate]);

  // Helper date filter
  const isDateInRange = (dateStr: string) => {
    if (!dateStr) return false;
    const d = dateStr.slice(0, 10);
    return d >= startDateStr && d <= endDateStr;
  };

  // Branch data strictly filtered by branch isolation and period
  const periodReceipts = useMemo(() => {
    return receipts.filter(r => canAccessBranchData(r.branchId) && isDateInRange(r.paymentDate));
  }, [receipts, canAccessBranchData, startDateStr, endDateStr]);

  const periodInvoices = useMemo(() => {
    return invoices.filter(i => canAccessBranchData(i.branchId) && isDateInRange(i.issueDate));
  }, [invoices, canAccessBranchData, startDateStr, endDateStr]);

  const periodBookings = useMemo(() => {
    return bookings.filter(b => canAccessBranchData(b.branchId) && b.paymentStatus === 'Paid' && isDateInRange(b.createdAt));
  }, [bookings, canAccessBranchData, startDateStr, endDateStr]);

  const periodExpenses = useMemo(() => {
    return expenses.filter(e => canAccessBranchData(e.branchId) && isDateInRange(e.date));
  }, [expenses, canAccessBranchData, startDateStr, endDateStr]);

  const branchAccounts = useMemo(() => {
    return bankAccounts.filter(b => canAccessBranchData(b.branchId));
  }, [bankAccounts, canAccessBranchData]);

  // Revenue Aggregations
  const directReceiptsTotal = periodReceipts.reduce((sum, r) => sum + r.amountPaid, 0);
  const consultationFeesTotal = periodBookings.reduce((sum, b) => sum + b.feeAmount, 0);
  const totalInflow = directReceiptsTotal + consultationFeesTotal;

  // Invoiced vs Paid
  const totalInvoicedAmount = periodInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalVatBilled = periodInvoices.reduce((sum, i) => sum + i.vatAmount, 0);
  const totalWhtDeducted = periodInvoices.reduce((sum, i) => sum + i.whtAmount, 0);

  // Expenses Aggregations
  const totalOutflow = periodExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Net Operating Balance
  const netSurplus = totalInflow - totalOutflow;
  const isSurplus = netSurplus >= 0;
  const operatingMargin = totalInflow > 0 ? ((netSurplus / totalInflow) * 100).toFixed(1) : '0.0';

  // Expenses by Category breakdown
  const expensesByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    periodExpenses.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, [periodExpenses]);

  // Handle Recording New Branch Expense
  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseFormError(null);

    if (!expTitle.trim() || !expAmount || expAmount <= 0) {
      setExpenseFormError('Please enter a valid expense title and positive amount.');
      return;
    }

    const finalCategory = (expCategory === 'Other' || expCategory === 'Other (Specify Manually)')
      ? (customCategory.trim() || 'Miscellaneous')
      : expCategory;

    addExpense({
      branchId: targetBranchId,
      title: expTitle.trim(),
      category: finalCategory as any,
      amount: Number(expAmount),
      date: expDate || new Date().toISOString().split('T')[0],
      recordedBy: currentUser?.fullName || (isAccountOfficer ? 'Account Officer' : 'Chambers Administrator'),
      status: Number(expAmount) > 200000 ? 'Escalated to Principal Partner' : 'Approved by Head',
      receiptFile: expReceiptDocs[0] || undefined,
      notes: expNotes.trim() || `Recorded by ${currentUser?.fullName || 'Account Officer'} for branch operations.`
    });

    setShowAddExpenseModal(false);
    setExpTitle('');
    setCustomCategory('');
    setExpNotes('');
    setExpReceiptDocs([]);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const rows = [
      ['B. B. BALE & CO. - BRANCH FINANCIAL STATEMENT'],
      ['Branch', activeBranch?.name || 'Chambers Division'],
      ['Period', periodLabel],
      ['Date Range', `${startDateStr} to ${endDateStr}`],
      ['Prepared By', currentUser?.fullName || 'Account Officer'],
      [''],
      ['SECTION 1: OPERATIONAL INFLOW / REVENUE'],
      ['Category', 'Amount (NGN)'],
      ['Client Direct Receipts', directReceiptsTotal.toFixed(2)],
      ['Consultation & Advisory Fees', consultationFeesTotal.toFixed(2)],
      ['Total Gross Inflows', totalInflow.toFixed(2)],
      [''],
      ['SECTION 2: OPERATIONAL OUTFLOW / EXPENSES'],
      ['Expense Title', 'Category', 'Date', 'Recorded By', 'Amount (NGN)'],
      ...periodExpenses.map(e => [
        `"${e.title.replace(/"/g, '""')}"`,
        `"${e.category}"`,
        e.date,
        `"${e.recordedBy}"`,
        e.amount.toFixed(2)
      ]),
      ['Total Operating Expenses', '', '', '', totalOutflow.toFixed(2)],
      [''],
      ['SECTION 3: EXECUTIVE SUMMARY'],
      ['Total Revenue', totalInflow.toFixed(2)],
      ['Total Operating Outflow', totalOutflow.toFixed(2)],
      ['Net Operating Balance (Surplus/Deficit)', netSurplus.toFixed(2)],
      ['Operating Margin (%)', `${operatingMargin}%`]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_statement_${targetBranchId}_${period}_${startDateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="bg-white p-5 rounded-xl border border-[#e0ddd5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#c9a227]">
            <Landmark className="w-4 h-4" />
            <span>Branch Financial Treasury & Compliance · {activeBranch?.name}</span>
          </div>
          <h2 className="font-serif font-black text-2xl text-[#1a2a4a] mt-0.5">
            Branch Financial Statements (P&L)
          </h2>
          <p className="text-xs text-[#5a5a5a] max-w-2xl">
            Statutory financial statement generation (Weekly, Monthly, Quarterly, and Yearly) and branch expense recording. Managed by the Branch Account Officer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Record Expense Button */}
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded-md font-bold text-xs shadow-sm transition-all cursor-pointer font-serif-heading"
          >
            <Plus className="w-4 h-4" />
            <span>Record Branch Expense</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-semibold text-xs border border-gray-300 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#1a2a4a]" />
            <span>Export CSV</span>
          </button>

          {/* Print Statement Button */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#c9a227] hover:bg-[#b08d20] text-[#1a2a4a] rounded-md font-bold text-xs shadow-sm transition-all cursor-pointer font-serif-heading"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Statement</span>
          </button>
        </div>
      </div>

      {/* Period Selection Controls */}
      <div className="bg-white p-4 rounded-xl border border-[#e0ddd5] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1a2a4a]">
            <Calendar className="w-4 h-4 text-[#c9a227]" />
            <span>Select Financial Statement Cadence:</span>
          </div>

          {/* Cadence Pills */}
          <div className="flex flex-wrap gap-1.5 bg-[#f8f6f1] p-1 rounded-lg border border-[#e0ddd5]">
            {(['weekly', 'monthly', 'quarterly', 'yearly', 'custom'] as StatementPeriod[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  period === p
                    ? 'bg-[#1a2a4a] text-[#c9a227] shadow-xs'
                    : 'text-gray-600 hover:text-black hover:bg-white/50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Period Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
          {period === 'weekly' && (
            <div className="flex items-center gap-2 text-gray-700 bg-amber-50 px-3 py-1.5 rounded border border-amber-200">
              <span className="font-semibold text-amber-900">Current Week Schedule:</span>
              <span className="font-mono">{startDateStr} to {endDateStr} (Last 7 Calendar Days)</span>
            </div>
          )}

          {period === 'monthly' && (
            <div className="flex items-center gap-2">
              <label className="font-semibold text-gray-700">Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="p-1.5 rounded border border-[#e0ddd5] bg-white text-xs font-medium focus:outline-none"
              >
                {[
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ].map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

              <label className="font-semibold text-gray-700 ml-2">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="p-1.5 rounded border border-[#e0ddd5] bg-white text-xs font-medium focus:outline-none font-mono"
              >
                <option value={2026}>2026 (Fiscal Year)</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          )}

          {period === 'quarterly' && (
            <div className="flex items-center gap-2">
              <label className="font-semibold text-gray-700">Quarter:</label>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                className="p-1.5 rounded border border-[#e0ddd5] bg-white text-xs font-medium focus:outline-none"
              >
                <option value={1}>Q1 (January 1 - March 31)</option>
                <option value={2}>Q2 (April 1 - June 30)</option>
                <option value={3}>Q3 (July 1 - September 30)</option>
                <option value={4}>Q4 (October 1 - December 31)</option>
              </select>

              <label className="font-semibold text-gray-700 ml-2">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="p-1.5 rounded border border-[#e0ddd5] bg-white text-xs font-medium focus:outline-none font-mono"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          )}

          {period === 'yearly' && (
            <div className="flex items-center gap-2">
              <label className="font-semibold text-gray-700">Fiscal Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="p-1.5 rounded border border-[#e0ddd5] bg-white text-xs font-medium focus:outline-none font-mono"
              >
                <option value={2026}>FY 2026 (Jan 01 – Dec 31, 2026)</option>
                <option value={2025}>FY 2025</option>
              </select>
            </div>
          )}

          {period === 'custom' && (
            <div className="flex items-center gap-2">
              <label className="font-semibold text-gray-700">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="p-1.5 rounded border border-[#e0ddd5] text-xs font-mono"
              />
              <label className="font-semibold text-gray-700 ml-2">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="p-1.5 rounded border border-[#e0ddd5] text-xs font-mono"
              />
            </div>
          )}

          <div className="ml-auto text-xs font-mono text-gray-500 font-semibold bg-gray-50 px-2.5 py-1 rounded border">
            Statement Period: {startDateStr} – {endDateStr}
          </div>
        </div>
      </div>

      {/* Top 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inflow */}
        <div className="bg-white p-5 rounded-xl border border-[#e0ddd5] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider font-mono">
              Gross Inflows (Revenue)
            </span>
            <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-700">
            ₦{totalInflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-500">
            {periodReceipts.length} Direct Receipts · {periodBookings.length} Consultations
          </div>
        </div>

        {/* Total Outflow */}
        <div className="bg-white p-5 rounded-xl border border-[#e0ddd5] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider font-mono">
              Operating Outflow (Expenses)
            </span>
            <div className="w-8 h-8 rounded bg-red-50 text-red-700 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-red-700">
            ₦{totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-500">
            {periodExpenses.length} Recorded Branch Expenses
          </div>
        </div>

        {/* Net Operating Surplus */}
        <div className={`p-5 rounded-xl border shadow-xs space-y-2 ${
          isSurplus ? 'bg-emerald-950 text-white border-emerald-800' : 'bg-red-950 text-white border-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono text-gray-300">
              Net Operating Balance
            </span>
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
              {isSurplus ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#c9a227]">
            {isSurplus ? '+' : '-'}₦{Math.abs(netSurplus).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-300">
            Operating Margin: <span className="font-bold text-white">{operatingMargin}%</span> ({isSurplus ? 'Operating Surplus' : 'Deficit'})
          </div>
        </div>

        {/* Receivables & Taxes */}
        <div className="bg-white p-5 rounded-xl border border-[#e0ddd5] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider font-mono">
              Gross Invoiced & Taxes
            </span>
            <div className="w-8 h-8 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#1a2a4a]">
            ₦{totalInvoicedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-500">
            VAT: ₦{totalVatBilled.toLocaleString()} · WHT: ₦{totalWhtDeducted.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Printable Statement Document (Also displayed in screen view) */}
      <div className="bg-white p-6 sm:p-10 rounded-xl border border-[#e0ddd5] shadow-md space-y-8" id="printable-financial-statement">
        {/* Chambers Official Statement Header */}
        <div className="border-b-2 border-[#1a2a4a] pb-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-xl sm:text-2xl font-serif font-black tracking-wider text-[#1a2a4a]">
                B. B. BALE & CO.
              </div>
              <div className="text-xs uppercase font-semibold text-[#c9a227] tracking-widest">
                Legal Practitioners, Notaries Public & Real Estate Consultants
              </div>
              <div className="text-[11px] text-gray-600 mt-1">
                {activeBranch?.name} · {activeBranch?.address}, {activeBranch?.state} State, Nigeria
              </div>
              <div className="text-[11px] font-mono text-gray-500">
                Email: {activeBranch?.email || 'accounts@bbbaleandco.ng'} · Tel: {activeBranch?.phone || '+234 803 200 0004'}
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="inline-block px-3 py-1 bg-[#1a2a4a] text-[#c9a227] font-mono font-bold text-xs rounded uppercase">
                Official Financial Statement
              </span>
              <div className="text-xs font-mono font-semibold text-gray-700">
                Ref: STMT-{activeBranch?.code || 'LAG'}-{period.toUpperCase()}-{new Date().getFullYear()}
              </div>
              <div className="text-[11px] text-gray-500 font-mono">
                Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="pt-2 text-center">
            <h3 className="font-serif font-bold text-base text-[#1a2a4a] uppercase tracking-wide underline underline-offset-4 decoration-[#c9a227]">
              {periodLabel}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Comprehensive Statement of Operational Income, Collections, and Disbursed Branch Expenditures
            </p>
          </div>
        </div>

        {/* Section 1: Inflow / Revenue Schedule */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h4 className="font-serif font-bold text-sm text-[#1a2a4a] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>1.0 Statement of Inflows & Realized Revenue</span>
            </h4>
            <span className="font-mono font-bold text-xs text-emerald-800">
              Total Inflow: ₦{totalInflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 border-b text-[11px] font-mono">
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Transaction Code / Ref</th>
                  <th className="p-2.5">Payer / Client</th>
                  <th className="p-2.5">Payment Method</th>
                  <th className="p-2.5">Purpose / Description</th>
                  <th className="p-2.5 text-right">Amount (₦)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {periodReceipts.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="p-2.5 font-mono text-[11px] text-gray-600">{r.paymentDate}</td>
                    <td className="p-2.5 font-mono font-bold text-[#1a2a4a]">{r.code}</td>
                    <td className="p-2.5 font-medium text-gray-900">{r.payerName}</td>
                    <td className="p-2.5 text-gray-600">{r.paymentMethod}</td>
                    <td className="p-2.5 text-gray-600">{r.purpose}</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-700 text-right">
                      ₦{r.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {periodBookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="p-2.5 font-mono text-[11px] text-gray-600">{b.createdAt.slice(0, 10)}</td>
                    <td className="p-2.5 font-mono font-bold text-[#1a2a4a]">{b.code}</td>
                    <td className="p-2.5 font-medium text-gray-900">{b.clientName}</td>
                    <td className="p-2.5 text-gray-600">Online Intake</td>
                    <td className="p-2.5 text-gray-600">Public Client Legal Consultation & Intake Fee</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-700 text-right">
                      ₦{b.feeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {periodReceipts.length === 0 && periodBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-400 italic">
                      No realized receipts or cash inflows recorded in this statement period.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-emerald-50/60 font-bold border-t border-emerald-200">
                  <td colSpan={5} className="p-2.5 text-emerald-900 font-serif">
                    Total Realized Revenue (Inflows)
                  </td>
                  <td className="p-2.5 font-mono text-emerald-800 text-right text-sm">
                    ₦{totalInflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Section 2: Outflows / Expenses Schedule */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h4 className="font-serif font-bold text-sm text-[#1a2a4a] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span>2.0 Statement of Branch Operating Expenses</span>
            </h4>
            <span className="font-mono font-bold text-xs text-red-800">
              Total Expenses: ₦{totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Category Summary Chips */}
          {expensesByCategory.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {expensesByCategory.map(([cat, amt]) => (
                <div key={cat} className="p-2 bg-gray-50 rounded border text-xs space-y-0.5">
                  <div className="text-gray-500 text-[10px] truncate">{cat}</div>
                  <div className="font-mono font-bold text-[#1a2a4a]">₦{amt.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 border-b text-[11px] font-mono">
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Expense Code</th>
                  <th className="p-2.5">Expense Title / Item</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Recorded By</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Amount (₦)</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {periodExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50/50">
                    <td className="p-2.5 font-mono text-[11px] text-gray-600">{e.date}</td>
                    <td className="p-2.5 font-mono font-bold text-[#1a2a4a]">{e.code}</td>
                    <td className="p-2.5 font-medium text-gray-900">{e.title}</td>
                    <td className="p-2.5 text-gray-600">{e.category}</td>
                    <td className="p-2.5 text-gray-600">{e.recordedBy}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800">
                        {e.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono font-bold text-red-700 text-right">
                      ₦{e.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-right whitespace-nowrap">
                      {isHeadOrAdmin ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditExpense(e)}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Permanently delete branch expense "${e.title}" (₦${e.amount.toLocaleString()})?`)) {
                                deleteExpense(e.id);
                              }
                            }}
                            className="px-2 py-0.5 bg-red-50 text-red-700 hover:bg-red-100 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400">Head/Admin only</span>
                      )}
                    </td>
                  </tr>
                ))}
                {periodExpenses.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-gray-400 italic">
                      No operating expenses recorded for this statement period. Click "Record Branch Expense" to post expenses.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-red-50/60 font-bold border-t border-red-200">
                  <td colSpan={6} className="p-2.5 text-red-900 font-serif">
                    Total Operating Expenses (Outflows)
                  </td>
                  <td className="p-2.5 font-mono text-red-800 text-right text-sm">
                    ₦{totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Section 3: Profit & Loss Statement Summary Box */}
        <div className="bg-[#f8f6f1] p-5 rounded-xl border-2 border-[#1a2a4a]/20 space-y-3">
          <h4 className="font-serif font-bold text-sm text-[#1a2a4a] uppercase tracking-wide">
            3.0 Executive Performance Reconciliation
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-white rounded border border-gray-200">
              <span className="text-gray-500 block text-[11px]">Total Operating Inflow (A):</span>
              <span className="font-bold text-base text-emerald-800">
                ₦{totalInflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 bg-white rounded border border-gray-200">
              <span className="text-gray-500 block text-[11px]">Total Operating Expenses (B):</span>
              <span className="font-bold text-base text-red-800">
                ₦{totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className={`p-3 rounded border font-bold ${
              isSurplus ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-red-100 text-red-900 border-red-300'
            }`}>
              <span className="block text-[11px]">Net Branch Position (A - B):</span>
              <span className="text-base font-serif">
                {isSurplus ? '+' : '-'}₦{Math.abs(netSurplus).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="block text-[10px] font-normal mt-0.5">
                {isSurplus ? '✓ Operating Surplus Recorded' : '⚠ Operating Deficit Reported'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Branch Bank Accounts Reconciliation */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-[#1a2a4a] flex items-center gap-2 border-b pb-2">
            <Landmark className="w-4 h-4 text-[#c9a227]" />
            <span>4.0 Branch Settlement Accounts Position</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {branchAccounts.map(b => (
              <div key={b.id} className="p-3 bg-white rounded-lg border border-gray-200 shadow-2xs space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-[#1a2a4a]">
                  <span>{b.bankName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded font-mono">{b.accountType}</span>
                </div>
                <div className="font-mono text-gray-700">A/C: {b.accountNumber}</div>
                <div className="text-[11px] text-gray-500 truncate">{b.accountName}</div>
                <div className="pt-1 border-t flex justify-between items-center">
                  <span className="text-[10px] text-gray-400">Current Balance:</span>
                  <span className="font-mono font-bold text-[#1a2a4a]">₦{b.balance?.toLocaleString() || '0'}</span>
                </div>
              </div>
            ))}
            {branchAccounts.length === 0 && (
              <div className="text-xs text-gray-400 col-span-3 py-2">
                No bank accounts linked to this branch. Check Bank Accounts module.
              </div>
            )}
          </div>
        </div>

        {/* Sign-off & Certification Blocks (Official Letterhead Standard) */}
        <div className="pt-6 border-t-2 border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
          <div className="space-y-6">
            <div className="h-10 border-b border-gray-400 flex items-end justify-center font-serif italic text-gray-700">
              {currentUser?.role === 'Account Officer' ? currentUser.fullName : 'Aisha Bello, ACA'}
            </div>
            <div>
              <div className="font-bold text-[#1a2a4a]">
                {currentUser?.role === 'Account Officer' ? currentUser.fullName : 'Aisha Bello, ACA'}
              </div>
              <div className="text-[11px] text-gray-500">Branch Account Officer / Bursar</div>
              <div className="text-[10px] font-mono text-gray-400">Prepared & Reconciled</div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="h-10 border-b border-gray-400 flex items-end justify-center font-serif italic text-gray-700">
              Verified & Certified
            </div>
            <div>
              <div className="font-bold text-[#1a2a4a]">Head of Chamber</div>
              <div className="text-[11px] text-gray-500">{activeBranch?.name}</div>
              <div className="text-[10px] font-mono text-gray-400">Audit Verification</div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="h-10 border-b border-gray-400 flex items-end justify-center font-serif italic text-gray-700">
              Approved & Sealed
            </div>
            <div>
              <div className="font-bold text-[#1a2a4a]">Barr. B. B. Bale, SAN</div>
              <div className="text-[11px] text-gray-500">Principal Partner & Seal Bearer</div>
              <div className="text-[10px] font-mono text-gray-400">Executive Ratification</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Record Branch Expense */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#c9a227]" />
                <span>Record Branch Operating Expense</span>
              </h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="text-gray-400 hover:text-black font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordExpense} className="space-y-4 text-xs">
              {expenseFormError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{expenseFormError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1 text-gray-800">Expense Title / Item Description *</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. Court filing fees for FHC Suit 102/2026, Diesel for Generator, Internet Subscription"
                  className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-800">Expense Category *</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                  >
                    <option value="Court Filing Fees">Court Filing Fees</option>
                    <option value="Office Supplies">Office Supplies & Stationery</option>
                    <option value="Logistics & Fuel">Logistics, Fuel & Travel</option>
                    <option value="Utilities">Utilities & Power</option>
                    <option value="Repairs & Maintenance">Repairs & Maintenance</option>
                    <option value="Professional Dues">Professional Dues & NBA Subscriptions</option>
                    <option value="Other (Specify Manually)">Other (Specify Manually)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-800">Amount (₦) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] font-mono focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
              </div>

              {/* Other Manual Input */}
              {(expCategory === 'Other' || expCategory === 'Other (Specify Manually)') && (
                <div>
                  <label className="block font-semibold mb-1 text-gray-800">Specify Custom Category *</label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom branch expense category..."
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-800">Disbursement Date</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-800">Branch Division</label>
                  <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-700 font-medium">
                    {activeBranch?.name} ({activeBranch?.code})
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-800">Voucher Notes & Approval Rationale</label>
                <textarea
                  rows={2}
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder="State voucher reference number or operational justification..."
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>

              {/* Local File Picker for Expense Receipt / Invoice Voucher */}
              <div>
                <label className="block font-semibold mb-1 text-gray-800">
                  Upload Receipt / Invoice / Payment Voucher (Local File)
                </label>
                <LocalFilePicker
                  label="Attach Receipt Voucher from Device"
                  multiple={false}
                  maxSizeMb={10}
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  currentFiles={expReceiptDocs}
                  onUploadComplete={(files) => setExpReceiptDocs(files)}
                  onRemoveFile={() => setExpReceiptDocs([])}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] font-bold rounded font-serif-heading"
                >
                  Post Expense to Branch
                </button>
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
                <label className="block font-semibold mb-1">Expense Title / Item *</label>
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
                  <label className="block font-semibold mb-1">Status</label>
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
