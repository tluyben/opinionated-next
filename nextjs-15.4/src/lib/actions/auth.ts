'use server';

import { redirect } from 'next/navigation';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { generateId } from '@/lib/utils';
import { createSession, deleteSession } from '@/lib/auth/session';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user.length === 0) {
      return { error: 'Invalid credentials' };
    }

    const isValid = await bcrypt.compare(password, user[0].passwordHash || '');

    if (!isValid) {
      return { error: 'Invalid credentials' };
    }

    await createSession(user[0].id);
    redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Something went wrong' };
  }
}

export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  if (!email || !password || !name) {
    return { error: 'All fields are required' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  try {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      return { error: 'User already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = generateId();

    await db.insert(users).values({
      id: userId,
      email,
      passwordHash: hashedPassword,
      name,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await createSession(userId);
    redirect('/dashboard');
  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'Something went wrong' };
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect('/');
}