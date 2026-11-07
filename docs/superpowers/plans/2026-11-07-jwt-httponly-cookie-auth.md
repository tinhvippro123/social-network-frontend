# JWT HttpOnly Cookie Authentication & Silent Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate VietBlog's JWT authentication from `localStorage` to secure `HttpOnly` cookies (`vietblog_access_token` + `vietblog_refresh_token`) with automatic single-flight silent refresh on REST `401` responses, F5 session bootstrap via `vietblog_logged_in=1`, and WebSocket `/ws/chat` handshake cookie authentication.

**Architecture:** The Spring Boot Backend issues two `HttpOnly` JWT cookies (`access` token at `Path=/` for 24h and `refresh` token at `Path=/api/auth` for 7d) plus a non-sensitive `vietblog_logged_in=1` flag cookie (`HttpOnly=false`, `Path=/`) via `AuthCookieService`, while omitting raw JWT strings from JSON responses. `JwtAuthenticationFilter` and `ChatWebSocketHandler` extract the access JWT from cookies first while preserving fallback support for `Authorization: Bearer` headers and WebSocket `auth` frames so all existing tests remain green. On the Vue 3 Frontend, Axios (`withCredentials: true`, `X-Requested-With: XMLHttpRequest`) queues concurrent `401` failures behind a single `POST /api/auth/refresh` call, Pinia stores `user` strictly in memory, and Vue Router hydrates the session on F5 only when `vietblog_logged_in=1` is present.

**Tech Stack:** Java 17, Spring Boot 4.0.8, Spring Security, JJWT, JUnit 5, MockMvc, Vue 3.5, Pinia 4, Vue Router 4, Axios 1.20, TypeScript 6.

## Global Constraints
- Never store `accessToken`, `refreshToken`, or serialized `user` JSON in browser `localStorage`; actively purge legacy keys (`vietblog_access_token`, `vietblog_refresh_token`, `vietblog_user`) on store initialization and logout.
- Enforce strict JWT `type` claim isolation: Refresh JWTs (`type=refresh`) must be rejected by `JwtAuthenticationFilter` and `ChatWebSocketHandler`, and Access JWTs (`type=access`) must be rejected by `/api/auth/refresh`. Legacy test tokens without a `type` claim remain valid as access tokens for backward compatibility with existing integration tests.
- Keep backward-compatible constructors (`ChatWebSocketHandler` 5-arg constructor) and `Authorization: Bearer` fallback so all 25 existing Backend JUnit test classes continue to pass without modification.
- Avoid deprecated `org.springframework.lang.Nullable` on Spring Boot 4 so `compileJava` produces zero compiler warnings.

---

### Task 1: Backend Token Type Isolation & `AuthCookieService`

**Files:**
- Modify: `backend/src/main/resources/application.yml`
- Modify: `backend/src/main/java/com/vietblog/infrastructure/security/JwtTokenProvider.java`
- Create: `backend/src/main/java/com/vietblog/infrastructure/security/AuthCookieService.java`
- Test: `backend/src/test/java/com/vietblog/infrastructure/security/AuthCookieAndTokenTest.java`

**Interfaces:**
- Produces:
  - `JwtTokenProvider.generateTokenFromUserId(String userId)` (issues `type=access` JWT)
  - `JwtTokenProvider.generateRefreshTokenFromUserId(String userId)` (issues `type=refresh` JWT with `jti`)
  - `JwtTokenProvider.validateToken(String authToken)` (accepts `access` or legacy untyped JWT; rejects `refresh` JWT)
  - `JwtTokenProvider.validateRefreshToken(String refreshToken)` (accepts only `type=refresh` JWT)
  - `AuthCookieService`:
    - `writeAuthCookies(HttpServletResponse response, String accessToken, String refreshToken)`
    - `clearAuthCookies(HttpServletResponse response)`
    - `extractAccessToken(HttpServletRequest request)`
    - `extractRefreshToken(HttpServletRequest request)`
    - `extractAccessTokenFromHeaders(HttpHeaders headers)`

- [ ] **Step 1: Write failing unit tests in `AuthCookieAndTokenTest.java`**

