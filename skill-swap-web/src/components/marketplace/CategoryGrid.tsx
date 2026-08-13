import { useState } from 'react'
import {
  Calculator, Globe, Code2, Zap,
  FlaskConical, Music, BookOpen, Leaf, ChevronRight, LucideIcon,
} from 'lucide-react'
import { C } from '../../constants/theme'

export interface Category {
  id: string
  label: string
  Icon: LucideIcon
  accent: string
  subject: string
}

export const CATEGORIES: Category[] = [
  { id: 'matematyka',    label: 'Matematyka',   Icon: Calculator,   accent: C.amber,  subject: 'Matematyka' },
  { id: 'jezyki',        label: 'Języki',        Icon: Globe,        accent: C.teal,   subject: 'Angielski' },
  { id: 'programowanie', label: 'Programowanie', Icon: Code2,        accent: C.purple, subject: 'Programowanie' },
  { id: 'fizyka',        label: 'Fizyka',        Icon: Zap,          accent: C.gold,   subject: 'Fizyka' },
  { id: 'chemia',        label: 'Chemia',        Icon: FlaskConical, accent: C.green,  subject: 'Chemia' },
  { id: 'muzyka',        label: 'Muzyka',        Icon: Music,        accent: C.coral,  subject: 'Muzyka' },
  { id: 'historia',      label: 'Historia',      Icon: BookOpen,     accent: C.amber,  subject: 'Historia' },
  { id: 'biologia',      label: 'Biologia',      Icon: Leaf,         accent: C.green,  subject: 'Biologia' },
]

interface CategoryGridProps {
  onSelect: (cat: Category) => void
}

export function CategoryGrid({ onSelect }: CategoryGridProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {CATEGORIES.map(cat => {
        const isHov = hovered === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat)}
            onMouseEnter={() => setHovered(cat.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: isHov ? C.surfaceUp : C.surface,
              border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${cat.accent}`,
              borderRadius: 14,
              padding: '15px 18px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              textAlign: 'left',
              transition: 'background 0.12s',
            }}
          >
            <cat.Icon size={20} color={cat.accent} strokeWidth={1.75} />
            <span style={{ fontSize: 15, fontWeight: 700, color: C.text, flex: 1 }}>{cat.label}</span>
            <ChevronRight size={16} color={cat.accent} style={{ opacity: 0.7 }} />
          </button>
        )
      })}
    </div>
  )
}
