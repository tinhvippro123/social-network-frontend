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
  { icon: MapPin, label: 'Bản đồ', to: '/map' },
] as const

export const SETTINGS_TABS = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: User },
  { id: 'account', label: 'Tài khoản', icon: Lock },
  { id: 'appearance', label: 'Giao diện', icon: Palette },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
  { id: 'privacy', label: 'Quyền riêng tư', icon: Shield },
] as const
