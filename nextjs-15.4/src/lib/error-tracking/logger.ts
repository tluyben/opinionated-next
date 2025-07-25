import { db, issues, adminSettings, users } from '@/lib/db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import crypto from 'crypto';

export type ErrorLevel = 'error' | 'warning' | 'info' | 'debug';
export type IssueStatus = 'open' | 'closed' | 'resolved';

export interface ErrorContext {
  url?: string;
  userAgent?: string;
  userId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  stack?: string;
}

export interface LogErrorOptions extends ErrorContext {
  level?: ErrorLevel;
  fingerprint?: string;
}

class ErrorLogger {
  private generateFingerprint(title: string, message: string, stack?: string): string {
    // Create a unique fingerprint for grouping similar errors
    const content = `${title}:${message}:${stack?.split('\n')[0] || ''}`;
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  async logError(
    title: string,
    message: string,
    options: LogErrorOptions = {}
  ): Promise<string> {
    const {
      level = 'error',
      url,
      userAgent,
      userId,
      tags = [],
      metadata = {},
      stack,
      fingerprint
    } = options;

    const errorFingerprint = fingerprint || this.generateFingerprint(title, message, stack);
    const environment = process.env.NODE_ENV || 'production';
    const now = new Date();

    try {
      // Check if this error already exists (same fingerprint)
      const existingIssue = await db
        .select()
        .from(issues)
        .where(eq(issues.fingerprint, errorFingerprint))
        .limit(1);

      let issueId: string;

      if (existingIssue.length > 0) {
        // Update existing issue
        const issue = existingIssue[0];
        issueId = issue.id;
        
        await db
          .update(issues)
          .set({
            count: issue.count + 1,
            lastSeenAt: now,
            updatedAt: now,
            // Update to higher severity if needed
            level: this.getHigherLevel(issue.level as ErrorLevel, level),
            // Merge metadata
            metadata: JSON.stringify({
              ...JSON.parse(issue.metadata || '{}'),
              ...metadata,
              lastOccurrence: {
                url,
                userAgent,
                userId,
                timestamp: now.toISOString()
              }
            })
          })
          .where(eq(issues.id, issue.id));
      } else {
        // Create new issue
        issueId = generateId();
        
        await db.insert(issues).values({
          id: issueId,
          title,
          message,
          stack,
          level,
          fingerprint: errorFingerprint,
          url,
          userAgent,
          userId,
          environment,
          tags: JSON.stringify(tags),
          metadata: JSON.stringify(metadata),
          firstSeenAt: now,
          lastSeenAt: now,
          createdAt: now,
          updatedAt: now
        });

        // Check if we should send email notification for new errors
        await this.checkAndSendNotification(issueId, title, message, level);
      }

      return issueId;
    } catch (error) {
      // Fallback: log to console if database fails
      console.error('Failed to log error to database:', error);
      console.error('Original error:', { title, message, stack, level, url });
      return 'console-fallback';
    }
  }

  private getHigherLevel(current: ErrorLevel, new_level: ErrorLevel): ErrorLevel {
    const levels = { debug: 0, info: 1, warning: 2, error: 3 };
    return levels[new_level] > levels[current] ? new_level : current;
  }

  private async checkAndSendNotification(
    issueId: string,
    title: string,
    message: string,
    level: ErrorLevel
  ): Promise<void> {
    try {
      // Get admin settings
      const settings = await db
        .select()
        .from(adminSettings)
        .limit(1);

      if (settings.length === 0) {
        // Create default settings if none exist
        await db.insert(adminSettings).values({
          id: generateId(),
          emailNotificationsEnabled: true,
          notificationLevel: 'error'
        });
        return;
      }

      const adminConfig = settings[0];
      
      if (!adminConfig.emailNotificationsEnabled) {
        return;
      }

      // Check if this error level should trigger notification
      const levels = { debug: 0, info: 1, warning: 2, error: 3 };
      if (levels[level] < levels[adminConfig.notificationLevel as ErrorLevel]) {
        return;
      }

      // Get all admin users
      const adminUsers = await db
        .select()
        .from(users)
        .where(eq(users.role, 'admin'));

      if (adminUsers.length === 0) {
        return;
      }

      // Send notification (we'll implement this in the email service)
      const { sendErrorNotification } = await import('./email-notifications');
      
      for (const admin of adminUsers) {
        if (admin.email) {
          await sendErrorNotification(admin.email, {
            issueId,
            title,
            message,
            level,
            adminName: admin.name || 'Admin'
          });
        }
      }
    } catch (error) {
      console.error('Failed to send error notification:', error);
    }
  }

  async getIssues(filters: {
    status?: IssueStatus;
    level?: ErrorLevel;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const { status, level, search, limit = 50, offset = 0 } = filters;
    
    try {
      const conditions = [];
      
      if (status) {
        conditions.push(eq(issues.status, status));
      }
      
      if (level) {
        conditions.push(eq(issues.level, level));
      }
      
      if (search) {
        // Simple search in title and message
        conditions.push(
          sql`lower(${issues.title}) LIKE lower('%' || ${search} || '%') OR lower(${issues.message}) LIKE lower('%' || ${search} || '%')`
        );
      }
      
      const baseQuery = db.select().from(issues);
      
      if (conditions.length > 0) {
        return await baseQuery
          .where(and(...conditions))
          .orderBy(desc(issues.lastSeenAt))
          .limit(limit)
          .offset(offset);
      } else {
        return await baseQuery
          .orderBy(desc(issues.lastSeenAt))
          .limit(limit)
          .offset(offset);
      }
    } catch (error) {
      console.error('Failed to get issues:', error);
      return [];
    }
  }

  async getIssueById(id: string) {
    const result = await db
      .select()
      .from(issues)
      .where(eq(issues.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  async updateIssueStatus(
    id: string,
    status: IssueStatus,
    resolvedBy?: string
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (status === 'resolved' || status === 'closed') {
        updateData.resolvedAt = new Date();
        if (resolvedBy) {
          updateData.resolvedBy = resolvedBy;
        }
      }

      await db
        .update(issues)
        .set(updateData)
        .where(eq(issues.id, id));

      return true;
    } catch (error) {
      console.error('Failed to update issue status:', error);
      return false;
    }
  }

  async getIssueStats() {
    try {
      // Get counts by status and level
      const allIssues = await db.select().from(issues);
      
      const stats = {
        total: allIssues.length,
        open: allIssues.filter(i => i.status === 'open').length,
        closed: allIssues.filter(i => i.status === 'closed').length,
        resolved: allIssues.filter(i => i.status === 'resolved').length,
        byLevel: {
          error: allIssues.filter(i => i.level === 'error').length,
          warning: allIssues.filter(i => i.level === 'warning').length,
          info: allIssues.filter(i => i.level === 'info').length,
          debug: allIssues.filter(i => i.level === 'debug').length,
        }
      };

      return stats;
    } catch (error) {
      console.error('Failed to get issue stats:', error);
      return {
        total: 0,
        open: 0,
        closed: 0,
        resolved: 0,
        byLevel: { error: 0, warning: 0, info: 0, debug: 0 }
      };
    }
  }
}

export const errorLogger = new ErrorLogger();

// Convenience functions
export const logError = (title: string, message: string, options?: LogErrorOptions) =>
  errorLogger.logError(title, message, options);

export const logWarning = (title: string, message: string, options?: Omit<LogErrorOptions, 'level'>) =>
  errorLogger.logError(title, message, { ...options, level: 'warning' });

export const logInfo = (title: string, message: string, options?: Omit<LogErrorOptions, 'level'>) =>
  errorLogger.logError(title, message, { ...options, level: 'info' });

export const logDebug = (title: string, message: string, options?: Omit<LogErrorOptions, 'level'>) =>
  errorLogger.logError(title, message, { ...options, level: 'debug' });