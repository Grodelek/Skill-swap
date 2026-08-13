import { useState } from 'react'
import { C } from '../../constants/theme'
import { getImageUrl } from '../../utils/image'

interface AvatarProps {
  name: string
  photo?: string | null
  size?: number
}

export function Avatar({ name, photo, size = 40 }: AvatarProps) {
  const [err, setErr] = useState(false)
  const uri = getImageUrl(photo)

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      flexShrink: 0,
      background: C.purple + '33',
      border: `2px solid ${C.purple}22`,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.4,
      fontWeight: 800,
      color: C.purple,
    }}>
      {uri && !err
        ? <img src={uri} alt="" onError={() => setErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : (name || '?').charAt(0).toUpperCase()
      }
    </div>
  )
}
