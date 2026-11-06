<script setup lang="ts">
import { Plus, FolderTree, Hash, Pencil, Trash2 } from '@lucide/vue'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import CategoriesManageSkeletonRow from './components/CategoriesManageSkeletonRow.vue'
import CategoriesManageRow from './components/CategoriesManageRow.vue'
import { useAdminCategories } from '@/composables/admin/useAdminCategories'

const {
  categories,
  isLoading,
  showAddModal,
  showEditModal,
  newCategoryName,
  newCategoryIcon,
  newCategoryDescription,
  editCategoryName,
  editCategoryIcon,
  editCategoryDescription,
  tags,
  isTagsLoading,
  showRenameTagModal,
  editingTagName,
  replacementTagName,
  handleAddCategory,
  openEditModal,
  handleUpdateCategory,
  handleDeleteCategory,
  openRenameTagModal,
  handleRenameTag,
  handleDeleteTag
} = useAdminCategories()
</script>

<template>
  <div class="p-6 space-y-8">
    <div>
      <AdminPageHeader
        title="Quản lý danh mục & Thẻ Tag"
        subtitle="Thêm, sửa, xóa danh mục bài viết và chuẩn hóa thẻ Tag trên toàn hệ thống"
      >
        <template #title-icon>
          <FolderTree :size="24" class="text-red-500" />
        </template>
        <template #actions>
          <button
            type="button"
            @click="showAddModal = true"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/25 cursor-pointer"
          >
            <Plus :size="16" /> Thêm danh mục
          </button>
        </template>
      </AdminPageHeader>

      <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full table-fixed">
            <thead>
              <tr class="border-b border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800/50">
                <th class="w-[5%] px-3 py-3.5"></th>
                <th class="w-[10%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Icon</th>
                <th class="w-[40%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Tên danh mục</th>
                <th class="w-[20%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Slug</th>
                <th class="w-[15%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Số bài viết</th>
                <th class="w-[10%] text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="isLoading">
                <CategoriesManageSkeletonRow v-for="i in 5" :key="i" />
              </template>
              <template v-else-if="categories.length">
                <CategoriesManageRow
                  v-for="cat in categories"
                  :key="cat.slug"
                  :category="cat"
                  @edit="openEditModal"
                  @delete="handleDeleteCategory"
                />
              </template>
              <tr v-else>
                <td colspan="6" class="px-5 py-12 text-center">
                  <FolderTree class="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">Không có danh mục nào</p>
                  <p class="text-xs text-gray-500">Hãy tạo danh mục đầu tiên.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tag Management Section -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500">
            <Hash :size="18" />
          </div>
          <div>
            <h2 class="text-base font-bold text-gray-900 dark:text-white">Quản lý thẻ Tag phổ biến</h2>
            <p class="text-xs text-gray-500">Đổi tên gộp thẻ hoặc xóa thẻ không phù hợp khỏi các bài viết</p>
          </div>
        </div>
        <span class="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-surface-700 px-3 py-1 rounded-full">
          {{ tags.length }} thẻ đang hoạt động
        </span>
      </div>

      <div v-if="isTagsLoading" class="flex flex-wrap gap-2.5 py-4">
        <div v-for="i in 8" :key="i" class="h-9 w-28 rounded-xl bg-gray-100 dark:bg-surface-700 animate-pulse" />
      </div>

      <div v-else-if="tags.length > 0" class="flex flex-wrap gap-2.5">
        <div
          v-for="tag in tags"
          :key="tag.name"
          class="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-surface-700/70 border border-gray-200 dark:border-surface-600 hover:border-red-300 dark:hover:border-red-800 transition-all"
        >
          <RouterLink :to="`/tags/${encodeURIComponent(tag.name)}`" class="text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-red-500 hover:underline">#{{ tag.name }}</RouterLink>
          <span class="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-gray-200/70 dark:bg-surface-600 text-gray-600 dark:text-gray-300">
            {{ tag.postsCount }} bài
          </span>
          <button
            type="button"
            title="Đổi tên thẻ tag"
            @click="openRenameTagModal(tag.name)"
            class="p-1 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
          >
            <Pencil :size="13" />
          </button>
          <button
            type="button"
            title="Xóa thẻ tag"
            @click="handleDeleteTag(tag.name)"
            class="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <Trash2 :size="13" />
          </button>
        </div>
      </div>

      <p v-else class="text-sm text-gray-400 py-4 text-center">Chưa có thẻ tag nào trên hệ thống.</p>
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
              <input v-model="newCategoryName" @keydown.enter="handleAddCategory" type="text" placeholder="Nhập tên danh mục..." class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả (tùy chọn)</label>
              <input v-model="newCategoryDescription" @keydown.enter="handleAddCategory" type="text" placeholder="Mô tả ngắn về danh mục..." class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-700 dark:text-gray-300" />
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button type="button" @click="showAddModal = false" class="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all cursor-pointer">Hủy</button>
            <button type="button" @click="handleAddCategory" class="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/25 cursor-pointer">Thêm</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Edit Modal -->
    <transition name="fade">
      <div v-if="showEditModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showEditModal = false">
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-surface-700 animate-slide-up">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Chỉnh sửa danh mục</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon (emoji)</label>
              <input v-model="editCategoryIcon" type="text" placeholder="💻" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên danh mục</label>
              <input v-model="editCategoryName" @keydown.enter="handleUpdateCategory" type="text" placeholder="Nhập tên danh mục..." class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả (tùy chọn)</label>
              <input v-model="editCategoryDescription" @keydown.enter="handleUpdateCategory" type="text" placeholder="Mô tả ngắn về danh mục..." class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-700 dark:text-gray-300" />
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button type="button" @click="showEditModal = false" class="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all cursor-pointer">Hủy</button>
            <button type="button" @click="handleUpdateCategory" class="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/25 cursor-pointer">Lưu thay đổi</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Rename Tag Modal -->
    <transition name="fade">
      <div v-if="showRenameTagModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showRenameTagModal = false">
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-surface-700 animate-slide-up">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Đổi tên thẻ Tag</h2>
          <p class="text-xs text-gray-500 mb-5">Tất cả bài viết gắn thẻ <strong>#{{ editingTagName }}</strong> sẽ được chuyển sang tên thẻ mới.</p>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên thẻ Tag mới</label>
            <input
              v-model="replacementTagName"
              type="text"
              placeholder="Nhập tên tag mới..."
              @keydown.enter="handleRenameTag"
              class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-700 dark:text-gray-300"
            />
          </div>
          <div class="flex gap-3 mt-6">
            <button type="button" @click="showRenameTagModal = false" class="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all cursor-pointer">Hủy</button>
            <button type="button" @click="handleRenameTag" class="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/25 cursor-pointer">Cập nhật Tag</button>
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
