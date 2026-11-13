# 🔬 Giải thuật nghiên cứu — VietBlog

> **Lưu ý**: Toàn bộ 6 giải thuật trong hệ thống được **tự cài đặt thuần Java/SQL** từ cơ sở lý thuyết, không sử dụng dịch vụ LLM hay mô hình AI/ML đóng gói sẵn bên ngoài. Tài liệu này mô tả chính xác kiến trúc và công thức đang vận hành trong mã nguồn Backend.

---

## 1. Giải thuật xếp hạng bài viết xu hướng (Trending Ranking)

> Cài đặt tại: `com.vietblog.domain.service.PostDomainService`

### 1.1 Bài toán

Xác định bài viết đang thịnh hành tại một thời điểm, cân bằng giữa:
- **Popularity & Engagement** (lượt upvote, downvote, bình luận và lượt xem)
- **Statistical Confidence** (tránh bài mới có 1-2 lượt vote áp đảo bài có nhiều tương tác ổn định)
- **Freshness** (phân rã theo thời gian đăng bài)

### 1.2 Công thức cài đặt

Kết hợp **Wilson Score Lower Bound** (khoảng tin cậy 95%, $z = 1.96$) với **Hacker News Gravity Decay** ($G = 1.8$):

$$\text{baseScore} = \max(0, \text{upvotes} - \text{downvotes}) \times 2.0 + \text{comments} \times 3.0 + \text{views} \times 0.1$$

$$\text{wilson}(p, n) = \frac{\hat{p} + \frac{z^2}{2n} - z\sqrt{\frac{\hat{p}(1-\hat{p}) + \frac{z^2}{4n}}{n}}}{1 + \frac{z^2}{n}}, \quad n = \text{upvotes} + \text{downvotes},\; \hat{p} = \frac{\text{upvotes}}{n},\; z = 1.96$$

$$\text{agePenalty} = (\text{hoursAge} + 2)^{1.8}$$

$$\text{trendingScore} = \frac{\text{baseScore} \times \big(0.5 + \text{wilson}(\text{upvotes}, \text{downvotes})\big)}{\text{agePenalty}}$$

Điểm `trending_score` được cập nhật trực tiếp mỗi khi bài viết được tạo/sửa, vote, bình luận hoặc tăng lượt xem (với `PESSIMISTIC_WRITE` lock khi đếm view), kết hợp cache trending có cơ chế vô hiệu hóa tức thời.

---

## 2. Tìm kiếm ngữ nghĩa & Tài liệu (Hybrid Hashed TF-IDF + pgvector)

> Cài đặt tại: `com.vietblog.domain.search.TextAlgorithms` và `com.vietblog.application.service.SearchApplicationService`

### 2.1 Kiến trúc 2 tầng (Two-stage Retrieval & Re-ranking)

1. **Tiền xử lý tiếng Việt**: Loại bỏ thẻ HTML (`script`/`style`/tags), giải mã HTML entities, chuẩn hóa Unicode `NFC`, tách từ (`[\p{L}\p{N}]+`), loại bỏ stopwords từ `/nlp/stopwords.txt`.
2. **Stage 1 — Dense `256-D` Signed FNV-1a Hashed TF-IDF (`hashedTfIdfVector`)**:
   - Biểu diễn unigram với trọng số sublinear TF: $1 + \ln(\text{tf})$ và bigram với trọng số $0.75 \times (1 + \ln(\text{tf}))$.
   - Ánh xạ vào vector cố định **256 chiều** bằng hàm băm có dấu 64-bit FNV-1a để giảm va chạm và chuẩn hóa L2.
   - Lưu trong PostgreSQL dưới kiểu `vector(256)` (`pgvector`) để truy xuất top ứng viên nhanh theo Cosine distance.
3. **Stage 2 — Sparse TF-IDF Re-ranking + Accent Folding**:
   - Với tập ứng viên (hoặc tối đa 2.000 bài viết gần nhất), dựng từ điển IDF chung từ corpus (`1 + ln((1 + N) / (1 + df(t)))`) và xếp hạng lại bằng Cosine Similarity chính xác.
   - Hỗ trợ **Unaccented Query Folding** (`Đà Lạt` → `da lat`): khi truy vấn không chứa dấu tiếng Việt, hệ thống tự động đối chiếu trên văn bản đã bỏ dấu và mở rộng tập ứng viên để tìm kiếm tiếng Việt không dấu vẫn chính xác.
4. **Tìm kiếm theo tài liệu (`.txt`, `.pdf`, `.docx`)**: Trích xuất văn bản thuần từ tệp tải lên qua `SearchFileReader` (Apache PDFBox / POI) và đưa qua cùng pipeline tìm kiếm ngữ nghĩa ở trên.

---

## 3. Tìm kiếm hình ảnh theo nội dung (CBIR — `51-D` Multi-modal Feature Vector)

> Cài đặt tại: `com.vietblog.domain.search.ImageAlgorithms` và `com.vietblog.application.service.SearchApplicationService`

### 3.1 Trích xuất đặc trưng (`DIMENSIONS = 51`)

Ảnh tải lên được lấy mẫu chuẩn về lưới **64×64** và trích xuất vector **51 chiều** chia thành 3 nhóm đặc trưng, mỗi nhóm chuẩn hóa L2 và gán trọng số riêng:

| Nhóm đặc trưng | Số chiều | Chi tiết cài đặt | Trọng số |
|---|---:|---|---:|
| **HSV Color Histogram** | `32` | Không gian HSV lượng tử hóa **8 bins Hue × 2 bins Saturation × 2 bins Value** | `0.7` |
| **Sobel Edge Orientation** | `16` | Gradient Sobel $G_x, G_y$ trên ảnh xám, cộng dồn biên độ $\sqrt{G_x^2 + G_y^2}$ vào **16 bins góc** $[-\pi, \pi]$ | `0.2` |
| **GLCM Texture** | `3` | Ma trận đồng xuất hiện mức xám ngang (8 mức): **Contrast** (chuẩn hóa $/49$), **Energy / ASM** ($\sum p^2$), **Homogeneity** ($\sum \frac{p}{1 + \|i-j\|}$) | `0.1` |

