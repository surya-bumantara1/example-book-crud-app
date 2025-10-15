<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Back button -->
    <div class="mb-6">
      <NuxtLink
        to="/books"
        class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Back to Books
      </NuxtLink>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading book...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="hasError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading book</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          <button
            @click="loadBook"
            class="mt-2 text-sm text-red-800 underline hover:text-red-900"
          >
            Try again
          </button>
        </div>
      </div>
    </div>

    <!-- Book details -->
    <div v-else-if="currentBook" class="max-w-4xl mx-auto">
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Book header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ currentBook.title }}</h1>
              <p class="text-sm text-gray-500 mt-1">
                Created {{ formatDate(currentBook.createdAt) }}
                <span v-if="currentBook.updatedAt !== currentBook.createdAt">
                  • Updated {{ formatDate(currentBook.updatedAt) }}
                </span>
              </p>
            </div>
            <div class="flex space-x-2">
              <NuxtLink
                :to="`/books/${currentBook.id}/edit`"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Edit Book
              </NuxtLink>
              <button
                @click="handleDelete"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Delete Book
              </button>
            </div>
          </div>
        </div>

        <!-- Book content -->
        <div class="px-6 py-6">
          <!-- Description -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <div v-if="currentBook.description" class="prose prose-gray max-w-none">
              <p class="text-gray-700 whitespace-pre-wrap">{{ currentBook.description }}</p>
            </div>
            <p v-else class="text-gray-500 italic">No description provided.</p>
          </div>

          <!-- Book metadata -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span class="text-gray-600">ISBN:</span>
                <span class="ml-2 text-gray-900">{{ currentBook.isbn || 'Not provided' }}</span>
              </div>
              <div>
                <span class="text-gray-600">Published:</span>
                <span class="ml-2 text-gray-900">
                  {{ currentBook.publishedDate ? formatDate(currentBook.publishedDate) : 'Not specified' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Author information -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Authors</h2>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <span class="text-sm font-medium text-blue-800">Primary Author:</span>
                  <NuxtLink
                    :to="`/authors/${currentBook.primaryAuthor?.id}`"
                    class="block text-blue-600 hover:text-blue-800 font-medium mt-1"
                  >
                    {{ currentBook.primaryAuthor?.name }}
                  </NuxtLink>
                  <p v-if="currentBook.primaryAuthor?.email" class="text-xs text-blue-600 mt-1">
                    {{ currentBook.primaryAuthor.email }}
                  </p>
                </div>
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Primary
                </span>
              </div>

              <div v-if="currentBook.coAuthor" class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <span class="text-sm font-medium text-green-800">Co-Author:</span>
                  <NuxtLink
                    :to="`/authors/${currentBook.coAuthor.id}`"
                    class="block text-green-600 hover:text-green-800 font-medium mt-1"
                  >
                    {{ currentBook.coAuthor.name }}
                  </NuxtLink>
                  <p v-if="currentBook.coAuthor.email" class="text-xs text-green-600 mt-1">
                    {{ currentBook.coAuthor.email }}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button
                    @click="handleChangeCoAuthor"
                    class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200"
                  >
                    Change
                  </button>
                  <button
                    @click="handleRemoveCoAuthor"
                    class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div v-else class="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p class="text-sm text-gray-600 mb-3">No co-author assigned to this book</p>
                <button
                  @click="handleAddCoAuthor"
                  class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  Add Co-Author
                </button>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="border-t border-gray-200 pt-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Actions</h2>
            <div class="flex flex-wrap gap-3">
              <button
                @click="handleTransferAuthorship"
                class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Transfer Authorship
              </button>
              <button
                v-if="!currentBook.coAuthor"
                @click="handleAddCoAuthor"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Add Co-Author
              </button>
              <button
                v-else
                @click="handleUpdateCoAuthor"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Change Co-Author
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Related books or author books (placeholder for future implementation) -->
      <div class="mt-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Books by {{ currentBook.primaryAuthor?.name }}</h2>
        <div class="bg-gray-50 rounded-lg p-8 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">More Books Coming Soon</h3>
          <p class="mt-1 text-sm text-gray-500">
            Related books and author bibliography features will be available after implementing User Story 5.
          </p>
          <div class="mt-6">
            <NuxtLink
              :to="`/authors/${currentBook.primaryAuthor?.id}`"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              View Author Profile
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Not found state -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Book not found</h3>
      <p class="mt-1 text-sm text-gray-500">The book you're looking for doesn't exist or may have been deleted.</p>
      <div class="mt-6">
        <NuxtLink
          to="/books"
          class="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Books
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useBooks } from '~/composables/useBooks';

const route = useRoute();
const router = useRouter();

const {
  currentBook,
  loading,
  error,
  isLoading,
  hasError,
  loadBook,
  deleteBook,
  transferAuthorship,
  updateCoAuthor,
  clearError,
} = useBooks();

// Import authors composable for co-author selection
const { authors: availableAuthors } = useAuthors();

// Get book ID from route params
const bookId = computed(() => route.params.id as string);

// Load book data
const loadBookData = async () => {
  if (bookId.value) {
    await loadBook(bookId.value);
  }
};

// Delete book with confirmation
const handleDelete = async () => {
  if (confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
    const success = await deleteBook(bookId.value);
    if (success) {
      // Redirect to books list after successful deletion
      await router.push('/books');
    }
  }
};

// Transfer authorship
const handleTransferAuthorship = async () => {
  if (!currentBook.value) return;

  // TODO: Implement authorship transfer modal with author selection
  alert('Authorship transfer modal will be implemented');
};

// Add co-author (placeholder for future implementation)
const handleAddCoAuthor = () => {
  // TODO: Implement co-author assignment UI
  alert('Co-author management will be available after implementing User Story 3');
};

// Co-author management methods
const handleChangeCoAuthor = async () => {
  // TODO: Implement co-author change modal
  alert('Co-author change modal will be implemented');
};

const handleRemoveCoAuthor = async () => {
  if (!currentBook.value) return;

  if (confirm('Are you sure you want to remove the co-author from this book?')) {
    try {
      const updatedBook = await updateCoAuthor(currentBook.value.id, null);
      if (updatedBook) {
        // Book updated successfully
        await loadBook(currentBook.value.id);
      }
    } catch (error) {
      console.error('Error removing co-author:', error);
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

// Load book data when component mounts or route changes
onMounted(() => {
  loadBookData();
});

// Watch for route changes
watch(() => route.params.id, () => {
  loadBookData();
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
