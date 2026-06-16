import { useState } from 'react'
import BankCashModal from '../components/BankCashModal'
import Card from '../components/Card'
import DonutChart from '../components/DonutChart'
import HoldingsTable from '../components/HoldingsTable'
import HysaModal from '../components/HysaModal'
import ImportPositionsCsvModal from '../components/ImportPositionsCsvModal'
import MetricCard from '../components/MetricCard'
import type { BankCashSettings } from '../types/bankCash'
import type { HysaSettings } from '../types/hysa'
import type { PositionsSnapshot } from '../types/position'
import { formatCurrency, formatPercent, formatSignedNumber } from '../utils/format'
import { calculateHysaIncome } from '../utils/hysa'
import { positionsToDashboardData } from '../utils/portfolioSnapshot'

type DashboardProps = {
  positionsSnapshot?: PositionsSnapshot
  onPositionsSnapshotImport: (snapshot: PositionsSnapshot) => void
  hysaSettings: HysaSettings
  onHysaSettingsChange: (settings: HysaSettings) => void
  bankCashSettings: BankCashSettings
  onBankCashSettingsChange: (settings: BankCashSettings) => void
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
})

function formatDate(date?: string) {
  if (!date) return 'Not available'
  const parsed = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? date : dateFormatter.format(parsed)
}

