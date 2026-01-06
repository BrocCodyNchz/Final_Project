import type { Transaction } from '../types'
import DateFilter from './DateFilter'

interface IncomeStatementProps {
  incomeStatement: {
    income: number
    expenses: number
    net_income: number
  }
  transactions: Transaction[]
  dateRange: {
    startDate: string
    endDate: string
  }
  onDateRangeChange: (dateRange: { startDate: string; endDate: string }) => void
  onFilter: () => void
  onClear: () => void
  onPrint: () => void
}

function IncomeStatement({ 
  incomeStatement, 
  transactions, 
  dateRange, 
  onDateRangeChange, 
  onFilter, 
  onClear, 
  onPrint 
}: IncomeStatementProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
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

  return (
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
        
        <DateFilter
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
          onFilter={onFilter}
          onClear={onClear}
        />
        
        <button onClick={onPrint} className="print-button">
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
  )
}

export default IncomeStatement

