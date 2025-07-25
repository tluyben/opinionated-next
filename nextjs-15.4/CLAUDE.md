# Next.js 15.4 Opinionated Starter

This is an **OPINIONATED** Next.js starter template with predefined architecture, dependencies, and constraints.

## 🚨 CRITICAL CONSTRAINTS FOR AI ASSISTANTS

### ALLOWED OPERATIONS
- ✅ Edit files inside `./src/` directory only
- ✅ Add new files inside `./src/` directory only
- ✅ Create test files (`*.test.ts`, `*.test.tsx`) alongside source files
- ✅ Read any file for understanding
- ✅ Use existing dependencies and libraries
- ✅ Write and run tests using Vitest and Testing Library

### FORBIDDEN OPERATIONS
- ❌ **NEVER** install new packages or dependencies
- ❌ **NEVER** modify `tsconfig.json`
- ❌ **NEVER** modify `tailwind.config.js`
- ❌ **NEVER** modify `next.config.js`
- ❌ **NEVER** modify `drizzle.config.ts`
- ❌ **NEVER** modify `vitest.config.ts` (testing configuration is locked)
- ❌ **NEVER** modify `playwright.config.ts` (E2E configuration is locked)
- ❌ **NEVER** edit files in `./drizzle/migrations/` (auto-generated)
- ❌ **NEVER** create or modify Docker files
- ❌ **NEVER** modify configuration files in root directory
- ❌ **NEVER** initialize git repository (`git init`)
- ❌ **NEVER** modify `.gitignore` or `.dockerignore` files

### 🚨 MANDATORY AFTER EVERY CHANGE
- ✅ **ALWAYS run `npm run check`** immediately after making ANY changes
- ✅ **MUST fix ALL TypeScript errors** before continuing
- ✅ **No exceptions** - TypeScript must compile cleanly
- ✅ **Faster than build** - use for quick validation
- ✅ **Run tests after implementing features** - use `npm run test` to verify
- ✅ **Write tests FIRST for new features** - follow TDD approach
- ✅ **UPDATE README.md** after major feature additions or changes

### DATABASE SCHEMA CHANGES
- Database schema is defined in `./src/lib/db/schema.ts`
- To apply schema changes, user must run: `npm run db:generate && npm run db:migrate`
- **NEVER** manually edit migration files in `./drizzle/migrations/`
- **Migration naming:** New migrations use timestamp format (yyyyMMddHHmmss_description.sql)
- **Legacy migrations:** Existing numbered migrations (0000_, 0001_) remain for compatibility

## SQLite Timestamp Handling with Drizzle

**CRITICAL**: When adding timestamp fields to SQLite tables with Drizzle:
- Use `integer("column_name", { mode: "timestamp" })` for the column type
- Use `.default(sql`(strftime('%s', 'now'))`)` for default values (NOT `CURRENT_TIMESTAMP`)
- SQLite's `CURRENT_TIMESTAMP` returns a string, but Drizzle expects Unix timestamps (seconds since epoch)
- Always check existing tables for examples before adding new timestamp fields
- When writing migrations that add timestamp columns, use `strftime('%s', 'now')` to set values

## Architecture Principles

This starter is **OPINIONATED** and follows strict conventions:

1. **Server Actions First**: All page interactions use Server Actions, NOT API routes
2. **Mobile-First**: Everything must be responsive and mobile-optimized
3. **TypeScript Strict**: Full type safety throughout
4. **Database**: SQLite with Drizzle ORM using Unix timestamps
5. **Authentication**: Session-based with role support (user/admin) + OAuth providers
6. **Styling**: Tailwind CSS with shadcn/ui components
7. **Theme**: Dark mode as default with light mode toggle
8. **Test-Driven Development**: Write tests first, then implementation

## Available Dependencies

This project includes pre-installed and configured:

- Next.js 15.4 with App Router
- TypeScript with strict configuration
- Tailwind CSS with shadcn/ui (ALL 45+ components pre-installed)
- Drizzle ORM with better-sqlite3
- NextAuth.js for OAuth authentication (Google, GitHub, Meta/Facebook, Apple)
- Custom session management for email/password authentication
- React Email for email templates
- Multer for file uploads
- Twilio for SMS
- Toad for job queues
- Vitest for unit/integration testing
- Testing Library for component testing
- Playwright for E2E testing
- LLM Integration (OpenAI, Anthropic, OpenRouter, Groq, Cerebras)
- Stripe Payments (subscriptions, one-time payments, webhooks)
- Error Tracking System (Sentry-like monitoring with admin dashboard)
- All necessary type definitions

