import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUpRight, Check, Copy, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { C } from '../constants/theme'
import { fetchLessonsByTutor, Lesson } from '../api/lessonApi'
import { getMyAccount } from '../api/userApi'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui/Spinner'
import { LessonCard } from '../components/dashboard/LessonCard'

export function TutorDashboard() {
  const { userId } = useAuth()
  const navigate = useNavigate()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [username, setUsername] = useState('Tutor')
  const [profileUrl, setProfileUrl] = useState('')
  const [points, setPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!userId) return
    Promise.all([fetchLessonsByTutor(userId), getMyAccount()])
      .then(([items, account]) => {
        setLessons(items)
        setUsername(account.username || 'Tutor')
        setPoints(account.points ?? 0)
        const slug = account.slug ?? account.username?.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        if (slug) setProfileUrl(`${window.location.origin}/tutor/${slug}`)
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Nie udało się pobrać dashboardu.'))
      .finally(() => setLoading(false))
  }, [userId])

  const active = lessons.filter(lesson => lesson.status !== 'COMPLETED' && lesson.status !== 'CANCELLED')
  const archived = lessons.filter(lesson => lesson.status === 'COMPLETED' || lesson.status === 'CANCELLED')
  const totalMinutes = useMemo(() => active.reduce((total, lesson) => total + (lesson.durationTime || 0), 0), [active])

  const shareProfile = () => {
    if (!profileUrl) return
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    })
  }

  if (loading) return <Spinner />

  return (
    <div className="dashboard-page" style={{ flex: 1, minHeight: 0, overflow: 'hidden', background: C.bg }}>
      <style>{`
        .dashboard-page * { box-sizing: border-box; }
        .dashboard-header { padding: 28px 42px 24px; border-bottom: 1px solid ${C.border}; }
        .dashboard-scroll { height: calc(100% - 118px); overflow-y: auto; padding: 0 42px 58px; }
        .dashboard-shell { max-width: 1120px; margin: 0 auto; }
        .dashboard-cover { padding: 48px 0 42px; border-bottom: 1px solid ${C.border}; }
        .dashboard-cover h2 { max-width: 800px; font-size: clamp(35px, 7vw, 78px); line-height: .9; letter-spacing: -.075em; font-weight: 900; }
        .dashboard-stat-strip { display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid ${C.border}; }
        .dashboard-stat { padding: 22px 20px 21px 0; }
        .dashboard-stat + .dashboard-stat { padding-left: 20px; border-left: 1px solid ${C.border}; }
        .dashboard-section { padding-top: 35px; }
        .dashboard-section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 15px; margin-bottom: 14px; }
        .dashboard-share-rail { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 18px 0; border-bottom: 1px solid ${C.border}; }
        .dashboard-share-button, .dashboard-new-button { min-height: 43px; padding: 9px 14px; border-radius: 4px; cursor: pointer; font: 800 12px inherit; }
        .dashboard-share-button { border: 1px solid ${C.borderStrong}; background: transparent; color: ${C.textDim}; }
        .dashboard-share-button:hover { border-color: ${C.amber}88; color: ${C.amber}; }
        .dashboard-new-button { border: 0; background: ${C.amber}; color: #1A0A00; }
        @media (max-width: 700px) {
          .dashboard-header { padding: 21px 22px 18px; }
          .dashboard-scroll { height: calc(100% - 103px); padding: 0 22px 95px; }
          .dashboard-cover { padding: 35px 0 30px; }
          .dashboard-cover h2 { font-size: clamp(38px, 13vw, 62px); }
        }
        @media (max-width: 430px) {
          .dashboard-header { padding: 18px 16px 15px; }
          .dashboard-scroll { padding: 0 16px 95px; }
          .dashboard-stat-strip { grid-template-columns: 1fr; }
          .dashboard-stat, .dashboard-stat + .dashboard-stat { padding: 14px 0; border-left: 0; border-top: 1px solid ${C.border}; }
          .dashboard-stat:first-child { border-top: 0; }
          .dashboard-share-rail { align-items: stretch; flex-direction: column; gap: 13px; }
          .dashboard-share-button, .dashboard-new-button { width: 100%; }
        }
      `}</style>

      <header className="dashboard-header"><div className="dashboard-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}><div><div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.amber, font: '700 11px ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '.12em', textTransform: 'uppercase' }}><span style={{ width: 22, height: 1, background: C.amber }} /> Studio / Dashboard</div><h1 style={{ marginTop: 10, color: C.text, fontSize: 'clamp(26px, 4vw, 38px)', lineHeight: 1, letterSpacing: '-.05em', fontWeight: 850 }}>Twoja tablica</h1></div><div style={{ color: C.textFaint, font: '700 11px ui-monospace, SFMono-Regular, Menlo, monospace' }}>PUNKTY / {String(points).padStart(3, '0')}</div></div></header>

      <main className="dashboard-scroll"><div className="dashboard-shell">
        {error && <div role="alert" style={{ marginTop: 22, padding: '12px 14px', borderLeft: `3px solid ${C.coral}`, background: C.coral + '12', color: C.coral, fontSize: 13 }}>{error}</div>}

        <section className="dashboard-cover"><div style={{ color: C.teal, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>Dzień dobry, {username}</div><h2 style={{ marginTop: 24, color: C.text }}>{active.length ? <>Twoja wiedza.<br /><span style={{ color: C.amber }}>Twój ruch.</span></> : <>Masz coś, czym<br /><span style={{ color: C.amber }}>warto się podzielić.</span></>}</h2><p style={{ maxWidth: 460, marginTop: 25, color: C.textDim, fontSize: 14, lineHeight: 1.65 }}>{active.length ? 'Twoje oferty są gotowe. Dopracuj je albo pokaż swój profil komuś, kto szuka właśnie takiej umiejętności.' : 'Opublikuj pierwszą ofertę i pozwól uczniom znaleźć Cię w katalogu tutorów.'}</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 25 }}><button className="dashboard-new-button" onClick={() => navigate('/create-lesson')}><Plus size={15} style={{ verticalAlign: '-3px', marginRight: 6 }} /> Dodaj ofertę</button>{profileUrl && <button className="dashboard-share-button" onClick={shareProfile}>{copied ? <Check size={14} style={{ verticalAlign: '-3px', marginRight: 5 }} /> : <Copy size={14} style={{ verticalAlign: '-3px', marginRight: 5 }} />}{copied ? 'Link skopiowany' : 'Udostępnij profil'}</button>}</div></section>

        <section className="dashboard-stat-strip" aria-label="Podsumowanie"><Stat value={active.length} label="Aktywne oferty" color={C.amber} /><Stat value={totalMinutes} label="Minut nauczania" color={C.teal} /><Stat value={archived.length} label="W archiwum" color={C.purple} /></section>

        <div className="dashboard-share-rail"><div><div style={{ color: C.textFaint, font: '700 11px ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '.1em', textTransform: 'uppercase' }}>Zasięg zaczyna się od jednego linku</div><p style={{ marginTop: 7, color: C.textDim, fontSize: 13 }}>Pokaż innym, czego możesz ich nauczyć.</p></div>{profileUrl && <button className="dashboard-share-button" onClick={shareProfile}>{copied ? 'Skopiowano' : 'Kopiuj link profilu'} <ArrowUpRight size={14} style={{ verticalAlign: '-3px', marginLeft: 4 }} /></button>}</div>

        <section className="dashboard-section"><div className="dashboard-section-heading"><div><div style={{ color: C.textFaint, font: '700 11px ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '.1em', textTransform: 'uppercase' }}>Biblioteka ofert</div><h2 style={{ marginTop: 7, color: C.text, fontSize: 25, letterSpacing: '-.05em' }}>Aktywne lekcje</h2></div><span style={{ color: C.amber, fontSize: 13, fontWeight: 800 }}>{active.length}</span></div>{active.length > 0 ? active.map(lesson => <LessonCard key={lesson.id} lesson={lesson} onDelete={id => setLessons(previous => previous.filter(item => item.id !== id))} />) : <EmptyLessons onCreate={() => navigate('/create-lesson')} />}</section>

        {archived.length > 0 && <section className="dashboard-section"><div className="dashboard-section-heading"><div><div style={{ color: C.textFaint, font: '700 11px ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '.1em', textTransform: 'uppercase' }}>Historia</div><h2 style={{ marginTop: 7, color: C.text, fontSize: 25, letterSpacing: '-.05em' }}>Archiwum</h2></div><span style={{ color: C.textFaint, fontSize: 13, fontWeight: 800 }}>{archived.length}</span></div>{archived.map(lesson => <LessonCard key={lesson.id} lesson={lesson} onDelete={id => setLessons(previous => previous.filter(item => item.id !== id))} />)}</section>}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '38px 0 5px', color: C.textFaint, fontSize: 11 }}><ArrowDown size={13} /> Twoja tablica rośnie razem z Twoją społecznością</div>
      </div></main>
    </div>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) { return <div className="dashboard-stat"><div style={{ color, fontSize: 30, fontWeight: 900, letterSpacing: '-.07em' }}>{value}</div><div style={{ marginTop: 5, color: C.textFaint, fontSize: 10, fontWeight: 750, letterSpacing: '.09em', textTransform: 'uppercase' }}>{label}</div></div> }

function EmptyLessons({ onCreate }: { onCreate: () => void }) { return <div style={{ padding: '23px 0', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}><p style={{ color: C.textDim, fontSize: 14 }}>Nie masz jeszcze aktywnych ofert.</p><button className="dashboard-share-button" onClick={onCreate} style={{ marginTop: 14 }}>Utwórz pierwszą <ArrowUpRight size={14} style={{ verticalAlign: '-3px', marginLeft: 4 }} /></button></div> }
