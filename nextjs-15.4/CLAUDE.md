# Next.js 15.4 Opinionated Starter

This is an **OPINIONATED** Next.js starter template with predefined architecture, dependencies, and constraints.

## 🚨 CRITICAL CONSTRAINTS FOR AI ASSISTANTS

### ALLOWED OPERATIONS
- ✅ Edit files inside `./src/` directory only
- ✅ Add new files inside `./src/` directory only
- ✅ Read any file for understanding
- ✅ Use existing dependencies and libraries

### FORBIDDEN OPERATIONS
- ❌ **NEVER** install new packages or dependencies
- ❌ **NEVER** modify `package.json`
- ❌ **NEVER** modify `tsconfig.json`
- ❌ **NEVER** modify `tailwind.config.js`
- ❌ **NEVER** modify `next.config.js`
- ❌ **NEVER** modify `drizzle.config.ts`
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
- All necessary type definitions

## File Structure

- `./src/app/` - Next.js App Router pages
- `./src/components/` - React components (including shadcn/ui)
- `./src/lib/` - Utilities, database, auth, actions, storage
- `./src/lib/db/schema.ts` - Database schema definitions
- `./src/lib/storage/` - File storage utilities (S3/database fallback)
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