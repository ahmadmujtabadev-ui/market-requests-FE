// Logout Confirmation Modal Component
interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-y-auto px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-center pt-6 pb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>
        </div>

        {/* Modal Content */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Are you sure you want to Logout?
          </h3>
          <p className="text-sm text-gray-600 text-center mb-6">
            Once logged out an email contact will be required to log back in.
            Thanks and have a wonderful day with your team.
          </p>

          {/* Modal Actions */}
          <div className="space-y-3">
            <button
              onClick={onConfirm}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Yes
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};