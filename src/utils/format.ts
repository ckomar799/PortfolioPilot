const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const wholeCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number, options: { compact?: boolean } = {}) {
  return options.compact ? wholeCurrencyFormatter.format(value) : currencyFormatter.format(value)
}

export function formatPercent(value: number) {
  return percentFormatter.format(value / 100)
}

export function formatSignedNumber(value: number, options: { currency?: boolean } = {}) {
  const sign = value > 0 ? '+' : ''
  const formatted = options.currency ? formatCurrency(Math.abs(value), { compact: true }) : Math.abs(value).toLocaleString()

  return `${sign}${value < 0 ? '-' : ''}${formatted}`
}
