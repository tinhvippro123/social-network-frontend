<script setup lang="ts">
import { provide } from 'vue'

import { useChatView } from '@/composables/chat/useChatView'

import ChatSidebar from './components/ChatSidebar.vue'
import ChatMain from './components/ChatMain.vue'
import ChatInfoPanel from './components/ChatInfoPanel.vue'
import NewChatModal from './components/NewChatModal.vue'
import ChatCallDialog from './components/ChatCallDialog.vue'
import ChatImagePreviewModal from './components/ChatImagePreviewModal.vue'

const chatState = useChatView()
const { showCallDialog, callType, imagePreview, closeMenus, showNewChatModal, createNewConversation } = chatState

// Provide the chat state to all child components
provide('chatState', chatState)
</script>

<template>
  <div class="flex h-[calc(100vh-4rem)] overflow-hidden" @click="closeMenus">
    <ChatSidebar />
    <ChatMain />
    <ChatInfoPanel />

    <!-- Call Dialog -->
    <ChatCallDialog
      :show="showCallDialog"
      :type="callType"
      @close="showCallDialog = false"
    />

    <!-- Image Preview Modal -->
    <ChatImagePreviewModal
      :image-preview="imagePreview"
      @close="imagePreview = null"
    />

    <!-- New Chat Modal -->
    <NewChatModal
      :show="showNewChatModal"
      @close="showNewChatModal = false"
      @create="createNewConversation"
    />
  </div>
</template>
