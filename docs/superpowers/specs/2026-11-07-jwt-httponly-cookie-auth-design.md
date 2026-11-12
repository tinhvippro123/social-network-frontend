# JWT HttpOnly Cookie Authentication & Silent Refresh Design

**Date:** 2026-11-07  
**Project:** VietBlog — Xây dựng Web App Quản lý Bài viết Tích hợp AI  
**Reference:** `Mentor/1250080199_LeThanhTinh_12_DH_CNPM3_DeCuongDACN.docx`

## 1. Objective
Migrate JWT authentication storage from browser `localStorage` to secure `HttpOnly` Cookies with automatic silent token refresh, ensuring:
1. **Zero Sensitive Data in `localStorage`:** Neither JWT tokens (`accessToken`, `refreshToken`) nor serialized `user` profile objects are stored in `localStorage`. Any legacy keys (`vietblog_access_token`, `vietblog_refresh_token`, `vietblog_user`) are actively purged on startup and logout.
2. **Dual `HttpOnly` Cookies + Lightweight Session Indicator:**
   - `vietblog_access_token` (`HttpOnly=true`, `Path=/`, `Max-Age=24h`, `SameSite=Lax`, configurable `Secure`): authenticates REST API requests and WebSocket `/ws/chat` handshakes.
   - `vietblog_refresh_token` (`HttpOnly=true`, `Path=/api/auth`, `Max-Age=7d`, `SameSite=Lax`, configurable `Secure`): scoped strictly to `/api/auth` endpoints for silent token rotation.
   - `vietblog_logged_in=1` (`HttpOnly=false`, `Path=/`, `Max-Age=7d`, `SameSite=Lax`, configurable `Secure`): contains zero sensitive data; signals to the SPA router whether an active cookie session exists so anonymous visitors do not fire unnecessary `GET /api/auth/me` requests.
3. **Full Backward Compatibility for Automated Tests & API Clients:** `JwtAuthenticationFilter` and `ChatWebSocketHandler` prioritize `HttpOnly` cookies while retaining fallback support for `Authorization: Bearer <jwt>` headers and WebSocket `auth` frames.

## 2. Clean Architecture & Component Design

### 2.1 Backend (`com.vietblog`)
- **`JwtTokenProvider` (`infrastructure/security`):**
  - Injects both `${jwt.access-token-expiration}` (`86400000` ms = 24h) and `${jwt.refresh-token-expiration}` (`604800000` ms = 7d).
  - `generateTokenFromUserId(String userId)` issues Access JWTs with `.claim("type", "access")`.
  - `generateRefreshTokenFromUserId(String userId)` issues Refresh JWTs with `.id(UUID.randomUUID().toString())` and `.claim("type", "refresh")`.
  - `validateToken(String authToken)` verifies signature & expiration and rejects tokens whose `"type"` claim equals `"refresh"` (tokens with `"access"` or legacy test tokens without `"type"` are accepted).
  - `validateRefreshToken(String refreshToken)` verifies signature & expiration and requires `"refresh".equals(claims.get("type", String.class))`.
- **`AuthCookieService` (`infrastructure/security`):**
  - Centralizes `ResponseCookie` creation and clearing (`HttpHeaders.SET_COOKIE`) using configurable properties in `application.yml`:
    - `jwt.cookie.access-name` (`vietblog_access_token`)
    - `jwt.cookie.refresh-name` (`vietblog_refresh_token`)
    - `jwt.cookie.status-name` (`vietblog_logged_in`)
    - `jwt.cookie.secure` (`${JWT_COOKIE_SECURE:false}`)
    - `jwt.cookie.same-site` (`${JWT_COOKIE_SAME_SITE:Lax}`)
  - Provides `writeAuthCookies(HttpServletResponse, String accessToken, String refreshToken)`, `clearAuthCookies(HttpServletResponse)`, `extractAccessToken(HttpServletRequest)`, `extractAccessTokenFromHeaders(HttpHeaders)`, and `extractRefreshToken(HttpServletRequest)`.
- **`AuthSessionResult` & `JwtAuthenticationResponse` (`application/dto/auth`) + `AuthService` (`application/service`):**
  - `AuthService.login`, `AuthService.loginWithGoogle`, and `AuthService.refreshToken` return `AuthSessionResult(String accessToken, String refreshToken, UserDto user)`.
  - `RefreshTokenRequest.token` drops `@NotBlank` and `AuthController.refresh` accepts `@RequestBody(required = false) RefreshTokenRequest request` so `POST /api/auth/refresh` works with no body or `{}` when reading the `HttpOnly` refresh cookie (while still accepting a body token as fallback).
  - `AuthController` writes the 3 cookies via `AuthCookieService` on `/login`, `/google`, and `/refresh`, clears all 3 cookies on `/logout`, and returns `JwtAuthenticationResponse` (`@JsonInclude(NON_NULL)` with `accessToken = null` and `user = result.user()`) so raw JWTs are never exposed in JSON responses.
- **`JwtAuthenticationFilter` (`infrastructure/security`):**
  - Resolves JWT via `AuthCookieService.extractAccessToken(request)` first, falling back to `Authorization: Bearer <token>`.
