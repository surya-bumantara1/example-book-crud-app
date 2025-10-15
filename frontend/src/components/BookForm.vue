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
}

interface Emits {
  (e: 'submit', data: CreateBookInput | UpdateBookInput): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  book: null,
  isEdit: false,
  availableAuthors: () => [],
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

// Computed properties
const isEdit = computed(() => props.isEdit);

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
};

defineExpose({
  resetForm,
  validateForm,
});
</script>
