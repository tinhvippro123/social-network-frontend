# ĐỀ CƯƠNG ĐỒ ÁN CHUYÊN NGÀNH

---

**TRƯỜNG ĐẠI HỌC TÀI NGUYÊN VÀ MÔI TRƯỜNG TP.HCM**
**KHOA: CÔNG NGHỆ THÔNG TIN**

---

**Tên đề tài:** XÂY DỰNG WEB APP QUẢN LÝ BÀI VIẾT TÍCH HỢP AI

**Chuyên ngành:** Công nghệ Phần mềm

| Thông tin | Nội dung |
|---|---|
| Giảng viên hướng dẫn | ThS. Nguyễn Duy Tuấn |
| Sinh viên thực hiện | Lê Thanh Tính |
| Mã số sinh viên | 1250080199 |
| Lớp | 12_ĐH-CNPM3 |
| Khóa | 12 |

**TP. Hồ Chí Minh, tháng 9 năm 2026**

---

## MỞ ĐẦU

### 1. Cơ sở khoa học và tính thực tiễn của đề tài

#### 1.1 Tính thực tiễn
- **Nghiên cứu và tự phát triển** các giải thuật cốt lõi phục vụ hệ thống (tất cả đều tự viết, không dùng thư viện AI/ML có sẵn):
  - Giải thuật **xếp hạng bài viết xu hướng** (Trending Ranking) dựa trên nghiên cứu từ Reddit Hot và Hacker News.
  - Giải thuật **tìm kiếm ngữ nghĩa** (Semantic Search): Nhúng (embed) tiêu đề và nội dung bài viết thành vector bằng TF-IDF tự cài đặt, tìm kiếm tương đồng vector (Cosine Similarity) trực tiếp trên pgvector/PostgreSQL.
  - Giải thuật **tìm kiếm theo hình ảnh và tài liệu** (Image & Document Search): Phân rã hình ảnh thành vector đặc trưng (Color Histogram + Sobel + GLCM), trích xuất văn bản từ tài liệu (PDF/DOCX) rồi vector hóa bằng TF-IDF, lưu vào database để hỗ trợ tìm kiếm.
  - Giải thuật **bản đồ hóa bài viết và tìm kiếm xung quanh** (Location-based Posts): Đính kèm tọa độ địa lý vào bài viết, sử dụng PostGIS để truy vấn không gian (tìm bài viết trong bán kính N km), hiển thị trên bản đồ tương tác Leaflet.
