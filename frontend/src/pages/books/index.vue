<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Books</h1>
      <NuxtLink
        to="/books/create"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Add Book
      </NuxtLink>
    </div>

    <!-- Search and Filter -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Search books..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div class="sm:w-48">
        <select
          v-model="authorFilter"
          @change="handleAuthorFilter"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Authors</option>
          <option v-for="author in availableAuthors" :key="author.id" :value="author.id">
            {{ author.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading && !hasBooks" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading books...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="hasError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading books</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          <button
            @click="refresh"
            class="mt-2 text-sm text-red-800 underline hover:text-red-900"
          >
            Try again
          </button>
        </div>
      </div>
    </div>

    <!-- Books list -->
    <div v-else-if="hasBooks" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="book in books"
        :key="book.id"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-semibold text-gray-900 line-clamp-2">{{ book.title }}</h3>
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {{ formatDate(book.createdAt) }}
          </span>
        </div>

        <p v-if="book.description" class="text-gray-600 mb-4 line-clamp-3">
          {{ book.description }}
        </p>

        <p v-else class="text-gray-400 mb-4 italic">
          No description available
        </p>

        <!-- Author information -->
        <div class="mb-4 space-y-1">
          <div class="flex items-center text-sm">
            <span class="text-gray-600 mr-2">Primary Author:</span>
            <NuxtLink
              :to="`/authors/${book.primaryAuthor?.id}`"
              class="text-blue-600 hover:text-blue-800 font-medium"
            >
              {{ book.primaryAuthor?.name }}
            </NuxtLink>
          </div>
          <div v-if="book.coAuthor" class="flex items-center text-sm">
            <span class="text-gray-600 mr-2">Co-Author:</span>
            <NuxtLink
              :to="`/authors/${book.coAuthor.id}`"
              class="text-blue-600 hover:text-blue-800 font-medium"
            >
              {{ book.coAuthor.name }}
            </NuxtLink>
          </div>
        </div>

        <!-- Book metadata -->
        <div class="mb-4 text-sm text-gray-500 space-y-1">
          <div v-if="book.isbn">ISBN: {{ book.isbn }}</div>
          <div v-if="book.publishedDate">Published: {{ formatDate(book.publishedDate) }}</div>
        </div>

        <div class="flex justify-between items-center">
          <NuxtLink
            :to="`/books/${book.id}`"
            class="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Details →
          </NuxtLink>

          <div class="flex space-x-2">
            <NuxtLink
              :to="`/books/${book.id}/edit`"
              class="text-gray-600 hover:text-gray-800"
            >
              Edit
            </NuxtLink>
            <button
              @click="handleDelete(book.id)"
              class="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No books found</h3>
      <p class="text-gray-600 mb-4">
        <span v-if="searchQuery || authorFilter">No books match your current filters.</span>
        <span v-else>Get started by adding your first book.</span>
      </p>
      <NuxtLink
        v-if="!searchQuery && !authorFilter"
        to="/books/create"
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Add Your First Book
      </NuxtLink>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <div class="flex space-x-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>

        <span class="px-4 py-2 text-gray-700">
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useBooks } from '~/composables/useBooks';
import { useAuthors } from '~/composables/useAuthors';

const {
  books,
  loading,
  error,
  total,
  currentPage,
  searchQuery,
  authorFilter,
  hasBooks,
  isLoading,
  hasError,
  totalPages,
  loadBooks,
  deleteBook,
  searchBooks,
  filterByAuthor,
  clearError,
  refresh,
  nextPage,
  prevPage,
} = useBooks();

const { authors: availableAuthors } = useAuthors();

// Search with debounce
let searchTimeout: NodeJS.Timeout;
const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const query = target.value;

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchBooks(query);
  }, 300);
};

// Author filter
const handleAuthorFilter = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const authorId = target.value;
  filterByAuthor(authorId);
};

// Delete book with confirmation
const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
    const success = await deleteBook(id);
    if (success) {
      // Book was deleted successfully
    }
  }
};

// Format date for display
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

// Load initial data
onMounted(() => {
  loadBooks();
  // Also load authors for the filter dropdown
  // This would need to be implemented in the useAuthors composable
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
