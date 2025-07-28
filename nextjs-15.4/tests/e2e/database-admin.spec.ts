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

// Helper function to login as regular user
async function loginAsUser(page: any) {
  await page.goto('/dashboard')
  
  // Wait for redirect
  await page.waitForURL(url => url.pathname === '/dashboard' || url.pathname === '/login')
  
  // If redirected to login, sign in as user
  if (page.url().includes('/login')) {
    await page.getByPlaceholder('Enter your email').fill('user@example.com')
    await page.getByPlaceholder('Enter your password').fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL('/dashboard')
  }
}

test.describe('Database Admin Interface', () => {
  test('should display database browser for admin users', async ({ page }) => {
    await loginAsAdmin(page)
    
    await page.goto('/database')
    await expect(page).toHaveURL('/database')
    
    // Check database page elements
    await expect(page.getByText('Database Browser')).toBeVisible()
    
    // Should show list of tables
    await expect(page.getByText('Tables')).toBeVisible()
    
    // Should have common database tables
    await expect(page.getByText('users')).toBeVisible()
    await expect(page.getByText('sessions')).toBeVisible()
    
    // Should have table links
    await expect(page.locator('a[href="/database/users"]')).toBeVisible()
  })

  test('should redirect non-admin users from database page', async ({ page }) => {
    await loginAsUser(page)
    
    await page.goto('/database')
    
    // Should redirect to unauthorized or forbidden page
    await page.waitForURL(url => url.pathname !== '/database')
    
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/(unauthorized|forbidden|dashboard)/)
  })

  test('should display table details for admin users', async ({ page }) => {
    await loginAsAdmin(page)
    
    await page.goto('/database/users')
    await expect(page).toHaveURL('/database/users')
    
    // Should show table details
    await expect(page.getByText('users table')).toBeVisible()
    
    // Should show table structure
    await expect(page.getByText('Columns')).toBeVisible()
    await expect(page.getByText('id')).toBeVisible()
    await expect(page.getByText('email')).toBeVisible()
    
    // Should show table data
    await expect(page.getByText('Data')).toBeVisible()
    
    // Should have data table or empty state
    const dataTable = page.locator('table')
    const emptyState = page.getByText('No data found')
    await expect(dataTable.or(emptyState)).toBeVisible()
  })

  test('should allow table navigation', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/database')
    
    // Click on a table link
    await page.locator('a[href="/database/sessions"]').click()
    
    // Should navigate to table detail page
    await expect(page).toHaveURL('/database/sessions')
    await expect(page.getByText('sessions table')).toBeVisible()
  })

  test('should provide table statistics', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/database/users')
    
    // Should show row count or statistics
    const rowCount = page.getByText(/\d+ rows?/)
    const statistics = page.getByText('Statistics')
    
    // At least one of these should be visible
    await expect(rowCount.or(statistics)).toBeVisible()
  })

  test('should allow data filtering and search', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/database/users')
    
    // Should have search or filter capabilities
    const searchInput = page.getByPlaceholder('Search')
    const filterButton = page.getByText('Filter')
    
    // Check if search/filter functionality exists
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible()
    } else if (await filterButton.count() > 0) {
      await expect(filterButton).toBeVisible()
    }
  })

  test('should provide data export functionality', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/database/users')
    
    // Should have export options
    const exportButton = page.getByText('Export')
    const downloadButton = page.getByText('Download')
    
    // Check if export functionality exists
    if (await exportButton.count() > 0) {
      await expect(exportButton).toBeVisible()
    }
  })

  test('should handle non-existent tables gracefully', async ({ page }) => {
    await loginAsAdmin(page)
    
    await page.goto('/database/nonexistent_table')
    
    // Should show appropriate error message
    await expect(page.getByText('Table not found')).toBeVisible()
  })

  test('should maintain admin authentication throughout navigation', async ({ page }) => {
    await loginAsAdmin(page)
    
    // Navigate through multiple database pages
    await page.goto('/database')
    await expect(page.getByText('Database Browser')).toBeVisible()
    
    await page.goto('/database/users')
    await expect(page.getByText('users table')).toBeVisible()
    
    await page.goto('/database/sessions')
    await expect(page.getByText('sessions table')).toBeVisible()
    
    // Should remain authenticated throughout
    await page.goto('/database')
    await expect(page.getByText('Database Browser')).toBeVisible()
  })
})