```java
package com.vietblog.infrastructure.security;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AuthCookieAndTokenTest {

    private JwtTokenProvider tokenProvider;
    private AuthCookieService cookieService;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "jwtSecret",
                "VietBlog2026SecretKeyForJWTTokenGenerationMustBeAtLeast256Bits");
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationInMs", 86_400_000L);
        ReflectionTestUtils.setField(tokenProvider, "refreshExpirationInMs", 604_800_000L);

        cookieService = new AuthCookieService(
                "vietblog_access_token",
                "vietblog_refresh_token",
                "vietblog_logged_in",
                false,
                "Lax",
                "",
                86_400_000L,
                604_800_000L
        );
    }

    @Test
    void accessAndRefreshTokensAreStrictlyIsolatedByType() {
        String access = tokenProvider.generateTokenFromUserId("user-123");
        String refresh = tokenProvider.generateRefreshTokenFromUserId("user-123");

        assertThat(tokenProvider.validateToken(access)).isTrue();
        assertThat(tokenProvider.validateRefreshToken(access)).isFalse();

        assertThat(tokenProvider.validateRefreshToken(refresh)).isTrue();
        assertThat(tokenProvider.validateToken(refresh)).isFalse();

        assertThat(tokenProvider.getUserIdFromJWT(access)).isEqualTo("user-123");
        assertThat(tokenProvider.getUserIdFromJWT(refresh)).isEqualTo("user-123");
    }

    @Test
    void writeAndClearCookiesSetExpectedSecurityAttributes() {
        MockHttpServletResponse response = new MockHttpServletResponse();
        cookieService.writeAuthCookies(response, "acc-jwt", "ref-jwt");

        List<String> setCookies = response.getHeaders(HttpHeaders.SET_COOKIE);
        assertThat(setCookies).hasSize(3);
        assertThat(setCookies).anySatisfy(c -> {
            assertThat(c).contains("vietblog_access_token=acc-jwt");
            assertThat(c).contains("HttpOnly");
            assertThat(c).contains("Path=/");
            assertThat(c).contains("SameSite=Lax");
        });
        assertThat(setCookies).anySatisfy(c -> {
            assertThat(c).contains("vietblog_refresh_token=ref-jwt");
            assertThat(c).contains("HttpOnly");
            assertThat(c).contains("Path=/api/auth");
            assertThat(c).contains("SameSite=Lax");
        });
        assertThat(setCookies).anySatisfy(c -> {
            assertThat(c).contains("vietblog_logged_in=1");
            assertThat(c).doesNotContain("HttpOnly");
            assertThat(c).contains("Path=/");
        });

        MockHttpServletResponse clearResponse = new MockHttpServletResponse();
        cookieService.clearAuthCookies(clearResponse);
        assertThat(clearResponse.getHeaders(HttpHeaders.SET_COOKIE))
                .hasSize(3)
                .allSatisfy(c -> assertThat(c).contains("Max-Age=0"));
    }

    @Test
    void extractsTokensFromServletCookiesAndWebSocketHandshakeHeaders() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setCookies(
                new Cookie("vietblog_access_token", "cookie-access"),
                new Cookie("vietblog_refresh_token", "cookie-refresh")
        );
        assertThat(cookieService.extractAccessToken(req)).isEqualTo("cookie-access");
        assertThat(cookieService.extractRefreshToken(req)).isEqualTo("cookie-refresh");

        HttpHeaders wsHeaders = new HttpHeaders();
        wsHeaders.add(HttpHeaders.COOKIE, "vietblog_theme=dark; vietblog_access_token=ws-jwt; vietblog_logged_in=1");
        assertThat(cookieService.extractAccessTokenFromHeaders(wsHeaders)).isEqualTo("ws-jwt");
    }
}
```

- [ ] **Step 2: Run `AuthCookieAndTokenTest` to verify RED failure**

Run: `cd backend; .\gradlew.bat test --tests com.vietblog.infrastructure.security.AuthCookieAndTokenTest --no-daemon`
Expected: FAIL (`cannot find symbol AuthCookieService` / `generateRefreshTokenFromUserId`).

- [ ] **Step 3: Update `application.yml`, `JwtTokenProvider.java`, and create `AuthCookieService.java`**

Add `jwt.cookie` block in `backend/src/main/resources/application.yml`:
```yaml
jwt:
  secret: ${JWT_SECRET:VietBlog2026SecretKeyForJWTTokenGenerationMustBeAtLeast256Bits}
  access-token-expiration: 86400000   # 24 hours
  refresh-token-expiration: 604800000 # 7 days
  cookie:
    access-name: ${JWT_ACCESS_COOKIE_NAME:vietblog_access_token}
    refresh-name: ${JWT_REFRESH_COOKIE_NAME:vietblog_refresh_token}
    status-name: ${JWT_STATUS_COOKIE_NAME:vietblog_logged_in}
    secure: ${JWT_COOKIE_SECURE:false}
    same-site: ${JWT_COOKIE_SAME_SITE:Lax}
    domain: ${JWT_COOKIE_DOMAIN:}
```

