'use client';

import { useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStripe, useElements, usePaymentElement } from '@/lib/payments/hooks';
import { Loader2 } from 'lucide-react';

interface PaymentFormProps {
  clientSecret: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function PaymentForm({ clientSecret, onSuccess, onError }: PaymentFormProps) {
  const { stripe, confirmPayment } = useStripe();
  const elements = useElements();
  const { paymentElement, isReady } = usePaymentElement(elements, {
    clientSecret,
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !isReady) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error } = await confirmPayment(clientSecret, {
        confirmParams: {
          return_url: `${window.location.origin}/demo/payments/success`,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred');
        onError?.(new Error(error.message));
      } else {
        onSuccess?.();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setErrorMessage(message);
      onError?.(err instanceof Error ? err : new Error(message));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            Enter your payment information to complete the purchase
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* This div will be used to mount the Stripe Payment Element */}
          <div id="payment-element" className="mb-4" />
          
          {errorMessage && (
            <div className="text-sm text-destructive mt-2">
              {errorMessage}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={!stripe || !isReady || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}