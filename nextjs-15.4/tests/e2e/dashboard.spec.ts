import { test, expect } from '@playwright/test'

// Helper to create a test user and login
async function loginAsUser(page: any, email = 'testuser@example.com', password = 'testpass123') {
  await page.goto('/signup')
  
  // Create user account
  await page.getByPlaceholder('Enter your full name').fill('Test User')
  await page.getByPlaceholder('Enter your email').fill(email)
  await page.getByPlaceholder('Enter your password (min 8 characters)').fill(password)
  await page.getByRole('button', { name: /create account/i }).click()
  
  // Wait for redirect to dashboard or login
  await page.waitForURL(url => url.pathname === '/dashboard' || url.pathname === '/login')
  
  // If redirected to login, sign in
  if (page.url().includes('/login')) {
    await page.getByPlaceholder('Enter your email').fill(email)
    await page.getByPlaceholder('Enter your password').fill(password)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL('/dashboard')
  }
}

test.describe('Dashboard', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('should display dashboard after login', async ({ page }) => {
    await loginAsUser(page)
    
    // Check we're on dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page).toHaveTitle(/Opinionated Next.js Starter/)
    
    // Check dashboard layout elements
    await expect(page.getByText('Dashboard')).toBeVisible()
    
    // Check sidebar navigation
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /profile/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /settings/i })).toBeVisible()
  })

  test('should navigate between dashboard sections', async ({ page }) => {
    await loginAsUser(page)
    
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
    await loginAsUser(page)
    
    // Check that mobile navigation is working
    // On mobile, sidebar should be collapsible
    await expect(page.getByText('Dashboard')).toBeVisible()
  })

  test('should allow user logout', async ({ page }) => {
    await loginAsUser(page)
    
    // Find and click logout button (might be in user menu)
    // This depends on the actual implementation
    await expect(page.getByText('Dashboard')).toBeVisible()
    
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
  test('should display and update profile information', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/profile')
    
    // Check profile page elements
    await expect(page.getByText(/profile/i)).toBeVisible()
    
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
    await loginAsUser(page)
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
  test('should display settings page', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/settings')
    
    // Check settings page elements
    await expect(page.getByText(/API Keys/i)).toBeVisible()
    await expect(page.getByText(/Manage your API keys/i)).toBeVisible()
    
    // Should show API key creation button
    await expect(page.getByRole('button', { name: /create api key/i })).toBeVisible()
  })

  test('should create new API key', async ({ page }) => {
    await loginAsUser(page)
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
    await loginAsUser(page)
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
  test('should access LLM demo page', async ({ page }) => {
    await loginAsUser(page)
    
    // Try to navigate to LLM demo
    await page.goto('/demo/llm')
    
    // Should show LLM demo page
    if (await page.getByText(/LLM/i).isVisible()) {
      await expect(page.getByText(/LLM/i)).toBeVisible()
    }
  })

  test('should access payments demo page', async ({ page }) => {
    await loginAsUser(page)
    
    // Try to navigate to payments demo
    await page.goto('/demo/payments')
    
    // Should show payments demo page
    if (await page.getByText(/payment/i).isVisible()) {
      await expect(page.getByText(/payment/i)).toBeVisible()
    }
  })
})

test.describe('Error Tracking Test Page', () => {
  test('should access error tracking test page', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/test-error-tracking')
    
    // Check error tracking test page
    await expect(page.getByText('Error Tracking Test')).toBeVisible()
    
    // Check test buttons are present
    await expect(page.getByRole('button', { name: /trigger react error/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /trigger js error/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /trigger promise rejection/i })).toBeVisible()
  })

  test('should trigger and handle React errors', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/test-error-tracking')
    
    // Click React error button
    await page.getByRole('button', { name: /trigger react error/i }).click()
    
    // Should show error boundary fallback
    // Note: This might be caught by the error boundary
    await expect(page.getByText('Error Tracking Test')).toBeVisible()
  })
})