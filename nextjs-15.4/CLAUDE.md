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
- ✅ **Run tests after implementing features** - use `npx vitest run` to verify
- ✅ **Write tests FIRST for new features** - follow TDD approach

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
5. **Authentication**: Session-based with role support (user/admin)
6. **Styling**: Tailwind CSS with shadcn/ui components
7. **Theme**: Dark mode as default with light mode toggle
8. **Test-Driven Development**: Write tests first, then implementation

## Available Dependencies

This project includes pre-installed and configured:

- Next.js 15.4 with App Router
- TypeScript with strict configuration
- Tailwind CSS with shadcn/ui
- Drizzle ORM with better-sqlite3
- NextAuth.js for authentication
- React Email for email templates
- Multer for file uploads
- Twilio for SMS
- Toad for job queues
- Vitest for unit/integration testing
- Testing Library for component testing
- Playwright for E2E testing
- All necessary type definitions

## File Structure

- `./src/app/` - Next.js App Router pages
- `./src/components/` - React components (including shadcn/ui)
- `./src/lib/` - Utilities, database, auth, actions, storage
- `./src/lib/db/schema.ts` - Database schema definitions
- `./src/lib/storage/` - File storage utilities (S3/database fallback)
- `./src/types/` - TypeScript type definitions
- `./src/**/*.test.ts(x)` - Test files co-located with source files
- `./tests/e2e/` - Playwright E2E tests
- `./vitest.config.mjs` - Vitest configuration (locked)
- `./vitest.setup.ts` - Test setup and mocks
- `./playwright.config.ts` - Playwright configuration (locked)

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

## Environment Variables Required

For user impersonation to work, add to your `.env` file:
```env
DEV_IMPERSONATION_TOKEN="your-secret-dev-token-here"
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