import { useState, useEffect, useCallback } from 'react'

interface Transaction {
  id: string
  description: string
  amount: number
  transaction_type: string
  transaction_date: string
}

interface User {
  id: string
  email: string
  name: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedTab, setSelectedTab] = useState('transactions')
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    transaction_type: 'Income',
    transaction_date: new Date().toISOString().split('T')[0]
  })
  const [incomeStatement, setIncomeStatement] = useState({
    income: 0,
    expenses: 0,
    net_income: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem('user')
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setLoginLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(data.user))
        setLoginData({ email: '', password: '' })
      } else {
        setLoginError(data.detail || 'Invalid email or password')
      }
    } catch (error) {
      console.error('Login error:', error)
      setLoginError('Connection error. Please check if the server is running.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
    setTransactions([])
    setIncomeStatement({ income: 0, expenses: 0, net_income: 0 })
  }

  const loadTransactions = useCallback(async (startDate?: string, endDate?: string) => {
    if (!isAuthenticated) return
    
    try {
      setLoading(true)
      setError(null)
      
      let url = `${API_URL}/api/transactions`
      const params = new URLSearchParams()
      
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      } else {
        setError('Failed to load transactions')
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
      setError('Error loading transactions. Please check if the server is running.')
    } finally {
      setLoading(false)
    }
  }, [API_URL, isAuthenticated])

  const loadIncomeStatement = useCallback(async (startDate?: string, endDate?: string) => {
    if (!isAuthenticated) return
    
    try {
      setLoading(true)
      setError(null)
      
      let url = `${API_URL}/api/reports/income-statement`
      const params = new URLSearchParams()
      
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setIncomeStatement(data)
      } else {
        setError('Failed to load income statement')
      }
    } catch (error) {
      console.error('Error loading income statement:', error)
      setError('Error loading income statement')
    } finally {
      setLoading(false)
    }
  }, [API_URL, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      const initializeData = async () => {
        await Promise.all([
          loadTransactions(),
          loadIncomeStatement()
        ])
      }
      initializeData()
    }
  }, [isAuthenticated, loadTransactions, loadIncomeStatement])

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTransaction.description || !newTransaction.amount) {
      setError('Please fill in all fields')
      return
    }

    const amount = parseFloat(newTransaction.amount)
    if (amount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTransaction,
          amount: amount,
          transaction_date: newTransaction.transaction_date
        })
      })

      if (response.ok) {
        setNewTransaction({
          description: '',
          amount: '',
          transaction_type: 'Income',
          transaction_date: new Date().toISOString().split('T')[0]
        })
        await Promise.all([
          loadTransactions(),
          loadIncomeStatement()
        ])
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Error creating transaction')
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
      setError('Error creating transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await Promise.all([
          loadTransactions(dateRange.startDate, dateRange.endDate),
          loadIncomeStatement(dateRange.startDate, dateRange.endDate)
        ])
        setShowDeleteConfirm(null)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Error deleting transaction')
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      setError('Error deleting transaction')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleFilterByDate = () => {
    loadIncomeStatement(dateRange.startDate, dateRange.endDate)
    loadTransactions(dateRange.startDate, dateRange.endDate)
  }

  const handleClearFilter = () => {
    setDateRange({ startDate: '', endDate: '' })
    loadIncomeStatement()
    loadTransactions()
  }

  const handlePrint = () => {
    window.print()
  }

  const formatDateRange = () => {
    if (dateRange.startDate && dateRange.endDate) {
      return `${dateRange.startDate} to ${dateRange.endDate}`
    } else if (dateRange.startDate) {
      return `From ${dateRange.startDate}`
    } else if (dateRange.endDate) {
      return `Until ${dateRange.endDate}`
    }
    return 'All Time'
  }

  // Show login modal if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="login-overlay">
        <div className="login-modal">
          <h1 className="login-title">Not "QuickBooks" Lite</h1>
          <p className="login-subtitle">Financial Management</p>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="login-input-group">
              <label className="login-label">Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                className="login-input"
                placeholder="your@email.com"
                required
                disabled={loginLoading}
              />
            </div>
            
            <div className="login-input-group">
              <label className="login-label">Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="login-input"
                placeholder="••••••••"
                required
                disabled={loginLoading}
              />
            </div>

            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}

            <button type="submit" className="login-button" disabled={loginLoading}>
              {loginLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="header-title">Not "QuickBooks" Lite</h1>
              <p className="header-subtitle">Financial Management System</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Welcome, {user?.email}</span>
              <button onClick={handleLogout} className="px-4 py-2 glass-hover rounded-lg text-gray-300 text-sm font-medium transition-all">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="nav-container">
        <div className="nav-buttons">
          <button 
            className={selectedTab === 'transactions' ? 'nav-button-active' : 'nav-button'}
            onClick={() => setSelectedTab('transactions')}
          >
            Transactions
          </button>
          <button 
            className={selectedTab === 'reports' ? 'nav-button-active' : 'nav-button'}
            onClick={() => setSelectedTab('reports')}
          >
            Reports
          </button>
        </div>
      </nav>

      {error && (
        <div className="content-container">
          <div className="error-banner">
            <div className="error-banner-content">
              <div className="error-banner-dot"></div>
              <span className="error-banner-text">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="error-banner-close">✕</button>
          </div>
        </div>
      )}

      {loading && (
        <div className="content-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span className="loading-text">Loading...</span>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Confirm Delete</h3>
            <p className="modal-text">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className="modal-buttons">
              <button onClick={() => setShowDeleteConfirm(null)} className="modal-button-cancel">
                Cancel
              </button>
              <button onClick={() => handleDeleteTransaction(showDeleteConfirm)} className="modal-button-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="main-content">
        {selectedTab === 'transactions' && (
          <div className="section-spacing">
            <div className="card">
              <h2 className="card-title">Add Transaction</h2>
              
              <form onSubmit={handleCreateTransaction} className="form-container">
                <div className="form-row">
                  <select
                    value={newTransaction.transaction_type}
                    onChange={(e) => setNewTransaction({...newTransaction, transaction_type: e.target.value})}
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
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    className="form-input"
                    disabled={loading}
                  />
                  
                  <input
                    type="date"
                    value={newTransaction.transaction_date}
                    onChange={(e) => setNewTransaction({...newTransaction, transaction_date: e.target.value})}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
                
                <textarea
                  placeholder="Description (e.g., '50 chocolate chip cookies for wedding', 'Flour and sugar purchase', etc.)"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="form-textarea"
                  rows={3}
                  disabled={loading}
                />
                
                <button type="submit" className="form-button" disabled={loading}>
                  Add Transaction
                </button>
              </form>
            </div>

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
                              onClick={() => setShowDeleteConfirm(transaction.id)}
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
          </div>
        )}

        {selectedTab === 'reports' && (
          <div className="section-spacing">
            <div className="card-large">
              <div className="print-only print-header">
                <h1>Not "QuickBooks" Lite</h1>
                <h2>Financial Report</h2>
              </div>
              
              <div className="print-only print-date-range">
                <strong>Period:</strong> {formatDateRange()}
              </div>
              
              <h2 className="card-title-large">Income Statement</h2>
              
              <div className="date-filter-container">
                <div className="date-filter-group">
                  <label className="date-filter-label">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                    className="date-filter-input"
                  />
                </div>
                
                <div className="date-filter-group">
                  <label className="date-filter-label">End Date</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                    className="date-filter-input"
                  />
                </div>
                
                <div className="date-filter-group">
                  <label className="date-filter-label">&nbsp;</label>
                  <div className="flex gap-2">
                    <button onClick={handleFilterByDate} className="date-filter-button">
                      Apply Filter
                    </button>
                    <button onClick={handleClearFilter} className="date-filter-clear">
                      Clear
                    </button>
                  </div>
                </div>
              </div>
              
              <button onClick={handlePrint} className="print-button">
                <span>🖨️</span>
                <span>Print Report</span>
              </button>
              
              <div className="section-spacing report-section">
                <div className="report-card">
                  <div className="report-card-content">
                    <div className="report-icon">💰</div>
                    <div>
                      <p className="report-label">Total Income</p>
                      <p className="report-value">{formatCurrency(incomeStatement.income)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="report-card-expense">
                  <div className="report-card-content">
                    <div className="report-icon-expense">💸</div>
                    <div>
                      <p className="report-label">Total Expenses</p>
                      <p className="report-value-expense">{formatCurrency(incomeStatement.expenses)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="report-card-total">
                  <div className="report-card-content">
                    <div className="report-icon-large">📈</div>
                    <div>
                      <p className="report-label-large">Net Income</p>
                      <p className={`report-value-large ${incomeStatement.net_income >= 0 ? 'amount-income' : 'amount-expense'}`}>
                        {formatCurrency(incomeStatement.net_income)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="report-section">
                <h3 className="card-title">Transaction Details</h3>
                <div className="table-container">
                  <div className="table-wrapper">
                    <table className="table">
                      <thead className="table-header">
                        <tr>
                          <th className="table-header-cell">Date</th>
                          <th className="table-header-cell">Description</th>
                          <th className="table-header-cell">Type</th>
                          <th className="table-header-cell-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="table-body">
                        {transactions.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="table-cell-empty">
                              <div className="empty-state">
                                <p className="empty-state-title">No transactions in this period</p>
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
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App