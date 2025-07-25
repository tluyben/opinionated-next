'use server';

import { requireAuth } from '@/lib/auth/session';
import { notificationService } from '@/lib/notifications/service';
import { revalidatePath } from 'next/cache';
import type { NotificationType, NotificationStatus, NotificationCategory } from '@/lib/notifications/service';

export async function getNotificationsAction(filters: {
  type?: NotificationType;
  status?: NotificationStatus;
  category?: NotificationCategory;
  search?: string;
  userId?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return await notificationService.getNotifications(filters);
}

export async function getNotificationByIdAction(id: string) {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return await notificationService.getNotificationById(id);
}

export async function getNotificationStatsAction() {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return await notificationService.getNotificationStats();
}

export async function resendNotificationAction(id: string) {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  const success = await notificationService.resendNotification(id, user.id);
  
  if (success) {
    revalidatePath('/dashboard/admin/notifications');
    return { success: true };
  }
  
  return { error: 'Failed to resend notification' };
}