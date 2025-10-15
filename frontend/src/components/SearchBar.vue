<template>
  <div class="relative">
    <!-- Search Trigger Button (for mobile/small screens) -->
    <button
      @click="toggleSearch"
      class="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
      :aria-label="showSearch ? 'Close search' : 'Open search'"
    >
      <svg v-if="!showSearch" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Search Input (desktop) -->
    <div class="hidden md:block relative">
      <input
        v-model="localQuery"
        @input="handleSearchInput"
        @keydown.enter="handleSearch"
        @keydown.escape="clearAndHide"
        type="text"
        placeholder="Search books and authors..."
        class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        ref="searchInput"
      />
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <button
        v-if="localQuery"
        @click="clearAndHide"
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        :aria-label="`Clear search for ${localQuery}`"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile Search Overlay -->
    <div
      v-if="showSearch"
      class="fixed inset-0 z-50 bg-white md:hidden"
    >
      <!-- Mobile Search Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Search</h2>
        <button
          @click="toggleSearch"
          class="p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile Search Input -->
      <div class="p-4">
        <div class="relative">
          <input
            v-model="localQuery"
            @input="handleSearchInput"
            @keydown.enter="handleSearch"
            type="text"
            placeholder="Search books and authors..."
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ref="searchInput"
            autofocus
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            v-if="localQuery"
            @click="clearAndHide"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Quick Search Options -->
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            @click="quickSearch('books')"
            class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
          >
            Books
          </button>
          <button
            @click="quickSearch('authors')"
            class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200"
          >
            Authors
          </button>
          <button
            @click="quickSearch('all')"
            class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200"
          >
            All
          </button>
        </div>
      </div>

      <!-- Mobile Search Results Preview -->
      <div v-if="localQuery && !isLoading" class="flex-1 overflow-y-auto">
        <div class="p-4 border-t border-gray-200">
          <div v-if="hasRecentSearches" class="mb-4">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Recent Searches</h3>
            <div class="space-y-2">
              <button
                v-for="recent in recentSearches.slice(0, 3)"
                :key="recent"
                @click="selectRecentSearch(recent)"
                class="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
              >
                {{ recent }}
              </button>
            </div>
          </div>

          <div class="text-center text-gray-500">
            <p class="text-sm">Tap search to view results</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Overlay Backdrop -->
    <div
      v-if="showSearch"
      @click="toggleSearch"
      class="fixed inset-0 bg-black bg-opacity-25 md:hidden z-40"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';

interface Props {
  initialQuery?: string;
}

interface Emits {
  (e: 'search', query: string): void;
  (e: 'search-mode-change', mode: 'all' | 'books' | 'authors'): void;
}

const props = withDefaults(defineProps<Props>(), {
  initialQuery: '',
});

const emit = defineEmits<Emits>();

const router = useRouter();

// Component state
const localQuery = ref(props.initialQuery);
const showSearch = ref(false);
const searchInput = ref<HTMLInputElement>();

// Recent searches (stored in localStorage)
const recentSearches = computed(() => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('recentSearches');
    return stored ? JSON.parse(stored) : [];
  }
  return [];
});

const hasRecentSearches = computed(() => recentSearches.value.length > 0);

// Search with debounce
let searchTimeout: NodeJS.Timeout;

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const query = target.value;

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (query.trim()) {
      addToRecentSearches(query.trim());
    }
    emit('search', query);
  }, 300);
};

// Quick search functions
const quickSearch = (mode: 'all' | 'books' | 'authors') => {
  emit('search-mode-change', mode);
  if (localQuery.value.trim()) {
    handleSearch();
  }
};

// Manual search trigger
const handleSearch = () => {
  if (localQuery.value.trim()) {
    addToRecentSearches(localQuery.value.trim());
    router.push(`/search?q=${encodeURIComponent(localQuery.value.trim())}`);
    if (showSearch.value) {
      toggleSearch();
    }
  }
};

// Recent search management
const addToRecentSearches = (query: string) => {
  if (typeof window !== 'undefined') {
    const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const filtered = searches.filter((s: string) => s !== query);
    filtered.unshift(query);
    localStorage.setItem('recentSearches', JSON.stringify(filtered.slice(0, 10)));
  }
};

const selectRecentSearch = (query: string) => {
  localQuery.value = query;
  handleSearch();
};

// Clear and hide search
const clearAndHide = () => {
  localQuery.value = '';
  if (showSearch.value) {
    toggleSearch();
  }
};

// Toggle mobile search
const toggleSearch = async () => {
  showSearch.value = !showSearch.value;

  if (showSearch.value) {
    await nextTick();
    searchInput.value?.focus();
  }
};

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // Cmd+K or Ctrl+K to focus search
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault();
    if (showSearch.value) {
      searchInput.value?.focus();
    } else {
      toggleSearch();
    }
  }

  // Escape to close search
  if (event.key === 'Escape' && showSearch.value) {
    toggleSearch();
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// Expose methods for parent components
defineExpose({
  focus: () => searchInput.value?.focus(),
  clear: () => { localQuery.value = ''; },
  toggle: toggleSearch,
});
</script>

<style scoped>
/* Ensure proper z-index layering */
.relative {
  position: relative;
  z-index: 10;
}
</style>
