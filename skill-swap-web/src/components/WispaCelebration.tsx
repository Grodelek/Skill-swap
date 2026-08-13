import { useEffect, useRef } from 'react'
import { Wispa } from './Wispa'
import { C } from '../constants/theme'

interface Props {
  message: string
  sub?: string
  onDone: () => void
  delay?: number
}

function Particle({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const angle = Math.random() * Math.PI * 2
    const dist  = 60 + Math.random() * 80
    const tx    = Math.cos(angle) * dist
    const ty    = Math.sin(angle) * dist - 40
    const rot   = Math.random() * 720 - 360

    el.animate([
      { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(0)`, opacity: 0 },
    ], { duration: 900, delay, easing: 'cubic-bezier(0,0,0.2,1)', fill: 'forwards' })
  }, [delay])

  const shapes = ['●', '■', '▲', '★', '◆']
  const shape  = shapes[Math.floor(Math.random() * shapes.length)]

  return (
    <div ref={ref} style={{
      position: 'absolute', left: x, top: y,
      color, fontSize: 10 + Math.random() * 8,
      pointerEvents: 'none', userSelect: 'none',
    }}>
      {shape}
    </div>
  )
}

const COLORS = ['#FFD15C', '#B59CFF', '#4FB8D9', '#FF6B4A', '#5ED674', '#FFA53D']

export function WispaCelebration({ message, sub, onDone, delay = 1800 }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, delay)
    return () => clearTimeout(t)
  }, [onDone, delay])

  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: 80 + Math.random() * 160,
    y: 60 + Math.random() * 120,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * 400,
  }))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: C.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16,
    }}>
      {/* Particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {particles.map(p => (
          <Particle key={p.id} x={p.x} y={p.y} color={p.color} delay={p.delay} />
        ))}
      </div>

      {/* Wispa bouncing */}
      <div style={{ animation: 'wispa-bounce 0.55s ease-in-out infinite' }}>
        <Wispa size={120} mood="celebrate" floating={false} />
      </div>

      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: C.text, letterSpacing: -0.6 }}>
          {message}
        </div>
        {sub && (
          <div style={{ fontSize: 15, color: C.textDim, marginTop: 6 }}>{sub}</div>
        )}
      </div>
    </div>
  )
}