## File Structure

- `./src/app/` - Next.js App Router pages
- `./src/components/` - React components (including shadcn/ui)
- `./src/components/admin/` - Admin-only components for issues and settings
- `./src/components/error-tracking/` - Error boundary and tracking components
- `./src/components/llm/` - LLM chat components
- `./src/lib/` - Utilities, database, auth, actions, storage
- `./src/lib/db/schema.ts` - Database schema definitions
- `./src/lib/error-tracking/` - Error logging and monitoring services
- `./src/lib/storage/` - File storage utilities (S3/database fallback)
- `./src/lib/llm/` - LLM client and providers
- `./src/lib/payments/` - Payment client and configuration
- `./src/types/` - TypeScript type definitions
- `./src/**/*.test.ts(x)` - Test files co-located with source files
- `./tests/e2e/` - Playwright E2E tests
- `./vitest.config.mjs` - Vitest configuration (locked)
- `./vitest.setup.ts` - Test setup and mocks
- `./playwright.config.ts` - Playwright configuration (locked)

## Pre-installed shadcn/ui Components

All 45+ shadcn/ui components are pre-installed and ready to use:

- **Layout**: Accordion, Alert, Alert Dialog, Aspect Ratio, Avatar, Card, Collapsible, Dialog, Drawer, Separator, Sheet, Tabs
- **Forms**: Button, Checkbox, Form, Input, Input OTP, Label, Radio Group, Select, Slider, Switch, Textarea, Toggle, Toggle Group
- **Data Display**: Badge, Calendar, Chart, Progress, Skeleton, Table, Tooltip
- **Navigation**: Breadcrumb, Context Menu, Dropdown Menu, Menubar, Navigation Menu, Pagination
- **Feedback**: Alert, Sonner (Toast), Hover Card, Popover, Tooltip
- **Utility**: Command, Resizable, Scroll Area, Carousel

Import from `@/components/ui/[component-name]`

## Development Tools

### User Impersonation Middleware
**CRITICAL FOR TESTING**: This project includes user impersonation middleware for development testing:

- **Access any page as any user**: `?token=DEV_TOKEN&user=userId`
- **Only active in development mode** - automatically disabled in production
- **Useful for testing, LLM automation, and debugging**
- **Token configured via `DEV_IMPERSONATION_TOKEN` environment variable**

#### Examples:
```bash
# Test as admin user (replace with actual admin ID from database)
http://localhost:3000/database?token=your-dev-token-here&user=admin-user-id

# Test as regular user  
http://localhost:3000/dashboard?token=your-dev-token-here&user=regular-user-id

# Test different user roles
http://localhost:3000/settings?token=your-dev-token-here&user=another-user-id
```

#### How It Works:
1. **Middleware intercepts requests** with `token` and `user` query parameters
2. **Validates the development token** against `DEV_IMPERSONATION_TOKEN`
3. **Sets impersonation cookie** that overrides normal session authentication
4. **All subsequent requests** use the impersonated user until cookie expires (24h)

#### Usage for AI Assistants:
**ALWAYS test your database admin work using impersonation:**
```bash
# Test admin access to database
http://localhost:3000/database?token=DEV_TOKEN&user=ADMIN_USER_ID

# Test regular user (should redirect from admin areas)
http://localhost:3000/database?token=DEV_TOKEN&user=REGULAR_USER_ID
```

**To find user IDs for testing:**
1. Navigate to `/database` as admin
2. Click on the `users` table to see all user IDs and roles
3. Copy the IDs you need for testing different scenarios

## Testing Strategy

### Test-Driven Development (TDD)
1. **Write failing test first** - red phase
2. **Implement minimal code to pass** - green phase
3. **Refactor while keeping tests green** - refactor phase

### Testing Commands
**IMPORTANT**: The package.json MUST include these test scripts:
```json
{
  "scripts": {
    // ... existing scripts ...
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:install": "playwright install"
  }
}
```

Usage:
```bash
npm run test           # Run all unit/integration tests once
npm run test:watch     # Run tests in watch mode (TDD workflow)
npm run test:ui        # Open Vitest UI for debugging
npm run test:coverage  # Run tests with coverage report
npm run test:e2e       # Run Playwright E2E tests
npm run test:e2e:ui    # Run Playwright tests with UI
npm run test:e2e:install # Install Playwright browsers (first time)
```

