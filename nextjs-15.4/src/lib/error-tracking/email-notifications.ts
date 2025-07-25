import { sendEmail } from '@/lib/notifications/service';
import type { ErrorLevel } from './logger';

interface ErrorNotificationData {
  issueId: string;
  title: string;
  message: string;
  level: ErrorLevel;
  adminName: string;
}

export async function sendErrorNotification(
  email: string,
  data: ErrorNotificationData
): Promise<void> {
  try {
    const levelEmoji = {
      error: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
      debug: '🐛'
    };

    const levelColor = {
      error: '#dc2626',
      warning: '#d97706',
      info: '#2563eb',
      debug: '#7c3aed'
    };

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const issueUrl = `${baseUrl}/dashboard/admin/issues/${data.issueId}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Error Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: ${levelColor[data.level]}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">
                ${levelEmoji[data.level]} New ${data.level.charAt(0).toUpperCase() + data.level.slice(1)} Alert
              </h1>
            </div>
            
            <div style="padding: 20px;">
              <p style="margin-top: 0;">Hello ${data.adminName},</p>
              
              <p>A new ${data.level} has been detected in your application:</p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid ${levelColor[data.level]}; padding: 15px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #333;">${data.title}</h3>
                <p style="margin: 0; color: #666; font-family: monospace; white-space: pre-wrap;">${data.message}</p>
              </div>
              
              <div style="margin: 30px 0;">
                <a href="${issueUrl}" 
                   style="background-color: ${levelColor[data.level]}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  View Issue Details
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #666; font-size: 14px; margin-bottom: 0;">
                This notification was sent because you're an admin user with error notifications enabled. 
                <br>
                You can manage notification settings in your admin dashboard.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
New ${data.level.toUpperCase()} Alert

Hello ${data.adminName},

A new ${data.level} has been detected in your application:

Title: ${data.title}
Message: ${data.message}

View issue details: ${issueUrl}

This notification was sent because you're an admin user with error notifications enabled.
You can manage notification settings in your admin dashboard.
    `;

    // Use centralized notification service
    await sendEmail({
      to: email,
      subject: `${levelEmoji[data.level]} New ${data.level.charAt(0).toUpperCase() + data.level.slice(1)}: ${data.title}`,
      content: textContent,
      htmlContent: htmlContent,
      category: 'error-notification',
      priority: data.level === 'error' ? 'urgent' : data.level === 'warning' ? 'high' : 'normal',
      metadata: {
        issueId: data.issueId,
        level: data.level,
        adminName: data.adminName
      }
    });

    console.log(`Error notification sent to ${email} for issue ${data.issueId}`);
  } catch (error) {
    console.error('Failed to send error notification email:', error);
    // Fallback to console logging
    console.log(`[NOTIFICATION FAILED] Would notify ${email} about:`, data);
  }
}