# Opinionated Next.js Starter Templates

A collection of production-ready, opinionated Next.js starter templates that stay current with the latest versions. Each major version is maintained in separate directories to ensure compatibility and stability.

## 🚀 Quick Project Creation

Create a new project from any available template using the interactive script:

```bash
# Run the project creator
./create-project

# Or run directly
./scripts/create-project.sh
```

## 🔄 Updating Existing Projects

Update an existing project to a newer template version using the update script:

```bash
# Safe update (preserves all src/ and drizzle/ files)
./scripts/update-next 15.5 /path/to/existing/project

# Dangerous update (overwrites unchanged src/ and drizzle/ files)
./scripts/update-next 15.5 /path/to/existing/project --force-overwrite
```

### Safe Update Mode (Default)

The script will:
- ✅ Update all configuration files (package.json, tsconfig.json, etc.)
- ✅ Update dependencies and run fresh npm install
- ✅ Preserve all your custom code in src/ and drizzle/
- ✅ Update documentation (README.md, CLAUDE.md)
- ✅ Update Docker and test configurations

### 🚨 Force Overwrite Mode (--force-overwrite)

**DANGEROUS:** This flag enables automatic overwriting of source files, but ONLY if they haven't been modified by the user.

**How it works:**
1. **Detects your current template version** by analyzing configuration files
2. **Compares each file** in src/ and drizzle/ using SHA256 hashes
3. **Safe to overwrite:** Files identical to the original template get updated automatically
4. **User modified:** Files that differ from the original template are preserved
5. **New files:** Files that don't exist in your project are added

**Safety features:**
- ⚠️ **Only overwrites files identical to the original template**
- ⚠️ **Preserves all user-modified files**
- ⚠️ **Shows detailed analysis before making changes**
- ⚠️ **Warns about the dangerous operation multiple times**
- ⚠️ **Requires explicit --force-overwrite flag**

**Example output:**
```
📊 Source File Analysis:
✅ 12 files can be safely overwritten (unchanged from template):
   src/middleware.ts
   src/lib/utils/index.ts
   drizzle/schema.ts
   
⚠️  8 files have user modifications (will be preserved):
   src/app/page.tsx
   src/components/custom-component.tsx
   
ℹ️  3 new files will be added:
   src/app/new-feature/page.tsx
   src/components/ui/new-component.tsx
```

**Use cases for --force-overwrite:**
- ✅ **After fresh project creation** with minimal customization
- ✅ **When you want latest template improvements** in unmodified files
- ✅ **For projects that closely follow template patterns**
- ❌ **NOT for heavily customized projects**
- ❌ **NOT without git commits** (changes cannot be undone)

**Prerequisites:**
- 🚨 **MUST have git repository** with committed changes
- 🚨 **MUST review changes** before deploying
- 🚨 **MUST test thoroughly** after update

The script will:

1. **Show available Next.js versions** (currently Next.js 15.4)
2. **Prompt for project name** (GitHub-compatible naming validation)
3. **Copy the template** to your chosen directory name
4. **Update package.json** with your project name
5. **Install dependencies** and run security audit
6. **Initialize git repository** with descriptive first commit
7. **Provide setup instructions** for next steps

### Project Name Requirements

The script validates project names to ensure GitHub compatibility:

- ✅ **Letters, numbers, dots, hyphens, underscores only** (`a-zA-Z0-9._-`)
- ✅ **Must start/end with letter, number, or underscore**
- ✅ **Maximum 100 characters**
- ✅ **Directory must not already exist**

Examples of valid names:
- `my-awesome-app`
- `MyCompany.WebApp`
- `user_dashboard_v2`
- `2024-portfolio`

## 📦 Available Templates

### Next.js 15.4 - Current Stable

**Location:** `./nextjs-15.4/`

**Features:**
- 🚀 **Next.js 15.4** with App Router and TypeScript
- 🎨 **UI Components** - All 45+ shadcn/ui components pre-installed
- 🔐 **Authentication** - Email/password + OAuth (Google, GitHub, Meta, Apple)
- 💾 **Database** - SQLite with Drizzle ORM
- 📧 **Email** - SMTP integration with React Email templates
- 📱 **SMS** - Twilio integration
- 📁 **File Storage** - S3 compatible with database fallback
- 🧪 **Testing** - Vitest + Testing Library + Playwright with TDD workflow
- 🎯 **Type Safe** - Full TypeScript with strict mode
- 📱 **Mobile First** - Responsive design with mobile optimizations
- 🌙 **Dark Mode** - Built-in theme switching
- 🔧 **Developer Tools** - User impersonation for testing
- 🐳 **Docker Ready** - Production Docker setup included
- 🤖 **LLM Integration** - Multi-provider streaming chat (OpenAI, Anthropic, OpenRouter, Groq, Cerebras)
- 💳 **Payments** - Stripe integration with subscriptions and one-time payments
- 🚨 **Error Tracking** - Comprehensive Sentry-like error monitoring
- 📤 **Notifications** - Centralized email/SMS tracking and management system
- 🎮 **Error Pages** - Custom error pages with retro games (Snake, Space Invaders, Pac-Man, Tetris)

## 🎯 Philosophy

This collection follows an **opinionated approach** with:

### Core Principles

1. **🧪 Test-Driven Development (TDD) - MANDATORY**
   - 🔴 **EVERY feature must have comprehensive tests**
   - 🔴 **90%+ code coverage required - NO EXCEPTIONS**
   - 🔴 **Tests must pass before any code is considered complete**
   - Red-Green-Refactor workflow enforced
   - Co-located test files with source code