**Alternative**: If package.json cannot be modified, use direct npx commands:
```bash
npx vitest run         # Run all tests once
npx vitest             # Watch mode (TDD)
npx vitest --ui        # UI mode
npx vitest run --coverage # Coverage
npx playwright test    # E2E tests
npx playwright test --ui # E2E with UI
```

### Test Organization
- **Unit tests**: Co-located with source files (`file.test.ts`)
- **Component tests**: Co-located with components (`component.test.tsx`)
- **E2E tests**: In `./tests/e2e/` directory
- **Test utilities**: Can be added in `./src/lib/test-utils/`

### Testing Best Practices
1. **Mock external dependencies** - database, APIs, services
2. **Test behavior, not implementation** - focus on user outcomes
3. **Use Testing Library queries** - prefer accessible queries
4. **Keep tests focused** - one behavior per test
5. **Use descriptive test names** - should read like documentation

### TDD Example Workflow
```bash
# 1. Start test watcher
npm run test:watch

# 2. Write failing test (red phase)
# Create src/lib/validators.test.ts
# Write test for email validation

# 3. Run npm run check to ensure no TypeScript errors
npm run check

# 4. Implement minimal code to pass (green phase)
# Create src/lib/validators.ts
# Implement email validation

# 5. Refactor while keeping tests green
# Improve implementation
# Tests auto-run and stay green

# 6. Run full test suite before committing
npm run test
```

## Error Tracking System

The project includes a comprehensive Sentry-like error tracking system for monitoring application health and issues.

### Error Capture System

- **Global Error Boundary** - Catches all React component errors with recovery options
- **Client-Side Handler** - Captures unhandled promises, JavaScript errors, and resource failures
- **Server-Side Handler** - Catches server errors, API route errors, and uncaught exceptions
- **Manual Reporting** - Utilities for developers to manually report issues

### Admin Dashboard

**CRITICAL**: Error tracking features are admin-only and require admin role access.

#### Available Pages

- **Issues Dashboard** (`/dashboard/admin/issues`) - Complete issue listing with filtering and search
- **Issue Details** (`/dashboard/admin/issues/[id]`) - Detailed error information with stack traces  
- **Admin Settings** (`/dashboard/admin/settings`) - Configure email notifications and severity levels

#### Features

- **Smart Grouping** - Similar errors grouped by fingerprint with occurrence counts
- **Severity Levels** - Error, Warning, Info, Debug with proper color coding and filtering
- **Status Management** - Mark issues as Open, Resolved, or Closed with admin controls
- **Advanced Search** - Filter by status, level, and search through error messages and titles
- **Rich Context** - Stack traces, user agents, URLs, user information, and custom metadata

### Email Notifications

- **Automatic Alerts** - New errors trigger configurable email notifications to all admin users
- **Severity Filtering** - Only send notifications for specified severity levels (Error, Warning, Info, Debug)
- **SMTP Integration** - Full SMTP support with console fallback for development
- **Beautiful Templates** - HTML email templates with proper styling and error context

### Usage Examples

#### Error Boundary
```tsx
import { ErrorBoundary } from '@/components/error-tracking/error-boundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

#### Manual Error Reporting
```tsx
import { useErrorReporting } from '@/components/error-tracking/error-boundary';

const { reportError } = useErrorReporting();

try {
  // Some operation
} catch (error) {
  await reportError(error, {
    level: 'error',
    tags: ['user-action'],
    metadata: { context: 'additional info' }
  });
}
```

#### Server-Side Error Handling
```tsx
import { handleServerError } from '@/lib/error-tracking/server-handler';

