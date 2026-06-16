import type { CurrentPosition, PositionsSnapshot } from '../types/position'
import { parseCsv } from './csv'

export type SkippedPositionRow = {
  rowNumber: number
  reason: string
  raw: Record<string, string>
}

export type PositionsImportPreview = {
  snapshot: PositionsSnapshot
  skippedRows: SkippedPositionRow[]
  totalRows: number
  totalPortfolioValue: number
}

type FidelityPositionRow = {
  rowNumber: number
  values: Record<string, string>
}

const ACCOUNT_NUMBER_COLUMNS = ['account number']
const ACCOUNT_NAME_COLUMNS = ['account name']
const SYMBOL_COLUMNS = ['symbol', 'ticker']
const DESCRIPTION_COLUMNS = ['description', 'security description', 'security name']
const QUANTITY_COLUMNS = ['quantity', 'shares']
const LAST_PRICE_COLUMNS = ['last price', 'current price']
const CURRENT_VALUE_COLUMNS = ['current value', 'market value']
const TODAY_GAIN_DOLLAR_COLUMNS = ["today's gain/loss dollar", "today's gain/loss $", 'today gain/loss dollar', 'today gain/loss $', 'daily gain/loss dollar']
const TODAY_GAIN_PERCENT_COLUMNS = ["today's gain/loss percent", "today's gain/loss %", 'today gain/loss percent', 'today gain/loss %', 'daily gain/loss percent']
const TOTAL_GAIN_DOLLAR_COLUMNS = ['total gain/loss dollar', 'total gain/loss $', 'unrealized gain/loss dollar', 'unrealized gain/loss $']
const TOTAL_GAIN_PERCENT_COLUMNS = ['total gain/loss percent', 'total gain/loss %', 'unrealized gain/loss percent', 'unrealized gain/loss %']
const PERCENT_OF_ACCOUNT_COLUMNS = ['percent of account', '% of account']
const COST_BASIS_COLUMNS = ['cost basis total', 'cost basis']
const AVERAGE_COST_COLUMNS = ['average cost basis', 'average cost']
const TYPE_COLUMNS = ['type', 'security type']
const EX_DATE_COLUMNS = ['ex-date', 'ex date', 'ex-dividend date']
const AMOUNT_PER_SHARE_COLUMNS = ['amount per share', 'dividend amount per share']
const PAY_DATE_COLUMNS = ['pay date', 'payment date']
const DISTRIBUTION_YIELD_COLUMNS = ['dist. yield', 'dist yield', 'distribution yield']
const SEC_YIELD_COLUMNS = ['sec yield', '30-day sec yield']
const ESTIMATED_ANNUAL_INCOME_COLUMNS = ['est. annual income', 'estimated annual income', 'est annual income']
const REQUIRED_HEADER_HINTS = ['symbol', 'description', 'quantity', 'current value']

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function getValue(row: FidelityPositionRow, columns: string[]) {
  for (const column of columns) {
    const value = row.values[column]
    if (value) return normalizeText(value)
  }

  return ''
}

function parseNumber(value: string) {
  const cleaned = value.replace(/\$/g, '').replace(/,/g, '').replace(/%/g, '').trim()
  if (!cleaned || cleaned === '--' || cleaned.toLowerCase() === 'n/a') return undefined

  const isParenthesizedNegative = cleaned.startsWith('(') && cleaned.endsWith(')')
  const normalized = cleaned.replace(/[()]/g, '')
  const parsed = Number(normalized)

  if (Number.isNaN(parsed)) return undefined
  return isParenthesizedNegative ? -parsed : parsed
}

function parseDate(value: string) {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '--' || trimmed.toLowerCase() === 'n/a') return undefined

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)

  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (!match) return undefined

  const month = match[1].padStart(2, '0')
  const day = match[2].padStart(2, '0')
  const year = match[3].length === 2 ? `20${match[3]}` : match[3]
  return `${year}-${month}-${day}`
}

function isIgnorableFooterRow(row: FidelityPositionRow) {
  const joined = Object.values(row.values).join(' ').trim().toLowerCase()
  if (!joined) return true

  return (
    joined.includes('account total') ||
    joined.includes('grand total') ||
    joined.includes('total current value') ||
    joined.includes('data as of') ||
    joined.includes('fidelity brokerage services') ||
    joined.includes('not fdic insured') ||
    joined.includes('may lose value')
  )
}

function rowsFromCsv(text: string): FidelityPositionRow[] {
  const rows = parseCsv(text)
  const headerRowIndex = rows.findIndex((row) => {
    const normalized = row.map(normalizeHeader)
    return REQUIRED_HEADER_HINTS.filter((hint) => normalized.includes(hint)).length >= 2
  })

  if (headerRowIndex < 0) return []

  const headers = rows[headerRowIndex].map(normalizeHeader)

  return rows.slice(headerRowIndex + 1).map((row, index) => {
    const values: Record<string, string> = {}
    headers.forEach((header, cellIndex) => {
      if (header) values[header] = row[cellIndex] ?? ''
    })

    return {
      rowNumber: headerRowIndex + index + 2,
      values,
    }
  })
}

