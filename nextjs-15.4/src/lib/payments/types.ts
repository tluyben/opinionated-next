export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  currency: string;
  paymentMethods: string[];
}

export interface PriceConfig {
  id: string;
  name: string;
  description: string;
  amount: number; // in cents
  currency: string;
  interval?: 'month' | 'year' | 'week' | 'day';
  intervalCount?: number;
  features: string[];
  popular?: boolean;
}

export interface ProductConfig {
  id: string;
  name: string;
  description: string;
  prices: PriceConfig[];
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  priceId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

// Payment providers enum for future extensibility
export type PaymentProvider = 'stripe' | 'paypal' | 'square';

export interface PaymentProviderConfig {
  provider: PaymentProvider;
  enabled: boolean;
  config: any;
}