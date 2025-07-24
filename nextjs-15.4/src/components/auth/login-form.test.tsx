import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './login-form'
import * as authActions from '@/lib/actions/auth'

// Mock the auth actions
vi.mock('@/lib/actions/auth', () => ({
  loginAction: vi.fn(),
}))

// Mock useFormStatus
vi.mock('react-dom', () => ({
  useFormStatus: () => ({ pending: false }),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form with all fields', () => {
    render(<LoginForm />)

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
  })

  it('should show validation errors for empty fields', async () => {
    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Click submit without filling fields
    fireEvent.click(submitButton)

    // HTML5 validation should prevent submission
    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement
    const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement

    expect(emailInput.validity.valueMissing).toBe(true)
    expect(passwordInput.validity.valueMissing).toBe(true)
  })

  it('should call loginAction with form data', async () => {
    const user = userEvent.setup()
    const mockLoginAction = vi.mocked(authActions.loginAction)

    render(<LoginForm />)

    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    // Fill in the form
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    // Submit the form
    await user.click(submitButton)

    // Wait for the action to be called
    await waitFor(() => {
      expect(mockLoginAction).toHaveBeenCalled()
    })

    // Get the FormData that was passed
    const formData = mockLoginAction.mock.calls[0][0] as FormData
    expect(formData.get('email')).toBe('test@example.com')
    expect(formData.get('password')).toBe('password123')
  })

  it('should display error message when login fails', async () => {
    const user = userEvent.setup()
    const mockLoginAction = vi.mocked(authActions.loginAction)
    mockLoginAction.mockResolvedValue({ error: 'Invalid email or password' })

    render(<LoginForm />)

    // Fill and submit form
    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })
  })

  it('should disable submit button while pending', () => {
    // Mock pending state
    vi.mocked(() => {
      const originalModule = vi.importActual('react-dom')
      return {
        ...originalModule,
        useFormStatus: () => ({ pending: true }),
      }
    })

    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /signing in/i })
    expect(submitButton).toBeDisabled()
  })

  it('should validate email format', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement
    
    // Invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    expect(emailInput.validity.typeMismatch).toBe(true)

    // Valid email
    fireEvent.change(emailInput, { target: { value: 'valid@email.com' } })
    expect(emailInput.validity.typeMismatch).toBe(false)
  })

  it('should have correct input types', () => {
    render(<LoginForm />)

    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement
    const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement

    expect(emailInput.type).toBe('email')
    expect(passwordInput.type).toBe('password')
  })

  it('should have link to signup page', () => {
    render(<LoginForm />)

    const signupLink = screen.getByRole('link', { name: /sign up/i })
    expect(signupLink).toHaveAttribute('href', '/signup')
  })
})