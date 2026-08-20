import { useEffect } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { BASE_URL } from '../config/baseUrl'

export function useWebSocketMessages(
  conversationId: string | undefined,
  onMessage: (msg: any) => void
) {
  useEffect(() => {
    if (!conversationId) return

    const client = new Client({
      brokerURL: undefined,
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      connectHeaders: { Authorization: `Bearer ${localStorage.getItem('jwtToken') ?? ''}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/notifications', (frame) => {
          try {
            const payload = JSON.parse(frame.body)
            if (payload.conversationId === conversationId) {
              onMessage(payload)
            }
          } catch { /* ignore malformed frames */ }
        })
      },
    })

    client.activate()
    return () => { client.deactivate() }
  }, [conversationId])
}
