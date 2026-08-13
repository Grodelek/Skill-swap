import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Banknote, Check, ChevronDown, Clock3, Search } from 'lucide-react'
import { C } from '../constants/theme'
import { createLesson } from '../api/lessonApi'

const SUBJECTS = [
  'Polski', 'Matematyka', 'Angielski', 'Rosyjski', 'Niemiecki', 'Francuski',
  'Fizyka', 'Chemia', 'Biologia', 'Historia', 'Informatyka', 'Geografia',
]

const DURATIONS = [30, 45, 60, 90, 120]
const PRICES = [50, 80, 120, 150]
const MAX_DESCRIPTION_LENGTH = 500

type FieldName = 'subject' | 'description' | 'duration' | 'price'
type FieldErrors = Partial<Record<FieldName, string>>

const controlStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 50,
  padding: '13px 14px',
  border: `1px solid ${C.borderStrong}`,
  borderRadius: 5,
  background: C.bgDeep,
  color: C.text,
  fontFamily: 'inherit',
  fontSize: 15,
  outline: 'none',
}

export function CreateLesson() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [price, setPrice] = useState('')
  const [subjectQuery, setSubjectQuery] = useState('')
  const [subjectOpen, setSubjectOpen] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  const subjects = useMemo(
    () => SUBJECTS.filter(item => item.toLowerCase().includes(subjectQuery.toLowerCase())),
    [subjectQuery],
  )

  const setFieldError = (field: FieldName) => {
    setErrors(current => ({ ...current, [field]: undefined }))
  }

  const validate = (): FieldErrors => {
    const next: FieldErrors = {}
    if (!subject) next.subject = 'Wybierz przedmiot.'
    if (description.trim().length < 4) next.description = 'Opis musi mieć co najmniej 4 znaki.'
    if (!duration || Number(duration) < 15 || Number(duration) > 240) next.duration = 'Wybierz czas od 15 do 240 minut.'
    if (!price || Number(price) <= 0) next.price = 'Cena musi być większa od 0 zł.'
    return next
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    setSubmitError('')
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      await createLesson({
        subject,
        description: description.trim(),
        durationTime: Number(duration),
        price: Number(price),
      })
      navigate('/dashboard')
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : 'Nie udało się utworzyć lekcji.')
    } finally {
      setLoading(false)
    }
  }

  const chooseSubject = (value: string) => {
    setSubject(value)
    setSubjectOpen(false)
    setSubjectQuery('')
    setFieldError('subject')
  }

  const borderFor = (field: FieldName, focused = false) =>
    `1px solid ${errors[field] ? C.coral : focused ? C.amber : C.borderStrong}`

  return (
    <div className="lesson-create-page" style={{ flex: 1, minHeight: 0, overflow: 'hidden', background: C.bg }}>
      <style>{`
        .lesson-create-page * { box-sizing: border-box; }
        .lesson-create-header { padding: 28px 42px 23px; border-bottom: 1px solid ${C.border}; }
        .lesson-create-scroll { height: calc(100% - 105px); overflow-y: auto; padding: 35px 42px 48px; }
        .lesson-create-shell { max-width: 1120px; margin: 0 auto; }
        .lesson-create-layout { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(280px, .75fr); gap: clamp(35px, 7vw, 100px); align-items: start; }
        .lesson-section { padding: 25px 0 30px; border-top: 1px solid ${C.border}; }
        .lesson-section:first-child { padding-top: 0; border-top: 0; }
        .lesson-section-heading { display: flex; gap: 15px; align-items: flex-start; margin-bottom: 23px; }
        .lesson-index { color: ${C.amber}; font: 700 11px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .08em; padding-top: 4px; }
        .lesson-label { display: block; color: ${C.textDim}; font-size: 12px; font-weight: 750; letter-spacing: .04em; margin-bottom: 8px; text-transform: uppercase; }
        .lesson-control:focus { border-color: ${C.amber} !important; box-shadow: 0 0 0 3px ${C.amber}18; }
        .lesson-chip { min-height: 32px; padding: 6px 10px; border: 1px solid ${C.border}; border-radius: 4px; background: transparent; color: ${C.textDim}; cursor: pointer; font: 600 12px inherit; }
        .lesson-chip:hover, .lesson-chip[data-active='true'] { border-color: ${C.amber}88; background: ${C.amber}12; color: ${C.amber}; }
        .lesson-publish { min-height: 50px; padding: 12px 20px; border: 0; border-radius: 5px; background: ${C.amber}; color: #1A0A00; cursor: pointer; font: 800 14px inherit; }
        .lesson-publish:disabled { background: ${C.surfaceUp}; color: ${C.textDim}; cursor: not-allowed; }
        .lesson-cancel { min-height: 50px; padding: 12px 20px; border: 1px solid ${C.borderStrong}; border-radius: 5px; background: transparent; color: ${C.textDim}; cursor: pointer; font: 700 14px inherit; }
        .lesson-preview { position: sticky; top: 0; padding: 3px 0 0 27px; border-left: 2px solid ${C.amber}; }
        .lesson-preview-paper { padding: 25px 0 27px; border-bottom: 1px solid ${C.border}; }
        .lesson-action-row { display: flex; gap: 10px; padding-top: 5px; }
        @media (max-width: 820px) {
          .lesson-create-header { padding: 22px 24px 18px; }
          .lesson-create-scroll { height: calc(100% - 95px); padding: 27px 24px 100px; }
          .lesson-create-layout { grid-template-columns: 1fr; gap: 24px; }
          .lesson-preview { position: static; padding: 0 0 0 18px; }
          .lesson-preview-paper { padding: 18px 0 20px; }
        }
        @media (max-width: 520px) {
          .lesson-create-header { padding: 18px 16px 15px; }
          .lesson-create-scroll { padding: 22px 16px 96px; }
          .lesson-create-layout { gap: 19px; }
          .lesson-section { padding: 22px 0 25px; }
          .lesson-section-heading { margin-bottom: 19px; }
          .lesson-field-grid { grid-template-columns: 1fr !important; gap: 17px !important; }
          .lesson-action-row { position: sticky; bottom: -1px; z-index: 3; flex-direction: column-reverse; margin: 0 -16px; padding: 13px 16px calc(13px + env(safe-area-inset-bottom)); background: ${C.bg}; border-top: 1px solid ${C.border}; }
          .lesson-action-row button { width: 100%; }
        }
      `}</style>

      <header className="lesson-create-header">
        <div className="lesson-create-shell">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.amber, font: '700 11px ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '.12em', textTransform: 'uppercase' }}>
            <span style={{ width: 22, height: 1, background: C.amber }} /> Oferta / 01
          </div>
          <h1 style={{ marginTop: 10, color: C.text, fontSize: 'clamp(25px, 4vw, 38px)', lineHeight: 1, letterSpacing: '-.05em', fontWeight: 850 }}>Nowa lekcja</h1>
          <p style={{ maxWidth: 460, marginTop: 10, color: C.textDim, fontSize: 13, lineHeight: 1.5 }}>Stwórz konkretną ofertę, którą uczeń łatwo zrozumie i zapamięta.</p>
        </div>
      </header>

      <main className="lesson-create-scroll">
        <div className="lesson-create-shell lesson-create-layout">
          <form onSubmit={submit} noValidate>
            <section className="lesson-section">
              <div className="lesson-section-heading">
                <span className="lesson-index">01</span>
                <div><h2 style={{ color: C.text, fontSize: 19, fontWeight: 800, letterSpacing: '-.02em' }}>Czego uczysz?</h2><p style={{ marginTop: 5, color: C.textDim, fontSize: 13 }}>Zacznij od tematu, który uczeń zobaczy jako pierwszy.</p></div>
              </div>

              <label className="lesson-label" htmlFor="subject-trigger">Przedmiot</label>
              <div style={{ position: 'relative' }}>
                <button id="subject-trigger" type="button" aria-haspopup="listbox" aria-expanded={subjectOpen} onClick={() => setSubjectOpen(value => !value)} className="lesson-control" style={{ ...controlStyle, border: borderFor('subject', subjectOpen), display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', cursor: 'pointer' }}>
                  <span style={{ color: subject ? C.text : C.textFaint }}>{subject || 'Wybierz przedmiot'}</span>
                  <ChevronDown size={17} color={C.textDim} style={{ transform: subjectOpen ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }} />
                </button>
                {subjectOpen && <div role="listbox" aria-label="Przedmioty" style={{ position: 'absolute', zIndex: 5, top: 'calc(100% + 5px)', left: 0, right: 0, overflow: 'hidden', border: `1px solid ${C.borderStrong}`, borderRadius: 5, background: C.surfaceUp, boxShadow: '0 12px 28px rgba(0,0,0,.35)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', borderBottom: `1px solid ${C.border}` }}><Search size={15} color={C.textFaint} /><input autoFocus aria-label="Szukaj przedmiotu" value={subjectQuery} onChange={event => setSubjectQuery(event.target.value)} placeholder="Szukaj..." className="lesson-control" style={{ ...controlStyle, minHeight: 30, padding: 0, border: 0, background: 'transparent', fontSize: 14 }} /></div>
                  <div style={{ maxHeight: 215, overflowY: 'auto', padding: 5 }}>{subjects.length ? subjects.map(item => <button key={item} type="button" role="option" aria-selected={item === subject} onClick={() => chooseSubject(item)} style={{ display: 'block', width: '100%', padding: '10px', border: 0, borderRadius: 3, background: item === subject ? C.amber + '18' : 'transparent', color: item === subject ? C.amber : C.text, cursor: 'pointer', font: '500 14px inherit', textAlign: 'left' }}>{item}</button>) : <div style={{ padding: 12, color: C.textDim, fontSize: 13 }}>Brak wyników.</div>}</div>
                </div>}
              </div>
              {errors.subject && <FieldError message={errors.subject} />}
            </section>

            <section className="lesson-section">
              <div className="lesson-section-heading"><span className="lesson-index">02</span><div><h2 style={{ color: C.text, fontSize: 19, fontWeight: 800, letterSpacing: '-.02em' }}>Opisz podejście</h2><p style={{ marginTop: 5, color: C.textDim, fontSize: 13 }}>Dobra oferta odpowiada na pytanie: „czy to jest dla mnie?”.</p></div></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><label className="lesson-label" htmlFor="description">Opis lekcji</label><span style={{ color: description.length >= MAX_DESCRIPTION_LENGTH ? C.coral : C.textFaint, fontSize: 11 }}>{description.length}/{MAX_DESCRIPTION_LENGTH}</span></div>
              <textarea id="description" value={description} maxLength={MAX_DESCRIPTION_LENGTH} onChange={event => { setDescription(event.target.value); setFieldError('description') }} placeholder="Np. Pomagam w algebrze i przygotowaniu do matury. Na zajęciach łączymy krótkie wyjaśnienia z rozwiązywaniem zadań." rows={7} className="lesson-control" style={{ ...controlStyle, minHeight: 150, resize: 'vertical', lineHeight: 1.6, border: borderFor('description') }} />
              {errors.description ? <FieldError message={errors.description} /> : <p style={{ marginTop: 8, color: C.textFaint, fontSize: 12 }}>Napisz, dla kogo jest lekcja, jaki materiał obejmuje i jak pracujesz.</p>}
            </section>

            <section className="lesson-section">
              <div className="lesson-section-heading"><span className="lesson-index">03</span><div><h2 style={{ color: C.text, fontSize: 19, fontWeight: 800, letterSpacing: '-.02em' }}>Ustal ramy</h2><p style={{ marginTop: 5, color: C.textDim, fontSize: 13 }}>Jasne warunki ułatwiają uczniowi podjęcie decyzji.</p></div></div>
              <div className="lesson-field-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label className="lesson-label" htmlFor="duration">Czas trwania</label>
                  <div style={{ position: 'relative' }}><Clock3 size={16} color={C.textFaint} style={{ position: 'absolute', top: 17, left: 14 }} /><input id="duration" type="number" min={15} max={240} step={15} inputMode="numeric" value={duration} onChange={event => { setDuration(event.target.value); setFieldError('duration') }} placeholder="60" className="lesson-control" style={{ ...controlStyle, paddingLeft: 40, paddingRight: 43, border: borderFor('duration') }} /><span style={{ position: 'absolute', top: 17, right: 13, color: C.textFaint, fontSize: 12 }}>min</span></div>
                  <QuickChoices values={DURATIONS} selected={duration} suffix=" min" onChoose={value => { setDuration(String(value)); setFieldError('duration') }} />
                  {errors.duration && <FieldError message={errors.duration} />}
                </div>
                <div>
                  <label className="lesson-label" htmlFor="price">Cena za lekcję</label>
                  <div style={{ position: 'relative' }}><Banknote size={16} color={C.textFaint} style={{ position: 'absolute', top: 17, left: 14 }} /><input id="price" type="number" min={1} step="0.01" inputMode="decimal" value={price} onChange={event => { setPrice(event.target.value); setFieldError('price') }} placeholder="80" className="lesson-control" style={{ ...controlStyle, paddingLeft: 40, paddingRight: 34, border: borderFor('price') }} /><span style={{ position: 'absolute', top: 17, right: 13, color: C.textFaint, fontSize: 12 }}>zł</span></div>
                  <QuickChoices values={PRICES} selected={price} suffix=" zł" onChoose={value => { setPrice(String(value)); setFieldError('price') }} />
                  {errors.price && <FieldError message={errors.price} />}
                </div>
              </div>
            </section>

            {submitError && <div role="alert" style={{ marginTop: 4, padding: '12px 14px', borderLeft: `3px solid ${C.coral}`, background: C.coral + '12', color: C.coral, fontSize: 13 }}>{submitError}</div>}
            <div className="lesson-action-row">
              <button type="button" className="lesson-cancel" onClick={() => navigate('/dashboard')}>Anuluj</button>
              <button type="submit" className="lesson-publish" disabled={loading}>{loading ? 'Publikowanie...' : <>Opublikuj ofertę <ArrowUpRight size={16} style={{ verticalAlign: '-3px', marginLeft: 5 }} /></>}</button>
            </div>
          </form>

          <aside className="lesson-preview" aria-label="Podgląd oferty">
            <div style={{ color: C.textFaint, font: '700 11px ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '.1em', textTransform: 'uppercase' }}>Podgląd / tak zobaczy to uczeń</div>
            <div className="lesson-preview-paper">
              <div style={{ color: C.amber, fontSize: 12, fontWeight: 750, textTransform: 'uppercase', letterSpacing: '.08em' }}>{subject || 'Twój przedmiot'}</div>
              <h2 style={{ marginTop: 12, color: subject ? C.text : C.textFaint, fontSize: 'clamp(25px, 3vw, 34px)', lineHeight: 1.03, letterSpacing: '-.05em', overflowWrap: 'anywhere' }}>{subject ? `Lekcje z ${subject}` : 'Lekcje z...'}</h2>
              <p style={{ minHeight: 90, marginTop: 18, color: description ? C.textDim : C.textFaint, fontSize: 13, lineHeight: 1.65, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{description || 'Twój opis pojawi się tutaj. Napisz kilka konkretnych zdań, żeby uczeń wiedział, czego się spodziewać.'}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, paddingTop: 17, borderTop: `1px solid ${C.border}`, color: C.textDim, fontSize: 13 }}><span><Clock3 size={14} style={{ verticalAlign: '-3px', marginRight: 5 }} />{duration ? `${duration} min` : '— min'}</span><span><Banknote size={14} style={{ verticalAlign: '-3px', marginRight: 5 }} />{price ? `${price} zł` : '— zł'}</span></div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', paddingTop: 15, color: C.textDim, fontSize: 12, lineHeight: 1.5 }}><Check size={15} color={C.green} style={{ flexShrink: 0, marginTop: 1 }} /> Oferta będzie dostępna dla uczniów po opublikowaniu.</div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function QuickChoices({ values, selected, suffix, onChoose }: { values: number[]; selected: string; suffix: string; onChoose: (value: number) => void }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>{values.map(value => <button key={value} type="button" className="lesson-chip" data-active={selected === String(value)} onClick={() => onChoose(value)}>{value}{suffix}</button>)}</div>
}

function FieldError({ message }: { message: string }) {
  return <div role="alert" style={{ marginTop: 7, color: C.coral, fontSize: 12 }}>{message}</div>
}
