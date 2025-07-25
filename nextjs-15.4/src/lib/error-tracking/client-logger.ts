'use client';

export type ErrorLevel = 'error' | 'warning' | 'info' | 'debug';

export interface ErrorContext {
  url?: string;
  userAgent?: string;
  userId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  stack?: string;
}

export interface LogErrorOptions extends ErrorContext {
  level?: ErrorLevel;
  fingerprint?: string;
}

class ClientErrorLogger {
  async logError(
    title: string,
    message: string,
    options: LogErrorOptions = {}
  ): Promise<string | null> {
    try {
      // Call server action instead of direct database access
      const { logErrorAction } = await import('@/lib/actions/error-tracking');
      
      return await logErrorAction(title, message, options);
    } catch (error) {
      // Fallback: log to console if server action fails
      console.error('Failed to log error via server action:', error);
      console.error('Original error:', { title, message, ...options });
      
      // Try to store in localStorage for retry later
      if (typeof window !== 'undefined') {
        try {
          const pendingErrors = JSON.parse(localStorage.getItem('pending-errors') || '[]');
          pendingErrors.push({
            title,
            message,
            options,
            timestamp: new Date().toISOString()
          });
          // Keep only last 10 errors to avoid localStorage bloat
          if (pendingErrors.length > 10) {
            pendingErrors.splice(0, pendingErrors.length - 10);
          }
          localStorage.setItem('pending-errors', JSON.stringify(pendingErrors));
        } catch (storageError) {
          console.error('Failed to store error in localStorage:', storageError);
        }
      }
      
      return null;
    }
  }

  // Retry any pending errors from localStorage
  async retryPendingErrors(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      const pendingErrors = JSON.parse(localStorage.getItem('pending-errors') || '[]');
      if (pendingErrors.length === 0) return;
      
      const { logErrorAction } = await import('@/lib/actions/error-tracking');
      
      for (const errorData of pendingErrors) {
        try {
          await logErrorAction(errorData.title, errorData.message, errorData.options);
        } catch (error) {
          console.error('Failed to retry pending error:', error);
        }
      }
      
      // Clear pending errors after successful retry
      localStorage.removeItem('pending-errors');
    } catch (error) {
      console.error('Failed to retry pending errors:', error);
    }
  }
}

export const clientErrorLogger = new ClientErrorLogger();

// Convenience functions for client-side use
export const logError = (title: string, message: string, options?: LogErrorOptions) =>
  clientErrorLogger.logError(title, message, options);

export const logWarning = (title: string, message: string, options?: Omit<LogErrorOptions, 'level'>) =>
  clientErrorLogger.logError(title, message, { ...options, level: 'warning' });

export const logInfo = (title: string, message: string, options?: Omit<LogErrorOptions, 'level'>) =>
  clientErrorLogger.logError(title, message, { ...options, level: 'info' });

export const logDebug = (title: string, message: string, options?: Omit<LogErrorOptions, 'level'>) =>
  clientErrorLogger.logError(title, message, { ...options, level: 'debug' });