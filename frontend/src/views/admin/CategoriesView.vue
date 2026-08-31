<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Edit3, Trash2, GripVertical, FolderTree } from '@lucide/vue'
import { useCategories } from '@/composables/useCategories'
import { onMounted } from 'vue'

const { categories, fetchCategories } = useCategories()

onMounted(() => {
  fetchCategories()
})

const showAddModal = ref(false)
const newCategoryName = ref('')
const newCategoryIcon = ref('')
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FolderTree :size="24" class="text-red-500" />
          Quản lý danh mục
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Thêm, sửa, xóa các danh mục bài viết</p>
      </div>
      <button @click="showAddModal = true" class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/25">
        <Plus :size="16" /> Thêm danh mục
      </button>
    </div>

    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800/50">
              <th class="w-10 px-3 py-3.5"></th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Icon</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Tên danh mục</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Slug</th>
              <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Số bài viết</th>
              <th class="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in categories" :key="cat.slug" class="border-b border-gray-100 dark:border-surface-700/50 hover:bg-gray-50 dark:hover:bg-surface-700/30 transition-colors group">
              <td class="px-3 py-4 text-center">
                <GripVertical :size="16" class="text-gray-300 dark:text-surface-600 cursor-grab mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </td>
              <td class="px-5 py-4">
                <span class="text-2xl">{{ cat.icon }}</span>
              </td>
              <td class="px-5 py-4">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ cat.name }}</p>
              </td>
              <td class="px-5 py-4">
                <code class="text-xs bg-gray-100 dark:bg-surface-700 px-2 py-1 rounded text-gray-500">{{ cat.slug }}</code>
              </td>
              <td class="px-5 py-4">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ cat.postsCount }} bài</span>
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button class="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-500 transition-colors"><Edit3 :size="14" /></button>
                  <button class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors"><Trash2 :size="14" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Modal -->
    <transition name="fade">
      <div v-if="showAddModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showAddModal = false">
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-surface-700 animate-slide-up">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Thêm danh mục mới</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon (emoji)</label>
              <input v-model="newCategoryIcon" type="text" placeholder="💻" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên danh mục</label>
              <input v-model="newCategoryName" type="text" placeholder="Nhập tên danh mục..." class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-700 dark:text-gray-300" />
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="showAddModal = false" class="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all">Hủy</button>
            <button @click="showAddModal = false" class="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/25">Thêm</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
