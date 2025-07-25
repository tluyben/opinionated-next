import { getAvailableProducts, isPaymentsEnabled, getActiveSubscription } from '@/lib/actions/payments';
import { PricingCard } from '@/components/payments/pricing-card';
import { CheckoutButton } from '@/components/payments/checkout-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export default async function PaymentsDemoPage() {
  const paymentsEnabled = await isPaymentsEnabled();
  const products = await getAvailableProducts();
  const activeSubscription = await getActiveSubscription();

  if (!paymentsEnabled) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Payments Demo</h1>
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Stripe Not Configured</AlertTitle>
          <AlertDescription>
            To enable payments, add your Stripe API keys to the environment variables:
            <pre className="mt-2 text-xs bg-muted p-2 rounded">
              NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
              STRIPE_SECRET_KEY=sk_test_...
              STRIPE_WEBHOOK_SECRET=whsec_... (optional)
            </pre>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payments Demo</h1>
        <p className="text-muted-foreground">
          Test Stripe integration with subscription and one-time payment options
        </p>
      </div>

      <Tabs defaultValue="subscription" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="subscription">Subscription Plans</TabsTrigger>
          <TabsTrigger value="onetime">One-time Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="space-y-4">
                {product.prices
                  .filter(price => price.interval) // Only subscription prices
                  .map((price) => (
                    <PricingCard
                      key={price.id}
                      price={price}
                      productName={product.name}
                      productDescription={product.description}
                      onSelect={async (priceId) => {
                        // This will be handled by the CheckoutButton inside PricingCard
                        window.location.href = `/demo/payments/checkout?price=${priceId}`;
                      }}
                      isCurrentPlan={activeSubscription?.stripePriceId === price.id}
                    />
                  ))}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="onetime">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>One-time Payment Demo</CardTitle>
              <CardDescription>
                Test a single payment flow without subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Premium Package</h3>
                <p className="text-sm text-muted-foreground">
                  Get lifetime access to all premium features
                </p>
                <p className="text-2xl font-bold">$199.00</p>
              </div>
              <CheckoutButton
                priceId="price_onetime_premium"
                mode="payment"
                className="w-full"
              >
                Buy Now
              </CheckoutButton>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-12 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Card Numbers</CardTitle>
            <CardDescription>
              Use these test cards in Stripe Checkout (test mode only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <p>✅ Success: 4242 4242 4242 4242</p>
              <p>❌ Decline: 4000 0000 0000 0002</p>
              <p>🔐 3D Secure: 4000 0025 0000 3155</p>
              <p className="text-xs text-muted-foreground mt-2">
                Use any future expiry date and any 3-digit CVC
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Implementation Guide</CardTitle>
            <CardDescription>
              How to use payments in your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. Simple Checkout Button</h3>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`import { CheckoutButton } from '@/components/payments/checkout-button';

<CheckoutButton priceId="price_xxx" mode="subscription">
  Subscribe Now
</CheckoutButton>`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-2">2. Custom Pricing Cards</h3>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`import { PricingCard } from '@/components/payments/pricing-card';
import { createCheckoutSession } from '@/lib/actions/payments';

<PricingCard
  price={priceConfig}
  productName="Pro Plan"
  productDescription="Best for teams"
  onSelect={async (priceId) => {
    const session = await createCheckoutSession(priceId);
    window.location.href = session.url;
  }}
/>`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-2">3. Server Actions</h3>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`// Available server actions
import {
  createCheckoutSession,
  createPaymentIntent,
  getActiveSubscription,
  cancelSubscription,
  getPaymentHistory,
} from '@/lib/actions/payments';`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}