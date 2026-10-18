<script setup lang="ts">
import Skeleton from '@/components/ui/Skeleton.vue'
</script>

<template>
  <div class="space-y-4 py-4">
    <div class="flex items-end gap-2 max-w-[70%]">
      <Skeleton type="avatar" class="w-8 h-8 shrink-0" rounded="rounded-full" />
      <Skeleton type="text" class="h-12 w-48 rounded-2xl rounded-bl-sm" />
    </div>
    <div class="flex items-end gap-2 max-w-[70%] ml-auto justify-end">
      <Skeleton type="text" class="h-10 w-32 rounded-2xl rounded-br-sm bg-primary-100 dark:bg-primary-900/20" />
    </div>
    <div class="flex items-end gap-2 max-w-[70%]">
      <Skeleton type="avatar" class="w-8 h-8 shrink-0" rounded="rounded-full" />
      <Skeleton type="text" class="h-16 w-64 rounded-2xl rounded-bl-sm" />
    </div>
  </div>
</template>
