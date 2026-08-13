import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { C } from '../constants/theme'
import { fetchConversations, ConversationDTO } from '../api/conversationApi'
import { getUserById } from '../api/userApi'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui/Spinner'
import { Avatar } from '../components/ui/Avatar'
import { Wispa } from '../components/Wispa'

interface ConvWithPhoto extends ConversationDTO {
  otherPhoto?: string | null
}

function formatTime(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })
}

export function Conversations() {
  const { userId } = useAuth()
  const navigate = useNavigate()
  const [convs, setConvs] = useState<ConvWithPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchConversations()
      .then(async list => {
        const withPhotos = await Promise.all(
          list.map(async conv => {
            const otherId = conv.user1Id === userId ? conv.user2Id : conv.user1Id
            try { return { ...conv, otherPhoto: (await getUserById(otherId)).photoPath ?? null } }
            catch { return { ...conv, otherPhoto: null } }
          })
        )
        setConvs(withPhotos)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <Spinner />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px 14px', flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>Wiadomości</h1>
      </div>

      {error && (
        <div style={{ margin: '14px 24px', padding: '11px 14px', borderRadius: 10, background: C.coral + '22', color: C.coral, fontSize: 14 }}>{error}</div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {convs.length === 0 && !error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, gap: 14 }}>
            <Wispa size={72} />
            <div style={{ fontWeight: 700, fontSize: 15, color: C.textDim }}>Brak wiadomości</div>
            <div style={{ fontSize: 13, color: C.textFaint, textAlign: 'center', maxWidth: 240 }}>Połącz się z tutorem, aby rozpocząć czat</div>
          </div>
        ) : convs.map(conv => {
          const isUser1 = conv.user1Id === userId
          const otherName = isUser1 ? conv.user2Username : conv.user1Username
          const otherId   = isUser1 ? conv.user2Id       : conv.user1Id

          return (
            <button
              key={conv.id}
              onClick={() => navigate(`/conversations/${conv.id}`, { state: { receiverId: otherId, tutorName: otherName } })}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '13px 24px', border: 'none', borderBottom: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.background = C.surface)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Avatar name={otherName ?? '?'} photo={conv.otherPhoto} size={46} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{otherName || 'Użytkownik'}</div>
                {conv.lastMessageAt && (
                  <div style={{ fontSize: 12, color: C.textFaint, marginTop: 2 }}>{formatTime(conv.lastMessageAt)}</div>
                )}
              </div>
              <ChevronRight size={16} color={C.textFaint} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
