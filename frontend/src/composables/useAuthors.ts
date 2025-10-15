import { ref, computed } from 'vue';
import type { Author, CreateAuthorInput, UpdateAuthorInput, PaginatedResponse } from '~/types';
import { AuthorApiService } from '~/services/authorApi';

/**
 * Composable for author management
 * Provides reactive state and methods for author operations
 */
export function useAuthors() {
  // Reactive state
  const authors = ref<Author[]>([]);
  const currentAuthor = ref<Author | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const total = ref(0);

  // Pagination state
  const currentPage = ref(1);
  const pageSize = ref(20);
  const searchQuery = ref('');

  // Computed properties
  const hasAuthors = computed(() => authors.value.length > 0);
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

  /**
   * Load all authors with pagination and search
   */
  const loadAuthors = async (options?: {
    page?: number;
    search?: string;
    append?: boolean;
  }): Promise<void> => {
    const { page = 1, search = '', append = false } = options || {};

    loading.value = true;
    error.value = null;

    try {
      currentPage.value = page;
      searchQuery.value = search;

      const offset = (page - 1) * pageSize.value;

      const response = await AuthorApiService.getAuthors({
        search: search || undefined,
        limit: pageSize.value,
        offset,
      });

      if (append) {
        authors.value.push(...response.data);
      } else {
        authors.value = response.data;
      }

      total.value = response.total;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load authors';
      console.error('Error loading authors:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load a specific author by ID
   */
  const loadAuthor = async (id: string): Promise<Author | null> => {
    loading.value = true;
    error.value = null;

    try {
      const author = await AuthorApiService.getAuthor(id);
      currentAuthor.value = author;
      return author;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load author';
      console.error('Error loading author:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Create a new author
   */
  const createAuthor = async (data: CreateAuthorInput): Promise<Author | null> => {
    loading.value = true;
    error.value = null;

    try {
      const newAuthor = await AuthorApiService.createAuthor(data);

      // Add to the beginning of the authors list
      authors.value.unshift(newAuthor);

      // Update total count
      total.value += 1;

      return newAuthor;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create author';
      console.error('Error creating author:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update an existing author
   */
  const updateAuthor = async (id: string, data: UpdateAuthorInput): Promise<Author | null> => {
    loading.value = true;
    error.value = null;

    try {
      const updatedAuthor = await AuthorApiService.updateAuthor(id, data);

      // Update in the authors list
      const index = authors.value.findIndex(author => author.id === id);
      if (index !== -1) {
        authors.value[index] = updatedAuthor;
      }

      // Update current author if it's the same
      if (currentAuthor.value?.id === id) {
        currentAuthor.value = updatedAuthor;
      }

      return updatedAuthor;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update author';
      console.error('Error updating author:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete an author
   */
  const deleteAuthor = async (id: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      await AuthorApiService.deleteAuthor(id);

      // Remove from the authors list
      authors.value = authors.value.filter(author => author.id !== id);

      // Update total count
      total.value = Math.max(0, total.value - 1);

      // Clear current author if it's the deleted one
      if (currentAuthor.value?.id === id) {
        currentAuthor.value = null;
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete author';
      console.error('Error deleting author:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Search authors
   */
  const searchAuthors = async (query: string): Promise<void> => {
    await loadAuthors({ page: 1, search: query });
  };

  /**
   * Clear error state
   */
  const clearError = (): void => {
    error.value = null;
  };

  /**
   * Refresh current page
   */
  const refresh = (): void => {
    loadAuthors({
      page: currentPage.value,
      search: searchQuery.value,
    });
  };

  /**
   * Go to next page
   */
  const nextPage = (): void => {
    if (currentPage.value < totalPages.value) {
      loadAuthors({
        page: currentPage.value + 1,
        search: searchQuery.value,
      });
    }
  };

  /**
   * Go to previous page
   */
  const prevPage = (): void => {
    if (currentPage.value > 1) {
      loadAuthors({
        page: currentPage.value - 1,
        search: searchQuery.value,
      });
    }
  };

  return {
    // State
    authors,
    currentAuthor,
    loading,
    error,
    total,
    currentPage,
    pageSize,
    searchQuery,

    // Computed
    hasAuthors,
    isLoading,
    hasError,
    totalPages,

    // Methods
    loadAuthors,
    loadAuthor,
    createAuthor,
    updateAuthor,
    deleteAuthor,
    searchAuthors,
    clearError,
    refresh,
    nextPage,
    prevPage,
  };
}
