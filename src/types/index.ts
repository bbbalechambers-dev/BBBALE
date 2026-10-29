// Core Data Types for B. B. BALE & CO Chambers Management System

export type Role = 
  | 'Principal Partner'
  | 'Head of Chamber'
  | 'Administrator'
  | 'Account Officer'
  | 'Counsel'
  | 'Client'
  | 'Property Owner'
  | 'Tenant'
  | 'Public Visitor';

export type BranchStatus = 'Active' | 'Suspended' | 'Archived' | 'Deleted';

export interface Branch {
  id: string;
  name: string;
  code: string; // e.g. BBB-LAG, BBB-ABJ
  address: string;
  state: string;
  lga: string;
  city: string;
  phone: string;
  email: string;
  whatsapp: string;
  officeHours: string;
  rcNumber: string;
  vatNumber: string;
  annualBudget: number;
  pettyCashLimit: number;
  logoUrl?: string;
  status: BranchStatus;
  createdAt: string;
  suspensionReason?: string;
  suspensionDate?: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  branchId: string; // 'ALL' for Principal Partner
  status: 'Active' | 'Pending First Login' | 'Suspended';
  isDefaultPassword: boolean;
  password?: string;
  profilePic?: string;
  lastLogin?: string;
  createdAt: string;
  nin?: string;
  cacNumber?: string;
}

export interface UploadedFileMetadata {
  id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  uploadedBy: string;
  branchId: string;
  linkedEntityId: string;
  linkedEntityType: string;
  dataUrl: string; // base64 or blob URI
  checksum: string;
  version: number;
  category: string;
}

export type CourtCategory = 
  | 'Supreme Court of Nigeria'
  | 'Court of Appeal'
  | 'Federal High Court'
  | 'State High Court'
  | 'National Industrial Court (NICN)'
  | 'Magistrate Court'
  | 'Customary Court of Appeal / Customary Court'
  | 'Sharia Court of Appeal / Sharia Court'
  | 'Rent Tribunal'
  | 'Election Petition Tribunal'
  | 'Tax Appeal Tribunal'
  | 'Investment & Securities Tribunal'
  | 'Other (Specify Manually)';

export type CaseType = 
  | 'Civil'
  | 'Criminal'
  | 'Sharia'
  | 'Family & Matrimonial'
  | 'Commercial & Corporate'
  | 'Constitutional & Human Rights'
  | 'Land & Property'
  | 'Labour & Employment'
  | 'Taxation'
  | 'Election Petition'
  | 'Other';

export interface Matter {
  id: string;
  code: string; // BBB-LAG/MAT/2026/0001
  branchId: string;
  title: string;
  clientId: string;
  courtCategory: CourtCategory;
  customCourtName?: string;
  caseType: CaseType;
  subCategory: string;
  suitNumber: string;
  presidingJudge: string;
  courtDivision: string;
  assignedCounselId: string;
  status: 'Active' | 'Pending' | 'Adjourned' | 'Closed' | 'Archived';
  filingDate: string;
  nextHearingDate?: string;
  adjournmentReason?: string;
  description: string;
  estimatedFee: number;
  paidFee: number;
  isLegalHold: boolean;
  documents: UploadedFileMetadata[];
  notes: Array<{ id: string; author: string; date: string; content: string }>;
  createdAt: string;
}

export interface ClientRecord {
  id: string;
  code: string; // BBB-LAG/CLI/0001
  branchId: string;
  fullName: string;
  clientType: 'Individual' | 'Corporate';
  email: string;
  phone: string;
  state: string;
  lga: string;
  city: string;
  streetAddress: string;
  ninOrCac: string;
  conflictCheckStatus: 'Passed' | 'Flagged' | 'Pending';
  kycDocuments: UploadedFileMetadata[];
  status: 'Active' | 'Archived';
  createdAt: string;
}

