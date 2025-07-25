import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment has been processed successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {session_id && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Session ID:</p>
              <code className="text-xs break-all">{session_id}</code>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>You will receive a confirmation email shortly.</p>
            <p className="mt-2">Thank you for your purchase!</p>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
            <Link href="/demo/payments">
              <Button variant="outline" className="w-full">View More Plans</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}