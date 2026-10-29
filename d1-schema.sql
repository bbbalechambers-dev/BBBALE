-- ==============================================================================
-- Cloudflare D1 Relational Schema for B. B. BALE & CO Chambers Management System
-- Database: chambers-d1-db (binding: DB)
-- Tables: clients, property_records, case_files + foreign key relationships
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------------------------
-- 1. Master State Sync Snapshot Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chambers_sync (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  version INTEGER NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------------------------
-- 2. Chambers Branches (Jurisdictions & Operational Divisions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  lga TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'Suspended')),
  annual_budget REAL DEFAULT 0,
  data_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------------------------
-- 3. Users & Legal Personnel (RBAC & Authentication)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'Suspended')),
  is_default_password INTEGER DEFAULT 1,
  password TEXT,
  profile_pic TEXT,
  last_login TEXT,
  data_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------------------------
-- 4. Clients Registry (Primary Entity for Corporate, Individual & Retainer KYC)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  client_type TEXT DEFAULT 'Individual' CHECK(client_type IN ('Individual', 'Corporate', 'Government', 'Estate', 'Other')),
  email TEXT,
  phone TEXT,
  street_address TEXT,
  city TEXT,
  state TEXT,
  lga TEXT,
  nin_or_cac TEXT,
  conflict_check_status TEXT DEFAULT 'Passed' CHECK(conflict_check_status IN ('Passed', 'Pending', 'Flagged', 'Waived')),
  branch_id TEXT NOT NULL REFERENCES branches(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'Archived')),
  data_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------------------------
