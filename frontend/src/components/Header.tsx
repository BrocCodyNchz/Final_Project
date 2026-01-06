interface User {
  id: string
  email: string
  name: string
}

interface HeaderProps {
  user: User | null
  onLogout: () => void
}

function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="header-title">Not "QuickBooks" Lite</h1>
            <p className="header-subtitle">Financial Management System</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">Welcome, {user?.email}</span>
            <button onClick={onLogout} className="px-4 py-2 glass-hover rounded-lg text-gray-300 text-sm font-medium transition-all">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

