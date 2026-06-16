import type { PositionsSnapshot } from '../types/position'

const STORAGE_KEY = 'portfolioPilot.positionsSnapshot.v1'

function isPositionSnapshot(value: unknown): value is PositionsSnapshot {
  if (!value || typeof value !== 'object') return false
  const snapshot = value as Partial<PositionsSnapshot>

  return snapshot.source === 'fidelity-positions-csv' && typeof snapshot.importedAt === 'string' && Array.isArray(snapshot.positions)
}

export function loadPositionsSnapshot(): PositionsSnapshot | undefined {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return undefined

    const parsed: unknown = JSON.parse(saved)
    return isPositionSnapshot(parsed) && parsed.positions.length > 0 ? parsed : undefined
  } catch {
    return undefined
  }
}

export function savePositionsSnapshot(snapshot?: PositionsSnapshot) {
  if (!snapshot) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
}

export { STORAGE_KEY as POSITIONS_SNAPSHOT_STORAGE_KEY }
