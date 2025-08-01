# Next.js 15.4 Opinionated Starter

**OPINIONATED** Next.js starter with predefined architecture, dependencies, and constraints.

## AI Assistant Constraints

### ✅ ALLOWED
- Edit/add files in `./src/` only
- Create test files (`*.test.ts`, `*.test.tsx`)
- Use existing dependencies and libraries
- Run tests with Vitest/Testing Library

### ❌ FORBIDDEN
- Install new packages/dependencies
- Modify config files (tsconfig, tailwind, next, drizzle, vitest, playwright)
- Edit `./drizzle/migrations/`
- Modify Docker files
- Git operations

### 🚨 MANDATORY AFTER EVERY CHANGE
- Run `npm run check` (TypeScript validation)
- Fix ALL TypeScript errors
- Write tests FIRST (TDD)
- Run `npm run test` to verify

## Critical Reminders (You Always Forget!)

### Schema Changes
`npm run db:generate && npm run db:migrate` after ANY `./src/lib/db/schema.ts` edit

### Next.js 15 Dynamic Routes
```tsx
// ✅ CORRECT - await params
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

### DashboardLayout Wrapper
```tsx
// ✅ CORRECT - all authenticated pages need this
<DashboardLayout>
  {/* page content */}
</DashboardLayout>
```

### SQLite Transactions (Synchronous Only!)
```tsx
// ✅ CORRECT - NO async/await in callback
db.transaction((tx) => {
  tx.insert(table).values(data).run();
});
```

### SQLite Timestamps
`integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`)`

## Principles
1. Server Actions (NO API routes)
2. Mobile-first responsive
3. TypeScript strict
4. SQLite + Drizzle (Unix timestamps)
5. Session auth + OAuth
6. Tailwind + shadcn/ui
7. TDD mandatory

## Stack
Next.js 15.4, TypeScript, shadcn/ui (45+ components), Drizzle/SQLite, NextAuth, React Email, Multer, Twilio, Vitest/Playwright, LLM providers, Stripe, Error tracking

## Structure
`./src/app/`, `./src/components/`, `./src/lib/` (db, auth, actions, llm, payments, error-tracking)

## Key Features
- **Components**: All 45+ shadcn/ui components pre-installed
- **Loading**: Use `LoadingSkeleton` (NO spinners), `SuspenseSkeleton` wrappers
- **Dev Tools**: User impersonation `?token=DEV_TOKEN&user=userId`
- **Auth**: Email/password + OAuth (Google, GitHub, Meta, Apple)
- **Testing**: Vitest (unit), Playwright (E2E), TDD workflow

## Testing
```bash
npm run test         # Run tests
npm run test:watch   # TDD mode
npm run test:e2e     # E2E tests
```

## Environment
Required for dev impersonation: `DEV_IMPERSONATION_TOKEN`
Optional: LLM APIs (OpenAI, Anthropic, etc.), Stripe keys (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)

## Validation
```bash
npm run check    # TypeScript validation
# Fix errors before proceeding
# IF SCHEMA CHANGED: npm run db:generate && npm run db:migrate
```

## Work within established patterns - this is OPINIONATED starter!