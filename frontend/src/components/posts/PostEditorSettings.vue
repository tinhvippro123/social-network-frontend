<script setup lang="ts">
import { ImageIcon, ChevronDown, X, Tag, MapPin } from '@lucide/vue'
import type { GeoLocation } from '@/types'
import PostEditorEventSettings from './PostEditorEventSettings.vue'

defineProps<{
  title: string
  selectedCategory: string
  tags: string[]
  tagInput: string
  categories: any[]
  postLocation: GeoLocation | null
  showLocationPicker: boolean
  isLocationCategory: boolean
  isEventCategory: boolean
  eventStartTime: string
  eventEndTime: string
}>()

const emit = defineEmits<{
  (e: 'update:title', value: string): void
  (e: 'update:selectedCategory', value: string): void
  (e: 'update:tagInput', value: string): void
  (e: 'update:showLocationPicker', value: boolean): void
  (e: 'update:eventStartTime', value: string): void
  (e: 'update:eventEndTime', value: string): void
  (e: 'addTag'): void
  (e: 'removeTag', tag: string): void
  (e: 'removeLocation'): void
}>()
</script>

<template>
  <div class="flex flex-col gap-6 bg-white dark:bg-surface-800 p-6 rounded-2xl border border-gray-200 dark:border-surface-700 shadow-sm">
    <!-- Cover Image Upload -->
    <div class="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-surface-600 rounded-xl bg-gray-50 dark:bg-surface-800/50 hover:bg-gray-100 dark:hover:bg-surface-700/50 transition-colors cursor-pointer group">
      <ImageIcon :size="32" class="text-gray-300 dark:text-surface-600 mb-3 group-hover:text-primary-500 transition-colors" />
      <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Kéo thả ảnh hoặc click để tải lên</p>
      <p class="text-xs text-gray-400 mt-1">PNG, JPG tối đa 5MB</p>
    </div>

    <!-- Title -->
    <input
      :value="title"
      @input="emit('update:title', ($event.target as HTMLInputElement).value)"
      type="text"
      placeholder="Tiêu đề bài viết..."
      class="w-full text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-surface-600"
    />

    <!-- Category & Tags -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative">
        <select
          :value="selectedCategory"
          @change="emit('update:selectedCategory', ($event.target as HTMLSelectElement).value)"
          class="appearance-none pl-4 pr-10 py-2 rounded-xl text-sm font-medium bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
        >
          <option value="">Chọn danh mục</option>
          <option v-for="cat in categories" :key="cat.slug" :value="cat.slug">
            {{ cat.name }}
          </option>
        </select>
        <ChevronDown :size="14" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      <div class="flex items-center gap-2 flex-wrap flex-1">
        <span
          v-for="tag in tags"
          :key="tag"
          class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
        >
          #{{ tag }}
          <button @click="emit('removeTag', tag)" class="hover:text-red-500 transition-colors">
            <X :size="12" />
          </button>
        </span>
        <div class="flex items-center gap-1 bg-gray-50 dark:bg-surface-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-surface-600">
          <Tag :size="14" class="text-gray-400" />
          <input
            :value="tagInput"
            @input="emit('update:tagInput', ($event.target as HTMLInputElement).value)"
            @keydown.enter.prevent="emit('addTag')"
            type="text"
            placeholder="Thêm tag..."
            class="bg-transparent border-none outline-none text-sm text-gray-600 dark:text-gray-400 placeholder-gray-400 w-24"
          />
        </div>
      </div>

      <!-- Location Picker Button -->
      <div class="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-surface-700/50">
        <button
          v-if="!postLocation"
          @click="emit('update:showLocationPicker', true)"
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 border border-dashed border-gray-300 dark:border-surface-600 hover:border-red-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
        >
          <MapPin :size="16" />
          Ghim vị trí
        </button>

        <!-- Selected Location Display -->
        <div
          v-else
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30"
        >
          <MapPin :size="14" class="text-red-500 shrink-0" />
          <span
            class="text-red-700 dark:text-red-400 font-medium truncate max-w-xs cursor-pointer hover:underline"
            @click="emit('update:showLocationPicker', true)"
          >
            {{ postLocation.address }}
          </span>
          <button
            @click="emit('removeLocation')"
            class="p-0.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors shrink-0"
          >
            <X :size="14" />
          </button>
        </div>
      </div>

      <!-- Location Suggestion -->
      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" leave-active-class="transition-all duration-200 ease-in" leave-to-class="opacity-0 -translate-y-2">
        <div v-if="isLocationCategory && !postLocation" class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
          <MapPin :size="14" class="text-amber-500 shrink-0" />
          <span class="text-amber-700 dark:text-amber-400">
            Danh mục này nên có vị trí! 
            <button @click="emit('update:showLocationPicker', true)" class="font-semibold underline hover:no-underline">Ghim ngay</button>
          </span>
        </div>
      </Transition>

      <!-- Event Time Picker -->
      <PostEditorEventSettings
        :is-event-category="isEventCategory"
        :event-start-time="eventStartTime"
        :event-end-time="eventEndTime"
        @update:event-start-time="val => emit('update:eventStartTime', val)"
        @update:event-end-time="val => emit('update:eventEndTime', val)"
      />
    </div>
  </div>
</template>
