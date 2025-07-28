import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import bcrypt from 'bcryptjs'
import { ensureAdminExists } from './auto-admin'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

// Mock modules
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}))

// Mock database specifically for this test
vi.mock('@/lib/db', () => {
  const createChain = () => {
    const chain = {
      from: vi.fn(() => chain),
      where: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      get: vi.fn(() => Promise.resolve(null)),
      all: vi.fn(() => Promise.resolve([])),
      values: vi.fn(() => chain),
      run: vi.fn(() => Promise.resolve({})),
    }
    return chain
  }
  
  return {
    db: {
      select: vi.fn(() => createChain()),
      insert: vi.fn(() => createChain()),
    },
    users: {},
  }
})

// Mock console.log to capture output
const originalConsoleLog = console.log
const mockConsoleLog = vi.fn()

describe('Auto Admin Creation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.log = mockConsoleLog
  })

  afterEach(() => {
    console.log = originalConsoleLog
  })

  it('should create admin user when none exists', async () => {
    // Mock no existing admin
    const mockGet = vi.fn().mockResolvedValue(null)
    ;(db.select as any).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ get: mockGet })),
      })),
    })

    // Mock password hashing
    ;(bcrypt.hash as any).mockResolvedValue('hashed-admin-password')

    // Mock user creation
    const mockValues = vi.fn()
    ;(db.insert as any).mockReturnValue({
      values: mockValues,
    })

    await ensureAdminExists()

    // Verify admin was queried
    expect(mockGet).toHaveBeenCalled()

    // Verify admin was created with correct properties
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        email: 'admin@example.com',
        passwordHash: 'hashed-admin-password',
        name: 'Admin',
        role: 'admin',
        emailVerified: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    )

    // Verify password was hashed
    expect(bcrypt.hash).toHaveBeenCalledWith(
      expect.stringMatching(/^[a-zA-Z0-9]{16}$/), // 16 character password
      12
    )

    // Verify console output
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Admin user created automatically')
    )
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Email: admin@example.com')
    )
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Password:')
    )
  })

  it('should not create admin when one already exists', async () => {
    // Mock existing admin
    const mockGet = vi.fn().mockResolvedValue({
      id: 'existing-admin-id',
      email: 'admin@example.com',
      role: 'admin',
    })
    ;(db.select as any).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ get: mockGet })),
      })),
    })

    await ensureAdminExists()

    // Verify no insert was called
    expect(db.insert).not.toHaveBeenCalled()

    // Verify no console output
    expect(mockConsoleLog).not.toHaveBeenCalled()
  })

  it('should generate a strong random password', async () => {
    // Mock no existing admin
    const mockGet = vi.fn().mockResolvedValue(null)
    ;(db.select as any).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ get: mockGet })),
      })),
    })

    // Capture the password passed to bcrypt.hash
    let generatedPassword = ''
    ;(bcrypt.hash as any).mockImplementation((password: string) => {
      generatedPassword = password
      return Promise.resolve('hashed-password')
    })

    const mockValues = vi.fn()
    ;(db.insert as any).mockReturnValue({
      values: mockValues,
    })

    await ensureAdminExists()

    // Verify password meets requirements
    expect(generatedPassword).toHaveLength(16)
    expect(generatedPassword).toMatch(/^[a-zA-Z0-9]+$/)

    // Verify password is included in console output
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining(`Password: ${generatedPassword}`)
    )
  })

  it('should use consistent admin properties', async () => {
    // Mock no existing admin
    const mockGet = vi.fn().mockResolvedValue(null)
    ;(db.select as any).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ get: mockGet })),
      })),
    })

    ;(bcrypt.hash as any).mockResolvedValue('hashed-password')

    const mockValues = vi.fn()
    ;(db.insert as any).mockReturnValue({
      values: mockValues,
    })

    await ensureAdminExists()

    // Verify specific admin properties
    const insertedUser = mockValues.mock.calls[0][0]
    expect(insertedUser.email).toBe('admin@example.com')
    expect(insertedUser.name).toBe('Admin')
    expect(insertedUser.role).toBe('admin')
    expect(insertedUser.emailVerified).toBe(true)
    expect(insertedUser.avatarUrl).toBeNull()
    expect(insertedUser.oauthProvider).toBeNull()
    expect(insertedUser.oauthId).toBeNull()
  })
})