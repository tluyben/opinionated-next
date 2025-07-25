'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStripeConfig } from './config';

// Load Stripe.js dynamically
let stripePromise: Promise<any> | null = null;

function loadStripe() {
  if (stripePromise) return stripePromise;
  
  const config = getStripeConfig();
  if (!config) {
    throw new Error('Stripe is not configured');
  }

  stripePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => {
      if ((window as any).Stripe) {
        resolve((window as any).Stripe(config.publishableKey));
      } else {
        reject(new Error('Stripe.js failed to load'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Stripe.js'));
    document.head.appendChild(script);
  });

  return stripePromise;
}

export function useStripe() {
  const [stripe, setStripe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const config = getStripeConfig();
    if (!config) {
      setError(new Error('Stripe is not configured'));
      setIsLoading(false);
      return;
    }

    loadStripe()
      .then(setStripe)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  const redirectToCheckout = useCallback(async (sessionId: string) => {
    if (!stripe) {
      throw new Error('Stripe is not loaded');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      throw error;
    }
  }, [stripe]);

  const confirmPayment = useCallback(async (clientSecret: string, options?: any) => {
    if (!stripe) {
      throw new Error('Stripe is not loaded');
    }

    return stripe.confirmPayment({
      clientSecret,
      confirmParams: {
        return_url: options?.returnUrl || window.location.origin,
        ...options,
      },
    });
  }, [stripe]);

  return {
    stripe,
    isLoading,
    error,
    redirectToCheckout,
    confirmPayment,
  };
}

export function useElements() {
  const { stripe } = useStripe();
  const [elements, setElements] = useState<any>(null);

  useEffect(() => {
    if (stripe) {
      setElements(stripe.elements());
    }
  }, [stripe]);

  return elements;
}

export function usePaymentElement(elements: any, options?: any) {
  const [paymentElement, setPaymentElement] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!elements) return;

    const element = elements.create('payment', options);
    setPaymentElement(element);

    // Mount to a placeholder div that we'll provide
    const mountPoint = document.getElementById('payment-element');
    if (mountPoint) {
      element.mount(mountPoint);
      element.on('ready', () => setIsReady(true));
    }

    return () => {
      element.destroy();
    };
  }, [elements, options]);

  return { paymentElement, isReady };
}