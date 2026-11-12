# Design Specification: Post Image Lightbox Gallery

**Author:** VietBlog Engineering Team  
**Date:** 2026-10-28  
**Status:** Approved  
**Topic:** Post Image Lightbox & Gallery Viewer  

---

## 1. Overview & Motivation

VietBlog là nền tảng chia sẻ kiến thức công nghệ, đời sống và đồ án chuyên ngành theo phong cách bài viết học thuật / blog chuyên nghiệp (tương tự Medium, Viblo, Dev.to). Hiện tại, mỗi bài viết bao gồm một ảnh bìa (`coverImage`) và các ảnh minh họa chèn trong nội dung HTML (`post.content`).

Tuy nhiên, người đọc chưa có cách nào để phóng to xem chi tiết các hình ảnh biểu đồ, sơ đồ kiến trúc hệ thống, hoặc ảnh chụp phong cảnh / du lịch với độ phân giải cao.

Mục tiêu của thiết kế này là mang lại trải nghiệm xem ảnh hiện đại, trang nhã:
1. Giữ nguyên bố cục bài viết đọc tập trung theo chuẩn Blog.
2. Thêm tính năng **Lightbox Gallery Viewer** toàn màn hình: Click vào ảnh bìa hoặc bất kỳ ảnh minh họa nào trong nội dung bài viết sẽ mở modal phóng to, hỗ trợ duyệt album ảnh liên tục (Next / Prev), thumbnail preview, phím tắt điều hướng và tải ảnh về máy.

---

## 2. User Experience & Interactions

### 2.1. Nhận diện trực quan trên bài viết (`PostDetailView.vue`)
- **Ảnh bìa (`coverImage`)**: Có con trỏ `cursor-zoom-in` kèm badge/icon kính lúp nhỏ ở góc để biểu thị có thể xem toàn màn hình.
- **Ảnh minh họa trong bài viết (`.prose img`)**:
  - Tự động gán lớp CSS `cursor-zoom-in rounded-xl transition-transform hover:opacity-95 hover:shadow-lg`.
  - Khi click vào bất kỳ ảnh nào, hệ thống xác định vị trí của ảnh đó trong danh sách toàn bộ ảnh của bài viết và mở Lightbox tại đúng ảnh đó.

### 2.2. Modal Lightbox (`ImageLightboxModal.vue`)
- **Nền mờ cao cấp**: Nền tối `bg-black/90 backdrop-blur-md` tràn toàn màn hình (`fixed inset-0 z-50`).
- **Khung hiển thị ảnh trung tâm**:
  - Tự động scale vừa vặn khung nhìn (`max-w-[90vw] max-h-[80vh] object-contain`).
  - Hỗ trợ chế độ xem phóng to 1:1 (Toggle zoom) để xem từng chi tiết nhỏ của sơ đồ kiến trúc.
- **Duyệt album (Navigation)**:
  - Nút mũi tên Trái / Phải (`ChevronLeft`, `ChevronRight`) hai bên màn hình, hiển thị khi album có từ 2 ảnh trở lên.
  - Bộ đếm ảnh góc trên bên trái: `Ảnh X / Y`.
  - Phím tắt (Keyboard shortcuts):
    - `ArrowLeft`: Ảnh trước.
    - `ArrowRight`: Ảnh kế tiếp.
    - `Escape`: Đóng Lightbox.
- **Thanh công cụ góc trên bên phải**:
  - Nút phóng to / thu nhỏ (`ZoomIn` / `ZoomOut`).
  - Nút tải ảnh xuống máy (`Download`).
  - Nút đóng (`X`).
- **Dải ảnh thu nhỏ (Thumbnail Strip)** ở mép dưới:
  - Hiển thị danh sách thumbnail nhỏ của tất cả ảnh trong bài viết.
  - Ảnh đang chọn được đánh dấu viền sáng màu `primary-500` và phóng lớn nhẹ.
  - Click vào thumbnail bất kỳ sẽ chuyển ngay đến ảnh đó.
- **Thoát modal**: Click ra ngoài vùng ảnh hoặc bấm nút Đóng/phím `Esc`.

---

## 3. Architecture & Components

```
frontend/src/
├── components/
│   └── ui/
│       └── ImageLightboxModal.vue   <-- Component Modal Lightbox độc lập, tái sử dụng cao
└── views/
    └── posts/
        ├── PostDetailView.vue       <-- Quét ảnh trong .prose, quản lý state và gắn Lightbox
        └── components/
            └── PostDetailHeader.vue <-- Tích hợp click phóng to cho coverImage
```

### 3.1. Component `ImageLightboxModal.vue`
**Props**:
- `show: boolean`: Trạng thái mở/đóng modal.
- `images: Array<{ src: string; alt?: string; title?: string }>`: Danh sách các ảnh trong bài viết.
- `initialIndex: number`: Chỉ số ảnh được click ban đầu (mặc định: `0`).

**Emits**:
- `(e: 'close'): void`: Sự kiện đóng modal.
- `(e: 'change-index', index: number): void`: Sự kiện đổi ảnh.

**Logic & Lifecycle**:
- Lắng nghe sự kiện `keydown` toàn cục (`ArrowLeft`, `ArrowRight`, `Escape`).
- Khóa cuộn trang `document.body.style.overflow = 'hidden'` khi modal mở, khôi phục khi đóng.

### 3.2. Quét & Thu thập ảnh tại `PostDetailView.vue`
- Khi bài viết tải xong (`post.content` được render vào DOM):
  - Thu thập `post.coverImage` (nếu có).
  - Sử dụng `document.querySelectorAll('.prose img')` để lấy tất cả `src` và `alt` của các ảnh trong nội dung bài viết.
  - Sử dụng Event Delegation trên container `.prose` để bắt sự kiện click thẻ `<img>` một cách hiệu quả và tự nhiên (không cần chỉnh sửa chuỗi HTML thô từ backend).
  - Mở `ImageLightboxModal` với index tương ứng.

---

## 4. Backend & Database Impact

- **Database**: Không thay đổi schema, không thêm bảng hoặc cột mới. 
- **Backend API**: Sử dụng dữ liệu hiện có (`coverImage` và `content`). Hoàn toàn tương thích ngược 100%.

---

## 5. Non-Functional Requirements

- **Performance**: Không làm tăng kích thước bundle đáng kể (chỉ sử dụng Vue 3 Transition và Lucide icons có sẵn).
- **Responsive**: Giao diện co giãn mượt mà từ màn hình Mobile nhỏ đến màn hình 4K Desktop. Trên mobile, các nút bấm có kích thước tối thiểu 44x44px dễ chạm.
- **Accessibility**: Hỗ trợ phím tắt, aria-labels cho các nút chức năng.
