<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  password: string
}>()

const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
const strengthLabels = ['Yếu', 'Trung bình', 'Khá', 'Mạnh']

const passwordStrength = computed(() => {
  if (!props.password) return 0
  let score = 0
  if (props.password.length >= 8) score++
  if (/[A-Z]/.test(props.password)) score++
  if (/[0-9]/.test(props.password)) score++
  if (/[^A-Za-z0-9]/.test(props.password)) score++
  return score
})
</script>

<template>
  <div v-if="password.length > 0" class="mt-2">
    <div class="flex gap-1 mb-1">
      <div
        v-for="i in 4"
        :key="i"
        :class="[
          'h-1 flex-1 rounded-full transition-all duration-300',
          i <= passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-white/10'
        ]"
      />
    </div>
    <p class="text-xs text-gray-400">
      {{ passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : '' }}
    </p>
  </div>
</template>
