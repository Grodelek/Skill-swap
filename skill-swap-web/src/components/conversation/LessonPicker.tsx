import { X } from 'lucide-react'
import { C } from '../../constants/theme'
import { Lesson } from '../../api/lessonApi'

interface LessonPickerProps {
  lessons: Lesson[]
  loading: boolean
  onSelect: (lesson: Lesson) => void
  onClose: () => void
}

export function LessonPicker({ lessons, loading, onSelect, onClose }: LessonPickerProps) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{ background: C.bg, borderRadius: 20, padding: '24px', width: '100%', maxWidth: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column', border: `1.5px solid ${C.border}` }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Wybierz lekcję</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim }}><X size={20} /></button>
        </div>

        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: C.textFaint }}>Ładowanie lekcji...</div>
          ) : lessons.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: C.textFaint }}>Brak dostępnych lekcji</div>
          ) : lessons.map(lesson => (
            <button
              key={lesson.id}
              onClick={() => onSelect(lesson)}
              style={{ padding: '16px 18px', borderRadius: 14, border: `1.5px solid ${C.border}`, background: C.surface, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = C.amber)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
            >
              <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{lesson.subject}</div>
              {lesson.description && (
                <div style={{ fontSize: 13, color: C.textDim, marginTop: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {lesson.description}
                </div>
              )}
              <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                <span style={{ fontSize: 12, color: C.textFaint }}>{lesson.durationTime} min</span>
                {lesson.price != null && <span style={{ fontSize: 12, color: C.textFaint }}>{lesson.price} zł</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
