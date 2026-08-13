import React, { useRef, useState, useCallback } from 'react'

interface SwipeCardsProps<T> {
  cards: T[]
  onSkip?: (card: T) => void
  onConnect?: (card: T) => void
  getCardId?: (card: T) => string
  renderCard?: (card: T, dragging: boolean) => React.ReactNode
}

const THRESHOLD = 100

export function SwipeCards<T>({
  cards,
  onSkip,
  onConnect,
  getCardId,
  renderCard,
}: SwipeCardsProps<T>) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const offsetRef = useRef({ x: 0, y: 0 })
  const startPos = useRef({ x: 0, y: 0 })
  const active = useRef(false)
  const movedEnough = useRef(false)
  const topRef = useRef<T | null>(null)
  topRef.current = cards[0] ?? null

  const rotate = `${offset.x / 22}deg`

  const onPointerDown = (e: React.PointerEvent) => {
    if (!topRef.current) return
    active.current = true
    movedEnough.current = false
    startPos.current = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!active.current) return
    const dx = e.clientX - startPos.current.x
    const dy = e.clientY - startPos.current.y
    if (!movedEnough.current && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      movedEnough.current = true
      setDragging(true)
    }
    if (movedEnough.current) {
      const next = { x: dx, y: dy }
      offsetRef.current = next
      setOffset(next)
    }
  }

  const onPointerUp = useCallback(() => {
    if (!active.current) return
    active.current = false
    setDragging(false)

    const card = topRef.current
    const { x } = offsetRef.current
    offsetRef.current = { x: 0, y: 0 }
    setOffset({ x: 0, y: 0 })

    if (!movedEnough.current || !card) return
    if (x > THRESHOLD) onConnect?.(card)
    else if (x < -THRESHOLD) onSkip?.(card)
  }, [onConnect, onSkip])

  const visible = cards.slice(0, 3)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {[...visible].reverse().map((card, ri) => {
        const index = visible.length - 1 - ri
        const isTop = index === 0
        const scale = isTop ? 1 : index === 1 ? 0.97 : 0.94
        const ty = isTop ? 0 : index === 1 ? 12 : 24

        const transform = isTop && dragging
          ? `translateX(${offset.x}px) translateY(${offset.y}px) rotate(${rotate})`
          : `scale(${scale}) translateY(${ty}px)`

        const id = getCardId ? getCardId(card) : String(index)

        return (
          <div
            key={id}
            onPointerDown={isTop ? onPointerDown : undefined}
            onPointerMove={isTop ? onPointerMove : undefined}
            onPointerUp={isTop ? onPointerUp : undefined}
            onPointerCancel={isTop ? onPointerUp : undefined}
            style={{
              position: 'absolute', inset: 0, transform,
              transition: isTop && dragging ? 'none' : 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              cursor: isTop ? (dragging ? 'grabbing' : 'grab') : 'default',
              zIndex: isTop ? 3 : index === 1 ? 2 : 1,
              willChange: 'transform', touchAction: 'none',
            }}
          >
            {isTop && offset.x > 40 && (
              <div style={{
                position: 'absolute', top: 16, left: 16, zIndex: 10, pointerEvents: 'none',
                background: '#5ED674', color: '#fff', fontWeight: 800, fontSize: 14,
                padding: '6px 14px', borderRadius: 9999, letterSpacing: 1,
                opacity: Math.min(1, (offset.x - 40) / 60),
                border: '2px solid #2EA84F',
              }}>CONNECT</div>
            )}
            {isTop && offset.x < -40 && (
              <div style={{
                position: 'absolute', top: 16, right: 16, zIndex: 10, pointerEvents: 'none',
                background: '#FF6B4A', color: '#fff', fontWeight: 800, fontSize: 14,
                padding: '6px 14px', borderRadius: 9999, letterSpacing: 1,
                opacity: Math.min(1, (-offset.x - 40) / 60),
                border: '2px solid #C84A2E',
              }}>SKIP</div>
            )}
            {renderCard?.(card, isTop && dragging)}
          </div>
        )
      })}
    </div>
  )
}
