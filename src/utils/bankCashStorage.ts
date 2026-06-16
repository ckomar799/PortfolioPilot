import type { BankCashSettings } from '../types/bankCash'

const STORAGE_KEY = 'portfolioPilot.bankCash.v1'

export const defaultBankCashSettings: BankCashSettings = {
  balance: 0,
  notes: '',
}

function isBankCashSettings(value: unknown): value is BankCashSettings {
  if (!value || typeof value !== 'object') return false
  const settings = value as Partial<BankCashSettings>

  return typeof settings.balance === 'number' && (settings.notes === undefined || typeof settings.notes === 'string')
}

export function loadBankCashSettings(): BankCashSettings {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultBankCashSettings

    const parsed: unknown = JSON.parse(saved)
    return isBankCashSettings(parsed) ? parsed : defaultBankCashSettings
  } catch {
    return defaultBankCashSettings
  }
}

export function saveBankCashSettings(settings: BankCashSettings) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export { STORAGE_KEY as BANK_CASH_STORAGE_KEY }
