import { requireAuth } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { getNotificationByIdAction } from '@/lib/actions/notifications';
import { NotificationDetails } from '@/components/admin/notification-details';

interface NotificationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function NotificationDetailPage({ params }: NotificationDetailPageProps) {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  const { id } = await params;
  const notification = await getNotificationByIdAction(id);
  
  if (!notification) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <NotificationDetails notification={notification} />
      </div>
    </DashboardLayout>
  );
}