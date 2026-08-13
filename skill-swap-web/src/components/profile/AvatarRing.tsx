import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { C } from '../../constants/theme'

interface AvatarRingProps {
  uri: string | null
  username?: string
  xpCurrent: number
  xpNeeded: number
  onPhotoChange: (base64: string) => void
}

export function AvatarRing({ uri, username, xpCurrent, xpNeeded, onPhotoChange }: AvatarRingProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [imgErr, setImgErr] = useState(false)
  const r = 46
  const circ = 2 * Math.PI * r
  const progress = (xpCurrent / xpNeeded) * circ

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onPhotoChange(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ position: 'relative', width: 110, height: 110, margin: '0 auto 12px' }}>
      <svg width={110} height={110} style={{ position: 'absolute', top: 0, left: 0 }}>
        <circle cx={55} cy={55} r={r} fill="none" stroke={C.surfaceUp} strokeWidth={5} />
        <circle
          cx={55} cy={55} r={r} fill="none"
          stroke={C.amber} strokeWidth={5}
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
        />
      </svg>
      <div style={{
        position: 'absolute', top: 9, left: 9,
        width: 92, height: 92, borderRadius: '50%',
        background: C.bgDeep, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, fontWeight: 900, color: C.purple,
      }}>
        {uri && !imgErr
          ? <img src={uri} alt="" onError={() => setImgErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (username || '?').slice(0, 2).toUpperCase()
        }
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      <button
        onClick={() => inputRef.current?.click()}
        style={{
          position: 'absolute', bottom: 6, right: 6,
          width: 28, height: 28, borderRadius: '50%',
          background: C.surface, border: `2px solid ${C.bg}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: 0,
        }}
      >
        <Camera size={14} color={C.textDim} strokeWidth={2} />
      </button>
    </div>
  )
}
