export type HysaSettings = {
  accountName: string
  balance: number
  apy: number
}

export type HysaIncomeMetrics = {
  annualInterest: number
  monthlyInterest: number
  weeklyInterest: number
  dailyInterest: number
  hourlyInterest: number
  minuteInterest: number
}

export type TotalPassiveIncomeMetrics = {
  annualDividends: number
  annualHysaInterest: number
  annualTotal: number
  monthlyTotal: number
  dailyTotal: number
  hourlyTotal: number
  minuteTotal: number
}
