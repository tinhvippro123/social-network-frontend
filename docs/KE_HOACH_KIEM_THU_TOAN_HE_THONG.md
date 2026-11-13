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
3. **Chạy bộ kiểm thử tự động Backend trước khi khởi chạy (tùy chọn, ~87 tests):**
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
  - Hiển thị nút thu gọn thanh bên (`<`), ô tìm kiếm nhanh ở giữa (placeholder *"Tìm kiếm bài viết, người dùng, AI..."*, kèm nút **Camera** tìm bằng ảnh và huy hiệu **`AI`**), nút **`Đăng nhập`** và **`Đăng ký`** bên phải trên nền giao diện sáng (**chỉ Light Mode** — tông màu **Classic Sapphire Blue `#2b579a`**, không có nút chuyển Dark Mode). Logo **VietBlog** nằm ở đầu thanh bên trái (`MainSidebar`).
  - **Không** hiển thị nút `Viết bài`, chuông `Thông báo` hay Avatar cá nhân.
- [ ] **Ô tìm kiếm nhanh trên Navbar:**
  - Gõ từ khóa (VD: `AI`) rồi bấm phím `Enter` -> chuyển tới `/search?q=AI` (mặc định **Tìm kiếm AI: Bật**). Ô này **không** có dropdown gợi ý tự động.
  - Bấm huy hiệu **`AI`** -> chuyển tới `/search?q=...&type=semantic` (hoặc `/search?type=semantic` nếu ô trống).
  - Bấm biểu tượng **Camera** -> mở hộp thoại chọn ảnh (`.png/.jpg`, tối đa 5MB) -> tự động chuyển sang `/search` ở chế độ **Tìm kiếm theo ảnh (CBIR)** và hiển thị kết quả tương đồng.
- [ ] **Thanh điều hướng bên trái (`MainSidebar.vue`):**
  - Nhóm **Menu chính**: Hiển thị đầy đủ `Trang chủ (/)`, `Tìm kiếm AI (/search)`, `Thịnh hành (/trending)`, `Đã lưu (/bookmarks)`, `Viết bài (/posts/create)`, `Nhóm (/groups)`, `Tin nhắn (/chat)`, `Thông báo (/notifications)`, `Bản đồ (/map)`.
  - Mục **`Trang quản trị` / `Kiểm duyệt`**: **Ẩn hoàn toàn** đối với Guest.
- [ ] **Cơ chế Ghi nhớ Trang đích (`authRedirectPath`) khi Guest truy cập route yêu cầu đăng nhập:**
  - Tại thanh bên trái, bấm vào mục **`Đã lưu (/bookmarks)`** (hoặc gõ trực tiếp URL `/posts/create`, `/chat`, `/notifications`, `/settings`).
  - **Kỳ vọng:** Không chuyển sang trang trắng hay báo lỗi; hệ thống giữ nguyên trang hiện tại (hoặc về `/` nếu mở thẳng URL) và **tự động bật `AuthModal`** ở tab Đăng nhập (không kèm toast). Sau khi đăng nhập thành công trên `AuthModal`, hệ thống **tự động chuyển hướng đúng vào trang vừa bấm** (VD: `/bookmarks` hoặc `/posts/create`).
- [ ] **Nút Cuộn lên đầu trang (`ScrollToTop.vue`) & Hộp thoại Chat nổi (`ChatPopup.vue`):**
  - Cuộn xuống quá `300px` -> nút mũi tên lên (`w-10 h-10`) xuất hiện gọn ở góc phải dưới (`bottom-6 right-5`), không che khuất nút **`Theo dõi`** của khung *Tác giả nổi bật* (nhờ khoảng đệm `pb-16` cuối cột phải), bấm vào cuộn mượt lên đầu trang.
  - **Không** hiển thị nút soạn tin nhắn nổi `ChatPopup` ở góc phải dưới khi chưa đăng nhập.

### 1.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] **Thanh điều hướng trên cùng (`MainNavbar.vue`):**
  - Nút `Đăng nhập / Đăng ký` biến mất; thay bằng nút **`Viết bài`**, biểu tượng **Tin nhắn (`MainNavbarChat`)**, **Chuông Thông báo** (kèm số lượng chưa đọc) và **Menu Avatar người dùng**.
  - Bấm vào Avatar -> mở menu thả xuống gồm: Tên & Email, `Trang cá nhân`, `Cài đặt`, `Trang quản trị` (nếu là `ADMIN`) hoặc `Trang kiểm duyệt` (nếu là `MODERATOR`), và `Đăng xuất`.
- [ ] **Thanh điều hướng bên trái (`MainSidebar.vue`):**
  - Nếu đăng nhập bằng `ADMIN` (`admin@vietblog.com`) xuất hiện thêm mục **`Trang quản trị`** (`/admin`); nếu là `MODERATOR` (`phamminhduc@gmail.com`) xuất hiện mục **`Kiểm duyệt`** (`/admin/moderation`).
- [ ] **Bong bóng Chat nổi (`ChatPopup.vue`) & Nút `ScrollToTop.vue`:**
  - Nút soạn tin nhắn nổi hiển thị ở góc phải dưới mọi trang (`right-6 bottom-2`, trừ khi đang ở trang `/chat`), đồng thời nút mũi tên cuộn lên đầu trang tự động xếp thẳng hàng phía trên (`sm:bottom-16 sm:right-7`) mà không đè lên nhau.

---

## PHẦN 2: Xác Thực, Bảo Mật `HttpOnly Cookie` & Quản Lý Phiên (`/login`, `/register`, `/forgot-password`, `AuthModal`)

### 2.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] **Đăng ký tài khoản mới (`/register` hoặc tab `Đăng ký` trên `AuthModal`):**
  - Kiểm tra validation: Tên trống, Email sai định dạng, Mật khẩu `< 8` ký tự, Xác nhận mật khẩu không khớp -> Báo lỗi rõ ràng dưới từng ô, chặn gửi form. Chưa tích ô *"Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật"* mà bấm **`Tạo tài khoản`** -> hiện toast cảnh báo *"Vui lòng đồng ý với điều khoản dịch vụ và chính sách bảo mật"* (nút không bị vô hiệu hóa sẵn).
  - Nhập email đã tồn tại (`admin@vietblog.com`) -> Backend trả về `409 Conflict` (*"Email đã được sử dụng"*).
  - Nhập thông tin hợp lệ mới:
    - Trên trang **`/register`** -> toast *"Đăng ký tài khoản thành công! Vui lòng đăng nhập."* và chuyển sang `/login`.
    - Trên tab **`Đăng ký`** của `AuthModal` -> hệ thống tự động đăng nhập luôn (`POST /api/auth/login`), toast *"Chào mừng ... đến với VietBlog!"* và đính kèm `HttpOnly Cookie`.
- [ ] **Đăng nhập (`/login` hoặc tab `Đăng nhập` trên `AuthModal`):**
  - Nhập sai mật khẩu -> Trả về `401 Unauthorized` (*"Email hoặc mật khẩu không chính xác"*).
  - Nhập đúng email/mật khẩu (VD: `nguyenvanan@gmail.com` / `Password123!`) -> Đăng nhập thành công, tự động lưu `HttpOnly Cookie` và điều hướng theo đúng vai trò (`USER` về `/` hoặc `authRedirectPath`, `MODERATOR` về `/admin/moderation`, `ADMIN` về `/admin`).
  - Giao diện đăng nhập có ô **`Ghi nhớ đăng nhập`** và liên kết **`Quên mật khẩu?`**. (Backend có sẵn API `POST /api/auth/google` nhưng giao diện hiện **không** hiển thị nút Google.)
- [ ] **Quên mật khẩu 2 bước kèm OTP (`/forgot-password`):**
  - **Bước 1:** Nhập email chưa đăng ký -> hiển thị lỗi màu đỏ ngay dưới ô email (*"Không tìm thấy tài khoản với email này"*). Nhập `nguyenvanan@gmail.com` -> Bấm **`Gửi mã xác nhận`** -> toast *"Mã xác nhận đã được tạo thành công!"* và hiển thị hộp **`💡 Mã xác thực (OTP)`** gồm 6 chữ số ngay trên màn hình để phục vụ demo bảo vệ.
  - **Bước 2:** Nhập mã OTP sai -> lỗi đỏ dưới ô (*"Mã xác nhận không hợp lệ hoặc đã hết hạn"*). Nhập đúng mã OTP + mật khẩu mới -> toast *"Đặt lại mật khẩu thành công!"* và chuyển sang màn hình **`Thành công!`** có nút **`Đăng nhập ngay`** (bấm để về `/login`, không tự chuyển).
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
  - Khi đã đăng nhập, gõ `/login`, `/register` hoặc `/forgot-password` trên thanh địa chỉ -> Router tự động đẩy về `/` (`USER`), `/admin` (`ADMIN`) hoặc `/admin/moderation` (`MODERATOR`).
