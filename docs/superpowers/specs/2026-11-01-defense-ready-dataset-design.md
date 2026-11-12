# Design Specification: Defense-Ready Platform Dataset Curation

**Author:** VietBlog Engineering Team  
**Date:** 2026-11-01  
**Status:** Approved  
**Topic:** Cohesive Vietnamese Demonstration Dataset for Thesis Defense (HCMUNRE)  

---

## 1. Overview & Motivation

VietBlog được trình diễn trực tiếp trước Hội đồng chấm Đồ án Chuyên ngành (Khoa CNTT — Trường Đại học Tài nguyên và Môi trường TP.HCM - HCMUNRE). Qua rà soát `DatabaseSeeder` và `ExtendedDataSeeder` hiện tại, dữ liệu mẫu tồn tại 5 vấn đề lớn làm giảm tính thuyết phục khi báo cáo:

1. **Bài viết thiếu đồng bộ nội dung — hình ảnh:** Tồn tại 2 bài viết 1 câu sơ sài từ `DatabaseSeeder`, và cụm ảnh bàn làm việc / lập trình bị gắn cứng vào cuối tất cả 38 bài viết (kể cả bài Phở Hà Nội, Biển Mỹ Khê, Ẩm thực Cần Thơ) kèm câu văn mô tả tính năng (*"bấm vào ảnh hoặc ô +2..."*).
2. **Bình luận lệch chủ đề:** Các bình luận chuyên sâu về Clean Architecture & Docker bị chèn cố định vào các bài đầu tiên bất kể bài viết đó thuộc danh mục Ẩm thực hay Du lịch.
3. **Tin nhắn phá vỡ ngữ cảnh thực tế:** Lịch sử chat chứa các câu nhắc kịch bản bảo vệ (*"Mai demo nhớ bấm vào chỗ này khoe với hội đồng chấm điểm nha"*, *"nhớ mở bài viết về Clean Architecture để demo..."*).
4. **Bài đăng Nhóm cộng đồng trùng lặp:** Tất cả 8 nhóm đều dùng chung 2 bài đăng chào mừng / đồ án giống hệt nhau.
5. **Thông báo & Dữ liệu cũ tồn đọng trong PostgreSQL:** Thông báo cũ lẫn tiếng Anh, thiếu `avatar` và thiếu neo `#comment-{id}`; các điều kiện `if (count >= ...)` khiến việc sửa chuỗi trong code không làm sạch được dữ liệu bẩn đã lưu trong DB.

Thiết kế này xây dựng lại toàn bộ hệ thống nạp dữ liệu mẫu theo kiến trúc mô-đun có kiểm soát phiên bản (`seed.dataset.version = "defense-2026-v1"`), bảo toàn tài khoản đăng nhập của sinh viên/quản trị viên và tái tạo 100% nội dung chuẩn mực, tự nhiên trên mọi phân hệ.

---

## 2. Architecture & Module Structure

Thay vì nhồi hàng nghìn dòng dữ liệu vào một lớp duy nhất, hệ thống seed được tách thành các lớp độc lập, rõ trách nhiệm trong `com.vietblog.infrastructure.config`:

```
backend/src/main/java/com/vietblog/infrastructure/config/
├── DatabaseSeeder.java                      <-- Chỉ khởi tạo Categories chuẩn & đồng bộ bộ đếm cơ bản
├── ExtendedDataSeeder.java                  <-- Điều phối luồng làm mới theo version, gọi các catalog & đồng bộ toàn cục
└── seed/
    ├── SeedModels.java                      <-- Các Java record bất biến mô tả User, Post, CommentTree, Group, Chat, Report
    ├── TechAndEventPostsCatalog.java        <-- 9 bài viết chuyên sâu: Công nghệ (6) & Sự kiện (3) + bình luận đúng chủ đề
    ├── LifestyleTravelFoodPostsCatalog.java <-- 11 bài viết chuyên sâu: Du lịch (4), Ẩm thực (4), Đời sống (3) + gallery + bình luận
    └── CommunityAndSocialCatalog.java       <-- Hồ sơ thành viên, 8 Nhóm cộng đồng (bài đăng riêng biệt), Chat Nhóm/1-1, Báo cáo kiểm duyệt
```

