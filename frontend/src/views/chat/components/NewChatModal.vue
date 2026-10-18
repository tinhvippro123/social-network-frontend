<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Search, MessageCirclePlus, Users, Check } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import UserSelectionItem from './UserSelectionItem.vue'
import usersApi from '@/api/users.api'
import type { User } from '@/types'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', participantIds: string[], name?: string, isGroup?: boolean): void
}>()

const searchQuery = ref('')
const selectedUsers = ref<User[]>([])
const allUsers = ref<User[]>([])
const isLoading = ref(false)
const isCreating = ref(false)
const chatMode = ref<'direct' | 'group'>('direct')
const groupName = ref('')

// Load users when modal opens
const loadUsers = async () => {
  isLoading.value = true
  try {
    const { data } = await usersApi.getAll()
    allUsers.value = data.data
  } catch {
    allUsers.value = []
  }
  isLoading.value = false
}

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return allUsers.value
  const q = searchQuery.value.toLowerCase()
  return allUsers.value.filter(u =>
    u.name.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
  )
})

const isSelected = (user: User) => selectedUsers.value.some(u => u.id === user.id)

const toggleUser = (user: User) => {
  if (isSelected(user)) {
    selectedUsers.value = selectedUsers.value.filter(u => u.id !== user.id)
  } else {
    if (chatMode.value === 'direct') {
      selectedUsers.value = [user]
    } else {
      selectedUsers.value.push(user)
    }
  }
}

const removeSelectedUser = (user: User) => {
  selectedUsers.value = selectedUsers.value.filter(u => u.id !== user.id)
}

const handleCreate = async () => {
  if (selectedUsers.value.length === 0) return
  isCreating.value = true
  
  const participantIds = selectedUsers.value.map(u => u.id)
  const isGroup = chatMode.value === 'group'
  const name = isGroup ? groupName.value || undefined : undefined
  
  emit('create', participantIds, name, isGroup)

  // Reset state
  setTimeout(() => {
    isCreating.value = false
    selectedUsers.value = []
    searchQuery.value = ''
    groupName.value = ''
    emit('close')
  }, 500)
}

const handleClose = () => {
  selectedUsers.value = []
  searchQuery.value = ''
  groupName.value = ''
  emit('close')
}

// Load users when shown
import { watch } from 'vue'
watch(() => props.show, (val) => {
  if (val) loadUsers()
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-200"
    enter-from-class="opacity-0"
    leave-active-class="transition duration-150"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="handleClose">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-4"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0 scale-95 translate-y-4"
      >
        <div v-if="show" class="bg-white dark:bg-surface-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-surface-700 overflow-hidden max-h-[80vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-gray-200 dark:border-surface-700 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                <MessageCirclePlus :size="20" class="text-primary-500" />
              </div>
              <div>
                <h3 class="font-bold text-gray-900 dark:text-white">Tin nhắn mới</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Chọn người để nhắn tin</p>
              </div>
            </div>
            <button @click="handleClose" class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-surface-700 text-gray-500 transition-colors">
              <X :size="20" />
            </button>
          </div>

          <!-- Mode Toggle -->
          <div class="flex gap-2 p-4 border-b border-gray-200 dark:border-surface-700 shrink-0">
            <button
              @click="chatMode = 'direct'; selectedUsers = []"
              :class="[
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                chatMode === 'direct'
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-300 dark:border-primary-700'
                  : 'bg-gray-50 dark:bg-surface-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-600 hover:bg-gray-100 dark:hover:bg-surface-600'
              ]"
            >
              <MessageCirclePlus :size="16" />
              Cá nhân
            </button>
            <button
              @click="chatMode = 'group'; selectedUsers = []"
              :class="[
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                chatMode === 'group'
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-300 dark:border-primary-700'
                  : 'bg-gray-50 dark:bg-surface-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-surface-600 hover:bg-gray-100 dark:hover:bg-surface-600'
              ]"
            >
              <Users :size="16" />
              Nhóm
            </button>
          </div>

          <!-- Group Name (if group mode) -->
          <div v-if="chatMode === 'group'" class="px-4 pt-4 shrink-0">
            <input
              v-model="groupName"
              type="text"
              placeholder="Tên nhóm (không bắt buộc)"
              class="w-full px-4 py-2.5 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
            />
          </div>

          <!-- Selected Users -->
          <div v-if="selectedUsers.length > 0" class="flex flex-wrap gap-2 px-4 pt-4 shrink-0">
            <div
              v-for="user in selectedUsers"
              :key="user.id"
              class="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-medium"
            >
              <UserAvatar :user="user" size="sm" />
              {{ user.name }}
              <button @click="removeSelectedUser(user)" class="hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-full p-0.5 transition-colors">
                <X :size="12" />
              </button>
            </div>
          </div>

          <!-- Search -->
          <div class="px-4 pt-4 shrink-0">
            <div class="flex items-center gap-2 bg-gray-100 dark:bg-surface-700 rounded-xl px-3 py-2.5">
              <Search :size="16" class="text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Tìm kiếm người dùng..."
                class="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300 placeholder-gray-400"
              />
            </div>
          </div>

          <!-- User List -->
          <div class="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
            <div v-if="isLoading" class="flex items-center justify-center py-8">
              <span class="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></span>
            </div>

            <div v-else-if="filteredUsers.length === 0" class="text-center py-8 text-gray-400 text-sm">
              Không tìm thấy người dùng
            </div>

            <UserSelectionItem
              v-else
              v-for="user in filteredUsers"
              :key="user.id"
              :user="user"
              :is-selected="isSelected(user)"
              @toggle="toggleUser"
            />
          </div>

          <!-- Footer -->
          <div class="flex items-center gap-3 p-4 border-t border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-700/50 shrink-0">
            <button
              @click="handleClose"
              class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-surface-700 border border-gray-200 dark:border-surface-600 hover:bg-gray-50 dark:hover:bg-surface-600 transition-all"
            >
              Huỷ
            </button>
            <button
              @click="handleCreate"
              :disabled="selectedUsers.length === 0 || isCreating"
              :class="[
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all',
                selectedUsers.length === 0 || isCreating
                  ? 'bg-gray-300 dark:bg-surface-600 cursor-not-allowed'
                  : 'gradient-primary hover:opacity-90 shadow-lg shadow-primary-500/25'
              ]"
            >
              <span v-if="isCreating" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <MessageCirclePlus v-else :size="16" />
              {{ isCreating ? 'Đang tạo...' : 'Bắt đầu trò chuyện' }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
