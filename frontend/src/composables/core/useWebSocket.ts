// ==========================================
// Composable — useWebSocket
// Kết nối WebSocket cho Chat Real-time (/ws/chat) xác thực qua HttpOnly Cookie Handshake
// ==========================================
import { ref, onUnmounted, getCurrentInstance } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { hasAuthSessionCookie } from '@/utils/cookies'

function resolveDefaultWsUrl(): string {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL
  }
  const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
  try {
    const u = new URL(apiBase, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080')
    const wsProtocol = u.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${wsProtocol}//${u.host}/ws/chat`
  } catch {
    return 'ws://localhost:8080/ws/chat'
  }
}

export function useWebSocket(url?: string, onMessageCallback?: (payload: any) => void) {
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const isAuthenticated = ref(false)
  const lastMessage = ref<any>(null)
  const error = ref<string | null>(null)

  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let pingTimer: ReturnType<typeof setInterval> | null = null
  let reconnectAttempts = 0
  const MAX_RECONNECT = 8
  const RECONNECT_DELAY = 3000

  function hasActiveSession(): boolean {
    if (typeof window === 'undefined') return false
    const authStore = useAuthStore()
    return authStore.isLoggedIn || hasAuthSessionCookie()
  }

  function stopPing() {
    if (pingTimer) {
      clearInterval(pingTimer)
      pingTimer = null
    }
  }

  function startPing() {
    stopPing()
    pingTimer = setInterval(() => {
      send({ type: 'ping' })
    }, 25000)
  }

  /** Kết nối WebSocket — trình duyệt tự đính kèm HttpOnly Cookie trong HTTP Upgrade Handshake */
  function connect(wsUrl?: string) {
    if (!hasActiveSession()) return

    const finalUrl = wsUrl || url || resolveDefaultWsUrl()
    if (!finalUrl) {
      error.value = 'WebSocket URL không được cung cấp'
      return
    }

    if (ws.value && (ws.value.readyState === WebSocket.OPEN || ws.value.readyState === WebSocket.CONNECTING)) {
      return
    }

    try {
      ws.value = new WebSocket(finalUrl)

      ws.value.onopen = () => {
        isConnected.value = true
        reconnectAttempts = 0
        error.value = null
        startPing()
      }

      ws.value.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data)
          lastMessage.value = parsed
          if (parsed?.type === 'authenticated') {
            isAuthenticated.value = true
          }
          if (onMessageCallback) {
            onMessageCallback(parsed)
          }
        } catch {
          lastMessage.value = event.data
        }
      }

      ws.value.onerror = () => {
        error.value = 'WebSocket connection error'
      }

      ws.value.onclose = () => {
        isConnected.value = false
        isAuthenticated.value = false
        stopPing()
        attemptReconnect(finalUrl)
      }
    } catch {
      error.value = 'Không thể kết nối WebSocket'
    }
  }

  /** Tự động reconnect khi còn phiên đăng nhập */
  function attemptReconnect(wsUrl: string) {
    if (!hasActiveSession() || reconnectAttempts >= MAX_RECONNECT) {
      return
    }
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(() => {
      reconnectAttempts++
      connect(wsUrl)
    }, RECONNECT_DELAY)
  }

  /** Gửi message JSON frame */
  function send(data: Record<string, unknown>) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data))
    }
  }

  /** Ngắt kết nối */
  function disconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    stopPing()
    if (ws.value) {
      ws.value.onclose = null
      ws.value.close()
    }
    ws.value = null
    isConnected.value = false
    isAuthenticated.value = false
  }

  if (getCurrentInstance()) {
    onUnmounted(() => disconnect())
  }

  return {
    isConnected,
    isAuthenticated,
    lastMessage,
    error,
    connect,
    send,
    disconnect,
  }
}
