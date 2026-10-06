<script setup lang="ts">
import Skeleton from '@/components/ui/Skeleton.vue'
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
    <Skeleton class="h-4 w-24 mb-2 rounded" />
    <Skeleton class="h-8 w-16 mb-2 rounded" />
    <Skeleton class="h-4 w-32 rounded" />
  </div>
</template>