export default function Dashboard({
  positionsSnapshot,
  onPositionsSnapshotImport,
  hysaSettings,
  onHysaSettingsChange,
  bankCashSettings,
  onBankCashSettingsChange,
}: DashboardProps) {
  const [isPositionsImportOpen, setIsPositionsImportOpen] = useState(false)
  const [isHysaModalOpen, setIsHysaModalOpen] = useState(false)
  const [isBankCashModalOpen, setIsBankCashModalOpen] = useState(false)
  const snapshotData = positionsSnapshot ? positionsToDashboardData(positionsSnapshot) : undefined
  const holdings = snapshotData?.holdings ?? []
  const portfolio = snapshotData?.portfolio ?? {
    totalMarketValue: 0,
    totalCostBasis: 0,
    totalGainLoss: 0,
    annualDividends: 0,
    yield: 0,
  }
  const hysaIncome = calculateHysaIncome(hysaSettings)
  const netWorth = portfolio.totalMarketValue + hysaSettings.balance + bankCashSettings.balance
  const dividendIncome = portfolio.annualDividends
  const passiveIncome = dividendIncome + hysaIncome.annualInterest
  const unrealizedReturn = portfolio.totalCostBasis ? (portfolio.totalGainLoss / portfolio.totalCostBasis) * 100 : 0
  const dayChange = positionsSnapshot?.positions.reduce((sum, position) => sum + (position.todaysGainLossDollar ?? 0), 0) ?? 0
  const holdingsCount = holdings.length
  const largestHolding = holdings.slice().sort((a, b) => b.marketValue - a.marketValue)[0]
  const largestHoldingWeight = largestHolding && portfolio.totalMarketValue ? (largestHolding.marketValue / portfolio.totalMarketValue) * 100 : 0
  const largestWinner = holdings.filter((holding) => holding.gainLoss > 0).sort((a, b) => b.gainLoss - a.gainLoss)[0]
  const largestLoser = holdings.filter((holding) => holding.gainLoss < 0).sort((a, b) => a.gainLoss - b.gainLoss)[0]
  const portfolioDividendYield = portfolio.totalMarketValue ? (dividendIncome / portfolio.totalMarketValue) * 100 : 0
  const averagePositionSize = holdingsCount ? portfolio.totalMarketValue / holdingsCount : 0
  const donutData = holdings.slice().sort((a, b) => b.marketValue - a.marketValue).map((holding) => ({ ticker: holding.symbol, name: holding.securityName ?? holding.symbol, value: holding.marketValue }))
  const totalDividendIncome = holdings.reduce((sum, holding) => sum + (holding.estimatedAnnualIncome ?? 0), 0)
  const incomeByHolding = holdings
    .filter((holding) => (holding.estimatedAnnualIncome ?? 0) > 0)
    .sort((a, b) => (b.estimatedAnnualIncome ?? 0) - (a.estimatedAnnualIncome ?? 0))
  const gainLossPositions = positionsSnapshot?.positions.filter((position) => position.totalGainLossDollar !== undefined && position.totalGainLossDollar !== 0) ?? []
  const hasGainLossLeaders = gainLossPositions.length > 0
  const topGainers = gainLossPositions.filter((position) => (position.totalGainLossDollar ?? 0) > 0).sort((a, b) => (b.totalGainLossDollar ?? 0) - (a.totalGainLossDollar ?? 0)).slice(0, 3)
  const topLosers = gainLossPositions.filter((position) => (position.totalGainLossDollar ?? 0) < 0).sort((a, b) => (a.totalGainLossDollar ?? 0) - (b.totalGainLossDollar ?? 0)).slice(0, 3)
  const fullNetWorthAllocation = [
    ...(snapshotData?.accountAllocation.map((account) => ({
      ...account,
      share: netWorth ? (account.value / netWorth) * 100 : 0,
    })) ?? []),
    { accountName: 'HYSA', value: hysaSettings.balance, share: netWorth ? (hysaSettings.balance / netWorth) * 100 : 0 },
    { accountName: 'Checking / Bank Cash', value: bankCashSettings.balance, share: netWorth ? (bankCashSettings.balance / netWorth) * 100 : 0 },
  ].filter((item) => item.value > 0)

  function confirmPositionsImport(snapshot: PositionsSnapshot) {
    onPositionsSnapshotImport(snapshot)
    setIsPositionsImportOpen(false)
  }

  return (
    <div className="dashboard-grid">
      <div className="dashboard-header">
        <div>
          <div className="eyebrow">Net Worth Dashboard</div>
          <h1>PortfolioPilot</h1>
        </div>
        <div className="dashboard-actions">
          <button className="btn primary import-primary-btn" type="button" onClick={() => setIsPositionsImportOpen(true)}>Import Positions CSV</button>
          <button className="btn" type="button" onClick={() => setIsHysaModalOpen(true)}>Update HYSA</button>
          <button className="btn" type="button" onClick={() => setIsBankCashModalOpen(true)}>Update Bank Cash</button>
        </div>
      </div>

      <div className="net-worth-hero">
        <div className="net-worth-main">
          <span>Total Net Worth</span>
          <strong>{formatCurrency(netWorth, { compact: true })}</strong>
          <div className="hero-support-metrics">
            <div>
              <span>Unrealized Gain</span>
              <strong className={portfolio.totalGainLoss >= 0 ? 'positive' : 'negative'}>{formatSignedNumber(portfolio.totalGainLoss, { currency: true })}</strong>
            </div>
            <div>
              <span>Total Return</span>
              <strong>{formatPercent(unrealizedReturn)}</strong>
            </div>
            <div>
              <span>Annual Passive Income</span>
              <strong>{formatCurrency(passiveIncome, { compact: true })}</strong>
            </div>
          </div>
          <em>Investment Portfolio + HYSA + Checking / Bank Cash</em>
        </div>
        <div className="net-worth-formula">
          <div>
            <span>Investments</span>
            <strong>{formatCurrency(portfolio.totalMarketValue, { compact: true })}</strong>
            <em>{formatPercent(netWorth ? (portfolio.totalMarketValue / netWorth) * 100 : 0)}</em>
          </div>
          <div>
            <span>HYSA</span>
            <strong>{formatCurrency(hysaSettings.balance, { compact: true })}</strong>
            <em>{formatPercent(netWorth ? (hysaSettings.balance / netWorth) * 100 : 0)}</em>
          </div>
          <div>
            <span>Bank Cash</span>
            <strong>{formatCurrency(bankCashSettings.balance, { compact: true })}</strong>
            <em>{formatPercent(netWorth ? (bankCashSettings.balance / netWorth) * 100 : 0)}</em>
          </div>
        </div>
      </div>

      <div className="source-pill-row compact-source-row">
        <span className="source-pill">{positionsSnapshot ? `Positions CSV imported ${new Date(positionsSnapshot.importedAt).toLocaleString()}` : 'Import positions CSV to populate investments'}</span>
        <span className="source-pill muted-source">HYSA and bank cash are manual</span>
      </div>

      <div className="metrics-row">
        <MetricCard title="Investment Portfolio" value={formatCurrency(portfolio.totalMarketValue, { compact: true })} sub={positionsSnapshot ? 'From Fidelity positions CSV' : 'Import positions CSV to populate'} positive />
        <MetricCard title="HYSA Balance" value={formatCurrency(hysaSettings.balance, { compact: true })} sub={`${formatPercent(hysaSettings.apy)} APY, daily compounding estimate`} positive />
        <MetricCard title="Checking / Bank Cash" value={formatCurrency(bankCashSettings.balance, { compact: true })} sub={bankCashSettings.notes || 'Manual cash balance'} />
        <MetricCard title="Unrealized P/L" value={formatSignedNumber(portfolio.totalGainLoss, { currency: true })} sub={`${formatPercent(unrealizedReturn)} total return today ${formatSignedNumber(dayChange, { currency: true })}`} positive={portfolio.totalGainLoss >= 0} />
        <MetricCard title="Passive Income" value={formatCurrency(passiveIncome, { compact: true })} sub={`${formatCurrency(dividendIncome, { compact: true })} dividends + HYSA interest`} positive />
      </div>

      <div className={hasGainLossLeaders ? 'snapshot-overview-grid' : 'snapshot-overview-grid no-leaders'}>
        <Card className="card-allocation">
          <div className="chart-header">
            <div>
              <h3>Allocation by Holding</h3>
              <p className="panel-subtitle">Ranked portfolio weights from Fidelity positions CSV.</p>
            </div>
          </div>
          {holdings.length ? (
            <DonutChart
              data={donutData}
              total={portfolio.totalMarketValue}
              holdingsCount={holdingsCount}
            />
          ) : <div className="source-empty">Import a Fidelity positions CSV to see holding allocation.</div>}
        </Card>

        <Card className="snapshot-panel portfolio-stats-card">
          <div className="chart-header">
            <div>
              <h3>Portfolio Statistics</h3>
              <p className="panel-subtitle">Snapshot summary from imported holdings.</p>
            </div>
          </div>
          <div className="portfolio-stats-grid">
            <div>
              <span>Holdings</span>
              <strong>{holdingsCount}</strong>
            </div>
            <div>
              <span>Largest Position</span>
              <strong>{largestHolding?.symbol ?? '-'}</strong>
              <em>{largestHolding ? `${formatCurrency(largestHolding.marketValue, { compact: true })} · ${formatPercent(largestHoldingWeight)}` : '-'}</em>
            </div>
            <div>
              <span>Largest Winner</span>
              <strong className="positive">{largestWinner?.symbol ?? '-'}</strong>
              <em className="positive">{largestWinner ? formatSignedNumber(largestWinner.gainLoss, { currency: true }) : '-'}</em>
            </div>
            <div>
              <span>Largest Loser</span>
              <strong className="negative">{largestLoser?.symbol ?? '-'}</strong>
              <em className="negative">{largestLoser ? formatSignedNumber(largestLoser.gainLoss, { currency: true }) : '-'}</em>
            </div>
            <div>
              <span>Dividend Yield</span>
              <strong>{formatPercent(portfolioDividendYield)}</strong>
            </div>
            <div>
              <span>Avg. Position Size</span>
              <strong>{formatCurrency(averagePositionSize, { compact: true })}</strong>
            </div>
          </div>
        </Card>

        <Card className="snapshot-panel">
          <div className="chart-header">
            <div>
              <h3>Net Worth Allocation</h3>
              <p className="panel-subtitle">Investment accounts, HYSA, and Checking / Bank Cash.</p>
            </div>
          </div>
          <div className="account-allocation-list">
            {fullNetWorthAllocation.map((account) => (
              <div key={account.accountName}>
                <span>{account.accountName}</span>
                <div className="income-holding-bar"><i style={{ width: `${Math.min(account.share, 100)}%` }} /></div>
                <strong>{formatCurrency(account.value, { compact: true })} <em>{formatPercent(account.share)}</em></strong>
              </div>
            ))}
            {!fullNetWorthAllocation.length && <div className="source-empty">Import positions or update cash balances to see net worth allocation.</div>}
          </div>
        </Card>

        {hasGainLossLeaders && (
          <Card className="snapshot-panel">
            <div className="chart-header">
              <div>
                <h3>Gain / Loss Leaders</h3>
                <p className="panel-subtitle">Current total gain/loss from positions snapshot.</p>
              </div>
            </div>
            <div className="snapshot-lists">
              <div>
                <span>Top gainers</span>
                {topGainers.map((position) => (
                  <strong className={(position.totalGainLossDollar ?? 0) >= 0 ? 'positive' : 'negative'} key={position.id}>{position.ticker} {formatSignedNumber(position.totalGainLossDollar ?? 0, { currency: true })}</strong>
                ))}
              </div>
              <div>
                <span>Top losers</span>
                {topLosers.map((position) => (
                  <strong className={(position.totalGainLossDollar ?? 0) >= 0 ? 'positive' : 'negative'} key={position.id}>{position.ticker} {formatSignedNumber(position.totalGainLossDollar ?? 0, { currency: true })}</strong>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      <Card className="passive-income-card">
        <div className="chart-header">
          <div>
            <div className="eyebrow">Passive Income</div>
            <h3>Total Passive Income</h3>
            <p className="panel-subtitle">Estimated annual dividends from positions CSV plus HYSA annual interest.</p>
          </div>
        </div>
        <div className="passive-income-total">
          <span>Total annual passive income</span>
          <strong>{formatCurrency(passiveIncome, { compact: true })}</strong>
        </div>
        <div className="passive-income-grid">
          <div><span>Annual dividends</span><strong>{formatCurrency(dividendIncome, { compact: true })}</strong></div>
          <div><span>Annual HYSA interest</span><strong>{formatCurrency(hysaIncome.annualInterest, { compact: true })}</strong></div>
          <div><span>Monthly passive income</span><strong>{formatCurrency(passiveIncome / 12)}</strong></div>
          <div><span>Daily passive income</span><strong>{formatCurrency(passiveIncome / 365)}</strong></div>
          <div><span>Hourly passive income</span><strong>{formatCurrency(passiveIncome / 365 / 24)}</strong></div>
          <div><span>Per minute passive income</span><strong>{formatCurrency(passiveIncome / 365 / 24 / 60)}</strong></div>
        </div>
      </Card>

      <div className="cash-and-income-grid">
        <Card className="cash-income-module">
          <div className="chart-header">
            <div>
              <h3>HYSA Interest</h3>
              <p className="panel-subtitle">Manual HYSA balance and APY. Daily compounding estimate.</p>
            </div>
          </div>
          <div className="hysa-income-grid">
            <div><span>HYSA balance</span><strong>{formatCurrency(hysaSettings.balance, { compact: true })}</strong></div>
            <div><span>APY</span><strong>{formatPercent(hysaSettings.apy)}</strong></div>
            <div><span>Annual interest</span><strong>{formatCurrency(hysaIncome.annualInterest, { compact: true })}</strong></div>
            <div><span>Monthly</span><strong>{formatCurrency(hysaIncome.monthlyInterest)}</strong></div>
            <div><span>Daily</span><strong>{formatCurrency(hysaIncome.dailyInterest)}</strong></div>
            <div><span>Hourly</span><strong>{formatCurrency(hysaIncome.hourlyInterest)}</strong></div>
            <div><span>Per minute</span><strong>{formatCurrency(hysaIncome.minuteInterest)}</strong></div>
          </div>
        </Card>

        <Card className="snapshot-panel">
          <div className="chart-header">
            <div>
              <div className="eyebrow">Dividends</div>
              <h3>Income by Holding</h3>
              <p className="panel-subtitle">Only holdings with Est. annual income greater than zero.</p>
            </div>
          </div>
          <div className="income-table-wrap">
            {incomeByHolding.length ? (
              <table className="income-table">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Name</th>
                    <th>Est. Annual Income</th>
                    <th>% of Dividend Income</th>
                    <th>Yield</th>
                    <th>Pay Date</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeByHolding.map((holding) => (
                    <tr key={`${holding.symbol}-income`}>
                      <td className="ticker-cell">{holding.symbol}</td>
                      <td>{holding.securityName ?? holding.symbol}</td>
                      <td className="numeric-cell">{formatCurrency(holding.estimatedAnnualIncome ?? 0)}</td>
                      <td className="numeric-cell">
                        <div className="dividend-contribution-cell">
                          <div className="dividend-contribution-track">
                            <i style={{ width: `${Math.min(totalDividendIncome ? ((holding.estimatedAnnualIncome ?? 0) / totalDividendIncome) * 100 : 0, 100)}%` }} />
                          </div>
                          <span>{formatPercent(totalDividendIncome ? ((holding.estimatedAnnualIncome ?? 0) / totalDividendIncome) * 100 : 0)}</span>
                        </div>
                      </td>
                      <td className="numeric-cell">{formatPercent(holding.distributionYield ?? holding.secYield ?? 0)}</td>
                      <td>{formatDate(holding.payDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="source-empty">No dividend income found in the imported positions CSV.</div>
            )}
          </div>
        </Card>
      </div>

      <Card className="card-holdings holdings-panel">
        <div className="chart-header holdings-title-row">
          <div>
            <h3>Current Holdings</h3>
            <p className="panel-subtitle">Holdings, value, cost basis, and gain/loss from Fidelity positions CSV.</p>
          </div>
          <div className="table-actions">
            <span>{holdings.length} securities</span>
          </div>
        </div>
        {holdings.length ? <HoldingsTable holdings={holdings} totalMarketValue={portfolio.totalMarketValue} /> : <div className="source-empty">Import a Fidelity positions CSV to populate current holdings.</div>}
      </Card>

      {isPositionsImportOpen && <ImportPositionsCsvModal existingSnapshot={positionsSnapshot} onConfirm={confirmPositionsImport} onCancel={() => setIsPositionsImportOpen(false)} />}
      {isHysaModalOpen && <HysaModal settings={hysaSettings} onSave={(settings) => { onHysaSettingsChange(settings); setIsHysaModalOpen(false) }} onCancel={() => setIsHysaModalOpen(false)} />}
      {isBankCashModalOpen && <BankCashModal settings={bankCashSettings} onSave={(settings) => { onBankCashSettingsChange(settings); setIsBankCashModalOpen(false) }} onCancel={() => setIsBankCashModalOpen(false)} />}
    </div>
  )
}
