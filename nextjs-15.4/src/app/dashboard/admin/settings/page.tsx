import { requireAuth } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { AdminSettings } from '@/components/admin/admin-settings';
import { getAdminSettingsAction } from '@/lib/actions/issues';

export default async function AdminSettingsPage() {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  const settings = await getAdminSettingsAction();

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Settings</h1>
            <p className="text-muted-foreground">
              Configure system-wide settings and notifications
            </p>
          </div>
        </div>

        <AdminSettings settings={settings} />
      </div>
    </DashboardLayout>
  );
}