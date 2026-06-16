import type { Transaction } from '../types/transaction'

export const mockTransactions: Transaction[] = [
  // Buys
  { id: 't1', date: '2024-01-05', ticker: 'AAPL', securityName: 'Apple Inc.', account: 'Taxable Brokerage', type: 'buy', shares: 50, price: 150, amount: 7500 },
  { id: 't2', date: '2024-03-12', ticker: 'MSFT', securityName: 'Microsoft Corp.', account: 'Taxable Brokerage', type: 'buy', shares: 20, price: 290, amount: 5800 },
  { id: 't3', date: '2024-05-02', ticker: 'VTI', securityName: 'Vanguard Total Stock Market ETF', account: 'Roth IRA', type: 'buy', shares: 100, price: 190, amount: 19000 },
  { id: 't4', date: '2024-07-08', ticker: 'AAPL', securityName: 'Apple Inc.', account: 'Taxable Brokerage', type: 'buy', shares: 20, price: 170, amount: 3400 },
  // Sell
  { id: 't5', date: '2024-09-30', ticker: 'VTI', securityName: 'Vanguard Total Stock Market ETF', account: 'Roth IRA', type: 'sell', shares: 20, price: 205, amount: 4100 },
  // Dividends
  { id: 't6', date: '2024-04-01', ticker: 'VTI', securityName: 'Vanguard Total Stock Market ETF', account: 'Roth IRA', type: 'dividend', amount: 120 },
  { id: 't7', date: '2024-10-01', ticker: 'AAPL', securityName: 'Apple Inc.', account: 'Taxable Brokerage', type: 'dividend', amount: 75 },
  { id: 't8', date: '2024-12-15', ticker: 'MSFT', securityName: 'Microsoft Corp.', account: 'Taxable Brokerage', type: 'dividend', amount: 50 },
  // DRIP
  { id: 't9', date: '2025-01-03', ticker: 'VTI', securityName: 'Vanguard Total Stock Market ETF', account: 'Roth IRA', type: 'drip', shares: 0.58, price: 207, amount: 120.06, notes: 'Dividend reinvestment' },
  // Cash movements are stored for future cash modeling, but not displayed in portfolio value yet.
  { id: 't10', date: '2025-02-01', account: 'Taxable Brokerage', type: 'deposit', amount: 1000, notes: 'Monthly contribution' },
]
