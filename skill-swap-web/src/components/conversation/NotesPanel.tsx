import { useState } from 'react'
import {
  IconAlarm,
  IconCircleCheck,
  IconAlertTriangle,
  IconEye,
  IconCalendar,
  IconTrash,
  IconDeviceFloppy,
} from '@tabler/icons-react'
import { useConversationNotes } from '../../hooks/useConversationNotes'
import { Offer } from '../../api/offerApi'
import { NoteTag, ConversationNote } from '../../types/note'

const N = {
  bg:          '#0f0f24',
  card:        '#1a1a35',
  border:      '#252545',
  accent:      '#7c3aed',
  accentLight: '#a78bfa',
  text:        '#f0eeff',
  muted:       '#7070a0',
  gold:        '#f59e0b',
  teal:        '#2dd4bf',
  danger:      '#ef4444',
  surface:     '#12122a',
} as const

const TAG_META: Record<Exclude<NoteTag, null>, { Icon: typeof IconAlarm; label: string; color: string }> = {
  reminder: { Icon: IconAlarm,         label: 'Przypomnienie', color: '#f59e0b' },
  mastered: { Icon: IconCircleCheck,   label: 'Opanowane',     color: '#2dd4bf' },
  warning:  { Icon: IconAlertTriangle, label: 'Uwaga',         color: '#ef4444' },
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60000)
  const hr   = Math.floor(diff / 3600000)
  const day  = Math.floor(diff / 86400000)
  if (min < 1)  return 'przed chwilą'
  if (min < 60) return `${min} min temu`
  if (hr  < 24) return `${hr} godz. temu`
  if (day < 7)  return `${day} dni temu`
  return new Date(iso).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function InitialAvatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: N.accent + '33', border: `1px solid ${N.accent}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: N.accentLight,
    }}>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

function TagChip({ tag }: { tag: NoteTag }) {
  if (!tag) return null
  const m = TAG_META[tag]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 4,
      background: m.color + '18', border: `1px solid ${m.color}44`,
      fontSize: 11, fontWeight: 600, color: m.color,
    }}>
      <m.Icon size={11} stroke={1.75} />
      {m.label}
    </span>
  )
}

function WhiteboardSnapshot({ snapKey }: { snapKey: string }) {
  const dataUrl = localStorage.getItem(snapKey)
  if (!dataUrl) return (
    <p style={{ margin: 0, fontSize: 13, color: N.muted, fontStyle: 'italic' }}>
      Snapshot tablicy (niedostępny)
    </p>
  )
  return (
    <img
      src={dataUrl}
      alt="Snapshot tablicy"
      style={{ maxWidth: '100%', borderRadius: 8, border: `1px solid ${N.border}`, display: 'block' }}
    />
  )
}

function NoteCard({ note, authorName, isTutor, onDelete }: {
  note: ConversationNote
  authorName: string
  isTutor: boolean
  onDelete: (id: string) => void
}) {
  return (
    <div style={{
      background: N.card,
      border: `1px solid ${N.border}`,
      borderRadius: 10,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <InitialAvatar name={authorName} size={30} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: N.text }}>{authorName}</span>
          <span style={{ fontSize: 12, color: N.muted, marginLeft: 8 }}>{relativeTime(note.createdAt)}</span>
        </div>
        {note.tag && <TagChip tag={note.tag} />}
        {isTutor && (
          <button
            onClick={() => onDelete(note.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: N.muted, display: 'flex', padding: 2, marginLeft: 4 }}
          >
            <IconTrash size={15} stroke={1.5} />
          </button>
        )}
      </div>
      {note.content.startsWith('__wb_snap__:') ? (
        <WhiteboardSnapshot snapKey={note.content.slice('__wb_snap__:'.length)} />
      ) : (
        <p style={{ margin: 0, fontSize: 14, color: N.text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {note.content}
        </p>
      )}
    </div>
  )
}

function TagButton({ tag, active, onClick }: { tag: Exclude<NoteTag, null>; active: boolean; onClick: () => void }) {
  const m = TAG_META[tag]
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 11px', borderRadius: 6,
        border: `1px solid ${active ? m.color : N.border}`,
        background: active ? m.color + '22' : 'transparent',
        color: active ? m.color : N.muted,
        fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      <m.Icon size={13} stroke={1.75} />
      {m.label}
    </button>
  )
}

interface LastSessionChipProps {
  offers: Offer[]
}

function LastSessionChip({ offers }: LastSessionChipProps) {
  const last = [...offers]
    .filter(o => o.completed && o.sessionStartTime)
    .sort((a, b) => new Date(b.sessionStartTime!).getTime() - new Date(a.sessionStartTime!).getTime())[0]

  if (!last) return null

  const dateStr = new Date(last.sessionStartTime!).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: '2-digit' })
  const subject = last.lesson?.subject ?? 'Lekcja'

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 12px', borderRadius: 6,
      background: N.card, border: `1px solid ${N.border}`,
      fontSize: 12, color: N.muted,
    }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
      <IconCalendar size={13} stroke={1.5} color={N.muted} />
      <span>Ostatnia sesja: <strong style={{ color: N.text }}>{subject}</strong> · {dateStr}</span>
    </div>
  )
}

interface StatsRowProps {
  offers: Offer[]
}

function StatsRow({ offers }: StatsRowProps) {
  const completed = offers.filter(o => o.completed).length
  const uniqueLessons = new Set(offers.filter(o => o.lesson?.subject).map(o => o.lesson!.subject)).size
  const xp = completed * 10

  const stats = [
    { label: 'Sesji ukończonych', value: completed, color: N.accentLight },
    { label: 'Unikalnych lekcji', value: uniqueLessons, color: N.teal },
    { label: 'XP razem', value: xp, color: N.gold },
  ]

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {stats.map(s => (
        <div key={s.label} style={{
          flex: 1, background: N.card, border: `1px solid ${N.border}`,
          borderRadius: 10, padding: '12px 14px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: s.color, letterSpacing: -0.5 }}>{s.value}</div>
          <div style={{ fontSize: 11, color: N.muted, marginTop: 3, lineHeight: 1.3 }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

interface NotesPanelProps {
  conversationId: string
  currentUserId: string
  currentUserName: string
  isTutor: boolean
  offers: Offer[]
}

export function NotesPanel({ conversationId, currentUserId, currentUserName, isTutor, offers }: NotesPanelProps) {
  const { notes, addNote, deleteNote } = useConversationNotes(conversationId, currentUserId)

  const [draft, setDraft] = useState('')
  const [activeTag, setActiveTag] = useState<NoteTag>(null)
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    if (!draft.trim()) return
    setSaving(true)
    addNote(draft, activeTag)
    setDraft('')
    setActiveTag(null)
    setSaving(false)
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: N.bg, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

      <LastSessionChip offers={offers} />

      <StatsRow offers={offers} />

      {isTutor && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
          background: N.card, border: `1px solid ${N.border}`, borderRadius: 10,
        }}>
          <InitialAvatar name={currentUserName} size={34} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Dodaj notatkę o tej sesji lub uczniu..."
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: `1px solid ${N.border}`, background: N.surface,
                color: N.text, fontSize: 14, fontFamily: 'inherit',
                resize: 'none', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = N.accent)}
              onBlur={e => (e.target.style.borderColor = N.border)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {(['reminder', 'mastered', 'warning'] as const).map(tag => (
                <TagButton
                  key={tag}
                  tag={tag}
                  active={activeTag === tag}
                  onClick={() => setActiveTag(prev => prev === tag ? null : tag)}
                />
              ))}
              <button
                onClick={handleSave}
                disabled={!draft.trim() || saving}
                style={{
                  marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 16px', borderRadius: 8, border: 'none',
                  background: draft.trim() ? N.accent : N.border,
                  color: draft.trim() ? '#fff' : N.muted,
                  fontSize: 13, fontWeight: 700, cursor: draft.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                }}
              >
                <IconDeviceFloppy size={15} stroke={1.75} />
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}

      {isTutor && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: 8,
          background: N.accent + '12', border: `1px solid ${N.accent}33`,
          fontSize: 13, color: N.accentLight,
        }}>
          <IconEye size={15} stroke={1.5} />
          <span>Student widzi te notatki — tylko do odczytu</span>
        </div>
      )}

      {notes.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, paddingTop: 32 }}>
          <div style={{ fontSize: 14, color: N.muted }}>
            {isTutor ? 'Brak notatek. Dodaj pierwszą powyżej.' : 'Tutor nie dodał jeszcze żadnych notatek.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              authorName={currentUserName}
              isTutor={isTutor}
              onDelete={deleteNote}
            />
          ))}
        </div>
      )}
    </div>
  )
}
