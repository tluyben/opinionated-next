'use client';

import { useState } from 'react';
import { verifyEmailAction, createSessionFromEmailAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface EmailVerificationFormProps {
  token: string;
  error?: string;
  success?: boolean;
  userId?: string;
}

export function EmailVerificationForm({ token, error: initialError, success: initialSuccess, userId }: EmailVerificationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [success, setSuccess] = useState(initialSuccess || false);
  const router = useRouter();

  const handleRetry = async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      // Create form data for server action
      const formData = new FormData();
      formData.append('token', token);
      
      const result = await verifyEmailAction(formData);
      
      if (result.success) {
        setSuccess(true);
        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError('error' in result ? result.error : 'Verification failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteVerification = async () => {
    if (!userId) {
      setError('User ID is missing. Please try again.');
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      // Create form data for server action with userId (no token verification needed)
      const formData = new FormData();
      formData.append('userId', userId);
      
      const result = await createSessionFromEmailAction(formData);
      
      if (result.success) {
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError('error' in result ? result.error : 'Session creation failed');
        setSuccess(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Email Verified!</CardTitle>
          <CardDescription>
            Your email address has been successfully verified. Click below to complete the sign-in process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button 
            onClick={handleCompleteVerification} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <CardTitle className="text-2xl">Verification Failed</CardTitle>
        <CardDescription>
          There was a problem verifying your email address.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Your verification link may have expired or already been used.
          </p>

          <div className="grid gap-2">
            <Button 
              onClick={handleRetry} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Try Again
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/forgot-password">
                <Mail className="mr-2 h-4 w-4" />
                Request New Verification
              </Link>
            </Button>

            <Button asChild variant="ghost" className="w-full">
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}