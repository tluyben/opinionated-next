'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { PriceConfig } from '@/lib/payments/types';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  price: PriceConfig;
  productName: string;
  productDescription: string;
  onSelect: (priceId: string) => void;
  isLoading?: boolean;
  isCurrentPlan?: boolean;
}

export function PricingCard({
  price,
  productName,
  productDescription,
  onSelect,
  isLoading,
  isCurrentPlan,
}: PricingCardProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  const intervalText = price.interval
    ? `/ ${price.intervalCount && price.intervalCount > 1 ? `${price.intervalCount} ` : ''}${price.interval}${price.intervalCount && price.intervalCount > 1 ? 's' : ''}`
    : '';

  return (
    <Card className={cn(
      'relative flex flex-col h-full',
      price.popular && 'border-primary shadow-lg scale-105'
    )}>
      {price.popular && (
        <Badge className="absolute -top-2 right-4" variant="default">
          Most Popular
        </Badge>
      )}
      
      <CardHeader>
        <CardTitle className="text-2xl">{productName}</CardTitle>
        <CardDescription>{productDescription}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">{formatPrice(price.amount)}</span>
          <span className="text-muted-foreground ml-2">{intervalText}</span>
        </div>
        {price.description && (
          <p className="text-sm text-muted-foreground mt-2">{price.description}</p>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {price.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          variant={price.popular ? 'default' : 'outline'}
          onClick={() => onSelect(price.id)}
          disabled={isLoading || isCurrentPlan}
        >
          {isCurrentPlan ? 'Current Plan' : 'Get Started'}
        </Button>
      </CardFooter>
    </Card>
  );
}