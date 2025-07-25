'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { Search, RefreshCw, Eye, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { NotificationType, NotificationStatus, NotificationCategory } from '@/lib/notifications/service';

interface Notification {
  id: string;
  type: NotificationType;
  status: NotificationStatus;
  recipient: string;
  subject?: string | null;
  content: string;
  category: NotificationCategory;
  priority: string;
  createdAt: Date;
  sentAt?: Date | null;
  failureReason?: string | null;
  retryCount: number;
  userId?: string | null;
  sentBy?: string | null;
}

interface NotificationsListProps {
  notifications: Notification[];
  currentPage: number;
  filters: {
    type?: string;
    status?: string;
    category?: string;
    search?: string;
  };
}

export function NotificationsList({ notifications, currentPage, filters }: NotificationsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const updateFilters = (newFilters: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // Reset page when filters change
    if (Object.keys(newFilters).some(key => key !== 'page')) {
      params.delete('page');
    }
    
    router.push(`?${params.toString()}`);
  };

  const handleSearch = () => {
    updateFilters({ search: searchInput });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    router.push('/dashboard/admin/notifications');
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

  const getTypeBadgeVariant = (type: NotificationType) => {
    return type === 'email' ? 'default' : 'secondary';
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search recipients, subjects, content..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} size="icon" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => updateFilters({ type: value === 'all' ? undefined : value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="sms">📱 SMS</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => updateFilters({ status: value === 'all' ? undefined : value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => updateFilters({ category: value === 'all' ? undefined : value })}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="auth">Auth</SelectItem>
                  <SelectItem value="error-notification">Error</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleClearFilters}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="text-6xl">📭</div>
                <div className="text-lg font-medium">No notifications found</div>
                <p className="text-muted-foreground">
                  {Object.values(filters).some(f => f) 
                    ? 'Try adjusting your search criteria'
                    : 'No notifications have been sent yet'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getTypeBadgeVariant(notification.type)}>
                        {notification.type === 'email' ? '📧' : '📱'} {notification.type.toUpperCase()}
                      </Badge>
                      
                      <Badge variant={getStatusBadgeVariant(notification.status)}>
                        {notification.status.toUpperCase()}
                      </Badge>
                      
                      <Badge variant="outline">
                        {notification.category}
                      </Badge>
                      
                      <span className={`text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                        {notification.priority.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">To:</span>
                        <span className="text-sm font-mono truncate">{notification.recipient}</span>
                      </div>
                      
                      {notification.subject && (
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium shrink-0">Subject:</span>
                          <span className="text-sm truncate">{notification.subject}</span>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium shrink-0">Content:</span>
                        <span className="text-sm text-muted-foreground line-clamp-2">
                          {notification.content}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>
                        Created {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      
                      {notification.sentAt && (
                        <span>
                          Sent {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true })}
                        </span>
                      )}
                      
                      {notification.retryCount > 0 && (
                        <span className="text-orange-600 dark:text-orange-400">
                          Retries: {notification.retryCount}
                        </span>
                      )}
                    </div>

                    {notification.failureReason && (
                      <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                        <span className="text-xs font-medium text-destructive">Error:</span>
                        <span className="text-xs text-destructive ml-2">{notification.failureReason}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/admin/notifications/${notification.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => updateFilters({ page: String(currentPage - 1) })}
          >
            Previous
          </Button>
          
          <span className="px-4 py-2 text-sm">
            Page {currentPage}
          </span>
          
          <Button
            variant="outline"
            disabled={notifications.length < 20} // Assuming 20 per page
            onClick={() => updateFilters({ page: String(currentPage + 1) })}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}