import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  role: text('role', { enum: ['user', 'admin'] }).default('user').notNull(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  oauthProvider: text('oauth_provider'),
  oauthId: text('oauth_id'),
  stripeCustomerId: text('stripe_customer_id'),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull(),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const apiRequests = sqliteTable('api_requests', {
  id: text('id').primaryKey(),
  apiKeyId: text('api_key_id').notNull().references(() => apiKeys.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  method: text('method').notNull(), // GET, POST, PUT, DELETE, etc.
  endpoint: text('endpoint').notNull(), // /api/users, /api/data, etc.
  path: text('path').notNull(), // full request path with query params
  statusCode: integer('status_code').notNull(), // 200, 404, 500, etc.
  responseTime: integer('response_time'), // response time in milliseconds
  requestSize: integer('request_size'), // request body size in bytes
  responseSize: integer('response_size'), // response body size in bytes
  ipAddress: text('ip_address'), // client IP address
  userAgent: text('user_agent'), // client user agent
  referer: text('referer'), // referer header
  rateLimitHit: integer('rate_limit_hit', { mode: 'boolean' }).default(false), // was rate limit exceeded?
  errorMessage: text('error_message'), // error message if request failed
  metadata: text('metadata'), // additional request context as JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const files = sqliteTable('files', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(),
  fileData: text('file_data', { mode: 'text' }).notNull(), // Base64 encoded for SQLite
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Payment related tables
export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
  amount: integer('amount').notNull(), // in cents
  currency: text('currency').notNull().default('usd'),
  status: text('status', { 
    enum: ['pending', 'processing', 'succeeded', 'failed', 'canceled'] 
  }).notNull(),
  description: text('description'),
  metadata: text('metadata'), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripePriceId: text('stripe_price_id').notNull(),
  status: text('status', { 
    enum: ['active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid'] 
  }).notNull(),
  currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }).notNull(),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }).notNull(),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).default(false),
  canceledAt: integer('canceled_at', { mode: 'timestamp' }),
  trialStart: integer('trial_start', { mode: 'timestamp' }),
  trialEnd: integer('trial_end', { mode: 'timestamp' }),
  metadata: text('metadata'), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: text('subscription_id').references(() => subscriptions.id, { onDelete: 'set null' }),
  stripeInvoiceId: text('stripe_invoice_id').unique(),
  invoiceNumber: text('invoice_number'),
  amountDue: integer('amount_due').notNull(), // in cents
  amountPaid: integer('amount_paid').notNull(), // in cents
  currency: text('currency').notNull().default('usd'),
  status: text('status', { 
    enum: ['draft', 'open', 'paid', 'void', 'uncollectible'] 
  }).notNull(),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  invoicePdf: text('invoice_pdf'), // URL to PDF
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// NextAuth.js required tables for OAuth
export const accounts = sqliteTable('accounts', {
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
});

export const verificationTokens = sqliteTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

// Password reset tokens
export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  used: integer('used', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Email verification tokens
export const emailVerificationTokens = sqliteTable('email_verification_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  email: text('email').notNull(), // Email being verified
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  used: integer('used', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Issues/Error tracking table
export const issues = sqliteTable('issues', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  stack: text('stack'), // Stack trace
  level: text('level', { 
    enum: ['error', 'warning', 'info', 'debug'] 
  }).notNull().default('error'),
  status: text('status', { 
    enum: ['open', 'closed', 'resolved'] 
  }).notNull().default('open'),
  fingerprint: text('fingerprint').notNull(), // For grouping similar errors
  count: integer('count').notNull().default(1), // Number of occurrences
  url: text('url'), // Page where error occurred
  userAgent: text('user_agent'), // Browser/client info
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }), // User who encountered error
  environment: text('environment').notNull().default('production'), // development/production
  tags: text('tags'), // JSON array of tags
  metadata: text('metadata'), // Additional context as JSON
  firstSeenAt: integer('first_seen_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  lastSeenAt: integer('last_seen_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
  resolvedBy: text('resolved_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Admin settings for error notifications
export const adminSettings = sqliteTable('admin_settings', {
  id: text('id').primaryKey(),
  emailNotificationsEnabled: integer('email_notifications_enabled', { mode: 'boolean' }).default(true),
  notificationLevel: text('notification_level', { 
    enum: ['error', 'warning', 'info', 'debug'] 
  }).notNull().default('error'), // Minimum level to send notifications
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Notifications tracking table for emails and SMS
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['email', 'sms'] }).notNull(),
  status: text('status', { 
    enum: ['pending', 'sent', 'failed', 'delivered', 'bounced'] 
  }).notNull().default('pending'),
  recipient: text('recipient').notNull(), // email address or phone number
  subject: text('subject'), // email subject (null for SMS)
  content: text('content').notNull(), // email body or SMS message
  htmlContent: text('html_content'), // HTML email content (null for SMS)
  templateId: text('template_id'), // template identifier if using templates
  templateData: text('template_data'), // JSON template variables
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }), // recipient user if exists
  sentBy: text('sent_by').references(() => users.id, { onDelete: 'set null' }), // admin/system who triggered
  category: text('category', {
    enum: ['auth', 'error-notification', 'marketing', 'system', 'security', 'reminder']
  }).notNull(),
  priority: text('priority', { 
    enum: ['low', 'normal', 'high', 'urgent'] 
  }).notNull().default('normal'),
  scheduledFor: integer('scheduled_for', { mode: 'timestamp' }), // for delayed sending
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  deliveredAt: integer('delivered_at', { mode: 'timestamp' }),
  failureReason: text('failure_reason'), // error message if failed
  retryCount: integer('retry_count').notNull().default(0),
  maxRetries: integer('max_retries').notNull().default(3),
  metadata: text('metadata'), // additional context as JSON
  providerResponse: text('provider_response'), // response from email/SMS provider
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type ApiRequest = typeof apiRequests.$inferSelect;
export type NewApiRequest = typeof apiRequests.$inferInsert;
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;
export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;
export type AdminSettings = typeof adminSettings.$inferSelect;
export type NewAdminSettings = typeof adminSettings.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;