<script setup lang="ts">
import { Flame } from '@lucide/vue'

defineProps<{
  userName: string
}>()
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl gradient-primary p-6 sm:p-8 mb-6 shadow-xl glow">
    <div class="relative z-10">
      <div class="flex items-center gap-2 mb-3">
        <Flame :size="20" class="text-amber-300" />
        <span class="text-primary-100 text-sm font-medium">Chào mừng đến VietBlog</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
        Chào buổi sáng, {{ userName }} 👋
      </h1>
      <p class="text-primary-100 text-sm sm:text-base max-w-lg">
        Hôm nay có gì mới để khám phá?
      </p>
    </div>
    <!-- Decorative shapes -->
    <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div class="absolute bottom-0 right-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
  </div>
</template>