2. **📱 Mobile-First Design**
   - Everything must look GREAT on mobile
   - Responsive design is not optional
   - Touch-friendly UI elements

3. **🏗️ Server Actions First**
   - All page interactions use Server Actions
   - API routes only for external integrations
   - Better type safety and CSRF protection

4. **🎨 Skeleton Loading States**
   - NO traditional spinners allowed
   - Comprehensive skeleton components for all async operations
   - Better UX by showing layout structure

5. **🔧 Developer Experience**
   - TypeScript strict mode throughout
   - Comprehensive error tracking and monitoring
   - Development tools for testing and debugging

### Architecture Decisions

- **Database:** SQLite with Drizzle ORM (production-ready, zero-config)
- **Authentication:** Session-based with OAuth support via NextAuth.js
- **Styling:** Tailwind CSS with complete shadcn/ui component library
- **Testing:** Vitest + Testing Library + Playwright (full testing stack)
- **Email:** React Email with SMTP integration and fallbacks
- **Error Handling:** Custom error tracking system with admin dashboard
- **File Storage:** S3 with database fallback for flexibility

## 📁 Project Structure

```
opinionated-next/
├── create-project              # Quick project creator (wrapper)
├── scripts/
│   └── create-project.sh      # Main project creation script
├── nextjs-15.4/               # Next.js 15.4 template
│   ├── README.md              # Template-specific documentation
│   ├── CLAUDE.md              # AI assistant guidelines
│   ├── src/                   # Source code
│   ├── tests/                 # Test files
│   └── ...                    # Template files
└── README.md                  # This file
```

## 🚀 Getting Started

### 1. Create Your Project

```bash
# Clone this repository (if not already done)
git clone <repository-url>
cd opinionated-next

# Create your new project
./create-project
```

### 2. Set Up Your Project

After creation, follow these steps:

```bash
# Navigate to your new project
cd your-project-name

# Copy environment variables template
cp env.example .env

# Configure your environment variables (database, auth, etc.)
nano .env

# Run database migrations
npm run db:generate && npm run db:migrate

# Create admin user
npm run create-admin

# Start development server
npm run dev
```

### 3. Verify Installation

- Visit `http://localhost:3000` to see your application
- Check `/dashboard` for authenticated features
- Review `/demo` pages for examples
- Run `npm run test` to verify all tests pass

## 🧪 Testing Requirements

**CRITICAL:** This starter enforces a zero-tolerance testing policy:

### Mandatory Testing Standards

- **🔴 EVERY feature, page, component, and detail MUST have tests**
- **🔴 ALL tests MUST pass before any code is considered complete**
- **🔴 90%+ code coverage required across ALL code**
- **🔴 TDD workflow mandatory** - write tests first, then implementation

### Testing Stack

- **Unit Tests:** Vitest for functions, utilities, and business logic
- **Component Tests:** Testing Library for React components
- **Integration Tests:** Database operations and API endpoints
- **E2E Tests:** Playwright for critical user flows

### Testing Commands

```bash
npm run test           # Run all tests once
npm run test:watch     # TDD mode - continuous testing
npm run test:ui        # Visual test runner
npm run test:coverage  # Coverage report (must be 90%+)
npm run test:e2e       # End-to-end tests
npm run test:e2e:ui    # E2E tests with visual runner
```

## 🛠️ Development Tools

### User Impersonation

Test as any user in development mode:

```bash
http://localhost:3000/dashboard?token=DEV_TOKEN&user=USER_ID
```

### Database Management

```bash
npm run db:studio      # Visual database explorer
npm run db:generate    # Generate migrations after schema changes
npm run db:migrate     # Apply pending migrations
```

### Admin Features

```bash
npm run create-admin   # Create admin user
npm run reset-admin    # Reset admin password
```

## 📚 Documentation

Each template includes comprehensive documentation:

- **README.md** - User-facing setup and usage guide
- **CLAUDE.md** - AI assistant development guidelines and constraints
- **env.example** - Environment variables with examples and descriptions

## 🔧 Customization

### Adding New Templates

When new Next.js versions are released:

1. Create new directory: `nextjs-X.X/`
2. Set up the new template following the established patterns
3. Update this README with new version information
4. Test the creation script with the new template

### Modifying Existing Templates

Each template is **opinionated** and follows strict conventions:

- Follow established architecture patterns
- Maintain comprehensive test coverage
- Update documentation for any changes
- Ensure mobile responsiveness for all features
- Test with user impersonation middleware

## 🚨 Important Notes

### For AI Assistants

- **READ CLAUDE.md** in each template for specific constraints and guidelines
- **NEVER modify** locked configuration files (tsconfig.json, tailwind.config.js, etc.)
- **ALWAYS run migrations** after database schema changes
- **ALWAYS await params** in Next.js 15+ dynamic routes
- **MAINTAIN 90%+ test coverage** - no exceptions
- **UPDATE documentation** when making any changes

### For Developers

- This is an **OPINIONATED** starter - work within established patterns
- **Testing is mandatory** - no feature is complete without comprehensive tests
- **Mobile-first approach** - everything must work perfectly on mobile
- **Use Server Actions** for page interactions, not API routes
- **Follow TDD workflow** - write tests first, then implement

## 🤝 Contributing

To contribute to these templates:

1. Follow the existing opinionated patterns
2. Write comprehensive tests first (TDD)
3. Ensure mobile responsiveness
4. Update all relevant documentation
5. Test with multiple user roles using impersonation
6. Verify 90%+ test coverage

## 📄 License

MIT License - feel free to use these templates for any project.

---

**🎯 Start building modern, tested, mobile-first Next.js applications with confidence!**