### 2.1. Cơ chế làm mới an toàn & Idempotent (`seed.dataset.version`)
- Lưu khóa `seed.dataset.version` với giá trị `"defense-2026-v1"` trong bảng `system_settings` (`SystemSettingRepository`). Khóa này không nằm trong `SystemSettingsService.DEFAULTS` nên hoàn toàn trong suốt với giao diện Admin Settings.
- Khi khởi động ứng dụng:
  1. Luôn đảm bảo các tài khoản cốt lõi (`admin@vietblog.com`, `nguyenvanan@gmail.com`, `lethanhtinh2004@gmail.com`, `1250080199@sv.hcmunre.edu.vn`) tồn tại và giữ nguyên quyền hạn.
  2. Kiểm tra `system_settings` cho khóa `seed.dataset.version`:
     - **Nếu chưa khớp `"defense-2026-v1"`:** Thực thi quy trình `cleanContentTables()` trong `@Transactional`, nạp mới toàn bộ bài viết, bình luận, cảm xúc, bookmark, nhóm, tin nhắn, thông báo, báo cáo vi phạm, sau đó ghi `seed.dataset.version = "defense-2026-v1"`.
     - **Nếu đã khớp `"defense-2026-v1"`:** Bỏ qua bước xóa/tạo lại để bảo toàn mọi dữ liệu người dùng vừa tạo thêm trực tiếp khi chạy thử hoặc đang báo cáo trước Hội đồng; chỉ đồng bộ nhẹ các bộ đếm nếu cần.

### 2.2. Thứ tự xóa bảng an toàn khóa ngoại (`cleanContentTables`)
Thực hiện tuần tự từ bảng lá đến bảng gốc trước khi `flush()`:
1. `ChatBlockRepository.deleteAllInBatch()`
2. `ChatMessageRepository.deleteAllInBatch()`
3. `ConversationMemberRepository.deleteAllInBatch()`
4. `ConversationRepository.deleteAllInBatch()`
5. `GroupPostLikeRepository.deleteAllInBatch()`
6. `GroupPostCommentRepository.deleteAllInBatch()`
7. `GroupPostRepository.deleteAllInBatch()`
8. `GroupMemberRepository.deleteAllInBatch()`
9. `GroupRepository.deleteAllInBatch()`
10. `NotificationRepository.deleteAllInBatch()`
11. `ReportRepository.deleteAllInBatch()`
12. `ReactionRepository.deleteAllInBatch()`
13. `BookmarkRepository.deleteAllInBatch()`
14. `PostImageFeaturesRepository.deleteAllInBatch()`
15. `CommentRepository.deleteAll()` (đảm bảo xử lý quan hệ tự tham chiếu `parent_id` sạch sẽ)
16. `PostRepository.deleteAll()` (xóa kèm bảng phụ `@ElementCollection` `post_tags`)

---

## 3. Data Design Across Subsystems

### 3.1. Người dùng & Mạng lưới Follow (~16 tài khoản)
- **Tài khoản chính:**
  - `admin@vietblog.com` (`ADMIN`, mật khẩu `Password123!`) — Quản trị viên Hệ thống
  - `lethanhtinh2004@gmail.com` & `1250080199@sv.hcmunre.edu.vn` (nếu đã có trong DB thì giữ nguyên mật khẩu/hồ sơ và đảm bảo quyền `ADMIN`; nếu chưa có thì không ép mật khẩu lạ)
  - `nguyenvanan@gmail.com` (`USER`, mật khẩu `Password123!`) — Kỹ sư Fullstack, tài khoản người dùng chính khi demo
