import { Hono } from 'hono';
import { z } from 'zod';
import { AuthorService } from '../services/authorService';
import { authMiddleware, AuthContext } from '../middleware/auth';
import { ValidationError } from '../utils/errors';
import { logUserAction, logApiRequest } from '../utils/logger';

const authors = new Hono();

// Input validation schemas
const createAuthorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  bio: z.string().max(2000, 'Bio must not exceed 2000 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
});

const updateAuthorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters').optional(),
  bio: z.string().max(2000, 'Bio must not exceed 2000 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
});

const searchSchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters').optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// GET /authors - List all authors with optional search and pagination
authors.get('/', authMiddleware, async (c) => {
  const startTime = Date.now();

  try {
    const { q: search, limit, offset } = searchSchema.parse(c.req.query());

    const result = await AuthorService.getAuthors({
      search,
      limit,
      offset,
    });

    logApiRequest('GET', '/authors', 200, Date.now() - startTime);

    return c.json(result);
  } catch (error) {
    logApiRequest('GET', '/authors', 400, Date.now() - startTime);

    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid query parameters');
    }
    throw error;
  }
});

// POST /authors - Create a new author
authors.post('/', authMiddleware, async (c) => {
  const startTime = Date.now();

  try {
    const body = await c.req.json();
    const validatedData = createAuthorSchema.parse(body);

    const author = await AuthorService.createAuthor(validatedData);

    logUserAction('CREATE_AUTHOR', (c as AuthContext).user?.id || 'unknown', { authorId: author.id });
    logApiRequest('POST', '/authors', 201, Date.now() - startTime);

    return c.json(author, 201);
  } catch (error) {
    logApiRequest('POST', '/authors', 400, Date.now() - startTime);

    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid author data');
    }
    throw error;
  }
});

// GET /authors/{id} - Get author by ID
authors.get('/:id', authMiddleware, async (c) => {
  const startTime = Date.now();

  try {
    const { id } = c.req.param();
    const author = await AuthorService.getAuthorById(id);

    logApiRequest('GET', `/authors/${id}`, 200, Date.now() - startTime);

    return c.json(author);
  } catch (error) {
    logApiRequest('GET', `/authors/${c.req.param('id')}`, 404, Date.now() - startTime);
    throw error;
  }
});

// PUT /authors/{id} - Update author
authors.put('/:id', authMiddleware, async (c) => {
  const startTime = Date.now();

  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const validatedData = updateAuthorSchema.parse(body);

    const author = await AuthorService.updateAuthor(id, validatedData);

    logUserAction('UPDATE_AUTHOR', (c as AuthContext).user?.id || 'unknown', { authorId: id });
    logApiRequest('PUT', `/authors/${id}`, 200, Date.now() - startTime);

    return c.json(author);
  } catch (error) {
    logApiRequest('PUT', `/authors/${c.req.param('id')}`, 400, Date.now() - startTime);

    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid author data');
    }
    throw error;
  }
});

// DELETE /authors/{id} - Soft delete author
authors.delete('/:id', authMiddleware, async (c) => {
  const startTime = Date.now();

  try {
    const { id } = c.req.param();
    const author = await AuthorService.deleteAuthor(id);

    logUserAction('DELETE_AUTHOR', (c as AuthContext).user?.id || 'unknown', { authorId: id });
    logApiRequest('DELETE', `/authors/${id}`, 204, Date.now() - startTime);

    return c.body(null, 204);
  } catch (error) {
    logApiRequest('DELETE', `/authors/${c.req.param('id')}`, 404, Date.now() - startTime);
    throw error;
  }
});

export default authors;
