<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, AlertCircle } from '@lucide/vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import PostEditor from '@/components/posts/PostEditor.vue'
import postsApi from '@/api/posts.api'

const route = useRoute()
const router = useRouter()
const isLoadingPost = ref(true)
const postData = ref<any>(null)
const errorMessage = ref<string | null>(null)

onMounted(async () => {
  const id = route.params.id as string
  if (!id) {
    router.push('/')
    return
  }

  try {
    const res = await postsApi.getById(id)
    postData.value = res.data?.data || res.data
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Không tìm thấy bài viết hoặc bài viết đã bị xóa'
  } finally {
    isLoadingPost.value = false
  }
})
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoadingPost" class="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div class="flex items-center justify-between">
        <Skeleton type="text" class="w-64 h-8" />
        <div class="flex gap-3">
          <Skeleton type="button" class="w-24 h-10" />
          <Skeleton type="button" class="w-28 h-10" />
        </div>
      </div>
      <Skeleton type="card" class="h-16" />
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Skeleton type="card" class="h-150" />
        <Skeleton type="card" class="h-150 hidden xl:block" />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="mx-auto w-full max-w-xl px-4 py-16 text-center space-y-4">
      <div class="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
        <AlertCircle :size="32" />
      </div>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Không thể tải bài viết</h2>
      <p class="text-gray-500 text-sm">{{ errorMessage }}</p>
      <button
        @click="router.push('/')"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20"
      >
        <ArrowLeft :size="16" /> Về trang chủ
      </button>
    </div>

    <!-- Editor -->
    <PostEditor v-else mode="edit" :initial-data="postData" />
  </div>
</template>
