<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Globe, Lock, Users, Eye, Trash2 } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { formatNumber } from '@/utils/formatters'

defineProps<{
  group: any
}>()

const emit = defineEmits<{
  (e: 'delete', group: any): void
}>()

const router = useRouter()
const openInNewTab = (path: string) => window.open(router.resolve(path).href, '_blank', 'noopener')
</script>

<template>
  <tr class="border-b border-gray-100 dark:border-surface-700 hover:bg-gray-50 dark:hover:bg-surface-700/30 transition-colors">
    <td class="px-5 py-4">
      <div @click="openInNewTab(`/groups/${group.id}`)" class="flex items-center gap-3 cursor-pointer group/grp">
        <UserAvatar :user="{ name: group.name, avatar: group.avatar }" is-group size="md" />
        <div>
          <p class="text-sm font-semibold text-gray-900 dark:text-white group-hover/grp:text-primary-500 transition-colors">{{ group.name }}</p>
          <p class="text-xs text-gray-400 line-clamp-1 max-w-xs">{{ group.description }}</p>
        </div>
      </div>
    </td>
    <td class="px-5 py-4 hidden sm:table-cell">
      <span :class="['flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium w-fit',
        group.isPublic ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-600']">
        <Globe v-if="group.isPublic" :size="10" /> <Lock v-else :size="10" />
        {{ group.isPublic ? 'Công khai' : 'Riêng tư' }}
      </span>
    </td>
    <td class="px-5 py-4">
      <span class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400"><Users :size="12" /> {{ formatNumber(group.membersCount) }}</span>
    </td>
    <td class="px-5 py-4 text-sm text-gray-500 hidden md:table-cell">{{ group.postsCount }}</td>
    <td class="px-5 py-4 hidden lg:table-cell">
      <div @click="group.owner?.id && openInNewTab(`/profile/${group.owner.id}`)" class="flex items-center gap-2 cursor-pointer hover:text-primary-500">
        <UserAvatar :user="group.owner" size="sm" />
        <span class="text-xs text-gray-500 hover:underline">{{ group.owner?.name }}</span>
      </div>
    </td>
    <td class="px-5 py-4 text-right">
      <div class="flex items-center justify-end gap-1">
        <button
          type="button"
          @click="openInNewTab(`/groups/${group.id}`)"
          class="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-500 transition-colors cursor-pointer"
          title="Xem chi tiết nhóm"
        >
          <Eye :size="14" />
        </button>
        <button
          type="button"
          @click="emit('delete', group)"
          class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors cursor-pointer"
          title="Giải tán nhóm"
        >
          <Trash2 :size="14" />
        </button>
      </div>
    </td>
  </tr>
</template>
