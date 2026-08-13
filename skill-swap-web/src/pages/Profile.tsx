import { useEffect, useState } from 'react'
import { Check, Pencil, Settings, Share2, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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

function levelFromXP(xp: number) { return { level: Math.floor(xp / 100) + 1, current: xp % 100, needed: 100 } }

const EXPERIENCE_LABELS: Record<string, string> = { BEGINNER: 'Początkujący', INTERMEDIATE: 'Średniozaawansowany', ADVANCED: 'Zaawansowany', EXPERT: 'Ekspert' }
const AVAILABILITY_LABELS: Record<string, string> = { WEEKDAYS_ONLY: 'Dni robocze', WEEKENDS_ONLY: 'Weekendy', EVENING_ONLY: 'Wieczory', FLEXIBLE: 'Elastycznie' }
const LESSON_TYPE_LABELS: Record<string, string> = { PROFESSIONAL: 'Profesjonalne', CASUAL: 'Casualowe', FLEXIBLE: 'Elastyczne' }

function TutorTag({ label }: { label: string }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', minHeight: 28, padding: '5px 9px', border: `1px solid ${C.borderStrong}`, borderRadius: 4, color: C.textDim, fontSize: 11, fontWeight: 700 }}>{label}</span>
}

export function Profile() {
  const { logout, userType } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserType | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [tutorInfo, setTutorInfo] = useState<TutorInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [copied, setCopied] = useState(false)

  const profileSlug = user?.slug ?? user?.username?.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  useEffect(() => {
    Promise.all([getMyAccount(), fetchMyBookings().catch(() => [])])
      .then(([account, bookings]) => { setUser(account); setOffers(bookings) })
      .finally(() => setLoading(false))
    if (userType === 'TUTOR') getMyTutorInfo().then(setTutorInfo).catch(() => {})
  }, [userType])

  const handleShare = () => {
    if (!profileSlug) return
    navigator.clipboard.writeText(`${window.location.origin}/tutor/${profileSlug}`).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleLogout = () => { logout(); navigate('/login') }
  const handlePhotoChange = async (base64: string) => { try { await uploadPhoto(base64); setUser(current => current ? { ...current, photoPath: base64 } : current) } catch { /* upload errors stay local */ } }
  const handleProfileSave = (username: string, description: string) => setUser(current => current ? { ...current, username, description } : current)
  const openEdit = () => { setShowSettings(false); setShowEdit(true) }

  if (loading) return <Spinner />

  const xp = user?.points ?? 0
  const { level, current, needed } = levelFromXP(xp)
  const completedLessons = offers.filter(offer => offer.completed).length
  const uri = getImageUrl(user?.photoPath)

  return (
    <div className="account-page" style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: C.bg }}>
      <style>{`
        .account-page * { box-sizing: border-box; }
        .account-header { padding: 28px 42px 22px; border-bottom: 1px solid ${C.border}; }
        .account-scroll-shell { max-width: 920px; margin: 0 auto; }
        .account-main { display: grid; grid-template-columns: minmax(220px, .72fr) minmax(0, 1.28fr); gap: clamp(35px, 7vw, 90px); padding: 38px 42px 60px; }
        .account-identity { padding-right: 28px; border-right: 1px solid ${C.border}; }
        .account-action { min-height: 38px; padding: 8px 11px; border: 1px solid ${C.borderStrong}; border-radius: 4px; background: transparent; color: ${C.textDim}; cursor: pointer; font: 700 12px inherit; }
        .account-action:hover { border-color: ${C.amber}88; color: ${C.amber}; }
        .account-section { padding: 23px 0; border-top: 1px solid ${C.border}; }
        .account-section:first-child { padding-top: 0; border-top: 0; }
        .account-section-label { color: ${C.textFaint}; font: 700 11px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .1em; text-transform: uppercase; }
        .account-stats { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid ${C.border}; border-bottom: 1px solid ${C.border}; }
        .account-stat { padding: 15px 0; }
        .account-stat + .account-stat { padding-left: 20px; border-left: 1px solid ${C.border}; }
        @media (max-width: 760px) {
          .account-header { padding: 22px 24px 18px; }
          .account-main { grid-template-columns: 1fr; gap: 27px; padding: 30px 24px 100px; }
          .account-identity { padding: 0 0 26px; border-right: 0; border-bottom: 1px solid ${C.border}; }
        }
        @media (max-width: 420px) {
          .account-header { padding: 18px 16px 15px; }
          .account-main { padding: 24px 16px 96px; }
          .account-top-actions { gap: 6px !important; }
          .account-top-actions span { display: none; }
        }
      `}</style>

      <header className="account-header">
        <div className="account-scroll-shell" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18 }}>
          <div><div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.purple, font: '700 11px ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '.12em', textTransform: 'uppercase' }}><span style={{ width: 22, height: 1, background: C.purple }} /> Account / 01</div><h1 style={{ marginTop: 10, color: C.text, fontSize: 'clamp(27px, 4vw, 38px)', lineHeight: 1, letterSpacing: '-.05em', fontWeight: 850 }}>Moje konto</h1></div>
          <div className="account-top-actions" style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
            {userType === 'TUTOR' && profileSlug && <button className="account-action" onClick={handleShare}>{copied ? <Check size={14} style={{ verticalAlign: '-3px', marginRight: 5 }} /> : <Share2 size={14} style={{ verticalAlign: '-3px', marginRight: 5 }} />}<span>{copied ? 'Skopiowano' : 'Udostępnij'}</span></button>}
            <button className="account-action" onClick={() => setShowSettings(true)} aria-label="Otwórz ustawienia"><Settings size={16} /></button>
          </div>
        </div>
      </header>

      <main className="account-scroll-shell account-main">
        <aside className="account-identity">
          <AvatarRing uri={uri} username={user?.username} xpCurrent={current} xpNeeded={needed} onPhotoChange={handlePhotoChange} />
          <div style={{ textAlign: 'center' }}><h2 style={{ color: C.text, fontSize: 22, fontWeight: 850, letterSpacing: '-.04em' }}>{user?.username ?? '—'}</h2><p style={{ marginTop: 5, color: C.textFaint, fontSize: 12 }}>{userType === 'TUTOR' ? 'Tutor SkillSwap' : 'Użytkownik SkillSwap'}</p></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '22px 0 24px', padding: '11px 0', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}><Shield size={16} color={C.amber} /><span style={{ color: C.amber, fontSize: 13, fontWeight: 800 }}>Poziom {level}</span><span style={{ marginLeft: 'auto', color: C.textFaint, fontSize: 12 }}>{current}/{needed} XP</span></div>

          {tutorInfo && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>{tutorInfo.experienceTime && <TutorTag label={EXPERIENCE_LABELS[tutorInfo.experienceTime] ?? tutorInfo.experienceTime} />}{tutorInfo.availability && <TutorTag label={AVAILABILITY_LABELS[tutorInfo.availability] ?? tutorInfo.availability} />}{tutorInfo.lessonType && <TutorTag label={LESSON_TYPE_LABELS[tutorInfo.lessonType] ?? tutorInfo.lessonType} />}</div>}

          <div className="account-stats"><div className="account-stat"><div style={{ color: C.amber, fontSize: 25, fontWeight: 900, letterSpacing: '-.05em' }}>{xp}</div><div style={{ marginTop: 3, color: C.textFaint, fontSize: 10, fontWeight: 750, letterSpacing: '.09em', textTransform: 'uppercase' }}>Punkty XP</div></div><div className="account-stat"><div style={{ color: C.teal, fontSize: 25, fontWeight: 900, letterSpacing: '-.05em' }}>{completedLessons}</div><div style={{ marginTop: 3, color: C.textFaint, fontSize: 10, fontWeight: 750, letterSpacing: '.09em', textTransform: 'uppercase' }}>Ukończone</div></div></div>
        </aside>

        <div>
          <section className="account-section"><div className="account-section-label">O mnie</div><p style={{ marginTop: 12, color: user?.description ? C.textDim : C.textFaint, fontSize: 14, lineHeight: 1.7 }}>{user?.description || 'Dodaj krótki opis, żeby inni wiedzieli, w czym możesz pomóc.'}</p><button onClick={openEdit} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 16, padding: 0, border: 0, background: 'transparent', color: C.amber, cursor: 'pointer', font: '750 13px inherit' }}><Pencil size={14} /> Edytuj profil</button></section>
          <section className="account-section"><div className="account-section-label" style={{ marginBottom: 16 }}>Aktywność</div><ActivityHeatmap offers={offers} /></section>
          <section className="account-section"><div className="account-section-label">Dane konta</div><div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 24px', marginTop: 14, fontSize: 13 }}><span style={{ color: C.textFaint }}>Nazwa użytkownika</span><span style={{ color: C.textDim, overflowWrap: 'anywhere' }}>{user?.username ?? '—'}</span><span style={{ color: C.textFaint }}>Typ konta</span><span style={{ color: C.textDim }}>{userType === 'TUTOR' ? 'Tutor' : 'Uczeń'}</span></div></section>
        </div>
      </main>

      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} onEditProfile={openEdit} onLogout={handleLogout} />}
      {showEdit && user?.id && <EditProfileSheet userId={user.id} initialUsername={user.username ?? ''} initialDescription={user.description ?? ''} onSave={handleProfileSave} onClose={() => setShowEdit(false)} />}
    </div>
  )
}
