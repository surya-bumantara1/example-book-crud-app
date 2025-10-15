import { Hono } from 'hono';
import { z } from 'zod';
import { BookService } from '../services/bookService';
import { authMiddleware, AuthContext } from '../middleware/auth';
import { ValidationError } from '../utils/errors';
import { logUserAction, logApiRequest } from '../utils/logger';

const books = new Hono();

// Input validation schemas
const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters'),
  description: z.string().max(5000, 'Description must not exceed 5000 characters').optional(),
  isbn: z.string().optional(),
  publishedDate: z.string().optional(),
  primaryAuthorId: z.string().uuid('Invalid primary author ID'),
  coAuthorId: z.string().uuid('Invalid co-author ID').optional(),
});

const updateBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters').optional(),
  description: z.string().max(5000, 'Description must not exceed 5000 characters').optional(),
  isbn: z.string().optional(),
  publishedDate: z.string().optional(),
  primaryAuthorId: z.string().uuid('Invalid primary author ID').optional(),
  coAuthorId: z.string().uuid('Invalid co-author ID').optional(),
});

const searchSchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters').optional(),
  authorId: z.string().uuid('Invalid author ID').optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// GET /books - List all books with optional search and filtering
books.get('/', authMiddleware, async (c) => {
  const startTime = Date.now();

  try {
    const { q: search, authorId, limit, offset } = searchSchema.parse(c.req.query());

    const result = await BookService.getBooks({
      search,
      authorId,
      limit,
      offset,
    });

    logApiRequest('GET', '/books', 200, Date.now() - startTime);

    return c.json(result);
  } catch (error) {
    logApiRequest('GET', '/books', 400, Date.now() - startTime);

    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid query parameters');
    }
    throw error;
  }
});

// POST /books - Create a new book
books.post('/', authMiddleware, async (c) => {
  const startTime = Date.now();

  try {
    const body = await c.req.json();
    const validatedData = createBookSchema.parse(body);

    const book = await BookService.createBook(validatedData);

    logUserAction('CREATE_BOOK', (c as AuthContext).user?.id || 'unknown', { bookId: book.id });
    logApiRequest('POST', '/books', 201, Date.now() - startTime);

    return c.json(book, 201);
  } catch (error) {
    logApiRequest('POST', '/books', 400, Date.now() - startTime);

    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid book data');
    }
    throw error;
  }
});

// GET /books/{id} - Get book by ID
books.get('/:id', authMiddleware, async (c) => {
  const startTime = Date.now();

  try {
    const { id } = c.req.param();
    const book = await BookService.getBookById(id);

    logApiRequest('GET', `/books/${id}`, 200, Date.now() - startTime);

    return c.json(book);
  } catch (error) {
    logApiRequest('GET', `/books/${c.req.param('id')}`, 404, Date.now() - startTime);
    throw error;
  }
});

// PUT /books/{id} - Update book
books.put('/:id', authMiddleware, async (c) => {
  const startTime = Date.now();

  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const validatedData = updateBookSchema.parse(body);

    const book = await BookService.updateBook(id, validatedData);

    logUserAction('UPDATE_BOOK', (c as AuthContext).user?.id || 'unknown', { bookId: id });
    logApiRequest('PUT', `/books/${id}`, 200, Date.now() - startTime);

    return c.json(book);
  } catch (error) {
    logApiRequest('PUT', `/books/${c.req.param('id')}`, 400, Date.now() - startTime);

    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid book data');
    }
    throw error;
  }
});

// DELETE /books/{id} - Soft delete book
books.delete('/:id', authMiddleware, async (c) => {
  const startTime = Date.now();

  try {
    const { id } = c.req.param();
    const book = await BookService.deleteBook(id);

    logUserAction('DELETE_BOOK', (c as AuthContext).user?.id || 'unknown', { bookId: id });
    logApiRequest('DELETE', `/books/${id}`, 204, Date.now() - startTime);

    return c.body(null, 204);
  } catch (error) {
    logApiRequest('DELETE', `/books/${c.req.param('id')}`, 404, Date.now() - startTime);
    throw error;
  }
});

// PUT /books/{id}/co-author - Update book co-author
books.put('/:id/co-author', authMiddleware, async (c) => {
  const startTime = Date.now();

  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const { coAuthorId } = z.object({
      coAuthorId: z.string().uuid().nullable(),
    }).parse(body);

    const book = await BookService.updateCoAuthor(id, coAuthorId);

    logUserAction('UPDATE_CO_AUTHOR', (c as AuthContext).user?.id || 'unknown', { bookId: id, coAuthorId });
    logApiRequest('PUT', `/books/${id}/co-author`, 200, Date.now() - startTime);

    return c.json(book);
  } catch (error) {
    logApiRequest('PUT', `/books/${c.req.param('id')}/co-author`, 400, Date.now() - startTime);

    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid co-author data');
    }
    throw error;
  }
});

// PUT /books/{id}/transfer-authorship - Transfer book authorship
books.put('/:id/transfer-authorship', authMiddleware, async (c) => {
  const startTime = Date.now();

  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const { newPrimaryAuthorId } = z.object({
      newPrimaryAuthorId: z.string().uuid(),
    }).parse(body);

    const book = await BookService.transferAuthorship(id, newPrimaryAuthorId);

    logUserAction('TRANSFER_AUTHORSHIP', (c as AuthContext).user?.id || 'unknown', {
      bookId: id,
      newPrimaryAuthorId
    });
    logApiRequest('PUT', `/books/${id}/transfer-authorship`, 200, Date.now() - startTime);

    return c.json(book);
  } catch (error) {
    logApiRequest('PUT', `/books/${c.req.param('id')}/transfer-authorship`, 400, Date.now() - startTime);

    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid authorship transfer data');
    }
    throw error;
  }
});

export default books;
