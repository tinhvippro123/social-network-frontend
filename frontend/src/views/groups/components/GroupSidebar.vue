<script setup lang="ts">
import { useRouter } from 'vue-router'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { formatDate } from '@/utils/formatters'

defineProps<{
  group: any
  users: any[]
  isUsersLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'switchTab', tab: 'posts' | 'members' | 'about'): void
}>()

const router = useRouter()

const goToProfile = (userId?: string) => {
  if (userId) {
    router.push(`/profile/${userId}`)
  }
}
</script>

<template>
  <aside class="w-full lg:w-80 shrink-0 space-y-5">
    <!-- Thống kê nhóm -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
      <h3 class="font-bold text-gray-900 dark:text-white mb-3 text-base flex items-center gap-2">
        <span>📊</span> Thống kê
      </h3>
      <div class="space-y-3 text-sm">
        <button
          type="button"
          @click="emit('switchTab', 'members')"
          class="w-full flex justify-between items-center py-1 border-b border-gray-100 dark:border-surface-700/60 hover:text-primary-500 dark:hover:text-primary-400 transition-colors cursor-pointer group/stat"
          title="Nhấn để xem danh sách thành viên"
        >
          <span class="text-gray-500">Thành viên</span>
          <span class="font-bold text-gray-900 dark:text-white group-hover/stat:underline">{{ Number(group.membersCount || 0).toLocaleString() }}</span>
        </button>
        <button
          type="button"
          @click="emit('switchTab', 'posts')"
          class="w-full flex justify-between items-center py-1 border-b border-gray-100 dark:border-surface-700/60 hover:text-primary-500 dark:hover:text-primary-400 transition-colors cursor-pointer group/stat"
          title="Nhấn để xem danh sách bài viết"
        >
          <span class="text-gray-500">Bài viết</span>
          <span class="font-bold text-gray-900 dark:text-white group-hover/stat:underline">{{ group.postsCount || 0 }}</span>
        </button>
        <div class="flex justify-between items-center py-1">
          <span class="text-gray-500">Ngày tạo</span>
          <span class="font-medium text-gray-700 dark:text-gray-300">{{ formatDate(group.createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Quản trị viên -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
      <h3 class="font-bold text-gray-900 dark:text-white mb-3 text-base flex items-center gap-2">
        <span>👑</span> Quản trị viên
      </h3>
      <div
        @click="goToProfile(group.owner?.id)"
        class="flex items-center gap-3 p-2.5 -m-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-700/60 transition-all cursor-pointer group border border-transparent hover:border-primary-500/20"
        title="Xem trang cá nhân trưởng nhóm"
      >
        <UserAvatar :user="group.owner" size="md" class="ring-2 ring-primary-500/30 group-hover:ring-primary-500 transition-all" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors truncate">
            {{ group.owner?.name || 'Quản trị viên' }}
          </p>
          <span class="inline-block mt-0.5 text-xs text-primary-600 dark:text-primary-400 font-semibold bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-md">
            Trưởng nhóm
          </span>
        </div>
      </div>
    </div>

    <!-- Thành viên nổi bật -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
          <span>⭐</span> Thành viên nổi bật
        </h3>
        <button
          type="button"
          @click="emit('switchTab', 'members')"
          class="text-xs text-primary-500 hover:underline cursor-pointer font-medium"
        >
          Xem tất cả
        </button>
      </div>
      <div v-if="isUsersLoading" class="space-y-3">
        <Skeleton v-for="i in 4" :key="i" class="h-10 w-full rounded-lg" />
      </div>
      <div v-else-if="users.length" class="space-y-2">
        <div
          v-for="item in users.slice(0, 5)"
          :key="item.user?.id || item.id"
          @click="goToProfile(item.user?.id || item.id)"
          class="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-700/60 transition-all cursor-pointer group border border-transparent hover:border-primary-500/20"
          title="Nhấn để xem trang cá nhân"
        >
          <UserAvatar :user="item.user || item" size="sm" class="group-hover:ring-2 ring-primary-500/30 transition-all" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors truncate">
              {{ item.user?.name || item.name }}
            </p>
            <p class="text-xs text-gray-400">
              {{ item.role === 'OWNER' ? 'Trưởng nhóm' : item.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên' }}
            </p>
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-gray-500 text-center py-4">Chưa có thành viên</div>
    </div>

    <!-- Quy tắc nhóm -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
      <h3 class="font-bold text-gray-900 dark:text-white mb-3 text-base flex items-center gap-2">
        <span>📜</span> Quy tắc nhóm
      </h3>
      <ol class="space-y-2.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        <li class="flex gap-2"><strong class="text-primary-500">1.</strong> Tôn trọng lẫn nhau trong các thảo luận</li>
        <li class="flex gap-2"><strong class="text-primary-500">2.</strong> Không spam, quảng cáo các nội dung không liên quan</li>
        <li class="flex gap-2"><strong class="text-primary-500">3.</strong> Bài viết chia sẻ kiến thức hữu ích, rõ ràng</li>
        <li class="flex gap-2"><strong class="text-primary-500">4.</strong> Tuân thủ bản quyền và chuẩn mực cộng đồng</li>
      </ol>
    </div>
  </aside>
</template>
