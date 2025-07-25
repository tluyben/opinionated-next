'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { updateAdminSettingsAction } from '@/lib/actions/issues';
import { useRouter } from 'next/navigation';
import type { AdminSettings as AdminSettingsType } from '@/lib/db/schema';

interface AdminSettingsProps {
  settings: AdminSettingsType;
}

export function AdminSettings({ settings }: AdminSettingsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(
    Boolean(settings.emailNotificationsEnabled)
  );
  const [notificationLevel, setNotificationLevel] = useState<'error' | 'warning' | 'info' | 'debug'>(
    settings.notificationLevel as 'error' | 'warning' | 'info' | 'debug'
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      try {
        const result = await updateAdminSettingsAction(
          emailNotificationsEnabled,
          notificationLevel as any
        );
        
        if (result.success) {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
          router.refresh();
        }
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    });
  };

  const hasChanges = 
    emailNotificationsEnabled !== Boolean(settings.emailNotificationsEnabled) ||
    notificationLevel !== settings.notificationLevel;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Notifications</CardTitle>
          <CardDescription>
            Configure how and when admin users receive error notifications via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Email Notifications</label>
              <p className="text-sm text-muted-foreground">
                Send email alerts to admin users when errors occur
              </p>
            </div>
            <Switch
              checked={emailNotificationsEnabled}
              onCheckedChange={setEmailNotificationsEnabled}
            />
          </div>

          {emailNotificationsEnabled && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Notification Level</label>
              <Select
                value={notificationLevel}
                onValueChange={(value) => setNotificationLevel(value as 'error' | 'warning' | 'info' | 'debug')}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Error Only</SelectItem>
                  <SelectItem value="warning">Warning and Above</SelectItem>
                  <SelectItem value="info">Info and Above</SelectItem>
                  <SelectItem value="debug">All Levels</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Only send notifications for issues at or above this severity level
              </p>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {process.env.SMTP_HOST ? (
                  <span className="text-green-600">✓ SMTP configured</span>
                ) : (
                  <span className="text-amber-600">⚠ SMTP not configured - notifications will be logged to console</span>
                )}
              </div>
              
              <div className="flex gap-2">
                {saved && (
                  <span className="text-sm text-green-600 flex items-center">
                    Settings saved!
                  </span>
                )}
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || isPending}
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Current system configuration and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Environment:</span>
              <span className="ml-2">{process.env.NODE_ENV || 'development'}</span>
            </div>
            <div>
              <span className="font-medium">Error Tracking:</span>
              <span className="ml-2 text-green-600">Active</span>
            </div>
            <div>
              <span className="font-medium">SMTP Status:</span>
              <span className="ml-2">
                {process.env.SMTP_HOST ? (
                  <span className="text-green-600">Configured</span>
                ) : (
                  <span className="text-amber-600">Not Configured</span>
                )}
              </span>
            </div>
            <div>
              <span className="font-medium">Email Notifications:</span>
              <span className="ml-2">
                {emailNotificationsEnabled ? (
                  <span className="text-green-600">Enabled</span>
                ) : (
                  <span className="text-gray-600">Disabled</span>
                )}
              </span>
            </div>
          </div>

          {!process.env.SMTP_HOST && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 rounded-lg">
              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                SMTP Configuration Required
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                To enable email notifications, configure the following environment variables:
              </p>
              <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1">
                <li>• SMTP_HOST</li>
                <li>• SMTP_PORT</li>
                <li>• SMTP_USER</li>
                <li>• SMTP_PASS</li>
                <li>• SMTP_FROM</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}