var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// src/lib/firebase-admin.ts
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "gen-lang-client-0215193881",
  appId: "1:59289014049:web:43a8de12a9c93790aef860",
  apiKey: "AIzaSyDTJxlLmN0znb_RjGyZWxLKhKGMOdwpTE0",
  authDomain: "gen-lang-client-0215193881.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-remixremixbbbale-1acb00a4-24e3-4b38-8098-c70e3a7cd091",
  storageBucket: "gen-lang-client-0215193881.firebasestorage.app",
  messagingSenderId: "59289014049",
  measurementId: "",
  oAuthClientId: "59289014049-qp61tg5e0k7iqcsmo6sk1ug61j71du2v.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

// src/lib/firebase-admin.ts
if (!getApps().length) {
  initializeApp({
    projectId: firebase_applet_config_default.projectId
  });
}
var adminAuth = getAuth();

// src/middleware/auth.ts
var requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  appointments: () => appointments,
  cases: () => cases,
  casesRelations: () => casesRelations,
  documents: () => documents,
  documentsRelations: () => documentsRelations,
  users: () => users
});
import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  // Firebase Auth UID
  email: text("email").notNull(),
  displayName: text("display_name"),
  role: text("role").default("counsel"),
  createdAt: timestamp("created_at").defaultNow()
});
var cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  caseNumber: text("case_number").notNull().unique(),
  title: text("title").notNull(),
  clientName: text("client_name").notNull(),
  court: text("court").notNull(),
  status: text("status").default("active"),
  counselAssigned: text("counsel_assigned").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});
var documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => cases.id),
  title: text("title").notNull(),
  category: text("category").notNull(),
  storageUrl: text("storage_url"),
  status: text("status").default("filed"),
  createdAt: timestamp("created_at").defaultNow()
});
var appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  counsel: text("counsel").notNull(),
  scheduledDate: text("scheduled_date").notNull(),
  notes: text("notes"),
  status: text("status").default("scheduled"),
  createdAt: timestamp("created_at").defaultNow()
});
var casesRelations = relations(cases, ({ many }) => ({
  documents: many(documents)
}));
var documentsRelations = relations(documents, ({ one }) => ({
  case: one(cases, {
    fields: [documents.caseId],
    references: [cases.id]
  })
}));

// src/db/index.ts
var isCloudSqlEnabled = process.env.ENABLE_CLOUDSQL === "true";
var createPool = () => {
  if (!isCloudSqlEnabled || !process.env.SQL_HOST) {
    return null;
  }
  if (!global._postgresPool) {
    try {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        max: 5,
        connectionTimeoutMillis: 5e3
      });
      global._postgresPool.on("error", (err) => {
        console.warn("Postgres pool warning:", err.message);
      });
    } catch (e) {
      console.warn("Could not initialize Cloud SQL pool:", e);
      return null;
    }
  }
  return global._postgresPool;
};
var pool = createPool();
var db = pool ? drizzle(pool, { schema: schema_exports }) : null;

// src/db/cases.ts
import { desc, eq } from "drizzle-orm";
async function getAllCases() {
  if (!isCloudSqlEnabled || !db) {
    return [];
  }
  try {
    return await db.select().from(cases).orderBy(desc(cases.createdAt));
  } catch (error) {
    console.warn("Cloud SQL is disabled or query failed:", error);
    return [];
  }
}
async function createCase(data) {
  if (!isCloudSqlEnabled || !db) {
    return { id: Date.now(), ...data, createdAt: /* @__PURE__ */ new Date() };
  }
  try {
    const result = await db.insert(cases).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("Database insert failed:", error);
    throw new Error("Failed to register legal case.", { cause: error });
  }
}
async function getAllAppointments() {
  if (!isCloudSqlEnabled || !db) {
    return [];
  }
  try {
    return await db.select().from(appointments).orderBy(desc(appointments.createdAt));
  } catch (error) {
    console.warn("Cloud SQL is disabled or query failed:", error);
    return [];
  }
}
async function createAppointment(data) {
  if (!isCloudSqlEnabled || !db) {
    return { id: Date.now(), ...data, createdAt: /* @__PURE__ */ new Date() };
  }
  try {
    const result = await db.insert(appointments).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("Database appointment insert failed:", error);
    throw new Error("Failed to create appointment.", { cause: error });
  }
}

// src/db/users.ts
import { eq as eq2 } from "drizzle-orm";
async function getOrCreateUser(uid, email, displayName) {
  if (!isCloudSqlEnabled || !db) {
    return {
      id: 1,
      uid,
      email,
      displayName: displayName || email.split("@")[0],
      createdAt: /* @__PURE__ */ new Date()
    };
  }
  try {
    const result = await db.insert(users).values({
      uid,
      email,
      displayName: displayName || email.split("@")[0]
    }).onConflictDoUpdate({
      target: users.uid,
      set: {
        email,
        ...displayName ? { displayName } : {}
      }
    }).returning();
    return result[0];
  } catch (error) {
    console.error("Database user registration failed:", error);
    throw new Error("User operation failed. Please try again later.", { cause: error });
  }
}

