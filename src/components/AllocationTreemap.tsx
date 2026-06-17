import { useMemo } from 'react'
import { formatCurrency, formatPercent } from '../utils/format'

type AllocationSlice = { ticker: string; name: string; value: number }
type ConcentrationItem = { label: string; value: number }

const TILE_COLORS: Record<string, string> = {
  AMZN: '#4fb477',
  MSFT: '#4b6278',
  GOOG: '#263545',
  AAPL: '#9a8656',
  AVGO: '#9a5f58',
  V: '#6f7884',
  NFLX: '#3f5f7a',
  SPGI: '#9a7356',
  COST: '#6f826f',
  MA: '#8b724d',
}
const FALLBACK_COLORS = ['#33475a', '#2a3d50', '#3b4f62', '#283a4c']
const VISIBLE_HOLDINGS = 10

export default function AllocationTreemap({
  data,
  total = 0,
  concentration = [],
}: {
  data: AllocationSlice[]
  total?: number
  concentration?: ConcentrationItem[]
}) {
  const tiles = useMemo(() => {
    const sorted = data.slice().sort((a, b) => b.value - a.value)
    const visible = sorted.slice(0, VISIBLE_HOLDINGS)
    const remainingValue = sorted.slice(VISIBLE_HOLDINGS).reduce((sum, item) => sum + item.value, 0)

    return remainingValue > 0
      ? [...visible, { ticker: 'OTHER', name: 'Other holdings', value: remainingValue }]
      : visible
  }, [data])

  return (
    <div className="allocation-treemap">
      <div className="allocation-map" aria-label="Portfolio allocation treemap">
        {tiles.map((tile, index) => {
          const weight = total ? (tile.value / total) * 100 : 0
          const isOther = tile.ticker === 'OTHER'

          return (
            <div
              className={isOther ? 'allocation-tile allocation-tile-other' : 'allocation-tile'}
              key={tile.ticker}
              style={{
                background: isOther ? undefined : TILE_COLORS[tile.ticker] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
                flexGrow: Math.max(tile.value, 1),
                flexBasis: `${Math.max(weight * 2.4, 16)}%`,
                animationDelay: `${Math.min(index * 22, 180)}ms`,
              }}
              title={`${tile.name}: ${formatCurrency(tile.value, { compact: true })} (${formatPercent(weight)})`}
            >
              <strong>{tile.ticker}</strong>
              <span>{formatCurrency(tile.value, { compact: true })}</span>
              <em>{formatPercent(weight)}</em>
            </div>
          )
        })}
      </div>
      {concentration.length > 0 && (
        <div className="allocation-concentration">
          <div className="allocation-concentration-title">Portfolio Concentration</div>
          {concentration.map((item) => (
            <div key={item.label}>
              <div className="allocation-concentration-row">
                <span>{item.label}</span>
                <strong>{formatPercent(item.value)}</strong>
              </div>
              <i style={{ width: `${Math.min(item.value, 100)}%` }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
