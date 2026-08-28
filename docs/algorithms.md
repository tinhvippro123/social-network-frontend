# 🔬 Giải thuật nghiên cứu — VietBlog

> **Lưu ý**: Tất cả giải thuật trong bài được **tự viết** theo hướng nghiên cứu khoa học (NCKH), không sử dụng thư viện AI/ML có sẵn, không train/test mô hình AI.

---

## 1. Giải thuật xếp hạng bài viết xu hướng (Trending Ranking)

### 1.1 Bài toán

Xác định bài viết nào đang "hot" (trending) tại một thời điểm, cân bằng giữa:
- **Popularity** (số vote, view, comment)
- **Freshness** (bài mới được ưu tiên hơn bài cũ)
- **Engagement rate** (tốc độ tương tác)

### 1.2 Nghiên cứu tham khảo

| Platform | Công thức | Đặc điểm |
|---|---|---|
| **Reddit Hot** | `score = log10(max(abs(s), 1)) + sign(s) × t / 45000` | Logarithmic voting + linear time |
| **Hacker News** | `score = (votes - 1)^0.8 / (age + 2)^1.8` | Gravity-based decay |
| **Wilson Score** | Lower bound of Wilson confidence interval | Statistical approach |

### 1.3 Công thức VietBlog (Tự phát triển)

Kết hợp ưu điểm của Reddit Hot và Hacker News, thêm trọng số cho engagement:

```
trending_score = popularity_score × time_decay × engagement_boost

Trong đó:
  popularity_score = log10(1 + upvotes×3 + comments×2 + views×0.01)
  
  time_decay = 1 / (hours_since_post + 2)^gravity
    • gravity = 1.5 (điều chỉnh tốc độ giảm)
    
  engagement_boost = 1 + min(comment_rate / view_rate, 2) × 0.3
    • comment_rate = comments_in_last_hour
    • view_rate = max(views_in_last_hour, 1)
```

### 1.4 Pseudocode

```java
public double calculateTrendingScore(Post post) {
    // 1. Popularity: logarithmic scale để tránh bài nhiều vote quá áp đảo
    double rawScore = post.getUpvotes() * 3.0
                    + post.getComments() * 2.0
                    + post.getViews() * 0.01;
    double popularityScore = Math.log10(1 + Math.max(rawScore, 0));
    
    // 2. Time Decay: bài cũ hơn thì score giảm dần
    double hoursAge = ChronoUnit.HOURS.between(post.getCreatedAt(), Instant.now());
    double gravity = 1.5;
    double timeDecay = 1.0 / Math.pow(hoursAge + 2, gravity);
    
    // 3. Engagement Boost: bài có tương tác sôi nổi được bonus
    double commentRate = getCommentsInLastHour(post.getId());
    double viewRate = Math.max(getViewsInLastHour(post.getId()), 1);
    double engagementBoost = 1.0 + Math.min(commentRate / viewRate, 2.0) * 0.3;
    
    return popularityScore * timeDecay * engagementBoost;
}
```

### 1.5 Cập nhật Score

- **Cron job** chạy mỗi 5 phút
- Tính lại `trending_score` cho các bài viết trong 72h gần nhất
- Lưu vào cột `posts.trending_score`
- Client query: `ORDER BY trending_score DESC`

---

## 2. Tìm kiếm ngữ nghĩa (Semantic Search)

### 2.1 Bài toán

Tìm bài viết theo **ý nghĩa** chứ không chỉ khớp từ khóa.
Ví dụ: search "cách deploy ứng dụng" → tìm được bài "Hướng dẫn triển khai app lên server"

### 2.2 Phương pháp: TF-IDF + Cosine Similarity (tự viết)

> Không dùng thư viện NLP. Tự implement từ đầu.

#### Bước 1: Tiền xử lý văn bản (Text Preprocessing)

```
Input: "Hướng dẫn xây dựng REST API với Spring Boot 3"

1. Lowercase: "hướng dẫn xây dựng rest api với spring boot 3"
2. Remove stopwords: "hướng dẫn xây dựng rest api spring boot"
3. Tokenize: ["hướng", "dẫn", "xây", "dựng", "rest", "api", "spring", "boot"]
4. N-grams (bi-gram): ["hướng dẫn", "xây dựng", "rest api", "spring boot"]
```

