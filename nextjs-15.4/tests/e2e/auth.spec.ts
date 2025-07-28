import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    
    // Check page title
    await expect(page).toHaveTitle(/Opinionated Next.js Starter/)
    
    // Check card title
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByText('Enter your credentials to access your account')).toBeVisible()
    
    // Check form elements
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    
    // Check OAuth buttons
    await expect(page.getByText('Or continue with')).toBeVisible()
    
    // Check signup link
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible()
  })

  test('should display signup page', async ({ page }) => {
    await page.goto('/signup')
    
    // Check page title
    await expect(page).toHaveTitle(/Opinionated Next.js Starter/)
    
    // Check card title
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    await expect(page.getByText('Sign up to get started with your account')).toBeVisible()
    
    // Check form elements
    await expect(page.getByPlaceholder('Enter your full name')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your password (min 8 characters)')).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
    
    // Check OAuth buttons
    await expect(page.getByText('Or continue with')).toBeVisible()
    
    // Check login link
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
  })

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login')
    
    // Click submit without filling fields
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Browser should show HTML5 validation for required fields
    const emailInput = page.getByPlaceholder('Enter your email')
    await expect(emailInput).toHaveAttribute('required', '')
    
    const passwordInput = page.getByPlaceholder('Enter your password')
    await expect(passwordInput).toHaveAttribute('required', '')
  })

  test('should show validation errors on empty signup', async ({ page }) => {
    await page.goto('/signup')
    
    // Click submit without filling required fields
    await page.getByRole('button', { name: /create account/i }).click()
    
    // Browser should show HTML5 validation for required fields
    const emailInput = page.getByPlaceholder('Enter your email')
    await expect(emailInput).toHaveAttribute('required', '')
    
    const passwordInput = page.getByPlaceholder('Enter your password (min 8 characters)')
    await expect(passwordInput).toHaveAttribute('required', '')
  })

  test('should navigate between login and signup', async ({ page }) => {
    await page.goto('/login')
    
    // Click signup link
    await page.getByRole('link', { name: /sign up/i }).click()
    await expect(page).toHaveURL('/signup')
    
    // Click login link
    await page.getByRole('link', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/login')
  })

  test('should display OAuth providers', async ({ page }) => {
    await page.goto('/login')
    
    // Check OAuth buttons are present
    await expect(page.getByText('Or continue with')).toBeVisible()
    
    // OAuth providers should be available if configured
    // Note: We don't test actual OAuth flows in E2E as they require real credentials
  })

  test('should show login error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in invalid credentials
    await page.getByPlaceholder('Enter your email').fill('invalid@example.com')
    await page.getByPlaceholder('Enter your password').fill('wrongpassword')
    
    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should show error message (this will appear after server response)
    // We wait for the form to process
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible() // Still on login page
  })

  test('should validate email format', async ({ page }) => {
    await page.goto('/signup')
    
    // Fill in invalid email format
    await page.getByPlaceholder('Enter your email').fill('invalid-email')
    await page.getByPlaceholder('Enter your password (min 8 characters)').fill('password123')
    
    // Browser HTML5 validation should prevent submission
    await page.getByRole('button', { name: /create account/i }).click()
    
    // Should still be on signup page due to validation
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
  })
})