- [ ] **Đăng xuất (`POST /api/auth/logout`):**
  - Bấm `Đăng xuất` từ menu Avatar -> Backend thu hồi Refresh Token trong DB/Redis và trả về `Set-Cookie: Max-Age=0` xóa sạch cả 3 cookie, ngắt kết nối WebSocket.

---

## PHẦN 3: Trang Chủ (`/`), Sự Kiện (`/events`), Thịnh Hành (`/trending`), Chủ Đề (`/tags/:name`) & Sidebar Phải

### 3.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] **Trang chủ (`/`):**
  - Đầu trang là băng chào (`HomeHeroBanner`: *"Chào buổi sáng/chiều/tối, bạn — Hôm nay có gì mới để khám phá?"*), bên dưới là dải thẻ **Danh mục** (`Tất cả`, `Công nghệ`, `Du lịch`, `Ẩm thực`, `Đời sống`, `Sự kiện`...) để lọc bảng tin. Trang chủ **không** có tab sắp xếp `Mới nhất / Thịnh hành / Đề xuất`.
  - Xem danh sách bài viết `PUBLISHED` dạng lưới 2 cột, bấm **`Xem thêm bài viết`** để tải trang tiếp theo.
  - Trên từng thẻ bài viết (`PostCard.vue`):
    - Điểm vote (`▲`), số bình luận và lượt xem chỉ để **hiển thị** (không bấm được). Muốn bình chọn/chia sẻ phải mở trang chi tiết bài viết.
    - Bấm nhãn **danh mục** -> lọc `/?category=<slug>`; bấm **địa điểm** -> mở `/map?postId=:id`; bấm **tên tác giả** -> `/profile/:id`; bấm **#tag** -> `/tags/:name`.
    - Bấm biểu tượng **Lưu (Bookmark)** góc phải ảnh -> toast *"Vui lòng đăng nhập để lưu bài viết"* và **bật `AuthModal`**.
- [ ] **Trang Sự kiện (`/events`):**
  - Truy cập `/events` -> Tự động điều hướng sang `/?category=su-kien`, lọc đúng các bài viết thuộc danh mục Sự kiện; thẻ bài hiển thị ngày giờ bắt đầu sự kiện (biểu tượng lịch).
- [ ] **Trang Thịnh hành (`/trending`):**
  - Băng đầu trang **`Thịnh hành`** hiển thị tổng lượt xem / tổng lượt vote; có dải lọc danh mục (`Tất cả`, `Công nghệ`, ...). Bài viết xếp hạng kèm **huy hiệu số 1 (vàng), 2 (bạc), 3 (cam/đồng)**.
  - Ẩn một bài qua trang quản trị (`/admin/posts` -> `Ẩn bài viết`) rồi tải lại `/trending` -> bài đó **biến mất ngay** (cache thịnh hành được làm mới tức thì).
- [ ] **Trang Chủ đề / Tag (`/tags/:name`):**
  - Bấm vào 1 tag bất kỳ (VD: `#ai`, `#spring-boot`) -> Chuyển tới `/tags/ai`, hiển thị tiêu đề chủ đề, số lượng bài viết và danh sách bài viết thuộc tag đó.
- [ ] **Thanh bên phải:**
  - Ở **Trang chủ** (`components/TrendingSidebar.vue`): khối **`Thịnh hành`** (top 5 bài, bấm chuyển `/posts/:id`), khối **`Tags phổ biến`** (tối đa 12 tag, bấm chuyển `/tags/:name`) và khối **`Tác giả nổi bật`** (top 3).
  - Ở **trang `/trending`** (`views/components/TrendingSidebar.vue`): chỉ có **`Tags phổ biến`** và **`Tác giả nổi bật`**.
  - Khối **`Tác giả nổi bật`** có khoảng đệm dưới (`pb-16`) để không bị nút nổi góc dưới che khuất; bấm tên/avatar chuyển tới `/profile/:id`. Bấm **`Theo dõi`** khi là Guest -> toast *"Vui lòng đăng nhập để theo dõi tác giả"* và bật `AuthModal`.

### 3.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] **Băng chào Trang chủ:** hiển thị đúng tên người dùng (*"Chào buổi ..., [Tên User]"*). Nếu bảng tin trống, có nút tạo bài viết chuyển sang `/posts/create`.
- [ ] **Tương tác trên `PostCard`:**
  - Bấm **Bookmark**: Lưu/Bỏ lưu bài viết tức thì kèm toast *"Đã lưu bài viết"* / *"Đã bỏ lưu bài viết"*.
  - Bấm **`Theo dõi`** ở khối *Tác giả nổi bật*: Đổi thành `Đang theo dõi` ngay lập tức kèm toast *"Đang theo dõi ..."*; bấm lại để bỏ theo dõi.

---

## PHẦN 4: Chi Tiết Bài Viết, Tóm Tắt AI TextRank & Bình Luận Cảm Xúc 4-Gram (`/posts/:id`)

### 4.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] **Xem bài viết công khai (`PUBLISHED`):**
  - Hiển thị đầy đủ tiêu đề, danh mục, ngày đăng, lượt xem, nội dung HTML, thẻ vị trí địa lý (nếu có), thời gian sự kiện (nếu có), danh sách tags, thông tin tác giả và **Bài viết liên quan** ở cuối trang. (Trang không hiển thị số phút đọc.)
- [ ] **Trình xem ảnh Phóng to (`ImageLightboxModal.vue`) & Collage ảnh:**
  - Bấm vào ảnh bìa, ảnh trong bài viết hoặc cụm ảnh Collage -> Mở Lightbox toàn màn hình.
  - Kiểm tra các nút: **`Ảnh trước` / `Ảnh kế tiếp`** (hoặc phím mũi tên Trái/Phải), **`Phóng to chi tiết` / `Thu nhỏ (1:1)`**, **`Tải ảnh về máy`**, **`Đóng (Esc)`**.
- [ ] **Trợ lý Tóm tắt Bài viết bằng AI (`PostAiSummary.vue` — Thuật toán `TextRank`):**
  - Hoạt động **công khai cho cả Guest**.
  - Bấm **`Xem tóm tắt`** -> Hiện bản tóm tắt trích xuất từ nội dung bài viết (bấm **`Thu gọn`** để đóng). Trong lúc tính hiện dòng *"Đang phân tích đồ thị câu và tính toán trọng số TextRank..."*.
  - Chuyển đổi chế độ hiển thị: **`Đoạn văn liền mạch`** vs **`Từng câu cốt lõi`**.
  - Chuyển đổi độ dài: **`Ngắn (3 câu)`** vs **`Chi tiết (5 câu)`**.
  - Bấm **`Sao chép`** (chuyển thành *"Đã sao chép"*) và nút **Tạo lại tóm tắt** (chạy lại TextRank).
- [ ] **Thanh tương tác bài viết (`PostInteractionBar.vue`) khi là Guest:**
  - Xem được số lượng Upvote/Downvote, tổng số biểu cảm (6 loại Emoji: `👍 Thích`, `❤️ Yêu thích`, `😂 Haha`, `😮 Wow`, `😢 Buồn`, `😡 Phẫn nộ`) và số bình luận.
  - Bấm **`Tán thành (Upvote)`**, **`Không tán thành (Downvote)`**, chọn **Emoji Reaction**, bấm **`Lưu`**, hoặc bấm **`Báo cáo`** -> Tất cả đều chặn lại, hiện thông báo và **mở `AuthModal`**.
  - Bấm **`Chia sẻ`** -> toast *"Đã sao chép liên kết vào bộ nhớ tạm!"*.
- [ ] **Khu vực Bình luận (`PostComments.vue` & `CommentItem.vue`) khi là Guest:**
  - Xem được danh sách bình luận gốc, bình luận phản hồi đa cấp (nút *"Xem tất cả N phản hồi"* / *"Thu gọn N phản hồi"*), ảnh đính kèm trong bình luận, nhãn cảm xúc AI và thanh **`Cảm xúc AI:`** tổng hợp `% Tích cực`, `% Trung lập`, `% Tiêu cực`.
  - Ô **`Viết bình luận...`** vẫn hiển thị; Guest gõ nội dung và bấm **`Gửi`** -> **bật `AuthModal`**.
  - Trên từng bình luận: Bấm biểu tượng **Thả cảm xúc** (mặt cười +), bấm **`Phản hồi`** (toast *"Vui lòng đăng nhập để phản hồi bình luận"*), hoặc bấm **`Báo cáo`** (toast *"Vui lòng đăng nhập để báo cáo bình luận"*) -> **bật `AuthModal`**.
