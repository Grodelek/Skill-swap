import { C } from '../../constants/theme'
import { ChatMessage } from '../../api/conversationApi'

interface MessageBubbleProps {
  msg: ChatMessage
  mine: boolean
}

export function MessageBubble({ msg, mine }: MessageBubbleProps) {
  return (
    <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '70%',
        padding: '10px 14px',
        borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: mine ? C.amber : C.surface,
        color: mine ? '#1A0A00' : C.text,
        fontSize: 14,
        lineHeight: 1.5,
        border: mine ? 'none' : `1px solid ${C.border}`,
      }}>
        <div>{msg.content}</div>
        <div style={{ fontSize: 11, color: mine ? '#1A0A0088' : C.textFaint, marginTop: 3, textAlign: 'right' }}>
          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </div>
    </div>
  )
}
