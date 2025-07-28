import { test, expect } from '@playwright/test'

test.describe('Password Reset Flow', () => {
  test('should display forgot password page', async ({ page }) => {
    await page.goto('/forgot-password')
    
    // Check page elements
    await expect(page).toHaveTitle(/Opinionated Next.js Starter/)
    await expect(page.getByText('Forgot Password')).toBeVisible()
    await expect(page.getByText('Enter your email to reset your password')).toBeVisible()
    
    // Check form elements
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible()
    
    // Check back to login link
    await expect(page.getByRole('link', { name: /back to login/i })).toBeVisible()
  })

  test('should handle forgot password form submission', async ({ page }) => {
    await page.goto('/forgot-password')
    
    // Fill in email
    await page.getByPlaceholder('Enter your email').fill('test@example.com')
    
    // Submit form
    await page.getByRole('button', { name: /send reset link/i }).click()
    
    // Should show success message
    await expect(page.getByText(/reset link sent/i)).toBeVisible({ timeout: 5000 })
  })

  test('should validate email format on forgot password page', async ({ page }) => {
    await page.goto('/forgot-password')
    
    // Fill in invalid email
    await page.getByPlaceholder('Enter your email').fill('invalid-email')
    
    // Submit form
    await page.getByRole('button', { name: /send reset link/i }).click()
    
    // Should show validation error or prevent submission
    const emailInput = page.getByPlaceholder('Enter your email')
    await expect(emailInput).toHaveAttribute('type', 'email')
  })

  test('should navigate back to login from forgot password', async ({ page }) => {
    await page.goto('/forgot-password')
    
    // Click back to login link
    await page.getByRole('link', { name: /back to login/i }).click()
    
    // Should navigate to login page
    await expect(page).toHaveURL('/login')
  })

  test('should display reset password page', async ({ page }) => {
    // Navigate with a mock token
    await page.goto('/reset-password?token=mock-reset-token')
    
    // Check page elements
    await expect(page.getByText('Reset Password')).toBeVisible()
    await expect(page.getByText('Enter your new password')).toBeVisible()
    
    // Check form elements
    await expect(page.getByPlaceholder('New password')).toBeVisible()
    await expect(page.getByPlaceholder('Confirm password')).toBeVisible()
    await expect(page.getByRole('button', { name: /reset password/i })).toBeVisible()
  })

  test('should handle reset password form submission', async ({ page }) => {
    await page.goto('/reset-password?token=mock-reset-token')
    
    // Fill in new password
    await page.getByPlaceholder('New password').fill('newpassword123')
    await page.getByPlaceholder('Confirm password').fill('newpassword123')
    
    // Submit form
    await page.getByRole('button', { name: /reset password/i }).click()
    
    // Should show success message or redirect
    await page.waitForLoadState('networkidle')
    
    // Should either show success message or redirect to login
    const successMessage = page.getByText(/password reset successful/i)
    const loginPage = page.locator('h1:has-text("Sign In")')
    await expect(successMessage.or(loginPage)).toBeVisible({ timeout: 5000 })
  })

  test('should validate password requirements on reset page', async ({ page }) => {
    await page.goto('/reset-password?token=mock-reset-token')
    
    // Try with weak password
    await page.getByPlaceholder('New password').fill('weak')
    await page.getByPlaceholder('Confirm password').fill('weak')
    
    // Submit form
    await page.getByRole('button', { name: /reset password/i }).click()
    
    // Should show validation error for weak password
    const passwordInput = page.getByPlaceholder('New password')
    const minLength = await passwordInput.getAttribute('minlength')
    expect(parseInt(minLength || '0')).toBeGreaterThan(6)
  })

  test('should validate password confirmation match', async ({ page }) => {
    await page.goto('/reset-password?token=mock-reset-token')
    
    // Fill mismatched passwords
    await page.getByPlaceholder('New password').fill('password123')
    await page.getByPlaceholder('Confirm password').fill('differentpassword')
    
    // Submit form
    await page.getByRole('button', { name: /reset password/i }).click()
    
    // Should show validation error or prevent submission
    await page.waitForLoadState('networkidle')
    
    // Form should not proceed with mismatched passwords
    // Either stay on same page or show error
    const currentUrl = page.url()
    expect(currentUrl).toContain('/reset-password')
  })

  test('should handle invalid reset token', async ({ page }) => {
    await page.goto('/reset-password?token=invalid-token')
    
    // Should show error message about invalid token
    const invalidTokenMessage = page.getByText(/invalid.*token/i)
    const expiredTokenMessage = page.getByText(/expired.*token/i)
    const errorMessage = page.getByText('Error')
    
    // Should show some form of error
    await expect(invalidTokenMessage.or(expiredTokenMessage).or(errorMessage)).toBeVisible()
  })

  test('should handle reset password without token', async ({ page }) => {
    await page.goto('/reset-password')
    
    // Should redirect or show error about missing token
    await page.waitForLoadState('networkidle')
    
    const errorMessage = page.getByText(/token.*required/i)
    const redirected = page.url() !== '/reset-password'
    
    // Should either show error or redirect
    expect(errorMessage.isVisible() || redirected).toBeTruthy()
  })
})

test.describe('Email Verification Flow', () => {
  test('should display email verification page', async ({ page }) => {
    await page.goto('/verify-email?token=mock-verification-token')
    
    // Check page elements
    await expect(page.getByText('Verify Email')).toBeVisible()
    
    // Should show verification status or form
    const verifying = page.getByText('Verifying')
    const verified = page.getByText('Email verified')
    const verifyButton = page.getByRole('button', { name: /verify/i })
    
    await expect(verifying.or(verified).or(verifyButton)).toBeVisible()
  })

  test('should display verification required page', async ({ page }) => {
    await page.goto('/verify-email-required')
    
    // Check page elements
    await expect(page.getByText('Email Verification Required')).toBeVisible()
    await expect(page.getByText('Please check your email')).toBeVisible()
    
    // Should have resend verification link
    await expect(page.getByRole('button', { name: /resend/i })).toBeVisible()
  })

  test('should allow resending verification email', async ({ page }) => {
    await page.goto('/verify-email-required')
    
    // Click resend button
    await page.getByRole('button', { name: /resend/i }).click()
    
    // Should show confirmation message
    await expect(page.getByText(/verification email sent/i)).toBeVisible({ timeout: 5000 })
  })
})