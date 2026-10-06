<script setup lang="ts">
import Skeleton from '@/components/ui/Skeleton.vue'
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-3">
          <Skeleton class="h-6 w-24 rounded-lg" />
          <Skeleton class="h-6 w-24 rounded-lg" />
        </div>
        <Skeleton class="h-5 w-1/3 mb-1 rounded" />
        <Skeleton class="h-4 w-2/3 mb-2 rounded" />
        <div class="flex items-center gap-3 mt-3">
          <Skeleton class="h-8 w-8 rounded-full" />
          <div class="flex-1 min-w-0 flex items-center gap-2">
            <Skeleton class="h-4 w-24 rounded" />
            <Skeleton class="h-3 w-16 rounded" />
            <Skeleton class="h-4 w-32 rounded" />
          </div>
          <Skeleton class="h-3 w-20 rounded hidden sm:block" />
        </div>
      </div>

      <div class="flex-col gap-2 shrink-0 hidden sm:flex">
        <Skeleton class="h-8 w-32 rounded-xl" />
        <Skeleton class="h-8 w-32 rounded-xl" />
        <Skeleton class="h-8 w-32 rounded-xl" />
        <Skeleton class="h-8 w-32 rounded-xl" />
      </div>
    </div>
  </div>
</template>
