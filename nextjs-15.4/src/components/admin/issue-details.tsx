'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { updateIssueStatusAction } from '@/lib/actions/issues';
import { useRouter } from 'next/navigation';
import type { Issue } from '@/lib/db/schema';

interface IssueDetailsProps {
  issue: Issue;
}

export function IssueDetails({ issue }: IssueDetailsProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

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

  const levelEmojis = {
    error: '🚨',
    warning: '⚠️',
    info: 'ℹ️',
    debug: '🐛'
  } as const;

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }).format(new Date(timestamp));
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      await updateIssueStatusAction(issue.id, newStatus as any);
      router.refresh();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const metadata = issue.metadata ? JSON.parse(issue.metadata) : {};
  const tags = issue.tags ? JSON.parse(issue.tags) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/admin/issues">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Issues
          </Link>
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {levelEmojis[issue.level as keyof typeof levelEmojis]}
            </span>
            <h1 className="text-2xl font-bold">{issue.title}</h1>
            {issue.count > 1 && (
              <Badge variant="outline">
                {issue.count} occurrences
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={levelColors[issue.level as keyof typeof levelColors]}>
            {issue.level}
          </Badge>
          <Select
            value={issue.status}
            onValueChange={handleStatusChange}
            disabled={updating}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Issue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Error Message</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {issue.message}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issue Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={statusColors[issue.status as keyof typeof statusColors]}>
                {issue.status}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Level</p>
              <Badge variant={levelColors[issue.level as keyof typeof levelColors]}>
                {issue.level}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Environment</p>
              <Badge variant="outline">{issue.environment}</Badge>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">First Seen</p>
              <p className="text-sm">{formatTimestamp(issue.firstSeenAt)}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Seen</p>
              <p className="text-sm">{formatTimestamp(issue.lastSeenAt)}</p>
            </div>
            
            {issue.resolvedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-sm">{formatTimestamp(issue.resolvedAt)}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fingerprint</p>
              <p className="text-xs font-mono break-all">{issue.fingerprint}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stack Trace */}
      {issue.stack && (
        <Card>
          <CardHeader>
            <CardTitle>Stack Trace</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg overflow-auto">
              <pre className="text-xs font-mono whitespace-pre">
                {issue.stack}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Context Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {issue.url && (
          <Card>
            <CardHeader>
              <CardTitle>URL</CardTitle>
            </CardHeader>
            <CardContent>
              <a 
                href={issue.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {issue.url}
              </a>
            </CardContent>
          </Card>
        )}

        {issue.userAgent && (
          <Card>
            <CardHeader>
              <CardTitle>User Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm break-all">{issue.userAgent}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {Object.keys(metadata).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg overflow-auto">
              <pre className="text-xs">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}