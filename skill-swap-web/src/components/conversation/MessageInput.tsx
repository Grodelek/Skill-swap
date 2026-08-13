import { Send } from 'lucide-react'
import { C } from '../../constants/theme'

interface MessageInputProps {
  value: string
  onChange: (v: string) => void
  onSend: () => void
}

export function MessageInput({ value, onChange, onSend }: MessageInputProps) {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() }
  }

  return (
    <div style={{
      padding: '12px 20px',
      borderTop: `1px solid ${C.border}`,
      display: 'flex',
      gap: 10,
      flexShrink: 0,
      background: C.bgDeep,
    }}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Napisz wiadomość... (Enter = wyślij)"
        rows={1}
        style={{
          flex: 1, padding: '11px 14px', borderRadius: 14,
          border: `1.5px solid ${C.border}`, background: C.surface,
          color: C.text, fontSize: 14, resize: 'none', outline: 'none',
          fontFamily: 'inherit', lineHeight: 1.5,
        }}
      />
      <button
        onClick={onSend}
        disabled={!value.trim()}
        style={{
          width: 48, height: 48, borderRadius: 14, border: 'none',
          background: value.trim() ? C.amber : C.surfaceUp,
          cursor: value.trim() ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, alignSelf: 'flex-end',
        }}
      >
        <Send size={18} color={value.trim() ? '#1A0A00' : C.textFaint} />
      </button>
    </div>
  )
}
