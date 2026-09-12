import {
  Home, TrendingUp, Bookmark, PenSquare, Users, MessageCircle, MapPin,
  User, Lock, Palette, Bell, Shield
} from '@lucide/vue'

export const NAV_ITEMS = [
  { icon: Home, label: 'Trang chủ', to: '/' },
  { icon: TrendingUp, label: 'Thịnh hành', to: '/trending' },
  { icon: Bookmark, label: 'Đã lưu', to: '/bookmarks' },
  { icon: PenSquare, label: 'Viết bài', to: '/posts/create' },
  { icon: Users, label: 'Nhóm', to: '/groups' },
  { icon: MessageCircle, label: 'Tin nhắn', to: '/chat' },
  { icon: Bell, label: 'Thông báo', to: '/notifications' },
  { icon: MapPin, label: 'Bản đồ', to: '/map' },
] as const

export const SETTINGS_TABS = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: User },
  { id: 'account', label: 'Tài khoản', icon: Lock },
  { id: 'appearance', label: 'Giao diện', icon: Palette },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
  { id: 'privacy', label: 'Quyền riêng tư', icon: Shield },
] as const

export const GROUP_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'joined', label: 'Đã tham gia' },
  { key: 'discover', label: 'Khám phá' }
] as const

export const GROUP_DETAIL_TABS = [
  { key: 'posts', label: 'Bài viết' },
  { key: 'members', label: 'Thành viên' },
  { key: 'about', label: 'Giới thiệu' }
] as const

export const ADMIN_USER_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'admin', label: 'Admin' },
  { key: 'moderator', label: 'Mod' },
  { key: 'user', label: 'User' }
] as const

export const ADMIN_POST_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'published', label: 'Đã đăng' },
  { key: 'draft', label: 'Nháp' },
  { key: 'hidden', label: 'Đã ẩn' }
] as const

export const ADMIN_REPORT_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Đang chờ' },
  { key: 'resolved', label: 'Đã xử lý' },
  { key: 'dismissed', label: 'Bỏ qua' }
] as const
