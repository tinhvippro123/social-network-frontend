import { ref } from 'vue'

export type ConfirmVariant = 'danger' | 'warning' | 'info'

export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
}

interface ConfirmState extends ConfirmOptions {
  open: boolean
}

// Global state — một hộp thoại xác nhận dùng chung toàn app (thay thế window.confirm)
const state = ref<ConfirmState>({ open: false, title: '', message: '' })
let resolver: ((value: boolean) => void) | null = null

export function useConfirm() {
  /** Mở hộp thoại xác nhận, trả về Promise<boolean> (true = đồng ý) */
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    // Nếu đang có hộp thoại mở thì huỷ hộp thoại cũ
    resolver?.(false)
    state.value = { variant: 'danger', confirmText: 'Xác nhận', cancelText: 'Huỷ', ...options, open: true }
    return new Promise<boolean>((resolve) => {
      resolver = resolve
    })
  }

  const close = (result: boolean) => {
    state.value.open = false
    resolver?.(result)
    resolver = null
  }

  return { state, confirm, close }
}
