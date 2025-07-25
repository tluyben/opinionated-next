import { NextRequest, NextResponse } from 'next/server';
import { getStripeConfig } from '@/lib/payments/config';
import { db } from '@/lib/db';
import { payments, subscriptions, invoices } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

// Stripe webhook event types we handle
const relevantEvents = new Set([
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
]);

export async function POST(request: NextRequest) {
  const config = getStripeConfig();
  if (!config) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !config.webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  try {
    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature, config.webhookSecret);
    
    if (relevantEvents.has(event.type)) {
      await handleWebhookEvent(event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): any {
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
  
  if (!timestamp) {
    throw new Error('Invalid signature: missing timestamp');
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
  
  // Check timestamp to prevent replay attacks (5 minutes tolerance)
  const tolerance = 300; // 5 minutes
  const timestampSeconds = parseInt(timestamp);
  const currentTime = Math.floor(Date.now() / 1000);
  
  if (currentTime - timestampSeconds > tolerance) {
    throw new Error('Webhook timestamp too old');
  }
  
  return JSON.parse(payload);
}

async function handleWebhookEvent(event: any) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object);
      break;
      
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
      
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
      
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object);
      break;
      
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object);
      break;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const userId = paymentIntent.metadata?.userId;
  if (!userId) return;

  await db.insert(payments).values({
    id: nanoid(),
    userId,
    stripePaymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'succeeded',
    description: paymentIntent.description,
    metadata: JSON.stringify(paymentIntent.metadata),
  }).onConflictDoUpdate({
    target: payments.stripePaymentIntentId,
    set: {
      status: 'succeeded',
      updatedAt: new Date(),
    },
  });
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  const userId = paymentIntent.metadata?.userId;
  if (!userId) return;

  await db.insert(payments).values({
    id: nanoid(),
    userId,
    stripePaymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'failed',
    description: paymentIntent.description,
    metadata: JSON.stringify(paymentIntent.metadata),
  }).onConflictDoUpdate({
    target: payments.stripePaymentIntentId,
    set: {
      status: 'failed',
      updatedAt: new Date(),
    },
  });
}

async function handleCheckoutSessionCompleted(session: any) {
  // Session completed successfully
  // If it's a subscription, it will be handled by subscription events
  // If it's a one-time payment, it will be handled by payment_intent events
  console.log('Checkout session completed:', session.id);
}

async function handleSubscriptionUpdate(subscription: any) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await db.insert(subscriptions).values({
    id: nanoid(),
    userId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0]?.price.id,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
    trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    metadata: JSON.stringify(subscription.metadata),
  }).onConflictDoUpdate({
    target: subscriptions.stripeSubscriptionId,
    set: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      updatedAt: new Date(),
    },
  });
}

async function handleSubscriptionDeleted(subscription: any) {
  await db.update(subscriptions)
    .set({ 
      status: 'canceled',
      canceledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  const userId = invoice.metadata?.userId || invoice.subscription_details?.metadata?.userId;
  if (!userId) return;

  const subscriptionId = invoice.subscription;
  let dbSubscriptionId: string | null = null;
  
  if (subscriptionId) {
    const [sub] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
      .limit(1);
    dbSubscriptionId = sub?.id || null;
  }

  await db.insert(invoices).values({
    id: nanoid(),
    userId,
    subscriptionId: dbSubscriptionId,
    stripeInvoiceId: invoice.id,
    invoiceNumber: invoice.number,
    amountDue: invoice.amount_due,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
    status: 'paid',
    paidAt: new Date(invoice.status_transitions.paid_at * 1000),
    dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
    invoicePdf: invoice.invoice_pdf,
  }).onConflictDoUpdate({
    target: invoices.stripeInvoiceId,
    set: {
      status: 'paid',
      amountPaid: invoice.amount_paid,
      paidAt: new Date(invoice.status_transitions.paid_at * 1000),
    },
  });
}

async function handleInvoicePaymentFailed(invoice: any) {
  await db.update(invoices)
    .set({ 
      status: 'open',
    })
    .where(eq(invoices.stripeInvoiceId, invoice.id));
}