export interface PropertyOwner {
  id: string;
  code: string; // BBB-LAG/OWN/0001
  branchId: string;
  fullName: string;
  type: 'Individual' | 'Corporate' | 'Joint';
  email: string;
  phone: string;
  state: string;
  lga: string;
  city: string;
  streetAddress: string;
  ninOrCac: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  kycDocuments: UploadedFileMetadata[];
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Property {
  id: string;
  code: string; // BBB-LAG/PROP/0001
  branchId: string;
  ownerId: string;
  name: string;
  propertyType: 'Residential' | 'Commercial' | 'Mixed Use' | 'Industrial' | 'Land';
  ownershipType: 'Firm-Owned' | 'Client-Managed' | 'Joint';
  state: string;
  lga: string;
  city: string;
  streetAddress: string;
  unitsCount: number;
  currentValuation: number;
  titleDocuments: UploadedFileMetadata[];
  photos: UploadedFileMetadata[];
  status: 'Active' | 'Under Maintenance' | 'Sold' | 'Archived';
  createdAt: string;
}

export interface Tenant {
  id: string;
  code: string; // BBB-LAG/TEN/0001
  branchId: string;
  propertyId: string;
  ownerId: string;
  fullName: string;
  email: string;
  phone: string;
  unitAssigned: string;
  annualRent: number;
  serviceCharge: number;
  cautionDeposit: number;
  tenancyStartDate: string;
  tenancyEndDate: string;
  nextRentDueDate: string;
  rentPaymentStatus: 'Current' | 'Arrears (1-30 days)' | 'Arrears (31-60 days)' | 'Arrears (61-90 days)' | 'Arrears (90+ days)';
  nin: string;
  guarantorName: string;
  guarantorPhone: string;
  guarantorAddress: string;
  kycDocuments: UploadedFileMetadata[];
  status: 'Active' | 'Vacated' | 'Evicted';
  createdAt: string;
}

export interface TenancyAgreement {
  id: string;
  code: string; // BBB-LAG/TAG/2026/0001
  branchId: string;
  tenantId: string;
  propertyId: string;
  ownerId: string;
  agreementType: 'Residential' | 'Commercial' | 'Short-Let' | 'Furnished Unit' | 'Sub-Lease';
  termYears: number;
  commencementDate: string;
  rentAmount: number;
  serviceCharge: number;
  cautionFee: number;
  legalFee: number;
  agencyFee: number;
  governingState: string;
  customClauses: string[];
  tenantSignatureUrl?: string;
  landlordSignatureUrl?: string;
  witnessName: string;
  witnessSignatureUrl?: string;
  status: 'Draft' | 'Sent for Signature' | 'Executed' | 'Expired';
  createdAt: string;
}

export interface QuitNotice {
  id: string;
  code: string; // BBB-LAG/NOT/2026/0001
  branchId: string;
  tenantId: string;
  propertyId: string;
  noticeType: 
    | 'Notice to Quit (6 Months)' 
    | 'Notice to Quit (3 Months)' 
    | 'Notice to Quit (1 Month)' 
    | '7-Day Notice of Owner’s Intention to Apply to Court for Possession' 
    | 'Demand Letter for Outstanding Rent & Arrears'
    | 'Rent Tribunal Claim Form & Statement of Claim';
  dateServed: string;
  expiryDate: string;
  outstandingRent: number;
  serviceMethod: 'Personal Service' | 'Substituted Service (Posted on Premises)' | 'Registered Courier';
  servedBy: string;
  headApproval: boolean;
  status: 'Draft' | 'Approved' | 'Served' | 'Expired' | 'Proceeding to Tribunal';
  createdAt: string;
}

export interface Invoice {
  id: string;
  code: string; // BBB-LAG/INV/2026/0001
  branchId: string;
  recipientType: 'Client' | 'Tenant' | 'Owner';
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  issueDate: string;
  dueDate: string;
  matterId?: string;
  propertyId?: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; amount: number }>;
  subtotal: number;
  vatRate: number; // 7.5%
  vatAmount: number;
  whtRate: number; // e.g. 5% or 10%
  whtAmount: number;
  totalAmount: number;
  bankAccountId: string;
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid' | 'Voided';
  notes: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  code: string; // BBB-LAG/RCP/2026/0001
  branchId: string;
  invoiceId?: string;
  payerName: string;
  payerEmail: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: 'Bank Transfer' | 'Paystack' | 'Flutterwave' | 'POS' | 'Cheque';
  transactionReference: string;
  bankAccountId: string;
  purpose: string;
  receivedBy: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  branchId: string;
  accountName: string;
  bankName: string;
  accountNumber: string; // NUBAN
  accountType: 'Trust Account' | 'Operating Account' | 'Property Account' | 'FX Domiciliary';
  currency: 'NGN' | 'USD' | 'GBP' | 'EUR';
  isDefault: boolean;
  balance: number;
  status: 'Active' | 'Inactive';
}

