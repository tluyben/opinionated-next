'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatDistanceToNow, format } from 'date-fns';
import { ArrowLeft, Send, Copy, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { resendNotificationAction } from '@/lib/actions/notifications';
import { useRouter } from 'next/navigation';
import type { NotificationType, NotificationStatus, NotificationCategory } from '@/lib/notifications/service';

interface Notification {
  id: string;
  type: NotificationType;
  status: NotificationStatus;
  recipient: string;
  subject?: string | null;
  content: string;
  htmlContent?: string | null;
  templateId?: string | null;
  templateData?: string | null;
  userId?: string | null;
  sentBy?: string | null;
  category: NotificationCategory;
  priority: string;
  scheduledFor?: Date | null;
  sentAt?: Date | null;
  failureReason?: string | null;
  retryCount: number;
  maxRetries: number;
  providerResponse?: string | null;
  metadata?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationDetailsProps {
  notification: Notification;
}

export function NotificationDetails({ notification }: NotificationDetailsProps) {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleResend = async () => {
    setIsResending(true);
    try {
      const result = await resendNotificationAction(notification.id);
      if (result.success) {
        router.refresh();
      } else {
        alert('Failed to resend notification');
      }
    } catch (error) {
      alert('Error resending notification');
    } finally {
      setIsResending(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getStatusIcon = (status: NotificationStatus) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'bounced':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: NotificationStatus) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'default';
      case 'failed':
      case 'bounced':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'normal':
        return 'text-green-600 dark:text-green-400';
      case 'low':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const canResend = ['failed', 'bounced'].includes(notification.status) || notification.retryCount < notification.maxRetries;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/admin/notifications">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notifications
            </Link>
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold">Notification Details</h1>
            <p className="text-sm text-muted-foreground">ID: {notification.id}</p>
          </div>
        </div>

        {canResend && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                disabled={isResending}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isResending ? 'Resending...' : 'Resend'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Resend Notification</AlertDialogTitle>
                <AlertDialogDescription>
                  This will attempt to resend the notification to {notification.recipient}. 
                  The notification status will be reset and a new delivery attempt will be made.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResend} disabled={isResending}>
                  {isResending ? 'Resending...' : 'Resend'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(notification.status)}
            Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Badge variant={notification.type === 'email' ? 'default' : 'secondary'}>
                {notification.type === 'email' ? '📧' : '📱'} {notification.type.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Badge variant={getStatusBadgeVariant(notification.status)}>
                {notification.status.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Badge variant="outline">{notification.category}</Badge>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Priority</Label>
              <span className={`text-sm font-medium ${getPriorityColor(notification.priority)}`}>
                {notification.priority.toUpperCase()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipient & Content */}
      <Card>
        <CardHeader>
          <CardTitle>Message Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Recipient</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
                {notification.recipient}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(notification.recipient, 'recipient')}
              >
                <Copy className="h-4 w-4" />
                {copied === 'recipient' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {notification.subject && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Subject</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm">
                  {notification.subject}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(notification.subject!, 'subject')}
                >
                  <Copy className="h-4 w-4" />
                  {copied === 'subject' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Content</Label>
            <div className="space-y-2">
              <Textarea
                value={notification.content}
                readOnly
                className="min-h-[120px] font-mono text-sm"
              />
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(notification.content, 'content')}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copied === 'content' ? 'Copied!' : 'Copy Content'}
                </Button>
              </div>
            </div>
          </div>

          {notification.htmlContent && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">HTML Content</Label>
              <div className="space-y-2">
                <Textarea
                  value={notification.htmlContent}
                  readOnly
                  className="min-h-[120px] font-mono text-sm"
                />
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(notification.htmlContent!, 'html')}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    {copied === 'html' ? 'Copied!' : 'Copy HTML'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timing & Delivery */}
      <Card>
        <CardHeader>
          <CardTitle>Timing & Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                <p className="text-sm">{format(new Date(notification.createdAt), 'PPpp')}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>

              {notification.scheduledFor && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Scheduled For</Label>
                  <p className="text-sm">{format(new Date(notification.scheduledFor), 'PPpp')}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.scheduledFor), { addSuffix: true })}
                  </p>
                </div>
              )}

              {notification.sentAt && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Sent</Label>
                  <p className="text-sm">{format(new Date(notification.sentAt), 'PPpp')}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true })}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Retry Count</Label>
                <p className="text-sm">
                  {notification.retryCount} / {notification.maxRetries}
                </p>
              </div>

              {notification.updatedAt && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                  <p className="text-sm">{format(new Date(notification.updatedAt), 'PPpp')}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template & Metadata */}
      {(notification.templateId || notification.templateData || notification.metadata) && (
        <Card>
          <CardHeader>
            <CardTitle>Template & Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notification.templateId && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Template ID</Label>
                <code className="block px-3 py-2 bg-muted rounded-md text-sm font-mono">
                  {notification.templateId}
                </code>
              </div>
            )}

            {notification.templateData && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Template Data</Label>
                <pre className="px-3 py-2 bg-muted rounded-md text-sm font-mono overflow-auto">
                  {JSON.stringify(JSON.parse(notification.templateData), null, 2)}
                </pre>
              </div>
            )}

            {notification.metadata && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Metadata</Label>
                <pre className="px-3 py-2 bg-muted rounded-md text-sm font-mono overflow-auto">
                  {JSON.stringify(JSON.parse(notification.metadata), null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Details */}
      {notification.failureReason && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Error Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Failure Reason</Label>
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <code className="text-sm text-destructive break-all">
                  {notification.failureReason}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Provider Response */}
      {notification.providerResponse && (
        <Card>
          <CardHeader>
            <CardTitle>Provider Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="px-3 py-2 bg-muted rounded-md text-sm font-mono overflow-auto">
              {JSON.stringify(JSON.parse(notification.providerResponse), null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* User Context */}
      {(notification.userId || notification.sentBy) && (
        <Card>
          <CardHeader>
            <CardTitle>User Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notification.userId && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">Target User ID</Label>
                  <code className="block px-3 py-2 bg-muted rounded-md text-sm font-mono">
                    {notification.userId}
                  </code>
                </div>
              )}

              {notification.sentBy && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">Sent By User ID</Label>
                  <code className="block px-3 py-2 bg-muted rounded-md text-sm font-mono">
                    {notification.sentBy}
                  </code>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}