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
  mode: 'replace' | 'merge-dividends'
  matchedDividendRows: number
  unmatchedDividendRows: number
  dividendRows: DividendPositionRow[]
}

type FidelityPositionRow = {
  rowNumber: number
  values: Record<string, string>
}

export type DividendPositionRow = {
  rowNumber: number
  ticker: string
  securityName?: string
  estimatedAnnualIncome?: number
  distributionYield?: number
  secYield?: number
  exDate?: string
  payDate?: string
  amountPerShare?: number
  matched: boolean
}

const ACCOUNT_NUMBER_COLUMNS = ['account number']
const ACCOUNT_NAME_COLUMNS = ['account name']
const SYMBOL_COLUMNS = ['symbol', 'ticker']
const DESCRIPTION_COLUMNS = ['description', 'security description', 'security name']
const QUANTITY_COLUMNS = ['quantity', 'shares']
const LAST_PRICE_COLUMNS = ['last price', 'current price']
const CURRENT_VALUE_COLUMNS = ['current value', 'market value']
const TODAY_GAIN_DOLLAR_COLUMNS = [
  "today's gain/loss dollar",
  "today's gain/loss dollars",
  "today's gain/loss $",
  "today's gain/loss ($)",
  "today's gain/loss",
  'today gain/loss dollar',
  'today gain/loss dollars',
  'today gain/loss $',
  'today gain/loss ($)',
  'today gain/loss',
  'daily gain/loss dollar',
  'daily gain/loss dollars',
  'daily gain/loss $',
  'daily gain/loss ($)',
]
const TODAY_GAIN_PERCENT_COLUMNS = [
  "today's gain/loss percent",
  "today's gain/loss %",
  "today's gain/loss (%)",
  "today's gain/loss pct",
  'today gain/loss percent',
  'today gain/loss %',
  'today gain/loss (%)',
  'today gain/loss pct',
  'daily gain/loss percent',
  'daily gain/loss %',
  'daily gain/loss (%)',
  'daily gain/loss pct',
]
const TOTAL_GAIN_DOLLAR_COLUMNS = [
  'total gain/loss dollar',
  'total gain/loss dollars',
  'total gain/loss $',
  'total gain/loss ($)',
  'total gain/loss',
  'unrealized gain/loss dollar',
  'unrealized gain/loss dollars',
  'unrealized gain/loss $',
  'unrealized gain/loss ($)',
  'unrealized gain/loss',
]
const TOTAL_GAIN_PERCENT_COLUMNS = [
  'total gain/loss percent',
  'total gain/loss %',
  'total gain/loss (%)',
  'total gain/loss pct',
  'unrealized gain/loss percent',
  'unrealized gain/loss %',
  'unrealized gain/loss (%)',
  'unrealized gain/loss pct',
]
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
const DIVIDEND_HEADER_HINTS = [
  'symbol',
  'est. annual income',
  'estimated annual income',
  'dist. yield',
  'distribution yield',
  'sec yield',
  'ex-date',
  'pay date',
]

function normalizeHeader(value: string) {
  return value.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/\s+/g, ' ')
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

