import { BASE_URL } from '../config/baseUrl'

export function getImageUrl(photoPath?: string | null): string | null {
  if (!photoPath) return null
  return photoPath.startsWith('http') ? photoPath : `${BASE_URL}${photoPath}`
}
