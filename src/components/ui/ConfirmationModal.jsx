"use client";

const ConfirmationModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  actionText = 'Delete',
  type = 'danger' // 'danger', 'warning', 'info'
}) => {
  if (!isOpen) return null;

  // Define color schemes for different types
  const typeStyles = {
    danger: {
      actionButton: 'bg-red-600 hover:bg-red-700',
      border: 'border-red-500/30',
    },
    warning: {
      actionButton: 'bg-yellow-600 hover:bg-yellow-700',
      border: 'border-yellow-500/30',
    },
    info: {
      actionButton: 'bg-blue-600 hover:bg-blue-700',
      border: 'border-blue-500/30',
    }
  };

  const currentStyle = typeStyles[type] || typeStyles.danger;

  return (
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50`}>
      <div className={`bg-[#1a1a1a] border border-white/20 ${currentStyle.border} rounded-lg p-6 max-w-md w-full mx-4`}>
        <h3 className="text-xl font-semibold text-white/95 mb-4">{title}</h3>
        <p className="text-white/80 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 ${currentStyle.actionButton} text-white font-medium rounded transition-colors duration-200`}
          >
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;