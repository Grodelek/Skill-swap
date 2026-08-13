import { Pencil, Bell, Lock, LogOut } from 'lucide-react'
import { C } from '../../constants/theme'
import { BottomSheet } from '../ui/BottomSheet'

interface SettingsSheetProps {
  onClose: () => void
  onEditProfile: () => void
  onLogout: () => void
}

const MENU_ITEMS = [
  { label: 'Edytuj profil',  Icon: Pencil, key: 'edit' },
  { label: 'Powiadomienia',  Icon: Bell,   key: 'notifications' },
  { label: 'Prywatność',     Icon: Lock,   key: 'privacy' },
] as const

export function SettingsSheet({ onClose, onEditProfile, onLogout }: SettingsSheetProps) {
  const handleItem = (key: string) => {
    if (key === 'edit') { onEditProfile(); return }
    onClose()
  }

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ padding: '0 0 0 0' }}>
        {MENU_ITEMS.map(({ label, Icon, key }) => (
          <button
            key={key}
            onClick={() => handleItem(key)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 0', background: 'none', border: 'none',
              borderBottom: `1px solid ${C.border}`,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <Icon size={18} color={C.textDim} />
            <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{label}</span>
          </button>
        ))}

        <button
          onClick={onLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 0', background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: 'inherit', marginTop: 8,
          }}
        >
          <LogOut size={18} color={C.coral} />
          <span style={{ fontSize: 15, fontWeight: 600, color: C.coral }}>Wyloguj się</span>
        </button>
      </div>
    </BottomSheet>
  )
}