function hasAnyColumn(row: FidelityPositionRow, columns: string[]) {
  return columns.some((column) => Object.prototype.hasOwnProperty.call(row.values, column))
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

  const monthNameMatch = trimmed.match(/^([A-Za-z]{3,9})-(\d{1,2})-(\d{4})$/)
  if (monthNameMatch) {
    const reparsed = new Date(`${monthNameMatch[1]} ${monthNameMatch[2]}, ${monthNameMatch[3]}`)
    if (!Number.isNaN(reparsed.getTime())) return reparsed.toISOString().slice(0, 10)
  }

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
    const positionHintCount = REQUIRED_HEADER_HINTS.filter((hint) => normalized.includes(hint)).length
    const dividendHintCount = DIVIDEND_HEADER_HINTS.filter((hint) => normalized.includes(hint)).length
    return positionHintCount >= 2 || (normalized.includes('symbol') && dividendHintCount >= 2)
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

function detectImportMode(rows: FidelityPositionRow[]): 'replace' | 'merge-dividends' {
  const firstRow = rows[0]
  const hasDividendColumns = rows.some((row) => (
    hasAnyColumn(row, ESTIMATED_ANNUAL_INCOME_COLUMNS) ||
    hasAnyColumn(row, DISTRIBUTION_YIELD_COLUMNS) ||
    hasAnyColumn(row, SEC_YIELD_COLUMNS) ||
    hasAnyColumn(row, EX_DATE_COLUMNS) ||
    hasAnyColumn(row, PAY_DATE_COLUMNS) ||
    hasAnyColumn(row, AMOUNT_PER_SHARE_COLUMNS)
  ))

  const hasPositionValueColumns = firstRow ? (
    hasAnyColumn(firstRow, QUANTITY_COLUMNS) &&
    hasAnyColumn(firstRow, LAST_PRICE_COLUMNS) &&
    hasAnyColumn(firstRow, CURRENT_VALUE_COLUMNS)
  ) : false

  const hasReplacementColumns = firstRow ? (
    hasPositionValueColumns &&
    (
      hasAnyColumn(firstRow, TOTAL_GAIN_DOLLAR_COLUMNS) ||
      hasAnyColumn(firstRow, TOTAL_GAIN_PERCENT_COLUMNS) ||
      hasAnyColumn(firstRow, COST_BASIS_COLUMNS)
    )
  ) : false

  return hasDividendColumns && !hasReplacementColumns ? 'merge-dividends' : 'replace'
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
  const totalGainLossDollar = parseNumber(getValue(row, TOTAL_GAIN_DOLLAR_COLUMNS))

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
    totalGainLossDollar,
    totalGainLossPercent: parseNumber(getValue(row, TOTAL_GAIN_PERCENT_COLUMNS)),
    percentOfAccount: parseNumber(getValue(row, PERCENT_OF_ACCOUNT_COLUMNS)),
    costBasisTotal: costBasisTotal ?? Math.max(0, currentValue - (totalGainLossDollar ?? 0)),
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

function mapDividendRow(row: FidelityPositionRow, matchedTickers: Set<string>): { dividendRow?: DividendPositionRow; skipped?: SkippedPositionRow } {
  if (isIgnorableFooterRow(row)) return {}

  const ticker = getValue(row, SYMBOL_COLUMNS).toUpperCase()
  const securityName = getValue(row, DESCRIPTION_COLUMNS)

  if (!ticker && !securityName) {
    return { skipped: { rowNumber: row.rowNumber, reason: 'Missing symbol and description.', raw: row.values } }
  }

  const dividendRow: DividendPositionRow = {
    rowNumber: row.rowNumber,
    ticker: ticker || securityName,
    securityName: securityName || undefined,
    estimatedAnnualIncome: parseNumber(getValue(row, ESTIMATED_ANNUAL_INCOME_COLUMNS)),
    distributionYield: parseNumber(getValue(row, DISTRIBUTION_YIELD_COLUMNS)),
    secYield: parseNumber(getValue(row, SEC_YIELD_COLUMNS)),
    exDate: parseDate(getValue(row, EX_DATE_COLUMNS)),
    payDate: parseDate(getValue(row, PAY_DATE_COLUMNS)),
    amountPerShare: parseNumber(getValue(row, AMOUNT_PER_SHARE_COLUMNS)),
    matched: matchedTickers.has(ticker),
  }

  const hasDividendValue = (
    dividendRow.estimatedAnnualIncome !== undefined ||
    dividendRow.distributionYield !== undefined ||
    dividendRow.secYield !== undefined ||
    dividendRow.exDate !== undefined ||
    dividendRow.payDate !== undefined ||
    dividendRow.amountPerShare !== undefined
  )

  if (!hasDividendValue) {
    return { skipped: { rowNumber: row.rowNumber, reason: 'No dividend fields found for this row.', raw: row.values } }
  }

  if (!dividendRow.matched) {
    return {
      dividendRow,
      skipped: { rowNumber: row.rowNumber, reason: `${dividendRow.ticker} is not in the current positions snapshot.`, raw: row.values },
    }
  }

  return { dividendRow }
}

function applyDividendMerge(existingSnapshot: PositionsSnapshot, dividendRows: DividendPositionRow[], importedAt: string): PositionsSnapshot {
  const dividendByTicker = new Map(dividendRows.filter((row) => row.matched).map((row) => [row.ticker.toUpperCase(), row]))

  return {
    ...existingSnapshot,
    importedAt,
    positions: existingSnapshot.positions.map((position) => {
      const dividendRow = dividendByTicker.get(position.ticker.toUpperCase())
      if (!dividendRow) return position

      return {
        ...position,
        estimatedAnnualIncome: dividendRow.estimatedAnnualIncome ?? 0,
        distributionYield: dividendRow.distributionYield,
        secYield: dividendRow.secYield,
        exDate: dividendRow.exDate,
        payDate: dividendRow.payDate,
        amountPerShare: dividendRow.amountPerShare,
        importedAt,
      }
    }),
  }
}

export function createPositionsImportPreview(csvText: string, existingSnapshot?: PositionsSnapshot): PositionsImportPreview {
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
      mode: 'replace',
      matchedDividendRows: 0,
      unmatchedDividendRows: 0,
      dividendRows: [],
    }
  }

  const mode = detectImportMode(rows)

  if (mode === 'merge-dividends') {
    const matchedTickers = new Set(existingSnapshot?.positions.map((position) => position.ticker.toUpperCase()) ?? [])
    const dividendRows: DividendPositionRow[] = []

    for (const row of rows) {
      const result = mapDividendRow(row, matchedTickers)
      if (result.dividendRow) dividendRows.push(result.dividendRow)
      if (result.skipped) skippedRows.push(result.skipped)
    }

    const snapshot = existingSnapshot
      ? applyDividendMerge(existingSnapshot, dividendRows, importedAt)
      : { importedAt, source: 'fidelity-positions-csv' as const, positions: [] }

    return {
      snapshot,
      skippedRows,
      totalRows: rows.length,
      totalPortfolioValue: Math.round(snapshot.positions.reduce((sum, position) => sum + position.currentValue, 0) * 100) / 100,
      mode,
      matchedDividendRows: dividendRows.filter((row) => row.matched).length,
      unmatchedDividendRows: dividendRows.filter((row) => !row.matched).length,
      dividendRows,
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
    mode,
    matchedDividendRows: 0,
    unmatchedDividendRows: 0,
    dividendRows: [],
  }
}
