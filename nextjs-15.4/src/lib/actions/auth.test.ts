import { describe, it, expect, vi, beforeEach } from 'vitest'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { loginAction, signupAction, logoutAction } from './auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import * as sessionModule from '@/lib/auth/session'

// Mock modules
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}))

vi.mock('@/lib/auth/session', () => ({
  createSession: vi.fn(),
  deleteSession: vi.fn(),
}))

// Database is mocked globally in vitest.setup.ts

describe('Auth Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loginAction', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      }

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'ValidPassword123')

      // Mock database query
      const mockGet = vi.fn().mockResolvedValue(mockUser)
      ;(db.select as any).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({ get: mockGet })),
        })),
      })

      // Mock bcrypt comparison
      ;(bcrypt.compare as any).mockResolvedValue(true)

      // Mock session creation
      const createSessionSpy = vi.spyOn(sessionModule, 'createSession')

      await loginAction(formData)

      expect(mockGet).toHaveBeenCalled()
      expect(bcrypt.compare).toHaveBeenCalledWith('ValidPassword123', 'hashed-password')
      expect(createSessionSpy).toHaveBeenCalledWith('user-id')
      expect(redirect).toHaveBeenCalledWith('/dashboard')
    })

    it('should return error for non-existent user', async () => {
      const formData = new FormData()
      formData.append('email', 'nonexistent@example.com')
      formData.append('password', 'password')

      // Mock database query returning null
      const mockGet = vi.fn().mockResolvedValue(null)
      ;(db.select as any).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({ get: mockGet })),
        })),
      })

      const result = await loginAction(formData)

      expect(result).toEqual({ error: 'Invalid email or password' })
      expect(redirect).not.toHaveBeenCalled()
    })

    it('should return error for invalid password', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      }

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'WrongPassword')

      // Mock database query
      const mockGet = vi.fn().mockResolvedValue(mockUser)
      ;(db.select as any).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({ get: mockGet })),
        })),
      })

      // Mock bcrypt comparison
      ;(bcrypt.compare as any).mockResolvedValue(false)

      const result = await loginAction(formData)

      expect(result).toEqual({ error: 'Invalid email or password' })
      expect(redirect).not.toHaveBeenCalled()
    })

    it('should return error for missing email', async () => {
      const formData = new FormData()
      formData.append('password', 'password')

      const result = await loginAction(formData)

      expect(result).toEqual({ error: 'Email is required' })
    })

    it('should return error for missing password', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')

      const result = await loginAction(formData)

      expect(result).toEqual({ error: 'Password is required' })
    })
  })

  describe('signupAction', () => {
    it('should successfully create new user', async () => {
      const formData = new FormData()
      formData.append('email', 'newuser@example.com')
      formData.append('password', 'ValidPassword123')
      formData.append('name', 'New User')

      // Mock database query for existing user
      const mockGet = vi.fn().mockResolvedValue(null)
      ;(db.select as any).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({ get: mockGet })),
        })),
      })

      // Mock password hashing
      ;(bcrypt.hash as any).mockResolvedValue('hashed-password')

      // Mock user creation
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'new-user-id' }])
      ;(db.insert as any).mockReturnValue({
        values: vi.fn(() => ({
          returning: mockReturning,
        })),
      })

      // Mock session creation
      const createSessionSpy = vi.spyOn(sessionModule, 'createSession')

      await signupAction(formData)

      expect(bcrypt.hash).toHaveBeenCalledWith('ValidPassword123', 12)
      expect(mockReturning).toHaveBeenCalled()
      expect(createSessionSpy).toHaveBeenCalledWith('new-user-id')
      expect(redirect).toHaveBeenCalledWith('/dashboard')
    })

    it('should return error for existing email', async () => {
      const formData = new FormData()
      formData.append('email', 'existing@example.com')
      formData.append('password', 'ValidPassword123')

      // Mock database query returning existing user
      const mockGet = vi.fn().mockResolvedValue({ id: 'existing-user' })
      ;(db.select as any).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({ get: mockGet })),
        })),
      })

      const result = await signupAction(formData)

      expect(result).toEqual({ error: 'Email already exists' })
      expect(redirect).not.toHaveBeenCalled()
    })

    it('should return error for short password', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'short')

      const result = await signupAction(formData)

      expect(result).toEqual({ error: 'Password must be at least 8 characters' })
    })

    it('should return error for missing email', async () => {
      const formData = new FormData()
      formData.append('password', 'ValidPassword123')

      const result = await signupAction(formData)

      expect(result).toEqual({ error: 'Email is required' })
    })

    it('should return error for missing password', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')

      const result = await signupAction(formData)

      expect(result).toEqual({ error: 'Password is required' })
    })

    it('should handle signup without name', async () => {
      const formData = new FormData()
      formData.append('email', 'noname@example.com')
      formData.append('password', 'ValidPassword123')

      // Mock database query for existing user
      const mockGet = vi.fn().mockResolvedValue(null)
      ;(db.select as any).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({ get: mockGet })),
        })),
      })

      // Mock password hashing
      ;(bcrypt.hash as any).mockResolvedValue('hashed-password')

      // Mock user creation
      const mockValues = vi.fn()
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'new-user-id' }])
      ;(db.insert as any).mockReturnValue({
        values: mockValues.mockReturnValue({
          returning: mockReturning,
        }),
      })

      await signupAction(formData)

      // Check that user was created with null name
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'noname@example.com',
          passwordHash: 'hashed-password',
          name: null,
          role: 'user',
        })
      )
    })
  })

  describe('logoutAction', () => {
    it('should delete session and redirect to home', async () => {
      const deleteSessionSpy = vi.spyOn(sessionModule, 'deleteSession')

      await logoutAction()

      expect(deleteSessionSpy).toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith('/')
    })
  })
})