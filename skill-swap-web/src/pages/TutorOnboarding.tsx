import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C } from '../constants/theme'
import { authFetch } from '../api/httpClient'
import { useAuth } from '../context/AuthContext'
import { Wispa } from '../components/Wispa'
import { WispaCelebration } from '../components/WispaCelebration'

type ExperienceTime = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
type Availability = 'WEEKDAYS_ONLY' | 'WEEKENDS_ONLY' | 'EVENING_ONLY' | 'FLEXIBLE'
type LessonType = 'PROFESSIONAL' | 'CASUAL' | 'FLEXIBLE'

const EXPERIENCE_OPTIONS: { value: ExperienceTime; label: string }[] = [
  { value: 'BEGINNER', label: 'Początkujący' },
  { value: 'INTERMEDIATE', label: 'Średniozaawansowany' },
  { value: 'ADVANCED', label: 'Zaawansowany' },
  { value: 'EXPERT', label: 'Ekspert' },
]

const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: 'WEEKDAYS_ONLY', label: 'Tylko dni robocze' },
  { value: 'WEEKENDS_ONLY', label: 'Tylko weekendy' },
  { value: 'EVENING_ONLY', label: 'Tylko wieczory' },
  { value: 'FLEXIBLE', label: 'Elastycznie' },
]

const LESSON_TYPE_OPTIONS: { value: LessonType; label: string }[] = [
  { value: 'PROFESSIONAL', label: 'Profesjonalne' },
  { value: 'CASUAL', label: 'Casualowe' },
  { value: 'FLEXIBLE', label: 'Elastyczne' },
]

export function TutorOnboarding() {
  const navigate = useNavigate()
  const { token, userId, userType, setAuth } = useAuth()
  const [experienceTime, setExperienceTime] = useState<ExperienceTime | ''>('')
  const [availability, setAvailability] = useState<Availability | ''>('')
  const [lessonType, setLessonType] = useState<LessonType | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!experienceTime || !availability || !lessonType) {
      setError('Wypełnij wszystkie pola')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await authFetch('/api/users/tutor/info', {
        method: 'PUT',
        body: JSON.stringify({ experienceTime, availability, lessonType }),
      })
      if (!res.ok) throw new Error('Nie udało się zapisać profilu')
      if (token && userId && userType) setAuth(token, userId, userType, true)
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Błąd zapisu')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <WispaCelebration
        message="Profil gotowy!"
        sub="Możesz teraz przyjmować uczniów"
        delay={1800}
        onDone={() => navigate('/dashboard')}
      />
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: C.bg, padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32, gap: 8 }}>
          <Wispa size={90} mood="idle" />
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.8, color: C.text }}>Witaj, Tutorze!</span>
          <span style={{ fontSize: 14, color: C.textDim, textAlign: 'center' }}>
            Uzupełnij kilka informacji, żeby uczniowie mogli Cię znaleźć
          </span>
        </div>

        <div style={{ background: C.surface, borderRadius: 20, padding: 32, border: `1px solid ${C.border}` }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <SelectGroup
              label="Poziom doświadczenia"
              options={EXPERIENCE_OPTIONS}
              value={experienceTime}
              onChange={v => setExperienceTime(v as ExperienceTime)}
            />
            <SelectGroup
              label="Dostępność"
              options={AVAILABILITY_OPTIONS}
              value={availability}
              onChange={v => setAvailability(v as Availability)}
            />
            <SelectGroup
              label="Styl lekcji"
              options={LESSON_TYPE_OPTIONS}
              value={lessonType}
              onChange={v => setLessonType(v as LessonType)}
            />

            {error && (
              <div style={{ background: C.coral + '22', border: `1px solid ${C.coral}44`, borderRadius: 10, padding: '10px 14px', color: C.coral, fontSize: 14 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '13px', borderRadius: 14, border: 'none',
                background: loading ? C.surfaceUp : C.amber,
                color: loading ? C.textDim : '#1A0A00',
                fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                borderBottom: `4px solid ${C.amberDark}`,
              }}
            >
              {loading ? 'Zapisywanie...' : 'Przejdź do dashboardu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function SelectGroup({
  label, options, value, onChange,
}: {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: C.textDim }}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            style={{
              padding: '9px 16px', borderRadius: 12, border: '1.5px solid',
              borderColor: value === o.value ? C.amber : C.border,
              background: value === o.value ? C.amber + '18' : C.bgDeep,
              color: value === o.value ? C.amber : C.textDim,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
