import { useEffect, useRef, useState } from 'react'

export type WispaMood = 'idle' | 'happy' | 'thinking' | 'celebrate'

interface WispaProps {
  size?: number
  floating?: boolean
  mood?: WispaMood
}

const STYLE_ID = 'wispa-keyframes'

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = `
    @keyframes wispa-blink {
      0%, 90%, 100% { transform: scaleY(1); }
      95%            { transform: scaleY(0.08); }
    }
    @keyframes wispa-tail-l {
      0%, 100% { transform: rotate(0deg); }
      50%       { transform: rotate(-18deg); }
    }
    @keyframes wispa-tail-r {
      0%, 100% { transform: rotate(0deg); }
      50%       { transform: rotate(18deg); }
    }
    @keyframes wispa-blush {
      0%, 100% { opacity: 0.45; }
      50%       { opacity: 0.75; }
    }
    @keyframes wispa-celebrate-l {
      0%, 100% { transform: rotate(-30deg) translateY(0px); }
      50%       { transform: rotate(-60deg) translateY(-8px); }
    }
    @keyframes wispa-celebrate-r {
      0%, 100% { transform: rotate(30deg) translateY(0px); }
      50%       { transform: rotate(60deg) translateY(-8px); }
    }
    @keyframes wispa-bounce {
      0%, 100% { transform: translateY(0px) scale(1); }
      40%       { transform: translateY(-10px) scale(1.04, 0.97); }
      60%       { transform: translateY(-14px) scale(0.97, 1.03); }
    }
    @keyframes wispa-hat-spin {
      0%   { transform: rotate(-8deg); }
      50%  { transform: rotate(8deg); }
      100% { transform: rotate(-8deg); }
    }
    @keyframes wispa-star {
      0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
      30%, 70%  { opacity: 1; transform: scale(1) rotate(180deg); }
    }
  `
  document.head.appendChild(s)
}

