<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search as SearchIcon, Plus, Users, Globe, Lock, ArrowRight } from '@lucide/vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { GROUP_FILTERS } from '@/constants/ui'
import { formatNumber } from '@/utils/formatters'
import { useGroupsView } from '@/composables/useGroupsView'

const {
  router,
  isLoading,
  showCreateModal,
  searchGroup,
  filterType,
  filteredGroups
} = useGroupsView()
</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Nhóm</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Tham gia nhóm để kết nối với cộng đồng</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary-500/25"
      >
        <Plus :size="16" />
        Tạo nhóm mới
      </button>
    </div>

    <!-- Search & Filter -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="flex-1 flex items-center gap-2 bg-white dark:bg-surface-800 rounded-xl px-4 py-2.5 border border-gray-200 dark:border-surface-700">
        <SearchIcon :size="18" class="text-gray-400" />
        <input
          v-model="searchGroup"
          type="text"
          placeholder="Tìm kiếm nhóm..."
          class="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300 placeholder-gray-400"
        />
      </div>
      <div class="flex gap-2">
        <button
          v-for="f in GROUP_FILTERS"
          :key="f.key"
          @click="filterType = f.key as any"
          :class="[
            'px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
            filterType === f.key
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
              : 'bg-white dark:bg-surface-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700 hover:bg-gray-100 dark:hover:bg-surface-700'
          ]"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Groups Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
      <!-- Skeletons -->
      <template v-if="isLoading">
        <div
          v-for="i in 6"
          :key="'sk-' + i"
          class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 overflow-hidden"
        >
          <!-- Cover -->
          <div class="relative h-32 overflow-hidden rounded-t-2xl">
            <Skeleton type="image" class="w-full h-full" rounded="rounded-none" />
          </div>
          <!-- Content -->
          <div class="p-4">
            <div class="flex items-start gap-3 -mt-10 relative z-10">
              <Skeleton type="avatar" class="w-14 h-14 ring-4 ring-white dark:ring-surface-800 shrink-0 bg-white" rounded="rounded-xl" />
              <div class="pt-7 w-full space-y-2">
                <Skeleton type="title" width="w-3/4" height="h-5" />
                <Skeleton type="text" width="w-full" />
                <Skeleton type="text" width="w-2/3" />
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-100 dark:border-surface-700">
              <Skeleton type="button" width="w-full" height="h-9" rounded="rounded-xl" />
            </div>
          </div>
        </div>
      </template>

      <!-- Actual Groups -->
      <template v-else>
        <div
          v-for="group in filteredGroups"
          :key="group.id"
          @click="router.push(`/groups/${group.id}`)"
          class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 cursor-pointer group"
        >
        <!-- Cover -->
        <div class="relative h-32 overflow-hidden rounded-t-2xl">
          <img :src="group.coverImage" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div class="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
          <div class="absolute top-3 right-3">
            <span :class="[
              'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm',
              group.isPublic ? 'bg-green-500/80 text-white' : 'bg-amber-500/80 text-white'
            ]">
              <Globe v-if="group.isPublic" :size="10" />
              <Lock v-else :size="10" />
              {{ group.isPublic ? 'Công khai' : 'Riêng tư' }}
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <div class="flex items-start gap-3 -mt-10 relative z-10">
            <img :src="group.avatar" class="w-14 h-14 object-cover rounded-xl ring-4 ring-white dark:ring-surface-800 shrink-0 bg-gray-100 dark:bg-surface-700" />
            <div class="pt-7">
              <h3 class="font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-1">
                {{ group.name }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{{ group.description }}</p>
            </div>
          </div>

          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-surface-700">
            <div class="flex items-center gap-4 text-xs text-gray-400">
              <span class="flex items-center gap-1">
                <Users :size="12" />
                {{ formatNumber(group.membersCount) }} thành viên
              </span>
              <span>{{ group.postsCount }} bài viết</span>
            </div>
            <button
              @click.stop
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                group.isJoined
                  ? 'bg-gray-100 dark:bg-surface-700 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/10'
                  : 'bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white'
              ]"
            >
              {{ group.isJoined ? 'Đã tham gia' : 'Tham gia' }}
            </button>
          </div>
        </div>
      </div>
    </template>
    </div>

    <!-- Create Group Modal -->
    <transition name="fade">
      <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showCreateModal = false">
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-surface-700 animate-slide-up max-h-[85vh] overflow-y-auto">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Tạo nhóm mới</h2>

          <div class="space-y-4">
            <!-- Group Avatar -->
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-surface-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-surface-600 cursor-pointer hover:border-primary-500 transition-colors group">
                <Users :size="24" class="text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">Ảnh đại diện nhóm</p>
                <p class="text-xs text-gray-400 mt-0.5">JPG, PNG. Tối đa 2MB</p>
                <button class="mt-1 text-xs text-primary-500 hover:text-primary-600 font-medium">Tải ảnh lên</button>
              </div>
            </div>

            <!-- Group Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên nhóm <span class="text-red-400">*</span></label>
              <input type="text" placeholder="Nhập tên nhóm..." class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả</label>
              <textarea rows="3" placeholder="Mô tả về nhóm..." class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none" />
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chủ đề</label>
              <select class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none">
                <option value="">Chọn chủ đề...</option>
                <option value="programming">💻 Lập trình</option>
                <option value="design">🎨 Thiết kế</option>
                <option value="devops">🔧 DevOps</option>
                <option value="ai">🤖 AI / Machine Learning</option>
                <option value="career">💼 Sự nghiệp</option>
                <option value="other">📌 Khác</option>
              </select>
            </div>

            <!-- Group Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Loại nhóm</label>
              <div class="flex gap-3">
                <label class="flex-1 flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-surface-600 cursor-pointer hover:border-primary-500/50 transition-colors">
                  <input type="radio" name="type" value="public" checked class="text-primary-500 focus:ring-primary-500" />
                  <Globe :size="16" class="text-green-500" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">Công khai</span>
                </label>
                <label class="flex-1 flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-surface-600 cursor-pointer hover:border-primary-500/50 transition-colors">
                  <input type="radio" name="type" value="private" class="text-primary-500 focus:ring-primary-500" />
                  <Lock :size="16" class="text-amber-500" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">Riêng tư</span>
                </label>
              </div>
            </div>

            <!-- Group Rules -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quy tắc nhóm
                <span class="text-xs text-gray-400 font-normal ml-1">(tùy chọn)</span>
              </label>
              <textarea rows="2" placeholder="Ví dụ: Không spam, Tôn trọng mọi người..." class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none" />
            </div>
          </div>

          <div class="flex items-center gap-3 mt-6">
            <button @click="showCreateModal = false" class="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-700 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all">
              Hủy
            </button>
            <button @click="showCreateModal = false" class="flex-1 py-2.5 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary-500/25">
              Tạo nhóm
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
