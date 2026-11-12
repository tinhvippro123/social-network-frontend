# Kế Hoạch Triển Khai: Tìm Kiếm Đa Chế Độ AI (Omni-Search)

> **Mục tiêu**: Nâng cấp `SearchHeader.vue` và `SearchView.vue` để kết nối trực tiếp với Spring Boot Backend qua `useSearch.ts`, cho phép tìm kiếm từ khóa, ngữ nghĩa TF-IDF, hình ảnh (Computer Vision) và tài liệu văn bản.

---

## Nhiệm Vụ 1: Nâng Cấp `SearchHeader.vue` (Omni-Search Bar)
- **File**: `frontend/src/views/search/components/SearchHeader.vue`
- **Mô tả chi tiết**:
  - Nhận props:
    - `query: string`
    - `textMode: 'keyword' | 'semantic'`
    - `selectedFile: File | null`
    - `fileType: 'image' | 'document' | null`
    - `isSearching: boolean`
  - Emits:
    - `update:query(val: string)`
    - `update:textMode(mode: 'keyword' | 'semantic')`
    - `selectFile(file: File, type: 'image' | 'document')`
    - `removeFile()`
    - `search()`
  - Giao diện:
    - Input tìm kiếm với icon Search và nút X xóa nhanh.
    - Toggle button chuyển đổi giữa `🔤 Từ khóa` và `🧠 AI Ngữ nghĩa (TF-IDF)`.
    - Hidden file input cho ảnh (`image/*`) và tài liệu (`.pdf, .docx, .txt`).
    - Nút icon máy ảnh 📷 để mở chọn ảnh.
    - Nút icon tài liệu 📄 để mở chọn tài liệu.
    - Khung preview tệp đính kèm khi `selectedFile` có giá trị: thumbnail ảnh/icon file, tên file, kích cỡ và nút hủy `X`.

---

## Nhiệm Vụ 2: Nâng Cấp `SearchView.vue` Kết Nối `useSearch.ts`
- **File**: `frontend/src/views/search/SearchView.vue`
- **Mô tả chi tiết**:
  - Tích hợp composable `useSearch`:
    - `results`, `isSearching`, `searchType`, `error`
    - `searchByKeyword`, `searchSemantic`, `searchByImage`, `searchByDocument`, `clearSearch`
  - Quản lý state cho file đính kèm (`selectedFile`, `fileType`).
  - Hàm xử lý tìm kiếm `executeSearch()`:
    - Nếu có file đính kèm dạng `image`: gọi `searchByImage(selectedFile)`.
    - Nếu có file đính kèm dạng `document`: gọi `searchByDocument(selectedFile)`.
    - Nếu không có file: nếu `textMode === 'semantic'` gọi `searchSemantic(query)`, ngược lại gọi `searchByKeyword(query)`.
  - Hiển thị badge thuật toán AI tương ứng phía trên kết quả:
    - `Từ khóa`: "Thuật toán: Khớp từ khóa chuẩn"
    - `Ngữ nghĩa`: "Thuật toán: TF-IDF + Cosine Similarity (Vector Space Model)"
    - `Hình ảnh`: "Thuật toán: Computer Vision (Color Histogram + Sobel + GLCM)"
    - `Tài liệu`: "Thuật toán: Trích xuất văn bản + Semantic TF-IDF"
  - Render danh sách bài viết bằng `PostCard.vue` (hiển thị `results`).
  - Hiển thị Skeleton loaders khi `isSearching` là `true`.
  - Hiển thị trạng thái rỗng (Empty state) với gợi ý trực quan khi không tìm thấy kết quả.

---

## Nhiệm Vụ 3: Kiểm Thử & Xác Minh (Verification)
- Chạy `npm run build` trong `frontend/` để kiểm tra toàn bộ type và template compile.
- Mở trình duyệt đến `http://localhost:5173/search`.
- Kiểm tra tìm kiếm từ khóa với từ "hệ thống".
- Kiểm tra tìm kiếm ngữ nghĩa với câu "công nghệ đám mây và trí tuệ nhân tạo".
- Kiểm tra upload ảnh và tìm kiếm tương đồng.
- Kiểm tra upload file tài liệu và tìm kiếm tương đồng.
