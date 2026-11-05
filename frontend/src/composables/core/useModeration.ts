import { ref, computed, onMounted } from 'vue'
import { ADMIN_REPORT_FILTERS } from '@/constants/ui'
import { useAdmin } from '../admin/useAdmin'
import adminApi from '@/api/admin.api'
import { useToast } from '../ui/useToast'
import { useConfirm } from '../ui/useConfirm'

export function useModeration() {
  const toast = useToast()
  const { confirm } = useConfirm()
  const { reports: extendedReports, isLoading, fetchReports } = useAdmin()
  const filterStatus = ref<'all' | 'pending' | 'resolved' | 'dismissed'>('pending')

  const reportFilters = computed(() => {
    return ADMIN_REPORT_FILTERS.map(filter => {
      let count = 0
      if (filter.key === 'all') count = extendedReports.value.length
      else count = extendedReports.value.filter(r => r.status === filter.key).length
      return { ...filter, count }
    })
  })

  const pendingCount = computed(() => 
    extendedReports.value.filter(r => r.status === 'pending').length
  )

  const initData = async () => {
    await fetchReports({ limit: 100 })
  }

  async function resolveReport(reportId: string, action: 'keep' | 'delete' | 'ban') {
    const actionNames: Record<string, string> = {
      keep: 'Giữ lại nội dung (Bỏ qua vi phạm)',
      delete: 'Xóa / Ẩn nội dung vi phạm',
      ban: 'Cấm tài khoản vi phạm'
    }

    const ok = await confirm({
      title: 'Xử lý báo cáo vi phạm',
      message: `Xác nhận thực hiện: "${actionNames[action]}" cho báo cáo này?`,
      confirmText: 'Xác nhận',
      variant: action === 'keep' ? 'info' : action === 'delete' ? 'warning' : 'danger'
    })
    if (!ok) return

    try {
      await adminApi.resolveReport(reportId, action)
      toast.success('Đã xử lý báo cáo vi phạm thành công!')
      await fetchReports({ limit: 100 })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xử lý báo cáo')
    }
  }

  async function dismissReport(reportId: string) {
    const ok = await confirm({
      title: 'Bỏ qua báo cáo',
      message: 'Bạn có chắc chắn muốn đánh dấu bỏ qua báo cáo này?',
      confirmText: 'Bỏ qua',
      variant: 'info'
    })
    if (!ok) return

    try {
      await adminApi.dismissReport(reportId)
      toast.success('Đã bỏ qua báo cáo!')
      await fetchReports({ limit: 100 })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể bỏ qua báo cáo')
    }
  }

  onMounted(async () => {
    await initData()
  })

  return {
    extendedReports,
    isLoading,
    filterStatus,
    reportFilters,
    pendingCount,
    initData,
    resolveReport,
    dismissReport
  }
}
