import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, Trash2 } from 'lucide-react';
import { deleteApiKeyAction, getUserApiKeys } from '@/lib/actions/apikeys';
import { ApiKeyForm } from '@/components/settings/api-key-form';

export default async function SettingsPage() {
  const apiKeys = await getUserApiKeys();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your application preferences and API access.
          </p>
        </div>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>API Keys</span>
            </CardTitle>
            <CardDescription>
              Manage your API keys for programmatic access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Existing API Keys */}
              {apiKeys.map((key) => (
                <div key={key.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{key.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Created on {new Date(key.createdAt).toLocaleDateString()} 
                        {key.lastUsedAt && ` • Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                      </p>
                      <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                        sk_••••••••••••••••••••••••••••
                      </code>
                    </div>
                    <form action={deleteApiKeyAction}>
                      <input type="hidden" name="keyId" value={key.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}

              {apiKeys.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No API keys found. Create your first one below.</p>
                </div>
              )}

              {/* Add New API Key Form */}
              <ApiKeyForm />
            </div>
          </CardContent>
        </Card>

        {/* Application Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Application Preferences</CardTitle>
            <CardDescription>Customize your application experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">SMS Notifications</p>
                      <p className="text-xs text-muted-foreground">
                        Receive notifications via SMS
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Disabled
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Data & Privacy</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Analytics</p>
                      <p className="text-xs text-muted-foreground">
                        Allow anonymous usage analytics
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Data Export</p>
                      <p className="text-xs text-muted-foreground">
                        Download your data
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}