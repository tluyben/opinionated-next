import { test, expect } from '@playwright/test'

test.describe('Demo Pages', () => {
  test('should display demo landing page', async ({ page }) => {
    await page.goto('/demo')
    
    // Check page title and content
    await expect(page).toHaveTitle(/Opinionated Next.js Starter/)
    await expect(page.getByText('Demo Pages')).toBeVisible()
    
    // Should have links to various demos
    await expect(page.getByText('LLM Integration')).toBeVisible()
    await expect(page.getByText('Payment Processing')).toBeVisible()
    
    // Check navigation links
    await expect(page.locator('a[href="/demo/llm"]')).toBeVisible()
    await expect(page.locator('a[href="/demo/payments"]')).toBeVisible()
  })

  test('should display LLM demo page', async ({ page }) => {
    await page.goto('/demo/llm')
    
    // Check page elements
    await expect(page).toHaveTitle(/Opinionated Next.js Starter/)
    await expect(page.getByText('LLM Integration Demo')).toBeVisible()
    
    // Should have provider selection
    await expect(page.getByText('Provider')).toBeVisible()
    
    // Should have model selection
    await expect(page.getByText('Model')).toBeVisible()
    
    // Should have chat interface
    await expect(page.getByPlaceholder('Type your message')).toBeVisible()
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible()
    
    // Should have system prompt area
    await expect(page.getByText('System Prompt')).toBeVisible()
  })

  test('should allow LLM chat interaction', async ({ page }) => {
    await page.goto('/demo/llm')
    
    // Type a test message
    const messageInput = page.getByPlaceholder('Type your message')
    await messageInput.fill('Hello, this is a test message')
    
    // Send the message
    await page.getByRole('button', { name: /send/i }).click()
    
    // Message should appear in chat history
    await expect(page.getByText('Hello, this is a test message')).toBeVisible()
    
    // Should show user message in chat
    await expect(page.locator('[data-role="user"]')).toBeVisible()
  })

  test('should display payments demo page', async ({ page }) => {
    await page.goto('/demo/payments')
    
    // Check page elements
    await expect(page).toHaveTitle(/Opinionated Next.js Starter/)
    await expect(page.getByText('Payment Integration Demo')).toBeVisible()
    
    // Should have pricing cards
    await expect(page.getByText('Pricing Plans')).toBeVisible()
    
    // Should have subscription options
    await expect(page.getByText('Basic Plan')).toBeVisible()
    await expect(page.getByText('Pro Plan')).toBeVisible()
    
    // Should have purchase buttons
    await expect(page.getByRole('button', { name: /subscribe/i }).first()).toBeVisible()
  })

  test('should allow payment flow initiation', async ({ page }) => {
    await page.goto('/demo/payments')
    
    // Click on a subscription button
    await page.getByRole('button', { name: /subscribe/i }).first().click()
    
    // Should redirect to checkout or show payment form
    await page.waitForLoadState('networkidle')
    
    // Should either be on checkout page or Stripe checkout
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/(checkout|stripe|payment)/)
  })

  test('should display payment success page', async ({ page }) => {
    await page.goto('/demo/payments/success')
    
    // Check success page elements
    await expect(page.getByText('Payment Successful')).toBeVisible()
    await expect(page.getByText('Thank you for your purchase')).toBeVisible()
    
    // Should have return to dashboard link
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible()
  })

  test('should display payment cancel page', async ({ page }) => {
    await page.goto('/demo/payments/cancel')
    
    // Check cancel page elements
    await expect(page.getByText('Payment Cancelled')).toBeVisible()
    await expect(page.getByText('You can try again')).toBeVisible()
    
    // Should have return link
    await expect(page.locator('a[href="/demo/payments"]')).toBeVisible()
  })

  test('should handle checkout page', async ({ page }) => {
    await page.goto('/demo/payments/checkout')
    
    // Should show checkout form or redirect to payment processor
    await page.waitForLoadState('networkidle')
    
    // Check if we're on checkout page or redirected
    const currentUrl = page.url()
    if (currentUrl.includes('/checkout')) {
      // On our checkout page
      await expect(page.getByText('Checkout')).toBeVisible()
    } else {
      // Redirected to external payment processor
      expect(currentUrl).toMatch(/(stripe|checkout)/)
    }
  })
})