import { BookModel } from '../models/book';
import { AuthorModel } from '../models/author';
import { Book, CreateBookInput, UpdateBookInput, PaginatedResponse } from '../types';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors';

/**
 * Book service for business logic
 * Handles book-related operations with validation and business rules
 */
export class BookService {
  /**
   * Create a new book with validation
   */
  static async createBook(data: CreateBookInput): Promise<Book> {
    // Validate required fields
    if (!data.title || data.title.trim().length < 1) {
      throw new ValidationError('Book title is required');
    }

    if (data.title.length > 200) {
      throw new ValidationError('Book title must not exceed 200 characters');
    }

    if (!data.primaryAuthorId) {
      throw new ValidationError('Primary author is required');
    }

    // Validate description length if provided
    if (data.description && data.description.length > 5000) {
      throw new ValidationError('Book description must not exceed 5000 characters');
    }

    // Validate ISBN if provided
    if (data.isbn) {
      if (!this.isValidISBN(data.isbn)) {
        throw new ValidationError('Invalid ISBN format. Must be ISBN-10 or ISBN-13');
      }

      // Check if ISBN already exists
      const existingBook = await BookModel.findByISBN(data.isbn);
      if (existingBook) {
        throw new ConflictError('A book with this ISBN already exists');
      }
    }

    // Validate primary author exists and is not deleted
    const primaryAuthor = await AuthorModel.findById(data.primaryAuthorId);
    if (!primaryAuthor) {
      throw new NotFoundError('Primary author');
    }

    if (primaryAuthor.deletedAt) {
      throw new ValidationError('Cannot assign a deleted author as primary author');
    }

    // Validate co-author if provided
    if (data.coAuthorId) {
      const coAuthor = await AuthorModel.findById(data.coAuthorId);
      if (!coAuthor) {
        throw new NotFoundError('Co-author');
      }

      if (coAuthor.deletedAt) {
        throw new ValidationError('Cannot assign a deleted author as co-author');
      }

      if (data.coAuthorId === data.primaryAuthorId) {
        throw new ValidationError('Primary author and co-author cannot be the same person');
      }
    }

    // Validate published date if provided
    if (data.publishedDate) {
      const publishedDate = new Date(data.publishedDate);
      if (isNaN(publishedDate.getTime())) {
        throw new ValidationError('Invalid published date format');
      }

      if (publishedDate > new Date()) {
        throw new ValidationError('Published date cannot be in the future');
      }
    }

    return await BookModel.create(data);
  }

