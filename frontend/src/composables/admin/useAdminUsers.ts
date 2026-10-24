import { ref, watch, onMounted } from 'vue'
import adminApi from '@/api/admin.api'
import { useToast } from '../ui/useToast'
import { useAuthStore } from '@/stores/auth.store'

const PAGE_SIZE = 10

function errorMessage(err: any, fallback: string) {
  return err?.response?.data?.message || fallback
}

export function useAdminUsers() {
  const toast = useToast()
  const authStore = useAuthStore()

  const allUsers = ref<any[]>([])
  const totalItems = ref(0)
  const isLoading = ref(false)
  const busyUserId = ref<string | null>(null)
  const searchQuery = ref('')
  const filterRole = ref('all')
  const currentPage = ref(1)

  async function fetchUsers() {
    isLoading.value = true
    try {
      const { data } = await adminApi.getUsers({
        page: currentPage.value,
        limit: PAGE_SIZE,
        role: filterRole.value === 'all' ? undefined : filterRole.value.toUpperCase(),
        search: searchQuery.value.trim() || undefined,
      })
      allUsers.value = data.data || []
      totalItems.value = data.meta?.total ?? allUsers.value.length
    } catch (err) {
      toast.error(errorMessage(err, 'Không thể tải danh sách người dùng'))
    } finally {
      isLoading.value = false
    }
  }

  // Debounce search, reset page when filters change
  let searchTimer: ReturnType<typeof setTimeout> | undefined
  watch(searchQuery, () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      currentPage.value = 1
      fetchUsers()
    }, 350)
  })
  watch(filterRole, () => {
    currentPage.value = 1
    fetchUsers()
  })
  watch(currentPage, () => fetchUsers())

  const isSelf = (user: any) => user?.id === authStore.user?.id

  function replaceUser(updated: any) {
    const idx = allUsers.value.findIndex(u => u.id === updated.id)
    if (idx > -1) allUsers.value[idx] = { ...allUsers.value[idx], ...updated }
  }

  async function changeRole(user: any, role: string) {
    if (role === user.role) return
    busyUserId.value = user.id
    try {
      const { data } = await adminApi.updateUserRole(user.id, role)
      replaceUser(data.data)
      toast.success(`Đã đổi vai trò của ${user.name} thành ${role === 'moderator' ? 'Moderator' : role === 'admin' ? 'Admin' : 'Thành viên'}`)
    } catch (err) {
      toast.error(errorMessage(err, 'Không thể đổi vai trò người dùng'))
    } finally {
      busyUserId.value = null
    }
  }

  async function toggleBan(user: any) {
    const banning = user.active !== false
    if (banning && !window.confirm(`Cấm tài khoản "${user.name}"? Người dùng sẽ không thể đăng nhập.`)) return
    busyUserId.value = user.id
    try {
      const { data } = await adminApi.banUser(user.id, banning)
      replaceUser(data.data)
      toast.success(banning ? `Đã cấm ${user.name}` : `Đã gỡ cấm ${user.name}`)
    } catch (err) {
      toast.error(errorMessage(err, 'Không thể cập nhật trạng thái người dùng'))
    } finally {
      busyUserId.value = null
    }
  }

  async function deleteUser(user: any) {
    if (!window.confirm(`Xóa vĩnh viễn tài khoản "${user.name}"? Hành động này không thể hoàn tác.`)) return
    busyUserId.value = user.id
    try {
      await adminApi.deleteUser(user.id)
      toast.success(`Đã xóa tài khoản ${user.name}`)
      if (allUsers.value.length === 1 && currentPage.value > 1) currentPage.value--
      else await fetchUsers()
    } catch (err) {
      toast.error(errorMessage(err, 'Không thể xóa người dùng'))
    } finally {
      busyUserId.value = null
    }
  }

  onMounted(fetchUsers)

  return {
    allUsers,
    totalItems,
    pageSize: PAGE_SIZE,
    isLoading,
    busyUserId,
    searchQuery,
    filterRole,
    currentPage,
    isSelf,
    initData: fetchUsers,
    changeRole,
    toggleBan,
    deleteUser,
  }
}
