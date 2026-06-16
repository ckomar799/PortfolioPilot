import { useState } from 'react'
import './App.css'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Holdings from './pages/Holdings'
import Dividends from './pages/Dividends'
import Tools from './pages/Tools'
import type { View } from './types/navigation'

function App() {
  const [view, setView] = useState<View>('Dashboard')

  return (
    <Layout active={view} onChange={setView}>
      {view === 'Dashboard' && <Dashboard />}
      {view === 'Transactions' && <Transactions />}
      {view === 'Holdings' && <Holdings />}
      {view === 'Dividends' && <Dividends />}
      {view === 'Tools' && <Tools />}
    </Layout>
  )
}

export default App
