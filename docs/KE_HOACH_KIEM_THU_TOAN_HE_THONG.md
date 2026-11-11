# 📋 Kịch Bản Kiểm Thử Toàn Diện 100% Chức Năng (Không Đăng Nhập vs Đã Đăng Nhập) & Trình Diễn Bảo Vệ Đồ Án — VietBlog

> [!IMPORTANT]
> Tài liệu này bao phủ **100% tất cả các màn hình, route, tab, modal, nút bấm, bộ lọc và API** của dự án **VietBlog** (*Xây dựng Web App Quản lý Bài viết Tích hợp AI* — Đề cương ĐACN của SV **Lê Thanh Tính `1250080199`**, GVHD: **ThS. Nguyễn Duy Tuấn**).
> Mọi chức năng đều được tách bạch rõ ràng theo **2 trạng thái đối xứng**:
> 1. **Trạng thái 1 — KHÔNG ĐĂNG NHẬP (`Guest` / Cửa sổ Ẩn danh)**: Không có cookie, kiểm tra trải nghiệm đọc công khai, AI, bản đồ, tìm kiếm và kiểm chứng **chặn 100% hành vi ghi/riêng tư** (bật `AuthModal` + ghi nhớ trang đích `authRedirectPath` hoặc trả về `401 Unauthorized` chuẩn JSON).
> 2. **Trạng thái 2 — ĐÃ ĐĂNG NHẬP (`HttpOnly Cookie` — `USER` / `MODERATOR` / `ADMIN`)**: Kiểm tra trọn vẹn luồng tương tác, phân quyền 3 cấp, real-time WebSocket và quản trị hệ thống.

---

## 0. Chuẩn Bị Môi Trường & Danh Sách Tài Khoản Mẫu (Seeded Accounts)

### 0.1. Khởi chạy hạ tầng & ứng dụng
1. **Kiểm tra môi trường Java 21 LTS (khớp đề cương):**
   ```powershell
   java -version
   # Kỳ vọng: java version "21.0.12.1" ... và JAVA_HOME = D:\Program Files\Java\jdk-21.0.12.1
   ```
2. **Khởi chạy PostgreSQL 16 (`PostGIS` + `pgvector`) & Redis 7+:**
   ```powershell
   docker compose up -d postgres redis
   ```
3. **Chạy bộ kiểm thử tự động Backend trước khi khởi chạy (tùy chọn, ~28 test suites / 86 tests):**
   ```powershell
   .\backend\gradlew.bat -p backend test
   ```
4. **Khởi chạy Backend (Java 21 LTS & Spring Boot 4.0.8 — cổng `8080`):**
   ```powershell
   .\backend\gradlew.bat -p backend bootRun
   ```
5. **Khởi chạy Frontend (Vue 3 + Vite — cổng `5173`):**
   ```powershell
   npm --prefix frontend run dev
   ```
6. **Mở song song 2 cửa sổ trình duyệt để kiểm thử đối chứng:**
   - **Cửa sổ A (Incognito / Ẩn danh):** Dùng để test vai trò **Không đăng nhập (`Guest`)**.
   - **Cửa sổ B (Trình duyệt chính):** Dùng để test vai trò **Đã đăng nhập (`USER`, `MODERATOR`, `ADMIN`)**.

### 0.2. Bảng tài khoản mẫu tự động khởi tạo (`DataSeeder.java`)
Tất cả tài khoản mẫu dùng chung mật khẩu: **`Password123!`**

| Vai trò (`Role`) | Email đăng nhập | Tên hiển thị | Mục đích kiểm thử chính |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | `admin@vietblog.com` | Quản Trị Viên | Toàn quyền 8 phân hệ `/admin/*`, xóa mọi nội dung, khóa user, cấu hình hệ thống |
| **`MODERATOR`** | `phamminhduc@gmail.com` | Phạm Minh Đức | Chỉ truy cập 3 phân hệ `/admin/moderation`, `/admin/posts`, `/admin/groups`; duyệt báo cáo, ẩn bài |
| **`USER` (Tác giả 1)** | `nguyenvanan@gmail.com` | Nguyễn Văn An | Tác giả nhiều bài viết công nghệ, Trưởng nhóm cộng đồng |
| **`USER` (Tác giả 2)** | `dangthimylinh@gmail.com` | Đặng Thị Mỹ Linh | Tác giả bài viết ẩm thực/địa điểm, dùng test chat 1-1, follow, phân quyền sửa/xóa chéo |

---

## PHẦN 1: Hệ Thống Điều Hướng & Giao Diện Chung (`MainNavbar`, `MainSidebar`, `AuthModal`, `ScrollToTop`)

### 1.1. Khi KHÔNG ĐĂNG NHẬP (`Guest` — Cửa sổ Ẩn danh)
- [ ] **Kiểm tra Console & Network khi vừa tải trang chủ (`/`):**
  - Mở `F12 -> Network`: Chỉ gọi các API công khai (`/api/posts`, `/api/categories`, `/api/tags/popular`, `/api/users/top`).
  - **Không** gọi `/api/users/me` (nhờ cờ cookie `vietblog_logged_in=1`), **không** mở kết nối `/ws` WebSocket, **không** có bất kỳ lỗi đỏ `401` hay `403` nào trên Console.
- [ ] **Thanh điều hướng trên cùng (`MainNavbar.vue`):**
  - Hiển thị Logo **VietBlog** (bấm về `/`), ô tìm kiếm nhanh **Omni-Search** ở giữa, nút **Chuyển đổi Giao diện Sáng/Tối (Dark/Light Mode)**, nút **`Đăng nhập`** và **`Đăng ký`**.
  - **Không** hiển thị nút `Viết bài`, chuông `Thông báo` hay Avatar cá nhân.
- [ ] **Ô tìm kiếm nhanh Omni-Search trên Navbar:**
  - Gõ từ khóa (VD: `"AI"`) -> sau `280ms` hiện dropdown gợi ý tối đa 5 bài viết kèm ảnh thumbnail và tên tác giả.
  - Bấm vào 1 gợi ý -> chuyển tới `/posts/:id`.
  - Bấm phím `Enter` -> chuyển tới `/search?q=AI`.
  - Bấm biểu tượng **Camera (`📷`)** bên phải ô tìm kiếm -> mở hộp thoại chọn ảnh từ máy tính -> tự động chuyển sang `/search` ở chế độ **Tìm kiếm bằng hình ảnh (CBIR)** và hiển thị kết quả tương đồng.
- [ ] **Thanh điều hướng bên trái (`MainSidebar.vue`):**
  - Nhóm **Menu chính**: Hiển thị đầy đủ `Trang chủ (/)`, `Sự kiện (/events)`, `Thịnh hành (/trending)`, `Bản đồ (/map)`, `Nhóm (/groups)`, `Tìm kiếm (/search)`, `Đã lưu (/bookmarks)`.
  - Nhóm **Cá nhân (`Tin nhắn`, `Thông báo`, `Hồ sơ`, `Cài đặt`)** và **Quản trị (`Bảng điều khiển`)**: **Ẩn hoàn toàn** đối với Guest.
  - Danh sách **Chủ đề (`Categories`)**: Hiển thị tối đa 6 danh mục ban đầu, bấm **`Xem thêm (N)`** mở rộng toàn bộ danh mục, bấm **`Thu gọn`** thu nhỏ lại.
- [ ] **Cơ chế Ghi nhớ Trang đích (`authRedirectPath`) khi Guest truy cập route yêu cầu đăng nhập:**
  - Tại thanh bên trái, bấm vào mục **`Đã lưu (/bookmarks)`** (hoặc gõ trực tiếp URL `/posts/create`, `/chat`, `/notifications`, `/settings`, `/profile`).
  - **Kỳ vọng:** Không chuyển sang trang trắng hay báo lỗi; hệ thống giữ nguyên trang hiện tại (hoặc về `/`), hiện thông báo *"Vui lòng đăng nhập để tiếp tục"* và **tự động bật `AuthModal`**. Sau khi đăng nhập thành công trên `AuthModal`, hệ thống **tự động chuyển hướng đúng vào trang vừa bấm** (VD: `/bookmarks` hoặc `/posts/create`).
- [ ] **Nút Cuộn lên đầu trang (`ScrollToTop.vue`) & Hộp thoại Chat nổi (`ChatPopup.vue`):**
  - Cuộn xuống quá `300px` -> nút mũi tên lên xuất hiện ở góc phải dưới, bấm vào cuộn mượt lên đầu trang.
  - **Không** hiển thị bong bóng `ChatPopup` ở góc phải dưới khi chưa đăng nhập.

