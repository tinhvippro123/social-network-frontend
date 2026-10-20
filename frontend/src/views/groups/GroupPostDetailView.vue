<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChevronLeft,
  Calendar,
  Share2,
  Check,
  Users,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from '@lucide/vue'
import groupsApi from '@/api/groups.api'
import type { GroupPostItem } from '@/api/groups.api'
import type { Group } from '@/types'
import UserAvatar from '@/components/UserAvatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { formatDate } from '@/utils/formatters'
import { useToast } from '@/composables/ui/useToast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const groupId = computed(() => route.params.id as string)
const postId = computed(() => route.params.postId as string)

const post = ref<GroupPostItem | null>(null)
const group = ref<Group | null>(null)
const relatedPosts = ref<GroupPostItem[]>([])
const isLoading = ref(true)
const copied = ref(false)

const loadData = async () => {
  if (!groupId.value || !postId.value) return
  isLoading.value = true

  try {
    const [postRes, groupRes] = await Promise.all([
      groupsApi.getPostById(groupId.value, postId.value),
      groupsApi.getById(groupId.value)
    ])
    post.value = postRes.data.data
    group.value = groupRes.data.data

    // Tải thêm các thảo luận khác trong nhóm này để hiển thị ở sidebar
    groupsApi.getPosts(groupId.value, { limit: 5 })
      .then((res) => {
        relatedPosts.value = (res.data.data || []).filter((p) => p.id !== postId.value).slice(0, 4)
      })
      .catch(() => {})
  } catch (err: any) {
    toast.error('Không thể tải bài thảo luận nhóm')
    router.replace(`/groups/${groupId.value}`)
  } finally {
    isLoading.value = false
  }
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    toast.success('Đã sao chép liên kết vào bộ nhớ tạm!')
    setTimeout(() => {
      copied.value = false
    }, 2500)
  } catch (err) {
    toast.error('Không thể sao chép liên kết')
  }
}

const goToProfile = (userId?: string) => {
  if (userId) {
    router.push(`/profile/${userId}`)
  }
}

