# Defense-Ready Platform Dataset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all placeholder, mismatched, and fourth-wall-breaking seed data in VietBlog with a modular, version-gated, 100% cohesive Vietnamese demonstration dataset ready for live presentation to the HCMUNRE Specialized Project Defense Committee.

**Architecture:** Extract seed catalogs into `com.vietblog.infrastructure.config.seed` (`SeedModels`, `TechAndEventPostsCatalog`, `LifestyleTravelFoodPostsCatalog`, `CommunityAndSocialCatalog`), simplify `DatabaseSeeder` to category bootstrap, and orchestrate FK-safe transactional reset & version-gated seeding (`seed.dataset.version = "defense-2026-v1"`) in `ExtendedDataSeeder`. Verify dataset integrity and AI algorithm compatibility via automated JUnit tests and live PostgreSQL boot verification.

**Tech Stack:** Java 21, Spring Boot 3, Spring Data JPA, PostgreSQL, JUnit 5.

## Global Constraints

- Preserve login credentials and roles for `admin@vietblog.com` (`Password123!`), `nguyenvanan@gmail.com` (`Password123!`), `lethanhtinh2004@gmail.com`, and `1250080199@sv.hcmunre.edu.vn`.
- Gate destructive table cleanup behind `SystemSetting("seed.dataset.version", "defense-2026-v1")` so subsequent server restarts do not wipe manual demo actions.
- Zero English notification messages, zero duplicated boilerplate group posts, zero mismatched stock images, and zero fourth-wall "demo/grading/committee" chat messages.
- Every seeded `Post` must exceed 400 characters of clean HTML with unnumbered `<h2>`/`<h3>` headings and punctuated sentences so `TextAlgorithms.summarize` (`tfidf-textrank-v1`) produces coherent Vietnamese sentences.
- Seeded comments must naturally span `positive`, `neutral`, and `negative` labels under `TextAlgorithms.sentiment` (`lexicon-v1`).

---

### Task 1: Define Immutable Seed Data Models (`SeedModels.java`)

**Files:**
- Create: `backend/src/main/java/com/vietblog/infrastructure/config/seed/SeedModels.java`

- [ ] **Step 1: Create `SeedModels.java` with typed records for users, posts, 3-level comment trees, groups, group discussions, chats, and moderation reports, plus HTML gallery helper methods.**
- [ ] **Step 2: Compile backend (`./gradlew compileJava`) to verify record definitions.**

---

### Task 2: Build Technology & Event Posts Catalog (`TechAndEventPostsCatalog.java`)

**Files:**
- Create: `backend/src/main/java/com/vietblog/infrastructure/config/seed/TechAndEventPostsCatalog.java`

- [ ] **Step 1: Author 6 in-depth Technology posts (`cong-nghe`) and 3 Event posts (`su-kien`) with code blocks, architecture discussions, accurate Vietnam GPS coordinates, future `eventStartTime`/`eventEndTime`, topic-matched inline images, and 3-level nested comment threads.**
- [ ] **Step 2: Compile backend (`./gradlew compileJava`) to verify syntax.**

---

### Task 3: Build Travel, Food & Lifestyle Posts Catalog (`LifestyleTravelFoodPostsCatalog.java`)

**Files:**
- Create: `backend/src/main/java/com/vietblog/infrastructure/config/seed/LifestyleTravelFoodPostsCatalog.java`

- [ ] **Step 1: Author 4 Travel posts (`du-lich`), 4 Food posts (`am-thuc`), and 3 Lifestyle posts (`doi-song`) featuring natural multi-section Collage Galleries (2, 3, 4, and 5–6 topic-matched images with Vietnamese `alt` text), GPS coordinates across Vietnam, and topic-specific 3-level comment trees.**
- [ ] **Step 2: Compile backend (`./gradlew compileJava`) to verify syntax.**

---

### Task 4: Build Community Groups, Real-Time Chats & Social Catalog (`CommunityAndSocialCatalog.java`)

**Files:**
- Create: `backend/src/main/java/com/vietblog/infrastructure/config/seed/CommunityAndSocialCatalog.java`

- [ ] **Step 1: Author 14 realistic Vietnamese user profiles, 8 community groups each with 3 unique topic-matched `GroupPost` items + comments, 4 group chats + 8 direct 1-on-1 chats (including pinned announcements, image messages, and threaded `replyTo` messages, with zero fourth-wall demo talk), and 6 realistic moderation reports (`PENDING`, `RESOLVED`, `DISMISSED`).**
- [ ] **Step 2: Compile backend (`./gradlew compileJava`) to verify syntax.**

---

### Task 5: Wire Version-Gated Orchestrator (`DatabaseSeeder.java` & `ExtendedDataSeeder.java`) and Quality Tests

**Files:**
- Modify: `backend/src/main/java/com/vietblog/infrastructure/config/DatabaseSeeder.java`
- Modify: `backend/src/main/java/com/vietblog/infrastructure/config/ExtendedDataSeeder.java`
- Create: `backend/src/test/java/com/vietblog/infrastructure/config/seed/DefenseDatasetQualityTest.java`

- [ ] **Step 1: Remove dummy 1-sentence posts from `DatabaseSeeder.java` so it strictly initializes standard categories (`cong-nghe`, `du-lich`, `am-thuc`, `doi-song`, `su-kien`).**
- [ ] **Step 2: Rewrite `ExtendedDataSeeder.java` to check `seed.dataset.version`, perform FK-safe cleanup when upgrading to `"defense-2026-v1"`, seed users/follows, posts/comments/reactions/bookmarks/notifications, groups, chats, and reports, compute `PostDomainService.calculateTrendingScore`, and synchronize all entity counters.**
- [ ] **Step 3: Write `DefenseDatasetQualityTest.java` validating every catalog item against defense quality rules (minimum post length, zero forbidden fourth-wall phrases, distinct group post titles, valid TextRank summarization, non-zero positive/neutral/negative sentiment distribution).**
- [ ] **Step 4: Run `./gradlew test` and verify 0 failures.**

---

### Task 6: Live PostgreSQL Refresh & End-to-End API Verification

**Files:**
- Runtime verification against `http://localhost:8080`

- [ ] **Step 1: Stop background backend task `task-3376`, restart `./gradlew bootRun` (`BypassSandbox: true`, `IsDaemon: true`), and inspect startup logs to confirm clean transactional refresh to `defense-2026-v1`.**
- [ ] **Step 2: Query live REST endpoints (`/api/v1/posts`, `/api/v1/groups`, `/api/v1/chat/conversations`, `/api/v1/notifications`, `/api/v1/admin/stats`, `/api/v1/search/sentiment-stats`) to verify 100% clean Vietnamese data.**

