<template>
  <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-md p-6">
    <div class="space-y-6">
      <!-- Title Field -->
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          minlength="1"
          maxlength="200"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :class="{ 'border-red-500': errors.title }"
          placeholder="Enter book title"
        />
        <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
      </div>

      <!-- Description Field -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          v-model="form.description"
          rows="4"
          maxlength="5000"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :class="{ 'border-red-500': errors.description }"
          placeholder="Enter book description (optional)"
        ></textarea>
        <div class="flex justify-between mt-1">
          <p v-if="errors.description" class="text-sm text-red-600">{{ errors.description }}</p>
          <p v-else class="text-sm text-gray-500">{{ form.description?.length || 0 }}/5000 characters</p>
        </div>
      </div>

      <!-- ISBN Field -->
      <div>
        <label for="isbn" class="block text-sm font-medium text-gray-700 mb-2">
          ISBN
        </label>
        <input
          id="isbn"
          v-model="form.isbn"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :class="{ 'border-red-500': errors.isbn }"
          placeholder="Enter ISBN (optional)"
        />
        <p v-if="errors.isbn" class="mt-1 text-sm text-red-600">{{ errors.isbn }}</p>
      </div>

      <!-- Published Date Field -->
      <div>
        <label for="publishedDate" class="block text-sm font-medium text-gray-700 mb-2">
          Published Date
        </label>
        <input
          id="publishedDate"
          v-model="form.publishedDate"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :class="{ 'border-red-500': errors.publishedDate }"
        />
        <p v-if="errors.publishedDate" class="mt-1 text-sm text-red-600">{{ errors.publishedDate }}</p>
      </div>

      <!-- Primary Author Field -->
      <div>
        <label for="primaryAuthorId" class="block text-sm font-medium text-gray-700 mb-2">
          Primary Author *
        </label>
        <select
          id="primaryAuthorId"
          v-model="form.primaryAuthorId"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :class="{ 'border-red-500': errors.primaryAuthorId }"
        >
          <option value="">Select Primary Author</option>
          <option v-for="author in availableAuthors" :key="author.id" :value="author.id">
            {{ author.name }}
          </option>
        </select>
        <p v-if="errors.primaryAuthorId" class="mt-1 text-sm text-red-600">{{ errors.primaryAuthorId }}</p>
      </div>

      <!-- Co-Author Field -->
      <div>
        <label for="coAuthorId" class="block text-sm font-medium text-gray-700 mb-2">
          Co-Author
        </label>
        <select
          id="coAuthorId"
          v-model="form.coAuthorId"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :class="{ 'border-red-500': errors.coAuthorId }"
        >
          <option value="">Select Co-Author (optional)</option>
          <option v-for="author in availableAuthors" :key="author.id" :value="author.id">
            {{ author.name }}
          </option>
        </select>
        <p v-if="errors.coAuthorId" class="mt-1 text-sm text-red-600">{{ errors.coAuthorId }}</p>
        <p class="mt-1 text-sm text-gray-500">
          Note: Co-author cannot be the same as the primary author
        </p>
      </div>

      <!-- Co-Author Management Actions (only show when editing existing book) -->
      <div v-if="isEdit && currentBook" class="border-t border-gray-200 pt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Co-Author Management</h3>

        <!-- Current Co-Author Display -->
        <div v-if="currentBook.coAuthor" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-green-800">Current Co-Author</p>
              <p class="text-sm text-green-700">{{ currentBook.coAuthor.name }}</p>
              <p class="text-xs text-green-600">{{ currentBook.coAuthor.email }}</p>
            </div>
            <button
              @click="handleRemoveCoAuthor"
              class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Remove Co-Author
            </button>
          </div>
        </div>

        <!-- No Co-Author State -->
        <div v-else class="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p class="text-sm text-gray-600 mb-3">No co-author assigned to this book</p>
          <button
            @click="showCoAuthorSelector = !showCoAuthorSelector"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Add Co-Author
          </button>
        </div>

        <!-- Co-Author Selector (shown when adding/updating) -->
        <div v-if="showCoAuthorSelector || (!currentBook.coAuthor && isEdit)" class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Select New Co-Author
            </label>
            <select
              v-model="selectedCoAuthorId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose an author...</option>
              <option v-for="author in availableAuthors" :key="author.id" :value="author.id">
                {{ author.name }} {{ author.email ? `(${author.email})` : '' }}
              </option>
            </select>
          </div>

          <div class="flex space-x-3">
            <button
              @click="handleUpdateCoAuthor"
              :disabled="!selectedCoAuthorId || selectedCoAuthorId === form.primaryAuthorId"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ currentBook.coAuthor ? 'Change Co-Author' : 'Add Co-Author' }}
            </button>
            <button
              v-if="showCoAuthorSelector"
              @click="showCoAuthorSelector = false"
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Authorship Transfer Section (only show when editing existing book) -->
      <div v-if="isEdit && currentBook" class="border-t border-gray-200 pt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Authorship Transfer</h3>

        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm text-amber-800">
                <strong>Transfer Authorship:</strong> Change the primary author of this book to another author.
                This action cannot be undone and will update all book records.
              </p>
            </div>
          </div>

          <div class="mt-4 flex space-x-3">
            <button
              @click="handleTransferAuthorship"
              class="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Transfer Authorship
            </button>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="errors.submit" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <p class="mt-1 text-sm text-red-700">{{ errors.submit }}</p>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          :disabled="isSubmitting"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isSubmitting" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isEdit ? 'Updating...' : 'Creating...' }}
          </span>
          <span v-else>
            {{ isEdit ? 'Update Book' : 'Create Book' }}
          </span>
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Book, CreateBookInput, UpdateBookInput, Author } from '~/types';

