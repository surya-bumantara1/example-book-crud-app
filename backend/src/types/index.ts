// Base types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// Author types
export interface Author extends BaseEntity {
  name: string;
  bio?: string | null;
  email?: string | null;
}

export interface CreateAuthorInput {
  name: string;
  bio?: string;
  email?: string;
}

export interface UpdateAuthorInput {
  name?: string;
  bio?: string;
  email?: string;
}

// Book types
export interface Book extends BaseEntity {
  title: string;
  description?: string | null;
  isbn?: string | null;
  publishedDate?: Date | null;
  primaryAuthorId: string;
  coAuthorId?: string | null;
  primaryAuthor?: Author;
  coAuthor?: Author | null;
}

export interface CreateBookInput {
  title: string;
  description?: string;
  isbn?: string;
  publishedDate?: string;
  primaryAuthorId: string;
  coAuthorId?: string;
}

export interface UpdateBookInput {
  title?: string;
  description?: string;
  isbn?: string;
  publishedDate?: string;
  primaryAuthorId?: string;
  coAuthorId?: string;
}

// Authorship types
export interface AuthorshipTransferInput {
  newPrimaryAuthorId: string;
}

// Search types
export interface SearchQuery {
  query?: string;
  limit?: number;
  offset?: number;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// Request/Response context types
export interface RequestContext {
  user?: AuthUser;
  requestId: string;
  startTime: number;
}

// Validation schemas will be imported from zod schemas
export interface ValidationSchema {
  body?: any;
  query?: any;
  params?: any;
}