- **Thiết kế và xây dựng** một ứng dụng web hoàn chỉnh theo mô hình Client-Server, áp dụng kiến trúc Clean Architecture, với đầy đủ các nghiệp vụ: quản lý bài viết, hệ thống bình luận, nhóm cộng đồng, chat thời gian thực, trang quản trị Admin, và quản lý người dùng.
- **Đảm bảo chất lượng mã nguồn** bằng cách áp dụng các nguyên lý thiết kế phần mềm: Single Responsibility, Separation of Concerns, DRY (Don't Repeat Yourself) và Type Safety.

---

### 3. Đối tượng và phạm vi nghiên cứu

#### 3.1 Đối tượng nghiên cứu

**Ngôn ngữ lập trình và framework:**

| Tầng | Công nghệ | Phiên bản | Vai trò |
|---|---|---|---|
| Frontend | TypeScript, Vue.js 3 | Vue 3.5, TS 6.0 | Xây dựng giao diện SPA |
| Styling | Tailwind CSS | 4.3 | Hệ thống Design System |
| State | Pinia | 4.0 | Quản lý trạng thái ứng dụng |
| Validation | VeeValidate + Zod | 4.15 / 4.5 | Xác thực form |
| Rich Editor | TipTap | 3.30 | Soạn thảo bài viết |
| Chart | Chart.js + vue-chartjs | 4.5 / 5.3 | Biểu đồ thống kê Admin |
| Map | Leaflet | 1.9 | Hiển thị bản đồ |
| Backend | Java, Spring Boot 3 | Java 21, SB 3.x | REST API + WebSocket |
| Database | PostgreSQL | 16+ | Lưu trữ dữ liệu chính |
| Extension | PostGIS, pgvector | — | GIS + Vector Search |
| Cache | Redis | 7+ | Cache + Pub/Sub Chat |

**Công cụ phát triển:**

- **IDE**: Visual Studio Code, IntelliJ IDEA
- **Build Tool**: Vite (Frontend), Maven/Gradle (Backend)
- **Version Control**: Git, GitHub
- **API Testing**: Postman
- **Database Client**: pgAdmin, DBeaver

#### 3.2 Phạm vi nghiên cứu

**Các kỹ năng nghiệp vụ:**

- Quản lý nội dung bài viết (CRUD, danh mục, thẻ tag)
- Hệ thống bình luận lồng nhau (Threaded Comments)
- Hệ thống bình chọn (Upvote/Downvote)
- Lưu bài viết (Bookmark)
- Tìm kiếm đa chế độ: Keyword, Semantic (ngữ nghĩa), Image (hình ảnh), Document (tài liệu), Geospatial (vị trí) — ứng dụng giải thuật tự viết
- Chat thời gian thực (1-1, nhóm) qua WebSocket
- Quản lý nhóm cộng đồng
- Tóm tắt bài viết tự động (Automated Text Summarization) - ứng dụng giải thuật tự viết
- Phân tích cảm xúc bình luận (Sentiment Analysis) - ứng dụng giải thuật tự viết
- Hệ thống thông báo
- Quản trị hệ thống (Dashboard, kiểm duyệt nội dung, quản lý người dùng)
- Xác thực và phân quyền (JWT, Role-based Access Control)

**Loại phần mềm cần phát triển:**
Ứng dụng web (Web Application) dạng Single Page Application (SPA), giao tiếp với Backend qua REST API và WebSocket.

---

### 4. Phương pháp nghiên cứu

#### 4.1 Phương pháp nghiên cứu lý thuyết

- **Phân tích tài liệu**: Nghiên cứu tài liệu chính thức (official documentation) của Vue.js 3, Spring Boot 3, PostgreSQL, PostGIS và pgvector để nắm vững kiến trúc và best practices.
- **Nghiên cứu giải thuật**: Tìm hiểu và phân tích các công thức xếp hạng xu hướng từ Reddit (Hot Ranking), Hacker News (Gravity-based Decay) và Wilson Score Interval. Từ đó, tự phát triển công thức Trending Ranking phù hợp cho VietBlog.
- **Nghiên cứu AI/NLP**: Tìm hiểu lý thuyết TF-IDF, mô hình không gian vector (Vector Space Model), và độ tương đồng Cosine để áp dụng vào tìm kiếm ngữ nghĩa. Nghiên cứu các phương pháp trích xuất đặc trưng hình ảnh (Color Histogram, Sobel Operator, GLCM) để áp dụng vào tìm kiếm bằng hình ảnh.
- **Nghiên cứu kiến trúc phần mềm**: Tìm hiểu mô hình Clean Architecture (Robert C. Martin), Composition API Pattern (Vue.js), và State Management Pattern (Pinia) để áp dụng vào thiết kế hệ thống.

#### 4.2 Phương pháp thực nghiệm

- **Phát triển theo mô hình Agile**: Chia dự án thành các sprint ngắn (1-2 tuần), mỗi sprint hoàn thành một nhóm tính năng cụ thể.
- **Kiến trúc phân tầng**: Áp dụng Clean Architecture để phân tách rõ ràng tầng Presentation (Vue Components), Business Logic (Composables / Use Cases), Data Access (API Layer / Repository) và Infrastructure (Database, Cache, WebSocket).
- **Thiết kế giao diện theo hướng Component-based**: Xây dựng Design System với các Design Tokens (màu sắc, typography, spacing) và tái sử dụng component xuyên suốt ứng dụng.
- **Mock API → Real API**: Giai đoạn đầu phát triển Frontend với Mock API để đảm bảo giao diện hoạt động đúng, sau đó kết nối dần sang Backend thật.

---

### 5. Thời gian thực hiện

**Từ ngày 24/08/2026 đến ngày 04/12/2026** (khoảng 15 tuần)

| Thời gian | Nội dung | Địa điểm thực hiện |
|---|---|---|
| Tuần 1 (24/08 - 30/08) | Phân tích yêu cầu hệ thống, viết đề cương chi tiết, thiết kế kiến trúc tổng quan (Clean Architecture) | Trường ĐH Tài Nguyên Và Môi Trường TP. Hồ Chí Minh |
| Tuần 2 (31/08 - 06/09) | Thiết kế cơ sở dữ liệu (ERD), thiết kế API endpoints, dựng khung dự án Frontend (Vue 3 + Vite + Pinia) | Trường ĐH Tài Nguyên Và Môi Trường TP. Hồ Chí Minh |
| Tuần 3 (07/09 - 13/09) | Dựng khung Backend (Spring Boot 3), cấu hình PostgreSQL + PostGIS + pgvector, cấu hình Redis | Trường ĐH Tài Nguyên Và Môi Trường TP. Hồ Chí Minh |
| Tuần 4 (14/09 - 20/09) | Xây dựng hệ thống xác thực (Login/Register/JWT/RBAC), Layout System, Design System | Trường ĐH Tài Nguyên Và Môi Trường TP. Hồ Chí Minh |
| Tuần 5 (21/09 - 27/09) | Module Bài viết: CRUD bài viết, quản lý danh mục, hệ thống thẻ tag | Trường ĐH Tài Nguyên Và Môi Trường TP. Hồ Chí Minh |
| Tuần 6 (28/09 - 04/10) | Hệ thống bình luận lồng nhau (Threaded Comments), Upvote/Downvote, Bookmark | Trường ĐH Tài Nguyên Và Môi Trường TP. Hồ Chí Minh |
| Tuần 7 (05/10 - 11/10) | Cài đặt giải thuật Trending Ranking (Reddit Hot + Hacker News tự phát triển), trang Bài viết thịnh hành | Trường ĐH Tài Nguyên Và Môi Trường TP. Hồ Chí Minh |
| Tuần 8 (12/10 - 18/10) | Cài đặt giải thuật Semantic Search (TF-IDF + Cosine Similarity tự viết + pgvector) | Trường ĐH Tài Nguyên Và Môi Trường TP. Hồ Chí Minh |
| Tuần 9 (19/10 - 25/10) | Cài đặt giải thuật Image & Document Search (Color Histogram + Sobel + GLCM tự viết → vector → pgvector) | Trường ĐH Tài Nguyên Và Môi Trường TP. Hồ Chí Minh |
| Tuần 10 (26/10 - 01/11) | Cài đặt giải thuật Geospatial Search (Haversine tự viết + PostGIS + Leaflet), tích hợp bản đồ tương tác | Trường ĐH Tài Nguyên Và Môi Trường TP. Hồ Chí Minh |
| Tuần 11 (02/11 - 08/11) | Cài đặt giải thuật Text Summarization (TF-IDF + TextRank tự viết) và Sentiment Analysis (Lexicon-based + Word Embeddings) | Trường ĐH Tài Nguyên Và Môi Trường TP. Hồ Chí Minh |
| Tuần 12 (09/11 - 15/11) | Module Chat real-time (WebSocket + Redis Pub/Sub), Nhóm cộng đồng, Hệ thống thông báo | Trường ĐH Tài Nguyên Và Môi Trường TP. Hồ Chí Minh |
| Tuần 13 (16/11 - 22/11) | Trang Quản trị Admin: Dashboard thống kê, kiểm duyệt nội dung, quản lý người dùng | Trường ĐH Tài Nguyên Và Môi Trường TP. Hồ Chí Minh |
| Tuần 14 (23/11 - 29/11) | Kiểm thử tích hợp, tối ưu hiệu năng, sửa lỗi, hoàn thiện giao diện UI/UX | Trường ĐH Tài Nguyên Và Môi Trường TP. Hồ Chí Minh |
| Tuần 15 (30/11 - 04/12) | Viết báo cáo đồ án, hoàn thiện tài liệu, chuẩn bị bảo vệ trước hội đồng | Trường ĐH Tài Nguyên Và Môi Trường TP. Hồ Chí Minh |

---


### LỜI MỞ ĐẦU

Giới thiệu bối cảnh, lý do chọn đề tài, mục tiêu và phạm vi của đồ án.

### Chương 1. TỔNG QUAN TÀI LIỆU

- 1.1 Tổng quan về các nền tảng chia sẻ nội dung hiện có (Medium, Reddit, Stack Overflow)
- 1.2 Kiến trúc phần mềm Clean Architecture
- 1.3 Tổng quan về Vue.js 3 và Composition API
- 1.4 Tổng quan về Spring Boot 3 và REST API
- 1.5 Hệ quản trị cơ sở dữ liệu PostgreSQL
  - 1.5.1 PostGIS — Extension hỗ trợ dữ liệu không gian
  - 1.5.2 pgvector — Extension hỗ trợ vector embedding
- 1.6 Giao thức WebSocket và ứng dụng trong chat thời gian thực
- 1.7 Redis và mô hình Pub/Sub
- 1.8 Các giải thuật xếp hạng xu hướng (Reddit Hot, Hacker News, Wilson Score)
- 1.9 Cơ sở lý thuyết Trí tuệ nhân tạo ứng dụng
  - 1.9.1 Xử lý ngôn ngữ tự nhiên (NLP): TF-IDF và Vector Space Model
  - 1.9.2 Độ tương đồng Cosine (Cosine Similarity)
  - 1.9.3 Tóm tắt văn bản tự động (TextRank, Extractive Summarization)
  - 1.9.4 Phân tích cảm xúc (Sentiment Analysis)
  - 1.9.5 Thị giác máy tính (Computer Vision): Color Histogram, Sobel Edge Detection, GLCM

### Chương 2. PHƯƠNG PHÁP THỰC HIỆN

- 2.1 Phân tích yêu cầu hệ thống
  - 2.1.1 Yêu cầu chức năng
  - 2.1.2 Yêu cầu phi chức năng
- 2.2 Thiết kế kiến trúc hệ thống
  - 2.2.1 Kiến trúc tổng quan Client-Server
  - 2.2.2 Kiến trúc Frontend (Layout System, State Management, Service Layer)
  - 2.2.3 Kiến trúc Backend (Clean Architecture 4 tầng)
- 2.3 Thiết kế cơ sở dữ liệu
  - 2.3.1 Sơ đồ ERD
  - 2.3.2 Mô tả chi tiết các bảng dữ liệu
- 2.4 Thiết kế giải thuật
  - 2.4.1 Giải thuật xếp hạng xu hướng (Trending Ranking)
  - 2.4.2 Giải thuật tìm kiếm ngữ nghĩa (Semantic Search với TF-IDF + Cosine Similarity tự viết)
  - 2.4.3 Giải thuật tìm kiếm hình ảnh và tài liệu (Image & Document Search tự viết)
    - 2.4.3.1 Hình ảnh: Color Histogram (HSV) + Edge Detection (Sobel) + Texture (GLCM)
    - 2.4.3.2 Tài liệu: Text Extraction (PDF/DOCX) -> TF-IDF vector
  - 2.4.4 Giải thuật bản đồ hóa và tìm kiếm xung quanh (Geospatial Search với Haversine + PostGIS)
  - 2.4.5 Giải thuật Tóm tắt văn bản tự động (Automated Text Summarization bằng TF-IDF và TextRank)
  - 2.4.6 Giải thuật Phân tích cảm xúc bình luận (Sentiment Analysis bằng Word Embeddings)
- 2.5 Thiết kế API (REST Endpoints + WebSocket)
- 2.6 Thiết kế giao diện người dùng (UI/UX)

### Chương 3. CÀI ĐẶT THỰC NGHIỆM

- 3.1 Môi trường phát triển và công cụ sử dụng
- 3.2 Cài đặt Frontend
  - 3.2.1 Cấu trúc thư mục và Design System
  - 3.2.2 Hệ thống Layout và Routing
  - 3.2.3 State Management với Pinia
  - 3.2.4 Tích hợp soạn thảo bài viết (TipTap Editor)
  - 3.2.5 Tích hợp bản đồ (Leaflet + PostGIS)
  - 3.2.6 Tích hợp biểu đồ thống kê (Chart.js)
- 3.3 Cài đặt Backend
  - 3.3.1 Cấu hình Spring Boot và Security (JWT)
  - 3.3.2 Cài đặt các Use Case nghiệp vụ
  - 3.3.3 Cài đặt WebSocket cho Chat
  - 3.3.4 Cài đặt Redis Cache và Pub/Sub
- 3.4 Cài đặt giải thuật (tự viết, không dùng thư viện AI có sẵn)
  - 3.4.1 Cài đặt Trending Ranking (Reddit Hot + Hacker News tự phát triển)
  - 3.4.2 Cài đặt Semantic Search (TF-IDF + Cosine Similarity tự viết + pgvector)
  - 3.4.3 Cài đặt Image & Document Search
    - 3.4.3.1 Hình ảnh: Color Histogram + Sobel + GLCM tự viết -> vector -> pgvector
    - 3.4.3.2 Tài liệu: Text Extraction (PDF/DOCX) -> TF-IDF -> pgvector
  - 3.4.4 Cài đặt Geospatial Search (Haversine tự viết + PostGIS + Leaflet)
  - 3.4.5 Cài đặt Text Summarization (Trích xuất đặc trưng câu tự viết)
  - 3.4.6 Cài đặt Sentiment Analysis (Phân loại cảm xúc bình luận)
- 3.5 Kết quả chạy thử nghiệm và ảnh chụp màn hình

### KẾT LUẬN

- Tổng kết kết quả đạt được
- Ưu điểm và hạn chế
- Hướng phát triển trong tương lai

---

## TÀI LIỆU THAM KHẢO

[1] Robert C. Martin (2017), *Clean Architecture: A Craftsman's Guide to Software Structure and Design*, Prentice Hall.
[2] Evan You (2020), *Vue.js 3 - Composition API RFC*, https://vuejs.org/guide/introduction.html
[3] PostgreSQL Global Development Group, *PostgreSQL 16 Documentation*, https://www.postgresql.org/docs/16/
[4] PostGIS Project, *PostGIS Documentation*, https://postgis.net/documentation/
[5] pgvector Contributors, *pgvector: Open-source vector similarity search for Postgres*, https://github.com/pgvector/pgvector
[6] Randall Munroe, Stuart Riffle (2009), *Reddit's Ranking Algorithms*, https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work
[7] Manning, C.D., Raghavan, P., Schütze, H. (2008), *Introduction to Information Retrieval*, Cambridge University Press.
[8] Haralick, R.M., Shanmugam, K., Dinstein, I. (1973), *Textural Features for Image Classification*, IEEE Transactions on Systems, Man, and Cybernetics.
---

## CÁC CƠ QUAN, ĐƠN VỊ CẦN LIÊN HỆ

Khoa Công nghệ Thông tin – Trường Đại Học Tài Nguyên Và Môi Trường TP. Hồ Chí Minh, 236B Lê Văn Sỹ, Phường 1, Quận Tân Bình, TP. Hồ Chí Minh.

---

|  | GIẢNG VIÊN HƯỚNG DẪN | NGƯỜI LẬP ĐỀ CƯƠNG |
|---|---|---|
|  | (ký và ghi rõ họ tên) | (ký và ghi rõ họ tên) |
|  | ThS. Nguyễn Duy Tuấn | Lê Thanh Tính |

|  | TRƯỞNG BỘ MÔN |
|---|---|
|  | (ký và ghi rõ họ tên) |