const goToPost = (targetPostId: string) => {
  router.push(`/groups/${groupId.value}/posts/${targetPostId}`)
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
    <!-- Breadcrumbs & Back Button -->
    <div class="flex items-center justify-between gap-4 mb-6">
      <button
        @click="router.push(`/groups/${groupId}`)"
        class="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 bg-white dark:bg-surface-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-surface-700 shadow-2xs hover:shadow-sm transition-all cursor-pointer"
      >
        <ChevronLeft :size="18" />
        <span>Quay lại nhóm {{ group?.name ? `(${group.name})` : '' }}</span>
      </button>

      <button
        @click="copyLink"
        :class="[
          'inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-all cursor-pointer',
          copied
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
            : 'bg-white dark:bg-surface-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-surface-700 hover:border-primary-500/40'
        ]"
      >
        <Check v-if="copied" :size="16" class="stroke-2" />
        <Share2 v-else :size="16" />
        <span>{{ copied ? 'Đã sao chép liên kết' : 'Chia sẻ bài viết' }}</span>
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <Skeleton class="h-80 w-full rounded-3xl" />
        <Skeleton class="h-10 w-3/4 rounded-xl" />
        <Skeleton class="h-20 w-full rounded-2xl" />
        <div class="space-y-3">
          <Skeleton v-for="i in 5" :key="i" class="h-5 w-full rounded-lg" />
        </div>
      </div>
      <div class="space-y-6">
        <Skeleton class="h-56 w-full rounded-2xl" />
        <Skeleton class="h-44 w-full rounded-2xl" />
      </div>
    </div>

    <!-- Main Content Layout -->
    <div v-else-if="post" class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <!-- Article Section -->
      <article class="lg:col-span-2 space-y-6">
        <div class="bg-white dark:bg-surface-800 rounded-3xl border border-gray-200 dark:border-surface-700 overflow-hidden shadow-xs">
          <!-- Cover Image -->
          <div v-if="post.coverImage" class="relative w-full max-h-115 overflow-hidden bg-gray-100 dark:bg-surface-700">
            <img :src="post.coverImage" :alt="post.title" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>

          <div class="p-6 sm:p-8 space-y-6">
            <!-- Group Badge Header -->
            <div class="flex items-center gap-2">
              <button
                @click="router.push(`/groups/${groupId}`)"
                class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200/50 dark:border-primary-800/40 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors cursor-pointer"
              >
                <span>👥</span>
                <span>{{ group?.name || 'Nhóm cộng đồng' }}</span>
              </button>
              <span class="text-xs text-gray-400">• Thảo luận nhóm</span>
            </div>

            <!-- Title -->
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              {{ post.title }}
            </h1>

            <!-- Author and Date Meta Bar -->
            <div class="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-100 dark:border-surface-700/60">
              <div
                @click="goToProfile(post.author?.id)"
                class="flex items-center gap-3.5 cursor-pointer group"
                title="Xem trang cá nhân tác giả"
              >
                <UserAvatar
                  :user="(post.author as any)"
                  size="md"
                  class="ring-2 ring-primary-500/30 group-hover:ring-primary-500 transition-all"
                />
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                      {{ post.author?.name || 'Thành viên' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                    <span v-if="post.createdAt" class="flex items-center gap-1">
                      <Calendar :size="13" /> {{ formatDate(post.createdAt) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Community Badge -->
              <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-surface-700 text-xs font-medium text-gray-600 dark:text-gray-300">
                <ShieldCheck :size="15" class="text-primary-500" />
                <span>Nội dung cộng đồng</span>
              </div>
            </div>

            <!-- Post Body Content -->
            <div class="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-normal">
              {{ post.content || post.excerpt }}
            </div>

            <!-- Group Callout Footer -->
            <div class="p-5 rounded-2xl bg-linear-to-r from-primary-50 to-teal-50 dark:from-primary-950/30 dark:to-teal-950/20 border border-primary-200/50 dark:border-primary-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary-500/10 dark:bg-primary-400/20 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                  <MessageSquare :size="20" />
                </div>
                <div>
                  <h4 class="text-sm font-bold text-gray-900 dark:text-white">
                    Thảo luận thuộc nhóm {{ group?.name }}
                  </h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Gia nhập nhóm để giao lưu, trao đổi học thuật cùng tác giả và các thành viên khác.
                  </p>
                </div>
              </div>

              <button
                @click="router.push(`/groups/${groupId}`)"
                class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white gradient-primary hover:opacity-90 transition-all shadow-sm shrink-0 cursor-pointer"
              >
                <span>Xem trang nhóm</span>
                <ArrowRight :size="14" />
              </button>
            </div>
          </div>
        </div>
      </article>

      <!-- Sidebar Section -->
      <aside class="space-y-6">
        <!-- Group Card -->
        <div v-if="group" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 shadow-xs space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl overflow-hidden bg-primary-50 dark:bg-surface-700 shrink-0">
              <img v-if="group.avatar" :src="group.avatar" :alt="group.name" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full bg-linear-to-tr from-primary-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg">
                {{ group.name?.[0]?.toUpperCase() }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-gray-900 dark:text-white text-base truncate">
                {{ group.name }}
              </h3>
              <p class="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Users :size="13" class="text-primary-500" />
                <span>{{ Number(group.membersCount || 0).toLocaleString() }} thành viên</span>
              </p>
            </div>
          </div>

          <p v-if="group.description" class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
            {{ group.description }}
          </p>

          <button
            @click="router.push(`/groups/${groupId}`)"
            class="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/50 border border-primary-200/60 dark:border-primary-800/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Vào không gian nhóm</span>
            <ExternalLink :size="15" />
          </button>
        </div>

        <!-- Author Card -->
        <div v-if="post.author" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 shadow-xs space-y-3">
          <h3 class="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
            <span>✍️</span> Về tác giả
          </h3>
          <div
            @click="goToProfile(post.author.id)"
            class="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-700/60 transition-colors cursor-pointer group"
          >
            <UserAvatar :user="(post.author as any)" size="lg" class="ring-2 ring-primary-500/20 group-hover:ring-primary-500/50" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors truncate">
                {{ post.author.name }}
              </p>
              <p class="text-xs text-primary-600 dark:text-primary-400 font-medium">
                Tác giả bài viết
              </p>
            </div>
          </div>
          <button
            @click="goToProfile(post.author.id)"
            class="w-full py-2 px-3 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-surface-700 hover:bg-gray-200 dark:hover:bg-surface-600 transition-colors cursor-pointer text-center"
          >
            Xem trang cá nhân
          </button>
        </div>

        <!-- Related Discussions in this group -->
        <div v-if="relatedPosts.length" class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 shadow-xs space-y-4">
          <h3 class="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
            <span>🔥</span> Thảo luận khác cùng nhóm
          </h3>
          <div class="space-y-3">
            <div
              v-for="item in relatedPosts"
              :key="item.id"
              @click="goToPost(item.id)"
              class="group p-3 rounded-xl border border-gray-100 dark:border-surface-700/60 hover:border-primary-500/30 hover:bg-gray-50 dark:hover:bg-surface-700/50 transition-all cursor-pointer space-y-1.5"
            >
              <h4 class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-2">
                {{ item.title }}
              </h4>
              <div class="flex items-center justify-between text-[11px] text-gray-400">
                <span>{{ item.author?.name }}</span>
                <span>{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
