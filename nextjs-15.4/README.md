# Next.js 15.4 Opinionated Starter

A production-ready Next.js starter with authentication, database, testing, and more.

## Features

- 🚀 **Next.js 15.4** with App Router and TypeScript
- 🎨 **UI Components** - All 45+ shadcn/ui components pre-installed
- 🔐 **Authentication** - Email/password + OAuth (Google, GitHub, Meta, Apple) + Password Reset
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
- 🤖 **LLM Integration** - Multi-provider streaming chat (OpenAI, Anthropic, OpenRouter, Groq, Cerebras)
- 💳 **Payments** - Stripe integration with subscriptions and one-time payments
- 🚨 **Error Tracking** - Comprehensive Sentry-like error monitoring and admin dashboard

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
npm run test:watch   # Run tests in watch mode (TDD)
npm run test:ui      # Open Vitest UI
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run E2E tests
npm run test:e2e:ui  # Run E2E tests with UI
```

### Database Scripts

```bash
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
```

### Admin Scripts

```bash
npm run create-admin # Create admin user
npm run reset-admin  # Reset admin password
```

## Authentication

This starter includes a comprehensive authentication system with multiple sign-in options:

### Available Authentication Methods

- **Email/Password** - Traditional signup and login with secure password hashing
- **Google OAuth** - Sign in with Google account
- **GitHub OAuth** - Sign in with GitHub account  
- **Meta/Facebook OAuth** - Sign in with Facebook account
- **Apple OAuth** - Sign in with Apple ID
- **Password Reset** - Secure password reset flow with email tokens

### Authentication Pages

- `/login` - Sign in with email/password or OAuth providers
- `/signup` - Create account with email/password or OAuth providers
- `/forgot-password` - Request password reset link
- `/reset-password` - Set new password with reset token

### OAuth Setup

To enable OAuth providers, configure the following environment variables and set up OAuth apps in each provider's developer console:

```env
# Google OAuth (https://console.developers.google.com/)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Meta/Facebook OAuth (https://developers.facebook.com/)
META_CLIENT_ID="your-meta-client-id"
META_CLIENT_SECRET="your-meta-client-secret"

# Apple OAuth (https://developer.apple.com/)
APPLE_CLIENT_ID="your-apple-client-id"
APPLE_CLIENT_SECRET="your-apple-client-secret"
```

### Development Features

- **User Impersonation** - Test as any user with `?token=DEV_TOKEN&user=userId`
- **Console Password Reset** - Reset links logged to console in development
- **Auto Admin Creation** - Admin user created automatically on first startup

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./content.db"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
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

# Twilio (optional)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="5242880" # 5MB

# AWS S3 (optional - falls back to database)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
AWS_S3_BUCKET=""

# Development
DEV_IMPERSONATION_TOKEN="your-dev-token-here"

# LLM Providers (optional - add only the ones you want to use)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
OPENROUTER_API_KEY=""
GROQ_API_KEY=""
CEREBRAS_API_KEY=""

# Stripe Payments (optional - add to enable payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

## Testing

### Unit & Integration Tests

```bash
npm run test         # Run all tests once
npm run test:watch   # TDD mode
npm run test:ui      # Vitest UI
npm run test:coverage # With coverage report
```

### E2E Tests

```bash
npm run test:e2e:install # Install browsers (first time)
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run with UI
```

## Development

### User Impersonation

In development, you can impersonate any user:

```
http://localhost:3000/dashboard?token=your-dev-token-here&user=USER_ID
```

### Database Management

The database uses SQLite with Drizzle ORM:

```bash
# View database
npm run db:studio

# Create new migration after schema changes
npm run db:generate

# Apply migrations
npm run db:migrate
```

### LLM Integration

The starter includes built-in support for streaming LLM chat:

#### Available Providers
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude models)
- OpenRouter (Multiple models)
- Groq (Fast Llama models)
- Cerebras (High-performance)

#### Usage

```typescript
import { LLMClient } from '@/lib/llm';

// Basic chat
const response = await LLMClient.chat(
  'openai', 
  'gpt-4o',
  messages,
  systemPrompt
);

// Streaming chat
for await (const chunk of LLMClient.streamChat(
  'anthropic',
  'claude-3-5-sonnet-latest',
  messages
)) {
  console.log(chunk);
}
```

#### Demo
Visit `/demo/llm` to test the LLM integration with a full chat interface.

### Payments Integration

The starter includes Stripe payment processing:

#### Features
- Subscription management
- One-time payments
- Webhook handling
- Invoice tracking
- Customer portal

#### Usage

```typescript
import { CheckoutButton } from '@/components/payments/checkout-button';
import { createCheckoutSession } from '@/lib/actions/payments';

// Simple checkout button
<CheckoutButton priceId="price_xxx" mode="subscription">
  Subscribe
</CheckoutButton>

// Programmatic checkout
const session = await createCheckoutSession('price_xxx');
window.location.href = session.url;
```

#### Demo
Visit `/demo/payments` to see pricing cards and checkout flows.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # shadcn/ui components (45+)
│   ├── auth/        # Authentication components
│   ├── dashboard/   # Dashboard components
│   └── theme/       # Theme components
├── lib/             # Utilities and configurations
│   ├── actions/     # Server actions
│   ├── auth/        # Authentication logic
│   ├── db/          # Database schema and connections
│   ├── email/       # Email templates and logic
│   ├── llm/         # LLM client and providers
│   ├── payments/    # Payment client and config
│   └── storage/     # File storage utilities
├── middleware.ts    # Middleware (dev impersonation)
└── types/          # TypeScript type definitions
```

## Error Tracking

This starter includes a comprehensive error tracking system similar to Sentry for monitoring application health.

### Features

- **Multi-Level Capture** - Client-side, server-side, and React component error boundaries
- **Smart Grouping** - Similar errors grouped by fingerprint to prevent noise
- **Admin Dashboard** - Complete issue management at `/dashboard/admin/issues`
- **Email Alerts** - Configurable notifications for admin users
- **Rich Context** - Stack traces, user info, URLs, and custom metadata

### Admin Access

All error tracking features require admin role access:

- **Issues Dashboard** - View, filter, and search all application errors
- **Issue Details** - Detailed error information with stack traces and context
- **Admin Settings** - Configure email notifications and severity levels

### Automatic Setup

Error tracking is automatically initialized and requires no additional configuration. SMTP setup is optional for email notifications:

```env
# Optional - for error notifications
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"
SMTP_FROM="errors@yourdomain.com"
```

## Deployment

### Docker

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up -d
```

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Run migrations:
   ```bash
   npm run db:migrate
   ```

4. Start the server:
   ```bash
   npm run start
   ```

## Security

- Session-based authentication with secure cookies
- Password hashing with bcrypt
- CSRF protection via Server Actions
- Environment variables for secrets
- Role-based access control

## Contributing

This is an opinionated starter template. For modifications:

1. Follow the existing patterns
2. Write tests first (TDD)
3. Ensure mobile responsiveness
4. Update this README with changes

## License

MIT