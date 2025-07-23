import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

let sqlite: Database.Database;

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

export * from './schema';