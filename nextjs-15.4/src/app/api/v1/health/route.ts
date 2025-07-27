import { NextRequest } from 'next/server';
import { withApiAuth } from '@/lib/api/middleware';

// GET /api/v1/health - Simple health check endpoint
export const GET = withApiAuth(async (request: NextRequest, context, apiKey) => {
  const now = new Date();
  
  return Response.json({
    status: 'healthy',
    timestamp: now.toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    apiKey: apiKey.name,
    userId: apiKey.userId,
    message: 'API is running successfully'
  });
});