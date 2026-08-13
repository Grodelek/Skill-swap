import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { C } from '../constants/theme'
import { fetchLessonsByTutor, Lesson } from '../api/lessonApi'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui/Spinner'
import { LessonCard } from '../components/dashboard/LessonCard'
import { Wispa } from '../components/Wispa'

export function TutorDashboard() {
  const { userId } = useAuth()
  const navigate = useNavigate()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return
    fetchLessonsByTutor(userId)
      .then(setLessons)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <Spinner />

  const active   = lessons.filter(l => l.status !== 'COMPLETED' && l.status !== 'CANCELLED')
  const archived = lessons.filter(l => l.status === 'COMPLETED' || l.status === 'CANCELLED')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 20px 14px', flexShrink: 0, borderBottom: `1px solid ${C.border}`,
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>Dashboard</h1>
          <p style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{active.length} aktywnych ogłoszeń</p>
        </div>
        <button
          onClick={() => navigate('/create-lesson')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 12, border: 'none', background: C.amber, color: '#1A0A00', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <Plus size={15} /> Nowe
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {error && (
          <div style={{ padding: '11px 14px', borderRadius: 10, background: C.coral + '22', color: C.coral, fontSize: 14 }}>{error}</div>
        )}

        {lessons.length === 0 && !error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, gap: 14 }}>
            <Wispa size={72} />
            <div style={{ fontWeight: 700, fontSize: 16, color: C.textDim }}>Brak ogłoszeń</div>
            <div style={{ fontSize: 13, color: C.textFaint, textAlign: 'center', maxWidth: 260 }}>
              Dodaj swoją pierwszą lekcję, aby zacząć przyjmować uczniów
            </div>
            <button onClick={() => navigate('/create-lesson')} style={{ padding: '10px 22px', borderRadius: 12, border: 'none', background: C.amber, color: '#1A0A00', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
              Dodaj lekcję
            </button>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Aktywne · {active.length}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {active.map(l => <LessonCard key={l.id} lesson={l} onDelete={id => setLessons(prev => prev.filter(x => x.id !== id))} />)}
                </div>
              </section>
            )}
            {archived.length > 0 && (
              <section>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Archiwum · {archived.length}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {archived.map(l => <LessonCard key={l.id} lesson={l} onDelete={id => setLessons(prev => prev.filter(x => x.id !== id))} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