interface Props {
  book?: Book | null;
  isEdit?: boolean;
  availableAuthors?: Author[];
  onCoAuthorUpdate?: (bookId: string, coAuthorId: string | null) => Promise<void>;
  onAuthorshipTransfer?: (bookId: string, newPrimaryAuthorId: string) => Promise<void>;
}

interface Emits {
  (e: 'submit', data: CreateBookInput | UpdateBookInput): void;
  (e: 'cancel'): void;
  (e: 'co-author-updated', book: Book): void;
  (e: 'authorship-transferred', book: Book): void;
}

const props = withDefaults(defineProps<Props>(), {
  book: null,
  isEdit: false,
  availableAuthors: () => [],
  onCoAuthorUpdate: undefined,
  onAuthorshipTransfer: undefined,
});

const emit = defineEmits<Emits>();

// Form state
const form = ref<CreateBookInput>({
  title: '',
  description: '',
  isbn: '',
  publishedDate: '',
  primaryAuthorId: '',
  coAuthorId: '',
});

const isSubmitting = ref(false);
const errors = ref<Record<string, string>>({});

// Co-author management state
const showCoAuthorSelector = ref(false);
const selectedCoAuthorId = ref('');

// Computed properties
const isEdit = computed(() => props.isEdit);
const currentBook = computed(() => props.book);

// Initialize form with book data if editing
onMounted(() => {
  if (props.isEdit && props.book) {
    form.value = {
      title: props.book.title,
      description: props.book.description || '',
      isbn: props.book.isbn || '',
      publishedDate: props.book.publishedDate ? props.book.publishedDate.split('T')[0] : '',
      primaryAuthorId: props.book.primaryAuthorId,
      coAuthorId: props.book.coAuthorId || '',
    };
  }
});

