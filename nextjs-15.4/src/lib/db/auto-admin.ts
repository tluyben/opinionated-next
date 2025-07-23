import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db, users, type NewUser } from './index';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generatePassword(): string {
  return Math.random().toString(36).substring(2, 12);
}

/**
 * Creates an admin user if none exists
 * This function is called automatically on server startup
 */
export async function ensureAdminExists(): Promise<void> {
  try {
    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
    
    if (existingAdmin.length > 0) {
      // Admin exists, no action needed
      return;
    }

    // No admin exists, create one
    const adminEmail = 'admin@example.com';
    const adminPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const now = new Date();

    const newUser: NewUser = {
      id: generateId(),
      email: adminEmail,
      passwordHash: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(users).values(newUser);

    // Log admin credentials to console (only on first creation)
    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️  Please save these credentials and change the password after first login');
    console.log('💡 Use the settings page to change the admin password once logged in');

  } catch (error) {
    console.error('❌ Failed to ensure admin user exists:', error);
    // Don't throw or exit - let the app continue even if admin creation fails
  }
}