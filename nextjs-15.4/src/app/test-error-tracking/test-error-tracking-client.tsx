'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useErrorReporting } from '@/components/error-tracking/error-boundary';
import { reportError } from '@/lib/error-tracking/global-handler';

function ComponentThatThrows(): React.ReactElement {
  throw new Error('This is a deliberate React component error for testing');
}

export function TestErrorTrackingClient() {
  const [showErrorComponent, setShowErrorComponent] = useState(false);
  const { reportError: reportFromHook } = useErrorReporting();

  const triggerJavaScriptError = () => {
    // This will trigger the global error handler
    setTimeout(() => {
      throw new Error('This is a deliberate JavaScript error for testing');
    }, 100);
  };

  const triggerPromiseRejection = () => {
    // This will trigger the unhandled promise rejection handler
    Promise.reject(new Error('This is a deliberate promise rejection for testing'));
  };

  const triggerManualError = async () => {
    try {
      await reportError(new Error('This is a manually reported error for testing'), {
        level: 'error',
        tags: ['manual-test'],
        metadata: { testType: 'manual-report' }
      });
      alert('Manual error reported successfully');
    } catch (error) {
      console.error('Failed to report manual error:', error);
    }
  };

  const triggerHookError = async () => {
    try {
      await reportFromHook(new Error('This is an error reported via hook'), {
        level: 'warning',
        tags: ['hook-test'],
        metadata: { testType: 'hook-report' }
      });
      alert('Hook error reported successfully');
    } catch (error) {
      console.error('Failed to report hook error:', error);
    }
  };

  const triggerNetworkImage = () => {
    // Create an image that will fail to load
    const img = document.createElement('img');
    img.src = 'https://non-existent-domain-12345.com/image.jpg';
    document.body.appendChild(img);
    
    setTimeout(() => document.body.removeChild(img), 5000);
  };

  const triggerFetchError = async () => {
    try {
      // This will trigger a network error
      await fetch('https://non-existent-domain-12345.com/api/test');
    } catch (error) {
      console.log('Fetch error caught (this is expected for testing)');
    }
  };

  const triggerHTTPError = async () => {
    try {
      // This will trigger an HTTP 404 error
      await fetch('/api/non-existent-endpoint');
    } catch (error) {
      console.log('HTTP error caught (this is expected for testing)');
    }
  };

  const triggerConsoleError = () => {
    console.error('This is a test console error for tracking');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Error Tracking Test</h1>
        <p className="text-muted-foreground">
          Test various types of frontend errors to verify they're being tracked
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>React Component Errors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setShowErrorComponent(true)}
              variant="destructive"
            >
              Trigger React Error
            </Button>
            <p className="text-sm text-muted-foreground">
              This will throw an error in a React component and be caught by the Error Boundary
            </p>
            {showErrorComponent && <ComponentThatThrows />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>JavaScript Errors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={triggerJavaScriptError}
              variant="destructive"
            >
              Trigger JS Error
            </Button>
            <p className="text-sm text-muted-foreground">
              This will throw an error in a setTimeout and be caught by the global error handler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Promise Rejections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={triggerPromiseRejection}
              variant="destructive"
            >
              Trigger Promise Rejection
            </Button>
            <p className="text-sm text-muted-foreground">
              This will create an unhandled promise rejection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Loading Errors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={triggerNetworkImage}
              variant="destructive"
            >
              Trigger Resource Error
            </Button>
            <p className="text-sm text-muted-foreground">
              This will try to load a non-existent image resource
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Error Reporting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={triggerManualError}
              variant="outline"
            >
              Report Manual Error
            </Button>
            <p className="text-sm text-muted-foreground">
              This will manually report an error using the global reportError function
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hook-based Reporting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={triggerHookError}
              variant="outline"
            >
              Report via Hook
            </Button>
            <p className="text-sm text-muted-foreground">
              This will report an error using the useErrorReporting hook
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fetch Network Errors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={triggerFetchError}
              variant="destructive"
            >
              Trigger Fetch Error
            </Button>
            <p className="text-sm text-muted-foreground">
              This will try to fetch from a non-existent domain
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>HTTP Status Errors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={triggerHTTPError}
              variant="destructive"
            >
              Trigger HTTP 404
            </Button>
            <p className="text-sm text-muted-foreground">
              This will make a request that returns HTTP 404
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Console Errors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={triggerConsoleError}
              variant="destructive"
            >
              Trigger Console Error
            </Button>
            <p className="text-sm text-muted-foreground">
              This will log an error to the console that gets tracked
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click each button to trigger different types of errors</li>
            <li>Check the browser console for error logs</li>
            <li>Go to <code>/dashboard/admin/issues</code> to see if errors are tracked</li>
            <li>Verify that email notifications are sent (if configured)</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}