Vector `51-D` của ảnh bìa bài viết được lập chỉ mục bất đồng bộ sau khi commit vào bảng `post_image_features` và `pgvector` (`vector(51)`). Khi tìm kiếm, ảnh truy vấn được so khớp bằng **Cosine Similarity**.

---

## 4. Tóm tắt văn bản trích xuất (Extractive TextRank)

> Cài đặt tại: `com.vietblog.domain.search.TextAlgorithms.summarize`

1. Lọc bỏ khối mã nguồn (`<pre>`) và tiêu đề (`<h1>..<h6>`) để tập trung vào đoạn văn xuôi (fallback về toàn văn nếu bài chỉ chứa code/heading).
2. Tách câu nhận biết viết tắt tiếng Việt/Anh (`TP.`, `TS.`, `PGS.`, `ThS.`, `Dr.`, `Mr.`, ...), giới hạn tối đa 200 câu.
3. Tính ma trận trọng số đồ thị câu $w_{ij} = \text{Cosine}(\text{TF-IDF}(S_i), \text{TF-IDF}(S_j))$ với $i \neq j$.
4. Chạy thuật toán **Weighted PageRank (TextRank)** với hệ số giảm chấn $d = 0.85$, xử lý nút treo (dangling nodes), tối đa 100 vòng lặp cho tới khi hội tụ ($\Delta < 10^{-8}$).
5. Chọn $k$ câu có điểm cao nhất và sắp xếp lại theo đúng **thứ tự xuất hiện gốc** trong bài viết để bảo toàn mạch đọc tự nhiên.

---

## 5. Phân tích cảm xúc bình luận tiếng Việt (Hybrid Lexicon + Prototype Embedding)

> Cài đặt tại: `com.vietblog.domain.search.TextAlgorithms.sentiment`

1. **Tách mệnh đề & N-gram (1..4-gram)**: Văn bản được tách theo dấu ngắt mệnh đề (`,`, `.`, `;`, `:`, `!`, `?`, xuống dòng) để phạm vi phủ định không tràn qua mệnh đề khác; khớp cụm từ dài nhất từ 4-gram xuống 1-gram dựa trên bộ từ điển `/nlp/positive_words.txt` và `/nlp/offensive_words.txt`.
2. **Xử lý phủ định & Phủ định kép**: Kiểm tra tối đa 2 từ liền trước trong cùng mệnh đề (`không`, `chẳng`, `chưa`, `hổng`, `chả`, `not`, `never`, `no`), đồng thời nhận diện mẫu phủ định kép khẳng định (ví dụ `"không phải không..."`, `"không hề không..."`).
3. **Từ chuyển ý đối lập (Contrastive Conjunctions)**: Các từ chuyển ý (`nhưng`, `tuy`, `song`, `mà` — loại trừ cụm `"mượt mà"`, `"mặn mà"`, `ngược`) nhân đôi trọng số ($\times 2$) cho các biểu đạt cảm xúc đứng phía sau.
4. **Kết hợp Lexicon & `256-D` Prototype Embedding**:

$$\text{lexiconScore} = \frac{\text{posWeight} - \text{negWeight}}{\text{posWeight} + \text{negWeight}}$$

$$\text{embScore} = \text{Cosine}(\vec{e}_{\text{text}}, \vec{P}_{\text{positive}}) - \text{Cosine}(\vec{e}_{\text{text}}, \vec{P}_{\text{negative}})$$

$$\text{finalScore} = \text{clamp}_{[-1, 1]}\big(0.85 \times \text{lexiconScore} + 0.15 \times \text{embScore}\big)$$

---

## 6. Tìm kiếm bài viết lân cận (Geospatial Search: PostGIS + Haversine)

> Cài đặt tại: `com.vietblog.domain.search.GeoAlgorithms` và `SearchApplicationService.nearby`

1. **Tầng CSDL (Spatial Index)**: Khi có `PostGIS`, sử dụng chỉ mục không gian `GIST` và truy vấn `ST_DWithin` / `ST_Distance` trên hệ quy chiếu WGS 84 (`SRID 4326`).
2. **Tầng Domain (Haversine Exact Filtering & Sorting)**: Tính khoảng cách đường tròn lớn chính xác trên mặt cầu (bán kính Trái Đất $R = 6371.0088\text{ km}$) để lọc và sắp xếp bài viết tăng dần theo khoảng cách thực tế:

$$a = \sin^2\left(\frac{\Delta\varphi}{2}\right) + \cos(\varphi_1)\cos(\varphi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right), \quad d = 2 R \arcsin\left(\sqrt{\min(1, \max(0, a))}\right)$$

---

## Tài liệu tham khảo

1. Manning, C. D., Raghavan, P., & Schütze, H. (2008). *Introduction to Information Retrieval*. Cambridge University Press.
2. Mihalcea, R., & Tarau, P. (2004). *TextRank: Bringing Order into Text*. EMNLP.
3. Haralick, R. M., Shanmugam, K., & Dinstein, I. (1973). *Textural Features for Image Classification* (GLCM). IEEE Transactions on Systems, Man, and Cybernetics.
4. Wilson, E. B. (1927). *Probable inference, the law of succession, and statistical inference*. Journal of the American Statistical Association.
5. PostGIS Documentation — https://postgis.net/docs/
6. pgvector — https://github.com/pgvector/pgvector
