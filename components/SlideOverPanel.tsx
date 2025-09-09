import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../hooks/useFocusTrap';
import Icon from './Icon';

interface SlideOverPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const SlideOverPanel: React.FC<SlideOverPanelProps> = ({ isOpen, onClose, title, children }) => {
  const panelRef = useFocusTrap<HTMLDivElement>(isOpen);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  const handleTransitionEnd = () => {
      if (!isOpen) {
          setIsRendered(false);
      }
  };

  if (!isRendered) return null;

  const panelClasses = isOpen
    ? 'translate-x-0'
    : 'translate-x-full';
  
  const overlayClasses = isOpen
    ? 'opacity-100'
    : 'opacity-0';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="slide-over-title"
      className="fixed inset-0 overflow-hidden z-40"
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Background overlay */}
        <div
          onClick={onClose}
          className={`slide-over-overlay absolute inset-0 bg-gray-900 bg-opacity-75 ${overlayClasses}`}
          aria-hidden="true"
        />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
          <div
            ref={panelRef}
            onTransitionEnd={handleTransitionEnd}
            className={`slide-over-panel w-screen max-w-4xl ${panelClasses}`}
          >
            <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-gray-800 shadow-xl">
              <header className="flex items-center justify-between p-4 sm:p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                <h2 id="slide-over-title" className="text-xl font-semibold text-gray-900 dark:text-white truncate pr-4">
                  {title}
                </h2>
                <button
                  type="button"
                  className="rounded-md p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Close panel</span>
                  <Icon name="x-mark" className="h-6 w-6" />
                </button>
              </header>
              <div className="relative flex-1">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SlideOverPanel;