<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeft, Users, FileText, Globe, Lock, Calendar, Shield, PenSquare, UserMinus, X, Upload, Loader2 } from '@lucide/vue'
import { GROUP_DETAIL_TABS } from '@/constants/ui'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import GroupHeader from './components/GroupHeader.vue'
import GroupCompactPost from './components/GroupCompactPost.vue'
import GroupSidebar from './components/GroupSidebar.vue'
import GroupPostModal from './components/GroupPostModal.vue'
import CreateGroupPostModal from './components/CreateGroupPostModal.vue'
import { formatDate } from '@/utils/formatters'
import { useGroupDetail } from '@/composables/groups/useGroupDetail'
import filesApi from '@/api/files.api'
import { useToast } from '@/composables/ui/useToast'

const route = useRoute()
const toast = useToast()
const {
  router,
  group,
  isGroupLoading,
  posts,
  isPostsLoading,
  users,
  isUsersLoading,
  activeTab,
  isGroupOwner,
  isGroupManager,
  canViewContent,
  handleToggleJoin,
  handleUpdateGroup,
  handleDeleteGroup,
  handleDeleteGroupPost,
  handleToggleMemberRole,
  handleRemoveMember
} = useGroupDetail()

const selectedPost = ref<any | null>(null)
const isCreatePostModalOpen = ref(false)
const isEditGroupModalOpen = ref(false)
const isUpdatingGroup = ref(false)
const editCoverInputRef = ref<HTMLInputElement | null>(null)
const editGroupForm = ref({
  name: '',
  description: '',
  avatar: '',
  coverImage: '',
  isPublic: true
})

const openEditGroupModal = () => {
  if (!group.value) return
  editGroupForm.value = {
    name: group.value.name || '',
    description: group.value.description || '',
    avatar: group.value.avatar || '',
    coverImage: group.value.coverImage || '',
    isPublic: group.value.isPublic !== false
  }
  isEditGroupModalOpen.value = true
}

const handleEditCoverUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const res = await filesApi.uploadFile(file)
    if (res.data?.data?.fileUrl) {
      editGroupForm.value.coverImage = res.data.data.fileUrl
      toast.success('Đã tải ảnh bìa nhóm lên')
    }
  } catch {
    toast.error('Không thể tải ảnh bìa lên')
  } finally {
    input.value = ''
  }
}

const submitEditGroup = async () => {
  if (!editGroupForm.value.name.trim()) {
    toast.warning('Vui lòng nhập tên nhóm')
    return
  }
  isUpdatingGroup.value = true
  try {
    const ok = await handleUpdateGroup({
      name: editGroupForm.value.name.trim(),
      description: editGroupForm.value.description.trim() || undefined,
      avatar: editGroupForm.value.avatar.trim() || group.value?.avatar || undefined,
      coverImage: editGroupForm.value.coverImage.trim() || undefined,
      isPublic: editGroupForm.value.isPublic
    })
    if (ok) {
      isEditGroupModalOpen.value = false
    }
  } finally {
    isUpdatingGroup.value = false
  }
}

const openPostModal = (post: any) => {
  selectedPost.value = post
  if (post?.id) {
    router.replace({ query: { ...route.query, post: post.id } })
  }
}

const closePostModal = () => {
  selectedPost.value = null
  const q = { ...route.query }
  delete q.post
  router.replace({ query: q })
}

const onDeleteModalPost = async (postId: string) => {
  const deleted = await handleDeleteGroupPost(postId)
  if (deleted) {
    closePostModal()
  }
}

// Check if route query has ?post=postId to auto open modal
watch([posts, () => route.query.post], ([newPosts, postId]) => {
  if (postId && newPosts?.length && !selectedPost.value) {
    const found = newPosts.find((p: any) => p.id === postId)
    if (found) {
      selectedPost.value = found
    }
  }
}, { immediate: true })

const goToProfile = (userId?: string) => {
  if (userId) {
    router.push(`/profile/${userId}`)
  }
}

