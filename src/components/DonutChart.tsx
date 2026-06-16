import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatPercent } from '../utils/format'

type Slice = { ticker: string; name: string; value: number }

const COLORS = ['#4fb477', '#7e91a6', '#52627a', '#a98f63', '#d76767', '#9aa4b2']

export default function DonutChart({
  data,
  total = 0,
  holdingsCount = 0,
}: {
  data: Slice[]
  total?: number
  holdingsCount?: number
}) {
  return (
    <div className="donut-chart">
      <div className="donut-plot">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="ticker"
              innerRadius={66}
              outerRadius={94}
              paddingAngle={4}
              cornerRadius={8}
              stroke="rgba(13, 20, 32, 0.95)"
              strokeWidth={3}
            >
              {data.map((_, i) => (
                <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center-label">
          <span>Portfolio</span>
          <strong>{formatCurrency(total, { compact: true })}</strong>
          <em>{holdingsCount} Holdings</em>
        </div>
      </div>

      <div className="donut-legend">
        <div className="donut-label">Total</div>
        <div className="donut-total">{formatCurrency(total, { compact: true })}</div>
        <div className="donut-items">
          {data.map((d, i) => {
            const weight = total ? (d.value / total) * 100 : 0

            return (
              <div key={d.ticker} className="donut-item">
                <div className="donut-item-row">
                  <span className="donut-swatch" style={{ background: COLORS[i % COLORS.length] }} />
                  <div className="donut-name" title={d.name}>{d.ticker}</div>
                  <div className="donut-percent">{formatPercent(weight)}</div>
                </div>
                <div className="allocation-track"><i style={{ width: `${Math.min(weight, 100)}%`, background: COLORS[i % COLORS.length] }} /></div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
