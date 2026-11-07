# Proposal Infrastructure Compliance Design (PostGIS + pgvector + Redis Cache & Pub/Sub)

**Date:** 2026-11-07  
**Project:** VietBlog — Xây dựng Web App Quản lý Bài viết Tích hợp AI  
**Reference:** `Mentor/1250080199_LeThanhTinh_12_DH_CNPM3_DeCuongDACN.docx`

## 1. Objective
Ensure 100% strict compliance with every infrastructure technology and algorithmic pipeline specified in the approved thesis proposal (`DeCuongDACN.docx`), while maintaining Clean Architecture and resilient fallback when running unit/integration tests on H2 or running locally without optional daemons:
1. **PostGIS (`ST_DWithin`, `ST_Distance`) + Custom Haversine (`GeoAlgorithms.distanceKm`)** for Geospatial Search (`Location-based Posts`).
2. **`pgvector` (`vector(256)` & `vector(51)`, Cosine Distance `<=>`) + Custom TF-IDF / HSV+Sobel+GLCM + Cosine Similarity (`TextAlgorithms`, `ImageAlgorithms`)** for Semantic Search, Document Search (PDF/DOCX), and Image Search.
3. **Redis 7+ (`Cache` + `Pub/Sub Chat`)** with automatic availability detection so Redis caches Categories & Trending post rankings and relays WebSocket chat events across instances when online, and degrades gracefully without errors when offline.
4. **Docker Compose (`docker-compose.yml` + `docker/postgres/Dockerfile`)** providing a single-command environment with PostgreSQL 16 + PostGIS + `pgvector` + Redis 7.

## 2. Clean Architecture Boundaries
- **Domain Layer (`com.vietblog.domain.search`):**
  - Remains 100% pure Java with zero database/framework imports.
  - Add `TextAlgorithms.hashedTfIdfVector(String text, int dimensions)` (default `TEXT_VECTOR_DIMENSIONS = 256`): tokenizes Vietnamese/English text, removes stopwords, applies sublinear TF (`1 + ln(tf)`) with signed FNV-1a feature hashing (`±weight` per token + bigram) and L2 normalization so every post/query/document maps deterministically to a unit vector in $\mathbb{R}^{256}$ suitable for `pgvector` Cosine similarity.
- **Application Layer (`com.vietblog.application.port` & `com.vietblog.application.service`):**
  - Define `SearchIndexGateway` interface in `application/port` for optional spatial & vector candidate retrieval and vector index synchronization (`syncPostTextAndGeo`, `syncPostImageVector`, `deletePostVectors`, `findNearbyPostIds`, `findSemanticCandidateIds`, `findImageCandidateIds`).
  - Define `CacheGateway` interface in `application/port` (`get`, `put`, `evict`, `evictByPrefix`) used by `CategoryApplicationService` and `PostApplicationService`.
  - Keep existing constructors in `SearchApplicationService`, `CategoryApplicationService`, and `PostApplicationService` overloaded or clean so existing unit tests remain backwards-compatible.
- **Infrastructure Layer (`com.vietblog.infrastructure`):**
  - `PostgresSearchGateway` (`implements SearchIndexGateway`):
    - Inspects JDBC `DatabaseMetaData` on startup (`ApplicationReadyEvent` / lazy init).
    - When connected to PostgreSQL with `postgis` available in `pg_available_extensions`: enables `CREATE EXTENSION IF NOT EXISTS postgis`, adds `geom geography(Point, 4326)` + `GIST` index + automatic sync trigger on `posts`, and executes `ST_DWithin` + `ST_Distance` spatial queries.
    - When connected to PostgreSQL with `vector` (`pgvector`) available in `pg_available_extensions`: enables `CREATE EXTENSION IF NOT EXISTS vector`, creates `post_text_vectors(post_id, embedding vector(256))` and `post_image_features.embedding vector(51)` with vector indexes, backfills published posts, and executes `<=>` Cosine distance nearest-neighbor queries.
  - `ResilientRedisCacheGateway` (`implements CacheGateway`):
    - Uses `StringRedisTemplate` + `ObjectMapper` to store/retrieve cached JSON with TTL and circuit-breaker cooldown (10s) if Redis is unreachable.
  - `ChatRedisConfig` & `ChatEventRelay`:
    - Supports `chat.redis.enabled=auto` (default): probes Redis connectivity before starting `RedisMessageListenerContainer` and relays `ChatEvent` over Redis Pub/Sub channel `vietblog.chat.events` whenever Redis is reachable, falling back to local `ChatWebSocketHandler` delivery otherwise.

## 3. Data Flow & Error Handling
- **Geospatial Search (`/api/posts/nearby`):**
  - If PostGIS is active -> `PostgresSearchGateway.findNearbyPostIds` filters via `ST_DWithin(..., radiusMeters)` and orders by `ST_Distance(...)`, returning candidate post IDs -> `SearchApplicationService` loads published posts and computes exact `GeoAlgorithms.distanceKm` (Haversine) to filter `<= radiusKm` and sort.
  - If PostGIS is inactive (e.g. H2 test) -> falls back to corpus stream + `GeoAlgorithms.distanceKm`.
- **Semantic & Document Search (`/api/search?type=semantic`, `/api/search/document`):**
  - If `pgvector` is active -> `PostgresSearchGateway.findSemanticCandidateIds` queries `post_text_vectors` via `embedding <=> CAST(? AS vector)` -> `SearchApplicationService` scores candidates with corpus IDF + `TextAlgorithms.similarities` (TF-IDF + Cosine Similarity).
  - If `pgvector` is inactive -> scores full published corpus via `TextAlgorithms.similarities`.
- **Image Search (`/api/search/image`):**
  - If `pgvector` is active -> `PostgresSearchGateway.findImageCandidateIds` queries `post_image_features` via `embedding <=> CAST(? AS vector)` -> `SearchApplicationService` verifies/ranks via `ImageAlgorithms.cosine`.
  - If `pgvector` is inactive -> compares against `post_image_features.features` via `ImageAlgorithms.cosine`.
- **Failure Resilience:** Any SQL/Redis runtime failure in an infrastructure accelerator logs a warning and falls back transparently to the pure-Java path without failing user requests.

## 4. Verification Strategy
- JUnit 5 unit tests for:
  - `TextAlgorithms.hashedTfIdfVector` (dimensionality, L2 norm = 1.0, stopword filtering, high cosine similarity on related Vietnamese texts).
  - `PostgresSearchGateway` (SQL formatting of vector literals `[x,y,...]`, candidate delegation and fallback behavior when extensions are disabled or throw).
  - `ResilientRedisCacheGateway` & `ChatEventRelay` (Redis hit/miss/evict and graceful fallback when Redis throws `RedisConnectionFailureException`).
  - Full existing test suite (`AlgorithmEvaluationTest`, `SearchApplicationServiceTest`, `SearchHttpIntegrationTest`, `VietblogBackendApplicationTests`, `AdminServiceTest`, `ReportServiceTest`, `AdminAuthorizationTest`, `ChatWebSocketTests`).

