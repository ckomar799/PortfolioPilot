import { useState } from 'react'
import type { FormEvent } from 'react'
import type { HysaSettings } from '../types/hysa'
import { calculateHysaIncome } from '../utils/hysa'
import { formatCurrency } from '../utils/format'

type HysaModalProps = {
  settings: HysaSettings
  onSave: (settings: HysaSettings) => void
  onCancel: () => void
}

function toNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function HysaModal({ settings, onSave, onCancel }: HysaModalProps) {
  const [balance, setBalance] = useState(settings.balance.toString())
  const [apy, setApy] = useState(settings.apy.toString())
  const [error, setError] = useState('')
  const preview = calculateHysaIncome({
    balance: toNumber(balance),
    apy: toNumber(apy),
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!balance.trim() || !apy.trim()) {
      setError('Balance and APY are required.')
      return
    }

    onSave({
      balance: toNumber(balance),
      apy: toNumber(apy),
    })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <div className="cash-modal" role="dialog" aria-modal="true" aria-labelledby="hysa-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <form className="cash-modal-form" onSubmit={handleSubmit}>
          <div className="modal-header">
            <div>
              <div className="eyebrow">Manual Cash Input</div>
              <h2 id="hysa-modal-title">Update HYSA</h2>
              <p className="modal-subtitle">Update the local HYSA balance and APY used in dashboard income projections.</p>
            </div>
            <button className="modal-close" type="button" onClick={onCancel} aria-label="Close HYSA modal">x</button>
          </div>

          {error && <div className="form-errors" role="alert">{error}</div>}

          <div className="cash-form-grid">
            <label>
              <span>HYSA balance</span>
              <div className="money-input-shell">
                <em>$</em>
                <input type="text" inputMode="decimal" value={balance} onChange={(event) => { setError(''); setBalance(event.target.value) }} />
              </div>
            </label>
            <label>
              <span>APY</span>
              <div className="money-input-shell percent-input-shell">
                <input type="text" inputMode="decimal" value={apy} onChange={(event) => { setError(''); setApy(event.target.value) }} />
                <em>%</em>
              </div>
            </label>
          </div>

          <section className="interest-preview-card" aria-label="Estimated HYSA interest preview">
            <div className="mini-section-heading">
              <span>Interest preview</span>
              <strong>Estimated</strong>
            </div>
            <div className="interest-preview-grid">
              <div>
                <span>Annual</span>
                <strong>{formatCurrency(preview.annualInterest)}</strong>
              </div>
              <div>
                <span>Monthly</span>
                <strong>{formatCurrency(preview.monthlyInterest)}</strong>
              </div>
              <div>
                <span>Daily</span>
                <strong>{formatCurrency(preview.dailyInterest)}</strong>
              </div>
            </div>
          </section>

          <div className="modal-actions">
            <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>
            <button className="btn primary" type="submit">Save HYSA</button>
          </div>
        </form>
      </div>
    </div>
  )
}
