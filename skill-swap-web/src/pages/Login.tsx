import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { C } from '../constants/theme'
import { postLogin } from '../api/userApi'
import { useAuth } from '../context/AuthContext'
import { Wispa } from '../components/Wispa'
import { WispaCelebration } from '../components/WispaCelebration'

export function Login() {
  const { setAuth } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ type: string; profileComplete: boolean } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await postLogin(email, password)
      const type = res.userType ?? 'STUDENT'
      const profileComplete = res.tutorProfileComplete !== false
      setAuth(res.token, res.userId, type, profileComplete)
      setSuccess({ type, profileComplete })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Blad logowania')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <WispaCelebration
        message="Witaj z powrotem!"
        sub="Miło Cię widzieć znowu"
        delay={1800}
        onDone={() => {
          if (success.type === 'TUTOR' && !success.profileComplete) navigate('/tutor-onboarding')
          else if (redirect) navigate(redirect)
          else navigate(success.type === 'TUTOR' ? '/dashboard' : '/explore')
        }}
      />
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: C.bg, padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36, gap: 8 }}>
          <Wispa size={90} mood={loading ? 'thinking' : 'idle'} />
          <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.8, color: C.text }}>SkillSwap</span>
          <span style={{ fontSize: 14, color: C.textDim }}>Platforma korepetycji</span>
        </div>

        <div style={{ background: C.surface, borderRadius: 20, padding: 32, border: `1px solid ${C.border}` }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Zaloguj sie</h1>
          <p style={{ fontSize: 14, color: C.textDim, marginBottom: 24 }}>Witaj z powrotem</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="email@example.com" />
            <Field label="Haslo" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

            {error && (
              <div style={{ background: C.coral + '22', border: `1px solid ${C.coral}44`, borderRadius: 10, padding: '10px 14px', color: C.coral, fontSize: 14 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6, padding: '13px', borderRadius: 14, border: 'none',
                background: loading ? C.surfaceUp : C.amber,
                color: loading ? C.textDim : '#1A0A00',
                fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                borderBottom: `4px solid ${C.amberDark}`,
              }}
            >
              {loading ? 'Logowanie...' : 'Zaloguj sie'}
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: C.textDim }}>
            Nie masz konta?{' '}
            <Link to="/register" style={{ color: C.amber, fontWeight: 700, textDecoration: 'none' }}>
              Zarejestruj sie
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder }: {
  label: string; type: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: C.textDim }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required
        style={{
          padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`,
          background: C.bgDeep, color: C.text, fontSize: 15, outline: 'none', fontFamily: 'inherit',
        }}
      />
    </div>
  )
}
