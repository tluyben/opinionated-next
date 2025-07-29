import { db, users } from '../../../src/lib/db'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

export interface TestUser {
  id: string
  email: string
  password: string
  name: string
  role: 'user' | 'admin'
  emailVerified: boolean
}

/**
 * Creates a test user with fresh data for each test
 */
export async function createTestUser(overrides: Partial<TestUser> = {}): Promise<TestUser> {
  const randomId = randomBytes(8).toString('hex')
  
  const userData: TestUser = {
    id: `test-user-${randomId}`,
    email: `test-${randomId}@example.com`,
    password: 'testpass123',
    name: `Test User ${randomId}`,
    role: 'user',
    emailVerified: true,
    ...overrides
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(userData.password, 12)

  // Insert user into database
  await db.insert(users).values({
    id: userData.id,
    email: userData.email,
    passwordHash: hashedPassword,
    name: userData.name,
    role: userData.role,
    emailVerified: userData.emailVerified,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return userData
}

/**
 * Creates an admin test user
 */
export async function createTestAdmin(): Promise<TestUser> {
  return createTestUser({
    role: 'admin',
    name: 'Test Admin',
  })
}

/**
 * Creates an unverified test user
 */
export async function createUnverifiedTestUser(): Promise<TestUser> {
  return createTestUser({
    emailVerified: false,
    name: 'Unverified Test User',
  })
}

/**
 * Cleans up test users created during testing
 */
export async function cleanupTestUsers(userIds: string[]) {
  if (userIds.length === 0) return
  
  try {
    for (const userId of userIds) {
      await db.delete(users).where(eq(users.id, userId))
    }
  } catch (error) {
    console.warn('Failed to cleanup test users:', error)
  }
}

/**
 * Login helper for e2e tests
 */
export async function loginUser(page: any, user: TestUser) {
  await page.goto('/login')
  await page.getByPlaceholder('Enter your email').fill(user.email)
  await page.getByPlaceholder('Enter your password').fill(user.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  
  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 })
}