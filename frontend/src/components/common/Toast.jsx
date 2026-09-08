import React from 'react';
import { useToastStore } from '../../store/useToastStore';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-mint-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertCircle className="w-5 h-5 text-lemon-500" />,
    info: <Info className="w-5 h-5 text-sky-500" />,
  };

  const colors = {
    success: 'bg-white border-mint-300 text-ink',
    error: 'bg-white border-red-200 text-ink',
    warning: 'bg-white border-lemon-400 text-ink',
    info: 'bg-white border-sky-300 text-ink',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-2xl border-2 shadow-lift animate-popin ${colors[toast.type] || colors.info}`}
      style={{ minWidth: '300px', maxWidth: '420px' }}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type] || icons.info}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 text-ink/30 hover:text-ink rounded-lg hover:bg-cream transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
