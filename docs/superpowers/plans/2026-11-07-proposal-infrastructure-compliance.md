# Proposal Infrastructure Compliance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate real PostGIS (`ST_DWithin`, `ST_Distance`), `pgvector` (`vector` Cosine similarity `<=>`), Redis 7+ (`Cache` + auto-detected `Pub/Sub Chat`), and Docker Compose infrastructure while preserving 100% of custom Java algorithms and resilient local/H2 execution.

**Architecture:** Clean Architecture ports (`SearchIndexGateway`, `CacheGateway`) in the Application layer decouple pure-Java Domain algorithms (`TextAlgorithms`, `ImageAlgorithms`, `GeoAlgorithms`) from PostgreSQL/PostGIS/`pgvector` JDBC adapters and Redis Cache/Pub-Sub adapters in the Infrastructure layer. All infrastructure adapters detect capabilities at runtime and fall back cleanly when extensions or Redis are unavailable.

**Tech Stack:** Java 17, Spring Boot 4.0.8, PostgreSQL 16+ (`postgis`, `pgvector`), Redis 7+, JUnit 5, Mockito, Docker Compose.

## Global Constraints
- Domain classes (`com.vietblog.domain.**`) must remain 100% pure Java with zero Spring, JDBC, JPA, or Redis imports.
- Existing test constructors (`SearchApplicationServiceTest`, `AdminServiceTest`, `ReportServiceTest`, `AdminAuthorizationTest`, `VietblogBackendApplicationTests`) must continue to compile and pass without breaking H2 integration tests.
- All Infrastructure accelerators (`PostGIS`, `pgvector`, `Redis`) must degrade gracefully without throwing errors when running against H2 or when `pgvector`/`Redis` is offline.

---

### Task 1: Domain Fixed-Dimension TF-IDF Feature Hashing Vector (`TextAlgorithms`)

**Files:**
- Modify: `backend/src/main/java/com/vietblog/domain/search/TextAlgorithms.java`
- Test: `backend/src/test/java/com/vietblog/domain/search/SearchAlgorithmsTest.java`

**Interfaces:**
- Produces:
  - `TextAlgorithms.TEXT_VECTOR_DIMENSIONS = 256`
  - `public static double[] hashedTfIdfVector(String text)`
  - `public static double[] hashedTfIdfVector(String text, int dimensions)`

- [ ] **Step 1: Write failing unit tests in `SearchAlgorithmsTest.java`** testing `TextAlgorithms.hashedTfIdfVector` for 256 dimensions, L2 unit norm (`1.0`), empty/stopword-only zero vector, and higher cosine similarity between related Vietnamese sentences than unrelated ones.
- [ ] **Step 2: Run `SearchAlgorithmsTest` to verify RED failure.**
- [ ] **Step 3: Implement `hashedTfIdfVector` in `TextAlgorithms.java`** using sublinear TF (`1 + ln(tf)`) over unigrams and bigrams, deterministic FNV-1a signed hashing into `dimensions`, and L2 normalization.
- [ ] **Step 4: Run `SearchAlgorithmsTest` to verify GREEN pass.**

---

### Task 2: Application Ports & PostgreSQL (`PostGIS` + `pgvector`) Search Gateway

**Files:**
- Create: `backend/src/main/java/com/vietblog/application/port/SearchIndexGateway.java`
- Create: `backend/src/main/java/com/vietblog/infrastructure/search/PostgresSearchGateway.java`
- Modify: `backend/src/main/java/com/vietblog/application/service/SearchApplicationService.java`
- Modify: `backend/src/main/java/com/vietblog/application/service/PostApplicationService.java`
- Modify: `backend/src/main/java/com/vietblog/application/service/CoverImageIndexer.java`
- Test: `backend/src/test/java/com/vietblog/infrastructure/search/PostgresSearchGatewayTest.java`

