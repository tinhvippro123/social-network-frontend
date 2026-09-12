import { computed } from 'vue'

export function useUserAvatar(props: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = computed(() => {
    switch (props.size) {
      case 'sm': return 'w-6 h-6 text-xs'
      case 'md': return 'w-8 h-8 text-sm'
      case 'lg': return 'w-12 h-12 text-base'
      case 'xl': return 'w-24 h-24 sm:w-32 sm:h-32 text-2xl'
      default: return 'w-8 h-8 text-sm'
    }
  })

  return {
    sizeClasses
  }
}
