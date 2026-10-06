<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { X, UserPlus, UserMinus, Search as SearchIcon } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { mockUsers } from '@/data/mockData'
import type { User } from '@/types'

const props = defineProps<{
  show: boolean
  type: 'followers' | 'following'
  user: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const searchQuery = ref('')

// Mock followers/following lists
const followersList = ref<(User & { isFollowing: boolean })[]>(
  mockUsers.filter(u => u.id !== 'u1').map(u => ({ ...u, isFollowing: Math.random() > 0.3 }))
)
const followingList = ref<(User & { isFollowing: boolean })[]>(
  mockUsers.filter(u => u.id !== 'u1').map(u => ({ ...u, isFollowing: true }))
)

const currentList = computed(() => {
  const list = props.type === 'followers' ? followersList.value : followingList.value
  if (!searchQuery.value) return list
  return list.filter(u =>
    u.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const title = computed(() =>
  props.type === 'followers' ? 'Người theo dõi' : 'Đang theo dõi'
)

function toggleFollow(user: User & { isFollowing: boolean }) {
  user.isFollowing = !user.isFollowing
}

function goToProfile(userId: string) {
  emit('close')
  router.push(`/profile/${userId}`)
}

// Reset search when modal opens
watch(() => props.show, (val) => {
  if (val) searchQuery.value = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="emit('close')" />

        <!-- Modal -->
        <div class="relative w-full max-w-md bg-white dark:bg-surface-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[80vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-surface-700">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ title }}</h3>
            <button @click="emit('close')" class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
              <X :size="18" />
            </button>
          </div>

          <!-- Search -->
          <div class="px-4 pt-3 pb-2">
            <div class="flex items-center gap-2 bg-gray-100 dark:bg-surface-700 rounded-xl px-3 py-2">
              <SearchIcon :size="16" class="text-gray-400 shrink-0" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Tìm kiếm..."
                class="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300 placeholder-gray-400"
              />
            </div>
          </div>

          <!-- Users List -->
          <div class="flex-1 overflow-y-auto px-2 pb-4">
            <div v-if="currentList.length === 0" class="py-12 text-center">
              <p class="text-sm text-gray-400">Không tìm thấy người dùng nào</p>
            </div>

            <div
              v-for="u in currentList"
              :key="u.id"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-colors cursor-pointer group"
            >
              <div @click="goToProfile(u.id)" class="flex items-center gap-3 flex-1 min-w-0">
                <UserAvatar :user="u" size="md" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                    {{ u.name }}
                  </p>
                  <p class="text-xs text-gray-400 truncate">{{ u.bio }}</p>
                </div>
              </div>

              <button
                @click.stop="toggleFollow(u)"
                :class="[
                  'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                  u.isFollowing
                    ? 'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                    : 'bg-primary-500 text-white hover:bg-primary-600 shadow-md shadow-primary-500/25'
                ]"
              >
                <component :is="u.isFollowing ? UserMinus : UserPlus" :size="12" />
                {{ u.isFollowing ? 'Bỏ theo dõi' : 'Theo dõi' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
