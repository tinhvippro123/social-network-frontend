<script setup lang="ts">
import { inject, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  X as XIcon,
  Ban as BanIcon, Flag as FlagIcon, Trash2 as TrashIcon,
  BellOff as BellOffIcon,
  Pin as PinIcon, Type as TypeIcon,
} from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import AccordionSection from '@/components/ui/AccordionSection.vue'
import ChatInfoHeader from './ChatInfoHeader.vue'
import ChatMediaFilesView from './ChatMediaFilesView.vue'
import ChatInfoSharedMedia from './ChatInfoSharedMedia.vue'
import ChatInfoSharedFiles from './ChatInfoSharedFiles.vue'
import NicknameModal from '@/components/NicknameModal.vue'
import { useChatNicknames } from '@/composables/chat/useChatNicknames'
import { useToast } from '@/composables/ui/useToast'
import http from '@/api/client'

const chatState = inject<any>('chatState')
if (!chatState) {
  throw new Error('ChatState is not provided')
}

const toast = useToast()
const { addToast } = toast
const showNicknameModal = ref(false)
const blockedUserIds = ref<Set<string>>(new Set())
const { setNickname } = useChatNicknames()

const {
  router: injectedRouter,
  currentUser,
  selectedConversation,
  showInfoPanel,
  showSearchInChat,
  rightSidebarView,
  pinnedMessage,
  scrollToMessage,
  muteConversation,
  blockUser,
  unblockUser,
  deleteConversation,
} = chatState

const router = injectedRouter || useRouter()

const otherParticipant = computed(() => {
  const parts = selectedConversation?.value?.participants || []
  const myId = currentUser?.value?.id
  return parts.find((p: any) => p.id !== myId) || parts[0] || null
})

const isBlocked = computed(() => {
  const targetId = otherParticipant.value?.id
  return targetId ? blockedUserIds.value.has(targetId) : false
})

function viewPinnedMessages() {
  if (pinnedMessage?.value?.id) {
    scrollToMessage(pinnedMessage.value.id)
    if (window.innerWidth < 1024) {
      showInfoPanel.value = false
    }
  } else {
    toast.info('Hiện chưa có tin nhắn nào được ghim trong cuộc trò chuyện này')
  }
}

function editNickname() {
  showNicknameModal.value = true
}

function handleSaveNickname(newNick: string) {
  if (!selectedConversation?.value) return
  setNickname(selectedConversation.value, newNick)
  if (newNick.trim()) {
    toast.success(`Đã đổi biệt danh thành "${newNick.trim()}"`)
  } else {
    toast.info('Đã gỡ bỏ biệt danh')
  }
  showNicknameModal.value = false
}

async function toggleMuteNotifications() {
  if (!selectedConversation?.value) return
  try {
    await muteConversation(selectedConversation.value.id)
    toast.info(
      selectedConversation.value.isMuted
        ? 'Đã tắt thông báo cuộc trò chuyện'
        : 'Đã bật lại thông báo cuộc trò chuyện'
    )
  } catch {
    toast.error('Không thể cập nhật cài đặt thông báo')
  }
}

async function handleToggleBlock() {
  const targetId = otherParticipant.value?.id
  if (!targetId) return
  try {
    if (isBlocked.value) {
      await unblockUser(targetId)
      blockedUserIds.value.delete(targetId)
      toast.success(`Đã bỏ chặn ${otherParticipant.value?.name || 'người dùng'}`)
    } else {
      await blockUser(targetId)
      blockedUserIds.value.add(targetId)
      toast.info(`Đã chặn ${otherParticipant.value?.name || 'người dùng'}`)
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Không thể thực hiện thao tác chặn')
  }
}

function handleViewProfile() {
  const targetId = otherParticipant.value?.id
  if (targetId) {
    router.push(`/profile/${targetId}`)
  }
}

function handleOpenSearchInChat() {
  if (showSearchInChat) {
    showSearchInChat.value = true
  }
  if (window.innerWidth < 1024) {
    showInfoPanel.value = false
  }
}

async function handleReportConversation() {
  const targetId = otherParticipant.value?.id || selectedConversation.value?.id
  if (!targetId) return
  try {
    await http.post('/reports', {
      targetId,
      type: 'USER',
      reason: `Báo cáo cuộc trò chuyện: ${selectedConversation.value?.name || ''}`
    })
    toast.success('Đã gửi báo cáo cuộc trò chuyện đến bộ phận kiểm duyệt')
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Không thể gửi báo cáo lúc này')
  }
}
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
          @view-profile="handleViewProfile"
          @toggle-mute="toggleMuteNotifications"
          @open-search="handleOpenSearchInChat"
        />

        <div class="border-t border-gray-100 dark:border-surface-700"></div>

        <!-- Accordion 1: Thông tin về đoạn chat -->
        <AccordionSection title="Thông tin về đoạn chat">
          <button @click="viewPinnedMessages" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-surface-700/50 cursor-pointer">
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
            <button @click="editNickname" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-surface-700/50 cursor-pointer">
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
            <button @click="toggleMuteNotifications" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-surface-700/50 cursor-pointer">
              <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-surface-700 flex items-center justify-center shrink-0" :class="selectedConversation.isMuted ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' : ''">
                <BellOffIcon :size="16" />
              </div>
              <div class="flex-1 text-left min-w-0">
                <p class="truncate">{{ selectedConversation.isMuted ? 'Bật thông báo' : 'Tắt thông báo' }}</p>
              </div>
            </button>

            <button
              v-if="!selectedConversation.isGroup && otherParticipant"
              @click="handleToggleBlock"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-surface-700/50 cursor-pointer"
            >
              <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-surface-700 flex items-center justify-center shrink-0" :class="isBlocked ? 'text-red-500 bg-red-50 dark:bg-red-950/30' : ''">
                <BanIcon :size="16" />
              </div>
              <div class="flex-1 text-left min-w-0">
                <p class="truncate">{{ isBlocked ? 'Bỏ chặn người dùng' : 'Chặn người dùng' }}</p>
              </div>
            </button>

            <button @click="handleReportConversation" class="w-full flex items-start gap-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex-col text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer">
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
              class="w-full flex items-start gap-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex-col text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer"
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

  <!-- Nickname Modal -->
  <NicknameModal
    v-if="selectedConversation"
    :show="showNicknameModal"
    :user-name="selectedConversation.originalName || selectedConversation.name"
    :user-avatar="selectedConversation.avatar"
    :current-nickname="selectedConversation.nickname"
    @close="showNicknameModal = false"
    @save="handleSaveNickname"
  />
</template>
