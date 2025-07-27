#!/bin/bash

# Opinionated Next.js Starter - Project Creator
# Creates a new project from an existing version template

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}🚀 Opinionated Next.js Starter - Project Creator${NC}"
echo "=================================================="

# Function to validate project name
validate_project_name() {
    local name="$1"
    
    # Check if empty
    if [[ -z "$name" ]]; then
        echo -e "${RED}❌ Project name cannot be empty${NC}"
        return 1
    fi
    
    # Check if it matches GitHub repository naming rules
    if [[ ! "$name" =~ ^[a-zA-Z0-9._-]+$ ]]; then
        echo -e "${RED}❌ Project name can only contain letters, numbers, dots, hyphens, and underscores${NC}"
        return 1
    fi
    
    # Check if it starts with a letter, number, or underscore
    if [[ ! "$name" =~ ^[a-zA-Z0-9_] ]]; then
        echo -e "${RED}❌ Project name must start with a letter, number, or underscore${NC}"
        return 1
    fi
    
    # Check if it ends with a letter, number, or underscore
    if [[ ! "$name" =~ [a-zA-Z0-9_]$ ]]; then
        echo -e "${RED}❌ Project name must end with a letter, number, or underscore${NC}"
        return 1
    fi
    
    # Check length (GitHub limit is 100 characters)
    if [[ ${#name} -gt 100 ]]; then
        echo -e "${RED}❌ Project name must be 100 characters or less${NC}"
        return 1
    fi
    
    # Check if directory already exists
    if [[ -d "$PROJECT_ROOT/$name" ]]; then
        echo -e "${RED}❌ Directory '$name' already exists${NC}"
        return 1
    fi
    
    return 0
}

# Function to get available versions
get_available_versions() {
    local versions=()
    for dir in "$PROJECT_ROOT"/nextjs-*; do
        if [[ -d "$dir" ]]; then
            local version=$(basename "$dir" | sed 's/nextjs-//')
            versions+=("$version")
        fi
    done
    echo "${versions[@]}"
}

# Get available versions
echo -e "${YELLOW}📋 Scanning for available Next.js versions...${NC}"
AVAILABLE_VERSIONS=($(get_available_versions))

if [[ ${#AVAILABLE_VERSIONS[@]} -eq 0 ]]; then
    echo -e "${RED}❌ No Next.js versions found in $PROJECT_ROOT${NC}"
    echo "Expected directories like: nextjs-15.4, nextjs-16.0, etc."
    exit 1
fi

echo -e "${GREEN}✅ Found ${#AVAILABLE_VERSIONS[@]} available version(s):${NC}"
for i in "${!AVAILABLE_VERSIONS[@]}"; do
    echo "  $((i+1)). Next.js ${AVAILABLE_VERSIONS[i]}"
done

# Select version
echo ""
while true; do
    read -p "Select a version (1-${#AVAILABLE_VERSIONS[@]}): " version_choice
    
    if [[ "$version_choice" =~ ^[0-9]+$ ]] && [[ "$version_choice" -ge 1 ]] && [[ "$version_choice" -le ${#AVAILABLE_VERSIONS[@]} ]]; then
        SELECTED_VERSION="${AVAILABLE_VERSIONS[$((version_choice-1))]}"
        break
    else
        echo -e "${RED}❌ Please enter a number between 1 and ${#AVAILABLE_VERSIONS[@]}${NC}"
    fi
done

echo -e "${GREEN}✅ Selected: Next.js $SELECTED_VERSION${NC}"

# Get project name
echo ""
while true; do
    read -p "Enter your project name (GitHub-compatible): " project_name
    
    if validate_project_name "$project_name"; then
        echo -e "${GREEN}✅ Project name '$project_name' is valid${NC}"
        break
    fi
done

# Confirm before proceeding
echo ""
echo -e "${YELLOW}📝 Project Summary:${NC}"
echo "  Source:      nextjs-$SELECTED_VERSION"
echo "  Destination: $project_name"
echo "  Location:    $PROJECT_ROOT/$project_name"
echo ""

read -p "Proceed with project creation? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏹️  Project creation cancelled${NC}"
    exit 0
fi

# Start project creation
echo ""
echo -e "${BLUE}🔄 Creating project '$project_name'...${NC}"

# Step 1: Copy the source directory
echo -e "${YELLOW}📁 Copying nextjs-$SELECTED_VERSION to $project_name...${NC}"
cp -r "$PROJECT_ROOT/nextjs-$SELECTED_VERSION" "$PROJECT_ROOT/$project_name"

# Step 2: Change to the new project directory
cd "$PROJECT_ROOT/$project_name"

# Step 3: Update package.json name
echo -e "${YELLOW}📝 Updating package.json name...${NC}"
if [[ -f "package.json" ]]; then
    # Use sed to replace the name field in package.json
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/\"name\": \".*\"/\"name\": \"$project_name\"/" package.json
    else
        # Linux
        sed -i "s/\"name\": \".*\"/\"name\": \"$project_name\"/" package.json
    fi
    echo -e "${GREEN}✅ Updated package.json name to '$project_name'${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: package.json not found${NC}"
fi

# Step 4: Remove node_modules if it exists
if [[ -d "node_modules" ]]; then
    echo -e "${YELLOW}🗑️  Removing existing node_modules...${NC}"
    rm -rf node_modules
fi

# Step 5: Remove package-lock.json if it exists
if [[ -f "package-lock.json" ]]; then
    echo -e "${YELLOW}🗑️  Removing existing package-lock.json...${NC}"
    rm -f package-lock.json
fi

# Step 6: Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Step 7: Run security audit
echo -e "${YELLOW}🔒 Running security audit...${NC}"
npm audit fix || echo -e "${YELLOW}⚠️  Some vulnerabilities may remain - check npm audit output${NC}"

# Step 8: Initialize git repository
echo -e "${YELLOW}📚 Initializing git repository...${NC}"
git init

# Step 9: Add all files and create initial commit
echo -e "${YELLOW}📝 Creating initial commit...${NC}"
git add .
git commit -m "First commit

🚀 Created new project '$project_name' from opinionated-next template
📦 Based on Next.js $SELECTED_VERSION starter
🎯 Includes: TypeScript, Tailwind, shadcn/ui, Authentication, Database, Testing
🧪 Ready for Test-Driven Development with comprehensive test suite

Generated with opinionated-next project creator"

# Step 10: Final verification
echo ""
echo -e "${GREEN}🎉 Project '$project_name' created successfully!${NC}"
echo ""
echo -e "${BLUE}📋 What's included:${NC}"
echo "  ✅ Next.js $SELECTED_VERSION with TypeScript"
echo "  ✅ All 45+ shadcn/ui components pre-installed"
echo "  ✅ Authentication system with OAuth support"
echo "  ✅ SQLite database with Drizzle ORM"
echo "  ✅ Comprehensive testing setup (Vitest + Playwright)"
echo "  ✅ Error pages with retro games"
echo "  ✅ Payment processing (Stripe)"
echo "  ✅ LLM integration support"
echo "  ✅ Email/SMS functionality"
echo "  ✅ Docker configuration"
echo "  ✅ Git repository initialized"
echo ""
echo -e "${BLUE}🚀 Next steps:${NC}"
echo "  1. cd $project_name"
echo "  2. cp env.example .env"
echo "  3. Configure your environment variables"
echo "  4. npm run db:generate && npm run db:migrate"
echo "  5. npm run create-admin"
echo "  6. npm run dev"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC}"
echo "  • README.md - User documentation"
echo "  • CLAUDE.md - Development guidelines"
echo "  • See /demo pages for feature examples"
echo ""
echo -e "${RED}🧪 IMPORTANT: Remember to write tests for all new features!${NC}"
echo -e "${RED}🔴 90%+ test coverage required - No exceptions!${NC}"
echo ""
echo -e "${GREEN}✨ Happy coding!${NC}"