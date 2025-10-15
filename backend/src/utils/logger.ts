import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
  ),
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});

// If we're not in production then also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

// Create logs directory if it doesn't exist
import { promises as fs } from 'fs';

async function ensureLogsDir() {
  try {
    await fs.access('logs');
  } catch {
    await fs.mkdir('logs', { recursive: true });
  }
}

ensureLogsDir().catch(console.error);

// HTTP request logger middleware
export const httpLogger = winston.createLogger({
  level: 'http',
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/http.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});

// If we're not in production then also log HTTP requests to console
if (process.env.NODE_ENV !== 'production') {
  httpLogger.add(
    new winston.transports.Console({
      level: 'http',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

export default logger;

// Helper functions for common log patterns
export const logUserAction = (action: string, userId: string, details?: any) => {
  logger.info(`User action: ${action}`, { userId, ...details });
};

export const logError = (error: Error, context?: any) => {
  logger.error(error.message, { error: error.stack, ...context });
};

export const logDatabaseOperation = (operation: string, model: string, details?: any) => {
  logger.debug(`Database operation: ${operation}`, { model, ...details });
};

export const logApiRequest = (method: string, path: string, statusCode: number, duration: number) => {
  httpLogger.http(`${method} ${path} ${statusCode} ${duration}ms`);
};