Update `JwtTokenProvider.java` with `refreshExpirationInMs`, `generateRefreshTokenFromUserId`, `validateToken` (rejecting `"refresh"`), and `validateRefreshToken` (requiring `"refresh"`), and implement `AuthCookieService.java` using Spring `ResponseCookie`.

- [ ] **Step 4: Run `AuthCookieAndTokenTest` to verify GREEN pass**

Run: `cd backend; .\gradlew.bat test --tests com.vietblog.infrastructure.security.AuthCookieAndTokenTest --no-daemon`
Expected: `BUILD SUCCESSFUL`.

---

### Task 2: Backend REST `HttpOnly` Cookie Auth, Silent Refresh & Logout

**Files:**
- Create: `backend/src/main/java/com/vietblog/application/dto/auth/AuthSessionResult.java`
- Modify: `backend/src/main/java/com/vietblog/application/dto/auth/JwtAuthenticationResponse.java`
- Modify: `backend/src/main/java/com/vietblog/application/dto/auth/RefreshTokenRequest.java`
- Modify: `backend/src/main/java/com/vietblog/application/service/AuthService.java`
- Modify: `backend/src/main/java/com/vietblog/presentation/controller/AuthController.java`
- Modify: `backend/src/main/java/com/vietblog/infrastructure/security/JwtAuthenticationFilter.java`
- Test: `backend/src/test/java/com/vietblog/CookieAuthenticationIntegrationTest.java`

**Interfaces:**
- Consumes: `AuthCookieService`, `JwtTokenProvider` from Task 1.
- Produces:
  - `AuthSessionResult(String accessToken, String refreshToken, JwtAuthenticationResponse.UserDto user)`
  - `AuthService.login(...) -> AuthSessionResult`
  - `AuthService.loginWithGoogle(...) -> AuthSessionResult`
  - `AuthService.refreshToken(String token) -> AuthSessionResult`
  - Cookie-backed `/api/auth/login`, `/api/auth/google`, `/api/auth/refresh`, `/api/auth/logout`, and cookie-aware `JwtAuthenticationFilter`.

- [ ] **Step 1: Write failing integration test `CookieAuthenticationIntegrationTest.java`**

```java
package com.vietblog;

import com.vietblog.domain.entity.User;
import com.vietblog.infrastructure.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Transactional
class CookieAuthenticationIntegrationTest extends VietblogBackendApplicationTests {

    @Autowired WebApplicationContext context;
    @Autowired UserRepository users;
    @Autowired PasswordEncoder passwordEncoder;

    private MockMvc mvc;
    private String email;

    @BeforeEach
    void setup() {
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        email = "cookie-" + UUID.randomUUID() + "@vietblog.test";
        users.saveAndFlush(User.builder()
                .name("Cookie Tester")
                .email(email)
                .password(passwordEncoder.encode("Password123!"))
                .role(User.Role.USER)
                .isActive(true)
                .build());
    }

    @Test
    void loginSetsHttpOnlyCookiesOmitsTokenInJsonAndSupportsRefreshAndLogout() throws Exception {
        MvcResult loginResult = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"Password123!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.email").value(email))
                .andExpect(jsonPath("$.data.accessToken").doesNotExist())
                .andReturn();

        Cookie accessCookie = loginResult.getResponse().getCookie("vietblog_access_token");
        Cookie refreshCookie = loginResult.getResponse().getCookie("vietblog_refresh_token");
        Cookie statusCookie = loginResult.getResponse().getCookie("vietblog_logged_in");

        assertThat(accessCookie).isNotNull();
        assertThat(accessCookie.isHttpOnly()).isTrue();
        assertThat(refreshCookie).isNotNull();
        assertThat(refreshCookie.isHttpOnly()).isTrue();
        assertThat(statusCookie).isNotNull();
        assertThat(statusCookie.isHttpOnly()).isFalse();
        assertThat(statusCookie.getValue()).isEqualTo("1");

        // Authenticate /api/auth/me purely via HttpOnly cookie (no Authorization header)
        mvc.perform(get("/api/auth/me").cookie(accessCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value(email));

        // Refresh token cannot be abused as an access token
        Cookie forgedAccess = new Cookie("vietblog_access_token", refreshCookie.getValue());
        mvc.perform(get("/api/auth/me").cookie(forgedAccess))
                .andExpect(status().isUnauthorized());

        // Silent refresh works with empty body using only the HttpOnly refresh cookie
        MvcResult refreshResult = mvc.perform(post("/api/auth/refresh")
                        .cookie(refreshCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.email").value(email))
                .andExpect(jsonPath("$.data.accessToken").doesNotExist())
                .andReturn();

        Cookie rotatedAccess = refreshResult.getResponse().getCookie("vietblog_access_token");
        assertThat(rotatedAccess).isNotNull();
        mvc.perform(get("/api/auth/me").cookie(rotatedAccess))
                .andExpect(status().isOk());

        // Logout expires all cookies
        MvcResult logoutResult = mvc.perform(post("/api/auth/logout").cookie(rotatedAccess))
                .andExpect(status().isOk())
                .andReturn();
        List<String> cleared = logoutResult.getResponse().getHeaders(HttpHeaders.SET_COOKIE);
        assertThat(cleared).hasSize(3).allSatisfy(h -> assertThat(h).contains("Max-Age=0"));
    }
}
```

