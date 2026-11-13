# TRƯỜNG ĐẠI HỌC TÀI NGUYÊN VÀ MÔI TRƯỜNG TP. HỒ CHÍ MINH
# KHOA CÔNG NGHỆ THÔNG TIN

---

<br>

<div align="center">

# BÁO CÁO ĐỒ ÁN CHUYÊN NGÀNH
### CHUYÊN NGÀNH: CÔNG NGHỆ PHẦN MỀM

<br>

## ĐỀ TÀI:
# XÂY DỰNG WEB APP QUẢN LÝ BÀI VIẾT TÍCH HỢP AI (VIETBLOG)

<br><br>

**Giảng viên hướng dẫn:** ThS. Nguyễn Duy Tuấn  
**Sinh viên thực hiện:** Lê Thanh Tính  
**Mã số sinh viên:** 1250080199  
**Lớp:** 12_ĐH_CNPM3  
**Khóa:** 2023 – 2027  

<br><br>

*TP. Hồ Chí Minh, tháng 10 năm 2026*

</div>

---

\newpage

# LỜI CAM ĐOAN

Em xin cam đoan đây là công trình nghiên cứu và phát triển phần mềm do chính bản thân em thực hiện dưới sự định hướng, hướng dẫn tận tình của Giảng viên hướng dẫn - **ThS. Nguyễn Duy Tuấn**.

Toàn bộ các giải thuật cốt lõi (Xếp hạng xu hướng, Tìm kiếm ngữ nghĩa TF-IDF, Trích xuất đặc trưng hình ảnh đa chiều, Tìm kiếm không gian địa lý Haversine, Tóm tắt văn bản TextRank, Phân tích cảm xúc bình luận Lexicon-based) đều được tự nghiên cứu, phân tích toán học và lập trình thủ công từ đầu (from scratch), hoàn toàn không sử dụng các thư viện AI/ML đóng gói sẵn hay gọi API bên thứ ba. Các số liệu thực nghiệm, kết quả đo lường và mã nguồn trong báo cáo là hoàn toàn trung thực và phản ánh chính xác kết quả xây dựng hệ thống thực tế.

\
*TP. Hồ Chí Minh, ngày 23 tháng 10 năm 2026*  
**Sinh viên thực hiện**  
*(Ký và ghi rõ họ tên)*  
<br><br>
**Lê Thanh Tính**

---

\newpage

# LỜI CẢM ƠN

Để hoàn thành đề tài Đồ án Chuyên ngành này, em xin gửi lời tri ân sâu sắc nhất đến Ban Giám hiệu cùng toàn thể quý Thầy, Cô Khoa Công nghệ Thông tin - Trường Đại học Tài nguyên và Môi trường TP. Hồ Chí Minh, những người đã tận tâm truyền đạt tri thức quý báu về nền tảng khoa học máy tính, kiến trúc phần mềm và kỹ năng lập trình trong suốt quá trình học tập tại trường.

Đặc biệt, em xin bày tỏ lòng biết ơn chân thành và sâu sắc nhất tới **ThS. Nguyễn Duy Tuấn** - Giảng viên trực tiếp hướng dẫn đề tài. Thầy đã luôn dành thời gian quý báu để định hướng nghiên cứu, phản biện giải pháp kiến trúc, gợi mở các hướng tiếp cận thuật toán tối ưu và động viên em vượt qua những thách thức kỹ thuật trong suốt 15 tuần thực hiện dự án.

Mặc dù đã nỗ lực hết mình với tinh thần nghiêm túc và trách nhiệm cao nhất, đồ án khó tránh khỏi những thiếu sót nhất định. Em rất mong nhận được những ý kiến đóng góp, nhận xét và chỉ dẫn quý báu từ Hội đồng bảo vệ để đề tài tiếp tục được hoàn thiện và phát triển hơn nữa trong tương lai.

Em xin chân thành cảm ơn!

---

\newpage

# MỤC LỤC

