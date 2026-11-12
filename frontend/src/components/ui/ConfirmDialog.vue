<script setup lang="ts">
import { computed, watch, onBeforeUnmount } from 'vue'
import { AlertTriangle, Trash2, Info } from '@lucide/vue'
import { useConfirm } from '@/composables/ui/useConfirm'

const { state, close } = useConfirm()

const styles = computed(() => {
  switch (state.value.variant) {
    case 'warning':
      return {
        icon: AlertTriangle,
        iconWrap: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
        button: 'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500/40',
      }
    case 'info':
      return {
        icon: Info,
        iconWrap: 'bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400',
        button: 'bg-primary-500 hover:bg-primary-600 focus-visible:ring-primary-500/40',
      }
    default:
      return {
        icon: Trash2,
        iconWrap: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
        button: 'bg-rose-500 hover:bg-rose-600 focus-visible:ring-rose-500/40',
      }
  }
})

function onKeydown(e: KeyboardEvent) {
  if (!state.value.open) return
  if (e.key === 'Escape') {
    e.preventDefault()
    close(false)
    return
  }
  if (e.key === 'Enter') {
    if (document.activeElement?.id === 'confirm-dialog-cancel') {
      e.preventDefault()
      close(false)
      return
    }
    e.preventDefault()
    close(true)
  }
}

watch(() => state.value.open, (open) => {
  if (open) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div
        v-if="state.open"
        class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @click.self="close(false)"
      >
        <div
          role="alertdialog"
          aria-modal="true"
          class="confirm-panel w-full max-w-md rounded-2xl bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 shadow-2xl p-6"
        >
          <div class="flex items-start gap-4">
            <div :class="['shrink-0 w-11 h-11 rounded-full flex items-center justify-center', styles.iconWrap]">
              <component :is="styles.icon" :size="20" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-bold text-gray-900 dark:text-white">{{ state.title }}</h3>
              <p class="mt-1.5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed wrap-break-word">{{ state.message }}</p>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2.5">
            <button
              id="confirm-dialog-cancel"
              type="button"
              class="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-surface-700 dark:hover:bg-surface-600 transition-colors"
              @click="close(false)"
            >
              {{ state.cancelText }}
            </button>
            <button
              id="confirm-dialog-ok"
              type="button"
              :class="['px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus-visible:ring-4', styles.button]"
              @click="close(true)"
            >
              {{ state.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.18s ease;
}
.confirm-fade-enter-active .confirm-panel,
.confirm-fade-leave-active .confirm-panel {
  transition: transform 0.18s ease;
}
.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}
.confirm-fade-enter-from .confirm-panel,
.confirm-fade-leave-to .confirm-panel {
  transform: scale(0.95) translateY(8px);
}
</style>
