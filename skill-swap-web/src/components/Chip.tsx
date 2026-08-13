import React from 'react'
import { C } from '../constants/theme'

interface ChipProps {
  label: string
  color?: string
  active?: boolean
}

export function Chip({ label, color = C.amber, active = false }: ChipProps) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: 9999,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 0.3,
      background: active ? color + '22' : C.surface,
      color: active ? color : C.textDim,
      border: `1px solid ${active ? color + '44' : C.border}`,
    }}>
      {label}
    </span>
  )
}