### 1.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] **Thanh điều hướng trên cùng (`MainNavbar.vue`):**
  - Nút `Đăng nhập / Đăng ký` biến mất; thay bằng nút **`Viết bài`** (`/posts/create`), **Chuông Thông báo** (kèm chấm đỏ số lượng chưa đọc) và **Menu Avatar người dùng**.
  - Bấm vào Avatar -> mở menu thả xuống gồm: Tên & Email, `Trang cá nhân`, `Bài viết đã lưu`, `Cài đặt`, `Quản trị hệ thống` (chỉ hiện nếu là `ADMIN`/`MODERATOR`), và `Đăng xuất`.
- [ ] **Thanh điều hướng bên trái (`MainSidebar.vue`):**
  - Xuất hiện thêm nhóm **Cá nhân**: `Tin nhắn (/chat)`, `Thông báo (/notifications)`, `Hồ sơ (/profile)`, `Cài đặt (/settings)`.
  - Nếu đăng nhập bằng `MODERATOR` (`phamminhduc@gmail.com`) hoặc `ADMIN` (`admin@vietblog.com`), xuất hiện thêm nhóm **Quản trị**: `Bảng điều khiển (/admin)`.
- [ ] **Bong bóng Chat nổi (`ChatPopup.vue`):**
  - Hiển thị ở góc phải dưới mọi trang (trừ khi đang ở trang `/chat`), hiển thị tổng số tin nhắn chưa đọc thời gian thực qua WebSocket.

---

## PHẦN 2: Xác Thực, Bảo Mật `HttpOnly Cookie` & Quản Lý Phiên (`/login`, `/register`, `/forgot-password`, `AuthModal`)

### 2.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] **Đăng ký tài khoản mới (`/register` hoặc tab `Đăng ký` trên `AuthModal`):**
  - Kiểm tra validation: Tên trống, Email sai định dạng, Mật khẩu `< 8` ký tự, Xác nhận mật khẩu không khớp, chưa tích *"Đồng ý Điều khoản"* -> Báo lỗi rõ ràng dưới từng ô, chặn gửi form.
  - Nhập email đã tồn tại (`admin@vietblog.com`) -> Backend trả về `409 Conflict` (*"Email đã được sử dụng"*).
  - Nhập thông tin hợp lệ mới -> Đăng ký thành công (`200 OK`), tự động đăng nhập (`POST /api/auth/login`) và đính kèm `HttpOnly Cookie`.
- [ ] **Đăng nhập (`/login` hoặc tab `Đăng nhập` trên `AuthModal`):**
  - Nhập sai mật khẩu -> Trả về `401 Unauthorized` (*"Email hoặc mật khẩu không chính xác"*).
  - Kiểm tra **3 nút Demo Quick-Fill** (`Admin`, `Moderator`, `User`) trên cả trang `/login` và `AuthModal`: Bấm vào từng nút tự động điền đúng email/mật khẩu mà không phát sinh cảnh báo console.
  - Bấm nút **Google OAuth** -> Kiểm tra luồng xác thực Google (`POST /api/auth/google`).
- [ ] **Quên mật khẩu 2 bước kèm OTP (`/forgot-password`):**
  - **Bước 1:** Nhập email chưa đăng ký -> Báo lỗi `404` (*"Không tìm thấy tài khoản với email này"*). Nhập `nguyenvanan@gmail.com` -> Bấm *Gửi mã xác nhận* -> Hiển thị hộp xanh **`💡 Mã xác thực (OTP)`** gồm 6 chữ số ngay trên màn hình để phục vụ demo bảo vệ.
  - **Bước 2:** Nhập mã OTP sai -> Báo lỗi `400` (*"Mã xác nhận không hợp lệ hoặc đã hết hạn"*). Nhập đúng mã OTP + mật khẩu mới -> Đặt lại mật khẩu thành công, chuyển về `/login`.
- [ ] **Chặn API xác thực dành riêng cho thành viên khi gọi không có Cookie:**
  - Gọi `GET /api/auth/me`, `PUT /api/auth/me`, `PUT /api/auth/me/password` khi không có cookie -> Trả về đúng **`401 Unauthorized`** (không bao giờ trả về `400`).

### 2.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] **Kiểm chứng Bảo mật `HttpOnly Cookie` trên DevTools (`F12 -> Application`):**
  - **Local Storage (`http://localhost:5173`):** Hoàn toàn **KHÔNG** có `accessToken` hay `refreshToken` (chống đánh cắp token qua XSS).
  - **Cookies (`http://localhost:5173`):** Có đúng 3 cookie:
    1. `vietblog_access_token` (`HttpOnly = ✓`, `Path = /`, `SameSite = Lax`)
    2. `vietblog_refresh_token` (`HttpOnly = ✓`, `Path = /api/auth`, `SameSite = Lax`)
    3. `vietblog_logged_in = 1` (`HttpOnly = trống`, cờ tín hiệu không chứa thông tin nhạy cảm).
- [ ] **Tự động gia hạn phiên ngầm (`Silent Refresh`):**
  - Trong `Application -> Cookies`, xóa thử dòng `vietblog_access_token` (giữ nguyên `vietblog_refresh_token`), sau đó tải lại trang `F5`.
  - Mở `Network`: Request `/api/users/me` đầu tiên trả `401` -> Axios Interceptor tự động gọi `POST /api/auth/refresh` -> cấp lại `vietblog_access_token` mới trong Cookie -> gọi lại `/api/users/me` (`200 OK`) mượt mà, người dùng không bị văng ra.
- [ ] **Chặn người đã đăng nhập vào lại `/login`, `/register`, `/forgot-password`:**
  - Khi đã đăng nhập, gõ `/login` hoặc `/register` trên thanh địa chỉ -> Router tự động đẩy về `/`.
- [ ] **Đăng xuất (`POST /api/auth/logout`):**
  - Bấm `Đăng xuất` từ menu Avatar -> Backend thu hồi Refresh Token trong DB/Redis và trả về `Set-Cookie: Max-Age=0` xóa sạch cả 3 cookie, ngắt kết nối WebSocket.

---

## PHẦN 3: Trang Chủ (`/`), Sự Kiện (`/events`), Thịnh Hành (`/trending`), Chủ Đề (`/tags/:name`) & Sidebar Phải

### 3.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] **Trang chủ (`/`):**
  - Xem danh sách bài viết `PUBLISHED` dạng phân trang / tải thêm (**`Tải thêm bài viết`**).
  - Chuyển đổi bộ lọc sắp xếp: **`Mới nhất`**, **`Thịnh hành`**, **`Đề xuất`**, **`Sự kiện`**.
  - Lọc theo dải thẻ **Danh mục (`Category Pills`)** ngang ở đầu bảng tin.
  - Bấm vào các nút tương tác trên từng thẻ bài viết (`PostCard.vue`):
    - Bấm **`Upvote (▲)`** hoặc **`Downvote (▼)`** -> Không gọi API lỗi, hiện thông báo *"Vui lòng đăng nhập để bình chọn"* và **bật `AuthModal`**.
    - Bấm **`Lưu bài viết (Bookmark 🔖)`** -> Hiện thông báo *"Vui lòng đăng nhập để lưu bài viết"* và **bật `AuthModal`**.
    - Bấm **`Chia sẻ`** -> Sao chép link bài viết vào bộ nhớ tạm bình thường (cho phép Guest chia sẻ).
- [ ] **Trang Sự kiện (`/events`):**
  - Truy cập `/events` -> Tự động điều hướng sang `/?category=su-kien`, lọc đúng các bài viết thuộc danh mục Sự kiện kèm nhãn thời gian diễn ra (`Đang diễn ra` / `Sắp diễn ra` / `Đã kết thúc`).
- [ ] **Trang Thịnh hành (`/trending`):**
  - Hiển thị bảng xếp hạng bài viết nổi bật kèm **Huy hiệu Top 1 (`#1` vàng), Top 2 (`#2` bạc), Top 3 (`#3` đồng)** và thống kê tổng lượt xem / tổng lượt bình chọn ở đầu trang.
- [ ] **Trang Chủ đề / Tag (`/tags/:name`):**
  - Bấm vào 1 tag bất kỳ (VD: `#AI`, `#SpringBoot`) -> Chuyển tới `/tags/AI`, hiển thị tiêu đề chủ đề, số lượng bài viết và danh sách bài viết thuộc tag đó.
- [ ] **Thanh bên phải (`RightSidebar.vue`):**
  - Khối **Bài viết xu hướng**: Bấm vào từng bài chuyển tới `/posts/:id`.
  - Khối **Chủ đề phổ biến**: Bấm vào từng tag chuyển tới `/tags/:name`.
  - Khối **Tác giả nổi bật**: Bấm vào tên/avatar tác giả chuyển tới `/profile/:id`. Bấm nút **`Theo dõi`** khi là Guest -> Bật `AuthModal`.

