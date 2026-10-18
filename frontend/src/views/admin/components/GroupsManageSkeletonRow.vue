<script setup lang="ts">
import Skeleton from '@/components/ui/Skeleton.vue'
</script>

<template>
  <tr class="border-b border-gray-100 dark:border-surface-700">
    <td class="px-5 py-4">
      <div class="flex items-center gap-3">
        <Skeleton class="w-10 h-10 rounded-xl shrink-0" />
        <div class="space-y-2 w-48">
          <Skeleton class="h-4 w-32 rounded" />
          <Skeleton class="h-3 w-48 rounded max-w-full" />
        </div>
      </div>
    </td>
    <td class="px-5 py-4 hidden sm:table-cell">
      <Skeleton class="h-6 w-20 rounded-lg" />
    </td>
    <td class="px-5 py-4">
      <Skeleton class="h-4 w-16 rounded" />
    </td>
    <td class="px-5 py-4 hidden md:table-cell">
      <Skeleton class="h-4 w-10 rounded" />
    </td>
    <td class="px-5 py-4 hidden lg:table-cell">
      <div class="flex items-center gap-2">
        <Skeleton class="w-8 h-8 rounded-full shrink-0" />
        <Skeleton class="h-3 w-20 rounded" />
      </div>
    </td>
    <td class="px-5 py-4 text-right">
      <div class="flex items-center justify-end gap-1">
        <Skeleton class="w-7 h-7 rounded-lg shrink-0" />
        <Skeleton class="w-7 h-7 rounded-lg shrink-0" />
      </div>
    </td>
  </tr>
</template>
