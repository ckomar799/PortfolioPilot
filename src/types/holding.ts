export type Holding = {
  symbol: string
  quantity: number
  costBasis: number
  costPerShare: number
  marketPrice: number
  marketValue: number
  gainLoss: number
  annualDividends: number
  securityName?: string
  accountName?: string
  securityType?: string
  todaysGainLossDollar?: number
  todaysGainLossPercent?: number
  totalGainLossPercent?: number
  exDate?: string
  amountPerShare?: number
  payDate?: string
  distributionYield?: number
  secYield?: number
  estimatedAnnualIncome?: number
}

export type PortfolioSummary = {
  totalMarketValue: number
  totalCostBasis: number
  totalGainLoss: number
  annualDividends: number
  yield: number
}
