interface NavigationProps {
  selectedTab: string
  onTabChange: (tab: string) => void
}

function Navigation({ selectedTab, onTabChange }: NavigationProps) {
  return (
    <nav className="nav-container">
      <div className="nav-buttons">
        <button 
          className={selectedTab === 'transactions' ? 'nav-button-active' : 'nav-button'}
          onClick={() => onTabChange('transactions')}
        >
          Transactions
        </button>
        <button 
          className={selectedTab === 'reports' ? 'nav-button-active' : 'nav-button'}
          onClick={() => onTabChange('reports')}
        >
          Reports
        </button>
      </div>
    </nav>
  )
}

export default Navigation