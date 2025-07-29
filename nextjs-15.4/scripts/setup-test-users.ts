#!/usr/bin/env tsx

import { db, users } from '../src/lib/db'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

/**
 * Script to create test users for E2E testing
 * Run with: npx tsx scripts/setup-test-users.ts
 */

async function setupTestUsers() {
  console.log('🚀 Setting up test users for E2E testing...')

  try {
    // Test user credentials that E2E tests expect
    const testUsers = [
      {
        id: 'test-admin-user-id',
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Test Admin',
        role: 'admin' as const,
        emailVerified: true, // Admin should be verified for testing
      },
      {
        id: 'test-regular-user-id', 
        email: 'user@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user' as const,
        emailVerified: true, // Regular user should be verified for basic login tests
      },
      {
        id: 'test-unverified-user-id',
        email: 'unverified@example.com',
        password: 'password123',
        name: 'Unverified Test User',
        role: 'user' as const,
        emailVerified: false, // For testing email verification flow
      }
    ]

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1)

      if (existingUser.length > 0) {
        // Update existing user with new password
        const hashedPassword = await bcrypt.hash(userData.password, 12)
        
        await db
          .update(users)
          .set({
            passwordHash: hashedPassword,
            name: userData.name,
            role: userData.role,
            emailVerified: userData.emailVerified, // Use the specified verification status
            updatedAt: new Date(), // Drizzle expects Date object for timestamp mode
          })
          .where(eq(users.email, userData.email))

        console.log(`✅ Updated existing test user: ${userData.email}`)
      } else {
        // Create new user
        const hashedPassword = await bcrypt.hash(userData.password, 12)
        
        await db.insert(users).values({
          id: userData.id,
          email: userData.email,
          passwordHash: hashedPassword,
          name: userData.name,
          role: userData.role,
          emailVerified: userData.emailVerified, // Use the specified verification status
          createdAt: new Date(), // Drizzle expects Date object for timestamp mode
          updatedAt: new Date(), // Drizzle expects Date object for timestamp mode
        })

        console.log(`✅ Created new test user: ${userData.email}`)
      }
    }

    console.log('\n🎉 Test users setup complete!')
    console.log('\nTest credentials for E2E tests:')
    console.log('Admin user (verified): admin@example.com / admin123')
    console.log('Regular user (verified): user@example.com / password123')
    console.log('Unverified user: unverified@example.com / password123')
    console.log('\nYou can now run E2E tests with: npm run test:e2e')
    
  } catch (error) {
    console.error('❌ Error setting up test users:', error)
    process.exit(1)
  }
}

// Run the setup
setupTestUsers()