import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import { SyncStatusBadge } from '../common/SyncStatusBadge';
import { LocalFilePicker } from '../common/LocalFilePicker';
import {
  Scale,
  Building2,
  Users,
  FileText,
  DollarSign,
  Landmark,
  BookOpen,
  Archive,
  MessageSquare,
  Bell,
  Shield,
  LogOut,
  Globe,
  Camera,
  Home,
  CheckSquare,
  Menu,
  X,
  ChevronDown,
  BarChart3,
  Server,
  FileSpreadsheet
} from 'lucide-react';

// Sub-modules
import { AnalyticsDashboardModule } from './modules/AnalyticsDashboardModule';
import { MattersModule } from './modules/MattersModule';
import { ClientsModule } from './modules/ClientsModule';
import { PropertiesModule } from './modules/PropertiesModule';
import { TenancyQuitModule } from './modules/TenancyQuitModule';
import { InvoicesReceiptsModule } from './modules/InvoicesReceiptsModule';
import { BankAccountsFeesModule } from './modules/BankAccountsFeesModule';
import { PrecedentsModule } from './modules/PrecedentsModule';
import { StaffPayrollExpensesModule } from './modules/StaffPayrollExpensesModule';
import { BackupModule } from './modules/BackupModule';
import { BranchManagementModule } from './modules/BranchManagementModule';
import { LiveChatAdminModule } from './modules/LiveChatAdminModule';
import { AuditAlertsModule } from './modules/AuditAlertsModule';
import { GoogleCloudAfricaModule } from './modules/GoogleCloudAfricaModule';
import { BranchFinancialStatementsModule } from './modules/BranchFinancialStatementsModule';
import { GalleryPage } from '../public/GalleryPage';

interface InternalLayoutProps {
  onReturnToPublic: () => void;
}

