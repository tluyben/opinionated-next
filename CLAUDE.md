# Opinionated Next.js Starter

**MANDATORY**: Next.js 15.4+ TypeScript starter with strict TDD. Each version in separate `./nextjs-xx.x` directories.

## Stack
Next.js 15.4, TypeScript, shadcn/ui (all 45+ components), Drizzle ORM/SQLite, NextAuth, React Email, Multer, Twilio, Toad, Docker/Caddy, OAuth (Google/Meta/Apple/GitHub), Vitest/Testing Library/Playwright, LLM providers, Stripe, Error tracking

## Principles
- **Server Actions only** (no API routes unless external integrations)
- **Mobile-first** responsive design
- **🚨 TDD MANDATORY**: Write tests FIRST, 90%+ coverage, ALL features tested, zero tolerance for failing tests
- **Skeleton loading** (no spinners)

## Structure
```
nextjs-15.4/src/
├── app/ - (auth)/, (dashboard)/, api/ (only when requested)
├── components/ - ui/, auth/, dashboard/, llm/, payments/, admin/
├── lib/ - db/schema.ts, auth/, actions/, llm/, payments/, error-tracking/
└── types/
```

## Critical Requirements
- **Schema changes**: `npm run db:generate && npm run db:migrate` after ANY schema edit
- **Next.js 15**: `const { id } = await params` (dynamic routes MUST await params)
- **SQLite timestamps**: `integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`)`

## Schema
Tables: users, sessions, api_keys, files (S3 fallback), payments, subscriptions, invoices, issues (error tracking), admin_settings. All use Unix timestamps.

## Skeleton Loading
Use `LoadingSkeleton` variants (card, table, form, dashboard, chat, list) for all async operations. Available: `SuspenseSkeleton`, `SuspenseCard`, `SuspenseTable`, etc. NO spinners.

## Features
- **Auth**: Email/password + OAuth, sessions, admin auto-creation, API keys
- **UI**: Landing page, dashboard with mobile sidebar, `<DashboardLayout>` wrapper required
- **Dev Tools**: User impersonation `?token=DEV_TOKEN&user=userId`
- **Storage**: S3 or database fallback, Multer uploads
- **Comms**: SMTP/console email, Twilio SMS, React Email templates
- **Payments**: Stripe integration, webhooks, subscriptions, demos at `/demo/payments`
- **LLM**: Multi-provider (OpenAI/Anthropic/OpenRouter/Groq/Cerebras), demos at `/demo/llm`
- **Error Tracking**: Sentry-like system, admin dashboard at `/dashboard/admin/issues`
- **Docker**: Caddy reverse proxy, SSL management

## Scripts
- **DB**: `npm run db:generate && npm run db:migrate` (timestamp-named migrations)
- **Admin**: `npm run create-admin` / `npm run reset-admin`
- **Dev**: `npm run dev` (0.0.0.0:3000), `npm run check` (TypeScript)
- **Test**: `npm run test`, `npm run test:watch`, `npm run test:e2e`

## Environment
Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
Optional: OAuth keys (Google/GitHub/Meta/Apple), SMTP, Twilio, S3, LLM APIs, Stripe, `DEV_IMPERSONATION_TOKEN`

## Setup
1. `npx create-next-app@latest nextjs-15.4 --typescript --tailwind --app`
2. Install deps: Drizzle, NextAuth, shadcn/ui (`npx shadcn@latest add --all`), testing (Vitest/Playwright)
3. Run `npm audit fix` to resolve vulnerabilities
4. Create configs (.gitignore, vitest, playwright), README.md
5. `npm run db:generate && npm run db:migrate && npm run create-admin`

## Key Rules
- **NO new packages/deps** - use existing only
- **TDD mandatory**: tests first, 90%+ coverage, zero failing tests
- **TypeScript strict**: `npm run check` after ALL changes
- **Documentation**: Update README.md and env.example for new features
- **Database**: Always run migrations after schema changes
- **Mobile-first**: Everything must work great on mobile
- **Server Actions**: NO API routes unless external integrations