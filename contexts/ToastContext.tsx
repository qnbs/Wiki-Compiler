import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { ToastMessage, ToastType } from '../types';

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: number) => void;
}

// FIX: Initializing with an undefined value and checking for it in the consumer hook is safer
// and provides better type inference than an empty object.
export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Using a callback with setToasts ensures we have the latest state and avoids dependency on `toasts` array.
  const addToast = useCallback((message: string, type: ToastType) => {
    const newToast: ToastMessage = {
      // Using a combination of timestamp and random number for a more robust unique ID.
      id: Date.now() + Math.random(),
      message,
      type,
    };
    setToasts(currentToasts => [...currentToasts, newToast]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }, []);

  const value = { toasts, addToast, removeToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};
