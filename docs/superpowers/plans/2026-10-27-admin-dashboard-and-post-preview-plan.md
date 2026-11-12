# Implementation Plan - Admin Dashboard & Post Preview Improvements

## Overview
Implement 3 enhancements to the Admin Dashboard and Posts Management views:
1. Active 3-dots user action dropdown in `UsersTableWidget.vue`.
2. Dynamic period filter (`7d`, `30d`, `90d`) in `DashboardView.vue` and `useAdminDashboard.ts`.
3. Modal post preview in `PostsManageTable.vue` with `AdminPostPreviewModal.vue`.

---

## Tasks

### Task 1: Dynamic Period Filter for Admin Dashboard
**Files to modify**:
- `frontend/src/composables/admin/useAdminDashboard.ts`
- `frontend/src/views/admin/DashboardView.vue`

**Details**:
1. In `useAdminDashboard.ts`:
   - Watch `selectedPeriod`: map `'7d' => 7`, `'30d' => 30`, `'90d' => 90`.
   - Call `fetchStats(days)` when `selectedPeriod` changes.
   - Add computed `periodTitle` (e.g. `'Thống kê 7 ngày qua'`, `'Thống kê 30 ngày qua'`, `'Thống kê 3 tháng qua'`).
   - Export `periodTitle`.
2. In `DashboardView.vue`:
   - Replace hardcoded `'Thống kê tuần này'` with `periodTitle`.
   - Ensure the select menu stays reactive and chart updates seamlessly.

**Verification**:
- Run `npm run build` or typecheck with `npx vue-tsc --noEmit`.
- Changing period in UI fetches data for 7, 30, or 90 days and refreshes the chart labels.

---

### Task 2: Active User Action Dropdown in Dashboard User Widget
**Files to modify**:
- `frontend/src/views/admin/components/UsersTableWidget.vue`

**Details**:
1. Add state: `activeDropdownUserId = ref<string | null>(null)`.
2. Add click-outside or window listener to close dropdown when clicking outside or pressing Escape.
3. Replace the plain `<button>` in the "Thao tác" column with a toggle button and dropdown menu:
   - "Xem trang cá nhân": navigates/opens `/profile/:id` in new tab.
   - "Quản lý trong Admin": uses router to navigate to `/admin/users?search=${encodeURIComponent(user.name || user.email)}`.
   - "Sao chép Email": copies `user.email` to clipboard and shows toast `"Đã sao chép email: ..."` (using `useToast`).
4. Ensure dropdown has z-index and does not get clipped by table container overflow (`relative` cell or positioned dropdown).

**Verification**:
- Verify with `npx vue-tsc --noEmit`.
- Click 3-dots on user row -> menu appears.
- Test "Xem trang cá nhân", "Quản lý trong Admin", "Sao chép Email", and click-outside to dismiss.

---

### Task 3: In-Admin Post Preview Modal
**Files to create / modify**:
- `frontend/src/views/admin/components/AdminPostPreviewModal.vue` (New)
- `frontend/src/views/admin/components/PostsManageTable.vue` (Modify)

**Details**:
1. Create `AdminPostPreviewModal.vue`:
   - Props: `isOpen: boolean`, `post: any | null`
   - Emits: `close`, `toggle-status`, `delete`
   - Features:
     - Header: Post title, creation date, category, status badge, reports badge if `reportsCount > 0`.
     - Author information with avatar, name, and link to profile.
     - Cover image display with error fallback.
     - Post body / content rendering (handles markdown or plain text with proper typography).
     - Tags display.
     - Engagement metrics bar (views, upvotes, comments, reports).
     - Action buttons:
       - "Mở trên web" (`window.open('/posts/' + post.id, '_blank')`)
       - "Ẩn / Hiện bài viết" (`emit('toggle-status', post)`)
       - "Xóa bài viết" (`emit('delete', post)`)
       - "Đóng" (`emit('close')`)
     - Keyboard support (`Esc` to close).
2. Update `PostsManageTable.vue`:
   - Add state: `previewPost = ref<any | null>(null)`, `isPreviewModalOpen = ref(false)`.
   - When clicking the `<Eye />` button in the action column: open `AdminPostPreviewModal` with `post`.
   - Wire `toggle-status` and `delete` events to forward to existing table emits.
   - Add a separate small tooltip or button for opening directly in client if desired.

**Verification**:
- Run `npx vue-tsc --noEmit`.
- In `/admin/posts`, click Eye icon -> modal opens with comprehensive post information.
- Click "Ẩn / Hiện" or "Xóa" from inside modal -> triggers action and updates list.
- Click "Mở trên web" -> opens client view in new tab.

---

## Execution Order
1. Task 1: Dynamic period filter in Dashboard
2. Task 2: Active 3-dots action dropdown in `UsersTableWidget.vue`
3. Task 3: In-Admin Post Preview Modal in `AdminPostPreviewModal.vue` and `PostsManageTable.vue`
4. Verification: Run TypeScript typecheck and browser test