- **Thành viên chuyên môn (12+ tài khoản Việt Nam):** Đầy đủ ảnh chân dung Unsplash sắc nét (đã kiểm tra URL hợp lệ), vai trò đa dạng (`MODERATOR`, `USER`), tiểu sử chân thực (Senior Backend, Frontend Engineer, Data Scientist, DevOps, Product Designer, Travel Photographer, Food Reviewer, Sinh viên CNTT HCMUNRE).
- **Phân bổ thời gian & Follow:** Rải `joinedAt` trong khoảng 28 ngày gần nhất (có 2 thành viên tham gia hôm nay) để biểu đồ Tăng trưởng trên Admin Dashboard có đường cong tự nhiên; thiết lập mạng lưới `followers` / `following` chéo và đồng bộ `followersCount`, `followingCount`.

### 3.2. Danh mục & 20 Bài viết chuyên sâu
- **5 Danh mục chuẩn:** `Công nghệ` (`cong-nghe`), `Du lịch` (`du-lich`), `Ẩm thực` (`am-thuc`), `Đời sống` (`doi-song`), `Sự kiện` (`su-kien`).
- **Quy chuẩn nội dung cho từng bài viết (400–700 từ/bài):**
  - Cấu trúc HTML chuẩn học thuật / tạp chí: `<h2>`, `<h3>` (không đánh số `1.` ở tiêu đề để tránh cắt câu sai trong `TextAlgorithms.summarize`), `<p>` viết câu hoàn chỉnh kết thúc bằng dấu chấm, `<blockquote>`, `<ul><li>`, và `<pre><code>` cho bài kỹ thuật.
  - **Cụm ảnh Collage Gallery (`+N`) đúng ngữ cảnh đoạn văn:**
    - Các bài *Du lịch*, *Ẩm thực*, *Đời sống*, *Sự kiện* lồng ghép tự nhiên các thẻ `<p><img ... /><img ... />...</p>` gồm cụm 2 ảnh, 3 ảnh, 4 ảnh và 5–6 ảnh (hiển thị ô `+1`, `+2` qua `proseGallery.ts` và xem toàn màn hình qua `ImageLightboxModal.vue`).
    - Mỗi thẻ `<img>` đều có `alt` tiếng Việt mô tả đúng bức ảnh đó (ví dụ: đồi chè Cầu Đất sương sớm, phố đèn lồng Hội An bên sông Hoài, bát phở bò tái chín Hà Nội, không gian hội thảo công nghệ).
    - Các bài *Công nghệ* sử dụng ảnh sơ đồ/hạ tầng máy chủ/không gian lập trình vừa phải (1–3 ảnh hợp ngữ cảnh) kết hợp đoạn mã nguồn thực tế.
  - **Tọa độ địa lý (GPS) & Sự kiện:**
    - Gắn tọa độ thực tế tại TP.HCM (Khu vực HCMUNRE Lê Văn Sỹ, Quận 1, Thủ Đức), Hà Nội (Hoàn Kiếm, Cầu Giấy), Đà Nẵng (Cầu Rồng, Bán đảo Sơn Trà), Hội An, Đà Lạt (Cầu Đất), Huế, Cần Thơ (Bến Ninh Kiều / Cái Răng).
    - Các bài thuộc danh mục `Sự kiện` có đầy đủ `eventStartTime` và `eventEndTime` (sắp diễn ra trong 3–14 ngày tới).
  - **Thống kê & Điểm xu hướng:** Rải `createdAt` từ 25 ngày trước đến hôm nay (có 2 bài đăng hôm nay), thiết lập `viewsCount`, `upvotesCount`, `downvotesCount` hợp lý và gọi `PostDomainService.calculateTrendingScore(post)`.

### 3.3. Bình luận đa nhánh (3 cấp) & Phân tích cảm xúc AI
- Mỗi bài viết có từ 4–10 bình luận thuộc đúng chủ đề bài viết đó, trong đó ít nhất 8 bài nổi bật có cây bình luận 3 tầng (`Level 1 -> Level 2 -> Level 3`) để trình diễn luồng trả lời lồng nhau.
- Từ vựng bình luận được biên tập tự nhiên để `TextAlgorithms.sentiment` (Lexicon-v1 có xử lý phủ định tiếng Việt) phân loại ra tỷ lệ hợp lý (~65% `positive`, ~20% `neutral`, ~15% `negative` mang tính góp ý văn minh như *"chỗ gửi xe khá chật và chưa sạch"*, *"cấu hình mặc định chạy chưa mượt khi tải lớn"*).

