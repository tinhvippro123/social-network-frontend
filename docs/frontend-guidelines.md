# Hướng Dẫn Kiến Trúc Frontend (Vue.js Component Architecture)

Tài liệu này ghi chú lại các quyết định thiết kế và quy tắc tổ chức mã nguồn Frontend, đặc biệt là cách phân chia và tái cấu trúc các Component trong dự án Vue.js.

## 1. Tổ chức thư mục Components
Dự án được chia thành hai loại components chính:

### a) Global & Shared Components (`src/components/`)
- **Mục đích:** Chứa các component mang tính **tái sử dụng cao**, có thể được import và gọi ở **nhiều trang (views) khác nhau** trong toàn bộ hệ thống.
- **Đặc điểm:** Thường là các UI chung (UI Kits), ít hoặc không chứa logic nghiệp vụ đặc thù của riêng một trang nào.
- **Ví dụ:**
  - `UserAvatar.vue`, `Skeleton.vue`: Dùng ở khắp mọi nơi.
  - `GroupCard.vue`, `CreateGroupModal.vue`, `CommentItem.vue`.

### b) Local Components (`src/views/[Tên_Trang]/components/`)
- **Mục đích:** Chứa các component **đặc thù, gắn chặt với logic của riêng trang đó** và gần như **không bao giờ được tái sử dụng ở một trang khác**.
- **Đặc điểm:** Việc tách các file này ra thuần túy là để "cắt nhỏ" một file View quá khổng lồ thành các khối dễ đọc, dễ bảo trì.
- **Ví dụ:**
  - `ChatMain.vue`, `ChatSidebar.vue`, `ChatMessageBubble.vue` (trong `views/chat/components/`).
  - `PostAuthorCard.vue` (trong `views/posts/components/`).

---

## 2. Tại sao phải tách Local Components dù không tái sử dụng?
Rất nhiều người mới lầm tưởng rằng Component sinh ra chỉ để "tái sử dụng". Tuy nhiên, trong dự án Enterprise, chúng ta vẫn kiên quyết tách các Local Component vì 4 lợi ích sống còn sau:

### Lợi ích 1: Dễ đọc và Dễ bảo trì (Readability & Maintainability)
- Khi một file View phình to (ví dụ `ChatView.vue` dài >900 dòng), việc tìm kiếm vị trí sinh ra lỗi là cực kỳ khó khăn.
- Tách file giúp file gốc trở thành một Layout "mục lục", đọc vào là hiểu ngay cấu trúc của trang:
```html
<template>
  <ChatSidebar />
  <ChatMain />
  <ChatInfoPanel />
</template>
```

### Lợi ích 2: Tối ưu Hiệu suất Render (Performance)
Trong Vue, ranh giới của một component cũng chính là ranh giới cập nhật DOM.
- Nếu gộp tất cả vào 1 file, khi một biến state nhỏ thay đổi (ví dụ gõ phím vào ô nhập tin nhắn), Vue sẽ phải đánh giá (re-evaluate) Virtual DOM của toàn bộ file khổng lồ đó.
- Bằng cách tách nhỏ, Vue **chỉ render lại duy nhất component có chứa state thay đổi**. Ứng dụng sẽ hoạt động mượt mà hơn đáng kể.

### Lợi ích 3: Tránh xung đột code (Git Merge Conflicts)
- Khi dự án có nhiều thành viên cùng làm việc trên 1 chức năng (Ví dụ: Dev A làm Sidebar, Dev B làm khung chat chính), việc code chung một file sẽ dẫn đến conflict liên tục.
- Tách nhỏ component cho phép nhiều người làm việc song song trên các tệp độc lập mà không bị dẫm chân lên nhau.

### Lợi ích 4: Tách biệt trách nhiệm (Separation of Concerns)
- Thay vì để một file gánh vác hàng chục biến reactivity (`ref`, `reactive`) và hàm (`functions`), chia nhỏ code giúp phân định rõ nhiệm vụ của từng phần.
- VD: `ChatSidebar` quản lý danh sách hội thoại, `ChatMain` quản lý luồng tin nhắn. Lỗi ở đâu thì khoanh vùng sửa đúng ở đó.

---
*Ghi chú này được tạo ra để đảm bảo tính đồng nhất trong quá trình phát triển Frontend mở rộng sau này của dự án.*
