import { useState, useCallback } from 'react'
import { ConversationNote, NoteTag } from '../types/note'

function storageKey(conversationId: string) {
  return `conversation_notes_${conversationId}`
}

function load(conversationId: string): ConversationNote[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(conversationId)) ?? '[]')
  } catch {
    return []
  }
}

function save(conversationId: string, notes: ConversationNote[]) {
  localStorage.setItem(storageKey(conversationId), JSON.stringify(notes))
}

export function useConversationNotes(conversationId: string, authorId: string) {
  const [notes, setNotes] = useState<ConversationNote[]>(() => load(conversationId))

  const addNote = useCallback((content: string, tag: NoteTag) => {
    const note: ConversationNote = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      conversationId,
      authorId,
      content: content.trim(),
      tag,
      createdAt: new Date().toISOString(),
    }
    setNotes(prev => {
      const updated = [note, ...prev]
      save(conversationId, updated)
      return updated
    })
  }, [conversationId, authorId])

  const updateNote = useCallback((id: string, content: string, tag: NoteTag) => {
    setNotes(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, content: content.trim(), tag } : n)
      save(conversationId, updated)
      return updated
    })
  }, [conversationId])

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => {
      const note = prev.find(n => n.id === id)
      if (note?.content.startsWith('__wb_snap__:')) {
        localStorage.removeItem(note.content.slice('__wb_snap__:'.length))
      }
      const updated = prev.filter(n => n.id !== id)
      save(conversationId, updated)
      return updated
    })
  }, [conversationId])

  return { notes, addNote, updateNote, deleteNote }
}
