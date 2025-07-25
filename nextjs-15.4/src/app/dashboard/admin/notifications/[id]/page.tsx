import { requireAuth } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { getNotificationByIdAction } from '@/lib/actions/notifications';
import { NotificationDetails } from '@/components/admin/notification-details';

interface NotificationDetailPageProps {
  params: { id: string };
}

export default async function NotificationDetailPage({ params }: NotificationDetailPageProps) {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  const notification = await getNotificationByIdAction(params.id);
  
  if (!notification) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <NotificationDetails notification={notification} />
    </div>
  );
}