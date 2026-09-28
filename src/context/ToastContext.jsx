import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const error = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast]);
  const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);
  const warning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const config = {
            success: {
              bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
            },
            error: {
              bg: 'bg-rose-50 border-rose-200 text-rose-900',
              icon: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
            },
            warning: {
              bg: 'bg-amber-50 border-amber-200 text-amber-900',
              icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
            },
            info: {
              bg: 'bg-blue-50 border-blue-200 text-blue-900',
              icon: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
            },
          }[toast.type] || {
            bg: 'bg-slate-50 border-slate-200 text-slate-900',
            icon: <Info className="w-5 h-5 text-slate-600 flex-shrink-0" />,
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 ${config.bg}`}
            >
              {config.icon}
              <div className="flex-1 text-sm font-medium leading-5 pt-0.5">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 transition p-0.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
