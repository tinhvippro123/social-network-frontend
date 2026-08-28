# 🚀 VietBlog — Web App Quản lý Bài Viết và Tương tác Nội dung

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**Đồ án chuyên ngành — Trường Đại học Tài nguyên và Môi trường TP.HCM (HCMUNRE)**

</div>

---

## 📋 Mô tả

VietBlog là nền tảng web chia sẻ kiến thức dạng blog, tích hợp các giải thuật tự nghiên cứu và phát triển:

- **Giải thuật xếp hạng bài viết xu hướng** (dựa trên Reddit Hot / Hacker News)
- **Tìm kiếm ngữ nghĩa** (Semantic Search với pgvector + Cosine Similarity)
- **Tìm kiếm theo hình ảnh/tài liệu** (phân rã thành vector → lưu DB → search)
- **Bản đồ hóa bài viết** (PostGIS — tìm kiếm xung quanh vị trí)
- **Chat real-time** (Redis Pub/Sub + WebSocket)

> ⚠️ **Lưu ý**: Tất cả giải thuật trong bài được **tự viết** theo hướng nghiên cứu (NCKH), không sử dụng thư viện AI/ML có sẵn.

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (SPA)                         │
│              Vue 3 + TypeScript + Tailwind v4               │
│         Pinia (State) · Vue Router · WebSocket Client       │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API / WebSocket
┌─────────────────────────▼───────────────────────────────────┐
│                    BACKEND (Spring Boot 3)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │Controller│  │ Use Case │  │  Domain  │  │Infrastructure│ │
│  │ (REST)   │→ │ (Service)│→ │ (Entity) │← │(Repository) │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            Giải thuật tự phát triển                  │    │
│  │  · TrendingRanker · SemanticSearchEngine            │    │
│  │  · ImageVectorizer · GeoSearchService               │    │
│  └─────────────────────────────────────────────────────┘    │
└──────┬──────────────┬──────────────┬────────────────────────┘
       │              │              │
┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼─────┐
│ PostgreSQL  │ │   Redis   │ │ File      │
│ + PostGIS   │ │ (Cache +  │ │ Storage   │
│ + pgvector  │ │  Pub/Sub) │ │ (Upload)  │
└─────────────┘ └───────────┘ └───────────┘
```

> Chi tiết kiến trúc: [docs/architecture.md](docs/architecture.md)
> Chi tiết giải thuật: [docs/algorithms.md](docs/algorithms.md)

---

## ✨ Tính năng

### 👤 Người dùng (Client)
| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Đăng ký / Đăng nhập | JWT + OAuth2 (Google, GitHub) | 🔲 Backend |
| Trang chủ | Feed bài viết, filter danh mục, trending sidebar | ✅ UI |
| Viết bài | Rich text editor, tags, cover image, location | ✅ UI |
| Chi tiết bài | Article view, threaded comments, vote, bookmark | ✅ UI |
| Chat real-time | 1-1 & nhóm, Redis Pub/Sub + WebSocket | ✅ UI |
| Nhóm | Tạo/tham gia nhóm, bài viết nhóm | ✅ UI |
| Bản đồ | PostGIS, tìm bài viết quanh vị trí | ✅ UI |
| Profile | Thông tin cá nhân, bài viết, followers | ✅ UI |
| Tìm kiếm ngữ nghĩa | pgvector, cosine similarity | 🔲 Backend |
| Tìm kiếm hình ảnh | Vector embedding từ ảnh → search | 🔲 Backend |

### 🛡️ Quản trị (Admin)
| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Dashboard | Thống kê tổng quan, biểu đồ | ✅ UI |
| Quản lý người dùng | CRUD, phân quyền, cấm | ✅ UI |
| Quản lý bài viết | Duyệt, ẩn, xóa bài | ✅ UI |
| Kiểm duyệt | Hàng đợi report, xử lý vi phạm | ✅ UI |
| Quản lý danh mục | CRUD danh mục bài viết | ✅ UI |
| Thống kê chi tiết | Biểu đồ tăng trưởng, top danh mục | ✅ UI |
| Cài đặt hệ thống | Toggle tính năng, bảo trì | ✅ UI |

---

## 🛠️ Tech Stack

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| Vue 3 | ^3.5 | SPA Framework (Composition API) |
| TypeScript | ~6.0 | Type safety |
| Tailwind CSS | v4 | Utility-first CSS |
| Pinia | latest | State management |
| Vue Router | v4 | Client-side routing |
| @lucide/vue | latest | Icon library |
| Vite | ^8.2 | Build tool + HMR |

### Backend (Planned)
| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| Spring Boot | 3.x | REST API + WebSocket |
| PostgreSQL | 16 | Database chính |
| PostGIS | 3.x | Spatial queries (bản đồ) |
| pgvector | 0.7+ | Vector similarity search |
| Redis | 7.x | Cache + Pub/Sub (chat) |
| Spring Security | 6.x | JWT + OAuth2 |

---

## 🚀 Cài đặt & Chạy

### Yêu cầu
- Node.js >= 18
- npm >= 9

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Truy cập: **http://localhost:5173/**

### Backend (sẽ bổ sung)

```bash
cd backend
./mvnw spring-boot:run
```

---

## 📁 Cấu trúc thư mục

```
Specialized_Project/
├── frontend/                    # Vue 3 SPA
│   ├── src/
│   │   ├── layouts/             # MainLayout, AuthLayout, AdminLayout
│   │   ├── views/               # Page components
│   │   │   ├── auth/            # Login, Register
│   │   │   ├── posts/           # CreatePost, PostDetail
│   │   │   ├── profile/         # Profile
│   │   │   ├── chat/            # Chat
│   │   │   ├── groups/          # Groups, GroupDetail
│   │   │   ├── map/             # Map (PostGIS)
│   │   │   └── admin/           # Dashboard, Users, Posts, Moderation, ...
│   │   ├── stores/              # Pinia stores
│   │   ├── router/              # Vue Router config
│   │   ├── types/               # TypeScript interfaces
│   │   ├── data/                # Mock data
│   │   └── style.css            # Tailwind theme + utilities
│   └── package.json
├── backend/                     # Spring Boot (planned)
├── docs/                        # Documentation
│   ├── architecture.md          # Kiến trúc chi tiết
│   ├── algorithms.md            # Giải thuật nghiên cứu
│   └── dev-notes.md             # Ghi chú phát triển
└── README.md
```

---

## 📚 Tài liệu

- [Kiến trúc hệ thống](docs/architecture.md)
- [Giải thuật nghiên cứu](docs/algorithms.md)
- [Ghi chú phát triển](docs/dev-notes.md)

---

## 👤 Tác giả

**Lê Thanh Tính**
- Trường: Đại học Tài nguyên và Môi trường TP.HCM (HCMUNRE)
- Đồ án: Chuyên ngành — Học kỳ 1 năm cuối

---

## 📄 License

Dự án này được phát triển cho mục đích học thuật.
