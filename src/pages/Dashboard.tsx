import { useState } from 'react'
import AllocationTreemap from '../components/AllocationTreemap'
import BankCashModal from '../components/BankCashModal'
import Card from '../components/Card'
import HoldingsTable from '../components/HoldingsTable'
import HysaModal from '../components/HysaModal'
import ImportPositionsCsvModal from '../components/ImportPositionsCsvModal'
import MetricCard from '../components/MetricCard'
import type { BankCashSettings } from '../types/bankCash'
import type { HysaSettings } from '../types/hysa'
import type { PositionsSnapshot } from '../types/position'
import type { SchgGoalSettings } from '../types/schgGoal'
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
  schgGoalSettings: SchgGoalSettings
  onSchgGoalSettingsChange: (settings: SchgGoalSettings) => void
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
  schgGoalSettings,
  onSchgGoalSettingsChange,
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
  const sortedHoldings = holdings.slice().sort((a, b) => b.marketValue - a.marketValue)
  const allocationData = sortedHoldings.map((holding) => ({ ticker: holding.symbol, name: holding.securityName ?? holding.symbol, value: holding.marketValue }))
  const schgHoldings = holdings.filter((holding) => holding.symbol.toUpperCase() === 'SCHG')
  const schgValue = schgHoldings.reduce((sum, holding) => sum + holding.marketValue, 0)
  const schgShares = schgHoldings.reduce((sum, holding) => sum + holding.quantity, 0)
  const schgPrice = schgHoldings.find((holding) => holding.marketPrice > 0)?.marketPrice ?? (schgShares ? schgValue / schgShares : 0)
  const schgCurrentWeight = portfolio.totalMarketValue ? (schgValue / portfolio.totalMarketValue) * 100 : 0
  const schgTargetPercent = schgGoalSettings.targetAllocationPercent
  const schgTargetValue = portfolio.totalMarketValue * (schgTargetPercent / 100)
  const schgDollarGap = Math.max(schgTargetValue - schgValue, 0)
  const schgSharesNeeded = schgPrice ? schgDollarGap / schgPrice : 0
  const schgProgress = schgTargetPercent ? Math.min((schgCurrentWeight / schgTargetPercent) * 100, 100) : 0
  const concentrationTop1 = portfolio.totalMarketValue ? (sortedHoldings.slice(0, 1).reduce((sum, holding) => sum + holding.marketValue, 0) / portfolio.totalMarketValue) * 100 : 0
  const concentrationTop3 = portfolio.totalMarketValue ? (sortedHoldings.slice(0, 3).reduce((sum, holding) => sum + holding.marketValue, 0) / portfolio.totalMarketValue) * 100 : 0
  const concentrationTop5 = portfolio.totalMarketValue ? (sortedHoldings.slice(0, 5).reduce((sum, holding) => sum + holding.marketValue, 0) / portfolio.totalMarketValue) * 100 : 0
  const concentrationTop10 = portfolio.totalMarketValue ? (sortedHoldings.slice(0, 10).reduce((sum, holding) => sum + holding.marketValue, 0) / portfolio.totalMarketValue) * 100 : 0
  const totalDividendIncome = holdings.reduce((sum, holding) => sum + (holding.estimatedAnnualIncome ?? 0), 0)
  const incomeByHolding = holdings
    .filter((holding) => (holding.estimatedAnnualIncome ?? 0) > 0)
    .sort((a, b) => (b.estimatedAnnualIncome ?? 0) - (a.estimatedAnnualIncome ?? 0))
  const gainLeaders = holdings
    .filter((holding) => holding.gainLoss > 0)
    .sort((a, b) => b.gainLoss - a.gainLoss)
    .slice(0, 5)
  const hasGainLeaders = gainLeaders.length > 0
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

  function updateSchgTarget(value: string) {
    const parsed = Number(value)

    onSchgGoalSettingsChange({
      targetAllocationPercent: Number.isFinite(parsed) ? Math.max(0, Math.min(parsed, 100)) : 50,
    })
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

      <div className={hasGainLeaders ? 'snapshot-overview-grid' : 'snapshot-overview-grid no-leaders'}>
        <Card className="card-allocation">
          <div className="chart-header">
            <div>
              <h3>Portfolio Allocation</h3>
              <p className="panel-subtitle">Ranked portfolio weights from Fidelity positions CSV.</p>
            </div>
          </div>
          {holdings.length ? (
            <AllocationTreemap
              data={allocationData}
              total={portfolio.totalMarketValue}
              concentration={[
                { label: 'Top 1', value: concentrationTop1 },
                { label: 'Top 3', value: concentrationTop3 },
                { label: 'Top 5', value: concentrationTop5 },
                { label: 'Top 10', value: concentrationTop10 },
              ]}
            />
          ) : <div className="source-empty">Import a Fidelity positions CSV to see holding allocation.</div>}
        </Card>

        <Card className="snapshot-panel schg-goal-card">
          <div className="chart-header">
            <div>
              <h3>SCHG Goal</h3>
              <p className="panel-subtitle">Current-data allocation target from imported holdings.</p>
            </div>
            <label className="schg-target-input">
              <span>Target</span>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={Number(schgTargetPercent).toString()}
                onChange={(event) => updateSchgTarget(event.target.value)}
              />
              <em>%</em>
            </label>
          </div>
          <div className="schg-allocation-hero">
            <div>
              <span>Current</span>
              <strong>{formatPercent(schgCurrentWeight)}</strong>
            </div>
            <div>
              <span>Target</span>
              <strong>{formatPercent(schgTargetPercent)}</strong>
            </div>
          </div>
          <div className="schg-progress-track"><i style={{ width: `${schgProgress}%` }} /></div>
          <div className="schg-completion-line">{formatPercent(schgProgress)} of goal completed</div>
          <div className="schg-value-target">
            <span>SCHG value</span>
            <strong>{formatCurrency(schgValue, { compact: true })} / {formatCurrency(schgTargetValue, { compact: true })}</strong>
          </div>
          <div className="schg-gap-callout">Need {formatCurrency(schgDollarGap, { compact: true })} more</div>
          <div className="schg-goal-footer">
            <div><span>Price</span><strong>{schgPrice ? formatCurrency(schgPrice) : '-'}</strong></div>
            <div><span>Shares</span><strong>{schgShares.toLocaleString(undefined, { maximumFractionDigits: 4 })}</strong></div>
            <div><span>Approx needed</span><strong>{schgPrice ? Math.ceil(schgSharesNeeded).toLocaleString() : '-'}</strong></div>
          </div>
        </Card>

        <Card className="snapshot-panel net-worth-allocation-card">
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

        <Card className="snapshot-panel passive-income-card">
          <div className="chart-header">
            <div>
              <div className="eyebrow">Passive Income</div>
              <h3>Total Passive Income</h3>
              <p className="panel-subtitle">Dividends plus HYSA annual interest.</p>
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
          </div>
        </Card>

        {hasGainLeaders && (
          <Card className="snapshot-panel gain-leaders-card">
            <div className="chart-header">
              <div>
                <h3>Gain Leaders</h3>
                <p className="panel-subtitle">Top unrealized dollar gains from current holdings.</p>
              </div>
            </div>
            <div className="gain-leaders-table">
              {gainLeaders.map((holding) => {
                const returnPercent = holding.totalGainLossPercent ?? (holding.costBasis ? (holding.gainLoss / holding.costBasis) * 100 : 0)

                return (
                  <div key={`${holding.symbol}-${holding.accountName ?? 'account'}-gain`}>
                    <span>{holding.symbol}</span>
                    <strong>{formatSignedNumber(holding.gainLoss, { currency: true })}</strong>
                    <em>{returnPercent > 0 ? '+' : ''}{formatPercent(returnPercent)}</em>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>

      <div className="cash-and-income-grid">
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
