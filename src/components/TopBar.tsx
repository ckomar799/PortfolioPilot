export default function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-context">
          <span>Local CSV workspace</span>
          <strong>Import Fidelity positions to refresh current holdings</strong>
        </div>
      </div>

      <div className="topbar-right">
        <div className="sync-pill">No backend · localStorage only</div>
      </div>
    </div>
  )
}
