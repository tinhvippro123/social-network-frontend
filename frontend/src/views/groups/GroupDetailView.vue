<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, Users, FileText, Settings, Globe, Lock } from '@lucide/vue'
import { mockGroups, mockPosts, mockUsers } from '@/data/mockData'

const router = useRouter()
const group = ref(mockGroups[0])
const activeTab = ref('posts')
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-6">
    <button @click="router.push('/groups')" class="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-6">
      <ChevronLeft :size="16" /> Quay lại nhóm
    </button>

    <!-- Group Header -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 overflow-hidden mb-6">
      <div class="h-48 relative overflow-hidden">
        <img :src="group.coverImage" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
      </div>
      <div class="px-6 pb-6">
        <div class="flex items-end gap-4 -mt-10">
          <img :src="group.avatar" class="w-20 h-20 rounded-2xl ring-4 ring-white dark:ring-surface-800 bg-gray-100 dark:bg-surface-700" />
          <div class="flex-1 pb-1">
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ group.name }}</h1>
              <span :class="['flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium', group.isPublic ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400']">
                <Globe v-if="group.isPublic" :size="10" /> <Lock v-else :size="10" />
                {{ group.isPublic ? 'Công khai' : 'Riêng tư' }}
              </span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ group.description }}</p>
          </div>
          <button class="px-4 py-2 rounded-xl text-sm font-medium bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all">
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

    <!-- Content -->
    <div v-if="activeTab === 'posts'" class="space-y-4">
      <article v-for="post in mockPosts.slice(0, 3)" :key="post.id" @click="router.push(`/posts/${post.id}`)"
        class="flex gap-4 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-4 hover:border-primary-500/30 transition-all cursor-pointer group">
        <img :src="post.coverImage" class="hidden sm:block w-28 h-20 rounded-xl object-cover shrink-0" />
        <div class="flex-1">
          <h3 class="font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-2 mb-1">{{ post.title }}</h3>
          <p class="text-sm text-gray-400 line-clamp-1">{{ post.excerpt }}</p>
          <div class="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <img :src="post.author.avatar" class="w-5 h-5 rounded-full" />
            <span>{{ post.author.name }}</span>
          </div>
        </div>
      </article>
    </div>

    <div v-if="activeTab === 'members'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div v-for="user in mockUsers" :key="user.id" class="flex items-center gap-3 bg-white dark:bg-surface-800 rounded-xl border border-gray-200 dark:border-surface-700 p-3">
        <img :src="user.avatar" class="w-10 h-10 rounded-full" />
        <div class="flex-1">
          <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ user.name }}</p>
          <p class="text-xs text-gray-400">{{ user.postsCount }} bài viết</p>
        </div>
        <span class="text-xs text-gray-400 bg-gray-100 dark:bg-surface-700 px-2 py-1 rounded-lg">{{ user.role }}</span>
      </div>
    </div>
  </div>
</template>
