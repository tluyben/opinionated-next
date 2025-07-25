'use server';

import { redirect } from 'next/navigation';
import { db, users, passwordResetTokens, emailVerificationTokens } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { generateId } from '@/lib/utils';
import { createSession, deleteSession } from '@/lib/auth/session';
import { handleServerError } from '@/lib/error-tracking/server-handler';
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

    // Check if email is verified (only for email/password users, not OAuth)
    if (user[0].passwordHash && !user[0].emailVerified) {
      return { error: 'Please verify your email address before logging in. Check your email for the verification link.' };
    }

    await createSession(user[0].id);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    await handleServerError(err, { action: 'loginAction', tags: ['auth'] });
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
      emailVerified: false, // Start as unverified
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenId = generateId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token
    await db.insert(emailVerificationTokens).values({
      id: tokenId,
      userId,
      token: verificationToken,
      email,
      expiresAt,
      used: false,
    });

    // Send verification email
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #16a34a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">📧 Welcome! Please Verify Your Email</h1>
            </div>
            
            <div style="padding: 20px;">
              <p style="margin-top: 0;">Hello ${name},</p>
              
              <p>Thank you for signing up! To complete your account setup and access all features, please verify your email address.</p>
              
              <p>Click the button below to verify your email:</p>
              
              <div style="margin: 30px 0; text-align: center;">
                <a href="${verifyUrl}" 
                   style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Verify Email Address
                </a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; font-size: 14px;">
                ${verifyUrl}
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #666; font-size: 14px; margin-bottom: 0;">
                This verification link will expire in 24 hours for security purposes.
                <br>
                If you didn't create this account, please ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Welcome! Please Verify Your Email

Hello ${name},

Thank you for signing up! To complete your account setup and access all features, please verify your email address.

To verify your email, visit this link:
${verifyUrl}

This verification link will expire in 24 hours for security purposes.

If you didn't create this account, please ignore this email.
    `;

    // Use centralized notification service to send verification email
    const { sendEmail } = await import('@/lib/notifications/service');
    await sendEmail({
      to: email,
      subject: '📧 Please verify your email address',
      content: textContent,
      htmlContent: htmlContent,
      category: 'auth',
      priority: 'high',
      userId: userId,
      metadata: {
        verificationTokenId: tokenId,
        expiresAt: expiresAt.toISOString(),
        isNewUser: true
      }
    });

    // Don't create session yet - user must verify email first
    return { success: true, message: 'Account created! Please check your email to verify your account.' };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    await handleServerError(err, { action: 'signupAction', tags: ['auth'] });
    return { error: 'Something went wrong' };
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect('/');
}

export async function verifyEmailAction(token: string) {
  if (!token) {
    return { error: 'Verification token is required' };
  }

  try {
    // Find valid verification token
    const verificationToken = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, token),
          eq(emailVerificationTokens.used, false)
        )
      )
      .limit(1);

    if (verificationToken.length === 0) {
      return { error: 'Invalid or expired verification token' };
    }

    const tokenData = verificationToken[0];

    // Check if token is expired
    if (tokenData.expiresAt < new Date()) {
      return { error: 'Verification token has expired' };
    }

    // Update user as verified
    await db
      .update(users)
      .set({
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, tokenData.userId));

    // Mark token as used
    await db
      .update(emailVerificationTokens)
      .set({ used: true })
      .where(eq(emailVerificationTokens.id, tokenData.id));

    // Create session for the verified user
    await createSession(tokenData.userId);

    return { success: true };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    await handleServerError(err, { action: 'verifyEmailAction', tags: ['auth', 'email-verification'] });
    return { error: 'Something went wrong' };
  }
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

    // Send password reset email
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">🔐 Password Reset Request</h1>
            </div>
            
            <div style="padding: 20px;">
              <p style="margin-top: 0;">Hello ${user[0].name || 'User'},</p>
              
              <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
              
              <p>To reset your password, click the button below:</p>
              
              <div style="margin: 30px 0; text-align: center;">
                <a href="${resetUrl}" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Reset Your Password
                </a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; font-size: 14px;">
                ${resetUrl}
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #666; font-size: 14px; margin-bottom: 0;">
                This password reset link will expire in 1 hour for security purposes.
                <br>
                If you didn't request this reset, please ignore this email or contact support if you have concerns.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Password Reset Request

Hello ${user[0].name || 'User'},

We received a request to reset your password. If you didn't make this request, you can safely ignore this email.

To reset your password, visit this link:
${resetUrl}

This password reset link will expire in 1 hour for security purposes.

If you didn't request this reset, please ignore this email or contact support if you have concerns.
    `;

    // Use centralized notification service to send password reset email
    const { sendEmail } = await import('@/lib/notifications/service');
    await sendEmail({
      to: email,
      subject: '🔐 Password Reset Request',
      content: textContent,
      htmlContent: htmlContent,
      category: 'auth',
      priority: 'high',
      userId: user[0].id,
      metadata: {
        resetTokenId: tokenId,
        expiresAt: expiresAt.toISOString()
      }
    });

    return { success: true };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    await handleServerError(err, { action: 'requestPasswordResetAction', tags: ['auth', 'password-reset'] });
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
    const err = error instanceof Error ? error : new Error(String(error));
    await handleServerError(err, { action: 'resetPasswordAction', tags: ['auth', 'password-reset'] });
    return { error: 'Something went wrong' };
  }
}