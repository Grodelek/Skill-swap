import { useEffect, useState } from 'react'
import { Check, Clock, X } from 'lucide-react'
import { C } from '../constants/theme'
import { fetchMyBookings, acceptOffer, declineOffer, confirmPayment, Offer } from '../api/offerApi'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui/Spinner'
import { Avatar } from '../components/ui/Avatar'
import { Wispa } from '../components/Wispa'

function statusColor(status: string) {
  if (status === 'ACCEPTED') return C.green
  if (status === 'DECLINED') return C.coral
  return C.amber
}

function statusLabel(status: string) {
  if (status === 'ACCEPTED') return 'Zaakceptowano'
  if (status === 'DECLINED') return 'Odrzucono'
  return 'Oczekuje'
}

function ActionBtn({ color, onClick, children }: { color: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 10, border: 'none',
        background: color + '22', color, fontWeight: 700, fontSize: 13,
        cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  )
}

export function Bookings() {
  const { userId } = useAuth()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = () => {
    setError('')
    fetchMyBookings()
      .then(setOffers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const handleAccept  = async (id: string) => { await acceptOffer(id);  reload() }
  const handleDecline = async (id: string) => { await declineOffer(id); reload() }
  const handleConfirm = async (id: string) => { await confirmPayment(id); reload() }

  if (loading) return <Spinner />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '24px 28px 16px', flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>Moje lekcje</h1>
      </div>

      {error && (
        <div style={{ margin: '16px 28px', padding: '12px 16px', borderRadius: 12, background: C.coral + '22', color: C.coral, fontSize: 14 }}>{error}</div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {offers.length === 0 && !error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 16 }}>
            <Wispa size={72} />
            <div style={{ fontWeight: 700, fontSize: 16, color: C.textDim }}>Brak lekcji</div>
            <div style={{ fontSize: 14, color: C.textFaint }}>Połącz się z tutorem, aby umówić lekcję</div>
          </div>
        ) : offers.map(offer => {
          const isTutor   = offer.tutorId === userId
          const otherName = isTutor ? offer.studentUsername : offer.tutorUsername

          return (
            <div key={offer.id} style={{ background: C.surface, borderRadius: 16, padding: 20, border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <Avatar name={otherName ?? '?'} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{otherName}</div>
                  <div style={{ fontSize: 13, color: C.textDim }}>
                    {offer.lesson?.subject ?? 'Lekcja'}
                    {offer.lesson?.price != null ? ` · ${offer.lesson.price} zł` : ''}
                  </div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700, background: statusColor(offer.status) + '22', color: statusColor(offer.status) }}>
                  {statusLabel(offer.status)}
                </span>
              </div>

              {offer.sessionStartTime && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 13, color: C.textDim }}>
                  <Clock size={14} />
                  {new Date(offer.sessionStartTime).toLocaleString('pl-PL')}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                {offer.status === 'PENDING' && isTutor && (
                  <>
                    <ActionBtn color={C.green} onClick={() => handleAccept(offer.id)}><Check size={14} /> Akceptuj</ActionBtn>
                    <ActionBtn color={C.coral} onClick={() => handleDecline(offer.id)}><X size={14} /> Odrzuć</ActionBtn>
                  </>
                )}
                {offer.status === 'ACCEPTED' && offer.completed && (
                  <>
                    {isTutor && !offer.tutorConfirmedPayment && (
                      <ActionBtn color={C.amber} onClick={() => handleConfirm(offer.id)}>Potwierdź płatność</ActionBtn>
                    )}
                    {!isTutor && !offer.studentConfirmedPayment && (
                      <ActionBtn color={C.amber} onClick={() => handleConfirm(offer.id)}>Potwierdź płatność</ActionBtn>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
