import { describe, it, expect } from 'vitest'
import bcrypt from 'bcryptjs'

describe('Password utilities', () => {
  it('should hash passwords', async () => {
    const password = 'testPassword123'
    const hash = await bcrypt.hash(password, 12)
    
    expect(hash).toBeTruthy()
    expect(hash).not.toBe(password)
    expect(hash.length).toBeGreaterThan(50)
  })

  it('should verify correct passwords', async () => {
    const password = 'testPassword123'
    const hash = await bcrypt.hash(password, 12)
    
    const isValid = await bcrypt.compare(password, hash)
    expect(isValid).toBe(true)
  })

  it('should reject incorrect passwords', async () => {
    const password = 'testPassword123'
    const wrongPassword = 'wrongPassword'
    const hash = await bcrypt.hash(password, 12)
    
    const isValid = await bcrypt.compare(wrongPassword, hash)
    expect(isValid).toBe(false)
  })
})