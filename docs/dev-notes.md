# 📝 Development Notes — VietBlog

> File nội bộ cho developer. Ghi lại design decisions, quy ước, cấu trúc dữ liệu, technical debt và tiến độ phát triển chi tiết để dễ dàng tiếp tục công việc trong các session sau.

---

## 📅 Session Logs

### Session 7: GIS/Map Enhancement & Real-world Use Cases (2026-09-06)
- **Nâng cấp Mock Data:** Bổ sung trường `eventStartTime` và `eventEndTime` vào model `Post`. Cập nhật `mockData.ts` với 4 danh mục cộng đồng mới (Tìm trọ, Pass đồ, Review địa điểm, Sự kiện) kèm theo toạ độ (lat, lng) thực tế để phục vụ chức năng bản đồ.
- **Nâng cấp Giao diện Bản đồ (`MapView.vue`):** Bổ sung bộ lọc danh mục (Chip Filters) hỗ trợ cuộn ngang linh hoạt. Thay thế marker mặc định bằng Emoji Markers (🏠, 🛒, 📍, 🎉) tương ứng với từng loại bài viết để cải thiện UX/UI trực quan. 
- **Form Tạo Bài Viết (`CreatePostView.vue`):** Hiển thị động các trường dữ liệu. Khi chọn danh mục "Sự kiện", tự động hiển thị ô chọn thời gian (Bắt đầu/Kết thúc). Khi chọn các danh mục liên quan đến địa điểm, tự động đề xuất "Ghim vị trí ngay!".
- **Responsive & Layout:** Đảm bảo toàn bộ form tạo bài và bản đồ tương thích tốt trên cả Mobile và Desktop (Responsive flexbox layout).

### Session 1: Frontend Setup & UI Implementation (2026-08-27)
- **Configured Tailwind CSS v4** bằng plugin `@tailwindcss/vite` (không dùng `tailwind.config.js`). Định nghĩa theme variables trực tiếp trong `src/style.css`.
- **Tách 3 Layouts độc lập dựa trên route metadata:** AuthLayout, MainLayout (Client), và AdminLayout.
- **Phát triển 10 Client Views (Sử dụng Mock Data):** Home, Login, Register, PostDetail, CreatePost, Profile, Chat, Groups, GroupDetail, Map.
- **Phát triển 8 Admin Views (Sử dụng Mock Data):** Dashboard, Users, Posts, Moderation, Categories, Groups, Analytics, Settings.
- **Fix bugs & Linter:** Chuyển `bg-gradient-to-*` thành `bg-linear-to-*`. Thêm `.vscode/settings.json` tắt warning CSS cho Tailwind v4.

### Session 6: UX/UI Polishing & Optimizations (2026-09-01)
- **Tối ưu hóa Performance:** Cải thiện tốc độ tải trang `PostDetailView` bằng cách thay đổi cơ chế fetch dữ liệu từ tuần tự (Sequential) sang song song (Parallel) với `Promise.all()`, giảm thời gian chờ từ 1.5s xuống 0.5s.
- **Hoàn thiện UI Skeleton:** Tích hợp Skeleton Loading mượt mà cho toàn bộ ứng dụng (Home, Groups, Chat, Sidebar, PostDetail). Xử lý đặc biệt cho `ChatView` để hiển thị đồng bộ Skeleton của danh sách và nội dung chat cùng lúc, tránh hiện tượng giật khung hình (Layout Shift).
- **Xử lý Empty States:** Bổ sung giao diện trạng thái trống tinh tế cho hộp thoại Thông báo (`MainLayout`), Tin nhắn và Danh sách nhóm. Khắc phục lỗi quên gọi hàm `fetchNotifications` khi khởi tạo ứng dụng.
- **Fix bugs & Linter (Zero Warnings):** Xử lý dứt điểm tình trạng mất avatar khi F5 (do `localStorage` trống), sửa lỗi cú pháp `z-index` cho Tailwind v4, dọn dẹp cấu hình lỗi thời trong `tsconfig.app.json` để đạt 100% build thành công không warning.

