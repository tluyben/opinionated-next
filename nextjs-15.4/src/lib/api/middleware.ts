import { NextRequest, NextResponse } from 'next/server';
import { db, apiKeys, apiRequests } from '@/lib/db';
import { eq, and, gte, sql } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import bcrypt from 'bcryptjs';

interface ApiKeyResult {
  apiKey: {
    id: string;
    userId: string;
    name: string;
  };
  rateLimitHit: boolean;
}

/**
 * Authenticate API request using Bearer token
 */
export async function authenticateApiKey(request: NextRequest): Promise<ApiKeyResult | null> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (!token.startsWith('sk_')) {
    return null;
  }

  try {
    // Find all API keys and check against hashed versions
    const allKeys = await db.select({
      id: apiKeys.id,
      userId: apiKeys.userId,
      name: apiKeys.name,
      keyHash: apiKeys.keyHash,
    }).from(apiKeys);

    for (const key of allKeys) {
      const isValid = await bcrypt.compare(token, key.keyHash);
      if (isValid) {
        // Update last used timestamp
        await db.update(apiKeys)
          .set({ lastUsedAt: new Date() })
          .where(eq(apiKeys.id, key.id));

        // Check rate limiting (simplified - 1000 requests per hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const [requestCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(apiRequests)
          .where(
            and(
              eq(apiRequests.apiKeyId, key.id),
              gte(apiRequests.createdAt, oneHourAgo)
            )
          );

        const rateLimitHit = requestCount.count >= 1000;

        return {
          apiKey: {
            id: key.id,
            userId: key.userId,
            name: key.name,
          },
          rateLimitHit,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('API key authentication error:', error);
    return null;
  }
}

/**
 * Log API request for monitoring and analytics
 */
export async function logApiRequest(
  apiKeyId: string,
  userId: string,
  request: NextRequest,
  response: Response,
  startTime: number,
  rateLimitHit: boolean = false,
  errorMessage?: string
): Promise<void> {
  try {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const url = new URL(request.url);
    
    // Extract request metadata
    const contentLength = request.headers.get('content-length');
    const requestSize = contentLength ? parseInt(contentLength, 10) : 0;
    
    // Get response size (estimate)
    const responseSize = response.headers.get('content-length') 
      ? parseInt(response.headers.get('content-length')!, 10) 
      : 0;

    await db.insert(apiRequests).values({
      id: generateId(),
      apiKeyId,
      userId,
      method: request.method,
      endpoint: url.pathname,
      path: `${url.pathname}${url.search}`,
      statusCode: response.status,
      responseTime,
      requestSize: requestSize || null,
      responseSize: responseSize || null,
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || null,
      referer: request.headers.get('referer') || null,
      rateLimitHit,
      errorMessage: errorMessage || null,
      metadata: JSON.stringify({
        host: request.headers.get('host'),
        accept: request.headers.get('accept'),
        contentType: request.headers.get('content-type'),
      }),
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to log API request:', error);
    // Don't throw - logging failures shouldn't break the API
  }
}

/**
 * Create a wrapper for API routes that includes authentication and logging
 */
export function withApiAuth(handler: (
  request: NextRequest,
  context: { params?: any },
  apiKey: { id: string; userId: string; name: string }
) => Promise<Response>) {
  return async (request: NextRequest, context: { params?: any } = {}) => {
    const startTime = Date.now();
    
    // Authenticate API key
    const authResult = await authenticateApiKey(request);
    
    if (!authResult) {
      const response = NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 }
      );
      return response;
    }

    const { apiKey, rateLimitHit } = authResult;

    // Check rate limit
    if (rateLimitHit) {
      const response = NextResponse.json(
        { error: 'Rate limit exceeded (1000 requests per hour)' },
        { status: 429 }
      );
      
      // Log the rate limit violation
      await logApiRequest(
        apiKey.id,
        apiKey.userId,
        request,
        response,
        startTime,
        true,
        'Rate limit exceeded'
      );
      
      return response;
    }

    try {
      // Call the actual handler
      const response = await handler(request, context, apiKey);
      
      // Log successful request
      await logApiRequest(
        apiKey.id,
        apiKey.userId,
        request,
        response,
        startTime,
        false
      );
      
      return response;
    } catch (error) {
      // Log failed request
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
      
      await logApiRequest(
        apiKey.id,
        apiKey.userId,
        request,
        response,
        startTime,
        false,
        errorMessage
      );
      
      return response;
    }
  };
}