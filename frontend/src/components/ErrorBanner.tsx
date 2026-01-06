interface ErrorBannerProps {
  error: string | null
  onDismiss: () => void
}

function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  if (!error) return null

  return (
    <div className="content-container">
      <div className="error-banner">
        <div className="error-banner-content">
          <div className="error-banner-dot"></div>
          <span className="error-banner-text">{error}</span>
        </div>
        <button onClick={onDismiss} className="error-banner-close">✕</button>
      </div>
    </div>
  )
}

export default ErrorBanner

