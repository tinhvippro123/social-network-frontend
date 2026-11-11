<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowUp } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const authStore = useAuthStore()
const isVisible = ref(false)

const hasChatDock = computed(() => authStore.isLoggedIn && !route.path.startsWith('/chat'))

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
      :class="[
        'fixed right-5 z-50 w-10 h-10 rounded-full bg-primary-600 text-white shadow-md flex items-center justify-center hover:bg-primary-700 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer',
        hasChatDock ? 'bottom-20 sm:bottom-16 sm:right-7' : 'bottom-6'
      ]"
      title="Lên đầu trang"
    >
      <ArrowUp :size="18" />
    </button>
  </transition>
</template>
