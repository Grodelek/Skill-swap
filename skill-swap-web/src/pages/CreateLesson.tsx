import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { C } from '../constants/theme'
import { createLesson } from '../api/lessonApi'

const SUBJECTS = [
  'Polski', 'Matematyka', 'J.Angielski', 'J.Rosyjski', 'J.Niemiecki', 'J.Francuski',
  'Fizyka', 'Chemia', 'Biologia', 'Historia', 'Informatyka', 'Geografia',
]

export function CreateLesson() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [price, setPrice] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [subjectQuery, setSubjectQuery] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const filtered = SUBJECTS.filter(s => s.toLowerCase().includes(subjectQuery.toLowerCase()))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject) { setError('Wybierz przedmiot'); return }
    if (!description.trim()) { setError('Dodaj opis lekcji'); return }
    if (!duration || Number(duration) <= 0) { setError('Podaj czas trwania'); return }
    if (!price || Number(price) <= 0) { setError('Podaj cene'); return }

    setError('')
    setLoading(true)
    try {
      await createLesson({
        subject,
        description: description.trim(),
        durationTime: Number(duration),
        price: Number(price),
      })
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Blad tworzenia lekcji')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px 14px', flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>Nowa lekcja</h1>
        <p style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>Dodaj ogloszenie dla uczniow</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ maxWidth: 520 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Subject dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: C.textDim }}>Przedmiot</label>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setShowDropdown(d => !d)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: 12,
                    border: `1.5px solid ${showDropdown ? C.amber : C.border}`,
                    background: C.bgDeep, color: subject ? C.text : C.textFaint,
                    cursor: 'pointer', fontSize: 15,
                  }}
                >
                  {subject || 'Wybierz przedmiot'}
                  <ChevronDown size={16} color={C.textDim} style={{ transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>

                {showDropdown && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    background: C.surfaceUp, border: `1.5px solid ${C.border}`,
                    borderRadius: 12, marginTop: 4, overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}>
                    <div style={{ padding: '8px 10px', borderBottom: `1px solid ${C.border}` }}>
                      <input
                        autoFocus
                        placeholder="Szukaj..."
                        value={subjectQuery}
                        onChange={e => setSubjectQuery(e.target.value)}
                        style={{
                          width: '100%', padding: '8px 10px', borderRadius: 8,
                          border: `1px solid ${C.border}`, background: C.bgDeep,
                          color: C.text, fontSize: 14, outline: 'none', fontFamily: 'inherit',
                        }}
                      />
                    </div>
                    <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                      {filtered.map(s => (
                        <div
                          key={s}
                          onClick={() => { setSubject(s); setShowDropdown(false); setSubjectQuery('') }}
                          style={{
                            padding: '11px 14px', cursor: 'pointer', fontSize: 14,
                            color: s === subject ? C.amber : C.text,
                            fontWeight: s === subject ? 700 : 400,
                            background: s === subject ? C.amber + '11' : 'transparent',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = C.surface)}
                          onMouseLeave={e => (e.currentTarget.style.background = s === subject ? C.amber + '11' : 'transparent')}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: C.textDim }}>Opis lekcji</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Opisz poziom, zakres i czego moze spodziewac sie uczen."
                rows={4}
                style={{
                  padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`,
                  background: C.bgDeep, color: C.text, fontSize: 14, outline: 'none',
                  fontFamily: 'inherit', lineHeight: 1.55, resize: 'vertical',
                }}
              />
            </div>

            {/* Duration + Price */}
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: C.textDim }}>Czas trwania</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min={15}
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    placeholder="60"
                    style={{
                      width: '100%', padding: '12px 48px 12px 14px', borderRadius: 12,
                      border: `1.5px solid ${C.border}`, background: C.bgDeep,
                      color: C.text, fontSize: 15, outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: C.textFaint }}>
                    min
                  </span>
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: C.textDim }}>Cena</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="50"
                    style={{
                      width: '100%', padding: '12px 48px 12px 14px', borderRadius: 12,
                      border: `1.5px solid ${C.border}`, background: C.bgDeep,
                      color: C.text, fontSize: 15, outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: C.textFaint }}>
                    zl
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: C.coral + '22', color: C.coral, fontSize: 14 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  flex: 1, padding: '13px', borderRadius: 14, border: `1.5px solid ${C.border}`,
                  background: 'transparent', color: C.textDim, fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 2, padding: '13px', borderRadius: 14, border: 'none',
                  background: loading ? C.surfaceUp : C.amber,
                  color: loading ? C.textDim : '#1A0A00',
                  fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', borderBottom: `4px solid ${C.amberDark}`,
                }}
              >
                {loading ? 'Dodawanie...' : 'Dodaj lekcje'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
