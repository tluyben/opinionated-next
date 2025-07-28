import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initializeEnhancedErrorTracking } from './enhanced-client-handler';

// Mock the dependencies
vi.mock('./client-logger', () => ({
  logError: vi.fn()
}));

vi.mock('./global-handler', () => ({
  initializeGlobalErrorHandling: vi.fn()
}));

// Mock window APIs
const mockFetch = vi.fn();
const mockConsoleError = vi.fn();
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};

global.fetch = mockFetch;
Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true
});

describe('Enhanced Error Tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window and document
    Object.defineProperty(global, 'window', {
      value: {
        fetch: mockFetch,
        addEventListener: vi.fn(),
        location: { href: 'http://localhost:3000/test' },
        innerWidth: 1920,
        innerHeight: 1080,
        navigator: { userAgent: 'test-agent' },
        performance: {
          memory: {
            usedJSHeapSize: 1000000,
            totalJSHeapSize: 2000000,
            jsHeapSizeLimit: 4000000
          },
          timing: {
            domContentLoadedEventEnd: 1000,
            loadEventEnd: 2000,
            navigationStart: 0
          }
        },
        XMLHttpRequest: function() {
          this.addEventListener = vi.fn();
          this.status = 200;
          this.statusText = 'OK';
        }
      },
      writable: true
    });

    Object.defineProperty(global, 'document', {
      value: {
        addEventListener: vi.fn(),
        hidden: false
      },
      writable: true
    });

    Object.defineProperty(global, 'console', {
      value: {
        error: mockConsoleError,
        log: vi.fn()
      },
      writable: true
    });

    // Reset XMLHttpRequest prototype
    global.XMLHttpRequest = function() {
      this.addEventListener = vi.fn();
      this.status = 200;
      this.statusText = 'OK';
    } as any;
    
    global.XMLHttpRequest.prototype = {
      open: vi.fn(),
      send: vi.fn(),
      addEventListener: vi.fn()
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes enhanced error tracking without errors', () => {
    expect(() => {
      initializeEnhancedErrorTracking();
    }).not.toThrow();
  });

  it('sets up session ID', () => {
    mockSessionStorage.getItem.mockReturnValue(null);
    
    initializeEnhancedErrorTracking();
    
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'error-tracking-session-id',
      expect.stringMatching(/^session_\d+_[a-z0-9]+$/)
    );
  });

  it('reuses existing session ID', () => {
    const existingSessionId = 'existing-session-123';
    mockSessionStorage.getItem.mockReturnValue(existingSessionId);
    
    initializeEnhancedErrorTracking();
    
    // Should not create a new session ID
    expect(mockSessionStorage.setItem).not.toHaveBeenCalledWith(
      'error-tracking-session-id',
      expect.any(String)
    );
  });

  it('intercepts fetch requests', async () => {
    const { logError } = await import('./client-logger');
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    initializeEnhancedErrorTracking();

    // Trigger a fetch request
    try {
      await fetch('https://example.com/api/test');
    } catch (error) {
      // Expected to be caught
    }

    expect(logError).toHaveBeenCalledWith(
      'Network Request Failed',
      expect.stringContaining('HTTP 404 Not Found'),
      expect.objectContaining({
        level: 'warning',
        tags: ['network-error', 'fetch'],
        metadata: expect.objectContaining({
          httpStatus: 404,
          httpStatusText: 'Not Found',
          requestUrl: 'https://example.com/api/test',
          networkError: true
        })
      })
    );
  });

  it('intercepts fetch network failures', async () => {
    const { logError } = await import('./client-logger');
    const networkError = new Error('Network failure');
    mockFetch.mockRejectedValue(networkError);

    initializeEnhancedErrorTracking();

    try {
      await fetch('https://example.com/api/test');
    } catch (error) {
      // Expected to fail
    }

    expect(logError).toHaveBeenCalledWith(
      'Network Request Failed',
      expect.stringContaining('Network error: Network failure'),
      expect.objectContaining({
        level: 'error',
        stack: networkError.stack,
        tags: ['network-error', 'fetch', 'network-failure'],
        metadata: expect.objectContaining({
          requestUrl: 'https://example.com/api/test',
          networkFailure: true,
          errorType: 'Error'
        })
      })
    );
  });

  it('intercepts console errors', async () => {
    const { logError } = await import('./client-logger');
    
    initializeEnhancedErrorTracking();

    // Trigger a console error
    console.error('Test error message');

    expect(logError).toHaveBeenCalledWith(
      'Console Error',
      'Test error message',
      expect.objectContaining({
        level: 'error',
        tags: ['console-error'],
        metadata: expect.objectContaining({
          consoleArgs: ['Test error message'],
          consoleError: true
        })
      })
    );
  });

  it('tracks user interactions', () => {
    initializeEnhancedErrorTracking();

    // Get the click event listener
    const documentAddEventListener = document.addEventListener as any;
    expect(documentAddEventListener).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
      { passive: true }
    );

    // Simulate a click event
    const clickHandler = documentAddEventListener.mock.calls.find(
      call => call[0] === 'click'
    )[1];

    const mockEvent = {
      target: {
        tagName: 'BUTTON',
        className: 'test-button',
        id: 'test-id'
      }
    };

    clickHandler(mockEvent);

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'error-tracking-last-interaction',
      expect.stringContaining('"type":"click"')
    );
  });

  it('tracks page visibility changes', () => {
    initializeEnhancedErrorTracking();

    // Get the visibility change listener
    const documentAddEventListener = document.addEventListener as any;
    expect(documentAddEventListener).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    );

    // Simulate page becoming hidden
    const visibilityHandler = documentAddEventListener.mock.calls.find(
      call => call[0] === 'visibilitychange'
    )[1];

    // Mock document.hidden as true
    Object.defineProperty(document, 'hidden', {
      value: true,
      writable: true
    });

    visibilityHandler();

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'error-tracking-hidden-at',
      expect.stringMatching(/^\d+$/)
    );
  });

  it('includes performance data in error context', async () => {
    const { logError } = await import('./client-logger');
    
    initializeEnhancedErrorTracking();

    // Trigger a console error to check context
    console.error('Test error for context');

    expect(logError).toHaveBeenCalledWith(
      'Console Error',
      'Test error for context',
      expect.objectContaining({
        userAgent: 'test-agent',
        url: 'http://localhost:3000/test',
        viewport: '1920x1080',
        performance: expect.objectContaining({
          memory: expect.objectContaining({
            usedJSHeapSize: 1000000,
            totalJSHeapSize: 2000000,
            jsHeapSizeLimit: 4000000
          }),
          timing: expect.objectContaining({
            domContentLoadedEventEnd: 1000,
            loadEventEnd: 2000,
            navigationStart: 0
          })
        })
      })
    );
  });
});