### 3.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] **Khung tạo bài nhanh trên đầu Trang chủ:**
  - Hiển thị ô *"Bạn đang nghĩ gì, [Tên User]?"* kèm nút `Hình ảnh` / `Vị trí` -> Bấm vào chuyển thẳng sang `/posts/create`.
- [ ] **Tương tác trực tiếp trên `PostCard`:**
  - Bấm **`Upvote` / `Downvote`**: Đổi màu tức thì (Optimistic UI), bấm lại lần 2 để hủy bình chọn.
  - Bấm **`Bookmark (🔖)`**: Lưu/Bỏ lưu bài viết tức thì kèm thông báo toast.
  - Bấm **`Theo dõi`** ở khối *Tác giả nổi bật* (Sidebar phải): Đổi trạng thái thành `Đang theo dõi` ngay lập tức (ẩn nút này đối với chính tài khoản của mình).

---

## PHẦN 4: Chi Tiết Bài Viết, Tóm Tắt AI TextRank & Bình Luận Cảm Xúc 4-Gram (`/posts/:id`)

### 4.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] **Xem bài viết công khai (`PUBLISHED`):**
  - Hiển thị đầy đủ tiêu đề, danh mục, ngày đăng, số phút đọc, lượt xem, nội dung HTML, thẻ vị trí địa lý (nếu có), thời gian sự kiện (nếu có), danh sách tags, thông tin tác giả và **Bài viết liên quan** ở cuối trang.
- [ ] **Trình xem ảnh Phóng to (`ImageLightboxModal.vue`) & Collage ảnh:**
  - Bấm vào ảnh bìa, ảnh trong bài viết hoặc cụm ảnh Collage -> Mở Lightbox toàn màn hình.
  - Kiểm tra các nút: Chuyển ảnh Trước/Sau (`<` / `>`), Phóng to/Thu nhỏ (`Zoom In/Out`), Xoay ảnh, Tải ảnh xuống, đóng bằng phím `Esc`.
- [ ] **Trợ lý Tóm tắt Bài viết bằng AI (`PostAiSummary.vue` — Thuật toán `TextRank`):**
  - Hoạt động **công khai cho cả Guest**.
  - Bấm **`Tóm tắt bằng AI`** -> Hiển thị hiệu ứng gõ chữ từng từ (Typewriter) bản tóm tắt trích xuất từ nội dung bài viết.
  - Chuyển đổi chế độ hiển thị: **`Đoạn văn (Paragraph)`** vs **`Ý chính (Bullet points)`**.
  - Chuyển đổi độ dài: **`Ngắn gọn (3 câu)`** vs **`Chi tiết (5 câu)`**.
  - Bấm **`Sao chép`** (copy bản tóm tắt) và **`Tạo lại`** (chạy lại TextRank).
- [ ] **Thanh tương tác bài viết (`PostInteractionBar.vue`) khi là Guest:**
  - Xem được số lượng Upvote/Downvote, tổng số biểu cảm (6 loại Emoji: `👍 Thích`, `❤️ Yêu thích`, `😂 Haha`, `😮 Wow`, `😢 Buồn`, `😡 Phẫn nộ`) và số bình luận.
  - Bấm **`Upvote`**, **`Downvote`**, chọn **Emoji Reaction**, bấm **`Lưu bài viết`**, hoặc bấm **`Báo cáo bài viết (🚩)`** -> Tất cả đều chặn lại, hiện thông báo và **mở `AuthModal`**.
  - Bấm **`Chia sẻ`** -> Sao chép URL bài viết bình thường.
- [ ] **Khu vực Bình luận (`PostComments.vue` & `CommentItem.vue`) khi là Guest:**
  - Xem được danh sách bình luận gốc, bình luận trả lời đa cấp (Replies), ảnh đính kèm trong bình luận, nhãn cảm xúc AI (`Tích cực` / `Tiêu cực` / `Trung lập`) và **Biểu đồ Tỉ lệ Cảm xúc Bình luận** (tổng hợp % Tích cực, Trung lập, Tiêu cực).
  - Thay vì ô nhập bình luận, hiển thị hộp kêu gọi *"Đăng nhập để tham gia thảo luận"* -> Bấm vào mở `AuthModal`.
  - Trên từng bình luận: Bấm nút **`Thích`**, chọn **Emoji biểu cảm**, bấm **`Trả lời`**, hoặc bấm **`Báo cáo`** -> Đóng popup emoji (nếu đang mở) và **bật `AuthModal`**.
- [ ] **Bảo vệ bài viết Nháp (`DRAFT`) hoặc Đã ẩn (`HIDDEN`) trước Guest:**
  - Truy cập `/posts/:id` của một bài viết đang ở trạng thái `DRAFT` hoặc `HIDDEN` -> Backend trả về `404 Not Found`, Frontend hiển thị màn hình *"Không tìm thấy bài viết"*, tuyệt đối không lộ nội dung nháp.

### 4.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / Tác giả / `MODERATOR` / `ADMIN`)
- [ ] **Tương tác Bài viết & Quy tắc Loại trừ lẫn nhau (Mutual Exclusivity) giữa Vote và Emoji:**
  - Bấm **`Upvote (+1)`** -> Điểm tăng 1. Sau đó thả biểu cảm **`❤️ LOVE`** vào cùng bài viết -> Hệ thống tự động gỡ `Upvote` và chuyển sang trạng thái `LOVE` (và ngược lại: đang có Emoji mà bấm `Upvote`/`Downvote` thì tự động gỡ Emoji).
  - Bấm lại chính biểu cảm `❤️ LOVE` đang chọn -> Gỡ biểu cảm về trạng thái trống.
  - Bấm **`Lưu bài viết (Bookmark)`** -> Lưu vào `/bookmarks`.
  - Bấm **`Báo cáo bài viết (🚩)`** -> Chỉ hiển thị trên bài viết của **người khác** (ẩn trên bài viết của chính mình). Chọn lý do báo cáo và gửi -> Tạo báo cáo `PENDING` cho Admin/Mod.
- [ ] **Viết Bình luận, Đính kèm Ảnh & Phân tích Cảm xúc AI 4-Gram (`SentimentAnalysisService`):**
  - Mở bảng **16 Emoji nhanh** để chèn icon vào ô bình luận.
  - Bấm biểu tượng **Đính kèm ảnh** -> Tải ảnh lên bình luận, có nút `X` để gỡ ảnh trước khi gửi.
  - Gửi bình luận tiếng Việt tích cực (VD: *"Bài viết rất hay, phân tích sâu sắc và cực kỳ hữu ích!"*) -> Bình luận xuất hiện ngay lập tức kèm nhãn **`Tích cực (Positive)`** màu xanh lá và cập nhật thanh **Tỉ lệ cảm xúc**.
  - Gửi bình luận có phủ định kép / chuyển ý 4-Gram (VD: *"Tưởng không hay nhưng lại hay không tưởng"*) -> Nhãn cảm xúc nhận diện chính xác.
  - Bấm **`Trả lời`** trên 1 bình luận -> Gửi bình luận con (Reply), hiển thị thụt lề dưới bình luận gốc.
  - Thả biểu cảm Emoji (`LIKE`, `LOVE`, `HAHA`, `WOW`, `SAD`, `ANGRY`) lên từng bình luận.
- [ ] **Ma trận Quyền Xóa Bình luận:**
  - **Người viết bình luận:** Thấy nút `Xóa` trên bình luận của chính mình.
  - **Tác giả của bài viết (`postAuthorId`):** Thấy nút `Xóa` trên **mọi bình luận** nằm trong bài viết của mình để tự quản lý thảo luận.
  - **`MODERATOR` / `ADMIN`:** Thấy nút `Xóa` trên **mọi bình luận** toàn hệ thống.
- [ ] **Xem bài viết Nháp (`DRAFT`) hoặc Đã ẩn (`HIDDEN`) khi có quyền:**
  - **Tác giả bài viết** (đối với bài `DRAFT`/`HIDDEN` của mình) hoặc **`MODERATOR`/`ADMIN`**: Truy cập `/posts/:id` xem được nội dung kèm băng rôn cảnh báo trạng thái ở đầu bài; hệ thống **tự động ẩn** thanh tương tác & khu vực bình luận và **không** gọi API `/comments` (không gây lỗi `404` giả).
  - **Tác giả bài viết**: Thấy nút **`Chỉnh sửa`** và **`Xóa bài viết`** trên bài của mình.

---

## PHẦN 5: Soạn Thảo & Chỉnh Sửa Bài Viết (`/posts/create`, `/posts/:id/edit`)

