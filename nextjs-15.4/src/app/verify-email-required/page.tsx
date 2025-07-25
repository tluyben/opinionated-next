import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function VerifyEmailRequiredPage() {
  const user = await getSession();
  
  // If not logged in, redirect to login
  if (!user) {
    redirect('/login');
  }
  
  // If email is already verified, redirect to dashboard
  if (user.emailVerified) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-2xl">Email Verification Required</CardTitle>
          <CardDescription>
            Please verify your email address to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              We've sent a verification link to <strong>{user.email}</strong>. 
              Please check your email and click the verification link to continue.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Didn't receive the email? Check your spam folder or request a new verification link.
            </p>

            <div className="grid gap-2">
              <Button asChild className="w-full">
                <Link href="/login">Try Signing In Again</Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/forgot-password">
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </Link>
              </Button>

              <Button asChild variant="ghost" className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}