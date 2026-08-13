import { useState } from 'react'
import { Banknote, Clock3, Trash2 } from 'lucide-react'
import { C } from '../../constants/theme'
import { Lesson, deleteLesson } from '../../api/lessonApi'

function statusConfig(status?: string | null) {
  if (status === 'COMPLETED') return { label: 'Zakończone', color: C.textFaint }
  if (status === 'CANCELLED') return { label: 'Anulowane', color: C.coral }
  if (status === 'PENDING') return { label: 'Oczekuje', color: C.amber }
  return { label: 'Aktywne', color: C.green }
}

interface LessonCardProps { lesson: Lesson; onDelete?: (id: string) => void }

export function LessonCard({ lesson, onDelete }: LessonCardProps) {
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const status = statusConfig(lesson.status)

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try { await deleteLesson(lesson.id); onDelete?.(lesson.id) }
    catch (reason: unknown) { setError(reason instanceof Error ? reason.message : 'Błąd usuwania'); setDeleting(false); setConfirm(false) }
  }

  return <article className="dashboard-lesson-card" style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '12px 18px', padding: '18px 0', borderTop: `1px solid ${C.border}` }}>
    <style>{`.dashboard-lesson-card:hover { background: ${C.surface}55; } @media (max-width: 420px) { .dashboard-lesson-card { grid-template-columns: minmax(0, 1fr) !important; } .dashboard-lesson-status { position: absolute; right: 0; top: 18px; } }`}</style>
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 70 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: status.color, flexShrink: 0 }} /><h3 style={{ overflow: 'hidden', color: C.text, fontSize: 16, fontWeight: 800, letterSpacing: '-.02em', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.subject}</h3></div>
      {lesson.description && <p style={{ display: '-webkit-box', overflow: 'hidden', marginTop: 7, color: C.textDim, fontSize: 13, lineHeight: 1.5, WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{lesson.description}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 13, color: C.textFaint, fontSize: 12 }}><span><Clock3 size={13} style={{ verticalAlign: '-3px', marginRight: 5 }} />{lesson.durationTime} min</span>{lesson.price != null && <span><Banknote size={13} style={{ verticalAlign: '-3px', marginRight: 5 }} />{lesson.price} zł</span>}{lesson.student && <span>Uczeń: <strong style={{ color: C.textDim }}>{lesson.student.username}</strong></span>}</div>
    </div>
    <div className="dashboard-lesson-status" style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}><span style={{ color: status.color, fontSize: 11, fontWeight: 750, whiteSpace: 'nowrap' }}>{status.label}</span>{onDelete && !confirm && <button onClick={() => setConfirm(true)} title="Usuń lekcję" aria-label={`Usuń lekcję ${lesson.subject}`} style={{ display: 'flex', padding: 3, border: 0, background: 'transparent', color: C.coral, cursor: 'pointer' }}><Trash2 size={14} /></button>}</div>
    {confirm && <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: `1px solid ${C.coral}44`, color: C.textDim, fontSize: 12 }}>Usunąć tę ofertę?<span style={{ flex: 1 }} /><button onClick={handleDelete} disabled={deleting} style={{ minHeight: 30, padding: '5px 10px', border: 0, borderRadius: 4, background: C.coral, color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer', font: '750 12px inherit' }}>{deleting ? '...' : 'Usuń'}</button><button onClick={() => setConfirm(false)} style={{ minHeight: 30, padding: '5px 10px', border: `1px solid ${C.border}`, borderRadius: 4, background: 'transparent', color: C.textDim, cursor: 'pointer', font: '650 12px inherit' }}>Anuluj</button></div>}
    {error && <div role="alert" style={{ gridColumn: '1 / -1', color: C.coral, fontSize: 12 }}>{error}</div>}
  </article>
}