### 5.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] Truy cập `/posts/create` hoặc `/posts/:id/edit` -> Router chặn ngay lập tức, giữ lại đường dẫn đích trong `authRedirectPath` và bật `AuthModal`.
- [ ] Gọi trực tiếp `POST /api/posts`, `PUT /api/posts/{id}`, `DELETE /api/posts/{id}` hoặc `POST /api/files/upload` không có cookie -> Trả về **`401 Unauthorized`**.

### 5.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] **Trình soạn thảo Rich-Text TipTap (`PostFormView.vue`):**
  - Kiểm tra đầy đủ thanh công cụ: In đậm (`B`), In nghiêng (`I`), Gạch chân (`U`), Gạch ngang (`S`), Tiêu đề (`H1`, `H2`, `H3`), Danh sách chấm & số, Trích dẫn (`Blockquote`), Khối code (`Code Block`), Căn lề (Trái/Giữa/Phải), Chèn liên kết (`Link`), Chèn ảnh vào nội dung, Hoàn tác (`Undo`/`Redo`).
- [ ] **Kiểm tra Ràng buộc Dữ liệu (Validation) & Chống XSS:**
  - Để trống Tiêu đề, chưa chọn Danh mục, hoặc Nội dung văn bản thuần `< 50` ký tự -> Báo lỗi rõ ràng, không cho gửi.
  - Chèn thử mã độc `<script>alert(1)</script>` hoặc `onerror=...` vào nội dung -> Backend `HtmlSanitizer` tự động lọc sạch thẻ nguy hiểm trước khi lưu DB.
- [ ] **Tải ảnh bìa & Cụm ảnh Collage (`images`):**
  - Tải ảnh bìa chính (`coverImage`) và tải nhiều ảnh phụ để tạo lưới ảnh Collage.
- [ ] **Đính kèm Vị trí Địa lý (`LocationPickerModal.vue` — Leaflet + Nominatim):**
  - Bấm **`Gắn vị trí địa điểm`** -> Mở modal bản đồ.
  - Tìm kiếm địa điểm (VD: *"Trường Đại học Tài nguyên và Môi trường TP.HCM"* hoặc *"Chợ Bến Thành"*) hoặc bấm trực tiếp lên bản đồ / bấm **`Vị trí hiện tại của tôi`** -> Tự động lấy tọa độ `latitude`, `longitude` và tên địa điểm `locationName` gắn vào bài viết.
- [ ] **Đính kèm Thời gian Sự kiện & Thẻ Tags:**
  - Khi chọn danh mục `Sự kiện` (hoặc bật tùy chọn sự kiện), chọn `Thời gian bắt đầu (eventStartAt)` và `Thời gian kết thúc (eventEndAt)`.
  - Thêm các thẻ Tag (tối đa **5 tags**, bấm `Enter` để tạo tag, bấm `X` để xóa tag).
- [ ] **Lưu Nháp (`DRAFT`) vs Xuất bản (`PUBLISHED`):**
  - Bấm **`Lưu bản nháp`** -> Bài viết lưu ở trạng thái `DRAFT`, xuất hiện trong tab `Nháp` ở trang Hồ sơ cá nhân, không hiện lên trang chủ công khai.
  - Bấm **`Xuất bản bài viết`** -> Bài viết chuyển sang `PUBLISHED`, tự động sinh vector ngữ nghĩa `TF-IDF` + đặc trưng ảnh `CBIR 51 chiều` và xuất hiện trên Trang chủ / Bản đồ.
- [ ] **Bảo vệ Quyền Chỉnh sửa & Trạng thái Bài viết (`/posts/:id/edit`):**
  - Người dùng A cố tình truy cập `/posts/:id/edit` của bài viết thuộc Người dùng B -> Hệ thống báo lỗi *"Bạn không có quyền chỉnh sửa bài viết này"* và đẩy về trang chi tiết bài viết (Backend chặn `403 Forbidden`).
  - Bài viết đã bị Admin/Moderator khóa (`status = HIDDEN`) -> Tác giả thường không thể tự sửa hoặc tự đổi trạng thái từ `HIDDEN` sang `PUBLISHED` (Backend trả về `400 Bad Request` nếu cố tình gửi `status: "HIDDEN"` hoặc tự mở khóa bài đã bị kiểm duyệt ẩn).

---

## PHẦN 6: Bài Viết Đã Lưu (`/bookmarks`)

### 6.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] Truy cập `/bookmarks` -> Tự động bật `AuthModal` (kèm ghi nhớ đường dẫn `/bookmarks`).
- [ ] Gọi `GET /api/posts/bookmarked` hoặc `POST /api/posts/{id}/bookmark` không có cookie -> Trả về **`401 Unauthorized`**.

### 6.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] Hiển thị danh sách tất cả bài viết đã lưu của tài khoản hiện tại.
- [ ] Bấm vào biểu tượng **Bookmark (`🔖`)** trên 1 bài trong trang `/bookmarks` -> Gỡ bài viết đó khỏi danh sách ngay lập tức.
- [ ] Khi danh sách trống -> Hiển thị trạng thái trống kèm nút **`Khám phá bài viết`** (về `/`).
- [ ] **Kiểm tra Đăng xuất ngay tại trang `/bookmarks`:** Bấm `Đăng xuất` khi đang đứng ở `/bookmarks` -> Chuyển về trang chủ êm ái, **không** phát sinh bất kỳ thông báo lỗi `401` nào.

---

## PHẦN 7: Tìm Kiếm Đa Phương Thức (`/search` — Từ Khóa, Ngữ Nghĩa AI `TF-IDF + pgvector`, Hình Ảnh `CBIR 51 Chiều`, Tài Liệu `.pdf/.docx`)

### 7.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
> [!TIP]
> Toàn bộ 4 phương thức tìm kiếm AI của VietBlog đều **mở công khai 100% cho cả Guest** để giảng viên và người đọc trải nghiệm ngay mà không cần đăng nhập.

- [ ] **Phương thức 1 — Tìm kiếm Từ khóa & Ngữ nghĩa AI (`TF-IDF + Cosine Similarity / pgvector`):**
  - Truy cập `/search`, nhập câu truy vấn tự nhiên (VD: *"xu hướng trí tuệ nhân tạo và lập trình hiện đại"*) -> Bấm `Tìm kiếm`.
  - Chuyển đổi qua lại giữa 3 tab kết quả: **`Bài viết`**, **`Tác giả`**, **`Chủ đề (Tags)`**.
  - Kiểm tra các **Chip từ khóa gợi ý** bên dưới thanh tìm kiếm -> Bấm vào chip tự động chạy tìm kiếm.
- [ ] **Phương thức 2 — Tìm kiếm bằng Hình ảnh (`CBIR 51-D HSV Color Histogram + Edge Density + Spatial Grid`):**
  - Chuyển sang chế độ **`Tìm bằng hình ảnh`** (hoặc kéo thả file ảnh `.jpg/.png/.webp` vào vùng tải lên).
  - Hiển thị ảnh xem trước (Preview) -> Hệ thống trích xuất vector đặc trưng thị giác **51 chiều** và trả về các bài viết có hình ảnh tương đồng kèm **điểm tương đồng (`Similarity %`)**.
  - Thử tải lên file không phải ảnh (hoặc ảnh hỏng) -> Hệ thống trả lỗi `400` thân thiện, không bao giờ lỗi `500`.
- [ ] **Phương thức 3 — Tìm kiếm bằng Tài liệu (`Document Search` — `.pdf`, `.docx`, `.txt`, `.md`):**
  - Chuyển sang chế độ **`Tìm bằng tài liệu`**, tải lên 1 file `.pdf` hoặc `.docx` (VD: đề cương hoặc tài liệu công nghệ).
  - Backend (`Apache PDFBox` / `Apache POI`) bóc tách văn bản từ tài liệu, hiển thị đoạn trích văn bản vừa đọc được và dùng thuật toán `TF-IDF` tìm ra các bài viết có nội dung sát nhất.

### 7.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] Thực hiện đầy đủ các phương thức tìm kiếm như trên; ngoài ra trên kết quả tìm kiếm có thể bấm **`Upvote`**, **`Lưu bài viết`** hoặc **`Theo dõi tác giả`** trực tiếp mà không bị chặn bởi `AuthModal`.

---

## PHẦN 8: Bản Đồ Không Gian Địa Lý (`/map` & `/map?postId=:id` — `PostGIS` + `Haversine` + `Leaflet`)

