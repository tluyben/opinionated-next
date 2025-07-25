'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useStripe } from '@/lib/payments/hooks';
import { createCheckoutSession } from '@/lib/actions/payments';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  priceId: string;
  mode?: 'payment' | 'subscription';
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function CheckoutButton({
  priceId,
  mode = 'subscription',
  children = 'Subscribe',
  className,
  variant,
  size,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { redirectToCheckout } = useStripe();
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      
      const session = await createCheckoutSession(priceId, mode);
      
      if (session.url) {
        // Redirect to Stripe Checkout
        window.location.href = session.url;
      } else if (session.sessionId) {
        // Use Stripe.js redirect
        await redirectToCheckout(session.sessionId);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
      variant={variant}
      size={size}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  );
}