export async function myServerAction() {
  try {
    // Server operation
  } catch (error) {
    await handleServerError(error, {
      action: 'myServerAction',
      tags: ['server-action']
    });
    throw error;
  }
}
```

### Database Tables

The error tracking system uses two additional database tables:

- **issues** - Stores all error reports with metadata, status, and grouping information
- **admin_settings** - Stores admin preferences for email notifications and severity levels

### Environment Variables

No additional environment variables are required. The system works with existing SMTP configuration:

```env
# Optional - for email notifications
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
```

If SMTP is not configured, error notifications will be logged to console in development.

### Development Notes

- **Automatic Initialization** - Error tracking is automatically initialized in the root layout
- **Development Mode** - Enhanced error displays and console logging for debugging
- **Production Ready** - Optimized for production with proper error grouping and notifications
- **Admin Access Only** - All error tracking features require admin role for security

## Development Guidelines

1. **TypeScript First**: Run `npm run check` after EVERY change - no exceptions
2. **TDD Workflow**: Write tests first, then implementation
3. **Test with impersonation**: Use the middleware to test as different user roles
4. Follow existing code patterns and conventions
5. Use existing components from shadcn/ui
6. Implement new features using Server Actions
7. Ensure mobile responsiveness for all UI
8. Maintain TypeScript strict compliance
9. Test on both light and dark themes
10. **Run tests before committing**: Ensure all tests pass
11. **Update README.md**: Keep user documentation current with changes

### README.md Maintenance

The README.md file is the primary documentation for users. Update it when:
- Adding new features or functionality
- Changing environment variables
- Modifying setup instructions
- Adding new scripts or commands
- Changing deployment procedures
- Adding new dependencies or integrations

## Authentication System

This project includes a comprehensive authentication system with both traditional email/password and OAuth support.

### Authentication Features

- **Email/Password Authentication** - Traditional signup/login with secure password hashing
- **OAuth Providers** - Google, GitHub, Meta/Facebook, Apple integration via NextAuth.js
- **Password Reset** - Secure password reset flow with email tokens
- **Session Management** - Custom session-based authentication with role support
- **User Roles** - Built-in support for 'user' and 'admin' roles
- **Development Impersonation** - Test as any user in development mode

### OAuth Configuration

OAuth providers are configured via NextAuth.js at `/api/auth/[...nextauth]`. The following providers are supported:

#### Google OAuth
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### GitHub OAuth
```env
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

#### Meta/Facebook OAuth
```env
META_CLIENT_ID="your-meta-client-id"
META_CLIENT_SECRET="your-meta-client-secret"
```

#### Apple OAuth
```env
APPLE_CLIENT_ID="your-apple-client-id"
APPLE_CLIENT_SECRET="your-apple-client-secret"
```

### Authentication Flow

1. **OAuth Sign-in** - Redirects to provider, creates/links account, establishes session
2. **Email/Password** - Validates credentials, creates session
3. **Password Reset** - Generates secure token, sends reset link (console in development)
4. **Session Management** - Custom sessions stored in database with expiration

### Database Tables

OAuth support requires additional tables managed by NextAuth.js:

- **accounts** - OAuth account connections
- **verification_tokens** - Email verification tokens
- **password_reset_tokens** - Password reset tokens (custom)

### Components

- **OAuthButtons** (`@/components/auth/oauth-buttons`) - Pre-built OAuth provider buttons
- **LoginForm** (`@/components/auth/login-form`) - Email/password + OAuth login
- **SignupForm** (`@/components/auth/signup-form`) - Email/password + OAuth signup
- **ForgotPasswordForm** (`@/components/auth/forgot-password-form`) - Password reset request
- **ResetPasswordForm** (`@/components/auth/reset-password-form`) - New password form

### Server Actions

Authentication actions are available in `@/lib/actions/auth`:

- **loginAction** - Email/password login
- **signupAction** - User registration
- **logoutAction** - Sign out user
- **requestPasswordResetAction** - Send password reset link
- **resetPasswordAction** - Update password with reset token

### Usage Examples

#### OAuth Buttons
```tsx
import { OAuthButtons } from '@/components/auth/oauth-buttons';

<OAuthButtons callbackUrl="/dashboard" />
```

#### Password Reset Flow
```tsx
// Request reset
import { requestPasswordResetAction } from '@/lib/actions/auth';

// Reset password
import { resetPasswordAction } from '@/lib/actions/auth';
```

#### Session Management
```tsx
import { getSession, requireAuth } from '@/lib/auth/session';

// Get current user (returns null if not authenticated)
const user = await getSession();

// Require authentication (throws if not authenticated)
const user = await requireAuth();
```

### Development Notes

- **Password reset links** are logged to console in development mode
- **OAuth redirects** should be configured in each provider's dashboard
- **Session cookies** are HTTP-only and secure in production
- **Development impersonation** allows testing as any user

## LLM Integration

The project includes built-in LLM streaming chat support for multiple providers:

### Supported Providers
- **OpenAI** - GPT-4, GPT-3.5 models
- **Anthropic** - Claude models
- **OpenRouter** - Access to multiple models
- **Groq** - Fast Llama models
- **Cerebras** - High-performance inference

### Usage

