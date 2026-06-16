type Props = {
  title: string
  value: string
  sub?: string
  positive?: boolean
}

export default function MetricCard({ title, value, sub, positive }: Props) {
  return (
    <div className="metric-card">
      <div className="metric-card-top">
        <div className="metric-title">{title}</div>
      </div>
      <div className={`metric-value ${positive ? 'positive' : ''}`}>{value}</div>
      <div className="metric-sub">{sub ?? 'Today'}</div>
    </div>
  )
}
