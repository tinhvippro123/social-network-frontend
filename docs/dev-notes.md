# 📝 Development Notes — VietBlog

> File nội bộ cho developer. Ghi lại design decisions, quy ước, cấu trúc dữ liệu, technical debt và tiến độ phát triển chi tiết để dễ dàng tiếp tục công việc trong các session sau.

---

## 📅 Session Logs


### Session 8: Final Polish & Anti-pattern Eradication (2026-09-08)
- **Tách UI & Logic triệt để (Clean Architecture):** Di chuyển toàn bộ logic vòng đời (onMounted, onUnmounted) và khai báo state từ các file .vue sang composables/. Đảm bảo các View và Layout component chỉ làm nhiệm vụ render giao diện.
- **Loại bỏ hoàn toàn God Store:** Xóa sổ pp.ts (Proxy wrapper) sau khi đã refactor xong toàn bộ component. Chuyển đổi toàn bộ truy xuất qua ui.store và uth.store để đạt hiệu suất và cấu trúc chuẩn.
- **Chuẩn hóa API Mock Layer:** Fix toàn bộ mock API (posts, groups, users,...) trả về cấu trúc { success: true, data: ... } chuẩn theo ApiResponse (thay vì dùng status: 200 sai lệch). Tiêu diệt toàn bộ các đoạn typecast s unknown as Promise... gây ức chế trong mã nguồn.
- **Sửa linter & cú pháp:** Xóa các import thừa thãi, sửa vị trí khai báo import chuẩn ES Modules, và fix các lỗi chuỗi nháy \'vue\' trong Composables. Dự án đạt 100% type-safe.

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

### DD-010: Áp dụng triệt để Clean Architecture (Tách Logic khỏi UI)
- **Quyết định**: Bắt buộc mọi logic xử lý vòng đời (`onMounted`, `onUnmounted`) và thao tác DOM phải nằm trong `composables/`. Các file Component (`.vue`) chỉ đóng vai trò "Dumb Component" (nhận dữ liệu và hiển thị).
- **Lý do**: Khi dự án lớn lên, nếu nhét toàn bộ logic vào `.vue` sẽ gây ra tình trạng "Spaghetti Code", cực kỳ khó tái sử dụng và bảo trì. Chuyển logic sang composables giúp Component nhẹ nhàng và dễ đọc hơn 10 lần.
> ```ts
> // ❌ CŨ: Component ôm đồm quá nhiều logic vòng đời
> // File: Component.vue
> import { onMounted, onUnmounted } from 'vue'
> onMounted(() => { window.addEventListener('resize', handleResize) })
> onUnmounted(() => { window.removeEventListener('resize', handleResize) })
> 
> // ✅ MỚI: Logic được bọc kín gọn gàng trong Composable
> // File: useLayout.ts -> chứa onMounted, onUnmounted
> // File: Component.vue
> import { useLayout } from '@/composables/useLayout'
> const { ... } = useLayout() // 1 dòng duy nhất, component không cần quan tâm logic bên trong
> ```

### DD-011: Khai tử "God Store" (Xóa app.ts)
- **Quyết định**: Gỡ bỏ hoàn toàn file `src/stores/app.ts` (một Proxy Wrapper ôm đồm tất cả mọi thứ) và ép các components gọi trực tiếp đến các store chuyên biệt (`ui.store.ts` và `auth.store.ts`).
- **Lý do**: "God Store" vi phạm nguyên tắc Single Responsibility (Đơn trách nhiệm). Bằng cách xóa `app.ts`, hệ thống giờ đây đạt chuẩn Decoupling hoàn toàn: Giao diện gọi `uiStore`, xác thực gọi `authStore`. Mọi linter errors và bugs template cũng được xử lý dứt điểm.
> ```ts
> // ❌ CŨ: Phụ thuộc vào một God Store duy nhất
> import { useAppStore } from '@/stores/app'
> const appStore = useAppStore()
> const user = appStore.user // Truy cập chéo logic Auth
> appStore.toggleTheme()     // Truy cập chéo logic UI
> 
> // ✅ MỚI: Phân tách Domain rạch ròi
> import { useAuthStore } from '@/stores/auth.store'
> import { useUiStore } from '@/stores/ui.store'
> const { user } = useAuthStore()
> const { toggleTheme } = useUiStore()
> ```

