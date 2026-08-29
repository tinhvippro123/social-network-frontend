# 📝 Development Notes — VietBlog

> File nội bộ cho developer. Ghi lại design decisions, quy ước, cấu trúc dữ liệu, technical debt và tiến độ phát triển chi tiết để dễ dàng tiếp tục công việc trong các session sau.

---

## 📅 Session Logs

### Session 1: Frontend Setup & UI Implementation (2026-08-27)
- **Scaffolded Vue 3 + Vite 8 project**
- **Configured Tailwind CSS v4** bằng plugin `@tailwindcss/vite` (không dùng `tailwind.config.js`). Định nghĩa theme variables trực tiếp trong `src/style.css`.
- **Tách 3 Layouts độc lập dựa trên route metadata:** AuthLayout, MainLayout (Client), và AdminLayout.
- **Phát triển 10 Client Views (Sử dụng Mock Data):** Home, Login, Register, PostDetail, CreatePost, Profile, Chat, Groups, GroupDetail, Map.
- **Phát triển 8 Admin Views (Sử dụng Mock Data):** Dashboard, Users, Posts, Moderation, Categories, Groups, Analytics, Settings.
- **Fix bugs & Linter:** Chuyển `bg-gradient-to-*` thành `bg-linear-to-*`. Thêm `.vscode/settings.json` tắt warning CSS cho Tailwind v4.

### Session 2: Best Practice Refactoring — API Layer & Architecture (2026-08-28)
- **Cài đặt Axios** và tạo `.env` chứa `VITE_API_URL`, `VITE_WS_URL`.
- **Tạo API Service Layer (`src/api/`):**
  - `client.ts`: Axios instance với request interceptor (auto-attach JWT) và response interceptor (xử lý 401/403/500 tập trung).
  - `auth.api.ts`: login, register, logout, refreshToken, getProfile.
  - `posts.api.ts`: CRUD bài viết + trending, nearby (PostGIS), semantic search, image search.
  - `chat.api.ts`: conversations, messages.
  - `admin.api.ts`: dashboard stats, user management, moderation, categories, settings.
- **Tạo Composables (`src/composables/`):**
  - `useAuth.ts`: Login/logout/register, session restore từ localStorage, computed isAdmin/isModerator.
  - `usePosts.ts`: Fetch posts (paginated + filtered), single post, trending, vote, bookmark.
  - `useSearch.ts`: 3 search modes (keyword, semantic, image upload).
  - `useWebSocket.ts`: WebSocket connection với auto-reconnect (max 5 attempts), auto-cleanup on unmount.
- **Tách Pinia Store:**
  - `auth.store.ts`: User state, token management, role checks.
  - `ui.store.ts`: Theme, sidebar, notifications, search UI state.
  - `app.ts`: Wrapper delegate sang 2 store mới (backward compatibility).
- **Tạo Utils (`src/utils/`):**
  - `formatters.ts`: formatNumber, formatDate, formatDateTime, formatRelativeTime, truncateText, slugify.
  - `validators.ts`: validateEmail, validatePassword, validateRequired, validateConfirmPassword.
- **Tạo Constants (`src/constants/index.ts`):** ROLES, POST_STATUS, REPORT_TYPE, ROUTE_NAMES, PAGINATION, STORAGE_KEYS.
- **Tạo TypeScript env declarations** (`src/env.d.ts`).


## 💡 Design Decisions (Quyết định thiết kế)

### DD-001: Tailwind CSS v4 (không phải v3)
- **Quyết định**: Dùng Tailwind v4 (CSS-first config)
- **Lý do**: Dùng `@theme` trong CSS thay vì `tailwind.config.js` giúp đơn giản hơn. Native CSS cascade layers cho performance tốt hơn.
- **Lưu ý**: Dùng `bg-linear-to-r` thay vì `bg-gradient-to-r` (v4 rename).

