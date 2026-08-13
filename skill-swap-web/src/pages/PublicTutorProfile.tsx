import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, BookOpen, MessageCircle, ChevronLeft } from 'lucide-react'
import { C } from '../constants/theme'
import { getTutorBySlug, PublicTutorProfile as TutorProfile } from '../api/userApi'
import { sendMessageToTutor } from '../api/lessonApi'
import { useAuth } from '../context/AuthContext'
import { getImageUrl } from '../utils/image'
import { Spinner } from '../components/ui/Spinner'

const EXPERIENCE_LABELS: Record<string, string> = {
  BEGINNER: 'Początkujący',
  INTERMEDIATE: 'Średniozaawansowany',
  ADVANCED: 'Zaawansowany',
  EXPERT: 'Ekspert',
}

const AVAILABILITY_LABELS: Record<string, string> = {
  WEEKDAYS_ONLY: 'Dni robocze',
  WEEKENDS_ONLY: 'Weekendy',
  EVENING_ONLY: 'Wieczory',
  FLEXIBLE: 'Elastycznie',
}

const LESSON_TYPE_LABELS: Record<string, string> = {
  PROFESSIONAL: 'Profesjonalne',
  CASUAL: 'Casualowe',
  FLEXIBLE: 'Elastyczne',
}

function useSeoMeta(tutor: TutorProfile | null) {
  useEffect(() => {
    if (!tutor) return
    const prevTitle = document.title
    document.title = `${tutor.username} — korepetytor | SkillSwap`

    const setMeta = (name: string, content: string, prop = false) => {
      const attr = prop ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el) }
      el.content = content
      return el
    }

    const desc = tutor.description ?? `Sprawdź profil korepetytora ${tutor.username} na SkillSwap.`
    const photo = tutor.photoPath ?? ''

    const metas = [
      setMeta('description', desc),
      setMeta('og:title', `${tutor.username} — korepetytor | SkillSwap`, true),
      setMeta('og:description', desc, true),
      setMeta('og:image', photo, true),
      setMeta('og:type', 'profile', true),
      setMeta('og:url', window.location.href, true),
      setMeta('twitter:card', 'summary_large_image'),
      setMeta('twitter:title', `${tutor.username} | SkillSwap`),
      setMeta('twitter:description', desc),
      setMeta('twitter:image', photo),
    ]

    return () => {
      document.title = prevTitle
      metas.forEach(el => el.content = '')
    }
  }, [tutor])
}

