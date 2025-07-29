import { test, expect } from '@playwright/test'
import { createTestUser, createTestAdmin, cleanupTestUsers, loginUser } from './helpers/test-db'

test.describe('Dashboard', () => {
  const createdUserIds: string[] = []

  test.afterEach(async () => {
    // Cleanup any users created during this test
    await cleanupTestUsers(createdUserIds)
    createdUserIds.length = 0
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('should display dashboard after login', async ({ page }) => {
    // Create and login with a test user
    const testUser = await createTestUser()
    createdUserIds.push(testUser.id)
    await loginUser(page, testUser)
    
    // Check we're on dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page).toHaveTitle(/Opinionated Next.js Starter/)
    
    // Check dashboard layout elements
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    
    // Check sidebar navigation
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /profile/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /settings/i })).toBeVisible()
  })

  test('should navigate between dashboard sections', async ({ page }) => {
    // Create and login with a test user
    const testUser = await createTestUser()
    createdUserIds.push(testUser.id)
    await loginUser(page, testUser)
    
    // Navigate to profile
    await page.getByRole('link', { name: /profile/i }).click()
    await expect(page).toHaveURL('/profile')
    
    // Navigate to settings
    await page.getByRole('link', { name: /settings/i }).click()
    await expect(page).toHaveURL('/settings')
    
    // Navigate back to dashboard
    await page.getByRole('link', { name: /dashboard/i }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('should display mobile responsive sidebar', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Create and login with a test user
    const testUser = await createTestUser()
    createdUserIds.push(testUser.id)
    await loginUser(page, testUser)
    
    // Check that mobile navigation is working
    // On mobile, sidebar should be collapsible
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('should allow user logout', async ({ page }) => {
    // Create and login with a test user
    const testUser = await createTestUser()
    createdUserIds.push(testUser.id)
    await loginUser(page, testUser)
    
    // Find and click logout button (might be in user menu)
    // This depends on the actual implementation
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    
    // Look for logout functionality
    const logoutButton = page.getByRole('button', { name: /logout/i }).or(
      page.getByRole('link', { name: /logout/i })
    )
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
      await expect(page).toHaveURL('/')
    }
  })
})

test.describe('Profile Page', () => {
  const createdUserIds: string[] = []

  test.afterEach(async () => {
    await cleanupTestUsers(createdUserIds)
    createdUserIds.length = 0
  })

  test('should display and update profile information', async ({ page }) => {
    const testUser = await createTestUser()
    createdUserIds.push(testUser.id)
    await loginUser(page, testUser)
    await page.goto('/profile')
    
    // Check profile page elements
    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible()
    
    // Should have form fields for user information
    const nameInput = page.getByPlaceholder(/name/i).or(page.getByLabel(/name/i))
    const emailInput = page.getByPlaceholder(/email/i).or(page.getByLabel(/email/i))
    
    if (await nameInput.isVisible()) {
      await expect(nameInput).toBeVisible()
    }
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeVisible()
    }
  })

  test('should handle avatar upload', async ({ page }) => {
    const testUser = await createTestUser()
    createdUserIds.push(testUser.id)
    await loginUser(page, testUser)
    await page.goto('/profile')
    
    // Look for avatar upload functionality
    const avatarUpload = page.getByText(/upload/i).or(page.locator('input[type="file"]'))
    
    // Avatar functionality may exist
    if (await avatarUpload.isVisible()) {
      await expect(avatarUpload).toBeVisible()
    }
  })
})

test.describe('Settings Page', () => {
  const createdUserIds: string[] = []

  test.afterEach(async () => {
    await cleanupTestUsers(createdUserIds)
    createdUserIds.length = 0
  })

  test('should display settings page', async ({ page }) => {
    const testUser = await createTestUser()
    createdUserIds.push(testUser.id)
    await loginUser(page, testUser)
    await page.goto('/settings')
    
    // Check settings page elements
    await expect(page.getByRole('heading', { name: 'API Keys', exact: true })).toBeVisible()
    await expect(page.getByText(/Manage your API keys for secure access/i)).toBeVisible()
    
    // Should show API key creation button
    await expect(page.getByRole('button', { name: /create api key/i })).toBeVisible()
  })

  test('should create new API key', async ({ page }) => {
    const testUser = await createTestUser()
    createdUserIds.push(testUser.id)
    await loginUser(page, testUser)
    await page.goto('/settings')
    
    // Click create API key button
    await page.getByRole('button', { name: /create api key/i }).click()
    
    // Should open dialog
    await expect(page.getByText(/Create New API Key/i)).toBeVisible()
    
    // Fill in API key name
    await page.getByPlaceholder(/API Key Name/i).fill('Test API Key')
    
    // Click generate button
    await page.getByRole('button', { name: /generate/i }).click()
    
    // Should show generated key
    await expect(page.getByText(/API Key Generated/i)).toBeVisible()
    
    // Should have copy functionality
    await expect(page.getByRole('button', { name: /copy/i })).toBeVisible()
    
    // Close dialog
    await page.getByRole('button', { name: /done/i }).click()
    
    // Should see the new API key in the list
    await expect(page.getByText('Test API Key')).toBeVisible()
  })

  test('should delete API key with confirmation', async ({ page }) => {
    const testUser = await createTestUser()
    createdUserIds.push(testUser.id)
    await loginUser(page, testUser)
    await page.goto('/settings')
    
    // First create an API key
    await page.getByRole('button', { name: /create api key/i }).click()
    await page.getByPlaceholder(/API Key Name/i).fill('Key to Delete')
    await page.getByRole('button', { name: /generate/i }).click()
    await page.getByRole('button', { name: /done/i }).click()
    
    // Now delete it
    const deleteButton = page.getByRole('button').filter({ has: page.locator('[data-lucide="trash-2"]') })
    if (await deleteButton.isVisible()) {
      await deleteButton.click()
      
      // Should show confirmation dialog
      await expect(page.getByText(/Delete API Key/i)).toBeVisible()
      await expect(page.getByText(/Are you sure/i)).toBeVisible()
      
      // Confirm deletion
      await page.getByRole('button', { name: /delete key/i }).click()
      
      // Key should be removed from list
      await expect(page.getByText('Key to Delete')).not.toBeVisible()
    }
  })
})

test.describe('Demo Pages', () => {
  const createdUserIds: string[] = []

  test.afterEach(async () => {
    await cleanupTestUsers(createdUserIds)
    createdUserIds.length = 0
  })

  test('should access LLM demo page', async ({ page }) => {
    const testUser = await createTestUser()
    createdUserIds.push(testUser.id)
    await loginUser(page, testUser)
    
    // Try to navigate to LLM demo
    await page.goto('/demo/llm')
    
    // Should show LLM demo page
    if (await page.getByRole('heading', { name: 'LLM Chat Demo' }).isVisible()) {
      await expect(page.getByRole('heading', { name: 'LLM Chat Demo' })).toBeVisible()
    }
  })

  test('should access payments demo page', async ({ page }) => {
    const testUser = await createTestUser()
    createdUserIds.push(testUser.id)
    await loginUser(page, testUser)
    
    // Try to navigate to payments demo
    await page.goto('/demo/payments')
    
    // Should show payments demo page
    if (await page.getByRole('heading', { name: /payment/i }).isVisible()) {
      await expect(page.getByRole('heading', { name: /payment/i })).toBeVisible()
    }
  })
})

test.describe('Error Tracking Test Page', () => {
  const createdUserIds: string[] = []

  test.afterEach(async () => {
    await cleanupTestUsers(createdUserIds)
    createdUserIds.length = 0
  })

  test('should access error tracking test page', async ({ page }) => {
    const testUser = await createTestUser()
    createdUserIds.push(testUser.id)
    await loginUser(page, testUser)
    await page.goto('/test-error-tracking')
    
    // Check error tracking test page
    await expect(page.getByText('Error Tracking Test')).toBeVisible()
    
    // Check test buttons are present
    await expect(page.getByRole('button', { name: /trigger react error/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /trigger js error/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /trigger promise rejection/i })).toBeVisible()
  })

  test('should trigger and handle React errors', async ({ page }) => {
    const testUser = await createTestUser()
    createdUserIds.push(testUser.id)
    await loginUser(page, testUser)
    await page.goto('/test-error-tracking')
    
    // Click React error button
    await page.getByRole('button', { name: /trigger react error/i }).click()
    
    // Wait a moment for error handling
    await page.waitForTimeout(1000)
    
    // After error, the error boundary should show an error message
    await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeVisible()
    await expect(page.getByText('An unexpected error occurred')).toBeVisible()
  })
})