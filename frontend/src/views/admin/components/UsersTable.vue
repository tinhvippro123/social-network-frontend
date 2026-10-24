<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { UserCheck, Ban, Trash2, Users, ShieldCheck, Loader2 } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import UsersTableSkeletonRow from './UsersTableSkeletonRow.vue'
import { formatDate } from '@/utils/formatters'

const props = defineProps<{
  users: any[]
  isLoading: boolean
  busyUserId?: string | null
  isSelf?: (user: any) => boolean
}>()

const emit = defineEmits<{
  (e: 'change-role', user: any, role: string): void
  (e: 'toggle-ban', user: any): void
  (e: 'delete', user: any): void
}>()

const router = useRouter()
const editingRoleId = ref<string | null>(null)

const ROLE_OPTIONS = [
  { value: 'user', label: 'Thành viên' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'admin', label: 'Admin' },
]

/** Admin accounts and the current admin are protected by the backend. */
const isProtected = (user: any) => user.role === 'admin' || !!props.isSelf?.(user)

function onRoleSelected(user: any, event: Event) {
  const role = (event.target as HTMLSelectElement).value
  editingRoleId.value = null
  if (role === 'admin' && !window.confirm(`Cấp quyền Admin cho "${user.name}"? Tài khoản Admin không thể bị hạ quyền sau đó.`)) return
  emit('change-role', user, role)
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full table-fixed min-w-[760px]">
      <thead>
        <tr class="border-b border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800/50">
          <th class="w-[25%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Người dùng</th>
          <th class="w-[20%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden sm:table-cell">Email</th>
          <th class="w-[13%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Vai trò</th>
          <th class="w-[8%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden md:table-cell">Bài viết</th>
          <th class="w-[12%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5 hidden lg:table-cell">Ngày tham gia</th>
          <th class="w-[12%] text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Trạng thái</th>
          <th class="w-[10%] text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3.5">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="isLoading && !users.length">
          <UsersTableSkeletonRow v-for="i in 8" :key="i" />
        </template>
        <template v-else-if="users.length">
          <tr v-for="user in users" :key="user.id"
            :class="['border-b border-gray-100 dark:border-surface-700 hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors', busyUserId === user.id && 'opacity-60 pointer-events-none']">
            <td class="py-3 px-4">
              <button type="button" class="flex items-center gap-3 text-left group" @click="router.push(`/profile/${user.id}`)">
                <UserAvatar :user="user" size="md" />
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-red-500 transition-colors">
                    {{ user.name }}
                    <span v-if="isSelf?.(user)" class="ml-1 text-[10px] font-medium text-gray-400">(bạn)</span>
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 sm:hidden truncate">{{ user.email }}</p>
                </div>
              </button>
            </td>
            <td class="px-5 py-4 text-sm text-gray-500 hidden sm:table-cell truncate" :title="user.email">{{ user.email }}</td>
            <td class="px-5 py-4">
              <select
                v-if="editingRoleId === user.id"
                :value="user.role"
                @change="onRoleSelected(user, $event)"
                @blur="editingRoleId = null"
                class="w-full px-2 py-1 text-xs rounded-lg border border-gray-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                autofocus
              >
                <option v-for="opt in ROLE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <span v-else :class="[
                'px-2.5 py-1 rounded-lg text-xs font-medium',
                user.role === 'admin' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                user.role === 'moderator' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-400'
              ]">
                {{ user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? 'Moderator' : 'Thành viên' }}
              </span>
            </td>
            <td class="px-5 py-4 hidden md:table-cell">
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ user.postsCount ?? 0 }}</span>
              <span class="text-xs text-gray-400 ml-1">bài</span>
            </td>
            <td class="px-5 py-4 text-sm text-gray-500 hidden lg:table-cell">{{ formatDate(user.joinedAt) }}</td>
            <td class="px-5 py-4">
              <span v-if="user.active !== false" class="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-lg w-fit">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Hoạt động
              </span>
              <span v-else class="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded-lg w-fit">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Đã bị cấm
              </span>
            </td>
            <td class="px-5 py-4 text-right">
              <div v-if="busyUserId === user.id" class="flex justify-end">
                <Loader2 :size="16" class="animate-spin text-gray-400" />
              </div>
              <div v-else-if="isProtected(user)" class="flex justify-end" title="Tài khoản được bảo vệ">
                <ShieldCheck :size="16" class="text-gray-300 dark:text-surface-500" />
              </div>
              <div v-else class="flex items-center justify-end gap-1">
                <button type="button" @click="editingRoleId = editingRoleId === user.id ? null : user.id"
                  class="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-500 transition-colors" title="Phân quyền">
                  <UserCheck :size="14" />
                </button>
                <button type="button" @click="emit('toggle-ban', user)"
                  :class="['p-1.5 rounded-lg transition-colors', user.active === false ? 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-green-50 hover:text-green-500' : 'text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:text-amber-500']"
                  :title="user.active === false ? 'Gỡ cấm' : 'Cấm'">
                  <Ban :size="14" />
                </button>
                <button type="button" @click="emit('delete', user)"
                  class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors" title="Xóa">
                  <Trash2 :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </template>
        <tr v-else>
          <td colspan="7" class="px-5 py-12 text-center">
            <Users class="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">Không có người dùng nào</p>
            <p class="text-xs text-gray-500">Chưa có dữ liệu hoặc không tìm thấy người dùng phù hợp.</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