- [ ] **Bảo vệ bài viết Nháp (`DRAFT`) hoặc Đã ẩn (`HIDDEN`) trước Guest:**
  - Truy cập `/posts/:id` của một bài viết đang ở trạng thái `DRAFT` hoặc `HIDDEN` -> Backend trả về `404 Not Found`, Frontend hiển thị màn hình *"Không tìm thấy bài viết"*, tuyệt đối không lộ nội dung nháp.

### 4.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / Tác giả / `MODERATOR` / `ADMIN`)
- [ ] **Tương tác Bài viết & Quy tắc Loại trừ lẫn nhau (Mutual Exclusivity) giữa Vote và Emoji:**
  - Bấm **`Upvote (+1)`** -> Điểm tăng 1. Sau đó thả biểu cảm **`❤️ LOVE`** vào cùng bài viết -> Hệ thống tự động gỡ `Upvote` và chuyển sang trạng thái `LOVE` (và ngược lại: đang có Emoji mà bấm `Upvote`/`Downvote` thì tự động gỡ Emoji).
  - Bấm lại chính biểu cảm `❤️ LOVE` đang chọn -> Gỡ biểu cảm về trạng thái trống.
  - Bấm **`Lưu`** -> Lưu vào `/bookmarks`.
  - Bấm **`Báo cáo`** -> Chỉ hiển thị trên bài viết của **người khác** (ẩn trên bài viết của chính mình). Chọn lý do báo cáo (`Spam hoặc quảng cáo`, `Nội dung không phù hợp`, `Quấy rối hoặc bắt nạt`, `Thông tin sai lệch`, `Vi phạm bản quyền`, `Lý do khác` — dạng chữ, không kèm emoji) và gửi -> Tạo báo cáo `PENDING` cho Admin/Mod.
- [ ] **Viết Bình luận, Đính kèm Ảnh & Phân tích Cảm xúc AI 4-Gram (`SentimentAnalysisService`):**
  - Bấm nút **`Biểu tượng cảm xúc`** để mở bảng **16 Emoji nhanh** chèn vào ô bình luận.
  - Bấm biểu tượng **`Đính kèm ảnh`** -> Tải ảnh lên bình luận, có nút `X` để gỡ ảnh trước khi gửi.
  - Gửi bình luận tiếng Việt tích cực (VD: *"Bài viết rất hay, phân tích sâu sắc và cực kỳ hữu ích!"*) -> Bình luận xuất hiện ngay lập tức kèm nhãn **`Tích cực`** màu xanh lá và cập nhật thanh **Cảm xúc AI**.
  - Gửi bình luận có phủ định kép / chuyển ý 4-Gram (VD: *"Tưởng không hay nhưng lại hay không tưởng"*) -> Nhãn cảm xúc nhận diện chính xác.
  - Bấm **`Phản hồi`** trên 1 bình luận -> ô nhập đổi thành *"Viết phản hồi..."*, gửi bình luận con hiển thị thụt lề dưới bình luận gốc.
  - Bấm biểu tượng **Thả cảm xúc** để chọn 1 trong 6 emoji (`👍 ❤️ 😂 😮 😢 😡`) cho từng bình luận.
- [ ] **Ma trận Quyền Xóa Bình luận** (nút **`Xóa`** -> hộp xác nhận *"Xóa bình luận"*):
  - **Người viết bình luận:** Thấy nút `Xóa` trên bình luận của chính mình.
  - **Tác giả của bài viết (`postAuthorId`):** Thấy nút `Xóa` trên **mọi bình luận** nằm trong bài viết của mình để tự quản lý thảo luận.
  - **`MODERATOR` / `ADMIN`:** Thấy nút `Xóa` trên **mọi bình luận** toàn hệ thống.
- [ ] **Xem bài viết Nháp (`DRAFT`) hoặc Đã ẩn (`HIDDEN`) khi có quyền:**
  - **Tác giả bài viết** (đối với bài `DRAFT`/`HIDDEN` của mình) hoặc **`MODERATOR`/`ADMIN`**: Truy cập `/posts/:id` xem được nội dung kèm băng rôn cảnh báo trạng thái ở đầu bài; hệ thống **tự động ẩn** thanh tương tác & khu vực bình luận và **không** gọi API `/comments` (không gây lỗi `404` giả).
  - **Tác giả bài viết**: Thấy nút **`Chỉnh sửa`** và **`Xóa`** ngay trên phần đầu bài (bấm `Xóa` -> hộp xác nhận nút **`Xóa bài viết`**).

---

## PHẦN 5: Soạn Thảo & Chỉnh Sửa Bài Viết (`/posts/create`, `/posts/:id/edit`)

### 5.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] Truy cập `/posts/create` hoặc `/posts/:id/edit` -> Router chặn ngay lập tức, giữ lại đường dẫn đích trong `authRedirectPath` và bật `AuthModal`.
- [ ] Gọi trực tiếp `POST /api/posts`, `PUT /api/posts/{id}`, `DELETE /api/posts/{id}` hoặc `POST /api/files/upload` không có cookie -> Trả về **`401 Unauthorized`**.

### 5.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] **Trình soạn thảo Rich-Text TipTap (`CreatePostView` / `EditPostView` -> `PostEditor.vue`):**
  - Kiểm tra đầy đủ thanh công cụ: `Hoàn tác (Undo)`, `Làm lại (Redo)`, In đậm (`Bold`), In nghiêng (`Italic`), Gạch ngang (`Strike`), Tiêu đề `Heading 1` / `Heading 2`, `Bulleted list`, `Numbered list`, `Quote`, `Code`, `Link`, và **Chèn ảnh / Bộ sưu tập ảnh** (chọn 1 hoặc nhiều ảnh). (Không có Gạch chân, `H3` hay Căn lề.)
  - Bấm nút **Xem trước** để xem bản hiển thị trước khi đăng.
- [ ] **Kiểm tra Ràng buộc Dữ liệu (Validation) & Chống XSS:**
  - Để trống Tiêu đề hoặc chưa chọn Danh mục -> báo lỗi, không cho gửi. Chân trình soạn thảo hiển thị *"Tối thiểu 50 ký tự"* (đổi thành *"Đã đạt độ dài tối thiểu"* khi đủ); gửi nội dung `< 50` ký tự -> lỗi *"Nội dung bài viết quá ngắn (yêu cầu ít nhất 50 ký tự)"*.
  - Chèn thử mã độc `<script>alert(1)</script>` hoặc `onerror=...` vào nội dung -> Backend `HtmlSanitizer` tự động lọc sạch thẻ nguy hiểm trước khi lưu DB.
- [ ] **Tải ảnh bìa & Cụm ảnh Collage (`images`):**
  - Tải ảnh bìa chính (`coverImage`, PNG/JPG tối đa 5MB) và chèn nhiều ảnh vào nội dung để tạo lưới ảnh Collage.
- [ ] **Đính kèm Vị trí Địa lý (`LocationPickerModal.vue` — Leaflet + Nominatim):**
  - Bấm **`Ghim vị trí`** -> Mở modal bản đồ.
  - Tìm kiếm địa điểm (ô *"Tìm kiếm địa điểm, quán ăn, đường phố..."*, VD: *"Trường Đại học Tài nguyên và Môi trường TP.HCM"*) hoặc bấm trực tiếp lên bản đồ / bấm **`Vị trí hiện tại`** -> Bấm **`Xác nhận`** -> tọa độ và địa chỉ được gắn vào bài viết (hiển thị thẻ địa chỉ có nút `X` để gỡ).
- [ ] **Đính kèm Thời gian Sự kiện & Thẻ Tags:**
  - Khi chọn danh mục `Sự kiện`, khung **`Thời gian sự kiện`** xuất hiện để chọn thời gian bắt đầu / kết thúc. Thời gian kết thúc trước thời gian bắt đầu -> lỗi *"Thời gian kết thúc sự kiện phải sau thời gian bắt đầu"*.
  - Thêm thẻ Tag trong ô **`Thêm tag...`** (tối đa **5 tags**, bấm `Enter` để tạo, bấm `X` để xóa).
- [ ] **Lưu Nháp (`DRAFT`) vs Xuất bản (`PUBLISHED`):**
  - Bấm **`Lưu nháp`** -> Bài viết lưu ở trạng thái `DRAFT`, xuất hiện trong tab `Nháp` ở trang Hồ sơ cá nhân, không hiện lên trang chủ công khai.
  - Bấm **`Xuất bản`** (ở chế độ sửa là **`Lưu thay đổi`**) -> Bài viết chuyển sang `PUBLISHED`, tự động sinh vector ngữ nghĩa `TF-IDF` (ghi vào pgvector **sau khi giao dịch DB commit**) + đặc trưng ảnh `CBIR` và xuất hiện trên Trang chủ / Bản đồ.
  - **Kiểm tra lập chỉ mục ngay:** Vừa xuất bản bài mới có từ khóa đặc trưng (VD: tiêu đề chứa *"Thử nghiệm pgvector"*) -> vào `/search` gõ `thu nghiem pgvector` -> bài mới xuất hiện ngay, không cần khởi động lại server.
