import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ==========================================
    // Auth routes (AuthLayout - no sidebar)
    // ==========================================
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { layout: 'auth', title: 'Đăng nhập' }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { layout: 'auth', title: 'Đăng ký' }
    },

    // ==========================================
    // Client routes (MainLayout - user sidebar)
    // ==========================================
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'Trang chủ' }
    },
    {
      path: '/trending',
      name: 'trending',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'Thịnh hành' }
    },
    {
      path: '/bookmarks',
      name: 'bookmarks',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'Đã lưu' }
    },
    {
      path: '/posts/create',
      name: 'create-post',
      component: () => import('@/views/posts/CreatePostView.vue'),
      meta: { title: 'Viết bài mới' }
    },
    {
      path: '/posts/:id',
      name: 'post-detail',
      component: () => import('@/views/posts/PostDetailView.vue'),
      meta: { title: 'Chi tiết bài viết' }
    },
    {
      path: '/profile/:id?',
      name: 'profile',
      component: () => import('@/views/profile/ProfileView.vue'),
      meta: { title: 'Trang cá nhân' }
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/views/chat/ChatView.vue'),
      meta: { title: 'Tin nhắn' }
    },
    {
      path: '/groups',
      name: 'groups',
      component: () => import('@/views/groups/GroupsView.vue'),
      meta: { title: 'Nhóm' }
    },
    {
      path: '/groups/:id',
      name: 'group-detail',
      component: () => import('@/views/groups/GroupDetailView.vue'),
      meta: { title: 'Chi tiết nhóm' }
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('@/views/map/MapView.vue'),
      meta: { title: 'Bản đồ' }
    },

    // ==========================================
    // Admin routes (AdminLayout - admin sidebar)
    // ==========================================
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('@/views/admin/DashboardView.vue'),
      meta: { layout: 'admin', title: 'Dashboard', requiresAdmin: true }
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/admin/UsersView.vue'),
      meta: { layout: 'admin', title: 'Quản lý người dùng', requiresAdmin: true }
    },
    {
      path: '/admin/posts',
      name: 'admin-posts',
      component: () => import('@/views/admin/PostsManageView.vue'),
      meta: { layout: 'admin', title: 'Quản lý bài viết', requiresAdmin: true }
    },
    {
      path: '/admin/moderation',
      name: 'admin-moderation',
      component: () => import('@/views/admin/ModerationView.vue'),
      meta: { layout: 'admin', title: 'Kiểm duyệt nội dung', requiresAdmin: true }
    },
    {
      path: '/admin/categories',
      name: 'admin-categories',
      component: () => import('@/views/admin/CategoriesView.vue'),
      meta: { layout: 'admin', title: 'Quản lý danh mục', requiresAdmin: true }
    },
    {
      path: '/admin/groups',
      name: 'admin-groups',
      component: () => import('@/views/admin/GroupsManageView.vue'),
      meta: { layout: 'admin', title: 'Quản lý nhóm', requiresAdmin: true }
    },
    {
      path: '/admin/analytics',
      name: 'admin-analytics',
      component: () => import('@/views/admin/AnalyticsView.vue'),
      meta: { layout: 'admin', title: 'Thống kê', requiresAdmin: true }
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: () => import('@/views/admin/SettingsView.vue'),
      meta: { layout: 'admin', title: 'Cài đặt hệ thống', requiresAdmin: true }
    },

    // ==========================================
    // 404
    // ==========================================
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '404 - Không tìm thấy' }
    }
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})
import { useAuthStore } from '@/stores/auth.store'

// Global Navigation Guards
router.beforeEach((to, from, next) => {
  // Update document title
  document.title = `${to.meta.title || 'Trang chủ'} | VietBlog`

  const authStore = useAuthStore()

  // Check if route requires admin privileges
  if (to.meta.requiresAdmin) {
    if (!authStore.isLoggedIn) {
      // Not logged in -> redirect to login
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else if (!authStore.isAdmin) {
      // Logged in but not admin -> redirect to home or forbidden
      next({ name: 'home' }) // or you could have a 403 Forbidden page
    } else {
      next() // proceed
    }
  } else {
    next() // Does not require admin
  }
})

export default router
