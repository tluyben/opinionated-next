# Opinionated Next.js Starter Project

## Project Overview
This is a comprehensive, opinionated Next.js starter template that stays current with the latest versions. Starting with Next.js 15.4, each new major version will be maintained in separate directories (`./nextjs-xx.x`).

## Tech Stack
- **Next.js 15.4** with TypeScript
- **shadcn/ui** - ALL components pre-installed (45+ components)
- **Skeleton Components** - Comprehensive loading states with pre-built skeleton patterns
- **React** with latest features
- **Drizzle ORM** with SQLite
- **better-sqlite3** as the database driver
- **Multer** for file uploads
- **SMTP** email system (falls back to console logging if not configured)
- **Twilio** for SMS functionality
- **Toad** for queue management
- **React Email** for email templates
- **Docker** with Caddy reverse proxy
- **OAuth** providers: Google, Meta, Apple, GitHub
- **Vitest** for unit and integration testing (TDD)
- **Testing Library** for component testing
- **Playwright** for E2E testing
- **LLM Integration** - Multi-provider streaming chat (OpenAI, Anthropic, OpenRouter, Groq, Cerebras)
- **Payments** - Stripe integration with subscriptions and one-time payments
- **Error Tracking** - Comprehensive Sentry-like error monitoring and management system

## Architecture Principles

### Server Actions vs API Routes
- **ALL page-server interactions use Server Actions** - NO custom API endpoints for page functionality
- **API routes ONLY created when specifically requested** - for external integrations, webhooks, or third-party consumption
- Server Actions provide better type safety, automatic CSRF protection, and simpler data flow

### Mobile-First Responsive Design
- **EVERYTHING must look GREAT on mobile** - responsive design is not optional
- Collapsible left sidebar for dashboard navigation on mobile
- Touch-friendly UI elements and proper spacing
- Optimized layouts for all screen sizes

### Test-Driven Development (TDD)
- **Write tests FIRST, then implementation** - red-green-refactor cycle
- **Unit tests** for utilities, server actions, and business logic
- **Component tests** for UI components using Testing Library
- **Integration tests** for API routes and database operations
- **E2E tests** for critical user flows with Playwright
- **Minimum 80% code coverage** for non-UI code
- **Test files co-located** with source files (`*.test.ts`, `*.test.tsx`)

### Loading States & UX
- **Skeleton components REQUIRED** for all async operations - NO traditional spinners
- **Server Actions must use skeletons** during form submissions and data mutations
- **REST API calls must show skeleton states** while loading
- **Pre-built skeleton patterns** for common UI layouts (tables, cards, forms, dashboards)
- **Suspense boundaries** with skeleton fallbacks for better UX

## Project Structure
```
nextjs-15.4/
├── README.md (User-facing documentation - REQUIRED)
├── CLAUDE.md (AI assistant constraints and guidelines)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   ├── admin/
│   │   │   │   ├── issues/ (Error tracking dashboard)
│   │   │   │   └── settings/ (Admin configuration)
│   │   │   └── demo/
│   │   │       ├── llm/
│   │   │       └── payments/
│   │   ├── api/ (ONLY when specifically requested)
│   │   │   ├── auth/
│   │   │   ├── upload/
│   │   │   ├── email/
│   │   │   ├── sms/
│   │   │   ├── llm/ (LLM streaming endpoints)
│   │   │   └── webhooks/
│   │   │       └── stripe/ (Stripe webhook handler)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx (landing)
│   ├── components/
│   │   ├── ui/ (ALL 45+ shadcn components + skeleton components)
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── landing/
│   │   ├── llm/ (LLM chat components)
│   │   ├── mobile/ (mobile-specific components)
│   │   ├── payments/ (Payment components)
│   │   ├── admin/ (Admin-only components for issues, settings)
│   │   ├── error-tracking/ (Error boundary and tracking components)
│   │   └── theme/
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts (Database schema definitions)
│   │   │   └── index.ts (Database connection)
│   │   ├── auth/
│   │   ├── email/
│   │   ├── sms/
│   │   ├── queue/
│   │   ├── llm/ (LLM client and providers)
│   │   ├── payments/ (Payment client and config)
│   │   ├── error-tracking/ (Error logging and tracking services)
│   │   ├── actions/ (server actions)
│   │   └── utils/
│   ├── middleware.ts (dev user impersonation)
│   └── types/
├── scripts/
│   ├── reset-admin.ts
│   └── create-admin.ts
├── drizzle/
│   └── migrations/ (AUTO-GENERATED - DO NOT EDIT)
├── emails/ (React Email templates)
├── tests/
│   └── e2e/ (Playwright E2E tests)
├── docker-compose.yml
├── docker-compose.dev.yml
├── Dockerfile
├── Caddyfile
├── package.json (includes all necessary scripts - see below)
├── tsconfig.json (LOCKED - DO NOT EDIT)
├── tailwind.config.js (LOCKED - DO NOT EDIT)
├── next.config.js (LOCKED - DO NOT EDIT)
├── drizzle.config.ts (LOCKED - DO NOT EDIT)
├── vitest.config.mjs (Vitest configuration)
├── vitest.setup.ts (Test setup file)
├── playwright.config.ts (Playwright configuration)
├── .gitignore (REQUIRED - DO NOT EDIT)
└── .dockerignore (REQUIRED - DO NOT EDIT)
```

