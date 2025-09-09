import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from '../types';
import Icon from './Icon';
import { useImporter } from '../hooks/useImporterContext';

interface BottomNavBarProps {
  view: View;
  setView: (view: View) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ view, setView }) => {
  const { t } = useTranslation();
  const { stagedArticles } = useImporter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around p-1 sm:hidden z-30">
      <NavButton icon="book" label={t('Library')} isActive={view === View.Library} onClick={() => setView(View.Library)} />
      <NavButton icon="archive-box" label={t('Archive')} isActive={view === View.Archive} onClick={() => setView(View.Archive)} />
      <NavButton icon="compiler" label={t('Compiler')} isActive={view === View.Compiler} onClick={() => setView(View.Compiler)} />
      <NavButton 
        icon="upload" 
        label={t('Importer')} 
        isActive={view === View.Importer} 
        onClick={() => setView(View.Importer)}
        badge={stagedArticles.length > 0 ? stagedArticles.length : undefined}
        />
      <NavButton icon="palette" label={t('Image Importer')} isActive={view === View.ImageImporter} onClick={() => setView(View.ImageImporter)} />
    </nav>
  );
};

interface NavButtonProps {
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
    badge?: number;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick, badge }) => (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-16 rounded-lg transition-colors ${
        isActive
          ? 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
      }`}
    >
      <Icon name={icon} className="w-6 h-6" />
      <span className="text-xs font-medium">{label}</span>
       {badge && (
        <span className="absolute top-1 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white ring-2 ring-white dark:ring-gray-900">
          {badge}
        </span>
      )}
    </button>
);

export default BottomNavBar;