const handlePostCreated = (newPost: any) => {
  if (newPost) {
    posts.value.unshift(newPost)
    if (group.value) {
      group.value.postsCount = (group.value.postsCount || 0) + 1
    }
  }
}
</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <button @click="router.push('/groups')" class="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-6 cursor-pointer">
      <ChevronLeft :size="16" /> Quay lại danh sách nhóm
    </button>

    <div v-if="isGroupLoading" class="flex flex-col lg:flex-row gap-6">
      <div class="flex-1 min-w-0 space-y-6">
        <Skeleton class="h-64 w-full rounded-2xl" />
        <Skeleton class="h-12 w-full max-w-sm rounded-xl" />
        <div class="space-y-4">
          <Skeleton v-for="i in 3" :key="i" class="h-32 w-full rounded-2xl" />
        </div>
      </div>
      <aside class="w-full lg:w-80 shrink-0 space-y-5">
        <Skeleton v-for="i in 4" :key="i" class="h-40 w-full rounded-2xl" />
      </aside>
    </div>

    <div v-else-if="group" class="flex flex-col lg:flex-row gap-6">
      <!-- Main Content -->
      <div class="flex-1 min-w-0">
        <!-- Group Header -->
        <GroupHeader
          :group="group"
          :is-owner="isGroupOwner"
          :is-manager="isGroupManager"
          @toggle-join="handleToggleJoin"
          @switch-tab="activeTab = $event"
          @edit-group="openEditGroupModal"
          @delete-group="handleDeleteGroup"
        />

        <!-- Tabs & Create Post Button -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div class="flex gap-1 flex-1 bg-white dark:bg-surface-800 rounded-xl border border-gray-200 dark:border-surface-700 p-1">
            <button
              v-for="tab in GROUP_DETAIL_TABS"
              :key="tab.key"
              @click="activeTab = tab.key as any"
              :class="[
                'flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer',
                activeTab === tab.key
                  ? 'bg-primary-500 text-white shadow-xs'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>

          <button
            v-if="group.isJoined"
            @click="isCreatePostModalOpen = true"
            class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white gradient-primary hover:opacity-90 shadow-md shadow-primary-500/20 transition-all cursor-pointer shrink-0"
          >
            <PenSquare :size="16" />
            <span>Viết bài thảo luận</span>
          </button>
        </div>

        <!-- Private Group Lock State -->
        <div
          v-if="!canViewContent && activeTab !== 'about'"
          class="text-center py-14 px-6 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700"
        >
          <Lock :size="48" class="mx-auto text-amber-500 mb-4" />
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Nhóm riêng tư</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-5">
            Chỉ thành viên của nhóm mới có thể xem các bài thảo luận và danh sách thành viên. Hãy tham gia nhóm để kết nối cùng mọi người!
          </p>
          <button
            @click="handleToggleJoin"
            class="px-5 py-2.5 text-sm font-semibold text-white gradient-primary rounded-xl cursor-pointer shadow-md shadow-primary-500/20 hover:opacity-90 transition-opacity"
          >
            Tham gia nhóm ngay
          </button>
        </div>

        <!-- Tab Content: Bài viết -->
        <div v-else-if="activeTab === 'posts'">
          <div v-if="isPostsLoading" class="space-y-4">
            <Skeleton v-for="i in 3" :key="i" class="h-32 w-full rounded-2xl" />
          </div>
          <div v-else-if="posts.length" class="space-y-4">
            <GroupCompactPost
              v-for="post in posts"
              :key="post.id"
              :post="post"
              @select="openPostModal"
            />
          </div>
          <div v-else class="text-center py-12 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700">
            <FileText :size="48" class="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Chưa có bài viết</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">Nhóm này chưa có bài viết thảo luận nào.</p>
            <button
              v-if="group.isJoined"
              @click="isCreatePostModalOpen = true"
              class="px-4 py-2 text-sm font-semibold text-white gradient-primary rounded-xl cursor-pointer shadow-xs"
            >
              Đăng bài thảo luận đầu tiên
            </button>
          </div>
        </div>

        <!-- Tab Content: Thành viên -->
        <div v-else-if="activeTab === 'members'">
          <div v-if="isUsersLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Skeleton v-for="i in 6" :key="i" class="h-16 w-full rounded-xl" />
          </div>
          <div v-else-if="users.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="item in (users as any[])"
              :key="item.user?.id || item.id"
              @click="goToProfile(item.user?.id || item.id)"
              class="flex items-center gap-3 bg-white dark:bg-surface-800 rounded-xl border border-gray-200 dark:border-surface-700 p-3 hover:border-primary-500/50 hover:shadow-md transition-all cursor-pointer group"
              title="Nhấn để xem trang cá nhân"
            >
              <UserAvatar :user="(item.user || item) as any" size="md" class="group-hover:scale-105 transition-transform" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors truncate">
                  {{ item.user?.name || item.name }}
                </p>
                <p v-if="item.joinedAt" class="text-xs text-gray-400">
                  Tham gia {{ formatDate(item.joinedAt) }}
                </p>
              </div>
              <div class="flex items-center gap-1.5 shrink-0" @click.stop>
                <span
                  :class="[
                    'text-xs font-semibold px-2.5 py-1 rounded-lg',
                    item.role === 'OWNER'
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                      : item.role === 'ADMIN'
                      ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400'
                      : 'bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-300'
                  ]"
                >
                  {{ item.role === 'OWNER' ? 'Trưởng nhóm' : item.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên' }}
                </span>
                <button
                  v-if="isGroupOwner && item.role !== 'OWNER'"
                  type="button"
                  :title="item.role === 'ADMIN' ? 'Hạ quyền quản trị' : 'Bổ nhiệm quản trị viên'"
                  @click="handleToggleMemberRole(item)"
                  class="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors cursor-pointer"
                >
                  <Shield :size="14" />
                </button>
                <button
                  v-if="isGroupManager && item.role !== 'OWNER' && (isGroupOwner || item.role !== 'ADMIN')"
                  type="button"
                  title="Mời khỏi nhóm"
                  @click="handleRemoveMember(item)"
                  class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                >
                  <UserMinus :size="14" />
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700">
            <Users :size="48" class="mx-auto text-gray-300 mb-4" />
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Chưa có thành viên</h3>
            <p class="text-gray-500">Nhóm này chưa có thành viên nào.</p>
          </div>
        </div>

        <!-- Tab Content: Giới thiệu -->
        <div v-if="activeTab === 'about'" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Giới thiệu nhóm</h3>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ group.description }}</p>
          <div class="mt-6 space-y-3">
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <Calendar :size="16" class="text-primary-500" />
              <span>Ngày tạo: {{ formatDate(group.createdAt) }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <Globe v-if="group.isPublic" :size="16" class="text-green-500" />
              <Lock v-else :size="16" class="text-amber-500" />
              <span>{{ group.isPublic ? 'Nhóm công khai — Bất kỳ ai cũng có thể xem và tham gia' : 'Nhóm riêng tư — Cần tham gia để xem thảo luận' }}</span>
            </div>
            <div
              @click="goToProfile(group.owner?.id)"
              class="flex items-center gap-3 text-sm text-gray-500 cursor-pointer hover:text-primary-500 transition-colors"
            >
              <Shield :size="16" class="text-primary-500" />
              <span>Trưởng nhóm: <strong class="text-gray-900 dark:text-white hover:underline">{{ group.owner?.name }}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <GroupSidebar
        :group="group"
        :users="users"
        :is-users-loading="isUsersLoading"
        @switch-tab="activeTab = $event"
      />
    </div>

    <div v-else class="text-center py-20 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-8">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy nhóm</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Nhóm này không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
      <button
        @click="router.push('/groups')"
        class="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-md shadow-primary-500/20 hover:opacity-90 transition-opacity cursor-pointer"
      >
        Về danh sách nhóm
      </button>
    </div>

    <!-- Modals -->
    <GroupPostModal
      :post="selectedPost"
      :group-name="group?.name"
      :can-manage="isGroupManager"
      @close="closePostModal"
      @delete="onDeleteModalPost"
    />

    <CreateGroupPostModal
      v-if="group"
      :is-open="isCreatePostModalOpen"
      :group-id="group.id"
      :group-name="group.name"
      @close="isCreatePostModalOpen = false"
      @created="handlePostCreated"
    />

    <!-- Edit Group Modal -->
    <div
      v-if="isEditGroupModalOpen && group"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      @click.self="isEditGroupModalOpen = false"
    >
      <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 shadow-2xl max-w-md w-full p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Chỉnh sửa thông tin nhóm</h3>
          <button
            type="button"
            @click="isEditGroupModalOpen = false"
            class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700 cursor-pointer"
          >
            <X :size="18" />
          </button>
        </div>

        <div class="space-y-3.5">
          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tên nhóm *</label>
            <input
              v-model="editGroupForm.name"
              type="text"
              class="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-surface-600 bg-gray-50 dark:bg-surface-700 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Mô tả nhóm</label>
            <textarea
              v-model="editGroupForm.description"
              rows="3"
              class="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-surface-600 bg-gray-50 dark:bg-surface-700 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500 resize-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Ảnh bìa nhóm (URL)</label>
            <div class="relative">
              <input
                v-model="editGroupForm.coverImage"
                type="text"
                placeholder="https://... hoặc tải ảnh lên"
                class="w-full pr-24 pl-3.5 py-2 rounded-xl border border-gray-200 dark:border-surface-600 bg-gray-50 dark:bg-surface-700 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500"
              />
              <input ref="editCoverInputRef" type="file" accept="image/*" class="hidden" @change="handleEditCoverUpload" />
              <button
                type="button"
                @click="editCoverInputRef?.click()"
                class="absolute right-1.5 top-1.5 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Upload :size="12" /> Tải ảnh
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Quyền riêng tư</label>
            <div class="flex gap-3">
              <label class="flex-1 flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer" :class="editGroupForm.isPublic ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/20' : 'border-gray-200 dark:border-surface-600'">
                <input type="radio" :value="true" v-model="editGroupForm.isPublic" />
                <Globe :size="15" class="text-green-500" />
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Công khai</span>
              </label>
              <label class="flex-1 flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer" :class="!editGroupForm.isPublic ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/20' : 'border-gray-200 dark:border-surface-600'">
                <input type="radio" :value="false" v-model="editGroupForm.isPublic" />
                <Lock :size="15" class="text-amber-500" />
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Riêng tư</span>
              </label>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            @click="isEditGroupModalOpen = false"
            class="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            :disabled="isUpdatingGroup"
            @click="submitEditGroup"
            class="px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="isUpdatingGroup" :size="15" class="animate-spin" />
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
