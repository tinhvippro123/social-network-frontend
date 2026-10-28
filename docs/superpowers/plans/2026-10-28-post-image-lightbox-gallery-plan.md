# Implementation Plan - Post Image Lightbox Gallery Viewer

## Overview
Implement a high-quality fullscreen Image Lightbox Gallery Viewer for VietBlog articles:
1. Create a standalone, reusable `ImageLightboxModal.vue` component with album navigation, keyboard controls, zoom toggle, download button, and thumbnail strip.
2. Integrate gallery image extraction and event delegation in `PostDetailView.vue` and `PostDetailHeader.vue`.
3. Verify with TypeScript checks and browser testing.

---

## Tasks

### Task 1: Create `ImageLightboxModal.vue`
**Files to create**:
- `frontend/src/components/ui/ImageLightboxModal.vue`

**Details**:
1. Props & Emits:
   - `show: boolean`
   - `images: Array<{ src: string; alt?: string; title?: string }>`
   - `initialIndex?: number`
   - Emits: `(e: 'close'): void`, `(e: 'change-index', index: number): void`
2. UI Layout:
   - Overlay: `fixed inset-0 z-50 flex flex-col justify-between bg-black/92 backdrop-blur-md select-none`
   - Top Header Bar:
     - Counter: `Ảnh ${currentIndex + 1} / ${images.length}` with category/caption if available.
     - Action buttons:
       - Zoom 1:1 toggle (`ZoomIn` / `ZoomOut` icon).
       - Download button (`Download` icon, triggers download of current image).
       - Close button (`X` icon).
   - Middle Viewer Area:
     - Previous button (`ChevronLeft` icon) with keyboard hint.
     - Image container with smooth transition, auto-centering, and toggleable zoom mode (`scale-[1.5]` or `object-contain`).
     - Next button (`ChevronRight` icon) with keyboard hint.
   - Bottom Thumbnail Bar:
     - Horizontal scrolling strip of all images in the article.
     - Active thumbnail highlighted with `ring-2 ring-primary-500 scale-105`.
     - Click thumbnail to switch to that image instantly.
3. Behavior:
   - Keyboard listener for `Escape` (close), `ArrowLeft` (previous), `ArrowRight` (next).
   - Lock body scroll (`document.body.style.overflow = 'hidden'`) while modal is open.
   - Clean up event listeners on unmount.

**Verification**:
- Typecheck with `npx vue-tsc --noEmit`.

---

### Task 2: Integrate Lightbox into `PostDetailView.vue` and `PostDetailHeader.vue`
**Files to modify**:
- `frontend/src/views/posts/components/PostDetailHeader.vue`
- `frontend/src/views/posts/PostDetailView.vue`

**Details**:
1. In `PostDetailHeader.vue`:
   - Emit `(e: 'open-lightbox', index: number): void`.
   - On cover image wrapper, add `@click="emit('open-lightbox', 0)"` when `post.coverImage` is present.
   - Add visual affordance: `cursor-zoom-in group`, subtle zoom icon badge on hover.
2. In `PostDetailView.vue`:
   - Import `ImageLightboxModal`.
   - Add state: `isLightboxOpen = ref(false)`, `lightboxIndex = ref(0)`, `galleryImages = ref<Array<{ src: string; alt?: string }>>([])`.
   - Method `extractGalleryImages()`:
     - Starts with `post.coverImage` (if exists).
     - Finds all `img` elements inside the `.prose` content box.
     - Adds each unique image src and alt to `galleryImages.value`.
   - Method `handleContentClick(e: MouseEvent)`:
     - Checks if target is an `HTMLImageElement` inside `.prose`.
     - If so, finds its index in `galleryImages.value` and opens Lightbox at that index.
   - Add CSS for `.prose img`:
     - `cursor: zoom-in; transition: transform 0.2s, box-shadow 0.2s; border-radius: 0.75rem;`
     - `:hover { transform: scale(1.008); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }`
   - Render `<ImageLightboxModal :show="isLightboxOpen" :images="galleryImages" :initialIndex="lightboxIndex" @close="isLightboxOpen = false" />`.

**Verification**:
- Verify zero TypeScript errors with `npx vue-tsc --noEmit`.
- Run `npm run build` to verify clean bundle generation.

---

### Task 3: Browser Verification & End-to-End Testing
**Details**:
1. Open post detail page (e.g. `http://localhost:5173/posts/b0363cee-b3dd-40f1-8f14-4d59d4d4a527`).
2. Test clicking the cover image -> Lightbox opens with cover image, displays counter `1 / N`.
3. Test clicking Next/Prev buttons and keyboard arrow keys -> transitions smoothly between images.
4. Test clicking thumbnails in the bottom strip -> jumps to selected image.
5. Test Escape key -> closes Lightbox.
6. Test clicking an inline image inside the article content -> Lightbox opens directly at that specific image.

---

## Execution Order
1. Task 1: Create `ImageLightboxModal.vue`
2. Task 2: Integrate into `PostDetailHeader.vue` and `PostDetailView.vue`
3. Task 3: Build & Browser Verification
