import { useState } from 'react'
import type { FormEvent } from 'react'
import type { HysaSettings } from '../types/hysa'

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
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div>
              <div className="eyebrow">Manual Cash Input</div>
              <h2 id="hysa-modal-title">Update HYSA</h2>
            </div>
            <button className="modal-close" type="button" onClick={onCancel} aria-label="Close HYSA modal">x</button>
          </div>

          {error && <div className="form-errors" role="alert">{error}</div>}

          <div className="cash-form-grid">
            <label>
              <span>HYSA balance</span>
              <input type="number" min="0" step="any" value={balance} onChange={(event) => setBalance(event.target.value)} />
            </label>
            <label>
              <span>APY</span>
              <input type="number" min="0" step="any" value={apy} onChange={(event) => setApy(event.target.value)} />
            </label>
          </div>

          <div className="modal-actions">
            <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>
            <button className="btn primary" type="submit">Save HYSA</button>
          </div>
        </form>
      </div>
    </div>
  )
}
