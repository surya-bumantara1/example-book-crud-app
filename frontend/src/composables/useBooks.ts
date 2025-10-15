import { ref, computed } from 'vue';
import type { Book, CreateBookInput, UpdateBookInput, PaginatedResponse } from '~/types';
import { BookApiService } from '~/services/bookApi';

/**
 * Composable for book management
 * Provides reactive state and methods for book operations
 */
export function useBooks() {
  // Reactive state
  const books = ref<Book[]>([]);
  const currentBook = ref<Book | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const total = ref(0);

  // Pagination state
  const currentPage = ref(1);
  const pageSize = ref(20);
  const searchQuery = ref('');
  const authorFilter = ref<string>('');

  // Computed properties
  const hasBooks = computed(() => books.value.length > 0);
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

  /**
   * Load all books with pagination, search and filtering
   */
  const loadBooks = async (options?: {
    page?: number;
    search?: string;
    authorId?: string;
    append?: boolean;
  }): Promise<void> => {
    const { page = 1, search = '', authorId = '', append = false } = options || {};

    loading.value = true;
    error.value = null;

    try {
      currentPage.value = page;
      searchQuery.value = search;
      authorFilter.value = authorId;

      const offset = (page - 1) * pageSize.value;

      const response = await BookApiService.getBooks({
        search: search || undefined,
        authorId: authorId || undefined,
        limit: pageSize.value,
        offset,
      });

      if (append) {
        books.value.push(...response.data);
      } else {
        books.value = response.data;
      }

      total.value = response.total;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load books';
      console.error('Error loading books:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load a specific book by ID
   */
  const loadBook = async (id: string): Promise<Book | null> => {
    loading.value = true;
    error.value = null;

    try {
      const book = await BookApiService.getBook(id);
      currentBook.value = book;
      return book;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load book';
      console.error('Error loading book:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Create a new book
   */
  const createBook = async (data: CreateBookInput): Promise<Book | null> => {
    loading.value = true;
    error.value = null;

    try {
      const newBook = await BookApiService.createBook(data);

      // Add to the beginning of the books list
      books.value.unshift(newBook);

      // Update total count
      total.value += 1;

      return newBook;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create book';
      console.error('Error creating book:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update an existing book
   */
  const updateBook = async (id: string, data: UpdateBookInput): Promise<Book | null> => {
    loading.value = true;
    error.value = null;

    try {
      const updatedBook = await BookApiService.updateBook(id, data);

      // Update in the books list
      const index = books.value.findIndex(book => book.id === id);
      if (index !== -1) {
        books.value[index] = updatedBook;
      }

      // Update current book if it's the same
      if (currentBook.value?.id === id) {
        currentBook.value = updatedBook;
      }

      return updatedBook;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update book';
      console.error('Error updating book:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete a book
   */
  const deleteBook = async (id: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      await BookApiService.deleteBook(id);

      // Remove from the books list
      books.value = books.value.filter(book => book.id !== id);

      // Update total count
      total.value = Math.max(0, total.value - 1);

      // Clear current book if it's the deleted one
      if (currentBook.value?.id === id) {
        currentBook.value = null;
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete book';
      console.error('Error deleting book:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update book co-author
   */
  const updateCoAuthor = async (bookId: string, coAuthorId: string | null): Promise<Book | null> => {
    loading.value = true;
    error.value = null;

    try {
      const updatedBook = await BookApiService.updateCoAuthor(bookId, coAuthorId);

      // Update in the books list
      const index = books.value.findIndex(book => book.id === bookId);
      if (index !== -1) {
        books.value[index] = updatedBook;
      }

      // Update current book if it's the same
      if (currentBook.value?.id === bookId) {
        currentBook.value = updatedBook;
      }

      return updatedBook;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update co-author';
      console.error('Error updating co-author:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Transfer book authorship
   */
  const transferAuthorship = async (bookId: string, newPrimaryAuthorId: string): Promise<Book | null> => {
    loading.value = true;
    error.value = null;

    try {
      const updatedBook = await BookApiService.transferAuthorship(bookId, newPrimaryAuthorId);

      // Update in the books list
      const index = books.value.findIndex(book => book.id === bookId);
      if (index !== -1) {
        books.value[index] = updatedBook;
      }

      // Update current book if it's the same
      if (currentBook.value?.id === bookId) {
        currentBook.value = updatedBook;
      }

      return updatedBook;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to transfer authorship';
      console.error('Error transferring authorship:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Search books
   */
  const searchBooks = async (query: string): Promise<void> => {
    await loadBooks({ page: 1, search: query });
  };

  /**
   * Filter books by author
   */
  const filterByAuthor = async (authorId: string): Promise<void> => {
    await loadBooks({ page: 1, authorId });
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
    loadBooks({
      page: currentPage.value,
      search: searchQuery.value,
      authorId: authorFilter.value,
    });
  };

  /**
   * Go to next page
   */
  const nextPage = (): void => {
    if (currentPage.value < totalPages.value) {
      loadBooks({
        page: currentPage.value + 1,
        search: searchQuery.value,
        authorId: authorFilter.value,
      });
    }
  };

  /**
   * Go to previous page
   */
  const prevPage = (): void => {
    if (currentPage.value > 1) {
      loadBooks({
        page: currentPage.value - 1,
        search: searchQuery.value,
        authorId: authorFilter.value,
      });
    }
  };

  return {
    // State
    books,
    currentBook,
    loading,
    error,
    total,
    currentPage,
    pageSize,
    searchQuery,
    authorFilter,

    // Computed
    hasBooks,
    isLoading,
    hasError,
    totalPages,

    // Methods
    loadBooks,
    loadBook,
    createBook,
    updateBook,
    deleteBook,
    updateCoAuthor,
    transferAuthorship,
    searchBooks,
    filterByAuthor,
    clearError,
    refresh,
    nextPage,
    prevPage,
  };
}