### Session 5: Decouple Mock Data & UI Components (2026-08-31)
- **Hoàn thành kiến trúc API Fake:** Thay thế hoàn toàn việc import `mockData.ts` trực tiếp trong 15 file `.vue` (Views) và các UI Components (`TrendingSidebar`, `CategoryTabs`, `ui.store`, `auth.store`).
- **Tích hợp Composables:** Toàn bộ Views hiện tại render dữ liệu thông qua các Composables (`usePosts`, `useUsers`, `useAdmin`, v.v.) gọi tới tầng API `*.api.ts`.
- **Đảm bảo type-safe 100%:** Fix các lỗi liên quan đến null-check ở template (`DashboardView`, `AnalyticsView`), đảm bảo dự án build thành công không lỗi TypeScript.

### Session 4: Frontend Enhancements (2026-08-31)
- **Bản đồ tương tác (Leaflet):** Tích hợp Leaflet.js vào `MapView.vue`, thay thế map giả lập bằng bản đồ thật có khả năng zoom/pan và ghim (markers) hiển thị bài viết theo vị trí tọa độ.
- **Biểu đồ thống kê (Chart.js):** Thay thế biểu đồ CSS thuần ở `DashboardView.vue` bằng Chart.js (`vue-chartjs`), hiển thị biểu đồ Line và Bar cho Người dùng mới / Bài viết mới chuyên nghiệp.
- **Rich-text Editor (TipTap):** Nâng cấp trang Viết bài mới (`CreatePostView.vue`) với TipTap Editor hỗ trợ markdown, bold, italic, heading, danh sách, và ảnh.
- **Form Validation (VeeValidate + Zod):** Thêm rule kiểm tra chặt chẽ cho form Đăng nhập và Đăng ký, hiển thị lỗi realtime và đảm bảo password trùng khớp.
- **Bảo mật Route (Navigation Guards):** Thêm cơ chế bảo vệ trong `router/index.ts` chặn người dùng bình thường truy cập route `/admin`, và cập nhật logic `LoginView` để điều hướng admin thẳng vào dashboard.

### Session 3: UI Refinement & Component Extraction (2026-08-31)
- **Cải thiện Layout:** Bỏ giới hạn `max-w` ở các trang chính (`PostDetail`, `Profile`, `CreatePost`, `GroupsView`, `GroupDetail`, `Admin Dashboard`) để tận dụng tối đa màn hình (vì giao diện đã có Sidebar).
- **Tách Component (`src/components/`):** Tách `PostCard.vue`, `TrendingSidebar.vue`, và `CategoryTabs.vue` từ `HomeView` để tái sử dụng ở các trang khác (Trending, Bookmarks). Xóa các file mặc định của Vite (`HelloWorld.vue`, `vue.svg`, `vite.svg`).
- **Sửa lỗi CSS:** Fix lỗi avatar bị ẩn dưới cover image trong `ProfileView` và `GroupDetailView` bằng cách đưa `relative z-10` vào thẻ bao chứa margin âm (`-mt-12`). Thêm class `.scrollbar-hide` ẩn thanh cuộn nhưng vẫn giữ chức năng cuộn ngang ở danh mục.

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

### DD-004: Sử dụng Mock Data trước khi viết API (Giai đoạn 1)
- **Quyết định**: Đổ dữ liệu giả (tiếng Việt) vào UI thông qua file `src/data/mockData.ts`.
- **Lý do**: Theo hướng Frontend-First. Hoàn thiện toàn bộ luồng UX/UI trước để hình dung rõ các field cần thiết, từ đó giúp thiết kế Database và API Backend chính xác hơn, không bị thiếu sót.

