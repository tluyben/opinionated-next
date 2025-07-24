#!/usr/bin/env node

/**
 * Test runner script for the Opinionated Next.js Starter
 * Since package.json is locked, this provides an easy way to run tests
 * 
 * Usage:
 *   node src/scripts/test.js           # Run all tests once
 *   node src/scripts/test.js watch     # Run tests in watch mode
 *   node src/scripts/test.js ui        # Run tests with UI
 *   node src/scripts/test.js coverage  # Run tests with coverage
 *   node src/scripts/test.js e2e       # Run E2E tests
 *   node src/scripts/test.js e2e:ui    # Run E2E tests with UI
 */

const { spawn } = require('child_process');

const command = process.argv[2] || 'run';

const commands = {
  run: ['npx', ['vitest', 'run']],
  watch: ['npx', ['vitest']],
  ui: ['npx', ['vitest', '--ui']],
  coverage: ['npx', ['vitest', 'run', '--coverage']],
  e2e: ['npx', ['playwright', 'test']],
  'e2e:ui': ['npx', ['playwright', 'test', '--ui']],
  'e2e:install': ['npx', ['playwright', 'install']],
};

if (!commands[command]) {
  console.error(`Unknown command: ${command}`);
  console.log('Available commands:');
  Object.keys(commands).forEach(cmd => {
    console.log(`  ${cmd}`);
  });
  process.exit(1);
}

const [cmd, args] = commands[command];
const child = spawn(cmd, args, { stdio: 'inherit', shell: true });

child.on('exit', (code) => {
  process.exit(code);
});