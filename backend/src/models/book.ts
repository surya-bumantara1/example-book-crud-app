import { PrismaClient } from '@prisma/client';
import { Book, CreateBookInput, UpdateBookInput } from '../types';

const prisma = new PrismaClient();

/**
 * Book model for database operations
 * Handles CRUD operations for books with author relationships and soft delete support
 */
export class BookModel {
  /**
   * Create a new book
   */
  static async create(data: CreateBookInput): Promise<Book> {
    return await prisma.book.create({
      data: {
        title: data.title,
        description: data.description || null,
        isbn: data.isbn || null,
        publishedDate: data.publishedDate ? new Date(data.publishedDate) : null,
        primaryAuthorId: data.primaryAuthorId,
        coAuthorId: data.coAuthorId || null,
      },
      include: {
        primaryAuthor: true,
        coAuthor: true,
      },
    });
  }

  /**
   * Get all books with optional filtering and pagination
   */
  static async findMany(options?: {
    search?: string;
    authorId?: string;
    limit?: number;
    offset?: number;
    includeDeleted?: boolean;
  }): Promise<Book[]> {
    const { search, authorId, limit = 20, offset = 0, includeDeleted = false } = options || {};

    return await prisma.book.findMany({
      where: {
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(authorId && {
          OR: [
            { primaryAuthorId: authorId },
            { coAuthorId: authorId },
          ],
        }),
        ...(includeDeleted === false && { deletedAt: null }),
      },
      include: {
        primaryAuthor: true,
        coAuthor: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get book by ID
   */
  static async findById(id: string): Promise<Book | null> {
    return await prisma.book.findUnique({
      where: { id },
      include: {
        primaryAuthor: true,
        coAuthor: true,
      },
    });
  }

  /**
   * Update book by ID
   */
  static async update(id: string, data: UpdateBookInput): Promise<Book> {
    return await prisma.book.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isbn !== undefined && { isbn: data.isbn }),
        ...(data.publishedDate !== undefined && {
          publishedDate: data.publishedDate ? new Date(data.publishedDate) : null
        }),
        ...(data.primaryAuthorId && { primaryAuthorId: data.primaryAuthorId }),
        ...(data.coAuthorId !== undefined && { coAuthorId: data.coAuthorId }),
      },
      include: {
        primaryAuthor: true,
        coAuthor: true,
      },
    });
  }

  /**
   * Soft delete book by ID
   */
  static async softDelete(id: string): Promise<Book> {
    return await prisma.book.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Restore soft deleted book by ID
   */
  static async restore(id: string): Promise<Book> {
    return await prisma.book.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  /**
   * Hard delete book by ID (use with caution)
   */
  static async hardDelete(id: string): Promise<Book> {
    return await prisma.book.delete({
      where: { id },
    });
  }

  /**
   * Count total books
   */
  static async count(options?: {
    search?: string;
    authorId?: string;
    includeDeleted?: boolean;
  }): Promise<number> {
    const { search, authorId, includeDeleted = false } = options || {};

    return await prisma.book.count({
      where: {
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(authorId && {
          OR: [
            { primaryAuthorId: authorId },
            { coAuthorId: authorId },
          ],
        }),
        ...(includeDeleted === false && { deletedAt: null }),
      },
    });
  }

  /**
   * Check if book exists and is not soft deleted
   */
  static async exists(id: string): Promise<boolean> {
    const book = await prisma.book.findUnique({
      where: { id },
      select: { id: true },
    });
    return book !== null;
  }

  /**
   * Get books by author ID (as primary or co-author)
   */
  static async findByAuthorId(authorId: string, options?: {
    limit?: number;
    offset?: number;
    includeDeleted?: boolean;
  }): Promise<Book[]> {
    return await this.findMany({
      authorId,
      ...options,
    });
  }

  /**
   * Update book co-author
   */
  static async updateCoAuthor(bookId: string, coAuthorId: string | null): Promise<Book> {
    return await prisma.book.update({
      where: { id: bookId },
      data: { coAuthorId },
      include: {
        primaryAuthor: true,
        coAuthor: true,
      },
    });
  }

  /**
   * Transfer primary authorship
   */
  static async transferAuthorship(bookId: string, newPrimaryAuthorId: string): Promise<Book> {
    return await prisma.book.update({
      where: { id: bookId },
      data: { primaryAuthorId: newPrimaryAuthorId },
      include: {
        primaryAuthor: true,
        coAuthor: true,
      },
    });
  }

  /**
   * Get book statistics by author
   */
  static async getAuthorStats(authorId: string): Promise<{
    totalBooks: number;
    primaryBooks: number;
    coAuthoredBooks: number;
  }> {
    const [totalBooks, primaryBooks, coAuthoredBooks] = await Promise.all([
      prisma.book.count({
        where: {
          OR: [
            { primaryAuthorId: authorId },
            { coAuthorId: authorId },
          ],
          deletedAt: null,
        },
      }),
      prisma.book.count({
        where: {
          primaryAuthorId: authorId,
          deletedAt: null,
        },
      }),
      prisma.book.count({
        where: {
          coAuthorId: authorId,
          deletedAt: null,
        },
      }),
    ]);

    return {
      totalBooks,
      primaryBooks,
      coAuthoredBooks,
    };
  }
}