- **`ChatWebSocketConfig` & `ChatWebSocketHandler` (`infrastructure/config`, `infrastructure/messaging`):**
  - `ChatWebSocketConfig` registers `"/ws/chat", "/ws"` with `allowedOrigins`.
  - `ChatWebSocketHandler.afterConnectionEstablished` inspects `session.getHandshakeHeaders()` via `AuthCookieService.extractAccessTokenFromHeaders(...)`. When a valid access cookie for an active user is present, the session is authenticated immediately on handshake and receives `{"type":"authenticated","userId":...}`. Sessions without handshake cookies retain fallback support for the first `{"type":"auth","token":"..."}` frame.

### 2.2 Frontend (`frontend/src`)
- **`utils/cookies.ts` & `constants/index.ts`:**
  - Add `COOKIE_NAMES = { LOGGED_IN: 'vietblog_logged_in' }` and helper `hasAuthSessionCookie()` / `clearClientAuthIndicatorCookie()`.
- **`stores/auth.store.ts`:**
  - Holds `user` and `isInitialized` in Pinia reactive memory only.
  - Purges legacy `localStorage` keys (`vietblog_access_token`, `vietblog_refresh_token`, `vietblog_user`).
  - Exposes single-flight `bootstrapSession()`: if `hasAuthSessionCookie()` is true and `!user.value`, calls `GET /api/auth/me` once to hydrate `user` before route guards run; if `hasAuthSessionCookie()` is false, marks `isInitialized = true` immediately with zero network traffic.
- **`api/client.ts` & `api/auth.api.ts`:**
  - Configures Axios with `withCredentials: true` and `X-Requested-With: 'XMLHttpRequest'`.
  - Removes the `Authorization: Bearer` request interceptor.
  - Implements single-flight silent refresh on `401`: for non-auth endpoints when a session was active (`hasAuthSessionCookie()` or `authStore.isLoggedIn`) and `!originalConfig._retry`, sends one `POST /api/auth/refresh` request, queues concurrent `401` requests, updates `authStore.setUser(...)` on success, and retries queued requests. If refresh fails, clears auth state and redirects to `/login`.
- **`router/index.ts`, `composables/auth/useAuth.ts`, `stores/ui.store.ts`, `composables/core/useWebSocket.ts`, `AuthLoginForm.vue`, `AuthRegisterForm.vue`, `.env`:**
  - `router.beforeEach` awaits `authStore.bootstrapSession()` before evaluating `requiresAdmin`, `requiresModerator`, `requiresAuth`, and `guestOnly`.
  - `useAuth.logout()` calls `await authApi.logout()` so the backend clears `HttpOnly` cookies before clearing client state.
  - `ui.store.fetchNotifications()` and `useWebSocket.ts` check `authStore.isLoggedIn || hasAuthSessionCookie()` instead of `localStorage`; `useWebSocket.ts` starts heartbeat ping on open and sets `isAuthenticated = true` upon receiving the `authenticated` frame.
  - Update `.env` `VITE_WS_URL=ws://localhost:8080/ws/chat`.

## 3. Error Handling & Security Guarantees
- **XSS Protection:** `HttpOnly` prevents `document.cookie` or injected scripts from reading `vietblog_access_token` or `vietblog_refresh_token`.
- **CSRF Protection:** `SameSite=Lax` cookies + Spring Security `CorsConfigurationSource` strict origin allowlist + `Content-Type: application/json` + `X-Requested-With: XMLHttpRequest`.
- **Token Type Isolation:** A `vietblog_refresh_token` (`type=refresh`) is rejected by `JwtAuthenticationFilter` and `ChatWebSocketHandler`; an `access` token is rejected by `/api/auth/refresh`.
- **Disabled/Banned Account Enforcement:** Both `JwtAuthenticationFilter`, `AuthService.refreshToken`, and `ChatWebSocketHandler` verify `user.isActive()` on every check.

## 4. Verification Strategy
- **Backend JUnit 5 & MockMvc Integration Tests:**
  - Unit tests for `JwtTokenProvider` (`access` vs `refresh` token isolation) and `AuthCookieService`.
  - MockMvc integration test (`CookieAuthenticationIntegrationTest`) verifying:
    1. `POST /api/auth/login` sets `HttpOnly` `vietblog_access_token` (`Path=/`), `HttpOnly` `vietblog_refresh_token` (`Path=/api/auth`), and `vietblog_logged_in=1`, while omitting `accessToken` from JSON.
    2. `GET /api/auth/me` succeeds using only the `vietblog_access_token` `Cookie` (without `Authorization` header).
    3. `GET /api/auth/me` rejects `vietblog_refresh_token` if sent as `vietblog_access_token`.
    4. `POST /api/auth/refresh` rotates cookies using only `vietblog_refresh_token` `Cookie` with `{}` body.
    5. `POST /api/auth/logout` expires all 3 cookies (`Max-Age=0`).
  - WebSocket test (`ChatWebSocketTests`) verifying handshake `Cookie: vietblog_access_token=...` authenticates immediately on `afterConnectionEstablished` alongside legacy `auth` frame tests.
  - Full Backend suite (`.\gradlew.bat test --no-daemon`) passes 100%.
- **Frontend Verification:**
  - Zero references to `localStorage` token storage across `frontend/src` and `npx vue-tsc -b` exits with `0` errors.
