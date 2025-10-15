<template>
  <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-md p-6">
    <div class="space-y-6">
      <!-- Name Field -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
          Name *
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          minlength="2"
          maxlength="100"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :class="{ 'border-red-500': errors.name }"
          placeholder="Enter author name"
        />
        <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
      </div>

      <!-- Email Field -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :class="{ 'border-red-500': errors.email }"
          placeholder="Enter email address (optional)"
        />
        <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
      </div>

      <!-- Bio Field -->
      <div>
        <label for="bio" class="block text-sm font-medium text-gray-700 mb-2">
          Biography
        </label>
        <textarea
          id="bio"
          v-model="form.bio"
          rows="4"
          maxlength="2000"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :class="{ 'border-red-500': errors.bio }"
          placeholder="Enter author biography (optional)"
        ></textarea>
        <div class="flex justify-between mt-1">
          <p v-if="errors.bio" class="text-sm text-red-600">{{ errors.bio }}</p>
          <p v-else class="text-sm text-gray-500">{{ form.bio?.length || 0 }}/2000 characters</p>
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
            {{ isEdit ? 'Update Author' : 'Create Author' }}
          </span>
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Author, CreateAuthorInput, UpdateAuthorInput } from '~/types';

interface Props {
  author?: Author | null;
  isEdit?: boolean;
}

interface Emits {
  (e: 'submit', data: CreateAuthorInput | UpdateAuthorInput): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  author: null,
  isEdit: false,
});

const emit = defineEmits<Emits>();

// Form state
const form = ref<CreateAuthorInput>({
  name: '',
  bio: '',
  email: '',
});

const isSubmitting = ref(false);
const errors = ref<Record<string, string>>({});

// Computed properties
const isEdit = computed(() => props.isEdit);

// Initialize form with author data if editing
onMounted(() => {
  if (props.isEdit && props.author) {
    form.value = {
      name: props.author.name,
      bio: props.author.bio || '',
      email: props.author.email || '',
    };
  }
});

// Form validation
const validateForm = (): boolean => {
  errors.value = {};

  // Name validation
  if (!form.value.name.trim()) {
    errors.value.name = 'Name is required';
  } else if (form.value.name.trim().length < 2) {
    errors.value.name = 'Name must be at least 2 characters long';
  } else if (form.value.name.length > 100) {
    errors.value.name = 'Name must not exceed 100 characters';
  }

  // Email validation (if provided)
  if (form.value.email && form.value.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.value.email)) {
      errors.value.email = 'Please enter a valid email address';
    }
  }

  // Bio validation
  if (form.value.bio && form.value.bio.length > 2000) {
    errors.value.bio = 'Biography must not exceed 2000 characters';
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
    const submitData: CreateAuthorInput | UpdateAuthorInput = {
      name: form.value.name.trim(),
      ...(form.value.bio && { bio: form.value.bio.trim() }),
      ...(form.value.email && form.value.email.trim() && { email: form.value.email.trim() }),
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
    name: '',
    bio: '',
    email: '',
  };
  errors.value = {};
};

defineExpose({
  resetForm,
  validateForm,
});
</script>