- [ ] **Bảo vệ Quyền Chỉnh sửa & Trạng thái Bài viết (`/posts/:id/edit`):**
  - Người dùng A truy cập `/posts/:id/edit` của bài viết thuộc Người dùng B -> trang hiển thị thẻ lỗi *"Bạn không có quyền chỉnh sửa bài viết của người khác"* kèm nút **`Về trang chủ`** (Backend cũng chặn `403 Forbidden` nếu gọi API).
  - Bài viết đã bị Admin/Moderator khóa (`status = HIDDEN`) -> Tác giả thường không thể tự sửa hoặc tự đổi trạng thái từ `HIDDEN` sang `PUBLISHED` (Backend trả về `400 Bad Request` nếu cố tình gửi `status: "HIDDEN"` hoặc tự mở khóa bài đã bị kiểm duyệt ẩn).

---

## PHẦN 6: Bài Viết Đã Lưu (`/bookmarks`)

### 6.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] Truy cập `/bookmarks` -> Tự động bật `AuthModal` (kèm ghi nhớ đường dẫn `/bookmarks`).
- [ ] Gọi `GET /api/posts/bookmarked` hoặc `POST /api/posts/{id}/bookmark` không có cookie -> Trả về **`401 Unauthorized`**.

### 6.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] Hiển thị danh sách tất cả bài viết đã lưu của tài khoản hiện tại.
- [ ] Bấm vào biểu tượng **Bookmark (`🔖`)** trên 1 bài trong trang `/bookmarks` -> Gỡ bài viết đó khỏi danh sách ngay lập tức.
- [ ] Khi danh sách trống -> Hiển thị *"Chưa có bài viết nào được lưu"* kèm nút **`Khám phá bài viết`** (về `/`).
- [ ] **Kiểm tra Đăng xuất ngay tại trang `/bookmarks`:** Bấm `Đăng xuất` khi đang đứng ở `/bookmarks` -> Chuyển về trang chủ êm ái, **không** phát sinh bất kỳ thông báo lỗi `401` nào.

---

## PHẦN 7: Tìm Kiếm Đa Phương Thức (`/search` — Từ Khóa, Ngữ Nghĩa AI `TF-IDF + pgvector`, Hình Ảnh `CBIR 51 Chiều`, Tài Liệu `.pdf/.docx`)

### 7.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
> [!TIP]
> Toàn bộ phương thức tìm kiếm AI của VietBlog đều **mở công khai 100% cho cả Guest** để giảng viên và người đọc trải nghiệm ngay mà không cần đăng nhập.

- [ ] **Phương thức 1 — Tìm kiếm Từ khóa & Ngữ nghĩa AI (`TF-IDF + Cosine Similarity / pgvector`):**
  - Truy cập `/search` (hoặc bấm **`Tìm kiếm AI`** trên thanh bên trái): Mặc định công tắc **`Tìm kiếm AI`** ở trạng thái **`Bật`** (`textMode = 'semantic'`), trừ khi truy cập với `?type=keyword` (trạng thái **`Tắt`**).
  - **Tìm từ khóa ngắn `"AI"`:** Nhập `"AI"` -> bấm **`Tìm kiếm`** -> Trả về các bài viết về AI ở cả hai chế độ `Bật` và `Tắt` (do `"ai"` không còn bị lọc trong stopword).
  - **Tìm tiếng Việt có dấu vs không dấu:**
    - Nhập `"da lat"` -> tìm thấy bài viết chứa `"Đà Lạt"`; nhập `"tri tue nhan tao"` -> tìm thấy bài chứa `"Trí tuệ nhân tạo"` (ở cả chế độ Tìm kiếm AI `Bật` và `Tắt`).
    - Chuyển Tìm kiếm AI sang **`Tắt`** (chế độ từ khóa) rồi nhập từ có dấu **`"Đá Lạt"`** -> giữ so khớp chính xác dấu, **không** khớp nhầm `"Đà Lạt"`. (Chế độ từ khóa yêu cầu tất cả từ khóa truy vấn đều xuất hiện trong bài viết: tiêu đề, mô tả, nội dung, tags hoặc địa chỉ.)
  - **3 tab kết quả (`Bài viết`, `Tác giả`, `Chủ đề`):**
    - Huy hiệu **`AI Search`** chỉ hiển thị ở tab **`Bài viết`**.
    - Chuyển sang tab **`Chủ đề`**: Tải tối đa 100 tag phổ biến; nhập `"AI"` chỉ khớp `#ai` và **tuyệt đối không** khớp nhầm `#saigon` (so khớp theo ranh giới từ).
    - Chuyển sang tab **`Tác giả`**: Lọc theo tiền tố từ và không phân biệt dấu tiếng Việt.
    - Gõ thay đổi từ khóa ở tab `Chủ đề` / `Tác giả` rồi bấm quay lại tab **`Bài viết`** -> Hệ thống **tự động chạy tìm kiếm lại** theo từ khóa đang nhập.
  - Kiểm tra các **Chip từ khóa gợi ý** bên dưới (`Trí tuệ nhân tạo`, `Spring Boot`, `Vue 3`, ...) -> Bấm vào chip tự động chạy tìm kiếm.
- [ ] **Phương thức 2 — Tìm kiếm bằng Hình ảnh (`CBIR 51-D HSV Color Histogram + Edge Density + Spatial Grid`):**
  - Bấm nút **Camera** (`Tìm bằng hình ảnh (PNG, JPG)`, tối đa `5MB`) trên thanh tìm kiếm để chọn tệp `.png` hoặc `.jpg`.
  - Hiển thị thẻ chip **`Tìm kiếm theo ảnh`** kèm tên tệp + dung lượng (`KB`) và huy hiệu **`Tìm bằng ảnh`** -> Hệ thống trích xuất vector đặc trưng thị giác **51 chiều** và trả về danh sách `PostCard` tương đồng theo thứ tự giảm dần (lưu ý `PostCard` không hiển thị nhãn `%` và ô tìm kiếm không hỗ trợ kéo thả trực tiếp).
  - Thử tải lên file không phải ảnh (hoặc ảnh hỏng) -> Hệ thống trả lỗi `400` thân thiện, không bao giờ lỗi `500`.
- [ ] **Phương thức 3 — Tìm kiếm bằng Tài liệu (`Document Search` — `.pdf`, `.docx`):**
  - Bấm nút **Tài liệu** (`Tìm bằng tài liệu (PDF, DOCX)`, tối đa `5MB`) để chọn 1 file `.pdf` hoặc `.docx`.
  - Hiển thị thẻ chip **`Tìm kiếm theo tài liệu`** kèm tên tệp + dung lượng (`KB`) và huy hiệu **`Tìm bằng tài liệu`**; Backend (`Apache PDFBox` / `ZipInputStream + XMLInputFactory (StAX)`) bóc tách văn bản từ tài liệu và dùng `TF-IDF` xếp hạng các bài viết có nội dung sát nhất (giao diện không in đoạn trích văn bản từ tệp).

### 7.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] Thực hiện đầy đủ các phương thức tìm kiếm như trên; trên thẻ `PostCard` kết quả có thể bấm **Lưu (Bookmark)** trực tiếp (Upvote/Downvote thực hiện trong trang chi tiết bài viết), hoặc bấm **`Theo dõi`** trong tab **`Tác giả`** mà không bị chặn bởi `AuthModal`.

---

## PHẦN 8: Bản Đồ Không Gian Địa Lý (`/map` & `/map?postId=:id` — `PostGIS` + `Haversine` + `Leaflet`)

### 8.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] **Hiển thị Bản đồ & Chống đè điểm ghim (Coordinate Jittering):**
  - Truy cập `/map` -> Bản đồ Leaflet tải đầy đủ các điểm ghim (Marker) bài viết có gắn tọa độ.
  - Mỗi điểm ghim hiển thị **biểu tượng ghim bản đồ SVG (`Map Pin`)** màu xanh Sapphire (`#2b579a`) và đổi sang màu xanh đậm hơn (**`#214478`**) khi đang chọn. Các bài viết trùng tọa độ được tự động tách nhẹ để không đè khít lên nhau.
