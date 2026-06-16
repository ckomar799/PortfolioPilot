import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../utils/format'

export default function DividendProjection({ current, years = 10 }: { current: number; years?: number }) {
  const data = Array.from({ length: years }, (_, i) => {
    const year = i + 1
    // simple compounding: assume 5% growth + contributions ignored
    return { year: `${year}y`, value: Math.round(current * Math.pow(1.05, year)) }
  })

  return (
    <div className="dividend-projection-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 0, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="dividendBars" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6a7b90" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#4fb477" stopOpacity={0.72} />
            </linearGradient>
          </defs>
          <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-soft)' }} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: 'rgba(10, 17, 29, 0.96)', border: '1px solid rgba(148, 163, 184, 0.24)', borderRadius: 8 }}
            labelStyle={{ color: 'var(--text-h)' }}
            formatter={(value) => [formatCurrency(Number(value), { compact: true }), 'Dividends']}
          />
          <Bar dataKey="value" fill="url(#dividendBars)" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
