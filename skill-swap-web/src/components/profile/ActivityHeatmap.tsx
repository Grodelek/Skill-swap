import { C } from '../../constants/theme'
import { Offer } from '../../api/offerApi'

function buildActivityMap(offers: Offer[]): Record<string, number> {
  const map: Record<string, number> = {}
  offers.forEach(o => {
    if (o.sessionStartTime) {
      const day = o.sessionStartTime.slice(0, 10)
      map[day] = (map[day] ?? 0) + 1
    }
  })
  return map
}

function getLast16Weeks(): string[][] {
  const weeks: string[][] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(today.getDate() - 16 * 7 + 1)
  const cur = new Date(start)
  while (cur <= today) {
    const week: string[] = []
    for (let d = 0; d < 7; d++) {
      week.push(cur.toISOString().slice(0, 10))
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

function cellColor(count: number) {
  if (count === 0) return C.surfaceUp
  if (count === 1) return C.purple + '66'
  if (count === 2) return C.purple + 'AA'
  return C.purple
}

interface ActivityHeatmapProps {
  offers: Offer[]
}

export function ActivityHeatmap({ offers }: ActivityHeatmapProps) {
  const actMap = buildActivityMap(offers)
  const weeks = getLast16Weeks()
  const totalSessions = offers.filter(o => o.completed).length
  const activeDays = Object.keys(actMap).length
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div style={{ background: C.surface, borderRadius: 16, padding: '18px 20px', border: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textFaint, textTransform: 'uppercase', letterSpacing: 1 }}>
          Aktywność lekcji
        </div>
        <div style={{ fontSize: 12, color: C.textDim }}>
          {totalSessions} ukończonych · {activeDays} aktywnych dni
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 3, minWidth: 'min-content' }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {week.map(day => {
                const count = actMap[day] ?? 0
                return (
                  <div
                    key={day}
                    title={`${day}: ${count} lekcj${count === 1 ? 'a' : count < 5 ? 'e' : 'i'}`}
                    style={{
                      width: 13, height: 13, borderRadius: 3,
                      background: cellColor(count),
                      border: day === today ? `1.5px solid ${C.amber}` : 'none',
                      flexShrink: 0,
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 10, color: C.textFaint }}>Mniej</span>
        {[0, 1, 2, 3].map(v => (
          <div key={v} style={{ width: 11, height: 11, borderRadius: 2, background: cellColor(v) }} />
        ))}
        <span style={{ fontSize: 10, color: C.textFaint }}>Więcej</span>
      </div>
    </div>
  )
}
