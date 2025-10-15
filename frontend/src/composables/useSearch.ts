import { ref, computed } from 'vue';
import type { Book, Author, PaginatedResponse } from '~/types';
import { BookApiService } from '~/services/bookApi';
import { AuthorApiService } from '~/services/authorApi';

/**
 * Composable for global search functionality
 * Provides unified search across books and authors
 */
export function useSearch() {
  // Reactive state
  const searchQuery = ref('');
  const searchResults = ref<{
    books: Book[];
    authors: Author[];
    totalBooks: number;
    totalAuthors: number;
  }>({
    books: [],
    authors: [],
    totalBooks: 0,
    totalAuthors: 0,
  });

  const loading = ref(false);
  const error = ref<string | null>(null);

  // Pagination state
  const bookPage = ref(1);
  const authorPage = ref(1);
  const pageSize = ref(10);

  // Search mode
  const searchMode = ref<'all' | 'books' | 'authors'>('all');

  // Computed properties
  const hasResults = computed(() =>
    searchResults.value.books.length > 0 || searchResults.value.authors.length > 0
  );
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);

  const totalResults = computed(() =>
    searchResults.value.totalBooks + searchResults.value.totalAuthors
  );

  /**
   * Perform global search across books and authors
   */
  const performSearch = async (query: string, mode: 'all' | 'books' | 'authors' = 'all'): Promise<void> => {
    if (!query || query.trim().length < 2) {
      searchResults.value = {
        books: [],
        authors: [],
        totalBooks: 0,
        totalAuthors: 0,
      };
      return;
    }

    loading.value = true;
    error.value = null;
    searchMode.value = mode;

    try {
      const trimmedQuery = query.trim();

      // Search books
      let bookResults: PaginatedResponse<Book> = { data: [], total: 0, limit: 0, offset: 0 };
      if (mode === 'all' || mode === 'books') {
        bookResults = await BookApiService.searchBooks(trimmedQuery, {
          limit: pageSize.value,
          offset: 0,
        });
      }

      // Search authors
      let authorResults: PaginatedResponse<Author> = { data: [], total: 0, limit: 0, offset: 0 };
      if (mode === 'all' || mode === 'authors') {
        authorResults = await AuthorApiService.searchAuthors(trimmedQuery, {
          limit: pageSize.value,
          offset: 0,
        });
      }

      searchResults.value = {
        books: bookResults.data,
        authors: authorResults.data,
        totalBooks: bookResults.total,
        totalAuthors: authorResults.total,
      };

      searchQuery.value = trimmedQuery;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Search failed';
      console.error('Search error:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Search only books
   */
  const searchBooks = async (query: string): Promise<void> => {
    await performSearch(query, 'books');
  };

  /**
   * Search only authors
   */
  const searchAuthors = async (query: string): Promise<void> => {
    await performSearch(query, 'authors');
  };

  /**
   * Load more results for pagination
   */
  const loadMoreBooks = async (): Promise<void> => {
    if (!searchQuery.value || searchResults.value.books.length >= searchResults.value.totalBooks) {
      return;
    }

    loading.value = true;

    try {
      const response = await BookApiService.searchBooks(searchQuery.value, {
        limit: pageSize.value,
        offset: searchResults.value.books.length,
      });

      searchResults.value.books.push(...response.data);
      searchResults.value.totalBooks = response.total;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load more books';
      console.error('Load more books error:', err);
    } finally {
      loading.value = false;
    }
  };

  const loadMoreAuthors = async (): Promise<void> => {
    if (!searchQuery.value || searchResults.value.authors.length >= searchResults.value.totalAuthors) {
      return;
    }

    loading.value = true;

    try {
      const response = await AuthorApiService.searchAuthors(searchQuery.value, {
        limit: pageSize.value,
        offset: searchResults.value.authors.length,
      });

      searchResults.value.authors.push(...response.data);
      searchResults.value.totalAuthors = response.total;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load more authors';
      console.error('Load more authors error:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Clear search results
   */
  const clearSearch = (): void => {
    searchQuery.value = '';
    searchResults.value = {
      books: [],
      authors: [],
      totalBooks: 0,
      totalAuthors: 0,
    };
    error.value = null;
  };

  /**
   * Check if there are more results to load
   */
  const hasMoreBooks = computed(() =>
    searchResults.value.books.length < searchResults.value.totalBooks
  );

  const hasMoreAuthors = computed(() =>
    searchResults.value.authors.length < searchResults.value.totalAuthors
  );

  return {
    // State
    searchQuery,
    searchResults,
    loading,
    error,
    searchMode,
    totalResults,

    // Computed
    hasResults,
    isLoading,
    hasError,
    hasMoreBooks,
    hasMoreAuthors,

    // Methods
    performSearch,
    searchBooks,
    searchAuthors,
    loadMoreBooks,
    loadMoreAuthors,
    clearSearch,
  };
}
