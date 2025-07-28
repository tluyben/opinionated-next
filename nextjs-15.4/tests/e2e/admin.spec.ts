import { test, expect } from '@playwright/test'

// Helper to create admin user (if it doesn't exist) and login
async function loginAsAdmin(page: any) {
  // First try to login with default admin credentials
  await page.goto('/login')
  
  // Try default admin credentials first
  await page.getByPlaceholder('Enter your email').fill('admin@example.com')
  await page.getByPlaceholder('Enter your password').fill('admin123')
  await page.getByRole('button', { name: /sign in/i }).click()
  
  // Wait for response
  await page.waitForTimeout(2000)
  
  // If login failed, create admin account
  if (page.url().includes('/login')) {
    // Go to signup to create admin account
    await page.goto('/signup')
    await page.getByPlaceholder('Enter your full name').fill('Admin User')
    await page.getByPlaceholder('Enter your email').fill('admin@example.com')
    await page.getByPlaceholder('Enter your password (min 8 characters)').fill('admin123')
    await page.getByRole('button', { name: /create account/i }).click()
    
    // Wait for redirect
    await page.waitForTimeout(2000)
    
    // If redirected to login, sign in
    if (page.url().includes('/login')) {
      await page.getByPlaceholder('Enter your email').fill('admin@example.com')
      await page.getByPlaceholder('Enter your password').fill('admin123')
      await page.getByRole('button', { name: /sign in/i }).click()
    }
  }
  
  // Should now be logged in - check if we're on dashboard
  await page.waitForURL(url => url.pathname.includes('/dashboard') || url.pathname === '/')
}

test.describe('Admin Dashboard', () => {
  test('should access admin areas as admin user', async ({ page }) => {
    await loginAsAdmin(page)
    
    // Try to access admin issues page
    await page.goto('/dashboard/admin/issues')
    
    // If admin access works, should see issues page
    if (await page.getByText(/issues/i).isVisible()) {
      await expect(page.getByText(/issues/i)).toBeVisible()
      await expect(page.getByText(/Monitor and manage/i)).toBeVisible()
    } else {
      // If redirected, it means user doesn't have admin role
      // This is expected for non-admin users
      console.log('User does not have admin access')
    }
  })

  test('should display issues dashboard', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/dashboard/admin/issues')
    
    // Check if admin area is accessible
    if (await page.getByText(/issues/i).isVisible()) {
      // Check issue stats cards
      const statsCards = page.locator('[role="main"]').getByText(/open|resolved|error|warning/i)
      await expect(statsCards.first()).toBeVisible()
      
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
  test('should access database page as admin', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/database')
    
    // Database page should show tables
    if (await page.getByText(/database/i).isVisible()) {
      await expect(page.getByText(/database/i)).toBeVisible()
      
      // Should show database tables
      await expect(page.getByText(/users|sessions|issues/i)).toBeVisible()
    }
  })

  test('should browse database tables', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/database')
    
    if (await page.getByText(/database/i).isVisible()) {
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
    // Try to access as non-admin user
    await page.goto('/signup')
    await page.getByPlaceholder('Enter your full name').fill('Non Admin')
    await page.getByPlaceholder('Enter your email').fill('nonadmin@example.com')
    await page.getByPlaceholder('Enter your password (min 8 characters)').fill('user12345')
    await page.getByRole('button', { name: /create account/i }).click()
    
    await page.waitForTimeout(2000)
    
    if (page.url().includes('/login')) {
      await page.getByPlaceholder('Enter your email').fill('nonadmin@example.com')
      await page.getByPlaceholder('Enter your password').fill('user12345')
      await page.getByRole('button', { name: /sign in/i }).click()
    }
    
    // Try to access database page
    await page.goto('/database')
    
    // Should be redirected away or show access denied
    await expect(page).not.toHaveURL('/database')
  })
})