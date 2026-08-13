import { Fragment } from 'react'
import { Clock, Check, X, Trophy } from 'lucide-react'
import { C } from '../../constants/theme'
import { ChatMessage } from '../../api/conversationApi'

interface InvitationCardProps {
  msg: ChatMessage
  userId: string
  onAccept: (offerId: string) => void
  onDecline: (offerId: string) => void
  onConfirmPayment: (offerId: string) => void
  onWithdraw: (msgId: string) => void
  onPropose: (lessonId: string) => void
}

export function InvitationCard({ msg, userId, onAccept, onDecline, onConfirmPayment, onWithdraw, onPropose }: InvitationCardProps) {
  const offer = msg.offer
  if (!offer) return null

  const isReceiver = String(msg.receiverId) === String(userId)
  const isSender   = String(msg.senderId) === String(userId)
  const isStudentSide = String(offer.studentId) === String(userId)

  const { status } = offer
  const isDeclined  = status === 'DECLINED'
  const isAccepted  = status === 'ACCEPTED'
  const isCompleted = offer.completed

  const sessionStart = offer.sessionStartTime ? new Date(offer.sessionStartTime) : null
  const duration     = offer.lesson?.durationTime ?? 0
  const sessionEnd   = sessionStart ? new Date(sessionStart.getTime() + duration * 60000) : null
  const sessionEnded = sessionEnd ? new Date() >= sessionEnd : false

  const myConfirmed    = isStudentSide ? offer.studentConfirmedPayment : offer.tutorConfirmedPayment
  const otherConfirmed = isStudentSide ? offer.tutorConfirmedPayment   : offer.studentConfirmedPayment
  const otherLabel     = isStudentSide ? 'Korepetytor' : 'Student'

  const scheduledAt = sessionStart
    ? sessionStart.toLocaleString('pl-PL', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '—'

  const steps = [
    { label: 'Wysłano',    done: true,                        error: false },
    { label: 'Akceptacja', done: isAccepted || isCompleted,   error: isDeclined },
    { label: 'Sesja',      done: isAccepted && sessionEnded,  error: false },
    { label: 'Rozliczono', done: isCompleted,                 error: false },
  ]

  const details = [
    ['Przedmiot',    offer.lesson?.subject ?? '—'],
    ['Korepetytor',  offer.tutorUsername],
    ['Termin',       scheduledAt],
    ['Czas trwania', duration ? `${duration} min` : '—'],
    ['Cena',         offer.lesson?.price != null ? `${offer.lesson.price} zł` : '—'],
  ] as [string, string][]

  return (
    <div style={{
      margin: '4px 0', padding: '18px 20px', borderRadius: 16,
      background: C.surface, border: `1.5px solid ${C.border}`,
      maxWidth: 420, alignSelf: 'center', width: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Clock size={16} color={C.teal} />
        <span style={{ fontWeight: 800, fontSize: 15, color: C.text }}>Propozycja sesji</span>
        {isCompleted && (
          <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 9999, background: C.teal + '22', color: C.teal, fontSize: 11, fontWeight: 700 }}>
            Zakończone
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
        {steps.map((step, idx) => (
          <Fragment key={idx}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step.error ? C.coral : step.done ? C.teal : C.surfaceUp,
                border: `2px solid ${step.error ? C.coral : step.done ? C.teal : C.border}`,
              }}>
                {step.done && <Check size={13} color="#fff" />}
                {step.error && <X size={13} color="#fff" />}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: step.error ? C.coral : step.done ? C.teal : C.textFaint, whiteSpace: 'nowrap' }}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: step.done && !step.error ? C.teal : C.border, margin: '0 4px', marginBottom: 18 }} />
            )}
          </Fragment>
        ))}
      </div>

      {details.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 13, color: C.textDim }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{value}</span>
        </div>
      ))}

      <div style={{ marginTop: 14 }}>
        {status === 'PENDING' && isReceiver && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onDecline(offer.id)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: `1.5px solid ${C.coral}`, background: 'transparent', color: C.coral, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Odrzuć
              </button>
              <button onClick={() => onAccept(offer.id)} style={{ flex: 2, padding: '11px', borderRadius: 12, border: 'none', background: C.teal, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Akceptuj
              </button>
            </div>
            {offer.lesson?.id && (
              <button onClick={() => onPropose(offer.lesson!.id)} style={{ padding: '10px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: 'transparent', color: C.textDim, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                Zaproponuj inny termin
              </button>
            )}
          </div>
        )}

        {status === 'PENDING' && isSender && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.teal, fontSize: 13 }}>
              <Clock size={14} color={C.teal} /> Oczekuje na odpowiedź...
            </div>
            <button onClick={() => onWithdraw(msg.id)} style={{ padding: '10px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: 'transparent', color: C.textDim, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
              Cofnij propozycję
            </button>
          </div>
        )}

        {isDeclined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.coral, fontSize: 13 }}>
            <X size={14} color={C.coral} /> Propozycja odrzucona
          </div>
        )}

        {isAccepted && (
          isCompleted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: '#B8A00022', color: '#B8A000' }}>
              <Trophy size={16} />
              <span style={{ fontWeight: 700, fontSize: 13 }}>+10 XP · +1 ukończona lekcja</span>
            </div>
          ) : !sessionEnded ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.green, fontSize: 13 }}>
              <Check size={14} color={C.green} /> Zaakceptowano — płatność po zakończeniu zajęć
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, color: C.amber }}>Zajęcia skończone — potwierdź płatność</div>
              <div style={{ display: 'flex', gap: 16 }}>
                {([{ confirmed: myConfirmed, label: 'Ty' }, { confirmed: otherConfirmed, label: otherLabel }]).map(({ confirmed, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${confirmed ? C.green : C.border}`, background: confirmed ? C.green + '33' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {confirmed && <Check size={11} color={C.green} />}
                    </div>
                    <span style={{ fontSize: 13, color: C.textDim }}>{label}</span>
                  </div>
                ))}
              </div>
              {!myConfirmed && (
                <button onClick={() => onConfirmPayment(offer.id)} style={{ padding: '11px', borderRadius: 12, border: 'none', background: C.amber, color: '#1A0A00', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Płatność wykonana
                </button>
              )}
            </div>
          )
        )}
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: C.textFaint, textAlign: 'right' }}>
        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
      </div>
    </div>
  )
}
