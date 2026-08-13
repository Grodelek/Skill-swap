import { BASE_URL } from '../config/baseUrl'
import { authFetch } from './httpClient'

export interface LoginResponse {
  token: string
  userId: string
  userType?: string
  tutorProfileComplete?: boolean
}

export interface User {
  id: string
  email: string
  username: string
  photoPath?: string
  description?: string
  points?: number
  userType?: 'STUDENT' | 'TUTOR'
  experienceTime?: string
  availability?: string
  lessonType?: string
  slug?: string
}

export async function postLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Nieprawidłowy email lub hasło')
  return res.json()
}

export async function postRegister(email: string, username: string, password: string, userType: 'STUDENT' | 'TUTOR') {
  const res = await fetch(`${BASE_URL}/api/users/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password, userType }),
  })
  if (!res.ok) throw new Error('Rejestracja nie powiodła się')
  return res.json()
}

export async function getMyAccount(): Promise<User> {
  const res = await authFetch('/api/users/me')
  if (!res.ok) throw new Error('Nie udało się pobrać profilu')
  return res.json()
}

export async function getUserById(id: string): Promise<User> {
  const res = await authFetch(`/api/users/${id}`)
  if (!res.ok) throw new Error('Nie udało się pobrać użytkownika')
  return res.json()
}

export async function updateUser(data: Partial<User> & { id: string }): Promise<User> {
  const res = await authFetch(`/api/users/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Nie udało się zaktualizować profilu')
  return res.json()
}

export interface PublicLesson {
  id: string
  subject: string
  durationTime: number
  price?: number
  description?: string
}

export interface PublicTutorProfile {
  id: string
  username: string
  slug: string
  photoPath?: string
  description?: string
  points?: number
  userType: 'STUDENT' | 'TUTOR'
  experienceTime?: string
  availability?: string
  lessonType?: string
  lessons: PublicLesson[]
}

export interface TutorInfo {
  experienceTime?: string
  availability?: string
  lessonType?: string
}

export async function getMyTutorInfo(): Promise<TutorInfo> {
  const res = await authFetch('/api/users/tutor/me')
  if (!res.ok) throw new Error('no tutor info')
  return res.json()
}

export async function getTutorBySlug(slug: string): Promise<PublicTutorProfile> {
  const res = await fetch(`${BASE_URL}/api/users/public/${slug}`)
  if (res.status === 404) throw new Error('Nie znaleziono tutora')
  if (!res.ok) throw new Error('Błąd serwera')
  return res.json()
}

export async function uploadPhoto(base64: string): Promise<void> {
  const res = await authFetch('/api/users/photo/upload', {
    method: 'PUT',
    body: JSON.stringify(base64),
  })
  if (!res.ok) throw new Error('Nie udało się przesłać zdjęcia')
}
