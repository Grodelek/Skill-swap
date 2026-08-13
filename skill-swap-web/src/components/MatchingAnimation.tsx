import React, { useEffect, useRef } from 'react'
import { C } from '../constants/theme'
import { BASE_URL } from '../config/baseUrl'

interface Avatar {
  initial: string
  color: string
  photoUri?: string | null
}

interface Props {
  visible: boolean
  student: Avatar
  tutor: Avatar
  onComplete: () => void
}

export function MatchingAnimation({ visible, student, tutor, onComplete }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!visible) return
    timerRef.current = setTimeout(onComplete, 2200)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [visible, onComplete])

  if (!visible) return null

  const avatarStyle = (color: string): React.CSSProperties => ({
    width: 88, height: 88, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: color + '33',
    border: `3px solid ${color}`,
    fontSize: 36, fontWeight: 900, color,
    overflow: 'hidden',
    animation: 'matchPop 0.5s cubic-bezier(0.34,1.56,0.64,1)',
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(18,13,38,0.92)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 32,
      animation: 'fadeIn 0.3s ease',
    }}>
      <style>{`
        @keyframes matchPop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
      `}</style>

      <div style={{
        fontSize: 13, fontWeight: 700, letterSpacing: 2,
        color: C.gold, textTransform: 'uppercase', marginBottom: -16,
      }}>
        To jest dopasowanie!
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <AvatarBlock avatar={student} />
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.amber}, ${C.coral})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse 0.8s infinite',
        }}>
          <span style={{ fontSize: 20 }}>⚡</span>
        </div>
        <AvatarBlock avatar={tutor} />
      </div>

      <div style={{ color: C.textDim, fontSize: 14 }}>Połączono! Otwieranie czatu…</div>
    </div>
  )
}

function AvatarBlock({ avatar }: { avatar: Avatar }) {
  const uri = avatar.photoUri
    ? (avatar.photoUri.startsWith('http') ? avatar.photoUri : `${BASE_URL}${avatar.photoUri}`)
    : null

  return (
    <div style={{
      width: 88, height: 88, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: avatar.color + '33',
      border: `3px solid ${avatar.color}`,
      fontSize: 36, fontWeight: 900, color: avatar.color,
      overflow: 'hidden',
      animation: 'matchPop 0.5s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {uri ? (
        <img src={uri} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : avatar.initial}
    </div>
  )
}
