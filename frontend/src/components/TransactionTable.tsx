import type { Transaction } from '../types'

interface TransactionTableProps {
  transactions: Transaction[]
  onDelete: (id: string) => void
  loading: boolean
}

function TransactionTable({ transactions, onDelete, loading }: TransactionTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Date</th>
              <th className="table-header-cell">Description</th>
              <th className="table-header-cell">Type</th>
              <th className="table-header-cell-right">Amount</th>
              <th className="table-header-cell-center">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-cell-empty">
                  <div className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <p className="empty-state-title">No transactions yet</p>
                    <p className="empty-state-subtitle">Add your first transaction to get started!</p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="table-row">
                  <td className="table-cell">{transaction.transaction_date}</td>
                  <td className="table-cell-bold">{transaction.description}</td>
                  <td className="table-cell">
                    <span className={transaction.transaction_type === 'Income' ? 'badge-income' : 'badge-expense'}>
                      {transaction.transaction_type}
                    </span>
                  </td>
                  <td className={`table-cell-right ${transaction.transaction_type === 'Income' ? 'amount-income' : 'amount-expense'}`}>
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="table-cell-center">
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="button-delete"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TransactionTable