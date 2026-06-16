import { calculateHoldings } from '../utils/calcHoldings'
import { transactions } from '../data/transactions'

export default function Holdings() {
  const { holdings } = calculateHoldings(transactions)

  return (
    <div className="page-simple">
      <h1>Holdings</h1>
      <ul className="holdings-list">
        {holdings.map((h) => (
          <li key={h.symbol}>
            <strong>{h.symbol}</strong>: {h.quantity} shares • ${h.marketValue.toLocaleString()} market value
          </li>
        ))}
      </ul>
    </div>
  )
}
