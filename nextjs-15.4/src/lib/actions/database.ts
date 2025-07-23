'use server';

import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import Database from 'better-sqlite3';
import { revalidatePath } from 'next/cache';

// Helper functions for user-friendly descriptions
function getTableDescription(tableName: string): string {
  const descriptions: Record<string, string> = {
    'users': 'User accounts and profile information',
    'sessions': 'User login sessions and authentication tokens',
    'api_keys': 'API keys for application access',
    'files': 'Uploaded files and documents',
    'posts': 'Blog posts and articles',
    'comments': 'User comments and discussions',
    'orders': 'Customer orders and purchases',
    'products': 'Product catalog and inventory',
    'categories': 'Content categories and classifications',
    'tags': 'Content tags and labels',
    'notifications': 'System notifications and alerts',
    'settings': 'Application settings and configuration',
    'logs': 'System logs and audit trail',
    'analytics': 'Usage analytics and metrics',
    'permissions': 'User permissions and access control',
    'roles': 'User roles and authorization levels'
  };
  
  return descriptions[tableName] || `Data storage for ${tableName.replace(/_/g, ' ')}`;
}

function getColumnDescription(columnName: string, columnType: string): string {
  // Common column patterns
  if (columnName === 'id') return 'Unique identifier';
  if (columnName.endsWith('_id')) return `Reference to ${columnName.replace('_id', '').replace(/_/g, ' ')}`;
  if (columnName.endsWith('_at')) return 'Date and time';
  if (columnName.endsWith('_url')) return 'Web address or link';
  if (columnName.endsWith('_hash')) return 'Encrypted value';
  if (columnName === 'email') return 'Email address';
  if (columnName === 'password') return 'Password';
  if (columnName === 'name') return 'Name or title';
  if (columnName === 'title') return 'Title or heading';
  if (columnName === 'description') return 'Description or details';
  if (columnName === 'content') return 'Main content';
  if (columnName === 'status') return 'Current status';
  if (columnName === 'role') return 'User role or permission level';
  if (columnName === 'active' || columnName === 'enabled') return 'Active/inactive status';
  if (columnName.includes('count')) return 'Number count';
  if (columnName.includes('amount') || columnName.includes('price')) return 'Monetary amount';
  
  // Type-based descriptions
  if (columnType.toLowerCase().includes('text')) return 'Text content';
  if (columnType.toLowerCase().includes('int')) return 'Number value';
  if (columnType.toLowerCase().includes('bool')) return 'Yes/No value';
  if (columnType.toLowerCase().includes('timestamp')) return 'Date and time';
  
  return columnName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getUserFriendlyType(dbType: string): string {
  const type = dbType.toLowerCase();
  
  if (type.includes('text')) return 'Text';
  if (type.includes('varchar')) return 'Text';
  if (type.includes('char')) return 'Text';
  if (type.includes('int')) return 'Number';
  if (type.includes('real') || type.includes('float') || type.includes('double')) return 'Decimal';
  if (type.includes('bool')) return 'Yes/No';
  if (type.includes('timestamp') || type.includes('datetime') || type.includes('date')) return 'Date & Time';
  if (type.includes('blob')) return 'File/Binary';
  
  return 'Data';
}

// Type definitions for database operations
export interface TableInfo {
  name: string;
  sql: string;
  recordCount: number;
  description: string;
}

export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
  description: string;
  userFriendlyType: string;
}

export interface TableData {
  columns: ColumnInfo[];
  rows: Record<string, any>[];
  totalCount: number;
}

// List all tables in the database
export async function listTablesAction() {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  try {
    const baseTables = (db as any).$client.prepare(`
      SELECT name, sql 
      FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
      AND name NOT LIKE '__drizzle_%'
      ORDER BY name
    `).all() as { name: string; sql: string }[];

    // Enhance each table with user-friendly information
    const tables: TableInfo[] = baseTables.map(table => {
      let recordCount = 0;
      try {
        const countResult = (db as any).$client.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as { count: number };
        recordCount = countResult?.count || 0;
      } catch (e) {
        // If count fails, default to 0
        recordCount = 0;
      }

      return {
        name: table.name,
        sql: table.sql,
        recordCount,
        description: getTableDescription(table.name)
      };
    });

    return { success: true, tables };
  } catch (error) {
    console.error('Error listing tables:', error);
    return { success: false, error: 'Failed to list tables' };
  }
}

