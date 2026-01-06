interface DeleteConfirmModalProps {
  showDeleteConfirm: string | null
  onCancel: () => void
  onConfirm: (id: string) => void
  loading: boolean
}

function DeleteConfirmation({ showDeleteConfirm, onCancel, onConfirm, loading }: DeleteConfirmModalProps) {
  if (!showDeleteConfirm) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Confirm Delete</h3>
        <p className="modal-text">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </p>
        <div className="modal-buttons">
          <button onClick={onCancel} className="modal-button-cancel" disabled={loading}>
            Cancel
          </button>
          <button onClick={() => onConfirm(showDeleteConfirm)} className="modal-button-delete" disabled={loading}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmation