import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, CalendarPlus } from 'lucide-react'
import { C } from '../constants/theme'
import { getMessages, sendMessage, deleteMessage, ChatMessage } from '../api/conversationApi'
import { useWebSocketMessages } from '../hooks/useWebSocketMessages'
import { fetchLessonsByTutor, Lesson } from '../api/lessonApi'
import { sendOffer, acceptOffer, declineOffer, confirmPayment, fetchMyBookings, Offer } from '../api/offerApi'
import { getUserById, getMyAccount, User } from '../api/userApi'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui/Spinner'
import { Avatar } from '../components/ui/Avatar'
import { MessageBubble } from '../components/conversation/MessageBubble'
import { MessageInput } from '../components/conversation/MessageInput'
import { InvitationCard } from '../components/conversation/InvitationCard'
import { LessonPicker } from '../components/conversation/LessonPicker'
import { DateTimePicker } from '../components/conversation/DateTimePicker'
import { NotesPanel } from '../components/conversation/NotesPanel'
import { WhiteboardPanel } from '../components/conversation/WhiteboardPanel'

type Tab = 'chat' | 'notes' | 'whiteboard' | 'tasks'

const TABS: { id: Tab; label: string }[] = [
  { id: 'chat',       label: 'Czat' },
  { id: 'notes',      label: 'Notatki' },
  { id: 'whiteboard', label: 'Tablica' },
  { id: 'tasks',      label: 'Zadania' },
]

const TAB_ACCENT = '#7c3aed'

export function ConversationDetail() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { userId, userType } = useAuth()
  const state = location.state as { receiverId?: string; tutorName?: string } | null

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [receiver, setReceiver] = useState<User | null>(null)
  const [showLessonPicker, setShowLessonPicker] = useState(false)
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([])
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [offers, setOffers] = useState<Offer[]>([])
  const [currentUserName, setCurrentUserName] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const receiverId = state?.receiverId
  const isTutor = userType === 'TUTOR'

  useWebSocketMessages(id, incoming => setMessages(prev => [...prev, incoming]))

  const loadMessages = useCallback(() => {
    if (!id) return
    getMessages(id).then(setMessages).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  useEffect(() => { loadMessages() }, [loadMessages])
  useEffect(() => { if (receiverId) getUserById(receiverId).then(setReceiver).catch(() => {}) }, [receiverId])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { getMyAccount().then(u => setCurrentUserName(u.username)).catch(() => {}) }, [])
  useEffect(() => {
    if (activeTab !== 'notes') return
    fetchMyBookings().then(all => {
      setOffers(all.filter(o => receiverId ? (o.tutorId === receiverId || o.studentId === receiverId) : true))
    }).catch(() => {})
  }, [activeTab, receiverId])

  const handleSend = async () => {
    const content = text.trim()
    if (!content || !id || !receiverId) return
    setText('')
    const optimistic: ChatMessage = { id: String(Date.now()), senderId: userId ?? '', content, timestamp: new Date().toISOString() }
    setMessages(p => [...p, optimistic])
    try { await sendMessage(id, content, receiverId) } catch { /* keep optimistic */ }
  }

  const openLessonPicker = async () => {
    if (!receiverId) return
    setShowLessonPicker(true)
    setLoadingLessons(true)
    try { setAvailableLessons(await fetchLessonsByTutor(receiverId)) }
    catch { setAvailableLessons([]) }
    finally { setLoadingLessons(false) }
  }

  const handleLessonSelect = (lesson: Lesson) => { setSelectedLesson(lesson); setShowLessonPicker(false); setShowDatePicker(true) }

  const handleDateConfirm = async (iso: string) => {
    if (!selectedLesson || !receiverId) return
    setShowDatePicker(false)
    try { await sendOffer(selectedLesson.id, receiverId, iso); loadMessages() }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Nie udało się wysłać propozycji') }
  }

  const handleAccept  = async (offerId: string) => { try { await acceptOffer(offerId);  loadMessages() } catch (e: unknown) { alert(e instanceof Error ? e.message : '') } }
  const handleDecline = async (offerId: string) => { try { await declineOffer(offerId); loadMessages() } catch (e: unknown) { alert(e instanceof Error ? e.message : '') } }
  const handleConfirmPayment = async (offerId: string) => { try { await confirmPayment(offerId); loadMessages() } catch (e: unknown) { alert(e instanceof Error ? e.message : '') } }
  const handleWithdraw = async (msgId: string) => {
    if (!confirm('Na pewno chcesz cofnąć propozycję?')) return
    try { await deleteMessage(msgId); loadMessages() } catch (e: unknown) { alert(e instanceof Error ? e.message : '') }
  }
  const handlePropose = (lessonId: string) => {
    const lesson = availableLessons.find(l => l.id === lessonId) ?? { id: lessonId } as Lesson
    setSelectedLesson(lesson)
    setShowDatePicker(true)
  }

  const displayName = receiver?.username ?? state?.tutorName ?? 'Konwersacja'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100vh', overflow: 'hidden' }}>
      <div style={{ padding: '14px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, background: C.bgDeep }}>
        <button onClick={() => navigate('/conversations')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, padding: 4, display: 'flex' }}>
          <ChevronLeft size={22} />
        </button>
        <Avatar name={displayName} photo={receiver?.photoPath} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{displayName}</div>
          <div style={{ fontSize: 12, color: C.textDim }}>Aktywny</div>
        </div>
        {receiverId && activeTab === 'chat' && (
          <button
            onClick={openLessonPicker}
            title="Zaplanuj sesję"
            style={{ padding: '9px 12px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.surfaceUp, cursor: 'pointer', color: C.teal, display: 'flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = C.teal)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
          >
            <CalendarPlus size={18} />
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>Planuj sesję</span>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: C.bgDeep, flexShrink: 0 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500, fontFamily: 'inherit',
              color: activeTab === tab.id ? TAB_ACCENT : C.textDim,
              borderBottom: `2px solid ${activeTab === tab.id ? TAB_ACCENT : 'transparent'}`,
              transition: 'color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'chat' && (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading ? (
              <Spinner />
            ) : messages.map(msg => {
              if (msg.messageType === 'INVITATION') {
                return (
                  <InvitationCard
                    key={msg.id}
                    msg={msg}
                    userId={userId ?? ''}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onConfirmPayment={handleConfirmPayment}
                    onWithdraw={handleWithdraw}
                    onPropose={handlePropose}
                  />
                )
              }
              return <MessageBubble key={msg.id} msg={msg} mine={msg.senderId === userId} />
            })}
            <div ref={bottomRef} />
          </div>
          <MessageInput value={text} onChange={setText} onSend={handleSend} />
        </>
      )}

      {activeTab === 'notes' && id && (
        <NotesPanel
          conversationId={id}
          currentUserId={userId ?? ''}
          currentUserName={currentUserName}
          isTutor={isTutor}
          offers={offers}
        />
      )}

      {activeTab === 'whiteboard' && id && (
        <WhiteboardPanel conversationId={id} currentUserId={userId ?? ''} />
      )}

      {activeTab === 'tasks' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textDim, fontSize: 14 }}>
          Zadania — wkrótce
        </div>
      )}

      {showLessonPicker && (
        <LessonPicker lessons={availableLessons} loading={loadingLessons} onSelect={handleLessonSelect} onClose={() => setShowLessonPicker(false)} />
      )}
      {showDatePicker && (
        <DateTimePicker onConfirm={handleDateConfirm} onClose={() => setShowDatePicker(false)} />
      )}
    </div>
  )
}
