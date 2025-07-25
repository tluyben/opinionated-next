import { getStripeConfig } from './config';
import type { 
  CheckoutSession, 
  PaymentIntent, 
  Subscription, 
  Customer,
  PaymentMethod,
  WebhookEvent 
} from './types';

// Since we can't install @stripe/stripe-js, we'll create a minimal Stripe client
// This uses Stripe's API directly via fetch

class StripeClient {
  private secretKey: string;
  private apiVersion = '2023-10-16';
  private baseUrl = 'https://api.stripe.com/v1';

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    data?: Record<string, any>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.secretKey}`,
      'Stripe-Version': this.apiVersion,
    };

    let body: string | undefined;
    
    if (data && method !== 'GET') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      body = new URLSearchParams(this.flattenObject(data)).toString();
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Stripe API error');
    }

    return response.json();
  }

  private flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}[${key}]` : key;
      
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(acc, this.flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            Object.assign(acc, this.flattenObject(item, `${newKey}[${index}]`));
          } else {
            acc[`${newKey}[${index}]`] = String(item);
          }
        });
      } else if (value !== undefined && value !== null) {
        acc[newKey] = String(value);
      }
      
      return acc;
    }, {} as Record<string, string>);
  }

  // Checkout Sessions
  async createCheckoutSession(params: {
    customerId?: string;
    customerEmail?: string;
    lineItems: Array<{
      price: string;
      quantity: number;
    }>;
    mode: 'payment' | 'subscription';
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<CheckoutSession> {
    const data = {
      customer: params.customerId,
      customer_email: params.customerEmail,
      line_items: params.lineItems.map(item => ({
        price: item.price,
        quantity: item.quantity,
      })),
      mode: params.mode,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
    };

    const session = await this.request<any>('/checkout/sessions', 'POST', data);
    
    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  // Payment Intents
  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentIntent> {
    const data = {
      amount: params.amount,
      currency: params.currency,
      customer: params.customerId,
      metadata: params.metadata,
    };

    const intent = await this.request<any>('/payment_intents', 'POST', data);
    
    return {
      id: intent.id,
      clientSecret: intent.client_secret,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
    };
  }

  // Customers
  async createCustomer(params: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  }): Promise<Customer> {
    const data = {
      email: params.email,
      name: params.name,
      metadata: params.metadata,
    };

    const customer = await this.request<any>('/customers', 'POST', data);
    
    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      metadata: customer.metadata,
    };
  }

  async getCustomer(customerId: string): Promise<Customer> {
    const customer = await this.request<any>(`/customers/${customerId}`);
    
    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      metadata: customer.metadata,
    };
  }

  // Subscriptions
  async getSubscription(subscriptionId: string): Promise<Subscription> {
    const sub = await this.request<any>(`/subscriptions/${subscriptionId}`);
    
    return {
      id: sub.id,
      customerId: sub.customer,
      priceId: sub.items.data[0]?.price.id,
      status: sub.status,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const sub = await this.request<any>(
      `/subscriptions/${subscriptionId}`,
      'POST',
      { cancel_at_period_end: true }
    );
    
    return {
      id: sub.id,
      customerId: sub.customer,
      priceId: sub.items.data[0]?.price.id,
      status: sub.status,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  }

  // Payment Methods
  async listPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    const response = await this.request<any>(
      `/payment_methods?customer=${customerId}&type=card`
    );
    
    return response.data.map((pm: any) => ({
      id: pm.id,
      type: pm.type,
      card: pm.card ? {
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
      } : undefined,
    }));
  }

  // Webhook signature verification
  static constructEvent(
    payload: string,
    signature: string,
    secret: string
  ): WebhookEvent {
    // Simple webhook signature verification
    // In production, you should use the official Stripe SDK for this
    const crypto = require('crypto');
    
    const elements = signature.split(',');
    let timestamp = '';
    let signatures: string[] = [];
    
    for (const element of elements) {
      const [key, value] = element.split('=');
      if (key === 't') {
        timestamp = value;
      } else if (key === 'v1') {
        signatures.push(value);
      }
    }
    
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');
    
    const isValid = signatures.some(sig => sig === expectedSignature);
    
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }
    
    return JSON.parse(payload) as WebhookEvent;
  }
}

// Export a singleton instance
let stripeClient: StripeClient | null = null;

export function getStripeClient(): StripeClient | null {
  if (stripeClient) return stripeClient;
  
  const config = getStripeConfig();
  if (!config) return null;
  
  stripeClient = new StripeClient(config.secretKey);
  return stripeClient;
}