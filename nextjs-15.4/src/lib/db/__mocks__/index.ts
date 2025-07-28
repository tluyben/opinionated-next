// Manual mock for @/lib/db module
import { vi } from 'vitest'

// Create a mock that properly handles all Drizzle ORM patterns
const createMockResult = (result: any = []) => {
  return Promise.resolve(result)
}

// Mock query chain that handles the exact patterns used in the code
const createQueryChain = (result: any = []) => {
  const chain = {
    from: vi.fn().mockImplementation((table) => ({
      where: vi.fn().mockImplementation((condition) => ({
        limit: vi.fn().mockResolvedValue(result),
        orderBy: vi.fn().mockResolvedValue(result),
        offset: vi.fn().mockResolvedValue(result),
        all: vi.fn().mockResolvedValue(result),
        get: vi.fn().mockResolvedValue(result[0] || null),
      })),
      leftJoin: vi.fn().mockImplementation(() => ({
        where: vi.fn().mockImplementation(() => ({
          limit: vi.fn().mockResolvedValue(result),
          orderBy: vi.fn().mockResolvedValue(result),
        })),
      })),
      limit: vi.fn().mockResolvedValue(result),
      orderBy: vi.fn().mockResolvedValue(result),
      all: vi.fn().mockResolvedValue(result),
      get: vi.fn().mockResolvedValue(result[0] || null),
    })),
    where: vi.fn().mockImplementation((condition) => ({
      limit: vi.fn().mockResolvedValue(result),
      orderBy: vi.fn().mockResolvedValue(result),
      run: vi.fn().mockResolvedValue({ lastInsertRowid: 1, changes: 1 }),
      all: vi.fn().mockResolvedValue(result),
      get: vi.fn().mockResolvedValue(result[0] || null),
    })),
    values: vi.fn().mockImplementation((data) => ({
      returning: vi.fn().mockResolvedValue([data]),
      run: vi.fn().mockResolvedValue({ lastInsertRowid: 1, changes: 1 }),
      onConflictDoUpdate: vi.fn().mockImplementation(() => ({
        run: vi.fn().mockResolvedValue({ lastInsertRowid: 1, changes: 1 }),
      })),
    })),
    set: vi.fn().mockImplementation((data) => ({
      where: vi.fn().mockImplementation(() => ({
        run: vi.fn().mockResolvedValue({ lastInsertRowid: 1, changes: 1 }),
      })),
      run: vi.fn().mockResolvedValue({ lastInsertRowid: 1, changes: 1 }),
    })),
    // Terminal methods
    limit: vi.fn().mockResolvedValue(result),
    orderBy: vi.fn().mockResolvedValue(result),
    returning: vi.fn().mockResolvedValue(result),
    run: vi.fn().mockResolvedValue({ lastInsertRowid: 1, changes: 1 }),
    all: vi.fn().mockResolvedValue(result),
    get: vi.fn().mockResolvedValue(result[0] || null),
  }
  return chain
}

export const db = {
  insert: vi.fn((table) => createQueryChain()),
  select: vi.fn((columns) => createQueryChain()),
  delete: vi.fn((table) => createQueryChain()),
  update: vi.fn((table) => createQueryChain()),
  transaction: vi.fn((callback) => {
    // Mock transaction - call the callback with the mock db
    try {
      return callback({
        insert: vi.fn(() => createQueryChain()),
        select: vi.fn(() => createQueryChain()),
        delete: vi.fn(() => createQueryChain()),
        update: vi.fn(() => createQueryChain()),
      })
    } catch (error) {
      return error
    }
  }),
}

// Mock schema tables with column definitions
export const users = { 
  id: 'id', 
  email: 'email', 
  role: 'role', 
  passwordHash: 'passwordHash',
  emailVerified: 'emailVerified',
  name: 'name',
  avatarUrl: 'avatarUrl',
  oauthProvider: 'oauthProvider',
  oauthId: 'oauthId',
  stripeCustomerId: 'stripeCustomerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
}

