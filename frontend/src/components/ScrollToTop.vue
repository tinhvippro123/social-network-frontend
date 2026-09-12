<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ArrowUp } from '@lucide/vue'

const isVisible = ref(false)

function handleScroll() {
  // Find the scrollable main element
  const main = document.querySelector('main')
  if (main) {
    isVisible.value = main.scrollTop > 300
  }
}

function scrollToTop() {
  const main = document.querySelector('main')
  if (main) {
    main.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(() => {
  const main = document.querySelector('main')
  if (main) {
    main.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  const main = document.querySelector('main')
  if (main) {
    main.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <transition name="fade">
    <button
      v-if="isVisible"
      @click="scrollToTop"
      class="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-primary-500 text-white shadow-xl shadow-primary-500/30 flex items-center justify-center hover:bg-primary-600 hover:scale-110 active:scale-95 transition-all duration-200"
      title="Lên đầu trang"
    >
      <ArrowUp :size="20" />
    </button>
  </transition>
</template>
