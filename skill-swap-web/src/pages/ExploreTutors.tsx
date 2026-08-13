import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, ChevronLeft, SlidersHorizontal, X } from 'lucide-react'
import { C } from '../constants/theme'
import { fetchTutors, TutorCard } from '../api/tutorDiscoveryApi'
import { addFavoriteTutor } from '../api/favoriteApi'
import { sendMessageToTutor } from '../api/lessonApi'
import { Spinner } from '../components/ui/Spinner'
import { Wispa } from '../components/Wispa'
import { CategoryGrid, Category, CATEGORIES } from '../components/marketplace/CategoryGrid'
import { TutorListCard } from '../components/marketplace/TutorListCard'

export function ExploreTutors() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [activeCat, setActiveCat] = useState<Category | null>(() => CATEGORIES.find(cat => cat.id === params.get('category')) ?? null)
  const [search, setSearch] = useState(params.get('q') ?? '')
  const [cards, setCards] = useState<TutorCard[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(params.get('filters') === '1')
  const [priceMax, setPriceMax] = useState(params.get('maxPrice') ?? '')
  const seenIds = useRef(new Set<string>())
  const categoryCache = useRef(new Map<string, TutorCard[]>())
  const requestVersion = useRef(0)

  const syncUrl = useCallback((category: Category | null, query: string, maxPrice: string, filters: boolean) => {
    const next = new URLSearchParams()
    if (category) next.set('category', category.id)
    if (query) next.set('q', query)
    if (maxPrice) next.set('maxPrice', maxPrice)
    if (filters) next.set('filters', '1')
    setParams(next, { replace: true })
  }, [setParams])

  const loadTutors = useCallback(async (subject?: string) => {
    const cacheKey = subject ?? '__all__'
    const currentRequest = ++requestVersion.current
    const cached = categoryCache.current.get(cacheKey)
    if (cached) {
      setCards(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    seenIds.current.clear()
    try {
      const results = await fetchTutors(subject ? { subject } : {})
      const fresh = (results ?? []).filter(card => !seenIds.current.has(card.tutorId))
      fresh.forEach(card => seenIds.current.add(card.tutorId))
      categoryCache.current.set(cacheKey, fresh)
      if (currentRequest === requestVersion.current) setCards(fresh)
    } catch {
      if (currentRequest === requestVersion.current) setCards([])
    } finally {
      if (currentRequest === requestVersion.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeCat) loadTutors(activeCat.subject)
  }, [activeCat, loadTutors])

  const selectCategory = (category: Category) => {
    setActiveCat(category)
    setSearch('')
    setPriceMax('')
    syncUrl(category, '', '', showFilters)
  }

  const clearCategory = () => {
    setActiveCat(null)
    setCards([])
    setSearch('')
    setPriceMax('')
    syncUrl(null, '', '', false)
  }

  const handleConnect = useCallback(async (card: TutorCard) => {
    try {
      const conv = await sendMessageToTutor(card.tutorId)
      navigate(`/conversations/${conv.id}`, { state: { receiverId: card.tutorId, tutorName: card.tutorUsername } })
    } catch { /* The conversation screen handles auth/network recovery. */ }
  }, [navigate])

  const handleFavorite = useCallback(async (card: TutorCard) => {
    try { await addFavoriteTutor(card.tutorId) } catch { /* The card keeps its local state responsive. */ }
  }, [])

  const filtered = cards.filter(card => {
    const q = search.toLowerCase()
    const matchSearch = !q || card.tutorUsername?.toLowerCase().includes(q) || card.subject?.toLowerCase().includes(q)
    const matchPrice = !priceMax || (card.price != null && card.price <= Number(priceMax))
    return matchSearch && matchPrice
  })

  const updateSearch = (value: string) => {
    setSearch(value)
    syncUrl(activeCat, value, priceMax, showFilters)
  }

  const updatePrice = (value: string) => {
    setPriceMax(value)
    syncUrl(activeCat, search, value, showFilters)
  }

  const toggleFilters = () => {
    const next = !showFilters
    setShowFilters(next)
    syncUrl(activeCat, search, priceMax, next)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', flexShrink: 0, borderBottom: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {activeCat && (
            <button type="button" onClick={clearCategory} aria-label="Wróć do kategorii" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, padding: 10, display: 'flex', touchAction: 'manipulation' }}>
              <ChevronLeft size={20} />
            </button>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>
              {activeCat ? activeCat.label : 'Marketplace'}
            </h1>
            {activeCat && <p aria-live="polite" style={{ fontSize: 12, color: C.textDim, marginTop: 1 }}>{loading ? 'Ładowanie…' : `${filtered.length} korepetytorów`}</p>}
          </div>
          {activeCat && (
            <button type="button" onClick={toggleFilters} aria-expanded={showFilters} className="explore-filter-trigger" style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 44, padding: '7px 13px', borderRadius: 10, border: `1.5px solid ${showFilters ? C.amber : C.border}`, background: showFilters ? C.amber + '18' : 'transparent', color: showFilters ? C.amber : C.textDim, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', touchAction: 'manipulation' }}>
              <SlidersHorizontal size={14} /> Filtry
            </button>
          )}
        </div>

        {activeCat && (
          <div style={{ position: 'relative' }}>
            <label htmlFor="tutor-search" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>Szukaj korepetytora</label>
            <Search size={15} color={C.textFaint} aria-hidden="true" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input id="tutor-search" name="tutor-search" type="search" autoComplete="off" value={search} onChange={event => updateSearch(event.target.value)} placeholder="Szukaj korepetytora…" style={{ width: '100%', minHeight: 44, padding: '10px 42px 10px 36px', boxSizing: 'border-box', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.bgDeep, color: C.text, fontSize: 16, outline: 'none', fontFamily: 'inherit' }} />
            {search && <button type="button" onClick={() => updateSearch('')} aria-label="Wyczyść wyszukiwanie" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, display: 'grid', placeItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, touchAction: 'manipulation' }}><X size={16} /></button>}
          </div>
        )}

        {showFilters && activeCat && (
          <div style={{ background: C.bgDeep, borderRadius: 12, padding: 14, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <label htmlFor="price-max" style={{ fontSize: 13, fontWeight: 700, color: C.textDim, flexShrink: 0 }}>Max cena</label>
            <input id="price-max" name="max-price" type="number" inputMode="numeric" min="0" value={priceMax} onChange={event => updatePrice(event.target.value)} placeholder="zł/h…" style={{ flex: 1, minHeight: 44, padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 16, outline: 'none', fontFamily: 'inherit' }} />
            {priceMax && <button type="button" onClick={() => updatePrice('')} aria-label="Wyczyść maksymalną cenę" style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, touchAction: 'manipulation' }}><X size={16} /></button>}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', overscrollBehavior: 'contain' }}>
        {!activeCat ? (
          <>
            <p style={{ fontSize: 14, color: C.textDim, marginBottom: 20 }}>Wybierz kategorię, aby zobaczyć dostępnych korepetytorów.</p>
            <CategoryGrid onSelect={selectCategory} />
          </>
        ) : loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingTop: 40 }}>
            <Wispa size={72} />
            <div style={{ fontWeight: 800, fontSize: 18, color: C.text }}>Brak korepetytorów</div>
            <div style={{ fontSize: 13, color: C.textDim, textAlign: 'center', maxWidth: 260 }}>Spróbuj zmienić filtry lub kategorię.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
            {filtered.map(card => <TutorListCard key={card.tutorId} card={card} onConnect={handleConnect} onFavorite={handleFavorite} />)}
          </div>
        )}
      </div>
    </div>
  )
}
