<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 bg-linear-to-br from-surface-900 via-primary-900/50 to-surface-900">
      <!-- Floating orbs -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-float" />
      <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style="animation-delay: 1s;" />
      <div class="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl animate-float" style="animation-delay: 2s;" />

      <!-- Grid pattern -->
      <div class="absolute inset-0 opacity-5"
        style="background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 40px 40px;"
      />
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-md mx-4">
      <!-- Logo -->
      <div class="text-center mb-8 animate-slide-up">
        <div class="inline-flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg glow">
            <span class="text-white font-bold text-2xl">V</span>
          </div>
          <h1 class="text-3xl font-bold text-white">
            Viet<span class="text-gradient">Blog</span>
          </h1>
        </div>
        <p class="text-gray-400 text-sm">Nền tảng chia sẻ kiến thức cho cộng đồng</p>
      </div>

      <!-- Auth Card -->
      <div class="bg-white/10 dark:bg-surface-800/80 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-slide-up" style="animation-delay: 0.1s;">
        <slot />
      </div>
    </div>
  </div>
</template>