- [ ] **Step 2: Run `CookieAuthenticationIntegrationTest` to verify RED failure**

Run: `cd backend; .\gradlew.bat test --tests com.vietblog.CookieAuthenticationIntegrationTest --no-daemon`
Expected: FAIL (`$.data.accessToken` exists and `vietblog_access_token` cookie is null).

- [ ] **Step 3: Implement `AuthSessionResult`, update DTOs, `AuthService`, `AuthController`, and `JwtAuthenticationFilter`**

1. `AuthSessionResult.java`: `public record AuthSessionResult(String accessToken, String refreshToken, JwtAuthenticationResponse.UserDto user) {}`
2. `JwtAuthenticationResponse.java`: annotate with `@JsonInclude(JsonInclude.Include.NON_NULL)` and add convenience constructor `public JwtAuthenticationResponse(UserDto user) { this(null, user); }`.
3. `RefreshTokenRequest.java`: remove `@NotBlank` so `token` is optional when supplied via `HttpOnly` cookie.
4. `AuthService.java`: update `login`, `loginWithGoogle`, and `refreshToken` (using `tokenProvider.validateRefreshToken(token)`) to issue both `accessToken` and `refreshToken` and return `AuthSessionResult`.
5. `AuthController.java`: inject `AuthCookieService`; write cookies on `/login`, `/google`, and `/refresh` (extracting refresh token from cookie first, falling back to `request != null ? request.getToken() : null`, throwing `BusinessRuleException(ErrorCode.UNAUTHORIZED)` if blank); clear cookies on `/logout`.
6. `JwtAuthenticationFilter.java`: inject `AuthCookieService` and resolve JWT from `authCookieService.extractAccessToken(request)` first, falling back to `Authorization: Bearer `.

- [ ] **Step 4: Run `CookieAuthenticationIntegrationTest` to verify GREEN pass**

Run: `cd backend; .\gradlew.bat test --tests com.vietblog.CookieAuthenticationIntegrationTest --no-daemon`
Expected: `BUILD SUCCESSFUL`.

---

### Task 3: Backend WebSocket Handshake Cookie Authentication

**Files:**
- Modify: `backend/src/main/java/com/vietblog/infrastructure/config/ChatWebSocketConfig.java`
- Modify: `backend/src/main/java/com/vietblog/infrastructure/messaging/ChatWebSocketHandler.java`
- Modify: `backend/src/test/java/com/vietblog/ChatWebSocketTests.java`

**Interfaces:**
- Consumes: `AuthCookieService.extractAccessTokenFromHeaders(HttpHeaders)` from Task 1.
- Produces: Handshake cookie authentication on `/ws/chat` and `/ws` while preserving 5-arg `ChatWebSocketHandler` constructor and `auth` frame fallback.

- [ ] **Step 1: Add failing handshake cookie test in `ChatWebSocketTests.java`**

