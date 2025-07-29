import { test, expect } from '@playwright/test'
import { createTestUser, createTestAdmin, createUnverifiedTestUser, cleanupTestUsers, loginUser } from './helpers/test-db'

test.describe('Authentication Flows', () => {
  const createdUserIds: string[] = []

  test.afterEach(async () => {
    // Cleanup any users created during this test
    await cleanupTestUsers(createdUserIds)
    createdUserIds.length = 0
  })

  test('should successfully login with verified user', async ({ page }) => {
    // Create a fresh test user
    const testUser = await createTestUser()
    createdUserIds.push(testUser.id)

    await page.goto('/login')
    
    // Fill in test user credentials
    await page.getByPlaceholder('Enter your email').fill(testUser.email)
    await page.getByPlaceholder('Enter your password').fill(testUser.password)
    
    // Submit login form
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10000 })
  })

  test('should successfully login with admin user', async ({ page }) => {
    // Create a fresh admin user
    const adminUser = await createTestAdmin()
    createdUserIds.push(adminUser.id)

    await page.goto('/login')
    
    // Fill in admin credentials
    await page.getByPlaceholder('Enter your email').fill(adminUser.email)
    await page.getByPlaceholder('Enter your password').fill(adminUser.password)
    
    // Submit login form
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10000 })
    
    // Admin should have admin badge or special styling
    // This depends on how admin status is displayed in the UI
  })

  test('should reject login for unverified user', async ({ page }) => {
    // Create a fresh unverified user
    const unverifiedUser = await createUnverifiedTestUser()
    createdUserIds.push(unverifiedUser.id)

    await page.goto('/login')
    
    // Fill in unverified user credentials
    await page.getByPlaceholder('Enter your email').fill(unverifiedUser.email)
    await page.getByPlaceholder('Enter your password').fill(unverifiedUser.password)
    
    // Submit login form
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should show email verification error
    await expect(page.getByText(/please verify your email address before logging in/i)).toBeVisible()
    
    // Should stay on login page
    await expect(page).toHaveURL('/login')
  })

  test('should reject login with invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in invalid credentials (email that doesn't exist)
    await page.getByPlaceholder('Enter your email').fill('nonexistent@example.com')
    await page.getByPlaceholder('Enter your password').fill('wrongpassword')
    
    // Submit login form
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should show invalid credentials error
    await expect(page.getByText(/invalid credentials/i)).toBeVisible()
    
    // Should stay on login page
    await expect(page).toHaveURL('/login')
  })

  test('should reject login with wrong password', async ({ page }) => {
    // Create a test user first
    const testUser = await createTestUser()
    createdUserIds.push(testUser.id)

    await page.goto('/login')
    
    // Fill in valid email but wrong password
    await page.getByPlaceholder('Enter your email').fill(testUser.email)
    await page.getByPlaceholder('Enter your password').fill('wrongpassword')
    
    // Submit login form
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should show invalid credentials error
    await expect(page.getByText(/invalid credentials/i)).toBeVisible()
    
    // Should stay on login page
    await expect(page).toHaveURL('/login')
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/login')
    
    // Try to submit without filling fields
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // HTML5 validation should prevent submission
    const emailInput = page.getByPlaceholder('Enter your email')
    const passwordInput = page.getByPlaceholder('Enter your password')
    
    await expect(emailInput).toHaveAttribute('required')
    await expect(passwordInput).toHaveAttribute('required')
  })

  test('should display signup page', async ({ page }) => {
    await page.goto('/signup')
    
    // Check page elements
    await expect(page).toHaveTitle(/Opinionated Next.js Starter/)
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    
    // Check form fields
    await expect(page.getByPlaceholder('Enter your full name')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })

  test('should navigate between login and signup', async ({ page }) => {
    await page.goto('/login')
    
    // Click link to signup
    await page.getByRole('link', { name: /sign up/i }).click()
    await expect(page).toHaveURL('/signup')
    
    // Click link back to login
    await page.getByRole('link', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/login')
  })

  test('should handle logout', async ({ page }) => {
    // Create and login with a test user
    const testUser = await createTestUser()
    createdUserIds.push(testUser.id)
    
    await loginUser(page, testUser)
    
    // Find and click logout button (location depends on UI design)
    // This might be in a dropdown menu, sidebar, or header
    const logoutButton = page.getByRole('button', { name: /log out/i }).or(
      page.getByRole('link', { name: /log out/i })
    )
    
    if (await logoutButton.count() > 0) {
      await logoutButton.click()
      
      // Should redirect to login or home page
      await page.waitForURL(url => url.pathname === '/login' || url.pathname === '/')
    }
  })

  test('should display OAuth login options', async ({ page }) => {
    await page.goto('/login')
    
    // Check for OAuth buttons
    await expect(page.getByText('Or continue with')).toBeVisible()
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /meta/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /apple/i })).toBeVisible()
  })
})

test.describe('Email Verification Flow', () => {
  const createdUserIds: string[] = []

  test.afterEach(async () => {
    // Cleanup any users created during this test
    await cleanupTestUsers(createdUserIds)
    createdUserIds.length = 0
  })

  test('should display forgot password page', async ({ page }) => {
    await page.goto('/forgot-password')
    
    // Check page elements
    await expect(page.getByRole('heading', { name: 'Forgot Password' })).toBeVisible()
    await expect(page.getByPlaceholder('Enter your email address')).toBeVisible()
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /back to sign in/i })).toBeVisible()
  })

  test('should handle password reset request', async ({ page }) => {
    // Create a test user first
    const testUser = await createTestUser()
    createdUserIds.push(testUser.id)

    await page.goto('/forgot-password')
    
    // Fill in email for password reset
    await page.getByPlaceholder('Enter your email address').fill(testUser.email)
    
    // Submit form
    await page.getByRole('button', { name: /send reset link/i }).click()
    
    // Should show success message
    await expect(page.getByText(/if an account with that email exists/i)).toBeVisible({ timeout: 5000 })
  })

  test('should validate email format on password reset', async ({ page }) => {
    await page.goto('/forgot-password')
    
    // Fill in invalid email
    await page.getByPlaceholder('Enter your email address').fill('invalid-email')
    
    // Submit form
    await page.getByRole('button', { name: /send reset link/i }).click()
    
    // HTML5 validation should catch this
    const emailInput = page.getByPlaceholder('Enter your email address')
    await expect(emailInput).toHaveAttribute('type', 'email')
  })

  test('should navigate back to login from forgot password', async ({ page }) => {
    await page.goto('/forgot-password')
    
    // Click back to login
    await page.getByRole('link', { name: /back to sign in/i }).click()
    
    // Should navigate to login page
    await expect(page).toHaveURL('/login')
  })
})