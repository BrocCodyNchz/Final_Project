interface LoginModalProps {
  loginData: { email: string; password: string }
  onLoginDataChange: (data: { email: string; password: string }) => void
  onLogin: (e: React.FormEvent) => void
  loginError: string | null
  loginLoading: boolean
}

function LoginModal({ loginData, onLoginDataChange, onLogin, loginError, loginLoading }: LoginModalProps) {
  return (
    <div className="login-overlay">
      <div className="login-modal">
        <h1 className="login-title">Not "QuickBooks" Lite</h1>
        <p className="login-subtitle">Financial Management</p>
        
        <form onSubmit={onLogin} className="login-form">
          <div className="login-input-group">
            <label className="login-label">Email</label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) => onLoginDataChange({...loginData, email: e.target.value})}
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
              onChange={(e) => onLoginDataChange({...loginData, password: e.target.value})}
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

export default LoginModal

