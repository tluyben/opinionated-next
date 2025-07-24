import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should display landing page elements', async ({ page }) => {
    await page.goto('/')
    
    // Check hero section
    await expect(page.getByText(/Welcome to Next.js Starter/i)).toBeVisible()
    
    // Check navigation buttons
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible()
    
    // Check features section
    await expect(page.getByText(/Features/i)).toBeVisible()
  })

  test('should navigate to login from landing page', async ({ page }) => {
    await page.goto('/')
    
    await page.getByRole('link', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/login')
  })

  test('should navigate to signup from landing page', async ({ page }) => {
    await page.goto('/')
    
    await page.getByRole('link', { name: /get started/i }).click()
    await expect(page).toHaveURL('/signup')
  })
})