function positionId(position: Omit<CurrentPosition, 'id'>) {
  return [
    position.accountNumber ?? '',
    position.accountName ?? '',
    position.ticker,
    position.securityName ?? '',
  ].join('|').toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function mapRow(row: FidelityPositionRow, importedAt: string): { position?: CurrentPosition; skipped?: SkippedPositionRow } {
  if (isIgnorableFooterRow(row)) return {}

  const ticker = getValue(row, SYMBOL_COLUMNS).toUpperCase()
  const securityName = getValue(row, DESCRIPTION_COLUMNS)
  const shares = parseNumber(getValue(row, QUANTITY_COLUMNS))
  const currentPrice = parseNumber(getValue(row, LAST_PRICE_COLUMNS))
  const currentValue = parseNumber(getValue(row, CURRENT_VALUE_COLUMNS))
  const costBasisTotal = parseNumber(getValue(row, COST_BASIS_COLUMNS))
  const averageCostBasis = parseNumber(getValue(row, AVERAGE_COST_COLUMNS))

  if (!ticker && !securityName) {
    return { skipped: { rowNumber: row.rowNumber, reason: 'Missing symbol and description.', raw: row.values } }
  }

  if (shares === undefined || currentPrice === undefined || currentValue === undefined) {
    return { skipped: { rowNumber: row.rowNumber, reason: 'Missing quantity, last price, or current value.', raw: row.values } }
  }

  const basePosition: Omit<CurrentPosition, 'id'> = {
    accountNumber: getValue(row, ACCOUNT_NUMBER_COLUMNS) || undefined,
    accountName: getValue(row, ACCOUNT_NAME_COLUMNS) || undefined,
    ticker: ticker || securityName,
    securityName: securityName || undefined,
    shares,
    currentPrice,
    currentValue,
    todaysGainLossDollar: parseNumber(getValue(row, TODAY_GAIN_DOLLAR_COLUMNS)),
    todaysGainLossPercent: parseNumber(getValue(row, TODAY_GAIN_PERCENT_COLUMNS)),
    totalGainLossDollar: parseNumber(getValue(row, TOTAL_GAIN_DOLLAR_COLUMNS)),
    totalGainLossPercent: parseNumber(getValue(row, TOTAL_GAIN_PERCENT_COLUMNS)),
    percentOfAccount: parseNumber(getValue(row, PERCENT_OF_ACCOUNT_COLUMNS)),
    costBasisTotal: costBasisTotal ?? Math.max(0, currentValue - (parseNumber(getValue(row, TOTAL_GAIN_DOLLAR_COLUMNS)) ?? 0)),
    averageCostBasis: averageCostBasis ?? (shares ? currentValue / shares : 0),
    type: getValue(row, TYPE_COLUMNS) || undefined,
    importedAt,
    exDate: parseDate(getValue(row, EX_DATE_COLUMNS)),
    amountPerShare: parseNumber(getValue(row, AMOUNT_PER_SHARE_COLUMNS)),
    payDate: parseDate(getValue(row, PAY_DATE_COLUMNS)),
    distributionYield: parseNumber(getValue(row, DISTRIBUTION_YIELD_COLUMNS)),
    secYield: parseNumber(getValue(row, SEC_YIELD_COLUMNS)),
    estimatedAnnualIncome: parseNumber(getValue(row, ESTIMATED_ANNUAL_INCOME_COLUMNS)) ?? 0,
  }

  return {
    position: {
      ...basePosition,
      id: positionId(basePosition),
    },
  }
}

export function createPositionsImportPreview(csvText: string): PositionsImportPreview {
  const importedAt = new Date().toISOString()
  const rows = rowsFromCsv(csvText)
  const positions: CurrentPosition[] = []
  const skippedRows: SkippedPositionRow[] = []

  if (rows.length === 0) {
    return {
      snapshot: { importedAt, source: 'fidelity-positions-csv', positions },
      skippedRows: [{ rowNumber: 1, reason: 'Could not find a recognizable Fidelity positions header row.', raw: {} }],
      totalRows: 0,
      totalPortfolioValue: 0,
    }
  }

  for (const row of rows) {
    const result = mapRow(row, importedAt)
    if (result.position) positions.push(result.position)
    if (result.skipped) skippedRows.push(result.skipped)
  }

  return {
    snapshot: {
      importedAt,
      source: 'fidelity-positions-csv',
      positions,
    },
    skippedRows,
    totalRows: rows.length,
    totalPortfolioValue: Math.round(positions.reduce((sum, position) => sum + position.currentValue, 0) * 100) / 100,
  }
}
