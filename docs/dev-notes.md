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

---

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
├── router/
│   └── index.ts            # 20 routes, 3 layout groups
├── stores/
│   └── app.ts              # Pinia (Theme, auth, sidebar, notifications)
├── types/
│   └── index.ts            # Interfaces (Post, User, Comment, Group...)
├── data/
│   └── mockData.ts         # Mock data tĩnh tiếng Việt
├── layouts/
│   ├── AuthLayout.vue      # Floating orbs animated bg
│   ├── MainLayout.vue      # Client: sidebar + navbar
│   └── AdminLayout.vue     # Admin: dark sidebar + breadcrumbs
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
