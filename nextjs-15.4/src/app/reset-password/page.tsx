import { ResetPasswordForm } from '@/components/auth/reset-password-form';

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
          <p className="text-muted-foreground">
            This password reset link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}