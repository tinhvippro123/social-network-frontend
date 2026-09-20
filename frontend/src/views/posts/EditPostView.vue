<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft } from '@lucide/vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import PostEditor from '@/components/posts/PostEditor.vue'

const route = useRoute()
const isLoadingPost = ref(true)
const postData = ref<any>(null)

// Load existing post data
onMounted(async () => {
  // Simulate loading existing post
  setTimeout(() => {
    postData.value = {
      title: 'Hướng dẫn xây dựng REST API với Spring Boot 3 và Clean Architecture',
      category: 'lap-trinh',
      tags: ['spring-boot', 'java', 'clean-architecture', 'rest-api'],
      content: '<p>Trong bài viết này, mình sẽ chia sẻ cách xây dựng một REST API hoàn chỉnh sử dụng Spring Boot 3, áp dụng kiến trúc Clean Architecture...</p><h2>1. Giới thiệu</h2><p>Clean Architecture là một mô hình kiến trúc phần mềm được đề xuất bởi Robert C. Martin (Uncle Bob) vào năm 2012...</p><h2>2. Cấu trúc thư mục</h2><p>Chúng ta sẽ tổ chức project theo 4 tầng chính: Domain, Use Case, Adapter và Infrastructure...</p>'
    }
    isLoadingPost.value = false
  }, 1000)
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
        <Skeleton type="card" class="h-[600px]" />
        <Skeleton type="card" class="h-[600px] hidden xl:block" />
      </div>
    </div>

    <!-- Editor -->
    <PostEditor v-else mode="edit" :initial-data="postData" />
  </div>
</template>
