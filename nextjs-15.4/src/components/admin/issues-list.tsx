'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Issue } from '@/lib/db/schema';

interface IssuesListProps {
  issues: Issue[];
  currentPage: number;
  filters: {
    status?: string;
    level?: string;
    search?: string;
  };
}

export function IssuesList({ issues, currentPage, filters }: IssuesListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(filters.search || '');

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

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 when filters change
    params.delete('page');
    
    router.push(`/dashboard/admin/issues?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters('search', searchValue);
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(timestamp));
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <Input
                placeholder="Search issues..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full"
              />
            </form>
            
            <div className="flex gap-2">
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => updateFilters('status', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.level || 'all'}
                onValueChange={(value) => updateFilters('level', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Issues List */}
      {issues.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">
              <p>No issues found matching the current filters.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <Card key={issue.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Link 
                  href={`/dashboard/admin/issues/${issue.id}`}
                  className="block space-y-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {levelEmojis[issue.level as keyof typeof levelEmojis]}
                        </span>
                        <h3 className="font-semibold truncate">
                          {issue.title}
                        </h3>
                        {issue.count > 1 && (
                          <Badge variant="outline" className="text-xs">
                            {issue.count}x
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {issue.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          First seen: {formatTimestamp(issue.firstSeenAt)}
                        </span>
                        <span>
                          Last seen: {getTimeAgo(issue.lastSeenAt)}
                        </span>
                        {issue.url && (
                          <span className="truncate max-w-48">
                            {new URL(issue.url).pathname}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <Badge variant={levelColors[issue.level as keyof typeof levelColors]}>
                          {issue.level}
                        </Badge>
                        <Badge variant={statusColors[issue.status as keyof typeof statusColors]}>
                          {issue.status}
                        </Badge>
                      </div>
                      
                      {issue.environment && (
                        <Badge variant="outline" className="text-xs">
                          {issue.environment}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {issues.length === 20 && (
        <div className="flex justify-center gap-2">
          {currentPage > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', String(currentPage - 1));
                router.push(`/dashboard/admin/issues?${params.toString()}`);
              }}
            >
              Previous
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('page', String(currentPage + 1));
              router.push(`/dashboard/admin/issues?${params.toString()}`);
            }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}