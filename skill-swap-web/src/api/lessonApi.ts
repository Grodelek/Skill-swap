import { authFetch } from './httpClient'

export interface Lesson {
  id: string
  subject: string
  description: string
  price: number | null
  durationTime: number
  status?: string | null
  student?: { id: string; username: string; photoPath?: string }
  tutor?: { id: string; username: string; photoPath?: string }
}

export async function sendMessageToTutor(tutorId: string): Promise<{ id: string }> {
  const user1Id = localStorage.getItem('userId') ?? ''
  const res = await authFetch('/api/messages/get-or-create', {
    method: 'POST',
    body: JSON.stringify({ user1Id, user2Id: tutorId }),
  })
  if (!res.ok) throw new Error('Blad tworzenia konwersacji')
  return res.json()
}

export async function fetchLessonsByTutor(tutorId: string): Promise<Lesson[]> {
  const res = await authFetch(`/api/lessons/by-tutor/${tutorId}`)
  if (!res.ok) throw new Error('Blad pobierania lekcji')
  return res.json()
}

export async function createLesson(data: {
  subject: string
  description: string
  price: number
  durationTime: number
}): Promise<Lesson> {
  const res = await authFetch('/api/lessons/add', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Blad tworzenia lekcji')
  return res.json()
}

export async function deleteLesson(id: string): Promise<void> {
  const res = await authFetch(`/api/lessons/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Nie udało się usunąć lekcji')
}
