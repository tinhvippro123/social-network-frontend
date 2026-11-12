# Hướng dẫn Deploy VietBlog: Neon + Northflank + Vercel

Kiến trúc triển khai:
- **Database:** Neon (PostgreSQL 16 + `postgis` + `vector`)
- **Backend + Redis:** Northflank (Docker Web Service + optional Redis Addon)
- **Frontend:** Vercel (Vite SPA)
- **Media Storage:** Cloudinary

---

## 1. Neon (Database PostgreSQL 16)

1. Tạo project với region **Singapore (`ap-southeast-1`)**, Postgres **16**, database **`vietblog`**.
2. Trong **SQL Editor** (chọn đúng database `vietblog`), bật 2 extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Trong **Connect** → tắt **Connection pooling** (dùng Direct connection cho Hibernate `ddl-auto: update` và trigger PostGIS), chọn **Parameters only** / **Java** để lấy:
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<host-direct>/vietblog?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME`: `vietblog_owner`
   - `SPRING_DATASOURCE_PASSWORD`: `<password>`

---

## 2. Northflank (Backend Spring Boot + Redis tùy chọn)

### A. Tạo Redis Addon (tùy chọn, dùng Free Addon của Northflank)
1. Trong Project Northflank → **Addons → Create Addon → Redis** (gói Free).
2. Khi kết nối xong, lấy thông tin kết nối nội bộ (`HOST`, `PORT`, `USERNAME`, `PASSWORD`) để truyền vào Backend Service ở bước dưới.
   - *(Nếu không tạo Redis, đặt `CHAT_REDIS_ENABLED=false` — backend tự fallback an toàn).*

### B. Tạo Backend Service
1. **Services → Create Service → Combined Service** → chọn repo GitHub **`social-network-backend`**.
2. Cấu hình Build:
   - **Build Type:** `Dockerfile`
   - **Build Context:** `/`
   - **Dockerfile Path:** `/Dockerfile`
   *(Nếu repo backend nằm trong thư mục con `backend/` của một repo lớn thì mới đặt `/backend` và `/backend/Dockerfile`.)*
3. Cấu hình Port & Health Check:
   - **Port:** `8080` (`HTTP`, Public)
   - **Health Check Path (optional):** `/api/public/health` (lưu ý lần đầu khởi động với Neon trống có seed dữ liệu, nên đặt initial delay khoảng `45–60s`).
4. Thêm **Environment Variables** (tham khảo [`backend/.env.example`](../backend/.env.example)):
   - `PORT` = `8080`
   - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://<host-direct-neon>/vietblog?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME` = `vietblog_owner`
   - `SPRING_DATASOURCE_PASSWORD` = `<neon-password>`
   - `CHAT_REDIS_ENABLED` = `auto` *(hoặc `false` nếu không dùng Redis)*
   - `SPRING_DATA_REDIS_HOST` = `<redis-host>` *(nếu có Redis)*
   - `SPRING_DATA_REDIS_PORT` = `<redis-port>` *(nếu có Redis)*
   - `SPRING_DATA_REDIS_USERNAME` = `<redis-user>` *(nếu có)*
   - `SPRING_DATA_REDIS_PASSWORD` = `<redis-password>` *(nếu có)*
   - `SPRING_DATA_REDIS_SSL` = `false` *(đặt `true` nếu dùng Upstash/Redis Cloud TLS)*
   - `JWT_SECRET` = `<chuỗi Base64 hợp lệ >= 44 ký tự, ví dụ sinh bằng openssl rand -base64 48>`
     > ⚠️ **Quan trọng:** `JwtTokenProvider` giải mã `JWT_SECRET` bằng `Decoders.BASE64.decode(...)`, nên **không dùng** ký tự đặc biệt như `-`, `_`, `!` trong `JWT_SECRET`.
   - `JWT_COOKIE_SECURE` = `true`
   - `JWT_COOKIE_SAME_SITE` = `None` *(khi Frontend ở `*.vercel.app` và Backend ở `*.code.run`)*
   - `JWT_COOKIE_DOMAIN` = *(để trống nếu chưa dùng domain riêng)*
   - `CORS_ALLOWED_ORIGINS` = `https://<your-vercel-domain>.vercel.app` *(cập nhật lại sau khi deploy Vercel xong, không có `/` ở cuối)*
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `GOOGLE_CLIENT_ID`

5. Deploy xong, mở thử `https://<northflank-domain>/api/public/health` thấy `{"success":true,"data":{"status":"UP"}}` là Backend đã lên.

---

## 3. Vercel (Frontend Vue 3 SPA)

1. Vào Vercel → **Import Project** → chọn repo GitHub **`social-network-frontend`**.
2. Cấu hình Build:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Thêm **Environment Variables**:
   - `VITE_API_URL` = `https://<northflank-domain>/api`
   - `VITE_WS_URL` = `wss://<northflank-domain>/ws/chat`
   - `VITE_APP_NAME` = `VietBlog`
   - `VITE_GOOGLE_CLIENT_ID` = `<google-client-id>`
4. Bấm **Deploy**.
5. Lấy domain `https://<ten-app>.vercel.app` vừa có, quay lại **Northflank** cập nhật biến `CORS_ALLOWED_ORIGINS` cho khớp chính xác và **Restart/Redeploy** Backend.

---

## 4. Google Cloud Console (Nếu dùng Đăng nhập Google)

1. Vào **APIs & Services → Credentials → OAuth 2.0 Client IDs**.
2. Trong mục **Authorized JavaScript origins**, thêm:
   - `https://<ten-app>.vercel.app` (hoặc domain riêng của bạn sau này).

---

## 5. Khi chuyển sang Domain riêng (ví dụ `vietblog.domain.com` + `api.domain.com`)

Khi đã trỏ 2 subdomain về Vercel & Northflank, đổi lại 3 biến sau để cookie thành **First-party / Same-site** (hoạt động tốt trên cả Safari & Incognito):
- Trên **Northflank**:
  - `JWT_COOKIE_SECURE` = `true`
  - `JWT_COOKIE_SAME_SITE` = `Lax`
  - `JWT_COOKIE_DOMAIN` = `.domain.com`
  - `CORS_ALLOWED_ORIGINS` = `https://vietblog.domain.com`
- Trên **Vercel**:
  - `VITE_API_URL` = `https://api.domain.com/api`
  - `VITE_WS_URL` = `wss://api.domain.com/ws/chat`
  - Redeploy Frontend để Vite build lại với biến môi trường mới.

