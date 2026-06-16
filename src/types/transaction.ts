export type TransactionType = 'buy' | 'sell' | 'dividend' | 'drip' | 'deposit' | 'withdrawal'

export type Transaction = {
  id: string
  type: TransactionType
  ticker?: string
  securityName?: string
  account?: string
  date: string
  shares?: number
  price?: number
  amount?: number
  notes?: string
}

export const STOCK_TRANSACTION_TYPES: TransactionType[] = ['buy', 'sell', 'dividend', 'drip']

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  buy: 'Buy',
  sell: 'Sell',
  dividend: 'Dividend',
  drip: 'DRIP',
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
}
