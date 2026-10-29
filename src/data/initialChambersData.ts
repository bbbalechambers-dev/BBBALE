import { Branch, User, BranchGalleryEvent, AlertNotification } from '../types';

export const DEFAULT_CHAMBERS_PASSWORD = 'Admin@2026';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'BRN-LAG',
    name: 'Lagos Branch (Commercial & Maritime Practice)',
    code: 'BBB-LAG',
    address: 'Plot 14B, Bishop Oluwole Street, Victoria Island',
    state: 'Lagos',
    lga: 'Ibeju-Lekki / Eti-Osa',
    city: 'Lagos',
    phone: '+234 1 234 5678',
    email: 'lagos@bbbaleandco.ng',
    whatsapp: '+234 803 111 2233',
    officeHours: '08:00 - 17:00 (Mon - Fri)',
    rcNumber: 'BN-2894101',
    vatNumber: 'VAT-LAG-002918',
    annualBudget: 85000000,
    pettyCashLimit: 250000,
    status: 'Active',
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'BRN-ABJ',
    name: 'Abuja Headquarters (Appellate & Supreme Court Practice)',
    code: 'BBB-ABJ',
    address: 'Chambers Towers, 4th Floor, Plot 892 Shehu Shagari Way, Maitama',
    state: 'FCT',
    lga: 'Abuja Municipal (AMAC)',
    city: 'Abuja',
    phone: '+234 9 456 7890',
    email: 'abuja@bbbaleandco.ng',
    whatsapp: '+234 803 444 5566',
    officeHours: '08:00 - 18:00 (Mon - Fri)',
    rcNumber: 'BN-1904552',
    vatNumber: 'VAT-ABJ-008123',
    annualBudget: 120000000,
    pettyCashLimit: 500000,
    status: 'Active',
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'BRN-PHC',
    name: 'Port Harcourt Branch (Oil, Gas & Energy Law Practice)',
    code: 'BBB-PHC',
    address: '18 Stadium Road, Old GRA',
    state: 'Rivers',
    lga: 'Port Harcourt',
    city: 'Port Harcourt',
    phone: '+234 84 890 123',
    email: 'portharcourt@bbbaleandco.ng',
    whatsapp: '+234 803 777 8899',
    officeHours: '08:30 - 17:00 (Mon - Fri)',
    rcNumber: 'BN-3392104',
    vatNumber: 'VAT-RIV-004512',
    annualBudget: 60000000,
    pettyCashLimit: 200000,
    status: 'Active',
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'BRN-KAN',
    name: 'Kano Branch (Northern Commercial & Islamic Finance)',
    code: 'BBB-KAN',
    address: '52 Bompai Road, Commercial District',
    state: 'Kano',
    lga: 'Nasarawa',
    city: 'Kano',
    phone: '+234 64 345 678',
    email: 'kano@bbbaleandco.ng',
    whatsapp: '+234 803 999 0011',
    officeHours: '08:00 - 16:30 (Sun - Thu)',
    rcNumber: 'BN-4401923',
    vatNumber: 'VAT-KAN-009981',
    annualBudget: 45000000,
    pettyCashLimit: 150000,
    status: 'Active',
    createdAt: '2026-01-01T08:00:00.000Z'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-PP-001',
    username: 'principal partner',
    fullName: 'Barr. B. B. Bale, SAN',
    email: 'principal.partner@bbbaleandco.ng',
    phone: '+234 803 200 0001',
    role: 'Principal Partner',
    branchId: 'ALL',
    status: 'Active',
    isDefaultPassword: true,
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'USR-HOC-002',
    username: 'head of chamber',
    fullName: 'Dr. Fatima Al-Hassan, LL.M',
    email: 'head.of.chamber@bbbaleandco.ng',
    phone: '+234 803 200 0002',
    role: 'Head of Chamber',
    branchId: 'BRN-ABJ',
    status: 'Active',
    isDefaultPassword: true,
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'USR-ADM-003',
    username: 'administrator',
    fullName: 'Mr. Chukwuemeka Eze, ACIS',
    email: 'administrator@bbbaleandco.ng',
    phone: '+234 803 200 0003',
    role: 'Administrator',
    branchId: 'BRN-LAG',
    status: 'Active',
    isDefaultPassword: true,
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'USR-ACC-004',
    username: 'account officer',
    fullName: 'Mrs. Aisha Bello, ACA',
    email: 'account.officer@bbbaleandco.ng',
    phone: '+234 803 200 0004',
    role: 'Account Officer',
    branchId: 'BRN-LAG',
    status: 'Active',
    isDefaultPassword: true,
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'USR-CNS-005',
    username: 'counsel',
    fullName: 'Barr. Olumide Adeleke, Esq.',
    email: 'counsel@bbbaleandco.ng',
    phone: '+234 803 200 0005',
    role: 'Counsel',
    branchId: 'BRN-LAG',
    status: 'Active',
    isDefaultPassword: true,
    createdAt: '2026-01-01T08:00:00.000Z'
  }
];

