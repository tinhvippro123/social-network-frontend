# 📐 Contributing Guide — VietBlog

> Quy tắc commit, pull request, đặt tên nhánh và quy trình làm việc với Git cho dự án VietBlog.

---

## 🔀 Quy tắc nhánh Git (Branch Naming)

| Pattern | Mục đích | Ví dụ |
|---------|----------|-------|
| `feature/<tên>` | Tính năng mới | `feature/chat-enhancement` |
| `fix/<tên>` | Sửa lỗi | `fix/dark-mode-toggle` |
| `refactor/<tên>` | Tái cấu trúc code | `refactor/api-layer` |
| `docs/<tên>` | Cập nhật tài liệu | `docs/update-readme` |
| `hotfix/<tên>` | Sửa lỗi khẩn cấp trên production | `hotfix/login-crash` |

### Luồng nhánh (Git Flow)

```
main (production)
 └── dev (development)
      ├── feature/chat-enhancement
      ├── feature/refactoring-dry-ui
      ├── fix/dark-mode-toggle
      └── ...
```

- **`main`**: Code ổn định, sẵn sàng deploy.
- **`dev`**: Code đang phát triển, tích hợp các feature.
- **`feature/*`, `fix/*`**: Nhánh làm việc, tạo từ `dev`, merge ngược về `dev` qua Pull Request.

---

## 📝 Quy tắc Commit (Conventional Commits)

Dự án sử dụng chuẩn **[Conventional Commits](https://www.conventionalcommits.org/)**.

### Format

```
<type>(<scope>): <description>

[body — tùy chọn]
```

### Types

| Type | Mô tả | Ví dụ |
|------|--------|-------|
| `feat` | Tính năng mới | `feat(chat): add emoji picker` |
| `fix` | Sửa lỗi | `fix(ui): resolve dark mode toggle` |
| `refactor` | Tái cấu trúc code (không thêm/sửa tính năng) | `refactor: extract API layer from views` |
| `style` | Thay đổi UI/CSS (không ảnh hưởng logic) | `style(admin): polish table alignment` |
| `docs` | Cập nhật tài liệu | `docs: update dev-notes for session 7` |
| `perf` | Cải thiện hiệu suất | `perf(posts): parallel fetch with Promise.all` |
| `chore` | Công việc phụ trợ (config, deps) | `chore: update vite to v8.2` |
| `test` | Thêm/sửa test | `test(auth): add login unit tests` |

### Scopes phổ biến

| Scope | Khu vực |
|-------|---------|
| `ui` | Giao diện chung (layout, theme, components) |
| `admin` | Trang quản trị |
| `chat` | Tin nhắn |
| `posts` | Bài viết |
| `auth` | Đăng nhập / Đăng ký |
| `views` | Các trang view |
| `frontend` | Frontend tổng thể |
| `backend` | Backend tổng thể |
| `api` | API layer |

### Ví dụ commit phức tạp (có body)

```
feat(chat): add message read receipts

- Single check (✓) = sent
- Double check (✓✓) = delivered
- Blue double check (✓✓) = read
- Auto-mark as read when conversation is opened
```

### ⚠️ Lưu ý quan trọng

- Description viết **bằng tiếng Anh**, bắt đầu bằng **động từ** dạng nguyên thể: `add`, `fix`, `remove`, `update` (KHÔNG viết `added`, `fixes`, `removing`).
- Không viết hoa chữ cái đầu description: `fix dark mode` ✅ | `Fix dark mode` ❌
- Không kết thúc bằng dấu chấm: `add emoji picker` ✅ | `add emoji picker.` ❌

---

## 🔃 Quy tắc Pull Request

### Title format

```
<type>(<scope>): <Mô tả ngắn gọn>
```

**Ví dụ:**
- `feat(frontend): Refactor DRY UI — Skeleton loaders, separated views, dark mode fix`
- `feat(chat): Enhance messaging — read receipts, emoji, file sharing`
- `fix(admin): Resolve table layout shifts`

### Description template

Mỗi PR nên có các phần sau:

```markdown
### Mô tả
Tóm tắt 1-2 câu mục đích của PR.

### Thay đổi chính
- ✨ **Tính năng mới**: ...
- 🐛 **Bug Fixes**: ...
- 🏗️ **Refactoring**: ...
- 📊 **Hiệu suất**: ...

### Screenshots
_(Paste ảnh chụp màn hình nếu thay đổi UI)_

### Checklist
- [ ] Code build thành công
- [ ] Responsive trên mobile/tablet/desktop
- [ ] Dark mode hoạt động
- [ ] Tài liệu đã cập nhật
```

### Quy trình review

1. **Tạo PR** từ nhánh `feature/*` hoặc `fix/*` → `dev`
2. **Self-review**: Đọc lại diff trước khi submit
3. **Merge**: Sau khi review xong, merge vào `dev` bằng **Squash and merge** (gộp tất cả commits thành 1 commit gọn gàng)
4. **Xóa nhánh**: Sau khi merge, xóa nhánh feature đã hoàn thành

---

## 📁 Cấu trúc thư mục tài liệu

```
docs/
├── architecture.md     # Kiến trúc hệ thống, sơ đồ, tech stack
├── algorithms.md       # Thuật toán, logic nghiệp vụ
├── flows.md            # Luồng hoạt động (user flows, API flows)
├── dev-notes.md        # Nhật ký phát triển theo session
└── contributing.md     # Quy tắc commit, PR, nhánh (FILE NÀY)
```
