import { useEffect, useState } from 'react'
import './App.css'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Holdings from './pages/Holdings'
import Dividends from './pages/Dividends'
import Tools from './pages/Tools'
import type { HysaSettings } from './types/hysa'
import type { View } from './types/navigation'
import type { Transaction } from './types/transaction'
import { loadHysaSettings, saveHysaSettings } from './utils/hysaStorage'
import { loadTransactions, saveTransactions } from './utils/transactionStorage'

function App() {
  const [view, setView] = useState<View>('Dashboard')
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions)
  const [hysaSettings, setHysaSettings] = useState<HysaSettings>(loadHysaSettings)

  useEffect(() => {
    saveTransactions(transactions)
  }, [transactions])

  useEffect(() => {
    saveHysaSettings(hysaSettings)
  }, [hysaSettings])

  function addTransaction(transaction: Transaction) {
    setTransactions((current) => [transaction, ...current])
  }

  function updateTransaction(updatedTransaction: Transaction) {
    setTransactions((current) => current.map((transaction) => (transaction.id === updatedTransaction.id ? updatedTransaction : transaction)))
  }

  function deleteTransaction(transactionId: string) {
    setTransactions((current) => current.filter((transaction) => transaction.id !== transactionId))
  }

  return (
    <Layout active={view} onChange={setView}>
      {view === 'Dashboard' && <Dashboard transactions={transactions} hysaSettings={hysaSettings} onHysaSettingsChange={setHysaSettings} />}
      {view === 'Transactions' && <Transactions transactions={transactions} onAdd={addTransaction} onUpdate={updateTransaction} onDelete={deleteTransaction} />}
      {view === 'Holdings' && <Holdings transactions={transactions} />}
      {view === 'Dividends' && <Dividends transactions={transactions} hysaSettings={hysaSettings} />}
      {view === 'Tools' && <Tools />}
    </Layout>
  )
}

export default App
