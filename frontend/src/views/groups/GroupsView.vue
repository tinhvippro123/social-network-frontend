<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus, Users, Globe, Lock, ArrowRight } from '@lucide/vue'
import { mockGroups } from '@/data/mockData'

const router = useRouter()
const searchGroup = ref('')
const showCreateModal = ref(false)
const filterType = ref<'all' | 'joined' | 'discover'>('all')

const filteredGroups = computed(() => {
  let groups = mockGroups
  if (filterType.value === 'joined') groups = groups.filter(g => g.isJoined)
  if (filterType.value === 'discover') groups = groups.filter(g => !g.isJoined)
  if (searchGroup.value) {
    groups = groups.filter(g => g.name.toLowerCase().includes(searchGroup.value.toLowerCase()))
  }
  return groups
})

const formatNumber = (num: number) => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toString()
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
        <Search :size="18" class="text-gray-400" />
        <input
          v-model="searchGroup"
          type="text"
          placeholder="Tìm kiếm nhóm..."
          class="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300 placeholder-gray-400"
        />
      </div>
      <div class="flex gap-2">
        <button
          v-for="f in [{ key: 'all', label: 'Tất cả' }, { key: 'joined', label: 'Đã tham gia' }, { key: 'discover', label: 'Khám phá' }]"
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
      <div
        v-for="group in filteredGroups"
        :key="group.id"
        @click="router.push(`/groups/${group.id}`)"
        class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 overflow-hidden hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 cursor-pointer group"
      >
        <!-- Cover -->
        <div class="relative h-32 overflow-hidden">
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
          <div class="flex items-start gap-3 -mt-8">
            <img :src="group.avatar" class="w-12 h-12 rounded-xl ring-3 ring-white dark:ring-surface-800 shrink-0 bg-gray-100 dark:bg-surface-700" />
            <div class="pt-6">
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
    </div>

    <!-- Create Group Modal -->
    <transition name="fade">
      <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showCreateModal = false">
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-surface-700 animate-slide-up">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Tạo nhóm mới</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên nhóm</label>
              <input type="text" placeholder="Nhập tên nhóm..." class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả</label>
              <textarea rows="3" placeholder="Mô tả về nhóm..." class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none" />
            </div>
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
