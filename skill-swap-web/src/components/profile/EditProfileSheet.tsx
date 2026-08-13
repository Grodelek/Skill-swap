import { useState } from 'react'
import { C } from '../../constants/theme'
import { BottomSheet } from '../ui/BottomSheet'
import { updateUser } from '../../api/userApi'

interface EditProfileSheetProps {
  userId: string
  initialUsername: string
  initialDescription: string
  onSave: (username: string, description: string) => void
  onClose: () => void
}

export function EditProfileSheet({ userId, initialUsername, initialDescription, onSave, onClose }: EditProfileSheetProps) {
  const [username, setUsername] = useState(initialUsername)
  const [description, setDescription] = useState(initialDescription)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setLoading(true)
    setError('')
    try {
      const updated = await updateUser({ id: userId, username, description })
      onSave(updated.username, updated.description ?? '')
      onClose()
    } catch {
      setError('Nie udało się zapisać zmian')
    } finally {
      setLoading(false)
    }
  }

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 20 }}>Edytuj profil</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: C.textDim }}>Nazwa użytkownika</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{
              padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`,
              background: C.bgDeep, color: C.text, fontSize: 15, fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: C.textDim }}>O mnie</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            style={{
              padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`,
              background: C.bgDeep, color: C.text, fontSize: 15, fontFamily: 'inherit',
              outline: 'none', resize: 'none', lineHeight: 1.6,
            }}
          />
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: C.coral + '22', color: C.coral, fontSize: 14 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            padding: '13px', borderRadius: 14, border: 'none',
            background: loading ? C.surfaceUp : C.amber,
            color: loading ? C.textDim : '#1A0A00',
            fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </button>
      </div>
    </BottomSheet>
  )
}
