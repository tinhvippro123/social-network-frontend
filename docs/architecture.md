# 🏗️ Kiến trúc hệ thống — VietBlog

## Tổng quan

VietBlog sử dụng kiến trúc **Client-Server** phân tách rõ ràng:
- **Frontend**: Single Page Application (SPA) với Vue 3
- **Backend**: REST API + WebSocket với Spring Boot 4.0.8 (Java 21) theo Pragmatic Clean Architecture (`domain`, `application`, `infrastructure`, `presentation`)
- **Database**: PostgreSQL (+ pgvector `256-D` & `51-D`, PostGIS tùy chọn `ST_DWithin`/`ST_Distance`) + Redis (tùy chọn Pub/Sub / cache)

---

## 1. Frontend Architecture

### 1.1 Layout System

Frontend sử dụng **3 layout riêng biệt**, được chọn tự động dựa trên `route.meta.layout`:

```
App.vue
├── AuthLayout    (route.meta.layout === 'auth')
│   ├── ForgotPasswordView
│   ├── LoginView
│   └── RegisterView
│
├── MainLayout    (default — client pages)
│   ├── HomeView
│   ├── PostDetailView / CreatePostView
│   ├── ProfileView / SettingsView
│   ├── ChatView
│   ├── GroupsView / GroupDetailView
│   └── MapView
│
└── AdminLayout   (route.meta.layout === 'admin')
    ├── DashboardView
    ├── UsersView
    ├── PostsManageView
    ├── ModerationView
    ├── CategoriesView
    ├── GroupsManageView
    ├── AnalyticsView
    └── SettingsView
```

**Lý do tách AdminLayout riêng:**
- **Security**: Admin routes cô lập, dễ áp dụng route guard
- **UX**: Admin cần UI dashboard chuyên biệt (data table, chart) khác với client (reading, social)
- **Maintainability**: Thay đổi admin không ảnh hưởng client và ngược lại
- **Best practice**: Giống WordPress, Ghost, Strapi

### 1.2 State Management (Pinia)

```
stores/
└── auth.store.ts
    ├── user            → Current user info (kèm emailVerified & preferences)
    ├── isAuthenticated → Check auth status (bootstrap qua HttpOnly Cookie /api/auth/me)
    └── user.role       → Phân quyền USER / MODERATOR / ADMIN
```

### 1.3 Service Layer & Composables

Để đạt chuẩn DRY và tách biệt UI khỏi Logic/Data, kiến trúc Frontend tuân theo mô hình **View -> Composable -> API Layer**:

```
src/
├── api/             → Chứa các hàm Axios/Fetch gọi HTTP request tới Backend
│   ├── auth.api.ts
│   ├── posts.api.ts
│   └── ...
│
├── composables/     → Vue Composition API hooks, quản lý State (loading, error)
│   ├── useAsyncState.ts → Core xử lý try/catch và loading state tập trung
│   ├── usePosts.ts
│   └── ...
│
└── utils/           → Hàm tiện ích toàn cục không liên quan tới Vue State
    └── formatters.ts    → formatDate, formatNumber, formatRelativeTime
```

### 1.4 Design System

| Token | Giá trị | Sử dụng |
|---|---|---|
| `--color-primary-*` | Indigo 50–950 | Brand color chính |
| `--color-surface-*` | Slate-based | Background, card, sidebar |
| `gradient-primary` | primary-500 → primary-700 | CTA buttons |
| `gradient-accent` | primary → purple → pink | Special elements |
| `glass` / `glass-strong` | backdrop-blur + bg opacity | Glassmorphism cards |

**Responsive breakpoints**: Tailwind default (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)

### 1.5 Routing Strategy

| Path Pattern | Layout | Guard | Mô tả |
|---|---|---|---|
| `/login`, `/register`, `/forgot-password` | Auth | Guest only | Đăng nhập / Đăng ký OTP / Quên mật khẩu |
| `/`, `/trending`, `/bookmarks` | Main | — | Feed bài viết |
| `/posts/:id` | Main | — | Chi tiết bài |
| `/posts/create` | Main | Auth required | Viết bài |
| `/chat` | Main | Auth required | Chat |
| `/groups`, `/groups/:id` | Main | — | Nhóm |
| `/map` | Main | — | Bản đồ |
| `/profile/:id?`, `/settings` | Main | Auth / Profile guard | Hồ sơ & Cài đặt (Email, Thông báo, Riêng tư) |
| `/admin/*` | Admin | Admin / Moderator | Quản trị hệ thống |

---

## 2. Backend Architecture (Implemented — Pragmatic Clean Architecture)

### 2.1 Kiến trúc 4 tầng thực tế

```
src/main/java/com/vietblog/
├── domain/                  # Enterprise Business Rules & Pure Algorithms
│   ├── entity/              # User, Post, Comment, Notification, SystemSettings, ...
│   ├── repository/          # Spring Data JPA interfaces + search gateways
│   ├── search/              # TextAlgorithms (256-D, Sentiment, TextRank), ImageAlgorithms (51-D)
│   ├── service/             # PostDomainService (Trending, Wilson Score, Haversine)
│   └── exception/           # Domain & Business exceptions (ErrorCode)
│
├── application/             # Application Business Rules (Use Case Services)
│   ├── dto/                 # Request/Response DTOs (UserPreferencesDto, RegisterResponse, ...)
│   ├── mapper/              # Entity ↔ DTO mapping
│   └── service/             # AuthService, EmailService, UserApplicationService,
│                            # CommentApplicationService, ChatService, NotificationService,
│                            # TrendingRankingScheduler, SystemSettingsService
│
├── infrastructure/          # Frameworks & External Drivers
│   ├── config/              # SecurityConfig, WebSocketConfig, CORS, ExtendedDataSeeder
│   ├── search/              # PostgresSearchGateway (pgvector 256-D/51-D), SearchFileReader
│   ├── security/            # JwtAuthenticationFilter, HttpOnly Cookie auth, WS ticket
│   ├── service/             # Redis / storage adapters
│   └── websocket/           # ChatWebSocketHandler (/ws/chat)
│
└── presentation/            # Interface Adapters
    ├── controller/          # AuthController, UserController, ChatController, CommentController, ...
    └── exception/           # GlobalExceptionHandler (chuẩn ApiResponse<T>)
```

