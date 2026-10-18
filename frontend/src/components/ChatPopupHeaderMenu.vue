<script setup lang="ts">
import {
  MessageCircle, User as UserIcon, Edit, Users,
  BellOff, Ban, Archive, Trash2, AlertTriangle
} from '@lucide/vue'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const menuGroups = [
  [
    { icon: MessageCircle, label: 'Mở trong tab Tin nhắn' },
    { icon: UserIcon, label: 'Xem trang cá nhân' },
  ],
  [
    { icon: Edit, label: 'Biệt danh' },
  ],
  [
    { icon: Users, label: 'Tạo nhóm' },
    { icon: BellOff, label: 'Tắt thông báo' },
    { icon: Ban, label: 'Chặn' },
  ],
  [
    { icon: Archive, label: 'Lưu trữ đoạn chat' },
    { icon: Trash2, label: 'Xóa đoạn chat' },
    { icon: AlertTriangle, label: 'Báo cáo' },
  ]
]
</script>

<template>
  <div class="absolute top-2 right-full mr-2 w-80 bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 shadow-xl rounded-xl z-100 max-h-100 overflow-y-auto scrollbar-thin">
    <div class="p-2 space-y-0.5">
      <template v-for="(group, groupIdx) in menuGroups" :key="groupIdx">
        <button 
          v-for="(item, itemIdx) in group" 
          :key="itemIdx"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
        >
          <component :is="item.icon" :size="18" class="text-gray-500" />
          <span class="font-medium">{{ item.label }}</span>
        </button>
        <div v-if="groupIdx < menuGroups.length - 1" class="h-px bg-gray-200 dark:bg-surface-700 my-1.5 mx-2"></div>
      </template>
    </div>
  </div>
</template>