### 8.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] **Hiển thị Bản đồ & Chống đè điểm ghim (Coordinate Jittering):**
  - Truy cập `/map` -> Bản đồ Leaflet tải đầy đủ các điểm ghim (Marker) bài viết có gắn tọa độ.
  - Mỗi danh mục hiển thị **biểu tượng Emoji riêng biệt** trên ghim. Các bài viết trùng tọa độ được tự động tách nhẹ để không đè khít lên nhau.
- [ ] **Tìm kiếm Bán kính Không gian (`1 km` – `50 km`):**
  - Bấm nút **`Quanh HCMUNRE`** (hoặc bấm trực tiếp vào một điểm bất kỳ trên bản đồ, hoặc bấm **`Vị trí của tôi`**) -> Xuất hiện vòng tròn bán kính màu xanh trên bản đồ.
  - Kéo thanh trượt **Bán kính (`1 km` -> `50 km`)** -> Danh sách bài viết bên cột trái tự động lọc theo khoảng cách thực tế (`PostGIS ST_DWithin` / `Haversine`) và hiển thị số **`km` cách tâm** trên từng bài.
- [ ] **Bộ lọc Danh mục & Từ khóa trên Bản đồ:**
  - Lọc theo từ khóa và chọn Danh mục trên thanh công cụ bản đồ -> Cập nhật đồng thời cả danh sách bên trái và các điểm ghim trên bản đồ.
- [ ] **Xem Thẻ bài viết trên Bản đồ & Điều hướng sâu (`/map?postId=:id`):**
  - Bấm vào 1 điểm ghim hoặc 1 bài trong danh sách -> Bản đồ bay (`flyTo`) tới đúng tọa độ đó, mở thẻ chi tiết rút gọn kèm nút **`Đọc bài viết`** (chuyển sang `/posts/:id`).
  - Từ trang chi tiết bài viết có gắn vị trí, bấm vào tên địa điểm -> Chuyển sang `/map?postId=:id` và tự động focus đúng điểm ghim của bài viết đó.

### 8.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] Hoạt động đầy đủ như Guest, đồng thời cho phép lưu hoặc bình chọn bài viết ngay khi chuyển sang trang chi tiết.

---

## PHẦN 9: Hồ Sơ Cá Nhân (`/profile` & `/profile/:id`)

### 9.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] **Truy cập `/profile` (không có `:id`):**
  - Khi Guest gõ `/profile` -> Hệ thống **không** báo lỗi *"Không tìm thấy người dùng"* mà tự động bật `AuthModal('login', '/profile')` và đưa về `/`. Sau khi đăng nhập xong sẽ vào thẳng `/profile` của mình.
- [ ] **Truy cập Hồ sơ người dùng bất kỳ (`/profile/:id`):**
  - Xem được Ảnh bìa, Avatar, Tên, Tiểu sử (`bio`), Ngày tham gia, thống kê số `Bài viết`, `Người theo dõi (Followers)`, `Đang theo dõi (Following)`.
  - Xem được 2 tab công khai: **`Bài viết`** (các bài `PUBLISHED` của user đó) và **`Nhóm`** (các nhóm đã tham gia). **Không** hiển thị tab `Nháp` và `Đã lưu` của người khác.
  - Bấm vào thống kê **`Người theo dõi`** hoặc **`Đang theo dõi`** -> Mở modal danh sách người dùng; bấm nút `Theo dõi` bên trong modal sẽ đóng modal và bật `AuthModal`.
  - Trên đầu trang hồ sơ: Bấm nút **`Theo dõi`**, **`Nhắn tin`**, hoặc menu **`⋯` (`Chặn người dùng` / `Báo cáo người dùng`)** -> Tất cả đều bật `AuthModal`.
- [ ] **Kiểm tra Quyền riêng tư Hồ sơ (`profileVisibility`):**
  - Nếu chủ hồ sơ đã cài đặt quyền riêng tư là **`Riêng tư (private)`** hoặc **`Chỉ người theo dõi (followers)`** (trên cùng trình duyệt/origin) -> Khi đăng xuất về Guest hoặc xem bằng người chưa theo dõi tại `/profile/:id`, hệ thống hiển thị biểu tượng ổ khóa *"Hồ sơ này đang ở chế độ riêng tư"*, ẩn danh sách bài viết và nhóm.

### 9.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] **Khi xem Hồ sơ của CHÍNH MÌNH (`/profile` hoặc `/profile/<myId>`):**
  - Hiển thị đầy đủ **4 Tab**: **`Bài viết`**, **`Nháp (Drafts)`**, **`Đã lưu (Bookmarks)`**, và **`Nhóm`**.
  - Trong tab **`Nháp`**: Có thể bấm vào bài nháp để tiếp tục chỉnh sửa (`/posts/:id/edit`) hoặc xuất bản.
  - Hiển thị nút **`Chỉnh sửa hồ sơ`** (chuyển sang `/settings`).
- [ ] **Khi xem Hồ sơ của NGƯỜI DÙNG KHÁC (`/profile/:otherId`):**
  - Bấm **`Theo dõi` / `Bỏ theo dõi`** -> Số lượng `Người theo dõi` tăng/giảm tức thì.
  - Bấm **`Nhắn tin`** -> Tự động tạo hoặc mở cuộc trò chuyện 1-1 với người đó tại `/chat`.
  - Bấm menu **`⋯` -> `Chặn người dùng`** -> Xác nhận chặn -> Đổi trạng thái thành `Đã chặn` (bấm lại để `Bỏ chặn`).
  - Bấm menu **`⋯` -> `Báo cáo người dùng`** -> Gửi báo cáo vi phạm kiểu `USER` về trang Kiểm duyệt.

---

## PHẦN 10: Cài Đặt Người Dùng (`/settings` — 5 Tab `<KeepAlive>`)

### 10.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] Truy cập `/settings` -> Router chặn lại, lưu `authRedirectPath = '/settings'` và bật `AuthModal`.

### 10.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] **Tab 1 — `Hồ sơ (ProfileTab.vue)`:**
  - Thay đổi Tên hiển thị (`2–50` ký tự), Tiểu sử (`<= 250` ký tự), tải lên **Ảnh đại diện (`avatar`, `<= 5MB`)** từ máy tính -> Bấm `Lưu thay đổi` -> Cập nhật ngay trên Navbar và trang Hồ sơ.
- [ ] **Tab 2 — `Tài khoản (AccountTab.vue)`:**
  - **Đổi mật khẩu (`PUT /api/auth/me/password`):** Nhập mật khẩu hiện tại sai -> Báo lỗi `400`. Nhập đúng mật khẩu hiện tại + mật khẩu mới (`>= 8` ký tự) -> Đổi thành công.
  - **Vô hiệu hóa / Xóa tài khoản:**
    - Nếu là **`USER` / `MODERATOR`**: Xác nhận vô hiệu hóa/xóa -> Gửi báo cáo yêu cầu tới Admin (`POST /api/reports`), gọi `POST /api/auth/logout` xóa sạch `HttpOnly Cookie`, xóa phiên hiện tại và đưa về `/login`.
    - Nếu là **`ADMIN`**: Hệ thống cảnh báo và chặn tự vô hiệu hóa/xóa tài khoản Quản trị viên ngay lập tức.
- [ ] **Tab 3 — `Giao diện (AppearanceTab.vue)`:**
  - Chuyển đổi chế độ **Sáng (`Light`)**, **Tối (`Dark`)**, **Theo hệ thống (`System`)** -> Áp dụng tức thì trên toàn ứng dụng.
- [ ] **Tab 4 — `Thông báo (NotificationsTab.vue)` & Tab 5 — `Quyền riêng tư (PrivacyTab.vue)`:**
  - Bật/tắt các công tắc nhận thông báo và chọn chế độ hiển thị hồ sơ (`Công khai` / `Chỉ người theo dõi` / `Riêng tư`) -> Lưu đồng bộ vào `localStorage` (`vb_user_prefs_<id>`) mà không ghi đè chéo dữ liệu giữa 2 tab.

---

## PHẦN 11: Hội Nhóm Cộng Đồng (`/groups`, `/groups/:id`, `/groups/:id/posts/:postId`)

### 11.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] **Trang Danh sách Nhóm (`/groups`):**
  - Xem danh sách nhóm, tìm kiếm nhóm theo tên, lọc theo **`Tất cả` / `Công khai` / `Riêng tư`**.
  - Bấm vào tab **`Nhóm của tôi`** hoặc nút **`+ Tạo nhóm mới`** -> Hiện thông báo và **bật `AuthModal`**.
  - Trên thẻ nhóm (`GroupCard.vue`): Bấm **`Tham gia nhóm`** (nhóm công khai) hoặc **`Nhóm riêng tư`** -> Bật `AuthModal`; sau khi đăng nhập xong trên `AuthModal`, danh sách nhóm tự động làm mới trạng thái `Đã tham gia`.
