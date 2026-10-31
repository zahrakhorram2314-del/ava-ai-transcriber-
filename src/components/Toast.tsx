import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  type?: 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, type = 'success' }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] sm:w-auto animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs sm:text-sm backdrop-blur-md ${
          type === 'success'
            ? 'bg-slate-900/95 border-teal-500/50 text-teal-200 shadow-teal-500/10'
            : 'bg-rose-950/95 border-rose-500/50 text-rose-200 shadow-rose-500/10'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
        )}
        <span className="flex-1 font-medium">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
