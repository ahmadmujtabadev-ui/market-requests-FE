import React from 'react';

type LoadingOverlayProps = {
  isVisible: boolean;
};

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-white/70">
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"
      />
    </div>
  );
};
