<script setup lang="ts">
import Skeleton from '@/components/ui/Skeleton.vue'
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-surface-700">
    <Skeleton type="image" class="w-full h-48 shrink-0" rounded="rounded-none" />
    <div class="p-5 space-y-4">
      <div class="flex items-center gap-3">
        <Skeleton type="avatar" width="w-8" height="h-8" />
        <Skeleton type="text" width="w-24" />
      </div>
      <div class="space-y-2">
        <Skeleton type="title" width="w-full" height="h-7" />
        <Skeleton type="text" width="w-full" />
        <Skeleton type="text" width="w-2/3" />
      </div>
    </div>
  </div>
</template>
