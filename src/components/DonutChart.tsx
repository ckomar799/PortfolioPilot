import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../utils/format'

type Slice = { name: string; value: number }

const COLORS = ['#4fb477', '#7e91a6', '#52627a', '#a98f63', '#d76767', '#9aa4b2']

export default function DonutChart({ data, total }: { data: Slice[]; total?: number }) {
  return (
    <div className="donut-chart">
      <div className="donut-plot">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={52}
              outerRadius={74}
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
      </div>

      <div className="donut-legend">
        <div className="donut-label">Total</div>
        <div className="donut-total">{formatCurrency(total ?? 0, { compact: true })}</div>
        <div className="donut-items">
          {data.map((d, i) => (
            <div key={d.name} className="donut-item">
              <span className="donut-swatch" style={{ background: COLORS[i % COLORS.length] }} />
              <div className="donut-name">{d.name}</div>
              <div className="donut-percent">{((d.value / (total || 1)) * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