### 3.4. Tương tác (Reactions, Bookmarks), Thông báo & Báo cáo Kiểm duyệt
- **Reactions & Bookmarks:** Tạo sẵn các cảm xúc (`👍`, `❤️`, `😮`, `😂`) từ nhiều thành viên và lưu sẵn 5 bài viết tiêu biểu vào danh sách Đã lưu (`Bookmarks`) của `nguyenvanan@gmail.com` & `admin@vietblog.com`.
- **Notifications:** Sinh thông báo 100% tiếng Việt tự nhiên (`"{Tên} đã bình luận về bài viết của bạn"`, `"{Tên} đã trả lời bình luận của bạn"`, `"{Tên} đã bày tỏ cảm xúc về bài viết của bạn"`, `"{Tên} đã bắt đầu theo dõi bạn"`), kèm `avatar` hợp lệ và `link` chính xác `/posts/{postId}#comment-{commentId}` cho các tài khoản chính (cả trạng thái chưa đọc và đã đọc).
- **Moderation Reports:** Tạo 6 báo cáo vi phạm (`Report`) gồm 3 `PENDING` (để thao tác Duyệt / Bỏ qua trực tiếp trước Hội đồng), 2 `RESOLVED`, 1 `DISMISSED` với lý do hợp lý (bình luận chèn link quảng cáo, bài đăng sai chuyên mục, ngôn từ thiếu kiềm chế).

### 3.5. Nhóm cộng đồng (8 nhóm) & Nhắn tin Real-time
- **8 Nhóm cộng đồng:** Mỗi nhóm có 3 bài thảo luận (`GroupPost`) viết riêng theo đúng chuyên đề của nhóm đó (Fullstack, Spring Boot, Vue/Frontend, AI & NLP, CLB CNTT HCMUNRE, DevOps, Góc Cà phê, UI/UX Design), kèm bình luận (`GroupPostComment`) và lượt thích (`GroupPostLike`) thực tế. Các tài khoản chính là thành viên / quản trị viên của các nhóm này.
- **Nhắn tin (`Conversation` & `ChatMessage`):**
  - 4 nhóm chat sôi nổi (*CLB Công nghệ Thông tin HCMUNRE*, *Cộng đồng Backend & System Design*, *Hội Đam mê Nhiếp ảnh & Xê dịch*, *Góc Frontend & UI/UX Việt Nam*) và 8 cuộc trò chuyện 1-1 giữa các tài khoản chính với các thành viên.
  - Nội dung 100% tự nhiên như đời thực (thảo luận tối ưu truy vấn PostgreSQL, review giao diện Dark Mode, chia sẻ lịch trình săn mây Đà Lạt, hẹn lịch sinh hoạt học thuật CLB CNTT cuối tuần), tuyệt đối không chứa câu từ nhắc kịch bản báo cáo hay chấm điểm.

---

## 4. Verification Criteria

1. `./gradlew compileJava` và `./gradlew test` chạy thành công không lỗi.
2. Khởi động lại Backend trên PostgreSQL hiện tại: quy trình xóa & nạp mới hoàn tất không gặp lỗi khóa ngoại (`DataIntegrityViolationException`), khóa `seed.dataset.version = "defense-2026-v1"` được lưu thành công.
3. Kiểm tra thực tế qua API / DB:
   - 20 bài viết có nội dung dài, chuẩn HTML, gallery ảnh `+N` khớp 100% chủ đề đoạn văn, tóm tắt AI TextRank trả về câu văn trọn nghĩa.
   - Không còn bất kỳ thông báo tiếng Anh, bài viết 1 câu, bài đăng nhóm nhân bản hay tin nhắn nhắc demo nào.
   - Dashboard Admin hiển thị biểu đồ tăng trưởng 7/30 ngày mượt mà, thống kê cảm xúc đủ 3 nhóm và hàng đợi kiểm duyệt sẵn sàng thao tác.

