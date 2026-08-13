import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, ChevronRight, MessageCircle, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { C } from '../constants/theme'
import { fetchConversations, ConversationDTO } from '../api/conversationApi'
import { getUserById } from '../api/userApi'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui/Spinner'
import { Avatar } from '../components/ui/Avatar'
import { Wispa } from '../components/Wispa'

interface ConvWithPhoto extends ConversationDTO { otherPhoto?: string | null }

function formatTime(iso?: string) {
  if (!iso) return 'Brak daty'
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  if (date.toDateString() === yesterday.toDateString()) return 'Wczoraj'
  return date.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short' }).replace('.', '')
}

export function Conversations() {
  const { userId } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<ConvWithPhoto[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchConversations()
      .then(async list => {
        const withPhotos = await Promise.all(list.map(async conversation => {
          const otherId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id
          try { return { ...conversation, otherPhoto: (await getUserById(otherId)).photoPath ?? null } }
          catch { return { ...conversation, otherPhoto: null } }
        }))
        setConversations(withPhotos)
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Nie udało się pobrać wiadomości.'))
      .finally(() => setLoading(false))
  }, [userId])

  const filtered = useMemo(() => conversations.filter(conversation => {
    const isUser1 = conversation.user1Id === userId
    const name = isUser1 ? conversation.user2Username : conversation.user1Username
    return name?.toLowerCase().includes(query.toLowerCase())
  }), [conversations, query, userId])

  if (loading) return <Spinner />

  return (
    <div className="conversations-page" style={{ flex: 1, minHeight: 0, overflow: 'hidden', background: C.bg }}>
      <style>{`
        .conversations-page * { box-sizing: border-box; }
        .conversations-header { padding: 29px 42px 24px; border-bottom: 1px solid ${C.border}; }
        .conversations-scroll { height: calc(100% - 120px); overflow-y: auto; padding: 31px 42px 48px; }
        .conversations-shell { max-width: 850px; margin: 0 auto; }
        .conversation-row { width: 100%; display: flex; align-items: center; gap: 16px; padding: 17px 0; border: 0; border-top: 1px solid ${C.border}; background: transparent; color: inherit; cursor: pointer; font-family: inherit; text-align: left; }
        .conversation-row:hover, .conversation-row:focus-visible { background: ${C.surface}66; outline: none; }
        .conversation-row:focus-visible { box-shadow: inset 3px 0 ${C.amber}; }
        .conversation-search:focus { border-color: ${C.amber} !important; box-shadow: 0 0 0 3px ${C.amber}18; }
        @media (max-width: 700px) {
          .conversations-header { padding: 21px 20px 18px; }
          .conversations-scroll { height: calc(100% - 103px); padding: 24px 20px 90px; }
        }
        @media (max-width: 420px) {
          .conversations-header { padding: 18px 16px 15px; }
          .conversations-scroll { padding: 20px 16px 90px; }
          .conversation-row { gap: 12px; padding: 15px 0; }
        }
      `}</style>

      <header className="conversations-header">
        <div className="conversations-shell">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.teal, font: '700 11px ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '.12em', textTransform: 'uppercase' }}><span style={{ width: 22, height: 1, background: C.teal }} /> Inbox / {conversations.length.toString().padStart(2, '0')}</div>
          <h1 style={{ marginTop: 10, color: C.text, fontSize: 'clamp(27px, 4vw, 38px)', lineHeight: 1, letterSpacing: '-.05em', fontWeight: 850 }}>Rozmowy</h1>
          <p style={{ marginTop: 10, color: C.textDim, fontSize: 13 }}>Twoje kontakty z osobami, z którymi wymieniasz umiejętności.</p>
        </div>
      </header>

      <main className="conversations-scroll">
        <div className="conversations-shell">
          {conversations.length > 0 && <div style={{ position: 'relative', marginBottom: 25 }}><Search size={16} color={C.textFaint} style={{ position: 'absolute', top: 15, left: 14 }} /><input className="conversation-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Znajdź rozmowę" aria-label="Znajdź rozmowę" style={{ width: '100%', minHeight: 46, padding: '12px 14px 12px 40px', border: `1px solid ${C.borderStrong}`, borderRadius: 5, background: C.bgDeep, color: C.text, font: '14px inherit', outline: 'none' }} /></div>}

          {error && <div role="alert" style={{ padding: '12px 14px', marginBottom: 18, borderLeft: `3px solid ${C.coral}`, background: C.coral + '12', color: C.coral, fontSize: 13 }}>{error}</div>}

          {filtered.length === 0 && !error ? (
            <div style={{ minHeight: 330, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '30px 0', borderTop: `1px solid ${C.border}` }}>
              <div style={{ display: 'grid', placeItems: 'center', width: 48, height: 48, marginBottom: 20, border: `1px solid ${C.borderStrong}`, color: C.teal }}><MessageCircle size={22} /></div>
              <h2 style={{ color: C.text, fontSize: 21, letterSpacing: '-.03em' }}>{query ? 'Nie znaleziono rozmowy' : 'Tu zaczną się rozmowy'}</h2>
              <p style={{ maxWidth: 310, marginTop: 9, color: C.textDim, fontSize: 13, lineHeight: 1.55 }}>{query ? 'Spróbuj wyszukać inną nazwę użytkownika.' : 'Napisz do tutora, aby ustalić szczegóły pierwszej lekcji.'}</p>
              {!query && <button onClick={() => navigate('/explore')} style={{ marginTop: 23, minHeight: 44, padding: '10px 15px', border: 0, borderRadius: 5, background: C.amber, color: '#1A0A00', cursor: 'pointer', font: '800 13px inherit' }}>Odkryj tutorów <ArrowUpRight size={15} style={{ verticalAlign: '-3px', marginLeft: 4 }} /></button>}
            </div>
          ) : filtered.map(conversation => {
            const isUser1 = conversation.user1Id === userId
            const name = isUser1 ? conversation.user2Username : conversation.user1Username
            const otherId = isUser1 ? conversation.user2Id : conversation.user1Id
            return <button key={conversation.id} className="conversation-row" onClick={() => navigate(`/conversations/${conversation.id}`, { state: { receiverId: otherId, tutorName: name } })}>
              <Avatar name={name ?? '?'} photo={conversation.otherPhoto} size={48} />
              <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: 'block', overflow: 'hidden', color: C.text, fontSize: 15, fontWeight: 750, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name || 'Użytkownik'}</span><span style={{ display: 'block', marginTop: 4, color: C.textFaint, fontSize: 12 }}>Ostatni kontakt</span></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0, color: C.textFaint, fontSize: 12 }}>{formatTime(conversation.lastMessageAt)}<ChevronRight size={16} /></span>
            </button>
          })}
        </div>
      </main>
    </div>
  )
}