## 🚨 CRITICAL DATABASE & NEXT.JS REQUIREMENTS

### Database Schema Changes (NEVER FORGET!)
**MANDATORY AFTER ANY SCHEMA CHANGE - NO EXCEPTIONS:**
```bash
npm run db:generate && npm run db:migrate
```

**🚨 YOU ALWAYS FORGET THIS! SCHEMA CHANGES REQUIRE MIGRATIONS!**
- **NEVER** edit the database schema without generating and running migrations
- **NEVER** assume schema changes work without migrations
- **ALWAYS** run both commands after ANY change to `src/lib/db/schema.ts`
- Database will be out of sync without migrations - THIS BREAKS EVERYTHING!

### Next.js 15 Dynamic Route Parameters (NEVER FORGET!)
**MANDATORY FOR ALL DYNAMIC ROUTES - NO EXCEPTIONS:**
```tsx
// ❌ WRONG - This will cause errors in Next.js 15+
export default function Page({ params }: { params: { id: string } }) {
  const id = params.id // ERROR: params should be awaited
}

// ✅ CORRECT - Always await params
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params // REQUIRED: await params before use
}
```

**🚨 YOU ALWAYS FORGET THIS! ALL DYNAMIC ROUTES NEED AWAIT PARAMS!**
- **NEVER** access `params.property` directly - always `await params` first
- **ALL** dynamic routes (`[id]`, `[slug]`, etc.) must await params
- **searchParams** also needs to be awaited: `const searchParams = await searchParams`
- This is a breaking change in Next.js 15+ - old code will error!

### SQLite Timestamp Handling with Drizzle

