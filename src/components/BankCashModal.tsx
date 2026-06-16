import { useState } from 'react'
import type { FormEvent } from 'react'
import type { BankCashSettings } from '../types/bankCash'

type BankCashModalProps = {
  settings: BankCashSettings
  onSave: (settings: BankCashSettings) => void
  onCancel: () => void
}

function toNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function BankCashModal({ settings, onSave, onCancel }: BankCashModalProps) {
  const [balance, setBalance] = useState(settings.balance.toString())
  const [notes, setNotes] = useState(settings.notes ?? '')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!balance.trim()) {
      setError('Cash balance is required.')
      return
    }

    onSave({
      balance: toNumber(balance),
      notes: notes.trim() || undefined,
    })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <div className="cash-modal" role="dialog" aria-modal="true" aria-labelledby="bank-cash-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div>
              <div className="eyebrow">Manual Cash Input</div>
              <h2 id="bank-cash-modal-title">Update Checking / Bank Cash</h2>
            </div>
            <button className="modal-close" type="button" onClick={onCancel} aria-label="Close bank cash modal">x</button>
          </div>

          {error && <div className="form-errors" role="alert">{error}</div>}

          <div className="cash-form-grid single">
            <label>
              <span>Cash balance</span>
              <input type="number" min="0" step="any" value={balance} onChange={(event) => setBalance(event.target.value)} />
            </label>
          </div>

          <label className="notes-field">
            <span>Notes</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
          </label>

          <div className="modal-actions">
            <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>
            <button className="btn primary" type="submit">Save Bank Cash</button>
          </div>
        </form>
      </div>
    </div>
  )
}
