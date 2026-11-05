<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ArrowUp } from '@lucide/vue'

const isVisible = ref(false)

function handleScroll() {
  const main = document.querySelector('main')
  const mainTop = main ? main.scrollTop : 0
  const winTop = typeof window !== 'undefined' ? window.scrollY : 0
  isVisible.value = Math.max(mainTop, winTop) > 300
}

function scrollToTop() {
  const main = document.querySelector('main')
  if (main && main.scrollTop > 0) {
    main.scrollTo({ top: 0, behavior: 'smooth' })
  }
  if (typeof window !== 'undefined' && window.scrollY > 0) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(() => {
  const main = document.querySelector('main')
  if (main) {
    main.addEventListener('scroll', handleScroll, { passive: true })
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  const main = document.querySelector('main')
  if (main) {
    main.removeEventListener('scroll', handleScroll)
  }
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <transition name="fade">
    <button
      v-if="isVisible"
      @click="scrollToTop"
      class="fixed bottom-24 sm:bottom-16 right-4 sm:right-6 z-50 w-12 h-12 rounded-full bg-primary-500 text-white shadow-xl shadow-primary-500/30 flex items-center justify-center hover:bg-primary-600 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
      title="Lên đầu trang"
    >
      <ArrowUp :size="20" />
    </button>
  </transition>
</template>
