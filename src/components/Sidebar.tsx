import type { View } from '../types/navigation'

type Props = {
  active: View
  onChange: (view: View) => void
}

const items: { key: View; label: string }[] = [
  { key: 'Dashboard', label: 'Dashboard' },
  { key: 'Transactions', label: 'Transactions' },
  { key: 'Holdings', label: 'Holdings' },
  { key: 'Dividends', label: 'Dividends' },
  { key: 'Tools', label: 'Tools' },
]

export default function Sidebar({ active, onChange }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>PortfolioPilot</h2>
        <span>Private wealth dashboard</span>
      </div>

      <nav className="sidebar-nav">
        {items.map((it) => (
          <button
            key={it.key}
            className={`nav-item ${active === it.key ? 'active' : ''}`}
            onClick={() => onChange(it.key)}
          >
            <span className="nav-label">{it.label}</span>
          </button>
        ))}
      </nav>

      <div className="market-status-card">
        <div className="status-row">
          <span className="status-dot" />
          <span>Markets Open</span>
        </div>
        <div className="status-meta">
          <span>NYSE</span>
          <strong>4h 12m left</strong>
        </div>
        <div className="status-index-row">
          <span>S&P 500</span>
          <strong>+0.42%</strong>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">KC</div>
          <div className="profile-copy">
            <strong>Kevin Charles</strong>
            <span>Premium workspace</span>
          </div>
        </div>
        <div className="sidebar-version">v1 - mock data - local</div>
      </div>
    </aside>
  )
}
