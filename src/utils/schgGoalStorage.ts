import type { SchgGoalSettings } from '../types/schgGoal'

const STORAGE_KEY = 'portfolioPilot.schgGoal.v1'

export const defaultSchgGoalSettings: SchgGoalSettings = {
  targetAllocationPercent: 50,
}

function isSchgGoalSettings(value: unknown): value is SchgGoalSettings {
  if (!value || typeof value !== 'object') return false
  const settings = value as Partial<SchgGoalSettings>

  return typeof settings.targetAllocationPercent === 'number'
}

export function loadSchgGoalSettings(): SchgGoalSettings {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultSchgGoalSettings

    const parsed: unknown = JSON.parse(saved)
    return isSchgGoalSettings(parsed) ? parsed : defaultSchgGoalSettings
  } catch {
    return defaultSchgGoalSettings
  }
}

export function saveSchgGoalSettings(settings: SchgGoalSettings) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export { STORAGE_KEY as SCHG_GOAL_STORAGE_KEY }