export interface FeeItem {
  id: string;
  branchId: string;
  title: string;
  category: 'Consultation' | 'Litigation' | 'Property Management' | 'Drafting & Conveyance' | 'Retainer';
  minFee: number;
  maxFee: number;
  branchFee: number;
  unit: 'Fixed' | 'Hourly' | 'Percentage' | 'Monthly';
}

export interface Precedent {
  id: string;
  code: string; // BBB-LAG/PREC/2026/0001
  branchId: string;
  title: string;
  citation: string;
  courtCategory: CourtCategory;
  caseType: CaseType;
  subCategory: string;
  yearDecided: number;
  presidingJustice: string;
  ratioDecidendi: string;
  summary: string;
  fullText: string;
  documentFile?: UploadedFileMetadata;
  tags: string[];
  addedBy: string;
  createdAt: string;
}

export interface ConsultationBooking {
  id: string;
  code: string; // BBB-LAG/CON/2026/0001
  branchId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  state: string;
  lga: string;
  city: string;
  courtCategory?: CourtCategory;
  caseType?: CaseType;
  subCategory?: string;
  consultationType: 'In-person' | 'Virtual Video' | 'Telephone';
  preferredDate: string;
  timeSlot: string;
  durationMinutes: number;
  feeAmount: number;
  paymentReference: string;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  status: 'Confirmed' | 'Completed' | 'Rescheduled' | 'Cancelled';
  assignedCounselId?: string;
  counselNotes?: string;
  createdAt: string;
}

export interface StaffRecord {
  id: string;
  code: string; // BBB-LAG/STF/0001
  branchId: string;
  userId: string;
  fullName: string;
  jobTitle: string;
  department: 'Legal' | 'Administration' | 'Finance' | 'Real Estate';
  employmentType: 'Full-time' | 'Contract' | 'Pupilage / Intern';
  dateJoined: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  utilityAllowance: number;
  tinNumber: string;
  pensionPin: string;
  pensionFundAdmin: string;
  bankName: string;
  accountNumber: string;
  leaveBalanceDays: number;
}

export interface PayrollRun {
  id: string;
  code: string; // BBB-LAG/PAY/2026/01
  branchId: string;
  month: string; // e.g. "October 2026"
  status: 'Draft' | 'Under Review (Head)' | 'Approved (Principal Partner)' | 'Paid';
  preparedBy: string;
  approvedBy?: string;
  totalGross: number;
  totalPaye: number;
  totalPensionEmployee: number; // 8%
  totalPensionEmployer: number; // 10%
  totalNhf: number; // 2.5%
  totalNet: number;
  lineItems: Array<{
    staffId: string;
    staffName: string;
    grossSalary: number;
    payeTax: number;
    pensionEmployee: number;
    nhfDeduction: number;
    loansDeduction: number;
    netPay: number;
  }>;
  createdAt: string;
}

export interface BranchExpense {
  id: string;
  code: string; // BBB-LAG/EXP/2026/0001
  branchId: string;
  title: string;
  category: 'Office Supplies' | 'Court Filing Fees' | 'Logistics & Fuel' | 'Utilities' | 'Repairs & Maintenance' | 'Professional Dues';
  amount: number;
  date: string;
  recordedBy: string;
  status: 'Pending' | 'Approved by Head' | 'Escalated to Principal Partner' | 'Approved by PP' | 'Rejected';
  receiptFile?: UploadedFileMetadata;
  notes: string;
}

export interface InternalRequest {
  id: string;
  code: string; // BBB-LAG/REQ/2026/0001
  branchId: string;
  staffId: string;
  staffName: string;
  requestType: 'Leave' | 'Expense Reimbursement' | 'Salary Advance' | 'Office Resource' | 'Training & MCPD' | 'IT Support';
  amount?: number;
  description: string;
  startDate?: string;
  endDate?: string;
  status: 'Submitted' | 'Approved' | 'Escalated' | 'Rejected';
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
}

export interface SpecialTask {
  id: string;
  code: string; // BBB-LAG/TSK/2026/0001
  branchId: string;
  title: string;
  description: string;
  assignedBy: string;
  assignedTo: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  completedAt?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  branchId: string;
  senderType: 'Visitor' | 'Administrator' | 'System';
  senderName: string;
  message: string;
  attachmentUrl?: string;
  attachmentName?: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  branchId: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  topic: string;
  status: 'Active' | 'Closed' | 'Converted to Consultation';
  createdAt: string;
  updatedAt: string;
}

