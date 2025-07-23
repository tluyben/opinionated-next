import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { ensureAdminExists } from './auto-admin';

let sqlite: Database.Database;
let adminCheckStarted = false;

if (process.env.NODE_ENV === 'production') {
  sqlite = new Database(process.env.DATABASE_URL || 'content.db', { readonly: false });
} else {
  if (!(global as any).__sqlite__) {
    (global as any).__sqlite__ = new Database(process.env.DATABASE_URL || 'content.db');
    (global as any).__sqlite__.pragma('journal_mode = WAL');
  }
  sqlite = (global as any).__sqlite__;
}

export const db = drizzle(sqlite, { schema });

// Automatically ensure admin exists on server startup
// Use a flag to prevent multiple concurrent calls
if (!adminCheckStarted) {
  adminCheckStarted = true;
  // Run admin check asynchronously to not block db initialization
  setTimeout(async () => {
    try {
      await ensureAdminExists();
    } catch (error) {
      console.error('❌ Auto admin creation error:', error);
    }
  }, 1000); // Small delay to ensure db is fully initialized
}

export * from './schema';