- [MỞ ĐẦU](#mở-đầu)
  - [1. Lý do chọn đề tài và tính cấp thiết](#1-lý-do-chọn-đề-tài-và-tính-cấp-thiết)
  - [2. Cơ sở khoa học và định hướng nghiên cứu](#2-cơ-sở-khoa-học-và-định-hướng-nghiên-cứu)
  - [3. Mục đích và mục tiêu của đề tài](#3-mục-đích-và-mục-tiêu-của-đề-tài)
  - [4. Đối tượng và phạm vi nghiên cứu](#4-đối-tượng-và-phạm-vi-nghiên-cứu)
  - [5. Phương pháp nghiên cứu](#5-phương-pháp-nghiên-cứu)
  - [6. Đóng góp nổi bật của đề tài](#6-đóng-góp-nổi-bật-của-đề-tài)
  - [7. Bố cục báo cáo đồ án](#7-bố-cục-báo-cáo-đồ-án)
- [CHƯƠNG 1: TỔNG QUAN TÀI LIỆU VÀ CƠ SỞ LÝ THUYẾT](#chương-1-tổng-quan-tài-liệu-và-cơ-sở-lý-thuyết)
  - [1.1. Khảo sát các nền tảng chia sẻ nội dung](#11-khảo-sát-các-nền-tảng-chia-sẻ-nội-dung)
  - [1.2. Kiến trúc Clean Architecture](#12-kiến-trúc-clean-architecture)
  - [1.3. Kiến trúc phân tầng Frontend với Vue.js 3 và Pinia](#13-kiến-trúc-phân-tầng-frontend-với-vuejs-3-và-pinia)
  - [1.4. Hệ quản trị CSDL PostgreSQL, pgvector và PostGIS tùy chọn](#14-hệ-quản-trị-csdl-postgresql-pgvector-và-postgis-tùy-chọn)
  - [1.5. Truyền thông thời gian thực với WebSocket và Redis Pub/Sub](#15-truyền-thông-thời-gian-thực-với-websocket-và-redis-pubsub)
  - [1.6. Cơ sở toán học của 6 nhóm giải thuật tự phát triển](#16-cơ-sở-toán-học-của-6-nhóm-giải-thuật-tự-phát-triển)
- [CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG](#chương-2-phân-tích-và-thiết-kế-hệ-thống)
  - [2.1. Phân tích yêu cầu hệ thống](#21-phân-tích-yêu-cầu-hệ-thống)
  - [2.2. Thiết kế kiến trúc tổng thể](#22-thiết-kế-kiến-trúc-tổng-thể)
  - [2.3. Thiết kế cơ sở dữ liệu chi tiết (ERD - 23 bảng PostgreSQL)](#23-thiết-kế-cơ-sở-dữ-liệu-chi-tiết-erd---23-bảng-postgresql)
  - [2.4. Thiết kế chi tiết các giải thuật nghiên cứu](#24-thiết-kế-chi-tiết-các-giải-thuật-nghiên-cứu)
  - [2.5. Thiết kế giao diện và trải nghiệm người dùng (UI/UX)](#25-thiết-kế-giao-diện-và-trải-nghiệm-người-dùng-uiux)
- [CHƯƠNG 3: CÀI ĐẶT THỰC NGHIỆM VÀ ĐÁNH GIÁ KẾT QUẢ](#chương-3-cài-đặt-thực-nghiệm-và-đánh-giá-kết-quả)
  - [3.1. Môi trường phát triển và cấu hình triển khai](#31-môi-trường-phát-triển-và-cấu-hình-triển-khai)
  - [3.2. Cài đặt Backend Spring Boot 4](#32-cài-đặt-backend-spring-boot-4)
  - [3.3. Cài đặt Frontend Vue 3 Single Page Application](#33-cài-đặt-frontend-vue-3-single-page-application)
  - [3.4. Cài đặt và tích hợp các giải thuật](#34-cài-đặt-và-tích-hợp-các-giải-thuật)
  - [3.5. Kết quả thực nghiệm định lượng và đo lường](#35-kết-quả-thực-nghiệm-định-lượng-và-đo-lường)
  - [3.6. Minh chứng giao diện thực tế của hệ thống](#36-minh-chứng-giao-diện-thực-tế-của-hệ-thống)
- [KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN](#kết-luận-và-hướng-phát-triển)
- [TÀI LIỆU THAM KHẢO](#tài-liệu-tham-khảo)

---

\newpage

# DANH MỤC TỪ VIẾT TẮT

| Viết tắt | Thuật ngữ tiếng Anh | Ý nghĩa tiếng Việt |
|---|---|---|
| **AI** | Artificial Intelligence | Trí tuệ nhân tạo |
| **API** | Application Programming Interface | Giao diện lập trình ứng dụng |
| **CRUD** | Create, Read, Update, Delete | Tạo, Đọc, Cập nhật, Xóa |
| **DTO** | Data Transfer Object | Đối tượng truyền tải dữ liệu |
| **ERD** | Entity Relationship Diagram | Sơ đồ quan hệ thực thể |
| **GLCM** | Gray-Level Co-occurrence Matrix | Ma trận đồng xuất hiện mức xám |
| **HSV** | Hue, Saturation, Value | Không gian màu Sắc độ - Độ bão hòa - Độ sáng |
| **JWT** | JSON Web Token | Mã định danh người dùng chuẩn JSON |
| **NLP** | Natural Language Processing | Xử lý ngôn ngữ tự nhiên |
| **OAuth** | Open Authorization | Chuẩn ủy quyền đăng nhập mở |
| **RBAC** | Role-Based Access Control | Kiểm soát truy cập dựa trên vai trò |
| **REST** | Representational State Transfer | Phong cách kiến trúc chuyển giao trạng thái |
| **SPA** | Single Page Application | Ứng dụng trang đơn |
| **TF-IDF** | Term Frequency - Inverse Document Frequency | Tần suất từ - Nghịch đảo tần suất văn bản |
| **UI/UX** | User Interface / User Experience | Giao diện người dùng / Trải nghiệm người dùng |
| **WS** | WebSocket | Giao thức truyền thông hai chiều thời gian thực |

---

\newpage

# MỞ ĐẦU

## 1. Lý do chọn đề tài và tính cấp thiết
Trong kỷ nguyên số hóa bùng nổ, việc chia sẻ tri thức trực tuyến đóng vai trò huyết mạch trong sự phát triển của cộng đồng công nghệ thông tin. Các nền tảng quốc tế danh tiếng như Medium, Dev.to, Reddit hay Stack Overflow đã và đang cung cấp môi trường thảo luận phong phú cho hàng triệu lập trình viên toàn cầu. Tuy nhiên, khi xét tại thị trường Việt Nam, người dùng đối mặt với nhiều rào cản và khoảng trống lớn:
1. **Rào cản ngôn ngữ và bản địa hóa:** Giao diện và các bộ phân tích từ khóa chủ yếu tối ưu hóa cho tiếng Anh, thiếu hỗ trợ cơ chế tách từ và nhận diện ngữ cảnh đặc thù của tiếng Việt có dấu.
2. **Hạn chế của tìm kiếm từ khóa truyền thống (Lexical Search):** Các blog truyền thống chỉ so khớp chính xác chuỗi (Exact Keyword Match), khiến các truy vấn đồng nghĩa (ví dụ: *"triển khai hệ thống"* so với *"deploy server"*) bị bỏ sót hoàn toàn.
3. **Thiếu khả năng gắn kết không gian địa lý (Location-based):** Người dùng muốn tìm kiếm các bài viết, sự kiện công nghệ, hội thảo sinh viên hoặc đánh giá quán cafe học nhóm xung quanh bán kính hiện tại (quanh trường học, phòng trọ) không có công cụ hỗ trợ trực quan trên bản đồ.
4. **Phụ thuộc quá mức vào các thư viện AI "hộp đen" (Black-box AI APIs):** Nhiều đồ án sinh viên hiện nay lạm dụng việc gọi API từ bên thứ ba (OpenAI, HuggingFace) mà không hiểu bản chất thuật toán, dẫn đến chi phí cao, thiếu tính tự chủ và không đáp ứng được yêu cầu nghiên cứu khoa học chuyên sâu của chuyên ngành Công nghệ Phần mềm.

Từ những lý do xác đáng trên, đề tài **"Xây dựng Web App Quản lý bài viết tích hợp AI (VietBlog)"** được hình thành nhằm mang lại một nền tảng chia sẻ bài viết thuần Việt, hiệu năng cao, tích hợp các thuật toán trí tuệ nhân tạo và xử lý ngôn ngữ tự nhiên do chính sinh viên nghiên cứu và cài đặt từ nền tảng toán học.

## 2. Cơ sở khoa học và định hướng nghiên cứu
Đề tài được xây dựng theo định hướng **Nghiên cứu khoa học ứng dụng (Applied Research)**, kiên định với các nguyên tắc:
- **Tự phát triển thuật toán (From Scratch):** Toàn bộ 6 nhóm giải thuật cốt lõi (Xếp hạng xu hướng, Tìm kiếm ngữ nghĩa TF-IDF, Xử lý ảnh đa trích xuất HSV/Sobel/GLCM, Tính toán khoảng cách địa cầu Haversine, Tóm tắt đồ thị TextRank, Phân tích cảm xúc Lexicon) được hiện thực hóa bằng mã nguồn Java thuần túy, không sử dụng bất kỳ framework Machine Learning có sẵn nào.
- **Kiến trúc phần mềm thực dụng chuẩn mực (Pragmatic Clean Architecture):** Phân tách mã nguồn Backend thành 4 lớp rõ ràng: *Domain Layer* (chứa thực thể nghiệp vụ JPA thực dụng, các *Domain Service* như `PostDomainService` và toàn bộ giải thuật thuần Java), *Application Layer* (chứa Use Case Services, DTOs, Mappers), *Infrastructure Layer* (cơ sở dữ liệu, pgvector/PostGIS gateway, SMTP Email, Redis, Security) và *Presentation Layer* (REST Controllers, WebSocket Handlers).
- **Thiết kế phân tầng hiện đại Frontend:** Áp dụng mô hình *Composition API Pattern* trên Vue 3, chia tách mạch lạc giữa *Presentation Components*, *Composables* (quản lý logic trạng thái nghiệp vụ), *Pinia Stores* (quản lý Global State) và *API Services* (kết nối mạng).

## 3. Mục đích và mục tiêu của đề tài
- **Mục đích:** Nghiên cứu bản chất toán học của các giải thuật AI/NLP, ứng dụng vào thiết kế và triển khai một nền tảng web quản lý nội dung đa phương tiện, thông minh, phục vụ cộng đồng học tập và công nghệ.
- **Mục tiêu cụ thể:**
  1. Xây dựng hoàn chỉnh ứng dụng web Single Page Application (VietBlog) đáp ứng đầy đủ nghiệp vụ: Xác thực an toàn (Local + OTP xác thực Email & Quên mật khẩu qua Gmail SMTP + Google OAuth 2.0 + HttpOnly Cookie JWT), Soạn thảo Rich Text, Bình luận phân cấp lồng nhau, Tương tác Vote/Bookmark, Nhóm cộng đồng, Chat thời gian thực WebSocket, Cài đặt Thông báo & Quyền riêng tư lưu CSDL và Dashboard Quản trị.
  2. Cài đặt thành công 6 nhóm giải thuật tự viết: Trending Ranking, Semantic Search, Image Search, Document Search, Geospatial Search, Text Summarization và Sentiment Analysis.
  3. Đánh giá thực nghiệm định lượng toàn diện bộ 6 nhóm giải thuật (Sentiment trên Blog Corpus & bộ chuẩn UIT-VSFC 3.166 mẫu, TextRank ROUGE, Semantic MAP/Recall@3, CBIR 51 chiều, Trending Pairwise Accuracy và Haversine MAE/Precision/Recall).

## 4. Đối tượng và phạm vi nghiên cứu
- **Đối tượng nghiên cứu:** Các thuật toán xử lý văn bản tiếng Việt (Vector Space 256 chiều, Accent Fold, TextRank, Lexicon + Embedding 256 chiều); Kỹ thuật thị giác máy tính cổ điển (32-D HSV Color Histogram, 16-D Sobel Edge Filter, 3-D Haralick GLCM — tổng hợp vector 51 chiều); Mô hình dữ liệu quan hệ 23 bảng trên PostgreSQL (+ pgvector, hỗ trợ PostGIS tùy chọn); Kiến trúc phần mềm Pragmatic Clean Architecture; Giao thức WebSocket (RFC 6455) và xác thực SMTP Email OTP.
- **Phạm vi nghiên cứu:** 
  - *Nghiệp vụ:* Phục vụ người dùng cá nhân (viết blog, tìm kiếm, kết nối bạn bè, tương tác nhóm) và Ban Quản trị hệ thống (kiểm duyệt nội dung tự động bằng AI, quản lý người dùng, thống kê tương tác).
  - *Dữ liệu:* Tập dữ liệu mẫu tiếng Việt, từ điển cảm xúc gồm hàng nghìn từ vựng tích cực/tiêu cực/phủ định được chuẩn hóa, và các bài viết mẫu gắn tọa độ thực tế tại TP. Hồ Chí Minh và các tỉnh thành Việt Nam.

## 5. Phương pháp nghiên cứu
- **Phương pháp nghiên cứu lý thuyết:** Đọc và phân tích các công trình nghiên cứu khoa học kinh điển: Vector Space Model (Salton et al., 1975), Thuật toán TextRank (Mihalcea & Tarau, 2004), Trích xuất đặc trưng kết cấu hình ảnh GLCM (Haralick et al., 1973), Clean Architecture (Robert C. Martin, 2017).
- **Phương pháp thực nghiệm (Agile / Scrum):** Phát triển hệ thống qua 15 tuần theo từng vòng lặp (Sprint), kết hợp viết Unit Test và Integration Test liên tục để kiểm soát chất lượng mã nguồn.

## 6. Đóng góp nổi bật của đề tài
1. **Khẳng định tính tự chủ công nghệ:** Minh chứng sinh viên có khả năng hiện thực hóa các giải thuật xử lý ngôn ngữ và hình ảnh phức tạp bằng thuật toán toán học cơ bản mà không cần phụ thuộc vào hạ tầng AI đắt đỏ.
2. **Tính năng tìm kiếm 5 chiều đột phá:** Cung cấp trải nghiệm tìm kiếm toàn diện nhất từ trước đến nay trên một nền tảng blog Việt Nam: Từ khóa (Fulltext), Ngữ nghĩa (TF-IDF Vector), Hình ảnh (Visual Features), Tài liệu (Document Extraction) và Bản đồ số (GIS Radius).
3. **Mã nguồn chuẩn mực doanh nghiệp:** Hệ thống Backend và Frontend tuân thủ nghiêm ngặt chuẩn kiến trúc công nghiệp, hỗ trợ đa môi trường, có sẵn bộ test benchmark tự động và cơ chế bảo mật xác thực chặt chẽ (Spring Security 6, JWT, Google Identity Services).

## 7. Bố cục báo cáo đồ án
- **Chương 1: Tổng quan tài liệu và cơ sở lý thuyết:** Trình bày nền tảng lý luận, khảo sát thực tế và phân tích toán học chi tiết của 6 nhóm giải thuật.
- **Chương 2: Phân tích và thiết kế hệ thống:** Mô tả yêu cầu, kiến trúc phân tầng, thiết kế CSDL thực thể quan hệ (ERD), thiết kế giải thuật và API.
- **Chương 3: Cài đặt thực nghiệm và đánh giá kết quả:** Trình bày chi tiết mã nguồn hiện thực hóa, bảng kết quả đo lường thực nghiệm (F1-Score, Precision, Recall) và minh chứng giao diện hệ thống.
- **Kết luận và hướng phát triển:** Đánh giá tổng kết các mục tiêu đã đạt được và định hướng mở rộng đề tài.

---

\newpage

# CHƯƠNG 1: TỔNG QUAN TÀI LIỆU VÀ CƠ SỞ LÝ THUYẾT

## 1.1. Khảo sát các nền tảng chia sẻ nội dung
Nhằm xác định đúng định vị và yêu cầu kỹ thuật cho VietBlog, đề tài đã tiến hành phân tích so sánh các nền tảng blog phổ biến hiện nay:

| Tiêu chí | Medium | Reddit | Dev.to | VietBlog (Đề tài) |
|---|---|---|---|---|
| **Ngôn ngữ mục tiêu** | Toàn cầu (Tiếng Anh) | Toàn cầu (Tiếng Anh) | Lập trình viên quốc tế | Cộng đồng công nghệ Việt Nam |
| **Soạn thảo nội dung** | Block Editor | Markdown / WYSIWYG | Markdown | TipTap Rich WYSIWYG + Code Highlight |
| **Tìm kiếm ngữ nghĩa** | Có (Hộp đen AI) | Kém (Khớp từ khóa) | Khớp tag / từ khóa | **Tự viết TF-IDF + Cosine pgvector** |
| **Tìm kiếm theo ảnh** | Không hỗ trợ | Không hỗ trợ | Không hỗ trợ | **Tự viết HSV + Sobel + GLCM** |
| **Bản đồ không gian (GIS)** | Không hỗ trợ | Không hỗ trợ | Không hỗ trợ | **PostGIS + Haversine + Leaflet** |
| **Tóm tắt bài viết** | Không có | Bot bên thứ ba | Không có | **Tự viết Graph-based TextRank** |
| **Phân tích cảm xúc** | Không hỗ trợ | Không hỗ trợ | Phản ứng Emoji | **Tự viết Lexicon tiếng Việt** |
| **Chat thời gian thực** | Không hỗ trợ | Chat 1-1 cơ bản | Không hỗ trợ | **WebSocket + Redis Pub/Sub đa phòng** |

## 1.2. Kiến trúc Clean Architecture
Được đề xuất bởi Robert C. Martin (Uncle Bob), Clean Architecture đặt trọng tâm vào việc phân ly các mối quan tâm (Separation of Concerns) và tuân thủ quy tắc phụ thuộc (Dependency Inversion Principle): Các tầng bên trong không được phụ thuộc vào các tầng bên ngoài.

```
       +-----------------------------------------------+
       |             Presentation Layer                |
       |     (REST Controllers, WebSocket Handlers)    |
       +-----------------------+-----------------------+
                               | (gọi Use Cases)
                               v
       +-----------------------------------------------+
       |              Application Layer                |
       |       (Application Services, DTOs, Mappers)   |
       +-----------------------+-----------------------+
                               | (thao tác Entities)
                               v
       +-----------------------------------------------+
       |                Domain Layer                   |
       |     (Entities, Domain Services, Algorithms)   |
       +-----------------------^-----------------------+
                               | (hiện thực interfaces)
       +-----------------------+-----------------------+
       |             Infrastructure Layer              |
       |   (JPA Repositories, Redis, Security, File)   |
       +-----------------------------------------------+
```

- **Domain Layer (`com.vietblog.domain`):** Trái tim của ứng dụng, chứa các thực thể JPA thực dụng (`Post`, `User`, `Comment`, `CommunityGroup`, ...), Domain Services (`PostDomainService`) và toàn bộ các lớp giải thuật toán học thuần Java không phụ thuộc framework (`TextAlgorithms`, `ImageAlgorithms`, `GeoAlgorithms`).
- **Application Layer (`com.vietblog.application`):** Điều phối luồng dữ liệu, thực hiện các ca sử dụng nghiệp vụ (`PostApplicationService`, `AuthService`, `EmailService`, `UserApplicationService`, `CommentApplicationService`, `NotificationService`, `AdminService`), chuyển đổi giữa Entity và DTO.
- **Infrastructure Layer (`com.vietblog.infrastructure`):** Chứa các cài đặt kỹ thuật công nghệ như Spring Data JPA Repositories, `PostgresSearchGateway` (pgvector/PostGIS), `SearchFileReader` (PDFBox/StAX), Spring Security, Redis Template, JWT HttpOnly Cookie Filter & WebSocket Ticket.
- **Presentation Layer (`com.vietblog.presentation`):** Cung cấp các REST Endpoints (`/api/posts`, `/api/auth`, `/api/users/me/preferences`, `/api/search`) và WebSocket Handler (`/ws/chat`) tiếp nhận yêu cầu từ người dùng và trả về phản hồi chuẩn `ApiResponse<T>`.

## 1.3. Kiến trúc phân tầng Frontend với Vue.js 3 và Pinia
Frontend của VietBlog được xây dựng dưới dạng Single Page Application (SPA) áp dụng Vue 3 Composition API kết hợp TypeScript:
1. **Views & Presentation Components:** Chỉ đảm nhận vai trò hiển thị giao diện và thu thập tương tác của người dùng (`EmailVerificationPanel.vue`, `NotificationsTab.vue`, `PrivacyTab.vue`, ...).
2. **Composables Layer (`src/composables`):** Đóng gói toàn bộ logic trạng thái nghiệp vụ (Stateful Business Logic), ví dụ `usePostDetail`, `useAuth`, `useEmailVerification`, `useSettings`, `useChat`, `useAdmin`. Điều này giúp giao diện không bị phụ thuộc vào logic xử lý dữ liệu và tăng khả năng tái sử dụng (Reusability).
3. **Pinia Stores Layer (`src/stores`):** Quản lý trạng thái chia sẻ toàn cục (`auth.store`), sử dụng HttpOnly Cookie bảo mật kết hợp bootstrap `/api/auth/me` và đồng bộ tùy chọn Thông báo/Quyền riêng tư trực tiếp với PostgreSQL thông qua `/api/users/me/preferences`.
4. **Data Access API Layer (`src/api`):** Đóng gói các hàm gọi mạng Fetch API tập trung (`client.ts`, `auth.api.ts`, `users.api.ts`, `posts.api.ts`, `search.api.ts`, `groups.api.ts`), tự động gửi credential cookie và dịch mã lỗi chuẩn hóa.

## 1.4. Hệ quản trị CSDL PostgreSQL, pgvector và PostGIS tùy chọn
- **PostgreSQL 16:** Hệ quản trị CSDL quan hệ mã nguồn mở mạnh mẽ, đảm bảo tính toàn vẹn dữ liệu chuẩn ACID cho toàn bộ **23 bảng**.
- **PostGIS (Tùy chọn) & Fallback Haversine:** Khi PostgreSQL có sẵn extension `postgis`, `PostgresSearchGateway` tự động bật `ST_DWithin` / `ST_Distance`; khi triển khai trên môi trường chưa cài PostGIS, hệ thống tự động chuyển sang tính khoảng cách Haversine thuần Java trong `PostDomainService` để đảm bảo hoạt động ổn định.
- **pgvector:** Phần mở rộng lưu trữ trực tiếp các vector nhúng (`post_text_vectors` kiểu `vector(256)` và `post_image_features` kiểu `vector(51)`), hỗ trợ so khớp Cosine Similarity hiệu năng cao.

## 1.5. Truyền thông thời gian thực với WebSocket và Redis Pub/Sub
- **WebSocket (RFC 6455):** Giao thức truyền thông toàn công song công (Full-duplex) qua một kết nối TCP duy nhất (`/ws/chat`), xác thực bằng `ws-ticket`, phục vụ tính năng chat thời gian thực và thông báo trực tiếp trên web (trong ứng dụng).
- **Redis Pub/Sub:** Giải quyết bài toán mở rộng ngang (Horizontal Scaling). Khi hệ thống bật chế độ Redis (`chat.redis.enabled=auto/true`), một tin nhắn gửi tới Server A sẽ được phát thanh (Publish) vào Redis Channel, Server B nhận (Subscribe) và gửi tiếp xuống đúng WebSocket Session của người nhận (tự động fallback in-memory nếu môi trường dev không bật Redis).

## 1.6. Cơ sở toán học của 6 nhóm giải thuật tự phát triển

### 1. Xếp hạng bài viết thịnh hành (Trending Ranking)
Dựa trên việc kết hợp tương tác có trọng số từ mô hình Reddit Hot, khoảng tin cậy nhị thức Wilson Lower Bound ($z = 1.96$, độ tin cậy 95%) và phân rã trọng lực của Hacker News (`PostDomainService.java`):
$$\text{Engagement} = \max(0, \text{Upvotes} - \text{Downvotes}) \times 2.0 + \text{Comments} \times 3.0 + \text{Views} \times 0.1$$
$$\text{Wilson}_{95\%}(\text{up}, \text{down}) = \frac{\hat{p} + \frac{z^2}{2n} - z\sqrt{\frac{\hat{p}(1-\hat{p}) + z^2/(4n)}{n}}}{1 + \frac{z^2}{n}}, \quad n = \text{up} + \text{down}$$
$$\text{Trending Score} = \frac{\text{Engagement} \times \left(0.5 + \text{Wilson}_{95\%}\right)}{(\text{HoursAge} + 2)^{1.8}}$$

### 2. Tìm kiếm ngữ nghĩa Vector 256 chiều & Cosine Similarity
Mỗi tài liệu $D$ và câu truy vấn $Q$ (sau chuẩn hóa dấu tiếng Việt - Accent Fold và tách từ) được băm chiếu vào không gian vector cố định **256 chiều** (`TEXT_VECTOR_DIMENSIONS = 256`) theo trọng số TF-IDF/băm từ vựng và lưu xuống bảng `post_text_vectors (vector(256))`:
$$\text{TF}(t, d) = \frac{f_{t, d}}{\sum_{t' \in d} f_{t', d}}, \quad \text{IDF}(t, D) = \ln\left(1 + \frac{|D|}{1 + |\{d \in D : t \in d\}|}\right)$$
Độ tương đồng ngữ nghĩa giữa câu hỏi người dùng $\vec{q}$ và bài viết $\vec{d}$:
$$\text{Cosine Similarity}(\vec{q}, \vec{d}) = \frac{\vec{q} \cdot \vec{d}}{\|\vec{q}\| \|\vec{d}\|} = \frac{\sum_{i=1}^{256} q_i d_i}{\sqrt{\sum_{i=1}^{256} q_i^2} \sqrt{\sum_{i=1}^{256} d_i^2}}$$

### 3. Trích xuất đặc trưng hình ảnh 51 chiều (HSV Histogram, Sobel, GLCM)
Vector đặc trưng ảnh **51 chiều** (`ImageAlgorithms`) là sự kết hợp chuẩn hóa có trọng số của 3 nhóm đặc trưng thị giác cốt lõi:
1. **HSV Color Histogram (32 chiều, trọng số 0.7):** Chuyển đổi RGB sang HSV, lượng tử hóa theo cấu hình $8 \times 2 \times 2$ gồm 8 thùng sắc độ (Hue), 2 thùng độ bão hòa (Saturation) và 2 thùng độ sáng (Value).
2. **Sobel Edge Detection (16 chiều, trọng số 0.2):** Áp dụng hai ma trận chập $G_x$ và $G_y$ để trích xuất histogram góc cạnh gradient $G = \sqrt{G_x^2 + G_y^2}$ và $\theta = \arctan(G_y / G_x)$.
3. **Gray-Level Co-occurrence Matrix - GLCM (3 chiều, trọng số 0.1):** Tính toán 3 chỉ số kết cấu Haralick chuẩn hóa gồm Tương phản (Contrast), Năng lượng (Energy) và Độ đồng nhất (Homogeneity).

### 4. Tính toán khoảng cách địa cầu (Haversine Formula)
Tính khoảng cách đường tròn lớn giữa hai điểm tọa độ GPS $(\phi_1, \lambda_1)$ và $(\phi_2, \lambda_2)$ trên mặt cầu Trái Đất (bán kính $R = 6371\text{ km}$):
$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)$$
$$c = 2 \times \text{atan2}(\sqrt{a}, \sqrt{1-a})$$
$$d = R \times c$$

### 5. Tóm tắt văn bản tự động TextRank
Mô hình hóa bài viết thành đồ thị vô hướng $G = (V, E)$, trong đó mỗi đỉnh $V_i$ là một câu và trọng số cạnh $w_{ij}$ là độ tương đồng từ vựng TF-IDF giữa hai câu. Điểm quan trọng của câu được tính lặp theo công thức PageRank:
$$WS(V_i) = (1 - d) + d \times \sum_{V_j \in \text{In}(V_i)} \frac{w_{ji}}{\sum_{V_k \in \text{Out}(V_j)} w_{jk}} WS(V_j)$$
Hệ thống chọn ra Top $K$ câu có trọng số $WS$ cao nhất và sắp xếp lại theo thứ tự xuất hiện ban đầu trong bài viết để tạo bản tóm tắt trích xuất mạch lạc.

### 6. Phân tích cảm xúc bình luận (Lexicon Hybrid + 256-D Prototype Embedding)
Thuật toán `lexicon+embedding-v1` trong `TextAlgorithms` kết hợp từ điển cảm xúc tiếng Việt có xử lý phủ định đơn, phủ định kép, từ nhấn mạnh và liên từ tương phản (*nhưng*, *tuy nhiên*) cùng độ tương đồng prototype embedding **256 chiều**:
$$\text{Score}(C) = 0.85 \times \text{LexiconScore}(C) + 0.15 \times \text{EmbeddingScore}_{256\text{D}}(C)$$
Phân loại nhãn quanh ngưỡng $0$: `positive` nếu $\text{Score}(C) > 0$, `negative` nếu $\text{Score}(C) < 0$, và `neutral` khi $\text{Score}(C) = 0$.

---

\newpage

# CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 2.1. Phân tích yêu cầu hệ thống

### Yêu cầu chức năng (Functional Requirements)
1. **Phân hệ Người dùng, Xác thực & Cài đặt cá nhân:**
   - Đăng ký tài khoản có xác thực Email qua mã OTP 6 chữ số gửi qua Gmail SMTP (`spring-boot-starter-mail`, tôn trọng cấu hình `requireEmailVerification` của Admin), Đăng nhập bằng HttpOnly Cookie JWT (`USER`, `MODERATOR`, `ADMIN`), Quên mật khẩu & Đặt lại mật khẩu an toàn qua Email OTP (không rò rỉ OTP/token trên API hay giao diện).
   - Đăng nhập một chạm bằng tài khoản Google (Google OAuth 2.0 Identity Services).
   - Quản lý thông tin cá nhân: Cập nhật họ tên, tiểu sử, ảnh đại diện, đổi mật khẩu.
   - Cài đặt **Thông báo** (Email khi có người theo dõi/bình luận/tin nhắn mới + Thông báo trực tiếp trên web trong ứng dụng cho tương tác & bài viết thịnh hành) và **Quyền riêng tư** (`public` / `followers` / `private`, kiểm soát quyền nhắn tin, trạng thái trực tuyến, đã xem) lưu bền vững trong PostgreSQL và thực thi ở tầng Backend (`UserProfileResponse`, `ChatService`).
   - Theo dõi (Follow / Unfollow) tác giả khác.
2. **Phân hệ Quản lý Bài viết & Tương tác:**
   - Soạn thảo bài viết với Rich Editor (hỗ trợ tiêu đề, tóm tắt, ảnh bìa, danh mục, thẻ tag, tọa độ địa lý đính kèm).
   - Duyệt bài viết theo danh mục, thẻ tag, tác giả.
   - Tương tác: Upvote, Downvote, Thả cảm xúc Emoji, Lưu bài viết vào danh sách yêu thích (Bookmark).
   - Hệ thống bình luận đa cấp lồng nhau (Threaded Comments) hỗ trợ Reply phân nhánh không giới hạn.
3. **Phân hệ Tìm kiếm Đa chế độ:**
   - Tìm kiếm từ khóa truyền thống (Keyword Full-text Search).
   - Tìm kiếm ngữ nghĩa (Semantic Search) bằng vector TF-IDF.
   - Tìm kiếm bằng hình ảnh tương đồng (Image Search).
   - Tìm kiếm trích xuất tài liệu (Document Search PDF/DOCX).
   - Tìm kiếm xung quanh theo định vị bản đồ (Geospatial Search bán kính N km).
4. **Phân hệ Cộng đồng & Thời gian thực:**
   - Quản lý nhóm cộng đồng (Tạo nhóm, tham gia, đăng bài thảo luận nhóm).
   - Trò chuyện trực tiếp (Real-time 1-1 Chat) và Chat nhóm qua kênh WebSocket.
   - Nhận thông báo tức thời khi có người tương tác với bài viết hoặc bình luận.
5. **Phân hệ Quản trị Admin:**
   - Dashboard biểu đồ thống kê tăng trưởng bài viết, người dùng, lượt xem.
   - Kiểm duyệt nội dung tự động: Biểu đồ trực quan hóa tỉ lệ cảm xúc (Sentiment Analysis) của bình luận trên toàn hệ thống.
   - Quản lý người dùng: Khóa/Mở tài khoản, phân quyền Role (USER, MODERATOR, ADMIN).

### Yêu cầu phi chức năng (Non-Functional Requirements)
- **Hiệu năng (Performance):** Thời gian phản hồi API trung bình dưới 200ms; Tìm kiếm vector dưới 100ms; Độ trễ gửi nhận tin nhắn WebSocket dưới 50ms.
- **Bảo mật (Security):** Toàn bộ API được bảo vệ bằng Spring Security 6; Xác thực Stateless JWT; Lọc chống tấn công XSS (HtmlSanitizer) và Rate Limiting chống Brute Force / DDoS.
- **Khả năng mở rộng (Scalability):** Thiết kế Stateless giúp dễ dàng triển khai cụm Backend nhiều nút với Redis Cache & Pub/Sub.

## 2.2. Thiết kế kiến trúc tổng thể

```
[ Trình duyệt Người dùng (Client Browser) ]
  |-- Vue 3 SPA (HTML5, TailwindCSS, TypeScript)
  |-- Fetch Client (HttpOnly Cookie Auth) + WebSocket Client (ws-ticket)
                |
                v  (HTTPS / WSS)
[ Cổng kết nối Backend (Spring Boot 4 Gateway & Security) ]
  |-- Rate Limiting Filter -> JWT Cookie Filter -> CORS Filter
  +--------------------------------------------------------------+
  |               Pragmatic Clean Architecture                   |
  |  [Presentation Layer]  Controllers, WebSocket Handlers       |
  |           |                                                  |
  |  [Application Layer]   App Services, Use Cases, DTO Mappers  |
  |           |                                                  |
  |  [Domain Layer]        Entities & Pure Research Algorithms   |
  |           |            (256-D, 51-D, TextRank, Sentiment)    |
  +-----------+--------------------------------------------------+
              | (Spring Data JPA / SMTP / Redis Template)
              v
[ Tầng Lưu trữ & Hạ tầng (Infrastructure) ]
  |-- PostgreSQL 16 (23 bảng quan hệ thực thể chuẩn hóa)
  |-- pgvector Extension (post_text_vectors 256-D & post_image_features 51-D)
  |-- PostGIS Extension (Tùy chọn ST_DWithin / Fallback Haversine Java)
  |-- Gmail SMTP (Xác thực OTP & Thông báo Email) + Redis (Cache & Pub/Sub)
```

## 2.3. Thiết kế cơ sở dữ liệu chi tiết (ERD - 23 bảng PostgreSQL)
Cơ sở dữ liệu thực tế gồm **23 bảng** chuẩn hóa trong PostgreSQL (lưu kèm vector `pgvector` và tùy chọn thông báo/riêng tư ngay trên bảng `users`, không phát sinh bảng dư thừa):
1. `users`: Tài khoản, vai trò (`USER`/`MODERATOR`/`ADMIN`), trạng thái `email_verified`, nhóm cột Quyền riêng tư (`profile_visibility`, `allow_messages`, `show_online_status`, `show_read_receipts`) và nhóm cột Thông báo (`email_new_follower/comment/message`, `notify_new_follower/comment/message/trending`).
2. `user_followers`: Quan hệ theo dõi giữa người dùng (`follower_id`, `following_id`).
3. `categories`: Danh mục bài viết (`id`, `name`, `slug`, `description`, `icon`).
4. `posts` & 5. `post_tags`: Bài viết (`title`, `slug`, `content`, `cover_image`, `status`, `author_id`, `category_id`, `upvotes_count`, `downvotes_count`, `views_count`, `trending_score`, `latitude`, `longitude`, `created_at`) và danh sách thẻ tag.
6. `post_text_vectors`: Lưu vector ngữ nghĩa văn bản **256 chiều** (`vector(256)`).
7. `post_image_features`: Lưu vector đặc trưng thị giác **51 chiều** (`vector(51)` = 32 HSV + 16 Sobel + 3 GLCM).
8. `comments`, 9. `reactions`, 10. `bookmarks`: Bình luận đa cấp kèm nhãn cảm xúc, phản ứng vote/emoji và bài viết đã lưu.
11. `community_groups`, 12. `group_members`, 13. `group_posts`, 14. `group_post_comments`, 15. `group_post_likes`: Hệ sinh thái nhóm cộng đồng và thảo luận nhóm.
16. `conversations`, 17. `conversation_members`, 18. `chat_messages`, 19. `chat_blocks`: Hệ thống chat thời gian thực 1-1 / nhóm và chặn liên hệ.
20. `notifications`, 21. `reports`: Thông báo trong ứng dụng và báo cáo vi phạm kiểm duyệt.
22. `password_reset_tokens`: Mã OTP dùng chung có phân biệt `purpose` (`PASSWORD_RESET` và `EMAIL_VERIFICATION`).
23. `system_settings`: Cấu hình toàn cục của Admin (bao gồm bật/tắt `require_email_verification`, chế độ bảo trì).

## 2.4. Thiết kế chi tiết các giải thuật nghiên cứu

### Quy trình giải thuật Tìm kiếm ngữ nghĩa (Semantic Search Flowchart)
```
[ Người dùng nhập truy vấn q ]
         |
         v
[ Tiền xử lý văn bản: Tách từ, Loại Stopwords, Chuyển chữ thường ]
         |
         v
[ Vector hóa câu truy vấn: Tính TF-IDF Vector q_vec ]
         |
         v
[ Truy vấn pgvector trong CSDL PostgreSQL: Tính Cosine Similarity ]
         |
         v
[ Xếp hạng theo điểm độ tương đồng giảm dần (Score DESC) ]
         |
         v
[ Trả về danh sách bài viết khớp ngữ nghĩa ]
```

### Quy trình giải thuật Phân tích cảm xúc (Hybrid Lexicon + 256-D Embedding Flowchart)
```
[ Chuỗi bình luận văn bản ]
         |
         v
[ Tách token từ và emoji + chuẩn hóa phủ định / liên từ tương phản ]
         |
         v
[ Tính LexiconScore có xét đảo ngữ đơn, phủ định kép và trọng số sau "nhưng/tuy nhiên" ]
         |
         v
[ Tính Cosine Similarity với Prototype Embedding 256 chiều (EmbeddingScore) ]
         |
         v
[ Tổng hợp Score = 0.85 * LexiconScore + 0.15 * EmbeddingScore ]
         |
         v
[ So khớp ngưỡng: Score > 0 (positive) | Score < 0 (negative) | Score = 0 (neutral) ]
```

## 2.5. Thiết kế giao diện và trải nghiệm người dùng (UI/UX)
- Giao diện được thiết kế theo phong cách hiện đại (Modern Clean & Glassmorphism nhẹ), sử dụng bảng màu HSL hài hòa (Indigo làm chủ đạo, Emerald cho trạng thái tích cực, Rose cho cảnh báo/tiêu cực).
- Hỗ trợ đầy đủ thiết kế đáp ứng (Responsive Design) mượt mà trên cả Mobile, Tablet và Desktop.
- Tích hợp thanh công cụ tìm kiếm nổi bật với bộ chuyển đổi 5 chế độ tìm kiếm trực quan bằng tab.
- Trình xem chi tiết bài viết có thanh đọc tiến trình (Reading Progress Bar), mục lục tự động (Table of Contents), khối tóm tắt tự động AI đóng mở thông minh, thanh tương tác Emoji Picker và thẻ tác giả cân đối, thẩm mỹ.

---

\newpage

# CHƯƠNG 3: CÀI ĐẶT THỰC NGHIỆM VÀ ĐÁNH GIÁ KẾT QUẢ

## 3.1. Môi trường phát triển và cấu hình triển khai
- **Hệ điều hành:** Microsoft Windows 11 Pro 64-bit.
- **Môi trường Backend:** Java Development Kit (JDK) 21 LTS, Gradle 9.7.1, Spring Boot 4.0.8 (`spring-boot-starter-mail` cho Gmail SMTP).
- **Môi trường Frontend:** Vite 8.2.2, TypeScript ~6.0.2, Vue 3.5.41, Pinia 4.0.3, Vue Router 4.6.4, TailwindCSS 4.3.3.
- **Hạ tầng CSDL & Cache:** PostgreSQL kết hợp extension pgvector (256-D & 51-D) và PostGIS tùy chọn, Redis tùy chọn (auto fallback in-memory).
- **IDE:** Visual Studio Code, Antigravity IDE, IntelliJ IDEA Ultimate.

## 3.2. Cài đặt Backend Spring Boot 4
- **Cấu hình bảo mật (`SecurityConfig.java`):** Thiết lập xác thực HttpOnly Cookie JWT (`AuthController.java`, `JwtAuthenticationFilter`), cấu hình phân quyền RBAC cho các đường dẫn `/api/admin/**` theo vai trò `ADMIN` và `MODERATOR`, cho phép truy cập công khai các API đọc bài viết `/api/posts/**` và tìm kiếm `/api/search/**`.
- **Xác thực Email OTP & Quên mật khẩu qua SMTP (`EmailService.java`, `AuthService.java`):** Dùng `spring-boot-starter-mail` gửi mã OTP 6 chữ số qua Gmail SMTP cho cả đăng ký (`EMAIL_VERIFICATION`, tuân theo thiết lập `requireEmailVerification` của Admin) và đặt lại mật khẩu (`PASSWORD_RESET`). Tuyệt đối không trả OTP hoặc `resetToken` trong JSON response hay log.
- **Lưu trữ & Thực thi Thông báo / Quyền riêng tư (`UserApplicationService.java`, `UserController.java`, `NotificationService.java`, `ChatService.java`):** Đồng bộ toàn bộ tùy chọn cá nhân qua `GET/PUT /api/users/me/preferences` ngay trên bảng `users`; kiểm soát chặt quyền xem hồ sơ (`public` / `followers` / `private`) và quyền nhắn tin 1-1 ở phía server.
- **Dịch vụ Tác vụ ngầm (`TrendingRankingScheduler.java`):**
  Sử dụng `@EnableScheduling` và `@Scheduled(fixedRate = 300000)` để định kỳ mỗi 5 phút cập nhật điểm `trendingScore`, đồng thời phát thông báo bài viết thịnh hành (chống trùng theo ngày) cho người dùng đã bật `notifyTrending`.
- **Xác thực mạng xã hội Google OAuth (`AuthService.java`):**
  Tiếp nhận `credential` (ID Token / Access Token) từ Frontend, tự động gọi xác thực với Google OAuth2 API (`https://www.googleapis.com/oauth2/v3/userinfo`), kiểm tra email trong hệ thống: nếu chưa có thì tự động khởi tạo tài khoản mới với vai trò `USER` (đã xác thực email), nếu đã có thì liên kết tài khoản và cấp phát HttpOnly Cookie JWT cho phiên đăng nhập.

## 3.3. Cài đặt Frontend Vue 3 Single Page Application
- **Hệ thống Design System:** Tích hợp bộ icon `@lucide/vue`, bộ màu chuẩn hóa trong Tailwind CSS, các thành phần tái sử dụng (`PostCard.vue`, `PostAuthorCard.vue`, `PostComments.vue`, `ChatPopupWindow.vue`, `EmailVerificationPanel.vue`, `NotificationsTab.vue`, `PrivacyTab.vue`).
- **Thanh tương tác biểu cảm (`PostInteractionBar.vue`):** Hiện thực bộ chọn Emoji thả nổi mượt mà, tự động chuẩn hóa dữ liệu vote thô (`UPVOTE` $\rightarrow$ 👍, `DOWNVOTE` $\rightarrow$ 👎, `HEART` $\rightarrow$ ❤️) hiển thị trực quan cho người dùng.
- **Bản đồ bài viết Leaflet (`MapView.vue`):** Tích hợp thư viện Leaflet.js, tự động xin quyền GPS của trình duyệt, hiển thị vị trí người dùng bằng biểu tượng marker xanh và định vị các bài viết xung quanh bằng các marker đỏ có popup tương tác nhanh.

## 3.4. Cài đặt và tích hợp các giải thuật
Mã nguồn các giải thuật tự phát triển được tổ chức tại tầng Domain và Infrastructure:
- **`com.vietblog.domain.search.TextAlgorithms`:** Chuẩn hóa chuỗi & Accent Fold (`tokenize`), chiếu vector văn bản **256 chiều** (`TEXT_VECTOR_DIMENSIONS = 256`), tính `cosineSimilarity`, tóm tắt đồ thị `summarize` (TextRank) và phân tích cảm xúc `lexicon+embedding-v1`.
- **`com.vietblog.domain.search.ImageAlgorithms`:** Trích xuất đặc trưng thị giác **51 chiều** (32 HSV + 16 Sobel + 3 GLCM) phục vụ tìm kiếm ảnh tương đồng CBIR.
- **`com.vietblog.domain.service.PostDomainService`:** Tính `calculateTrendingScore` (Reddit Hot + HN Gravity 1.8 + Wilson Lower Bound 95%) và `haversineDistanceKm`.
- **`com.vietblog.infrastructure.search.SearchFileReader`:** Trích xuất văn bản thuần từ tệp `.pdf` (Apache PDFBox 3.0.8), `.docx` (JDK `ZipInputStream` + StAX `XMLInputFactory`) và `.txt`.

## 3.5. Kết quả thực nghiệm định lượng và đo lường
Toàn bộ bộ kiểm thử thực nghiệm tự động (`AlgorithmEvaluationTest.java`) gồm 7 ca benchmark đã được chạy thực tế trên Gradle với tổng thời gian thực thi toàn suite thuật toán là **1.232 giây** (0 lỗi, 0 ca bị bỏ qua).

### 1. Phân tích cảm xúc (Blog Test Corpus — 60 mẫu & Bộ chuẩn UIT-VSFC — 3,166 mẫu)

**Bảng 1A — Kết quả trên Blog Test Corpus (60 mẫu bình luận thực tế):**

| Nhãn cảm xúc | Tổng số mẫu | TP | FP | FN | Precision (%) | Recall (%) | F1-Score (%) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **POSITIVE (Tích cực)** | 20 | 19 | 0 | 1 | 100.00% | 95.00% | **97.44%** |
| **NEGATIVE (Tiêu cực)** | 20 | 20 | 1 | 0 | 95.24% | 100.00% | **97.56%** |
| **NEUTRAL (Trung tính)** | 20 | 20 | 0 | 0 | 100.00% | 100.00% | **100.00%** |
| **TRUNG BÌNH (Macro-Average)** | **60** | - | - | - | **98.41%** | **98.33%** | **98.33%** |
| **ĐỘ CHÍNH XÁC TOÀN CỤC (Accuracy)** | **60** | 59 đúng | 1 sai | - | - | - | **98.33% (59/60)** |

**Bảng 1B — Kiểm chứng tổng quát hóa trên bộ chuẩn UIT-VSFC Test (3,166 mẫu đánh giá sinh viên):**

| Nhãn cảm xúc | Tổng số mẫu | TP | FP | FN | Precision (%) | Recall (%) | F1-Score (%) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **POSITIVE** | 1,590 | 1,365 | 282 | 225 | 82.88% | 85.85% | **84.34%** |
| **NEGATIVE** | 1,409 | 674 | 54 | 735 | 92.58% | 47.84% | **63.08%** |
| **NEUTRAL** | 167 | 113 | 678 | 54 | 14.29% | 67.66% | **23.59%** |
| **TRUNG BÌNH (Macro-Average)** | **3,166** | - | - | - | **63.25%** | **67.12%** | **57.00%** |
| **ĐỘ CHÍNH XÁC TOÀN CỤC (Accuracy)** | **3,166** | 2,152 đúng | - | - | - | - | **67.97% (2,152/3,166)** |

> **Nhận xét:** Trên ngữ cảnh bình luận blog tiếng Việt (60 mẫu), thuật toán đạt Accuracy **98.33%** và Macro F1 **98.33%** (Neutral đạt 100.00%). Trên bộ chuẩn ngoài miền UIT-VSFC gồm 3,166 câu phản hồi giảng dạy (nhiều câu viết tắt, teencode và góp ý gián tiếp), hệ thống đạt Accuracy **67.97%**, Precision lớp Negative đạt **92.58%**, phản ánh rõ tính trung thực của mô hình rule-based + embedding so với giới hạn từ vựng miền chuyên biệt.

### 2. Tìm kiếm ngữ nghĩa, Hình ảnh CBIR 51-D, Tóm tắt TextRank, Trending & Haversine

**Bảng 2 — Tổng hợp kết quả thực nghiệm các thuật toán còn lại (so sánh trực tiếp với Baseline):**

| Thuật toán | Phương pháp đối chứng (Baseline) | Đề xuất (VietBlog) | Kết quả đo được |
|---|---|---|---|
| **Tìm kiếm ngữ nghĩa** (6 truy vấn) | Exact Keyword AND (MAP **16.67%**, R@3 **16.67%**) | Vector 256-D + Cosine + Accent Fold | **MAP 91.67%**, **Recall@3 100.00%** |
| **Tìm kiếm ảnh CBIR** (5 truy vấn) | 3-D Global RGB Mean (P@1 **80.00%**, R@2 **80.00%**, MAP **88.33%**) | 51-D (32 HSV + 16 Sobel + 3 GLCM) | **P@1 100.00%**, **R@2 90.00%**, **MAP 95.00%** |
| **Tóm tắt TextRank** | Lead-2 (R-1 F1 **6.69%**, R-2 F1 **0.82%**) | TF-IDF + Graph TextRank | **ROUGE-1 F1 63.25%** (P 67.40% / R 60.13%), **ROUGE-2 F1 59.86%** |
| **Trending Ranking** (5 tiên đề) | Chronological **20.00%** (1/5); Raw Net Upvotes **80.00%** (4/5) | Reddit Hot + HN Gravity 1.8 + Wilson 95% | **Pairwise Accuracy 100.00% (5/5)**; Wilson 1/1 (`0.207`) vs 40/41 (`0.874`) |
| **Định vị Haversine** (8 mốc TP.HCM) | Đường tròn lớn tham chiếu (Great-Circle) | Haversine Java (`R = 6371 km`) | **MAE 0.000244 km**, Max Error **0.001576 km**, **P/R 100.00%** (ngưỡng ≤5km & ≤10km) |

### 3. Thời gian thực thi đo được trên tập kiểm thử & Build Frontend
- **Thời gian chạy 7 ca benchmark `AlgorithmEvaluationTest`:** Tổng suite **1.232 giây** (trong đó Sentiment UIT-VSFC 3,166 mẫu mất **0.586 giây**, CBIR 51-D **0.31 giây**, Semantic Search **0.078 giây**, TextRank **0.07 giây**, Trending **0.065 giây**, Sentiment Blog **0.047 giây**, Haversine **0.016 giây**).
- **Thời gian biên dịch Production Frontend (`vite build`):** Hoàn thành trong **8.73 giây** (`vue-tsc -b && vite build`, biến đổi 2.443 module) với 0 lỗi TypeScript.

## 3.6. Minh chứng giao diện thực tế của hệ thống
Hệ thống đã được kiểm thử toàn diện trên trình duyệt với các màn hình chính:
1. **Trang chủ & Bảng tin Thịnh hành (`/`):** Hiển thị danh sách bài viết được sắp xếp theo điểm số xu hướng tự động, hỗ trợ phân loại theo danh mục và gắn thẻ tag sinh động.
2. **Trang Chi tiết bài viết (`/posts/:slug`):** Khối tóm tắt AI TextRank hiển thị ở đầu bài, tích hợp trình đọc tiến trình, mục tác giả và cây bình luận lồng nhau đa cấp.
3. **Trang Tìm kiếm Đa chế độ (`/search`):** Thanh công cụ chuyển đổi nhanh giữa 5 chế độ tìm kiếm, hiển thị kết quả theo dạng thẻ trực quan kèm điểm số liên quan ngữ nghĩa.
4. **Trang Bản đồ số bài viết (`/map`):** Bản đồ tương tác Leaflet hiển thị vị trí bài viết theo tọa độ GPS thực tế kèm bán kính tìm kiếm quanh vị trí hiện tại.
5. **Trang Quản trị Admin (`/admin`):** Dashboard trực quan hiển thị biểu đồ phân bố cảm xúc bình luận người dùng, bảng quản lý người dùng và duyệt bài viết.
6. **Cửa sổ Chat thời gian thực (`/chat`):** Hỗ trợ chat 1-1 và chat nhóm, tôn trọng quyền riêng tư nhắn tin và gửi thông báo trực tiếp trên web theo tùy chọn cá nhân.
7. **Trang Cài đặt & Xác thực Email (`/settings`, `/register`, `/forgot-password`):** Luồng xác thực OTP 6 chữ số gửi qua Gmail SMTP và đồng bộ cài đặt Thông báo / Quyền riêng tư hai chiều với CSDL PostgreSQL.

---

\newpage

# KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 1. Những kết quả đã đạt được
Sau 15 tuần nghiên cứu, thiết kế và phát triển nghiêm túc, đề tài **"Xây dựng Web App Quản lý bài viết tích hợp AI (VietBlog)"** đã hoàn thành toàn bộ mục tiêu cốt lõi đã đăng ký trong đề cương:
1. **Về mặt Khoa học & Giải thuật:** Tự nghiên cứu, mô hình hóa toán học và lập trình thành công 6 nhóm giải thuật cốt lõi (Trending Ranking, Semantic Search 256-D, Image Search 51-D, Document Search PDF/DOCX/TXT, Geospatial Search Haversine/PostGIS, TextRank Summarization và Hybrid Sentiment Analysis) từ đầu bằng Java thuần túy. Kết quả benchmark cho thấy Sentiment đạt **98.33% Accuracy** (Blog Corpus) và **67.97% Accuracy** (UIT-VSFC 3,166 mẫu), Semantic Search **91.67% MAP**, CBIR 51-D **95.00% MAP**, TextRank **63.25% ROUGE-1 F1** và Trending Ranking **100.00% Pairwise Accuracy**.
2. **Về mặt Kỹ thuật Phần mềm:** Ứng dụng thành công mô hình Pragmatic Clean Architecture cho Backend Spring Boot 4 (23 bảng PostgreSQL + pgvector) và mô hình phân tầng Layered Architecture cho Frontend Vue 3 + TypeScript. Hệ thống bổ sung hoàn chỉnh luồng xác thực Gmail SMTP OTP, bảo mật HttpOnly Cookie JWT, kiểm thử tự động toàn diện và cài đặt Thông báo / Quyền riêng tư đồng bộ CSDL.
3. **Về mặt Sản phẩm Thực tiễn:** Xây dựng một ứng dụng web Single Page Application hoàn chỉnh, thẩm mỹ, có trải nghiệm mượt mà, tích hợp đầy đủ các nghiệp vụ hiện đại từ xác thực Google OAuth, Email OTP, tương tác mạng xã hội, chat thời gian thực WebSocket đến bản đồ hóa nội dung số.

## 2. Hạn chế của đề tài
- Bộ từ điển cảm xúc tiếng Việt hiện tại dù đạt độ chính xác tốt nhưng vẫn cần được cập nhật liên tục các từ lóng (slang), teencode mới của giới trẻ.
- Giải thuật tìm kiếm hình ảnh dựa trên các đặc trưng thị giác cổ điển (HSV, Sobel, GLCM) chạy rất nhanh và nhẹ tài nguyên, nhưng chưa phân tích sâu được các đặc trưng ngữ nghĩa mức cao (như nhận diện khuôn mặt hay chủng loại đồ vật cụ thể).

## 3. Hướng phát triển trong tương lai
- Phát triển thêm phiên bản ứng dụng di động (Mobile App) trên Flutter hoặc React Native sử dụng chung hệ thống REST API Backend hiện tại.
- Nâng cấp mô hình tìm kiếm ngữ nghĩa kết hợp mô hình học sâu nhẹ (TinyBERT / PhoBERT dạng ONNX Runtime) để tăng cường khả năng hiểu ngữ cảnh tiếng Việt phức tạp mà vẫn giữ được tính tự chủ mã nguồn.
- Mở rộng tính năng gợi ý bài viết cá nhân hóa (Collaborative Filtering) dựa trên lịch sử đọc và tương tác của từng người dùng.

---

\newpage

# TÀI LIỆU THAM KHẢO

1. **R. C. Martin**, *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Boston, MA: Prentice Hall, 2017.
2. **E. You**, "Vue.js 3 Documentation," *Vue.js Official Documentation*, 2024. [Online]. Available: https://vuejs.org/guide/introduction.html.
3. **Pivotal Software & VMware**, "Spring Boot Reference Documentation," *Spring.io*, 2024. [Online]. Available: https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/.
4. **PostgreSQL Global Development Group**, "PostgreSQL 16 Documentation," *PostgreSQL.org*, 2024. [Online]. Available: https://www.postgresql.org/docs/16/.
5. **PostGIS Project Steering Committee**, "PostGIS Spatial Database Extension Documentation," *PostGIS.net*, 2024. [Online]. Available: https://postgis.net/documentation/.
6. **Redis Ltd.**, "Redis Documentation and Pub/Sub Messaging," *Redis.io*, 2024. [Online]. Available: https://redis.io/documentation.
7. **I. Fette and A. Melnikov**, "The WebSocket Protocol," *Internet Engineering Task Force (IETF)*, RFC 6455, 2011. [Online]. Available: https://datatracker.ietf.org/doc/html/rfc6455.
8. **C. D. Manning, P. Raghavan, and H. Schütze**, *Introduction to Information Retrieval*. Cambridge, UK: Cambridge University Press, 2008.
9. **R. M. Haralick, K. Shanmugam, and I. Dinstein**, "Textural Features for Image Classification," *IEEE Transactions on Systems, Man, and Cybernetics*, vol. SMC-3, no. 6, pp. 610-621, 1973.
10. **R. Mihalcea and P. Tarau**, "TextRank: Bringing Order into Texts," in *Proc. of the Conference on Empirical Methods in Natural Language Processing (EMNLP)*, Barcelona, Spain, 2004, pp. 404-411.
11. **G. Salton, A. Wong, and C. S. Yang**, "A Vector Space Model for Automatic Indexing," *Communications of the ACM*, vol. 18, no. 11, pp. 613-620, 1975.
12. **C. J. Hutto and E. E. Gilbert**, "VADER: A Parsimonious Rule-based Model for Sentiment Analysis of Social Media Text," in *Eighth International AAAI Conference on Weblogs and Social Media*, 2014.
