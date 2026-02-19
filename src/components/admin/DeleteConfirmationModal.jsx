// src/components/admin/DeleteConfirmationModal.jsx
import { AlertTriangle, X } from 'lucide-react'

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  vehicleName,
  isDeleting
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Delete Vehicle
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-900">{vehicleName}</span>? 
          This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}