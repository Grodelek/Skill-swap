import { ReactNode } from 'react'
import { C } from '../../constants/theme'

interface BottomSheetProps {
  onClose: () => void
  children: ReactNode
}

export function BottomSheet({ onClose, children }: BottomSheetProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          background: C.surface,
          borderRadius: '20px 20px 0 0',
          padding: '12px 20px 40px',
          border: `1px solid ${C.border}`,
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: '0 auto 20px' }} />
        {children}
      </div>
    </div>
  )
}
