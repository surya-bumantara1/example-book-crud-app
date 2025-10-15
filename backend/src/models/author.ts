import { PrismaClient } from '@prisma/client';
import { Author, CreateAuthorInput, UpdateAuthorInput } from '../types';

const prisma = new PrismaClient();

/**
 * Author model for database operations
 * Handles CRUD operations for authors with soft delete support
 */
export class AuthorModel {
  /**
   * Create a new author
   */
  static async create(data: CreateAuthorInput): Promise<Author> {
    return await prisma.author.create({
      data: {
        name: data.name,
        bio: data.bio || null,
        email: data.email || null,
      },
    });
  }

  /**
   * Get all authors with optional filtering and pagination
   */
  static async findMany(options?: {
    search?: string;
    limit?: number;
    offset?: number;
    includeDeleted?: boolean;
  }): Promise<Author[]> {
    const { search, limit = 20, offset = 0, includeDeleted = false } = options || {};

    return await prisma.author.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { bio: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(includeDeleted === false && { deletedAt: null }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get author by ID
   */
  static async findById(id: string): Promise<Author | null> {
    return await prisma.author.findUnique({
      where: { id },
    });
  }

  /**
   * Get author by email
   */
  static async findByEmail(email: string): Promise<Author | null> {
    return await prisma.author.findUnique({
      where: { email },
    });
  }

  /**
   * Update author by ID
   */
  static async update(id: string, data: UpdateAuthorInput): Promise<Author> {
    return await prisma.author.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.email !== undefined && { email: data.email }),
      },
    });
  }

  /**
   * Soft delete author by ID
   */
  static async softDelete(id: string): Promise<Author> {
    return await prisma.author.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Restore soft deleted author by ID
   */
  static async restore(id: string): Promise<Author> {
    return await prisma.author.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  /**
   * Hard delete author by ID (use with caution)
   */
  static async hardDelete(id: string): Promise<Author> {
    return await prisma.author.delete({
      where: { id },
    });
  }

  /**
   * Count total authors
   */
  static async count(options?: { search?: string; includeDeleted?: boolean }): Promise<number> {
    const { search, includeDeleted = false } = options || {};

    return await prisma.author.count({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { bio: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(includeDeleted === false && { deletedAt: null }),
      },
    });
  }

  /**
   * Check if author exists and is not soft deleted
   */
  static async exists(id: string): Promise<boolean> {
    const author = await prisma.author.findUnique({
      where: { id },
      select: { id: true },
    });
    return author !== null;
  }

  /**
   * Get authors by multiple IDs
   */
  static async findByIds(ids: string[]): Promise<Author[]> {
    return await prisma.author.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
    });
  }
}
