<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  change?: string | number
  changeLabel?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: any
  iconColor?: string
  iconBg?: string
}>()
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ label }}</p>
        <div class="flex items-end gap-3 mt-1">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ value }}</p>
          <span 
            v-if="change !== undefined"
            :class="[
              'text-sm font-medium px-2 py-0.5 rounded-lg flex items-center gap-1 mb-1',
              trend === 'up' ? 'text-green-500 bg-green-500/10' : 
              trend === 'down' ? 'text-red-500 bg-red-500/10' : 
              'text-gray-500 bg-gray-500/10'
            ]"
          >
            {{ change }} <span v-if="changeLabel" class="text-xs">{{ changeLabel }}</span>
          </span>
        </div>
      </div>
      <div v-if="icon" :class="['p-3 rounded-xl shrink-0', iconBg || 'bg-gray-100 dark:bg-surface-700']">
        <component :is="icon" :size="22" :class="iconColor || 'text-gray-500'" />
      </div>
    </div>
  </div>
</template>
