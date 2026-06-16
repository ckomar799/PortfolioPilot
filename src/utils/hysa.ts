import type { HysaIncomeMetrics, HysaSettings } from '../types/hysa'

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}

export function calculateHysaIncome(settings: HysaSettings): HysaIncomeMetrics {
  const apyDecimal = settings.apy / 100
  const dailyRate = Math.pow(1 + apyDecimal, 1 / 365) - 1
  const annualInterest = roundCurrency(settings.balance * apyDecimal)
  const rawDailyInterest = settings.balance * dailyRate

  return {
    annualInterest,
    monthlyInterest: roundCurrency(settings.balance * (Math.pow(1 + dailyRate, 30) - 1)),
    weeklyInterest: roundCurrency(settings.balance * (Math.pow(1 + dailyRate, 7) - 1)),
    dailyInterest: roundCurrency(rawDailyInterest),
    hourlyInterest: roundCurrency(rawDailyInterest / 24),
    minuteInterest: roundCurrency(rawDailyInterest / 24 / 60),
  }
}
