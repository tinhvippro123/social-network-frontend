<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type?: 'text' | 'avatar' | 'card' | 'image' | 'button' | 'title'
  width?: string
  height?: string
  rounded?: string
}>()

import { useSkeleton } from '@/composables/useSkeleton'

const { skeletonClass } = useSkeleton(props)
</script>

<template>
  <div :class="skeletonClass"></div>
</template>
