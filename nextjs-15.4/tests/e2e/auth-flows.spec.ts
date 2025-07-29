import { test, expect } from '@playwright/test'

test.describe('Authentication Flows', () => {
  test('should successfully login with verified user', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in verified user credentials
    await page.getByPlaceholder('Enter your email').fill('user@example.com')
    await page.getByPlaceholder('Enter your password').fill('password123')
    
    // Submit login form
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Dashboard')).toBeVisible()
  })

  test('should successfully login with admin user', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in admin credentials
    await page.getByPlaceholder('Enter your email').fill('admin@example.com')
    await page.getByPlaceholder('Enter your password').fill('admin123')
    
    // Submit login form
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Dashboard')).toBeVisible()
    
    // Admin should have admin badge or special styling
    // This depends on how admin status is displayed in the UI
  })

  test('should reject login for unverified user', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in unverified user credentials
    await page.getByPlaceholder('Enter your email').fill('unverified@example.com')
    await page.getByPlaceholder('Enter your password').fill('password123')
    
    // Submit login form
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should show email verification error
    await expect(page.getByText(/please verify your email address/i)).toBeVisible()
    
    // Should stay on login page
    await expect(page).toHaveURL('/login')
  })

  test('should reject login with invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in invalid credentials
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
    await page.goto('/login')
    
    // Fill in valid email but wrong password
    await page.getByPlaceholder('Enter your email').fill('user@example.com')
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
    await expect(page.getByText('Create Account')).toBeVisible()
    
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
    // First login
    await page.goto('/login')
    await page.getByPlaceholder('Enter your email').fill('user@example.com')
    await page.getByPlaceholder('Enter your password').fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/dashboard')
    
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
  test('should display forgot password page', async ({ page }) => {
    await page.goto('/forgot-password')
    
    // Check page elements
    await expect(page.getByText('Forgot Password')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /back to login/i })).toBeVisible()
  })

  test('should handle password reset request', async ({ page }) => {
    await page.goto('/forgot-password')
    
    // Fill in email for password reset
    await page.getByPlaceholder('Enter your email').fill('user@example.com')
    
    // Submit form
    await page.getByRole('button', { name: /send reset link/i }).click()
    
    // Should show success message
    await expect(page.getByText(/reset link sent/i)).toBeVisible({ timeout: 5000 })
  })

  test('should validate email format on password reset', async ({ page }) => {
    await page.goto('/forgot-password')
    
    // Fill in invalid email
    await page.getByPlaceholder('Enter your email').fill('invalid-email')
    
    // Submit form
    await page.getByRole('button', { name: /send reset link/i }).click()
    
    // HTML5 validation should catch this
    const emailInput = page.getByPlaceholder('Enter your email')
    await expect(emailInput).toHaveAttribute('type', 'email')
  })

  test('should navigate back to login from forgot password', async ({ page }) => {
    await page.goto('/forgot-password')
    
    // Click back to login
    await page.getByRole('link', { name: /back to login/i }).click()
    
    // Should navigate to login page
    await expect(page).toHaveURL('/login')
  })
})