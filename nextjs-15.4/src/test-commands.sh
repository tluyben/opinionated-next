#!/bin/bash

# Test Commands for Opinionated Next.js Starter
# Since package.json is locked, use these commands directly

# Unit/Integration Tests
echo "Running unit/integration tests..."
npx vitest run

# Watch mode for TDD
# npx vitest

# UI mode for debugging tests
# npx vitest --ui

# Coverage report
# npx vitest run --coverage

# E2E tests
# npx playwright test

# E2E tests with UI
# npx playwright test --ui

# Install Playwright browsers (first time only)
# npx playwright install