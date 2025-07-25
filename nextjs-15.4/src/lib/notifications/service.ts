import { db, notifications, users } from '@/lib/db';
import { eq, and, desc, or, sql } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import nodemailer from 'nodemailer';

export type NotificationType = 'email' | 'sms';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'delivered' | 'bounced';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationCategory = 'auth' | 'error-notification' | 'marketing' | 'system' | 'security' | 'reminder';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  content: string;
  htmlContent?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  category: NotificationCategory;
  priority?: NotificationPriority;
  scheduledFor?: Date;
  userId?: string;
  sentBy?: string;
  metadata?: Record<string, any>;
}

export interface SendSMSOptions {
  to: string | string[];
  content: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  scheduledFor?: Date;
  userId?: string;
  sentBy?: string;
  metadata?: Record<string, any>;
}

class NotificationService {
  private emailTransporter: any;

  constructor() {
    this.initializeEmailTransporter();
  }

  private initializeEmailTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<string[]> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const notificationIds: string[] = [];

    for (const recipient of recipients) {
      const notificationId = generateId();
      notificationIds.push(notificationId);

      try {
        // Create notification record
        await db.insert(notifications).values({
          id: notificationId,
          type: 'email',
          status: 'pending',
          recipient,
          subject: options.subject,
          content: options.content,
          htmlContent: options.htmlContent,
          templateId: options.templateId,
          templateData: options.templateData ? JSON.stringify(options.templateData) : null,
          userId: options.userId,
          sentBy: options.sentBy,
          category: options.category,
          priority: options.priority || 'normal',
          scheduledFor: options.scheduledFor,
          metadata: options.metadata ? JSON.stringify(options.metadata) : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Send immediately if not scheduled
        if (!options.scheduledFor || options.scheduledFor <= new Date()) {
          await this.processEmailNotification(notificationId);
        }
      } catch (error) {
        console.error(`Failed to create email notification for ${recipient}:`, error);
        
        // Update notification with failure
        await this.updateNotificationStatus(notificationId, 'failed', String(error));
      }
    }

    return notificationIds;
  }

  async sendSMS(options: SendSMSOptions): Promise<string[]> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const notificationIds: string[] = [];

    for (const recipient of recipients) {
      const notificationId = generateId();
      notificationIds.push(notificationId);

      try {
        // Create notification record
        await db.insert(notifications).values({
          id: notificationId,
          type: 'sms',
          status: 'pending',
          recipient,
          content: options.content,
          userId: options.userId,
          sentBy: options.sentBy,
          category: options.category,
          priority: options.priority || 'normal',
          scheduledFor: options.scheduledFor,
          metadata: options.metadata ? JSON.stringify(options.metadata) : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Send immediately if not scheduled
        if (!options.scheduledFor || options.scheduledFor <= new Date()) {
          await this.processSMSNotification(notificationId);
        }
      } catch (error) {
        console.error(`Failed to create SMS notification for ${recipient}:`, error);
        
        // Update notification with failure
        await this.updateNotificationStatus(notificationId, 'failed', String(error));
      }
    }

    return notificationIds;
  }

  private async processEmailNotification(notificationId: string): Promise<void> {
    try {
      const notification = await this.getNotificationById(notificationId);
      if (!notification || notification.type !== 'email') {
        throw new Error('Email notification not found');
      }

      if (!this.emailTransporter) {
        // Fallback to console logging in development
        if (process.env.NODE_ENV === 'development') {
          console.log('📧 [DEV] Email notification:', {
            to: notification.recipient,
            subject: notification.subject,
            content: notification.content,
            category: notification.category
          });
          
          await this.updateNotificationStatus(notificationId, 'sent', undefined, new Date());
          return;
        } else {
          throw new Error('SMTP not configured');
        }
      }

      // Send actual email
      const result = await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: notification.recipient,
        subject: notification.subject,
        text: notification.content,
        html: notification.htmlContent || undefined,
      });

      await this.updateNotificationStatus(
        notificationId, 
        'sent', 
        undefined, 
        new Date(),
        JSON.stringify(result)
      );

    } catch (error) {
      console.error(`Failed to send email notification ${notificationId}:`, error);
      
      const notification = await this.getNotificationById(notificationId);
      if (notification && notification.retryCount < notification.maxRetries) {
        // Increment retry count
        await db.update(notifications)
          .set({ 
            retryCount: notification.retryCount + 1,
            updatedAt: new Date()
          })
          .where(eq(notifications.id, notificationId));
      } else {
        await this.updateNotificationStatus(notificationId, 'failed', String(error));
      }
    }
  }