  /**
   * Get all books with search, filtering and pagination
   */
  static async getBooks(options?: {
    search?: string;
    authorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Book>> {
    const { search, authorId, limit = 20, offset = 0 } = options || {};

    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    if (offset < 0) {
      throw new ValidationError('Offset must be non-negative');
    }

    const books = await BookModel.findMany({
      search,
      authorId,
      limit,
      offset,
    });

    const total = await BookModel.count({ search, authorId });

    return {
      data: books,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get book by ID
   */
  static async getBookById(id: string): Promise<Book> {
    if (!id) {
      throw new ValidationError('Book ID is required');
    }

    const book = await BookModel.findById(id);
    if (!book) {
      throw new NotFoundError('Book');
    }

    return book;
  }

  /**
   * Update book with validation
   */
  static async updateBook(id: string, data: UpdateBookInput): Promise<Book> {
    if (!id) {
      throw new ValidationError('Book ID is required');
    }

    // Check if book exists
    await this.getBookById(id);

    // Validate title if provided
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length < 1) {
        throw new ValidationError('Book title is required');
      }
      if (data.title.length > 200) {
        throw new ValidationError('Book title must not exceed 200 characters');
      }
    }

    // Validate description if provided
    if (data.description !== undefined && data.description && data.description.length > 5000) {
      throw new ValidationError('Book description must not exceed 5000 characters');
    }

    // Validate ISBN if provided
    if (data.isbn !== undefined && data.isbn) {
      if (!this.isValidISBN(data.isbn)) {
        throw new ValidationError('Invalid ISBN format. Must be ISBN-10 or ISBN-13');
      }

      // Check if ISBN is already used by another book
      const existingBook = await BookModel.findByISBN(data.isbn);
      if (existingBook && existingBook.id !== id) {
        throw new ConflictError('A book with this ISBN already exists');
      }
    }

    // Validate primary author if provided
    if (data.primaryAuthorId) {
      const primaryAuthor = await AuthorModel.findById(data.primaryAuthorId);
      if (!primaryAuthor) {
        throw new NotFoundError('Primary author');
      }
      if (primaryAuthor.deletedAt) {
        throw new ValidationError('Cannot assign a deleted author as primary author');
      }
    }

    // Validate co-author if provided
    if (data.coAuthorId !== undefined) {
      if (data.coAuthorId) {
        const coAuthor = await AuthorModel.findById(data.coAuthorId);
        if (!coAuthor) {
          throw new NotFoundError('Co-author');
        }
        if (coAuthor.deletedAt) {
          throw new ValidationError('Cannot assign a deleted author as co-author');
        }
      }
    }

    // Check if primary and co-author are the same (if both provided)
    if (data.primaryAuthorId && data.coAuthorId && data.primaryAuthorId === data.coAuthorId) {
      throw new ValidationError('Primary author and co-author cannot be the same person');
    }

    // Validate published date if provided
    if (data.publishedDate !== undefined && data.publishedDate) {
      const publishedDate = new Date(data.publishedDate);
      if (isNaN(publishedDate.getTime())) {
        throw new ValidationError('Invalid published date format');
      }

      if (publishedDate > new Date()) {
        throw new ValidationError('Published date cannot be in the future');
      }
    }

    return await BookModel.update(id, data);
  }

  /**
   * Soft delete book
   */
  static async deleteBook(id: string): Promise<Book> {
    if (!id) {
      throw new ValidationError('Book ID is required');
    }

    // Check if book exists
    await this.getBookById(id);

    return await BookModel.softDelete(id);
  }

  /**
   * Update book co-author
   */
  static async updateCoAuthor(bookId: string, coAuthorId: string | null): Promise<Book> {
    if (!bookId) {
      throw new ValidationError('Book ID is required');
    }

    // Check if book exists
    const book = await this.getBookById(bookId);

    // If setting co-author, validate it
    if (coAuthorId) {
      const coAuthor = await AuthorModel.findById(coAuthorId);
      if (!coAuthor) {
        throw new NotFoundError('Co-author');
      }
      if (coAuthor.deletedAt) {
        throw new ValidationError('Cannot assign a deleted author as co-author');
      }
      if (coAuthor.id === book.primaryAuthorId) {
        throw new ValidationError('Primary author and co-author cannot be the same person');
      }
    }

    return await BookModel.updateCoAuthor(bookId, coAuthorId);
  }

  /**
   * Transfer book authorship
   */
  static async transferAuthorship(bookId: string, newPrimaryAuthorId: string): Promise<Book> {
    if (!bookId) {
      throw new ValidationError('Book ID is required');
    }

    if (!newPrimaryAuthorId) {
      throw new ValidationError('New primary author ID is required');
    }

    // Check if book exists
    const book = await this.getBookById(bookId);

    // Validate new primary author
    const newPrimaryAuthor = await AuthorModel.findById(newPrimaryAuthorId);
    if (!newPrimaryAuthor) {
      throw new NotFoundError('New primary author');
    }
    if (newPrimaryAuthor.deletedAt) {
      throw new ValidationError('Cannot assign a deleted author as primary author');
    }

    // Check if new author is currently the co-author (would create conflict)
    if (book.coAuthorId === newPrimaryAuthorId) {
      throw new ValidationError('Cannot transfer authorship to the current co-author');
    }

    return await BookModel.transferAuthorship(bookId, newPrimaryAuthorId);
  }

  /**
   * Search books by title or description
   */
  static async searchBooks(query: string, options?: {
    authorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Book>> {
    if (!query || query.trim().length < 2) {
      throw new ValidationError('Search query must be at least 2 characters long');
    }

    return await this.getBooks({
      search: query.trim(),
      authorId: options?.authorId,
      ...options,
    });
  }

  /**
   * Get books by author ID
   */
  static async getBooksByAuthor(authorId: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Book>> {
    if (!authorId) {
      throw new ValidationError('Author ID is required');
    }

    return await this.getBooks({
      authorId,
      ...options,
    });
  }

  /**
   * Validate ISBN format (ISBN-10 or ISBN-13)
   */
  private static isValidISBN(isbn: string): boolean {
    // Remove hyphens and spaces
    const cleanISBN = isbn.replace(/[-\s]/g, '');

    // Check length
    if (cleanISBN.length !== 10 && cleanISBN.length !== 13) {
      return false;
    }

    // For ISBN-13, check if it starts with 978 or 979
    if (cleanISBN.length === 13) {
      if (!cleanISBN.startsWith('978') && !cleanISBN.startsWith('979')) {
        return false;
      }
    }

    // Basic checksum validation for ISBN-13
    if (cleanISBN.length === 13) {
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(cleanISBN[i]) * (i % 2 === 0 ? 1 : 3);
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      return checkDigit === parseInt(cleanISBN[12]);
    }

    // For ISBN-10, basic validation (simplified)
    if (cleanISBN.length === 10) {
      // This is a simplified check - full ISBN-10 validation is more complex
      const digits = cleanISBN.split('').map(Number);
      if (digits.some(isNaN)) {
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Helper method to find book by ISBN (for internal use)
   */
  private static async findByISBN(isbn: string): Promise<Book | null> {
    return await prisma.book.findUnique({
      where: { isbn },
      include: {
        primaryAuthor: true,
        coAuthor: true,
      },
    });
  }
}

// Import prisma for the private method
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
