<script setup lang="ts">
import Skeleton from '@/components/ui/Skeleton.vue'
</script>

<template>
  <tr class="border-b border-gray-100 dark:border-surface-700">
    <td class="px-3 py-4 text-center">
      <Skeleton class="w-4 h-4 mx-auto rounded" />
    </td>
    <td class="px-5 py-4">
      <Skeleton class="w-8 h-8 rounded-lg" />
    </td>
    <td class="px-5 py-4">
      <Skeleton class="h-4 w-32 rounded" />
    </td>
    <td class="px-5 py-4">
      <Skeleton class="h-6 w-20 rounded" />
    </td>
    <td class="px-5 py-4">
      <Skeleton class="h-4 w-16 rounded" />
    </td>
    <td class="px-5 py-4 text-right">
      <div class="flex items-center justify-end gap-1">
        <Skeleton class="w-7 h-7 rounded-lg shrink-0" />
        <Skeleton class="w-7 h-7 rounded-lg shrink-0" />
      </div>
    </td>
  </tr>
</template>