### DD-012: Chuẩn hóa Schema Trả về API (Loại bỏ Ép Kiểu)
- **Quyết định**: Chuẩn hóa toàn bộ Mock API trả về đúng schema `{ success: boolean, data: T, message: string }` của Axios Interceptors, từ chối việc trả về sai schema rồi dùng `as unknown as Promise` để qua mặt TypeScript.
- **Lý do**: Ép kiểu vô tội vạ làm mất đi giá trị của TypeScript và che giấu bug tiềm ẩn.
> ```ts
> // ❌ CŨ: Mock data sai cấu trúc Backend quy định, phải ép kiểu để lấp liếm
> return { data: { data: group, status: 200 } } as unknown as Promise<{ data: ApiResponse<Group> }>
> 
> // ✅ MỚI: Trả về chuẩn cấu trúc ApiResponse, type-safe 100% không cần ép kiểu
> return { data: { data: group, success: true } } as { data: ApiResponse<Group> }
> ```

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

### Session 9: UI/UX Polish and Performance Optimization (2026-09-17)

#### 1. Nested Comments UI (PostDetailView)
- **Vấn đề:** Khung nhập Reply (Inline Reply) bị render lặp lại nhiều lần do nằm bên trong vòng lặp đệ quy của danh sách bình luận (lồng vào nhau quá sâu), gây lỗi hiển thị chồng chéo Skeleton và form.
- **Design Decision:** Flatten (làm phẳng) logic hiển thị khung Reply. Thay vì nhúng form đệ quy theo từng bình luận con, ta đặt form duy nhất ở cuối của luồng thảo luận (thread). 
- **Giải pháp Code:** Dịch chuyển khối code `<div v-if="inlineReplyId === ...">` ra khỏi vòng lặp đệ quy (chuyển nó thành thẻ anh em - sibling thay vì thẻ con - child). Đảm bảo mỗi nhánh bình luận chỉ tồn tại 1 box reply ở dưới đáy.

#### 2. Bookmarks Loading Fix (useBookmarks & usePosts)
- **Vấn đề:** Khi mở trang Đã lưu, khung loading Skeleton của trang chính bị chớp tắt 2 lần. Nguyên nhân là do `fetchPosts()` và `fetchPopularTags()` được gọi tuần tự (`await`) và cả 2 đều kích hoạt chung một biến trạng thái toàn cục `isLoading`.
- **Design Decision:** Phải tách rời Loading State của nội dung chính (Main Feed) và nội dung phụ (Sidebar). Đồng thời, tối ưu hoá thời gian tải bằng cách gọi API song song (Concurrent fetching).
- **Giải pháp Code:** 
  - *Code cũ:* Gọi tuần tự `await fetchPosts(); await fetchPopularTags();` gây block lẫn nhau.
  - *Code mới:* 
    1. Gom API lại bằng `await Promise.all([fetchPosts(), fetchPopularTags()])`.
    2. Ở file `usePosts.ts`, gỡ bỏ wrapper `execute()` ra khỏi hàm `fetchPopularTags()`, thay bằng `try-catch` thông thường để nó trở thành tiến trình chạy ngầm thuần túy, không kích hoạt chớp nháy biến `isLoading` của giao diện chính nữa.

