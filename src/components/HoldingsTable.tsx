import type { Holding } from '../utils/calcHoldings'
import { formatCurrency, formatPercent, formatSignedNumber } from '../utils/format'

const SECURITY_META: Record<string, { name: string; sector: string; account: string; rating: string }> = {
  AAPL: { name: 'Apple Inc.', sector: 'Technology', account: 'Taxable Core', rating: 'Quality Growth' },
  MSFT: { name: 'Microsoft Corp.', sector: 'Technology', account: 'Roth IRA', rating: 'Compounder' },
  VTI: { name: 'Vanguard Total Stock Market ETF', sector: 'Broad Market', account: 'Traditional IRA', rating: 'Core Index' },
}

export default function HoldingsTable({ holdings, totalMarketValue }: { holdings: Holding[]; totalMarketValue: number }) {
  return (
    <div className="holdings-table-wrap">
      <table className="holdings-table-main">
        <thead>
          <tr>
            <th>Security</th>
            <th>Account</th>
            <th>Qty</th>
            <th>Last Price</th>
            <th>Market Value</th>
            <th>Weight</th>
            <th>Cost Basis</th>
            <th>Unrealized P/L</th>
            <th>Return</th>
            <th>Income</th>
            <th>Yield</th>
            <th>Signal</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const meta = SECURITY_META[h.symbol] ?? { name: h.symbol, sector: 'Unclassified', account: 'Brokerage', rating: 'Review' }
            const weight = totalMarketValue ? (h.marketValue / totalMarketValue) * 100 : 0
            const returnPercent = h.costBasis ? (h.gainLoss / h.costBasis) * 100 : 0
            const yieldPercent = h.marketValue ? (h.annualDividends / h.marketValue) * 100 : 0

            return (
              <tr key={h.symbol}>
                <td className="security-cell">
                  <span className="sym">{h.symbol}</span>
                  <span>{meta.name}</span>
                  <em>{meta.sector}</em>
                </td>
                <td>{meta.account}</td>
                <td>{h.quantity.toLocaleString()}</td>
                <td>{formatCurrency(h.marketPrice)}</td>
                <td className="numeric-strong">{formatCurrency(h.marketValue, { compact: true })}</td>
                <td>
                  <div className="weight-cell">
                    <span>{formatPercent(weight)}</span>
                    <div className="weight-track"><i style={{ width: `${Math.min(weight, 100)}%` }} /></div>
                  </div>
                </td>
                <td>
                  <div className="stacked-number">
                    <strong>{formatCurrency(h.costBasis, { compact: true })}</strong>
                    <span>Avg cost {formatCurrency(h.costPerShare)}</span>
                  </div>
                </td>
                <td className={h.gainLoss >= 0 ? 'positive' : 'negative'}>{formatSignedNumber(h.gainLoss, { currency: true })}</td>
                <td className={returnPercent >= 0 ? 'positive' : 'negative'}>{formatPercent(returnPercent)}</td>
                <td>{formatCurrency(h.annualDividends)}</td>
                <td>{formatPercent(yieldPercent)}</td>
                <td><span className="rating-pill">{meta.rating}</span></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
