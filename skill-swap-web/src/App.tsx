import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Sidebar } from './components/Sidebar'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ExploreTutors } from './pages/ExploreTutors'
import { Conversations } from './pages/Conversations'
import { ConversationDetail } from './pages/ConversationDetail'
import { Bookings } from './pages/Bookings'
import { Profile } from './pages/Profile'
import { TutorDashboard } from './pages/TutorDashboard'
import { CreateLesson } from './pages/CreateLesson'
import { TutorOnboarding } from './pages/TutorOnboarding'
import { PublicTutorProfile } from './pages/PublicTutorProfile'
import { C } from './constants/theme'

function AppLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: C.bg }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  )
}

function ProtectedRoutes() {
  const { token, userType, tutorProfileComplete, isLoading } = useAuth()
  const { pathname } = useLocation()
  if (isLoading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.amber}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
  if (!token) return <Navigate to="/login" replace />
  if (userType === 'TUTOR' && !tutorProfileComplete && pathname !== '/tutor-onboarding') return <Navigate to="/tutor-onboarding" replace />
  return <Outlet />
}

function tutorDestination(tutorProfileComplete: boolean) {
  return tutorProfileComplete ? '/dashboard' : '/tutor-onboarding'
}

function RootRedirect() {
  const { token, userType, tutorProfileComplete, isLoading } = useAuth()
  if (isLoading) return null
  if (!token) return <Navigate to="/login" replace />
  return <Navigate to={userType === 'TUTOR' ? tutorDestination(tutorProfileComplete) : '/explore'} replace />
}

function PublicRoutes() {
  const { token, userType, tutorProfileComplete, isLoading } = useAuth()
  if (isLoading) return null
  if (token) return <Navigate to={userType === 'TUTOR' ? tutorDestination(tutorProfileComplete) : '/explore'} replace />
  return <Outlet />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicRoutes />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<ProtectedRoutes />}>
            <Route path="/tutor-onboarding" element={<TutorOnboarding />} />
            <Route element={<AppLayout />}>
              <Route path="/explore" element={<ExploreTutors />} />
              <Route path="/conversations" element={<Conversations />} />
              <Route path="/conversations/:id" element={<ConversationDetail />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<TutorDashboard />} />
              <Route path="/create-lesson" element={<CreateLesson />} />
            </Route>
          </Route>
          <Route path="/tutor/:slug" element={<PublicTutorProfile />} />
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
