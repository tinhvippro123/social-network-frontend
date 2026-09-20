// ==========================================
// Composable — useWebSocket
// Kết nối WebSocket cho Chat Real-time
// ==========================================
import { ref, onUnmounted } from 'vue'

export function useWebSocket(url?: string) {
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const lastMessage = ref<any>(null)
  const error = ref<string | null>(null)

  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectAttempts = 0
  const MAX_RECONNECT = 5
  const RECONNECT_DELAY = 3000

  /** Kết nối WebSocket */
  function connect(wsUrl?: string) {
    const finalUrl = wsUrl || url || import.meta.env.VITE_WS_URL
    if (!finalUrl) {
      error.value = 'WebSocket URL không được cung cấp'
      return
    }

    try {
      ws.value = new WebSocket(finalUrl)

      ws.value.onopen = () => {
        isConnected.value = true
        reconnectAttempts = 0
        error.value = null
      }

      ws.value.onmessage = (event) => {
        try {
          lastMessage.value = JSON.parse(event.data)
        } catch {
          lastMessage.value = event.data
        }
      }

      ws.value.onerror = () => {
        error.value = 'WebSocket connection error'
      }

      ws.value.onclose = () => {
        isConnected.value = false
        attemptReconnect(finalUrl)
      }
    } catch (err) {
      error.value = 'Không thể kết nối WebSocket'
    }
  }

  /** Tự động reconnect */
  function attemptReconnect(wsUrl: string) {
    if (reconnectAttempts >= MAX_RECONNECT) {
      error.value = `Không thể kết nối lại sau ${MAX_RECONNECT} lần thử`
      return
    }
    reconnectTimer = setTimeout(() => {
      reconnectAttempts++
      connect(wsUrl)
    }, RECONNECT_DELAY)
  }

  /** Gửi message */
  function send(data: Record<string, unknown>) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data))
    }
  }

  /** Ngắt kết nối */
  function disconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (ws.value) {
      // Gỡ sự kiện onclose trước khi đóng để tránh bị trigger reconnect (Memory Leak)
      ws.value.onclose = null
      ws.value.close()
    }
    ws.value = null
    isConnected.value = false
  }

  // Auto cleanup khi component unmount
  onUnmounted(() => disconnect())

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    send,
    disconnect,
  }
}
