import { AuthorModel } from '../models/author';
import { Author, CreateAuthorInput, UpdateAuthorInput, PaginatedResponse } from '../types';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors';

/**
 * Author service for business logic
 * Handles author-related operations with validation and business rules
 */
export class AuthorService {
  /**
   * Create a new author with validation
   */
  static async createAuthor(data: CreateAuthorInput): Promise<Author> {
    // Validate required fields
    if (!data.name || data.name.trim().length < 2) {
      throw new ValidationError('Author name must be at least 2 characters long');
    }

    if (data.name.length > 100) {
      throw new ValidationError('Author name must not exceed 100 characters');
    }

    // Validate email if provided
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new ValidationError('Invalid email format');
      }

      // Check if email already exists
      const existingAuthor = await AuthorModel.findByEmail(data.email);
      if (existingAuthor) {
        throw new ConflictError('An author with this email already exists');
      }
    }

    // Validate bio length if provided
    if (data.bio && data.bio.length > 2000) {
      throw new ValidationError('Author bio must not exceed 2000 characters');
    }

    return await AuthorModel.create(data);
  }

  /**
   * Get all authors with search and pagination
   */
  static async getAuthors(options?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Author>> {
    const { search, limit = 20, offset = 0 } = options || {};

    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    if (offset < 0) {
      throw new ValidationError('Offset must be non-negative');
    }

    const authors = await AuthorModel.findMany({
      search,
      limit,
      offset,
    });

    const total = await AuthorModel.count({ search });

    return {
      data: authors,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get author by ID
   */
  static async getAuthorById(id: string): Promise<Author> {
    if (!id) {
      throw new ValidationError('Author ID is required');
    }

    const author = await AuthorModel.findById(id);
    if (!author) {
      throw new NotFoundError('Author');
    }

    return author;
  }

  /**
   * Update author with validation
   */
  static async updateAuthor(id: string, data: UpdateAuthorInput): Promise<Author> {
    if (!id) {
      throw new ValidationError('Author ID is required');
    }

    // Check if author exists
    await this.getAuthorById(id);

    // Validate name if provided
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length < 2) {
        throw new ValidationError('Author name must be at least 2 characters long');
      }
      if (data.name.length > 100) {
        throw new ValidationError('Author name must not exceed 100 characters');
      }
    }

    // Validate email if provided
    if (data.email !== undefined) {
      if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          throw new ValidationError('Invalid email format');
        }

        // Check if email is already used by another author
        const existingAuthor = await AuthorModel.findByEmail(data.email);
        if (existingAuthor && existingAuthor.id !== id) {
          throw new ConflictError('An author with this email already exists');
        }
      }
    }

    // Validate bio if provided
    if (data.bio !== undefined && data.bio && data.bio.length > 2000) {
      throw new ValidationError('Author bio must not exceed 2000 characters');
    }

    return await AuthorModel.update(id, data);
  }

  /**
   * Soft delete author
   */
  static async deleteAuthor(id: string): Promise<Author> {
    if (!id) {
      throw new ValidationError('Author ID is required');
    }

    // Check if author exists
    await this.getAuthorById(id);

    // TODO: Check if author has books before deleting
    // For now, we'll allow deletion but this should be handled in business logic

    return await AuthorModel.softDelete(id);
  }

  /**
   * Search authors by name or bio
   */
  static async searchAuthors(query: string, options?: { limit?: number; offset?: number }): Promise<PaginatedResponse<Author>> {
    if (!query || query.trim().length < 2) {
      throw new ValidationError('Search query must be at least 2 characters long');
    }

    return await this.getAuthors({
      search: query.trim(),
      ...options,
    });
  }

  /**
   * Get author statistics
   */
  static async getAuthorStats(): Promise<{
    totalAuthors: number;
    activeAuthors: number;
    deletedAuthors: number;
  }> {
    const totalAuthors = await AuthorModel.count({ includeDeleted: true });
    const activeAuthors = await AuthorModel.count({ includeDeleted: false });
    const deletedAuthors = totalAuthors - activeAuthors;

    return {
      totalAuthors,
      activeAuthors,
      deletedAuthors,
    };
  }
}
