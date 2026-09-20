<script setup lang="ts">
import { Palette, Moon, Sun, Monitor } from '@lucide/vue'
import { useSettings } from '@/composables/ui/useSettings'

const { themeMode, uiStore, setSystemTheme } = useSettings()
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 sm:p-8 animate-fade-in">
    <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
      <Palette :size="20" class="text-primary-500" />
      Giao diện
    </h2>

    <div class="space-y-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">Chọn chế độ hiển thị phù hợp với bạn</p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Light Mode -->
        <button
          @click="themeMode = 'light'; uiStore.isDark && uiStore.toggleTheme()"
          :class="[
            'relative p-5 rounded-2xl border-2 transition-all text-left',
            themeMode === 'light'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-surface-700 hover:border-gray-300 dark:hover:border-surface-600'
          ]"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Sun :size="20" class="text-yellow-600" />
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white text-sm">Chế độ sáng</p>
              <p class="text-xs text-gray-400">Nền trắng, chữ tối</p>
            </div>
          </div>
          <div v-if="themeMode === 'light'" class="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </div>
        </button>

        <!-- Dark Mode -->
        <button
          @click="themeMode = 'dark'; !uiStore.isDark && uiStore.toggleTheme()"
          :class="[
            'relative p-5 rounded-2xl border-2 transition-all text-left',
            themeMode === 'dark'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-surface-700 hover:border-gray-300 dark:hover:border-surface-600'
          ]"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Moon :size="20" class="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white text-sm">Chế độ tối</p>
              <p class="text-xs text-gray-400">Nền tối, dễ nhìn ban đêm</p>
            </div>
          </div>
          <div v-if="themeMode === 'dark'" class="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </div>
        </button>

        <!-- System Mode -->
        <button
          @click="setSystemTheme()"
          :class="[
            'relative p-5 rounded-2xl border-2 transition-all text-left',
            themeMode === 'system'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-surface-700 hover:border-gray-300 dark:hover:border-surface-600'
          ]"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Monitor :size="20" class="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white text-sm">Theo hệ thống</p>
              <p class="text-xs text-gray-400">Tự động theo OS</p>
            </div>
          </div>
          <div v-if="themeMode === 'system'" class="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
