<script setup lang="ts">
import { matchesQuery } from '@/utils/textSearch'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Users,
  Search as SearchIcon,
  MoreVertical,
  User as UserIcon,
  ShieldCheck,
  Copy
} from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { useToast } from '@/composables/ui/useToast'
import { formatDate } from '@/utils/formatters'

const props = defineProps<{
  users: any[]
  isLoading: boolean
}>()

const router = useRouter()
const toast = useToast()

const searchQuery = ref('')
const activeDropdownUserId = ref<string | null>(null)

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return props.users
  return props.users.filter(u => matchesQuery(searchQuery.value, u.name, u.email, u.role))
})

function toggleDropdown(userId: string, event: Event) {
  event.stopPropagation()
  activeDropdownUserId.value = activeDropdownUserId.value === userId ? null : userId
}

function closeDropdown() {
  activeDropdownUserId.value = null
}

function openProfile(userId: string) {
  closeDropdown()
  window.open(router.resolve(`/profile/${userId}`).href, '_blank', 'noopener')
}

function navigateToAdminUsers(user: any) {
  closeDropdown()
  router.push({ path: '/admin/users', query: { search: user.name || user.email } })
}

async function copyEmail(email: string) {
  closeDropdown()
  if (!email) return
  try {
    await navigator.clipboard.writeText(email)
    toast.success(`Đã sao chép email: ${email}`)
  } catch {
    toast.info(`Email: ${email}`)
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeDropdown()
}

onMounted(() => {
  window.addEventListener('click', closeDropdown)
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown)
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 mt-6 overflow-visible">
    <div class="flex items-center justify-between p-5 border-b border-gray-200 dark:border-surface-700">
      <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Users :size="18" class="text-primary-500" />
        Quản lý người dùng
      </h3>
      <div class="flex items-center gap-2 bg-gray-100 dark:bg-surface-700 rounded-xl px-3 py-1.5">
        <SearchIcon :size="14" class="text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm người dùng..."
          class="bg-transparent border-none outline-none text-xs text-gray-600 dark:text-gray-400 placeholder-gray-400 w-36 sm:w-48"
        />
      </div>
    </div>
    <div class="overflow-x-auto overflow-y-visible">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-surface-700">
            <th class="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3">Người dùng</th>
            <th class="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3 hidden sm:table-cell">Email</th>
            <th class="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3">Vai trò</th>
            <th class="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3 hidden md:table-cell">Bài viết</th>
            <th class="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="5" class="px-5 py-4">
              <div class="space-y-3">
                <Skeleton v-for="i in 5" :key="i" class="h-12 w-full rounded-xl" />
              </div>
            </td>
          </tr>
          <template v-else-if="filteredUsers.length">
            <tr v-for="user in filteredUsers" :key="user.id" class="border-b border-gray-100 dark:border-surface-700/50 hover:bg-gray-50 dark:hover:bg-surface-700/30 transition-colors">
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <UserAvatar :user="user" size="sm" />
                  <div>
                    <button
                      type="button"
                      @click="openProfile(user.id)"
                      class="text-sm font-semibold text-gray-900 dark:text-white hover:text-primary-500 text-left transition-colors cursor-pointer"
                    >
                      {{ user.name }}
                    </button>
                    <p class="text-xs text-gray-400">Tham gia {{ formatDate(user.joinedAt) }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3 text-sm text-gray-500 hidden sm:table-cell">{{ user.email }}</td>
              <td class="px-5 py-3">
                <span :class="[
                  'px-2.5 py-1 rounded-lg text-xs font-medium',
                  user.role === 'admin' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                  user.role === 'moderator' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                  'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-400'
                ]">
                  {{ user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? 'Mod' : 'User' }}
                </span>
              </td>
              <td class="px-5 py-3 text-sm text-gray-500 hidden md:table-cell">{{ user.postsCount }}</td>
              <td class="px-5 py-3 relative">
                <button
                  type="button"
                  @click="toggleDropdown(user.id, $event)"
                  :class="[
                    'p-1.5 rounded-lg transition-colors cursor-pointer',
                    activeDropdownUserId === user.id
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400'
                      : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 hover:text-gray-600 dark:hover:text-gray-200'
                  ]"
                  title="Thao tác"
                >
                  <MoreVertical :size="16" />
                </button>

                <!-- Dropdown Menu -->
                <div
                  v-if="activeDropdownUserId === user.id"
                  @click.stop
                  class="absolute right-5 top-11 w-48 bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 rounded-xl shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100"
                >
                  <button
                    type="button"
                    @click="openProfile(user.id)"
                    class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors text-left cursor-pointer"
                  >
                    <UserIcon :size="14" class="text-gray-400 shrink-0" />
                    <span>Xem trang cá nhân</span>
                  </button>
                  <button
                    type="button"
                    @click="navigateToAdminUsers(user)"
                    class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors text-left cursor-pointer"
                  >
                    <ShieldCheck :size="14" class="text-gray-400 shrink-0" />
                    <span>Quản lý trong Admin</span>
                  </button>
                  <div class="h-px bg-gray-100 dark:bg-surface-700 my-1"></div>
                  <button
                    type="button"
                    @click="copyEmail(user.email)"
                    class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors text-left cursor-pointer"
                  >
                    <Copy :size="14" class="text-gray-400 shrink-0" />
                    <span>Sao chép Email</span>
                  </button>
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="5" class="px-5 py-8 text-center text-gray-500 text-sm">
              {{ searchQuery ? 'Không tìm thấy người dùng phù hợp' : 'Không có dữ liệu người dùng' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
