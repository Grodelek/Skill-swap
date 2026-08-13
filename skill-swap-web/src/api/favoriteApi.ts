import { authFetch } from './httpClient'

export async function addFavoriteTutor(tutorId: string): Promise<void> {
  await authFetch('/api/favorites/add', {
    method: 'POST',
    body: JSON.stringify({ tutorId }),
  })
}
