import { verifyEmailTokenOnly } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { EmailVerificationForm } from '@/components/auth/email-verification-form';

interface VerifyEmailPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;

  // If no token provided, show error
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="mx-auto max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Invalid Verification Link</h1>
            <p className="text-muted-foreground">
              The verification link is invalid or missing. Please check your email for the correct link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Attempt to verify the email automatically (without creating session)
  const result = await verifyEmailTokenOnly(token);

  if (result.success) {
    // Show success page with session creation form
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="mx-auto max-w-md space-y-6">
          <EmailVerificationForm token={token} success={true} userId={result.userId} />
        </div>
      </div>
    );
  }

  // Show error form if verification failed
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="mx-auto max-w-md space-y-6">
        <EmailVerificationForm token={token} error={result.error} />
      </div>
    </div>
  );
}