### 2.2 Database Schema (23 bảng PostgreSQL + pgvector)

Toàn bộ lược đồ CSDL hiện tại gồm **23 bảng** chuẩn hóa trong PostgreSQL (không phát sinh bảng phụ cho Cài đặt thông báo/riêng tư hay Xác thực OTP):

```sql
-- 1-2. Users & Social Graph (lưu kèm tùy chọn Thông báo, Quyền riêng tư & Email Verified)
users (id, email, password_hash, name, avatar, bio, role, active, email_verified,
       profile_visibility, allow_messages, show_online_status, show_read_receipts,
       email_new_follower, email_new_comment, email_new_message,
       notify_new_follower, notify_new_comment, notify_new_message, notify_trending,
       created_at)
user_followers (follower_id FK, following_id FK, created_at)

-- 3-7. Content, Tags & pgvector Embeddings
categories (id, name, slug, icon, posts_count)
posts (id, title, content, excerpt, cover_image, status, author_id FK, category_id FK,
       latitude, longitude, upvotes_count, downvotes_count, views_count, comments_count,
       trending_score, created_at, updated_at)
post_tags (post_id FK, tag)
post_text_vectors (post_id PK/FK, embedding VECTOR(256))     -- pgvector 256-D
post_image_features (post_id PK/FK, features VECTOR(51))    -- pgvector 51-D CBIR

-- 8-10. Interactions
comments (id, content, post_id FK, author_id FK, parent_id FK, upvotes_count, created_at)
reactions (id, user_id FK, target_type, target_id, type, created_at)
bookmarks (id, user_id FK, post_id FK, created_at)

-- 11-15. Community Groups
community_groups (id, name, description, avatar, cover_image, owner_id FK, is_public, created_at)
group_members, group_posts, group_post_comments, group_post_likes

-- 16-19. Real-time Chat
conversations, conversation_members, chat_messages, chat_blocks

-- 20-23. Notifications, Moderation, Auth Tokens & Settings
notifications (id, user_id FK, type, title, message, link, is_read, created_at)
reports (id, reporter_id FK, target_type, target_id, reason, status, created_at)
password_reset_tokens (id, user_id FK, otp, purpose, expires_at, used) -- PASSWORD_RESET | EMAIL_VERIFICATION
system_settings (id, require_email_verification, ...)
```

### 2.3 Key API Endpoints

```
POST   /api/auth/register               # Đăng ký & gửi OTP qua Gmail SMTP (tạo tài khoản)
POST   /api/auth/verify-email           # Xác thực email bằng OTP 6 số
POST   /api/auth/resend-verification    # Gửi lại OTP xác thực email
POST   /api/auth/login                  # Đăng nhập (cấp HttpOnly Cookie JWT)
POST   /api/auth/forgot-password        # Gửi OTP đặt lại mật khẩu qua SMTP (không trả OTP trong JSON)
POST   /api/auth/reset-password         # Đặt lại mật khẩu bằng OTP
GET/PUT /api/users/me/preferences       # Lưu & đồng bộ cài đặt Thông báo + Quyền riêng tư
GET    /api/posts?page=&category=&sort=trending
POST   /api/posts
GET    /api/posts/nearby?lat=&lng=&radius=     # Haversine geospatial search
GET    /api/search?q=&type=semantic              # pgvector 256-D Cosine Similarity
POST   /api/search/image                         # CBIR 51-D pgvector Image search
WS     /ws/chat                                  # WebSocket real-time chat & notifications
GET    /api/admin/stats
```

---

## 3. Luồng dữ liệu chính

### 3.1 Tìm kiếm ngữ nghĩa, Ảnh (CBIR) & Tài liệu
```
User nhập query / upload ảnh hoặc PDF/DOCX/TXT
→ TextAlgorithms (256-D) hoặc ImageAlgorithms (51-D) hoặc SearchFileReader (PDFBox / StAX)
→ Query pgvector (post_text_vectors / post_image_features Cosine Similarity)
→ Trả về ranked results
```

### 3.2 Chat real-time & Thông báo
```
User gửi tin nhắn → WebSocket (/ws/chat) hoặc REST /api/chat
→ Kiểm tra quyền riêng tư (allowMessages / ChatBlock) → Lưu DB
→ Đẩy event real-time qua WebSocket tới các thành viên + gửi email (nếu bật emailNewMessage)
```

### 3.3 Trending ranking
```
TrendingRankingScheduler (mỗi 5 phút) → Tính trending_score cho mỗi post
→ score = Weighted(upvotes, downvotes, comments, views) * (0.5 + Wilson95%) / (hoursAge + 2)^1.8
→ Lưu vào posts.trending_score + phát thông báo trong ứng dụng nếu bật notifyTrending
```

### 3.4 Tìm kiếm theo vị trí
```
User chọn tọa độ + bán kính → PostgresSearchGateway
→ PostGIS ST_DWithin / ST_Distance (nếu PostgreSQL có extension postgis)
→ Fallback pure-Java Haversine (PostDomainService / GeoAlgorithms) → Lọc & sắp xếp theo km
```
