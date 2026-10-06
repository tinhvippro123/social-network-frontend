import { ref, computed, type Ref } from 'vue'
import type { Group } from '@/types'

export function useGroupFilter(groups: Ref<Group[]>) {
  const searchGroup = ref('')
  const filterType = ref<'all' | 'joined' | 'discover'>('all')

  const filteredGroups = computed(() => {
    let g = groups.value
    if (filterType.value === 'joined') g = g.filter(item => item.isJoined)
    if (filterType.value === 'discover') g = g.filter(item => !item.isJoined)
    if (searchGroup.value) {
      const search = searchGroup.value.toLowerCase()
      g = g.filter(item => item.name.toLowerCase().includes(search))
    }
    return g
  })

  return {
    searchGroup,
    filterType,
    filteredGroups
  }
}
