# 🔄 Luồng chạy tính năng — VietBlog

> Tài liệu mô tả chi tiết từng bước khi người dùng tương tác với hệ thống.
> Mỗi luồng ghi rõ: **User hành động gì → File nào xử lý → Gọi file nào → Kết quả trả về đâu**.

---

## 1. Đăng nhập (Login)

```
👤 User nhập email + password, click "Đăng nhập"
│
├─ 📄 views/auth/LoginView.vue
│  └─ Gọi composable: useAuth().login({ email, password })
│
├─ 📄 composables/useAuth.ts → login()
│  ├─ Set isLoading = true
│  ├─ Gọi API: authApi.login(credentials)
│  │
│  ├─ 📄 api/auth.api.ts → login()
│  │  └─ Gọi HTTP: http.post('/auth/login', data)
│  │
│  ├─ 📄 api/client.ts (Axios Interceptor)
│  │  └─ Request Interceptor: Gắn header Authorization (nếu có token cũ)
│  │  └─ Gửi request → Backend Spring Boot
│  │
│  ├─ ⚙️ Backend xử lý
│  │  └─ Kiểm tra email/password → Tạo JWT → Trả về { accessToken, refreshToken, user }
│  │
│  ├─ ← Response trả về composable
│  │  ├─ Lưu accessToken → localStorage (STORAGE_KEYS.ACCESS_TOKEN)
│  │  ├─ Lưu refreshToken → localStorage (STORAGE_KEYS.REFRESH_TOKEN)
│  │  ├─ Lưu user → localStorage (STORAGE_KEYS.USER)
│  │  └─ Set user.value = data.user
│  │
│  └─ router.push('/') → Chuyển về trang chủ
│
├─ 📄 router/index.ts
│  └─ Route '/' → meta.layout = default → dùng MainLayout
│
├─ 📄 layouts/MainLayout.vue
│  ├─ Đọc useAppStore().user → Hiển thị tên + avatar ở navbar
│  ├─ Đọc useAppStore().isAdmin → Nếu true, hiện link "Trang quản trị"
│  └─ Render <RouterView /> → HomeView.vue
│
└─ ✅ Kết quả: User thấy trang chủ, navbar hiện tên mình
```

---

## 2. Xem trang chủ + Bài viết trending

```
👤 User truy cập "/" (trang chủ)
│
├─ 📄 router/index.ts
│  └─ Match route '/' → component: HomeView → layout: MainLayout
│
├─ 📄 layouts/MainLayout.vue
│  └─ Render sidebar + navbar + <RouterView />
│
├─ 📄 views/HomeView.vue
│  ├─ onMounted() → Gọi usePosts().fetchPosts()
│  │
│  ├─ 📄 composables/usePosts.ts → fetchPosts()
│  │  ├─ Set isLoading = true
│  │  ├─ Gọi: postsApi.getAll({ page: 1, limit: 10, sort: 'latest' })
│  │  │
│  │  ├─ 📄 api/posts.api.ts → getAll()
│  │  │  └─ http.get('/posts', { params })
│  │  │
│  │  ├─ 📄 api/client.ts → Axios gửi GET request
│  │  │  └─ Request Interceptor: Gắn Bearer token
│  │  │
│  │  ├─ ⚙️ Backend: Query PostgreSQL → ORDER BY created_at DESC
│  │  │
│  │  ├─ ← Response: { data: Post[], meta: { page, total, totalPages } }
│  │  ├─ Set posts.value = response.data
│  │  └─ Set pagination = response.meta
│  │
│  ├─ Sidebar trending → Gọi usePosts().fetchTrending(5)
│  │  ├─ 📄 api/posts.api.ts → getTrending()
│  │  │  └─ http.get('/posts/trending', { params: { limit: 5 } })
│  │  │
│  │  └─ ⚙️ Backend: Query posts ORDER BY trending_score DESC LIMIT 5
│  │     (trending_score được tính bởi giải thuật ở algorithms.md, Section 1)
│  │
│  └─ Render danh sách bài viết (v-for) + sidebar trending
│
└─ ✅ Kết quả: User thấy feed bài viết mới nhất + top 5 trending bên phải
```

