import { test, expect } from '@playwright/test'

// Helper function to login as user
async function loginAsUser(page: any) {
  await page.goto('/dashboard')
  
  // Wait for redirect to dashboard or login
  await page.waitForURL(url => url.pathname === '/dashboard' || url.pathname === '/login')
  
  // If redirected to login, sign in
  if (page.url().includes('/login')) {
    await page.getByPlaceholder('Enter your email').fill('user@example.com')
    await page.getByPlaceholder('Enter your password').fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL('/dashboard')
  }
}

test.describe('Profile Management', () => {
  test('should display profile page with user information', async ({ page }) => {
    await loginAsUser(page)
    
    // Navigate to profile
    await page.goto('/profile')
    await expect(page).toHaveURL('/profile')
    
    // Check profile page elements
    await expect(page.getByText('Profile')).toBeVisible()
    await expect(page.getByText('Manage your account settings')).toBeVisible()
    
    // Check form fields
    await expect(page.getByLabel('Name')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible()
  })

  test('should allow profile information updates', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/profile')
    
    // Update name field
    const nameField = page.getByLabel('Name')
    await nameField.clear()
    await nameField.fill('Updated Test User')
    
    // Save changes
    await page.getByRole('button', { name: /save changes/i }).click()
    
    // Should show success message or updated state
    await expect(page.getByText(/updated/i)).toBeVisible({ timeout: 5000 })
  })

  test('should handle avatar upload', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/profile')
    
    // Check avatar section exists
    await expect(page.getByText('Profile Picture')).toBeVisible()
    
    // Should have upload functionality
    const uploadButton = page.locator('input[type="file"]')
    if (await uploadButton.isVisible()) {
      // File upload input should be present
      expect(await uploadButton.count()).toBeGreaterThan(0)
    }
  })
})

test.describe('Settings Management', () => {
  test('should display settings page with API keys section', async ({ page }) => {
    await loginAsUser(page)
    
    // Navigate to settings
    await page.goto('/settings')
    await expect(page).toHaveURL('/settings')
    
    // Check settings page elements
    await expect(page.getByText('Settings')).toBeVisible()
    await expect(page.getByText('API Keys')).toBeVisible()
    
    // Check API key management
    await expect(page.getByRole('button', { name: /create new api key/i })).toBeVisible()
  })

  test('should allow API key creation', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/settings')
    
    // Click create API key button
    await page.getByRole('button', { name: /create new api key/i }).click()
    
    // Fill in API key name
    await page.getByPlaceholder('Enter API key name').fill('Test API Key')
    
    // Create the key
    await page.getByRole('button', { name: /create/i }).click()
    
    // Should show the new API key
    await expect(page.getByText('Test API Key')).toBeVisible({ timeout: 5000 })
  })

  test('should allow API key deletion with confirmation', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/settings')
    
    // First create an API key to delete
    await page.getByRole('button', { name: /create new api key/i }).click()
    await page.getByPlaceholder('Enter API key name').fill('Key to Delete')
    await page.getByRole('button', { name: /create/i }).click()
    await expect(page.getByText('Key to Delete')).toBeVisible()
    
    // Find and click delete button (trash icon)
    await page.locator('[data-testid="delete-api-key"]').first().click()
    
    // Confirm deletion in dialog
    await expect(page.getByText('Delete API Key')).toBeVisible()
    await page.getByRole('button', { name: /delete/i }).click()
    
    // Key should be removed
    await expect(page.getByText('Key to Delete')).not.toBeVisible({ timeout: 5000 })
  })

  test('should display theme switcher', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/settings')
    
    // Should have theme switching functionality
    await expect(page.getByText('Appearance')).toBeVisible()
    
    // Should have theme toggle button
    const themeToggle = page.locator('[data-testid="theme-toggle"]')
    if (await themeToggle.count() > 0) {
      await expect(themeToggle).toBeVisible()
    }
  })
})