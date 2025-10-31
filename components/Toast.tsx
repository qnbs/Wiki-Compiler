import React, { useEffect } from 'react';
import { Toast as ToastType } from '../types';
import Icon from './Icon';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onDismiss]);

  const typeClasses = {
    success: 'bg-green-100 dark:bg-green-900/50 border-green-400 dark:border-green-700',
    error: 'bg-red-100 dark:bg-red-900/50 border-red-400 dark:border-red-700',
    info: 'bg-blue-100 dark:bg-blue-900/50 border-blue-400 dark:border-blue-700',
  };

  const iconName = {
    success: 'check',
    error: 'x-mark',
    info: 'info',
  };

  const iconColor = {
      success: 'text-green-500',
      error: 'text-red-500',
      info: 'text-blue-500',
  }

  return (
    <div
      className={`max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden animate-toast-in ${typeClasses[toast.type]}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon name={iconName[toast.type]} className={`w-6 h-6 ${iconColor[toast.type]}`} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{toast.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onDismiss(toast.id)}
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Close</span>
              <Icon name="x-mark" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
