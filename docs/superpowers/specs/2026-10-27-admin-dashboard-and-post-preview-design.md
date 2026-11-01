# Admin Dashboard & Post Preview Improvements Design

## 1. Overview
This specification details the design for 3 UI & UX improvements in the VietBlog Admin panel:
1. **Interactive User Action Menu in Dashboard Widget** (`UsersTableWidget.vue`): Activate the 3-dots action button to provide quick actions for each user.
2. **Dynamic Period Filter for Growth Chart** (`DashboardView.vue` & `useAdminDashboard.ts`): Connect the period selector (`7d`, `30d`, `90d`) to fetch corresponding data via `adminApi.getStats(days)`.
3. **In-Admin Post Preview Modal** (`PostsManageTable.vue` & `AdminPostPreviewModal.vue`): Enable administrators to preview full post contents, author info, engagement metrics, and moderation actions directly inside Admin without leaving the page, while retaining the option to view live on the client frontend.

---

## 2. Component Design & Changes

### 2.1. User Action Dropdown Menu (`UsersTableWidget.vue`)
- **Location**: `frontend/src/views/admin/components/UsersTableWidget.vue`
- **State**:
  - `activeMenuUserId = ref<string | null>(null)`: Tracks which user's 3-dots dropdown is open.
- **Interactions**:
  - Clicking `<MoreVertical />` toggles the dropdown for that user.
  - Clicking outside or pressing `Esc` closes the dropdown (using click-outside directive or window event listener).
- **Actions in Dropdown**:
  - **Xem trang cá nhân**: Opens `/profile/:id` in a new tab via `window.open`.
  - **Quản lý phân quyền**: Navigates to `/admin/users` with the user pre-searched or selected.
  - **Sao chép Email**: Copies `user.email` to clipboard with a toast notification.

### 2.2. Dynamic Period Filter for Growth Chart (`DashboardView.vue` & `useAdminDashboard.ts`)
- **Locations**:
  - `frontend/src/views/admin/DashboardView.vue`
  - `frontend/src/composables/admin/useAdminDashboard.ts`
- **Logic**:
  - In `useAdminDashboard.ts`:
    - `selectedPeriod` is bound via `v-model` to `<select>`.
    - Watch `selectedPeriod`:
      - `7d` => `fetchStats(7)`
      - `30d` => `fetchStats(30)`
      - `90d` => `fetchStats(90)`
    - Add computed title: `periodTitle` computed from `selectedPeriod` (e.g. "Thống kê 7 ngày qua", "Thống kê 30 ngày qua", "Thống kê 3 tháng qua").
    - Loading state handles chart re-rendering smoothly.

### 2.3. In-Admin Post Preview Modal (`AdminPostPreviewModal.vue` & `PostsManageTable.vue`)
- **New Component**: `frontend/src/views/admin/components/AdminPostPreviewModal.vue`
  - **Props**:
    - `isOpen: boolean`
    - `post: any | null`
  - **Emits**:
    - `close: () => void`
    - `toggle-status: (post: any) => void`
    - `delete: (post: any) => void`
  - **UI/Layout**:
    - **Header**: Post title, creation date, category badge, publication status badge (`Published` / `Draft` / `Hidden`), reports counter badge if reported.
    - **Author Bar**: Avatar, author name, username, button to open profile.
    - **Cover Image**: Displays cover image if present.
    - **Content**: Formatted body content / prose with responsive typography.
    - **Metrics Bar**: Views count, upvotes, comments, reports.
    - **Action Footer**:
      - "Mở trên web" (external link icon): Opens `/posts/:id` in new tab.
      - "Ẩn / Hiện bài viết": Calls `toggle-status`.
      - "Xóa bài viết": Calls `delete`.
      - "Đóng": Closes the modal.
- **Integration in `PostsManageTable.vue`**:
  - State: `previewPost = ref<any | null>(null)`, `isPreviewOpen = ref(false)`.
  - Clicking the `<Eye />` icon opens `AdminPostPreviewModal` with the selected post.
  - Post status changes and deletions triggered from the modal update the table reactively.

---

## 3. Data Flow & Error Handling
- **API Requests**:
  - `adminApi.getStats(days)` is already implemented with support for `days` param and axis date formatting. Handled cleanly with try/catch and toasts in `useAsyncState`.
  - Status updates (`adminApi.updatePostStatus`) and deletions (`postsApi.delete`) emit back to parent composable with confirmation modals (`useConfirm`).
- **No breaking changes**: Public client URLs (`/posts/:id`) and other views remain 100% compatible.

---

## 4. Verification & Testing
1. **Dashboard Widget**:
   - Click 3-dots button on user row -> menu opens with correct position.
   - Click "Xem trang cá nhân" -> opens `/profile/:id` in new tab.
   - Click "Sao chép Email" -> copies email, shows toast.
   - Click outside -> menu closes.
2. **Growth Chart Filter**:
   - Change select from `7 ngày qua` to `30 ngày qua` and `3 tháng qua`.
   - Verify chart updates with new labels and dataset values.
   - Verify chart title updates accordingly.
3. **Admin Post Preview Modal**:
   - In `/admin/posts`, click `<Eye />` button on any post.
   - Verify modal opens smoothly with full title, author, content, image, and metrics.
   - Test "Ẩn / Hiện bài viết" inside modal -> status updates and table reflects new status.
   - Test "Mở trên web" -> opens `/posts/:id` in new tab.
   - Test "Đóng" and pressing `Esc` -> closes modal cleanly.