- [ ] **Trang Chi tiết Nhóm CÔNG KHAI (`/groups/:id` với `isPublic = true`):**
  - Guest xem được đầy đủ cả 3 tab: **`Bài viết`**, **`Thành viên`** (kèm huy hiệu `Trưởng nhóm`, `Quản trị viên`, `Kiểm duyệt viên`, `Thành viên`), và **`Giới thiệu`**.
  - Bấm vào 1 bài thảo luận -> Mở `GroupPostModal` hoặc trang `/groups/:id/posts/:postId`: Guest đọc được nội dung và bình luận thảo luận nhóm, nhưng khi bấm **`Thích`**, **`Gửi bình luận`**, **`Tham gia nhóm`** hoặc **`Báo cáo nhóm`** -> Bật `AuthModal`.
- [ ] **Trang Chi tiết Nhóm RIÊNG TƯ (`/groups/:id` với `isPublic = false`):**
  - Guest xem được ảnh bìa, tên nhóm và tab **`Giới thiệu`**, nhưng ở tab **`Bài viết`** và **`Thành viên`** hiển thị màn hình khóa **`🔒 Nhóm riêng tư`** kèm nút **`Đăng nhập để kiểm tra quyền thành viên`** (không gọi API `/posts` gây lỗi).
  - Guest gõ trực tiếp URL `/groups/:id/posts/:postId` của một nhóm riêng tư -> Hệ thống tự động kiểm tra quyền đọc nhóm trước, hiện thông báo *"Nhóm riêng tư chỉ dành cho thành viên"* và điều hướng về `/groups/:id` êm ái (không bắn toast lỗi đỏ).
  - Gọi trực tiếp API `GET /api/groups/{privateId}/posts` hoặc `GET /api/groups/{privateId}/members` không có cookie -> Backend trả về đúng **`401 Unauthorized`**.

### 11.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / Thành viên / Trưởng nhóm / `MODERATOR` / `ADMIN`)
- [ ] **Tạo nhóm mới (`CreateGroupModal.vue`):**
  - Nhập tên nhóm, mô tả, tải ảnh đại diện & ảnh bìa, chọn **`Công khai`** hoặc **`Riêng tư`** -> Tạo thành công, người tạo tự động là **`Trưởng nhóm (OWNER)`**.
- [ ] **Tham gia & Rời nhóm Công khai vs Ràng buộc Nhóm Riêng tư:**
  - Với **Nhóm công khai**: Bấm **`Tham gia nhóm`** -> Trở thành thành viên ngay (`isJoined = true`), hiện nút **`Viết bài thảo luận`**. Bấm lại **`Đã tham gia`** -> Rời nhóm (Trưởng nhóm không thể tự rời nhóm của mình trước khi giải tán/chuyển quyền).
  - Với **Nhóm riêng tư** (khi đăng nhập bằng tài khoản chưa phải thành viên): Hiển thị nhãn **`🔒 Liên hệ Trưởng nhóm / Quản trị viên để được thêm vào nhóm`** (Backend chặn tự bấm join vào nhóm riêng tư với mã `403 Forbidden`, chỉ cho phép Quản lý nhóm thêm thành viên qua `POST /api/groups/{id}/members`).
- [ ] **Đăng bài thảo luận, Thích & Bình luận trong Nhóm:**
  - Thành viên đã tham gia bấm **`Viết bài thảo luận`** (`CreateGroupPostModal.vue`) -> Nhập tiêu đề, nội dung, ảnh đính kèm -> Đăng bài thành công.
  - Mở chi tiết thảo luận (`GroupPostModal` hoặc `/groups/:id/posts/:postId`): Bấm **`Thích`** bài thảo luận, viết **Bình luận** và **Xóa bình luận** của mình.
- [ ] **Quản trị Nhóm (Dành cho `OWNER` / `ADMIN` nhóm / Hệ thống `MODERATOR` & `ADMIN`):**
  - **Chỉnh sửa thông tin nhóm (`Edit Group Modal`):** Đổi tên, mô tả, ảnh đại diện, ảnh bìa, đổi chế độ `Công khai <-> Riêng tư`.
  - **Quản lý thành viên (Tab `Thành viên`):**
    - `OWNER` bấm biểu tượng **Khiên (`🛡️`)** trên thành viên -> **Bổ nhiệm làm Quản trị viên (`ADMIN`)** hoặc **Hạ quyền về Thành viên (`MEMBER`)**.
    - `OWNER` / `ADMIN` nhóm bấm biểu tượng **Mời ra khỏi nhóm (`UserMinus`)** -> Xóa thành viên khỏi nhóm.
  - **Xóa bài thảo luận & Giải tán nhóm:** Tác giả bài viết hoặc Quản lý nhóm xóa được bài thảo luận; `OWNER` hoặc Hệ thống `ADMIN`/`MODERATOR` bấm **`Giải tán`** xóa toàn bộ nhóm.

---

## PHẦN 12: Nhắn Tin Thời Gian Thực (`/chat`, `ChatPopupWindow` & `MainNavbarChat` — WebSocket + Redis Pub/Sub)

### 12.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] Biểu tượng Messenger (`MainNavbarChat`) trên Navbar và bong bóng `ChatPopup` ở góc dưới bên phải **ẩn hoàn toàn**.
- [ ] Truy cập `/chat` -> Router chặn lại, lưu `authRedirectPath = '/chat'` và bật `AuthModal`.
- [ ] Gọi bất kỳ API `/api/conversations/**` -> Backend trả về **`401 Unauthorized`**.
- [ ] Mở kết nối WebSocket `ws://localhost:8080/ws/chat` khi không có `HttpOnly Cookie` -> `ChatWebSocketHandler` đánh dấu phiên chưa xác thực, từ chối mọi gói tin với mã đóng kết nối **`1008 POLICY_VIOLATION`** (hoặc tự động ngắt sau `10s`).

### 12.2. Khi ĐÃ ĐĂNG NHẬP — Kịch bản Test Real-Time 2 Trình Duyệt Song Song
> [!IMPORTANT]
> **Cách bố trí màn hình khi test & demo bảo vệ đồ án:**
> Chia đôi màn hình máy tính (Snap Left / Snap Right):
> - **Cửa sổ Trái (Trình duyệt thường — `User A`):** Đăng nhập `nguyenvanan@gmail.com` (`123456`).
> - **Cửa sổ Phải (Trình duyệt Ẩn danh / Edge — `User B`):** Đăng nhập `dangthimylinh@gmail.com` (`123456`).

- [ ] **1. Kiểm tra Bắt tay WebSocket (`Handshake`) qua `HttpOnly Cookie` & Nhịp tim (`Heartbeat`):**
  - Mở `F12 -> Network -> WS -> Reload` trên máy `User A`:
    - Thấy kết nối **`ws://localhost:8080/ws/chat`** đạt trạng thái **`101 Switching Protocols`** (xác thực trực tiếp qua `Cookie: vietblog_access_token=...` bởi `ChatWebSocketHandler` + `AuthCookieService`, hoàn toàn không lộ `?token=...` trên URL).
    - Bấm vào tab **`Messages`** của kết nối WS: Thấy ngay gói tin đầu tiên từ Server gửi về là `{"type":"authenticated","userId":"..."}`, và cứ mỗi **`25 giây`** Client tự gửi `{"type":"ping"}` -> Server phản hồi `{"type":"pong"}`.
- [ ] **2. Test Real-time Sự kiện `conversation.created` (Tạo hội thoại 1-1 & Nhóm chat):**
  - Bên máy `User A`: Mở `/chat` -> Bấm **`Tạo cuộc trò chuyện mới`** (`NewChatModal.vue`) -> Chọn `User B` (hoặc chọn nhiều người để tạo **Nhóm chat** có đặt tên riêng).
  - **Kết quả Real-time bên máy `User B` (không cần F5):** Cột danh sách hội thoại bên trái trang `/chat` và menu thả xuống `MainNavbarChat` tự động nhảy cuộc trò chuyện mới lên đầu danh sách ngay lập tức.
- [ ] **3. Test Real-time Sự kiện `message.created` trên cả 3 vị trí (`MainNavbarChat`, `ChatPopupWindow`, `/chat`):**
  - **Trường hợp A (`User B` đang ở trang chủ `/` và đóng khung chat):**
    - `User A` gửi 1 tin nhắn văn bản (kèm Emoji) -> Ngay lập tức biểu tượng Messenger (`MainNavbarChat`) trên thanh Navbar của `User B` hiện **badge đỏ số đếm chưa đọc (`1`) nhấp nháy (`animate-pulse`)**.
  - **Trường hợp B (`User B` mở cửa sổ chat thu nhỏ `ChatPopupWindow` ở góc dưới phải hoặc mở trang `/chat`):**
    - `User A` lần lượt gửi **Tin nhắn chữ**, **Hình ảnh**, **Tệp đính kèm (`File`)**, và **Trả lời trích dẫn (`Reply`)** 1 tin nhắn cũ.
    - **Kết quả Real-time bên máy `User B`:** Tin nhắn, ảnh, file và khung trích dẫn hiện ra tức thì trong khung chat và tự động cuộn xuống cuối (`scrollToBottom`).
