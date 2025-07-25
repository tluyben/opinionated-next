'use client';

import React from 'react';
import { logError } from '@/lib/error-tracking/client-logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void; errorId?: string }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    try {
      // Log the error (userId will be determined server-side via cookies)
      const errorId = await logError(
        error.name || 'React Error',
        error.message,
        {
          level: 'error',
          stack: error.stack,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
          tags: ['react-error-boundary'],
          metadata: {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
            timestamp: new Date().toISOString()
          }
        }
      );

      this.setState({ errorId: errorId || undefined });
      
      console.error('Error caught by boundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
      console.error('Original error:', error);
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error} 
            retry={this.retry}
            errorId={this.state.errorId}
          />
        );
      }

      return <DefaultErrorFallback error={this.state.error} retry={this.retry} errorId={this.state.errorId} />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  retry: () => void;
  errorId?: string;
}

function DefaultErrorFallback({ error, retry, errorId }: DefaultErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Error Details:</p>
            <p className="text-sm text-muted-foreground font-mono">
              {error.message}
            </p>
            {errorId && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {errorId}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button onClick={retry} variant="default" className="flex-1">
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="flex-1"
            >
              Reload Page
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="text-sm cursor-pointer text-muted-foreground hover:text-foreground">
                Stack Trace (Development)
              </summary>
              <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for manually reporting errors
export function useErrorReporting() {
  return {
    reportError: async (error: Error, context?: {
      level?: 'error' | 'warning' | 'info' | 'debug';
      tags?: string[];
      metadata?: Record<string, any>;
    }) => {
      try {
        return await logError(
          error.name || 'Manual Report',
          error.message,
          {
            level: context?.level || 'error',
            stack: error.stack,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
            tags: [...(context?.tags || []), 'manual-report'],
            metadata: {
              ...context?.metadata,
              timestamp: new Date().toISOString(),
              manualReport: true
            }
          }
        );
      } catch (loggingError) {
        console.error('Failed to report error:', loggingError);
        console.error('Original error:', error);
        return null;
      }
    }
  };
}