import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthContext extends Context {
  user?: AuthUser;
}

// JWT middleware for authentication
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid authorization header' }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return c.json({ error: 'Missing token' }, 401);
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as AuthUser;

    // Add user to context
    (c as AuthContext).user = decoded;

    await next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    if (error instanceof jwt.TokenExpiredError) {
      return c.json({ error: 'Token expired' }, 401);
    }

    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
};

// Optional auth middleware (doesn't fail if no token)
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (token) {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'fallback-secret'
        ) as AuthUser;

        (c as AuthContext).user = decoded;
      }
    }

    await next();
  } catch (error) {
    // For optional auth, we silently continue without adding user to context
    await next();
  }
};

// Admin role check middleware
export const adminMiddleware = async (c: Context, next: Next) => {
  const user = (c as AuthContext).user;

  if (!user) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  if (user.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }

  await next();
};

// Generate JWT token
export const generateToken = (user: Omit<AuthUser, 'role'> & { role?: string }): string => {
  const payload: AuthUser = {
    id: user.id,
    email: user.email,
    role: user.role || 'user'
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback-secret',
    {
      expiresIn: '1h',
      issuer: 'book-author-management',
      audience: 'book-author-management-users'
    }
  );
};

// Generate refresh token
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    {
      expiresIn: '7d',
      issuer: 'book-author-management',
      audience: 'book-author-management-refresh'
    }
  );
};
