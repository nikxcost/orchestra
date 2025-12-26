import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 2 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-white flex-shrink-0" />;
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-success-600 border-success-700 text-white';
      case 'error':
        return 'bg-error-600 border-error-700 text-white';
      case 'info':
        return 'bg-primary-600 border-primary-700 text-white';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container - positioned for mobile-first */}
      <div
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-6 sm:w-auto sm:max-w-sm z-50 flex flex-col gap-2 pointer-events-none"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto
              flex items-center gap-3
              px-4 py-3
              rounded-xl
              border
              shadow-lg
              animate-slideUp
              ${getStyles(toast.type)}
            `}
            role="alert"
          >
            {getIcon(toast.type)}
            <span className="text-sm font-medium flex-1 leading-snug">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0 touch-manipulation"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
