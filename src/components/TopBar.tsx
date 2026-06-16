type Props = {
  onSearch?: (q: string) => void
}

export default function TopBar({ onSearch }: Props) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <label className="account-selector" aria-label="Selected account">
          <span>Account</span>
          <select defaultValue="core">
            <option value="core">Core Portfolio</option>
            <option value="retirement">Retirement</option>
            <option value="income">Income</option>
          </select>
        </label>

        <input
          className="search-input"
          placeholder="Search stocks, ETFs..."
          aria-label="Search"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>

      <div className="topbar-right">
        <div className="sync-pill">Updated 2 min ago</div>
        <button className="icon-btn" aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 17H9a3 3 0 0 0 6 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button className="icon-btn" aria-label="Settings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 3.28 16.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09c.7 0 1.29-.41 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.7 3.28l.06.06c.5.5 1.2.73 1.82.33.5-.34 1.1-.5 1.7-.5H12c.6 0 1.2.17 1.7.5.62.4 1.32.17 1.82-.33l.06-.06A2 2 0 1 1 20.72 7.1l-.06.06a1.65 1.65 0 0 0-.33 1.82c.22.59.81 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.7 0-1.29.41-1.51 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
