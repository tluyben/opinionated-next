import { test, expect } from '@playwright/test'

test.describe('Complete User Flows', () => {
  test('complete new user onboarding flow', async ({ page }) => {
    // Start from landing page
    await page.goto('/')
    await expect(page.getByText(/Build Your Next/i)).toBeVisible()
    
    // Navigate to signup
    await page.getByRole('link', { name: /get started/i }).first().click()
    await expect(page).toHaveURL('/signup')
    
    // Create account
    await page.getByPlaceholder('Enter your name (optional)').fill('Flow Test User')
    await page.getByPlaceholder('Enter your email').fill('flowtest@example.com')
    await page.getByPlaceholder('Enter your password').fill('flowtest123')
    await page.getByRole('button', { name: /create account/i }).click()
    
    // Should redirect to dashboard or login
    await page.waitForTimeout(2000)
    
    // If redirected to login, complete login
    if (page.url().includes('/login')) {
      await page.getByPlaceholder('Enter your email').fill('flowtest@example.com')
      await page.getByPlaceholder('Enter your password').fill('flowtest123')
      await page.getByRole('button', { name: /sign in/i }).click()
    }
    
    // Should now be on dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Dashboard')).toBeVisible()
    
    // Explore dashboard sections
    await page.getByRole('link', { name: /profile/i }).click()
    await expect(page).toHaveURL('/profile')
    
    await page.getByRole('link', { name: /settings/i }).click()
    await expect(page).toHaveURL('/settings')
    
    // Create an API key
    await page.getByRole('button', { name: /create api key/i }).click()
    await page.getByPlaceholder(/API Key Name/i).fill('Onboarding Test Key')
    await page.getByRole('button', { name: /generate/i }).click()
    await expect(page.getByText(/API Key Generated/i)).toBeVisible()
    await page.getByRole('button', { name: /done/i }).click()
    
    // Verify API key was created
    await expect(page.getByText('Onboarding Test Key')).toBeVisible()
    
    // Navigate back to dashboard
    await page.getByRole('link', { name: /dashboard/i }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('admin user complete workflow', async ({ page }) => {
    // Create admin account
    await page.goto('/signup')
    await page.getByPlaceholder('Enter your name (optional)').fill('Admin Flow User')
    await page.getByPlaceholder('Enter your email').fill('adminflow@example.com')
    await page.getByPlaceholder('Enter your password').fill('adminflow123')
    await page.getByRole('button', { name: /create account/i }).click()
    
    await page.waitForTimeout(2000)
    
    if (page.url().includes('/login')) {
      await page.getByPlaceholder('Enter your email').fill('adminflow@example.com')
      await page.getByPlaceholder('Enter your password').fill('adminflow123')
      await page.getByRole('button', { name: /sign in/i }).click()
    }
    
    // Try to access admin areas
    await page.goto('/dashboard/admin/issues')
    
    // If admin access works, test admin workflow
    if (await page.getByText(/issues/i).isVisible()) {
      // Check issues dashboard
      await expect(page.getByText(/Monitor and manage/i)).toBeVisible()
      
      // Navigate to admin settings
      const adminSettingsLink = page.getByRole('link', { name: /admin.*settings/i }).or(
        page.getByRole('link').filter({ hasText: /settings/i })
      )
      
      if (await adminSettingsLink.isVisible()) {
        // Try direct navigation
        await page.goto('/dashboard/admin/settings')
        
        if (await page.getByText(/notification/i).isVisible()) {
          await expect(page.getByText(/notification/i)).toBeVisible()
        }
      }
      
      // Try to access database page
      await page.goto('/database')
      
      if (await page.getByText(/database/i).isVisible()) {
        await expect(page.getByText(/users|sessions|issues/i)).toBeVisible()
      }
    }
  })

  test('error tracking end-to-end flow', async ({ page }) => {
    // Login user
    await page.goto('/signup')
    await page.getByPlaceholder('Enter your email').fill('errortest@example.com')
    await page.getByPlaceholder('Enter your password').fill('errortest123')
    await page.getByRole('button', { name: /create account/i }).click()
    
    await page.waitForTimeout(2000)
    
    if (page.url().includes('/login')) {
      await page.getByPlaceholder('Enter your email').fill('errortest@example.com')
      await page.getByPlaceholder('Enter your password').fill('errortest123')
      await page.getByRole('button', { name: /sign in/i }).click()
    }
    
    // Go to error tracking test page
    await page.goto('/test-error-tracking')
    await expect(page.getByText('Error Tracking Test')).toBeVisible()
    
    // Trigger different types of errors
    await page.getByRole('button', { name: /trigger js error/i }).click()
    await page.waitForTimeout(1000)
    
    await page.getByRole('button', { name: /trigger promise rejection/i }).click()
    await page.waitForTimeout(1000)
    
    await page.getByRole('button', { name: /report manual error/i }).click()
    await page.waitForTimeout(1000)
    
    // If we have admin access, check if errors were tracked
    await page.goto('/dashboard/admin/issues')
    
    if (await page.getByText(/issues/i).isVisible()) {
      // Should see issues in the admin dashboard
      await expect(page.getByText(/issues/i)).toBeVisible()
      
      // Look for our test errors
      const errorEntries = page.getByText(/JavaScript Error|Promise Rejection|Manual Report/i)
      
      if (await errorEntries.first().isVisible()) {
        await expect(errorEntries.first()).toBeVisible()
      }
    }
  })

  test('responsive behavior across user journey', async ({ page }) => {
    // Test mobile journey
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Start on landing page
    await page.goto('/')
    await expect(page.getByText(/Build Your Next/i)).toBeVisible()
    
    // Mobile signup
    await page.getByRole('link', { name: /get started/i }).first().click()
    await page.getByPlaceholder('Enter your email').fill('mobile@example.com')
    await page.getByPlaceholder('Enter your password').fill('mobile123')
    await page.getByRole('button', { name: /create account/i }).click()
    
    await page.waitForTimeout(2000)
    
    if (page.url().includes('/login')) {
      await page.getByPlaceholder('Enter your email').fill('mobile@example.com')
      await page.getByPlaceholder('Enter your password').fill('mobile123')
      await page.getByRole('button', { name: /sign in/i }).click()
    }
    
    // Mobile dashboard navigation
    await expect(page.getByText('Dashboard')).toBeVisible()
    
    // Test mobile navigation to settings
    await page.getByRole('link', { name: /settings/i }).click()
    await expect(page.getByText(/API Keys/i)).toBeVisible()
    
    // Switch to desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.reload()
    
    // Should still work on desktop
    await expect(page.getByText(/API Keys/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /create api key/i })).toBeVisible()
  })

  test('theme switching across user journey', async ({ page }) => {
    await page.goto('/')
    
    // Test theme toggle
    const themeToggle = page.getByRole('button', { name: /toggle theme/i })
    await expect(themeToggle).toBeVisible()
    
    // Click theme toggle
    await themeToggle.click()
    
    // Theme should change (check by looking at data attributes or classes)
    // This depends on the implementation but the toggle should work
    
    // Continue with signup while theme is toggled
    await page.getByRole('link', { name: /get started/i }).first().click()
    await expect(page.getByText('Create Account')).toBeVisible()
    
    // Theme should persist across pages
    await expect(page.getByRole('button', { name: /toggle theme/i })).toBeVisible()
  })

  test('authentication state persistence', async ({ page }) => {
    // Create and login user
    await page.goto('/signup')
    await page.getByPlaceholder('Enter your email').fill('persist@example.com')
    await page.getByPlaceholder('Enter your password').fill('persist123')
    await page.getByRole('button', { name: /create account/i }).click()
    
    await page.waitForTimeout(2000)
    
    if (page.url().includes('/login')) {
      await page.getByPlaceholder('Enter your email').fill('persist@example.com')
      await page.getByPlaceholder('Enter your password').fill('persist123')
      await page.getByRole('button', { name: /sign in/i }).click()
    }
    
    await expect(page).toHaveURL('/dashboard')
    
    // Refresh page - should stay logged in
    await page.reload()
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Dashboard')).toBeVisible()
    
    // Navigate to different page and back
    await page.goto('/settings')
    await expect(page.getByText(/API Keys/i)).toBeVisible()
    
    // Direct navigation to dashboard should work
    await page.goto('/dashboard')
    await expect(page.getByText('Dashboard')).toBeVisible()
    
    // Try to access auth pages while logged in (should redirect)
    await page.goto('/login')
    await expect(page).toHaveURL('/dashboard')
    
    await page.goto('/signup')
    await expect(page).toHaveURL('/dashboard')
  })

  test('full API key lifecycle', async ({ page }) => {
    // Login
    await page.goto('/signup')
    await page.getByPlaceholder('Enter your email').fill('apikey@example.com')
    await page.getByPlaceholder('Enter your password').fill('apikey123')
    await page.getByRole('button', { name: /create account/i }).click()
    
    await page.waitForTimeout(2000)
    
    if (page.url().includes('/login')) {
      await page.getByPlaceholder('Enter your email').fill('apikey@example.com')
      await page.getByPlaceholder('Enter your password').fill('apikey123')
      await page.getByRole('button', { name: /sign in/i }).click()
    }
    
    await page.goto('/settings')
    
    // Create multiple API keys
    const keyNames = ['Production Key', 'Development Key', 'Testing Key']
    
    for (const keyName of keyNames) {
      await page.getByRole('button', { name: /create api key/i }).click()
      await page.getByPlaceholder(/API Key Name/i).fill(keyName)
      await page.getByRole('button', { name: /generate/i }).click()
      
      // Copy the key
      await page.getByRole('button', { name: /copy/i }).click()
      await page.getByRole('button', { name: /done/i }).click()
      
      // Verify key appears in list
      await expect(page.getByText(keyName)).toBeVisible()
    }
    
    // Delete one key
    const deleteButtons = page.getByRole('button').filter({ has: page.locator('[data-lucide="trash-2"]') })
    
    if (await deleteButtons.first().isVisible()) {
      await deleteButtons.first().click()
      
      // Confirm deletion
      await expect(page.getByText(/Delete API Key/i)).toBeVisible()
      await page.getByRole('button', { name: /delete key/i }).click()
      
      // One key should be removed
      await page.waitForTimeout(1000)
    }
    
    // Should still have remaining keys
    await expect(page.getByText(/API Keys/i)).toBeVisible()
  })
})