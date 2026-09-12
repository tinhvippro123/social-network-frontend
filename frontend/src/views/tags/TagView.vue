<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Tag, ArrowLeft, TrendingUp, Clock, Filter } from '@lucide/vue'
import { usePosts } from '@/composables/usePosts'
import PostCard from '@/components/PostCard.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

const route = useRoute()
const router = useRouter()
const tagName = computed(() => route.params.name as string)

const { posts, isLoading, fetchPosts } = usePosts()

onMounted(() => {
  fetchPosts()
})

// Filter posts by tag (mock: show all posts as if they all have this tag)
const filteredPosts = computed(() => {
  return posts.value.filter(p =>
    p.tags?.some(t => t.toLowerCase() === tagName.value?.toLowerCase())
  )
})

// If no posts match the tag, show all posts as fallback for demo
const displayPosts = computed(() =>
  filteredPosts.value.length > 0 ? filteredPosts.value : posts.value
)
</script>

<template>
  <div class="mx-auto w-full max-w-300 px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header -->
    <div class="mb-8">
      <button
        @click="router.back()"
        class="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-4"
      >
        <ArrowLeft :size="16" />
        Quay lại
      </button>

      <div class="flex items-center gap-3 mb-2">
        <div class="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
          <Tag :size="24" class="text-primary-500" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">#{{ tagName }}</h1>
          <p class="text-sm text-gray-500">{{ displayPosts.length }} bài viết</p>
        </div>
      </div>
    </div>

    <!-- Posts Grid -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton v-for="i in 4" :key="i" type="image" class="w-full h-64 rounded-2xl" />
    </div>

    <div v-else-if="displayPosts.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PostCard
        v-for="post in displayPosts"
        :key="post.id"
        :post="post"
      />
    </div>

    <div v-else class="text-center py-20 text-gray-500">
      <Tag :size="48" class="mx-auto mb-4 opacity-30" />
      <p class="text-lg font-medium">Không tìm thấy bài viết nào với tag này</p>
    </div>
  </div>
</template>
