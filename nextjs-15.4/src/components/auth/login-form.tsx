'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginAction } from '@/lib/actions/auth';
import { OAuthButtons } from './oauth-buttons';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface LoginFormProps {
  error?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing In...' : 'Sign In'}
    </Button>
  );
}

export function LoginForm({ error: urlError }: LoginFormProps) {
  const router = useRouter();
  const [actionError, setActionError] = useState<string>('');

  const handleLogin = async (formData: FormData) => {
    setActionError(''); // Clear previous errors
    const result = await loginAction(formData);
    if (result?.success) {
      console.log('🎉 [CLIENT] Login successful, redirecting to dashboard');
      router.push('/dashboard');
    } else if (result?.error) {
      setActionError(result.error);
    }
  };

  // Use action error if available, otherwise fall back to URL error
  const displayError = actionError || urlError;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleLogin} className="space-y-4">
            {displayError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md">
                {displayError}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>
            <SubmitButton />
          </form>
          
          <div className="mt-6">
            <OAuthButtons callbackUrl="/dashboard" />
          </div>

          <div className="mt-4 text-center text-sm space-y-2">
            <div>
              <Link href="/forgot-password" className="text-primary hover:underline">
                Forgot your password?
              </Link>
            </div>
            <div>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}