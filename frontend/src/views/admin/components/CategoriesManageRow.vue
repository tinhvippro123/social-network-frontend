<script setup lang="ts">
import { GripVertical, Edit3, Trash2 } from '@lucide/vue'

defineProps<{
  category: {
    id?: string
    name: string
    slug: string
    icon: string
    postsCount: number
  }
}>()

const emit = defineEmits<{
  (e: 'edit', category: any): void
  (e: 'delete', category: any): void
}>()

const ICON_MAP: Record<string, string> = {
  laptop: '💻',
  code: '💻',
  utensils: '🍜',
  plane: '✈️',
  camera: '📷',
  'book-open': '📚',
  'gamepad-2': '🎮',
  music: '🎵',
  film: '🎬',
  heart: '❤️',
  briefcase: '💼',
  'graduation-cap': '🎓'
}

function formatCategoryIcon(icon?: string): string {
  if (!icon) return '📁'
  const key = icon.trim().toLowerCase()
  if (ICON_MAP[key]) return ICON_MAP[key]
  if (/^[a-z0-9_-]+$/i.test(key)) return '📁'
  return icon
}
</script>

<template>
  <tr class="border-b border-gray-100 dark:border-surface-700/50 hover:bg-gray-50 dark:hover:bg-surface-700/30 transition-colors group">
    <td class="px-3 py-4 text-center">
      <GripVertical :size="16" class="text-gray-300 dark:text-surface-600 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    </td>
    <td class="px-5 py-4">
      <span class="text-2xl">{{ formatCategoryIcon(category.icon) }}</span>
    </td>
    <td class="px-5 py-4">
      <RouterLink :to="`/?category=${encodeURIComponent(category.slug || category.name)}`" class="text-sm font-semibold text-gray-900 dark:text-white hover:text-red-500 hover:underline">{{ category.name }}</RouterLink>
    </td>
    <td class="px-5 py-4">
      <code class="text-xs bg-gray-100 dark:bg-surface-700 px-2 py-1 rounded text-gray-500">{{ category.slug }}</code>
    </td>
    <td class="px-5 py-4">
      <span class="text-sm text-gray-600 dark:text-gray-400">{{ category.postsCount || 0 }} bài</span>
    </td>
    <td class="px-5 py-4 text-right">
      <div class="flex items-center justify-end gap-1">
        <button
          type="button"
          @click="emit('edit', category)"
          class="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-500 transition-colors cursor-pointer"
          title="Chỉnh sửa danh mục"
        >
          <Edit3 :size="14" />
        </button>
        <button
          type="button"
          @click="emit('delete', category)"
          class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors cursor-pointer"
          title="Xóa danh mục"
        >
          <Trash2 :size="14" />
        </button>
      </div>
    </td>
  </tr>
</template>