#### Basic Chat (Non-streaming)
```typescript
import { LLMClient } from '@/lib/llm';

const response = await LLMClient.chat(
  'openai',           // provider
  'gpt-4o',          // model
  [{ role: 'user', content: 'Hello!' }],  // messages
  'You are a helpful assistant'           // optional system prompt
);
```

#### Streaming Chat
```typescript
import { LLMClient } from '@/lib/llm';

for await (const chunk of LLMClient.streamChat(
  'anthropic',
  'claude-3-5-sonnet-latest',
  messages,
  systemPrompt
)) {
  console.log(chunk); // Real-time streaming tokens
}
```

#### Pre-built Chat Component
```tsx
import { StreamingChat } from '@/components/llm/streaming-chat';
import { getAvailableLLMProviders } from '@/lib/actions/llm';

export default async function ChatPage() {
  const { providers, models } = await getAvailableLLMProviders();
  
  return (
    <StreamingChat 
      availableProviders={providers}
      providerModels={models}
    />
  );
}
```

### Demo
Visit `/demo/llm` to see the LLM integration in action with a full-featured chat interface.

## Stripe Payments Integration

The project includes built-in Stripe payment support for subscriptions and one-time payments:

### Features
- **Checkout Sessions** - Redirect to Stripe-hosted checkout
- **Payment Intents** - Direct payment processing
- **Subscriptions** - Recurring billing with management
- **Webhooks** - Automatic event processing
- **Database Tracking** - Local storage of payment history

### Usage

#### Simple Checkout Button
```tsx
import { CheckoutButton } from '@/components/payments/checkout-button';

<CheckoutButton priceId="price_xxx" mode="subscription">
  Subscribe Now
</CheckoutButton>
```

#### Server Actions
```typescript
import {
  createCheckoutSession,
  createPaymentIntent,
  getActiveSubscription,
  cancelSubscription,
  getPaymentHistory,
} from '@/lib/actions/payments';

// Create checkout session
const session = await createCheckoutSession('price_xxx');
window.location.href = session.url;
```

#### Pricing Cards
```tsx
import { PricingCard } from '@/components/payments/pricing-card';

<PricingCard
  price={priceConfig}
  productName="Pro Plan"
  productDescription="Best for teams"
  onSelect={handleSelect}
/>
```

### Demo
Visit `/demo/payments` to see the payment integration with pricing cards and checkout flows.

### Webhook Configuration
Set up webhook endpoint in Stripe Dashboard:
```
https://yourdomain.com/api/webhooks/stripe
```

Events handled:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `checkout.session.completed`
- `customer.subscription.*`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Environment Variables Required

For user impersonation to work, add to your `.env` file:
```env
DEV_IMPERSONATION_TOKEN="your-secret-dev-token-here"
```

For LLM providers, add the API keys for the providers you want to use:
```env
# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_BASE_URL="" # Optional custom endpoint

# Anthropic
ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_BASE_URL="" # Optional custom endpoint

# OpenRouter
OPENROUTER_API_KEY="sk-or-..."
OPENROUTER_BASE_URL="" # Optional custom endpoint

# Groq
GROQ_API_KEY="gsk_..."
GROQ_BASE_URL="" # Optional custom endpoint

# Cerebras
CEREBRAS_API_KEY="csk-..."
CEREBRAS_BASE_URL="" # Optional custom endpoint
```

For Stripe payments, add your API keys:
```env
# Stripe (required for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Get from Stripe Dashboard after creating webhook

# Optional Stripe settings
STRIPE_CURRENCY="usd"
STRIPE_PAYMENT_METHODS="card" # Comma-separated: card,bank,paypal,etc
```

## Quick Validation Workflow

After making any changes:
```bash
npm run check    # Fast TypeScript validation (< 2 seconds)
# Fix any errors before proceeding
npm run lint     # Optional: Check code style
npm run build    # Full build when ready to test

# Test as admin (replace with actual IDs from database):
# http://localhost:3000/database?token=your-secret-dev-token-here&user=admin-user-id

# Test regular user access (should redirect from admin areas):
# http://localhost:3000/database?token=your-secret-dev-token-here&user=regular-user-id
```

## Getting Help

If you need additional dependencies or configuration changes, ask the project maintainer to:
1. Install the required packages
2. Update configuration files
3. Run `npm run db:generate && npm run db:migrate` for schema changes

**Remember: This is an OPINIONATED starter. Work within the established constraints and patterns.**