```java
    @Test void handshakeCookieAuthenticatesImmediatelyWithoutAuthFrame() throws Exception {
        WebSocketSession cookieSession = mock(WebSocketSession.class);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add(org.springframework.http.HttpHeaders.COOKIE, "vietblog_access_token=cookie-valid");
        when(cookieSession.getId()).thenReturn("cookie-session");
        when(cookieSession.isOpen()).thenReturn(true);
        when(cookieSession.getHandshakeHeaders()).thenReturn(headers);
        when(tokens.validateToken("cookie-valid")).thenReturn(true);
        when(tokens.getUserIdFromJWT("cookie-valid")).thenReturn("user-1");

        handler.afterConnectionEstablished(cookieSession);
        verify(cookieSession).sendMessage(argThat(m -> ((TextMessage) m).getPayload().contains("\"authenticated\"")));

        clearInvocations(cookieSession);
        when(chat.canReceive("conversation", "user-1")).thenReturn(true);
        handler.deliver(new ChatEvent("message.created", "conversation", "user-1", Map.of("content", "hello")));
        verify(cookieSession).sendMessage(any(TextMessage.class));
    }
```

- [ ] **Step 2: Run `ChatWebSocketTests` to verify RED failure**

Run: `cd backend; .\gradlew.bat test --tests com.vietblog.ChatWebSocketTests --no-daemon`
Expected: FAIL (`Wanted but not invoked: cookieSession.sendMessage(...)`).

- [ ] **Step 3: Update `ChatWebSocketConfig.java` and `ChatWebSocketHandler.java`**

1. In `ChatWebSocketConfig.java`: register `registry.addHandler(handler, "/ws/chat", "/ws").setAllowedOrigins(allowedOrigins);`.
2. In `ChatWebSocketHandler.java`:
   - Add `@Autowired` constructor accepting `AuthCookieService` and keep the existing 5-arg constructor delegating with `AuthCookieService.defaultInstance()`.
   - In `afterConnectionEstablished(WebSocketSession session)`, safely check `session.getHandshakeHeaders()` (null-safe for mocked sessions); if `cookieService.extractAccessTokenFromHeaders(headers)` yields a valid active-user JWT, store `new Client(session, userId, cookieToken, now)` and send `Map.of("type", "authenticated", "userId", userId)`.
   - In `handleTextMessage`, if `"auth".equals(frame.type())` arrives on an already cookie-authenticated session, reply `authenticated` idempotently instead of throwing `"Unsupported frame type"`.

- [ ] **Step 4: Run full Backend test suite and commit Backend repository**

Run: `cd backend; .\gradlew.bat test --no-daemon`
Expected: `BUILD SUCCESSFUL` across all 27 JUnit test classes with zero compiler warnings.

Commit in `backend`:
```powershell
git -C backend add -A
git -C backend commit -m "feat(auth): migrate JWT storage to HttpOnly cookies with silent refresh and WS handshake auth"
```

---

### Task 4: Frontend `HttpOnly` Cookie Integration, Silent Refresh Queue & Zero `localStorage` Auth

**Files:**
- Create: `frontend/src/utils/cookies.ts`
- Modify: `frontend/src/constants/index.ts`
- Modify: `frontend/src/stores/auth.store.ts`
- Modify: `frontend/src/api/client.ts`
- Modify: `frontend/src/api/auth.api.ts`
- Modify: `frontend/src/router/index.ts`
- Modify: `frontend/src/composables/auth/useAuth.ts`
- Modify: `frontend/src/stores/ui.store.ts`
- Modify: `frontend/src/composables/core/useWebSocket.ts`
- Modify: `frontend/src/components/AuthLoginForm.vue`
- Modify: `frontend/src/components/AuthRegisterForm.vue`
- Modify: `frontend/.env`

**Interfaces:**
- Produces:
  - `COOKIE_NAMES.LOGGED_IN = 'vietblog_logged_in'`
  - `hasAuthSessionCookie(): boolean` & `clearAuthIndicatorCookie(): void` in `frontend/src/utils/cookies.ts`
  - `useAuthStore().bootstrapSession(): Promise<void>`

- [ ] **Step 1: Create `frontend/src/utils/cookies.ts` and update `frontend/src/constants/index.ts`**

Create `frontend/src/utils/cookies.ts`:
```ts
import { COOKIE_NAMES } from '@/constants'

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined' || !document.cookie) return null
  const prefix = `${encodeURIComponent(name)}=`
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim()
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length))
    }
  }
  return null
}

export function hasAuthSessionCookie(): boolean {
  return getCookie(COOKIE_NAMES.LOGGED_IN) === '1'
}

export function clearAuthIndicatorCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${encodeURIComponent(COOKIE_NAMES.LOGGED_IN)}=; Max-Age=0; path=/; SameSite=Lax`
}
```

Update `STORAGE_KEYS` and add `COOKIE_NAMES` in `frontend/src/constants/index.ts`:
```ts
export const STORAGE_KEYS = {
  THEME: 'vietblog_theme',
} as const

