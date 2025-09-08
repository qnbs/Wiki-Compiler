import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from '../types';
import Icon from './Icon';

interface BottomNavBarProps {
  view: View;
  setView: (view: View) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ view, setView }) => {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around p-1 sm:hidden z-30">
      <NavButton icon="book" label={t('Library')} isActive={view === View.Library} onClick={() => setView(View.Library)} />
      <NavButton icon="archive-box" label={t('Archive')} isActive={view === View.Archive} onClick={() => setView(View.Archive)} />
      <NavButton icon="compiler" label={t('Compiler')} isActive={view === View.Compiler} onClick={() => setView(View.Compiler)} />
    </nav>
  );
};

interface NavButtonProps {
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 flex-1 h-16 rounded-lg transition-colors ${
        isActive
          ? 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
      }`}
    >
      <Icon name={icon} className="w-6 h-6" />
      <span className="text-xs font-medium">{label}</span>
    </button>
);

export default BottomNavBar;