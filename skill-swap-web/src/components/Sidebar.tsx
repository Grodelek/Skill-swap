import { NavLink, useNavigate } from 'react-router-dom'
import { Compass, MessageCircle, BookOpen, User, LogOut, LayoutDashboard, PlusSquare } from 'lucide-react'
import { C } from '../constants/theme'
import { useAuth } from '../context/AuthContext'
import { Wispa } from './Wispa'

const STUDENT_NAV = [
  { to: '/explore', icon: Compass, label: 'Odkryj' },
  { to: '/bookings', icon: BookOpen, label: 'Zajecia' },
  { to: '/conversations', icon: MessageCircle, label: 'Wiadomosci' },
  { to: '/profile', icon: User, label: 'Profil' },
]

const TUTOR_NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/create-lesson', icon: PlusSquare, label: 'Nowa lekcja' },
  { to: '/conversations', icon: MessageCircle, label: 'Wiadomosci' },
  { to: '/profile', icon: User, label: 'Profil' },
]

export function Sidebar() {
  const { logout, userType } = useAuth()
  const navigate = useNavigate()
  const NAV = userType === 'TUTOR' ? TUTOR_NAV : STUDENT_NAV

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar" style={{
        width: 240,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: C.bgDeep,
        borderRight: `1px solid ${C.border}`,
        flexDirection: 'column',
        padding: '24px 12px',
        gap: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px 24px' }}>
          <Wispa size={36} floating={false} />
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5, color: C.text }}>
            SkillSwap
          </span>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 12,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? C.amber : C.textDim,
                background: isActive ? C.amber + '18' : 'transparent',
                transition: 'all 0.15s',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} color={isActive ? C.amber : C.textDim} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 14px', borderRadius: 12, border: 'none',
            background: 'transparent', cursor: 'pointer',
            fontSize: 15, fontWeight: 500, color: C.textFaint,
            width: '100%',
          }}
        >
          <LogOut size={20} color={C.textFaint} />
          Wyloguj
        </button>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="bottom-nav" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: C.bgDeep,
        borderTop: `1px solid ${C.border}`,
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '8px 16px',
              textDecoration: 'none',
              color: isActive ? C.amber : C.textFaint,
              flex: 1,
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={22} color={isActive ? C.amber : C.textFaint} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '8px 16px', border: 'none', background: 'transparent',
            cursor: 'pointer', flex: 1, color: C.textFaint,
          }}
        >
          <LogOut size={22} color={C.textFaint} strokeWidth={2} />
          <span style={{ fontSize: 10, fontWeight: 500 }}>Wyloguj</span>
        </button>
      </nav>
    </>
  )
}