export const COOKIE_NAMES = {
  LOGGED_IN: 'vietblog_logged_in',
} as const
```

- [ ] **Step 2: Update `auth.store.ts`, `auth.api.ts`, and `client.ts` (with `withCredentials: true` & single-flight refresh)**

1. `frontend/src/stores/auth.store.ts`:
   - Remove `localStorage` read/writes for tokens and user; purge legacy `'vietblog_access_token'`, `'vietblog_refresh_token'`, and `'vietblog_user'` keys in `purgeLegacyLocalStorage()`.
   - Keep `user = ref<User | null>(null)` and `isInitialized = ref(false)` in memory.
   - Add single-flight `bootstrapSession()` calling `authApi.getProfile()` (`skipErrorToast: true`) only when `hasAuthSessionCookie()` is true and `!user.value`.
   - `clearAuth()` resets `user.value = null`, calls `clearAuthIndicatorCookie()`, and calls `purgeLegacyLocalStorage()`.
2. `frontend/src/api/auth.api.ts`:
   - Make `accessToken?: string` optional on `AuthTokens`.
   - Update `refreshToken: () => http.post<ApiResponse<AuthTokens & { user: User }>>('/auth/refresh', {})`.
   - Allow `getProfile(config?: Record<string, unknown>)` to pass `{ skipErrorToast: true }` during silent boot.
3. `frontend/src/api/client.ts`:
   - Enable `withCredentials: true` and `'X-Requested-With': 'XMLHttpRequest'` on `axios.create(...)`.
   - Remove the `localStorage` `Authorization: Bearer` request interceptor.
   - Add single-flight `refreshAccessToken()` in the `401` response interceptor: if `!isAuthEndpoint` (`/auth/login`, `/auth/register`, `/auth/google`, `/auth/refresh`, `/auth/logout`), `!originalConfig._retry`, and `(hadSessionCookie || authStore.isLoggedIn)`, mark `originalConfig._retry = true`, await single-flight `POST /auth/refresh`, update `authStore.setUser(...)`, and replay `http(originalConfig)`! On refresh failure, call `authStore.clearAuth()`, redirect to `/login` (unless silent boot on a public route), and show toast.

- [ ] **Step 3: Update `router/index.ts`, `useAuth.ts`, `ui.store.ts`, `useWebSocket.ts`, `AuthLoginForm.vue`, `AuthRegisterForm.vue`, and `.env`**

1. `frontend/src/router/index.ts`: make `router.beforeEach` `async (to, from, next)` and `await authStore.bootstrapSession()` before checking `requiresAdmin`, `requiresModerator`, `requiresAuth`, and `guestOnly`.
2. `frontend/src/composables/auth/useAuth.ts`: remove `authStore.setToken(...)` calls; call `await authApi.logout()` inside `logout()` so Backend expires `HttpOnly` cookies.
3. `frontend/src/components/AuthLoginForm.vue` & `frontend/src/components/AuthRegisterForm.vue`: remove `authStore.setToken(...)` calls.
4. `frontend/src/stores/ui.store.ts`: check `const authStore = useAuthStore(); if (!authStore.isLoggedIn && !hasAuthSessionCookie()) return` in `fetchNotifications()`.
5. `frontend/src/composables/core/useWebSocket.ts`: check `hasAuthSessionCookie() || useAuthStore().isLoggedIn` instead of `localStorage`; start ping on `ws.onopen` (since Backend authenticates via `HttpOnly` cookie during WebSocket handshake and emits `{"type":"authenticated"}`); update `.env` `VITE_WS_URL=ws://localhost:8080/ws/chat`.

- [ ] **Step 4: Run Frontend TypeScript + Vite build verification and commit root repository**

Run:
1. `git grep -n "vietblog_access_token\|STORAGE_KEYS\.ACCESS_TOKEN" frontend/src` -> verify only legacy purge in `auth.store.ts` matches.
2. `cd frontend; npx vue-tsc -b` -> Expected: exit code `0` (`0` TypeScript errors).
3. `cd frontend; npx vite build` -> Expected: clean production bundle build.

Commit root repository (including updated `audit_report.md` and plan):
```powershell
git add -A
git commit -m "feat(auth): switch frontend and websocket auth to HttpOnly cookies with silent refresh"
```

