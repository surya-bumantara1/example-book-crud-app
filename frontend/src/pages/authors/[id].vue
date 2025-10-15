<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Back button -->
    <div class="mb-6">
      <NuxtLink
        to="/authors"
        class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Back to Authors
      </NuxtLink>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading author...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="hasError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading author</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          <button
            @click="loadAuthor"
            class="mt-2 text-sm text-red-800 underline hover:text-red-900"
          >
            Try again
          </button>
        </div>
      </div>
    </div>

    <!-- Author details -->
    <div v-else-if="currentAuthor" class="max-w-4xl mx-auto">
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Author header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ currentAuthor.name }}</h1>
              <p class="text-sm text-gray-500 mt-1">
                Created {{ formatDate(currentAuthor.createdAt) }}
                <span v-if="currentAuthor.updatedAt !== currentAuthor.createdAt">
                  • Updated {{ formatDate(currentAuthor.updatedAt) }}
                </span>
              </p>
            </div>
            <div class="flex space-x-2">
              <NuxtLink
                :to="`/authors/${currentAuthor.id}/edit`"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Edit Author
              </NuxtLink>
              <button
                @click="handleDelete"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Delete Author
              </button>
            </div>
          </div>
        </div>

        <!-- Author content -->
        <div class="px-6 py-6">
          <!-- Biography -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Biography</h2>
            <div v-if="currentAuthor.bio" class="prose prose-gray max-w-none">
              <p class="text-gray-700 whitespace-pre-wrap">{{ currentAuthor.bio }}</p>
            </div>
            <p v-else class="text-gray-500 italic">No biography provided.</p>
          </div>

          <!-- Contact information -->
          <div v-if="currentAuthor.email" class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Contact</h2>
            <div class="flex items-center">
              <svg class="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a :href="`mailto:${currentAuthor.email}`" class="text-blue-600 hover:text-blue-800">
                {{ currentAuthor.email }}
              </a>
            </div>
          </div>

          <!-- Statistics -->
          <div class="border-t border-gray-200 pt-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Statistics</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-gray-900">--</div>
                <div class="text-sm text-gray-600">Books as Primary Author</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-gray-900">--</div>
                <div class="text-sm text-gray-600">Books as Co-Author</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-gray-900">--</div>
                <div class="text-sm text-gray-600">Total Publications</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Books by this author -->
      <div class="mt-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900">Books by {{ currentAuthor.name }}</h2>
          <NuxtLink
            to="/books"
            class="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View All Books →
          </NuxtLink>
        </div>

        <!-- Books as Primary Author -->
        <div v-if="primaryBooks.length > 0" class="mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Primary Author</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <div
              v-for="book in primaryBooks"
              :key="book.id"
              class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h4 class="font-medium text-gray-900 mb-2">{{ book.title }}</h4>
              <p v-if="book.description" class="text-sm text-gray-600 line-clamp-2 mb-3">
                {{ book.description }}
              </p>
              <div class="flex justify-between items-center text-sm text-gray-500">
                <span>{{ formatDate(book.createdAt) }}</span>
                <NuxtLink
                  :to="`/books/${book.id}`"
                  class="text-blue-600 hover:text-blue-800"
                >
                  View →
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Books as Co-Author -->
        <div v-if="coAuthoredBooks.length > 0" class="mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Co-Author</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <div
              v-for="book in coAuthoredBooks"
              :key="book.id"
              class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h4 class="font-medium text-gray-900 mb-2">{{ book.title }}</h4>
              <p v-if="book.description" class="text-sm text-gray-600 line-clamp-2 mb-3">
                {{ book.description }}
              </p>
              <div class="flex justify-between items-center text-sm text-gray-500">
                <span>{{ formatDate(book.createdAt) }}</span>
                <NuxtLink
                  :to="`/books/${book.id}`"
                  class="text-blue-600 hover:text-blue-800"
                >
                  View →
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="primaryBooks.length === 0 && coAuthoredBooks.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No Books Yet</h3>
          <p class="mt-1 text-sm text-gray-500">
            This author hasn't published any books yet.
          </p>
          <div class="mt-6">
            <NuxtLink
              to="/books/create"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add a Book
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Not found state -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Author not found</h3>
      <p class="mt-1 text-sm text-gray-500">The author you're looking for doesn't exist or may have been deleted.</p>
      <div class="mt-6">
        <NuxtLink
          to="/authors"
          class="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Authors
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useAuthors } from '~/composables/useAuthors';

const route = useRoute();
const router = useRouter();

const {
  currentAuthor,
  loading,
  error,
  isLoading,
  hasError,
  loadAuthor,
  deleteAuthor,
  clearError,
} = useAuthors();

// Additional state for books
const primaryBooks = ref([]);
const coAuthoredBooks = ref([]);

// Get author ID from route params
const authorId = computed(() => route.params.id as string);

// Load author data
const loadAuthorData = async () => {
  if (authorId.value) {
    await loadAuthor(authorId.value);
  }
};

// Delete author with confirmation
const handleDelete = async () => {
  if (confirm('Are you sure you want to delete this author? This action cannot be undone.')) {
    const success = await deleteAuthor(authorId.value);
    if (success) {
      // Redirect to authors list after successful deletion
      await router.push('/authors');
    }
  }
};

// Format date for display
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Load author data when component mounts or route changes
onMounted(() => {
  loadAuthorData();
});

// Watch for route changes
watch(() => route.params.id, () => {
  loadAuthorData();
});
</script>

<style scoped>
.prose {
  max-width: none;
}

.prose p {
  margin-bottom: 1em;
}

.prose p:last-child {
  margin-bottom: 0;
}
</style>