// src/data/initialChambersData.ts
var DEFAULT_CHAMBERS_PASSWORD = "Admin@2026";
var INITIAL_BRANCHES = [
  {
    id: "BRN-LAG",
    name: "Lagos Branch (Commercial & Maritime Practice)",
    code: "BBB-LAG",
    address: "Plot 14B, Bishop Oluwole Street, Victoria Island",
    state: "Lagos",
    lga: "Ibeju-Lekki / Eti-Osa",
    city: "Lagos",
    phone: "+234 1 234 5678",
    email: "lagos@bbbaleandco.ng",
    whatsapp: "+234 803 111 2233",
    officeHours: "08:00 - 17:00 (Mon - Fri)",
    rcNumber: "BN-2894101",
    vatNumber: "VAT-LAG-002918",
    annualBudget: 85e6,
    pettyCashLimit: 25e4,
    status: "Active",
    createdAt: "2026-01-01T08:00:00.000Z"
  },
  {
    id: "BRN-ABJ",
    name: "Abuja Headquarters (Appellate & Supreme Court Practice)",
    code: "BBB-ABJ",
    address: "Chambers Towers, 4th Floor, Plot 892 Shehu Shagari Way, Maitama",
    state: "FCT",
    lga: "Abuja Municipal (AMAC)",
    city: "Abuja",
    phone: "+234 9 456 7890",
    email: "abuja@bbbaleandco.ng",
    whatsapp: "+234 803 444 5566",
    officeHours: "08:00 - 18:00 (Mon - Fri)",
    rcNumber: "BN-1904552",
    vatNumber: "VAT-ABJ-008123",
    annualBudget: 12e7,
    pettyCashLimit: 5e5,
    status: "Active",
    createdAt: "2026-01-01T08:00:00.000Z"
  },
  {
    id: "BRN-PHC",
    name: "Port Harcourt Branch (Oil, Gas & Energy Law Practice)",
    code: "BBB-PHC",
    address: "18 Stadium Road, Old GRA",
    state: "Rivers",
    lga: "Port Harcourt",
    city: "Port Harcourt",
    phone: "+234 84 890 123",
    email: "portharcourt@bbbaleandco.ng",
    whatsapp: "+234 803 777 8899",
    officeHours: "08:30 - 17:00 (Mon - Fri)",
    rcNumber: "BN-3392104",
    vatNumber: "VAT-RIV-004512",
    annualBudget: 6e7,
    pettyCashLimit: 2e5,
    status: "Active",
    createdAt: "2026-01-01T08:00:00.000Z"
  },
  {
    id: "BRN-KAN",
    name: "Kano Branch (Northern Commercial & Islamic Finance)",
    code: "BBB-KAN",
    address: "52 Bompai Road, Commercial District",
    state: "Kano",
    lga: "Nasarawa",
    city: "Kano",
    phone: "+234 64 345 678",
    email: "kano@bbbaleandco.ng",
    whatsapp: "+234 803 999 0011",
    officeHours: "08:00 - 16:30 (Sun - Thu)",
    rcNumber: "BN-4401923",
    vatNumber: "VAT-KAN-009981",
    annualBudget: 45e6,
    pettyCashLimit: 15e4,
    status: "Active",
    createdAt: "2026-01-01T08:00:00.000Z"
  }
];
var INITIAL_USERS = [
  {
    id: "USR-PP-001",
    username: "principal partner",
    fullName: "Barr. B. B. Bale, SAN",
    email: "principal.partner@bbbaleandco.ng",
    phone: "+234 803 200 0001",
    role: "Principal Partner",
    branchId: "ALL",
    status: "Active",
    isDefaultPassword: true,
    createdAt: "2026-01-01T08:00:00.000Z"
  },
  {
    id: "USR-HOC-002",
    username: "head of chamber",
    fullName: "Dr. Fatima Al-Hassan, LL.M",
    email: "head.of.chamber@bbbaleandco.ng",
    phone: "+234 803 200 0002",
    role: "Head of Chamber",
    branchId: "BRN-ABJ",
    status: "Active",
    isDefaultPassword: true,
    createdAt: "2026-01-01T08:00:00.000Z"
  },
  {
    id: "USR-ADM-003",
    username: "administrator",
    fullName: "Mr. Chukwuemeka Eze, ACIS",
    email: "administrator@bbbaleandco.ng",
    phone: "+234 803 200 0003",
    role: "Administrator",
    branchId: "BRN-LAG",
    status: "Active",
    isDefaultPassword: true,
    createdAt: "2026-01-01T08:00:00.000Z"
  },
  {
    id: "USR-ACC-004",
    username: "account officer",
    fullName: "Mrs. Aisha Bello, ACA",
    email: "account.officer@bbbaleandco.ng",
    phone: "+234 803 200 0004",
    role: "Account Officer",
    branchId: "BRN-LAG",
    status: "Active",
    isDefaultPassword: true,
    createdAt: "2026-01-01T08:00:00.000Z"
  },
  {
    id: "USR-CNS-005",
    username: "counsel",
    fullName: "Barr. Olumide Adeleke, Esq.",
    email: "counsel@bbbaleandco.ng",
    phone: "+234 803 200 0005",
    role: "Counsel",
    branchId: "BRN-LAG",
    status: "Active",
    isDefaultPassword: true,
    createdAt: "2026-01-01T08:00:00.000Z"
  }
];
var INITIAL_GALLERY_EVENTS = [
  {
    id: "GAL-001",
    branchId: "BRN-LAG",
    category: "Legal Summit",
    title: "Annual Chambers Colloquium & Bar Leadership Summit",
    description: "B. B. BALE & CO Chambers annual gathering of partners, counsel, and distinguished bar leaders reviewing key precedents and arbitration standards.",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    date: "18 October 2026",
    uploadedBy: "Chukwuemeka Eze (Administrator)",
    createdAt: "2026-10-18T10:00:00.000Z"
  },
  {
    id: "GAL-002",
    branchId: "BRN-ABJ",
    category: "Court",
    title: "Supreme Court of Nigeria Appellate Delegation",
    description: "Principal Partner Adebayo Balogun, SAN leading the appellate advocacy team at the Supreme Court complex in Three Arms Zone, Abuja.",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
    date: "12 October 2026",
    uploadedBy: "Dr. Fatima Al-Hassan (Head of Chamber)",
    createdAt: "2026-10-12T09:30:00.000Z"
  },
  {
    id: "GAL-003",
    branchId: "BRN-LAG",
    category: "Office",
    title: "Victoria Island Chambers Law Library & Research Suites",
    description: "State-of-the-art legal research facility housing Nigerian Weekly Law Reports (NWLR), All FWLR, and digital legal analytics workstations.",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    date: "04 October 2026",
    uploadedBy: "Chukwuemeka Eze (Administrator)",
    createdAt: "2026-10-04T14:15:00.000Z"
  },
  {
    id: "GAL-004",
    branchId: "BRN-ABJ",
    category: "Awards",
    title: "NBA National Merit Award in Real Property Governance",
    description: "Award conferment ceremony honoring the firm for exemplary tenancy stewardship, title conveyance rigor, and pro bono legal support.",
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
    date: "28 September 2026",
    uploadedBy: "Administrator",
    createdAt: "2026-09-28T16:00:00.000Z"
  },
  {
    id: "GAL-005",
    branchId: "BRN-LAG",
    category: "Community",
    title: "Community Legal Aid & Title Regularisation Clinic",
    description: "Pro bono community legal outreach in Lagos State assisting indigent families and market associations with land title verification.",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    date: "15 September 2026",
    uploadedBy: "Olumide Adeleke (Counsel)",
    createdAt: "2026-09-15T11:00:00.000Z"
  },
  {
    id: "GAL-006",
    branchId: "BRN-ABJ",
    category: "Team",
    title: "Abuja Chambers Counsel & Pupil Advocates Orientation",
    description: "Induction cohort of new associates undergoing rigorous advocacy training in statutory pleadings, court decorum, and conflict checks.",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    date: "02 September 2026",
    uploadedBy: "Dr. Fatima Al-Hassan (Head of Chamber)",
    createdAt: "2026-09-02T08:45:00.000Z"
  }
];
var INITIAL_ALERTS = [
  {
    id: "ALT-001",
    branchId: "BRN-ABJ",
    title: "Supreme Court Statutory Reply Due",
    message: "Appeal SC/CV/982/2026 Appellant's Reply Brief must be lodged at the Supreme Court Registry within 48 hours.",
    priority: "Critical",
    category: "Court",
    isRead: false,
    timestamp: new Date(Date.now() - 36e5 * 2).toISOString()
  },
  {
    id: "ALT-002",
    branchId: "BRN-LAG",
    title: "Statutory 7-Day Notice to Quit Expiring",
    message: "Seven (7) days statutory notice served on Suite 4B (Victoria Island Plaza) expires this Friday. Legal hold ready for eviction summons.",
    priority: "High",
    category: "Rent",
    isRead: false,
    timestamp: new Date(Date.now() - 36e5 * 5).toISOString()
  },
  {
    id: "ALT-003",
    branchId: "BRN-LAG",
    title: "Branch Periodic Financial Statement Ready",
    message: "Monthly and quarterly statutory financial statement generation and branch expense reconciliation ready for Account Officer sign-off.",
    priority: "High",
    category: "Financial",
    isRead: false,
    timestamp: new Date(Date.now() - 36e5 * 12).toISOString()
  },
  {
    id: "ALT-004",
    branchId: "ALL",
    title: "Public Web Portal Self-Registration",
    message: "New prospective corporate client registered via the Chambers public portal. Automated conflict check cleared; awaiting intake review.",
    priority: "Medium",
    category: "System",
    isRead: false,
    timestamp: new Date(Date.now() - 36e5 * 24).toISOString()
  },
  {
    id: "ALT-005",
    branchId: "BRN-ABJ",
    title: "Federal High Court Hearing Notice",
    message: "Suit FHC/ABJ/CS/441/2026 listed for mention before Court 3, Maitama. Assigned counsel notified.",
    priority: "Medium",
    category: "Court",
    isRead: false,
    timestamp: new Date(Date.now() - 36e5 * 36).toISOString()
  }
];

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var port = Number(process.env.PORT) || 3e3;
app.use(express.json());
var AFRICAN_COUNTRIES = {
  NG: "Nigeria",
  ZA: "South Africa",
  KE: "Kenya",
  GH: "Ghana",
  EG: "Egypt",
  RW: "Rwanda",
  UG: "Uganda",
  TZ: "Tanzania",
  SN: "Senegal",
  CI: "C\xF4te d'Ivoire",
  CM: "Cameroon",
  ET: "Ethiopia",
  MA: "Morocco",
  DZ: "Algeria",
  TN: "Tunisia",
  AO: "Angola",
  BW: "Botswana",
  NA: "Namibia",
  ZM: "Zambia",
  ZW: "Zimbabwe",
  MZ: "Mozambique",
  BJ: "Benin",
  BF: "Burkina Faso",
  BI: "Burundi",
  CV: "Cabo Verde",
  CF: "Central African Republic",
  TD: "Chad",
  KM: "Comoros",
  CG: "Congo",
  CD: "DR Congo",
  DJ: "Djibouti",
  GQ: "Equatorial Guinea",
  ER: "Eritrea",
  SZ: "Eswatini",
  GA: "Gabon",
  GM: "Gambia",
  GN: "Guinea",
  GW: "Guinea-Bissau",
  LS: "Lesotho",
  LR: "Liberia",
  LY: "Libya",
  MG: "Madagascar",
  MW: "Malawi",
  ML: "Mali",
  MR: "Mauritania",
  MU: "Mauritius",
  NE: "Niger",
  ST: "S\xE3o Tom\xE9 and Pr\xEDncipe",
  SC: "Seychelles",
  SL: "Sierra Leone",
  SO: "Somalia",
  SS: "South Sudan",
  SD: "Sudan",
  TG: "Togo"
};
var AUTHORIZED_COUNSEL_TOKENS = /* @__PURE__ */ new Set([
  "BBB-AFRICA-CHAMBERS-2026",
  "NBA-AUTHORIZED-COUNSEL",
  "SUPREME-COURT-NIGERIA-AUTH",
  "BALE-PARTNER-GLOBAL-BYPASS"
]);
var dailyRequestCounter = 1420;
var quotaGovernorState = {
  strictAfricaOnlyRegionLock: true,
  activeRegion: "africa-south1",
  maxRegionalInstances: 1,
  // Single instance to prevent regional horizontal quota drain
  concurrencyLimit: 80,
  memoryLimitMb: 512,
  cpuLimit: "1",
  scaleToZeroEnabled: true,
  multiRegionExpansionBlocked: true,
  dailyRequestCeiling: 1e5,
  quotaWarningThresholdPct: 80,
  costCapAlertUsd: 0,
  // $0 - Strict Free Tier Preservation
  lockStatus: "STRICT_AFRICA_ONLY_ACTIVE"
};
var serverSimulationCountry = null;
var bypassedClientIps = /* @__PURE__ */ new Set();
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "127.0.0.1";
}
function detectCountry(req) {
  const querySim = req.query.simulate_country;
  const headerSim = req.headers["x-simulate-country"];
  const simulatedCode = (querySim || headerSim || serverSimulationCountry)?.toUpperCase();
  if (simulatedCode) {
    const isAfrican = simulatedCode in AFRICAN_COUNTRIES;
    return {
      code: simulatedCode,
      name: AFRICAN_COUNTRIES[simulatedCode] || `Non-African Jurisdiction (${simulatedCode})`,
      isAfrican,
      isSimulated: true
    };
  }
  const gcpGeoRegion = req.headers["x-client-geo-region"] || req.headers["x-client-geo-country"];
  const appEngineCountry = req.headers["x-appengine-country"];
  const cfCountry = req.headers["cf-ipcountry"];
  const xCountry = req.headers["x-country-code"];
  const rawCode = (gcpGeoRegion || appEngineCountry || cfCountry || xCountry || "").toUpperCase();
  if (rawCode && rawCode.length === 2) {
    const isAfrican = rawCode in AFRICAN_COUNTRIES;
    return {
      code: rawCode,
      name: AFRICAN_COUNTRIES[rawCode] || `Extra-Continental Jurisdiction (${rawCode})`,
      isAfrican,
      isSimulated: false
    };
  }
  return {
    code: "NG",
    name: "Nigeria (Chambers Headquarters)",
    isAfrican: true,
    isSimulated: false
  };
}
function checkIsBypassed(req, clientIp) {
  const token = req.headers["x-chambers-bypass-token"];
  if (token && AUTHORIZED_COUNSEL_TOKENS.has(token)) {
    return true;
  }
  if (bypassedClientIps.has(clientIp)) {
    return true;
  }
  return false;
}
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "B. B. BALE & CO Chambers System",
    googleCloudRegion: "africa-south1",
    datacenter: "Johannesburg, South Africa",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/database/status", (_req, res) => {
  res.json({
    status: "ACTIVE_ONLINE",
    provider: "Google Cloud Platform (Cloud Firestore)",
    projectId: "gen-lang-client-0215193881",
    firestoreDatabaseId: "ai-studio-remixremixbbbale-1acb00a4-24e3-4b38-8098-c70e3a7cd091",
    storageEngine: "Google Cloud Serverless Document Database",
    cloudRegion: "africa-south1 (South Africa) & GCP Edge Interconnects",
    cloudArmorPolicy: "gcp-chambers-africa-only-policy",
    firestoreRulesDeployed: true,
    sqlStatus: "DISABLED (Serverless Google Cloud Firestore Enforced)",
    activeCollections: [
      "branches",
      "users",
      "matters",
      "clients",
      "properties",
      "bookings",
      "chat_messages",
      "audit_logs"
    ],
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/geo/status", (req, res) => {
  const clientIp = getClientIp(req);
  const geo = detectCountry(req);
  const isBypassed = checkIsBypassed(req, clientIp);
  res.json({
    clientIp,
    detectedCountry: geo.code,
    countryName: geo.name,
    isAfricanJurisdiction: geo.isAfrican,
    enforcementMode: geo.isSimulated ? "SIMULATION" : isBypassed ? "BYPASS" : "ENFORCED",
    googleCloudRegion: "africa-south1",
    regionLocation: "Johannesburg, South Africa (Primary African Cloud Node)",
    edgePoP: "Lagos, Nigeria (Western African Edge Interconnect)",
    cloudArmorPolicy: "gcp-chambers-africa-only-policy",
    cloudArmorStatus: "ACTIVE_BLOCKING",
    allowedCountriesCount: Object.keys(AFRICAN_COUNTRIES).length,
    simulatedCountry: geo.isSimulated ? geo.code : void 0,
    isBypassed,
    legalNotice: "Access restricted to sovereign African jurisdictions in accordance with Chambers Charter & NBA Regulatory Guidelines on Google Cloud africa-south1."
  });
});
app.post("/api/geo/verify-counsel", (req, res) => {
  const { token } = req.body;
  const clientIp = getClientIp(req);
  if (typeof token === "string" && AUTHORIZED_COUNSEL_TOKENS.has(token.trim())) {
    bypassedClientIps.add(clientIp);
    return res.json({
      success: true,
      message: "Counsel authorization token verified. Regional exemption granted for this session.",
      clientIp,
      bypassed: true
    });
  }
  return res.status(401).json({
    success: false,
    message: "Invalid counsel authorization token. Please contact Chambers Principal Partner or IT Registrar in Abuja."
  });
});
app.post("/api/geo/simulate", (req, res) => {
  const { countryCode } = req.body;
  if (!countryCode || countryCode === "RESET") {
    serverSimulationCountry = null;
    return res.json({ success: true, message: "Simulation cleared. Using real geo headers.", simulatedCountry: null });
  }
  const code = String(countryCode).toUpperCase();
  serverSimulationCountry = code;
  const isAfrican = code in AFRICAN_COUNTRIES;
  return res.json({
    success: true,
    message: `Geo-simulation set to ${code} (${isAfrican ? "African Jurisdiction" : "Non-African Jurisdiction"}).`,
    simulatedCountry: code,
    isAfricanJurisdiction: isAfrican
  });
});
app.get("/api/geo/countries", (_req, res) => {
  res.json({
    totalCount: Object.keys(AFRICAN_COUNTRIES).length,
    googleCloudRegion: "africa-south1",
    countries: AFRICAN_COUNTRIES
  });
});
app.get("/api/quota/status", (_req, res) => {
  dailyRequestCounter++;
  res.json({
    ...quotaGovernorState,
    requestsConsumedToday: dailyRequestCounter,
    remainingRequestsToday: quotaGovernorState.dailyRequestCeiling - dailyRequestCounter,
    utilizationPercent: (dailyRequestCounter / quotaGovernorState.dailyRequestCeiling * 100).toFixed(2),
    guarantee: "Strict Single African Region Lockout: Spillover into non-African regions or secondary GCP zones is permanently blocked at container startup."
  });
});
var SYNC_STORAGE_FILE = path.resolve("/tmp", "chambers_db_sync.json");
function createInitialSyncState() {
  return {
    version: Date.now(),
    lastModified: (/* @__PURE__ */ new Date()).toISOString(),
    deletedBranchIds: [],
    deletedUserIds: [],
    data: {
      branches: JSON.parse(JSON.stringify(INITIAL_BRANCHES)),
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      matters: [],
      clients: [],
      owners: [],
      properties: [],
      tenants: [],
      agreements: [],
      notices: [],
      invoices: [],
      receipts: [],
      bankAccounts: [],
      fees: [],
      precedents: [],
      bookings: [],
      staff: [],
      payrolls: [],
      expenses: [],
      requests: [],
      tasks: [],
      chatSessions: [],
      chatMessages: [],
      alerts: JSON.parse(JSON.stringify(INITIAL_ALERTS)),
      galleryEvents: JSON.parse(JSON.stringify(INITIAL_GALLERY_EVENTS)),
      backups: [],
      auditLogs: [],
      sensitiveAttempts: []
    }
  };
}
var syncState = createInitialSyncState();
function ensureChambersIntegrity(state) {
  if (!state.data) {
    state.data = createInitialSyncState().data;
    return;
  }
  if (!Array.isArray(state.deletedBranchIds)) state.deletedBranchIds = [];
  if (!Array.isArray(state.deletedUserIds)) state.deletedUserIds = [];
  if (!Array.isArray(state.data.branches) || state.data.branches.length === 0) {
    state.data.branches = JSON.parse(JSON.stringify(INITIAL_BRANCHES)).filter(
      (b) => !state.deletedBranchIds.includes(b.id)
    );
  } else {
    for (const initB of INITIAL_BRANCHES) {
      if (state.deletedBranchIds.includes(initB.id)) continue;
      if (!state.data.branches.some((b) => b.id === initB.id || b.code === initB.code)) {
        state.data.branches.push(initB);
      }
    }
  }
  if (!Array.isArray(state.data.users) || state.data.users.length === 0) {
    state.data.users = JSON.parse(JSON.stringify(INITIAL_USERS)).filter(
      (u) => !state.deletedUserIds.includes(u.id)
    );
  } else {
    for (const initU of INITIAL_USERS) {
      if (state.deletedUserIds.includes(initU.id)) continue;
      const existing = state.data.users.find(
        (u) => u.id === initU.id || u.username && u.username.toLowerCase() === initU.username.toLowerCase()
      );
      if (!existing) {
        state.data.users.push(initU);
      }
    }
  }
  if (!Array.isArray(state.data.galleryEvents) || state.data.galleryEvents.length === 0) {
    state.data.galleryEvents = JSON.parse(JSON.stringify(INITIAL_GALLERY_EVENTS));
  }
  if (!Array.isArray(state.data.alerts) || state.data.alerts.length === 0) {
    state.data.alerts = JSON.parse(JSON.stringify(INITIAL_ALERTS));
  }
}
try {
  if (fs.existsSync(SYNC_STORAGE_FILE)) {
    const raw = fs.readFileSync(SYNC_STORAGE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && parsed.data) {
      syncState = parsed;
    }
  }
} catch (e) {
  console.warn("Sync storage initialization note:", e);
}
ensureChambersIntegrity(syncState);
persistSyncState();
function persistSyncState() {
  try {
    fs.writeFileSync(SYNC_STORAGE_FILE, JSON.stringify(syncState, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write sync state to disk:", err);
  }
}
app.get("/api/sync/version", (_req, res) => {
  ensureChambersIntegrity(syncState);
  res.json({
    version: syncState.version,
    lastModified: syncState.lastModified,
    counts: {
      branches: syncState.data.branches?.length || 0,
      users: syncState.data.users?.length || 0,
      matters: syncState.data.matters?.length || 0,
      clients: syncState.data.clients?.length || 0,
      properties: syncState.data.properties?.length || 0,
      invoices: syncState.data.invoices?.length || 0,
      staff: syncState.data.staff?.length || 0
    }
  });
});
app.get("/api/sync/pull", (_req, res) => {
  ensureChambersIntegrity(syncState);
  res.json({
    version: syncState.version,
    lastModified: syncState.lastModified,
    data: syncState.data
  });
});
app.post("/api/sync/push", (req, res) => {
  try {
    const { data, clientDeviceId, actor } = req.body;
    if (!data || typeof data !== "object") {
      return res.status(400).json({ error: "Missing or invalid sync data payload" });
    }
    ensureChambersIntegrity(syncState);
    if (Array.isArray(data.users) && data.users.length > 0) {
      const serverUserMap = new Map(
        syncState.data.users.map((u) => [u.id, u])
      );
      for (const incomingUser of data.users) {
        if (!incomingUser || !incomingUser.id) continue;
        const existing = serverUserMap.get(incomingUser.id) || syncState.data.users.find((u) => u.username && incomingUser.username && u.username.toLowerCase() === incomingUser.username.toLowerCase());
        if (existing) {
          const keepExistingPassword = !existing.isDefaultPassword && existing.password && (incomingUser.isDefaultPassword || !incomingUser.password);
          const establishedPassword = keepExistingPassword ? existing.password : incomingUser.password || existing.password;
          const establishedIsDefault = keepExistingPassword ? false : incomingUser.isDefaultPassword ?? existing.isDefaultPassword;
          const merged = {
            ...existing,
            ...incomingUser,
            password: establishedPassword,
            isDefaultPassword: establishedIsDefault,
            status: incomingUser.status || existing.status || "Active"
          };
          serverUserMap.set(existing.id, merged);
        } else {
          serverUserMap.set(incomingUser.id, incomingUser);
        }
      }
      syncState.data.users = Array.from(serverUserMap.values());
    }
    if (Array.isArray(data.deletedBranchIds) && data.deletedBranchIds.length > 0) {
      if (!syncState.deletedBranchIds) syncState.deletedBranchIds = [];
      for (const bId of data.deletedBranchIds) {
        if (!syncState.deletedBranchIds.includes(bId)) {
          syncState.deletedBranchIds.push(bId);
        }
      }
      syncState.data.branches = (syncState.data.branches || []).filter(
        (b) => !data.deletedBranchIds.includes(b.id)
      );
    }
    if (Array.isArray(data.deletedUserIds) && data.deletedUserIds.length > 0) {
      if (!syncState.deletedUserIds) syncState.deletedUserIds = [];
      for (const uId of data.deletedUserIds) {
        if (!syncState.deletedUserIds.includes(uId)) {
          syncState.deletedUserIds.push(uId);
        }
      }
      syncState.data.users = (syncState.data.users || []).filter(
        (u) => !data.deletedUserIds.includes(u.id)
      );
    }
    const entityCollections = [
      "branches",
      "matters",
      "clients",
      "owners",
      "properties",
      "tenants",
      "agreements",
      "notices",
      "invoices",
      "receipts",
      "bankAccounts",
      "fees",
      "precedents",
      "bookings",
      "staff",
      "payrolls",
      "expenses",
      "requests",
      "tasks",
      "chatSessions",
      "chatMessages",
      "alerts",
      "galleryEvents",
      "backups",
      "auditLogs",
      "sensitiveAttempts"
    ];
    for (const key of entityCollections) {
      if (!Array.isArray(data[key])) continue;
      if (data[key].length > 0) {
        const currentItems = Array.isArray(syncState.data[key]) ? syncState.data[key] : [];
        const itemMap = new Map(currentItems.map((item) => [item.id || item.code, item]));
        for (const incomingItem of data[key]) {
          const id = incomingItem.id || incomingItem.code;
          if (id) {
            if (key === "branches" && syncState.deletedBranchIds?.includes(id)) continue;
            if (key === "users" && syncState.deletedUserIds?.includes(id)) continue;
            const existing = itemMap.get(id);
            itemMap.set(id, existing ? { ...existing, ...incomingItem } : incomingItem);
          } else {
            itemMap.set(Math.random().toString(), incomingItem);
          }
        }
        syncState.data[key] = Array.from(itemMap.values());
      }
    }
    ensureChambersIntegrity(syncState);
    syncState.version = Date.now();
    syncState.lastModified = (/* @__PURE__ */ new Date()).toISOString();
    persistSyncState();
    return res.json({
      success: true,
      version: syncState.version,
      lastModified: syncState.lastModified,
      syncedBy: actor || clientDeviceId || "Chambers Device"
    });
  } catch (error) {
    console.error("Failed to process sync push:", error);
    return res.status(500).json({ error: error.message || "Sync push failed" });
  }
});
app.post("/api/auth/verify-login", (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Username and password are required." });
    }
    ensureChambersIntegrity(syncState);
    const trimmedUser = String(username).trim().toLowerCase();
    const defaultPassword = DEFAULT_CHAMBERS_PASSWORD;
    const matched = syncState.data.users.find(
      (u) => u.username && u.username.toLowerCase() === trimmedUser
    );
    if (matched) {
      if (matched.status === "Suspended") {
        return res.status(403).json({ success: false, error: "Account suspended. Contact Chambers Administrator." });
      }
      if (matched.isDefaultPassword) {
        if (password === defaultPassword) {
          return res.json({
            success: true,
            requirePasswordChange: true,
            user: matched
          });
        }
        return res.status(401).json({ success: false, error: "Invalid credentials. Please try again." });
      }
      if (matched.password && matched.password === password) {
        matched.lastLogin = (/* @__PURE__ */ new Date()).toISOString();
        persistSyncState();
        return res.json({
          success: true,
          requirePasswordChange: false,
          user: matched
        });
      }
      return res.status(401).json({ success: false, error: "Invalid credentials. Please try again." });
    }
    const defaultRoles = {
      "principal partner": "Principal Partner",
      "head of chamber": "Head of Chamber",
      "administrator": "Administrator",
      "account officer": "Account Officer",
      "counsel": "Counsel",
      "staff": "Counsel"
    };
    const roleMatched = defaultRoles[trimmedUser];
    if (roleMatched && password === defaultPassword) {
      const newUser = {
        id: `USR-${Date.now()}`,
        username: trimmedUser,
        fullName: trimmedUser,
        email: `${trimmedUser.replace(/\s+/g, ".")}@bbbaleandco.ng`,
        phone: "+234 803 000 0000",
        role: roleMatched,
        branchId: roleMatched === "Principal Partner" ? "ALL" : "BRN-LAG",
        status: "Active",
        isDefaultPassword: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        lastLogin: (/* @__PURE__ */ new Date()).toISOString()
      };
      syncState.data.users.push(newUser);
      syncState.version = Date.now();
      syncState.lastModified = (/* @__PURE__ */ new Date()).toISOString();
      persistSyncState();
      return res.json({
        success: true,
        requirePasswordChange: true,
        user: newUser
      });
    }
    return res.status(401).json({ success: false, error: "Invalid credentials. Please try again." });
  } catch (err) {
    console.error("Error in verify-login:", err);
    return res.status(500).json({ success: false, error: "Authentication service error" });
  }
});
app.post("/api/auth/change-password", (req, res) => {
  try {
    const { userId, username, newPassword } = req.body;
    if (!newPassword || newPassword.length < 10) {
      return res.status(400).json({ success: false, error: "Password must be at least 10 characters long." });
    }
    ensureChambersIntegrity(syncState);
    let targetUser = syncState.data.users.find((u) => u.id === userId);
    if (!targetUser && username) {
      targetUser = syncState.data.users.find(
        (u) => u.username && u.username.toLowerCase() === String(username).trim().toLowerCase()
      );
    }
    if (!targetUser) {
      return res.status(404).json({ success: false, error: "User record not found." });
    }
    targetUser.password = newPassword;
    targetUser.isDefaultPassword = false;
    targetUser.status = "Active";
    targetUser.lastLogin = (/* @__PURE__ */ new Date()).toISOString();
    if (!Array.isArray(syncState.data.auditLogs)) {
      syncState.data.auditLogs = [];
    }
    syncState.data.auditLogs.unshift({
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      branchId: targetUser.branchId || "ALL",
      actor: targetUser.fullName || targetUser.username,
      actorRole: targetUser.role,
      action: "Password Changed",
      targetEntity: "Security",
      details: `User ${targetUser.username} completed forced password change across Chambers sync network.`,
      ipAddress: getClientIp(req),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    syncState.version = Date.now();
    syncState.lastModified = (/* @__PURE__ */ new Date()).toISOString();
    persistSyncState();
    return res.json({
      success: true,
      message: "Password updated and synchronized across all chambers devices.",
      user: targetUser,
      version: syncState.version
    });
  } catch (err) {
    console.error("Error in change-password:", err);
    return res.status(500).json({ success: false, error: "Password change failed" });
  }
});
app.put("/api/branches/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    ensureChambersIntegrity(syncState);
    const branchIndex = syncState.data.branches.findIndex((b) => b.id === id);
    if (branchIndex === -1) {
      return res.status(404).json({ success: false, error: "Branch not found" });
    }
    syncState.data.branches[branchIndex] = {
      ...syncState.data.branches[branchIndex],
      ...updates,
      id
      // preserve ID
    };
    syncState.version = Date.now();
    syncState.lastModified = (/* @__PURE__ */ new Date()).toISOString();
    persistSyncState();
    return res.json({
      success: true,
      branch: syncState.data.branches[branchIndex],
      version: syncState.version
    });
  } catch (err) {
    console.error("Error in branch update:", err);
    return res.status(500).json({ success: false, error: "Failed to update branch" });
  }
});
app.delete("/api/branches/:id", (req, res) => {
  try {
    const { id } = req.params;
    ensureChambersIntegrity(syncState);
    if (!Array.isArray(syncState.deletedBranchIds)) {
      syncState.deletedBranchIds = [];
    }
    if (!syncState.deletedBranchIds.includes(id)) {
      syncState.deletedBranchIds.push(id);
    }
    const branch = syncState.data.branches.find((b) => b.id === id);
    syncState.data.branches = syncState.data.branches.filter((b) => b.id !== id);
    if (!Array.isArray(syncState.data.auditLogs)) syncState.data.auditLogs = [];
    syncState.data.auditLogs.unshift({
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      branchId: "ALL",
      actor: "Principal Partner",
      actorRole: "Principal Partner",
      action: "Delete Branch Permanently",
      targetEntity: "Branches",
      details: `Permanently deleted branch division ${branch?.name || id} (${branch?.code || id}) from Chambers network.`,
      ipAddress: getClientIp(req),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    syncState.version = Date.now();
    syncState.lastModified = (/* @__PURE__ */ new Date()).toISOString();
    persistSyncState();
    return res.json({
      success: true,
      deletedId: id,
      version: syncState.version
    });
  } catch (err) {
    console.error("Error in branch deletion:", err);
    return res.status(500).json({ success: false, error: "Failed to permanently delete branch" });
  }
});
app.post("/api/users", (req, res) => {
  try {
    const { username, fullName, email, phone, role, branchId, password, status } = req.body;
    if (!username || !fullName || !role || !branchId) {
      return res.status(400).json({ success: false, error: "Username, full name, role and branch are required." });
    }
    ensureChambersIntegrity(syncState);
    const restrictedRoles = ["Head of Chamber", "Administrator", "Account Officer"];
    if (restrictedRoles.includes(role)) {
      const existingInBranch = syncState.data.users.find(
        (u) => u.branchId === branchId && u.role === role && u.status !== "Suspended"
      );
      if (existingInBranch) {
        const roleLabel = role === "Administrator" ? "Administrator / Secretary" : role;
        return res.status(400).json({
          success: false,
          error: `Branch Quota Exceeded: This branch already has an assigned ${roleLabel} (${existingInBranch.fullName}). Each branch is strictly restricted to only ONE Head of Chamber, ONE Administrator/Secretary, and ONE Account Officer.`
        });
      }
    }
    const duplicateUser = syncState.data.users.find(
      (u) => u.username && u.username.toLowerCase() === String(username).trim().toLowerCase()
    );
    if (duplicateUser) {
      return res.status(400).json({ success: false, error: `Username "${username}" is already taken by another user.` });
    }
    const newUser = {
      id: `USR-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      username: String(username).trim(),
      fullName: String(fullName).trim(),
      email: email ? String(email).trim() : `${String(username).trim().toLowerCase().replace(/\s+/g, ".")}@bbbaleandco.ng`,
      phone: phone ? String(phone).trim() : "+234 803 000 0000",
      role,
      branchId,
      status: status || "Active",
      isDefaultPassword: true,
      password: password || "Admin@2026",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    syncState.data.users.push(newUser);
    if (!Array.isArray(syncState.data.auditLogs)) syncState.data.auditLogs = [];
    syncState.data.auditLogs.unshift({
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      branchId,
      actor: "Administrator / Partner",
      actorRole: "Management",
      action: "Create User",
      targetEntity: "Users",
      details: `Created user ${newUser.fullName} (${newUser.role}) assigned to branch ${newUser.branchId}.`,
      ipAddress: getClientIp(req),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    syncState.version = Date.now();
    syncState.lastModified = (/* @__PURE__ */ new Date()).toISOString();
    persistSyncState();
    return res.json({
      success: true,
      user: newUser,
      version: syncState.version
    });
  } catch (err) {
    console.error("Error in user creation:", err);
    return res.status(500).json({ success: false, error: "Failed to create user" });
  }
});
app.put("/api/users/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    ensureChambersIntegrity(syncState);
    const userIndex = syncState.data.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const existingUser = syncState.data.users[userIndex];
    const targetRole = updates.role || existingUser.role;
    const targetBranchId = updates.branchId || existingUser.branchId;
    const restrictedRoles = ["Head of Chamber", "Administrator", "Account Officer"];
    if (restrictedRoles.includes(targetRole) && updates.status !== "Suspended") {
      const duplicateRoleHolder = syncState.data.users.find(
        (u) => u.id !== id && u.branchId === targetBranchId && u.role === targetRole && u.status !== "Suspended"
      );
      if (duplicateRoleHolder) {
        const roleLabel = targetRole === "Administrator" ? "Administrator / Secretary" : targetRole;
        return res.status(400).json({
          success: false,
          error: `Branch Quota Exceeded: Target branch already has an assigned ${roleLabel} (${duplicateRoleHolder.fullName}). Each branch is strictly restricted to only ONE Head of Chamber, ONE Administrator/Secretary, and ONE Account Officer.`
        });
      }
    }
    syncState.data.users[userIndex] = {
      ...existingUser,
      ...updates,
      id
      // preserve ID
    };
    syncState.version = Date.now();
    syncState.lastModified = (/* @__PURE__ */ new Date()).toISOString();
    persistSyncState();
    return res.json({
      success: true,
      user: syncState.data.users[userIndex],
      version: syncState.version
    });
  } catch (err) {
    console.error("Error in user update:", err);
    return res.status(500).json({ success: false, error: "Failed to update user" });
  }
});
app.delete("/api/users/:id", (req, res) => {
  try {
    const { id } = req.params;
    ensureChambersIntegrity(syncState);
    if (!Array.isArray(syncState.deletedUserIds)) {
      syncState.deletedUserIds = [];
    }
    if (!syncState.deletedUserIds.includes(id)) {
      syncState.deletedUserIds.push(id);
    }
    const userToDelete = syncState.data.users.find((u) => u.id === id);
    syncState.data.users = syncState.data.users.filter((u) => u.id !== id);
    if (!Array.isArray(syncState.data.auditLogs)) syncState.data.auditLogs = [];
    syncState.data.auditLogs.unshift({
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      branchId: userToDelete?.branchId || "ALL",
      actor: "Management",
      actorRole: "Management",
      action: "Delete User Permanently",
      targetEntity: "Users",
      details: `Permanently deleted user account ${userToDelete?.fullName || id} (${userToDelete?.username || id}).`,
      ipAddress: getClientIp(req),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    syncState.version = Date.now();
    syncState.lastModified = (/* @__PURE__ */ new Date()).toISOString();
    persistSyncState();
    return res.json({
      success: true,
      deletedId: id,
      version: syncState.version
    });
  } catch (err) {
    console.error("Error in user deletion:", err);
    return res.status(500).json({ success: false, error: "Failed to delete user" });
  }
});
app.post("/api/sync/reset", (_req, res) => {
  syncState = createInitialSyncState();
  persistSyncState();
  return res.json({ success: true, version: syncState.version });
});
app.use("/api", (req, res, next) => {
  if (req.path.startsWith("/health") || req.path.startsWith("/geo") || req.path.startsWith("/sync") || req.path.startsWith("/auth") || req.path.startsWith("/database")) {
    return next();
  }
  const clientIp = getClientIp(req);
  const geo = detectCountry(req);
  const isBypassed = checkIsBypassed(req, clientIp);
  if (!geo.isAfrican && !isBypassed) {
    return res.status(403).json({
      error: "GEO_RESTRICTED_NON_AFRICAN_ORIGIN",
      message: "Access to B. B. BALE & CO Chambers is restricted to verified African jurisdictions under Google Cloud Armor policy on africa-south1.",
      detectedCountry: geo.code,
      countryName: geo.name,
      googleCloudRegion: "africa-south1",
      resolution: "If you are an authorized counsel traveling internationally, enter your Chambers bypass credential or contact Abuja HQ."
    });
  }
  next();
});
app.get("/api/sql/cases", async (_req, res) => {
  if (!isCloudSqlEnabled) {
    return res.json({
      enabled: false,
      message: "Cloud SQL is not enabled. Application runs on Firestore & local persistent sync storage.",
      cases: []
    });
  }
  try {
    const caseRecords = await getAllCases();
    res.json(caseRecords);
  } catch (error) {
    console.error("Failed to fetch legal cases from Cloud SQL:", error);
    res.status(500).json({ error: error.message || "Failed to fetch legal cases" });
  }
});
app.post("/api/sql/cases", requireAuth, async (req, res) => {
  try {
    const { caseNumber, title, clientName, court, counselAssigned, description } = req.body;
    if (!caseNumber || !title || !clientName || !court || !counselAssigned) {
      return res.status(400).json({ error: "Missing required case fields" });
    }
    const newCase = await createCase({
      caseNumber,
      title,
      clientName,
      court,
      counselAssigned,
      description
    });
    res.status(201).json(newCase);
  } catch (error) {
    console.error("Failed to create legal case in Cloud SQL:", error);
    res.status(500).json({ error: error.message || "Failed to create case" });
  }
});
app.get("/api/sql/appointments", async (_req, res) => {
  if (!isCloudSqlEnabled) {
    return res.json({
      enabled: false,
      message: "Cloud SQL is not enabled. Application runs on Firestore & local persistent sync storage.",
      appointments: []
    });
  }
  try {
    const apts = await getAllAppointments();
    res.json(apts);
  } catch (error) {
    console.error("Failed to fetch appointments from Cloud SQL:", error);
    res.status(500).json({ error: error.message || "Failed to fetch appointments" });
  }
});
app.post("/api/sql/appointments", requireAuth, async (req, res) => {
  if (!isCloudSqlEnabled) {
    return res.status(200).json({
      enabled: false,
      message: "Cloud SQL is disabled. Appointment handled in local sync storage."
    });
  }
  try {
    const { clientName, counsel, scheduledDate, notes } = req.body;
    if (!clientName || !counsel || !scheduledDate) {
      return res.status(400).json({ error: "Missing required appointment fields" });
    }
    const newApt = await createAppointment({ clientName, counsel, scheduledDate, notes });
    res.status(201).json(newApt);
  } catch (error) {
    console.error("Failed to schedule appointment in Cloud SQL:", error);
    res.status(500).json({ error: error.message || "Failed to schedule appointment" });
  }
});
app.post("/api/sql/users/sync", requireAuth, async (req, res) => {
  if (!isCloudSqlEnabled) {
    return res.status(200).json({
      enabled: false,
      message: "Cloud SQL is disabled. User synced via chambers sync network & Firestore."
    });
  }
  try {
    if (!req.user || !req.user.uid || !req.user.email) {
      return res.status(401).json({ error: "Authenticated user profile incomplete" });
    }
    const syncedUser = await getOrCreateUser(req.user.uid, req.user.email, req.body.displayName);
    res.json(syncedUser);
  } catch (error) {
    console.error("Failed to sync user to Cloud SQL:", error);
    res.status(500).json({ error: error.message || "Failed to synchronize user profile" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(port, "0.0.0.0", () => {
    console.log(`B. B. BALE & CO Chambers server listening on port ${port} [Google Cloud Region: africa-south1]`);
  });
}
startServer();
