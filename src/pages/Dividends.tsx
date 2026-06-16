import { calculateHoldings } from '../utils/calcHoldings'
import { transactions } from '../data/transactions'
import { formatCurrency } from '../utils/format'

export default function Dividends() {
  const { holdings, portfolio } = calculateHoldings(transactions)

  return (
    <div className="page-simple">
      <h1>Dividends</h1>
      <p>Total annual dividends: {formatCurrency(portfolio.annualDividends)}</p>
      <ul>
        {holdings.map((h) => (
          <li key={h.symbol}>
            {h.symbol}: {formatCurrency(h.annualDividends)}
          </li>
        ))}
      </ul>
    </div>
  )
}
