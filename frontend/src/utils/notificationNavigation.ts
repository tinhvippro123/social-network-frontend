import type { Router } from 'vue-router'

export interface ParsedNotificationTarget {
  targetPath: string
  targetHash: string
  authorName: string
}

export function parseNotificationLink(link?: string, message?: string): ParsedNotificationTarget {
  let targetPath = link || ''
  let targetHash = ''
  let authorName = ''

  if (targetPath.includes('#')) {
    const parts = targetPath.split('#')
    targetPath = parts[0]
    targetHash = '#' + parts[1]
  }

  if (message) {
    const cleaned = message
      .replace(
        /\s+(commented on your post|commented|đã bình luận về bài viết của bạn|đã bình luận.*|đã trả lời bình luận của bạn|đã trả lời.*|đã nhắc đến bạn.*|mentioned you.*|đã bày tỏ cảm xúc.*)/i,
        ''
      )
      .trim()
    if (cleaned && cleaned !== message) {
      authorName = cleaned
    }
  }

  return { targetPath, targetHash, authorName }
}

export function navigateToNotificationLink(router: Router, notif: { link?: string; message?: string }) {
  if (!notif.link) return

  const { targetPath, targetHash, authorName } = parseNotificationLink(notif.link, notif.message)
  const isPostPage = targetPath.startsWith('/posts/')
  const currentPath = router.currentRoute.value.path

  const eventPayload = {
    targetHash,
    authorName
  }

  // If already on the target page
  if (currentPath === targetPath) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jump-to-comment', { detail: eventPayload }))
    }
    // Update hash or query if not already present
    if (targetHash && router.currentRoute.value.hash !== targetHash) {
      router.replace({
        path: targetPath,
        query: authorName ? { ...router.currentRoute.value.query, highlightAuthor: authorName } : router.currentRoute.value.query,
        hash: targetHash
      })
    }
    return
  }

  // Navigate to target page
  if (isPostPage) {
    router.push({
      path: targetPath,
      query: authorName ? { highlightAuthor: authorName } : undefined,
      hash: targetHash || '#comments-section'
    })
  } else {
    router.push(notif.link)
  }
}
