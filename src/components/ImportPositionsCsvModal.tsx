import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { PositionsSnapshot } from '../types/position'
import type { PositionsImportPreview } from '../utils/fidelityPositionsImport'
import { createPositionsImportPreview } from '../utils/fidelityPositionsImport'
import { formatCurrency, formatPercent } from '../utils/format'

type ImportPositionsCsvModalProps = {
  existingSnapshot?: PositionsSnapshot
  onConfirm: (snapshot: PositionsSnapshot) => void
  onCancel: () => void
}

export default function ImportPositionsCsvModal({ existingSnapshot, onConfirm, onCancel }: ImportPositionsCsvModalProps) {
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState<PositionsImportPreview | undefined>()
  const [readError, setReadError] = useState('')

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setReadError('')
    setPreview(undefined)
    setFileName(file?.name ?? '')

    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      setPreview(createPositionsImportPreview(text))
    }
    reader.onerror = () => {
      setReadError('Could not read the selected positions CSV file.')
    }
    reader.readAsText(file)
  }

  function confirmImport() {
    if (!preview || preview.snapshot.positions.length === 0) return
    onConfirm(preview.snapshot)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <div className="import-modal" role="dialog" aria-modal="true" aria-labelledby="positions-import-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="eyebrow">Current Holdings</div>
            <h2 id="positions-import-title">Import Positions CSV</h2>
          </div>
          <button className="modal-close" type="button" onClick={onCancel} aria-label="Close positions import modal">x</button>
        </div>

        {existingSnapshot && (
          <div className="import-warning">
            Confirming this import will replace the current positions snapshot from {new Date(existingSnapshot.importedAt).toLocaleString()}.
          </div>
        )}

        <label className="csv-upload-zone">
          <span>Upload Fidelity positions CSV</span>
          <strong>{fileName || 'Choose positions CSV file'}</strong>
          <input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
        </label>

        {readError && <div className="form-errors" role="alert">{readError}</div>}

        {preview && (
          <>
            <div className="import-summary-grid">
              <div><span>Imported positions</span><strong>{preview.snapshot.positions.length}</strong></div>
              <div><span>Skipped rows</span><strong>{preview.skippedRows.length}</strong></div>
              <div><span>Total portfolio value</span><strong>{formatCurrency(preview.totalPortfolioValue, { compact: true })}</strong></div>
              <div><span>Source</span><strong>Positions CSV</strong></div>
            </div>

            <section className="import-preview-section">
              <div className="mini-section-heading">
                <span>Current holdings preview</span>
                <strong>{preview.snapshot.positions.length} positions</strong>
              </div>
              {preview.snapshot.positions.length ? (
                <div className="import-preview-table-wrap">
                  <table className="import-preview-table">
                    <thead>
                      <tr>
                        <th>Account</th>
                        <th>Ticker</th>
                        <th>Security</th>
                        <th>Shares</th>
                        <th>Last Price</th>
                        <th>Current Value</th>
                        <th>Total Gain/Loss</th>
                        <th>Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.snapshot.positions.map((position) => (
                        <tr key={position.id}>
                          <td>{position.accountName ?? position.accountNumber ?? '-'}</td>
                          <td className="ticker-cell">{position.ticker}</td>
                          <td>{position.securityName ?? '-'}</td>
                          <td className="numeric-cell">{position.shares.toLocaleString()}</td>
                          <td className="numeric-cell">{formatCurrency(position.currentPrice)}</td>
                          <td className="numeric-cell">{formatCurrency(position.currentValue, { compact: true })}</td>
                          <td className={position.totalGainLossDollar && position.totalGainLossDollar < 0 ? 'negative' : 'positive'}>{formatCurrency(position.totalGainLossDollar ?? 0, { compact: true })}</td>
                          <td className={position.totalGainLossPercent && position.totalGainLossPercent < 0 ? 'negative' : 'positive'}>{formatPercent(position.totalGainLossPercent ?? 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <div className="import-empty">No valid positions found.</div>}
            </section>

            <section className="import-preview-section">
              <div className="mini-section-heading">
                <span>Skipped rows</span>
                <strong>{preview.skippedRows.length} rows</strong>
              </div>
              {preview.skippedRows.length ? (
                <div className="import-skip-list">
                  {preview.skippedRows.map((row) => (
                    <div key={`${row.rowNumber}-${row.reason}`}>
                      <strong>Row {row.rowNumber}</strong>
                      <span>{row.reason}</span>
                    </div>
                  ))}
                </div>
              ) : <div className="import-empty">Only blank/footer/legal rows were ignored.</div>}
            </section>
          </>
        )}

        <div className="modal-actions">
          <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>
          <button className="btn primary" type="button" onClick={confirmImport} disabled={!preview || preview.snapshot.positions.length === 0}>
            Confirm Positions Snapshot
          </button>
        </div>
      </div>
    </div>
  )
}
