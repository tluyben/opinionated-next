'use server';

import { db, apiKeys, apiRequests } from '@/lib/db';
import { eq, and, count, sql, gte } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { generateId } from '@/lib/utils';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function generateApiKeyAction(formData: FormData) {
  const name = formData.get('name') as string;

  if (!name || name.trim().length === 0) {
    return { error: 'API key name is required' };
  }

  const user = await getSession();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  try {
    // Generate a random API key
    const apiKey = `sk_${generateId()}${generateId()}`;
    const keyHash = await bcrypt.hash(apiKey, 12);

    await db.insert(apiKeys).values({
      id: generateId(),
      userId: user.id,
      name: name.trim(),
      keyHash,
      createdAt: new Date(),
    });

    revalidatePath('/settings');
    return { success: true, apiKey };
  } catch (error) {
    console.error('Generate API key error:', error);
    return { error: 'Failed to generate API key' };
  }
}

export async function deleteApiKeyAction(formData: FormData) {
  const keyId = formData.get('keyId') as string;

  if (!keyId) {
    console.error('Delete API key error: API key ID is required');
    return;
  }

  const user = await getSession();
  if (!user) {
    console.error('Delete API key error: Not authenticated');
    return;
  }

  try {
    // Only allow users to delete their own keys
    await db.delete(apiKeys)
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, user.id)));

    revalidatePath('/settings');
  } catch (error) {
    console.error('Delete API key error:', error);
  }
}

export async function getUserApiKeys() {
  const user = await getSession();
  if (!user) {
    return [];
  }

  try {
    const userKeys = await db.select({
      id: apiKeys.id,
      name: apiKeys.name,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, user.id))
    .orderBy(apiKeys.createdAt);

    return userKeys;
  } catch (error) {
    console.error('Get API keys error:', error);
    return [];
  }
}

export async function getApiKeyStats() {
  const user = await getSession();
  if (!user) {
    return {
      activeKeys: 0,
      requestsToday: 0,
      monthlyUsage: 0,
      rateLimitViolations: 0
    };
  }

  try {
    // Get total active keys for user
    const [activeKeysResult] = await db
      .select({ count: count() })
      .from(apiKeys)
      .where(eq(apiKeys.userId, user.id));

    // Calculate date ranges
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get requests today
    const [requestsTodayResult] = await db
      .select({ count: count() })
      .from(apiRequests)
      .where(
        and(
          eq(apiRequests.userId, user.id),
          gte(apiRequests.createdAt, startOfToday)
        )
      );

    // Get monthly usage
    const [monthlyUsageResult] = await db
      .select({ count: count() })
      .from(apiRequests)
      .where(
        and(
          eq(apiRequests.userId, user.id),
          gte(apiRequests.createdAt, startOfMonth)
        )
      );

    // Get rate limit violations this month
    const [rateLimitViolationsResult] = await db
      .select({ count: count() })
      .from(apiRequests)
      .where(
        and(
          eq(apiRequests.userId, user.id),
          eq(apiRequests.rateLimitHit, true),
          gte(apiRequests.createdAt, startOfMonth)
        )
      );

    return {
      activeKeys: activeKeysResult.count,
      requestsToday: requestsTodayResult.count,
      monthlyUsage: monthlyUsageResult.count,
      rateLimitViolations: rateLimitViolationsResult.count
    };
  } catch (error) {
    console.error('Get API key stats error:', error);
    return {
      activeKeys: 0,
      requestsToday: 0,
      monthlyUsage: 0,
      rateLimitViolations: 0
    };
  }
}