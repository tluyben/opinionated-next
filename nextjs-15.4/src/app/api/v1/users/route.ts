import { NextRequest } from 'next/server';
import { withApiAuth } from '@/lib/api/middleware';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

// GET /api/v1/users - List users (requires API key)
export const GET = withApiAuth(async (request: NextRequest, context, apiKey) => {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Only allow users to see their own data unless they're admin
    const currentUser = await db.select().from(users).where(eq(users.id, apiKey.userId)).limit(1);
    
    if (!currentUser.length) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    let userData;
    if (currentUser[0].role === 'admin') {
      // Admin can see all users (with pagination)
      userData = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
      }).from(users)
        .limit(limit)
        .offset(offset);
    } else {
      // Regular users can only see their own data
      userData = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
      }).from(users)
        .where(eq(users.id, apiKey.userId))
        .limit(1);
    }

    return Response.json({
      users: userData,
      meta: {
        limit,
        offset,
        total: userData.length,
        apiKey: apiKey.name,
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// POST /api/v1/users - Create user (admin only)
export const POST = withApiAuth(async (request: NextRequest, context, apiKey) => {
  try {
    // Check if user is admin
    const currentUser = await db.select().from(users).where(eq(users.id, apiKey.userId)).limit(1);
    
    if (!currentUser.length || currentUser[0].role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, name, role = 'user' } = body;

    if (!email || !name) {
      return Response.json({ error: 'Email and name are required' }, { status: 400 });
    }

    // This is a simplified example - in real implementation you'd handle password, validation, etc.
    return Response.json({ 
      message: 'User creation endpoint - implementation needed',
      requestedData: { email, name, role },
      apiKey: apiKey.name
    });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});