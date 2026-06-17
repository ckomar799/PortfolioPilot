import { useEffect, useState } from 'react'
import './App.css'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import type { BankCashSettings } from './types/bankCash'
import type { HysaSettings } from './types/hysa'
import type { PositionsSnapshot } from './types/position'
import type { QqqmGoalSettings } from './types/qqqmGoal'
import { loadBankCashSettings, saveBankCashSettings } from './utils/bankCashStorage'
import { loadHysaSettings, saveHysaSettings } from './utils/hysaStorage'
import { loadPositionsSnapshot, savePositionsSnapshot } from './utils/positionsStorage'
import { loadQqqmGoalSettings, saveQqqmGoalSettings } from './utils/qqqmGoalStorage'

function App() {
  const [hysaSettings, setHysaSettings] = useState<HysaSettings>(loadHysaSettings)
  const [bankCashSettings, setBankCashSettings] = useState<BankCashSettings>(loadBankCashSettings)
  const [positionsSnapshot, setPositionsSnapshot] = useState<PositionsSnapshot | undefined>(loadPositionsSnapshot)
  const [qqqmGoalSettings, setQqqmGoalSettings] = useState<QqqmGoalSettings>(loadQqqmGoalSettings)

  useEffect(() => {
    saveHysaSettings(hysaSettings)
  }, [hysaSettings])

  useEffect(() => {
    saveBankCashSettings(bankCashSettings)
  }, [bankCashSettings])

  useEffect(() => {
    savePositionsSnapshot(positionsSnapshot)
  }, [positionsSnapshot])

  useEffect(() => {
    saveQqqmGoalSettings(qqqmGoalSettings)
  }, [qqqmGoalSettings])

  return (
    <Layout>
      <Dashboard
        positionsSnapshot={positionsSnapshot}
        onPositionsSnapshotImport={setPositionsSnapshot}
        hysaSettings={hysaSettings}
        onHysaSettingsChange={setHysaSettings}
        bankCashSettings={bankCashSettings}
        onBankCashSettingsChange={setBankCashSettings}
        qqqmGoalSettings={qqqmGoalSettings}
        onQqqmGoalSettingsChange={setQqqmGoalSettings}
      />
    </Layout>
  )
}

export default App
