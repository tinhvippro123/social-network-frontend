import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import notificationsApi from '@/api/notifications.api'
import { navigateToNotificationLink } from '@/utils/notificationNavigation'
import { useUiStore } from '@/stores/ui.store'

export interface Notification {
  id: string
  type: 'upvote' | 'comment' | 'reply' | 'follow' | 'mention' | 'group_invite' | 'post_approved' | 'system'
  title: string
  message: string
  avatar?: string
  link?: string
  isRead: boolean
  createdAt: string
}

function mapBackendNotification(item: any): Notification {
  const type = (item.type || 'system').toLowerCase()
  return {
    id: item.id,
    type: type as any,
    title: item.title || (type === 'system' ? 'Hệ thống' : type.charAt(0).toUpperCase() + type.slice(1)),
    message: item.message || '',
    avatar: item.avatar || '',
    link: item.link || '',
    isRead: Boolean(item.isRead),
    createdAt: item.createdAt || new Date().toISOString()
  }
}

export function useNotifications() {
  const router = useRouter()
  const uiStore = useUiStore()
  const isLoading = ref(true)
  const activeFilter = ref<'all' | 'unread'>('all')
  const notifications = ref<Notification[]>([])

  const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

  const filteredNotifications = computed(() => {
    if (activeFilter.value === 'unread') {
      return notifications.value.filter(n => !n.isRead)
    }
    return notifications.value
  })

  async function fetchNotifications() {
    isLoading.value = true
    try {
      const res = await notificationsApi.getAll({
        unreadOnly: activeFilter.value === 'unread',
        page: 1,
        limit: 50
      })
      const list = res.data?.data || []
      notifications.value = list.map(mapBackendNotification)
    } catch (err) {
      console.error('Lỗi tải danh sách thông báo:', err)
      notifications.value = []
    } finally {
      isLoading.value = false
    }
  }

  const markAsRead = async (id: string) => {
    const n = notifications.value.find(n => n.id === id)
    if (n && !n.isRead) {
      n.isRead = true
      try {
        await notificationsApi.markRead(id)
        uiStore.fetchNotifications()
      } catch (err) {
        console.error('Lỗi đánh dấu đã đọc:', err)
      }
    }
  }

  const markAllAsRead = async () => {
    notifications.value.forEach(n => { n.isRead = true })
    try {
      await notificationsApi.markAllRead()
      uiStore.fetchNotifications()
    } catch (err) {
      console.error('Lỗi đánh dấu tất cả đã đọc:', err)
    }
  }

  const deleteNotification = async (id: string) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
    try {
      await notificationsApi.delete(id)
      uiStore.fetchNotifications()
    } catch (err) {
      console.error('Lỗi xóa thông báo:', err)
    }
  }

  const handleClick = (notification: Notification) => {
    markAsRead(notification.id)
    navigateToNotificationLink(router, notification)
  }

  const handleExternalMarkAllRead = () => {
    notifications.value.forEach(n => { n.isRead = true })
  }

  watch(activeFilter, () => {
    fetchNotifications()
  })

  onMounted(() => {
    fetchNotifications()
    window.addEventListener('notifications-marked-all-read', handleExternalMarkAllRead)
  })

  onUnmounted(() => {
    window.removeEventListener('notifications-marked-all-read', handleExternalMarkAllRead)
  })

  return {
    notifications,
    filteredNotifications,
    unreadCount,
    isLoading,
    activeFilter,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleClick
  }
}
