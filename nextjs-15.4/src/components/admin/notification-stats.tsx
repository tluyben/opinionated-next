'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NotificationStatsProps {
  stats: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
    byType: {
      email: number;
      sms: number;
    };
    byCategory: {
      auth: number;
      'error-notification': number;
      system: number;
      security: number;
      marketing: number;
      reminder: number;
    };
  };
}

export function NotificationStats({ stats }: NotificationStatsProps) {
  const statusColors = {
    sent: 'default',
    failed: 'destructive',
    pending: 'secondary'
  } as const;

  const typeColors = {
    email: 'default',
    sms: 'secondary'
  } as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">By Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant={statusColors.sent} className="text-xs">
              Sent
            </Badge>
            <span className="font-mono">{stats.sent}</span>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant={statusColors.failed} className="text-xs">
              Failed
            </Badge>
            <span className="font-mono">{stats.failed}</span>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant={statusColors.pending} className="text-xs">
              Pending
            </Badge>
            <span className="font-mono">{stats.pending}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">By Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant={typeColors.email} className="text-xs">
              📧 Email
            </Badge>
            <span className="font-mono">{stats.byType.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant={typeColors.sms} className="text-xs">
              📱 SMS
            </Badge>
            <span className="font-mono">{stats.byType.sms}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
          <p className="text-xs text-muted-foreground">
            Need attention
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">By Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {category}
                </Badge>
                <span className="font-mono text-sm">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}