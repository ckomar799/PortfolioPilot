import { useMemo, useState } from 'react'
import TransactionModal from '../components/TransactionModal'
import type { Transaction } from '../types/transaction'
import { TRANSACTION_TYPE_LABELS } from '../types/transaction'
import { formatCurrency } from '../utils/format'

type TransactionsProps = {
  transactions: Transaction[]
  onAdd: (transaction: Transaction) => void
  onUpdate: (transaction: Transaction) => void
  onDelete: (transactionId: string) => void
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
})

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? date : dateFormatter.format(parsed)
}

function formatShares(value?: number) {
  return value === undefined ? '-' : value.toLocaleString('en-US', { maximumFractionDigits: 6 })
}

export default function Transactions({ transactions, onAdd, onUpdate, onDelete }: TransactionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>()
  const sortedTransactions = useMemo(() => transactions.slice().sort((a, b) => b.date.localeCompare(a.date)), [transactions])

  function openAddModal() {
    setEditingTransaction(undefined)
    setIsModalOpen(true)
  }

  function openEditModal(transaction: Transaction) {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingTransaction(undefined)
  }

  function saveTransaction(transaction: Transaction) {
    if (editingTransaction) {
      onUpdate(transaction)
    } else {
      onAdd(transaction)
    }
    closeModal()
  }

  function deleteTransaction(transaction: Transaction) {
    const label = transaction.ticker ? `${transaction.ticker} ${TRANSACTION_TYPE_LABELS[transaction.type]}` : TRANSACTION_TYPE_LABELS[transaction.type]
    if (window.confirm(`Delete ${label} transaction from ${formatDate(transaction.date)}?`)) {
      onDelete(transaction.id)
    }
  }

  return (
    <div className="page-simple transactions-page">
      <div className="transactions-header">
        <div>
          <div className="eyebrow">Ledger</div>
          <h1>Transactions</h1>
          <p className="muted">Activity history across brokerage, retirement, and dividend income accounts.</p>
        </div>
        <button className="btn primary" type="button" onClick={openAddModal}>+ Add Transaction</button>
      </div>

      <div className="tx-table-wrap">
        <table className="tx-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Ticker</th>
              <th>Security</th>
              <th>Account</th>
              <th>Shares</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((t) => (
              <tr key={t.id}>
                <td>{formatDate(t.date)}</td>
                <td><span className={`tx-badge ${t.type}`}>{TRANSACTION_TYPE_LABELS[t.type]}</span></td>
                <td className="ticker-cell">{t.ticker ?? '-'}</td>
                <td>{t.securityName ?? '-'}</td>
                <td>{t.account ?? '-'}</td>
                <td className="numeric-cell">{formatShares(t.shares)}</td>
                <td className="numeric-cell">{t.price ? formatCurrency(t.price) : '-'}</td>
                <td className="numeric-cell">{t.amount ? formatCurrency(t.amount) : '-'}</td>
                <td className="notes-cell">{t.notes ?? '-'}</td>
                <td>
                  <div className="tx-actions">
                    <button className="btn small" type="button" onClick={() => openEditModal(t)}>Edit</button>
                    <button className="btn small danger" type="button" onClick={() => deleteTransaction(t)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && <TransactionModal transaction={editingTransaction} onSave={saveTransaction} onCancel={closeModal} />}
    </div>
  )
}