// Get table structure and data
export async function getTableDataAction(tableName: string, page: number = 1, limit: number = 50) {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  // Validate table name to prevent SQL injection
  const validTableName = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName);
  if (!validTableName) {
    return { success: false, error: 'Invalid table name' };
  }

  try {
    // Get table schema
    const rawColumns = (db as any).$client.prepare(`PRAGMA table_info(${tableName})`).all() as {
      cid: number;
      name: string;
      type: string;
      notnull: number;
      dflt_value: string | null;
      pk: number;
    }[];
    
    // Enhance columns with user-friendly information
    const columns: ColumnInfo[] = rawColumns.map(col => ({
      ...col,
      description: getColumnDescription(col.name, col.type),
      userFriendlyType: getUserFriendlyType(col.type)
    }));
    
    if (columns.length === 0) {
      return { success: false, error: 'Table not found' };
    }

    // Get total count
    const countResult = (db as any).$client.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get() as { count: number };
    const totalCount = countResult?.count || 0;

    // Get paginated data
    const offset = (page - 1) * limit;
    const rows = (db as any).$client.prepare(`
      SELECT * FROM ${tableName} 
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    return {
      success: true,
      data: {
        columns,
        rows,
        totalCount,
      } as TableData
    };
  } catch (error) {
    console.error('Error getting table data:', error);
    return { success: false, error: 'Failed to get table data' };
  }
}

// Insert new record
export async function insertRecordAction(tableName: string, data: Record<string, any>) {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  // Validate table name
  const validTableName = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName);
  if (!validTableName) {
    return { success: false, error: 'Invalid table name' };
  }

  try {
    // Get table schema to validate fields
    const rawColumns = (db as any).$client.prepare(`PRAGMA table_info(${tableName})`).all() as {
      cid: number; name: string; type: string; notnull: number; dflt_value: string | null; pk: number;
    }[];
    const columns = rawColumns.map(col => ({ ...col, description: '', userFriendlyType: '' })) as ColumnInfo[];
    const validColumns = columns.map(col => col.name);

    // Filter out invalid columns and empty values
    const filteredData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (validColumns.includes(key) && value !== '' && value !== null && value !== undefined) {
        filteredData[key] = value;
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return { success: false, error: 'No valid data to insert' };
    }

    // Build dynamic insert query
    const columnNames = Object.keys(filteredData);
    const values = Object.values(filteredData);
    
    const placeholders = values.map(() => '?').join(', ');
    const query = `
      INSERT INTO ${tableName} 
      (${columnNames.join(', ')})
      VALUES (${placeholders})
    `;

    const stmt = (db as any).$client.prepare(query);
    stmt.run(...values);
    
    revalidatePath(`/database/${tableName}`);
    return { success: true };
  } catch (error) {
    console.error('Error inserting record:', error);
    return { success: false, error: 'Failed to insert record: ' + (error as Error).message };
  }
}

// Update record
export async function updateRecordAction(tableName: string, primaryKey: string, primaryKeyValue: any, data: Record<string, any>) {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  // Validate table name
  const validTableName = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName);
  if (!validTableName) {
    return { success: false, error: 'Invalid table name' };
  }

  try {
    // Get table schema to validate fields
    const rawColumns = (db as any).$client.prepare(`PRAGMA table_info(${tableName})`).all() as {
      cid: number; name: string; type: string; notnull: number; dflt_value: string | null; pk: number;
    }[];
    const columns = rawColumns.map(col => ({ ...col, description: '', userFriendlyType: '' })) as ColumnInfo[];
    const validColumns = columns.map(col => col.name);

    // Filter out invalid columns and primary key
    const filteredData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (validColumns.includes(key) && key !== primaryKey && value !== '' && value !== null && value !== undefined) {
        filteredData[key] = value;
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return { success: false, error: 'No valid data to update' };
    }

    // Build dynamic update query
    const setPairs = Object.keys(filteredData).map(key => `${key} = ?`);
    const values = Object.values(filteredData);
    
    const query = `
      UPDATE ${tableName} 
      SET ${setPairs.join(', ')}
      WHERE ${primaryKey} = ?
    `;

    const stmt = (db as any).$client.prepare(query);
    stmt.run(...values, primaryKeyValue);
    
    revalidatePath(`/database/${tableName}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating record:', error);
    return { success: false, error: 'Failed to update record: ' + (error as Error).message };
  }
}

// Delete record
export async function deleteRecordAction(tableName: string, primaryKey: string, primaryKeyValue: any) {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  // Validate table name
  const validTableName = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName);
  if (!validTableName) {
    return { success: false, error: 'Invalid table name' };
  }

  try {
    const query = `DELETE FROM ${tableName} WHERE ${primaryKey} = ?`;
    const stmt = (db as any).$client.prepare(query);
    stmt.run(primaryKeyValue);
    
    revalidatePath(`/database/${tableName}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting record:', error);
    return { success: false, error: 'Failed to delete record: ' + (error as Error).message };
  }
}