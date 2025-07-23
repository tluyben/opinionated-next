const { drizzle } = require('drizzle-orm/better-sqlite3');
const { eq } = require('drizzle-orm');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { users } = require('./schema');

const sqlite = new Database(process.env.DATABASE_URL || 'content.db');
const db = drizzle(sqlite, { schema: { users } });

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generatePassword() {
  return Math.random().toString(36).substring(2, 12);
}

async function main() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('ℹ️  Admin user already exists');
      return;
    }

    const adminEmail = 'admin@example.com';
    const adminPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await db.insert(users).values({
      id: generateId(),
      email: adminEmail,
      passwordHash: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️  Please save these credentials and change the password after first login');

  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    process.exit(1);
  }
  
  sqlite.close();
}

main();