import { db, isCloudSqlEnabled } from './index.ts';
import { cases, documents, appointments } from './schema.ts';
import { desc, eq } from 'drizzle-orm';

export async function getAllCases() {
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

export async function createCase(data: {
  caseNumber: string;
  title: string;
  clientName: string;
  court: string;
  counselAssigned: string;
  description?: string;
}) {
  if (!isCloudSqlEnabled || !db) {
    return { id: Date.now(), ...data, createdAt: new Date() };
  }
  try {
    const result = await db.insert(cases).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("Database insert failed:", error);
    throw new Error("Failed to register legal case.", { cause: error });
  }
}

export async function getAllAppointments() {
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

export async function createAppointment(data: {
  clientName: string;
  counsel: string;
  scheduledDate: string;
  notes?: string;
}) {
  if (!isCloudSqlEnabled || !db) {
    return { id: Date.now(), ...data, createdAt: new Date() };
  }
  try {
    const result = await db.insert(appointments).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("Database appointment insert failed:", error);
    throw new Error("Failed to create appointment.", { cause: error });
  }
}

export async function getDocumentsForCase(caseId: number) {
  if (!isCloudSqlEnabled || !db) {
    return [];
  }
  try {
    return await db.select().from(documents).where(eq(documents.caseId, caseId));
  } catch (error) {
    console.warn("Cloud SQL is disabled or query failed:", error);
    return [];
  }
}
