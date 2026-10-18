<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title: string
  description?: string
  isDanger?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>

<template>
  <label
    :class="[
      'flex items-center justify-between p-3 rounded-xl cursor-pointer',
      isDanger ? 'bg-red-50 dark:bg-red-900/10' : 'bg-gray-50 dark:bg-surface-700'
    ]"
  >
    <div>
      <p :class="['text-sm font-medium', isDanger ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300']">
        {{ title }}
      </p>
      <p v-if="description" class="text-xs text-gray-400 mt-0.5">
        {{ description }}
      </p>
    </div>
    <input
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      class="w-5 h-5 text-red-500 rounded focus:ring-red-500"
    />
  </label>
</template>
