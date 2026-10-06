<script setup lang="ts">
import { inject, ref } from 'vue'
import {
  X as XIcon, Image as ImageIcon, FileText as FileTextIcon,
  Users as UsersIcon, ChevronDown as ChevronDownIcon,
  Ban as BanIcon, Flag as FlagIcon, Trash2 as TrashIcon,
  Search as SearchIcon, BellOff as BellOffIcon, User as UserIcon, Lock as LockIcon,
  Pin as PinIcon, Palette as PaletteIcon, Smile as SmileIcon, Type as TypeIcon,
  Shield as ShieldIcon, Clock as ClockIcon, Eye as EyeIcon, MinusCircle as MinusCircleIcon
} from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import AccordionSection from '@/components/ui/AccordionSection.vue'
import ChatInfoHeader from './ChatInfoHeader.vue'
import ChatMediaFilesView from './ChatMediaFilesView.vue'
import ChatInfoSharedMedia from './ChatInfoSharedMedia.vue'
import ChatInfoSharedFiles from './ChatInfoSharedFiles.vue'

import { useToast } from '@/composables/ui/useToast'

const chatState = inject<any>('chatState')
if (!chatState) {
  throw new Error('ChatState is not provided')
}

const { addToast } = useToast()

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
    enter-to-class="opacity-100 translate-x-0 lg:w-92"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-x-0 lg:w-92"
    leave-to-class="opacity-0 translate-x-full lg:translate-x-0 lg:w-0"
  >
    <aside v-if="showInfoPanel && selectedConversation" class="absolute inset-y-0 right-0 z-40 w-full sm:w-92 lg:relative lg:block shrink-0 bg-white dark:bg-surface-800 border-l border-gray-200 dark:border-surface-700 overflow-hidden shadow-2xl lg:shadow-none">
      
      <!-- View: Info Default -->
      <div v-if="rightSidebarView === 'info'" class="h-full overflow-y-auto custom-scrollbar">
        <!-- Close button -->
        <div class="sticky top-0 z-10 flex justify-end p-2 bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm lg:hidden">
          <button @click="showInfoPanel = false" class="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
            <XIcon :size="20" />
          </button>
        </div>

        <!-- Profile Header -->
        <ChatInfoHeader
          :conversation="selectedConversation"
          @view-profile="router.push(`/profile/${selectedConversation.id}`)"
        />

        <div class="border-t border-gray-100 dark:border-surface-700"></div>

        <!-- Accordion 1: Thông tin về đoạn chat -->
        <AccordionSection title="Thông tin về đoạn chat">
          <button class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-surface-700/50">
            <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-surface-700 flex items-center justify-center shrink-0">
              <PinIcon :size="16" />
            </div>
            <div class="flex-1 text-left min-w-0">
              <p class="truncate">Xem tin nhắn đã ghim</p>
            </div>
          </button>
        </AccordionSection>

        <!-- Accordion 2: Tùy chỉnh đoạn chat -->
        <AccordionSection title="Tùy chỉnh đoạn chat">
          <div class="space-y-0.5">
            <button class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-surface-700/50">
              <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-surface-700 flex items-center justify-center shrink-0">
                <TypeIcon :size="16" />
              </div>
              <div class="flex-1 text-left min-w-0">
                <p class="truncate">Chỉnh sửa biệt danh</p>
              </div>
            </button>
          </div>
        </AccordionSection>

        <!-- Accordion 3: File phương tiện và file -->
        <AccordionSection title="File phương tiện và file" :default-open="true">
          <ChatInfoSharedMedia />
          <div class="h-0 border-t border-gray-100 dark:border-surface-700 hidden"></div>
          <ChatInfoSharedFiles />
        </AccordionSection>

        <!-- Accordion 4: Quyền riêng tư và hỗ trợ -->
        <AccordionSection title="Quyền riêng tư và hỗ trợ">
          <div class="space-y-0.5">
            <button class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-surface-700/50">
              <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-surface-700 flex items-center justify-center shrink-0">
                <BellOffIcon :size="16" />
              </div>
              <div class="flex-1 text-left min-w-0">
                <p class="truncate">Tắt thông báo</p>
              </div>
            </button>

            <button
              v-if="!selectedConversation.isGroup"
              @click="blockUser(selectedConversation.participants[1]?.id)"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-surface-700/50"
            >
              <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-surface-700 flex items-center justify-center shrink-0">
                <BanIcon :size="16" />
              </div>
              <div class="flex-1 text-left min-w-0">
                <p class="truncate">Chặn</p>
              </div>
            </button>

            <button @click="addToast({ message: 'Tính năng báo cáo đang được phát triển', type: 'info' })" class="w-full flex items-start gap-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex-col text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
              <div class="flex items-center gap-3 w-full">
                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-red-100 text-red-500 dark:bg-red-900/30">
                  <FlagIcon :size="16" />
                </div>
                <div class="flex-1 text-left min-w-0">
                  <p class="truncate">Báo cáo</p>
                  <p class="text-xs opacity-80 mt-0.5 leading-snug wrap-break-word whitespace-normal line-clamp-2">Đóng góp ý kiến và báo cáo cuộc trò chuyện</p>
                </div>
              </div>
            </button>

            <button
              v-if="selectedConversation"
              @click="deleteConversation(selectedConversation.id); selectedConversation = null; showInfoPanel = false"
              class="w-full flex items-start gap-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex-col text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
            >
              <div class="flex items-center gap-3 w-full">
                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-red-100 text-red-500 dark:bg-red-900/30">
                  <TrashIcon :size="16" />
                </div>
                <div class="flex-1 text-left min-w-0">
                  <p class="truncate">Xóa cuộc trò chuyện</p>
                </div>
              </div>
            </button>
          </div>
        </AccordionSection>

        <!-- Group Members -->
        <AccordionSection v-if="selectedConversation.isGroup" :title="`Thành viên (${selectedConversation.participants.length})`">
          <div class="space-y-2">
            <div
              v-for="member in selectedConversation.participants"
              :key="member.id"
              @click="router.push(`/profile/${member.id}`)"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors cursor-pointer"
            >
              <UserAvatar :user="member as any" size="sm" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ member.name }}</p>
              </div>
            </div>
          </div>
        </AccordionSection>

      </div>
        
      <!-- View: Media & Files Drill-down -->
      <ChatMediaFilesView v-else-if="rightSidebarView === 'media_files'" />
    </aside>
  </Transition>
</template>