#### Bước 2: TF-IDF Vector

```
TF(t, d) = (Số lần term t xuất hiện trong document d) / (Tổng số terms trong d)

IDF(t) = log(N / (1 + df(t)))
  • N = tổng số documents
  • df(t) = số documents chứa term t

TF-IDF(t, d) = TF(t, d) × IDF(t)
```

#### Bước 3: Cosine Similarity

```
similarity(A, B) = (A · B) / (||A|| × ||B||)

         Σ(Ai × Bi)
    = ─────────────────────
      √(Σ Ai²) × √(Σ Bi²)
```

#### Bước 4: Lưu trữ với pgvector

```sql
-- Tạo extension
CREATE EXTENSION vector;

-- Thêm cột vector vào bảng posts
ALTER TABLE posts ADD COLUMN content_vector vector(384);

-- Tạo index cho tìm kiếm nhanh
CREATE INDEX ON posts USING ivfflat (content_vector vector_cosine_ops)
  WITH (lists = 100);

-- Query tìm kiếm
SELECT id, title, 1 - (content_vector <=> query_vector) AS similarity
FROM posts
WHERE 1 - (content_vector <=> query_vector) > 0.3
ORDER BY content_vector <=> query_vector
LIMIT 20;
```

### 2.3 Pseudocode

```java
public class SemanticSearchEngine {
    private Map<String, Double> idfCache;  // Pre-computed IDF values
    
    // Tính TF-IDF vector cho một document
    public double[] computeVector(String text) {
        List<String> tokens = preprocess(text);
        Map<String, Double> tfMap = computeTF(tokens);
        
        double[] vector = new double[VOCAB_SIZE];
        for (Map.Entry<String, Double> entry : tfMap.entrySet()) {
            int index = getVocabIndex(entry.getKey());
            if (index >= 0) {
                vector[index] = entry.getValue() * idfCache.getOrDefault(entry.getKey(), 0.0);
            }
        }
        return normalize(vector);
    }
    
    // Tìm kiếm
    public List<SearchResult> search(String query, int topK) {
        double[] queryVector = computeVector(query);
        // Sử dụng pgvector để tìm nearest neighbors
        return postRepository.findByCosineSimilarity(queryVector, topK);
    }
}
```

---

## 3. Tìm kiếm theo hình ảnh / tài liệu (Image & Document Search)

### 3.1 Bài toán

Cho phép upload hình ảnh hoặc tài liệu → tìm bài viết liên quan.

### 3.2 Phương pháp: Feature Extraction → Vector → Similarity Search

#### Hình ảnh: Color Histogram + Edge Detection (tự viết)

```
1. Resize ảnh về 224×224
2. Trích xuất Color Histogram (HSV, 64 bins)
3. Trích xuất Edge features (Sobel operator)
4. Concatenate → vector 384 chiều
5. Normalize vector
6. Lưu vào pgvector → search bằng Cosine Similarity
```

#### Tài liệu: Text Extraction → TF-IDF

```
1. Đọc file (PDF/DOCX) → extract raw text
2. Tiền xử lý → TF-IDF vector (giống Section 2)
3. Search trong pgvector
```

### 3.3 Pseudocode (Image)

