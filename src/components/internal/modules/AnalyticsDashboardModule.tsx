import React, { useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Scale,
  Building2,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';

export const AnalyticsDashboardModule: React.FC = () => {
  const {
    matters,
    properties,
    tenants,
    invoices,
    receipts,
    bookings,
    activeBranchId,
    branches,
    canAccessBranchData
  } = useApp();

  // Filter based on active branch and strict isolation
  const branchMatters = useMemo(() => {
    return matters.filter(m => canAccessBranchData(m.branchId));
  }, [matters, canAccessBranchData, activeBranchId]);

  const branchProperties = useMemo(() => {
    return properties.filter(p => canAccessBranchData(p.branchId));
  }, [properties, canAccessBranchData, activeBranchId]);

  const branchTenants = useMemo(() => {
    return tenants.filter(t => canAccessBranchData(t.branchId));
  }, [tenants, canAccessBranchData, activeBranchId]);

  const branchInvoices = useMemo(() => {
    return invoices.filter(i => canAccessBranchData(i.branchId));
  }, [invoices, canAccessBranchData, activeBranchId]);

  const branchReceipts = useMemo(() => {
    return receipts.filter(r => canAccessBranchData(r.branchId));
  }, [receipts, canAccessBranchData, activeBranchId]);

  const branchBookings = useMemo(() => {
    return bookings.filter(b => canAccessBranchData(b.branchId));
  }, [bookings, canAccessBranchData, activeBranchId]);

  // Financial KPIs
  const totalInvoiced = branchInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalReceipts = branchReceipts.reduce((sum, r) => sum + r.amountPaid, 0);
  const totalConsultationFees = branchBookings.reduce((sum, b) => sum + (b.paymentStatus === 'Paid' ? b.feeAmount : 0), 0);
  const totalRevenue = totalReceipts + totalConsultationFees;
  const unpaidInvoices = branchInvoices.filter(i => i.paymentStatus !== 'Paid').reduce((sum, i) => sum + i.totalAmount, 0);

  // Property Occupancy KPIs
  const totalUnits = branchProperties.reduce((sum, p) => sum + p.unitsCount, 0);
  const occupiedUnits = branchTenants.filter(t => t.status === 'Active').length;
  const occupancyRate = totalUnits > 0 ? Math.min(100, Math.round((occupiedUnits / totalUnits) * 100)) : (occupiedUnits > 0 ? 100 : 0);
  const currentRentRoll = branchTenants.reduce((sum, t) => sum + t.annualRent, 0);

  // Case KPIs
  const activeCasesCount = branchMatters.filter(m => m.status === 'Active').length;
  const adjournedCasesCount = branchMatters.filter(m => m.status === 'Adjourned').length;
  const closedCasesCount = branchMatters.filter(m => m.status === 'Closed').length;

  // Monthly Revenue Trend Data (12 Months of 2026)
  const monthlyRevenueData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.map((month, idx) => {
      // Aggregate real receipts by month if they exist
      const monthReceipts = branchReceipts.filter(r => {
        const d = new Date(r.paymentDate);
        return !isNaN(d.getTime()) && d.getMonth() === idx;
      }).reduce((sum, r) => sum + r.amountPaid, 0);

      const monthBookings = branchBookings.filter(b => {
        const d = new Date(b.createdAt);
        return !isNaN(d.getTime()) && d.getMonth() === idx && b.paymentStatus === 'Paid';
      }).reduce((sum, b) => sum + b.feeAmount, 0);

      const monthInvoiced = branchInvoices.filter(i => {
        const d = new Date(i.issueDate);
        return !isNaN(d.getTime()) && d.getMonth() === idx;
      }).reduce((sum, i) => sum + i.totalAmount, 0);

      return {
        month,
        revenue: monthReceipts + monthBookings,
        invoiced: monthInvoiced,
        consultations: monthBookings
      };
    });
  }, [branchReceipts, branchBookings, branchInvoices]);

  // Legal Cases by Court Jurisdiction Data
  const casesByCourtData = useMemo(() => {
    const counts: Record<string, number> = {
      'Supreme Court': 0,
      'Court of Appeal': 0,
      'Federal High Court': 0,
      'State High Court': 0,
      'National Industrial Court': 0,
      'Magistrate / Tribunals': 0
    };

    branchMatters.forEach(m => {
      if (m.courtCategory.includes('Supreme')) counts['Supreme Court']++;
      else if (m.courtCategory.includes('Appeal')) counts['Court of Appeal']++;
      else if (m.courtCategory.includes('Federal High')) counts['Federal High Court']++;
      else if (m.courtCategory.includes('State High')) counts['State High Court']++;
      else if (m.courtCategory.includes('Industrial')) counts['National Industrial Court']++;
      else counts['Magistrate / Tribunals']++;
    });

    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [branchMatters]);

  // Case Types Distribution (Donut Chart)
  const caseTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    branchMatters.forEach(m => {
      typeCounts[m.caseType] = (typeCounts[m.caseType] || 0) + 1;
    });

    const entries = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
    return entries.length > 0 ? entries : [
      { name: 'Commercial', value: branchMatters.length || 0 }
    ];
  }, [branchMatters]);

  // Property Occupancy & Arrears Aging Data
  const arrearsData = useMemo(() => {
    const current = branchTenants.filter(t => t.rentPaymentStatus === 'Current').length;
    const arrears30 = branchTenants.filter(t => t.rentPaymentStatus.includes('1-30')).length;
    const arrears60 = branchTenants.filter(t => t.rentPaymentStatus.includes('31-60')).length;
    const arrears90 = branchTenants.filter(t => t.rentPaymentStatus.includes('90+')).length;

    return [
      { status: 'Current (Paid)', count: current },
      { status: '1-30 Days Arrears', count: arrears30 },
      { status: '31-60 Days Arrears', count: arrears60 },
      { status: '90+ Days Arrears', count: arrears90 }
    ];
  }, [branchTenants]);

  const COLORS = ['#1a2a4a', '#c9a227', '#2e7d32', '#c62828', '#2c6e9e', '#f9a825'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-[#c9a227]">
            <ShieldCheck className="w-4 h-4" />
            <span>Executive Business Intelligence · B. B. BALE & CO</span>
          </div>
          <h2 className="font-serif font-black text-2xl text-[#1a2a4a] mt-0.5">
            Chambers Data Dashboard
          </h2>
          <p className="text-xs text-[#5a5a5a]">
            Real-time visual analytics for monthly firm revenue, active court litigation, and property occupancy stewardship.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-[#e0ddd5] shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-[#c9a227]" />
          <span className="text-gray-700">Fiscal Year: 2026 (WAT)</span>
        </div>
      </div>

      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected Revenue */}
        <div className="bg-white p-5 rounded-xl border border-[#e0ddd5] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider font-mono">
              Total Realized Revenue
            </span>
            <div className="w-8 h-8 rounded bg-[#1a2a4a]/5 text-[#1a2a4a] flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-[#c9a227]" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#1a2a4a]">
            ₦{totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Receipts & Consultations Collected</span>
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white p-5 rounded-xl border border-[#e0ddd5] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider font-mono">
              Outstanding Invoiced
            </span>
            <div className="w-8 h-8 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-gray-900">
            ₦{unpaidInvoices.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500">
            Gross Billed: ₦{totalInvoiced.toLocaleString()}
          </div>
        </div>

        {/* Active Legal Matters */}
        <div className="bg-white p-5 rounded-xl border border-[#e0ddd5] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider font-mono">
              Active Legal Cases
            </span>
            <div className="w-8 h-8 rounded bg-[#1a2a4a]/5 text-[#1a2a4a] flex items-center justify-center">
              <Scale className="w-4 h-4 text-[#c9a227]" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#1a2a4a]">
            {activeCasesCount} <span className="text-xs font-normal text-gray-500">Active</span>
          </div>
          <div className="text-[11px] text-gray-500">
            {adjournedCasesCount} Adjourned · {closedCasesCount} Concluded
          </div>
        </div>

        {/* Property Portfolio Occupancy Rate */}
        <div className="bg-white p-5 rounded-xl border border-[#e0ddd5] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider font-mono">
              Portfolio Occupancy
            </span>
            <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-700">
            {occupancyRate}%
          </div>
          <div className="text-[11px] text-gray-500">
            {occupiedUnits} of {totalUnits || occupiedUnits} Units Leased
          </div>
        </div>
      </div>

      {/* Court Diary Widget (Today's Present Case & Tomorrow's Upcoming Hearing) */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#e0ddd5] shadow-xs space-y-4">
        {(() => {
          const todayStr = new Date().toISOString().split('T')[0];
          const tomorrowDate = new Date();
          tomorrowDate.setDate(tomorrowDate.getDate() + 1);
          const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

          const todaysDiaryCases = branchMatters.filter(m => m.nextHearingDate === todayStr);
          const tomorrowsDiaryCases = branchMatters.filter(m => m.nextHearingDate === tomorrowStr);

          return (
            <>
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1a2a4a] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#c9a227]" />
                    <span>Chambers Court Diary & Cause List</span>
                  </h3>
                  <p className="text-xs text-[#5a5a5a]">
                    Real-time schedule of court appearances for today ({todayStr}) and tomorrow ({tomorrowStr}).
                  </p>
                </div>
                <span className="text-xs font-mono bg-[#1a2a4a] text-[#c9a227] px-2.5 py-1 rounded font-bold">
                  Live Cause List
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Today's Present Cases */}
                <div className="p-4 bg-emerald-50/60 rounded-lg border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                      Today's Present Cases ({todaysDiaryCases.length})
                    </h4>
                    <span className="text-[11px] font-mono text-emerald-700 font-semibold">{todayStr}</span>
                  </div>

                  {todaysDiaryCases.length > 0 ? (
                    <div className="space-y-2">
                      {todaysDiaryCases.map(m => (
                        <div key={m.id} className="bg-white p-3 rounded border border-emerald-200 shadow-2xs text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-[#1a2a4a]">
                            <span>{m.title}</span>
                            <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">{m.code}</span>
                          </div>
                          <div className="text-gray-600">
                            Court: <strong>{m.courtCategory}</strong> ({m.suitNumber || 'Suit No. Pending'})
                          </div>
                          <div className="text-gray-500 text-[11px]">
                            Judge / Coram: {m.presidingJudge || 'Assigned Tribunal'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-800/70 italic py-4 text-center">
                      No active court hearings slated for today. All matters are currently out of court or adjourned.
                    </div>
                  )}
                </div>

                {/* Tomorrow's Upcoming Hearings */}
                <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-xs text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                      Tomorrow's Upcoming Hearings ({tomorrowsDiaryCases.length})
                    </h4>
                    <span className="text-[11px] font-mono text-amber-700 font-semibold">{tomorrowStr}</span>
                  </div>

                  {tomorrowsDiaryCases.length > 0 ? (
                    <div className="space-y-2">
                      {tomorrowsDiaryCases.map(m => (
                        <div key={m.id} className="bg-white p-3 rounded border border-amber-200 shadow-2xs text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-[#1a2a4a]">
                            <span>{m.title}</span>
                            <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">{m.code}</span>
                          </div>
                          <div className="text-gray-600">
                            Court: <strong>{m.courtCategory}</strong> ({m.suitNumber || 'Suit No. Pending'})
                          </div>
                          <div className="text-gray-500 text-[11px]">
                            Judge / Coram: {m.presidingJudge || 'Assigned Tribunal'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-amber-800/70 italic py-4 text-center">
                      No hearings scheduled for tomorrow yet. Check matters registry to assign hearing dates.
                    </div>
                  )}
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Chart 1: Monthly Revenue & Invoicing Visualizer */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#e0ddd5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="font-serif font-bold text-base text-[#1a2a4a] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#c9a227]" />
              <span>Monthly Firm Revenue & Collections Performance</span>
            </h3>
            <p className="text-xs text-[#5a5a5a]">
              Aggregated monthly legal advocacy retainers, client consultation fees, and property service billings.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#1a2a4a]"></span>
              <span>Realized Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#c9a227]"></span>
              <span>Billed Invoices</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a2a4a" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#1a2a4a" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c9a227" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#c9a227" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0ddd5" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₦${val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} />
              <Tooltip
                formatter={(val: any) => [`₦${Number(val).toLocaleString()}`, '']}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e0ddd5', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="revenue" name="Collected Revenue" stroke="#1a2a4a" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="invoiced" name="Invoiced Amount" stroke="#c9a227" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorInvoiced)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Active Legal Cases Breakdown & Property Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Cases by Court Hierarchy (BarChart) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-xl border border-[#e0ddd5] shadow-xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-serif font-bold text-base text-[#1a2a4a] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#c9a227]" />
              <span>Active Litigation Matters by Nigerian Court Jurisdiction</span>
            </h3>
            <p className="text-xs text-[#5a5a5a]">
              Hierarchical distribution of briefs before Superior Courts of Record and statutory tribunals.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={casesByCourtData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0ddd5" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e0ddd5', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Active Matters" fill="#1a2a4a" radius={[4, 4, 0, 0]}>
                  {casesByCourtData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1a2a4a' : '#c9a227'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Property Occupancy & Arrears Aging (BarChart / Metrics) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-xl border border-[#e0ddd5] shadow-xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-serif font-bold text-base text-[#1a2a4a] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#c9a227]" />
              <span>Property Tenancy & Rent Arrears Aging</span>
            </h3>
            <p className="text-xs text-[#5a5a5a]">
              Status of leased residential and commercial units under Chambers stewardship.
            </p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={arrearsData} layout="vertical" margin={{ top: 5, right: 20, left: 35, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0ddd5" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis dataKey="status" type="category" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e0ddd5', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Tenants" fill="#2e7d32" radius={[0, 4, 4, 0]}>
                  <Cell fill="#2e7d32" />
                  <Cell fill="#f9a825" />
                  <Cell fill="#e65100" />
                  <Cell fill="#c62828" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-[#f8f6f1] rounded-lg border border-gray-200 text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Annual Rent Roll Yield:</span>
              <span className="font-bold text-[#1a2a4a]">₦{currentRentRoll.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Portfolio Valuation:</span>
              <span className="font-bold text-gray-800">
                ₦{branchProperties.reduce((sum, p) => sum + p.currentValuation, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