---

## 3. Xem chi tiết bài viết + Comment

```
👤 User click vào tiêu đề một bài viết
│
├─ 📄 views/HomeView.vue
│  └─ <RouterLink :to="'/posts/' + post.id"> → Chuyển trang
│
├─ 📄 router/index.ts
│  └─ Match route '/posts/:id' → component: PostDetailView
│
├─ 📄 views/posts/PostDetailView.vue
│  ├─ onMounted() → Lấy id từ route.params.id
│  ├─ Gọi usePosts().fetchPost(id)
│  │
│  ├─ 📄 composables/usePosts.ts → fetchPost()
│  │  ├─ postsApi.getById(id)
│  │  │  └─ http.get('/posts/p1')
│  │  ├─ ⚙️ Backend: SELECT * FROM posts WHERE id = 'p1' (kèm author, comments)
│  │  └─ Set currentPost.value = response.data
│  │
│  ├─ Render bài viết: title, content, cover, author info
│  ├─ Render comments (nested/threaded — dùng component đệ quy)
│  └─ Render sidebar: related posts, author bio
│
├─ 👤 User click nút "Thích" (Upvote)
│  ├─ Gọi usePosts().upvote(postId)
│  │  └─ postsApi.upvote(id) → http.post('/posts/p1/upvote')
│  │  └─ ⚙️ Backend: INSERT INTO votes + UPDATE posts SET upvotes_count += 1
│  └─ UI cập nhật số lượt thích
│
├─ 👤 User viết comment, click "Gửi"
│  ├─ Gọi API: http.post('/posts/p1/comments', { content: '...' })
│  ├─ ⚙️ Backend: INSERT INTO comments
│  └─ UI thêm comment mới vào danh sách
│
└─ ✅ Kết quả: User đọc bài, thích, và bình luận thành công
```

---

## 4. Tìm kiếm (3 loại)

### 4a. Tìm kiếm từ khóa
```
👤 User gõ "Vue.js tutorial" vào thanh search, nhấn Enter
│
├─ 📄 layouts/MainLayout.vue (hoặc SearchComponent)
│  └─ Gọi useSearch().searchByKeyword('Vue.js tutorial')
│
├─ 📄 composables/useSearch.ts → searchByKeyword()
│  ├─ postsApi.getAll({ search: 'Vue.js tutorial' })
│  │  └─ http.get('/posts?search=Vue.js+tutorial')
│  ├─ ⚙️ Backend: SELECT * FROM posts WHERE title ILIKE '%vue.js%' OR content ILIKE '%tutorial%'
│  └─ Set results.value = response.data
│
└─ ✅ Kết quả: Hiển thị danh sách bài viết khớp từ khóa
```

### 4b. Tìm kiếm ngữ nghĩa (Semantic Search)
```
👤 User chọn chế độ "Tìm kiếm thông minh", gõ "cách deploy app"
│
├─ 📄 composables/useSearch.ts → searchSemantic()
│  ├─ postsApi.searchSemantic('cách deploy app')
│  │  └─ http.get('/search/semantic?q=cách+deploy+app')
│  │
│  ├─ ⚙️ Backend (Giải thuật tự viết — xem algorithms.md Section 2):
│  │  ├─ Tokenize query → Tính TF-IDF vector
│  │  ├─ Query pgvector: SELECT * FROM posts ORDER BY content_vector <=> query_vector
│  │  └─ Trả về kết quả sắp theo Cosine Similarity
│  │
│  └─ Set results.value = response.data
│
└─ ✅ Kết quả: Tìm được bài "Hướng dẫn triển khai ứng dụng lên server"
   (khớp ý nghĩa dù không khớp từ khóa)
```