- [ ] **Tìm kiếm Bán kính Không gian (`1 km` – `50 km`):**
  - Bấm nút **`Quanh HCMUNRE`**, **`Quanh vị trí tôi`**, hoặc bấm trực tiếp vào một điểm bất kỳ trên bản đồ -> Xuất hiện vòng tròn bán kính màu xanh trên bản đồ; bấm **`Xem tất cả`** để đặt lại chế độ toàn quốc.
  - Kéo thanh trượt **Bán kính (`1 km` -> `50 km`)** -> Danh sách bài viết bên cột trái tự động lọc theo khoảng cách thực tế (`PostGIS ST_DWithin` / `Haversine`) và hiển thị số **`km` cách tâm** trên từng bài.
- [ ] **Bộ lọc Danh mục & Từ khóa trên Bản đồ:**
  - Ô lọc `"Lọc theo tiêu đề hoặc địa điểm..."` hỗ trợ tìm không phân biệt dấu tiếng Việt (VD: `"da lat"` khớp `"Đà Lạt"`). Dải lọc danh mục (`Tất cả`, `Công nghệ`, `Đời sống`, `Du lịch`, `Ẩm thực`, `Sự kiện` — dạng chữ thuần, không emoji) cập nhật đồng thời danh sách và các điểm ghim.
- [ ] **Xem Thẻ bài viết trên Bản đồ & Điều hướng sâu (`/map?postId=:id`):**
  - Bấm vào 1 điểm ghim hoặc 1 bài trong danh sách -> Bản đồ đưa tới đúng tọa độ đó, mở thẻ chi tiết rút gọn kèm nút **`Xem bài viết`** (chuyển sang `/posts/:id`).
  - Từ trang chi tiết bài viết có gắn vị trí, bấm vào tên địa điểm -> Chuyển sang `/map?postId=:id` và tự động focus đúng điểm ghim của bài viết đó.

### 8.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] Hoạt động đầy đủ như Guest, đồng thời cho phép lưu hoặc bình chọn bài viết ngay khi chuyển sang trang chi tiết.

---

## PHẦN 9: Hồ Sơ Cá Nhân (`/profile` & `/profile/:id`)

### 9.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] **Truy cập `/profile` (không có `:id`):**
  - Khi Guest gõ `/profile` -> Hệ thống **không** báo lỗi *"Không tìm thấy người dùng"* mà tự động bật `AuthModal('login', '/profile')` và đưa về `/`. Sau khi đăng nhập xong sẽ vào thẳng `/profile` của mình.
- [ ] **Truy cập Hồ sơ người dùng bất kỳ (`/profile/:id`):**
  - Xem được Ảnh bìa, Avatar, Tên, Tiểu sử (`bio`), Ngày tham gia, thống kê **`Bài viết`**, **`Followers`**, **`Following`**.
  - Xem được 2 tab công khai: **`Bài viết`** (các bài `PUBLISHED` của user đó) và **`Nhóm`** (các nhóm đã tham gia). **Không** hiển thị tab `Nháp` và `Đã lưu` của người khác.
  - Bấm vào thống kê **`Followers`** hoặc **`Following`** -> Mở modal danh sách gồm 2 tab **`Người theo dõi`** / **`Đang theo dõi`** (có ô tìm kiếm hỗ trợ không dấu tiếng Việt); bấm nút `Theo dõi` bên trong modal sẽ bật `AuthModal`.
  - Trên đầu trang hồ sơ: Bấm nút **`Theo dõi`**, **`Nhắn tin`**, hoặc menu **`⋯` (`Chặn người dùng` / `Báo cáo`)** -> Tất cả đều bật `AuthModal`.
- [ ] **Kiểm tra Quyền riêng tư Hồ sơ (`profileVisibility`):**
  - Nếu chủ hồ sơ đã cài đặt quyền riêng tư là **`Chỉ mình tôi` (`private`)** hoặc **`Chỉ người theo dõi` (`followers`)** -> Khi đăng xuất về Guest hoặc xem bằng người chưa theo dõi tại `/profile/:id`, hệ thống hiển thị biểu tượng ổ khóa với tiêu đề **`"Trang cá nhân riêng tư"`** và mô tả *"Người dùng này đã đặt trang cá nhân ở chế độ riêng tư."*, ẩn danh sách bài viết và nhóm.

### 9.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] **Khi xem Hồ sơ của CHÍNH MÌNH (`/profile` hoặc `/profile/<myId>`):**
  - Hiển thị đầy đủ **4 Tab**: **`Bài viết`**, **`Nháp`**, **`Đã lưu`**, và **`Nhóm`**.
  - Trong tab **`Nháp`**: Có thể bấm vào bài nháp để tiếp tục chỉnh sửa (`/posts/:id/edit`) hoặc xóa bản nháp.
  - Hiển thị nút **`Chỉnh sửa`** (chuyển sang `/settings`).
- [ ] **Khi xem Hồ sơ của NGƯỜI DÙNG KHÁC (`/profile/:otherId`):**
  - Bấm **`Theo dõi` / `Đang theo dõi`** -> Số lượng `Followers` tăng/giảm tức thì.
  - Bấm **`Nhắn tin`** -> Tự động tạo hoặc mở cuộc trò chuyện 1-1 với người đó tại `/chat`.
  - Bấm menu **`⋯` -> `Chặn người dùng`** -> Xác nhận chặn -> Đổi thành **`Bỏ chặn người dùng`** (bấm lại để bỏ chặn).
  - Bấm menu **`⋯` -> `Báo cáo`** -> Xác nhận gửi báo cáo vi phạm kiểu `USER` về trang Kiểm duyệt.

---

## PHẦN 10: Cài Đặt Người Dùng (`/settings` — 4 Tab `<KeepAlive>`)

### 10.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] Truy cập `/settings` -> Router chặn lại, lưu `authRedirectPath = '/settings'` và bật `AuthModal`.

### 10.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / `MODERATOR` / `ADMIN`)
- [ ] **Tab 1 — `Thông tin cá nhân` (`ProfileTab.vue`):**
  - Thay đổi Tên hiển thị (`2–50` ký tự), Tiểu sử (`<= 250` ký tự), tải lên **Ảnh đại diện (`avatar`, `<= 5MB`)** từ máy tính -> Bấm **`Lưu thay đổi`** -> Cập nhật ngay trên Navbar và trang Hồ sơ.
- [ ] **Tab 2 — `Tài khoản` (`AccountTab.vue`):**
  - **Đổi mật khẩu (`PUT /api/auth/me/password`):** Nhập mật khẩu hiện tại sai -> Báo lỗi `400`. Nhập đúng mật khẩu hiện tại + mật khẩu mới (`>= 8` ký tự) -> Đổi thành công.
  - **Vô hiệu hóa / Xóa tài khoản:**
    - **`Vô hiệu hóa tài khoản`** (với `USER` / `MODERATOR`): Xác nhận -> Gửi yêu cầu tới Admin (`POST /api/reports`), gọi `POST /api/auth/logout` xóa sạch `HttpOnly Cookie`, thông báo và đưa về `/login`.
    - **`Xóa tài khoản vĩnh viễn`** (với `USER` / `MODERATOR`): Xác nhận -> Gửi yêu cầu xóa tài khoản tới Admin (`POST /api/reports`), hiện toast *"Đã gửi yêu cầu xóa tài khoản tới Quản trị viên hệ thống."* (vẫn giữ phiên hiện tại chờ Admin xử lý).
    - Nếu là **`ADMIN`**: Hệ thống cảnh báo (*"Tài khoản Quản trị viên (Admin) được bảo vệ và không thể tự khóa hoặc xóa"*) và chặn ngay cả hai thao tác.
- [ ] **Tab 3 — `Thông báo` (`NotificationsTab.vue`) & Tab 4 — `Quyền riêng tư` (`PrivacyTab.vue`):**
  - Bật/tắt các công tắc nhận thông báo và chọn chế độ hiển thị trang cá nhân (**`Tất cả mọi người`**, **`Chỉ người theo dõi`**, **`Chỉ mình tôi`**) -> Lưu đồng bộ vào `localStorage` (`vb_user_prefs_<id>`) mà không ghi đè chéo dữ liệu giữa 2 tab.

---

## PHẦN 11: Hội Nhóm Cộng Đồng (`/groups`, `/groups/:id`, `/groups/:id/posts/:postId`)

### 11.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] **Trang Danh sách Nhóm (`/groups`):**
  - Xem danh sách nhóm, tìm kiếm nhóm trong ô `"Tìm kiếm nhóm..."` (hỗ trợ không phân biệt dấu tiếng Việt), lọc theo 3 nút **`Tất cả`**, **`Đã tham gia`**, **`Khám phá`**. (Khi là Guest bấm **`Đã tham gia`** sẽ hiển thị danh sách trống *"Không tìm thấy nhóm nào"*.)
  - Bấm nút **`Tạo nhóm mới`** -> Hiện toast *"Vui lòng đăng nhập để tạo nhóm mới"* và **bật `AuthModal`**.
  - Trên thẻ nhóm (`GroupCard.vue`): Bấm nút **`Tham gia`** -> Hiện toast *"Vui lòng đăng nhập để tham gia nhóm"* và **bật `AuthModal`**.
