'use server';

import { requireAuth } from '@/lib/auth/session';
import { errorLogger } from '@/lib/error-tracking/logger';
import { db, adminSettings } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { ErrorLevel, IssueStatus } from '@/lib/error-tracking/logger';

export async function getIssuesAction(filters: {
  status?: IssueStatus;
  level?: ErrorLevel;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return await errorLogger.getIssues(filters);
}

export async function getIssueByIdAction(id: string) {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return await errorLogger.getIssueById(id);
}

export async function updateIssueStatusAction(
  id: string,
  status: IssueStatus
) {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  const success = await errorLogger.updateIssueStatus(id, status, user.id);
  
  if (success) {
    revalidatePath('/admin/issues');
    return { success: true };
  }
  
  return { error: 'Failed to update issue status' };
}

export async function getIssueStatsAction() {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return await errorLogger.getIssueStats();
}

export async function getAdminSettingsAction() {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  try {
    const settings = await db
      .select()
      .from(adminSettings)
      .limit(1);

    if (settings.length === 0) {
      // Create default settings
      const defaultSettings = {
        id: 'default',
        emailNotificationsEnabled: true,
        notificationLevel: 'error' as ErrorLevel,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.insert(adminSettings).values(defaultSettings);
      return defaultSettings;
    }

    return settings[0];
  } catch (error) {
    console.error('Failed to get admin settings:', error);
    throw new Error('Failed to load admin settings');
  }
}

export async function updateAdminSettingsAction(
  emailNotificationsEnabled: boolean,
  notificationLevel: ErrorLevel
) {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  try {
    const existingSettings = await db
      .select()
      .from(adminSettings)
      .limit(1);

    const updateData = {
      emailNotificationsEnabled,
      notificationLevel,
      updatedAt: new Date()
    };

    if (existingSettings.length === 0) {
      // Create new settings
      await db.insert(adminSettings).values({
        id: 'default',
        ...updateData,
        createdAt: new Date()
      });
    } else {
      // Update existing settings
      await db
        .update(adminSettings)
        .set(updateData)
        .where(eq(adminSettings.id, existingSettings[0].id));
    }

    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    console.error('Failed to update admin settings:', error);
    return { error: 'Failed to update settings' };
  }
}