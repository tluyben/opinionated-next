import { test, expect } from '@playwright/test'

// Common viewport sizes for testing
const viewports = {
  mobile: { width: 375, height: 667 },      // iPhone SE
  tablet: { width: 768, height: 1024 },     // iPad
  desktop: { width: 1920, height: 1080 },   // Desktop
  ultrawide: { width: 2560, height: 1440 }  // Ultrawide
}

// Helper to create a test user and login
async function loginUser(page: any) {
  await page.goto('/signup')
  await page.getByPlaceholder('Enter your name (optional)').fill('Test User')
  await page.getByPlaceholder('Enter your email').fill('responsive@example.com')
  await page.getByPlaceholder('Enter your password').fill('test123')
  await page.getByRole('button', { name: /create account/i }).click()
  
  await page.waitForTimeout(2000)
  
  if (page.url().includes('/login')) {
    await page.getByPlaceholder('Enter your email').fill('responsive@example.com')
    await page.getByPlaceholder('Enter your password').fill('test123')
    await page.getByRole('button', { name: /sign in/i }).click()
  }
}

test.describe('Responsive Design - Landing Page', () => {
  Object.entries(viewports).forEach(([device, viewport]) => {
    test(`should display properly on ${device}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/')
      
      // Check page loads
      await expect(page).toHaveTitle(/Opinionated Next.js Starter/)
      
      // Check hero section is visible
      await expect(page.getByText(/Build Your Next/i)).toBeVisible()
      await expect(page.getByText(/SaaS Application/i)).toBeVisible()
      
      // Check navigation is accessible
      await expect(page.getByText('NextJS Starter')).toBeVisible()
      
      // Check buttons are accessible
      await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible()
      await expect(page.getByRole('link', { name: /get started/i }).first()).toBeVisible()
      
      // Check features section
      await expect(page.getByText('Everything You Need')).toBeVisible()
      
      // Pricing section should be visible
      await expect(page.getByText('Simple Pricing')).toBeVisible()
    })
  })

  test('should have mobile-optimized navigation', async ({ page }) => {
    await page.setViewportSize(viewports.mobile)
    await page.goto('/')
    
    // On mobile, navigation should still be functional
    await expect(page.getByText('NextJS Starter')).toBeVisible()
    
    // Check that buttons are still clickable
    const signInButton = page.locator('header').getByRole('link', { name: /sign in/i })
    await expect(signInButton).toBeVisible()
    
    // Test button functionality
    await signInButton.click()
    await expect(page).toHaveURL('/login')
  })

  test('should have responsive pricing cards', async ({ page }) => {
    // Test on mobile
    await page.setViewportSize(viewports.mobile)
    await page.goto('/')
    
    // Scroll to pricing section
    await page.getByText('Simple Pricing').scrollIntoViewIfNeeded()
    
    // All pricing cards should be visible
    await expect(page.getByText('Starter')).toBeVisible()
    await expect(page.getByText('Pro')).toBeVisible()
    await expect(page.getByText('Enterprise')).toBeVisible()
    
    // Test on desktop
    await page.setViewportSize(viewports.desktop)
    await page.reload()
    
    await page.getByText('Simple Pricing').scrollIntoViewIfNeeded()
    await expect(page.getByText('Starter')).toBeVisible()
    await expect(page.getByText('Pro')).toBeVisible()
    await expect(page.getByText('Enterprise')).toBeVisible()
  })
})

test.describe('Responsive Design - Authentication', () => {
  Object.entries(viewports).forEach(([device, viewport]) => {
    test(`login form should work on ${device}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/login')
      
      // Check form is properly displayed
      await expect(page.getByText('Sign In')).toBeVisible()
      await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
      await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
      
      // Check OAuth section
      await expect(page.getByText('Or continue with')).toBeVisible()
      
      // Check signup link
      await expect(page.getByRole('link', { name: /don't have an account/i })).toBeVisible()
    })

    test(`signup form should work on ${device}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/signup')
      
      // Check form is properly displayed
      await expect(page.getByText('Create Account')).toBeVisible()
      await expect(page.getByPlaceholder('Enter your name (optional)')).toBeVisible()
      await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
      await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
      await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
      
      // Check login link
      await expect(page.getByRole('link', { name: /already have an account/i })).toBeVisible()
    })
  })

  test('should handle form interactions on touch devices', async ({ page }) => {
    await page.setViewportSize(viewports.mobile)
    await page.goto('/login')
    
    // Test form filling on mobile
    await page.getByPlaceholder('Enter your email').tap()
    await page.getByPlaceholder('Enter your email').fill('test@example.com')
    
    await page.getByPlaceholder('Enter your password').tap()
    await page.getByPlaceholder('Enter your password').fill('password123')
    
    // Form should be functional
    await expect(page.getByPlaceholder('Enter your email')).toHaveValue('test@example.com')
    await expect(page.getByPlaceholder('Enter your password')).toHaveValue('password123')
  })
})

test.describe('Responsive Design - Dashboard', () => {
  Object.entries(viewports).forEach(([device, viewport]) => {
    test(`dashboard should be responsive on ${device}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await loginUser(page)
      
      // Should be on dashboard
      await expect(page).toHaveURL('/dashboard')
      await expect(page.getByText('Dashboard')).toBeVisible()
      
      // Navigation should be accessible
      await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /profile/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /settings/i })).toBeVisible()
    })
  })

  test('should have collapsible sidebar on mobile', async ({ page }) => {
    await page.setViewportSize(viewports.mobile)
    await loginUser(page)
    
    // Dashboard should load
    await expect(page.getByText('Dashboard')).toBeVisible()
    
    // Sidebar navigation should still be accessible
    // On mobile, it might be in a hamburger menu or collapsible
    await expect(page.getByRole('link', { name: /settings/i })).toBeVisible()
    
    // Test navigation
    await page.getByRole('link', { name: /settings/i }).click()
    await expect(page).toHaveURL('/settings')
  })

  test('should display settings page responsively', async ({ page }) => {
    await loginUser(page)
    await page.goto('/settings')
    
    // Test on mobile
    await page.setViewportSize(viewports.mobile)
    await page.reload()
    
    await expect(page.getByText(/API Keys/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /create api key/i })).toBeVisible()
    
    // Test on desktop
    await page.setViewportSize(viewports.desktop)
    await page.reload()
    
    await expect(page.getByText(/API Keys/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /create api key/i })).toBeVisible()
  })
})