- [ ] **Trang Chi tiết Nhóm CÔNG KHAI (`/groups/:id` với `isPublic = true`):**
  - Guest xem được đầy đủ cả 3 tab: **`Bài viết`**, **`Thành viên`** (kèm huy hiệu `Trưởng nhóm`, `Quản trị viên`, `Kiểm duyệt viên`, `Thành viên`), và **`Giới thiệu`**.
  - Bấm vào 1 bài thảo luận -> Mở modal hoặc trang `/groups/:id/posts/:postId`: Guest đọc được nội dung và bình luận thảo luận nhóm, nhưng khi bấm **`Thích`**, **`Gửi bình luận`**, **`Tham gia nhóm`** hoặc **`Báo cáo`** -> Bật `AuthModal`.
- [ ] **Trang Chi tiết Nhóm RIÊNG TƯ (`/groups/:id` với `isPublic = false`):**
  - Guest xem được ảnh bìa, tên nhóm và tab **`Giới thiệu`**, nhưng ở tab **`Bài viết`** và **`Thành viên`** hiển thị màn hình khóa **`Nhóm riêng tư`** kèm nút **`Đăng nhập để kiểm tra quyền thành viên`** (không gọi API `/posts` gây lỗi).
  - Guest gõ trực tiếp URL `/groups/:id/posts/:postId` của một nhóm riêng tư -> Hệ thống tự động kiểm tra quyền đọc nhóm trước, hiện thông báo *"Nhóm riêng tư chỉ dành cho thành viên"* và điều hướng về `/groups/:id` êm ái (không bắn toast lỗi đỏ).
  - Gọi trực tiếp API `GET /api/groups/{privateId}/posts` hoặc `GET /api/groups/{privateId}/members` không có cookie -> Backend trả về đúng **`401 Unauthorized`**.

### 11.2. Khi ĐÃ ĐĂNG NHẬP (`USER` / Thành viên / Trưởng nhóm / `MODERATOR` / `ADMIN`)
- [ ] **Tạo nhóm mới (`CreateGroupModal.vue`):**
  - Bấm **`Tạo nhóm mới`** -> Tải **`Ảnh đại diện nhóm`**, nhập **`Tên nhóm`**, **`Mô tả`**, chọn **`Chủ đề`**, chọn **`Loại nhóm`** (**`Công khai`** hoặc **`Riêng tư`**) -> Bấm **`Tạo nhóm`** thành công, người tạo tự động là **`Trưởng nhóm (OWNER)`**. (Ảnh bìa nhóm được cập nhật sau bằng nút **`Chỉnh sửa`** trong trang chi tiết nhóm.)
- [ ] **Tham gia & Rời nhóm Công khai vs Ràng buộc Nhóm Riêng tư:**
  - Với **Nhóm công khai**: Bấm **`Tham gia`** / **`Tham gia nhóm`** -> Trở thành thành viên ngay (`isJoined = true`), hiện nút **`Viết bài thảo luận`**. Bấm lại **`Đã tham gia`** -> Rời nhóm (Trưởng nhóm không thể tự rời nhóm của mình trước khi giải tán/chuyển quyền).
  - Với **Nhóm riêng tư** (khi đăng nhập bằng tài khoản chưa phải thành viên): Thẻ nhóm hiện nhãn **`Cần lời mời`**, trang chi tiết hiển thị **`Liên hệ Trưởng nhóm / Quản trị viên để được thêm vào nhóm`** (Backend chặn tự join nhóm riêng tư với mã `403 Forbidden`, chỉ cho phép Quản lý nhóm thêm thành viên qua `POST /api/groups/{id}/members`).
- [ ] **Đăng bài thảo luận, Thích & Bình luận trong Nhóm:**
  - Thành viên đã tham gia bấm **`Viết bài thảo luận`** (`CreateGroupPostModal.vue`) -> Nhập tiêu đề, nội dung, ảnh đính kèm -> Đăng bài thành công.
  - Mở chi tiết thảo luận (`/groups/:id/posts/:postId` hoặc modal): Bấm **`Thích`** bài thảo luận, viết **Bình luận** và **Xóa bình luận** của mình.
- [ ] **Quản trị Nhóm (Dành cho `OWNER` / `ADMIN` nhóm / Hệ thống `MODERATOR` & `ADMIN`):**
  - **Chỉnh sửa thông tin nhóm (nút **`Chỉnh sửa`** trên đầu trang nhóm):** Đổi tên, mô tả, ảnh đại diện, ảnh bìa, đổi quyền riêng tư (`Công khai` / `Riêng tư`).
  - **Quản lý thành viên (Tab `Thành viên`):**
    - `OWNER` bấm nút biểu tượng **Khiên** (`Bổ nhiệm quản trị viên` / `Hạ quyền quản trị`) để nâng hoặc hạ quyền `ADMIN` trong nhóm.
    - `OWNER` / `ADMIN` nhóm bấm nút **`UserMinus`** để mời thành viên ra khỏi nhóm.
  - **Xóa bài thảo luận & Giải tán nhóm:** Tác giả bài viết hoặc Quản lý nhóm xóa được bài thảo luận; `OWNER` hoặc Hệ thống `ADMIN`/`MODERATOR` bấm **`Giải tán`** để xóa toàn bộ nhóm.

---

## PHẦN 12: Nhắn Tin Thời Gian Thực (`/chat`, `ChatPopup` & `MainNavbarChat` — WebSocket + Redis Pub/Sub)

### 12.1. Khi KHÔNG ĐĂNG NHẬP (`Guest`)
- [ ] Biểu tượng Messenger (`MainNavbarChat`) trên Navbar và bong bóng `ChatPopup` ở góc dưới bên phải **ẩn hoàn toàn**.
- [ ] Truy cập `/chat` -> Router chặn lại, lưu `authRedirectPath = '/chat'` và bật `AuthModal`.
- [ ] Gọi bất kỳ API `/api/conversations/**` -> Backend trả về **`401 Unauthorized`**.
- [ ] Mở kết nối WebSocket `ws://localhost:8080/ws/chat` khi không có `HttpOnly Cookie` -> `ChatWebSocketHandler` đánh dấu phiên chưa xác thực, từ chối mọi gói tin với mã đóng kết nối **`1008 POLICY_VIOLATION`** (hoặc tự động ngắt sau `10s`).

### 12.2. Khi ĐÃ ĐĂNG NHẬP — Kịch bản Test Real-Time 2 Trình Duyệt Song Song
> [!IMPORTANT]
> **Cách bố trí màn hình khi test & demo bảo vệ đồ án:**
> Chia đôi màn hình máy tính (Snap Left / Snap Right):
> - **Cửa sổ Trái (Trình duyệt thường — `User A`):** Đăng nhập `nguyenvanan@gmail.com` (`Password123!`).
> - **Cửa sổ Phải (Trình duyệt Ẩn danh / Edge — `User B`):** Đăng nhập `dangthimylinh@gmail.com` (`Password123!`).

- [ ] **1. Kiểm tra Bắt tay WebSocket (`Handshake`) qua `HttpOnly Cookie` & Nhịp tim (`Heartbeat`):**
  - Mở `F12 -> Network -> WS -> Reload` trên máy `User A`:
    - Thấy kết nối **`ws://localhost:8080/ws/chat`** đạt trạng thái **`101 Switching Protocols`** (xác thực trực tiếp qua `Cookie: vietblog_access_token=...` bởi `ChatWebSocketHandler` + `AuthCookieService`, hoàn toàn không lộ `?token=...` trên URL).
    - Bấm vào tab **`Messages`** của kết nối WS: Thấy ngay gói tin đầu tiên từ Server gửi về là `{"type":"authenticated","userId":"..."}`, và cứ mỗi **`25 giây`** Client tự gửi `{"type":"ping"}` -> Server phản hồi `{"type":"pong"}`.
- [ ] **2. Test Real-time Sự kiện `conversation.created` (Tạo hội thoại 1-1 & Nhóm chat):**
  - Bên máy `User A`: Mở `/chat` -> Mở modal **`Tin nhắn mới`** (`NewChatModal.vue`) -> Tìm kiếm người dùng (ô `"Tìm kiếm người dùng..."`, hỗ trợ không dấu tiếng Việt), chọn `User B` hoặc bấm **`Nhóm`** để chọn nhiều người tạo nhóm chat -> Bấm **`Bắt đầu trò chuyện`**.
  - **Kết quả Real-time bên máy `User B` (không cần F5):** Cột danh sách hội thoại bên trái trang `/chat` và menu thả xuống `MainNavbarChat` tự động nhảy cuộc trò chuyện mới lên đầu danh sách ngay lập tức.
