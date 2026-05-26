import { createContext, useContext, useState, type ReactNode } from 'react';
import { Toast } from '../components/ui';

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>(null!);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');

  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && <Toast message={message} type="info" />}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
