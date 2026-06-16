import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Transaction, TransactionType } from '../types/transaction'
import { STOCK_TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS } from '../types/transaction'

type TransactionFormValues = {
  type: TransactionType
  ticker: string
  securityName: string
  account: string
  date: string
  shares: string
  price: string
  amount: string
  notes: string
}

type TransactionModalProps = {
  transaction?: Transaction
  onSave: (transaction: Transaction) => void
  onCancel: () => void
}

const TRANSACTION_TYPES: TransactionType[] = ['buy', 'sell', 'dividend', 'drip', 'deposit', 'withdrawal']

function today() {
  return new Date().toISOString().slice(0, 10)
}

function createTransactionId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID()
  return `tx-${Date.now()}-${Math.round(Math.random() * 100000)}`
}

function toNumber(value: string) {
  const trimmed = value.trim()
  return trimmed ? Number(trimmed) : undefined
}

function initialValues(transaction?: Transaction): TransactionFormValues {
  return {
    type: transaction?.type ?? 'buy',
    ticker: transaction?.ticker ?? '',
    securityName: transaction?.securityName ?? '',
    account: transaction?.account ?? '',
    date: transaction?.date ?? today(),
    shares: transaction?.shares?.toString() ?? '',
    price: transaction?.price?.toString() ?? '',
    amount: transaction?.amount?.toString() ?? '',
    notes: transaction?.notes ?? '',
  }
}

export default function TransactionModal({ transaction, onSave, onCancel }: TransactionModalProps) {
  const [values, setValues] = useState<TransactionFormValues>(initialValues(transaction))
  const [errors, setErrors] = useState<string[]>([])

  const shares = toNumber(values.shares)
  const price = toNumber(values.price)
  const amount = toNumber(values.amount)
  const requiresTicker = STOCK_TRANSACTION_TYPES.includes(values.type)
  const requiresSharesAndPrice = values.type === 'buy' || values.type === 'sell' || values.type === 'drip'
  const requiresAmount = values.type === 'dividend' || values.type === 'deposit' || values.type === 'withdrawal' || values.type === 'drip'

  function updateField(field: keyof TransactionFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function validate() {
    const nextErrors: string[] = []

    if (!values.type) nextErrors.push('Transaction type is required.')
    if (!values.date) nextErrors.push('Date is required.')
    if (requiresTicker && !values.ticker.trim()) nextErrors.push('Ticker is required for security transactions.')
    if (requiresSharesAndPrice && (!shares || shares <= 0)) nextErrors.push('Shares are required for Buy, Sell, and DRIP transactions.')
    if (requiresSharesAndPrice && (!price || price <= 0)) nextErrors.push('Price is required for Buy, Sell, and DRIP transactions.')
    if (requiresAmount && (!amount || amount <= 0)) nextErrors.push('Amount is required for Dividend, DRIP, Deposit, and Withdrawal transactions.')

    setErrors(nextErrors)
    return nextErrors.length === 0
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return

    const derivedAmount = amount ?? (shares && price ? shares * price : undefined)

    onSave({
      id: transaction?.id ?? createTransactionId(),
      type: values.type,
      ticker: values.ticker.trim().toUpperCase() || undefined,
      securityName: values.securityName.trim() || undefined,
      account: values.account.trim() || undefined,
      date: values.date,
      shares,
      price,
      amount: derivedAmount,
      notes: values.notes.trim() || undefined,
    })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <div className="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="transaction-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div>
              <div className="eyebrow">Transaction Engine</div>
              <h2 id="transaction-modal-title">{transaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
            </div>
            <button className="modal-close" type="button" onClick={onCancel} aria-label="Close transaction modal">x</button>
          </div>

          {errors.length > 0 && (
            <div className="form-errors" role="alert">
              {errors.map((error) => (
                <div key={error}>{error}</div>
              ))}
            </div>
          )}

          <div className="transaction-form-grid">
            <label>
              <span>Type</span>
              <select value={values.type} onChange={(event) => updateField('type', event.target.value as TransactionType)}>
                {TRANSACTION_TYPES.map((type) => (
                  <option key={type} value={type}>{TRANSACTION_TYPE_LABELS[type]}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Date</span>
              <input type="date" value={values.date} onChange={(event) => updateField('date', event.target.value)} />
            </label>

            <label>
              <span>Ticker</span>
              <input value={values.ticker} onChange={(event) => updateField('ticker', event.target.value)} placeholder="AAPL" />
            </label>

            <label>
              <span>Security Name</span>
              <input value={values.securityName} onChange={(event) => updateField('securityName', event.target.value)} placeholder="Apple Inc." />
            </label>

            <label>
              <span>Account</span>
              <input value={values.account} onChange={(event) => updateField('account', event.target.value)} placeholder="Taxable Brokerage" />
            </label>

            <label>
              <span>Shares</span>
              <input type="number" min="0" step="any" value={values.shares} onChange={(event) => updateField('shares', event.target.value)} />
            </label>

            <label>
              <span>Price</span>
              <input type="number" min="0" step="any" value={values.price} onChange={(event) => updateField('price', event.target.value)} />
            </label>

            <label>
              <span>Amount</span>
              <input type="number" min="0" step="any" value={values.amount} onChange={(event) => updateField('amount', event.target.value)} />
            </label>
          </div>

          <label className="notes-field">
            <span>Notes</span>
            <textarea value={values.notes} onChange={(event) => updateField('notes', event.target.value)} rows={3} />
          </label>

          <div className="modal-actions">
            <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>
            <button className="btn primary" type="submit">Save Transaction</button>
          </div>
        </form>
      </div>
    </div>
  )
}
