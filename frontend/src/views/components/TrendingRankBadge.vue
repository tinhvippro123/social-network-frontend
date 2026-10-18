<script setup lang="ts">
defineProps<{
  rank: number
}>()
</script>

<template>
  <div
    v-if="rank <= 3"
    :class="[
      'absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg',
      rank === 1 ? 'bg-linear-to-br from-yellow-400 to-amber-500' :
      rank === 2 ? 'bg-linear-to-br from-gray-300 to-gray-400' :
      'bg-linear-to-br from-orange-400 to-orange-600'
    ]"
  >
    {{ rank }}
  </div>
</template>
