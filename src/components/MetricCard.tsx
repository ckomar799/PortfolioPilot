type Props = {
  title: string
  value: string
  sub?: string
  trend?: string
  positive?: boolean
}

export default function MetricCard({ title, value, sub, trend, positive }: Props) {
  return (
    <div className="metric-card">
      <div className="metric-card-top">
        <div className="metric-title">{title}</div>
        {trend && <div className={`metric-trend ${positive ? 'positive' : 'neutral'}`}>{trend}</div>}
      </div>
      <div className={`metric-value ${positive ? 'positive' : ''}`}>{value}</div>
      <div className="metric-sub">{sub ?? 'Today'}</div>
    </div>
  )
}
