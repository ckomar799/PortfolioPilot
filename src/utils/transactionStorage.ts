import { mockTransactions } from '../data/transactions'
import type { Transaction } from '../types/transaction'

const STORAGE_KEY = 'portfolioPilot.transactions.v1'

function isTransactionArray(value: unknown): value is Transaction[] {
  if (!Array.isArray(value)) return false

  return value.every((item) => {
    if (!item || typeof item !== 'object') return false
    const transaction = item as Partial<Transaction>

    return typeof transaction.id === 'string' && typeof transaction.type === 'string' && typeof transaction.date === 'string'
  })
}

export function loadTransactions(): Transaction[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return mockTransactions

    const parsed: unknown = JSON.parse(saved)
    return isTransactionArray(parsed) && parsed.length > 0 ? parsed : mockTransactions
  } catch {
    return mockTransactions
  }
}

export function saveTransactions(transactions: Transaction[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
}

export { STORAGE_KEY as TRANSACTION_STORAGE_KEY }
