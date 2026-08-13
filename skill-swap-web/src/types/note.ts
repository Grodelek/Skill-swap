export type NoteTag = 'reminder' | 'mastered' | 'warning' | null

export interface ConversationNote {
  id: string
  conversationId: string
  authorId: string
  content: string
  tag: NoteTag
  createdAt: string
}
