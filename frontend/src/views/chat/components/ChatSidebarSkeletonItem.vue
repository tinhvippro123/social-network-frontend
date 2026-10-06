<script setup lang="ts">
import Skeleton from '@/components/ui/Skeleton.vue'
</script>

<template>
  <div class="flex items-center gap-3 p-3">
    <Skeleton type="avatar" class="w-12 h-12" />
    <div class="flex-1 space-y-2">
      <Skeleton type="text" class="w-1/2 h-4" />
      <Skeleton type="text" class="w-3/4 h-3" />
    </div>
  </div>
</template>
