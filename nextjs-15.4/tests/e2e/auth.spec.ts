import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    
    // Check page title
    await expect(page).toHaveTitle(/Sign In/)
    
    // Check form elements
    await expect(page.getByPlaceholder('Email')).toBeVisible()
    await expect(page.getByPlaceholder('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    
    // Check signup link
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible()
  })

  test('should display signup page', async ({ page }) => {
    await page.goto('/signup')
    
    // Check page title
    await expect(page).toHaveTitle(/Sign Up/)
    
    // Check form elements
    await expect(page.getByPlaceholder('Name (optional)')).toBeVisible()
    await expect(page.getByPlaceholder('Email')).toBeVisible()
    await expect(page.getByPlaceholder('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible()
    
    // Check login link
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
  })

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login')
    
    // Click submit without filling fields
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Browser should show HTML5 validation
    const emailInput = page.getByPlaceholder('Email')
    await expect(emailInput).toHaveAttribute('required', '')
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
})