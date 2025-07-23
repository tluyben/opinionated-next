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