### DD-005: Decouple Mock Data khỏi Views (Giai đoạn 2)
- **Quyết định**: Xóa toàn bộ các lệnh `import ... from '@/data/mockData'` khỏi các file `.vue` (tầng View & UI Component). Đẩy việc sử dụng Mock Data xuống tầng `src/api/` và truy xuất qua `src/composables/`.
- **Lý do**: Tách biệt hoàn toàn phần giao diện (UI) và phần dữ liệu (Data). Giao diện giờ đây chỉ giao tiếp với Composables (bằng các hàm `fetch`, biến `ref`), không quan tâm dữ liệu đến từ đâu. Việc này giúp quá trình tích hợp Backend REST API sau này cực kỳ dễ dàng (chỉ việc sửa file ở thư mục `api/` mà không cần đụng lại một dòng code nào ở tầng giao diện).

### DD-006: Tránh Fetch Tuần tự (Sequential) nếu không cần thiết
- **Quyết định**: Sử dụng `Promise.all()` để tải đồng thời các luồng dữ liệu độc lập nhau trên cùng một trang (ví dụ: Chi tiết bài viết, Bình luận, Bài viết liên quan).
- **Lý do**: Giảm thiểu thời gian tải trang theo cấp số nhân. Thay vì chờ tổng thời gian của các request cộng lại, trang web chỉ mất thời gian bằng request chậm nhất.

### DD-007: Đồng bộ hóa Skeleton & Empty States
- **Quyết định**: Bắt buộc thiết kế Trạng thái trống (Empty State) cho tất cả các danh sách có thể rỗng (Thông báo, Tin nhắn, Nhóm). Các Skeleton Loading của những component gần nhau (như 2 cột trong Chat) phải được đồng bộ xuất hiện và biến mất cùng lúc.
- **Lý do**: Ngăn chặn hiện tượng Layout Shift (giật khung hình), tạo cảm giác UI phản hồi mượt mà và thông báo rõ ràng cho người dùng thay vì để một khoảng trống khó hiểu.

> **3. Tách Mock Data khỏi Component UI**
> ```ts
> // ❌ CŨ: Component phụ thuộc trực tiếp vào mockData tĩnh
> import { mockPosts } from '@/data/mockData'
> const posts = ref(mockPosts)
> 
> // ✅ MỚI: Thông qua Composable gọi API, dữ liệu mock bị cô lập hoàn toàn ở tầng Backend ảo
> import { usePosts } from '@/composables/usePosts'
> const { posts, fetchPosts } = usePosts()
> ```
> 
> **4. Khắc phục trùng lặp DOM Element (Blank Screen)**
> ```javascript
> // ❌ CŨ: LỖI SẬP TRANG do Vue hiểu nhầm là thẻ HTML Native (<image>, <video>)
> import { Image, Video } from '@lucide/vue'
> 
> // ✅ MỚI: Sử dụng Alias Icon để an toàn tuyệt đối
> import { Image as ImageIcon, Video as VideoIcon } from '@lucide/vue'
> ```
> 
> **5. Xử lý triệt để Layout Shift & Table Width (UX Best Practice)**
> ```html
> <!-- ❌ CŨ: Skeleton dùng w-full hoặc flex-1 làm bảng tự động dãn cột bất chấp % của thẻ <th>, gây giật giao diện lúc load xong -->
> <table class="w-full">
>   <th class="w-[30%]">Nhóm</th>
>   <td class="w-full"> <Skeleton /> </td> <!-- Lỗi ở đây -->
> </table>
> <main class="overflow-y-auto"> <!-- Lỗi giật giao diện vì scrollbar ẩn/hiện -->
> 
> <!-- ✅ MỚI: Dùng table-fixed, % cố định và overflow-y-scroll -->
> <table class="w-full table-fixed">
>   <th class="w-[30%]">Nhóm</th> <!-- Phải set % hoặc px cứng -->
>   <td> <div class="w-48"> <Skeleton /> </div> </td> <!-- Không dùng w-full -->
> </table>
> <main class="overflow-y-scroll"> <!-- Luôn chừa không gian cho Scrollbar -->
> 
> **6. Kiến trúc Form Động (Dynamic Form) thay vì Nhiều Form Riêng Lẻ**
> ```vue
> <!-- ❌ CŨ: Phải tạo riêng EventPostView.vue, HousingPostView.vue, rất dư thừa code -->
> 
> <!-- ✅ MỚI: Dùng chung 1 CreatePostView.vue, ẩn/hiện trường dựa vào selectedCategory -->
> <div v-if="selectedCategory === 'su-kien'" class="grid grid-cols-2 gap-4">
>   <input type="datetime-local" v-model="form.eventStartTime" />
> </div>
> ```
> 
> ### DD-008: Danh mục duy nhất (Single Category) vs Nhiều Tags (Multiple Tags)
> - **Quyết định**: Mỗi bài viết chỉ thuộc về **1 Danh mục duy nhất** (Ví dụ: "Sự kiện", "Tìm trọ"), nhưng có thể có **Nhiều Tags** (Ví dụ: `#nhạc_sống`, `#quận_1`).
> - **Lý do**: Giúp hệ thống Bản đồ (GIS) và Bảng tin (Feed) dễ dàng phân loại và lọc bài viết mà không bị trùng lặp logic. Ví dụ: Bản đồ chỉ cần hiển thị marker dựa trên Category chính, không lo bị nhiễu do 1 bài viết thuộc nhiều Category.
> 
> ### DD-009: Tối ưu UI/UX cho Bản đồ (Leaflet GIS)
> - **Quyết định**: Sử dụng `L.divIcon` kết hợp Emoji (🏠, 🎉, 📍) để render Custom Marker thay vì dùng file hình ảnh SVG/PNG.
> - **Lý do**: 
>   1. **Hiệu năng:** Rất nhẹ, không cần load external assets.
>   2. **Dễ custom:** Có thể tuỳ biến CSS, màu sắc, animation (như nhấp nháy, đổi màu khi hover) trực tiếp trên mã HTML/CSS của `L.divIcon`.
>   3. **Trực quan:** Người dùng nhìn Emoji là hiểu ngay bài viết thuộc chủ đề gì mà không cần zoom vào đọc chữ.

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

