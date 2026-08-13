import { authFetch } from './httpClient'
import type { Offer } from './offerApi'

export interface ChatMessage {
  id: string
  senderId: string
  receiverId?: string
  content: string
  timestamp: string
  conversationId?: string
  messageType?: string
  lessonId?: string
  offer?: Offer
}

export interface ConversationDTO {
  id: string
  user1Id: string
  user2Id: string
  user1Username: string
  user2Username: string
  lastMessageAt?: string
}

export async function fetchConversations(): Promise<ConversationDTO[]> {
  const userId = localStorage.getItem('userId') ?? ''
  const res = await authFetch(`/api/conversation/${userId}`)
  if (!res.ok) throw new Error('Blad pobierania konwersacji')
  return res.json()
}

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const res = await authFetch(`/api/messages/${conversationId}`)
  if (!res.ok) throw new Error('Blad pobierania wiadomosci')
  return res.json()
}

export async function sendMessage(conversationId: string, content: string, receiverId: string): Promise<void> {
  const senderId = localStorage.getItem('userId') ?? ''
  await authFetch('/api/messages/send', {
    method: 'POST',
    body: JSON.stringify({ conversationId, content, senderId, receiverId }),
  })
}

export async function deleteMessage(messageId: string): Promise<void> {
  await authFetch(`/api/messages/${messageId}`, { method: 'DELETE' })
}
