// ==========================================
// Constants — Magic values tập trung 1 chỗ
// ==========================================

/** Vai trò người dùng */
export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

/** Trạng thái bài viết */
export const POST_STATUS = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
  HIDDEN: 'hidden',
} as const

export type PostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS]

/** Loại report */
export const REPORT_TYPE = {
  POST: 'post',
  COMMENT: 'comment',
  USER: 'user',
} as const

/** Trạng thái report */
export const REPORT_STATUS = {
  PENDING: 'pending',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
} as const

/** Loại tin nhắn */
export const MESSAGE_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
} as const

/** Tên route dùng trong navigateTo() — tránh hardcode string */
export const ROUTE_NAMES = {
  HOME: 'home',
  LOGIN: 'login',
  REGISTER: 'register',
  POST_DETAIL: 'post-detail',
  CREATE_POST: 'create-post',
  PROFILE: 'profile',
  CHAT: 'chat',
  GROUPS: 'groups',
  GROUP_DETAIL: 'group-detail',
  MAP: 'map',
  ADMIN_DASHBOARD: 'admin-dashboard',
} as const

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  ADMIN_LIMIT: 20,
} as const

/** LocalStorage keys */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'vietblog_access_token',
  REFRESH_TOKEN: 'vietblog_refresh_token',
  THEME: 'vietblog_theme',
  USER: 'vietblog_user',
} as const

/** Mảng Emoji được hỗ trợ trong bình luận */
export const COMMENT_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'] as const

/** Danh mục hỗ trợ gắn thẻ địa điểm */
export const LOCATION_SUPPORTED_CATEGORIES = ['tim-tro', 'pass-do', 'review-dia-diem', 'su-kien'] as const

/** Cấu hình kiểm tra độ mạnh mật khẩu */
export const PASSWORD_STRENGTH = {
  COLORS: ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'],
  LABELS: ['Yếu', 'Trung bình', 'Khá', 'Mạnh']
} as const