  private async processSMSNotification(notificationId: string): Promise<void> {
    try {
      const notification = await this.getNotificationById(notificationId);
      if (!notification || notification.type !== 'sms') {
        throw new Error('SMS notification not found');
      }

      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        // Fallback to console logging in development
        if (process.env.NODE_ENV === 'development') {
          console.log('📱 [DEV] SMS notification:', {
            to: notification.recipient,
            content: notification.content,
            category: notification.category
          });
          
          await this.updateNotificationStatus(notificationId, 'sent', undefined, new Date());
          return;
        } else {
          throw new Error('Twilio not configured');
        }
      }

      // Send actual SMS using Twilio
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      const result = await client.messages.create({
        body: notification.content,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: notification.recipient,
      });

      await this.updateNotificationStatus(
        notificationId, 
        'sent', 
        undefined, 
        new Date(),
        JSON.stringify(result)
      );

    } catch (error) {
      console.error(`Failed to send SMS notification ${notificationId}:`, error);
      
      const notification = await this.getNotificationById(notificationId);
      if (notification && notification.retryCount < notification.maxRetries) {
        // Increment retry count
        await db.update(notifications)
          .set({ 
            retryCount: notification.retryCount + 1,
            updatedAt: new Date()
          })
          .where(eq(notifications.id, notificationId));
      } else {
        await this.updateNotificationStatus(notificationId, 'failed', String(error));
      }
    }
  }

  private async updateNotificationStatus(
    id: string,
    status: NotificationStatus,
    failureReason?: string,
    sentAt?: Date,
    providerResponse?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (failureReason) {
      updateData.failureReason = failureReason;
    }

    if (sentAt) {
      updateData.sentAt = sentAt;
    }

    if (providerResponse) {
      updateData.providerResponse = providerResponse;
    }

    await db.update(notifications)
      .set(updateData)
      .where(eq(notifications.id, id));
  }

  async getNotificationById(id: string) {
    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  async getNotifications(filters: {
    type?: NotificationType;
    status?: NotificationStatus;
    category?: NotificationCategory;
    search?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const { type, status, category, search, userId, limit = 50, offset = 0 } = filters;
    
    try {
      const conditions = [];
      
      if (type) {
        conditions.push(eq(notifications.type, type));
      }
      
      if (status) {
        conditions.push(eq(notifications.status, status));
      }
      
      if (category) {
        conditions.push(eq(notifications.category, category));
      }
      
      if (userId) {
        conditions.push(eq(notifications.userId, userId));
      }
      
      if (search) {
        conditions.push(
          or(
            // Search in recipient, subject, and content
            sql`lower(${notifications.recipient}) LIKE lower('%' || ${search} || '%')`,
            sql`lower(${notifications.subject}) LIKE lower('%' || ${search} || '%')`,
            sql`lower(${notifications.content}) LIKE lower('%' || ${search} || '%')`
          )
        );
      }
      
      const baseQuery = db.select().from(notifications);
      
      if (conditions.length > 0) {
        return await baseQuery
          .where(and(...conditions))
          .orderBy(desc(notifications.createdAt))
          .limit(limit)
          .offset(offset);
      } else {
        return await baseQuery
          .orderBy(desc(notifications.createdAt))
          .limit(limit)
          .offset(offset);
      }
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  async getNotificationStats() {
    try {
      const allNotifications = await db.select().from(notifications);
      
      const stats = {
        total: allNotifications.length,
        sent: allNotifications.filter(n => n.status === 'sent').length,
        failed: allNotifications.filter(n => n.status === 'failed').length,
        pending: allNotifications.filter(n => n.status === 'pending').length,
        byType: {
          email: allNotifications.filter(n => n.type === 'email').length,
          sms: allNotifications.filter(n => n.type === 'sms').length,
        },
        byCategory: {
          auth: allNotifications.filter(n => n.category === 'auth').length,
          'error-notification': allNotifications.filter(n => n.category === 'error-notification').length,
          system: allNotifications.filter(n => n.category === 'system').length,
          security: allNotifications.filter(n => n.category === 'security').length,
          marketing: allNotifications.filter(n => n.category === 'marketing').length,
          reminder: allNotifications.filter(n => n.category === 'reminder').length,
        }
      };

      return stats;
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      return {
        total: 0,
        sent: 0,
        failed: 0,
        pending: 0,
        byType: { email: 0, sms: 0 },
        byCategory: { auth: 0, 'error-notification': 0, system: 0, security: 0, marketing: 0, reminder: 0 }
      };
    }
  }

  async resendNotification(id: string, sentBy?: string): Promise<boolean> {
    try {
      const notification = await this.getNotificationById(id);
      if (!notification) {
        throw new Error('Notification not found');
      }

      // Reset notification for resend
      await db.update(notifications)
        .set({
          status: 'pending',
          retryCount: 0,
          failureReason: null,
          sentAt: null,
          sentBy: sentBy || notification.sentBy,
          updatedAt: new Date(),
        })
        .where(eq(notifications.id, id));

      // Process the notification
      if (notification.type === 'email') {
        await this.processEmailNotification(id);
      } else {
        await this.processSMSNotification(id);
      }

      return true;
    } catch (error) {
      console.error(`Failed to resend notification ${id}:`, error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();

// Convenience functions for the opinionated API
export const sendEmail = (options: SendEmailOptions) => notificationService.sendEmail(options);
export const sendSMS = (options: SendSMSOptions) => notificationService.sendSMS(options);