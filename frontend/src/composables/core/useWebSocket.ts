// ==========================================
// Composable — useWebSocket
// Kết nối WebSocket cho Chat Real-time (/ws/chat)
// ==========================================
import { ref, onUnmounted, getCurrentInstance } from 'vue'
import { STORAGE_KEYS } from '@/constants'

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

  /** Kết nối WebSocket và xác thực JWT frame đầu tiên */
  function connect(wsUrl?: string) {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (!token) return

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
        const currentToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
        if (currentToken) {
          send({ type: 'auth', token: currentToken })
          startPing()
        }
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

  /** Tự động reconnect */
  function attemptReconnect(wsUrl: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) : null
    if (!token || reconnectAttempts >= MAX_RECONNECT) {
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