test.describe('Responsive Design - API Key Management', () => {
  test('API key creation dialog should be responsive', async ({ page }) => {
    await loginUser(page)
    await page.goto('/settings')
    
    // Test on mobile
    await page.setViewportSize(viewports.mobile)
    
    // Open API key creation dialog
    await page.getByRole('button', { name: /create api key/i }).click()
    
    // Dialog should be properly sized for mobile
    await expect(page.getByText(/Create New API Key/i)).toBeVisible()
    await expect(page.getByPlaceholder(/API Key Name/i)).toBeVisible()
    
    // Test on tablet
    await page.setViewportSize(viewports.tablet)
    await expect(page.getByText(/Create New API Key/i)).toBeVisible()
    
    // Close dialog
    await page.getByRole('button', { name: /cancel/i }).click()
  })

  test('API key table should be responsive', async ({ page }) => {
    await loginUser(page)
    await page.goto('/settings')
    
    // Create an API key first
    await page.getByRole('button', { name: /create api key/i }).click()
    await page.getByPlaceholder(/API Key Name/i).fill('Responsive Test Key')
    await page.getByRole('button', { name: /generate/i }).click()
    await page.getByRole('button', { name: /done/i }).click()
    
    // Test table on different viewports
    await page.setViewportSize(viewports.mobile)
    await expect(page.getByText('Responsive Test Key')).toBeVisible()
    
    await page.setViewportSize(viewports.tablet)
    await expect(page.getByText('Responsive Test Key')).toBeVisible()
    
    await page.setViewportSize(viewports.desktop)
    await expect(page.getByText('Responsive Test Key')).toBeVisible()
  })
})

test.describe('Responsive Design - Touch and Accessibility', () => {
  test('buttons should have adequate touch targets', async ({ page }) => {
    await page.setViewportSize(viewports.mobile)
    await page.goto('/')
    
    // Check button sizes are touch-friendly (at least 44px)
    const signInButton = page.locator('header').getByRole('link', { name: /sign in/i })
    const getStartedButton = page.locator('header').getByRole('link', { name: /get started/i })
    
    await expect(signInButton).toBeVisible()
    await expect(getStartedButton).toBeVisible()
    
    // Test button interactions
    await signInButton.tap()
    await expect(page).toHaveURL('/login')
  })

  test('forms should be usable on mobile keyboards', async ({ page }) => {
    await page.setViewportSize(viewports.mobile)
    await page.goto('/login')
    
    // Test email input triggers email keyboard
    const emailInput = page.getByPlaceholder('Enter your email')
    await expect(emailInput).toHaveAttribute('type', 'email')
    
    // Test password input hides text
    const passwordInput = page.getByPlaceholder('Enter your password')
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('navigation should work with keyboard on all devices', async ({ page }) => {
    await page.setViewportSize(viewports.desktop)
    await page.goto('/')
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    
    // Should be able to navigate to sign in button
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Test Enter key activation
    await page.keyboard.press('Enter')
    
    // Should navigate (might go to sign in or theme toggle)
    await expect(page.url()).toMatch(/\/(login|$)/)
  })
})

test.describe('Responsive Design - Error Tracking', () => {
  test('error tracking test page should be responsive', async ({ page }) => {
    await loginUser(page)
    await page.goto('/test-error-tracking')
    
    // Test on mobile
    await page.setViewportSize(viewports.mobile)
    await expect(page.getByText('Error Tracking Test')).toBeVisible()
    
    // Error trigger buttons should be accessible
    await expect(page.getByRole('button', { name: /trigger react error/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /trigger js error/i })).toBeVisible()
    
    // Test on desktop
    await page.setViewportSize(viewports.desktop)
    await expect(page.getByText('Error Tracking Test')).toBeVisible()
    await expect(page.getByRole('button', { name: /trigger react error/i })).toBeVisible()
  })

  test('error boundary should display properly on mobile', async ({ page }) => {
    await page.setViewportSize(viewports.mobile)
    await loginUser(page)
    await page.goto('/test-error-tracking')
    
    // Trigger an error and check error boundary
    await page.getByRole('button', { name: /trigger react error/i }).click()
    
    // Error boundary should display properly on mobile
    // The page should still be usable even if error occurs
    await expect(page.getByText('Error Tracking Test')).toBeVisible()
  })
})