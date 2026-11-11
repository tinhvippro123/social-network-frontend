/**
 * Tiện ích lọc/tìm kiếm phía client hỗ trợ tiếng Việt có dấu và không dấu.
 * VD: "da lat" khớp "Đà Lạt", "nguyen" khớp "Nguyễn".
 */

/** Bỏ dấu tiếng Việt (kể cả đ/Đ), chuyển chữ thường và cắt khoảng trắng. */
export function normalizeVi(text: string | null | undefined): string {
  return (text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

/** Tách chuỗi đã bỏ dấu thành các từ (chỉ chữ và số). */
export function splitTokens(text: string | null | undefined): string[] {
  return normalizeVi(text).split(/[^a-z0-9]+/).filter(Boolean)
}

/**
 * Kiểm tra `query` có khớp một trong các trường `fields` không (không phân biệt hoa thường/dấu).
 * Mỗi từ trong query phải xuất hiện ở đầu một từ của các trường (prefix match theo ranh giới từ),
 * nên "ai" không khớp nhầm giữa chữ "saigon". Query rỗng luôn khớp.
 */
export function matchesQuery(query: string | null | undefined, ...fields: Array<string | null | undefined>): boolean {
  const qTokens = splitTokens(query)
  if (qTokens.length === 0) return true
  const fieldTokens = fields.flatMap(f => splitTokens(f))
  return qTokens.every(qt => fieldTokens.some(ft => ft.startsWith(qt)))
}

