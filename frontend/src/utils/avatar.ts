const LEGACY_PORTRAIT_PHOTO_IDS = [
  '1534528741775',
  '1535713875002',
  '1522075469751',
  '1472099645785',
  '1507003211169',
  '1544005313',
  '1494790108377',
  '1539571696357',
  '1517841905240',
  '1524504388940',
  '1500648767791',
  '1573496359142',
  '1506794778202',
  '1580489944761',
] as const

const DICEBEAR_BG_PALETTE = 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf'

export function buildCartoonAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${DICEBEAR_BG_PALETTE}`
}

export function isLegacyPortraitAvatar(avatar?: string | null): boolean {
  if (!avatar) return false
  return LEGACY_PORTRAIT_PHOTO_IDS.some((id) => avatar.includes(id))
}

/**
 * Chuẩn hóa URL avatar người dùng:
 * - Giữ nguyên ảnh nhóm (isGroup = true).
 * - Giữ nguyên ảnh người dùng tự tải lên (Cloudinary, Google OAuth, DiceBear...).
 * - Thay thế các URL ảnh chân dung Unsplash cũ hoặc avatar trống (khi có tên) sang avatar hoạt hình DiceBear Adventurer.
 */
export function resolveUserAvatar(
  avatar?: string | null,
  name?: string | null,
  isGroup?: boolean
): string {
  const cleanAvatar = avatar?.trim() || ''
  if (isGroup) return cleanAvatar

  const cleanName = name?.trim() || ''
  if (cleanAvatar) {
    const matchedId = LEGACY_PORTRAIT_PHOTO_IDS.find((id) => cleanAvatar.includes(id))
    if (matchedId) {
      return buildCartoonAvatarUrl(cleanName || matchedId)
    }
    return cleanAvatar
  }

  return cleanName ? buildCartoonAvatarUrl(cleanName) : ''
}
