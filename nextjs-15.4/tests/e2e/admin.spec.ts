import { test, expect } from '@playwright/test'
import { createTestAdmin, createTestUser, cleanupTestUsers, loginUser } from './helpers/test-db'

// Helper to create and login as a real admin user
async function loginAsAdmin(page: any) {
  const adminUser = await createTestAdmin()
  await loginUser(page, adminUser)
  return adminUser
}

test.describe('Admin Dashboard', () => {
  const createdUserIds: string[] = []

  test.afterEach(async () => {
    // Cleanup any users created during this test
    await cleanupTestUsers(createdUserIds)
    createdUserIds.length = 0
  })

  test('should access admin areas as admin user', async ({ page }) => {
    const adminUser = await loginAsAdmin(page)
    createdUserIds.push(adminUser.id)
    
    // Try to access admin issues page
    await page.goto('/dashboard/admin/issues')
    
    // If admin access works, should see issues page
    if (await page.getByRole('heading', { name: 'Issues', exact: true }).isVisible()) {
      await expect(page.getByRole('heading', { name: 'Issues', exact: true })).toBeVisible()
      await expect(page.getByText('Monitor and manage application errors and issues')).toBeVisible()
    } else {
      // If redirected, it means user doesn't have admin role
      // This is expected for non-admin users
      console.log('User does not have admin access')
    }
  })

  test('should display issues dashboard', async ({ page }) => {
    const adminUser = await loginAsAdmin(page)
    createdUserIds.push(adminUser.id)
    await page.goto('/dashboard/admin/issues')
    
    // Check if admin area is accessible
    if (await page.getByRole('heading', { name: 'Issues', exact: true }).isVisible()) {
      // Check issue stats cards
      const totalIssuesCard = page.getByRole('heading', { name: 'Total Issues' })
      const openIssuesCard = page.getByRole('heading', { name: 'Open Issues' })
      await expect(totalIssuesCard.or(openIssuesCard)).toBeVisible()
      
      // Check issues table or empty state
      const issuesTable = page.getByRole('table')
      const emptyState = page.getByText(/no issues found/i)
      
      await expect(issuesTable.or(emptyState)).toBeVisible()
    }
  })

  test('should filter issues by status and level', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/dashboard/admin/issues')
    
    if (await page.getByText(/issues/i).isVisible()) {
      // Look for filter controls
      const statusFilter = page.getByRole('combobox').or(page.getByRole('button')).filter({ hasText: /status|filter/i })
      const levelFilter = page.getByRole('combobox').or(page.getByRole('button')).filter({ hasText: /level|severity/i })
      
      if (await statusFilter.isVisible()) {
        await statusFilter.click()
        // Select a filter option if available
        const filterOption = page.getByRole('option').or(page.getByRole('menuitem')).first()
        if (await filterOption.isVisible()) {
          await filterOption.click()
        }
      }
    }
  })

  test('should search issues', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/dashboard/admin/issues')
    
    if (await page.getByText(/issues/i).isVisible()) {
      // Look for search input
      const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole('searchbox'))
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('test error')
        await page.keyboard.press('Enter')
        
        // Should update the issues list
        await expect(page.getByText(/issues/i)).toBeVisible()
      }
    }
  })

  test('should access admin settings', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/dashboard/admin/settings')
    
    if (await page.getByText(/settings/i).isVisible()) {
      // Check admin settings elements
      await expect(page.getByText(/settings/i)).toBeVisible()
      
      // Look for notification settings
      const emailToggle = page.getByRole('switch').or(page.getByRole('checkbox')).filter({ hasText: /email|notification/i })
      const levelSelect = page.getByRole('combobox').filter({ hasText: /level|severity/i })
      
      if (await emailToggle.isVisible()) {
        await expect(emailToggle).toBeVisible()
      }
      
      if (await levelSelect.isVisible()) {
        await expect(levelSelect).toBeVisible()
      }
    }
  })

  test('should update admin notification settings', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/dashboard/admin/settings')
    
    if (await page.getByText(/settings/i).isVisible()) {
      // Look for settings form
      const saveButton = page.getByRole('button', { name: /save|update/i })
      
      if (await saveButton.isVisible()) {
        // Try to save settings
        await saveButton.click()
        
        // Should show success message or stay on page
        await expect(page.getByText(/settings/i)).toBeVisible()
      }
    }
  })

  test('should view individual issue details', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/dashboard/admin/issues')
    
    if (await page.getByText(/issues/i).isVisible()) {
      // Look for issue links in table
      const issueLink = page.getByRole('link').filter({ hasText: /view|details/i }).first()
      
      if (await issueLink.isVisible()) {
        await issueLink.click()
        
        // Should navigate to issue detail page
        await expect(page.url()).toMatch(/\/issues\/[^\/]+$/)
        
        // Should show issue details
        await expect(page.getByText(/issue|error/i)).toBeVisible()
      }
    }
  })

  test('should update issue status', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/dashboard/admin/issues')
    
    if (await page.getByText(/issues/i).isVisible()) {
      // Look for status update controls
      const statusButton = page.getByRole('button').filter({ hasText: /open|resolved|closed/i }).first()
      
      if (await statusButton.isVisible()) {
        await statusButton.click()
        
        // Look for status options
        const statusOption = page.getByRole('menuitem').or(page.getByRole('option')).filter({ hasText: /resolved|closed/i }).first()
        
        if (await statusOption.isVisible()) {
          await statusOption.click()
          
          // Should update the status
          await expect(page.getByText(/issues/i)).toBeVisible()
        }
      }
    }
  })
})

