'use client';

import { logError } from './client-logger';

let isInitialized = false;

interface ErrorContext {
  userAgent: string;
  url: string;
  viewport: string;
  timestamp: string;
  sessionId: string;
  performance?: {
    memory?: any;
    timing?: any;
  };
}

// Generate a session ID for this browser session
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('error-tracking-session-id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('error-tracking-session-id', sessionId);
  }
  return sessionId;
}

// Get enhanced context information
function getErrorContext(): ErrorContext {
  if (typeof window === 'undefined') {
    return {
      userAgent: '',
      url: '',
      viewport: '',
      timestamp: new Date().toISOString(),
      sessionId: ''
    };
  }

  const context: ErrorContext = {
    userAgent: navigator.userAgent,
    url: window.location.href,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId()
  };

  // Add performance information if available
  if ('performance' in window) {
    try {
      context.performance = {
        memory: (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : undefined,
        timing: performance.timing ? {
          domContentLoadedEventEnd: performance.timing.domContentLoadedEventEnd,
          loadEventEnd: performance.timing.loadEventEnd,
          navigationStart: performance.timing.navigationStart
        } : undefined
      };
    } catch (error) {
      // Ignore performance API errors
    }
  }

  return context;
}

// Track fetch/XHR errors
function interceptNetworkRequests() {
  // Intercept fetch requests
  if (typeof window !== 'undefined' && window.fetch) {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      try {
        const response = await originalFetch.apply(this, args);
        
        // Log failed HTTP requests
        if (!response.ok) {
          const url = typeof args[0] === 'string' ? args[0] : 
                     (args[0] instanceof Request ? args[0].url : 
                     (args[0] instanceof URL ? args[0].toString() : 'Unknown URL'));
          await logError(
            'Network Request Failed',
            `HTTP ${response.status} ${response.statusText}: ${url}`,
            {
              level: response.status >= 500 ? 'error' : 'warning',
              tags: ['network-error', 'fetch'],
              ...getErrorContext(),
              metadata: {
                httpStatus: response.status,
                httpStatusText: response.statusText,
                requestUrl: url,
                requestMethod: args[1]?.method || 'GET',
                networkError: true
              }
            }
          );
        }
        
        return response;
      } catch (error) {
        // Log network failures (offline, DNS errors, etc.)
        const url = typeof args[0] === 'string' ? args[0] : 
                   (args[0] instanceof Request ? args[0].url : 
                   (args[0] instanceof URL ? args[0].toString() : 'Unknown URL'));
        await logError(
          'Network Request Failed',
          `Network error: ${error instanceof Error ? error.message : 'Unknown error'}: ${url}`,
          {
            level: 'error',
            stack: error instanceof Error ? error.stack : undefined,
            tags: ['network-error', 'fetch', 'network-failure'],
            ...getErrorContext(),
            metadata: {
              requestUrl: url,
              requestMethod: args[1]?.method || 'GET',
              networkFailure: true,
              errorType: error instanceof Error ? error.name : 'Unknown'
            }
          }
        );
        throw error;
      }
    };
  }

  // Intercept XMLHttpRequest
  if (typeof window !== 'undefined' && window.XMLHttpRequest) {
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
      (this as any)._errorTrackingMethod = method;
      (this as any)._errorTrackingUrl = url.toString();
      return (originalXHROpen as any).call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function(data) {
      const xhr = this;
      
      xhr.addEventListener('error', async () => {
        await logError(
          'XHR Request Failed',
          `Network error: ${(xhr as any)._errorTrackingUrl}`,
          {
            level: 'error',
            tags: ['network-error', 'xhr', 'network-failure'],
            ...getErrorContext(),
            metadata: {
              requestUrl: (xhr as any)._errorTrackingUrl,
              requestMethod: (xhr as any)._errorTrackingMethod,
              networkFailure: true
            }
          }
        );
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 400) {
          await logError(
            'XHR Request Failed',
            `HTTP ${xhr.status} ${xhr.statusText}: ${(xhr as any)._errorTrackingUrl}`,
            {
              level: xhr.status >= 500 ? 'error' : 'warning',
              tags: ['network-error', 'xhr'],
              ...getErrorContext(),
              metadata: {
              httpStatus: xhr.status,
                httpStatusText: xhr.statusText,
                requestUrl: (xhr as any)._errorTrackingUrl,
                requestMethod: (xhr as any)._errorTrackingMethod,
                networkError: true
              }
            }
          );
        }
      });

      return originalXHRSend.call(this, data);
    };
  }
}

// Track console errors
function interceptConsoleErrors() {
  if (typeof window === 'undefined') return;

  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Call original console.error first
    originalConsoleError.apply(console, args);
    
    // Only log if it looks like an actual error, not debug logging
    const firstArg = args[0];
    if (firstArg instanceof Error || (typeof firstArg === 'string' && firstArg.toLowerCase().includes('error'))) {
      // Don't double-log errors we already track
      const message = args.join(' ');
      if (!message.includes('Failed to log error') && !message.includes('Error caught by boundary')) {
        logError(
          'Console Error',
          message,
          {
            level: 'error',
            tags: ['console-error'],
            ...getErrorContext(),
            metadata: {
              consoleArgs: args,
              consoleError: true
            }
          }
        ).catch(() => {
          // Ignore logging errors to prevent recursion
        });
      }
    }
  };
}

export function initializeEnhancedErrorTracking() {
  if (isInitialized || typeof window === 'undefined') {
    return;
  }

  isInitialized = true;

  // Initialize basic error tracking first
  const { initializeGlobalErrorHandling } = require('./global-handler');
  initializeGlobalErrorHandling();

  // Add enhanced tracking
  interceptNetworkRequests();
  interceptConsoleErrors();

  // Track page visibility changes (for context)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Store timestamp when page becomes hidden
      sessionStorage.setItem('error-tracking-hidden-at', Date.now().toString());
    }
  });

  // Track user interactions that might lead to errors
  ['click', 'keydown', 'touchstart'].forEach(eventType => {
    document.addEventListener(eventType, (event) => {
      // Store last user interaction for error context
      const target = event.target as HTMLElement;
      sessionStorage.setItem('error-tracking-last-interaction', JSON.stringify({
        type: eventType,
        timestamp: Date.now(),
        target: target ? {
          tagName: target.tagName,
          className: target.className,
          id: target.id
        } : null
      }));
    }, { passive: true });
  });

  console.log('Enhanced error tracking initialized');
}