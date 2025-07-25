import { StripeConfig, ProductConfig } from './types';

export function getStripeConfig(): StripeConfig | null {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!publishableKey || !secretKey) {
    return null;
  }

  return {
    publishableKey,
    secretKey,
    webhookSecret: webhookSecret || '',
    currency: process.env.STRIPE_CURRENCY || 'usd',
    paymentMethods: (process.env.STRIPE_PAYMENT_METHODS || 'card').split(','),
  };
}

export function isStripeEnabled(): boolean {
  return getStripeConfig() !== null;
}

// Example product configurations - customize these for your app
export const PRODUCTS: ProductConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individuals and small projects',
    prices: [
      {
        id: 'price_starter_monthly',
        name: 'Monthly',
        description: 'Billed monthly',
        amount: 900, // $9.00
        currency: 'usd',
        interval: 'month',
        intervalCount: 1,
        features: [
          '1 User',
          '10 Projects',
          'Basic Support',
          'Export to CSV',
        ],
      },
      {
        id: 'price_starter_yearly',
        name: 'Yearly',
        description: 'Billed yearly (save 20%)',
        amount: 8640, // $86.40 (20% off)
        currency: 'usd',
        interval: 'year',
        intervalCount: 1,
        features: [
          '1 User',
          '10 Projects',
          'Basic Support',
          'Export to CSV',
          '2 months free',
        ],
      },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Great for growing teams and businesses',
    prices: [
      {
        id: 'price_pro_monthly',
        name: 'Monthly',
        description: 'Billed monthly',
        amount: 2900, // $29.00
        currency: 'usd',
        interval: 'month',
        intervalCount: 1,
        features: [
          '5 Users',
          'Unlimited Projects',
          'Priority Support',
          'Advanced Analytics',
          'API Access',
          'Custom Integrations',
        ],
        popular: true,
      },
      {
        id: 'price_pro_yearly',
        name: 'Yearly',
        description: 'Billed yearly (save 20%)',
        amount: 27840, // $278.40 (20% off)
        currency: 'usd',
        interval: 'year',
        intervalCount: 1,
        features: [
          '5 Users',
          'Unlimited Projects',
          'Priority Support',
          'Advanced Analytics',
          'API Access',
          'Custom Integrations',
          '2 months free',
        ],
        popular: true,
      },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    prices: [
      {
        id: 'price_enterprise_monthly',
        name: 'Monthly',
        description: 'Billed monthly',
        amount: 9900, // $99.00
        currency: 'usd',
        interval: 'month',
        intervalCount: 1,
        features: [
          'Unlimited Users',
          'Unlimited Projects',
          'Dedicated Support',
          'Advanced Analytics',
          'API Access',
          'Custom Integrations',
          'SSO/SAML',
          'SLA Guarantee',
          'Custom Training',
        ],
      },
    ],
  },
];