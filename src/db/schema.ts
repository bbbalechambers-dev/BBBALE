import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table with Firebase UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('counsel'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Law Firm Cases and Matters
export const cases = pgTable('cases', {
  id: serial('id').primaryKey(),
  caseNumber: text('case_number').notNull().unique(),
  title: text('title').notNull(),
  clientName: text('client_name').notNull(),
  court: text('court').notNull(),
  status: text('status').default('active'),
  counselAssigned: text('counsel_assigned').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Legal Documents repository
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  caseId: integer('case_id').references(() => cases.id),
  title: text('title').notNull(),
  category: text('category').notNull(),
  storageUrl: text('storage_url'),
  status: text('status').default('filed'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Appointments & Consultations
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  clientName: text('client_name').notNull(),
  counsel: text('counsel').notNull(),
  scheduledDate: text('scheduled_date').notNull(),
  notes: text('notes'),
  status: text('status').default('scheduled'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const casesRelations = relations(cases, ({ many }) => ({
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  case: one(cases, {
    fields: [documents.caseId],
    references: [cases.id],
  }),
}));
