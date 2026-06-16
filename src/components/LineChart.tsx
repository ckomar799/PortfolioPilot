import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../utils/format'

export default function LineChart({ data }: { data: { date: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={258}>
      <AreaChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="portfolioLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8fa0b4" />
            <stop offset="100%" stopColor="#4fb477" />
          </linearGradient>
          <linearGradient id="portfolioArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8fa0b4" stopOpacity={0.16} />
            <stop offset="70%" stopColor="#8fa0b4" stopOpacity={0.035} />
            <stop offset="100%" stopColor="#8fa0b4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(149, 160, 174, 0.11)" vertical={false} strokeDasharray="3 8" />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: 'var(--text-soft)' }}
          minTickGap={20}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: 'var(--text-soft)' }}
          tickFormatter={(value) => formatCurrency(Number(value), { compact: true })}
          width={58}
          domain={['dataMin - 500', 'dataMax + 500']}
        />
        <Tooltip
          contentStyle={{ background: 'rgba(10, 17, 29, 0.96)', border: '1px solid rgba(148, 163, 184, 0.24)', borderRadius: 8 }}
          labelStyle={{ color: 'var(--text-h)' }}
          formatter={(value) => [formatCurrency(Number(value), { compact: true }), 'Value']}
        />
        <Area
          type="natural"
          dataKey="value"
          stroke="url(#portfolioLine)"
          strokeWidth={2.8}
          fill="url(#portfolioArea)"
          dot={false}
          activeDot={{ r: 4, fill: '#4fb477', stroke: '#0a0f17', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