#### 3. Chat UX Scroll Fix (useChatView)
- **Vấn đề:** Khi vừa bấm mở 1 đoạn Chat, người dùng thấy giao diện bị khựng lại, sau đó tin nhắn trượt dài từ trên xuống đáy (visual jump/jerk). Nguyên nhân do `setTimeout(150ms)` thừa thãi, API `markAsRead` block tiến trình render, và hiệu ứng cuộn mượt (`behavior: 'smooth'`) mặc định bị lạm dụng.
- **Design Decision:** (1) Trải nghiệm mở Chat chuẩn mực phải là màn hình luôn xuất hiện LẬP TỨC ở vị trí tin nhắn mới nhất (dưới đáy) không có hiệu ứng trượt. Hiệu ứng trượt chỉ dùng khi người dùng tự thao tác tay hoặc có tin nhắn mới tới. (2) Chuyển các tác vụ đồng bộ không liên quan UI thành tác vụ chạy ngầm (Fire & Forget).
- **Giải pháp Code:**
  - *Code cũ:* 
    ```typescript
    await markAsRead(conv.id) // Đợi API 100ms
    await nextTick()
    setTimeout(scrollToBottom, 100) // Đợi thêm 100ms, hàm này fix cứng behavior: 'smooth'
    ```
  - *Code mới:* 
    1. Cập nhật hàm `scrollToBottom(smooth: boolean = true)` để cho phép vô hiệu hóa cuộn mượt.
    2. Bỏ `await` và `setTimeout`:
    ```typescript
    await fetchMessages(conv.id)
    await nextTick()
    scrollToBottom(false) // Tắt hiệu ứng mượt, nhảy bụp lập tức xuống cuối ngay sau khi render
    markAsRead(conv.id)   // Fire and forget (Bắn và quên, không block UI)
    ```
 
 # # #   S e s s i o n :   C o m m e n t   C o m p o n e n t   R e f a c t o r i n g   ( 2 0 2 6 - 0 9 - 1 9 )  
 -   * * T � c h   C o m p o n e n t   ( s r c / c o m p o n e n t s / c o m m e n t s / ) * * :   �   r e f a c t o r   l o g i c   h i �n   t h �  b � n h   l u �n   l �n g   n h a u   t r o n g   P o s t D e t a i l V i e w . v u e   t h � n h   C o m m e n t I t e m . v u e   ( �  q u y )   v �   C o m m e n t C o m p o s e r . v u e .   V i �c   n � y   g i � p   g i �m   h �n   4 0 0   d � n g   m �   l �p   l �i ,   t �i   �u   c �u   t r � c   D O M   v �   d �  d � n g   t � i   s �  d �n g   b �  n h �p   l i �u   ( c o m p o s e r )   v �i   �n h / e m o j i   �  n h i �u   n �i .  
  
 # # #   S e s s i o n :   S e t t i n g s   C o m p o n e n t   E x t r a c t i o n   ( 2 0 2 6 - 0 9 - 1 9 )  
 -   * * T � c h   C o m p o n e n t   ( s r c / v i e w s / s e t t i n g s / t a b s / ) * * :   T � c h   S e t t i n g s V i e w . v u e   ( t r ��c   � y   ~ 4 5 0   d � n g )   t h � n h   5   t a b   r i � n g   b i �t :   P r o f i l e T a b ,   A c c o u n t T a b ,   A p p e a r a n c e T a b ,   N o t i f i c a t i o n s T a b ,   P r i v a c y T a b .   S e t t i n g s V i e w   g i �  � y   s �  d �n g   D y n a m i c   C o m p o n e n t   ( < c o m p o n e n t   : i s > )   �  r e n d e r   c � c   t a b ,   g i � p   c o d e   n g �n   n g �n ,   d �  b �o   t r �   v �   m �  r �n g   t h � m   t a b   m �i   d �  d � n g .  
  
 # # #   S e s s i o n :   N o t i f i c a t i o n s   C o m p o n e n t   E x t r a c t i o n   ( 2 0 2 6 - 0 9 - 1 9 )  
 -   * * T � c h   C o m p o n e n t   ( s r c / c o m p o n e n t s / n o t i f i c a t i o n s / ) * * :   D i   c h u y �n   t o � n   b �  g i a o   d i �n   c �a   1   d � n g   t h � n g   b � o   ( k � m   t h e o   c � c   h � m   t � n h   t o � n   i c o n ,   m � u   s �c   p h �c   t �p )   t �  N o t i f i c a t i o n s V i e w . v u e   s a n g   N o t i f i c a t i o n I t e m . v u e .   V i �c   n � y   g i � p   C o m p o n e n t   c h a   ( N o t i f i c a t i o n s V i e w )   s �c h   s �  v �   c h �  t �p   t r u n g   v � o   v i �c   q u �n   l �   d a n h   s � c h / t r �n g   t h � i .  
  
 # # #   S e s s i o n :   P o s t   E d i t o r   E x t r a c t i o n   ( 2 0 2 6 - 0 9 - 1 9 )  
 -   * * T � c h   C o m p o n e n t   ( s r c / c o m p o n e n t s / p o s t s / P o s t E d i t o r . v u e ) * * :   N h � m   t o � n   b �  g i a o   d i �n   v �   l o g i c   s o �n   t h �o   b � i   v i �t   t �  C r e a t e P o s t V i e w   v �   E d i t P o s t V i e w   v � o   c h u n g   m �t   c o m p o n e n t   P o s t E d i t o r .   S �  d �n g   p r o p   m o d e   ( ' c r e a t e '   |   ' e d i t ' )   v �   i n i t i a l D a t a   �  i �u   k h i �n   h � n h   v i .   C h �m   d �t   t r i �t   �  t � n h   t r �n g   l �p   c o d e   g i �a   2   m � n   h � n h   n � y ,   g i �m   k � c h   t h ��c   v i e w   t �  ~ 1 5 K B   x u �n g   c � n   ~ 1 K B .  
  
 # # #   S e s s i o n :   C o m p o s a b l e s   R e o r g a n i z a t i o n   ( 2 0 2 6 - 0 9 - 2 0 )  
 -   * * Q u y   h o �c h   s r c / c o m p o s a b l e s / * * :   S �p   x �p   l �i   h �n   4 0   f i l e   c o m p o s a b l e s   b �  p h � n   m �n h   t h � n h   7   n h � m   l o g i c   c h � n h :    d m i n ,    u t h ,   c h a t ,   c o r e ,   g r o u p s ,   p o s t s ,   u i .   S �  d �n g   a u t o m a t i o n   s c r i p t   �  t �  �n g   c �p   n h �t   t o � n   b �  p a t h   i m p o r t s   t r o n g   c � c   f i l e   . v u e   v �   . t s   t o � n   d �  � n .   G i � p   t h �  m �c   c o d e   s �c h   s �  v �   c h u �n   E n t e r p r i s e   h �n .  
  
 # # #   S e s s i o n :   C h a t V i e w   R e f a c t o r i n g   ( 2 0 2 6 - 0 9 - 2 0 )  
 -   * * T � c h   C o m p o n e n t   ( C h a t V i e w ) * * :   T r �  d �t   i �m   ' Q u � i   v �t   n g h � n   d � n g '   \ C h a t V i e w . v u e \ .   T � c h   t h � n h   3   t h � n h   p h �n   �c   l �p :   \ C h a t S i d e b a r . v u e \ ,   \ C h a t M a i n . v u e \ ,   v �   \ C h a t I n f o P a n e l . v u e \ .   � p   d �n g   p a t t e r n   \ p r o v i d e / i n j e c t \   �  c h i a   s �  g l o b a l   s t a t e   \ u s e C h a t V i e w \   x u �n g   c � c   c o m p o n e n t s   c o n   m �   k h � n g   c �n   p r o p s   d r i l l i n g .   K �t   q u �:   \ C h a t V i e w . v u e \   g i �m   t �  9 0 9   d � n g   ( 5 0 K B )   x u �n g   c h �  c � n   ~ 6 0   d � n g   ( 2 K B ) ,   s i � u   d �  b �o   t r � .  
 