export function Wispa({ size = 96, floating = true, mood = 'idle' }: WispaProps) {
  const bodyRef  = useRef<SVGGElement>(null)
  const eyeLRef  = useRef<SVGEllipseElement>(null)
  const eyeRRef  = useRef<SVGEllipseElement>(null)
  const [blink, setBlink] = useState(false)

  useEffect(() => { injectStyles() }, [])

  // Floating
  useEffect(() => {
    if (!floating || mood === 'celebrate') return
    let frame: number
    let start: number | null = null
    const animate = (ts: number) => {
      if (!start) start = ts
      const t = (ts - start) / 2000
      const y = -Math.sin(t * Math.PI * 2) * 5
      if (bodyRef.current) bodyRef.current.style.transform = `translateY(${y}px)`
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [floating, mood])

  // Random blink
  useEffect(() => {
    const schedule = () => {
      const delay = 2500 + Math.random() * 3000
      return setTimeout(() => {
        setBlink(true)
        setTimeout(() => {
          setBlink(false)
          schedule()
        }, 200)
      }, delay)
    }
    const t = schedule()
    return () => clearTimeout(t)
  }, [])

  const isHappy     = mood === 'happy' || mood === 'celebrate'
  const isCelebrate = mood === 'celebrate'
  const isThinking  = mood === 'thinking'

  const eyeScaleY   = blink ? 0.08 : 1
  const pupilOffset = isThinking ? -1.5 : 0

  // Mouth shapes
  const mouth = isHappy
    ? 'M42 76 Q50 85 58 76'           // wide smile
    : isThinking
    ? 'M44 78 Q50 75 56 78'           // flat-ish
    : 'M44 76 Q50 82 56 76'           // default small smile

  const w = size
  const h = size * 1.25

  return (
    <svg viewBox="0 0 100 120" width={w} height={h} style={{ overflow: 'visible' }}>
      {/* Celebration stars */}
      {isCelebrate && <>
        <text x="6"  y="22" fontSize="10" style={{ animation: 'wispa-star 1s ease-in-out infinite 0.0s', transformOrigin: '10px 18px' }}>✦</text>
        <text x="82" y="22" fontSize="10" style={{ animation: 'wispa-star 1s ease-in-out infinite 0.3s', transformOrigin: '86px 18px' }}>✦</text>
        <text x="44" y="6"  fontSize="8"  style={{ animation: 'wispa-star 1s ease-in-out infinite 0.15s', transformOrigin: '48px 2px' }}>✦</text>
      </>}

      <g ref={bodyRef}>
        {/* --- Hat --- */}
        <g style={isCelebrate ? { animation: 'wispa-hat-spin 0.6s ease-in-out infinite', transformOrigin: '50px 22px' } : {}}>
          <path d="M30 26 C30 18 70 18 70 26 L70 30 L30 30 Z"
            fill="#1E1240" stroke="#0D0820" strokeWidth="1" />
          <polygon points="16,26 50,14 84,26 50,36"
            fill="#1E1240" stroke="#0D0820" strokeWidth="1" strokeLinejoin="round" />
          {/* Hat band */}
          <line x1="16" y1="26" x2="84" y2="26" stroke="#B59CFF" strokeWidth="2.5" strokeLinecap="round" />
          {/* Hat gem */}
          <circle cx="50" cy="26" r="3" fill="#FFD15C" />
          <circle cx="50" cy="26" r="1.4" fill="#fff" opacity="0.7" />
          {/* Tassel */}
          <path d="M50 26 Q62 27 68 32" stroke="#B59CFF" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <rect x="66" y="30" width="6" height="10" rx="1.5" fill="#B59CFF" />
          <path d="M66 39 L67 44 M68.5 39 L69 44 M71 39 L72 44 M73 39 L73 43"
            stroke="#B59CFF" strokeWidth="1.3" strokeLinecap="round" />
        </g>

        {/* --- Body --- */}
        <path
          d="M50 34 C74 34 88 50 88 68 L88 106 L81 97 L73 110 L63 97 L50 110 L37 97 L27 110 L19 97 L12 106 L12 68 C12 50 26 34 50 34 Z"
          fill="#C8B8FF"
        />

        {/* Highlight shimmer on body */}
        <ellipse cx="34" cy="50" rx="12" ry="7" fill="#EDE6FF" opacity="0.6" />

        {/* Arms */}
        <ellipse cx="10" cy="72" rx="7" ry="13"
          fill="#C8B8FF"
          style={isCelebrate
            ? { animation: 'wispa-celebrate-l 0.5s ease-in-out infinite', transformOrigin: '10px 59px' }
            : { animation: 'wispa-tail-l 3s ease-in-out infinite', transformOrigin: '10px 62px' }}
        />
        <ellipse cx="90" cy="72" rx="7" ry="13"
          fill="#C8B8FF"
          style={isCelebrate
            ? { animation: 'wispa-celebrate-r 0.5s ease-in-out infinite', transformOrigin: '90px 59px' }
            : { animation: 'wispa-tail-r 3s ease-in-out infinite', transformOrigin: '90px 62px' }}
        />

        {/* Blush */}
        <circle cx="30" cy="76" r="5.5" fill="#FF8DBF"
          style={{ animation: 'wispa-blush 3s ease-in-out infinite', opacity: 0.5 }} />
        <circle cx="70" cy="76" r="5.5" fill="#FF8DBF"
          style={{ animation: 'wispa-blush 3s ease-in-out infinite 0.5s', opacity: 0.5 }} />

        {/* Eyes */}
        <g style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: '41px 65px', transition: 'transform 0.06s' }}>
          <ellipse ref={eyeLRef} cx="41" cy="65" rx="7" ry="8" fill="#1A1335" />
          <circle cx={42 + pupilOffset} cy="62.5" r="2.5" fill="#fff" />
          <circle cx={43.5 + pupilOffset} cy="61.5" r="1" fill="#fff" opacity="0.8" />
        </g>
        <g style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: '59px 65px', transition: 'transform 0.06s' }}>
          <ellipse ref={eyeRRef} cx="59" cy="65" rx="7" ry="8" fill="#1A1335" />
          <circle cx={60 + pupilOffset} cy="62.5" r="2.5" fill="#fff" />
          <circle cx={61.5 + pupilOffset} cy="61.5" r="1" fill="#fff" opacity="0.8" />
        </g>

        {/* Thinking eyebrow */}
        {isThinking && (
          <path d="M35 56 Q41 53 47 56" stroke="#1A1335" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        {/* Mouth */}
        <path d={mouth} stroke="#1A1335" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Happy teeth */}
        {isHappy && (
          <path d="M45 79 L45 83 M50 80 L50 84 M55 79 L55 83"
            stroke="#1A1335" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        )}
      </g>
    </svg>
  )
}
