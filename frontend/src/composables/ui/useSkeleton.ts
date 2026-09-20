import { computed } from 'vue'

export function useSkeleton(props: {
  type?: 'text' | 'avatar' | 'card' | 'image' | 'button' | 'title'
  width?: string
  height?: string
  rounded?: string
}) {
  const skeletonClass = computed(() => {
    const base = 'animate-pulse bg-gray-200 dark:bg-surface-700'
    
    if (props.type === 'avatar') {
      return `${base} rounded-full ${props.width || 'w-10'} ${props.height || 'h-10'}`
    }
    
    if (props.type === 'title') {
      return `${base} ${props.rounded || 'rounded-lg'} ${props.width || 'w-3/4'} ${props.height || 'h-6'}`
    }
    
    if (props.type === 'image' || props.type === 'card') {
      return `${base} ${props.rounded || 'rounded-2xl'} ${props.width || 'w-full'} ${props.height || 'h-48'}`
    }
    
    if (props.type === 'button') {
      return `${base} ${props.rounded || 'rounded-xl'} ${props.width || 'w-24'} ${props.height || 'h-10'}`
    }
    
    // Default text
    return `${base} ${props.rounded || 'rounded'} ${props.width || 'w-full'} ${props.height || 'h-4'}`
  })

  return {
    skeletonClass
  }
}