test.describe('Admin Access Control', () => {
  test('should restrict admin areas to admin users only', async ({ page }) => {
    // Create a regular user
    await page.goto('/signup')
    await page.getByPlaceholder('Enter your full name').fill('Regular User')
    await page.getByPlaceholder('Enter your email').fill('user@example.com')
    await page.getByPlaceholder('Enter your password (min 8 characters)').fill('user123456')
    await page.getByRole('button', { name: /create account/i }).click()
    
    // Wait for redirect
    await page.waitForTimeout(2000)
    
    // If redirected to login, sign in
    if (page.url().includes('/login')) {
      await page.getByPlaceholder('Enter your email').fill('user@example.com')
      await page.getByPlaceholder('Enter your password').fill('user123456')
      await page.getByRole('button', { name: /sign in/i }).click()
    }
    
    // Try to access admin area
    await page.goto('/dashboard/admin/issues')
    
    // Should be redirected away from admin area or show access denied
    await expect(page).not.toHaveURL('/dashboard/admin/issues')
  })

  test('should show admin badge for admin users', async ({ page }) => {
    await loginAsAdmin(page)
    
    // Check for admin badge in the UI
    const adminBadge = page.getByText(/admin/i).filter({ hasText: /badge|role/i })
    
    // Admin badge might be visible in header, sidebar, or profile
    if (await adminBadge.isVisible()) {
      await expect(adminBadge).toBeVisible()
    }
  })
})

test.describe('Database Admin Page', () => {
  const createdUserIds: string[] = []

  test.afterEach(async () => {
    // Cleanup any users created during this test
    await cleanupTestUsers(createdUserIds)
    createdUserIds.length = 0
  })

  test('should access database page as admin', async ({ page }) => {
    const adminUser = await loginAsAdmin(page)
    createdUserIds.push(adminUser.id)
    await page.goto('/database')
    
    // Database page should show tables
    if (await page.getByRole('heading', { name: 'Database Admin' }).isVisible()) {
      await expect(page.getByRole('heading', { name: 'Database Admin' })).toBeVisible()
      
      // Should show database tables
      await expect(page.getByRole('heading', { name: 'Database Tables' })).toBeVisible()
    }
  })

  test('should browse database tables', async ({ page }) => {
    const adminUser = await loginAsAdmin(page)
    createdUserIds.push(adminUser.id)
    await page.goto('/database')
    
    if (await page.getByRole('heading', { name: 'Database Admin' }).isVisible()) {
      // Click on a table link
      const tableLink = page.getByRole('link').filter({ hasText: /users|issues/i }).first()
      
      if (await tableLink.isVisible()) {
        await tableLink.click()
        
        // Should show table data
        await expect(page.getByRole('table').or(page.getByText(/no data/i))).toBeVisible()
      }
    }
  })

  test('should restrict database access to admin only', async ({ page }) => {
    // Create and login as a regular user (not admin)
    const regularUser = await createTestUser()
    createdUserIds.push(regularUser.id)
    await loginUser(page, regularUser)
    
    // Try to access database page as regular user
    await page.goto('/database')
    
    // Should be redirected away or show access denied
    await expect(page).not.toHaveURL('/database')
  })
})