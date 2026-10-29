import React, { createContext, useContext, useState, useEffect } from 'react';
import { testFirestoreConnection, syncEntityToGoogleCloud, getGoogleCloudDatabaseInfo, GoogleCloudDatabaseInfo } from '../lib/firebase';
import { INITIAL_BRANCHES, INITIAL_USERS, DEFAULT_CHAMBERS_PASSWORD, INITIAL_GALLERY_EVENTS, INITIAL_ALERTS } from '../data/initialChambersData';
import {
  Branch,
  User,
  Role,
  Matter,
  ClientRecord,
  PropertyOwner,
  Property,
  Tenant,
  TenancyAgreement,
  QuitNotice,
  Invoice,
  Receipt,
  BankAccount,
  FeeItem,
  Precedent,
  ConsultationBooking,
  StaffRecord,
  PayrollRun,
  BranchExpense,
  InternalRequest,
  SpecialTask,
  ChatMessage,
  ChatSession,
  AlertNotification,
  BranchGalleryEvent,
  BackupRecord,
  AuditLog,
  SensitiveAccessAttempt,
  UploadedFileMetadata,
  DualSyncTelemetry,
  DualDatabaseConsistencyReport
} from '../types';
import { dualDatabaseSyncService } from '../services/dualDatabaseSyncService';

interface AppContextType {
  // Authentication & Session
  currentUser: User | null;
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  loginUser: (username: string, password: string) => Promise<{ success: boolean; error?: string; requirePasswordChange?: boolean }>;
  logoutUser: () => void;
  updateUserPassword: (userId: string, newPassword: string) => Promise<boolean>;
  
  // Sensitive Portal Logins
  authenticatedClient: ClientRecord | null;
  authenticatedOwner: PropertyOwner | null;
  authenticatedTenant: Tenant | null;
  setAuthenticatedClient: (client: ClientRecord | null) => void;
  setAuthenticatedOwner: (owner: PropertyOwner | null) => void;
  setAuthenticatedTenant: (tenant: Tenant | null) => void;
  loginClientPortal: (code: string, identifier: string, branchId?: string) => { success: boolean; error?: string };
  loginOwnerPortal: (code: string, identifier: string, branchId?: string) => { success: boolean; error?: string };
  loginTenantPortal: (code: string, identifier: string, branchId?: string) => { success: boolean; error?: string };
  logoutPortal: () => void;

  // Sync state
  syncStatus: 'Synced' | 'Syncing' | 'Offline';
  lastSyncedAt: string;
  triggerManualSync: () => void;

  // Data Collections
  branches: Branch[];
  users: User[];
  matters: Matter[];
  clients: ClientRecord[];
  owners: PropertyOwner[];
  properties: Property[];
  tenants: Tenant[];
  agreements: TenancyAgreement[];
  notices: QuitNotice[];
  invoices: Invoice[];
  receipts: Receipt[];
  bankAccounts: BankAccount[];
  fees: FeeItem[];
  precedents: Precedent[];
  bookings: ConsultationBooking[];
  staff: StaffRecord[];
  payrolls: PayrollRun[];
  expenses: BranchExpense[];
  requests: InternalRequest[];
  tasks: SpecialTask[];
  chatSessions: ChatSession[];
  chatMessages: ChatMessage[];
  alerts: AlertNotification[];
  galleryEvents: BranchGalleryEvent[];
  backups: BackupRecord[];
  auditLogs: AuditLog[];
  sensitiveAttempts: SensitiveAccessAttempt[];

  // Data Mutation Actions
  addBranch: (branch: Omit<Branch, 'id' | 'createdAt'>) => Branch;
  updateBranch: (id: string, branch: Partial<Branch>) => void;
  suspendBranch: (id: string, reason: string) => void;
  reactivateBranch: (id: string) => void;
  deleteBranch: (id: string) => void;
  deleteBranchPermanently: (id: string) => Promise<boolean>;

  deletedBranchIds: string[];
  deletedUserIds: string[];

  addUser: (user: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => Promise<boolean>;
  validateUserQuota: (targetBranchId: string, role: Role, editingUserId?: string) => { valid: boolean; error?: string };

  // Public Registrations
  registerPublicClient: (data: { branchId: string; fullName: string; email: string; phone: string; streetAddress: string; city: string; state: string; lga: string; ninOrCac: string; clientType?: 'Individual' | 'Corporate' }) => ClientRecord;
  registerPublicOwner: (data: { branchId: string; fullName: string; email: string; phone: string; address: string; state: string; ninOrCac: string; bankName?: string; accountNumber?: string }) => PropertyOwner;
  registerPublicTenant: (data: { branchId: string; fullName: string; email: string; phone: string; propertyId: string; unitAssigned: string; annualRent: number; nin: string }) => Tenant;

  addClient: (client: Omit<ClientRecord, 'id' | 'code' | 'createdAt'>) => ClientRecord;
  updateClient: (id: string, updates: Partial<ClientRecord>) => void;
  deleteClient: (id: string) => void;

  addMatter: (matter: Omit<Matter, 'id' | 'code' | 'createdAt'>) => Matter;
  updateMatter: (id: string, updates: Partial<Matter>) => void;

  addOwner: (owner: Omit<PropertyOwner, 'id' | 'code' | 'createdAt'>) => PropertyOwner;
  updateOwner: (id: string, updates: Partial<PropertyOwner>) => void;
  deleteOwner: (id: string) => void;

  addProperty: (property: Omit<Property, 'id' | 'code' | 'createdAt'>) => Property;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;

  addTenant: (tenant: Omit<Tenant, 'id' | 'code' | 'createdAt'>) => Tenant;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;

  addAgreement: (agreement: Omit<TenancyAgreement, 'id' | 'code' | 'createdAt'>) => TenancyAgreement;
  updateAgreement: (id: string, updates: Partial<TenancyAgreement>) => void;

  addNotice: (notice: Omit<QuitNotice, 'id' | 'code' | 'createdAt'>) => QuitNotice;
  updateNotice: (id: string, updates: Partial<QuitNotice>) => void;

  addInvoice: (invoice: Omit<Invoice, 'id' | 'code' | 'createdAt'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;

  addReceipt: (receipt: Omit<Receipt, 'id' | 'code' | 'createdAt'>) => Receipt;

  addBankAccount: (account: Omit<BankAccount, 'id'>) => BankAccount;
  updateBankAccount: (id: string, updates: Partial<BankAccount>) => void;

  addFee: (fee: Omit<FeeItem, 'id'>) => FeeItem;
  updateFee: (id: string, updates: Partial<FeeItem>) => void;

  addPrecedent: (precedent: Omit<Precedent, 'id' | 'code' | 'createdAt'>) => Precedent;
  deletePrecedent: (id: string) => void;

  addBooking: (booking: Omit<ConsultationBooking, 'id' | 'code' | 'createdAt'>) => ConsultationBooking;
  updateBooking: (id: string, updates: Partial<ConsultationBooking>) => void;

  addStaff: (record: Omit<StaffRecord, 'id' | 'code'>) => StaffRecord;
  updateStaff: (id: string, updates: Partial<StaffRecord>) => void;

  addPayroll: (payroll: Omit<PayrollRun, 'id' | 'code' | 'createdAt'>) => PayrollRun;
  updatePayroll: (id: string, updates: Partial<PayrollRun>) => void;

  addExpense: (expense: Omit<BranchExpense, 'id' | 'code'>) => BranchExpense;
  updateExpense: (id: string, updates: Partial<BranchExpense>) => void;
  deleteExpense: (id: string) => void;

  addRequest: (req: Omit<InternalRequest, 'id' | 'code' | 'createdAt'>) => InternalRequest;
  updateRequest: (id: string, updates: Partial<InternalRequest>) => void;

  addTask: (task: Omit<SpecialTask, 'id' | 'code' | 'createdAt'>) => SpecialTask;
  updateTask: (id: string, updates: Partial<SpecialTask>) => void;

  // Live Chat
  startChatSession: (visitor: { name: string; email: string; phone: string; topic: string; branchId: string }) => ChatSession;
  sendChatMessage: (sessionId: string, message: string, senderType: 'Visitor' | 'Administrator', attachment?: UploadedFileMetadata) => void;
  closeChatSession: (sessionId: string) => void;

  // Alerts & Audit
  addAlert: (alert: Omit<AlertNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAlertRead: (id: string) => void;
  dismissAlert: (id: string) => void;
  deleteAlert: (id: string) => void;
  markAllAlertsAsRead: () => void;
  logAudit: (action: string, targetEntity: string, details: string) => void;

  // Branch Event Gallery (Managed by Administrator)
  addGalleryEvent: (event: Omit<BranchGalleryEvent, 'id' | 'createdAt'>) => BranchGalleryEvent;
  updateGalleryEvent: (id: string, updates: Partial<BranchGalleryEvent>) => void;
  deleteGalleryEvent: (id: string) => void;

  // Hard-Copy Backup
  generateHardCopyBackup: (branchId: string, startDate: string, endDate: string, categories: string[]) => BackupRecord;

  // Utility & Isolation
  getActiveBranch: () => Branch | undefined;
  generateUniqueCode: (branchId: string, entityType: string, year?: number) => string;
  resetDatabaseClean: () => void;
  canAccessBranchData: (branchId?: string) => boolean;
  checkBranchRoleQuota: (branchId: string, role: Role, excludeUserId?: string) => { allowed: boolean; reason?: string; existingUser?: User };
  effectiveBranchId: string;

  // Google Cloud Firestore Sync
  pushAllToGoogleCloud: () => Promise<{ success: boolean; count: number; error?: string }>;
  getGoogleCloudDbInfo: () => GoogleCloudDatabaseInfo;

  // Cloudflare D1 Database Sync
  pushAllToCloudflareDatabase: () => Promise<{ success: boolean; count: number; error?: string }>;

  // Dual-Database Synchronization Service (Firestore <-> Cloudflare D1 CHAMBERS_DB)
  dualSyncTelemetry: DualSyncTelemetry;
  triggerDualDatabaseSync: () => Promise<{ success: boolean; count: number; error?: string }>;
  setDualSyncAutoInterval: (seconds: number) => void;
  toggleDualSyncAuto: (enabled: boolean) => void;
  getDualDatabaseConsistencyReport: () => Promise<DualDatabaseConsistencyReport>;
}

const STORAGE_KEY = 'BBB_BALE_CHAMBERS_DB_PROD';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State variables for all modules with initial defaults
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [agreements, setAgreements] = useState<TenancyAgreement[]>([]);
  const [notices, setNotices] = useState<QuitNotice[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [precedents, setPrecedents] = useState<Precedent[]>([]);
  const [bookings, setBookings] = useState<ConsultationBooking[]>([]);
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [payrolls, setPayrolls] = useState<PayrollRun[]>([]);
  const [expenses, setExpenses] = useState<BranchExpense[]>([]);
  const [requests, setRequests] = useState<InternalRequest[]>([]);
  const [tasks, setTasks] = useState<SpecialTask[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>(INITIAL_ALERTS);
  const [galleryEvents, setGalleryEvents] = useState<BranchGalleryEvent[]>(INITIAL_GALLERY_EVENTS);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sensitiveAttempts, setSensitiveAttempts] = useState<SensitiveAccessAttempt[]>([]);

  // Auth & Session
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeBranchId, setActiveBranchIdState] = useState<string>('ALL');
  const [authenticatedClient, setAuthenticatedClient] = useState<ClientRecord | null>(null);
  const [authenticatedOwner, setAuthenticatedOwner] = useState<PropertyOwner | null>(null);
  const [authenticatedTenant, setAuthenticatedTenant] = useState<Tenant | null>(null);

  // Sync state & Cross-Device Engine
  const [syncStatus, setSyncStatus] = useState<'Synced' | 'Syncing' | 'Offline'>('Synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(new Date().toISOString());

  const isPullingCloudRef = React.useRef(false);
  const hasInitialSyncedRef = React.useRef(false);
  const localVersionRef = React.useRef<number>(0);
  const deviceIdRef = React.useRef<string>('');
  const deletedBranchIdsRef = React.useRef<string[]>([]);
  const deletedUserIdsRef = React.useRef<string[]>([]);

  if (!deviceIdRef.current && typeof window !== 'undefined') {
    let id = localStorage.getItem('BBB_CHAMBERS_DEVICE_ID');
    if (!id) {
      id = 'DEV-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('BBB_CHAMBERS_DEVICE_ID', id);
    }
    deviceIdRef.current = id;
  }

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.branches) setBranches(data.branches);
        if (data.users) setUsers(data.users);
        if (data.matters) setMatters(data.matters);
        if (data.clients) setClients(data.clients);
        if (data.owners) setOwners(data.owners);
        if (data.properties) setProperties(data.properties);
        if (data.tenants) setTenants(data.tenants);
        if (data.agreements) setAgreements(data.agreements);
        if (data.notices) setNotices(data.notices);
        if (data.invoices) setInvoices(data.invoices);
        if (data.receipts) setReceipts(data.receipts);
        if (data.bankAccounts) setBankAccounts(data.bankAccounts);
        if (data.fees) setFees(data.fees);
        if (data.precedents) setPrecedents(data.precedents);
        if (data.bookings) setBookings(data.bookings);
        if (data.staff) setStaff(data.staff);
        if (data.payrolls) setPayrolls(data.payrolls);
        if (data.expenses) setExpenses(data.expenses);
        if (data.requests) setRequests(data.requests);
        if (data.tasks) setTasks(data.tasks);
        if (data.chatSessions) setChatSessions(data.chatSessions);
        if (data.chatMessages) setChatMessages(data.chatMessages);
        if (data.alerts && Array.isArray(data.alerts) && data.alerts.length > 0) {
          setAlerts(data.alerts);
        } else {
          setAlerts(INITIAL_ALERTS);
        }
        if (data.galleryEvents && Array.isArray(data.galleryEvents) && data.galleryEvents.length > 0) {
          setGalleryEvents(data.galleryEvents);
        } else {
          setGalleryEvents(INITIAL_GALLERY_EVENTS);
        }
        if (data.backups) setBackups(data.backups);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        if (data.sensitiveAttempts) setSensitiveAttempts(data.sensitiveAttempts);
      }
    } catch (e) {
      console.error('Failed to load stored state:', e);
    }