**Interfaces:**
- Produces:
  - `SearchIndexGateway`:
    - `Optional<List<String>> findNearbyCandidateIds(double latitude, double longitude, double radiusKm, int limit)`
    - `Optional<List<String>> findSemanticCandidateIds(double[] queryVector, int limit)`
    - `Optional<List<String>> findImageCandidateIds(double[] queryVector, int limit)`
    - `void upsertPostTextVector(String postId, double[] vector)`
    - `void upsertPostImageVector(String postId, double[] vector)`
    - `void deletePostVectors(String postId)`
  - `PostgresSearchGateway.toVectorLiteral(double[] vector)` -> `"[0.123,-0.456,...]"`

- [ ] **Step 1: Write failing unit tests in `PostgresSearchGatewayTest.java`** verifying vector literal formatting, PostGIS `ST_DWithin` / `ST_Distance` delegation, `pgvector` `<=>` candidate delegation in `SearchApplicationService`, and automatic fallback to pure-Java corpus evaluation when `Optional.empty()` is returned.
- [ ] **Step 2: Run `PostgresSearchGatewayTest` to verify RED failure.**
- [ ] **Step 3: Implement `SearchIndexGateway`, `PostgresSearchGateway`, and wire into `SearchApplicationService`, `PostApplicationService`, and `CoverImageIndexer`** (preserving existing constructors for unit test compatibility).
- [ ] **Step 4: Run `PostgresSearchGatewayTest`, `SearchApplicationServiceTest`, and `SearchHttpIntegrationTest` to verify GREEN pass.**

---

### Task 3: Resilient Redis Cache & Auto-Detected Redis Pub/Sub Chat

**Files:**
- Create: `backend/src/main/java/com/vietblog/application/port/CacheGateway.java`
- Create: `backend/src/main/java/com/vietblog/infrastructure/cache/ResilientRedisCacheGateway.java`
- Modify: `backend/src/main/java/com/vietblog/infrastructure/config/ChatRedisConfig.java`
- Modify: `backend/src/main/java/com/vietblog/infrastructure/messaging/ChatEventRelay.java`
- Modify: `backend/src/main/java/com/vietblog/application/service/CategoryApplicationService.java`
- Modify: `backend/src/main/java/com/vietblog/application/service/PostApplicationService.java`
- Modify: `backend/src/main/java/com/vietblog/application/service/ReactionApplicationService.java`
- Modify: `backend/src/main/java/com/vietblog/application/service/CommentApplicationService.java`
- Modify: `backend/src/main/resources/application.yml`
- Test: `backend/src/test/java/com/vietblog/infrastructure/cache/RedisComplianceTest.java`

**Interfaces:**
- Produces:
  - `CacheGateway`: `Optional<String> get(String key)`, `void put(String key, String json, Duration ttl)`, `void evict(String key)`
  - `ChatEventRelay` supporting `"true"`, `"false"`, and `"auto"` (default `"auto"`).

- [ ] **Step 1: Write failing unit tests in `RedisComplianceTest.java`** verifying Redis cache hit/miss/evict, circuit-breaker fallback on Redis outage, and `ChatEventRelay` auto-mode Redis Pub/Sub vs local WebSocket fallback.
- [ ] **Step 2: Run `RedisComplianceTest` to verify RED failure.**
- [ ] **Step 3: Implement `CacheGateway`, `ResilientRedisCacheGateway`, wire category & trending cache + eviction, and upgrade `ChatRedisConfig` + `ChatEventRelay` + `application.yml`.**
- [ ] **Step 4: Run `RedisComplianceTest` and `ChatWebSocketTests` to verify GREEN pass.**

---

### Task 4: Docker Compose Stack (`PostgreSQL + PostGIS + pgvector` & `Redis 7`) + Full Verification

**Files:**
- Create: `docker/postgres/Dockerfile`
- Create: `docker/postgres/init-extensions.sql`
- Create: `docker-compose.yml`

- [ ] **Step 1: Create `docker/postgres/Dockerfile`, `docker/postgres/init-extensions.sql`, and `docker-compose.yml`** providing PostgreSQL 16 with both `postgis` and `pgvector` pre-installed plus `redis:7-alpine`.
- [ ] **Step 2: Run full Backend test suite (`./gradlew test --no-daemon`) and Frontend type-check (`npx vue-tsc -b`)** to verify 0 errors and 100% green tests.
- [ ] **Step 3: Commit all changes cleanly to `feature/proposal-compliance` and update `audit_report.md`.**

