import { X, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { C } from '../../constants/theme'
import { pad2, toLocalIso } from '../../utils/date'

const HOUR_SLOTS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]

interface DateTimePickerProps {
  onConfirm: (iso: string) => void
  onClose: () => void
}

export function DateTimePicker({ onConfirm, onClose }: DateTimePickerProps) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [dayOffset, setDayOffset] = useState(0)
  const [hour, setHour] = useState<number | null>(null)
  const [minute, setMinute] = useState(0)

  const selectedDate = (() => {
    if (hour == null) return null
    const d = new Date(today)
    d.setDate(d.getDate() + dayOffset)
    d.setHours(hour, minute, 0, 0)
    return d
  })()

  const dayLabel = (() => {
    const d = new Date(today)
    d.setDate(d.getDate() + dayOffset)
    return d.toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })
  })()

  const isHourDisabled = (h: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() + dayOffset)
    d.setHours(h, 59, 0, 0)
    return d.getTime() < Date.now() + 5 * 60 * 1000
  }

  const handleConfirm = () => {
    if (!selectedDate || selectedDate.getTime() < Date.now() + 5 * 60 * 1000) return
    onConfirm(toLocalIso(selectedDate))
  }

  const sectionStyle = {
    background: C.surface, borderRadius: 14, padding: '18px 20px',
    marginBottom: 12, border: `1px solid ${C.border}`,
  }

  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: C.textFaint,
    textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 12,
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{ background: C.bg, borderRadius: 20, padding: '28px 28px 24px', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', border: `1.5px solid ${C.border}` }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>Wybierz termin</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim }}><X size={20} /></button>
        </div>

        <div style={sectionStyle}>
          <div style={labelStyle}>Data</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setDayOffset(v => Math.max(0, v - 1))}
              disabled={dayOffset <= 0}
              style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surfaceUp, cursor: dayOffset <= 0 ? 'not-allowed' : 'pointer', opacity: dayOffset <= 0 ? 0.35 : 1, color: C.text }}
            ><ChevronLeft size={18} /></button>
            <div style={{ flex: 1, padding: '12px 16px', borderRadius: 10, background: C.bgDeep, textAlign: 'center', fontSize: 15, fontWeight: 700, color: C.text, textTransform: 'capitalize' }}>
              {dayLabel}
            </div>
            <button
              onClick={() => setDayOffset(v => v + 1)}
              style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surfaceUp, cursor: 'pointer', color: C.text }}
            ><ChevronRight size={18} /></button>
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={labelStyle}>Godzina</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {HOUR_SLOTS.map(h => {
              const disabled = isHourDisabled(h)
              const active = hour === h
              return (
                <button
                  key={h}
                  disabled={disabled}
                  onClick={() => { setHour(h); setMinute(0) }}
                  style={{
                    padding: '9px 14px', borderRadius: 9, fontSize: 14, fontWeight: 600,
                    border: `1.5px solid ${active ? C.teal : C.border}`,
                    background: active ? C.teal : C.bgDeep,
                    color: active ? '#fff' : disabled ? C.textFaint : C.text,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.35 : 1,
                    fontFamily: 'inherit',
                  }}
                >{pad2(h)}:00</button>
              )
            })}
          </div>
        </div>

        {hour != null && (
          <div style={sectionStyle}>
            <div style={labelStyle}>Minuta</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setMinute(m => Math.max(0, m - 5))}
                disabled={minute === 0}
                style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surfaceUp, cursor: minute === 0 ? 'not-allowed' : 'pointer', opacity: minute === 0 ? 0.35 : 1, color: C.text }}
              ><Minus size={18} /></button>
              <div style={{ flex: 1, padding: '12px', borderRadius: 10, background: C.bgDeep, textAlign: 'center', fontSize: 22, fontWeight: 800, color: C.teal, letterSpacing: 1 }}>
                {pad2(hour)}:{pad2(minute)}
              </div>
              <button
                onClick={() => setMinute(m => Math.min(55, m + 5))}
                disabled={minute === 55}
                style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surfaceUp, cursor: minute === 55 ? 'not-allowed' : 'pointer', opacity: minute === 55 ? 0.35 : 1, color: C.text }}
              ><Plus size={18} /></button>
            </div>
          </div>
        )}

        <div style={{ ...sectionStyle, marginBottom: 20 }}>
          <div style={labelStyle}>Wybrany termin</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: selectedDate ? C.text : C.textFaint }}>
            {selectedDate ? selectedDate.toLocaleString('pl-PL') : 'Nie wybrano godziny'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: 14, border: `1.5px solid ${C.border}`, background: 'transparent', color: C.textDim, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
            Anuluj
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDate}
            style={{
              flex: 2, padding: '13px', borderRadius: 14, border: 'none',
              background: selectedDate ? C.amber : C.surfaceUp,
              color: selectedDate ? '#1A0A00' : C.textFaint,
              fontWeight: 800, fontSize: 15,
              cursor: selectedDate ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
            }}
          >
            Potwierdź
          </button>
        </div>
      </div>
    </div>
  )
}
