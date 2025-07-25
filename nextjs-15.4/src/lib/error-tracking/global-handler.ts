'use client';

import { logError } from './logger';
import { getSession } from '@/lib/auth/session';

let isInitialized = false;

export function initializeGlobalErrorHandling() {
  if (isInitialized || typeof window === 'undefined') {
    return;
  }

  isInitialized = true;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', async (event) => {
    const error = event.reason;
    
    let userId: string | undefined;
    try {
      const session = await getSession();
      userId = session?.id;
    } catch {
      // Ignore session errors in error handler
    }

    try {
      await logError(
        'Unhandled Promise Rejection',
        error?.message || error?.toString() || 'Unknown promise rejection',
        {
          level: 'error',
          stack: error?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          userId,
          tags: ['unhandled-promise'],
          metadata: {
            promiseRejection: true,
            reason: error,
            timestamp: new Date().toISOString()
          }
        }
      );
    } catch (loggingError) {
      console.error('Failed to log unhandled promise rejection:', loggingError);
      console.error('Original error:', error);
    }
  });

  // Handle JavaScript errors
  window.addEventListener('error', async (event) => {
    const { error, message, filename, lineno, colno } = event;
    
    let userId: string | undefined;
    try {
      const session = await getSession();
      userId = session?.id;
    } catch {
      // Ignore session errors in error handler
    }

    try {
      await logError(
        error?.name || 'JavaScript Error',
        message || error?.message || 'Unknown JavaScript error',
        {
          level: 'error',
          stack: error?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          userId,
          tags: ['javascript-error'],
          metadata: {
            filename,
            lineno,
            colno,
            timestamp: new Date().toISOString(),
            errorEvent: true
          }
        }
      );
    } catch (loggingError) {
      console.error('Failed to log JavaScript error:', loggingError);
      console.error('Original error:', error || message);
    }
  });

  // Handle resource loading errors
  window.addEventListener('error', async (event) => {
    const target = event.target as HTMLElement;
    
    // Only handle resource loading errors (img, script, link, etc.)
    if (target && target instanceof HTMLElement && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
      let userId: string | undefined;
      try {
        const session = await getSession();
        userId = session?.id;
      } catch {
        // Ignore session errors in error handler
      }

      try {
        const resourceUrl = (target as any).src || (target as any).href;
        
        await logError(
          'Resource Loading Error',
          `Failed to load ${target.tagName.toLowerCase()}: ${resourceUrl}`,
          {
            level: 'warning',
            url: window.location.href,
            userAgent: navigator.userAgent,
            userId,
            tags: ['resource-error', target.tagName.toLowerCase()],
            metadata: {
              resourceUrl,
              tagName: target.tagName,
              timestamp: new Date().toISOString(),
              resourceError: true
            }
          }
        );
      } catch (loggingError) {
        console.error('Failed to log resource error:', loggingError);
      }
    }
  }, true); // Use capture phase for resource errors

  console.log('Global error handling initialized');
}

// Manual error reporting utility
export async function reportError(
  error: Error | string,
  options: {
    level?: 'error' | 'warning' | 'info' | 'debug';
    tags?: string[];
    metadata?: Record<string, any>;
  } = {}
) {
  const { level = 'error', tags = [], metadata = {} } = options;
  
  let userId: string | undefined;
  try {
    const session = await getSession();
    userId = session?.id;
  } catch {
    // Ignore session errors
  }

  const errorObj = error instanceof Error ? error : new Error(error);
  
  try {
    return await logError(
      errorObj.name || 'Manual Report',
      errorObj.message,
      {
        level,
        stack: errorObj.stack,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        userId,
        tags: [...tags, 'manual-report'],
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          manualReport: true
        }
      }
    );
  } catch (loggingError) {
    console.error('Failed to report error manually:', loggingError);
    console.error('Original error:', error);
    return null;
  }
}