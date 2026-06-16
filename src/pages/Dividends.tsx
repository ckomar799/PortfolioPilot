import { calculateHoldings } from '../utils/calcHoldings'
import type { HysaSettings } from '../types/hysa'
import type { Transaction } from '../types/transaction'
import { formatCurrency } from '../utils/format'
import { calculateHysaIncome, calculateTotalPassiveIncome } from '../utils/hysa'

type DividendsProps = {
  transactions: Transaction[]
  hysaSettings: HysaSettings
}

export default function Dividends({ transactions, hysaSettings }: DividendsProps) {
  const { holdings, portfolio } = calculateHoldings(transactions)
  const hysaIncome = calculateHysaIncome(hysaSettings)
  const totalIncome = calculateTotalPassiveIncome(portfolio.annualDividends, hysaIncome)

  return (
    <div className="page-simple dividends-page">
      <div>
        <div className="eyebrow">Income Intelligence</div>
        <h1>Dividends</h1>
      </div>

      <div className="income-summary-strip">
        <div><span>Forward annual dividends</span><strong>{formatCurrency(totalIncome.annualDividends)}</strong></div>
        <div><span>Estimated HYSA interest</span><strong>{formatCurrency(totalIncome.annualHysaInterest)}</strong></div>
        <div><span>Total annual passive income</span><strong>{formatCurrency(totalIncome.annualTotal)}</strong></div>
        <div><span>Monthly total</span><strong>{formatCurrency(totalIncome.monthlyTotal)}</strong></div>
        <div><span>Daily total</span><strong>{formatCurrency(totalIncome.dailyTotal)}</strong></div>
      </div>

      <div className="dividend-list-card">
        <h3>Income by Holding</h3>
        <ul>
          {holdings.map((h) => (
            <li key={h.symbol}>
              <span>{h.symbol}</span>
              <strong>{formatCurrency(h.annualDividends)}</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
