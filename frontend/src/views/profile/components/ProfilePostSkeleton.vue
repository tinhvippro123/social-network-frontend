<script setup lang="ts">
import Skeleton from '@/components/ui/Skeleton.vue'
</script>

<template>
  <div class="flex gap-4 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-4 sm:p-5">
    <Skeleton type="image" class="hidden sm:block w-32 h-24 rounded-xl shrink-0" />
    <div class="flex-1 space-y-3">
      <Skeleton type="text" class="w-3/4 h-5" />
      <Skeleton type="text" class="w-full h-4" />
      <div class="flex gap-4 mt-2">
        <Skeleton type="text" class="w-16 h-3" />
        <Skeleton type="text" class="w-16 h-3" />
      </div>
    </div>
  </div>
</template>