```java
public class ImageVectorizer {
    
    public double[] extractFeatures(BufferedImage image) {
        // Resize
        BufferedImage resized = resize(image, 224, 224);
        
        // 1. Color Histogram (HSV space, 64 bins)
        double[] colorHist = computeColorHistogram(resized, 64);  // 64-dim
        
        // 2. Edge features (Sobel operator)
        double[] edgeFeatures = computeEdgeHistogram(resized);    // 64-dim
        
        // 3. Texture features (Gray-Level Co-occurrence Matrix)
        double[] textureFeatures = computeGLCM(resized);          // 256-dim
        
        // Concatenate all features
        double[] vector = concatenate(colorHist, edgeFeatures, textureFeatures); // 384-dim
        
        return normalize(vector);
    }
    
    private double[] computeColorHistogram(BufferedImage img, int bins) {
        double[] histogram = new double[bins];
        for (int y = 0; y < img.getHeight(); y++) {
            for (int x = 0; x < img.getWidth(); x++) {
                int rgb = img.getRGB(x, y);
                float[] hsv = rgbToHsv(rgb);
                int bin = (int)(hsv[0] / 360.0 * bins);
                histogram[Math.min(bin, bins - 1)]++;
            }
        }
        // Normalize
        double total = Arrays.stream(histogram).sum();
        return Arrays.stream(histogram).map(v -> v / total).toArray();
    }
}
```

---

## 4. Bản đồ hóa bài viết & Tìm kiếm xung quanh (Geo Search)

### 4.1 Bài toán

- Đính kèm tọa độ GPS vào bài viết
- Tìm bài viết trong bán kính N km quanh một điểm

### 4.2 Phương pháp: PostGIS Spatial Queries

#### Lưu trữ

```sql
-- Cột location kiểu GEOMETRY (Point, SRID 4326 = WGS84)
ALTER TABLE posts ADD COLUMN location GEOMETRY(Point, 4326);

-- Spatial index
CREATE INDEX idx_posts_location ON posts USING GIST (location);

-- Insert với tọa độ
INSERT INTO posts (title, location)
VALUES ('Quán cafe Quận 1', ST_SetSRID(ST_MakePoint(106.6953, 10.7769), 4326));
```

#### Tìm kiếm trong bán kính

```sql
-- Tìm bài viết trong bán kính 5km từ vị trí người dùng
SELECT id, title,
       ST_Distance(location::geography, 
                   ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) AS distance_meters
FROM posts
WHERE ST_DWithin(location::geography,
                 ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                 :radius_meters)
ORDER BY distance_meters ASC;
```

### 4.3 Haversine Formula (tự viết — backup khi không dùng PostGIS)

```java
public double haversineDistance(double lat1, double lng1, double lat2, double lng2) {
    final double R = 6371; // Bán kính Trái Đất (km)
    
    double dLat = Math.toRadians(lat2 - lat1);
    double dLng = Math.toRadians(lng2 - lng1);
    
    double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
             + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
             * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Khoảng cách tính bằng km
}
```

---

## 5. Chat Real-time (Redis Pub/Sub + WebSocket)

### 5.1 Kiến trúc

```
Client A                    Server                     Client B
   │                          │                           │
   │── WebSocket CONNECT ────>│                           │
   │                          │<── WebSocket CONNECT ─────│
   │                          │                           │
   │── SEND message ─────────>│                           │
   │                          │── Save to DB              │
   │                          │── PUBLISH Redis channel ──│
   │                          │                           │
   │                          │── SUBSCRIBE notification ─│
   │                          │── WebSocket PUSH ─────────>│
   │<── ACK ──────────────────│                           │
```

### 5.2 Redis Pub/Sub

```
Channel naming: chat:{conversationId}

PUBLISH chat:conv_001 '{"senderId":"u1","content":"Hello","timestamp":1234567890}'

SUBSCRIBE chat:conv_001
```

### 5.3 Lý do dùng Redis thay vì chỉ WebSocket

| | Chỉ WebSocket | WebSocket + Redis |
|---|---|---|
| Single server | ✅ OK | ✅ OK |
| Multiple servers | ❌ Mất tin nhắn | ✅ Pub/Sub đồng bộ |
| Offline users | ❌ Mất | ✅ Queue trong Redis |
| Performance | Bình thường | ✅ Cache + fast delivery |

---

## Tham khảo

1. Reddit Ranking Algorithm — https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work-ef111e33d0d9
2. Hacker News Ranking — https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d
3. TF-IDF — Manning, C.D., Raghavan, P., Schütze, H. (2008). Introduction to Information Retrieval. Cambridge University Press.
4. Cosine Similarity — Wikipedia
5. PostGIS Documentation — https://postgis.net/docs/
6. pgvector — https://github.com/pgvector/pgvector
