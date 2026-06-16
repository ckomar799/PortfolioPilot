import MetricCard from '../components/MetricCard'
import { calculateHoldings } from '../utils/calcHoldings'
import Card from '../components/Card'
import DonutChart from '../components/DonutChart'
import LineChart from '../components/LineChart'
import HoldingsTable from '../components/HoldingsTable'
import ToolsGrid from '../components/ToolsGrid'
import type { HysaSettings } from '../types/hysa'
import { formatCurrency, formatPercent, formatSignedNumber } from '../utils/format'
import { calculateHysaIncome, calculateTotalPassiveIncome } from '../utils/hysa'
import type { Transaction } from '../types/transaction'

type DashboardProps = {
  transactions: Transaction[]
  hysaSettings: HysaSettings
  onHysaSettingsChange: (settings: HysaSettings) => void
}

export default function Dashboard({ transactions, hysaSettings, onHysaSettingsChange }: DashboardProps) {
  const { holdings, portfolio } = calculateHoldings(transactions)
  const hysaIncome = calculateHysaIncome(hysaSettings)
  const totalIncome = calculateTotalPassiveIncome(portfolio.annualDividends, hysaIncome)

  const sortedHoldings = holdings.slice().sort((a, b) => b.marketValue - a.marketValue)
  const donutData = sortedHoldings.map((h) => ({ name: h.symbol, value: h.marketValue }))
  const unrealizedReturn = portfolio.totalCostBasis ? (portfolio.totalGainLoss / portfolio.totalCostBasis) * 100 : 0
  const cashReserve = Math.round(portfolio.totalMarketValue * 0.035)
  const buyingPower = Math.round(cashReserve * 0.72)
  const dayChange = Math.round(portfolio.totalMarketValue * 0.0084)
  const dividendGrowthAssumption = 6
  const monthlyDividendIncome = portfolio.annualDividends / 12
  const weeklyDividendIncome = portfolio.annualDividends / 52
  const dailyDividendIncome = portfolio.annualDividends / 365
  const hourlyDividendIncome = dailyDividendIncome / 24
  const minuteDividendIncome = hourlyDividendIncome / 60
  const estimatedDividendsToday = dailyDividendIncome
  const yieldOnCost = portfolio.totalCostBasis ? (portfolio.annualDividends / portfolio.totalCostBasis) * 100 : 0
  const fiveYearDividendIncome = Math.round(portfolio.annualDividends * Math.pow(1 + dividendGrowthAssumption / 100, 5))
  const tenYearDividendIncome = Math.round(portfolio.annualDividends * Math.pow(1 + dividendGrowthAssumption / 100, 10))
  const incomeByHolding = sortedHoldings
    .filter((h) => h.annualDividends > 0)
    .map((h) => ({
      symbol: h.symbol,
      income: h.annualDividends,
      share: portfolio.annualDividends ? (h.annualDividends / portfolio.annualDividends) * 100 : 0,
    }))

  function updateHysaField(field: keyof HysaSettings, value: string) {
    onHysaSettingsChange({
      ...hysaSettings,
      [field]: field === 'accountName' ? value : Number(value) || 0,
    })
  }

  const lineData = [
    ['Jan 03', 0.91],
    ['Jan 19', 0.935],
    ['Feb 02', 0.922],
    ['Feb 16', 0.958],
    ['Mar 01', 0.947],
    ['Mar 15', 0.982],
    ['Apr 01', 0.971],
    ['Apr 18', 1.006],
    ['May 03', 1.021],
    ['May 17', 1.012],
    ['Jun 03', 1.038],
    ['Jun 14', 1],
  ].map(([date, multiplier]) => ({ date: String(date), value: Math.round(portfolio.totalMarketValue * Number(multiplier)) }))

  return (
    <div className="dashboard-grid">
      <div className="dashboard-header">
        <div>
          <div className="eyebrow">Portfolio Command Center</div>
          <h1>Investment Dashboard</h1>
          <p className="muted">Consolidated view across taxable brokerage, retirement, and dividend income accounts.</p>
        </div>
        <div className="header-context">
          <div>
            <span>As of</span>
            <strong>Jun 16, 2026 3:55 AM ET</strong>
          </div>
          <div>
            <span>Data quality</span>
            <strong>3 positions reconciled</strong>
          </div>
        </div>
      </div>

      <div className="metrics-row">
        <MetricCard title="Portfolio Value" value={formatCurrency(portfolio.totalMarketValue, { compact: true })} sub={`${formatSignedNumber(dayChange, { currency: true })} intraday move`} trend="+0.84%" positive />
        <MetricCard title="Net Invested" value={formatCurrency(portfolio.totalCostBasis, { compact: true })} sub="Average cost basis across open lots" trend="0.00%" />
        <MetricCard title="Unrealized P/L" value={formatSignedNumber(portfolio.totalGainLoss, { currency: true })} sub={`${formatPercent(unrealizedReturn)} total return`} trend="+1.18%" positive={portfolio.totalGainLoss >= 0} />
        <MetricCard title="Forward Income" value={formatCurrency(portfolio.annualDividends, { compact: true })} sub={`${formatPercent(portfolio.yield)} portfolio yield`} trend="+0.12%" positive />
        <MetricCard title="Cash Buffer" value={formatCurrency(cashReserve, { compact: true })} sub={`${formatCurrency(buyingPower, { compact: true })} available to deploy`} trend="3.5%" />
      </div>

      <div className="dashboard-main">
        <Card className="card-line performance-panel">
          <div className="chart-header">
            <div>
              <h3>Portfolio Performance</h3>
              <p className="panel-subtitle">YTD market value, including deposits, distributions, and unrealized appreciation.</p>
            </div>
            <div className="chart-controls">
              <span className="active">YTD</span>
              <span>1Y</span>
              <span>3Y</span>
            </div>
          </div>
          <LineChart data={lineData} />
          <div className="performance-stats">
            <div><span>Start Value</span><strong>{formatCurrency(lineData[0].value, { compact: true })}</strong></div>
            <div><span>Peak Value</span><strong>{formatCurrency(Math.max(...lineData.map((d) => d.value)), { compact: true })}</strong></div>
            <div><span>Volatility</span><strong>Moderate</strong></div>
            <div><span>Benchmark Gap</span><strong className="positive">+1.9%</strong></div>
          </div>
        </Card>
      </div>

      <Card className="card-holdings holdings-panel">
        <div className="chart-header holdings-title-row">
          <div>
            <h3>Holdings Detail</h3>
            <p className="panel-subtitle">Open positions with cost basis, yield, allocation weight, and unrealized return.</p>
          </div>
          <div className="table-actions">
            <span>{holdings.length} securities</span>
            <button className="btn small">+ Add Position</button>
          </div>
        </div>
        <HoldingsTable holdings={sortedHoldings} totalMarketValue={portfolio.totalMarketValue} />
      </Card>

      <Card className="dividend-intelligence">
        <div className="dividend-intelligence-header">
          <div>
            <div className="eyebrow">Dividend Growth Tracking</div>
            <h3>Dividend Intelligence</h3>
            <p className="panel-subtitle">Income planning view based on current annual dividends. Projection figures use a clearly labeled mock growth assumption for now.</p>
          </div>
          <div className="dividend-status">
            <span>DRIP status</span>
            <strong>Enabled for eligible holdings</strong>
            <em>Mock status until account settings exist</em>
          </div>
        </div>

        <div className="dividend-intelligence-grid">
          <div className="income-rate-card">
            <div className="rate-card-header">
              <span>Dividend Income Rate</span>
              <strong>{formatCurrency(portfolio.annualDividends, { compact: true })}/yr</strong>
            </div>
            <div className="rate-grid">
              <div>
                <span>Per month</span>
                <strong>{formatCurrency(monthlyDividendIncome)}</strong>
              </div>
              <div>
                <span>Per week</span>
                <strong>{formatCurrency(weeklyDividendIncome)}</strong>
              </div>
              <div>
                <span>Per day</span>
                <strong>{formatCurrency(dailyDividendIncome)}</strong>
              </div>
              <div>
                <span>Per hour</span>
                <strong>{formatCurrency(hourlyDividendIncome)}</strong>
              </div>
              <div>
                <span>Per minute</span>
                <strong>{formatCurrency(minuteDividendIncome)}</strong>
              </div>
            </div>
          </div>

          <div className="dividend-kpi-grid">
            <div><span>Current annual income</span><strong>{formatCurrency(portfolio.annualDividends, { compact: true })}</strong></div>
            <div><span>Estimated earned today</span><strong>{formatCurrency(estimatedDividendsToday)}</strong></div>
            <div><span>Portfolio yield</span><strong>{formatPercent(portfolio.yield)}</strong></div>
            <div><span>Yield on cost</span><strong>{formatPercent(yieldOnCost)}</strong></div>
            <div><span>Growth assumption</span><strong>{formatPercent(dividendGrowthAssumption)}</strong><em>Mock projection input</em></div>
            <div><span>5-year income estimate</span><strong>{formatCurrency(fiveYearDividendIncome, { compact: true })}</strong><em>Projected/mock</em></div>
            <div><span>10-year income estimate</span><strong>{formatCurrency(tenYearDividendIncome, { compact: true })}</strong><em>Projected/mock</em></div>
            <div><span>Next dividend review</span><strong>Jul 01, 2026</strong></div>
          </div>

          <div className="income-by-holding">
            <div className="mini-section-heading">
              <span>Income by holding</span>
              <strong>{incomeByHolding.length} payers</strong>
            </div>
            <div className="income-holding-list">
              {incomeByHolding.map((h) => (
                <div key={h.symbol}>
                  <span>{h.symbol}</span>
                  <div className="income-holding-bar"><i style={{ width: `${Math.min(h.share, 100)}%` }} /></div>
                  <strong>{formatCurrency(h.income)} <em>{formatPercent(h.share)}</em></strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="income-modules-grid">
        <Card className="cash-income-module">
          <div className="chart-header">
            <div>
              <div className="eyebrow">Cash Yield</div>
              <h3>Cash & HYSA Income</h3>
              <p className="panel-subtitle">Estimated interest from high-yield savings settings stored locally.</p>
            </div>
            <div className="small-muted">daily compounding estimate</div>
          </div>

          <div className="hysa-settings-grid">
            <label>
              <span>HYSA account</span>
              <input value={hysaSettings.accountName} onChange={(event) => updateHysaField('accountName', event.target.value)} />
            </label>
            <label>
              <span>Balance</span>
              <input type="number" min="0" step="any" value={hysaSettings.balance} onChange={(event) => updateHysaField('balance', event.target.value)} />
            </label>
            <label>
              <span>APY</span>
              <input type="number" min="0" step="any" value={hysaSettings.apy} onChange={(event) => updateHysaField('apy', event.target.value)} />
            </label>
          </div>

          <div className="hysa-income-grid">
            <div><span>Annual interest</span><strong>{formatCurrency(hysaIncome.annualInterest, { compact: true })}</strong></div>
            <div><span>Monthly</span><strong>{formatCurrency(hysaIncome.monthlyInterest)}</strong></div>
            <div><span>Weekly</span><strong>{formatCurrency(hysaIncome.weeklyInterest)}</strong></div>
            <div><span>Daily</span><strong>{formatCurrency(hysaIncome.dailyInterest)}</strong></div>
            <div><span>Hourly</span><strong>{formatCurrency(hysaIncome.hourlyInterest)}</strong></div>
            <div><span>Per minute</span><strong>{formatCurrency(hysaIncome.minuteInterest)}</strong></div>
          </div>
        </Card>

        <Card className="total-income-module">
          <div className="chart-header">
            <div>
              <div className="eyebrow">Passive Income</div>
              <h3>Total Income</h3>
              <p className="panel-subtitle">Combined forward dividends and estimated HYSA interest.</p>
            </div>
          </div>

          <div className="total-income-hero">
            <span>Total annual passive income</span>
            <strong>{formatCurrency(totalIncome.annualTotal, { compact: true })}</strong>
          </div>

          <div className="total-income-grid">
            <div><span>Forward dividends</span><strong>{formatCurrency(totalIncome.annualDividends, { compact: true })}</strong></div>
            <div><span>HYSA interest</span><strong>{formatCurrency(totalIncome.annualHysaInterest, { compact: true })}</strong></div>
            <div><span>Monthly total</span><strong>{formatCurrency(totalIncome.monthlyTotal)}</strong></div>
            <div><span>Daily total</span><strong>{formatCurrency(totalIncome.dailyTotal)}</strong></div>
            <div><span>Hourly total</span><strong>{formatCurrency(totalIncome.hourlyTotal)}</strong></div>
            <div><span>Per minute</span><strong>{formatCurrency(totalIncome.minuteTotal)}</strong></div>
          </div>
        </Card>
      </div>

      <div className="secondary-grid">
        <Card className="card-allocation">
          <div className="chart-header">
            <div>
              <h3>Allocation</h3>
              <p className="panel-subtitle">Position weights by current market value.</p>
            </div>
          </div>
          <DonutChart data={donutData} total={portfolio.totalMarketValue} />
        </Card>

        <Card className="card-tools">
          <div className="chart-header">
            <div>
              <h3>Tools & Calculators</h3>
              <p className="panel-subtitle">Quick actions for contribution planning, income checks, and allocation work.</p>
            </div>
          </div>
          <ToolsGrid />
        </Card>
      </div>
    </div>
  )
}
