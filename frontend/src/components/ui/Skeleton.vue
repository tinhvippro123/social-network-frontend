<script setup lang="ts">
import { computed } from 'vue'
import { useSkeleton } from '@/composables/ui/useSkeleton'

const props = defineProps<{
  type?: 'text' | 'avatar' | 'card' | 'image' | 'button' | 'title'
  width?: string
  height?: string
  rounded?: string
}>()

const { skeletonClass } = useSkeleton(props)
</script>

<template>
  <div :class="skeletonClass"></div>
</template>
