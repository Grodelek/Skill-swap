import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Pencil, Shield, Share2, Check } from 'lucide-react'
import { C } from '../constants/theme'
import { getMyAccount, getMyTutorInfo, TutorInfo, uploadPhoto, User as UserType } from '../api/userApi'
import { fetchMyBookings, Offer } from '../api/offerApi'
import { useAuth } from '../context/AuthContext'
import { getImageUrl } from '../utils/image'
import { Spinner } from '../components/ui/Spinner'
import { ActivityHeatmap } from '../components/profile/ActivityHeatmap'
import { AvatarRing } from '../components/profile/AvatarRing'
import { EditProfileSheet } from '../components/profile/EditProfileSheet'
import { SettingsSheet } from '../components/profile/SettingsSheet'

function levelFromXP(xp: number) {
  return { level: Math.floor(xp / 100) + 1, current: xp % 100, needed: 100 }
}

const EXPERIENCE_LABELS: Record<string, string> = {
  BEGINNER: 'Początkujący', INTERMEDIATE: 'Średniozaawansowany', ADVANCED: 'Zaawansowany', EXPERT: 'Ekspert',
}
const AVAILABILITY_LABELS: Record<string, string> = {
  WEEKDAYS_ONLY: 'Dni robocze', WEEKENDS_ONLY: 'Weekendy', EVENING_ONLY: 'Wieczory', FLEXIBLE: 'Elastycznie',
}
const LESSON_TYPE_LABELS: Record<string, string> = {
  PROFESSIONAL: 'Profesjonalne', CASUAL: 'Casualowe', FLEXIBLE: 'Elastyczne',
}

function TutorTag({ label }: { label: string }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, color: C.textDim,
      padding: '4px 10px', borderRadius: 9999,
      border: `1px solid ${C.borderStrong}`,
    }}>
      {label}
    </span>
  )
}

export function Profile() {
  const { logout, userType } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserType | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tutorInfo, setTutorInfo] = useState<TutorInfo | null>(null)

  const profileSlug = user?.slug ?? user?.username
    ?.replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const handleShare = () => {
    if (!profileSlug) return
    const url = `${window.location.origin}/tutor/${profileSlug}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  useEffect(() => {
    Promise.all([getMyAccount(), fetchMyBookings().catch(() => [])])
      .then(([u, o]) => { setUser(u); setOffers(o) })
      .finally(() => setLoading(false))
    if (userType === 'TUTOR') getMyTutorInfo().then(setTutorInfo).catch(() => {})
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const handlePhotoChange = async (base64: string) => {
    try {
      await uploadPhoto(base64)
      setUser(u => u ? { ...u, photoPath: base64 } : u)
    } catch { /* silent */ }
  }

  const handleProfileSave = (username: string, description: string) => {
    setUser(u => u ? { ...u, username, description } : u)
  }

  const openEdit = () => { setShowSettings(false); setShowEdit(true) }

  if (loading) return <Spinner />

  const xp = user?.points ?? 0
  const { level, current, needed } = levelFromXP(xp)
  const completedLessons = offers.filter(o => o.completed).length
  const uri = getImageUrl(user?.photoPath)

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: C.bg }}>
      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 32 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 0' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>Profil</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {userType === 'TUTOR' && profileSlug && (
              <button onClick={handleShare} title="Udostępnij profil" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: copied ? C.green + '22' : C.surfaceUp,
                border: `1px solid ${copied ? C.green + '55' : C.border}`,
                borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
                color: copied ? C.green : C.textDim, fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}>
                {copied ? <Check size={14} /> : <Share2 size={14} />}
                {copied ? 'Skopiowano!' : 'Udostępnij'}
              </button>
            )}
            <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <Settings size={22} color={C.textDim} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px 20px' }}>
          <AvatarRing uri={uri} username={user?.username} xpCurrent={current} xpNeeded={needed} onPhotoChange={handlePhotoChange} />

          <div style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: -0.4 }}>
            {user?.username ?? '—'}
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 8, padding: '5px 14px', borderRadius: 9999,
            background: C.surfaceUp, border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <Shield size={13} color={C.amber} fill={C.amber} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>Poziom {level}</span>
            <span style={{ fontSize: 13, color: C.textFaint }}>· {current}/{needed} XP</span>
          </div>

          {tutorInfo && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12, justifyContent: 'center' }}>
              {tutorInfo.experienceTime && <TutorTag label={EXPERIENCE_LABELS[tutorInfo.experienceTime] ?? tutorInfo.experienceTime} />}
              {tutorInfo.availability && <TutorTag label={AVAILABILITY_LABELS[tutorInfo.availability] ?? tutorInfo.availability} />}
              {tutorInfo.lessonType && <TutorTag label={LESSON_TYPE_LABELS[tutorInfo.lessonType] ?? tutorInfo.lessonType} />}
            </div>
          )}

          <div style={{
            display: 'flex', width: '100%', marginTop: 20,
            background: C.surface, borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden',
          }}>
            <div style={{ flex: 1, padding: '16px 0', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.amber, letterSpacing: -1 }}>{xp}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textFaint, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>XP</div>
            </div>
            <div style={{ flex: 1, padding: '16px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.teal, letterSpacing: -1 }}>{completedLessons}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textFaint, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>Lekcji</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 16px' }}>
          <ActivityHeatmap offers={offers} />

          <div style={{ background: C.surface, borderRadius: 16, padding: '18px 20px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>O mnie</div>
            <div style={{ fontSize: 14, color: C.textDim, lineHeight: 1.65 }}>
              {user?.description || 'Dodaj krótki opis, żeby inni wiedzieli, w czym możesz pomóc.'}
            </div>
            <button onClick={openEdit} style={{
              display: 'flex', alignItems: 'center', gap: 6, marginTop: 14,
              background: 'none', border: 'none', cursor: 'pointer',
              color: C.amber, fontWeight: 700, fontSize: 14, fontFamily: 'inherit', padding: 0,
            }}>
              <Pencil size={14} /> Edytuj profil
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <SettingsSheet onClose={() => setShowSettings(false)} onEditProfile={openEdit} onLogout={handleLogout} />
      )}

      {showEdit && user?.id && (
        <EditProfileSheet
          userId={user.id}
          initialUsername={user.username ?? ''}
          initialDescription={user.description ?? ''}
          onSave={handleProfileSave}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}
