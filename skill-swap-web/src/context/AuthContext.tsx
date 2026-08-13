import React, { createContext, useContext, useEffect, useState } from 'react'
import { registerUnauthorizedHandler } from '../api/authEvents'

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

interface AuthContextType {
  token: string | null
  userId: string | null
  userType: string | null
  tutorProfileComplete: boolean
  setAuth: (token: string, userId: string, userType: string, tutorProfileComplete?: boolean) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [tutorProfileComplete, setTutorProfileComplete] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('jwtToken')
    if (t && !isTokenExpired(t)) {
      setToken(t)
      setUserId(localStorage.getItem('userId'))
      setUserType(localStorage.getItem('userType'))
      setTutorProfileComplete(localStorage.getItem('tutorProfileComplete') !== 'false')
    } else if (t) {
      localStorage.removeItem('jwtToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('userType')
      localStorage.removeItem('tutorProfileComplete')
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    registerUnauthorizedHandler(() => logout())
  }, [])

  const setAuth = (t: string, id: string, type: string, profileComplete = true) => {
    localStorage.setItem('jwtToken', t)
    localStorage.setItem('userId', id)
    localStorage.setItem('userType', type)
    localStorage.setItem('tutorProfileComplete', String(profileComplete))
    setToken(t)
    setUserId(id)
    setUserType(type)
    setTutorProfileComplete(profileComplete)
  }

  const logout = () => {
    localStorage.removeItem('jwtToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('userType')
    localStorage.removeItem('tutorPreferences')
    localStorage.removeItem('tutorProfileComplete')
    setToken(null)
    setUserId(null)
    setUserType(null)
    setTutorProfileComplete(true)
  }

  return (
    <AuthContext.Provider value={{ token, userId, userType, tutorProfileComplete, setAuth, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
