<template>
  <div v-if="show" :class="containerClass" role="status" :aria-label="ariaLabel">
    <!-- Spinner with text -->
    <div v-if="showText" class="flex items-center space-x-3">
      <div :class="spinnerClass" :style="spinnerStyle">
        <svg
          class="animate-spin"
          :class="iconClass"
          fill="none"
          viewBox="0 0 24 24"
          :aria-hidden="true"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <span v-if="text" :class="textClass">{{ text }}</span>
    </div>

    <!-- Spinner only -->
    <div v-else :class="spinnerClass" :style="spinnerStyle">
      <svg
        class="animate-spin"
        :class="iconClass"
        fill="none"
        viewBox="0 0 24 24"
        :aria-hidden="true"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>

    <!-- Screen reader text -->
    <span class="sr-only">{{ ariaLabel || 'Loading' }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  show?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'gray' | 'white';
  text?: string;
  showText?: boolean;
  center?: boolean;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  size: 'md',
  color: 'primary',
  text: '',
  showText: false,
  center: false,
  ariaLabel: undefined,
});

// Size classes
const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

// Color classes
const colorClasses = {
  primary: 'text-blue-600',
  gray: 'text-gray-600',
  white: 'text-white',
};

// Container classes
const containerClass = computed(() => {
  const base = 'loading-spinner';
  const centerClass = props.center ? 'flex justify-center items-center' : '';
  return `${base} ${centerClass}`.trim();
});

// Spinner classes
const spinnerClass = computed(() => {
  const size = sizeClasses[props.size];
  return `inline-flex ${size}`;
});

// Icon classes
const iconClass = computed(() => {
  const color = colorClasses[props.color];
  return `${color}`;
});

// Text classes
const textClass = computed(() => {
  const color = colorClasses[props.color];
  return `text-sm ${color}`;
});

// Spinner style (for custom sizing if needed)
const spinnerStyle = computed(() => {
  return {};
});
</script>

<style scoped>
/* Ensure proper animation performance */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