**CRITICAL**: When adding timestamp fields to SQLite tables with Drizzle:
- Use `integer("column_name", { mode: "timestamp" })` for the column type
- Use `.default(sql`(strftime('%s', 'now'))`)` for default values (NOT `CURRENT_TIMESTAMP`)
- SQLite's `CURRENT_TIMESTAMP` returns a string, but Drizzle expects Unix timestamps (seconds since epoch)
- Always check existing tables for examples before adding new timestamp fields
- When writing migrations that add timestamp columns, use `strftime('%s', 'now')` to set values

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  email_verified BOOLEAN DEFAULT FALSE,
  oauth_provider TEXT,
  oauth_id TEXT,
  stripe_customer_id TEXT,
  created_at INTEGER NOT NULL, -- Unix timestamp
  updated_at INTEGER NOT NULL  -- Unix timestamp
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL, -- Unix timestamp
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### API Keys Table
```sql
CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  last_used_at INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Files Table (S3 Fallback Storage)
```sql
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_data BLOB NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Payments Table
```sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK(status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled')),
  description TEXT,
  metadata TEXT, -- JSON
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
  current_period_start INTEGER NOT NULL,
  current_period_end INTEGER NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at INTEGER,
  trial_start INTEGER,
  trial_end INTEGER,
  metadata TEXT, -- JSON
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Invoices Table
```sql
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  subscription_id TEXT,
  stripe_invoice_id TEXT UNIQUE,
  invoice_number TEXT,
  amount_due INTEGER NOT NULL, -- in cents
  amount_paid INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK(status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  paid_at INTEGER,
  due_date INTEGER,
  invoice_pdf TEXT, -- URL
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
);
```

### Issues Table (Error Tracking)
```sql
CREATE TABLE issues (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  stack TEXT, -- Stack trace
  level TEXT CHECK(level IN ('error', 'warning', 'info', 'debug')) DEFAULT 'error',
  status TEXT CHECK(status IN ('open', 'closed', 'resolved')) DEFAULT 'open',
  fingerprint TEXT NOT NULL, -- For grouping similar errors
  count INTEGER DEFAULT 1, -- Number of occurrences
  url TEXT, -- Page where error occurred
  user_agent TEXT, -- Browser/client info
  user_id TEXT, -- User who encountered error
  environment TEXT DEFAULT 'production', -- development/production
  tags TEXT, -- JSON array of tags
  metadata TEXT, -- Additional context as JSON
  first_seen_at INTEGER NOT NULL, -- Unix timestamp
  last_seen_at INTEGER NOT NULL, -- Unix timestamp
  resolved_at INTEGER, -- Unix timestamp
  resolved_by TEXT, -- Admin who resolved
  created_at INTEGER NOT NULL, -- Unix timestamp
  updated_at INTEGER NOT NULL, -- Unix timestamp
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### Admin Settings Table
```sql
CREATE TABLE admin_settings (
  id TEXT PRIMARY KEY,
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  notification_level TEXT CHECK(notification_level IN ('error', 'warning', 'info', 'debug')) DEFAULT 'error',
  created_at INTEGER NOT NULL, -- Unix timestamp
  updated_at INTEGER NOT NULL -- Unix timestamp
);
```

## Skeleton Components System

The project includes comprehensive skeleton loading components that MUST be used instead of traditional spinners for all async operations.

### Available Skeleton Components

#### Basic Skeleton Component
```tsx
import { Skeleton } from '@/components/ui/skeleton'

// Basic skeleton for text and elements
<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-12 w-12 rounded-full" />
```

#### Pre-built Layout Skeletons
```tsx
import {
  LoadingSkeleton,
  PageSkeleton,
  CardSkeleton,
  TableSkeleton,
  FormSkeleton,
  DashboardSkeleton,
  ChatSkeleton
} from '@/components/ui/loading-skeleton'

// Generic loading with variants
<LoadingSkeleton variant="card" />
<LoadingSkeleton variant="table" rows={5} />
<LoadingSkeleton variant="form" />
<LoadingSkeleton variant="dashboard" />
<LoadingSkeleton variant="chat" />
<LoadingSkeleton variant="list" />

// Specific layout skeletons
<PageSkeleton />
<CardSkeleton />
<TableSkeleton rows={10} />
<FormSkeleton />
<DashboardSkeleton />
<ChatSkeleton />
```

#### Suspense Skeleton Wrappers
```tsx
import {
  SuspenseSkeleton,
  SuspenseCard,
  SuspenseTable,
  SuspenseForm,
  SuspenseDashboard,
  SuspenseChat
} from '@/components/ui/suspense-skeleton'

// Wrap async components with automatic skeleton fallbacks
<SuspenseSkeleton variant="table" rows={5}>
  <AsyncTableComponent />
</SuspenseSkeleton>

// Convenience wrappers for common patterns
<SuspenseCard>
  <AsyncCardContent />
</SuspenseCard>

<SuspenseTable rows={10}>
  <AsyncDataTable />
</SuspenseTable>

<SuspenseForm>
  <AsyncFormComponent />
</SuspenseForm>
```

### Usage Guidelines

#### Server Actions (REQUIRED)
All Server Actions MUST show skeleton states during execution:

```tsx
'use client'
import { useState, useTransition } from 'react'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { myServerAction } from '@/lib/actions/example'

export function MyForm() {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await myServerAction(formData)
    })
  }

  if (isPending) {
    return <LoadingSkeleton variant="form" />
  }

  return (
    <form action={handleSubmit}>
      {/* Form content */}
    </form>
  )
}
```

#### REST API Calls (REQUIRED)
All REST API calls MUST show skeleton states while loading:

```tsx
'use client'
import { useState, useEffect } from 'react'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'

export function DataTable() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <LoadingSkeleton variant="table" rows={5} />
  }

  return (
    <div>
      {/* Actual table content */}
    </div>
  )
}
```

#### Page-Level Loading
Use Suspense boundaries with skeleton fallbacks:

```tsx
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
```

### Design Patterns

- **NO traditional spinners** - skeletons provide better UX by showing layout structure
- **Match actual content** - skeleton shapes should approximate final content layout
- **Responsive design** - all skeletons work across mobile and desktop breakpoints
- **Consistent timing** - use same animation timing across all skeleton components
- **Accessibility** - skeletons include proper ARIA labels and screen reader support

## Key Features

### Authentication System
- Email/password authentication with secure hashing
- OAuth integration with Google, Meta, Apple, GitHub
- Session-based authentication
- Email verification system
- Password reset functionality
- Role-based access control (user/admin)
- Default admin user creation on first startup

### Admin System
- **Default admin user** created automatically if none exists
  - Admin credentials printed to console on startup if created
  - Admin users have same dashboard as regular users but with distinctive admin badge
  - Separate admin-only sections can be added as needed

### API Key Management
- Users can generate/delete personal API keys in settings
- API keys required for REST API endpoints (when they exist)
- Bearer token authentication for non-server-action requests
- Key usage tracking and management

### SaaS Landing Page
- Hero section with compelling value proposition
- Features showcase with benefits
- Pricing tiers with clear CTAs
- Sign in and Get Started buttons
- Responsive design with dark/light themes

### Dashboard & User Management
- Protected dashboard with user metrics
- **Mobile-optimized** collapsible left sidebar navigation
- Profile management with avatar upload
- Settings page with preferences and API key management
- Demo pages showcasing functionality
- Theme switcher (dark mode default)
- Admin badge for admin users (same dashboard, different styling)
- **🚨 CRITICAL: ALL authenticated pages MUST use `<DashboardLayout>` wrapper** - pages without this lose sidebar navigation context

### Development Tools
- **User impersonation middleware** for development
  - Access any page as any user with `?token=DEV_TOKEN&user=userId`
  - Only active in development mode
  - Useful for testing, LLM automation, and debugging
  - Token configured via environment variable

### Email System
- SMTP configuration via environment variables
- Fallback to console logging when SMTP not configured
- React Email for beautiful, responsive templates
- Email verification, password reset, notifications

### File Upload System
- Multer middleware for handling multipart/form-data
- Secure file validation and storage
- **Flexible Storage Options:**
  - **S3 Storage:** Configure AWS S3 credentials in environment variables
  - **Database Fallback:** If S3 credentials missing, files stored in `files` table
- Image optimization for avatars/uploads

### SMS Integration
- Twilio integration for SMS notifications
- Verification codes, alerts, and notifications

### Queue System
- Toad for background job processing
- Email sending, SMS notifications, file processing
- Retry mechanisms and error handling

### Docker Configuration
- Production Docker setup with Caddy reverse proxy
- Automatic SSL certificate management
- Development Docker Compose for local development
- Environment-specific configurations

### Testing Strategy
- **Unit Tests**: Server actions, utilities, business logic
- **Component Tests**: React components with Testing Library
- **Integration Tests**: Database operations, API endpoints
- **E2E Tests**: Critical user flows (auth, payments, core features)
- **Test Organization**: Co-located with source files
- **Mocking**: Database and external services in tests
- **CI/CD Integration**: Tests run automatically on push

### LLM Integration
- **Multi-Provider Support**: OpenAI, Anthropic, OpenRouter, Groq, Cerebras
- **Streaming Chat**: Real-time token streaming for responsive UX
- **Flexible Configuration**: Environment-based provider activation
- **Universal Interface**: Single `message()` function for all providers
- **Ready-to-Use Components**: Pre-built chat UI with provider selection
- **Demo Page**: `/demo/llm` showcases all LLM features
- **Type-Safe**: Full TypeScript support for all LLM operations

### Payment Processing
- **Stripe Integration**: Full support for payments and subscriptions
- **Flexible Pricing**: Support for one-time and recurring payments
- **Subscription Management**: Create, update, and cancel subscriptions
- **Webhook Handling**: Automatic processing of Stripe events
- **Payment Components**: Pre-built checkout buttons and pricing cards
- **Customer Portal**: Manage payment methods and invoices
- **Demo Page**: `/demo/payments` showcases payment flows
- **Database Tracking**: All payments and subscriptions tracked locally

### Error Tracking System
- **Comprehensive Error Monitoring**: Sentry-like error tracking for production applications
- **Multi-Level Capture**: Client-side, server-side, and React component error boundaries
- **Smart Grouping**: Similar errors grouped by fingerprint to prevent noise
- **Severity Levels**: Error, Warning, Info, Debug with proper filtering and alerts
- **Admin Dashboard**: Complete issue management interface at `/dashboard/admin/issues`
- **Email Notifications**: Configurable email alerts for admin users when errors occur
- **Status Management**: Mark issues as Open, Resolved, or Closed with admin controls
- **Rich Context**: Stack traces, user agents, URLs, and custom metadata capture
- **Search & Filter**: Advanced filtering by status, level, and text search
- **Development Tools**: Enhanced error displays and console logging in dev mode

## Custom Scripts

### Migration Generation
Custom script to generate Drizzle migrations with timestamp naming:
```bash
npm run db:generate  # Creates yyyyMMddHHmmss_description.sql files
npm run db:migrate   # Runs pending migrations
npm run db:push      # Push schema changes directly
npm run db:studio    # Opens Drizzle Studio
```

**Important:** The `db:generate` script automatically renames Drizzle's default numbered migrations (0001_name.sql) to timestamp format (20250723115655_name.sql) for better organization and deployment tracking.

### Admin Management Scripts
Located in `./scripts/` directory:
```bash
npm run reset-admin  # Resets admin user password and prints credentials
npm run create-admin # Creates admin user if none exists
```

### Development Commands
```bash
npm run dev          # Start development server on 0.0.0.0:3000
npm run build        # Build for production
npm run start        # Start production server on 0.0.0.0:3000
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
npm run check        # Quick TypeScript check (faster than build)
```

### Testing Commands
**IMPORTANT**: Each nextjs-xx.x project MUST include these test scripts in package.json:
```json
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
```

Usage:
```bash
npm run test           # Run all unit/integration tests once
npm run test:watch     # Run tests in watch mode (TDD)
npm run test:ui        # Open Vitest UI
npm run test:coverage  # Run tests with coverage report
npm run test:e2e       # Run Playwright E2E tests
npm run test:e2e:ui    # Run Playwright tests with UI
npm run test:e2e:install # Install Playwright browsers (first time)
```

**CRITICAL**: The development server MUST always bind to `0.0.0.0:3000` (not localhost) to ensure accessibility from Docker containers and external connections. This is enforced in the Next.js configuration.

## Environment Configuration
Required environment variables:
```env
# Database
DATABASE_URL="file:./content.db"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
META_CLIENT_ID=""
META_CLIENT_SECRET=""
APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""

# SMTP (optional - falls back to console)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""

# Twilio
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="5242880" # 5MB

# AWS S3 (optional - falls back to database storage)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
AWS_S3_BUCKET=""

# Development Tools
DEV_IMPERSONATION_TOKEN="your-dev-token-here"

# LLM Providers (optional - configure the ones you want to use)
OPENAI_API_KEY=""
OPENAI_BASE_URL="" # Optional, defaults to https://api.openai.com/v1
ANTHROPIC_API_KEY=""
ANTHROPIC_BASE_URL="" # Optional, defaults to https://api.anthropic.com/v1
OPENROUTER_API_KEY=""
OPENROUTER_BASE_URL="" # Optional, defaults to https://openrouter.ai/api/v1
GROQ_API_KEY=""
GROQ_BASE_URL="" # Optional, defaults to https://api.groq.com/openai/v1
CEREBRAS_API_KEY=""
CEREBRAS_BASE_URL="" # Optional, defaults to https://api.cerebras.ai/v1

# Stripe Payments (optional - configure to enable payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET="" # Required for webhook verification
STRIPE_CURRENCY="usd" # Optional, defaults to usd
STRIPE_PAYMENT_METHODS="card" # Optional, comma-separated list
```

## Setup Instructions

1. **Initialize Project**
   ```bash
   npx create-next-app@latest nextjs-15.4 --typescript --tailwind --eslint --app
   cd nextjs-15.4
   # DO NOT run git init - this directory is not a git repository
   # IMPORTANT: Update package.json to include all required scripts (see Testing Commands section)
   ```

2. **Install Dependencies**
   ```bash
   npm install drizzle-orm better-sqlite3 @types/better-sqlite3
   npm install drizzle-kit
   npm install @auth/drizzle-adapter next-auth
   npm install multer @types/multer
   npm install nodemailer @types/nodemailer
   npm install react-email @react-email/components
   npm install twilio
   npm install toad-scheduler
   npm install lucide-react class-variance-authority clsx tailwind-merge
   ```

3. **Install Testing Dependencies**
   ```bash
   npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
   npm install -D @testing-library/user-event @types/node
   npm install -D playwright @playwright/test
   ```

   **🚨 CRITICAL: Security Audit Requirements**
   After `npm install`, you MUST resolve ALL security vulnerabilities:
   ```bash
   npm audit          # Check for vulnerabilities
   npm audit fix      # Fix auto-fixable issues
   npm audit fix --force  # Fix remaining issues (if needed)
   npm audit          # Verify vulnerabilities are resolved
   ```
   
   **Target: 0 vulnerabilities. If persistent dev-only vulnerabilities remain (e.g., in drizzle-kit's esbuild dependencies), document them and verify they don't affect production builds.**
   
   Acceptable exceptions:
   - Development-only tool vulnerabilities that don't affect production builds
   - Vulnerabilities in packages like `@esbuild-kit/*` used only by development tools
   
   **Always verify with `npm run build` that the application builds successfully.**

4. **Setup shadcn/ui**
   ```bash
   npx shadcn@latest init
   npx shadcn@latest add --all  # Install ALL components
   ```

5. **Create Required Configuration Files**
   ```bash
   # Create .gitignore and .dockerignore files (templates provided below)
   # Create vitest.config.mjs, vitest.setup.ts, and playwright.config.ts
   # Create README.md for user documentation (template provided below)
   ```

6. **Generate Database Schema and Migrations**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run create-admin  # Creates default admin user
   ```

7. **Setup Docker (Optional)**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d  # Development
   docker-compose up -d                             # Production
   ```

## Required Configuration Files

### .gitignore Template
```gitignore
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage
*.lcov
/test-results/
/playwright-report/
/playwright/.cache/

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Database
*.db
*.db-journal

# Uploads
/uploads

# Docker
.dockerignore

# IDE
.vscode/
.idea/

# Logs
logs
*.log

# Drizzle
drizzle/migrations/*.sql
!drizzle/migrations/.gitkeep
```

### .dockerignore Template
```dockerignore
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next
out
build

# Environment files
.env*.local
.env

# Git
.git
.gitignore

# IDE
.vscode
.idea

# Misc
.DS_Store
*.pem
README.md
CLAUDE.md

# Database (will be created in container)
*.db
*.db-journal

# Docker
Dockerfile*
docker-compose*.yml
.dockerignore

# Logs
logs
*.log

# Testing
/coverage
.nyc_output

# Uploads (should be volume mounted)
/uploads
```

### README.md Template
Each nextjs-xx.x directory MUST include a README.md file for users:

```markdown
# Next.js 15.4 Opinionated Starter

A production-ready Next.js starter with authentication, database, testing, and more.

## Features

- 🚀 **Next.js 15.4** with App Router and TypeScript
- 🎨 **UI Components** - All 45+ shadcn/ui components pre-installed
- 🔐 **Authentication** - Email/password + OAuth (Google, GitHub, Meta, Apple)
- 💾 **Database** - SQLite with Drizzle ORM
- 📧 **Email** - SMTP integration with React Email templates
- 📱 **SMS** - Twilio integration
- 📁 **File Storage** - S3 compatible with database fallback
- 🧪 **Testing** - Vitest + Testing Library + Playwright
- 🎯 **Type Safe** - Full TypeScript with strict mode
- 📱 **Mobile First** - Responsive design with mobile optimizations
- 🌙 **Dark Mode** - Built-in theme switching
- 🔧 **Developer Tools** - User impersonation for testing
- 🐳 **Docker Ready** - Production Docker setup included

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env

# Run database migrations
npm run db:migrate

# Create admin user
npm run create-admin

# Start development server
npm run dev
```

## Available Scripts

```bash
npm run dev          # Development server (0.0.0.0:3000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # Run ESLint
npm run check        # TypeScript check
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run E2E tests
```

## Environment Variables

See `env.example` for all required environment variables.

## Testing

```bash
npm run test         # Unit/integration tests
npm run test:watch   # TDD mode
npm run test:e2e     # End-to-end tests
```

## Deployment

See deployment documentation for Docker and production setup.
```

## Important Reminders

- **DO NOT initialize git repository** in nextjs-xx.x directories
- **ALWAYS create .gitignore and .dockerignore** files using provided templates
- **ALWAYS create README.md** for user documentation
- **Database is ALWAYS named `content.db`** - never dev.db, prod.db, or other names

## 🚨 CRITICAL: Documentation and Environment Requirements

### README.md Maintenance
**MANDATORY**: Any change to project functionality, features, or configuration MUST include updating the README.md:

- **New Features** - Document usage, configuration, and examples
- **New Environment Variables** - Add to environment section with descriptions
- **New Commands/Scripts** - Update available scripts section
- **API Changes** - Update usage examples and documentation
- **Dependencies Added** - Update tech stack and setup instructions
- **Authentication Changes** - Update auth flow documentation
- **Database Changes** - Update schema documentation if relevant

### Environment Variable Management
**MANDATORY**: All new environment variables MUST be added to `env.example`:

- **Document each variable** with clear comments explaining purpose
- **Provide example values** (use placeholder/dummy values, never real secrets)
- **Group related variables** together with section headers
- **Mark optional vs required** variables clearly
- **Include default values** when applicable

#### Example format for env.example:
```env
# Database Configuration (Required)
DATABASE_URL="file:./content.db"

# SMTP Email (Optional - falls back to console logging)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourapp.com"

# OAuth Providers (Optional - enable the ones you need)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Enforcement
- **AI Assistants MUST check** if changes require documentation updates
- **No exceptions** - documentation updates are not optional
- **Verify env.example** is updated when new environment variables are introduced
- **Cross-reference** README.md with actual implemented features for accuracy
- **🚨 ALWAYS GENERATE AND RUN MIGRATIONS** when making schema changes (`npm run db:generate && npm run db:migrate`)
- **🚨 ALWAYS AWAIT PARAMS** in Next.js 15+ dynamic routes (`const { id } = await params`)
- **Use SQLite timestamp format** with `strftime('%s', 'now')` for default values
- **Create admin user** on initial setup and after database resets
- **File storage flexibility:**
  - **S3 preferred:** Configure AWS credentials for cloud storage
  - **Database fallback:** Files stored in `files` table if S3 credentials missing
- **Environment files:**
  - **env.example** (no dot prefix) for documentation
  - **.env*** patterns in .gitignore for security
- **Test authentication flows** with all OAuth providers
- **Verify email/SMS functionality** in development
- **Check environment variables** are properly configured
- **Test file upload limits and validation**
- **Ensure dark/light theme consistency** across all components
- **Test responsive design on mobile** - everything must look GREAT on mobile
- **Test collapsible sidebar** functionality on mobile devices
- **Validate Docker configurations** work correctly
- **Test queue system** processes jobs correctly
- **Test development impersonation** middleware works correctly
- **Ensure API key management** works for REST endpoints (when they exist)
- **Use Server Actions** for all page interactions, NOT custom APIs
- **Always run `npm run check`** after making changes to verify TypeScript compilation
- **Security audit must show minimal vulnerabilities** - run `npm audit` and fix all production-affecting issues
- **Ensure proper error handling** throughout the application
- **Always use `devIndicators: false`** in next.config.js to hide the annoying development indicator button
- **Follow TDD workflow** - write failing tests first, then implement code to pass
- **Run tests before committing** - ensure all tests pass before pushing code
- **Maintain test coverage** - aim for 80%+ coverage on business logic
- **LLM Integration usage:**
  - **Import from `@/lib/llm`** for client utilities
  - **Use `LLMClient.chat()` or `LLMClient.streamChat()`** for programmatic access
  - **Pre-built chat component** available at `@/components/llm/streaming-chat`
  - **Demo available at `/demo/llm`** to test all configured providers
  - **Configure only the providers you need** - others will be automatically disabled
- **Stripe Payments usage:**
  - **Import from `@/lib/payments`** for types and configuration
  - **Use server actions from `@/lib/actions/payments`** for payment operations
  - **Pre-built components** in `@/components/payments/`
  - **Demo available at `/demo/payments`** to test payment flows
  - **Webhook endpoint** at `/api/webhooks/stripe` for event processing
  - **Configure Stripe keys** in environment variables to enable

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Admin user created and credentials noted
- [ ] **Security audit resolved** - no production-affecting vulnerabilities (`npm audit`)
- [ ] OAuth providers configured with correct redirect URLs
- [ ] SMTP/email system tested
- [ ] File upload directory permissions set
- [ ] Docker containers build successfully
- [ ] Caddy SSL certificates working
- [ ] All authentication flows tested
- [ ] Theme switching functional
- [ ] Mobile responsiveness verified (especially sidebar collapse)
- [ ] API key system functional
- [ ] Queue system operational
- [ ] Development impersonation disabled in production
- [ ] Server Actions working correctly (no custom APIs unless requested)
- [ ] Error monitoring configured
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Critical E2E tests passing
- [ ] Test coverage meets minimum requirements (80%+ for business logic)

This project serves as a comprehensive starting point for modern SaaS applications, with all the essential features and integrations needed to launch quickly while maintaining high code quality and user experience standards.

## Per-Version Documentation

Each Next.js version directory (e.g., `nextjs-15.4/`) MUST contain its own `CLAUDE.md` file with the following content:

### Template for nextjs-xx.x/CLAUDE.md:

```markdown
# Next.js XX.X Opinionated Starter

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
- ❌ **NEVER** modify `vitest.config.mjs` (testing configuration is locked)
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

### DATABASE SCHEMA CHANGES
- Database schema is defined in `./src/lib/db/schema.ts`
- To apply schema changes, user must run: `npm run db:generate && npm run db:migrate`
- **NEVER** manually edit migration files in `./drizzle/migrations/`

## Architecture Principles

This starter is **OPINIONATED** and follows strict conventions:

1. **Server Actions First**: All page interactions use Server Actions, NOT API routes
2. **Mobile-First**: Everything must be responsive and mobile-optimized
3. **TypeScript Strict**: Full type safety throughout
4. **Database**: SQLite with Drizzle ORM using Unix timestamps
5. **Authentication**: Session-based with role support (user/admin)
6. **Styling**: Tailwind CSS with shadcn/ui components
7. **Theme**: Dark mode as default with light mode toggle

## Available Dependencies

This project includes pre-installed and configured:

- Next.js XX.X with App Router
- TypeScript with strict configuration
- Tailwind CSS with shadcn/ui
- Drizzle ORM with better-sqlite3
- NextAuth.js for authentication
- React Email for email templates
- Multer for file uploads
- Twilio for SMS
- Toad for job queues
- All necessary type definitions

## File Structure

- `./src/app/` - Next.js App Router pages
- `./src/components/` - React components (including shadcn/ui)
- `./src/lib/` - Utilities, database, auth, actions, storage
- `./src/lib/db/schema.ts` - Database schema definitions
- `./src/lib/storage/` - File storage utilities (S3/database)
- `./src/types/` - TypeScript type definitions

## Development Guidelines

1. **TypeScript First**: Run `npm run check` after EVERY change - no exceptions
2. Follow existing code patterns and conventions
3. Use existing components from shadcn/ui
4. Implement new features using Server Actions
5. Ensure mobile responsiveness for all UI
6. Maintain TypeScript strict compliance
7. Test on both light and dark themes

## Quick Validation Workflow

After making any changes:
```bash
npm run check    # Fast TypeScript validation (< 2 seconds)
# Fix any errors before proceeding
npm run lint     # Optional: Check code style
npm run build    # Full build when ready to test
```

## Getting Help

If you need additional dependencies or configuration changes, ask the project maintainer to:
1. Install the required packages
2. Update configuration files
3. Run `npm run db:generate && npm run db:migrate` for schema changes

**Remember: This is an OPINIONATED starter. Work within the established constraints and patterns.**
```

This documentation ensures that any AI assistant working on the project understands the strict boundaries and maintains the opinionated nature of the starter template.