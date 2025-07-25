import { requireAuth } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { NotificationsList } from '@/components/admin/notifications-list';
import { NotificationStats } from '@/components/admin/notification-stats';
import { getNotificationsAction, getNotificationStatsAction } from '@/lib/actions/notifications';

interface NotificationsPageProps {
  searchParams: Promise<{
    type?: string;
    status?: string;
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  const { type, status, category, search, page = '1' } = await searchParams;
  const currentPage = parseInt(page, 10);
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  const [notifications, stats] = await Promise.all([
    getNotificationsAction({
      type: type as any,
      status: status as any,
      category: category as any,
      search,
      limit,
      offset
    }),
    getNotificationStatsAction()
  ]);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Track and manage all emails and SMS sent through the application
            </p>
          </div>
        </div>

        <NotificationStats stats={stats} />
        
        <NotificationsList 
          notifications={notifications}
          currentPage={currentPage}
          filters={{
            type,
            status,
            category,
            search
          }}
        />
      </div>
    </DashboardLayout>
  );
}