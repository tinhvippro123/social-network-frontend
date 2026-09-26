<script setup lang="ts">
import { inject } from 'vue'
import {
  X as XIcon, Image as ImageIcon, FileText as FileTextIcon,
  Users as UsersIcon, ChevronDown as ChevronDownIcon,
  Ban as BanIcon, Flag as FlagIcon, Trash2 as TrashIcon
} from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import ChatMediaFilesView from './ChatMediaFilesView.vue'
import ChatInfoSharedMedia from './ChatInfoSharedMedia.vue'
import ChatInfoSharedFiles from './ChatInfoSharedFiles.vue'

const chatState = inject<any>('chatState')
if (!chatState) {
  throw new Error('ChatState is not provided')
}

const {
  router,
  selectedConversation,
  showInfoPanel,
  rightSidebarView,
  activeMediaTab,
  showMembersSection,
  sharedMedia,
  sharedFiles,
  groupedSharedMedia,
  groupedSharedFiles,
  formatMessageTime,
  openMediaView,
  viewImage,
  downloadFile,
  blockUser,
  deleteConversation,
  imagePreview
} = chatState
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-x-full lg:translate-x-0 lg:w-0"
    enter-to-class="opacity-100 translate-x-0 lg:w-80"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-x-0 lg:w-80"
    leave-to-class="opacity-0 translate-x-full lg:translate-x-0 lg:w-0"
  >
    <aside v-if="showInfoPanel && selectedConversation" class="absolute inset-y-0 right-0 z-40 w-full sm:w-80 lg:relative lg:block shrink-0 bg-white dark:bg-surface-800 border-l border-gray-200 dark:border-surface-700 overflow-hidden shadow-2xl lg:shadow-none">
      
      <!-- View: Info Default -->
      <div v-if="rightSidebarView === 'info'" class="h-full overflow-y-auto">
        <!-- Close button -->
        <div class="sticky top-0 z-10 flex justify-end p-2 bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm lg:hidden">
          <button @click="showInfoPanel = false" class="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
            <XIcon :size="20" />
          </button>
        </div>

        <!-- Profile Header -->
        <div class="flex flex-col items-center p-6 text-center border-b border-gray-100 dark:border-surface-700">
          <UserAvatar :user="{ name: selectedConversation.name, avatar: selectedConversation.avatar }" size="xl" class="mb-4" />
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ selectedConversation.name }}</h2>
          <p v-if="selectedConversation.isOnline" class="text-sm text-green-500 font-medium">Đang hoạt động</p>
          <p v-else class="text-sm text-gray-500">Hoạt động 15 phút trước</p>

          <!-- Quick Actions -->
          <div class="flex gap-6 mt-6">
            <button @click="router.push(`/profile/${selectedConversation.id}`)" class="flex flex-col items-center gap-1 text-gray-500 hover:text-primary-500 transition-colors">
              <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-surface-700 flex items-center justify-center mb-1">
                <UserAvatar :user="{ name: selectedConversation.name, avatar: selectedConversation.avatar }" size="sm" class="opacity-50 grayscale" />
              </div>
              <span class="text-[11px] font-medium">Trang cá nhân</span>
            </button>
          </div>
        </div>

        <!-- Shared Media -->
        <ChatInfoSharedMedia />

        <!-- Shared Files -->
        <div class="h-0 border-t border-gray-100 dark:border-surface-700 hidden"></div>
        <ChatInfoSharedFiles />

        <!-- Group Members -->
        <div v-if="selectedConversation.isGroup" class="border-b border-gray-100 dark:border-surface-700">
          <button @click="showMembersSection = !showMembersSection" class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors">
            <span class="flex items-center gap-2">
              <UsersIcon :size="16" />
              Thành viên ({{ selectedConversation.participants.length }})
            </span>
            <ChevronDownIcon :size="16" :class="['transition-transform', showMembersSection ? 'rotate-180' : '']" />
          </button>
          <div v-if="showMembersSection" class="px-4 pb-3 space-y-2">
            <div
              v-for="member in selectedConversation.participants"
              :key="member.id"
              @click="router.push(`/profile/${member.id}`)"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors cursor-pointer"
            >
              <UserAvatar :user="member" size="sm" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{{ member.name }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Privacy & Support -->
        <div class="py-2">
          <p class="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Quyền riêng tư</p>
          <button v-if="!selectedConversation.isGroup" @click="blockUser(selectedConversation.participants[1]?.id)" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors">
            <BanIcon :size="16" class="text-gray-400" /> Chặn
          </button>
          <button class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <FlagIcon :size="16" /> Báo cáo
          </button>
          <button v-if="selectedConversation" @click="deleteConversation(selectedConversation.id); selectedConversation = null; showInfoPanel = false" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <TrashIcon :size="16" /> Xóa cuộc trò chuyện
          </button>
        </div>
      </div>
        
      <!-- View: Media & Files Drill-down -->
      <ChatMediaFilesView v-else-if="rightSidebarView === 'media_files'" />
    </aside>
  </Transition>
</template>
