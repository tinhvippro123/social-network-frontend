import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

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

export function useNotifications() {
  const router = useRouter()
  const authStore = useAuthStore()
  const isLoading = ref(true)
  const activeFilter = ref<'all' | 'unread'>('all')

  const notifications = ref<Notification[]>([
    {
      id: '1',
      type: 'upvote',
      title: 'Nguyễn Văn An',
      message: 'đã upvote bài viết "Hướng dẫn xây dựng REST API với Spring Boot 3"',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=NVA',
      link: '/posts/1',
      isRead: false,
      createdAt: '2026-09-11T20:30:00Z'
    },
    {
      id: '2',
      type: 'comment',
      title: 'Trần Thị Bình',
      message: 'đã bình luận trong bài viết "Vue 3 Composition API từ cơ bản đến nâng cao"',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=TTB',
      link: '/posts/2',
      isRead: false,
      createdAt: '2026-09-11T19:15:00Z'
    },
    {
      id: '3',
      type: 'reply',
      title: 'Phạm Minh Đức',
      message: 'đã trả lời bình luận của bạn: "Cảm ơn bạn, bài viết rất hữu ích!"',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=PMD',
      link: '/posts/1',
      isRead: false,
      createdAt: '2026-09-11T18:00:00Z'
    },
    {
      id: '4',
      type: 'follow',
      title: 'Lê Hoàng Nam',
      message: 'đã bắt đầu theo dõi bạn',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=LHN',
      link: '/profile/4',
      isRead: true,
      createdAt: '2026-09-11T15:45:00Z'
    },
    {
      id: '5',
      type: 'mention',
      title: 'Nguyễn Văn An',
      message: 'đã nhắc đến bạn trong bình luận: "@lethantinh bạn nghĩ sao về cách tiếp cận này?"',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=NVA',
      link: '/posts/3',
      isRead: true,
      createdAt: '2026-09-11T14:20:00Z'
    },
    {
      id: '6',
      type: 'group_invite',
      title: 'Nhóm "Vue.js Việt Nam"',
      message: 'đã mời bạn tham gia nhóm',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=VueVN',
      link: '/groups/1',
      isRead: true,
      createdAt: '2026-09-10T22:00:00Z'
    },
    {
      id: '7',
      type: 'post_approved',
      title: 'Bài viết đã được duyệt',
      message: '"Hướng dẫn Deploy ứng dụng Spring Boot lên AWS" đã được phê duyệt và hiển thị công khai.',
      link: '/posts/5',
      isRead: true,
      createdAt: '2026-09-10T10:30:00Z'
    },
    {
      id: '8',
      type: 'system',
      title: 'Chào mừng bạn đến VietBlog!',
      message: 'Hãy hoàn thiện hồ sơ cá nhân và bắt đầu chia sẻ kiến thức với cộng đồng.',
      link: '/settings',
      isRead: true,
      createdAt: '2026-09-09T08:00:00Z'
    },
    {
      id: '9',
      type: 'upvote',
      title: 'Hoàng Thị Mai',
      message: 'và 5 người khác đã upvote bài viết "Tổng hợp các Design Patterns phổ biến trong Java"',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=HTM',
      link: '/posts/4',
      isRead: true,
      createdAt: '2026-09-09T06:00:00Z'
    },
    {
      id: '10',
      type: 'comment',
      title: 'Đặng Quốc Việt',
      message: 'đã bình luận: "Bài viết rất chi tiết, cảm ơn tác giả!"',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=DQV',
      link: '/posts/1',
      isRead: true,
      createdAt: '2026-09-08T20:00:00Z'
    }
  ])

  const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

  const filteredNotifications = computed(() => {
    if (activeFilter.value === 'unread') {
      return notifications.value.filter(n => !n.isRead)
    }
    return notifications.value
  })

  const markAsRead = (id: string) => {
    const n = notifications.value.find(n => n.id === id)
    if (n) n.isRead = true
  }

  const markAllAsRead = () => {
    notifications.value.forEach(n => n.isRead = true)
  }

  const deleteNotification = (id: string) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  const handleClick = (notification: Notification) => {
    markAsRead(notification.id)
    if (notification.link) {
      router.push(notification.link)
    }
  }

  onMounted(() => {
    setTimeout(() => {
      isLoading.value = false
    }, 600)
  })

  return {
    notifications,
    filteredNotifications,
    unreadCount,
    isLoading,
    activeFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleClick
  }
}
