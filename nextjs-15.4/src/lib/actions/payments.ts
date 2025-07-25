'use server';

import { getStripeClient } from '@/lib/payments/stripe-client';
import { getStripeConfig, PRODUCTS } from '@/lib/payments/config';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { users, payments, subscriptions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { CheckoutSession, PaymentIntent, Customer } from '@/lib/payments/types';

export async function createCheckoutSession(
  priceId: string,
  mode: 'payment' | 'subscription' = 'subscription'
): Promise<CheckoutSession> {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const sessionUser = await getSession();
  if (!sessionUser?.id) {
    throw new Error('User not authenticated');
  }

  const [user] = await db.select().from(users).where(eq(users.id, sessionUser.id)).limit(1);
  if (!user) {
    throw new Error('User not found');
  }

  // Get or create Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.createCustomer({
      email: user.email,
      name: user.name || undefined,
      metadata: {
        userId: user.id,
      },
    });
    
    // Update user with Stripe customer ID
    await db.update(users)
      .set({ stripeCustomerId: customer.id })
      .where(eq(users.id, user.id));
    
    customerId = customer.id;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return stripe.createCheckoutSession({
    customerId,
    lineItems: [{
      price: priceId,
      quantity: 1,
    }],
    mode,
    successUrl: `${baseUrl}/demo/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${baseUrl}/demo/payments/cancel`,
    metadata: {
      userId: user.id,
    },
  });
}

export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd'
): Promise<PaymentIntent> {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const sessionUser = await getSession();
  if (!sessionUser?.id) {
    throw new Error('User not authenticated');
  }

  const [user] = await db.select().from(users).where(eq(users.id, sessionUser.id)).limit(1);
  if (!user) {
    throw new Error('User not found');
  }

  return stripe.createPaymentIntent({
    amount,
    currency,
    customerId: user.stripeCustomerId || undefined,
    metadata: {
      userId: user.id,
    },
  });
}

export async function getCustomerPaymentMethods() {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const sessionUser = await getSession();
  if (!sessionUser?.id) {
    throw new Error('User not authenticated');
  }

  const [user] = await db.select().from(users).where(eq(users.id, sessionUser.id)).limit(1);
  if (!user?.stripeCustomerId) {
    return [];
  }

  return stripe.listPaymentMethods(user.stripeCustomerId);
}

export async function cancelSubscription(subscriptionId: string) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const sessionUser = await getSession();
  if (!sessionUser?.id) {
    throw new Error('User not authenticated');
  }

  // Verify the subscription belongs to the user
  const [sub] = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.id, subscriptionId))
    .limit(1);
    
  if (!sub || sub.userId !== sessionUser.id) {
    throw new Error('Subscription not found');
  }

  // Cancel on Stripe
  const canceledSub = await stripe.cancelSubscription(sub.stripeSubscriptionId!);
  
  // Update database
  await db.update(subscriptions)
    .set({ 
      status: 'canceled',
      cancelAtPeriodEnd: true,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscriptionId));

  return canceledSub;
}

export async function getActiveSubscription() {
  const sessionUser = await getSession();
  if (!sessionUser?.id) {
    return null;
  }

  const [sub] = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, sessionUser.id))
    .limit(1);

  return sub;
}

export async function getPaymentHistory() {
  const sessionUser = await getSession();
  if (!sessionUser?.id) {
    throw new Error('User not authenticated');
  }

  const paymentHistory = await db.select()
    .from(payments)
    .where(eq(payments.userId, sessionUser.id))
    .orderBy(desc(payments.createdAt));

  return paymentHistory;
}

export async function getAvailableProducts() {
  const config = getStripeConfig();
  if (!config) {
    return [];
  }

  return PRODUCTS;
}

export async function isPaymentsEnabled() {
  return getStripeConfig() !== null;
}