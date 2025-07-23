const { drizzle } = require('drizzle-orm/better-sqlite3');
const { eq } = require('drizzle-orm');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { users } = require('./schema');

const sqlite = new Database(process.env.DATABASE_URL || 'content.db');
const db = drizzle(sqlite, { schema: { users } });

function generatePassword() {
  return Math.random().toString(36).substring(2, 12);
}

async function main() {
  try {
    // Find admin user
    const adminUser = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
    
    if (adminUser.length === 0) {
      console.log('❌ No admin user found. Run "npm run create-admin" first.');
      return;
    }

    const newPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.update(users)
      .set({ 
        passwordHash: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, adminUser[0].id));

    console.log('🔄 Admin password reset successfully!');
    console.log('📧 Email:', adminUser[0].email);
    console.log('🔑 New Password:', newPassword);
    console.log('⚠️  Please save these credentials and change the password after login');

  } catch (error) {
    console.error('❌ Failed to reset admin password:', error);
    process.exit(1);
  }
  
  sqlite.close();
}

main();