### DD-002: @lucide/vue (không phải lucide-vue-next)
- **Quyết định**: Dùng `@lucide/vue`. Kích thước chuẩn: `size="20"` cho nav, `size="16"` hoặc `14` cho action buttons.
- **Lý do**: `lucide-vue-next` đã bị deprecated.

### DD-003: Tách biệt hoàn toàn Admin Layout
- **Quyết định**: Admin dùng `AdminLayout.vue` riêng với tông màu tối (`bg-gray-950`) và accent Đỏ/Cam.
- **Lý do**: Tăng tính bảo mật (dễ đặt Route Guard) và tách biệt UX/UI hoàn toàn khỏi giao diện người dùng (tông màu sáng/tím). Giống cấu trúc của WordPress/Ghost.

### DD-004: Sử dụng Mock Data trước khi viết API
- **Quyết định**: Đổ dữ liệu giả (tiếng Việt) vào UI thông qua file `src/data/mockData.ts`.
- **Lý do**: Theo hướng Frontend-First. Hoàn thiện toàn bộ luồng UX/UI trước để hình dung rõ các field cần thiết, từ đó giúp thiết kế Database và API Backend chính xác hơn, không bị thiếu sót.

---

## 🎨 Quy ước Code & UI/UX Component

- **File Naming**:
  - Views: `PascalCase` + `View` suffix → `HomeView.vue`.
  - Layouts: `PascalCase` + `Layout` suffix → `MainLayout.vue`.
  - Stores/Types: `camelCase` / `PascalCase` tương ứng.
  
- **Màu sắc**:
  - `primary` mapped sang dải màu indigo. `surface` mapped sang dải màu slate.

- **Custom CSS Classes (trong `style.css`)**:
  - `.glass` / `.glass-strong`: Hiệu ứng kính (backdrop-blur).
  - `.gradient-primary` / `.gradient-accent`: Gradient cho button và thành phần nhấn.
  - `.text-gradient`: Chữ màu gradient (`bg-clip-text`).
  - `.glow`: Shadow màu neon (indigo) cho phần tử active.
  - Animations: `.animate-float`, `.animate-slide-up`.

---

## 📂 File Structure Map (Cấu trúc thư mục)

```
src/
├── App.vue                 # Layout switcher (auth/main/admin)
├── main.ts                 # App entry point
├── style.css               # Tailwind theme + custom utilities
├── env.d.ts                # TypeScript env declarations
│
├── api/                    # 🔗 HTTP Client + API endpoints
│   ├── client.ts           # Axios instance (interceptors, JWT auto-attach)
│   ├── auth.api.ts         # login, register, logout, refreshToken, getProfile
│   ├── posts.api.ts        # CRUD + trending + nearby + semantic/image search
│   ├── chat.api.ts         # conversations, messages
│   └── admin.api.ts        # stats, users, reports, categories, settings
│
├── composables/            # ♻️ Reusable logic (Vue Composition API)
│   ├── useAuth.ts          # Login/logout, session restore, isAdmin
│   ├── usePosts.ts         # Fetch posts (paginated), vote, bookmark
│   ├── useSearch.ts        # Keyword, semantic, image search
│   └── useWebSocket.ts     # WS connect + auto-reconnect
│
├── stores/                 # 📦 Pinia State Management (tách nhỏ)
│   ├── app.ts              # Wrapper backward-compat (delegate → auth + ui)
│   ├── auth.store.ts       # User state, tokens, role checks
│   └── ui.store.ts         # Theme, sidebar, notifications, search UI
│
├── constants/
│   └── index.ts            # ROLES, POST_STATUS, STORAGE_KEYS, ROUTE_NAMES
│
├── utils/
│   ├── formatters.ts       # formatDate, formatNumber, formatRelativeTime, slugify
│   └── validators.ts       # validateEmail, validatePassword, validateRequired
│
├── types/
│   └── index.ts            # Interfaces (Post, User, Comment, Group...)
│
├── data/
│   └── mockData.ts         # Mock data tĩnh tiếng Việt (sẽ xóa khi có API)
│
├── router/
│   └── index.ts            # 20 routes, 3 layout groups
│
├── layouts/
│   ├── AuthLayout.vue      # Floating orbs animated bg
│   ├── MainLayout.vue      # Client: sidebar + navbar
│   └── AdminLayout.vue     # Admin: dark sidebar + breadcrumbs
│
└── views/
    ├── HomeView.vue         # Feed + trending + categories
    ├── auth/                # LoginView.vue, RegisterView.vue
    ├── posts/               # CreatePostView.vue, PostDetailView.vue
    ├── profile/             # ProfileView.vue
    ├── chat/                # ChatView.vue
    ├── groups/              # GroupsView.vue, GroupDetailView.vue
    ├── map/                 # MapView.vue
    └── admin/               # 8 views (Dashboard, Users, Moderation, v.v...)
```

