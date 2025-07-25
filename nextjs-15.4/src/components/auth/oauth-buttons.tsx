'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface OAuthButtonsProps {
  callbackUrl?: string;
}

export function OAuthButtons({ callbackUrl = '/dashboard' }: OAuthButtonsProps) {
  const handleOAuthSignIn = (provider: string) => {
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn('google')}
          className="w-full"
          type="button"
        >
          Google
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn('github')}
          className="w-full"
          type="button"
        >
          GitHub
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn('facebook')}
          className="w-full"
          type="button"
        >
          Meta
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn('apple')}
          className="w-full"
          type="button"
        >
          Apple
        </Button>
      </div>
    </div>
  );
}