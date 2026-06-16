import type { Transaction } from '../types/transaction'

export type Holding = {
  symbol: string
  quantity: number
  costBasis: number
  costPerShare: number
  marketPrice: number
  marketValue: number
  gainLoss: number
  annualDividends: number
}

export type PortfolioSummary = {
  totalMarketValue: number
  totalCostBasis: number
  totalGainLoss: number
  annualDividends: number
  yield: number
}

// very small mock price map — in real app you'd fetch prices
const MOCK_MARKET_PRICE: Record<string, number> = {
  AAPL: 185,
  MSFT: 330,
  VTI: 200,
}

export function calculateHoldings(transactions: Transaction[]) {
  const bySymbol: Record<string, { quantity: number; totalCost: number; annualDividends: number; lastPrice?: number }> = {}

  // process chronologically
  const txs = transactions.slice().sort((a, b) => a.date.localeCompare(b.date))

  for (const t of txs) {
    const s = t.ticker?.toUpperCase()
    if (!s) continue

    if (!bySymbol[s]) bySymbol[s] = { quantity: 0, totalCost: 0, annualDividends: 0 }

    if (t.type === 'buy' && t.shares && t.price) {
      bySymbol[s].totalCost += t.shares * t.price
      bySymbol[s].quantity += t.shares
      bySymbol[s].lastPrice = t.price
    }

    if (t.type === 'sell' && t.shares && t.price) {
      // average cost method
      const beforeQty = bySymbol[s].quantity
      const avgCost = beforeQty > 0 ? bySymbol[s].totalCost / beforeQty : 0
      const qtySold = t.shares
      bySymbol[s].quantity = Math.max(0, beforeQty - qtySold)
      bySymbol[s].totalCost = Math.max(0, bySymbol[s].totalCost - avgCost * qtySold)
      bySymbol[s].lastPrice = t.price
    }

    if (t.type === 'dividend' && t.amount) {
      bySymbol[s].annualDividends += t.amount
    }

    if (t.type === 'drip' && t.amount && t.shares && t.price) {
      // A DRIP is both dividend income and a reinvested share purchase.
      bySymbol[s].annualDividends += t.amount
      bySymbol[s].quantity += t.shares
      bySymbol[s].totalCost += t.amount
      bySymbol[s].lastPrice = t.price
    }
  }

  const holdings: Holding[] = Object.entries(bySymbol).map(([symbol, info]) => {
    const marketPrice = MOCK_MARKET_PRICE[symbol] ?? info.lastPrice ?? 0
    const marketValue = Math.round(info.quantity * marketPrice * 100) / 100
    const costBasis = Math.round(info.totalCost * 100) / 100
    const gainLoss = Math.round((marketValue - costBasis) * 100) / 100

    return {
      symbol,
      quantity: info.quantity,
      costBasis,
      costPerShare: info.quantity ? Math.round((costBasis / info.quantity) * 100) / 100 : 0,
      marketPrice,
      marketValue,
      gainLoss,
      annualDividends: info.annualDividends,
    }
  })

  const portfolio: PortfolioSummary = {
    totalMarketValue: Math.round(holdings.reduce((s, h) => s + h.marketValue, 0) * 100) / 100,
    totalCostBasis: Math.round(holdings.reduce((s, h) => s + h.costBasis, 0) * 100) / 100,
    totalGainLoss: Math.round(holdings.reduce((s, h) => s + h.gainLoss, 0) * 100) / 100,
    annualDividends: Math.round(holdings.reduce((s, h) => s + h.annualDividends, 0) * 100) / 100,
    yield: 0,
  }

  portfolio.yield = portfolio.totalMarketValue ? Math.round((portfolio.annualDividends / portfolio.totalMarketValue) * 10000) / 100 : 0

  return { holdings, portfolio }
}
