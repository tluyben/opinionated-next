import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from './signup-form'
import * as authActions from '@/lib/actions/auth'

// Mock the auth actions
vi.mock('@/lib/actions/auth', () => ({
  signupAction: vi.fn(),
}))

// Mock useFormStatus
vi.mock('react-dom', () => ({
  useFormStatus: () => ({ pending: false }),
}))

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render signup form with all fields', () => {
    render(<SignupForm />)

    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password (min 8 characters)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should call signupAction with form data', async () => {
    const user = userEvent.setup()
    const mockSignupAction = vi.mocked(authActions.signupAction)

    render(<SignupForm />)

    // Fill in the form
    await user.type(screen.getByPlaceholderText('Enter your full name'), 'Test User')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'newuser@example.com')
    await user.type(screen.getByPlaceholderText('Enter your password (min 8 characters)'), 'securepassword123')

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create account/i }))

    // Wait for the action to be called
    await waitFor(() => {
      expect(mockSignupAction).toHaveBeenCalled()
    })

    // Get the FormData that was passed
    const formData = mockSignupAction.mock.calls[0][0] as FormData
    expect(formData.get('name')).toBe('Test User')
    expect(formData.get('email')).toBe('newuser@example.com')
    expect(formData.get('password')).toBe('securepassword123')
  })

  it('should display error message when signup fails', async () => {
    const user = userEvent.setup()
    const mockSignupAction = vi.mocked(authActions.signupAction)
    mockSignupAction.mockResolvedValue({ error: 'Email already exists' })

    render(<SignupForm />)

    // Fill and submit form
    await user.type(screen.getByPlaceholderText('Enter your email'), 'existing@example.com')
    await user.type(screen.getByPlaceholderText('Enter your password (min 8 characters)'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  it('should allow signup without name', async () => {
    const user = userEvent.setup()
    const mockSignupAction = vi.mocked(authActions.signupAction)

    render(<SignupForm />)

    // Fill only required fields
    await user.type(screen.getByPlaceholderText('Enter your email'), 'noname@example.com')
    await user.type(screen.getByPlaceholderText('Enter your password (min 8 characters)'), 'password123')

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create account/i }))

    // Wait for the action to be called
    await waitFor(() => {
      expect(mockSignupAction).toHaveBeenCalled()
    })

    // Verify name is empty string
    const formData = mockSignupAction.mock.calls[0][0] as FormData
    expect(formData.get('name')).toBe('')
  })

  it('should validate password length requirement', async () => {
    render(<SignupForm />)

    const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement
    
    // Check minlength attribute
    expect(passwordInput).toHaveAttribute('minLength', '8')
  })

  it('should have correct input types and attributes', () => {
    render(<SignupForm />)

    const nameInput = screen.getByPlaceholderText('Name (optional)') as HTMLInputElement
    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement
    const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement

    expect(nameInput.type).toBe('text')
    expect(nameInput.required).toBe(false)
    
    expect(emailInput.type).toBe('email')
    expect(emailInput.required).toBe(true)
    
    expect(passwordInput.type).toBe('password')
    expect(passwordInput.required).toBe(true)
  })

  it('should have link to login page', () => {
    render(<SignupForm />)

    const loginLink = screen.getByRole('link', { name: /sign in/i })
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('should show validation error for short password', async () => {
    const user = userEvent.setup()
    const mockSignupAction = vi.mocked(authActions.signupAction)
    mockSignupAction.mockResolvedValue({ error: 'Password must be at least 8 characters' })

    render(<SignupForm />)

    // Fill form with short password
    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'short')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
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

    render(<SignupForm />)

    const submitButton = screen.getByRole('button', { name: /signing up/i })
    expect(submitButton).toBeDisabled()
  })
})