// Form validation
const validateForm = (): boolean => {
  errors.value = {};

  // Title validation
  if (!form.value.title.trim()) {
    errors.value.title = 'Title is required';
  } else if (form.value.title.length > 200) {
    errors.value.title = 'Title must not exceed 200 characters';
  }

  // Primary author validation
  if (!form.value.primaryAuthorId) {
    errors.value.primaryAuthorId = 'Primary author is required';
  }

  // Co-author validation (if provided)
  if (form.value.coAuthorId && form.value.coAuthorId === form.value.primaryAuthorId) {
    errors.value.coAuthorId = 'Co-author cannot be the same as primary author';
  }

  // Description validation
  if (form.value.description && form.value.description.length > 5000) {
    errors.value.description = 'Description must not exceed 5000 characters';
  }

  // ISBN validation (if provided)
  if (form.value.isbn && form.value.isbn.trim()) {
    const isbnRegex = /^(?:\d{10}|\d{13})$/;
    if (!isbnRegex.test(form.value.isbn.replace(/[-\s]/g, ''))) {
      errors.value.isbn = 'ISBN must be in valid format (ISBN-10 or ISBN-13)';
    }
  }

  // Published date validation (if provided)
  if (form.value.publishedDate) {
    const publishedDate = new Date(form.value.publishedDate);
    if (isNaN(publishedDate.getTime())) {
      errors.value.publishedDate = 'Invalid date format';
    } else if (publishedDate > new Date()) {
      errors.value.publishedDate = 'Published date cannot be in the future';
    }
  }

  return Object.keys(errors.value).length === 0;
};

// Form submission
const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    // Prepare form data
    const submitData: CreateBookInput | UpdateBookInput = {
      title: form.value.title.trim(),
      ...(form.value.description && { description: form.value.description.trim() }),
      ...(form.value.isbn && form.value.isbn.trim() && { isbn: form.value.isbn.trim() }),
      ...(form.value.publishedDate && { publishedDate: form.value.publishedDate }),
      primaryAuthorId: form.value.primaryAuthorId,
      ...(form.value.coAuthorId && { coAuthorId: form.value.coAuthorId }),
    };

    emit('submit', submitData);
  } catch (error) {
    errors.value.submit = error instanceof Error ? error.message : 'An unexpected error occurred';
  } finally {
    isSubmitting.value = false;
  }
};

// Co-author management methods
const handleUpdateCoAuthor = async (): Promise<void> => {
  if (!selectedCoAuthorId.value || !currentBook.value) {
    return;
  }

  if (selectedCoAuthorId.value === form.value.primaryAuthorId) {
    errors.value.coAuthorId = 'Co-author cannot be the same as primary author';
    return;
  }

  try {
    if (props.onCoAuthorUpdate) {
      await props.onCoAuthorUpdate(currentBook.value.id, selectedCoAuthorId.value);
      showCoAuthorSelector.value = false;
      selectedCoAuthorId.value = '';
      // The parent component should emit the updated book
    }
  } catch (error) {
    errors.value.submit = error instanceof Error ? error.message : 'Failed to update co-author';
  }
};

const handleRemoveCoAuthor = async (): Promise<void> => {
  if (!currentBook.value || !props.onCoAuthorUpdate) {
    return;
  }

  try {
    await props.onCoAuthorUpdate(currentBook.value.id, null);
    // The parent component should emit the updated book
  } catch (error) {
    errors.value.submit = error instanceof Error ? error.message : 'Failed to remove co-author';
  }
};

const handleTransferAuthorship = async (): Promise<void> => {
  if (!currentBook.value || !props.onAuthorshipTransfer) {
    return;
  }

  // TODO: Implement authorship transfer modal with author selection
  // For now, show a placeholder
  alert('Authorship transfer modal will be implemented');
};

// Reset form
const resetForm = (): void => {
  form.value = {
    title: '',
    description: '',
    isbn: '',
    publishedDate: '',
    primaryAuthorId: '',
    coAuthorId: '',
  };
  errors.value = {};
  showCoAuthorSelector.value = false;
  selectedCoAuthorId.value = '';
};

defineExpose({
  resetForm,
  validateForm,
});
</script>