- [ ] **3. Test Real-time Sự kiện `message.created` trên cả 3 vị trí (`MainNavbarChat`, `ChatPopup`, `/chat`):**
  - **Trường hợp A (`User B` đang ở trang chủ `/` và đóng khung chat):**
    - `User A` gửi 1 tin nhắn văn bản (kèm Emoji) -> Ngay lập tức biểu tượng Messenger (`MainNavbarChat`) trên thanh Navbar của `User B` hiện **badge đỏ số đếm chưa đọc (`1`) nhấp nháy (`animate-pulse`)**.
  - **Trường hợp B (`User B` mở cửa sổ chat thu nhỏ `ChatPopup` ở góc dưới phải hoặc mở trang `/chat`):**
    - `User A` lần lượt gửi **Tin nhắn chữ**, **Hình ảnh**, **Tệp đính kèm (`File`)**, và **Trả lời trích dẫn (`Reply`)** 1 tin nhắn cũ.
    - **Kết quả Real-time bên máy `User B`:** Tin nhắn, ảnh, file và khung trích dẫn hiện ra tức thì trong khung chat và tự động cuộn xuống cuối (`scrollToBottom`).
- [ ] **4. Test Real-time Sự kiện `conversation.read` (Trạng thái "Đã xem" / Read Receipt):**
  - Khi `User B` bấm vào cuộc trò chuyện (hoặc đang mở sẵn khung chat khi nhận tin nhắn của `User A`) -> Frontend tự động gọi `POST /api/chat/conversations/{id}/read`.
  - **Kết quả Real-time bên máy `User A`:** Trạng thái dưới chân tin nhắn của `User A` tự động chuyển từ `Đã gửi` sang **`Đã xem`** (`status = "read"`) ngay lập tức.
- [ ] **5. Test Real-time Sự kiện `message.revoked` (Thu hồi tin nhắn 2 chiều):**
  - Bên máy `User A`: Di chuột vào tin nhắn vừa gửi -> Bấm **`Thu hồi`**.
  - **Kết quả Real-time bên máy `User B`:** Nội dung tin nhắn (cả trong trang `/chat`, cửa sổ nổi `ChatPopup` và dòng preview hội thoại) lập tức biến thành ***"Tin nhắn đã bị thu hồi"*** mà không cần tải lại trang.
- [ ] **6. Test Real-time Sự kiện `message.updated` (Ghim / Bỏ ghim tin nhắn):**
  - Bên máy `User A`: Bấm **`Ghim`** 1 tin nhắn quan trọng -> Thanh ghim trên đầu khung chat và danh sách **`Xem tin nhắn đã ghim`** cập nhật ngay lập tức ở cả màn hình `User A` và `User B`. Bấm **`Bỏ ghim`** -> Biến mất tức thì ở cả 2 bên.
- [ ] **7. Test Real-time Sự kiện `conversation.nickname` (Đổi biệt danh 1-1):**
  - Trong hội thoại 1-1, `User A` mở panel phải (`ChatInfoPanel.vue`) bấm **`Chỉnh sửa biệt danh`** (hoặc trong menu `ChatPopup`) -> Đổi biệt danh cho `User B` -> Sự kiện `conversation.nickname` được đồng bộ qua WebSocket tức thì.
- [ ] **8. Các tính năng Quản lý Hội thoại & Chặn 2 chiều (`ChatConversationItem` & `ChatInfoPanel`):**
  - **Tìm kiếm cuộc trò chuyện & tìm tin nhắn trong hội thoại:** Thanh tìm kiếm hội thoại ở cột trái, `MainNavbarChat` và `ChatPopup` đều hỗ trợ gõ tiếng Việt không dấu; nút **`Tìm kiếm trong cuộc trò chuyện`** trên `ChatHeader` lọc các tin nhắn cũ.
  - **Menu dấu `⋯` trên từng hội thoại cột trái (`ChatConversationItem.vue`):** **`Ghim cuộc trò chuyện` / `Bỏ ghim`**, **`Tắt thông báo` / `Bật thông báo`**, và **`Xóa đoạn chat`**.
  - **Panel thông tin bên phải (`ChatInfoPanel.vue`):** **`Xem tin nhắn đã ghim`**, **`Chỉnh sửa biệt danh`**, **`File phương tiện và file`**, **`Tắt thông báo` / `Bật thông báo`**, **`Chặn người dùng` / `Bỏ chặn người dùng`**, **`Báo cáo`**, và **`Xóa cuộc trò chuyện`**. (Không có nút gọi thoại/video trên `ChatHeader`.)
  - **Chặn & Bỏ chặn 2 chiều trong Chat:** Khi `User A` chặn `User B` -> Khung nhập tin nhắn khóa lại và nếu cố gửi API `POST /api/chat/conversations/{id}/messages` sẽ bị Backend chặn **`403 Forbidden`**; bấm **`Bỏ chặn người dùng`** để nhắn tin trở lại.
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
  - Bên máy `User B`: Bấm vào biểu tượng **Chuông** trên Navbar (hoặc mở trang `/notifications` / tải lại trang) -> `uiStore.fetchNotifications()` tự động gọi `GET /api/notifications`, cập nhật số đếm badge đỏ trên chuông và hiển thị đầy đủ các thông báo vừa phát sinh.
- [ ] **Trang `/notifications` & Panel Chuông Navbar (`MainNavbarNotifications.vue`):**
  - Trên dropdown chuông Navbar: Hiển thị các thông báo gần nhất, nút **`Đánh dấu tất cả đã đọc`** và nút **`Xem tất cả thông báo`** (chuyển tới `/notifications`). (Nút xóa từng thông báo nằm ở trang `/notifications`, không có trong dropdown.)
  - Trên trang `/notifications` (`NotificationsView.vue`): Chuyển đổi bộ lọc **`Tất cả`** và **`Chưa đọc`**, bấm **`Đánh dấu tất cả đã đọc`** (`PATCH /api/notifications/read-all`) hoặc bấm nút **Xóa (`Trash2`)** trên từng thông báo (`DELETE /api/notifications/{id}`).
  - Bấm vào 1 thông báo -> Tự động đánh dấu đã đọc (`PATCH /api/notifications/{id}/read`), giảm số đếm chưa đọc và điều hướng chính xác tới bài viết (cuộn tới đúng `#comment-id` nếu là thông báo bình luận) hoặc hồ sơ người theo dõi.

---

## PHẦN 14: Quản Trị & Kiểm Duyệt Hệ Thống (`/admin/*`) — Ma Trận Phân Quyền 4 Cấp

### 14.1. Kiểm tra Chặn Truy cập Trái phép (`Guest`, `USER`, `MODERATOR`)
- [ ] **Khi là `Guest` (Chưa đăng nhập):**
  - Truy cập bất kỳ đường dẫn `/admin/*` -> Router chuyển hướng về `/login?redirect=/admin...`.
  - Gọi bất kỳ API `/api/admin/**` hoặc `/api/moderation/**` -> Trả về **`401 Unauthorized`**.
- [ ] **Khi là `USER` thường (`nguyenvanan@gmail.com`):**
  - Gõ trực tiếp `/admin` hoặc `/admin/moderation` trên thanh địa chỉ -> Router chặn và đẩy về `/`.
  - Gọi bất kỳ API `/api/admin/**`, `/api/moderation/**`, hoặc `POST/PUT/DELETE /api/categories` -> Backend trả về **`403 Forbidden`** chuẩn JSON (`errorCode: "FORBIDDEN"`).
- [ ] **Khi là `MODERATOR` (`phamminhduc@gmail.com`):**
  - Truy cập `/admin` -> Tự động điều hướng vào **`/admin/moderation`** (trang mặc định của Kiểm duyệt viên).
  - Thanh menu bên trái (`AdminSidebar.vue`) của Moderator **CHỈ hiển thị đúng 3 mục**: **`Bài viết (/admin/posts)`**, **`Kiểm duyệt (/admin/moderation)`**, và **`Nhóm (/admin/groups)`** (kèm nút **`Về trang chính`** ở đầu thanh bên).
  - Nếu Moderator cố tình gõ URL `/admin/users`, `/admin/categories`, `/admin/analytics`, hoặc `/admin/settings` -> Router tự động chặn và đẩy về `/admin/moderation`; gọi API `/api/admin/**` tương ứng bị Backend chặn **`403 Forbidden`**.

