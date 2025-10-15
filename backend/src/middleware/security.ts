import { Context, Next } from 'hono';
import rateLimit from 'express-rate-limit';

/**
 * Security middleware for enhanced protection
 */

// Rate limiting middleware
export const rateLimitMiddleware = async (c: Context, next: Next) => {
  // Basic rate limiting - in production, use Redis or similar for distributed limiting
  const clientIP = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const key = `rate-limit:${clientIP}`;

  // Simple in-memory rate limiting (replace with Redis in production)
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  // This is a simplified implementation - use a proper rate limiting library in production
  await next();
};

// CORS middleware
export const corsMiddleware = async (c: Context, next: Next) => {
  // Set CORS headers
  c.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  await next();
};

// Security headers middleware
export const securityHeadersMiddleware = async (c: Context, next: Next) => {
  // Security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Remove server information
  c.header('X-Powered-By', '');

  await next();
};

// Input sanitization middleware
export const sanitizeInputMiddleware = async (c: Context, next: Next) => {
  // Basic input sanitization
  const url = new URL(c.req.url);

  // Check for suspicious patterns in query parameters
  for (const [key, value] of url.searchParams) {
    if (typeof value === 'string') {
      // Check for potential XSS or injection patterns
      if (value.includes('<script') || value.includes('javascript:') || value.includes('on')) {
        return c.json({ error: 'Invalid input detected' }, 400);
      }
    }
  }

  await next();
};

// Request logging middleware for security monitoring
export const securityLoggingMiddleware = async (c: Context, next: Next) => {
  const startTime = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const userAgent = c.req.header('User-Agent');
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';

  await next();

  const duration = Date.now() - startTime;
  const status = c.res.status;

  // Log suspicious activities
  if (status >= 400 || duration > 5000) {
    console.warn('Security Event:', {
      method,
      path,
      status,
      duration,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  }
};
