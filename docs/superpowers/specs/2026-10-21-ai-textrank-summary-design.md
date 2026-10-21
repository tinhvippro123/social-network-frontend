# Thiết Kế Chi Tiết: Khối Tóm Tắt Bài Viết Bằng AI (TextRank + TF-IDF)

## 1. Mục Tiêu & Cơ Sở Khoa Học
Bám sát đề cương đồ án chuyên ngành (Ths. Nguyễn Duy Tuấn duyệt):
> *"Xử lý ngôn ngữ tự nhiên (NLP) — Tóm tắt văn bản tự động — TextRank kết hợp TF-IDF: TextRank (dựa trên PageRank của Google) dùng để đánh giá trọng số câu, xây dựng đồ thị liên kết câu và chọn ra N câu quan trọng nhất. Kết hợp tạo thành chức năng: Tóm tắt bài viết tự động (Automated Text Summarization) — khi người dùng đọc bài viết dài, hệ thống tự trích xuất 3-5 câu quan trọng nhất làm bản tóm tắt."*

## 2. Kiến Trúc & Luồng Dữ Liệu
```
[User clicks '✨ Tóm tắt bài viết (TextRank)']
                     │
                     ▼
       PostAiSummary.vue (Component)
                     │
                     ▼
      searchApi.summary(postId, sentences) (API Client)
                     │  GET /api/posts/{postId}/summary?sentences=3
                     ▼
         SearchController.summary() (Spring Boot Backend)
                     │
                     ▼
   SearchApplicationService.summary() 
                     │
                     ▼
 TextAlgorithms.summarize(content, sentences) (Thuật toán tự cài đặt)
   - Tách câu (regex NFC)
   - Tính vector TF-IDF cho từng câu
   - Xây dựng ma trận tương đồng Cosine (đồ thị câu)
   - Chạy lặp PageRank (damping factor = 0.85, xử lý dangling nodes)
   - Chọn top N câu có rank cao nhất, sắp xếp lại theo thứ tự xuất hiện ban đầu
                     │
                     ▼
          JSON SummaryResponse
                     │
                     ▼
  Hiển thị Box Tóm tắt AI trên giao diện PostDetailView
```

## 3. Thiết Kế Giao Diện & Trải Nghiệm (UI/UX)
- **Vị trí**: Nằm ngay dưới phần Header/Author của bài viết, trước nội dung chính của [PostDetailView.vue](file:///d:/HCMUNRE/Senior/Semester_1/Specialized_Project/frontend/src/views/posts/PostDetailView.vue).
- **Trạng thái thu gọn ban đầu**:
  - Khối card hiện đại bo góc `rounded-2xl`, viền gradient nhẹ tím/indigo (`from-purple-500/10 via-indigo-500/10 to-transparent`).
  - Nút bấm chính: `✨ Tóm tắt bài viết bằng AI (TextRank)` kèm badge `Thuật toán TextRank + TF-IDF` thể hiện rõ bản chất NCKH.
- **Trạng thái đang tải (Loading)**:
  - Animation pulse nhẹ với skeleton 3 dòng chữ mô phỏng câu tóm tắt.
- **Trạng thái mở rộng (Expanded)**:
  - Hiển thị danh sách các câu tóm tắt trích xuất (được đánh số 1, 2, 3 hoặc bullet points sáng sủa, dễ đọc).
  - Tùy chọn số lượng câu: nút chuyển đổi `3 câu` (mặc định) và `5 câu`.
  - Nút tiện ích:
    - 📋 **Sao chép tóm tắt** (Copy to clipboard với Toast thông báo).
    - 🔼 **Thu gọn** (Collapse).
- **Trạng thái lỗi (Error handling)**:
  - Thông báo nhẹ nhàng kèm nút "Thử lại".
  - Nếu nội dung bài viết quá ngắn (< 3 câu), thông báo giải thích thuật toán cần bài viết dài hơn để trích xuất.

## 4. Tệp Cần Chỉnh Sửa / Tạo Mới
1. **Tạo mới**: `frontend/src/views/posts/components/PostAiSummary.vue` (Component tóm tắt chuyên biệt, tái sử dụng được).
2. **Cập nhật**: `frontend/src/views/posts/PostDetailView.vue` (Import và gắn component vào trước vùng nội dung bài viết).
3. **Cập nhật**: [usePostDetail.ts](file:///d:/HCMUNRE/Senior/Semester_1/Specialized_Project/frontend/src/composables/posts/usePostDetail.ts) (nếu cần quản lý state chung hoặc để component tự quản lý state gọn gàng).

## 5. Kịch Bản Kiểm Thử & Nghiệm Thu
- [ ] Mở bài viết dài trên giao diện chi tiết bài viết `http://localhost:5173/posts/{id}`.
- [ ] Bấm nút "✨ Tóm tắt bài viết bằng AI (TextRank)".
- [ ] Kiểm tra Network DevTools: gửi request `GET /api/posts/{id}/summary?sentences=3` thành công `200 OK`.
- [ ] Kiểm tra hiển thị: 3 câu tóm tắt xuất hiện mượt mà.
- [ ] Bấm chuyển sang `5 câu`: gửi request với `sentences=5` và hiển thị 5 câu.
- [ ] Bấm nút Sao chép: clipboard nhận đúng nội dung văn bản tóm tắt.
