<script setup lang="ts">
import Skeleton from '@/components/ui/Skeleton.vue'
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 overflow-hidden">
    <!-- Cover -->
    <div class="relative h-32 overflow-hidden rounded-t-2xl">
      <Skeleton type="image" class="w-full h-full" rounded="rounded-none" />
    </div>
    <!-- Content -->
    <div class="p-4">
      <div class="flex items-start gap-3 -mt-10 relative z-10">
        <Skeleton type="avatar" class="w-14 h-14 ring-4 ring-white dark:ring-surface-800 shrink-0 bg-white" rounded="rounded-xl" />
        <div class="pt-7 w-full space-y-2">
          <Skeleton type="title" width="w-3/4" height="h-5" />
          <Skeleton type="text" width="w-full" />
          <Skeleton type="text" width="w-2/3" />
        </div>
      </div>
      <div class="mt-4 pt-4 border-t border-gray-100 dark:border-surface-700">
        <Skeleton type="button" width="w-full" height="h-9" rounded="rounded-xl" />
      </div>
    </div>
  </div>
</template>
