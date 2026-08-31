<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, Users, FileText, Settings, Globe, Lock, Calendar, Shield, MessageCircle, Eye, ArrowUp } from '@lucide/vue'
import { useGroups } from '@/composables/useGroups'
import { usePosts } from '@/composables/usePosts'
import { useUsers } from '@/composables/useUsers'
import { onMounted } from 'vue'

const router = useRouter()
const route = useRoute()
const { currentGroup: group, fetchGroup } = useGroups()
const { posts, fetchPosts } = usePosts()
const { users, fetchUsers } = useUsers()
const activeTab = ref('posts')

onMounted(async () => {
  const groupId = route.params.id as string || '1'
  await fetchGroup(groupId)
  await fetchPosts()
  await fetchUsers()
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <button @click="router.push('/groups')" class="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-6">
      <ChevronLeft :size="16" /> Quay lại nhóm
    </button>

    <div v-if="group" class="flex flex-col lg:flex-row gap-6">
      <!-- Main Content -->
      <div class="flex-1 min-w-0">
        <!-- Group Header -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 mb-6">
          <div class="h-48 relative overflow-hidden rounded-t-2xl">
            <img :src="group.coverImage" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          </div>
          <div class="px-6 pb-6">
            <div class="flex items-start gap-4 -mt-10 relative z-10">
              <img :src="group.avatar" class="w-20 h-20 rounded-2xl ring-4 ring-white dark:ring-surface-800 bg-gray-100 dark:bg-surface-700 shrink-0" />
              <div class="flex-1 pt-12">
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ group.name }}</h1>
                  <span :class="['flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium', group.isPublic ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400']">
                    <Globe v-if="group.isPublic" :size="10" /> <Lock v-else :size="10" />
                    {{ group.isPublic ? 'Công khai' : 'Riêng tư' }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ group.description }}</p>
              </div>
              <button class="shrink-0 mt-12 px-4 py-2 rounded-xl text-sm font-medium bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all">
                {{ group.isJoined ? 'Đã tham gia' : 'Tham gia' }}
              </button>
            </div>

            <div class="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-surface-700 text-sm text-gray-400">
              <span class="flex items-center gap-1"><Users :size="14" /> {{ group.membersCount.toLocaleString() }} thành viên</span>
              <span class="flex items-center gap-1"><FileText :size="14" /> {{ group.postsCount }} bài viết</span>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 mb-6 bg-white dark:bg-surface-800 rounded-xl border border-gray-200 dark:border-surface-700 p-1">
          <button v-for="tab in [{key:'posts',label:'Bài viết'},{key:'members',label:'Thành viên'},{key:'about',label:'Giới thiệu'}]" :key="tab.key" @click="activeTab = tab.key"
            :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-all', activeTab === tab.key ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700']"
          >{{ tab.label }}</button>
        </div>

        <!-- Tab Content: Bài viết -->
        <div v-if="activeTab === 'posts'" class="space-y-4">
          <article v-for="post in posts.slice(0, 5)" :key="post.id" @click="router.push(`/posts/${post.id}`)"
            class="flex gap-4 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-4 hover:border-primary-500/30 transition-all cursor-pointer group">
            <img :src="post.coverImage" class="hidden sm:block w-28 h-20 rounded-xl object-cover shrink-0" />
            <div class="flex-1">
              <h3 class="font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-2 mb-1">{{ post.title }}</h3>
              <p class="text-sm text-gray-400 line-clamp-1">{{ post.excerpt }}</p>
              <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <img :src="post.author.avatar" class="w-5 h-5 rounded-full" />
                <span>{{ post.author.name }}</span>
                <span class="flex items-center gap-1"><Eye :size="12" /> {{ post.viewsCount }}</span>
                <span class="flex items-center gap-1"><ArrowUp :size="12" /> {{ post.upvotesCount }}</span>
                <span class="flex items-center gap-1"><MessageCircle :size="12" /> {{ post.commentsCount }}</span>
              </div>
            </div>
          </article>
        </div>

        <!-- Tab Content: Thành viên -->
        <div v-if="activeTab === 'members'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="user in users" :key="user.id" class="flex items-center gap-3 bg-white dark:bg-surface-800 rounded-xl border border-gray-200 dark:border-surface-700 p-3">
            <img :src="user.avatar" class="w-10 h-10 rounded-full" />
            <div class="flex-1">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ user.name }}</p>
              <p class="text-xs text-gray-400">{{ user.postsCount }} bài viết</p>
            </div>
            <span class="text-xs text-gray-400 bg-gray-100 dark:bg-surface-700 px-2 py-1 rounded-lg">{{ user.role }}</span>
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
              <span>{{ group.isPublic ? 'Nhóm công khai — Ai cũng có thể xem và tham gia' : 'Nhóm riêng tư — Cần được duyệt để tham gia' }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <Shield :size="16" class="text-primary-500" />
              <span>Quản trị viên: {{ group.owner.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="w-full lg:w-80 shrink-0 space-y-5">
        <!-- Thông tin nhóm -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
          <h3 class="font-bold text-gray-900 dark:text-white mb-3">📊 Thống kê</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Thành viên</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ group.membersCount.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Bài viết</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ group.postsCount }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Ngày tạo</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ formatDate(group.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Quản trị viên -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
          <h3 class="font-bold text-gray-900 dark:text-white mb-3">👑 Quản trị viên</h3>
          <div class="flex items-center gap-3">
            <img :src="group.owner.avatar" class="w-10 h-10 rounded-full ring-2 ring-primary-500/30" />
            <div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ group.owner.name }}</p>
              <p class="text-xs text-gray-400">{{ group.owner.postsCount }} bài viết</p>
            </div>
          </div>
        </div>

        <!-- Thành viên nổi bật -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
          <h3 class="font-bold text-gray-900 dark:text-white mb-3">⭐ Thành viên nổi bật</h3>
          <div class="space-y-3">
            <div v-for="user in users.slice(0, 4)" :key="user.id" class="flex items-center gap-3">
              <img :src="user.avatar" class="w-8 h-8 rounded-full" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ user.name }}</p>
                <p class="text-xs text-gray-400">{{ user.postsCount }} bài viết</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quy tắc nhóm -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
          <h3 class="font-bold text-gray-900 dark:text-white mb-3">📜 Quy tắc nhóm</h3>
          <ol class="space-y-2 text-sm text-gray-500">
            <li class="flex gap-2"><span class="text-primary-500 font-bold">1.</span> Tôn trọng lẫn nhau</li>
            <li class="flex gap-2"><span class="text-primary-500 font-bold">2.</span> Không spam, quảng cáo</li>
            <li class="flex gap-2"><span class="text-primary-500 font-bold">3.</span> Bài viết phải có nội dung chất lượng</li>
            <li class="flex gap-2"><span class="text-primary-500 font-bold">4.</span> Gắn tag phù hợp với nội dung</li>
          </ol>
        </div>
      </aside>
    </div>
  </div>
</template>
