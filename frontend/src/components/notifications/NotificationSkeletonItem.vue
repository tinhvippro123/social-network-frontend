<script setup lang="ts">
import Skeleton from '@/components/ui/Skeleton.vue'
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-4">
    <div class="flex items-start gap-4">
      <Skeleton type="avatar" class="w-12 h-12 shrink-0" />
      <div class="flex-1 space-y-2">
        <Skeleton type="text" class="w-3/4" />
        <Skeleton type="text" class="w-1/2" />
      </div>
    </div>
  </div>
</template>
