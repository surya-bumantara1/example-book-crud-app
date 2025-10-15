<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Search</h1>
      <p class="text-gray-600">Search across books and authors in the system</p>
    </div>

    <!-- Search Controls -->
    <div class="mb-8">
      <div class="flex flex-col sm:flex-row gap-4 mb-4">
        <!-- Search Input -->
        <div class="flex-1">
          <div class="relative">
            <input
              v-model="searchQuery"
              @input="handleSearchInput"
              type="text"
              placeholder="Search books and authors..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Search Mode Toggle -->
        <div class="flex bg-gray-100 rounded-lg p-1">
          <button
            @click="searchMode = 'all'"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              searchMode === 'all'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            All
          </button>
          <button
            @click="searchMode = 'books'"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              searchMode === 'books'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Books
          </button>
          <button
            @click="searchMode = 'authors'"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              searchMode === 'authors'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Authors
          </button>
        </div>
      </div>

      <!-- Active Filters -->
      <div v-if="searchQuery" class="flex items-center justify-between text-sm text-gray-600">
        <span>
          Searching for "<strong>{{ searchQuery }}</strong>"
          <span v-if="searchMode !== 'all'">in {{ searchMode }}</span>
        </span>
        <button
          @click="clearSearch"
          class="text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear search
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !hasResults" class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Searching...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="hasError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Search Error</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          <button
            @click="retrySearch"
            class="mt-2 text-sm text-red-800 underline hover:text-red-900"
          >
            Try again
          </button>
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div v-else-if="hasResults" class="space-y-8">
      <!-- Books Results -->
      <div v-if="searchResults.books.length > 0">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">
            Books ({{ searchResults.totalBooks }})
          </h2>
          <button
            v-if="hasMoreBooks"
            @click="loadMoreBooks"
            :disabled="isLoading"
            class="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
          >
            {{ isLoading ? 'Loading...' : 'Load More' }}
          </button>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="book in searchResults.books"
            :key="book.id"
            class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {{ book.title }}
            </h3>

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

            <div class="flex justify-between items-center">
              <NuxtLink
                :to="`/books/${book.id}`"
                class="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Details →
              </NuxtLink>

              <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {{ formatDate(book.createdAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Authors Results -->
      <div v-if="searchResults.authors.length > 0">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">
            Authors ({{ searchResults.totalAuthors }})
          </h2>
          <button
            v-if="hasMoreAuthors"
            @click="loadMoreAuthors"
            :disabled="isLoading"
            class="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
          >
            {{ isLoading ? 'Loading...' : 'Load More' }}
          </button>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="author in searchResults.authors"
            :key="author.id"
            class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ author.name }}</h3>
              <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {{ formatDate(author.createdAt) }}
              </span>
            </div>

            <p v-if="author.bio" class="text-gray-600 mb-4 line-clamp-3">
              {{ author.bio }}
            </p>

            <p v-else class="text-gray-400 mb-4 italic">
              No biography available
            </p>

            <div class="flex justify-between items-center">
              <NuxtLink
                :to="`/authors/${author.id}`"
                class="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Profile →
              </NuxtLink>

              <span v-if="author.email" class="text-xs text-gray-500">
                {{ author.email }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="!hasResults && searchQuery" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.42-.98-5.91-2.5M15 19.128A9.959 9.959 0 0112 20c-2.34 0-4.42-.98-5.91-2.5" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No results found</h3>
        <p class="mt-1 text-sm text-gray-500">
          Try adjusting your search terms or browse all {{ searchMode === 'all' ? 'content' : searchMode }}.
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Start searching</h3>
      <p class="mt-1 text-sm text-gray-500">
        Enter a search term above to find books and authors.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSearch } from '~/composables/useSearch';

const {
  searchQuery,
  searchResults,
  loading,
  error,
  searchMode,
  hasResults,
  isLoading,
  hasError,
  hasMoreBooks,
  hasMoreAuthors,
  performSearch,
  loadMoreBooks,
  loadMoreAuthors,
  clearSearch,
} = useSearch();

// Search with debounce
let searchTimeout: NodeJS.Timeout;

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const query = target.value;

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    performSearch(query, searchMode.value);
  }, 300);
};

// Watch for search mode changes
watch(searchMode, (newMode) => {
  if (searchQuery.value) {
    performSearch(searchQuery.value, newMode);
  }
});

// Retry search
const retrySearch = () => {
  if (searchQuery.value) {
    performSearch(searchQuery.value, searchMode.value);
  }
};

// Format date for display
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

// Initialize with empty search on mount
onMounted(() => {
  // Component initializes with empty search
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
