import { transactions } from '../data/transactions'
import { formatCurrency } from '../utils/format'

export default function Transactions() {
  return (
    <div className="page-simple">
      <h1>Transactions</h1>
      <table className="tx-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Symbol</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{t.symbol}</td>
              <td>{t.type}</td>
              <td>{t.quantity ?? ''}</td>
              <td>{t.price ? formatCurrency(t.price) : ''}</td>
              <td>{t.amount ? formatCurrency(t.amount) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
