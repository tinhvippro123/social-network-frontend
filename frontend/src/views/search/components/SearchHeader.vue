<script setup lang="ts">
import { SearchIcon, ArrowLeft, X } from '@lucide/vue'
import { useRouter } from 'vue-router'

defineProps<{
  query: string
  activeTab: string
  tabs: any[]
}>()

const emit = defineEmits<{
  (e: 'update:query', value: string): void
  (e: 'update:activeTab', value: string): void
  (e: 'search'): void
}>()

const router = useRouter()
</script>

<template>
  <div class="mb-8">
    <button
      @click="router.back()"
      class="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-4"
    >
      <ArrowLeft :size="16" />
      Quay lại
    </button>

    <!-- Search Input -->
    <div class="relative mb-6">
      <SearchIcon :size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        :value="query"
        @input="emit('update:query', ($event.target as HTMLInputElement).value)"
        @keydown.enter="emit('search')"
        type="text"
        placeholder="Tìm kiếm bài viết, người dùng, tag..."
        class="w-full pl-12 pr-12 py-4 bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-lg transition-all"
        autofocus
      />
      <button
        v-if="query"
        @click="emit('update:query', '')"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X :size="20" />
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 bg-gray-100 dark:bg-surface-800 rounded-xl p-1">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="emit('update:activeTab', tab.key)"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
          activeTab === tab.key
            ? 'bg-white dark:bg-surface-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        ]"
      >
        <component :is="tab.icon" :size="16" />
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>
