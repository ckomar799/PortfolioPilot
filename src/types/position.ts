export type CurrentPosition = {
  id: string
  accountNumber?: string
  accountName?: string
  ticker: string
  securityName?: string
  shares: number
  currentPrice: number
  currentValue: number
  todaysGainLossDollar?: number
  todaysGainLossPercent?: number
  totalGainLossDollar?: number
  totalGainLossPercent?: number
  percentOfAccount?: number
  costBasisTotal: number
  averageCostBasis: number
  type?: string
  importedAt: string
  exDate?: string
  amountPerShare?: number
  payDate?: string
  distributionYield?: number
  secYield?: number
  estimatedAnnualIncome?: number
}

export type PositionsSnapshot = {
  importedAt: string
  source: 'fidelity-positions-csv'
  positions: CurrentPosition[]
}
