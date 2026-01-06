import { useState, useEffect, useCallback } from 'react'
import LoginModal from './components/LoginModal.tsx'
import Header from './components/Header.tsx'
import Navigation from './components/Navigation.tsx'
import ErrorBanner from './components/ErrorBanner.tsx'
import LoadingSpinner from './components/LoadingSpinner.tsx'
import DeleteConfirmation from './components/DeleteConfirmation.tsx'
import TransactionForm from './components/TransactionForm.tsx'
import TransactionTable from './components/TransactionTable.tsx'
import IncomeStatement from './components/IncomeStatement.tsx'
import type { Transaction, User } from './types'

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

  const handleDeleteClick = (id: string) => {
    setShowDeleteConfirm(id)
  }

  // Show login modal if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginModal 
        loginData={loginData}
        onLoginDataChange={setLoginData}
        onLogin={handleLogin}
        loginError={loginError}
        loginLoading={loginLoading}
      />
    )
  }

  return (
    <div className="app-container">
      <Header user={user} onLogout={handleLogout} />

      <Navigation selectedTab={selectedTab} onTabChange={setSelectedTab} />

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      <LoadingSpinner loading={loading} />

      <DeleteConfirmation
        showDeleteConfirm={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(null)}
        onConfirm={handleDeleteTransaction}
        loading={loading}
      />

      <main className="main-content">
        {selectedTab === 'transactions' && (
          <div className="section-spacing">
            <TransactionForm
              newTransaction={newTransaction}
              onTransactionChange={setNewTransaction}
              onSubmit={handleCreateTransaction}
              loading={loading}
            />

            <TransactionTable
              transactions={transactions}
              onDelete={handleDeleteClick}
              loading={loading}
            />
          </div>
        )}

        {selectedTab === 'reports' && (
          <IncomeStatement
            incomeStatement={incomeStatement}
            transactions={transactions}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onFilter={handleFilterByDate}
            onClear={handleClearFilter}
            onPrint={handlePrint}
          />
        )}
      </main>
    </div>
  )
}

export default App