-- 5. Property Records (Real Estate Assets, Deeds, Conveyancing & Leased Premises)
-- Foreign Key Relationship: owner_client_id REFERENCES clients(id)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS property_records (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title_deed_number TEXT,
  name TEXT NOT NULL,
  property_type TEXT DEFAULT 'Commercial' CHECK(property_type IN ('Commercial', 'Residential', 'Industrial', 'Agricultural', 'Mixed-Use', 'Land / Undeveloped')),
  address TEXT NOT NULL,
  city TEXT,
  state TEXT NOT NULL,
  lga TEXT,
  cadastral_zone TEXT,
  survey_plan_number TEXT,
  owner_client_id TEXT,
  market_valuation REAL DEFAULT 0.0,
  annual_rental_value REAL DEFAULT 0.0,
  units_count INTEGER DEFAULT 1,
  occupancy_status TEXT DEFAULT 'Occupied' CHECK(occupancy_status IN ('Occupied', 'Vacant', 'Tenanted', 'Under Litigation', 'In Conveyance')),
  legal_status TEXT DEFAULT 'Freehold' CHECK(legal_status IN ('Freehold', 'Leasehold', 'State Grant', 'Governor Consent Pending', 'Customary Title')),
  branch_id TEXT NOT NULL REFERENCES branches(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Archived', 'Sold')),
  data_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  CONSTRAINT fk_property_owner_client
    FOREIGN KEY (owner_client_id)
    REFERENCES clients (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

-- ------------------------------------------------------------------------------
-- 6. Case Files (Litigation, Appellate Briefs, Dispute Resolution & Advisory)
-- Foreign Key Relationships:
--   client_id REFERENCES clients(id) ON DELETE CASCADE
--   property_record_id REFERENCES property_records(id) ON DELETE SET NULL
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS case_files (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  suit_number TEXT,
  title TEXT NOT NULL,
  client_id TEXT NOT NULL,
  property_record_id TEXT,
  court_category TEXT NOT NULL,
  case_type TEXT NOT NULL,
  sub_category TEXT,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  presiding_judge TEXT,
  lead_counsel TEXT,
  opposing_party TEXT,
  opposing_counsel TEXT,
  court_room TEXT,
  claim_amount REAL DEFAULT 0.0,
  estimated_fee REAL DEFAULT 0.0,
  filing_date TEXT,
  next_hearing_date TEXT,
  status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Adjourned', 'Pending Judgment', 'Appealed', 'Disposed / Closed')),
  priority TEXT DEFAULT 'Normal' CHECK(priority IN ('Low', 'Normal', 'High', 'Urgent')),
  description TEXT,
  data_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  CONSTRAINT fk_case_client
    FOREIGN KEY (client_id)
    REFERENCES clients (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_case_property
    FOREIGN KEY (property_record_id)
    REFERENCES property_records (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

-- ------------------------------------------------------------------------------
-- 7. Ancillary Tables for Law Firm Operations
-- ------------------------------------------------------------------------------

-- Tenancies associated with managed property records
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  property_record_id TEXT REFERENCES property_records(id) ON UPDATE CASCADE ON DELETE SET NULL,
  client_id TEXT REFERENCES clients(id) ON UPDATE CASCADE ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  unit_assigned TEXT,
  annual_rent REAL DEFAULT 0,
  service_charge REAL DEFAULT 0,
  caution_deposit REAL DEFAULT 0,
  tenancy_start_date TEXT,
  tenancy_end_date TEXT,
  next_rent_due_date TEXT,
  rent_payment_status TEXT DEFAULT 'Current',
  status TEXT DEFAULT 'Active',
  data_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Billing & Professional Fee Invoices linked to clients and case files
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  invoice_number TEXT NOT NULL,
  client_id TEXT REFERENCES clients(id) ON UPDATE CASCADE ON DELETE SET NULL,
  case_file_id TEXT REFERENCES case_files(id) ON UPDATE CASCADE ON DELETE SET NULL,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  client_name TEXT NOT NULL,
  case_title TEXT,
  total_amount REAL DEFAULT 0,
  amount_paid REAL DEFAULT 0,
  balance_due REAL DEFAULT 0,
  payment_status TEXT DEFAULT 'Pending' CHECK(payment_status IN ('Pending', 'Partial', 'Paid', 'Overdue')),
  due_date TEXT,
  status TEXT DEFAULT 'Issued',
  data_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Payment Receipts linked to Invoices
CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  receipt_number TEXT NOT NULL,
  invoice_id TEXT REFERENCES invoices(id) ON UPDATE CASCADE ON DELETE SET NULL,
  client_id TEXT REFERENCES clients(id) ON UPDATE CASCADE ON DELETE SET NULL,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  amount REAL DEFAULT 0,
  payment_method TEXT DEFAULT 'Bank Transfer',
  payer_name TEXT,
  payment_date TEXT,
  data_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Court Precedents & Legal Research Library
CREATE TABLE IF NOT EXISTS precedents (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  citation TEXT,
  court TEXT NOT NULL,
  year INTEGER,
  judge TEXT,
  subject_area TEXT,
  summary TEXT,
  ratio_decidendi TEXT,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  status TEXT DEFAULT 'Active',
  data_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Consultation & Court Diary Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  reference_number TEXT NOT NULL UNIQUE,
  client_id TEXT REFERENCES clients(id) ON UPDATE CASCADE ON DELETE SET NULL,
  case_file_id TEXT REFERENCES case_files(id) ON UPDATE CASCADE ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  booking_type TEXT NOT NULL,
  booking_date TEXT NOT NULL,
  booking_time TEXT,
  assigned_counsel TEXT,
  status TEXT DEFAULT 'Pending',
  notes TEXT,
  data_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Immutable Security & Compliance Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  module TEXT NOT NULL,
  description TEXT,
  ip_address TEXT,
  branch_id TEXT,
  severity TEXT DEFAULT 'INFO',
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sensitive Access Authorization Attempts
CREATE TABLE IF NOT EXISTS sensitive_attempts (
  id TEXT PRIMARY KEY,
  officer_name TEXT NOT NULL,
  role TEXT NOT NULL,
  target_file TEXT NOT NULL,
  authorization_token TEXT,
  status TEXT NOT NULL,
  reason TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------------------------
-- 8. Backward Compatibility Views (Supporting Legacy 'matters' and 'properties')
-- ------------------------------------------------------------------------------
CREATE VIEW IF NOT EXISTS matters AS
  SELECT
    id,
    code,
    suit_number,
    title,
    client_id,
    court_category,
    case_type,
    sub_category,
    branch_id,
    presiding_judge,
    lead_counsel,
    filing_date,
    next_hearing_date,
    estimated_fee,
    status,
    description,
    data_json,
    created_at
  FROM case_files;

CREATE VIEW IF NOT EXISTS properties AS
  SELECT
    id,
    code,
    name,
    property_type,
    address,
    state,
    owner_client_id AS owner_id,
    units_count,
    branch_id,
    status,
    data_json,
    created_at
  FROM property_records;

-- ------------------------------------------------------------------------------
-- 9. Performance Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clients_branch ON clients (branch_id);
CREATE INDEX IF NOT EXISTS idx_clients_code ON clients (code);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients (status);

CREATE INDEX IF NOT EXISTS idx_property_records_owner ON property_records (owner_client_id);
CREATE INDEX IF NOT EXISTS idx_property_records_branch ON property_records (branch_id);
CREATE INDEX IF NOT EXISTS idx_property_records_code ON property_records (code);
CREATE INDEX IF NOT EXISTS idx_property_records_status ON property_records (status);

CREATE INDEX IF NOT EXISTS idx_case_files_client ON case_files (client_id);
CREATE INDEX IF NOT EXISTS idx_case_files_property ON case_files (property_record_id);
CREATE INDEX IF NOT EXISTS idx_case_files_branch ON case_files (branch_id);
CREATE INDEX IF NOT EXISTS idx_case_files_suit_no ON case_files (suit_number);
CREATE INDEX IF NOT EXISTS idx_case_files_status ON case_files (status);

CREATE INDEX IF NOT EXISTS idx_tenants_property ON tenants (property_record_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices (client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_case ON invoices (case_file_id);
CREATE INDEX IF NOT EXISTS idx_receipts_invoice ON receipts (invoice_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp);
