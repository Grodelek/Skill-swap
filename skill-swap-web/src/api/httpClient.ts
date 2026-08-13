import { BASE_URL } from '../config/baseUrl'
import { triggerUnauthorized } from './authEvents'

export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('jwtToken')
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (res.status === 401) {
    triggerUnauthorized()
  }
  return res
}
