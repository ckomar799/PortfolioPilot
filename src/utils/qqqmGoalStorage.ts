import type { QqqmGoalSettings } from '../types/qqqmGoal'

const STORAGE_KEY = 'portfolioPilot.qqqmGoal.v1'

export const defaultQqqmGoalSettings: QqqmGoalSettings = {
  targetAllocationPercent: 50,
}

function isQqqmGoalSettings(value: unknown): value is QqqmGoalSettings {
  if (!value || typeof value !== 'object') return false
  const settings = value as Partial<QqqmGoalSettings>

  return typeof settings.targetAllocationPercent === 'number'
}

export function loadQqqmGoalSettings(): QqqmGoalSettings {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultQqqmGoalSettings

    const parsed: unknown = JSON.parse(saved)
    return isQqqmGoalSettings(parsed) ? parsed : defaultQqqmGoalSettings
  } catch {
    return defaultQqqmGoalSettings
  }
}

export function saveQqqmGoalSettings(settings: QqqmGoalSettings) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export { STORAGE_KEY as QQQM_GOAL_STORAGE_KEY }
