// Initialize server-side error handling once
import { initializeServerErrorHandling } from './server-handler';

declare global {
  var __errorHandlingInitialized: boolean | undefined;
}

// Only initialize once on server startup
if (typeof window === 'undefined' && !global.__errorHandlingInitialized) {
  initializeServerErrorHandling();
  global.__errorHandlingInitialized = true;
}

export {};