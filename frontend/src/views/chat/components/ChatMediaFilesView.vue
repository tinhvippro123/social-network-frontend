<script setup lang="ts">
import { inject } from 'vue'
import { ArrowLeft as ArrowLeftIcon, FileText as FileTextIcon, Download as DownloadIcon } from '@lucide/vue'

const chatState = inject<any>('chatState')
if (!chatState) {
  throw new Error('ChatState is not provided')
}

const {
  activeMediaTab,
  groupedSharedMedia,
  groupedSharedFiles,
  formatMessageTime,
  downloadFile
} = chatState
</script>

<template>
  <div class="flex flex-col h-full bg-white dark:bg-surface-800">
    <!-- Sticky Header Group -->
    <div class="sticky top-0 z-10 bg-white dark:bg-surface-800">
      <!-- Header -->
      <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-surface-700">
        <button @click="chatState.rightSidebarView = 'info'" class="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
          <ArrowLeftIcon :size="20" />
        </button>
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">File phương tiện và file</h3>
      </div>

      <!-- Tabs -->
      <div class="flex px-2 pt-2 border-b border-gray-100 dark:border-surface-700">
        <button 
          @click="chatState.activeMediaTab = 'media'" 
          :class="['flex-1 pb-2 text-xs font-semibold transition-colors border-b-2', chatState.activeMediaTab === 'media' ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300']"
        >
          File phương tiện
        </button>
        <button 
          @click="chatState.activeMediaTab = 'files'" 
          :class="['flex-1 pb-2 text-xs font-semibold transition-colors border-b-2', chatState.activeMediaTab === 'files' ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300']"
        >
          File
        </button>
        <button 
          @click="chatState.activeMediaTab = 'links'" 
          :class="['flex-1 pb-2 text-xs font-semibold transition-colors border-b-2', chatState.activeMediaTab === 'links' ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300']"
        >
          Liên kết
        </button>
      </div>
    </div>

    <!-- Body -->
    <div class="flex-1 p-4 space-y-6 overflow-y-auto">
      <!-- TAB: MEDIA -->
      <div v-if="chatState.activeMediaTab === 'media'">
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
      <div v-else-if="chatState.activeMediaTab === 'files'">
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
      <div v-else-if="chatState.activeMediaTab === 'links'">
        <div class="text-center text-xs text-gray-400 py-10">Chưa có liên kết nào được chia sẻ</div>
      </div>
    </div>
  </div>
</template>
