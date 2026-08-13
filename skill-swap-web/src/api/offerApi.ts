import { authFetch } from './httpClient'

export interface OfferLesson {
  id: string
  subject: string
  description?: string
  durationTime: number
  price?: number
  tutorId?: string
}

export interface Offer {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  sessionStartTime?: string
  studentConfirmedPayment: boolean
  tutorConfirmedPayment: boolean
  completed: boolean
  tutorId: string
  tutorUsername: string
  tutorPhotoPath?: string
  studentId: string
  studentUsername: string
  studentPhotoPath?: string
  lesson?: OfferLesson
}

export async function fetchMyBookings(): Promise<Offer[]> {
  const res = await authFetch('/api/offer/my')
  if (!res.ok) throw new Error('Błąd pobierania rezerwacji')
  return res.json()
}

export async function sendOffer(lessonId: string, receiverId: string, sessionStartTime: string): Promise<void> {
  await authFetch('/api/offer/send', {
    method: 'POST',
    body: JSON.stringify({ lessonId, receiverId, sessionStartTime }),
  })
}

export async function acceptOffer(offerId: string): Promise<void> {
  await authFetch(`/api/offer/accept/${offerId}`, { method: 'POST' })
}

export async function declineOffer(offerId: string): Promise<void> {
  await authFetch(`/api/offer/decline/${offerId}`, { method: 'POST' })
}

export async function confirmPayment(offerId: string): Promise<Offer> {
  const res = await authFetch(`/api/offer/confirm-payment/${offerId}`, { method: 'POST' })
  if (!res.ok) throw new Error('Błąd potwierdzenia płatności')
  return res.json()
}
