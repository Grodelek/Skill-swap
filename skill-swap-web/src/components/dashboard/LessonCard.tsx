import { useState } from 'react'
import { Clock, Banknote, Trash2 } from 'lucide-react'
import { C } from '../../constants/theme'
import { Lesson, deleteLesson } from '../../api/lessonApi'

function statusConfig(status?: string | null) {
  if (status === 'COMPLETED') return { label: 'Zakończone', color: C.textFaint, bg: C.surfaceUp }
  if (status === 'CANCELLED') return { label: 'Anulowane',  color: C.coral,     bg: C.surfaceUp }
  if (status === 'PENDING')   return { label: 'Oczekuje',   color: C.amber,     bg: C.surfaceUp }
  return                             { label: 'Aktywne',    color: C.green,     bg: C.surfaceUp }
}

interface LessonCardProps {
  lesson: Lesson
  onDelete?: (id: string) => void
}

export function LessonCard({ lesson, onDelete }: LessonCardProps) {
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const s = statusConfig(lesson.status)

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      await deleteLesson(lesson.id)
      onDelete?.(lesson.id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Błąd usuwania')
      setDeleting(false)
      setConfirm(false)
    }
  }

  return (
    <div style={{
      background: C.surface, borderRadius: 14, padding: '16px 18px',
      border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{lesson.subject}</div>
          {lesson.description && (
            <div style={{
              fontSize: 13, color: C.textDim, marginTop: 3, lineHeight: 1.5,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {lesson.description}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: s.bg, color: s.color, border: `1px solid ${C.border}`,
          }}>
            {s.label}
          </span>
          {onDelete && !confirm && (
            <button onClick={() => setConfirm(true)} title="Usuń lekcję" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: C.coral, padding: 4, display: 'flex',
            }}>
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {confirm && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: C.coral + '18', border: `1px solid ${C.coral}44` }}>
          <span style={{ fontSize: 12, color: C.textDim, flex: 1 }}>Usunąć tę lekcję?</span>
          <button onClick={handleDelete} disabled={deleting} style={{ padding: '4px 12px', borderRadius: 8, border: 'none', background: C.coral, color: '#fff', fontWeight: 700, fontSize: 12, cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: deleting ? 0.6 : 1 }}>
            {deleting ? '...' : 'Usuń'}
          </button>
          <button onClick={() => setConfirm(false)} style={{ padding: '4px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'none', color: C.textDim, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            Anuluj
          </button>
        </div>
      )}

      {error && <div style={{ fontSize: 12, color: C.coral }}>{error}</div>}

      <div style={{ display: 'flex', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: C.textDim }}>
          <Clock size={13} /> {lesson.durationTime} min
        </div>
        {lesson.price != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: C.textDim }}>
            <Banknote size={13} /> {lesson.price} zł
          </div>
        )}
      </div>

      {lesson.student && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%', background: C.surfaceUp,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: C.textDim,
          }}>
            {(lesson.student.username || '?').charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 13, color: C.textDim }}>
            Uczeń: <strong style={{ color: C.text }}>{lesson.student.username}</strong>
          </span>
        </div>
      )}
    </div>
  )
}
