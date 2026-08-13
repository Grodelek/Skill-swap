import { useRef, useCallback, useState } from 'react'
import { Excalidraw, exportToBlob } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import { useWhiteboardSync } from '../../hooks/useWhiteboardSync'
import { useConversationNotes } from '../../hooks/useConversationNotes'
import { C } from '../../constants/theme'
import { Download, BookOpen } from 'lucide-react'

interface Props {
  conversationId: string
  currentUserId: string
}

export function WhiteboardPanel({ conversationId, currentUserId }: Props) {
  const apiRef = useRef<any>(null)
  const isRemoteUpdate = useRef(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(false)
  const { notes: _notes, addNote } = useConversationNotes(conversationId, currentUserId)

  const handleRemoteUpdate = useCallback((elements: any[], appState: any) => {
    if (!apiRef.current) return
    isRemoteUpdate.current = true
    apiRef.current.updateScene({ elements, appState: { ...appState, collaborators: new Map() } })
    isRemoteUpdate.current = false
  }, [])

  const { publish } = useWhiteboardSync(conversationId, handleRemoteUpdate)

  const handleChange = useCallback((elements: readonly any[], appState: any) => {
    if (isRemoteUpdate.current) return
    publish([...elements], appState)
  }, [publish])

  const handleSaveAsNote = async () => {
    if (!apiRef.current) return
    setSaving(true)
    try {
      const blob = await exportToBlob({
        elements: apiRef.current.getSceneElements(),
        appState: apiRef.current.getAppState(),
        files: apiRef.current.getFiles(),
        mimeType: 'image/png',
        maxWidthOrHeight: 1200,
      })
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        const snapKey = `wb_snap_${Date.now()}`
        localStorage.setItem(snapKey, dataUrl)
        addNote(`__wb_snap__:${snapKey}`, null)
        setSaving(false)
        setToast(true)
        setTimeout(() => setToast(false), 3000)
      }
      reader.readAsDataURL(blob)
    } catch {
      setSaving(false)
    }
  }

  const handleExportPng = async () => {
    if (!apiRef.current) return
    const blob = await exportToBlob({
      elements: apiRef.current.getSceneElements(),
      appState: apiRef.current.getAppState(),
      files: apiRef.current.getFiles(),
      mimeType: 'image/png',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tablica-${conversationId.slice(0, 8)}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0, position: 'relative' }}>
      <div style={{
        display: 'flex', gap: 8, padding: '8px 16px', borderBottom: `1px solid ${C.border}`,
        background: C.bgDeep, flexShrink: 0, justifyContent: 'flex-end',
      }}>
        <button
          onClick={handleSaveAsNote}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surfaceUp,
            cursor: 'pointer', color: C.purple, fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
          }}
        >
          <BookOpen size={15} />
          {saving ? 'Zapisuję…' : 'Zapisz jako notatkę'}
        </button>
        <button
          onClick={handleExportPng}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surfaceUp,
            cursor: 'pointer', color: C.teal, fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
          }}
        >
          <Download size={15} />
          Pobierz PNG
        </button>
      </div>
      {toast && (
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#1e1b4b', border: '1px solid #7c3aed',
          color: '#c4b5fd', padding: '10px 20px', borderRadius: 10,
          fontSize: 13, fontWeight: 600, zIndex: 9999,
          boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
          whiteSpace: 'nowrap',
        }}>
          Zdjęcie zapisane w zakładce Notatki
        </div>
      )}
      <div style={{ flex: 1, position: 'relative', minHeight: 0, height: '100%' }}>
        <Excalidraw
          excalidrawAPI={(api) => { apiRef.current = api }}
          onChange={handleChange}
          UIOptions={{
            canvasActions: { saveAsImage: false, loadScene: false },
          }}
          theme="dark"
          langCode="pl-PL"
        />
      </div>
    </div>
  )
}
