import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { BASE_URL } from '../config/baseUrl'

export function useWhiteboardSync(
  conversationId: string | undefined,
  onRemoteUpdate: (elements: any[], appState: any) => void
) {
  const clientRef = useRef<Client | null>(null)
  const isSelfUpdate = useRef(false)

  useEffect(() => {
    if (!conversationId) return

    const client = new Client({
      brokerURL: undefined,
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      connectHeaders: { Authorization: `Bearer ${localStorage.getItem('jwtToken') ?? ''}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/whiteboard/${conversationId}`, (frame) => {
          if (isSelfUpdate.current) return
          try {
            const { elements, appState } = JSON.parse(frame.body)
            onRemoteUpdate(elements, appState)
          } catch { /* ignore malformed frames */ }
        })
      },
    })

    client.activate()
    clientRef.current = client
    return () => { client.deactivate() }
  }, [conversationId])

  const publish = useCallback((elements: any[], appState: any) => {
    const client = clientRef.current
    if (!client?.connected || !conversationId) return
    isSelfUpdate.current = true
    client.publish({
      destination: `/app/whiteboard/${conversationId}`,
      body: JSON.stringify({ elements, appState }),
    })
    setTimeout(() => { isSelfUpdate.current = false }, 50)
  }, [conversationId])

  return { publish }
}
