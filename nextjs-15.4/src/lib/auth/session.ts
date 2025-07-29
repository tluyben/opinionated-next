import { cookies } from 'next/headers';
import { db, users, sessions } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

const SESSION_COOKIE = 'session-token';

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: 'user' | 'admin';
  avatarUrl: string | null;
  emailVerified: boolean;
}

export async function createSession(userId: string) {
  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    expires: expiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return sessionId;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  
  // Check for development impersonation first
  if (process.env.NODE_ENV === 'development') {
    const impersonateUserId = cookieStore.get('dev-impersonate-user')?.value;
    if (impersonateUserId) {
      try {
        const user = await db.select().from(users).where(eq(users.id, impersonateUserId)).limit(1);
        if (user.length > 0) {
          const userData = user[0];
          return {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role as 'user' | 'admin',
            avatarUrl: userData.avatarUrl,
            emailVerified: userData.emailVerified || false,
          };
        }
      } catch (error) {
        console.error('Error getting impersonated user:', error);
      }
    }
  }

  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) return null;

  const result = await db
    .select({
      user: users,
      session: sessions,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionToken))
    .limit(1);

  if (result.length === 0) return null;

  const { user, session } = result[0];

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    await db.delete(sessions).where(eq(sessions.id, sessionToken));
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'user' | 'admin',
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified || false,
  };
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionToken) {
    await db.delete(sessions).where(eq(sessions.id, sessionToken));
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireVerifiedAuth(): Promise<SessionUser> {
  console.log('🔍 [AUTH] requireVerifiedAuth called');
  const user = await getSession();
  console.log('🔍 [AUTH] getSession result:', user ? 'User found' : 'No user', user ? { id: user.id, email: user.email, emailVerified: user.emailVerified } : null);
  if (!user) {
    console.log('❌ [AUTH] No user found, throwing Authentication required');
    throw new Error('Authentication required');
  }
  
  // Skip email verification check for OAuth users (they don't have passwordHash)
  // and for admin users (they're created with emailVerified: true)
  const userRecord = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  console.log('🔍 [AUTH] Database user record:', userRecord.length > 0 ? { emailVerified: userRecord[0].emailVerified, passwordHash: !!userRecord[0].passwordHash } : 'Not found');
  if (userRecord.length > 0) {
    const userData = userRecord[0];
    // Allow access if:
    // 1. Email is verified, OR
    // 2. User signed up via OAuth (no passwordHash), OR  
    // 3. User is admin (they're created as verified)
    const canAccess = user.emailVerified || !userData.passwordHash || user.role === 'admin';
    console.log('🔍 [AUTH] Access check:', { emailVerified: user.emailVerified, hasPassword: !!userData.passwordHash, isAdmin: user.role === 'admin', canAccess });
    if (canAccess) {
      console.log('✅ [AUTH] Access granted');
      return user;
    }
  }
  
  console.log('❌ [AUTH] Access denied - Email verification required');
  throw new Error('Email verification required');
}