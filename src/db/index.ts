import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

// Cloud SQL is explicitly disabled per system configuration
export const isCloudSqlEnabled = (process.env.ENABLE_CLOUDSQL as unknown as string) === 'true';

export const createPool = () => {
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
        connectionTimeoutMillis: 5000,
      });

      global._postgresPool.on('error', (err) => {
        console.warn('Postgres pool warning:', err.message);
      });
    } catch (e) {
      console.warn('Could not initialize Cloud SQL pool:', e);
      return null;
    }
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = pool ? drizzle(pool, { schema }) : (null as any);

