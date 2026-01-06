interface TransactionFormProps {
  newTransaction: {
    description: string
    amount: string
    transaction_type: string
    transaction_date: string
  }
  onTransactionChange: (transaction: {
    description: string
    amount: string
    transaction_type: string
    transaction_date: string
  }) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}

function TransactionForm({ newTransaction, onTransactionChange, onSubmit, loading }: TransactionFormProps) {
  return (
    <div className="card">
      <h2 className="card-title">Add Transaction</h2>
      
      <form onSubmit={onSubmit} className="form-container">
        <div className="form-row">
          <select
            value={newTransaction.transaction_type}
            onChange={(e) => onTransactionChange({...newTransaction, transaction_type: e.target.value})}
            className="form-select"
            disabled={loading}
          >
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
          
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Amount"
            value={newTransaction.amount}
            onChange={(e) => onTransactionChange({...newTransaction, amount: e.target.value})}
            className="form-input"
            disabled={loading}
          />
          
          <input
            type="date"
            value={newTransaction.transaction_date}
            onChange={(e) => onTransactionChange({...newTransaction, transaction_date: e.target.value})}
            className="form-input"
            disabled={loading}
          />
        </div>
        
        <textarea
          placeholder="Description (e.g., '50 chocolate chip cookies for wedding', 'Flour and sugar purchase', etc.)"
          value={newTransaction.description}
          onChange={(e) => onTransactionChange({...newTransaction, description: e.target.value})}
          className="form-textarea"
          rows={3}
          disabled={loading}
        />
        
        <button type="submit" className="form-button" disabled={loading}>
          Add Transaction
        </button>
      </form>
    </div>
  )
}

export default TransactionForm
