# Kế Hoạch Triển Khai: Khối Tóm Tắt Bài Viết AI (TextRank + TF-IDF)

> **Mục tiêu**: Xây dựng component `PostAiSummary.vue` trên Frontend và tích hợp vào `PostDetailView.vue`, gọi API `GET /api/posts/{id}/summary` từ Spring Boot Backend.

## Nhiệm Vụ 1: Tạo Component `PostAiSummary.vue`
- **File**: `frontend/src/views/posts/components/PostAiSummary.vue`
- **Mô tả**:
  - Nhận props: `postId: string`, `contentLength?: number`
  - Quản lý state:
    - `isExpanded`: boolean (mặc định false)
    - `isLoading`: boolean (khi đang gọi API)
    - `sentencesCount`: ref<number>(3) (cho phép chọn 3 hoặc 5)
    - `summaryData`: ref<PostSummary | null>(null)
    - `copied`: ref<boolean>(false)
    - `errorMessage`: ref<string | null>(null)
  - Chức năng:
    - Nút bấm chính ban đầu: gradient tím/indigo với icon `Sparkles`, text "Tóm tắt bài viết bằng AI (TextRank)" và badge "Thuật toán TextRank + TF-IDF".
    - `loadSummary()`: gọi `searchApi.summary(postId, sentencesCount.value)`.
    - Selector số lượng câu: Nút `3 câu` và `5 câu`. Khi đổi số câu thì tự động gọi lại nếu đang mở.
    - Hiển thị danh sách các câu trích xuất trong khung viền gradient, có số thứ tự câu đẹp mắt.
    - Nút `Sao chép tóm tắt` với clipboard API và feedback "Đã sao chép!".
    - Nút `Thu gọn`.
    - Skeleton loader mượt mà khi đang tính toán trọng số câu TextRank.

## Nhiệm Vụ 2: Nhúng `PostAiSummary.vue` vào `PostDetailView.vue`
- **File**: `frontend/src/views/posts/PostDetailView.vue`
- **Mô tả**:
  - Import `PostAiSummary` từ `./components/PostAiSummary.vue`
  - Đặt component ngay phía trên vùng nội dung chính bài viết `<div class="prose ...">` và dưới phần `PostDetailHeader` / metadata.
  - Truyền `postId="post.id"`.

## Nhiệm Vụ 3: Kiểm Thử và Xác Minh (Verification)
- Chạy `npm run build` trong `frontend/` để đảm bảo không có lỗi TypeScript / template compile.
- Mở trình duyệt kiểm tra tại `http://localhost:5173/posts/101bbfc9-367c-4e7c-ac0a-bc93654cff98`.
- Bấm nút "✨ Tóm tắt bài viết bằng AI (TextRank)", kiểm tra giao diện hiển thị 3 câu tóm tắt.
- Chuyển sang 5 câu, kiểm tra cập nhật lại 5 câu.
- Bấm sao chép, kiểm tra thông báo sao chép.
