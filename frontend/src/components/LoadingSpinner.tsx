interface LoadingSpinnerProps {
  loading: boolean
}

function LoadingSpinner({ loading }: LoadingSpinnerProps) {
  if (!loading) return null

  return (
    <div className="content-container">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span className="loading-text">Loading...</span>
      </div>
    </div>
  )
}

export default LoadingSpinner