export function PublicTutorProfile() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { token, userId } = useAuth()
  const [tutor, setTutor] = useState<TutorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [contacting, setContacting] = useState(false)

  useSeoMeta(tutor)

  useEffect(() => {
    if (!slug) return
    getTutorBySlug(slug)
      .then(setTutor)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  const handleContact = async () => {
    if (!token) { navigate(`/register?redirect=/tutor/${slug}`); return }
    if (!tutor) return
    setContacting(true)
    try {
      const { id } = await sendMessageToTutor(tutor.id)
      navigate(`/conversations/${id}`)
    } catch {
      navigate('/conversations')
    } finally {
      setContacting(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  )

  if (error || !tutor) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div style={{ fontSize: 48 }}>🔍</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Nie znaleziono tutora</div>
      <div style={{ fontSize: 14, color: C.textDim }}>{error}</div>
      <button onClick={() => navigate('/')} style={{ marginTop: 8, padding: '10px 20px', borderRadius: 12, border: 'none', background: C.amber, color: '#1A0A00', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
        Strona główna
      </button>
    </div>
  )

  const isOwnProfile = userId === tutor.id
  const photoUri = getImageUrl(tutor.photoPath)

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* nav bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${C.border}`, background: C.bgDeep }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={22} />
        </button>
        <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Profil tutora</span>
        <div style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: C.amber }}>SkillSwap</div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* hero card */}
        <div style={{ background: C.surface, borderRadius: 20, padding: '28px 24px', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 80,
            background: `linear-gradient(135deg, ${C.purple}22, ${C.amber}22)`,
            borderRadius: '20px 20px 0 0',
          }} />

          <img
            src={photoUri ?? undefined}
            alt={tutor.username}
            style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${C.amber}`, zIndex: 1, background: C.surfaceUp }}
          />

          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: -0.5 }}>{tutor.username}</div>
            {tutor.experienceTime && (
              <div style={{ fontSize: 13, color: C.amber, fontWeight: 700, marginTop: 4 }}>
                {EXPERIENCE_LABELS[tutor.experienceTime] ?? tutor.experienceTime}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, zIndex: 1 }}>
            {tutor.availability && (
              <Chip label={AVAILABILITY_LABELS[tutor.availability] ?? tutor.availability} color={C.teal} />
            )}
            {tutor.lessonType && (
              <Chip label={LESSON_TYPE_LABELS[tutor.lessonType] ?? tutor.lessonType} color={C.purple} />
            )}
          </div>

          <div style={{ display: 'flex', gap: 24, zIndex: 1 }}>
            <Stat value={tutor.points ?? 0} label="XP" color={C.amber} />
            <Stat value={tutor.lessons.length} label="Lekcji" color={C.teal} />
            <Stat value={Math.floor((tutor.points ?? 0) / 100) + 1} label="Poziom" color={C.purple} />
          </div>

          {!isOwnProfile && (
            <button
              onClick={handleContact}
              disabled={contacting}
              style={{
                zIndex: 1, display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 14, border: 'none',
                background: contacting ? C.surfaceUp : C.amber,
                color: contacting ? C.textDim : '#1A0A00',
                fontWeight: 800, fontSize: 15, cursor: contacting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', borderBottom: contacting ? 'none' : `4px solid ${C.amberDark}`,
                width: '100%', justifyContent: 'center',
              }}
            >
              <MessageCircle size={17} />
              {contacting ? 'Otwieranie...' : token ? 'Napisz wiadomość' : 'Zaloguj się, aby napisać'}
            </button>
          )}
        </div>

        {/* opis */}
        {tutor.description && (
          <div style={{ background: C.surface, borderRadius: 16, padding: '18px 20px', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>O mnie</div>
            <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.7, margin: 0 }}>{tutor.description}</p>
          </div>
        )}

        {/* lekcje */}
        {tutor.lessons.length > 0 && (
          <div style={{ background: C.surface, borderRadius: 16, padding: '18px 20px', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Oferta lekcji · {tutor.lessons.length}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tutor.lessons.map(l => (
                <div key={l.id} style={{
                  background: C.bgDeep, borderRadius: 12, padding: '14px 16px',
                  border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <BookOpen size={14} color={C.amber} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{l.subject ?? 'Lekcja'}</span>
                    </div>
                    {l.description && (
                      <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5 }}>{l.description}</div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                      <Clock size={11} color={C.textFaint} />
                      <span style={{ fontSize: 11, color: C.textFaint }}>{l.durationTime} min</span>
                    </div>
                  </div>
                  {l.price != null && (
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: C.amber }}>{l.price} zł</div>
                      <div style={{ fontSize: 10, color: C.textFaint }}>/ lekcja</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* footer CTA dla niezalogowanych */}
        {!token && (
          <div style={{
            background: `linear-gradient(135deg, ${C.purple}22, ${C.amber}22)`,
            borderRadius: 16, padding: '20px', border: `1px solid ${C.amber}33`,
            textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Chcesz uczyć się z {tutor.username}?</div>
            <div style={{ fontSize: 13, color: C.textDim }}>Dołącz do SkillSwap i zarezerwuj pierwszą lekcję</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => navigate(`/register?redirect=/tutor/${slug}`)}
                style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: C.amber, color: '#1A0A00', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                Zarejestruj się
              </button>
              <button onClick={() => navigate(`/login?redirect=/tutor/${slug}`)}
                style={{ padding: '10px 20px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: 'none', color: C.textDim, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Zaloguj się
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', paddingBottom: 8 }}>
          <span style={{ fontSize: 11, color: C.textFaint }}>
            skillswap.pl/tutor/{slug}
          </span>
        </div>
      </div>
    </div>
  )
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      padding: '5px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 700,
      background: color + '22', color, border: `1px solid ${color}44`,
    }}>
      {label}
    </div>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 900, color, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 11, color: C.textFaint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
    </div>
  )
}
