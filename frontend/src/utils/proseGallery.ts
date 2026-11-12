// ==========================================
// Utility — Transform consecutive images in HTML content
// into responsive Facebook/Threads-style Photo Collage Galleries (+N)
// ==========================================

export interface GalleryImageItem {
  src: string
  alt: string
}

/**
 * Checks if a DOM Element is an "image-only" container (e.g. <p><img ...></p>)
 * or a direct <img> element, and returns all <img> elements inside it.
 */
function extractImagesFromNode(node: Node): HTMLImageElement[] | null {
  if (node.nodeType === Node.TEXT_NODE) {
    // Ignore pure whitespace text nodes
    if (!node.textContent || node.textContent.trim() === '') {
      return []
    }
    return null
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const el = node as HTMLElement
  const tag = el.tagName.toUpperCase()

  if (tag === 'IMG') {
    return [el as HTMLImageElement]
  }

  // Only consider P, DIV, FIGURE as potential image-only wrappers
  if (tag === 'P' || tag === 'DIV' || tag === 'FIGURE') {
    // Skip if already transformed
    if (el.classList.contains('post-inline-gallery')) {
      return null
    }

    const imgs: HTMLImageElement[] = []
    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        if (child.textContent && child.textContent.trim() !== '') {
          return null // Has actual text -> not an image-only block
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const childEl = child as HTMLElement
        if (childEl.tagName.toUpperCase() === 'IMG') {
          imgs.push(childEl as HTMLImageElement)
        } else if (childEl.tagName.toUpperCase() === 'BR') {
          // Ignore line breaks between images
          continue
        } else {
          return null // Contains non-image element
        }
      }
    }

    return imgs.length > 0 ? imgs : null
  }

  return null
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Builds the Collage Grid HTML for a group of 2 or more consecutive images.
 */
function buildGalleryGridHtml(images: GalleryImageItem[], groupIndex: number): string {
  const count = images.length
  const groupAttr = `data-gallery-group="gallery-${groupIndex}"`

  // 2 Images: Side-by-side 2 columns
  if (count === 2) {
    const [img0, img1] = images
    return `
      <div class="post-inline-gallery not-prose my-6 grid grid-cols-2 gap-2.5 sm:gap-3 rounded-2xl overflow-hidden" ${groupAttr}>
        <div class="relative aspect-4/3 overflow-hidden rounded-xl bg-gray-100 dark:bg-surface-700 group cursor-zoom-in">
          <img src="${escapeHtml(img0.src)}" alt="${escapeHtml(img0.alt)}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div class="relative aspect-4/3 overflow-hidden rounded-xl bg-gray-100 dark:bg-surface-700 group cursor-zoom-in">
          <img src="${escapeHtml(img1.src)}" alt="${escapeHtml(img1.alt)}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      </div>
    `
  }

  // 3 Images: 1 Large on the left (2 cols) + 2 Stacked on the right (1 col)
  if (count === 3) {
    const [img0, img1, img2] = images
    return `
      <div class="post-inline-gallery not-prose my-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 rounded-2xl overflow-hidden sm:h-[380px]" ${groupAttr}>
        <div class="sm:col-span-2 relative h-64 sm:h-full overflow-hidden rounded-xl bg-gray-100 dark:bg-surface-700 group cursor-zoom-in">
          <img src="${escapeHtml(img0.src)}" alt="${escapeHtml(img0.alt)}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-1 sm:grid-rows-2 gap-2.5 sm:gap-3 h-40 sm:h-full">
          <div class="relative w-full h-full overflow-hidden rounded-xl bg-gray-100 dark:bg-surface-700 group cursor-zoom-in">
            <img src="${escapeHtml(img1.src)}" alt="${escapeHtml(img1.alt)}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div class="relative w-full h-full overflow-hidden rounded-xl bg-gray-100 dark:bg-surface-700 group cursor-zoom-in">
            <img src="${escapeHtml(img2.src)}" alt="${escapeHtml(img2.alt)}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
        </div>
      </div>
    `
  }

  // 4 or 5+ Images: 2x2 Grid with +N overlay on the 4th item when count >= 5
  const visible = images.slice(0, 4)
  const hidden = images.slice(4)
  const extraCount = hidden.length

  const cellsHtml = visible
    .map((img, idx) => {
      const isLastWithMore = idx === 3 && extraCount > 0
      const overlayHtml = isLastWithMore
        ? `
          <div class="pointer-events-none absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white transition-colors duration-300 group-hover:bg-black/70">
            <span class="text-2xl sm:text-4xl font-extrabold tracking-tight">+${extraCount}</span>
            <span class="text-[11px] sm:text-xs font-medium text-white/90 mt-1 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20">
              Xem tất cả ${count} ảnh
            </span>
          </div>
        `
        : ''

      return `
        <div class="relative aspect-4/3 overflow-hidden rounded-xl bg-gray-100 dark:bg-surface-700 group cursor-zoom-in">
          <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ${overlayHtml}
        </div>
      `
    })
    .join('')

  const hiddenImgsHtml = hidden
    .map(
      (img) =>
        `<img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" class="hidden" data-gallery-hidden="true" />`
    )
    .join('')

  return `
    <div class="post-inline-gallery not-prose my-6 grid grid-cols-2 gap-2.5 sm:gap-3 rounded-2xl overflow-hidden" ${groupAttr}>
      ${cellsHtml}
      ${hiddenImgsHtml}
    </div>
  `
}

/**
 * Transforms raw article HTML so that any sequence of 2+ consecutive images
 * at any section in the post becomes an interactive Collage Gallery Grid (+N),
 * while single images remain normal standalone blog images.
 */
export function formatContentWithGalleries(rawHtml?: string | null): string {
  if (!rawHtml) return '<p>Đang cập nhật nội dung...</p>'
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return rawHtml
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(rawHtml, 'text/html')
  const body = doc.body

  const children = Array.from(body.childNodes)
  let groupCounter = 0
  let i = 0

  while (i < children.length) {
    const firstImgs = extractImagesFromNode(children[i])

    // Skip pure whitespace or non-image nodes
    if (firstImgs === null || firstImgs.length === 0) {
      i++
      continue
    }

    // Collect a contiguous run of image-only nodes
    const runNodes: Node[] = [children[i]]
    const runImages: GalleryImageItem[] = firstImgs.map((img) => ({
      src: img.getAttribute('src') || '',
      alt: img.getAttribute('alt') || 'Ảnh bài viết'
    }))

    let j = i + 1
    while (j < children.length) {
      const nextImgs = extractImagesFromNode(children[j])
      if (nextImgs === null) {
        break // Hit a text/heading/other block -> end of this gallery run
      }
      runNodes.push(children[j])
      for (const img of nextImgs) {
        const src = img.getAttribute('src') || ''
        if (src) {
          runImages.push({
            src,
            alt: img.getAttribute('alt') || 'Ảnh bài viết'
          })
        }
      }
      j++
    }

    const validImages = runImages.filter((item) => Boolean(item.src))

    // Only transform into a Collage Grid if there are 2 or more consecutive images in this section
    if (validImages.length >= 2) {
      const galleryWrapper = doc.createElement('div')
      galleryWrapper.innerHTML = buildGalleryGridHtml(validImages, groupCounter++).trim()
      const galleryEl = galleryWrapper.firstElementChild

      if (galleryEl && runNodes[0].parentNode) {
        runNodes[0].parentNode.insertBefore(galleryEl, runNodes[0])
        for (const node of runNodes) {
          node.parentNode?.removeChild(node)
        }
      }
    }

    i = j
  }

  return body.innerHTML
}

