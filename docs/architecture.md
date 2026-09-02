# 🏗️ Kiến trúc hệ thống — VietBlog

## Tổng quan

VietBlog sử dụng kiến trúc **Client-Server** phân tách rõ ràng:
- **Frontend**: Single Page Application (SPA) với Vue 3
- **Backend**: REST API + WebSocket với Spring Boot 3
- **Database**: PostgreSQL (+ PostGIS + pgvector) + Redis

---

## 1. Frontend Architecture

### 1.1 Layout System

Frontend sử dụng **3 layout riêng biệt**, được chọn tự động dựa trên `route.meta.layout`:

```
App.vue
├── AuthLayout    (route.meta.layout === 'auth')
│   ├── LoginView
│   └── RegisterView
│
├── MainLayout    (default — client pages)
│   ├── HomeView
│   ├── PostDetailView / CreatePostView
│   ├── ProfileView
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
├── auth.store.ts
│   ├── user            → Current user info
│   ├── token           → JWT Token
│   ├── isAuthenticated → Check auth status
│   └── isAdmin         → Computed from user.role
│
├── ui.store.ts
│   ├── isDark          → Theme toggle (dark/light)
│   ├── isSidebarOpen   → Sidebar collapse state
│   ├── searchMode      → Keyword, Semantic, Image
│   └── notifications   → System notifications
│
└── app.ts              → Legacy wrapper for backward compatibility
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
| `/login`, `/register` | Auth | Guest only | Đăng nhập/Đăng ký |
| `/`, `/trending`, `/bookmarks` | Main | — | Feed bài viết |
| `/posts/:id` | Main | — | Chi tiết bài |
| `/posts/create` | Main | Auth required | Viết bài |
| `/chat` | Main | Auth required | Chat |
| `/groups`, `/groups/:id` | Main | — | Nhóm |
| `/map` | Main | — | Bản đồ |
| `/profile/:id?` | Main | Auth required | Profile |
| `/admin/*` | Admin | Admin only | Quản trị |

---

## 2. Backend Architecture (Planned)

### 2.1 Clean Architecture (4 Layers)

```
src/main/java/com/vietblog/
├── domain/                  # Enterprise Business Rules
│   ├── entity/              # Post, User, Comment, Group, ...
│   ├── repository/          # Interface only (no implementation)
│   └── exception/           # Domain exceptions
│
├── usecase/                 # Application Business Rules
│   ├── post/                # CreatePost, GetTrendingPosts, ...
│   ├── user/                # RegisterUser, GetProfile, ...
│   ├── search/              # SemanticSearch, ImageSearch, ...
│   ├── chat/                # SendMessage, GetConversations, ...
│   └── ranking/             # CalculateTrendingScore, ...
│
├── adapter/                 # Interface Adapters
│   ├── controller/          # REST Controllers
│   ├── dto/                 # Request/Response DTOs
│   └── mapper/              # Entity ↔ DTO mapping
│
└── infrastructure/          # Frameworks & Drivers
    ├── config/              # Spring configs, CORS, WebSocket
    ├── persistence/         # JPA Repository implementations
    ├── security/            # JWT, OAuth2 config
    ├── redis/               # Redis cache + Pub/Sub
    └── storage/             # File upload service
```

### 2.2 Database Schema (Core)

```sql
-- Users
users (id, email, password_hash, name, avatar, bio, role, created_at)

-- Posts (with PostGIS + pgvector)
posts (id, title, content, excerpt, cover_image, status,
       author_id FK, category_id FK,
       location GEOMETRY(Point, 4326),    -- PostGIS
       content_vector VECTOR(384),         -- pgvector
       upvotes_count, views_count, comments_count,
       trending_score FLOAT,               -- Pre-computed
       created_at, updated_at)

-- Comments (nested/threaded)
comments (id, content, post_id FK, author_id FK, parent_id FK,
          upvotes_count, created_at)

-- Categories
categories (id, name, slug, icon, posts_count)

-- Groups
groups (id, name, description, avatar, cover_image,
        owner_id FK, is_public, members_count, created_at)

-- Chat
conversations (id, name, is_group, created_at)
messages (id, conversation_id FK, sender_id FK, content, type, created_at)

-- Votes, Bookmarks, Reports, Tags...
```

### 2.3 Key API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/posts?page=&category=&sort=trending
POST   /api/posts
GET    /api/posts/{id}
GET    /api/posts/nearby?lat=&lng=&radius=     # PostGIS
GET    /api/search?q=&type=semantic              # pgvector
POST   /api/search/image                         # Image search
WS     /ws/chat                                  # WebSocket
GET    /api/admin/stats
```

---

## 3. Luồng dữ liệu chính

### 3.1 Tìm kiếm ngữ nghĩa
```
User nhập query → Backend tokenize + tính vector
→ Query pgvector (Cosine Similarity)
→ Trả về ranked results
```

### 3.2 Chat real-time
```
User gửi tin nhắn → WebSocket → Spring handler
→ Lưu DB + Publish Redis channel
→ Redis Pub/Sub → Broadcast WebSocket → Tất cả client
```

### 3.3 Trending ranking
```
Cron job (mỗi 5 phút) → Tính trending_score cho mỗi post
→ score = f(upvotes, views, comments, age)
→ Lưu vào posts.trending_score
→ Client query ORDER BY trending_score DESC
```

### 3.4 Tìm kiếm theo vị trí
```
User chọn vị trí + bán kính → Backend query PostGIS
→ ST_DWithin(location, point, radius)
→ Trả về posts trong bán kính
```
