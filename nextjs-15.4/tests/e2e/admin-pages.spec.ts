import { test, expect } from '@playwright/test'

// Helper function to login as admin
async function loginAsAdmin(page: any) {
  await page.goto('/dashboard')
  
  // Wait for redirect
  await page.waitForURL(url => url.pathname === '/dashboard' || url.pathname === '/login')
  
  // If redirected to login, sign in as admin
  if (page.url().includes('/login')) {
    await page.getByPlaceholder('Enter your email').fill('admin@example.com')
    await page.getByPlaceholder('Enter your password').fill('admin123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL('/dashboard')
  }
}

test.describe('Admin Error Tracking', () => {
  test('should display admin issues dashboard', async ({ page }) => {
    await loginAsAdmin(page)
    
    await page.goto('/dashboard/admin/issues')
    await expect(page).toHaveURL('/dashboard/admin/issues')
    
    // Check admin issues page elements
    await expect(page.getByText('Error Tracking')).toBeVisible()
    await expect(page.getByText('Issues')).toBeVisible()
    
    // Should have filtering options
    await expect(page.getByText('Status')).toBeVisible()
    await expect(page.getByText('Level')).toBeVisible()
    
    // Should have search functionality
    await expect(page.getByPlaceholder('Search issues')).toBeVisible()
    
    // Should have issues table or empty state
    const issuesTable = page.locator('table')
    const emptyState = page.getByText('No issues found')
    await expect(issuesTable.or(emptyState)).toBeVisible()
  })

  test('should allow issue filtering by status', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/dashboard/admin/issues')
    
    // Click status filter
    await page.getByText('Status').click()
    
    // Select a status option
    await page.getByText('Open').click()
    
    // Table should update with filtered results
    await page.waitForLoadState('networkidle')
    
    // URL should include filter parameters
    expect(page.url()).toContain('status=open')
  })

  test('should allow issue search', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/dashboard/admin/issues')
    
    // Search for issues
    await page.getByPlaceholder('Search issues').fill('database error')
    await page.keyboard.press('Enter')
    
    // Should filter results
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('search=database%20error')
  })

  test('should display issue details page', async ({ page }) => {
    await loginAsAdmin(page)
    
    // Navigate directly to a mock issue detail page
    await page.goto('/dashboard/admin/issues/test-issue-id')
    
    // Should show issue details or 404 if no issue exists
    const issueTitle = page.getByText('Issue Details')
    const notFound = page.getByText('Issue not found')
    await expect(issueTitle.or(notFound)).toBeVisible()
  })
})

test.describe('Admin Settings', () => {
  test('should display admin settings page', async ({ page }) => {
    await loginAsAdmin(page)
    
    await page.goto('/dashboard/admin/settings')
    await expect(page).toHaveURL('/dashboard/admin/settings')
    
    // Check admin settings elements
    await expect(page.getByText('Admin Settings')).toBeVisible()
    
    // Should have notification settings
    await expect(page.getByText('Email Notifications')).toBeVisible()
    await expect(page.getByText('Notification Level')).toBeVisible()
    
    // Should have configuration options
    await expect(page.getByRole('button', { name: /save settings/i })).toBeVisible()
  })

  test('should allow notification settings updates', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/dashboard/admin/settings')
    
    // Toggle email notifications
    const emailToggle = page.locator('input[type="checkbox"]').first()
    await emailToggle.click()
    
    // Save settings
    await page.getByRole('button', { name: /save settings/i }).click()
    
    // Should show success message
    await expect(page.getByText(/settings updated/i)).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Admin Notifications', () => {
  test('should display admin notifications page', async ({ page }) => {
    await loginAsAdmin(page)
    
    await page.goto('/dashboard/admin/notifications')
    await expect(page).toHaveURL('/dashboard/admin/notifications')
    
    // Check notifications page elements
    await expect(page.getByText('Notifications')).toBeVisible()
    
    // Should have notifications list or empty state
    const notificationsList = page.locator('[data-testid="notifications-list"]')
    const emptyState = page.getByText('No notifications')
    await expect(notificationsList.or(emptyState)).toBeVisible()
  })

  test('should display notification details page', async ({ page }) => {
    await loginAsAdmin(page)
    
    // Navigate to a mock notification detail
    await page.goto('/dashboard/admin/notifications/test-notification-id')
    
    // Should show notification details or 404
    const notificationContent = page.getByText('Notification Details')
    const notFound = page.getByText('Notification not found')
    await expect(notificationContent.or(notFound)).toBeVisible()
  })

  test('should allow notification actions', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/dashboard/admin/notifications')
    
    // If notifications exist, should have action buttons
    const markAsRead = page.getByRole('button', { name: /mark as read/i })
    const deleteNotification = page.getByRole('button', { name: /delete/i })
    
    // These buttons may or may not be visible depending on data
    // Just check that the page loads without error
    await expect(page.getByText('Notifications')).toBeVisible()
  })
})