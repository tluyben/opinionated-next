'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface IssueStatsProps {
  stats: {
    total: number;
    open: number;
    closed: number;
    resolved: number;
    byLevel: {
      error: number;
      warning: number;
      info: number;
      debug: number;
    };
  };
}

export function IssueStats({ stats }: IssueStatsProps) {
  const levelColors = {
    error: 'destructive',
    warning: 'default',
    info: 'secondary',
    debug: 'outline'
  } as const;

  const statusColors = {
    open: 'destructive',
    closed: 'secondary',
    resolved: 'default'
  } as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
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
            <Badge variant={statusColors.open} className="text-xs">
              Open
            </Badge>
            <span className="font-mono">{stats.open}</span>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant={statusColors.resolved} className="text-xs">
              Resolved
            </Badge>
            <span className="font-mono">{stats.resolved}</span>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant={statusColors.closed} className="text-xs">
              Closed
            </Badge>
            <span className="font-mono">{stats.closed}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">By Level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant={levelColors.error} className="text-xs">
              Error
            </Badge>
            <span className="font-mono">{stats.byLevel.error}</span>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant={levelColors.warning} className="text-xs">
              Warning
            </Badge>
            <span className="font-mono">{stats.byLevel.warning}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{stats.open}</div>
          <p className="text-xs text-muted-foreground">
            Require attention
          </p>
        </CardContent>
      </Card>
    </div>
  );
}