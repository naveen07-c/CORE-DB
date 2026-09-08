import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity animate-popin"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-[2rem] bg-white text-left shadow-lift transition-all w-full ${maxWidth} my-8 border-2 border-ink/10`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-ink/5 px-6 py-4">
            <h3 className="font-display font-bold text-base text-ink">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-ink/40 hover:bg-cream hover:text-ink transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[80vh] overflow-y-auto text-ink">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
