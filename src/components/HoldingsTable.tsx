import type { Holding } from '../types/holding'
import { formatCurrency, formatPercent, formatSignedNumber } from '../utils/format'

export default function HoldingsTable({ holdings, totalMarketValue }: { holdings: Holding[]; totalMarketValue: number }) {
  const sortedHoldings = holdings.slice().sort((a, b) => b.marketValue - a.marketValue)

  return (
    <div className="holdings-table-wrap">
      <table className="holdings-table-main compact-holdings-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Ticker</th>
            <th>Qty</th>
            <th>Value</th>
            <th>Weight</th>
            <th>Last Price</th>
            <th>Cost Basis</th>
            <th>Unrealized Gain</th>
            <th>Return %</th>
          </tr>
        </thead>
        <tbody>
          {sortedHoldings.map((holding, index) => {
            const weight = totalMarketValue ? (holding.marketValue / totalMarketValue) * 100 : 0
            const returnPercent = holding.totalGainLossPercent ?? (holding.costBasis ? (holding.gainLoss / holding.costBasis) * 100 : 0)

            return (
              <tr key={`${holding.symbol}-${holding.accountName ?? 'account'}`} style={{ animationDelay: `${Math.min(index * 18, 220)}ms` }}>
                <td className="rank-cell">{index + 1}</td>
                <td className="security-cell">
                  <span>{holding.securityName ?? holding.symbol}</span>
                </td>
                <td className="ticker-cell">{holding.symbol}</td>
                <td>{holding.quantity.toLocaleString()}</td>
                <td className="numeric-strong">{formatCurrency(holding.marketValue, { compact: true })}</td>
                <td>
                  <div className="weight-cell">
                    <span>{formatPercent(weight)}</span>
                    <div className="weight-track"><i style={{ width: `${Math.min(weight, 100)}%` }} /></div>
                  </div>
                </td>
                <td>{formatCurrency(holding.marketPrice)}</td>
                <td>{formatCurrency(holding.costBasis, { compact: true })}</td>
                <td className={holding.gainLoss >= 0 ? 'positive' : 'negative'}>{formatSignedNumber(holding.gainLoss, { currency: true })}</td>
                <td className={returnPercent >= 0 ? 'positive' : 'negative'}>{formatPercent(returnPercent)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
