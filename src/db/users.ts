import { db, isCloudSqlEnabled } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  if (!isCloudSqlEnabled || !db) {
    return {
      id: 1,
      uid,
      email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date(),
    };
  }
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || email.split('@')[0],
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(displayName ? { displayName } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Database user registration failed:", error);
    throw new Error("User operation failed. Please try again later.", { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  if (!isCloudSqlEnabled || !db) {
    return null;
  }
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid));
    return result[0] || null;
  } catch (error) {
    console.warn("Database user lookup failed (Cloud SQL disabled):", error);
    return null;
  }
}
