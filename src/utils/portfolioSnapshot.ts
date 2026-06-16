import type { CurrentPosition, PositionsSnapshot } from '../types/position'
import type { Holding, PortfolioSummary } from '../types/holding'

export type AccountAllocation = {
  accountName: string
  value: number
  share: number
}

export type SnapshotDashboardData = {
  holdings: Holding[]
  portfolio: PortfolioSummary
  accountAllocation: AccountAllocation[]
  largestPositions: CurrentPosition[]
  topGainers: CurrentPosition[]
  topLosers: CurrentPosition[]
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}

export function positionsToDashboardData(snapshot: PositionsSnapshot): SnapshotDashboardData {
  const holdings: Holding[] = snapshot.positions
    .map((position) => ({
      symbol: position.ticker,
      quantity: position.shares,
      costBasis: position.costBasisTotal,
      costPerShare: position.averageCostBasis,
      marketPrice: position.currentPrice,
      marketValue: position.currentValue,
      gainLoss: position.totalGainLossDollar ?? roundCurrency(position.currentValue - position.costBasisTotal),
      annualDividends: position.estimatedAnnualIncome ?? 0,
      securityName: position.securityName,
      accountName: position.accountName,
      securityType: position.type,
      todaysGainLossDollar: position.todaysGainLossDollar,
      todaysGainLossPercent: position.todaysGainLossPercent,
      totalGainLossPercent: position.totalGainLossPercent,
      exDate: position.exDate,
      amountPerShare: position.amountPerShare,
      payDate: position.payDate,
      distributionYield: position.distributionYield,
      secYield: position.secYield,
      estimatedAnnualIncome: position.estimatedAnnualIncome ?? 0,
    }))
    .sort((a, b) => b.marketValue - a.marketValue)

  const totalMarketValue = roundCurrency(holdings.reduce((sum, holding) => sum + holding.marketValue, 0))
  const totalCostBasis = roundCurrency(holdings.reduce((sum, holding) => sum + holding.costBasis, 0))
  const totalGainLoss = roundCurrency(holdings.reduce((sum, holding) => sum + holding.gainLoss, 0))
  const annualDividends = roundCurrency(holdings.reduce((sum, holding) => sum + (holding.estimatedAnnualIncome ?? 0), 0))
  const accountValues = new Map<string, number>()
  snapshot.positions.forEach((position) => {
    const accountName = position.accountName || position.accountNumber || 'Unassigned'
    accountValues.set(accountName, (accountValues.get(accountName) ?? 0) + position.currentValue)
  })

  const accountAllocation = Array.from(accountValues.entries())
    .map(([accountName, value]) => ({
      accountName,
      value: roundCurrency(value),
      share: totalMarketValue ? (value / totalMarketValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)

  return {
    holdings,
    portfolio: {
      totalMarketValue,
      totalCostBasis,
      totalGainLoss,
      annualDividends,
      yield: totalMarketValue ? Math.round((annualDividends / totalMarketValue) * 10000) / 100 : 0,
    },
    accountAllocation,
    largestPositions: snapshot.positions.slice().sort((a, b) => b.currentValue - a.currentValue).slice(0, 5),
    topGainers: snapshot.positions.slice().sort((a, b) => (b.totalGainLossDollar ?? 0) - (a.totalGainLossDollar ?? 0)).slice(0, 5),
    topLosers: snapshot.positions.slice().sort((a, b) => (a.totalGainLossDollar ?? 0) - (b.totalGainLossDollar ?? 0)).slice(0, 5),
  }
}
