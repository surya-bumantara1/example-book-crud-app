<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Authors</h1>
      <NuxtLink
        to="/authors/create"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Add Author
      </NuxtLink>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <div class="max-w-md">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Search authors..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading && !hasAuthors" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading authors...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="hasError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading authors</h3>
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

    <!-- Authors list -->
    <div v-else-if="hasAuthors" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="author in authors"
        :key="author.id"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-semibold text-gray-900">{{ author.name }}</h3>
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
            View Details →
          </NuxtLink>

          <div class="flex space-x-2">
            <NuxtLink
              :to="`/authors/${author.id}/edit`"
              class="text-gray-600 hover:text-gray-800"
            >
              Edit
            </NuxtLink>
            <button
              @click="handleDelete(author.id)"
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
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No authors found</h3>
      <p class="text-gray-600 mb-4">
        <span v-if="searchQuery">No authors match your search.</span>
        <span v-else>Get started by adding your first author.</span>
      </p>
      <NuxtLink
        v-if="!searchQuery"
        to="/authors/create"
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Add Your First Author
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
import { useAuthors } from '~/composables/useAuthors';

const {
  authors,
  loading,
  error,
  total,
  currentPage,
  searchQuery,
  hasAuthors,
  isLoading,
  hasError,
  totalPages,
  loadAuthors,
  deleteAuthor,
  searchAuthors,
  clearError,
  refresh,
  nextPage,
  prevPage,
} = useAuthors();

// Search with debounce
let searchTimeout: NodeJS.Timeout;
const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const query = target.value;

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchAuthors(query);
  }, 300);
};

// Delete author with confirmation
const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this author? This action cannot be undone.')) {
    const success = await deleteAuthor(id);
    if (success) {
      // Author was deleted successfully
    }
  }
};

// Format date for display
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

// Load initial data
onMounted(() => {
  loadAuthors();
});
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
