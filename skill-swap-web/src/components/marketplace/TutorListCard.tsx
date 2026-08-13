import { useState } from 'react'
import { Star, Clock, MessageCircle, Heart } from 'lucide-react'
import { C } from '../../constants/theme'
import { TutorCard } from '../../api/tutorDiscoveryApi'
import { getImageUrl } from '../../utils/image'

interface TutorListCardProps {
  card: TutorCard
  onConnect: (card: TutorCard) => void
  onFavorite: (card: TutorCard) => void
}

export function TutorListCard({ card, onConnect, onFavorite }: TutorListCardProps) {
  const [imgErr, setImgErr] = useState(false)
  const [faved, setFaved] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const uri = getImageUrl(card.tutorPhotoPath)
  const initial = (card.tutorUsername || '?').charAt(0).toUpperCase()

  const handleFavorite = () => {
    setFaved(value => !value)
    onFavorite(card)
  }

  const handleConnect = async () => {
    setConnecting(true)
    try { await onConnect(card) } finally { setConnecting(false) }
  }

  return (
    <article style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 120, background: C.bgDeep, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {uri && !imgErr
          ? <img src={uri} alt={`Profil ${card.tutorUsername}`} onError={() => setImgErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span aria-hidden="true" style={{ fontSize: 52, fontWeight: 900, color: C.purple, lineHeight: 1 }}>{initial}</span>}
        <div aria-label={`Ocena ${card.rating.toFixed(1)} na 5`} style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(18,13,38,0.85)', borderRadius: 9999, padding: '4px 9px', fontSize: 11, fontWeight: 800, color: C.gold, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Star size={10} fill={C.gold} color={C.gold} aria-hidden="true" /> {card.rating.toFixed(1)}
        </div>
        <button type="button" onClick={handleFavorite} aria-label={faved ? `Usuń ${card.tutorUsername} z ulubionych` : `Dodaj ${card.tutorUsername} do ulubionych`} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(18,13,38,0.85)', border: 'none', borderRadius: 9999, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', touchAction: 'manipulation' }}>
          <Heart size={16} fill={faved ? C.coral : 'none'} color={faved ? C.coral : C.textDim} aria-hidden="true" />
        </button>
      </div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={card.tutorUsername}>{card.tutorUsername}</div>
        <div style={{ fontSize: 12, color: C.textDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.subject}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ fontWeight: 900, fontSize: 15, color: C.amber }}>{card.price != null ? `${card.price} zł` : '—'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: C.textFaint }}><Clock size={11} aria-hidden="true" /> {card.durationTime}&nbsp;min</span>
        </div>
        <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5, height: 36, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{card.tutorDescription || ''}</div>
        <button type="button" onClick={handleConnect} disabled={connecting} style={{ marginTop: 'auto', minHeight: 44, padding: '10px', borderRadius: 12, border: 'none', background: connecting ? C.amberDark : C.amber, color: '#1A0A00', fontWeight: 800, fontSize: 13, cursor: connecting ? 'wait' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderBottom: `3px solid ${C.amberDark}`, touchAction: 'manipulation', opacity: connecting ? 0.8 : 1 }}>
          <MessageCircle size={14} aria-hidden="true" /> {connecting ? 'Łączenie…' : 'Napisz'}
        </button>
      </div>
    </article>
  )
}
