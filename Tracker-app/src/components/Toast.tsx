import React, { useState, useCallback, createContext, useContext } from 'react';
import type { ToastMessage, ToastType } from '../types';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};

const ICONS: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
};

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400',
  error: 'bg-rose-500/10 border border-rose-500/30 text-rose-400',
  info: 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 pointer-events-none w-[calc(100%-40px)] max-w-[400px]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 py-3 px-4 rounded-xl text-sm font-medium shadow-2xl pointer-events-auto animate-toast-in ${TOAST_STYLES[toast.type]}`}
          >
            <span>{ICONS[toast.type]}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

