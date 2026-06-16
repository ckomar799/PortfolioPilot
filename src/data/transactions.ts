export type Transaction = {
  id: string
  date: string // YYYY-MM-DD
  symbol: string
  type: 'buy' | 'sell' | 'dividend'
  quantity?: number
  price?: number // per share for buy/sell
  amount?: number // total amount for dividend
}

export const transactions: Transaction[] = [
  // Buys
  { id: 't1', date: '2024-01-05', symbol: 'AAPL', type: 'buy', quantity: 50, price: 150 },
  { id: 't2', date: '2024-03-12', symbol: 'MSFT', type: 'buy', quantity: 20, price: 290 },
  { id: 't3', date: '2024-05-02', symbol: 'VTI', type: 'buy', quantity: 100, price: 190 },
  { id: 't4', date: '2024-07-08', symbol: 'AAPL', type: 'buy', quantity: 20, price: 170 },
  // Sell
  { id: 't5', date: '2024-09-30', symbol: 'VTI', type: 'sell', quantity: 20, price: 205 },
  // Dividends
  { id: 't6', date: '2024-04-01', symbol: 'VTI', type: 'dividend', amount: 120 },
  { id: 't7', date: '2024-10-01', symbol: 'AAPL', type: 'dividend', amount: 75 },
  { id: 't8', date: '2024-12-15', symbol: 'MSFT', type: 'dividend', amount: 50 },
]
