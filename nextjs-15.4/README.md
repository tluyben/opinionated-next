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
- 🤖 **LLM Integration** - Multi-provider streaming chat (OpenAI, Anthropic, OpenRouter, Groq, Cerebras)

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
│   └── storage/     # File storage utilities
├── middleware.ts    # Middleware (dev impersonation)
└── types/          # TypeScript type definitions
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