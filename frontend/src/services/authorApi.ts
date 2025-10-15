import type { Author, CreateAuthorInput, UpdateAuthorInput, PaginatedResponse } from '~/types';

const API_BASE = '/api';

/**
 * Author API client for frontend-backend communication
 */
export class AuthorApiService {
  /**
   * Get all authors with optional search and pagination
   */
  static async getAuthors(options?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Author>> {
    const params = new URLSearchParams();

    if (options?.search) params.append('q', options.search);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await fetch(`${API_BASE}/authors?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch authors: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get author by ID
   */
  static async getAuthor(id: string): Promise<Author> {
    const response = await fetch(`${API_BASE}/authors/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Author not found');
      }
      throw new Error(`Failed to fetch author: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new author
   */
  static async createAuthor(data: CreateAuthorInput): Promise<Author> {
    const response = await fetch(`${API_BASE}/authors`, {
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
        throw new Error(error.error || 'Invalid author data');
      }
      if (response.status === 409) {
        const error = await response.json();
        throw new Error(error.error || 'Author with this email already exists');
      }
      throw new Error(`Failed to create author: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update an existing author
   */
  static async updateAuthor(id: string, data: UpdateAuthorInput): Promise<Author> {
    const response = await fetch(`${API_BASE}/authors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Author not found');
      }
      if (response.status === 400) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid author data');
      }
      if (response.status === 409) {
        const error = await response.json();
        throw new Error(error.error || 'Author with this email already exists');
      }
      throw new Error(`Failed to update author: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete an author (soft delete)
   */
  static async deleteAuthor(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/authors/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Author not found');
      }
      throw new Error(`Failed to delete author: ${response.statusText}`);
    }
  }

  /**
   * Search authors
   */
  static async searchAuthors(query: string, options?: { limit?: number; offset?: number }): Promise<PaginatedResponse<Author>> {
    return this.getAuthors({
      search: query,
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
