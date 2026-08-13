import { authFetch } from './httpClient'

export interface TutorCard {
  tutorId: string
  tutorUsername: string
  tutorPhotoPath?: string | null
  tutorDescription?: string | null
  lessonId: string
  subject: string
  lessonDescription?: string | null
  durationTime: number
  price?: number | null
  rating: number
  tutorTeachingStyle?: 'CASUAL' | 'PROFESSIONAL' | 'FLEXIBLE' | null
  tutorUserType?: string | null
  tutorAvailability?: string | null
}

export interface TutorSearchRequest {
  userId?: string
  subject?: string
  level?: string
  minPrice?: number
  maxPrice?: number
  preferredTeachingStyle?: 'CASUAL' | 'PROFESSIONAL' | 'FLEXIBLE'
  preferredUserType?: string
  preferredAvailability?: string
}

export async function fetchTutors(filters: TutorSearchRequest): Promise<TutorCard[]> {
  const res = await authFetch('/api/tutors/discover/search', {
    method: 'POST',
    body: JSON.stringify(filters),
  })
  if (!res.ok) throw new Error('Błąd wyszukiwania tutorów')
  return res.json()
}
