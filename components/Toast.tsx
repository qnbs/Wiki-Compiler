import React, { useEffect, useState } from 'react';
import { ToastMessage } from '../types';
import Icon from './Icon';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

const toastConfig = {
  success: {
    icon: 'check',
    bg: 'bg-green-50 dark:bg-green-900/40',
    border: 'border-green-400 dark:border-green-600',
    iconColor: 'text-green-500',
  },
  error: {
    icon: 'x-mark',
    bg: 'bg-red-50 dark:bg-red-900/40',
    border: 'border-red-400 dark:border-red-600',
    iconColor: 'text-red-500',
  },
  info: {
    icon: 'info',
    bg: 'bg-blue-50 dark:bg-blue-900/40',
    border: 'border-blue-400 dark:border-blue-600',
    iconColor: 'text-blue-500',
  },
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const config = toastConfig[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 300); // Wait for exit animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);
  
  const handleDismiss = () => {
     setIsExiting(true);
     setTimeout(() => onDismiss(toast.id), 300);
  }

  return (
    <div
      className={`w-full max-w-sm rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border-l-4 ${config.bg} ${config.border} transition-all duration-300 ease-in-out ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon name={config.icon} className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {toast.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleDismiss}
              className="inline-flex rounded-md bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Close</span>
              <Icon name="x-mark" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;