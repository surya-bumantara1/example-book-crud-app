<template>
  <div v-if="hasError" class="error-boundary bg-red-50 border border-red-200 rounded-lg p-6">
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <svg class="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <h3 class="text-sm font-medium text-red-800">
          {{ title || 'Something went wrong' }}
        </h3>
        <div class="mt-2 text-sm text-red-700">
          <p>{{ message || 'An unexpected error occurred. Please try again.' }}</p>
        </div>
        <div class="mt-4 flex space-x-3">
          <button
            @click="retry"
            class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            Try Again
          </button>
          <button
            @click="reset"
            class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      <div class="ml-auto pl-3">
        <button
          @click="dismiss"
          class="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Error details (development only) -->
    <div v-if="showDetails && error" class="mt-4 pt-4 border-t border-red-200">
      <details class="text-xs">
        <summary class="text-red-600 cursor-pointer hover:text-red-800">
          Error Details (Development)
        </summary>
        <pre class="mt-2 p-2 bg-red-100 rounded text-red-900 overflow-auto">{{ errorDetails }}</pre>
      </details>
    </div>
  </div>

  <!-- Fallback slot for error-free content -->
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, computed, onErrorCaptured, onMounted } from 'vue';

interface Props {
  title?: string;
  message?: string;
  showDetails?: boolean;
  fallback?: any;
}

interface Emits {
  (e: 'error', error: Error): void;
  (e: 'retry'): void;
  (e: 'reset'): void;
  (e: 'dismiss'): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  message: undefined,
  showDetails: false,
  fallback: undefined,
});

const emit = defineEmits<Emits>();

// Component state
const hasError = ref(false);
const error = ref<Error | null>(null);
const errorInfo = ref<any>(null);

// Computed properties
const errorDetails = computed(() => {
  if (!error.value) return '';
  return `Error: ${error.value.message}\nStack: ${error.value.stack}`;
});

// Error capture handler
onErrorCaptured((err: Error, instance, info) => {
  hasError.value = true;
  error.value = err;
  errorInfo.value = info;

  // Emit error event for parent handling
  emit('error', err);

  // Log error for debugging
  console.error('ErrorBoundary caught an error:', err, info);

  return false; // Prevent error propagation
});

// Retry function
const retry = () => {
  hasError.value = false;
  error.value = null;
  errorInfo.value = null;
  emit('retry');
};

// Reset function
const reset = () => {
  hasError.value = false;
  error.value = null;
  errorInfo.value = null;
  emit('reset');
};

// Dismiss function
const dismiss = () => {
  hasError.value = false;
  error.value = null;
  errorInfo.value = null;
  emit('dismiss');
};

// Manual error trigger (for testing or programmatic errors)
const triggerError = (err: Error) => {
  hasError.value = true;
  error.value = err;
  emit('error', err);
};

// Expose methods for parent components
defineExpose({
  triggerError,
  retry,
  reset,
  dismiss,
});
</script>

<style scoped>
.error-boundary {
  margin: 1rem 0;
}

pre {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  max-height: 200px;
}
</style>