export const sessions = { 
  id: 'id', 
  userId: 'userId', 
  expiresAt: 'expiresAt' 
}

export const apiKeys = { 
  id: 'id', 
  userId: 'userId', 
  name: 'name', 
  keyHash: 'keyHash',
  lastUsedAt: 'lastUsedAt',
  createdAt: 'createdAt',
}

export const issues = { 
  id: 'id', 
  title: 'title', 
  message: 'message', 
  level: 'level',
  status: 'status',
  fingerprint: 'fingerprint',
  count: 'count',
  url: 'url',
  userAgent: 'userAgent',
  userId: 'userId',
  environment: 'environment',
  tags: 'tags',
  metadata: 'metadata',
  firstSeenAt: 'firstSeenAt',
  lastSeenAt: 'lastSeenAt',
  resolvedAt: 'resolvedAt',
  resolvedBy: 'resolvedBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
}

export const adminSettings = { 
  id: 'id', 
  emailNotificationsEnabled: 'emailNotificationsEnabled',
  notificationLevel: 'notificationLevel',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
}

export const files = { 
  id: 'id', 
  userId: 'userId', 
  filename: 'filename',
  originalName: 'originalName',
  mimeType: 'mimeType',
  fileSize: 'fileSize',
  fileData: 'fileData',
  createdAt: 'createdAt',
}

export const payments = { 
  id: 'id', 
  userId: 'userId', 
  stripePaymentIntentId: 'stripePaymentIntentId',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  description: 'description',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
}

export const subscriptions = { 
  id: 'id', 
  userId: 'userId', 
  stripeSubscriptionId: 'stripeSubscriptionId',
  stripePriceId: 'stripePriceId',
  status: 'status',
  currentPeriodStart: 'currentPeriodStart',
  currentPeriodEnd: 'currentPeriodEnd',
  cancelAtPeriodEnd: 'cancelAtPeriodEnd',
  canceledAt: 'canceledAt',
  trialStart: 'trialStart',
  trialEnd: 'trialEnd',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
}

export const invoices = { 
  id: 'id', 
  userId: 'userId',
  subscriptionId: 'subscriptionId',
  stripeInvoiceId: 'stripeInvoiceId',
  invoiceNumber: 'invoiceNumber',
  amountDue: 'amountDue',
  amountPaid: 'amountPaid',
  currency: 'currency',
  status: 'status',
  paidAt: 'paidAt',
  dueDate: 'dueDate',
  invoicePdf: 'invoicePdf',
  createdAt: 'createdAt',
}

export const passwordResetTokens = { 
  id: 'id', 
  userId: 'userId', 
  token: 'token',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
}

export const emailVerificationTokens = { 
  id: 'id', 
  userId: 'userId', 
  token: 'token',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
}

export const notifications = { 
  id: 'id', 
  type: 'type',
  to: 'to', 
  subject: 'subject',
  content: 'content',
  htmlContent: 'htmlContent',
  status: 'status',
  category: 'category',
  priority: 'priority',
  userId: 'userId',
  sentBy: 'sentBy',
  providerResponse: 'providerResponse',
  retryCount: 'retryCount',
  metadata: 'metadata',
  createdAt: 'createdAt',
  sentAt: 'sentAt',
}

export const apiRequests = { 
  id: 'id', 
  userId: 'userId', 
  apiKeyId: 'apiKeyId',
  endpoint: 'endpoint',
  method: 'method',
  statusCode: 'statusCode',
  duration: 'duration',
  userAgent: 'userAgent',
  ipAddress: 'ipAddress',
  createdAt: 'createdAt',
}

// Type exports for compatibility
export type NewUser = {
  id: string
  email: string
  passwordHash?: string
  name?: string
  role?: 'user' | 'admin'
  emailVerified?: boolean
  oauthProvider?: string
  oauthId?: string
  stripeCustomerId?: string
  createdAt: number
  updatedAt: number
}

export type User = NewUser & {
  avatarUrl?: string
}