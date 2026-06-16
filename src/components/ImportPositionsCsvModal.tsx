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
      setPreview(createPositionsImportPreview(text, existingSnapshot))
    }
    reader.onerror = () => {
      setReadError('Could not read the selected positions CSV file.')
    }
    reader.readAsText(file)
  }

  function confirmImport() {
    if (!preview || preview.snapshot.positions.length === 0) return
    if (preview.mode === 'merge-dividends' && preview.matchedDividendRows === 0) return
    onConfirm(preview.snapshot)
  }

  const isDividendMerge = preview?.mode === 'merge-dividends'
  const canConfirm = preview
    ? preview.mode === 'merge-dividends'
      ? preview.snapshot.positions.length > 0 && preview.matchedDividendRows > 0
      : preview.snapshot.positions.length > 0
    : false

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

        {existingSnapshot && !isDividendMerge && (
          <div className="import-warning">
            Confirming this import will replace the current positions snapshot from {new Date(existingSnapshot.importedAt).toLocaleString()}.
          </div>
        )}

        {isDividendMerge && (
          <div className="import-info">
            This CSV looks like dividend position data. Confirming will merge dividend fields into matching tickers and preserve current values, quantities, cost basis, and gain/loss.
          </div>
        )}

        <label className="csv-upload-zone">
          <span>Upload Fidelity positions or dividend CSV</span>
          <strong>{fileName || 'Choose positions CSV file'}</strong>
          <input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
        </label>

        {readError && <div className="form-errors" role="alert">{readError}</div>}

        {preview && (
          <>
            <div className="import-summary-grid">
              <div><span>Import action</span><strong>{isDividendMerge ? 'Merge' : 'Replace'}</strong></div>
              <div><span>{isDividendMerge ? 'Matched tickers' : 'Imported positions'}</span><strong>{isDividendMerge ? preview.matchedDividendRows : preview.snapshot.positions.length}</strong></div>
              <div><span>Skipped rows</span><strong>{preview.skippedRows.length}</strong></div>
              <div><span>{isDividendMerge ? 'Unmatched tickers' : 'Total portfolio value'}</span><strong>{isDividendMerge ? preview.unmatchedDividendRows : formatCurrency(preview.totalPortfolioValue, { compact: true })}</strong></div>
            </div>

            <section className="import-preview-section">
              <div className="mini-section-heading">
                <span>{isDividendMerge ? 'Dividend merge preview' : 'Current holdings preview'}</span>
                <strong>{isDividendMerge ? `${preview.matchedDividendRows} matched` : `${preview.snapshot.positions.length} positions`}</strong>
              </div>
              {isDividendMerge ? (
                preview.dividendRows.length ? (
                  <div className="import-preview-table-wrap">
                    <table className="import-preview-table dividend-preview-table">
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Ticker</th>
                          <th>Security</th>
                          <th>Est. Annual Income</th>
                          <th>Dist. Yield</th>
                          <th>SEC Yield</th>
                          <th>Ex-Date</th>
                          <th>Pay Date</th>
                          <th>Amount / Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.dividendRows.map((row) => (
                          <tr key={`${row.rowNumber}-${row.ticker}`}>
                            <td className={row.matched ? 'positive' : 'negative'}>{row.matched ? 'Matched' : 'Skipped'}</td>
                            <td className="ticker-cell">{row.ticker}</td>
                            <td>{row.securityName ?? '-'}</td>
                            <td className="numeric-cell">{row.estimatedAnnualIncome === undefined ? '-' : formatCurrency(row.estimatedAnnualIncome)}</td>
                            <td className="numeric-cell">{row.distributionYield === undefined ? '-' : formatPercent(row.distributionYield)}</td>
                            <td className="numeric-cell">{row.secYield === undefined ? '-' : formatPercent(row.secYield)}</td>
                            <td>{row.exDate ?? '-'}</td>
                            <td>{row.payDate ?? '-'}</td>
                            <td className="numeric-cell">{row.amountPerShare === undefined ? '-' : formatCurrency(row.amountPerShare)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <div className="import-empty">No dividend rows found.</div>
              ) : preview.snapshot.positions.length ? (
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
          <button className="btn primary" type="button" onClick={confirmImport} disabled={!canConfirm}>
            {isDividendMerge ? 'Confirm Dividend Merge' : 'Confirm Positions Snapshot'}
          </button>
        </div>
      </div>
    </div>
  )
}
