import { logError } from './logger';
import { headers } from 'next/headers';

// Server-side error handler
export async function handleServerError(
  error: Error,
  context: {
    userId?: string;
    action?: string;
    level?: 'error' | 'warning' | 'info' | 'debug';
    tags?: string[];
    metadata?: Record<string, any>;
  } = {}
): Promise<string | null> {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || undefined;
    const referer = headersList.get('referer') || undefined;

    const { userId, action, level = 'error', tags = [], metadata = {} } = context;

    return await logError(
      error.name || 'Server Error',
      error.message,
      {
        level,
        stack: error.stack,
        url: referer,
        userAgent,
        userId,
        tags: [...tags, 'server-error', ...(action ? [`action:${action}`] : [])],
        metadata: {
          ...metadata,
          serverSide: true,
          action,
          timestamp: new Date().toISOString(),
          headers: {
            userAgent,
            referer,
            ...(process.env.NODE_ENV === 'development' && {
              // Include more headers in development
              host: headersList.get('host'),
              accept: headersList.get('accept'),
            })
          }
        }
      }
    );
  } catch (loggingError) {
    console.error('Failed to log server error:', loggingError);
    console.error('Original error:', error);
    return null;
  }
}

// Wrapper for server actions to catch and log errors
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  actionName?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      await handleServerError(err, {
        action: actionName || fn.name,
        tags: ['server-action'],
        metadata: {
          args: process.env.NODE_ENV === 'development' ? args : undefined
        }
      });
      
      throw error; // Re-throw to maintain original behavior
    }
  };
}

// Wrapper for API routes to catch and log errors
export function withApiErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  routeName?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      await handleServerError(err, {
        action: routeName || 'api-route',
        tags: ['api-route'],
        metadata: {
          route: routeName
        }
      });
      
      throw error; // Re-throw to maintain original behavior
    }
  };
}

// Global uncaught exception handler for Node.js
export function initializeServerErrorHandling() {
  if (typeof window !== 'undefined') {
    return; // Only run on server
  }

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    
    try {
      await logError(
        'Uncaught Exception',
        error.message,
        {
          level: 'error',
          stack: error.stack,
          tags: ['uncaught-exception', 'critical'],
          metadata: {
            critical: true,
            uncaughtException: true,
            timestamp: new Date().toISOString()
          }
        }
      );
    } catch (loggingError) {
      console.error('Failed to log uncaught exception:', loggingError);
    }
    
    // Exit gracefully
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    
    try {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      
      await logError(
        'Unhandled Promise Rejection',
        error.message,
        {
          level: 'error',
          stack: error.stack,
          tags: ['unhandled-rejection', 'critical'],
          metadata: {
            critical: true,
            unhandledRejection: true,
            reason: String(reason),
            timestamp: new Date().toISOString()
          }
        }
      );
    } catch (loggingError) {
      console.error('Failed to log unhandled rejection:', loggingError);
    }
  });

  console.log('Server error handling initialized');
}

// Utility to manually log server-side issues
export async function reportServerError(
  message: string,
  options: {
    level?: 'error' | 'warning' | 'info' | 'debug';
    tags?: string[];
    metadata?: Record<string, any>;
    userId?: string;
  } = {}
) {
  const { level = 'error', tags = [], metadata = {}, userId } = options;
  
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || undefined;
    const referer = headersList.get('referer') || undefined;

    return await logError(
      'Server Report',
      message,
      {
        level,
        url: referer,
        userAgent,
        userId,
        tags: [...tags, 'server-report'],
        metadata: {
          ...metadata,
          serverSide: true,
          manualReport: true,
          timestamp: new Date().toISOString()
        }
      }
    );
  } catch (loggingError) {
    console.error('Failed to report server error:', loggingError);
    return null;
  }
}