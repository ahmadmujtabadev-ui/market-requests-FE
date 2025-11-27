import React from 'react';

type LoadingOverlayProps = {
  isVisible: boolean;
};

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-white/100">
      <div className="flex flex-col items-center gap-3">
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
          className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-[#16a34a]"
        />
        <p className="text-xs text-[#777777] text-center max-w-xs">
          Loading your workspace... brought to you by Saad&apos;s Production
        </p>
      </div>
    </div>
  );
};
