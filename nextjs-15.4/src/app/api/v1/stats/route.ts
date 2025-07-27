import { NextRequest } from 'next/server';
import { withApiAuth } from '@/lib/api/middleware';
import { db, users, apiKeys, apiRequests } from '@/lib/db';
import { eq, count, and, gte } from 'drizzle-orm';

// GET /api/v1/stats - Get user and API statistics
export const GET = withApiAuth(async (request: NextRequest, context, apiKey) => {
  try {
    const currentUser = await db.select().from(users).where(eq(users.id, apiKey.userId)).limit(1);
    
    if (!currentUser.length) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate date ranges
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get API key count
    const [apiKeyCount] = await db
      .select({ count: count() })
      .from(apiKeys)
      .where(eq(apiKeys.userId, apiKey.userId));

    // Get request counts
    const [requestsToday] = await db
      .select({ count: count() })
      .from(apiRequests)
      .where(
        and(
          eq(apiRequests.userId, apiKey.userId),
          gte(apiRequests.createdAt, startOfToday)
        )
      );

    const [requestsThisWeek] = await db
      .select({ count: count() })
      .from(apiRequests)
      .where(
        and(
          eq(apiRequests.userId, apiKey.userId),
          gte(apiRequests.createdAt, startOfWeek)
        )
      );

    const [requestsThisMonth] = await db
      .select({ count: count() })
      .from(apiRequests)
      .where(
        and(
          eq(apiRequests.userId, apiKey.userId),
          gte(apiRequests.createdAt, startOfMonth)
        )
      );

    // Get error rate
    const [errorRequests] = await db
      .select({ count: count() })
      .from(apiRequests)
      .where(
        and(
          eq(apiRequests.userId, apiKey.userId),
          gte(apiRequests.createdAt, startOfMonth),
          gte(apiRequests.statusCode, 400)
        )
      );

    const errorRate = requestsThisMonth.count > 0 
      ? (errorRequests.count / requestsThisMonth.count * 100).toFixed(2)
      : '0.00';

    return Response.json({
      user: {
        id: currentUser[0].id,
        email: currentUser[0].email,
        name: currentUser[0].name,
        role: currentUser[0].role,
        createdAt: currentUser[0].createdAt,
      },
      apiStats: {
        totalApiKeys: apiKeyCount.count,
        requestsToday: requestsToday.count,
        requestsThisWeek: requestsThisWeek.count,
        requestsThisMonth: requestsThisMonth.count,
        errorRate: `${errorRate}%`,
        errorCount: errorRequests.count,
      },
      meta: {
        timestamp: now.toISOString(),
        apiKey: apiKey.name,
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});