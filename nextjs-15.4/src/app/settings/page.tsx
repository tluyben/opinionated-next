import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Key, Trash2, Copy, Shield, TrendingUp, Clock, AlertTriangle, MoreHorizontal, Link } from 'lucide-react';
import { deleteApiKeyAction, getUserApiKeys, getApiKeyStats } from '@/lib/actions/apikeys';
import { ApiKeyForm } from '@/components/settings/api-key-form';

export default async function SettingsPage() {
  const [apiKeys, stats] = await Promise.all([
    getUserApiKeys(),
    getApiKeyStats()
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">API Keys</h1>
            <p className="text-muted-foreground">
              Manage your API keys for secure access to your applications
            </p>
          </div>
          <ApiKeyForm />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Active Keys</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{stats.activeKeys}</div>
                <p className="text-xs text-muted-foreground">Currently active API keys</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Requests Today</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{stats.requestsToday}</div>
                <p className="text-xs text-muted-foreground">API requests made today</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Monthly Usage</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{stats.monthlyUsage}</div>
                <p className="text-xs text-muted-foreground">Requests this month</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Rate Limit Violations</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{stats.rateLimitViolations}</div>
                <p className="text-xs text-muted-foreground">Rate limit hits this month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security and Configuration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Secure Keys</span>
              </div>
              <div className="text-lg font-bold">SHA-256</div>
              <p className="text-xs text-muted-foreground">Cryptographically secure hashing</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Rate Limiting</span>
              </div>
              <div className="text-lg font-bold">1000/hr</div>
              <p className="text-xs text-muted-foreground">Default requests per hour</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Link className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Domain Control</span>
              </div>
              <div className="text-lg font-bold">Restrict</div>
              <p className="text-xs text-muted-foreground">Control access by domain</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Expiration</span>
              </div>
              <div className="text-lg font-bold">Optional</div>
              <p className="text-xs text-muted-foreground">Set expiration dates</p>
            </CardContent>
          </Card>
        </div>

        {/* API Keys Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>
              Create and manage API keys for your applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No API keys found</h3>
                <p className="text-sm">Create your first API key to get started with programmatic access.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Restrictions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            ak_{key.id.substring(0, 8)}••••••••
                          </code>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>1000/hr limit</div>
                          <div className="text-xs text-muted-foreground">
                            {key.lastUsedAt 
                              ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                              : 'Never used'
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">None</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>about {Math.floor((Date.now() - new Date(key.createdAt).getTime()) / (1000 * 60 * 60))} hours ago</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <form action={deleteApiKeyAction} className="inline">
                            <input type="hidden" name="keyId" value={key.id} />
                            <Button type="submit" variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}