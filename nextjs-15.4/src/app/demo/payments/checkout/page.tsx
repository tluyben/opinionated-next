'use client';

import { useSearchParams } from 'next/navigation';
import { CheckoutButton } from '@/components/payments/checkout-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const priceId = searchParams.get('price') || '';
  const mode = (searchParams.get('mode') || 'subscription') as 'payment' | 'subscription';

  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
      <Link href="/demo/payments">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pricing
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Complete Your Purchase</CardTitle>
          <CardDescription>
            You will be redirected to Stripe Checkout to complete your {mode === 'subscription' ? 'subscription' : 'payment'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Price ID:</p>
            <code className="text-xs">{priceId}</code>
          </div>

          <CheckoutButton
            priceId={priceId}
            mode={mode}
            className="w-full"
            size="lg"
          >
            Proceed to Checkout
          </CheckoutButton>

          <p className="text-xs text-center text-muted-foreground">
            You will be redirected to a secure Stripe checkout page
          </p>
        </CardContent>
      </Card>
    </div>
  );
}