export const INITIAL_GALLERY_EVENTS: BranchGalleryEvent[] = [
  {
    id: 'GAL-001',
    branchId: 'BRN-LAG',
    category: 'Legal Summit',
    title: 'Annual Chambers Colloquium & Bar Leadership Summit',
    description: 'B. B. BALE & CO Chambers annual gathering of partners, counsel, and distinguished bar leaders reviewing key precedents and arbitration standards.',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    date: '18 October 2026',
    uploadedBy: 'Chukwuemeka Eze (Administrator)',
    createdAt: '2026-10-18T10:00:00.000Z'
  },
  {
    id: 'GAL-002',
    branchId: 'BRN-ABJ',
    category: 'Court',
    title: 'Supreme Court of Nigeria Appellate Delegation',
    description: 'Principal Partner Adebayo Balogun, SAN leading the appellate advocacy team at the Supreme Court complex in Three Arms Zone, Abuja.',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    date: '12 October 2026',
    uploadedBy: 'Dr. Fatima Al-Hassan (Head of Chamber)',
    createdAt: '2026-10-12T09:30:00.000Z'
  },
  {
    id: 'GAL-003',
    branchId: 'BRN-LAG',
    category: 'Office',
    title: 'Victoria Island Chambers Law Library & Research Suites',
    description: 'State-of-the-art legal research facility housing Nigerian Weekly Law Reports (NWLR), All FWLR, and digital legal analytics workstations.',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    date: '04 October 2026',
    uploadedBy: 'Chukwuemeka Eze (Administrator)',
    createdAt: '2026-10-04T14:15:00.000Z'
  },
  {
    id: 'GAL-004',
    branchId: 'BRN-ABJ',
    category: 'Awards',
    title: 'NBA National Merit Award in Real Property Governance',
    description: 'Award conferment ceremony honoring the firm for exemplary tenancy stewardship, title conveyance rigor, and pro bono legal support.',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    date: '28 September 2026',
    uploadedBy: 'Administrator',
    createdAt: '2026-09-28T16:00:00.000Z'
  },
  {
    id: 'GAL-005',
    branchId: 'BRN-LAG',
    category: 'Community',
    title: 'Community Legal Aid & Title Regularisation Clinic',
    description: 'Pro bono community legal outreach in Lagos State assisting indigent families and market associations with land title verification.',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    date: '15 September 2026',
    uploadedBy: 'Olumide Adeleke (Counsel)',
    createdAt: '2026-09-15T11:00:00.000Z'
  },
  {
    id: 'GAL-006',
    branchId: 'BRN-ABJ',
    category: 'Team',
    title: 'Abuja Chambers Counsel & Pupil Advocates Orientation',
    description: 'Induction cohort of new associates undergoing rigorous advocacy training in statutory pleadings, court decorum, and conflict checks.',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    date: '02 September 2026',
    uploadedBy: 'Dr. Fatima Al-Hassan (Head of Chamber)',
    createdAt: '2026-09-02T08:45:00.000Z'
  }
];

export const INITIAL_ALERTS: AlertNotification[] = [
  {
    id: 'ALT-001',
    branchId: 'BRN-ABJ',
    title: 'Supreme Court Statutory Reply Due',
    message: "Appeal SC/CV/982/2026 Appellant's Reply Brief must be lodged at the Supreme Court Registry within 48 hours.",
    priority: 'Critical',
    category: 'Court',
    isRead: false,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'ALT-002',
    branchId: 'BRN-LAG',
    title: 'Statutory 7-Day Notice to Quit Expiring',
    message: 'Seven (7) days statutory notice served on Suite 4B (Victoria Island Plaza) expires this Friday. Legal hold ready for eviction summons.',
    priority: 'High',
    category: 'Rent',
    isRead: false,
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'ALT-003',
    branchId: 'BRN-LAG',
    title: 'Branch Periodic Financial Statement Ready',
    message: 'Monthly and quarterly statutory financial statement generation and branch expense reconciliation ready for Account Officer sign-off.',
    priority: 'High',
    category: 'Financial',
    isRead: false,
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'ALT-004',
    branchId: 'ALL',
    title: 'Public Web Portal Self-Registration',
    message: 'New prospective corporate client registered via the Chambers public portal. Automated conflict check cleared; awaiting intake review.',
    priority: 'Medium',
    category: 'System',
    isRead: false,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'ALT-005',
    branchId: 'BRN-ABJ',
    title: 'Federal High Court Hearing Notice',
    message: 'Suit FHC/ABJ/CS/441/2026 listed for mention before Court 3, Maitama. Assigned counsel notified.',
    priority: 'Medium',
    category: 'Court',
    isRead: false,
    timestamp: new Date(Date.now() - 3600000 * 36).toISOString()
  }
];

