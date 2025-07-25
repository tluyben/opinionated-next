'use server';

import { redirect } from 'next/navigation';
import { db, users, passwordResetTokens } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { generateId } from '@/lib/utils';
import { createSession, deleteSession } from '@/lib/auth/session';
import crypto from 'crypto';

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
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Something went wrong' };
  }
  
  redirect('/dashboard');
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
  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'Something went wrong' };
  }
  
  redirect('/dashboard');
}

export async function logoutAction() {
  await deleteSession();
  redirect('/');
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email is required' };
  }

  try {
    // Check if user exists
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user.length === 0) {
      // Don't reveal that user doesn't exist for security
      return { success: true };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenId = generateId();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in database
    await db.insert(passwordResetTokens).values({
      id: tokenId,
      userId: user[0].id,
      token: resetToken,
      expiresAt,
      used: false,
    });

    // TODO: Send email with reset link
    // For now, we'll just log it to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset link: http://localhost:3000/reset-password?token=${resetToken}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { error: 'Something went wrong' };
  }
}

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!token || !password || !confirmPassword) {
    return { error: 'All fields are required' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  try {
    // Find valid token
    const resetToken = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false)
        )
      )
      .limit(1);

    if (resetToken.length === 0) {
      return { error: 'Invalid or expired reset token' };
    }

    const tokenData = resetToken[0];

    // Check if token is expired
    if (tokenData.expiresAt < new Date()) {
      return { error: 'Reset token has expired' };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, tokenData.userId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, tokenData.id));

    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { error: 'Something went wrong' };
  }
}