## ✅ Những Hạng Mục Đã Hoàn Thành (Accomplishments)

1. **Bản đồ (MapView)**: Đã tích hợp thư viện `Leaflet.js` hiển thị bản đồ trực quan.
2. **Trình soạn thảo (CreatePostView)**: Đã thay thế thẻ `<textarea>` thuần bằng Rich-text editor cao cấp `TipTap`. Đã sửa lỗi Memory Leak của TipTap.
3. **Form Validation**: Đã tích hợp `VeeValidate` và `Zod` để validate các form Auth an toàn.
4. **Biểu đồ (Analytics/Dashboard)**: Đã tích hợp thành công `Chart.js` (`vue-chartjs`) cho màn hình Admin.
5. **Route Guards**: Đã bổ sung `router.beforeEach` check token / role (chặn truy cập `/admin` khi không phải Admin).
6. **Kiến trúc Data Fetching**: Đã đóng gói logic fetch dữ liệu bất đồng bộ vào `useAsyncState`, tự động xử lý `isLoading` và `error` chung cho toàn ứng dụng.
7. **Tối ưu Avatar Component**: Đã refactor toàn bộ mã lặp lại thành một Component duy nhất `<UserAvatar />` có tích hợp ảnh dự phòng (Fallback UI) an toàn.

---

## 🛠️ Technical Debt & Known Issues (Cần làm)

- Hiện tại phần Frontend chưa phát hiện thêm nợ kỹ thuật (Technical Debt) nào nghiêm trọng. Các tính năng cốt lõi đều hoạt động tốt bằng Mock Data. Đã sẵn sàng để kết nối Backend API.

---

## 🗺️ Next Steps (Kế hoạch sắp tới)

- [ ] Cài đặt backend Spring Boot (Clean Architecture structure).
- [ ] Setup PostgreSQL + PostGIS + pgvector extension.
- [ ] Thiết kế Database Schema SQL thực tế dựa trên `architecture.md`.
- [ ] Viết REST API Authentication (JWT + Spring Security).
- [ ] Viết REST API CRUD Bài viết & Danh mục.
- [ ] Thay thế mock data trên frontend bằng `axios` / `fetch` gọi API thật.
- [ ] Bổ sung Vue Router navigation guards.