### 4c. Tìm kiếm bằng hình ảnh
```
👤 User upload một ảnh lên ô tìm kiếm
│
├─ 📄 composables/useSearch.ts → searchByImage(file)
│  ├─ Tạo FormData, append file
│  ├─ postsApi.searchByImage(formData)
│  │  └─ http.post('/search/image', formData, { 'Content-Type': 'multipart/form-data' })
│  │
│  ├─ ⚙️ Backend (Giải thuật tự viết — xem algorithms.md Section 3):
│  │  ├─ Nhận ảnh → Resize 224×224
│  │  ├─ Trích xuất Color Histogram (HSV) + Edge (Sobel) + Texture (GLCM)
│  │  ├─ Concatenate → vector 384 chiều
│  │  ├─ Query pgvector: tìm ảnh tương tự
│  │  └─ Trả về bài viết có ảnh giống nhất
│  │
│  └─ Set results.value = response.data
│
└─ ✅ Kết quả: Hiển thị bài viết có hình ảnh tương tự ảnh vừa upload
```

---

## 5. Chat Real-time

```
👤 User click "Chat" trên sidebar
│
├─ 📄 router/index.ts → route '/chat' → ChatView
│
├─ 📄 views/chat/ChatView.vue
│  ├─ onMounted():
│  │  ├─ Gọi chatApi.getConversations() → Load danh sách hội thoại
│  │  └─ Gọi useWebSocket().connect() → Mở kết nối WebSocket
│  │
│  ├─ 📄 composables/useWebSocket.ts → connect()
│  │  ├─ new WebSocket(VITE_WS_URL) → ws://localhost:8080/ws
│  │  ├─ ws.onopen → isConnected = true
│  │  ├─ ws.onmessage → lastMessage.value = JSON.parse(event.data)
│  │  └─ ws.onclose → attemptReconnect() (tối đa 5 lần, mỗi 3 giây)
│  │
│  ├─ 👤 User chọn một cuộc hội thoại
│  │  └─ Gọi chatApi.getMessages(conversationId) → Load tin nhắn cũ
│  │
│  ├─ 👤 User gõ tin nhắn, nhấn Enter
│  │  ├─ Gọi useWebSocket().send({ conversationId, content, type: 'text' })
│  │  │  └─ ws.send(JSON.stringify(data)) → Gửi qua WebSocket
│  │  │
│  │  ├─ ⚙️ Backend:
│  │  │  ├─ Nhận message qua WebSocket handler
│  │  │  ├─ Lưu vào DB: INSERT INTO messages
│  │  │  ├─ PUBLISH Redis channel: chat:{conversationId}
│  │  │  └─ Redis Pub/Sub → Broadcast đến tất cả client đang subscribe
│  │  │
│  │  └─ ws.onmessage (người nhận) → lastMessage cập nhật → UI render tin nhắn mới
│  │
│  └─ onUnmounted() → useWebSocket().disconnect() (tự dọn dẹp)
│
└─ ✅ Kết quả: Hai user chat real-time, tin nhắn hiện ngay lập tức
```

---

## 6. Tìm bài viết gần đây (Bản đồ — PostGIS)

```
👤 User click "Bản đồ" trên sidebar
│
├─ 📄 router/index.ts → route '/map' → MapView
│
├─ 📄 views/map/MapView.vue
│  ├─ onMounted():
│  │  ├─ navigator.geolocation.getCurrentPosition() → Lấy vị trí GPS
│  │  └─ Gọi postsApi.getNearby(lat, lng, 5) → Tìm bài trong 5km
│  │
│  ├─ 📄 api/posts.api.ts → getNearby()
│  │  └─ http.get('/posts/nearby?lat=10.77&lng=106.69&radius=5')
│  │
│  ├─ ⚙️ Backend (PostGIS — xem algorithms.md Section 4):
│  │  ├─ ST_DWithin(location::geography, ST_MakePoint(lng, lat)::geography, 5000)
│  │  ├─ Tính khoảng cách: ST_Distance(...)
│  │  └─ ORDER BY distance ASC → Trả về bài viết gần nhất
│  │
│  ├─ ← Response: danh sách posts kèm distance_meters
│  ├─ Render bản đồ Leaflet.js + markers cho mỗi bài viết
│  └─ User click marker → Hiện popup thông tin bài viết
│
└─ ✅ Kết quả: User thấy bản đồ với các bài viết xung quanh vị trí mình
```

