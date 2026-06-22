import type { HysaSettings } from '../types/hysa'

const STORAGE_KEY = 'portfolioPilot.hysaSettings.v1'

export const defaultHysaSettings: HysaSettings = {
  balance: 0,
  apy: 0,
}

function isHysaSettings(value: unknown): value is HysaSettings {
  if (!value || typeof value !== 'object') return false
  const settings = value as Partial<HysaSettings>

  return typeof settings.balance === 'number' && typeof settings.apy === 'number'
}

export function loadHysaSettings(): HysaSettings {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultHysaSettings

    const parsed: unknown = JSON.parse(saved)
    return isHysaSettings(parsed) ? parsed : defaultHysaSettings
  } catch {
    return defaultHysaSettings
  }
}

export function saveHysaSettings(settings: HysaSettings) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export { STORAGE_KEY as HYSA_STORAGE_KEY }
