import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSession, getSession, deleteSession, requireAuth } from './session'
import { db } from '@/lib/db'
import { sessions, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Mock Next.js modules
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(() => ({ values: vi.fn() })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            get: vi.fn(),
          })),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        run: vi.fn(),
      })),
    })),
  },
}))

describe('Session Management', () => {
  const mockCookies = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(cookies as any).mockReturnValue(mockCookies)
  })

  describe('createSession', () => {
    it('should create a session and set cookie', async () => {
      const userId = 'test-user-id'
      const mockInsert = vi.fn()
      ;(db.insert as any).mockReturnValue({ values: mockInsert })

      await createSession(userId)

      // Check session was inserted with correct structure
      expect(db.insert).toHaveBeenCalledWith(sessions)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          id: expect.any(String),
          expiresAt: expect.any(Date),
        })
      )

      // Check cookie was set
      expect(mockCookies.set).toHaveBeenCalledWith(
        'session',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        })
      )
    })
  })

  describe('getSession', () => {
    it('should return null when no session cookie exists', async () => {
      mockCookies.get.mockReturnValue(null)

      const result = await getSession()

      expect(result).toBeNull()
    })

    it('should return null when session is expired', async () => {
      const expiredSession = {
        id: 'session-id',
        userId: 'user-id',
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
        user: {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          avatarUrl: null,
        },
      }

      mockCookies.get.mockReturnValue({ value: 'session-id' })
      const mockGet = vi.fn().mockResolvedValue(expiredSession)
      ;(db.select as any).mockReturnValue({
        from: vi.fn(() => ({
          leftJoin: vi.fn(() => ({
            where: vi.fn(() => ({ get: mockGet })),
          })),
        })),
      })

      const result = await getSession()

      expect(result).toBeNull()
    })

    it('should return user data for valid session', async () => {
      const validSession = {
        id: 'session-id',
        userId: 'user-id',
        expiresAt: new Date(Date.now() + 60000), // 1 minute from now
        user: {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
      }

      mockCookies.get.mockReturnValue({ value: 'session-id' })
      const mockGet = vi.fn().mockResolvedValue(validSession)
      ;(db.select as any).mockReturnValue({
        from: vi.fn(() => ({
          leftJoin: vi.fn(() => ({
            where: vi.fn(() => ({ get: mockGet })),
          })),
        })),
      })

      const result = await getSession()

      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        avatarUrl: 'https://example.com/avatar.jpg',
      })
    })

    it('should handle impersonation in development mode', async () => {
      const originalEnv = process.env.NODE_ENV
      // @ts-ignore - we need to modify NODE_ENV for testing
      process.env.NODE_ENV = 'development'

      const impersonatedUser = {
        id: 'impersonated-id',
        email: 'impersonated@example.com',
        name: 'Impersonated User',
        role: 'admin',
        avatarUrl: null,
      }

      mockCookies.get
        .mockReturnValueOnce({ value: 'impersonated-id' }) // impersonation cookie
        .mockReturnValueOnce(null) // session cookie

      const mockGet = vi.fn().mockResolvedValue(impersonatedUser)
      ;(db.select as any).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({ get: mockGet })),
        })),
      })

      const result = await getSession()

      expect(result).toEqual(impersonatedUser)

      // @ts-ignore - we need to restore NODE_ENV after testing
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('deleteSession', () => {
    it('should delete session and remove cookie', async () => {
      mockCookies.get.mockReturnValue({ value: 'session-id' })
      const mockRun = vi.fn()
      ;(db.delete as any).mockReturnValue({
        where: vi.fn(() => ({ run: mockRun })),
      })

      await deleteSession()

      expect(db.delete).toHaveBeenCalledWith(sessions)
      expect(mockRun).toHaveBeenCalled()
      expect(mockCookies.delete).toHaveBeenCalledWith('session')
    })

    it('should handle case when no session exists', async () => {
      mockCookies.get.mockReturnValue(null)

      await deleteSession()

      expect(db.delete).not.toHaveBeenCalled()
      expect(mockCookies.delete).toHaveBeenCalledWith('session')
    })
  })

  describe('requireAuth', () => {
    it('should return user when authenticated', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        avatarUrl: null,
      }

      const validSession = {
        id: 'session-id',
        userId: 'user-id',
        expiresAt: new Date(Date.now() + 60000),
        user: mockUser,
      }

      mockCookies.get.mockReturnValue({ value: 'session-id' })
      const mockGet = vi.fn().mockResolvedValue(validSession)
      ;(db.select as any).mockReturnValue({
        from: vi.fn(() => ({
          leftJoin: vi.fn(() => ({
            where: vi.fn(() => ({ get: mockGet })),
          })),
        })),
      })

      const result = await requireAuth()

      expect(result).toEqual(mockUser)
    })

    it('should redirect to login when not authenticated', async () => {
      mockCookies.get.mockReturnValue(null)

      await requireAuth()

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })
})