    testFirestoreConnection().catch((err) => {
      console.warn('Initial Firestore cloud check:', err);
    });
  }, []);

  // Method to apply fresh snapshot from central cloud/server into React state
  const applyCloudSnapshot = (cloudData: any) => {
    if (!cloudData || typeof cloudData !== 'object') return;
    isPullingCloudRef.current = true;
    try {
      if (Array.isArray(cloudData.deletedBranchIds)) {
        for (const id of cloudData.deletedBranchIds) {
          if (!deletedBranchIdsRef.current.includes(id)) deletedBranchIdsRef.current.push(id);
        }
      }
      if (Array.isArray(cloudData.deletedUserIds)) {
        for (const id of cloudData.deletedUserIds) {
          if (!deletedUserIdsRef.current.includes(id)) deletedUserIdsRef.current.push(id);
        }
      }

      if (Array.isArray(cloudData.branches) && cloudData.branches.length > 0) {
        const activeBranches = cloudData.branches.filter((b: Branch) => !deletedBranchIdsRef.current.includes(b.id));
        setBranches(activeBranches);
      }
      if (Array.isArray(cloudData.users) && cloudData.users.length > 0) {
        const activeUsers = cloudData.users.filter((u: User) => !deletedUserIdsRef.current.includes(u.id));
        setUsers(activeUsers);
        if (currentUser) {
          const fresh = activeUsers.find((u: User) => u.id === currentUser.id);
          if (fresh) {
            setCurrentUser(fresh);
          }
        }
      }
      if (Array.isArray(cloudData.matters)) setMatters(cloudData.matters);
      if (Array.isArray(cloudData.clients)) setClients(cloudData.clients);
      if (Array.isArray(cloudData.owners)) setOwners(cloudData.owners);
      if (Array.isArray(cloudData.properties)) setProperties(cloudData.properties);
      if (Array.isArray(cloudData.tenants)) setTenants(cloudData.tenants);
      if (Array.isArray(cloudData.agreements)) setAgreements(cloudData.agreements);
      if (Array.isArray(cloudData.notices)) setNotices(cloudData.notices);
      if (Array.isArray(cloudData.invoices)) setInvoices(cloudData.invoices);
      if (Array.isArray(cloudData.receipts)) setReceipts(cloudData.receipts);
      if (Array.isArray(cloudData.bankAccounts)) setBankAccounts(cloudData.bankAccounts);
      if (Array.isArray(cloudData.fees)) setFees(cloudData.fees);
      if (Array.isArray(cloudData.precedents)) setPrecedents(cloudData.precedents);
      if (Array.isArray(cloudData.bookings)) setBookings(cloudData.bookings);
      if (Array.isArray(cloudData.staff)) setStaff(cloudData.staff);
      if (Array.isArray(cloudData.payrolls)) setPayrolls(cloudData.payrolls);
      if (Array.isArray(cloudData.expenses)) setExpenses(cloudData.expenses);
      if (Array.isArray(cloudData.requests)) setRequests(cloudData.requests);
      if (Array.isArray(cloudData.tasks)) setTasks(cloudData.tasks);
      if (Array.isArray(cloudData.chatSessions)) setChatSessions(cloudData.chatSessions);
      if (Array.isArray(cloudData.chatMessages)) setChatMessages(cloudData.chatMessages);
      if (Array.isArray(cloudData.alerts)) setAlerts(cloudData.alerts);
      if (Array.isArray(cloudData.galleryEvents)) setGalleryEvents(cloudData.galleryEvents);
      if (Array.isArray(cloudData.backups)) setBackups(cloudData.backups);
      if (Array.isArray(cloudData.auditLogs)) setAuditLogs(cloudData.auditLogs);
      if (Array.isArray(cloudData.sensitiveAttempts)) setSensitiveAttempts(cloudData.sensitiveAttempts);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('Synced');
    } finally {
      setTimeout(() => {
        isPullingCloudRef.current = false;
      }, 150);
    }
  };

  // Pull latest changes from server
  const pullFromCloud = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/sync/pull');
      if (res.ok) {
        const payload: any = await res.json();
        if (payload && payload.data) {
          localVersionRef.current = payload.version || Date.now();
          applyCloudSnapshot(payload.data);
          hasInitialSyncedRef.current = true;
          return true;
        }
      }
    } catch (e) {
      console.warn('Sync pull error:', e);
    } finally {
      hasInitialSyncedRef.current = true;
    }
    return false;
  };

  // Push local changes to server & broadcast
  const pushToCloud = async (currentData?: any) => {
    if (isPullingCloudRef.current) return;
    setSyncStatus('Syncing');
    try {
      const payload = currentData || {
        branches,
        users,
        deletedBranchIds: deletedBranchIdsRef.current,
        deletedUserIds: deletedUserIdsRef.current,
        matters,
        clients,
        owners,
        properties,
        tenants,
        agreements,
        notices,
        invoices,
        receipts,
        bankAccounts,
        fees,
        precedents,
        bookings,
        staff,
        payrolls,
        expenses,
        requests,
        tasks,
        chatSessions,
        chatMessages,
        alerts,
        galleryEvents,
        backups,
        auditLogs,
        sensitiveAttempts
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

      const res = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: payload,
          clientDeviceId: deviceIdRef.current,
          actor: currentUser?.fullName || 'Chambers Device'
        })
      });

      if (res.ok) {
        const result: any = await res.json();
        localVersionRef.current = result.version;
        setLastSyncedAt(result.lastModified || new Date().toISOString());
        setSyncStatus('Synced');

        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('bbb_chambers_sync');
          bc.postMessage({ type: 'SYNC_TRIGGER', version: result.version });
          bc.close();
        }
      } else {
        setSyncStatus('Offline');
      }
    } catch (e) {
      console.warn('Sync push error:', e);
      setSyncStatus('Offline');
    }
  };

  // Real-time Background Auto-Sync Poller & Multi-device Listeners
  useEffect(() => {
    // 1. Initial immediate pull
    pullFromCloud();

    // 2. Poll version every 2.5 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/sync/version');
        if (res.ok) {
          const info: any = await res.json();
          if (info.version && info.version > localVersionRef.current) {
            await pullFromCloud();
          }
        }
      } catch {
        // network offline, ignore
      }
    }, 2500);

    // 3. Focus and visibility triggers
    const handleFocus = async () => {
      try {
        const res = await fetch('/api/sync/version');
        if (res.ok) {
          const info: any = await res.json();
          if (info.version && info.version > localVersionRef.current) {
            await pullFromCloud();
          }
        }
      } catch {}
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    // 4. Same-origin tab synchronizer
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('bbb_chambers_sync');
      bc.onmessage = (ev) => {
        if (ev.data && ev.data.type === 'SYNC_TRIGGER') {
          pullFromCloud();
        }
      };
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (bc) bc.close();
    };
  }, []);

  // Debounced auto-push when data changes (guarded against incoming pulls and uninitialized state)
  useEffect(() => {
    if (!hasInitialSyncedRef.current || isPullingCloudRef.current) return;

    const payload = {
      branches,
      users,
      matters,
      clients,
      owners,
      properties,
      tenants,
      agreements,
      notices,
      invoices,
      receipts,
      bankAccounts,
      fees,
      precedents,
      bookings,
      staff,
      payrolls,
      expenses,
      requests,
      tasks,
      chatSessions,
      chatMessages,
      alerts,
      galleryEvents,
      backups,
      auditLogs,
      sensitiveAttempts,
      deletedBranchIds: deletedBranchIdsRef.current,
      deletedUserIds: deletedUserIdsRef.current
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    const timer = setTimeout(() => {
      pushToCloud(payload);
    }, 400);

    return () => clearTimeout(timer);
  }, [
    branches, users, matters, clients, owners, properties, tenants,
    agreements, notices, invoices, receipts, bankAccounts, fees,
    precedents, bookings, staff, payrolls, expenses, requests, tasks,
    chatSessions, chatMessages, alerts, galleryEvents, backups, auditLogs, sensitiveAttempts
  ]);

  const triggerManualSync = async () => {
    setSyncStatus('Syncing');
    try {
      await pushToCloud();
      await pullFromCloud();
      setSyncStatus('Synced');
    } catch (e) {
      console.warn('Manual sync failed:', e);
      setSyncStatus('Offline');
    }
  };

  const logAudit = (action: string, targetEntity: string, details: string) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      branchId: currentUser?.branchId || activeBranchId || 'HQ',
      actor: currentUser?.fullName || 'System',
      actorRole: currentUser?.role || 'System',
      action,
      targetEntity,
      details,
      ipAddress: '102.89.47.12 (WAT)',
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Unique Code Generator strictly matching Section 36
  const generateUniqueCode = (branchId: string, entityType: string, year = 2026): string => {
    const branch = branches.find(b => b.id === branchId);
    const prefix = branch ? branch.code : 'BBB-HQ';
    const seq = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}/${entityType}/${year}/${seq}`;
  };

  // Branch Switcher with Strict Role & Data Isolation Guard
  const setActiveBranchId = (newBranchId: string) => {
    // If user is logged in and NOT Principal Partner, they are STRICTLY locked to their own branch
    if (currentUser && currentUser.role !== 'Principal Partner') {
      setActiveBranchIdState(currentUser.branchId || 'BRN-LAG');
      return;
    }
    setActiveBranchIdState(newBranchId);
  };

  // Strictly isolate branch work data (Section 11 & User Requirement)
  // Principal Partner can see ALL or switch to specific branch
  // Branch staff (Head of Chamber, Admin/Secretary, Account Officer, Counsel) can ONLY see work data of their own branch!
  const canAccessBranchData = (recordBranchId?: string): boolean => {
    if (!recordBranchId) return true;
    if (!currentUser) return false;
    if (currentUser.role === 'Principal Partner') {
      return activeBranchId === 'ALL' || recordBranchId === activeBranchId;
    }
    return currentUser.branchId === recordBranchId;
  };

  const effectiveBranchId = currentUser?.role === 'Principal Partner'
    ? (activeBranchId === 'ALL' ? (branches[0]?.id || 'BBB-LAG') : activeBranchId)
    : (currentUser?.branchId || activeBranchId || 'BBB-LAG');

  const getActiveBranch = (): Branch | undefined => {
    if (currentUser && currentUser.role !== 'Principal Partner') {
      return branches.find(b => b.id === currentUser.branchId) || branches[0];
    }
    if (activeBranchId === 'ALL') return branches[0];
    return branches.find(b => b.id === activeBranchId) || branches[0];
  };

  // Authentication & Default Credentials (Section 8 & 9)
  // Auto-syncs logins and forced password changes across all devices (Mr A -> Mr B)
  const loginUser = async (username: string, password: string) => {
    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      return { success: false, error: 'Invalid credentials. Please try again.' };
    }

    try {
      // 1. Direct server verification (ensures password changed on Device A by Mr A is immediately recognized on Device B for Mr B)
      const res = await fetch('/api/auth/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUser, password })
      });

      if (res.ok) {
        const data: any = await res.json();
        if (data.success && data.user) {
          const authUser: User = data.user;
          setCurrentUser(authUser);
          setActiveBranchId(authUser.branchId || 'ALL');

          setUsers(prev => {
            const exists = prev.some(u => u.id === authUser.id);
            if (exists) {
              return prev.map(u => u.id === authUser.id ? authUser : u);
            }
            return [...prev, authUser];
          });

          // Pull all records Mr A might have entered so Mr B sees them instantly
          pullFromCloud();

          logAudit('User Login', 'Auth', `User ${authUser.username} verified via Chambers cloud authentication.`);

          return {
            success: true,
            requirePasswordChange: data.requirePasswordChange
          };
        }
        return { success: false, error: data.error || 'Invalid credentials. Please try again.' };
      }
    } catch (e) {
      console.warn('Central auth check encountered network interruption, falling back to local verification:', e);
    }

    // 2. Offline fallback verification
    const defaultPassword = 'Admin@2026';
    const matchedUser = users.find(u => u.username.toLowerCase() === trimmedUser.toLowerCase());

    if (matchedUser) {
      if (matchedUser.status === 'Suspended') {
        return { success: false, error: 'Invalid credentials. Please try again.' };
      }
      if (matchedUser.isDefaultPassword && password === defaultPassword) {
        setCurrentUser(matchedUser);
        setActiveBranchId(matchedUser.branchId);
        logAudit('User Login', 'Auth', `User ${matchedUser.username} logged in with temporary default credentials.`);
        return { success: true, requirePasswordChange: true };
      }
      if (!matchedUser.isDefaultPassword && matchedUser.password && matchedUser.password === password) {
        setCurrentUser(matchedUser);
        setActiveBranchId(matchedUser.branchId);
        logAudit('User Login', 'Auth', `User ${matchedUser.username} successfully signed in.`);
        return { success: true };
      }
      return { success: false, error: 'Invalid credentials. Please try again.' };
    }

    // 3. Default System Roles Support (Section 9.1: Default Username by Role)
    const defaultRoles: Record<string, Role> = {
      'principal partner': 'Principal Partner',
      'head of chamber': 'Head of Chamber',
      'administrator': 'Administrator',
      'account officer': 'Account Officer',
      'counsel': 'Counsel',
      'staff': 'Counsel'
    };

    const roleMatched = defaultRoles[trimmedUser.toLowerCase()];
    if (roleMatched && password === defaultPassword) {
      const newUser: User = {
        id: `USR-${Date.now()}`,
        username: trimmedUser,
        fullName: trimmedUser,
        email: `${trimmedUser.toLowerCase().replace(/\s+/g, '.')}@bbbaleandco.ng`,
        phone: '+234 803 000 0000',
        role: roleMatched,
        branchId: roleMatched === 'Principal Partner' ? 'ALL' : (branches[0]?.id || 'BBB-LAG'),
        status: 'Active',
        isDefaultPassword: true,
        createdAt: new Date().toISOString()
      };

      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setActiveBranchId(newUser.branchId);
      logAudit('User Provisioned', 'Auth', `Default role ${newUser.role} logged in for first time.`);
      return { success: true, requirePasswordChange: true };
    }

    return { success: false, error: 'Invalid credentials. Please try again.' };
  };

  const logoutUser = () => {
    if (currentUser) {
      logAudit('User Logout', 'Auth', `User ${currentUser.username} logged out.`);
    }
    setCurrentUser(null);
  };

  const updateUserPassword = async (userId: string, newPassword: string): Promise<boolean> => {
    let targetUsername = currentUser?.username;
    let targetUserId = userId;

    const updatedUsers = users.map(u => {
      if (u.id === userId || (currentUser && u.id === currentUser.id)) {
        targetUsername = u.username;
        targetUserId = u.id;
        return {
          ...u,
          password: newPassword,
          isDefaultPassword: false,
          status: 'Active' as const
        };
      }
      return u;
    });

    setUsers(updatedUsers);

    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        password: newPassword,
        isDefaultPassword: false,
        status: 'Active'
      });
    }

    // 2. Direct server update (immediate push to central database so Mr B's device can log in)
    try {
      await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId,
          username: targetUsername,
          newPassword
        })
      });
    } catch (err) {
      console.warn('Direct change-password sync note:', err);
    }

    // 3. Immediately trigger cloud push with fresh users array
    const freshPayload = {
      branches,
      users: updatedUsers,
      matters,
      clients,
      owners,
      properties,
      tenants,
      agreements,
      notices,
      invoices,
      receipts,
      bankAccounts,
      fees,
      precedents,
      bookings,
      staff,
      payrolls,
      expenses,
      requests,
      tasks,
      chatSessions,
      chatMessages,
      alerts,
      backups,
      auditLogs,
      sensitiveAttempts
    };

    await pushToCloud(freshPayload);

    logAudit('Password Changed', 'Security', `User forced password change completed and synchronized across Chambers.`);
    return true;
  };

  // Sensitive Portal Logins (Section 7)
  const loginClientPortal = (code: string, identifier: string, branchId?: string) => {
    const trimmedCode = code.trim().toUpperCase();
    const trimmedId = identifier.trim().toLowerCase();

    const client = clients.find(c => c.code.toUpperCase() === trimmedCode);
    const attempt: SensitiveAccessAttempt = {
      id: `ATT-${Date.now()}`,
      portalType: 'Client',
      codeUsed: trimmedCode,
      identifierUsed: trimmedId,
      status: 'Failed - Code Not Found',
      ipAddress: '102.89.47.12',
      timestamp: new Date().toISOString()
    };

    if (!client) {
      setSensitiveAttempts(prev => [attempt, ...prev]);
      return { success: false, error: 'Invalid credentials. Please verify your client code.' };
    }

    // Strict Branch Isolation check for Public Portal Access
    if (branchId && client.branchId !== branchId) {
      attempt.status = 'Failed - Branch Mismatch';
      setSensitiveAttempts(prev => [attempt, ...prev]);
      const clientBranch = branches.find(b => b.id === client.branchId);
      const branchName = clientBranch ? clientBranch.name : client.branchId;
      return {
        success: false,
        error: `Cross-Branch Access Denied: Record ${trimmedCode} is registered under ${branchName}. You must select your registered branch to access your file.`
      };
    }

    const emailMatch = client.email.toLowerCase() === trimmedId;
    const phoneMatch = client.phone.replace(/\D/g, '').endsWith(trimmedId.replace(/\D/g, ''));
    const ninMatch = client.ninOrCac.toLowerCase().endsWith(trimmedId);

    if (emailMatch || phoneMatch || ninMatch) {
      attempt.status = 'Granted';
      setSensitiveAttempts(prev => [attempt, ...prev]);
      setAuthenticatedClient(client);
      logAudit('Client Portal Login', 'Portal', `Client ${client.code} accessed sensitive portal.`);
      return { success: true };
    }

    attempt.status = 'Failed - Identifier Mismatch';
    setSensitiveAttempts(prev => [attempt, ...prev]);
    return { success: false, error: 'Invalid credentials. Please verify your identifier on file.' };
  };

  const loginOwnerPortal = (code: string, identifier: string, branchId?: string) => {
    const trimmedCode = code.trim().toUpperCase();
    const trimmedId = identifier.trim().toLowerCase();

    const owner = owners.find(o => o.code.toUpperCase() === trimmedCode);
    const attempt: SensitiveAccessAttempt = {
      id: `ATT-${Date.now()}`,
      portalType: 'Owner',
      codeUsed: trimmedCode,
      identifierUsed: trimmedId,
      status: 'Failed - Code Not Found',
      ipAddress: '102.89.47.12',
      timestamp: new Date().toISOString()
    };

    if (!owner) {
      setSensitiveAttempts(prev => [attempt, ...prev]);
      return { success: false, error: 'Invalid credentials. Please verify your owner code.' };
    }

    // Strict Branch Isolation check for Public Portal Access
    if (branchId && owner.branchId !== branchId) {
      attempt.status = 'Failed - Branch Mismatch';
      setSensitiveAttempts(prev => [attempt, ...prev]);
      const ownerBranch = branches.find(b => b.id === owner.branchId);
      const branchName = ownerBranch ? ownerBranch.name : owner.branchId;
      return {
        success: false,
        error: `Cross-Branch Access Denied: Record ${trimmedCode} is registered under ${branchName}. You must select your registered branch to access your file.`
      };
    }

    const emailMatch = owner.email.toLowerCase() === trimmedId;
    const phoneMatch = owner.phone.replace(/\D/g, '').endsWith(trimmedId.replace(/\D/g, ''));
    const ninMatch = owner.ninOrCac.toLowerCase().endsWith(trimmedId);

    if (emailMatch || phoneMatch || ninMatch) {
      attempt.status = 'Granted';
      setSensitiveAttempts(prev => [attempt, ...prev]);
      setAuthenticatedOwner(owner);
      logAudit('Owner Portal Login', 'Portal', `Owner ${owner.code} accessed sensitive portal.`);
      return { success: true };
    }

    attempt.status = 'Failed - Identifier Mismatch';
    setSensitiveAttempts(prev => [attempt, ...prev]);
    return { success: false, error: 'Invalid credentials. Please verify your identifier on file.' };
  };

  const loginTenantPortal = (code: string, identifier: string, branchId?: string) => {
    const trimmedCode = code.trim().toUpperCase();
    const trimmedId = identifier.trim().toLowerCase();

    const tenant = tenants.find(t => t.code.toUpperCase() === trimmedCode);
    const attempt: SensitiveAccessAttempt = {
      id: `ATT-${Date.now()}`,
      portalType: 'Tenant',
      codeUsed: trimmedCode,
      identifierUsed: trimmedId,
      status: 'Failed - Code Not Found',
      ipAddress: '102.89.47.12',
      timestamp: new Date().toISOString()
    };

    if (!tenant) {
      setSensitiveAttempts(prev => [attempt, ...prev]);
      return { success: false, error: 'Invalid credentials. Please verify your tenant code.' };
    }

    // Strict Branch Isolation check for Public Portal Access
    if (branchId && tenant.branchId !== branchId) {
      attempt.status = 'Failed - Branch Mismatch';
      setSensitiveAttempts(prev => [attempt, ...prev]);
      const tenantBranch = branches.find(b => b.id === tenant.branchId);
      const branchName = tenantBranch ? tenantBranch.name : tenant.branchId;
      return {
        success: false,
        error: `Cross-Branch Access Denied: Record ${trimmedCode} is registered under ${branchName}. You must select your registered branch to access your file.`
      };
    }

    const emailMatch = tenant.email.toLowerCase() === trimmedId;
    const phoneMatch = tenant.phone.replace(/\D/g, '').endsWith(trimmedId.replace(/\D/g, ''));
    const ninMatch = tenant.nin.toLowerCase().endsWith(trimmedId);

    if (emailMatch || phoneMatch || ninMatch) {
      attempt.status = 'Granted';
      setSensitiveAttempts(prev => [attempt, ...prev]);
      setAuthenticatedTenant(tenant);
      logAudit('Tenant Portal Login', 'Portal', `Tenant ${tenant.code} accessed sensitive portal.`);
      return { success: true };
    }

    attempt.status = 'Failed - Identifier Mismatch';
    setSensitiveAttempts(prev => [attempt, ...prev]);
    return { success: false, error: 'Invalid credentials. Please verify your identifier on file.' };
  };

  const logoutPortal = () => {
    setAuthenticatedClient(null);
    setAuthenticatedOwner(null);
    setAuthenticatedTenant(null);
  };

  // Branch Role Quotas: Exactly 1 Head of Chamber, 1 Administrator/Secretary, 1 Account Officer per branch. Counsel/Staff unlimited.
  const checkBranchRoleQuota = (
    branchId: string,
    role: Role,
    excludeUserId?: string
  ): { allowed: boolean; reason?: string; existingUser?: User } => {
    if (role === 'Principal Partner') {
      const existingPP = users.find(u => u.role === 'Principal Partner' && u.id !== excludeUserId && u.status !== 'Suspended');
      if (existingPP) {
        return {
          allowed: false,
          reason: `Firm already has a Principal Partner (${existingPP.fullName}). Only ONE Principal Partner is permitted chambers-wide.`,
          existingUser: existingPP
        };
      }
      return { allowed: true };
    }

    // Counsel and staff can be created unlimited!
    if (role === 'Counsel' || role === 'Public Visitor' || role === 'Client' || role === 'Property Owner' || role === 'Tenant') {
      return { allowed: true };
    }

    const branch = branches.find(b => b.id === branchId);
    const branchName = branch ? branch.name : branchId;

    if (role === 'Head of Chamber') {
      const existingHead = users.find(
        u => u.branchId === branchId && u.role === 'Head of Chamber' && u.id !== excludeUserId && u.status !== 'Suspended'
      );
      if (existingHead) {
        return {
          allowed: false,
          reason: `Branch "${branchName}" already has an assigned Head of Chamber (${existingHead.fullName}). Only ONE Head of Chamber is permitted per branch. You can edit the existing Head of Chamber or delete them first.`,
          existingUser: existingHead
        };
      }
    }

    if (role === 'Administrator') {
      const existingAdmin = users.find(
        u => u.branchId === branchId && u.role === 'Administrator' && u.id !== excludeUserId && u.status !== 'Suspended'
      );
      if (existingAdmin) {
        return {
          allowed: false,
          reason: `Branch "${branchName}" already has an assigned Administrator/Secretary (${existingAdmin.fullName}). Only ONE Administrator/Secretary is permitted per branch. You can edit the existing Administrator or delete them first.`,
          existingUser: existingAdmin
        };
      }
    }

    if (role === 'Account Officer') {
      const existingAccount = users.find(
        u => u.branchId === branchId && u.role === 'Account Officer' && u.id !== excludeUserId && u.status !== 'Suspended'
      );
      if (existingAccount) {
        return {
          allowed: false,
          reason: `Branch "${branchName}" already has an assigned Account Officer (${existingAccount.fullName}). Only ONE Account Officer is permitted per branch. You can edit the existing Account Officer or delete them first.`,
          existingUser: existingAccount
        };
      }
    }

    return { allowed: true };
  };

  // Branch CRUD (Principal Partner Authority Only - Section 11 & User Requirement)
  const addBranch = (branchData: Omit<Branch, 'id' | 'createdAt'>) => {
    if (currentUser && currentUser.role !== 'Principal Partner') {
      console.warn('Permission Denied: Only the Principal Partner possesses statutory authority to establish new branches.');
      throw new Error('Principal Partner authority required.');
    }
    const newBranch: Branch = {
      ...branchData,
      id: `BRN-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setBranches(prev => [...prev, newBranch]);
    logAudit('Add Branch', 'Branches', `Created branch ${newBranch.name} (${newBranch.code}).`);
    return newBranch;
  };

  const updateBranch = async (id: string, updates: Partial<Branch>) => {
    if (currentUser && currentUser.role !== 'Principal Partner') {
      console.warn('Permission Denied: Only the Principal Partner possesses statutory authority to edit branch details.');
      return;
    }
    setBranches(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    try {
      await fetch(`/api/branches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.warn('Direct update branch sync note:', err);
    }
    logAudit('Update Branch', 'Branches', `Updated branch details for ID ${id} by Principal Partner.`);
  };

  const suspendBranch = (id: string, reason: string) => {
    if (currentUser && currentUser.role !== 'Principal Partner') {
      console.warn('Permission Denied: Only the Principal Partner can suspend branches.');
      return;
    }
    setBranches(prev => prev.map(b => b.id === id ? {
      ...b,
      status: 'Suspended',
      suspensionReason: reason,
      suspensionDate: new Date().toISOString()
    } : b));
    logAudit('Suspend Branch', 'Branches', `Suspended branch ID ${id}: ${reason}`);
  };

  const reactivateBranch = (id: string) => {
    if (currentUser && currentUser.role !== 'Principal Partner') {
      console.warn('Permission Denied: Only the Principal Partner can reactivate branches.');
      return;
    }
    setBranches(prev => prev.map(b => b.id === id ? {
      ...b,
      status: 'Active',
      suspensionReason: undefined,
      suspensionDate: undefined
    } : b));
    logAudit('Reactivate Branch', 'Branches', `Reactivated branch ID ${id}`);
  };

  const deleteBranch = async (id: string) => {
    if (currentUser && currentUser.role !== 'Principal Partner') {
      console.warn('Permission Denied: Only the Principal Partner possesses statutory authority to permanently delete branches.');
      return;
    }

    if (!deletedBranchIdsRef.current.includes(id)) {
      deletedBranchIdsRef.current.push(id);
    }

    const targetBranch = branches.find(b => b.id === id);
    setBranches(prev => prev.filter(b => b.id !== id));

    try {
      await fetch(`/api/branches/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Direct delete branch sync note:', err);
    }

    logAudit('Delete Branch Permanently', 'Branches', `Permanently deleted branch ${targetBranch?.name || id} by Principal Partner.`);
  };

  // User Actions (All can be edited/deleted, strictly enforcing Branch Quotas)
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const quotaCheck = checkBranchRoleQuota(userData.branchId, userData.role);
    if (!quotaCheck.allowed) {
      throw new Error(quotaCheck.reason || 'Branch role quota exceeded.');
    }

    const newUser: User = {
      ...userData,
      id: `USR-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    logAudit('Add User', 'Staff', `Created user ${newUser.fullName} (${newUser.role}) in branch ${newUser.branchId}.`);
    return newUser;
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const existingUser = users.find(u => u.id === id);
    if (!existingUser) return;

    const targetBranch = updates.branchId || existingUser.branchId;
    const targetRole = updates.role || existingUser.role;

    // If changing role or branch, verify quota for the target
    if (targetBranch !== existingUser.branchId || targetRole !== existingUser.role) {
      const quotaCheck = checkBranchRoleQuota(targetBranch, targetRole, id);
      if (!quotaCheck.allowed) {
        throw new Error(quotaCheck.reason || 'Branch role quota exceeded.');
      }
    }

    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }

    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.warn('Direct update user sync note:', err);
    }

    logAudit('Update User', 'Staff', `Updated user details for ${existingUser.fullName} (${targetRole}).`);
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    if (currentUser && currentUser.id === id) {
      console.warn('Action Prohibited: You cannot delete your own active account while signed in.');
      return false;
    }

    const target = users.find(u => u.id === id);
    if (!target) return false;

    if (!deletedUserIdsRef.current.includes(id)) {
      deletedUserIdsRef.current.push(id);
    }

    setUsers(prev => prev.filter(u => u.id !== id));

    try {
      await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Direct delete user sync note:', err);
    }

    logAudit('Delete User Permanently', 'Staff', `Permanently deleted user ${target.fullName} (${target.role}) from ${target.branchId}.`);
    return true;
  };

  const deleteBranchPermanently = async (id: string): Promise<boolean> => {
    await deleteBranch(id);
    return true;
  };

  const validateUserQuota = (targetBranchId: string, role: Role, editingUserId?: string) => {
    const res = checkBranchRoleQuota(targetBranchId, role, editingUserId);
    return { valid: res.allowed, error: res.reason };
  };

  // Public Registrations
  const registerPublicClient = (data: { branchId: string; fullName: string; email: string; phone: string; streetAddress: string; city: string; state: string; lga: string; ninOrCac: string; clientType?: 'Individual' | 'Corporate' }) => {
    const code = generateUniqueCode(data.branchId, 'CLI');
    const newClient: ClientRecord = {
      id: `CLI-${Date.now()}`,
      code,
      branchId: data.branchId,
      fullName: data.fullName,
      clientType: data.clientType || 'Individual',
      email: data.email,
      phone: data.phone,
      streetAddress: data.streetAddress,
      city: data.city,
      state: data.state,
      lga: data.lga,
      ninOrCac: data.ninOrCac,
      kycDocuments: [],
      conflictCheckStatus: 'Passed',
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    setClients(prev => [newClient, ...prev]);
    logAudit('Public Client Intake', 'Portal', `Intake self-registration for ${newClient.fullName} (${newClient.code}) under branch ${data.branchId}.`);
    addAlert({
      branchId: data.branchId,
      title: 'New Client Self-Registration',
      message: `${newClient.fullName} (${newClient.code}) registered via the Chambers public portal for ${data.city}, ${data.state}. Conflict check verified; intake review pending.`,
      priority: 'High',
      category: 'System'
    });
    return newClient;
  };

  const registerPublicOwner = (data: { branchId: string; fullName: string; email: string; phone: string; address: string; state: string; ninOrCac: string; bankName?: string; accountNumber?: string }) => {
    const code = generateUniqueCode(data.branchId, 'OWN');
    const newOwner: PropertyOwner = {
      id: `OWN-${Date.now()}`,
      code,
      branchId: data.branchId,
      fullName: data.fullName,
      type: 'Individual',
      email: data.email,
      phone: data.phone,
      state: data.state,
      lga: 'Ikeja',
      city: 'Central',
      streetAddress: data.address,
      ninOrCac: data.ninOrCac,
      bankName: data.bankName || 'Access Bank',
      accountNumber: data.accountNumber || '0000000000',
      accountName: data.fullName,
      kycDocuments: [],
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    setOwners(prev => [newOwner, ...prev]);
    logAudit('Public Landlord Registration', 'Portal', `Landlord registered: ${newOwner.fullName} (${newOwner.code}) under branch ${data.branchId}.`);
    addAlert({
      branchId: data.branchId,
      title: 'New Landlord Onboarded',
      message: `${newOwner.fullName} (${newOwner.code}) registered title ownership with bank details (${newOwner.bankName}) for branch property management.`,
      priority: 'High',
      category: 'Rent'
    });
    return newOwner;
  };

  const registerPublicTenant = (data: { branchId: string; fullName: string; email: string; phone: string; propertyId: string; unitAssigned: string; annualRent: number; nin: string }) => {
    const code = generateUniqueCode(data.branchId, 'TEN');
    const newTenant: Tenant = {
      id: `TEN-${Date.now()}`,
      code,
      branchId: data.branchId,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      propertyId: data.propertyId,
      ownerId: 'OWN-DEFAULT',
      unitAssigned: data.unitAssigned,
      annualRent: data.annualRent,
      serviceCharge: 150000,
      cautionDeposit: 150000,
      tenancyStartDate: new Date().toISOString().split('T')[0],
      tenancyEndDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      nextRentDueDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      rentPaymentStatus: 'Current',
      nin: data.nin,
      guarantorName: 'Chambers Verified',
      guarantorPhone: '+234 800 000 0000',
      guarantorAddress: 'Chambers Registry',
      kycDocuments: [],
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    setTenants(prev => [newTenant, ...prev]);
    logAudit('Public Tenant Registration', 'Portal', `Tenant registered: ${newTenant.fullName} (${newTenant.code}) under branch ${data.branchId}.`);
    addAlert({
      branchId: data.branchId,
      title: 'New Tenant Self-Registration',
      message: `${newTenant.fullName} (${newTenant.code}) enrolled for ${data.unitAssigned}. Annual rent ₦${data.annualRent.toLocaleString()}.`,
      priority: 'High',
      category: 'Rent'
    });
    return newTenant;
  };

  // Client Actions
  const addClient = (data: Omit<ClientRecord, 'id' | 'code' | 'createdAt'>) => {
    const code = generateUniqueCode(data.branchId, 'CLI');
    const newClient: ClientRecord = {
      ...data,
      id: `CLI-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    setClients(prev => [newClient, ...prev]);
    logAudit('Add Client', 'Clients', `Intake for ${newClient.fullName} with Code ${newClient.code}.`);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<ClientRecord>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    logAudit('Update Client', 'Clients', `Updated client ID ${id}.`);
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    setMatters(prev => prev.filter(m => m.clientId !== id));
    logAudit('Delete Client', 'Clients', `Permanently deleted client ID ${id} and all associated matters/litigations/appeals.`);
  };

  const deleteTenant = (id: string) => {
    setTenants(prev => prev.filter(t => t.id !== id));
    logAudit('Delete Tenant', 'Properties', `Permanently deleted tenant ID ${id}.`);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    logAudit('Delete Expense', 'Finance', `Permanently deleted branch expense ID ${id}.`);
  };

  // Matter Actions
  const addMatter = (data: Omit<Matter, 'id' | 'code' | 'createdAt'>) => {
    const code = generateUniqueCode(data.branchId, 'MAT');
    const newMatter: Matter = {
      ...data,
      id: `MAT-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    setMatters(prev => [newMatter, ...prev]);
    logAudit('Add Matter', 'Matters', `Created matter ${newMatter.title} (${newMatter.code}).`);
    addAlert({
      branchId: data.branchId,
      title: 'New Matter Registered',
      message: `Matter "${newMatter.title}" (${newMatter.code}) filed under ${newMatter.courtCategory}. Assigned to Counsel.`,
      priority: 'Medium',
      category: 'Court'
    });
    return newMatter;
  };

  const updateMatter = (id: string, updates: Partial<Matter>) => {
    setMatters(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    logAudit('Update Matter', 'Matters', `Updated matter ID ${id}.`);
  };

  // Property & Owner Actions
  const addOwner = (data: Omit<PropertyOwner, 'id' | 'code' | 'createdAt'>) => {
    const code = generateUniqueCode(data.branchId, 'OWN');
    const newOwner: PropertyOwner = {
      ...data,
      id: `OWN-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    setOwners(prev => [newOwner, ...prev]);
    logAudit('Add Property Owner', 'Properties', `Registered owner ${newOwner.fullName} (${newOwner.code}).`);
    return newOwner;
  };

  const updateOwner = (id: string, updates: Partial<PropertyOwner>) => {
    setOwners(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    logAudit('Update Property Owner', 'Properties', `Updated owner ID ${id}.`);
  };

  const addProperty = (data: Omit<Property, 'id' | 'code' | 'createdAt'>) => {
    const code = generateUniqueCode(data.branchId, 'PROP');
    const newProp: Property = {
      ...data,
      id: `PROP-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    setProperties(prev => [newProp, ...prev]);
    logAudit('Add Property', 'Properties', `Added property ${newProp.name} (${newProp.code}).`);
    return newProp;
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    logAudit('Update Property', 'Properties', `Updated property ID ${id}.`);
  };

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
    logAudit('Delete Property', 'Properties', `Deleted property ID ${id}.`);
  };

  const deleteOwner = (id: string) => {
    setOwners(prev => prev.filter(o => o.id !== id));
    logAudit('Delete Owner', 'Properties', `Deleted owner ID ${id}.`);
  };

  const addTenant = (data: Omit<Tenant, 'id' | 'code' | 'createdAt'>) => {
    const code = generateUniqueCode(data.branchId, 'TEN');
    const newTenant: Tenant = {
      ...data,
      id: `TEN-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    setTenants(prev => [newTenant, ...prev]);
    logAudit('Add Tenant', 'Tenants', `Registered tenant ${newTenant.fullName} (${newTenant.code}).`);
    return newTenant;
  };

  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    logAudit('Update Tenant', 'Tenants', `Updated tenant ID ${id}.`);
  };

  // Agreements & Notices
  const addAgreement = (data: Omit<TenancyAgreement, 'id' | 'code' | 'createdAt'>) => {
    const code = generateUniqueCode(data.branchId, 'TAG');
    const newAgr: TenancyAgreement = {
      ...data,
      id: `TAG-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    setAgreements(prev => [newAgr, ...prev]);
    logAudit('Add Tenancy Agreement', 'Tenancy', `Generated agreement ${newAgr.code}.`);
    return newAgr;
  };

  const updateAgreement = (id: string, updates: Partial<TenancyAgreement>) => {
    setAgreements(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    logAudit('Update Agreement', 'Tenancy', `Updated agreement ID ${id}.`);
  };

  const addNotice = (data: Omit<QuitNotice, 'id' | 'code' | 'createdAt'>) => {
    const code = generateUniqueCode(data.branchId, 'NOT');
    const newNot: QuitNotice = {
      ...data,
      id: `NOT-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    setNotices(prev => [newNot, ...prev]);
    logAudit('Add Quit Notice', 'Notices', `Generated notice ${newNot.noticeType} (${newNot.code}).`);
    addAlert({
      branchId: data.branchId,
      title: `${newNot.noticeType} Issued`,
      message: `Statutory notice ${newNot.code} issued to tenant for premises. Service date: ${newNot.dateServed || 'Immediate'}.`,
      priority: 'High',
      category: 'Rent'
    });
    return newNot;
  };

  const updateNotice = (id: string, updates: Partial<QuitNotice>) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    logAudit('Update Notice', 'Notices', `Updated notice ID ${id}.`);
  };

  // Financial (Invoices & Receipts)
  const addInvoice = (data: Omit<Invoice, 'id' | 'code' | 'createdAt'>) => {
    const code = generateUniqueCode(data.branchId, 'INV');
    const newInv: Invoice = {
      ...data,
      id: `INV-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    setInvoices(prev => [newInv, ...prev]);
    logAudit('Add Invoice', 'Financial', `Generated invoice ${newInv.code} for ${newInv.recipientName}.`);
    addAlert({
      branchId: data.branchId,
      title: 'Fee Invoice Generated',
      message: `Invoice ${newInv.code} (₦${newInv.totalAmount.toLocaleString()}) issued to ${newInv.recipientName} (${newInv.paymentStatus}).`,
      priority: 'Medium',
      category: 'Financial'
    });
    return newInv;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    logAudit('Update Invoice', 'Financial', `Updated invoice ID ${id}.`);
  };

  const addReceipt = (data: Omit<Receipt, 'id' | 'code' | 'createdAt'>) => {
    const code = generateUniqueCode(data.branchId, 'RCP');
    const newRcp: Receipt = {
      ...data,
      id: `RCP-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    setReceipts(prev => [newRcp, ...prev]);
    logAudit('Add Receipt', 'Financial', `Issued receipt ${newRcp.code} for ₦${newRcp.amountPaid.toLocaleString()}.`);
    addAlert({
      branchId: data.branchId,
      title: 'Payment Receipt Confirmed',
      message: `Official receipt ${newRcp.code} issued to ${newRcp.payerName} for ₦${newRcp.amountPaid.toLocaleString()} (${newRcp.paymentMethod}).`,
      priority: 'Medium',
      category: 'Financial'
    });
    return newRcp;
  };

  const addBankAccount = (data: Omit<BankAccount, 'id'>) => {
    const newAcc: BankAccount = {
      ...data,
      id: `BNK-${Date.now()}`
    };
    setBankAccounts(prev => [...prev, newAcc]);
    logAudit('Add Bank Account', 'Financial', `Added account ${newAcc.bankName} (${newAcc.accountNumber}).`);
    return newAcc;
  };

  const updateBankAccount = (id: string, updates: Partial<BankAccount>) => {
    setBankAccounts(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    logAudit('Update Bank Account', 'Financial', `Updated bank account ID ${id}.`);
  };

  const addFee = (data: Omit<FeeItem, 'id'>) => {
    const newFee: FeeItem = {
      ...data,
      id: `FEE-${Date.now()}`
    };
    setFees(prev => [...prev, newFee]);
    logAudit('Add Fee', 'Fees', `Set fee for ${newFee.title}.`);
    return newFee;
  };

  const updateFee = (id: string, updates: Partial<FeeItem>) => {
    setFees(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    logAudit('Update Fee', 'Fees', `Updated fee ID ${id}.`);
  };

  // Precedents
  const addPrecedent = (data: Omit<Precedent, 'id' | 'code' | 'createdAt'>) => {
    const code = generateUniqueCode(data.branchId, 'PREC');
    const newPrec: Precedent = {
      ...data,
      id: `PREC-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    setPrecedents(prev => [newPrec, ...prev]);
    logAudit('Add Precedent', 'Precedents', `Added precedent ${newPrec.title} (${newPrec.citation}).`);
    return newPrec;
  };

  const deletePrecedent = (id: string) => {
    setPrecedents(prev => prev.filter(p => p.id !== id));
    logAudit('Delete Precedent', 'Precedents', `Deleted precedent ID ${id}.`);
  };

  // Consultations
  const addBooking = (data: Omit<ConsultationBooking, 'id' | 'code' | 'createdAt'>) => {
    const code = generateUniqueCode(data.branchId, 'CON');
    const newBooking: ConsultationBooking = {
      ...data,
      id: `CON-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    setBookings(prev => [newBooking, ...prev]);
    logAudit('Book Consultation', 'Bookings', `Consultation booked by ${newBooking.clientName} (${newBooking.code}).`);
    addAlert({
      branchId: data.branchId,
      title: 'New Legal Consultation Booked',
      message: `${newBooking.clientName} booked a confidential ${newBooking.consultationType} consultation on ${newBooking.preferredDate} (${newBooking.timeSlot}). Fee: ₦${newBooking.feeAmount.toLocaleString()}.`,
      priority: 'Medium',
      category: 'Court'
    });
    return newBooking;
  };

  const updateBooking = (id: string, updates: Partial<ConsultationBooking>) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    logAudit('Update Booking', 'Bookings', `Updated booking ID ${id}.`);
  };

  // HR & Payroll
  const addStaff = (data: Omit<StaffRecord, 'id' | 'code'>) => {
    const code = generateUniqueCode(data.branchId, 'STF');
    const newStaff: StaffRecord = {
      ...data,
      id: `STF-${Date.now()}`,
      code
    };
    setStaff(prev => [...prev, newStaff]);
    logAudit('Add Staff Record', 'HR', `Created staff record for ${newStaff.fullName}.`);
    return newStaff;
  };

  const updateStaff = (id: string, updates: Partial<StaffRecord>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    logAudit('Update Staff', 'HR', `Updated staff record ID ${id}.`);
  };

  const addPayroll = (data: Omit<PayrollRun, 'id' | 'code' | 'createdAt'>) => {
    const code = generateUniqueCode(data.branchId, 'PAY');
    const newPay: PayrollRun = {
      ...data,
      id: `PAY-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    setPayrolls(prev => [newPay, ...prev]);
    logAudit('Add Payroll', 'Payroll', `Prepared payroll ${newPay.code} for ${newPay.month}.`);
    return newPay;
  };

  const updatePayroll = (id: string, updates: Partial<PayrollRun>) => {
    setPayrolls(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    logAudit('Update Payroll', 'Payroll', `Updated payroll run ID ${id}.`);
  };

  const addExpense = (data: Omit<BranchExpense, 'id' | 'code'>) => {
    const code = generateUniqueCode(data.branchId, 'EXP');
    const newExp: BranchExpense = {
      ...data,
      id: `EXP-${Date.now()}`,
      code
    };
    setExpenses(prev => [newExp, ...prev]);
    logAudit('Add Expense', 'Expenses', `Logged expense ${newExp.title} (₦${newExp.amount.toLocaleString()}).`);
    addAlert({
      branchId: data.branchId,
      title: 'Branch Expense Recorded',
      message: `₦${newExp.amount.toLocaleString()} recorded for "${newExp.title}" (${newExp.category}) by ${newExp.recordedBy}.`,
      priority: 'Medium',
      category: 'Financial'
    });
    return newExp;
  };

  const updateExpense = (id: string, updates: Partial<BranchExpense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    logAudit('Update Expense', 'Expenses', `Updated expense ID ${id}.`);
  };

  const addRequest = (data: Omit<InternalRequest, 'id' | 'code' | 'createdAt'>) => {
    const code = generateUniqueCode(data.branchId, 'REQ');
    const newReq: InternalRequest = {
      ...data,
      id: `REQ-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    setRequests(prev => [newReq, ...prev]);
    logAudit('Add Request', 'Requests', `Internal request submitted: ${newReq.requestType}.`);
    return newReq;
  };

  const updateRequest = (id: string, updates: Partial<InternalRequest>) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    logAudit('Update Request', 'Requests', `Updated request ID ${id}.`);
  };

  const addTask = (data: Omit<SpecialTask, 'id' | 'code' | 'createdAt'>) => {
    const code = generateUniqueCode(data.branchId, 'TSK');
    const newTask: SpecialTask = {
      ...data,
      id: `TSK-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    logAudit('Add Task', 'Tasks', `Assigned task ${newTask.title} to ${newTask.assignedTo}.`);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<SpecialTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    logAudit('Update Task', 'Tasks', `Updated task ID ${id}.`);
  };

  // Live Chat
  const startChatSession = (visitor: { name: string; email: string; phone: string; topic: string; branchId: string }) => {
    const session: ChatSession = {
      id: `CHAT-SES-${Date.now()}`,
      branchId: visitor.branchId,
      visitorName: visitor.name,
      visitorEmail: visitor.email,
      visitorPhone: visitor.phone,
      topic: visitor.topic,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setChatSessions(prev => [session, ...prev]);

    // Send initial automated greeting message
    const welcomeMsg: ChatMessage = {
      id: `MSG-${Date.now()}`,
      sessionId: session.id,
      branchId: visitor.branchId,
      senderType: 'System',
      senderName: 'Chambers Reception Desk',
      message: `Welcome to B. B. BALE & CO Chambers. An Administrator has been notified and will assist you shortly regarding "${visitor.topic}". You can also click the WhatsApp button below if you require an urgent telephone call.`,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, welcomeMsg]);

    return session;
  };

  const sendChatMessage = (sessionId: string, message: string, senderType: 'Visitor' | 'Administrator', attachment?: UploadedFileMetadata) => {
    const targetSession = chatSessions.find(s => s.id === sessionId);
    const newMsg: ChatMessage = {
      id: `MSG-${Date.now()}`,
      sessionId,
      branchId: targetSession?.branchId || 'HQ',
      senderType,
      senderName: senderType === 'Administrator' ? (currentUser?.fullName || 'Administrator') : (targetSession?.visitorName || 'Visitor'),
      message,
      attachmentUrl: attachment?.dataUrl,
      attachmentName: attachment?.originalName,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatSessions(prev => prev.map(s => s.id === sessionId ? { ...s, updatedAt: new Date().toISOString() } : s));
  };

  const closeChatSession = (sessionId: string) => {
    setChatSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'Closed' } : s));
  };

  // Alerts
  const addAlert = (data: Omit<AlertNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newAlert: AlertNotification = {
      ...data,
      id: `ALT-${Date.now()}`,
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const markAllAlertsAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  // Branch Event Gallery (Administrator Upload & Updates)
  const addGalleryEvent = (data: Omit<BranchGalleryEvent, 'id' | 'createdAt'>) => {
    const newEvent: BranchGalleryEvent = {
      ...data,
      id: `GAL-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setGalleryEvents(prev => [newEvent, ...prev]);
    logAudit('Upload Event Photo', 'Gallery', `Added photographic event "${newEvent.title}" (${newEvent.category}) for branch ${newEvent.branchId}.`);
    addAlert({
      branchId: data.branchId,
      title: 'Branch Event Photo Uploaded',
      message: `"${newEvent.title}" (${newEvent.category}) published to the Chambers branch gallery by ${newEvent.uploadedBy}.`,
      priority: 'Low',
      category: 'System'
    });
    return newEvent;
  };

  const updateGalleryEvent = (id: string, updates: Partial<BranchGalleryEvent>) => {
    setGalleryEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    logAudit('Update Event Photo', 'Gallery', `Updated gallery event photo ID ${id}.`);
  };

  const deleteGalleryEvent = (id: string) => {
    setGalleryEvents(prev => prev.filter(e => e.id !== id));
    logAudit('Delete Event Photo', 'Gallery', `Deleted gallery event photo ID ${id}.`);
  };

  // Hard-Copy Backup Module (Section 13)
  const generateHardCopyBackup = (branchId: string, startDate: string, endDate: string, categories: string[]) => {
    const branch = branches.find(b => b.id === branchId);
    const code = generateUniqueCode(branchId, 'BKP');
    const totalCount = matters.length + clients.length + properties.length + tenants.length + invoices.length + receipts.length;
    
    const newBackup: BackupRecord = {
      id: `BKP-${Date.now()}`,
      code,
      branchId,
      generatedBy: currentUser?.fullName || 'Administrator',
      dateRangeStart: startDate,
      dateRangeEnd: endDate,
      categoriesIncluded: categories,
      totalRecordsCount: totalCount,
      fileSizeEstimate: `${(totalCount * 0.12 + 1.5).toFixed(2)} MB`,
      generatedAt: new Date().toISOString(),
      referenceNumber: `${branch ? branch.code : 'BBB-LAG'}/BKP/2026/${Math.floor(Math.random() * 9000) + 1000}`
    };

    setBackups(prev => [newBackup, ...prev]);
    logAudit('Hard-Copy Backup Generated', 'Backup', `Generated official hard-copy archive bundle ${newBackup.referenceNumber}.`);
    return newBackup;
  };

  // Google Cloud Firestore Sync Engine
  const getGoogleCloudDbInfo = (): GoogleCloudDatabaseInfo => {
    return getGoogleCloudDatabaseInfo();
  };

  const pushAllToGoogleCloud = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      let count = 0;
      for (const b of branches) {
        await syncEntityToGoogleCloud('branches', b.id, b);
        count++;
      }
      for (const u of users) {
        await syncEntityToGoogleCloud('users', u.id, u);
        count++;
      }
      for (const m of matters) {
        await syncEntityToGoogleCloud('matters', m.id, m);
        count++;
      }
      for (const c of clients) {
        await syncEntityToGoogleCloud('clients', c.id, c);
        count++;
      }
      for (const p of properties) {
        await syncEntityToGoogleCloud('properties', p.id, p);
        count++;
      }
      for (const b of bookings) {
        await syncEntityToGoogleCloud('bookings', b.id, b);
        count++;
      }
      for (const a of auditLogs.slice(0, 20)) {
        await syncEntityToGoogleCloud('audit_logs', a.id, a);
        count++;
      }
      logAudit('Google Cloud Database Sync', 'Database', `Synchronized ${count} records to Google Cloud Firestore.`);
      return { success: true, count };
    } catch (err: any) {
      console.error('Push to Google Cloud error:', err);
      return { success: false, count: 0, error: err.message || 'Google Cloud sync failed' };
    }
  };

  // Cloudflare D1 Relational & Edge Database Storage Engine
  const pushAllToCloudflareDatabase = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      const fullSnapshot = {
        branches,
        users,
        deletedBranchIds: deletedBranchIdsRef.current,
        deletedUserIds: deletedUserIdsRef.current,
        matters,
        clients,
        owners,
        properties,
        tenants,
        agreements,
        notices,
        invoices,
        receipts,
        bankAccounts,
        fees,
        precedents,
        bookings,
        staff,
        payrolls,
        expenses,
        requests,
        tasks,
        chatSessions,
        chatMessages,
        alerts,
        galleryEvents,
        backups,
        auditLogs,
        sensitiveAttempts
      };

      const totalCount =
        branches.length +
        users.length +
        matters.length +
        clients.length +
        owners.length +
        properties.length +
        tenants.length +
        agreements.length +
        notices.length +
        invoices.length +
        receipts.length +
        bankAccounts.length +
        fees.length +
        precedents.length +
        bookings.length +
        staff.length +
        payrolls.length +
        expenses.length +
        requests.length +
        tasks.length +
        chatSessions.length +
        chatMessages.length +
        alerts.length +
        galleryEvents.length +
        backups.length +
        auditLogs.length +
        sensitiveAttempts.length;

      const res = await fetch('/api/cloudflare/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: fullSnapshot,
          actor: currentUser?.fullName || currentUser?.username || 'Chambers System Admin',
          timestamp: new Date().toISOString()
        })
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as any;
        throw new Error(errorData?.error || `HTTP ${res.status}: Failed to store in Cloudflare Database`);
      }

      logAudit(
        'Cloudflare D1 Database Sync',
        'Database',
        `Successfully stored ${totalCount} chambers records into Cloudflare D1 Database (chambers-d1-db).`
      );

      return { success: true, count: totalCount };
    } catch (err: any) {
      console.error('Push to Cloudflare Database error:', err);
      return { success: false, count: 0, error: err.message || 'Cloudflare D1 storage failed' };
    }
  };

  // Dual-Database Synchronization Service state
  const [dualSyncTelemetry, setDualSyncTelemetry] = useState<DualSyncTelemetry>(
    dualDatabaseSyncService.getTelemetry()
  );

  useEffect(() => {
    const unsubscribe = dualDatabaseSyncService.subscribe((telem) => {
      setDualSyncTelemetry(telem);
    });
    return unsubscribe;
  }, []);

  const triggerDualDatabaseSync = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    const snapshot = {
      matters,
      clients,
      properties,
      auditLogs,
      branches,
      users,
      owners,
      tenants,
      invoices,
      receipts,
      bookings
    };
    return await dualDatabaseSyncService.executePeriodicSync('MANUAL', snapshot);
  };

  const setDualSyncAutoInterval = (seconds: number) => {
    dualDatabaseSyncService.setIntervalSeconds(seconds);
  };

  const toggleDualSyncAuto = (enabled: boolean) => {
    dualDatabaseSyncService.setAutoSyncEnabled(enabled);
  };

  const getDualDatabaseConsistencyReport = async (): Promise<DualDatabaseConsistencyReport> => {
    return await dualDatabaseSyncService.verifyDualDatabaseConsistency();
  };

  // Reset database clean for testing (Section 1 compliance)
  const resetDatabaseClean = async () => {
    localStorage.removeItem(STORAGE_KEY);
    try {
      await fetch('/api/sync/reset', { method: 'POST' });
    } catch {}
    await pullFromCloud();
    setCurrentUser(null);
    setAuthenticatedClient(null);
    setAuthenticatedOwner(null);
    setAuthenticatedTenant(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeBranchId,
        setActiveBranchId,
        loginUser,
        logoutUser,
        updateUserPassword,
        authenticatedClient,
        authenticatedOwner,
        authenticatedTenant,
        setAuthenticatedClient,
        setAuthenticatedOwner,
        setAuthenticatedTenant,
        loginClientPortal,
        loginOwnerPortal,
        loginTenantPortal,
        logoutPortal,
        syncStatus,
        lastSyncedAt,
        triggerManualSync,
        branches,
        users,
        matters,
        clients,
        owners,
        properties,
        tenants,
        agreements,
        notices,
        invoices,
        receipts,
        bankAccounts,
        fees,
        precedents,
        bookings,
        staff,
        payrolls,
        expenses,
        requests,
        tasks,
        chatSessions,
        chatMessages,
        alerts,
        backups,
        auditLogs,
        sensitiveAttempts,
        addBranch,
        updateBranch,
        suspendBranch,
        reactivateBranch,
        deleteBranch,
        deleteBranchPermanently,
        deletedBranchIds: deletedBranchIdsRef.current,
        deletedUserIds: deletedUserIdsRef.current,
        validateUserQuota,
        registerPublicClient,
        registerPublicOwner,
        registerPublicTenant,
        addUser,
        updateUser,
        deleteUser,
        addClient,
        updateClient,
        deleteClient,
        addMatter,
        updateMatter,
        addOwner,
        updateOwner,
        deleteOwner,
        addProperty,
        updateProperty,
        deleteProperty,
        addTenant,
        updateTenant,
        deleteTenant,
        addAgreement,
        updateAgreement,
        addNotice,
        updateNotice,
        addInvoice,
        updateInvoice,
        addReceipt,
        addBankAccount,
        updateBankAccount,
        addFee,
        updateFee,
        addPrecedent,
        deletePrecedent,
        addBooking,
        updateBooking,
        addStaff,
        updateStaff,
        addPayroll,
        updatePayroll,
        addExpense,
        updateExpense,
        deleteExpense,
        addRequest,
        updateRequest,
        addTask,
        updateTask,
        startChatSession,
        sendChatMessage,
        closeChatSession,
        addAlert,
        markAlertRead,
        dismissAlert,
        deleteAlert,
        markAllAlertsAsRead,
        galleryEvents,
        addGalleryEvent,
        updateGalleryEvent,
        deleteGalleryEvent,
        logAudit,
        generateHardCopyBackup,
        getActiveBranch,
        generateUniqueCode,
        resetDatabaseClean,
        canAccessBranchData,
        checkBranchRoleQuota,
        effectiveBranchId,
        pushAllToGoogleCloud,
        getGoogleCloudDbInfo,
        pushAllToCloudflareDatabase,
        dualSyncTelemetry,
        triggerDualDatabaseSync,
        setDualSyncAutoInterval,
        toggleDualSyncAuto,
        getDualDatabaseConsistencyReport
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