- [ ] **4. Test Real-time Sự kiện `conversation.read` (Trạng thái "Đã xem" / Read Receipt):**
  - Khi `User B` bấm vào cuộc trò chuyện (hoặc đang mở sẵn khung chat khi nhận tin nhắn của `User A`) -> Frontend tự động gọi `PUT /api/conversations/{id}/read`.
  - **Kết quả Real-time bên máy `User A`:** Trạng thái dưới chân tin nhắn của `User A` tự động chuyển từ `Đã gửi` sang **`Đã xem`** (`status = "read"`) ngay lập tức.
- [ ] **5. Test Real-time Sự kiện `message.revoked` (Thu hồi tin nhắn 2 chiều):**
  - Bên máy `User A`: Di chuột vào tin nhắn vừa gửi -> Bấm **`Thu hồi`**.
  - **Kết quả Real-time bên máy `User B`:** Nội dung tin nhắn (cả trong trang `/chat`, cửa sổ nổi `ChatPopupWindow` và dòng preview hội thoại) lập tức biến thành ***"Tin nhắn đã bị thu hồi"*** mà không cần tải lại trang.
- [ ] **6. Test Real-time Sự kiện `message.updated` (Ghim / Bỏ ghim tin nhắn):**
  - Bên máy `User A`: Bấm **`Ghim`** 1 tin nhắn quan trọng -> Thanh ghim trên đầu khung chat và biểu tượng ghim (`📌`) xuất hiện ngay lập tức ở cả màn hình `User A` và `User B`. Bấm **`Bỏ ghim`** -> Biến mất tức thì ở cả 2 bên.
- [ ] **7. Test Real-time Sự kiện `conversation.nickname` (Đổi biệt danh 1-1):**
  - Trong hội thoại 1-1, `User A` mở panel phải (`ChatInfoSidebar`) hoặc menu cửa sổ popup -> Đổi biệt danh cho `User B` -> Sự kiện `conversation.nickname` được đồng bộ qua WebSocket tức thì.
- [ ] **8. Các tính năng Quản lý Hội thoại & Chặn 2 chiều (`ChatInfoSidebar`):**
  - **Tìm kiếm tin nhắn trong hội thoại:** Nhập từ khóa để lọc các tin nhắn cũ trong cuộc trò chuyện.
  - **Ghim hội thoại (`Pin`), Tắt thông báo (`Mute`), Đánh dấu chưa đọc (`Mark Unread`), Ẩn/Xóa hội thoại.**
  - **Kho lưu trữ chung:** Xem lại toàn bộ **Ảnh/Video**, **Tệp đính kèm (`Files`)** và **Liên kết (`Links`)** đã gửi trong hội thoại.
  - **Chặn & Bỏ chặn 2 chiều trong Chat:** Khi `User A` chặn `User B` -> Khung nhập tin nhắn khóa lại và nếu cố gửi API `POST /api/conversations/{id}/messages` sẽ bị Backend chặn **`403 Forbidden`**; bấm `Bỏ chặn` để nhắn tin trở lại.
- [ ] **9. (Điểm cộng khi vấn đáp) Kiểm tra Redis Pub/Sub Relay & Cơ chế Tự phục hồi (`ChatEventRelay`):**
  - Mặc định mọi sự kiện `ChatEvent` sau khi commit DB (`TransactionPhase.AFTER_COMMIT`) được phát qua kênh Redis Pub/Sub **`vietblog.chat.events`**.
  - Nếu thử dừng container Redis (`docker stop vietblog-redis`), `ChatEventRelay` tự động bắt ngoại lệ và chuyển sang `deliverLocal(...)` -> Nhắn tin Real-time giữa `User A` và `User B` **vẫn hoạt động 100% không bị gián đoạn**.

---

## PHẦN 13: Hệ Thống Thông Báo (`/notifications` & Chuông Navbar)

### 13.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] Không hiển thị chuông thông báo trên Navbar.
- [ ] Truy cập `/notifications` -> Router chặn và bật `AuthModal` (kèm `authRedirectPath = '/notifications'`).
- [ ] Gọi `/api/notifications/**` không có cookie -> Trả về **`401 Unauthorized`**.

### 13.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] **Kích hoạt & Kiểm tra Thông báo giữa 2 tài khoản (`User A` tác động -> `User B` nhận):**
  - Bên máy `User A`: Thả cảm xúc vào bài viết của `User B`, bình luận vào bài viết của `User B`, trả lời bình luận của `User B`, hoặc bấm **`Theo dõi`** `User B` -> Backend (`NotificationService.notify`) tự động ghi nhận thông báo mới vào DB.
  - Bên máy `User B`: Bấm vào biểu tượng **Chuông (`🔔`)** trên Navbar (hoặc mở trang `/notifications` / tải lại trang) -> `uiStore.fetchNotifications()` tự động gọi `GET /api/notifications`, cập nhật số đếm badge đỏ trên chuông và hiển thị đầy đủ các thông báo vừa phát sinh.
- [ ] **Trang `/notifications` & Panel Chuông Navbar (`MainNavbarNotifications.vue`):**
  - Chuyển đổi bộ lọc **`Tất cả`** và **`Chưa đọc`**.
  - Bấm vào 1 thông báo -> Tự động đánh dấu đã đọc (`PUT /api/notifications/{id}/read`), giảm số đếm chưa đọc và điều hướng chính xác tới bài viết (cuộn tới đúng `#comment-id` nếu là thông báo bình luận) hoặc hồ sơ người theo dõi.
  - Bấm **`Đánh dấu tất cả đã đọc`** (`PUT /api/notifications/read-all`) -> Toàn bộ chấm xanh biến mất, badge về `0`.
  - Bấm nút **Thùng rác (`🗑️`)** trên thông báo -> Xóa thông báo (`DELETE /api/notifications/{id}`).

---

## PHẦN 14: Quản Trị & Kiểm Duyệt Hệ Thống (`/admin/*`) — Ma Trận Phân Quyền 4 Cấp

### 14.1. Kiểm tra Chặn Truy cập Trái phép (`Guest`, `USER`, `MODERATOR`)
- [ ] **Khi là `Guest` (Chưa đăng nhập):**
  - Truy cập bất kỳ đường dẫn `/admin/*` -> Đẩy về `/` và bật `AuthModal`.
  - Gọi bất kỳ API `/api/admin/**` hoặc `/api/moderation/**` -> Trả về **`401 Unauthorized`**.
- [ ] **Khi là `USER` thường (`nguyenvanan@gmail.com`):**
  - Gõ trực tiếp `/admin` hoặc `/admin/moderation` trên thanh địa chỉ -> Router chặn và đẩy về `/`.
  - Gọi bất kỳ API `/api/admin/**`, `/api/moderation/**`, hoặc `POST/PUT/DELETE /api/categories` -> Backend trả về **`403 Forbidden`** chuẩn JSON (`errorCode: "FORBIDDEN"`).
- [ ] **Khi là `MODERATOR` (`phamminhduc@gmail.com`):**
  - Truy cập `/admin` -> Tự động điều hướng vào **`/admin/moderation`** (trang mặc định của Kiểm duyệt viên).
  - Thanh menu bên trái của Moderator **CHỈ hiển thị đúng 3 mục**: **`Kiểm duyệt (/admin/moderation)`**, **`Bài viết (/admin/posts)`**, và **`Nhóm (/admin/groups)`**.
  - Nếu Moderator cố tình gõ URL `/admin/users`, `/admin/categories`, `/admin/analytics`, hoặc `/admin/settings` -> Router tự động chặn và đẩy về `/admin/moderation`; gọi API `/api/admin/**` tương ứng bị Backend chặn **`403 Forbidden`**.