export const InternalLayout: React.FC<InternalLayoutProps> = ({ onReturnToPublic }) => {
  const {
    currentUser,
    logoutUser,
    activeBranchId,
    setActiveBranchId,
    branches,
    alerts,
    markAlertRead,
    dismissAlert,
    markAllAlertsAsRead,
    updateUser
  } = useApp();

  const isPrincipalPartner = currentUser?.role === 'Principal Partner';
  const isHead = currentUser?.role === 'Head of Chamber' || isPrincipalPartner;
  const isAccountOfficer = currentUser?.role === 'Account Officer';
  const isAdministrator = currentUser?.role === 'Administrator' || isHead;
  const unreadAlertsCount = alerts.filter(a => !a.isRead).length;

  // Default active module: if Account Officer, start in financial-statements or invoices
  const [activeModule, setActiveModule] = useState<string>(
    isAccountOfficer ? 'financial-statements' : 'dashboard'
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false);
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);

  // Auto-redirect if Account Officer is somehow in restricted modules
  React.useEffect(() => {
    if (isAccountOfficer && ['backups', 'google-cloud-africa', 'live-chats', 'tenancy-notices', 'precedents', 'branches', 'gallery'].includes(activeModule)) {
      setActiveModule('financial-statements');
    }
  }, [isAccountOfficer, activeModule]);

  // Sidebar navigation items based on role permissions matrix
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: BarChart3, allowed: true },
    { id: 'financial-statements', label: 'Financial Statements (P&L)', icon: FileSpreadsheet, allowed: isHead || isAccountOfficer },
    { id: 'invoices-receipts', label: 'Invoices & Receipts', icon: DollarSign, allowed: true },
    { id: 'bank-fees', label: 'Bank Accounts & Fees', icon: Landmark, allowed: isHead || isAccountOfficer },
    { id: 'staff-payroll', label: 'Branch Expenses & Payroll', icon: Users, allowed: isHead || isAccountOfficer },
    { id: 'matters', label: 'Matters & Litigation', icon: Scale, allowed: true },
    { id: 'clients', label: 'Clients & KYC', icon: Users, allowed: true },
    { id: 'properties', label: 'Properties & Tenants', icon: Building2, allowed: true },
    { id: 'tenancy-notices', label: 'Tenancy & Quit Notices', icon: Home, allowed: !isAccountOfficer },
    { id: 'precedents', label: 'Court Precedent Bank', icon: BookOpen, allowed: !isAccountOfficer },
    { id: 'gallery', label: 'Branch Event Gallery', icon: Camera, allowed: isAdministrator },
    { id: 'backups', label: 'Hard-Copy Backups', icon: Archive, allowed: !isAccountOfficer },
    { id: 'branches', label: 'Branch Network', icon: Shield, allowed: isPrincipalPartner },
    { id: 'google-cloud-africa', label: 'Cloudflare D1 & Cloud Security', icon: Server, allowed: !isAccountOfficer },
    { id: 'live-chats', label: 'Live Chat Inbox', icon: MessageSquare, allowed: !isAccountOfficer },
    { id: 'audit-alerts', label: 'Alerts & Audit Trail', icon: Bell, allowed: true }
  ].filter(item => item.allowed);

  const handleProfilePicUpload = (files: any[]) => {
    if (files.length > 0 && currentUser) {
      updateUser(currentUser.id, { profilePic: files[0].dataUrl });
      setShowProfilePhotoModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f1] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#1a2a4a] text-white border-b-2 border-[#c9a227] shadow-md px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-1 text-gray-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Logo variant="full" theme="dark" size="sm" />
          </div>

          {/* Center: Branch Selector (Principal Partner: Switch Any Branch; Others: Locked to Own Branch) */}
          <div className="hidden sm:flex items-center gap-3">
            {isPrincipalPartner ? (
              <div className="flex items-center gap-2 bg-[#0f1a30] px-3 py-1 rounded border border-[#c9a227]/40 text-xs">
                <span className="text-[#c9a227] font-semibold">Active Division:</span>
                <select
                  value={activeBranchId}
                  onChange={(e) => setActiveBranchId(e.target.value)}
                  className="bg-transparent text-white font-mono focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-[#1a2a4a]">All Chambers Divisions (Firm-wide)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id} className="bg-[#1a2a4a]">
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="bg-[#0f1a30] px-3 py-1 rounded border border-[#c9a227]/30 text-xs font-mono text-[#c9a227]">
                Branch: {branches.find(b => b.id === currentUser?.branchId)?.name || branches.find(b => b.id === activeBranchId)?.name || 'HQ Branch'}
              </div>
            )}

            {/* Cross-Device Sync Status Indicator (Section 6.11) */}
            <SyncStatusBadge compact />

            {/* Google Cloud Africa Region Badge (Restricted from Account Officer) */}
            {!isAccountOfficer && (
              <>
                <button
                  onClick={() => setActiveModule('google-cloud-africa')}
                  title="Google Cloud Region: africa-south1 (Pan-African Access Enforced)"
                  className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-green-300 bg-green-950/60 hover:bg-green-900/70 border border-green-700/60 rounded cursor-pointer transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="font-mono">africa-south1</span>
                </button>

                {/* Dual-Database Synchronization Badge: Firestore <-> D1 CHAMBERS_DB */}
                <button
                  onClick={() => setActiveModule('google-cloud-africa')}
                  title="Dual Database: Firestore ⟷ Cloudflare D1 (CHAMBERS_DB) Periodic Sync Active"
                  className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-amber-300 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-600/60 rounded cursor-pointer transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="font-mono">Firestore ⇄ D1 (CHAMBERS_DB)</span>
                </button>
              </>
            )}
          </div>

          {/* Right: User Profile & Actions */}
          <div className="flex items-center gap-3">
            {/* View Public Site Link (Section 5.11) */}
            <button
              onClick={onReturnToPublic}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-200 hover:text-white bg-white/10 hover:bg-white/20 rounded transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Public Website</span>
            </button>

            {/* Alert Bell Button with Quick Notification Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAlertDropdown(!showAlertDropdown)}
                className="relative p-1.5 text-gray-200 hover:text-white rounded cursor-pointer"
                title="Alert Notifications"
              >
                <Bell className="w-4 h-4 text-[#c9a227]" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              {showAlertDropdown && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-gray-800 rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1"
                  onMouseLeave={() => setShowAlertDropdown(false)}
                >
                  <div className="p-3 bg-[#1a2a4a] text-white flex items-center justify-between border-b border-[#c9a227]">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#c9a227]" />
                      <span className="font-serif font-bold text-xs">Chambers Notifications</span>
                    </div>
                    {unreadAlertsCount > 0 && (
                      <button
                        onClick={() => markAllAlertsAsRead()}
                        className="text-[10px] text-[#c9a227] hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                    {alerts.slice(0, 5).map(alert => (
                      <div
                        key={alert.id}
                        className={`p-3 text-xs flex flex-col gap-1 ${!alert.isRead ? 'bg-amber-50/50' : 'bg-white'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                            alert.priority === 'Critical' ? 'bg-red-600 text-white' :
                            alert.priority === 'High' ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {alert.priority}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="font-bold text-[#1a2a4a] text-xs leading-snug">{alert.title}</div>
                        <p className="text-[11px] text-gray-600 leading-normal line-clamp-2">{alert.message}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-gray-400 font-mono">
                            {branches.find(b => b.id === alert.branchId)?.code || alert.branchId} · {alert.category}
                          </span>
                          <div className="flex items-center gap-2">
                            {!alert.isRead && (
                              <button
                                onClick={() => markAlertRead(alert.id)}
                                className="text-[10px] font-semibold text-emerald-600 hover:underline cursor-pointer"
                              >
                                Read
                              </button>
                            )}
                            <button
                              onClick={() => dismissAlert(alert.id)}
                              className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {alerts.length === 0 && (
                      <div className="p-6 text-center text-xs text-gray-500">
                        No alerts or notifications at this time.
                      </div>
                    )}
                  </div>

                  <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
                    <button
                      onClick={() => {
                        setShowAlertDropdown(false);
                        setActiveModule('audit-alerts');
                      }}
                      className="w-full py-1 text-xs font-bold text-[#1a2a4a] hover:text-[#c9a227] cursor-pointer"
                    >
                      View All Alerts &amp; Audit Trail ({alerts.length}) →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar with Local File Picker (Section 19) */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/20">
              <button
                onClick={() => setShowProfilePhotoModal(true)}
                className="relative group cursor-pointer"
                title="Change Profile Photo (Local Device Picker)"
              >
                {currentUser?.profilePic ? (
                  <img
                    src={currentUser.profilePic}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-[#c9a227]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#c9a227] text-[#1a2a4a] font-bold text-xs flex items-center justify-center font-serif">
                    {currentUser?.fullName.substring(0, 2).toUpperCase() || 'BB'}
                  </div>
                )}
                <span className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                  <Camera className="w-3 h-3" />
                </span>
              </button>

              <div className="hidden sm:block text-left text-xs leading-tight">
                <div className="font-bold text-white truncate max-w-[120px]">{currentUser?.fullName || 'User'}</div>
                <div className="text-[10px] text-[#c9a227] font-mono">{currentUser?.role || 'Staff'}</div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={logoutUser}
                className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors"
                title="Sign Out of Chambers"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#111e38] text-gray-300 border-r border-[#1a2a4a] p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-mono-code uppercase text-[#c9a227] tracking-widest font-bold">
            Chambers Modules
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#1a2a4a] text-white border-l-4 border-[#c9a227] font-semibold'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#c9a227]' : 'text-gray-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Mobile Drawer Sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="w-64 bg-[#111e38] text-white p-4 space-y-2 shadow-2xl flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                  <Logo variant="compact" theme="dark" size="sm" />
                  <button onClick={() => setMobileSidebarOpen(false)}>
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="py-2 text-[10px] font-mono uppercase text-[#c9a227]">
                  Chambers Modules
                </div>

                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs text-left ${
                        isActive ? 'bg-[#1a2a4a] text-white border-l-4 border-[#c9a227]' : 'text-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#c9a227]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-700">
                <button
                  onClick={onReturnToPublic}
                  className="w-full py-2 bg-white/10 rounded text-xs text-center"
                >
                  Return to Public Site
                </button>
              </div>
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-60px)]">
          <div className="max-w-7xl mx-auto">
            {activeModule === 'dashboard' && <AnalyticsDashboardModule />}
            {activeModule === 'financial-statements' && <BranchFinancialStatementsModule />}
            {activeModule === 'matters' && <MattersModule />}
            {activeModule === 'clients' && <ClientsModule />}
            {activeModule === 'properties' && <PropertiesModule />}
            {activeModule === 'tenancy-notices' && <TenancyQuitModule />}
            {activeModule === 'invoices-receipts' && <InvoicesReceiptsModule />}
            {activeModule === 'bank-fees' && <BankAccountsFeesModule />}
            {activeModule === 'precedents' && <PrecedentsModule />}
            {activeModule === 'staff-payroll' && <StaffPayrollExpensesModule />}
            {activeModule === 'gallery' && isAdministrator && (
              <div className="space-y-4">
                <div className="bg-[#1a2a4a] text-white p-5 rounded-lg border-2 border-[#c9a227] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#c9a227] uppercase tracking-wider">
                      Public Branch Event Showcase & Photo Archive
                    </span>
                    <h2 className="font-serif font-black text-xl text-white">
                      Branch Event Gallery Management
                    </h2>
                    <p className="text-xs text-gray-300 mt-0.5">
                      Upload, update, and manage event photographs for each Chambers branch. Published photos appear instantly on both the public website and internal records.
                    </p>
                  </div>
                </div>
                <GalleryPage />
              </div>
            )}
            {activeModule === 'backups' && !isAccountOfficer && <BackupModule />}
            {activeModule === 'branches' && <BranchManagementModule />}
            {activeModule === 'google-cloud-africa' && !isAccountOfficer && <GoogleCloudAfricaModule />}
            {activeModule === 'live-chats' && !isAccountOfficer && <LiveChatAdminModule />}
            {activeModule === 'audit-alerts' && <AuditAlertsModule />}
          </div>
        </main>
      </div>

      {/* Profile Picture Upload Modal (Section 19: Local Device File Picker) */}
      {showProfilePhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-serif font-bold text-sm text-[#1a2a4a]">Update Chambers Profile Photo</h3>
              <button onClick={() => setShowProfilePhotoModal(false)}>✕</button>
            </div>

            <p className="text-xs text-gray-500">
              Section 19: Select a high-resolution portrait from your device (JPG/PNG/WEBP, max 5MB).
            </p>

            <LocalFilePicker
              label="Choose Picture from Device"
              accept=".jpg,.jpeg,.png,.webp"
              maxSizeMb={5}
              onUploadComplete={handleProfilePicUpload}
            />

            <div className="text-right pt-2 border-t">
              <button
                onClick={() => setShowProfilePhotoModal(false)}
                className="px-3 py-1 text-xs border rounded text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
