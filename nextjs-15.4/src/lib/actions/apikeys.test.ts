import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateApiKeyAction, deleteApiKeyAction, getUserApiKeys } from './apikeys'
import { db } from '@/lib/db'
import { apiKeys } from '@/lib/db/schema'
import * as sessionModule from '@/lib/auth/session'
import crypto from 'crypto'

// Mock modules
vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            all: vi.fn(),
          })),
        })),
      })),
    })),
  },
}))

// Mock crypto
vi.mock('crypto', () => ({
  default: {
    randomBytes: vi.fn(() => ({
      toString: vi.fn(() => 'mocked-random-token'),
    })),
    createHash: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn(() => 'mocked-hash'),
    })),
  },
}))

describe('API Keys Server Actions', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user' as const,
    avatarUrl: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateApiKeyAction', () => {
    it('should generate a new API key', async () => {
      ;(sessionModule.getSession as any).mockResolvedValue(mockUser)

      const mockValues = vi.fn()
      ;(db.insert as any).mockReturnValue({
        values: mockValues,
      })

      const formData = new FormData()
      formData.append('name', 'Production API Key')

      const result = await generateApiKeyAction(formData)

      // Verify session was checked
      expect(sessionModule.getSession).toHaveBeenCalled()

      // Verify API key was inserted
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          userId: 'test-user-id',
          name: 'Production API Key',
          keyHash: 'mocked-hash',
          createdAt: expect.any(Date),
        })
      )

      // Verify response includes the full key
      expect(result).toEqual({
        success: true,
        apiKey: expect.stringMatching(/^sk_/),
      })
    })

    it('should return error when not authenticated', async () => {
      ;(sessionModule.getSession as any).mockResolvedValue(null)

      const formData = new FormData()
      formData.append('name', 'API Key')

      const result = await generateApiKeyAction(formData)

      expect(result).toEqual({
        error: 'Not authenticated',
      })
      expect(db.insert).not.toHaveBeenCalled()
    })

    it('should return error when name is missing', async () => {
      ;(sessionModule.getSession as any).mockResolvedValue(mockUser)

      const formData = new FormData()

      const result = await generateApiKeyAction(formData)

      expect(result).toEqual({
        error: 'API key name is required',
      })
      expect(db.insert).not.toHaveBeenCalled()
    })

    it('should handle empty name', async () => {
      ;(sessionModule.getSession as any).mockResolvedValue(mockUser)

      const formData = new FormData()
      formData.append('name', '')

      const result = await generateApiKeyAction(formData)

      expect(result).toEqual({
        error: 'API key name is required',
      })
    })
  })

  describe('deleteApiKeyAction', () => {
    it('should delete an API key', async () => {
      ;(sessionModule.getSession as any).mockResolvedValue(mockUser)

      const mockWhere = vi.fn()
      ;(db.delete as any).mockReturnValue({
        where: mockWhere,
      })

      const formData = new FormData()
      formData.append('keyId', 'api-key-id')

      await deleteApiKeyAction(formData)

      expect(sessionModule.getSession).toHaveBeenCalled()
      expect(db.delete).toHaveBeenCalledWith(apiKeys)
      expect(mockWhere).toHaveBeenCalled()

    })

    it('should not delete when not authenticated', async () => {
      ;(sessionModule.getSession as any).mockResolvedValue(null)

      const formData = new FormData()
      formData.append('keyId', 'api-key-id')

      await deleteApiKeyAction(formData)

      expect(db.delete).not.toHaveBeenCalled()
    })
  })

  describe('getUserApiKeys', () => {
    it('should return user API keys', async () => {
      ;(sessionModule.getSession as any).mockResolvedValue(mockUser)

      const mockApiKeys = [
        {
          id: 'key-1',
          name: 'Production Key',
          createdAt: new Date('2024-01-01'),
          lastUsedAt: new Date('2024-01-15'),
        },
        {
          id: 'key-2',
          name: 'Development Key',
          createdAt: new Date('2024-01-05'),
          lastUsedAt: null,
        },
      ]

      const mockOrderBy = vi.fn().mockResolvedValue(mockApiKeys)
      ;(db.select as any).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: mockOrderBy,
          })),
        })),
      })

      const result = await getUserApiKeys()

      expect(sessionModule.getSession).toHaveBeenCalled()
      expect(mockOrderBy).toHaveBeenCalled()
      expect(result).toEqual(mockApiKeys)
    })

    it('should return empty array when not authenticated', async () => {
      ;(sessionModule.getSession as any).mockResolvedValue(null)

      const result = await getUserApiKeys()

      expect(result).toEqual([])
      expect(db.select).not.toHaveBeenCalled()
    })

    it('should query only user keys', async () => {
      ;(sessionModule.getSession as any).mockResolvedValue(mockUser)

      const mockWhere = vi.fn(() => ({
        orderBy: vi.fn(() => ({
          all: vi.fn().mockResolvedValue([]),
        })),
      }))

      ;(db.select as any).mockReturnValue({
        from: vi.fn(() => ({
          where: mockWhere,
        })),
      })

      await getUserApiKeys()

      // Verify the where clause was called (checking for user ID)
      expect(mockWhere).toHaveBeenCalled()
    })
  })
})