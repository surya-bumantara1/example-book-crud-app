import type { Book, CreateBookInput, UpdateBookInput, PaginatedResponse } from '~/types';

const API_BASE = '/api';

/**
 * Book API client for frontend-backend communication
 */
export class BookApiService {
  /**
   * Get all books with optional search and filtering
   */
  static async getBooks(options?: {
    search?: string;
    authorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Book>> {
    const params = new URLSearchParams();

    if (options?.search) params.append('q', options.search);
    if (options?.authorId) params.append('authorId', options.authorId);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await fetch(`${API_BASE}/books?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch books: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get book by ID
   */
  static async getBook(id: string): Promise<Book> {
    const response = await fetch(`${API_BASE}/books/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Book not found');
      }
      throw new Error(`Failed to fetch book: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new book
   */
  static async createBook(data: CreateBookInput): Promise<Book> {
    const response = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid book data');
      }
      if (response.status === 404) {
        throw new Error('Primary author not found');
      }
      if (response.status === 409) {
        const error = await response.json();
        throw new Error(error.error || 'Book with this ISBN already exists');
      }
      throw new Error(`Failed to create book: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update an existing book
   */
  static async updateBook(id: string, data: UpdateBookInput): Promise<Book> {
    const response = await fetch(`${API_BASE}/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Book not found');
      }
      if (response.status === 400) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid book data');
      }
      if (response.status === 409) {
        const error = await response.json();
        throw new Error(error.error || 'Book with this ISBN already exists');
      }
      throw new Error(`Failed to update book: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete a book (soft delete)
   */
  static async deleteBook(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/books/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Book not found');
      }
      throw new Error(`Failed to delete book: ${response.statusText}`);
    }
  }

  /**
   * Update book co-author
   */
  static async updateCoAuthor(bookId: string, coAuthorId: string | null): Promise<Book> {
    const response = await fetch(`${API_BASE}/books/${bookId}/co-author`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({ coAuthorId }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Book not found');
      }
      if (response.status === 400) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid co-author data');
      }
      if (response.status === 409) {
        const error = await response.json();
        throw new Error(error.error || 'Primary author and co-author cannot be the same person');
      }
      throw new Error(`Failed to update co-author: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Transfer book authorship
   */
  static async transferAuthorship(bookId: string, newPrimaryAuthorId: string): Promise<Book> {
    const response = await fetch(`${API_BASE}/books/${bookId}/transfer-authorship`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({ newPrimaryAuthorId }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Book not found');
      }
      if (response.status === 400) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid authorship transfer data');
      }
      if (response.status === 409) {
        const error = await response.json();
        throw new Error(error.error || 'Cannot transfer authorship to the current co-author');
      }
      throw new Error(`Failed to transfer authorship: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search books
   */
  static async searchBooks(query: string, options?: {
    authorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Book>> {
    return this.getBooks({
      search: query,
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
    return this.getBooks({
      authorId,
      ...options,
    });
  }

  /**
   * Get authentication token from local storage or cookies
   */
  private static getAuthToken(): string {
    // In a real application, you would get this from secure storage
    // For now, we'll assume it's stored in localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || '';
    }
    return '';
  }
}