---

## 7. Xếp hạng Trending (Cron Job)

```
⏰ Cron Job chạy tự động mỗi 5 phút (Spring @Scheduled)
│
├─ ⚙️ Backend — TrendingRankerService (Giải thuật tự viết — algorithms.md Section 1):
│  │
│  ├─ SELECT * FROM posts WHERE created_at > NOW() - INTERVAL '72 hours'
│  │  (Chỉ tính cho bài viết trong 72h gần nhất)
│  │
│  ├─ Với mỗi post, tính:
│  │  ├─ popularity = log10(1 + upvotes×3 + comments×2 + views×0.01)
│  │  ├─ time_decay = 1 / (hours_age + 2)^1.5
│  │  ├─ engagement = 1 + min(comment_rate/view_rate, 2) × 0.3
│  │  └─ trending_score = popularity × time_decay × engagement
│  │
│  ├─ UPDATE posts SET trending_score = ? WHERE id = ?
│  │  (Batch update tất cả scores)
│  │
│  └─ Log: "[Trending] Updated 150 posts in 230ms"
│
├─ Khi client gọi postsApi.getTrending():
│  └─ Backend: SELECT * FROM posts ORDER BY trending_score DESC LIMIT 10
│
└─ ✅ Kết quả: Sidebar trending tự động cập nhật bài hot mỗi 5 phút
```

---

## 8. Admin — Kiểm duyệt bài viết bị report

```
👤 Admin click "Kiểm duyệt" trên Admin Sidebar
│
├─ 📄 router/index.ts → route '/admin/moderation' → ModerationView
│  └─ meta.layout = 'admin' → AdminLayout
│
├─ 📄 layouts/AdminLayout.vue → Render admin sidebar + breadcrumb
│
├─ 📄 views/admin/ModerationView.vue
│  ├─ onMounted() → adminApi.getReports({ status: 'pending' })
│  │  └─ http.get('/admin/reports?status=pending')
│  │  └─ ⚙️ Backend: SELECT * FROM reports WHERE status = 'pending' ORDER BY created_at
│  │
│  ├─ Render bảng danh sách reports (target, reason, reporter)
│  │
│  ├─ 👤 Admin click "Xóa bài" trên 1 report
│  │  ├─ adminApi.resolveReport(reportId, 'delete')
│  │  │  └─ http.put('/admin/reports/r1', { action: 'delete' })
│  │  ├─ ⚙️ Backend:
│  │  │  ├─ UPDATE reports SET status = 'resolved'
│  │  │  └─ UPDATE posts SET status = 'hidden' WHERE id = targetId
│  │  └─ UI: Xóa report khỏi bảng, hiện thông báo thành công
│  │
│  └─ 👤 Admin click "Bỏ qua"
│     ├─ adminApi.dismissReport(reportId)
│     └─ UI: Xóa report khỏi bảng
│
└─ ✅ Kết quả: Admin xử lý xong reports, bài vi phạm bị ẩn
```

---

## Tham khảo nhanh: File nào làm gì

| Khi cần... | Mở file |
|---|---|
| Sửa UI/giao diện | `views/xxx/XxxView.vue` |
| Sửa logic xử lý | `composables/useXxx.ts` |
| Sửa/thêm API endpoint | `api/xxx.api.ts` |
| Sửa cấu hình Axios | `api/client.ts` |
| Sửa state toàn cục | `stores/xxx.store.ts` |
| Thêm TypeScript type | `types/index.ts` |
| Thêm constant | `constants/index.ts` |
| Thêm route mới | `router/index.ts` |
| Sửa layout/sidebar/navbar | `layouts/XxxLayout.vue` |
| Sửa theme/CSS | `style.css` |
