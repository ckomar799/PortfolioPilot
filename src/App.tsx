import { useEffect, useState } from 'react'
import './App.css'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import type { BankCashSettings } from './types/bankCash'
import type { HysaSettings } from './types/hysa'
import type { PositionsSnapshot } from './types/position'
import type { SchgGoalSettings } from './types/schgGoal'
import { loadBankCashSettings, saveBankCashSettings } from './utils/bankCashStorage'
import { loadHysaSettings, saveHysaSettings } from './utils/hysaStorage'
import { loadPositionsSnapshot, savePositionsSnapshot } from './utils/positionsStorage'
import { loadSchgGoalSettings, saveSchgGoalSettings } from './utils/schgGoalStorage'

function App() {
  const [hysaSettings, setHysaSettings] = useState<HysaSettings>(loadHysaSettings)
  const [bankCashSettings, setBankCashSettings] = useState<BankCashSettings>(loadBankCashSettings)
  const [positionsSnapshot, setPositionsSnapshot] = useState<PositionsSnapshot | undefined>(loadPositionsSnapshot)
  const [schgGoalSettings, setSchgGoalSettings] = useState<SchgGoalSettings>(loadSchgGoalSettings)

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
    saveSchgGoalSettings(schgGoalSettings)
  }, [schgGoalSettings])

  return (
    <Layout>
      <Dashboard
        positionsSnapshot={positionsSnapshot}
        onPositionsSnapshotImport={setPositionsSnapshot}
        hysaSettings={hysaSettings}
        onHysaSettingsChange={setHysaSettings}
        bankCashSettings={bankCashSettings}
        onBankCashSettingsChange={setBankCashSettings}
        schgGoalSettings={schgGoalSettings}
        onSchgGoalSettingsChange={setSchgGoalSettings}
      />
    </Layout>
  )
}

export default App
