<script setup lang="ts">
import { CalendarDays, Clock } from '@lucide/vue'

defineProps<{
  isEventCategory: boolean
  eventStartTime: string
  eventEndTime: string
}>()

const emit = defineEmits<{
  (e: 'update:eventStartTime', value: string): void
  (e: 'update:eventEndTime', value: string): void
}>()
</script>

<template>
  <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" leave-active-class="transition-all duration-200 ease-in" leave-to-class="opacity-0 -translate-y-2">
    <div v-if="isEventCategory" class="flex flex-col gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
      <div class="flex items-center gap-2">
        <CalendarDays :size="16" class="text-amber-500" />
        <span class="text-sm font-semibold text-amber-700 dark:text-amber-400">Thời gian sự kiện</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">Bắt đầu</label>
          <div class="flex items-center gap-2 bg-white dark:bg-surface-800 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-800/30">
            <Clock :size="14" class="text-amber-400 shrink-0" />
            <input
              :value="eventStartTime"
              @input="emit('update:eventStartTime', ($event.target as HTMLInputElement).value)"
              type="datetime-local"
              class="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">Kết thúc</label>
          <div class="flex items-center gap-2 bg-white dark:bg-surface-800 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-800/30">
            <Clock :size="14" class="text-amber-400 shrink-0" />
            <input
              :value="eventEndTime"
              @input="emit('update:eventEndTime', ($event.target as HTMLInputElement).value)"
              type="datetime-local"
              class="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
