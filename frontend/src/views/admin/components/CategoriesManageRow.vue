<script setup lang="ts">
import { GripVertical, Edit3, Trash2 } from '@lucide/vue'

defineProps<{
  category: {
    name: string
    slug: string
    icon: string
    postsCount: number
  }
}>()
</script>

<template>
  <tr class="border-b border-gray-100 dark:border-surface-700/50 hover:bg-gray-50 dark:hover:bg-surface-700/30 transition-colors group">
    <td class="px-3 py-4 text-center">
      <GripVertical :size="16" class="text-gray-300 dark:text-surface-600 cursor-grab mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    </td>
    <td class="px-5 py-4">
      <span class="text-2xl">{{ category.icon }}</span>
    </td>
    <td class="px-5 py-4">
      <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ category.name }}</p>
    </td>
    <td class="px-5 py-4">
      <code class="text-xs bg-gray-100 dark:bg-surface-700 px-2 py-1 rounded text-gray-500">{{ category.slug }}</code>
    </td>
    <td class="px-5 py-4">
      <span class="text-sm text-gray-600 dark:text-gray-400">{{ category.postsCount }} bài</span>
    </td>
    <td class="px-5 py-4 text-right">
      <div class="flex items-center justify-end gap-1">
        <button class="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-500 transition-colors">
          <Edit3 :size="14" />
        </button>
        <button class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors">
          <Trash2 :size="14" />
        </button>
      </div>
    </td>
  </tr>
</template>
