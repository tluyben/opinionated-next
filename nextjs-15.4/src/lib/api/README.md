# API Monitoring & Authentication System

## Overview

This is a comprehensive API monitoring system that provides real-time tracking, authentication, and analytics for API usage.

## Features

### 🔐 Authentication
- **API Key Authentication**: Bearer token authentication using hashed API keys
- **Rate Limiting**: 1000 requests per hour per API key (configurable)
- **Role-based Access**: Admin vs user permissions

### 📊 Real-Time Monitoring
- **Request Tracking**: Every API call is logged with detailed metadata
- **Performance Metrics**: Response times, request/response sizes
- **Error Tracking**: Failed requests and error messages
- **Rate Limit Violations**: Track when limits are exceeded

### 📈 Analytics Dashboard
- **Active Keys**: Count of user's active API keys
- **Daily Usage**: Requests made today
- **Monthly Usage**: Total requests this month  
- **Error Rates**: Success/failure ratios
- **Rate Limit Hits**: Number of violations

## Database Schema

### api_requests Table
```sql
- id: Unique request ID
- api_key_id: Which API key was used
- user_id: User who owns the API key
- method: HTTP method (GET, POST, etc.)
- endpoint: API endpoint path
- path: Full path with query parameters
- status_code: HTTP response status
- response_time: Request duration in ms
- request_size: Request body size in bytes
- response_size: Response body size in bytes  
- ip_address: Client IP address
- user_agent: Client user agent
- referer: HTTP referer header
- rate_limit_hit: Boolean for rate limit violations
- error_message: Error details if request failed
- metadata: Additional context as JSON
- created_at: Request timestamp
```

## Usage

### Creating Protected API Routes

```typescript
import { withApiAuth } from '@/lib/api/middleware';

export const GET = withApiAuth(async (request, context, apiKey) => {
  // Your API logic here
  // apiKey contains: { id, userId, name }
  
  return Response.json({ 
    data: 'your response',
    apiKey: apiKey.name 
  });
});
```

### Example API Endpoints

1. **GET /api/v1/health** - Health check
2. **GET /api/v1/users** - List users (admin can see all, users see only themselves)
3. **GET /api/v1/stats** - Get detailed usage statistics
4. **POST /api/v1/users** - Create users (admin only)

### Authentication

All API requests require a Bearer token:

```bash
curl -H "Authorization: Bearer sk_your_api_key_here" \
  http://localhost:3000/api/v1/health
```

### Rate Limiting

- **Limit**: 1000 requests per hour per API key
- **Response**: 429 status code when exceeded
- **Tracking**: All violations logged in database

## Statistics Dashboard

The `/settings` page shows real-time statistics:

- **Active Keys**: Number of user's API keys
- **Requests Today**: Requests made since midnight
- **Monthly Usage**: Total requests this month
- **Rate Limit Violations**: Number of times limits were hit

## Monitoring Features

### Automatic Logging
Every API request automatically logs:
- Request details (method, path, headers)
- Response details (status, size, timing)
- Authentication info (which key was used)
- Client info (IP, user agent, referer)
- Error details (if request failed)

### Real-Time Analytics
Statistics are calculated in real-time from the database:
- No caching delays
- Accurate counts and metrics
- Historical data preserved

### Security Features
- **API Key Hashing**: Keys stored as bcrypt hashes
- **Rate Limiting**: Prevents abuse
- **IP Tracking**: Monitor request sources
- **Error Logging**: Track failed authentication attempts

## Development & Testing

### Testing API Endpoints

1. **Create an API Key**: Go to `/settings` and create a new API key
2. **Copy the Key**: Save the full key (only shown once)
3. **Make Requests**: Use curl or Postman with Bearer authentication

Example:
```bash
# Health check
curl -H "Authorization: Bearer sk_your_key" \
  http://localhost:3000/api/v1/health

# Get user stats  
curl -H "Authorization: Bearer sk_your_key" \
  http://localhost:3000/api/v1/stats

# List users (admin only)
curl -H "Authorization: Bearer sk_admin_key" \
  http://localhost:3000/api/v1/users
```

### Viewing Analytics

1. Go to `/settings` to see your API key dashboard
2. View real-time statistics and usage metrics
3. Monitor rate limits and performance

This system provides enterprise-grade API monitoring with complete visibility into usage, performance, and security.