import { Context } from 'hono';

// Custom error classes
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

// Error handler middleware
export const errorHandler = (err: Error, c: Context) => {
  console.error('Error:', err);

  // Handle known app errors
  if (err instanceof AppError) {
    return c.json({
      error: err.message,
      code: err.code,
      statusCode: err.statusCode
    }, err.statusCode);
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;

    switch (prismaError.code) {
      case 'P2002':
        return c.json({
          error: 'Unique constraint violation',
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          details: prismaError.meta
        }, 409);

      case 'P2025':
        return c.json({
          error: 'Record not found',
          code: 'RECORD_NOT_FOUND'
        }, 404);

      default:
        return c.json({
          error: 'Database error',
          code: 'DATABASE_ERROR'
        }, 500);
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return c.json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    }, 401);
  }

  if (err.name === 'TokenExpiredError') {
    return c.json({
      error: 'Token expired',
      code: 'TOKEN_EXPIRED'
    }, 401);
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    const zodError = err as any;
    const errors = zodError.errors.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message
    }));

    return c.json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors
    }, 400);
  }

  // Handle unknown errors
  return c.json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  }, 500);
};

// Async error wrapper for route handlers
export const asyncHandler = (fn: Function) => {
  return (c: Context) => {
    const result = fn(c);
    return result.catch((err: Error) => errorHandler(err, c));
  };
};