### 📌 Luồng gọi API (Quy tắc bắt buộc)

```
View (UI) → Composable (Logic) → API Service (Endpoint) → HTTP Client (Axios) → Backend
```
**KHÔNG BAO GIỜ gọi API trực tiếp trong View.** Luôn đi qua composable hoặc store.

### 📌 Thêm tính năng mới — Checklist

1. `types/index.ts` → Thêm interface
2. `constants/index.ts` → Thêm constants (nếu cần)
3. `api/xxx.api.ts` → Thêm API endpoint functions
4. `composables/useXxx.ts` → Thêm logic xử lý
5. `stores/xxx.store.ts` → Thêm store (nếu cần cache state)
6. `views/xxx/XxxView.vue` → Thêm UI
7. `router/index.ts` → Thêm route

---

## 🗄️ Cấu trúc Mock Data (`src/data/mockData.ts`)

- **Post**: `id`, `title`, `excerpt`, `content`, `coverImage`, `author`, `category`, `viewsCount`, `upvotesCount`, `commentsCount`, `status`, `createdAt`.
- **User**: `id`, `name`, `email`, `avatar`, `role`, `joinedAt`, `postsCount`.
- **Comment**: `id`, `content`, `author`, `upvotes`, `createdAt`, `replies`.
- **Group**: `id`, `name`, `description`, `avatar`, `membersCount`, `isPublic`, `owner`.
- **Report**: `targetId`, `targetTitle`, `type` (post/comment/user), `reason`, `status`.
- **Admin Stats**: `userGrowth`, `postGrowth` (arrays chứa số liệu ngày).

---

## 🛠️ Technical Debt & Known Issues (Cần làm)

1. **Bản đồ (MapView)**: UI hiện tại chỉ là placeholder. Cần tích hợp thư viện `Leaflet.js` và gọi API backend PostGIS.
2. **Trình soạn thảo (CreatePostView)**: Hiện đang dùng `<textarea>` thuần. Cần thay thế bằng Rich-text editor (như TipTap, Vditor, hoặc Quill).
3. **Form Validation**: Các form (Login, Register, Create Post) chưa có logic validate. Cần tích hợp `VeeValidate` hoặc xử lý thủ công trước.
4. **Biểu đồ (Analytics/Dashboard)**: Đang "fake" bằng thẻ `<div>` với inline-style. Cần tích hợp `Chart.js` (vue-chartjs) hoặc `ECharts` khi có API.
5. **Route Guards**: Chưa chặn route. Hiện tại ai vào `/admin` cũng được. Cần thêm `router.beforeEach` check token / role.

---

## 🗺️ Next Steps (Kế hoạch sắp tới)

- [ ] Cài đặt backend Spring Boot (Clean Architecture structure).
- [ ] Setup PostgreSQL + PostGIS + pgvector extension.
- [ ] Thiết kế Database Schema SQL thực tế dựa trên `architecture.md`.
- [ ] Viết REST API Authentication (JWT + Spring Security).
- [ ] Viết REST API CRUD Bài viết & Danh mục.
- [ ] Thay thế mock data trên frontend bằng `axios` / `fetch` gọi API thật.
- [ ] Bổ sung Vue Router navigation guards.