### 14.2. Kiểm tra 3 Phân hệ dùng chung cho `MODERATOR` & `ADMIN`
- [ ] **1. Quản lý Kiểm duyệt & Báo cáo (`/admin/moderation`):**
  - Xem danh sách báo cáo vi phạm (`POST`, `COMMENT`, `USER`, `GROUP`), lọc theo trạng thái **`Chờ xử lý (PENDING)`**, **`Đã giải quyết (RESOLVED)`**, **`Đã bác bỏ (DISMISSED)`**.
  - Bấm **`Giải quyết (Resolve)`** hoặc **`Bác bỏ (Dismiss)`** kèm ghi chú kiểm duyệt -> Cập nhật trạng thái báo cáo ngay lập tức.
  - **Công cụ Phân tích Cảm xúc Trực tiếp (`Live Sentiment Widget`):** Nhập thử 1 câu tiếng Việt bất kỳ vào hộp công cụ kiểm tra nhanh ở trang Kiểm duyệt -> Trả về nhãn cảm xúc (`Tích cực - positive` / `Tiêu cực - negative` / `Trung lập - neutral`) và điểm số ngay tại chỗ.
- [ ] **2. Quản lý Bài viết (`/admin/posts`):**
  - Tìm kiếm bài viết, lọc theo trạng thái (`Tất cả`, `Đã xuất bản`, `Bản nháp`, `Đã ẩn`).
  - Bấm **`Ẩn bài viết (Hide)`** trên bài viết đang xuất bản -> Bài viết chuyển sang `HIDDEN` và biến mất khỏi trang chủ công khai.
  - Bấm **`Hiện lại (Restore / Publish)`** trên bài viết đã ẩn -> Bài viết quay trở lại `PUBLISHED`.
  - Bấm **`Xóa vĩnh viễn`** -> Xóa bài viết khỏi hệ thống.
- [ ] **3. Quản lý Hội nhóm (`/admin/groups`):**
  - Tìm kiếm nhóm, xem số lượng thành viên/bài viết, bấm vào tên nhóm để kiểm tra nội dung bên trong (Mod/Admin xem được cả nhóm riêng tư), và bấm **`Giải tán nhóm`** đối với nhóm vi phạm.

### 14.3. Kiểm tra 5 Phân hệ Độc quyền của `ADMIN` (`admin@vietblog.com`)
- [ ] **4. Bảng điều khiển Tổng quan (`/admin` — `AdminOverviewView.vue`):**
  - Xem các thẻ KPI tổng hợp (Tổng người dùng, Bài viết, Bình luận, Lượt xem, Báo cáo chờ xử lý), biểu đồ tăng trưởng, danh sách báo cáo mới nhất và nhật ký hoạt động quản trị (`Audit Logs`).
- [ ] **5. Quản lý Người dùng (`/admin/users` — `AdminUsersView.vue`):**
  - Tìm kiếm người dùng, lọc theo vai trò (`ADMIN`, `MODERATOR`, `USER`) và trạng thái (`Đang hoạt động`, `Đã khóa`).
  - **Đổi vai trò (`Role`):** Nâng quyền 1 `USER` lên `MODERATOR` hoặc hạ về `USER`.
  - **Khóa / Mở khóa tài khoản (`Ban / Unban`):** Khóa 1 tài khoản `USER` -> Tài khoản đó lập tức không thể đăng nhập hoặc gọi API (nhận `403 Tài khoản đã bị khóa`).
  - **Bảo vệ tự khóa mình:** Admin không thể tự khóa hoặc tự hạ quyền của chính mình.
- [ ] **6. Quản lý Danh mục & Thẻ Tag (`/admin/categories` — `AdminCategoriesView.vue`):**
  - **Danh mục (`Categories`):** Thêm danh mục mới (tên, mô tả, icon, màu sắc), chỉnh sửa danh mục, xóa danh mục (tự động chặn xóa nếu danh mục đang chứa bài viết).
  - **Thẻ (`Tags`):** Tạo tag mới, đổi tên tag, xóa tag rác.
- [ ] **7. Phân tích Chuyên sâu (`/admin/analytics` — `AdminAnalyticsView.vue`):**
  - Xem biểu đồ thống kê bài viết theo danh mục, xu hướng tương tác, tỉ lệ cảm xúc bình luận toàn hệ thống và top tác giả có đóng góp cao nhất.
- [ ] **8. Cài đặt Hệ thống (`/admin/settings` — `AdminSettingsView.vue`):**
  - Chỉnh sửa tên website, mô tả, ngưỡng tự động kiểm duyệt AI.
  - **Kiểm tra khóa Đăng ký thành viên mới (`allowRegistration`):** Tắt công tắc **`Cho phép đăng ký mới`** -> Bấm `Lưu cài đặt` -> Sang cửa sổ Ẩn danh (`Guest`) thử đăng ký tài khoản mới -> Backend chặn ngay với thông báo *"Hệ thống hiện đang tạm khóa chức năng đăng ký tài khoản mới"*. (Sau khi test xong, bật lại công tắc này về `true`).

---

## PHẦN 15: Checklist Biến Môi Trường Trước Khi Deploy HTTPS & Kịch Bản Vàng Bảo Vệ 10 Phút

### 15.1. Checklist Biến Môi Trường Production (HTTPS)
Khi đưa lên server/cloud có tên miền HTTPS thực tế, cấu hình các biến môi trường sau cho Backend:

| Biến môi trường (`application.yml`) | Giá trị khi Demo Local (`http://localhost`) | Giá trị khi Deploy Production (`https://...`) |
| :--- | :--- | :--- |
| `JWT_COOKIE_SECURE` | `false` | **`true`** (Bắt buộc truyền cookie qua HTTPS) |
| `JWT_COOKIE_SAME_SITE` | `Lax` | **`Lax`** (nếu cùng domain/proxy) hoặc **`None`** (nếu FE/BE khác domain) |
| `JWT_COOKIE_DOMAIN` | *(để trống)* | Domain gốc nếu dùng subdomain (VD: `.vietblog.id.vn`) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:5174,http://localhost:3000` | Domain chính thức của Frontend (VD: `https://vietblog.id.vn`) |
| `JWT_SECRET` | Chuỗi bí mật dev | Chuỗi ngẫu nhiên tối thiểu `64` ký tự |

### 15.2. Kịch Bản Vàng Trình Diễn 10 Phút Trước Hội Đồng Bảo Vệ
1. **Phút 1–2 (Bảo mật Hạ tầng & `HttpOnly Cookie`):**
   - Mở `F12 -> Application`: Chứng minh `Local Storage` không chứa JWT; mở tab `Cookies` chỉ rõ `vietblog_access_token` và `vietblog_refresh_token` đều gắn cờ **`HttpOnly = ✓`**, kết hợp Docker chạy **PostgreSQL (`PostGIS` + `pgvector`)** và **Redis 7+**.
2. **Phút 3–4 (Trải nghiệm Guest vs Auth & Tóm tắt AI `TextRank`):**
   - Trên cửa sổ Ẩn danh (`Guest`), mở 1 bài viết dài -> Bấm **`Tóm tắt bằng AI`** trình diễn thuật toán `TextRank` (`Đoạn văn` / `Ý chính`, `3 câu` / `5 câu`).
   - Bấm thử `Bookmark` khi là Guest -> Trình diễn `AuthModal` bật lên, bấm nút Demo Quick-Fill **`User`** để đăng nhập và tự động hoàn tất thao tác.
3. **Phút 5–6 (AI Phân tích Cảm xúc 4-Gram & Tìm kiếm Đa phương thức `TF-IDF` + `CBIR 51 chiều`):**
   - Viết bình luận có cấu trúc phủ định/chuyển ý tiếng Việt -> Chỉ rõ nhãn cảm xúc AI và thanh **Biểu đồ Tỉ lệ Cảm xúc**.
   - Chuyển sang `/search`: Trình diễn tìm kiếm ngữ nghĩa văn bản, tải 1 tấm ảnh để tìm bài viết có ảnh tương đồng (**`CBIR 51 chiều`**), và tải 1 file `.pdf`/`.docx` để tìm bài viết liên quan.
4. **Phút 7–8 (Bản đồ Địa lý `PostGIS` & Chat Thời gian thực WebSocket):**
   - Mở `/map`, bấm **`Quanh HCMUNRE`**, kéo thanh bán kính `1–50 km` để lọc bài viết theo không gian.
   - Mở `/chat` (hoặc `ChatPopup`), gửi tin nhắn/hình ảnh real-time qua WebSocket xác thực bằng `HttpOnly Cookie`.
5. **Phút 9–10 (Phân quyền 3 Cấp `USER` / `MODERATOR` / `ADMIN`):**
   - Đăng nhập nhanh bằng nút Demo **`Moderator`** -> Chỉ rõ giao diện giới hạn đúng 3 mục kiểm duyệt.
   - Đăng nhập bằng nút Demo **`Admin`** -> Mở `/admin` trình diễn toàn bộ 8 phân hệ quản trị, thống kê và công cụ kiểm tra cảm xúc NLP trực tiếp.
