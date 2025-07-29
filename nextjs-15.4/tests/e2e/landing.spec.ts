import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should display landing page elements', async ({ page }) => {
    await page.goto('/')
    
    // Check page title
    await expect(page).toHaveTitle(/Opinionated Next.js Starter/)
    
    // Check hero section
    await expect(page.getByText(/Build Your Next/i)).toBeVisible()
    await expect(page.getByText('SaaS Application', { exact: true })).toBeVisible()
    
    // Check header navigation
    await expect(page.locator('header').getByRole('heading', { name: 'NextJS Starter' })).toBeVisible()
    
    // Check navigation buttons in header
    const headerSignIn = page.locator('header').getByRole('link', { name: /sign in/i })
    const headerGetStarted = page.locator('header').getByRole('link', { name: /get started/i })
    await expect(headerSignIn).toBeVisible()
    await expect(headerGetStarted).toBeVisible()
    
    // Check hero buttons
    const heroSignIn = page.locator('main').getByRole('link', { name: /sign in/i })
    const heroGetStarted = page.locator('main').getByRole('link', { name: /get started/i })
    await expect(heroSignIn).toBeVisible()
    await expect(heroGetStarted).toBeVisible()
    
    // Check features section
    await expect(page.getByRole('heading', { name: 'Everything You Need' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Lightning Fast' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Secure by Default' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Mobile First' })).toBeVisible()
    
    // Check pricing section
    await expect(page.getByRole('heading', { name: 'Simple Pricing' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Starter', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pro' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Enterprise' })).toBeVisible()
  })

  test('should navigate to login from header', async ({ page }) => {
    await page.goto('/')
    
    // Click header sign in button
    await page.locator('header').getByRole('link', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/login')
  })

  test('should navigate to signup from header', async ({ page }) => {
    await page.goto('/')
    
    // Click header get started button
    await page.locator('header').getByRole('link', { name: /get started/i }).click()
    await expect(page).toHaveURL('/signup')
  })

  test('should navigate to login from hero', async ({ page }) => {
    await page.goto('/')
    
    // Click hero sign in button
    await page.locator('main').getByRole('link', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/login')
  })

  test('should navigate to signup from hero', async ({ page }) => {
    await page.goto('/')
    
    // Click hero get started button
    await page.locator('main').getByRole('link', { name: /get started/i }).click()
    await expect(page).toHaveURL('/signup')
  })

  test('should display theme toggle', async ({ page }) => {
    await page.goto('/')
    
    // Theme toggle should be visible
    await expect(page.getByRole('button', { name: /toggle theme/i })).toBeVisible()
  })

  test('should display footer', async ({ page }) => {
    await page.goto('/')
    
    // Check footer content
    await expect(page.getByText(/© 2024 NextJS Starter/)).toBeVisible()
    await expect(page.getByText(/Built with ❤️ using Next.js 15.4/)).toBeVisible()
  })
})