export interface BranchGalleryEvent {
  id: string;
  branchId: string;
  category: 'Office' | 'Team' | 'Court' | 'Awards' | 'Community' | 'Legal Summit';
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  uploadedBy: string;
  createdAt: string;
}

export interface AlertNotification {
  id: string;
  branchId: string; // or 'ALL'
  targetRole?: Role;
  title: string;
  message: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Court' | 'Rent' | 'Financial' | 'Security' | 'HR' | 'System';
  isRead: boolean;
  timestamp: string;
}

export interface BackupRecord {
  id: string;
  code: string; // BBB-LAG/BKP/2026/0001
  branchId: string;
  generatedBy: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  categoriesIncluded: string[];
  totalRecordsCount: number;
  fileSizeEstimate: string;
  generatedAt: string;
  referenceNumber: string;
}

export interface AuditLog {
  id: string;
  branchId: string;
  actor: string;
  actorRole: string;
  action: string;
  targetEntity: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface SensitiveAccessAttempt {
  id: string;
  portalType: 'Client' | 'Owner' | 'Tenant';
  codeUsed: string;
  identifierUsed: string;
  status: 'Granted' | 'Failed - Code Not Found' | 'Failed - Identifier Mismatch' | 'Failed - Branch Mismatch' | 'Locked Out';
  ipAddress: string;
  timestamp: string;
}

export interface CloudQuotaGovernor {
  strictAfricaOnlyRegionLock: boolean;
  activeRegion: string; // 'africa-south1'
  maxRegionalInstances: number; // 1
  concurrencyLimit: number; // 80
  memoryLimitMb: number; // 512
  cpuLimit: string; // '1'
  scaleToZeroEnabled: boolean; // true
  multiRegionExpansionBlocked: boolean; // true
  dailyRequestCeiling: number; // 100,000
  requestsConsumedToday: number;
  quotaWarningThresholdPct: number; // 80
  costCapAlertUsd: number; // 0
  lockStatus: 'STRICT_AFRICA_ONLY_ACTIVE' | 'GOVERNED';
}

export interface GeoAccessStatus {
  clientIp: string;
  detectedCountry: string;
  countryName: string;
  isAfricanJurisdiction: boolean;
  enforcementMode: 'ENFORCED' | 'SIMULATION' | 'BYPASS';
  googleCloudRegion: string; // 'africa-south1' (Johannesburg)
  regionLocation: string; // 'Johannesburg, South Africa (Primary African Cloud Node)'
  edgePoP: string; // 'Lagos, Nigeria' | 'Nairobi, Kenya' | 'Johannesburg, South Africa'
  cloudArmorPolicy: string; // 'gcp-chambers-africa-only-policy'
  cloudArmorStatus: 'ACTIVE_BLOCKING' | 'MONITORING';
  allowedCountriesCount: number;
  simulatedCountry?: string;
  isBypassed: boolean;
  legalNotice: string;
}

export interface DualSyncTelemetry {
  lastSyncTime: string | null;
  syncStatus: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
  syncMode: 'AUTOMATIC_PERIODIC' | 'MANUAL';
  intervalSeconds: number;
  autoSyncEnabled: boolean;
  totalSyncedCount: number;
  lastBatchCount: number;
  consistencyScorePct: number;
  highPriorityCounts: {
    matters: number;
    clients: number;
    properties: number;
    auditLogs: number;
  };
  lastError?: string | null;
  history: Array<{
    timestamp: string;
    recordsCount: number;
    durationMs: number;
    status: 'SUCCESS' | 'ERROR';
    details: string;
  }>;
}

export interface DualDatabaseConsistencyReport {
  timestamp: string;
  isConsistent: boolean;
  consistencyScorePct: number;
  firestoreStats: {
    highPriorityMatters: number;
    highPriorityClients: number;
    highPriorityProperties: number;
    auditLogs: number;
    total: number;
  };
  cloudflareD1Stats: {
    caseFilesCount: number;
    clientsCount: number;
    propertyRecordsCount: number;
    auditLogsCount: number;
    total: number;
  };
  matchedCount: number;
  discrepancies: Array<{
    collection: string;
    id: string;
    issue: string;
  }>;
}
