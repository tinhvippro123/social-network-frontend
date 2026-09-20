<script setup lang="ts">
import { inject } from 'vue'
import {
  X as XIcon, Image as ImageIcon, FileText as FileTextIcon,
  Users as UsersIcon, ChevronDown as ChevronDownIcon,
  Ban as BanIcon, Flag as FlagIcon, Trash2 as TrashIcon,
  ArrowLeft as ArrowLeftIcon, Download as DownloadIcon
} from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'

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
        <div class="p-4 border-b border-gray-100 dark:border-surface-700">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ImageIcon :size="16" /> File phương tiện
            </h3>
          </div>
          <div class="grid grid-cols-3 gap-1.5">
            <template v-if="sharedMedia.length === 0">
              <div class="col-span-3 text-center text-xs text-gray-400 py-4">Chưa có ảnh/video nào</div>
            </template>
            <template v-else>
              <img
                v-for="media in sharedMedia.slice(0, 3)"
                :key="media.id"
                :src="media.imageUrl"
                alt=""
                class="w-full aspect-square object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity border border-gray-100 dark:border-surface-700"
                @click="imagePreview = media.imageUrl || null"
              />
              <button
                v-if="sharedMedia.length > 3"
                @click="openMediaView('media')"
                class="w-full mt-1 py-1.5 col-span-3 text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
              >
                Xem tất cả ({{ sharedMedia.length }})
              </button>
            </template>
          </div>
        </div>

        <!-- Shared Files -->
        <div class="p-4 border-b border-gray-100 dark:border-surface-700">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileTextIcon :size="16" /> Tệp đính kèm
            </h3>
          </div>
          <div class="space-y-2">
            <template v-if="sharedFiles.length === 0">
              <div class="text-center text-xs text-gray-400 py-4">Chưa có tệp nào</div>
            </template>
            <template v-else>
              <div
                v-for="file in sharedFiles.slice(0, 2)"
                :key="file.id"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors cursor-pointer group"
              >
                <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-surface-700 flex items-center justify-center shrink-0">
                  <FileTextIcon :size="18" class="text-gray-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] font-medium text-gray-900 dark:text-gray-100 truncate">{{ file.fileName }}</p>
                  <p class="text-[11px] text-gray-500 mt-0.5">{{ file.fileSize }}</p>
                </div>
              </div>
              <button
                v-if="sharedFiles.length > 2"
                @click="openMediaView('files')"
                class="w-full mt-1 py-1.5 text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
              >
                Xem tất cả ({{ sharedFiles.length }})
              </button>
            </template>
          </div>
        </div>

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
      <div v-else-if="rightSidebarView === 'media_files'" class="flex flex-col h-full bg-white dark:bg-surface-800">
        <!-- Sticky Header Group -->
        <div class="sticky top-0 z-10 bg-white dark:bg-surface-800">
          <!-- Header -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-surface-700">
            <button @click="rightSidebarView = 'info'" class="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
              <ArrowLeftIcon :size="20" />
            </button>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">File phương tiện và file</h3>
          </div>

          <!-- Tabs -->
          <div class="flex px-2 pt-2 border-b border-gray-100 dark:border-surface-700">
            <button 
              @click="activeMediaTab = 'media'" 
              :class="['flex-1 pb-2 text-xs font-semibold transition-colors border-b-2', activeMediaTab === 'media' ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300']"
            >
              File phương tiện
            </button>
            <button 
              @click="activeMediaTab = 'files'" 
              :class="['flex-1 pb-2 text-xs font-semibold transition-colors border-b-2', activeMediaTab === 'files' ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300']"
            >
              File
            </button>
            <button 
              @click="activeMediaTab = 'links'" 
              :class="['flex-1 pb-2 text-xs font-semibold transition-colors border-b-2', activeMediaTab === 'links' ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300']"
            >
              Liên kết
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 p-4 space-y-6 overflow-y-auto">
          <!-- TAB: MEDIA -->
          <div v-if="activeMediaTab === 'media'">
            <div v-if="groupedSharedMedia.length === 0" class="text-center text-xs text-gray-400 py-10">Chưa có ảnh/video nào</div>
            <div v-for="group in groupedSharedMedia" :key="group.date" class="mb-4">
              <p class="text-xs font-semibold text-gray-900 dark:text-white mb-2">{{ group.date }}</p>
              <div class="grid grid-cols-3 gap-1.5">
                <img
                  v-for="media in group.items"
                  :key="media.id"
                  :src="media.imageUrl"
                  alt=""
                  class="w-full aspect-square object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity border border-gray-100 dark:border-surface-700"
                  @click="chatState.imagePreview = media.imageUrl || null"
                />
              </div>
            </div>
          </div>

          <!-- TAB: FILES -->
          <div v-else-if="activeMediaTab === 'files'">
            <div v-if="groupedSharedFiles.length === 0" class="text-center text-xs text-gray-400 py-10">Chưa có file nào</div>
            <div v-for="group in groupedSharedFiles" :key="group.date" class="mb-4">
              <p class="text-xs font-semibold text-gray-900 dark:text-white mb-2">{{ group.date }}</p>
              <div class="space-y-2">
                <div
                  v-for="file in group.items"
                  :key="file.id"
                  class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-surface-700"
                >
                  <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-surface-700 flex items-center justify-center shrink-0">
                    <FileTextIcon :size="18" class="text-gray-500 dark:text-gray-400" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-[13px] font-medium text-gray-900 dark:text-gray-100 truncate">{{ file.fileName }}</p>
                    <p class="text-[11px] text-gray-500 mt-0.5">{{ file.fileSize }} • {{ formatMessageTime(file.createdAt) }}</p>
                  </div>
                  <button @click.stop="downloadFile(file.fileUrl, file.fileName)" class="p-1.5 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-surface-600 transition-all">
                    <DownloadIcon :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB: LINKS -->
          <div v-else-if="activeMediaTab === 'links'">
            <div class="text-center text-xs text-gray-400 py-10">Chưa có liên kết nào được chia sẻ</div>
          </div>
        </div>
      </div>
    </aside>
  </Transition>
</template>
