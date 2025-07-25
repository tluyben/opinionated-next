'use server';

import { errorLogger } from '@/lib/error-tracking/logger';
import type { LogErrorOptions } from '@/lib/error-tracking/logger';
import { getSession } from '@/lib/auth/session';

export async function logErrorAction(
  title: string,
  message: string,
  options: LogErrorOptions = {}
): Promise<string> {
  try {
    // Get userId from server-side session if not provided
    if (!options.userId) {
      const session = await getSession();
      if (session) {
        options.userId = session.id;
      }
    }
  } catch (error) {
    // Ignore session errors, continue logging without userId
  }

  return await errorLogger.logError(title, message, options);
}

export async function updateIssueStatusAction(
  id: string,
  status: 'open' | 'closed' | 'resolved',
  resolvedBy?: string
): Promise<boolean> {
  return await errorLogger.updateIssueStatus(id, status, resolvedBy);
}

export async function getIssuesAction(filters: {
  status?: 'open' | 'closed' | 'resolved';
  level?: 'error' | 'warning' | 'info' | 'debug';
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  return await errorLogger.getIssues(filters);
}

export async function getIssueByIdAction(id: string) {
  return await errorLogger.getIssueById(id);
}

export async function getIssueStatsAction() {
  return await errorLogger.getIssueStats();
}