### 14.2. Kiểm tra 3 Phân hệ dùng chung cho `MODERATOR` & `ADMIN`
- [ ] **1. Quản lý Kiểm duyệt & Báo cáo (`/admin/moderation`):**
  - Lọc danh sách báo cáo vi phạm (`POST`, `COMMENT`, `USER`, `GROUP`) theo 4 nút: **`Tất cả`**, **`Đang chờ`**, **`Đã xử lý`**, **`Bỏ qua`**.
  - Trên từng thẻ báo cáo (`ModerationReportItem.vue`) kiểm tra 5 nút hành động: **`Xem nội dung`**, **`Giữ lại`**, **`Xóa nội dung`**, **`Cấm tài khoản` / `Cấm người đăng`**, và **`Bỏ qua`**.
  - Khi bấm **`Xóa nội dung`** đối với báo cáo bài viết -> bài chuyển sang `HIDDEN`, đồng thời xóa khỏi chỉ mục tìm kiếm `pgvector` và làm mới cache `Thịnh hành` ngay lập tức.
  - **Công cụ Phân tích Cảm xúc Trực tiếp (`ModerationSentimentWidget`):** Nhập thử 1 câu tiếng Việt bất kỳ vào hộp kiểm tra nhanh ở trang Kiểm duyệt -> Trả về nhãn cảm xúc (`Tích cực` / `Tiêu cực` / `Trung lập`) và điểm số ngay tại chỗ.
- [ ] **2. Quản lý Bài viết (`/admin/posts`):**
  - Tìm kiếm bài viết, lọc theo 4 trạng thái: **`Tất cả`**, **`Đã đăng`**, **`Nháp`**, **`Đã ẩn`**.
  - Kiểm tra các nút trên từng dòng (`PostsManageTable.vue`): **`Xem trước bài viết`**, **`Xem trên trang web`**, **`Ẩn bài viết` / `Mở lại (Hiện bài)`** (nút này ẩn đối với bài `Nháp`), và **`Xóa bài viết`**.
  - Bấm **`Ẩn bài viết`** trên bài đang xuất bản -> Bài chuyển sang `HIDDEN` và biến mất ngay khỏi Trang chủ, `/trending` và kết quả `/search` (cả semantic và keyword).
  - Bấm **`Mở lại (Hiện bài)`** trên bài đã ẩn -> Bài quay trở lại `PUBLISHED` và được lập chỉ mục tìm kiếm lại ngay.
- [ ] **3. Quản lý Hội nhóm (`/admin/groups`):**
  - Lọc theo quyền riêng tư (`Tất cả`, `Công khai`, `Riêng tư`), tìm kiếm nhóm (hỗ trợ không dấu tiếng Việt), bấm **`Xem chi tiết nhóm`** (Mod/Admin xem được cả nhóm riêng tư) và **`Giải tán nhóm`** đối với nhóm vi phạm.

### 14.3. Kiểm tra 5 Phân hệ Độc quyền của `ADMIN` (`admin@vietblog.com`)
- [ ] **4. Bảng điều khiển Tổng quan (`/admin` — `DashboardView.vue`, mục `Dashboard` trên `AdminSidebar`):**
  - Tiêu đề **`Dashboard Quản trị`**, xem các thẻ KPI tổng hợp (Tổng người dùng, Bài viết, Bình luận, Lượt xem, Báo cáo chờ xử lý), biểu đồ tăng trưởng, danh sách báo cáo mới nhất và hoạt động gần đây.
- [ ] **5. Quản lý Người dùng (`/admin/users` — `UsersView.vue`):**
  - Tìm kiếm người dùng (ô `"Tìm theo tên hoặc email..."`, hỗ trợ không dấu tiếng Việt) và lọc theo 4 nút vai trò: **`Tất cả`**, **`Admin`**, **`Mod`**, **`User`** (không có bộ lọc trạng thái riêng).
  - Trên từng dòng (`UsersTable.vue`): Thao tác **`Phân quyền`** (nâng `USER` <-> `MODERATOR`), **`Cấm` / `Gỡ cấm`**, và **`Xóa`**.
  - **Bảo vệ tài khoản Admin & chính mình:** Các tài khoản `ADMIN` và chính mình hiển thị **`Tài khoản được bảo vệ`** (không thể tự khóa, tự xóa hay hạ quyền); khi bị `Cấm`, tài khoản `USER` nhận `403` ngay khi đăng nhập hoặc gọi API.
- [ ] **6. Quản lý Danh mục & Thẻ Tag (`/admin/categories` — `CategoriesView.vue`, mục `Danh mục & Tag` trên sidebar):**
  - **Danh mục:** Bấm **`Thêm danh mục`** (nhập tên danh mục và mô tả, tự động sinh `slug`, không dùng emoji/icon), chỉnh sửa danh mục, xóa danh mục (tự động chặn xóa nếu danh mục đang chứa bài viết).
  - **Quản lý thẻ Tag phổ biến:** Xem danh sách thẻ đang hoạt động, **đổi tên tag** hoặc **xóa tag** -> Hệ thống tự động cập nhật lại vector tìm kiếm và xóa cache danh mục/thịnh hành cho các bài viết bị ảnh hưởng.
- [ ] **7. Thống kê (`/admin/analytics` — `AnalyticsView.vue`, mục `Thống kê` trên sidebar):**
  - Xem 2 biểu đồ cột **`Người dùng mới`** và **`Bài viết mới`**, thẻ **`Top danh mục`**, và bảng **`Hoạt động gần đây`**.
- [ ] **8. Cài đặt Hệ thống (`/admin/settings` — `SettingsView.vue`):**
  - Chỉnh sửa **`Tên website`**, **`Mô tả`**, bật/tắt tính năng (`Chat real-time (Redis + WebSocket)`, `Bài viết theo vị trí (PostGIS)`, `Tìm kiếm ngữ nghĩa (pgvector)`), **`Cho phép đăng ký`**, **`Yêu cầu xác thực email`**, **`Ngưỡng tự động ẩn bài (số report)`**, và **`Bật chế độ bảo trì`** -> Bấm **`Lưu cài đặt`**.
  - **Kiểm tra khóa Đăng ký thành viên mới (`allowRegistration`):** Tắt **`Cho phép đăng ký`** -> Bấm **`Lưu cài đặt`** -> Sang cửa sổ Ẩn danh (`Guest`) thử đăng ký tài khoản mới -> Backend chặn ngay với thông báo *"Hệ thống hiện đang tạm khóa chức năng đăng ký tài khoản mới"*. (Sau khi test xong, bật lại công tắc này về `true`.)

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
   - Trên cửa sổ Ẩn danh (`Guest`), mở 1 bài viết dài -> Bấm **`Xem tóm tắt`** trình diễn thuật toán `TextRank` (**`Đoạn văn liền mạch`** / **`Từng câu cốt lõi`**, **`Ngắn (3 câu)`** / **`Chi tiết (5 câu)`**).
   - Bấm thử `Bookmark` khi là Guest -> Trình diễn `AuthModal` bật lên, đăng nhập bằng tài khoản **`User`** (`nguyenvanan@gmail.com` / `Password123!`) để hoàn tất thao tác.
3. **Phút 5–6 (AI Phân tích Cảm xúc 4-Gram & Tìm kiếm Đa phương thức `TF-IDF` + `CBIR 51 chiều`):**
   - Viết bình luận có cấu trúc phủ định/chuyển ý tiếng Việt -> Chỉ rõ nhãn cảm xúc AI và thanh **`Cảm xúc AI`** (`% Tích cực / Trung lập / Tiêu cực`).
   - Chuyển sang `/search` (`Tìm kiếm AI: Bật`): Trình diễn tìm kiếm `"AI"`, tìm không dấu `"da lat"` / `"tri tue nhan tao"`, tab **`Chủ đề`** (`"AI"` chỉ khớp `#ai`, không khớp `#saigon`), tải 1 tấm ảnh qua nút **Camera** (**`CBIR 51 chiều`**), và tải 1 file `.pdf`/`.docx` để tìm bài viết liên quan.
4. **Phút 7–8 (Bản đồ Địa lý `PostGIS` & Chat Thời gian thực WebSocket):**
   - Mở `/map`, bấm **`Quanh HCMUNRE`**, kéo thanh bán kính `1–50 km` để lọc bài viết theo không gian.
   - Mở `/chat` (hoặc `ChatPopup`), gửi tin nhắn/hình ảnh real-time qua WebSocket xác thực bằng `HttpOnly Cookie`.
5. **Phút 9–10 (Phân quyền 3 Cấp `USER` / `MODERATOR` / `ADMIN`):**
   - Đăng nhập bằng tài khoản **`Moderator`** (`phamminhduc@gmail.com` / `Password123!`) -> Chỉ rõ giao diện giới hạn đúng 3 mục kiểm duyệt (`Bài viết`, `Kiểm duyệt`, `Nhóm`).
   - Đăng nhập bằng tài khoản **`Admin`** (`admin@vietblog.com` / `Password123!`) -> Mở `/admin` trình diễn toàn bộ 8 phân hệ quản trị, thống kê và công cụ kiểm tra cảm xúc NLP trực tiếp.
